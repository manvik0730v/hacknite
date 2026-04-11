const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Story mode missions — can be seeded in DB or hardcoded
const storyMissions = [
  { id: 1, task: 'Run 3km within 30 minutes', goal: { type: 'distance', value: 3000, timeLimit: 1800 } },
  { id: 2, task: 'Capture 2 regions in SIN mode', goal: { type: 'regions', value: 2 } },
];

router.get('/mission/:id', protect, (req, res) => {
  const mission = storyMissions.find(m => m.id == req.params.id);
  res.json(mission || { error: 'Mission not found' });
});

module.exports = router;