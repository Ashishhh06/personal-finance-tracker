const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getInsights, generateInsight, generateGoalInsight } = require('../controllers/insightController');
const { protect } = require('../middleware/authMiddleware');

const generateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 20,
  message: { message: 'Too many insight generation requests. Please try again later.' },
});

router.get('/', protect, getInsights);
router.post('/generate', protect, generateLimiter, generateInsight);
router.post('/goals/:goalId/generate', protect, generateLimiter, generateGoalInsight);

module.exports = router;