const express = require('express');
const router = express.Router();
const {
  getInvestments,
  getInvestmentById,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} = require('../controllers/investmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getInvestments);
router.get('/:id', protect, getInvestmentById);
router.post('/', protect, createInvestment);
router.put('/:id', protect, updateInvestment);
router.delete('/:id', protect, deleteInvestment);

module.exports = router;