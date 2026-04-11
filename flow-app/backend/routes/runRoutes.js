const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Run = require('../models/Run');
const User = require('../models/User');

// Save a completed run
router.post('/', protect, async (req, res) => {
  try {
    const run = await Run.create({ userId: req.user.uid, ...req.body });
    // Update user stats
    const user = await User.findOne({ uid: req.user.uid });
    if (run.distance > user.stats.longestRun) {
      user.stats.longestRun = run.distance;
    }
    user.stats.totalCalories += run.calories || 0;
    await user.save();
    res.status(201).json(run);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all runs for user
router.get('/', protect, async (req, res) => {
  const runs = await Run.find({ userId: req.user.uid }).sort({ date: -1 });
  res.json(runs);
});

// Delete a run
router.delete('/:id', protect, async (req, res) => {
  await Run.findByIdAndDelete(req.params.id);
  res.json({ message: 'Run deleted' });
});

module.exports = router;