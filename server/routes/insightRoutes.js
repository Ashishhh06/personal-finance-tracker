const express = require('express');
const router = express.Router();
const { getInsights, generateInsight } = require('../controllers/insightController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getInsights);
router.post('/generate', protect, generateInsight);

module.exports = router;