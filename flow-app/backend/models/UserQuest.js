const mongoose = require('mongoose');
const UserQuestSchema = new mongoose.Schema({
  userId: String,
  questId: Number,
  completedAt: Date,
}, { timestamps: true });
module.exports = mongoose.model('UserQuest', UserQuestSchema);
