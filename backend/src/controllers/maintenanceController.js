const Ship = require('../models/shipModel');
const Voyage = require('../models/voyageModel');
const { mlQueue, mlQueueEvents } = require('../queues/queue');
const { Job } = require('bullmq'); 

exports.getMaintenanceAlerts = async (req, res) => {
  const ship = await Ship.findOne();
  if (!ship) {
    return res.status(404).json({ error: "No ships found in the database to analyze." });
  }

  let job;
  try {
    const voyagesSinceLastService = await Voyage.countDocuments({ ship: ship._id });
    const simulatedRunningHours = voyagesSinceLastService * 150;
    const simulatedLoadPercent = 0.85;

    job = await mlQueue.add('predict-maintenance', {
      type: 'predict-maintenance',
      payload: {
        total_running_hours: simulatedRunningHours,
        voyages_since_service: voyagesSinceLastService,
        avg_load_percent: simulatedLoadPercent,
      }
    });

    console.log(`[API] Waiting for maintenance prediction job ${job.id} to complete...`);
    await job.waitUntilFinished(mlQueueEvents); 
    const finalState = await job.getState();
    if (finalState === 'completed') {
      const completedJob = await Job.fromId(mlQueue, job.id);
      const result = completedJob.returnvalue;

      console.log(`[API] Maintenance job ${job.id} completed.`);
      res.status(200).json({
        shipId: ship._id,
        shipName: ship.name,
        ...result
      });
    } else {
      const failedJob = await Job.fromId(mlQueue, job.id);
      throw new Error(`Maintenance job failed: ${failedJob.failedReason}`);
    }

  } catch (err) {
    console.error('[API] Error during maintenance prediction:', err.message);
    res.status(500).json({ error: 'Failed to generate maintenance alert.', details: err.message });
  }
};