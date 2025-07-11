const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

router.get('/maintenance-alerts', maintenanceController.getMaintenanceAlerts);

module.exports = router; 