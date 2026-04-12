const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Run = require('../models/Run');
const User = require('../models/User');
const District = require('../models/District');
const { getDistrictsFromRoute, DISTRICTS } = require('../utils/districtDetector');

async function updateStreak(user) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (lastActive) lastActive.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
  if (!lastActive || lastActive < yesterday) {
    user.streak = lastActive && lastActive.getTime() === yesterday.getTime() ? user.streak + 1 : 1;
  }
  user.lastActiveDate = new Date();
}

async function updateDistricts(uid, username, distanceByDistrict) {
  for (const [districtName, distance] of Object.entries(distanceByDistrict)) {
    let district = await District.findOne({ name: districtName });
    if (!district) district = new District({ name: districtName, userDistances: [] });
    const existing = district.userDistances.find(u => u.uid === uid);
    if (existing) existing.totalDistance += distance;
    else district.userDistances.push({ uid, username, totalDistance: distance });
    // Recalculate don
    const top = district.userDistances.sort((a,b) => b.totalDistance - a.totalDistance)[0];
    district.donUid = top?.uid || null;
    district.donUsername = top?.username || null;
    await district.save();
  }
}

router.post('/', protect, async (req, res) => {
  try {
    const run = await Run.create({ userId: req.user.uid, ...req.body });
    const user = await User.findOne({ uid: req.user.uid });

    // Update stats
    if (run.distance > (user.stats?.longestRun || 0)) user.stats.longestRun = run.distance;
    if (run.pace && run.pace > 0 && (run.pace < user.stats.bestPace || user.stats.bestPace === 0)) {
      user.stats.bestPace = run.pace;
    }
    user.stats.totalCalories = (user.stats.totalCalories || 0) + (run.calories || 0);

    // Update streak
    await updateStreak(user);
    await user.save();

    // Update districts
    if (req.body.route && req.body.route.length > 1) {
      const distanceByDistrict = getDistrictsFromRoute(req.body.route);
      await updateDistricts(req.user.uid, user.username, distanceByDistrict);
      // Update districts count on user
      const donDistricts = await District.find({ donUid: req.user.uid });
      user.stats.regionsCapture = donDistricts.length;
      await user.save();
    }

    res.status(201).json(run);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  const runs = await Run.find({ userId: req.user.uid }).sort({ date: -1 });
  res.json(runs);
});

router.delete('/:id', protect, async (req, res) => {
  await Run.findByIdAndDelete(req.params.id);
  res.json({ message: 'Run deleted' });
});

module.exports = router;
