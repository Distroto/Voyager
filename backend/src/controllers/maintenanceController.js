const Maintenance = require('../models/maintenanceModel');
const Voyage = require('../models/voyageModel');

// GET /maintenance-alerts
exports.getMaintenanceAlerts = async (req, res) => {
  try {
    // Dummy Condition: find ships with >3 voyages since last service
    const maints = await Maintenance.find();
    const alerts = [];
    for (const m of maints) {
      const voyageCount = await Voyage.countDocuments({ ship: m.ship, departureTime: { $gt: m.lastServiceDate } });
      if (voyageCount > 3) {
        alerts.push({
          ship: m.ship,
          lastServiceDate: m.lastServiceDate,
          recommended: true,
          message: 'Proactive maintenance recommended',
        });
      }
    }
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 