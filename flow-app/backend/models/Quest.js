const mongoose = require('mongoose');
const QuestSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  emoji: String,
  goalType: { type: String, enum: ['time', 'distance'] },
  goalValue: Number,
  xp: Number,
});
module.exports = mongoose.model('Quest', QuestSchema);
