const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user._id }).sort({ status: 1, nextDueDate: 1 });
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch loans', error: error.message });
  }
};

const createLoan = async (req, res) => {
  try {
    const { loanType, lenderName, principalAmount, outstandingAmount, emiAmount, interestRate, tenureMonths, startDate, nextDueDate } = req.body;

    if (!loanType || !lenderName || !principalAmount || !emiAmount || !tenureMonths || !startDate || !nextDueDate) {
      return res.status(400).json({ message: 'Missing required loan fields' });
    }

    const loan = await Loan.create({
      userId: req.user._id,
      loanType,
      lenderName,
      principalAmount,
      outstandingAmount: outstandingAmount ?? principalAmount,
      emiAmount,
      interestRate: interestRate || 0,
      tenureMonths,
      startDate,
      nextDueDate,
    });

    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create loan', error: error.message });
  }
};

const updateLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    const updatableFields = ['loanType', 'lenderName', 'principalAmount', 'outstandingAmount', 'emiAmount', 'interestRate', 'tenureMonths', 'startDate', 'nextDueDate', 'status'];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        loan[field] = req.body[field];
      }
    });

    await loan.save();
    res.status(200).json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update loan', error: error.message });
  }
};

const deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    await loan.deleteOne();
    res.status(200).json({ message: 'Loan deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete loan', error: error.message });
  }
};

// POST /api/loans/:id/pay-emi
const payEmi = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (loan.status === 'closed') return res.status(400).json({ message: 'This loan is already closed' });

    // Find or reasonably fall back for the "Loan EMI" category to link the transaction
    let loanCategory = await Category.findOne({ name: 'Loan EMI', type: 'expense' });

    // Create a linked expense transaction
    await Transaction.create({
      userId: req.user._id,
      type: 'expense',
      categoryId: loanCategory?._id,
      amount: loan.emiAmount,
      date: new Date(),
      note: `EMI payment - ${loan.lenderName}`,
      paymentMethod: 'Bank Transfer',
      extraData: { loanId: loan._id.toString() },
    });

    // Reduce outstanding balance (simplified - full EMI amount reduces principal, no amortization split)
    loan.outstandingAmount = Math.max(0, loan.outstandingAmount - loan.emiAmount);

    // Advance next due date by 1 month
    const next = new Date(loan.nextDueDate);
    next.setMonth(next.getMonth() + 1);
    loan.nextDueDate = next;

    // Auto-close if fully paid off
    if (loan.outstandingAmount <= 0) {
      loan.status = 'closed';
    }

    await loan.save();
    res.status(200).json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to process EMI payment', error: error.message });
  }
};

const getLoansSummary = async (req, res) => {
  try {
    const activeLoans = await Loan.find({ userId: req.user._id, status: 'active' });
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingAmount, 0);
    res.status(200).json({ totalOutstanding, activeLoanCount: activeLoans.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch loans summary', error: error.message });
  }
};

module.exports = { getLoans, createLoan, updateLoan, deleteLoan, payEmi, getLoansSummary };