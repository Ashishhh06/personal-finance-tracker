const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus,
  getBudgetHistory,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/status', protect, getBudgetStatus);
router.get('/history', protect, getBudgetHistory);
router.get('/', protect, getBudgets);
router.post('/', protect, createBudget);
router.put('/:id', protect, updateBudget);
router.delete('/:id', protect, deleteBudget);

module.exports = router;