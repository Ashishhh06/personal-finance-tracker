const express = require('express');
const router = express.Router();
const {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getTotalBalance,
} = require('../controllers/bankAccountController');
const { protect } = require('../middleware/authMiddleware');

router.get('/total', protect, getTotalBalance);
router.get('/', protect, getBankAccounts);
router.post('/', protect, createBankAccount);
router.put('/:id', protect, updateBankAccount);
router.delete('/:id', protect, deleteBankAccount);

module.exports = router;