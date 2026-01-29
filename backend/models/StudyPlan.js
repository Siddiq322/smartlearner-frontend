const mongoose = require('mongoose');

const studyTaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  estimatedTime: { type: String, required: true }, // e.g., "60", "2:30:00", "1.5h"
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  totalDuration: { type: String, required: true }, // e.g., "3 days", "120", "2:00:00"
  tasks: [studyTaskSchema],
  examDate: { type: Date },
  goal: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);