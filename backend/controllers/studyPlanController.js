const StudyPlan = require('../models/StudyPlan');
const User = require('../models/User');

const createStudyPlan = async (req, res) => {
  try {
    const { name, totalDuration, tasks, examDate, goal } = req.body;

    // Create study plan
    const studyPlan = new StudyPlan({
      userId: req.user._id,
      name,
      totalDuration,
      tasks: tasks.map(task => ({
        name: task.name,
        estimatedTime: task.estimatedTime,
        difficulty: task.difficulty || 'Medium'
      })),
      examDate: examDate ? new Date(examDate) : null,
      goal: goal || 'Top 10%'
    });

    await studyPlan.save();

    // Update user's current plan
    await User.findByIdAndUpdate(req.user._id, { currentPlanId: studyPlan._id });

    res.status(201).json({
      message: 'Study plan created successfully',
      plan: studyPlan
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCurrentStudyPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('currentPlanId');
    if (!user.currentPlanId) {
      return res.json(null);
    }
    res.json(user.currentPlanId);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllStudyPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ plans });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { planId, taskId, completed } = req.body;

    const plan = await StudyPlan.findOne({ _id: planId, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const task = plan.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = completed;
    if (completed) {
      task.completedAt = new Date();
    } else {
      task.completedAt = undefined;
    }

    await plan.save();

    res.json({
      message: 'Task status updated successfully',
      plan
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('currentPlanId');
    if (!user.currentPlanId) {
      return res.json(null);
    }

    const plan = user.currentPlanId;
    const completedTasks = plan.tasks.filter(task => task.completed).length;
    const totalTasks = plan.tasks.length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate total study time from completed tasks
    const totalMinutes = plan.tasks.reduce((acc, task) => {
      if (task.completed) {
        // Parse estimatedTime (could be "60", "2:30:00", "1.5h", etc.)
        const timeStr = task.estimatedTime;
        let minutes = 0;

        if (timeStr.includes(':')) {
          // HH:MM:SS format
          const parts = timeStr.split(':');
          minutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        } else if (timeStr.includes('h')) {
          // Hours format like "1.5h"
          minutes = parseFloat(timeStr.replace('h', '')) * 60;
        } else {
          // Assume minutes
          minutes = parseInt(timeStr) || 30;
        }

        return acc + minutes;
      }
      return acc;
    }, 0);

    const progress = {
      planName: plan.name,
      totalTasks,
      completedTasks,
      completionPercentage,
      totalStudyTime: totalMinutes,
      tasksByDifficulty: {
        Easy: {
          completed: plan.tasks.filter(t => t.difficulty === 'Easy' && t.completed).length,
          total: plan.tasks.filter(t => t.difficulty === 'Easy').length
        },
        Medium: {
          completed: plan.tasks.filter(t => t.difficulty === 'Medium' && t.completed).length,
          total: plan.tasks.filter(t => t.difficulty === 'Medium').length
        },
        Hard: {
          completed: plan.tasks.filter(t => t.difficulty === 'Hard' && t.completed).length,
          total: plan.tasks.filter(t => t.difficulty === 'Hard').length
        }
      }
    };

    res.json(progress);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createStudyPlan,
  getCurrentStudyPlan,
  getAllStudyPlans,
  updateTaskStatus,
  getProgress
};