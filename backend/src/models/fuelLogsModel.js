const mongoose = require('mongoose');

const FuelLogSchema = new mongoose.Schema(
  {
    ship: { type: mongoose.Schema.Types.ObjectId, ref: 'Ship', required: true },
    voyage: { type: mongoose.Schema.Types.ObjectId, ref: 'Voyage', required: true },
    timestamp: { type: Date, default: Date.now },
    fuelUsed: { type: Number, required: true }, // e.g., in liters
    type: { type: String, enum: ['predicted', 'actual'], default: 'actual' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FuelLog', FuelLogSchema);
