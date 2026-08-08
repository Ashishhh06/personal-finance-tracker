const express = require('express');
const router = express.Router();
const { getLoans, createLoan, updateLoan, deleteLoan, payEmi, getLoansSummary } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getLoansSummary);
router.get('/', protect, getLoans);
router.post('/', protect, createLoan);
router.put('/:id', protect, updateLoan);
router.delete('/:id', protect, deleteLoan);
router.post('/:id/pay-emi', protect, payEmi);

module.exports = router;