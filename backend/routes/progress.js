const express = require('express');
const { updateTopicProgress, updateConfidence } = require('../controllers/progressController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/topic', auth, updateTopicProgress);
router.post('/confidence', auth, updateConfidence);

module.exports = router;