const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user._id }).sort({ status: 1, createdAt: -1 });
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch loans', error: error.message });
  }
};

const createLoan = async (req, res) => {
  try {
    const {
      loanType, lenderName, direction, principalAmount, outstandingAmount,
      emiAmount, interestRate, tenureMonths, startDate, nextDueDate, note,
    } = req.body;

    // Only the essentials are required now - formal loan fields (EMI, tenure, due date) are optional
    if (!loanType || !lenderName || !principalAmount) {
      return res.status(400).json({ message: 'loanType, lenderName, and principalAmount are required' });
    }

    const loan = await Loan.create({
      userId: req.user._id,
      loanType,
      lenderName,
      direction: direction || 'owed_by_me',
      principalAmount,
      outstandingAmount: outstandingAmount ?? principalAmount,
      emiAmount: emiAmount || null,
      interestRate: interestRate || 0,
      tenureMonths: tenureMonths || null,
      startDate: startDate || new Date(),
      nextDueDate: nextDueDate || null,
      note: note || '',
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

    const updatableFields = [
      'loanType', 'lenderName', 'direction', 'principalAmount', 'outstandingAmount',
      'emiAmount', 'interestRate', 'tenureMonths', 'startDate', 'nextDueDate', 'note', 'status',
    ];
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
// Works for both formal EMI payments AND informal debt settlements.
// Direction determines whether this creates an expense (you're paying) or income (they're paying you) transaction.
const payEmi = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (loan.status === 'closed') return res.status(400).json({ message: 'This is already closed' });

    // Allow a custom amount (useful for informal debts / partial settlements); default to EMI or full outstanding
    const amount = req.body?.amount ? Number(req.body.amount) : (loan.emiAmount || loan.outstandingAmount);

    const isDebtOwedByMe = loan.direction === 'owed_by_me';
    const transactionType = isDebtOwedByMe ? 'expense' : 'income';

    let category = null;
    if (isDebtOwedByMe) {
      category = await Category.findOne({ name: 'Loan EMI', type: 'expense' });
    } else {
      category = await Category.findOne({ name: 'Refunds', type: 'income' });
    }

    const noteText = loan.loanType === 'debt'
      ? (isDebtOwedByMe ? `Repaid ${loan.lenderName}` : `${loan.lenderName} repaid you`)
      : `EMI payment - ${loan.lenderName}`;

    await Transaction.create({
      userId: req.user._id,
      type: transactionType,
      categoryId: category?._id,
      amount,
      date: new Date(),
      note: noteText,
      paymentMethod: 'Bank Transfer',
      extraData: { loanId: loan._id.toString() },
    });

    loan.outstandingAmount = Math.max(0, loan.outstandingAmount - amount);

    if (loan.nextDueDate) {
      const next = new Date(loan.nextDueDate);
      next.setMonth(next.getMonth() + 1);
      loan.nextDueDate = next;
    }

    if (loan.outstandingAmount <= 0) {
      loan.status = 'closed';
    }

    await loan.save();
    res.status(200).json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to process payment', error: error.message });
  }
};

const getLoansSummary = async (req, res) => {
  try {
    const activeLoans = await Loan.find({ userId: req.user._id, status: 'active' });
    const totalOwedByMe = activeLoans
      .filter((l) => l.direction === 'owed_by_me')
      .reduce((sum, l) => sum + l.outstandingAmount, 0);
    const totalOwedToMe = activeLoans
      .filter((l) => l.direction === 'owed_to_me')
      .reduce((sum, l) => sum + l.outstandingAmount, 0);

    res.status(200).json({
      totalOutstanding: totalOwedByMe, // kept for backward compatibility with existing frontend
      totalOwedByMe,
      totalOwedToMe,
      activeLoanCount: activeLoans.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch loans summary', error: error.message });
  }
};

module.exports = { getLoans, createLoan, updateLoan, deleteLoan, payEmi, getLoansSummary };