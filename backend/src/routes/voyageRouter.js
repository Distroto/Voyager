const express = require('express');
const router = express.Router();
const voyageController = require('../controllers/voyageController');

router.post('/plan-voyage', voyageController.planVoyage);
router.get('/plan-history', voyageController.getPlanHistory);
router.post('/feedback', voyageController.submitFeedback);

module.exports = router; 