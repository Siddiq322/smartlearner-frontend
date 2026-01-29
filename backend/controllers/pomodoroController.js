const StudySession = require('../models/StudySession');
const { updateStreak } = require('../services/streakService');
const { updatePlan } = require('../services/planService');

const recordSession = async (req, res) => {
  try {
    const { topicId, duration, pomodoroCompleted } = req.body;
    const session = new StudySession({
      userId: req.user._id,
      topicId,
      duration,
      pomodoroCompleted
    });
    await session.save();
    if (pomodoroCompleted) {
      await updateStreak(req.user._id);
      await updatePlan(req.user._id);
    }
    res.send({ message: 'Session recorded' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports = { recordSession };