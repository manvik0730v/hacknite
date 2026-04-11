const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  username: { type: String, required: true, unique: true },
  email: String,
  profilePhoto: String,
  height: Number,
  weight: Number,
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  totalCalories: { type: Number, default: 0 },
  badges: [{ name: String, description: String, icon: String, earnedAt: Date }],
  stats: {
    longestRun: { type: Number, default: 0 },
    bestPace: { type: Number, default: 0 },
    regionsCapture: { type: Number, default: 0 },
    totalCalories: { type: Number, default: 0 }
  },
  friends: [{ type: String }], // array of uids
  sinModeEnabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);