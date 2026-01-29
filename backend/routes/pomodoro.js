const express = require('express');
const { recordSession } = require('../controllers/pomodoroController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/session', auth, recordSession);

module.exports = router;