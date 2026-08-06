const express = require('express');
const router = express.Router();
const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalsSummary,
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getGoalsSummary); // must come before /:id to avoid route collision
router.get('/', protect, getGoals);
router.get('/:id', protect, getGoalById);
router.post('/', protect, createGoal);
router.put('/:id', protect, updateGoal);
router.delete('/:id', protect, deleteGoal);

module.exports = router;