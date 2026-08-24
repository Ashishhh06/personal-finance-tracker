const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getInsights, generateInsight } = require('../controllers/insightController');
const { protect } = require('../middleware/authMiddleware');

const generateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20, // max 20 generations per day per IP
  message: { message: 'Too many insight generation requests. Please try again later.' },
});

router.get('/', protect, getInsights);
router.post('/generate', protect, generateLimiter, generateInsight);

module.exports = router;