const mongoose = require('mongoose');

const RunSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  duration: Number,      // seconds
  distance: Number,      // meters
  calories: Number,
  pace: Number,          // min/km
  steps: Number,
  route: [{              // GPS coordinates array
    lat: Number,
    lng: Number,
    timestamp: Number
  }],
  regionsVisited: [String]
}, { timestamps: true });

module.exports = mongoose.model('Run', RunSchema);