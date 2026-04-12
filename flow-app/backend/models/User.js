const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: String,
  profilePhoto: String,
  gender: String,
  height: Number,
  weight: Number,
  onboardingDone: { type: Boolean, default: false },
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
  friends: [{ type: String }],
  sinModeEnabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
