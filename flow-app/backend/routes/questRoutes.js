const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const UserQuest = require('../models/UserQuest');
const User = require('../models/User');

const QUESTS = [
  { id:1,  emoji:'🟢', title:'System Test Run',      description:'Run for 10 seconds',          goalType:'time',     goalValue:10,    xp:1000  },
  { id:2,  emoji:'🚶', title:'Warm-Up Walk',          description:'Move for 5 minutes',           goalType:'time',     goalValue:300,   xp:2000  },
  { id:3,  emoji:'🏃', title:'First Short Run',       description:'Run for 2 minutes',            goalType:'time',     goalValue:120,   xp:3000  },
  { id:4,  emoji:'⏱️', title:'10-Minute Session',     description:'Move for 10 minutes',          goalType:'time',     goalValue:600,   xp:4000  },
  { id:5,  emoji:'📏', title:'First Distance',        description:'Cover 1 km',                   goalType:'distance', goalValue:1000,  xp:5000  },
  { id:6,  emoji:'⚡', title:'Quick Time Challenge',  description:'Run for 5 minutes continuously',goalType:'time',    goalValue:300,   xp:6000  },
  { id:7,  emoji:'📏', title:'Distance Builder',      description:'Cover 2 km',                   goalType:'distance', goalValue:2000,  xp:7000  },
  { id:8,  emoji:'⏳', title:'Endurance Time',        description:'Move for 20 minutes',          goalType:'time',     goalValue:1200,  xp:8000  },
  { id:9,  emoji:'📏', title:'Distance Push',         description:'Cover 3 km',                   goalType:'distance', goalValue:3000,  xp:9000  },
  { id:10, emoji:'👑', title:'Beginner Milestone',    description:'Cover 5 km',                   goalType:'distance', goalValue:5000,  xp:10000 },
];

router.get('/', protect, async (req, res) => {
  const completed = await UserQuest.find({ userId: req.user.uid });
  const completedIds = completed.map(q => q.questId);
  const quests = QUESTS.map(q => ({ ...q, completed: completedIds.includes(q.id) }));
  res.json(quests);
});

router.post('/complete', protect, async (req, res) => {
  const { questId } = req.body;
  const quest = QUESTS.find(q => q.id === questId);
  if (!quest) return res.status(404).json({ error: 'Quest not found' });

  const existing = await UserQuest.findOne({ userId: req.user.uid, questId });
  if (existing) return res.status(400).json({ error: 'Already completed' });

  await UserQuest.create({ userId: req.user.uid, questId, completedAt: new Date() });

  const user = await User.findOne({ uid: req.user.uid });
  user.xp = (user.xp || 0) + quest.xp;
  await user.save();

  res.json({ xp: user.xp, gained: quest.xp });
});

module.exports = router;
