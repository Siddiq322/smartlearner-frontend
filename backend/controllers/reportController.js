const StudySession = require('../models/StudySession');
const Topic = require('../models/Topic');

const getWeeklyReport = async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const sessions = await StudySession.find({
      userId: req.user._id,
      date: { $gte: weekAgo }
    });

    const topics = await Topic.find({ userId: req.user._id });

    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const completedTopics = topics.filter(t => t.completed).length;
    const avgConfidence = topics.length > 0 ? topics.reduce((sum, t) => sum + t.confidence, 0) / topics.length : 0;
    const weakAreas = topics.filter(t => t.confidence <= 2).map(t => t.subjectName);

    res.send({
      totalHours,
      completedTopics,
      avgConfidence,
      weakAreas
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports = { getWeeklyReport };