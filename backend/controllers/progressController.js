const Topic = require('../models/Topic');
const { updatePlan } = require('../services/planService');
const { scheduleRevision } = require('../services/revisionService');

const updateTopicProgress = async (req, res) => {
  try {
    const { topicId, completed } = req.body;
    const topic = await Topic.findById(topicId);
    topic.completed = completed;
    if (completed) topic.lastRevised = new Date();
    await topic.save();
    await updatePlan(req.user._id);
    res.send({ message: 'Progress updated' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const updateConfidence = async (req, res) => {
  try {
    const { topicId, confidence } = req.body;
    const topic = await Topic.findById(topicId);
    topic.confidence = confidence;
    await topic.save();
    await scheduleRevision(topicId);
    await updatePlan(req.user._id);
    res.send({ message: 'Confidence updated' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports = { updateTopicProgress, updateConfidence };