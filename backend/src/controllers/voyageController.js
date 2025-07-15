const Voyage = require('../models/voyageModel');
const FuelLog = require('../models/fuelLogsModel');
const { mlQueue, mlQueueEvents } = require('../queues/queue');

// POST /plan-voyage (SYNCHRONOUS IMPLEMENTATION)
exports.planVoyage = async (req, res) => {
  const { ship, origin, destination, departureTime, weatherForecast, cargoWeight } = req.body;

  if (!ship || !origin || !destination || !departureTime) {
    return res.status(400).json({ error: 'Missing required fields for voyage planning.' });
  }

  let voyage;
  try {
    // 1. Create the voyage record with a 'PLANNING' status
    voyage = await Voyage.create({
      ship, origin, destination, departureTime, weatherForecast, cargoWeight, status: 'PLANNING',
    });

    // 2. Add a job to the queue
    const job = await mlQueue.add('plan-voyage', {
      type: 'plan-voyage',
      voyageId: voyage._id.toString(),
    }, { timeout: 60000 });

    // 3. Wait for the job to complete or fail
    console.log(`[API] Waiting for job ${job.id} to complete...`);
    await job.waitUntilFinished(mlQueueEvents, 60000); 

    // 4. Check the final state of the job
    const finalState = await job.getState();
    if (finalState === 'completed') {
      const completedVoyage = await Voyage.findById(voyage.id);
      console.log(`[API] Job ${job.id} completed. Returning full voyage plan.`);
      res.status(201).json(completedVoyage);
    } else {
      throw new Error(`Voyage planning job failed with state: ${finalState}`);
    }
  } catch (err) {
    console.error('[API] Error during synchronous voyage planning:', err.message);
    // If the voyage was created but the job failed, update its status
    if (voyage) {
      await Voyage.findByIdAndUpdate(voyage.id, { status: 'FAILED' });
    }
    res.status(500).json({ error: 'Failed to generate voyage plan.', details: err.message });
  }
};

// GET /plan-history
exports.getPlanHistory = async (req, res) => {
  try {
    const voyages = await Voyage.find().populate('ship', 'name engineType');
    res.json(voyages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /feedback
exports.submitFeedback = async (req, res) => {
  // Use voyageId in the request body, not as a URL parameter, for consistency
  const { voyageId, actualETA, actualFuel, deviations } = req.body;
  if (!voyageId) return res.status(400).json({ error: 'voyageId is required.' });

  try {
    const voyage = await Voyage.findByIdAndUpdate(
      voyageId, { actualETA, actualFuel, deviations }, { new: true }
    );
    if (!voyage) return res.status(404).json({ error: 'Voyage not found' });
    
    if (actualFuel) {
      await FuelLog.create({ ship: voyage.ship, voyage: voyage._id, fuelUsed: actualFuel });
    }
    // Mention the continuous learning loop
    console.log(`[API] Feedback received for voyage ${voyage._id}. Data is now available for model retraining.`);
    res.status(200).json({ message: "Feedback submitted successfully.", voyage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};