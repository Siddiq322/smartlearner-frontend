const User = require('../models/User');
const StudySession = require('../models/StudySession');

const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const studiedToday = await StudySession.findOne({ userId, date: { $gte: today } });
  const studiedYesterday = await StudySession.findOne({ userId, date: { $gte: yesterday, $lt: today } });

  if (studiedToday && studiedYesterday) {
    user.streak += 1;
  } else if (studiedToday) {
    user.streak = 1;
  } else {
    user.streak = 0;
  }

  user.lastStudyDate = new Date();
  await user.save();
};

module.exports = { updateStreak };