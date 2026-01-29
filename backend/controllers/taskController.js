const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const DailyPlan = require('../models/DailyPlan');
const { updateStreak } = require('../services/streakService');
const { generateDailyPlanFromTasks } = require('../services/planService');

const addTask = async (req, res) => {
  try {
    const { title, duration, date } = req.body;
    const task = new Task({
      userId: req.user._id,
      title,
      duration: parseInt(duration), // in seconds
      date: date ? new Date(date) : new Date()
    });
    await task.save();
    
    // Generate daily plan after adding task
    await generateDailyPlanFromTasks(req.user._id);
    
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { date } = req.query;
    const query = { userId: req.user._id };
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.send(tasks);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { completed },
      { new: true }
    );
    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }

    if (completed) {
      await updateStreak(req.user._id);
    }

    res.send(task);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('DELETE TASK REQUEST:');
    console.log('- Task ID:', id);
    console.log('- User ID:', req.user?._id);
    console.log('- Auth header:', req.header('Authorization') ? 'Present' : 'Missing');

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    console.log('- Task found:', !!task);
    if (task) {
      console.log('- Task details:', { id: task._id, title: task.title, userId: task.userId });
    }

    if (!task) {
      console.log('- Returning 404: Task not found');
      return res.status(404).send({ error: 'Task not found' });
    }

    // Try to regenerate daily plan after deleting task, but don't fail if it errors
    try {
      await generateDailyPlanFromTasks(req.user._id);
      console.log('- Daily plan regenerated successfully');
    } catch (planError) {
      console.error('Error regenerating daily plan after task deletion:', planError);
      // Don't fail the delete operation if plan regeneration fails
    }

    console.log('- Task deleted successfully');
    res.send({ message: 'Task deleted successfully', task });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(400).send({ error: error.message });
  }
};

const carryForwardTasks = async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const incompleteTasks = await Task.find({
      userId: req.user._id,
      date: { $gte: yesterday, $lte: today },
      completed: false
    });

    const carriedTasks = [];
    for (const task of incompleteTasks) {
      const newTask = new Task({
        userId: task.userId,
        title: task.title,
        duration: Math.max(task.duration * 0.8, 300), // reduce by 20%, min 5 min
        date: new Date(),
        carriedForward: true
      });
      await newTask.save();
      carriedTasks.push(newTask);
    }

    res.send(carriedTasks);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getDailyPlan = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyPlan = await DailyPlan.findOne({
      userId: req.user._id,
      date: today
    }).populate('schedule.topicId');

    if (!dailyPlan) {
      return res.send({ schedule: [] });
    }

    res.send(dailyPlan);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports = { addTask, getTasks, updateTask, deleteTask, carryForwardTasks, getDailyPlan };