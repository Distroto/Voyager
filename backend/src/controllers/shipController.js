const Ship = require('../models/shipModel');

// @desc    Register a new ship
// @route   POST /ships
exports.registerShip = async (req, res) => {
  try {
    const { name, imoNumber, engineType, capacity, fuelConsumptionRate } = req.body;
    const ship = await Ship.create({ name, imoNumber, engineType, capacity, fuelConsumptionRate });
    res.status(201).json(ship);
  } catch (error) {
    res.status(400).json({ error: 'Failed to register ship. Check for duplicate name or IMO number.', details: error.message });
  }
};

// @desc    Get all ships
// @route   GET /ships
exports.getAllShips = async (req, res) => {
  try {
    const ships = await Ship.find({});
    res.status(200).json(ships);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ships.' });
  }
};