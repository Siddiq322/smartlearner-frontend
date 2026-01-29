const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  examDate: { type: Date },
  goal: { type: String, default: 'Top 10%' },
  dailyAvailableTime: { type: Number, default: 120 }, // in minutes
  weakSubjects: [{ type: String }],
  currentPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan' },
  streak: { type: Number, default: 0 },
  lastStudyDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);