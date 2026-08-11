const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { userId: req.user._id };
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const budgets = await Budget.find(filter).populate('categoryId', 'name icon');
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch budgets', error: error.message });
  }
};

const createBudget = async (req, res) => {
  try {
    const { categoryId, limitAmount, period, month, year } = req.body;

    if (!categoryId || !limitAmount || !month || !year) {
      return res.status(400).json({ message: 'categoryId, limitAmount, month, and year are required' });
    }

    const budget = await Budget.create({
      userId: req.user._id,
      categoryId,
      limitAmount,
      period: period || 'monthly',
      month,
      year,
    });

    res.status(201).json(budget);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A budget for this category and month already exists. Edit it instead.' });
    }
    res.status(500).json({ message: 'Failed to create budget', error: error.message });
  }
};

const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    const updatableFields = ['limitAmount', 'period'];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        budget[field] = req.body[field];
      }
    });

    await budget.save();
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update budget', error: error.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    await budget.deleteOne();
    res.status(200).json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete budget', error: error.message });
  }
};

// GET /api/budgets/status?month=&year=
const getBudgetStatus = async (req, res) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const budgets = await Budget.find({ userId: req.user._id, month, year }).populate('categoryId', 'name icon');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const results = await Promise.all(
      budgets.map(async (budget) => {
        const spentAgg = await Transaction.aggregate([
          {
            $match: {
              userId: req.user._id,
              type: 'expense',
              categoryId: budget.categoryId._id,
              date: { $gte: startDate, $lte: endDate },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const actualSpent = spentAgg[0]?.total || 0;
        const percentUsed = budget.limitAmount > 0 ? Math.round((actualSpent / budget.limitAmount) * 100) : 0;

        let status = 'green';
        if (percentUsed >= 90) status = 'red';
        else if (percentUsed >= 70) status = 'yellow';

        return {
          budgetId: budget._id,
          category: budget.categoryId.name,
          categoryId: budget.categoryId._id,
          limitAmount: budget.limitAmount,
          actualSpent,
          percentUsed,
          status,
        };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch budget status', error: error.message });
  }
};

// GET /api/budgets/history?months=6
const getBudgetHistory = async (req, res) => {
  try {
    const monthsBack = Number(req.query.months) || 6;
    const now = new Date();
    const history = [];

    for (let i = 0; i < monthsBack; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = targetDate.getMonth() + 1;
      const year = targetDate.getFullYear();

      const budgets = await Budget.find({ userId: req.user._id, month, year });
      const totalBudgeted = budgets.reduce((sum, b) => sum + b.limitAmount, 0);

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const spentAgg = await Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      history.unshift({
        month,
        year,
        label: targetDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        totalBudgeted,
        totalSpent: spentAgg[0]?.total || 0,
      });
    }

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch budget history', error: error.message });
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget, getBudgetStatus, getBudgetHistory };