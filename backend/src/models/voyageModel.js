const mongoose = require('mongoose');

const VoyageSchema = new mongoose.Schema(
  {
    ship: { type: mongoose.Schema.Types.ObjectId, ref: 'Ship', required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: Date, required: true },
    cargoWeight: { type: Number, required: true },
    weatherForecast: { type: Object }, // Can be structured or raw JSON
    predictedETA: { type: Date },
    predictedFuel: { type: Number },
    actualETA: { type: Date },
    actualFuel: { type: Number },
    deviations: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Voyage', VoyageSchema);
