const mongoose = require('mongoose');

const dailyExecutionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  planVersion: { type: Number, required: true },
  date: { type: Date, required: true },
  schedule: [{
    taskId: { type: mongoose.Schema.Types.ObjectId, required: true }, // reference to task in plan version
    taskName: { type: String, required: true },
    startTime: { type: String, required: true }, // HH:MM format
    endTime: { type: String, required: true }, // HH:MM format
    duration: { type: Number, required: true }, // in minutes
    status: { type: String, enum: ['pending', 'completed', 'partial', 'missed'], default: 'pending' },
    actualTime: { type: Number, default: 0 } // in minutes
  }],
  totalPlannedTime: { type: Number, required: true }, // in minutes
  totalActualTime: { type: Number, default: 0 }, // in minutes
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DailyExecution', dailyExecutionSchema);