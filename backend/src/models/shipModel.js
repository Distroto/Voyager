const mongoose = require('mongoose');

const ShipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    engineType: { type: String, required: true },
    capacity: { type: Number, required: true }, // in tons
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ship', ShipSchema);
