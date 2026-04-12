const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/login', protect, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { username, height, weight, gender, profilePhoto, onboardingDone } = req.body;

    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({
        uid, email,
        username: username || email.split('@')[0],
        height, weight, gender, profilePhoto,
        onboardingDone: onboardingDone || false
      });
    } else if (onboardingDone) {
      user.username = username || user.username;
      user.height = height || user.height;
      user.weight = weight || user.weight;
      user.gender = gender || user.gender;
      user.profilePhoto = profilePhoto || user.profilePhoto;
      user.onboardingDone = true;
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
