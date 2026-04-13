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
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: Date,
  seenStoryEvents: [{ type: String }],
  hasVisitedSincityMap: { type: Boolean, default: false },
  badges: [{ name: String, description: String, icon: String, earnedAt: Date }],
  stats: {
    longestRun: { type: Number, default: 0 },
    bestPace: { type: Number, default: 0 },
    regionsCapture: { type: Number, default: 0 },
    totalCalories: { type: Number, default: 0 }
  },
  friends: [{ type: String }],
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);
