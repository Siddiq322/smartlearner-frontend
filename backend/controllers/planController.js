const Plan = require('../models/Plan');
const DailyExecution = require('../models/DailyExecution');
const User = require('../models/User');
const { generateDailyPlan } = require('../services/planService');

const createPlan = async (req, res) => {
  try {
    const { name, totalDuration, tasks } = req.body;

    // Parse duration (HH:MM:SS or "X days")
    let durationSeconds = 0;
    if (typeof totalDuration === 'string' && totalDuration.includes(':')) {
      const [hours, minutes, seconds] = totalDuration.split(':').map(Number);
      durationSeconds = hours * 3600 + minutes * 60 + seconds;
    } else if (typeof totalDuration === 'string' && totalDuration.includes('day')) {
      const days = parseInt(totalDuration);
      durationSeconds = days * 24 * 3600;
    } else {
      durationSeconds = parseInt(totalDuration) || 86400; // default 1 day
    }

    // Create plan with version 1
    const plan = new Plan({
      userId: req.user._id,
      name,
      totalDuration: durationSeconds,
      currentVersion: 1,
      versions: [{
        version: 1,
        tasks: tasks.map(task => ({
          name: task.name,
          estimatedTime: task.estimatedTime,
          difficulty: task.difficulty || 'medium'
        })),
        totalDuration: durationSeconds,
        reason: 'Initial plan creation'
      }]
    });

    await plan.save();

    // Set as current plan for user
    await User.findByIdAndUpdate(req.user._id, { currentPlanId: plan._id });

    // Generate today's execution
    await generateDailyPlan(req.user._id, plan._id);

    res.status(201).send({ message: 'Plan created successfully', planId: plan._id });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getCurrentPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('currentPlanId');
    if (!user.currentPlanId) {
      return res.send(null);
    }
    res.send(user.currentPlanId);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getTodayExecution = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const execution = await DailyExecution.findOne({
      userId: req.user._id,
      date: today
    }).populate('planId', 'name currentVersion');

    if (!execution) {
      return res.send(null);
    }

    res.send(execution);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId, status, actualTime } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const execution = await DailyExecution.findOne({
      userId: req.user._id,
      date: today
    });

    if (!execution) {
      return res.status(404).send({ error: 'No execution found for today' });
    }

    const taskIndex = execution.schedule.findIndex(task => task._id.toString() === taskId);
    if (taskIndex === -1) {
      return res.status(404).send({ error: 'Task not found in today\'s schedule' });
    }

    execution.schedule[taskIndex].status = status;
    if (actualTime !== undefined) {
      execution.schedule[taskIndex].actualTime = actualTime;
    }

    // Update total actual time
    execution.totalActualTime = execution.schedule.reduce((sum, task) => sum + (task.actualTime || 0), 0);

    await execution.save();

    // Check if all tasks are completed, if not, trigger re-planning
    const incompleteTasks = execution.schedule.filter(task => task.status !== 'completed');
    if (incompleteTasks.length > 0) {
      // Trigger automatic re-planning
      await generateDailyPlan(req.user._id, execution.planId, true);
    }

    res.send({ message: 'Task status updated successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getPlanProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('currentPlanId');
    if (!user.currentPlanId) {
      return res.send(null);
    }

    const plan = user.currentPlanId;
    const executions = await DailyExecution.find({
      userId: req.user._id,
      planId: plan._id
    }).sort({ date: 1 });

    const progress = {
      planName: plan.name,
      versions: plan.versions.length,
      totalTasks: plan.versions[plan.versions.length - 1].tasks.length,
      completedTasks: plan.versions[plan.versions.length - 1].tasks.filter(task => task.completed).length,
      executions: executions.map(exec => ({
        date: exec.date,
        completed: exec.completed,
        totalPlannedTime: exec.totalPlannedTime,
        totalActualTime: exec.totalActualTime,
        tasks: exec.schedule
      }))
    };

    res.send(progress);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports = {
  createPlan,
  getCurrentPlan,
  getTodayExecution,
  updateTaskStatus,
  getPlanProgress
};