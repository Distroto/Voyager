const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const axios = require('axios');
const mongoose = require('mongoose');
const Voyage = require('../models/voyageModel');
const Ship = require('../models/shipModel'); 
const connectDB = require('../config/db');


const redisOptions = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
};

const connection = new IORedis(redisOptions);


connectDB();


// --- Main Worker Logic ---
const worker = new Worker('mlQueue', async (job) => {
  const { type, voyageId, payload } = job.data;
  console.log(`[WORKER] Received job ${job.id} of type: ${type}`);

  // --- Job Type: Plan a Voyage ---
  if (type === 'plan-voyage') {
    // Populate the ship details when fetching the voyage
    const voyage = await Voyage.findById(voyageId).populate('ship');
    if (!voyage) {
      throw new Error(`Voyage ${voyageId} not found in database.`);
    }
    if (!voyage.ship) {
      throw new Error(`Ship details not found for voyage ${voyageId}. The referenced ship may have been deleted.`);
    }

    // --- CONTEXT GATHERING (The "Intelligence" Upgrade) ---
    // Fetch the last 3 completed voyages for this specific ship to provide historical context to the LLM.
    console.log(`[WORKER] Gathering historical context for ship: ${voyage.ship.name}`);
    const historicalVoyages = await Voyage.find({
      ship: voyage.ship._id,
      status: 'COMPLETED',
      actualFuel: { $exists: true } // Only include voyages where we have feedback
    }).sort({ departureTime: -1 }).limit(3);
    console.log(`[WORKER] Found ${historicalVoyages.length} relevant historical voyages.`);

    try {
      // --- Step 1: Get Route Optimization from LLM with RICH CONTEXT ---
      console.log('[WORKER] Calling Route Optimizer (ml-service/predict/route)...');
      const routeResponse = await axios.post('http://ml:5000/predict/route', {
        voyageDetails: voyage.toObject(),      
        shipDetails: voyage.ship.toObject(),     
        historicalData: historicalVoyages.map(v => v.toObject()), 
      });
      
      const routePlan = routeResponse.data;
      if (!routePlan || !routePlan.distance_km) {
        console.error('[WORKER] ❌ Route plan from ML service is missing or invalid:', routePlan);
        throw new Error('Invalid or incomplete response from route optimizer service.');
      }
      console.log('[WORKER] Route plan received successfully.');

      // --- Step 2: Use Route Plan to Predict Fuel ---
      console.log('[WORKER] Calling Fuel Predictor (ml-service/predict/fuel)...');
      const fuelResponse = await axios.post('http://ml:5000/predict/fuel', {
        cargoWeight: voyage.cargoWeight,
        distance_km: routePlan.distance_km,
        avg_speed_knots: routePlan.avg_speed_knots,
        ship_capacity: voyage.ship.capacity,
        ship_fuel_rate: voyage.ship.fuelConsumptionRate,
      });

      const fuelPlan = fuelResponse.data;
      if (!fuelPlan || typeof fuelPlan.predictedFuel === 'undefined') {
        throw new Error('Invalid response from fuel predictor service.');
      }
      console.log('[WORKER] Fuel prediction received.');

      // --- Step 3: Update Voyage Document in MongoDB ---
      console.log(`[WORKER] Updating voyage ${voyageId} in MongoDB with AI plan...`);
      voyage.predictedETA = routePlan.predictedETA;
      voyage.predictedFuel = fuelPlan.predictedFuel;
      voyage.planDetails = {
        speedSchedule: routePlan.speedSchedule,
        routeSummary: routePlan.routeSummary,
        distance_km: routePlan.distance_km,
        avg_speed_knots: routePlan.avg_speed_knots,
      };
      voyage.status = 'COMPLETED';
      await voyage.save();

      console.log(`[WORKER] ✅ Successfully processed voyage plan for ${voyageId}`);
      return { success: true, voyageId };
      
    } catch (error) {
      const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
      console.error(`[WORKER] ❌ FAILED to process voyage ${voyageId}:`, errorMessage);
      await Voyage.findByIdAndUpdate(voyageId, { status: 'FAILED', planDetails: { error: errorMessage } });
      throw new Error(errorMessage);
    }
  } 
  
  // --- Job Type: Predict Maintenance ---
  else if (type === 'predict-maintenance') {
    try {
      console.log('[WORKER] Calling Maintenance Forecaster (ml-service/predict/maintenance)...');
      const response = await axios.post('http://ml:5000/predict/maintenance', payload);
      console.log('[WORKER] ✅ Maintenance prediction received:', response.data);
      return response.data; // Return the prediction directly to the API controller
    } catch (error) {
      const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
      console.error(`[WORKER] ❌ FAILED to process maintenance prediction:`, errorMessage);
      throw new Error(errorMessage);
    }
  } 
  
  // --- Unsupported Job Type ---
  else {
    const errorMessage = `Unsupported job type: ${type}`;
    console.error(`[WORKER] ${errorMessage}`);
    throw new Error(errorMessage);
  }
}, { connection });


// --- Worker Event Listeners ---
worker.on('completed', (job, result) => {
  console.log(`[WORKER] Job ${job.id} of type '${job.data.type}' completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`[WORKER] Job ${job.id} of type '${job.data.type}' failed with error: ${err.message}`);
});

console.log("✅ ML Worker started and listening for jobs on 'mlQueue'...");