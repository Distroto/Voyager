const Ship = require('../models/shipModel');
const Voyage = require('../models/voyageModel');
const { mlQueue } = require('../queues/queue'); 

exports.getMaintenanceAlerts = async (req, res) => {
  const ship = await Ship.findOne();
  if (!ship) {
    return res.status(404).json({ error: "No ships found in the database to analyze." });
  }

  try {
    // 1. Gather features (same as before)
    const voyagesSinceLastService = await Voyage.countDocuments({ ship: ship._id });
    const simulatedRunningHours = voyagesSinceLastService * 150;
    const simulatedLoadPercent = 0.85;

    // 2. Add a job to the queue and respond immediately
    const job = await mlQueue.add('predict-maintenance', {
      type: 'predict-maintenance',
      shipId: ship._id.toString(),
      payload: {
        total_running_hours: simulatedRunningHours,
        voyages_since_service: voyagesSinceLastService,
        avg_load_percent: simulatedLoadPercent,
      }
    });
    res.status(202).json({ 
        message: "Maintenance analysis has been initiated.",
        jobId: job.id,
        shipId: ship._id
    });

  } catch (err) {
    console.error('[API] Error during maintenance prediction request:', err.message);
    res.status(500).json({ error: 'Failed to initiate maintenance analysis.', details: err.message });
  }
};