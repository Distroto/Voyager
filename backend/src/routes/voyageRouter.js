const express = require('express');
const router = express.Router();
const { planVoyage, getPlanHistory, submitFeedback } = require('../controllers/voyageController');

router.post('/plan-voyage', planVoyage);
router.get('/plan-history', getPlanHistory);
router.post('/feedback', submitFeedback);

module.exports = router;