const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectName: { type: String, required: true },
  topicName: { type: String, required: true },
  isWeak: { type: Boolean, default: false },
  confidence: { type: Number, min: 1, max: 5, default: 3 },
  completed: { type: Boolean, default: false },
  priorityScore: { type: Number, default: 0 },
  lastRevised: { type: Date }
});

module.exports = mongoose.model('Topic', topicSchema);