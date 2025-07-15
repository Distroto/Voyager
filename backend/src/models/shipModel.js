const mongoose = require('mongoose');

const ShipSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  imoNumber: { type: String, required: true, unique: true },
  engineType: { type: String, required: true },
  capacity: { type: Number, required: true }, // Max cargo capacity in tons
  fuelConsumptionRate: { type: Number, required: true, default: 25 },
}, { timestamps: true });

module.exports = mongoose.model('Ship', ShipSchema);