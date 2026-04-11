const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, enum: ['daily', 'level'] },
  requiredLevel: { type: Number, default: 1 },
  goal: Number,          // e.g. 5000 steps
  goalType: String,      // 'steps', 'distance', 'calories'
  xpReward: Number,
  badgeReward: String,
  expiresAt: Date
});

module.exports = mongoose.model('Quest', QuestSchema);