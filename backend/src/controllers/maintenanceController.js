const Ship = require('../models/shipModel');
const Voyage = require('../models/voyageModel');
const { mlQueue, mlQueueEvents } = require('../queues/queue');

// GET /maintenance-alerts
exports.getMaintenanceAlerts = async (req, res) => {
  const ship = await Ship.findOne();
  if (!ship) {
    return res.status(404).json({ error: "No ships found in the database to analyze." });
  }

  try {
    // 1. Gather features for the maintenance model
    // We'll simulate running hours and get the number of voyages from the DB
    const voyagesSinceLastService = await Voyage.countDocuments({ ship: ship._id }); // Simplified for demo
    const simulatedRunningHours = voyagesSinceLastService * 150; // 150 hours per voyage
    const simulatedLoadPercent = 0.85; // Assume heavy use

    // 2. Add a job to the queue
    const job = await mlQueue.add('predict-maintenance', {
      type: 'predict-maintenance',
      payload: {
        total_running_hours: simulatedRunningHours,
        voyages_since_service: voyagesSinceLastService,
        avg_load_percent: simulatedLoadPercent,
      }
    });

    // 3. Wait for the job to complete
    console.log(`[API] Waiting for maintenance prediction job ${job.id} to complete...`);
    const result = await job.waitUntilFinished(mlQueueEvents);
    
    // 4. Return the AI-generated alert
    console.log(`[API] Maintenance job ${job.id} completed.`);
    res.status(200).json({
      shipId: ship._id,
      shipName: ship.name,
      ...result // The result will contain { maintenanceRequired, riskProbability }
    });

  } catch (err) {
    console.error('[API] Error during maintenance prediction:', err.message);
    res.status(500).json({ error: 'Failed to generate maintenance alert.', details: err.message });
  }
};