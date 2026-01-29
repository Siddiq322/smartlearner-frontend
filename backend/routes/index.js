const express = require('express');
const authRoutes = require('./auth');
const studyPlanRoutes = require('./studyPlan');
const planRoutes = require('./plan');
const progressRoutes = require('./progress');
const pomodoroRoutes = require('./pomodoro');
const reportRoutes = require('./report');
const taskRoutes = require('./tasks');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/study-plan', studyPlanRoutes);
router.use('/plan', planRoutes);
router.use('/progress', progressRoutes);
router.use('/pomodoro', pomodoroRoutes);
router.use('/report', reportRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;