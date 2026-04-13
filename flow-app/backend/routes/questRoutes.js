const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const UserQuest = require('../models/UserQuest');
const User = require('../models/User');

const UPTOWN_QUESTS = [
  { id:1,  mode:'uptown', title:'System Test Run',      description:'Run for 10 seconds',            goalType:'time',           goalValue:10,   xp:1000  },
  { id:2,  mode:'uptown', title:'Warm-Up Walk',          description:'Move for 5 minutes',             goalType:'time',           goalValue:300,  xp:2000  },
  { id:3,  mode:'uptown', title:'First Short Run',       description:'Run for 2 minutes',              goalType:'time',           goalValue:120,  xp:3000  },
  { id:4,  mode:'uptown', title:'10-Minute Session',     description:'Move for 10 minutes',            goalType:'time',           goalValue:600,  xp:4000  },
  { id:5,  mode:'uptown', title:'First Distance',        description:'Cover 1 km',                     goalType:'distance',       goalValue:1000, xp:5000  },
  { id:6,  mode:'uptown', title:'Quick Time Challenge',  description:'Run for 5 minutes continuously', goalType:'time',           goalValue:300,  xp:6000  },
  { id:7,  mode:'uptown', title:'Distance Builder',      description:'Cover 2 km',                     goalType:'distance',       goalValue:2000, xp:7000  },
  { id:8,  mode:'uptown', title:'Endurance Time',        description:'Move for 20 minutes',            goalType:'time',           goalValue:1200, xp:8000  },
  { id:9,  mode:'uptown', title:'Distance Push',         description:'Cover 3 km',                     goalType:'distance',       goalValue:3000, xp:9000  },
  { id:10, mode:'uptown', title:'Beginner Milestone',    description:'Cover 5 km',                     goalType:'distance',       goalValue:5000, xp:10000 },
];

const SINCITY_QUESTS = [
  { id:101, mode:'sincity', title:'System Stress Test',      description:'Run continuously for 10 seconds',    goalType:'time',           goalValue:10,   xp:2000  },
  { id:102, mode:'sincity', title:'Sudden Surge',            description:'Cover 1 km in 5 minutes',            goalType:'distanceInTime', goalValue:1000, timeLimit:300,  xp:6000  },
  { id:103, mode:'sincity', title:'Controlled Burst',        description:'Run continuously for 15 minutes',    goalType:'time',           goalValue:900,  xp:11000 },
  { id:104, mode:'sincity', title:'Territory Pressure',      description:'Cover 3 km within 20 minutes',       goalType:'distanceInTime', goalValue:3000, timeLimit:1200, xp:14000 },
  { id:105, mode:'sincity', title:'Dominance Trial',         description:'Cover 5 km within 30 minutes',       goalType:'distanceInTime', goalValue:5000, timeLimit:1800, xp:23000 },
  { id:106, mode:'sincity', title:'Endurance Collapse Test', description:'Move continuously for 45 minutes',   goalType:'time',           goalValue:2700, xp:26000 },
  { id:107, mode:'sincity', title:'District Claim',          description:'Run for 10 seconds in the district', goalType:'time',           goalValue:10,   xp:3000, special:true },
];

const ALL_QUESTS = [...UPTOWN_QUESTS, ...SINCITY_QUESTS];

async function updateStreak(user) {
  const today = new Date(); today.setHours(0,0,0,0);
  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (lastActive) lastActive.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
  if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
    user.streak = (lastActive && lastActive.getTime() === yesterday.getTime()) ? user.streak + 1 : 1;
  }
  user.lastActiveDate = new Date();
}

router.get('/', protect, async (req, res) => {
  const { mode } = req.query;
  const user = await User.findOne({ uid: req.user.uid });
  const baseQuests = mode === 'sincity' ? SINCITY_QUESTS : UPTOWN_QUESTS;
  const completed = await UserQuest.find({ userId: req.user.uid });
  const completedIds = completed.map(q => q.questId);
  const result = baseQuests.map(q => {
    const obj = { ...q, completed: completedIds.includes(q.id) };
    if (q.special) obj.locked = !user?.hasVisitedSincityMap;
    return obj;
  });
  res.json(result);
});

router.post('/complete', protect, async (req, res) => {
  const { questId } = req.body;
  const quest = ALL_QUESTS.find(q => q.id === questId);
  if (!quest) return res.status(404).json({ error: 'Quest not found' });
  const existing = await UserQuest.findOne({ userId: req.user.uid, questId });
  if (existing) return res.status(400).json({ error: 'Already completed' });
  await UserQuest.create({ userId: req.user.uid, questId, completedAt: new Date() });
  const user = await User.findOne({ uid: req.user.uid });
  user.xp = (user.xp || 0) + quest.xp;
  await updateStreak(user);
  await user.save();
  const completedCount = await UserQuest.countDocuments({ userId: req.user.uid, questId: { $in: UPTOWN_QUESTS.map(q=>q.id) } });
  res.json({ xp: user.xp, gained: quest.xp, streak: user.streak, isFirstUptownQuest: completedCount === 1 });
});

module.exports = { router, ALL_QUESTS };
