const Topic = require('../models/Topic');

const scheduleRevision = async (topicId) => {
  const topic = await Topic.findById(topicId);
  let daysToRevise = 7; // default

  if (topic.confidence <= 2) {
    daysToRevise = 1;
  } else if (topic.confidence === 3) {
    daysToRevise = 3;
  }

  topic.lastRevised = new Date();
  await topic.save();

  // In a real app, you might schedule a job, but for now, just update lastRevised
};

module.exports = { scheduleRevision };