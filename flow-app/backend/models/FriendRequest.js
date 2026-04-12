const mongoose = require('mongoose');
const FriendRequestSchema = new mongoose.Schema({
  fromUid: String,
  toUid: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });
module.exports = mongoose.model('FriendRequest', FriendRequestSchema);
