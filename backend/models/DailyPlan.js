const mongoose = require('mongoose');

const dailyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  schedule: [{
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    subject: { type: String },
    timeAllocated: { type: Number }, // in minutes
    priorityLevel: { type: String, enum: ['high', 'medium', 'low'] }
  }]
});

module.exports = mongoose.model('DailyPlan', dailyPlanSchema);