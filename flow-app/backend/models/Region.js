const mongoose = require('mongoose');

const RegionSchema = new mongoose.Schema({
  name: String,
  center: { lat: Number, lng: Number },
  radius: Number,        // meters
  capturedBy: String,    // userId
  capturedByTeam: [String],
  requirements: String,
  glowColor: { type: String, default: '#00ffcc' },
  capturedAt: Date
});

module.exports = mongoose.model('Region', RegionSchema);