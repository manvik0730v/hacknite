const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Called after Firebase login to create/get user in MongoDB
router.post('/login', protect, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { username, height, weight } = req.body;

    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({ uid, email, username, height, weight });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
