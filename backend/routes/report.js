const express = require('express');
const { getWeeklyReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/weekly', auth, getWeeklyReport);

module.exports = router;