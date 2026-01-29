const express = require('express');
const {
  createStudyPlan,
  getCurrentStudyPlan,
  getAllStudyPlans,
  updateTaskStatus,
  getProgress
} = require('../controllers/studyPlanController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/create', auth, createStudyPlan);
router.get('/current', auth, getCurrentStudyPlan);
router.get('/all', auth, getAllStudyPlans);
router.put('/task-status', auth, updateTaskStatus);
router.get('/progress', auth, getProgress);

module.exports = router;