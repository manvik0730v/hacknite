const mongoose = require('mongoose');
const DistrictSchema = new mongoose.Schema({
  name: String,
  donUid: { type: String, default: null },
  donUsername: { type: String, default: null },
  userDistances: [{
    uid: String,
    username: String,
    totalDistance: { type: Number, default: 0 }
  }]
}, { timestamps: true });
module.exports = mongoose.model('District', DistrictSchema);
