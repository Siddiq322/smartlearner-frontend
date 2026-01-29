const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const DailyExecution = require('../models/DailyExecution');
const DailyPlan = require('../models/DailyPlan');
const Task = require('../models/Task');
const User = require('../models/User');

const generateDailyPlan = async (userId, planId, isReplan = false) => {
  try {
    const plan = await Plan.findById(planId);
    if (!plan) throw new Error('Plan not found');

    const currentVersion = plan.versions[plan.versions.length - 1];
    const tasks = currentVersion.tasks;

    // Get previous executions to see what's been done
    const previousExecutions = await DailyExecution.find({
      userId,
      planId
    }).sort({ date: -1 });

    // Find incomplete tasks
    let tasksToSchedule = [];
    if (isReplan && previousExecutions.length > 0) {
      const lastExecution = previousExecutions[0];
      const incompleteTasks = lastExecution.schedule.filter(task => task.status !== 'completed');

      // Mark incomplete tasks as carried forward in the plan
      incompleteTasks.forEach(incomplete => {
        const task = tasks.find(t => t._id.toString() === incomplete.taskId.toString());
        if (task) {
          task.carriedForward = true;
        }
      });

      // Create new version with carried forward tasks
      const newVersionNumber = plan.currentVersion + 1;
      const carriedForwardTasks = tasks.filter(t => t.carriedForward || t.status !== 'completed');

      // Split large tasks if needed
      const adjustedTasks = [];
      carriedForwardTasks.forEach(task => {
        if (task.estimatedTime > 7200) { // More than 2 hours
          // Split into smaller chunks
          const chunks = Math.ceil(task.estimatedTime / 3600); // 1 hour chunks
          for (let i = 0; i < chunks; i++) {
            adjustedTasks.push({
              name: `${task.name} (Part ${i + 1})`,
              estimatedTime: Math.ceil(task.estimatedTime / chunks),
              difficulty: task.difficulty,
              carriedForward: true
            });
          }
        } else {
          adjustedTasks.push(task);
        }
      });

      plan.versions.push({
        version: newVersionNumber,
        tasks: adjustedTasks,
        totalDuration: plan.totalDuration,
        reason: 'Automatic adaptation due to incomplete tasks'
      });
      plan.currentVersion = newVersionNumber;
      await plan.save();

      tasksToSchedule = adjustedTasks.filter(t => !t.completed);
    } else {
      tasksToSchedule = tasks.filter(t => !t.completed);
    }

    // Calculate days available
    const totalDurationDays = Math.ceil(plan.totalDuration / (24 * 3600));
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    // Distribute tasks across days
    const dailyTasks = distributeTasks(tasksToSchedule, totalDurationDays);

    // Generate executions for upcoming days
    for (let day = 0; day < Math.min(totalDurationDays, 7); day++) { // Plan for next 7 days max
      const executionDate = new Date(startDate);
      executionDate.setDate(startDate.getDate() + day);

      // Check if execution already exists for this date
      const existingExecution = await DailyExecution.findOne({
        userId,
        date: executionDate
      });

      if (!existingExecution && dailyTasks[day] && dailyTasks[day].length > 0) {
        const schedule = createSchedule(dailyTasks[day], day === 0); // Today gets morning schedule
        const totalPlannedTime = schedule.reduce((sum, item) => sum + item.duration, 0);

        const execution = new DailyExecution({
          userId,
          planId,
          planVersion: plan.currentVersion,
          date: executionDate,
          schedule,
          totalPlannedTime
        });

        await execution.save();
      }
    }

  } catch (error) {
    console.error('Error generating daily plan:', error);
    throw error;
  }
};

const distributeTasks = (tasks, totalDays) => {
  const dailyTasks = Array.from({ length: totalDays }, () => []);

  // Sort tasks by difficulty (high first) and estimated time
  const sortedTasks = tasks.sort((a, b) => {
    const difficultyOrder = { high: 3, medium: 2, low: 1 };
    const diffA = difficultyOrder[a.difficulty];
    const diffB = difficultyOrder[b.difficulty];
    if (diffA !== diffB) return diffB - diffA;
    return b.estimatedTime - a.estimatedTime;
  });

  // Distribute tasks evenly across days
  sortedTasks.forEach((task, index) => {
    const dayIndex = index % totalDays;
    dailyTasks[dayIndex].push(task);
  });

  return dailyTasks;
};

const createSchedule = (tasks, isToday = false) => {
  const schedule = [];
  let currentTime = isToday ? new Date() : new Date();
  currentTime.setHours(9, 0, 0, 0); // Start at 9 AM

  tasks.forEach(task => {
    const durationMinutes = Math.ceil(task.estimatedTime / 60);
    const startTime = currentTime.toTimeString().slice(0, 5);
    currentTime.setMinutes(currentTime.getMinutes() + durationMinutes);
    const endTime = currentTime.toTimeString().slice(0, 5);

    schedule.push({
      _id: new mongoose.Types.ObjectId(), // Add _id to schedule item
      taskId: task._id,
      taskName: task.name,
      startTime,
      endTime,
      duration: durationMinutes,
      status: 'pending'
    });
  });

  return schedule;
};

const generateDailyPlanFromTasks = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's tasks
    const tasks = await Task.find({
      userId,
      date: { $gte: today, $lt: tomorrow },
      completed: false
    }).sort({ createdAt: 1 });

    // Create schedule from tasks
    const schedule = tasks.map(task => ({
      topicId: task._id, // Using task id as topic id for now
      subject: task.title,
      timeAllocated: Math.ceil(task.duration / 60), // Convert seconds to minutes
      priorityLevel: 'medium' // Default priority
    }));

    // Upsert daily plan
    await DailyPlan.findOneAndUpdate(
      { userId, date: today },
      { 
        userId, 
        date: today, 
        schedule 
      },
      { upsert: true, new: true }
    );

  } catch (error) {
    console.error('Error generating daily plan from tasks:', error);
    throw error;
  }
};

module.exports = {
  generateDailyPlan,
  generateDailyPlanFromTasks
};