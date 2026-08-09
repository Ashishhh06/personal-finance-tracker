const express = require('express');
const router = express.Router();
const { getNetWorth } = require('../controllers/netWorthController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNetWorth);

module.exports = router;