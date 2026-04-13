const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Mark a story event as seen
router.post('/seen', protect, async (req, res) => {
  const { event } = req.body;
  await User.findOneAndUpdate(
    { uid: req.user.uid },
    { $addToSet: { seenStoryEvents: event } }
  );
  res.json({ success: true });
});

// Get all seen events
router.get('/seen', protect, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  res.json({ seenEvents: user?.seenStoryEvents || [], hasVisitedSincityMap: user?.hasVisitedSincityMap || false });
});

// Mark sincity map visited
router.post('/sincity-map-visited', protect, async (req, res) => {
  await User.findOneAndUpdate({ uid: req.user.uid }, { hasVisitedSincityMap: true });
  res.json({ success: true });
});

module.exports = router;
