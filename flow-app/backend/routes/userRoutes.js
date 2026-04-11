const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/me', protect, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  res.json(user);
});

module.exports = router;