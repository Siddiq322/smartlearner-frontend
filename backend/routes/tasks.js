const express = require('express');
const { addTask, getTasks, updateTask, carryForwardTasks, getDailyPlan } = require('../controllers/taskController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/add', auth, addTask);
router.get('/', auth, getTasks);
router.get('/daily-plan', auth, getDailyPlan);
router.put('/:id', auth, updateTask);
router.post('/carry-forward', auth, carryForwardTasks);

module.exports = router;