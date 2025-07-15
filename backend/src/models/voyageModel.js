const mongoose = require('mongoose');

const VoyageSchema = new mongoose.Schema({
  ship: { type: mongoose.Schema.Types.ObjectId, ref: 'Ship', required: true },
  origin: { type: String, required: true },
  destination: { type: String, required:true },
  departureTime: { type: Date, required: true },
  cargoWeight: { type: Number, required: true },
  weatherForecast: { type: Object },
  
  status: { type: String, enum: ['PLANNING', 'COMPLETED', 'FAILED'], default: 'PLANNING' },

  // --- PREDICTED (from AI) ---
  predictedETA: { type: Date },
  predictedFuel: { type: Number },
  planDetails: {
    distance_km: Number,
    avg_speed_knots: Number,
    speedSchedule: String,
    routeSummary: String,
  },

  // --- ACTUALS (from feedback) ---
  actualETA: { type: Date },
  actualFuel: { type: Number },
  deviations: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Voyage', VoyageSchema);