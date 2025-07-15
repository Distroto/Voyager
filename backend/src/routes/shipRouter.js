const express = require('express');
const router = express.Router();
const { registerShip, getAllShips } = require('../controllers/shipController');

router.route('/ships').post(registerShip).get(getAllShips);

module.exports = router;