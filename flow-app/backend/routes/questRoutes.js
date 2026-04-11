const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Quest = require('../models/Quest');
const User = require('../models/User');

router.get('/', protect, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  const quests = await Quest.find({
    $or: [
      { type: 'daily' },
      { type: 'level', requiredLevel: { $lte: user.level } }
    ]
  });
  res.json(quests);
});

module.exports = router;