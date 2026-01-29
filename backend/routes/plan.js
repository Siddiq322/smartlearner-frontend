const express = require('express');
const { createPlan, getCurrentPlan, getTodayExecution, updateTaskStatus, getPlanProgress } = require('../controllers/planController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/create', auth, createPlan);
router.get('/current', auth, getCurrentPlan);
router.get('/today', auth, getTodayExecution);
router.put('/task-status', auth, updateTaskStatus);
router.get('/progress', auth, getPlanProgress);

module.exports = router;