const mongoose = require('mongoose');

const planTaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  estimatedTime: { type: Number, required: true }, // in seconds
  difficulty: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  completed: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'completed', 'partial', 'missed'], default: 'pending' },
  actualTime: { type: Number, default: 0 }, // in seconds
  carriedForward: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const planVersionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  tasks: [planTaskSchema],
  totalDuration: { type: Number, required: true }, // in seconds
  createdAt: { type: Date, default: Date.now },
  reason: { type: String, default: '' } // reason for this version (initial, adaptation, etc.)
});

const planSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  totalDuration: { type: Number, required: true }, // in seconds
  currentVersion: { type: Number, default: 1 },
  versions: [planVersionSchema],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);