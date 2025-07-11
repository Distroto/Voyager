const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema(
  {
    ship: { type: mongoose.Schema.Types.ObjectId, ref: 'Ship', required: true },
    lastServiceDate: { type: Date, required: true },
    predictedNextServiceDate: { type: Date },
    issueDetected: { type: String },
    recommendation: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
