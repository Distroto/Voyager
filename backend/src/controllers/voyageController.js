const Voyage = require('../models/voyageModel');
const FuelLog = require('../models/fuelLogsModel');

// POST /plan-voyage
exports.planVoyage = async (req, res) => {
  const { ship, origin, destination, departureTime, weatherForecast, cargoWeight } = req.body;
  // Dummy logic for ETA, speed, fuel (replace with real optimization)
  const predictedETA = new Date(new Date(departureTime).getTime() + 1000 * 60 * 60 * 24); // +1 day
  const predictedFuel = cargoWeight * 0.2 + 100; // fake formula
  try {
    const voyage = await Voyage.create({
      ship,
      origin,
      destination,
      departureTime,
      weatherForecast,
      cargoWeight,
      predictedETA,
      predictedFuel,
    });
    res.json({
      voyageId: voyage._id,
      predictedETA,
      speedSchedule: 'Standard',
      predictedFuel,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /plan-history
exports.getPlanHistory = async (req, res) => {
  try {
    const voyages = await Voyage.find().populate('ship');
    res.json(voyages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /feedback
exports.submitFeedback = async (req, res) => {
  const { voyageId, actualETA, actualFuel, deviations } = req.body;
  try {
    const voyage = await Voyage.findByIdAndUpdate(
      voyageId,
      { actualETA, actualFuel, deviations },
      { new: true }
    );
    if (!voyage) return res.status(404).json({ error: 'Voyage not found' });
    // Optionally log fuel
    if (actualFuel) {
      await FuelLog.create({ ship: voyage.ship, voyage: voyage._id, fuelUsed: actualFuel });
    }
    res.json({ success: true, voyage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 