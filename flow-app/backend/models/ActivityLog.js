const mongoose = require('mongoose');
const ActivityLogSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  date: { type: String, required: true }, // "YYYY-M-D" format
}, { timestamps: true });
ActivityLogSchema.index({ uid: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
