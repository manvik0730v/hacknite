const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const District = require('../models/District');
const { getLevel } = require('../utils/levelUtils');

function addLevel(user) {
  const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  obj.level = getLevel(obj.xp || 0);
  return obj;
}

router.get('/', protect, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  const friends = await User.find({ uid: { $in: user.friends || [] } })
    .select('uid username profilePhoto streak stats xp');
  res.json(friends.map(addLevel));
});

router.get('/users', protect, async (req, res) => {
  const { search } = req.query;
  const query = { uid: { $ne: req.user.uid } };
  if (search) query.username = { $regex: search, $options: 'i' };
  const users = await User.find(query).select('uid username profilePhoto xp').limit(20);
  res.json(users.map(addLevel));
});

router.get('/profile/:uid', protect, async (req, res) => {
  const user = await User.findOne({ uid: req.params.uid })
    .select('uid username profilePhoto streak stats xp');
  if (!user) return res.status(404).json({ error: 'User not found' });
  const donCount = await District.countDocuments({ donUid: req.params.uid });
  const obj = addLevel(user);
  obj.districtsDon = donCount;
  res.json(obj);
});

router.post('/request', protect, async (req, res) => {
  const { toUid } = req.body;
  const reverseRequest = await FriendRequest.findOne({ fromUid: toUid, toUid: req.user.uid, status: 'pending' });
  if (reverseRequest) {
    reverseRequest.status = 'accepted';
    await reverseRequest.save();
    await User.findOneAndUpdate({ uid: req.user.uid }, { $addToSet: { friends: toUid } });
    await User.findOneAndUpdate({ uid: toUid }, { $addToSet: { friends: req.user.uid } });
    return res.json({ autoAccepted: true });
  }
  const existing = await FriendRequest.findOne({ fromUid: req.user.uid, toUid, status: 'pending' });
  if (existing) return res.status(400).json({ error: 'Request already sent' });
  const newReq = await FriendRequest.create({ fromUid: req.user.uid, toUid });
  res.json(newReq);
});

router.get('/requests', protect, async (req, res) => {
  const requests = await FriendRequest.find({ toUid: req.user.uid, status: 'pending' });
  const withUsers = await Promise.all(requests.map(async r => {
    const from = await User.findOne({ uid: r.fromUid }).select('uid username profilePhoto');
    return { ...r.toObject(), from };
  }));
  res.json(withUsers);
});

router.post('/respond', protect, async (req, res) => {
  const { requestId, action } = req.body;
  const request = await FriendRequest.findById(requestId);
  if (!request) return res.status(404).json({ error: 'Not found' });
  request.status = action;
  await request.save();
  if (action === 'accepted') {
    await User.findOneAndUpdate({ uid: request.toUid },   { $addToSet: { friends: request.fromUid } });
    await User.findOneAndUpdate({ uid: request.fromUid }, { $addToSet: { friends: request.toUid } });
  }
  res.json({ success: true });
});

module.exports = router;
