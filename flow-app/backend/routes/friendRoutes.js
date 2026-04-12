const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// Get my friends list
router.get('/', protect, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  const friends = await User.find({ uid: { $in: user.friends || [] } })
    .select('uid username profilePhoto level streak stats');
  res.json(friends);
});

// Get all users (for search)
router.get('/users', protect, async (req, res) => {
  const { search } = req.query;
  const query = { uid: { $ne: req.user.uid } };
  if (search) query.username = { $regex: search, $options: 'i' };
  const users = await User.find(query).select('uid username profilePhoto level').limit(20);
  res.json(users);
});

// Get user profile (for viewing)
router.get('/profile/:uid', protect, async (req, res) => {
  const user = await User.findOne({ uid: req.params.uid })
    .select('uid username profilePhoto level streak stats');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Send friend request
router.post('/request', protect, async (req, res) => {
  const { toUid } = req.body;
  const existing = await FriendRequest.findOne({
    fromUid: req.user.uid, toUid, status: 'pending'
  });
  if (existing) return res.status(400).json({ error: 'Request already sent' });
  const req2 = await FriendRequest.create({ fromUid: req.user.uid, toUid });
  res.json(req2);
});

// Get my incoming requests
router.get('/requests', protect, async (req, res) => {
  const requests = await FriendRequest.find({ toUid: req.user.uid, status: 'pending' });
  const withUsers = await Promise.all(requests.map(async r => {
    const from = await User.findOne({ uid: r.fromUid }).select('uid username profilePhoto');
    return { ...r.toObject(), from };
  }));
  res.json(withUsers);
});

// Accept/reject request
router.post('/respond', protect, async (req, res) => {
  const { requestId, action } = req.body;
  const request = await FriendRequest.findById(requestId);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  request.status = action;
  await request.save();

  if (action === 'accepted') {
    await User.findOneAndUpdate({ uid: request.toUid }, { $addToSet: { friends: request.fromUid } });
    await User.findOneAndUpdate({ uid: request.fromUid }, { $addToSet: { friends: request.toUid } });
  }
  res.json({ success: true });
});

module.exports = router;
