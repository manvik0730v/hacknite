const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const District = require('../models/District');
const { DISTRICTS } = require('../utils/districtDetector');

router.get('/', protect, async (req, res) => {
  const uid = req.user.uid;
  const allDistricts = await Promise.all(
    DISTRICTS.map(async d => {
      const doc = await District.findOne({ name: d.name });
      const myEntry = doc?.userDistances?.find(u => u.uid === uid);
      return {
        name: d.name,
        donUid: doc?.donUid || null,
        donUsername: doc?.donUsername || null,
        myDistance: myEntry?.totalDistance || 0,
        iAmDon: doc?.donUid === uid
      };
    })
  );
  res.json(allDistricts);
});

module.exports = router;
