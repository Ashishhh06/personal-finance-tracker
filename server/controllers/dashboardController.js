const Transaction = require('../models/Transaction');
const getDateRangeForPeriod = require('../utils/dateRangeHelper');

// GET /api/dashboard/summary?period=month
const getDashboardSummary = async (req, res) => {
  try {
    const { period } = req.query;
    const range = getDateRangeForPeriod(period || 'month');

    const baseFilter = {
      userId: req.user._id,
      date: { $gte: range.startDate, $lte: range.endDate },
    };

    // Get all expense + income transactions for this period
    const [expenses, incomes] = await Promise.all([
      Transaction.find({ ...baseFilter, type: 'expense' }).populate('categoryId', 'name icon'),
      Transaction.find({ ...baseFilter, type: 'income' }).populate('categoryId', 'name icon'),
    ]);

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpense;

    // Spending by category (expenses only)
    const categoryTotals = {};
    expenses.forEach((t) => {
      const catName = t.categoryId?.name || 'Uncategorized';
      categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
    });
    const spendingByCategory = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Recent transactions (both types, most recent first, across ALL time not just this period)
    const recentTransactions = await Transaction.find({ userId: req.user._id })
      .populate('categoryId', 'name icon')
      .sort({ date: -1 })
      .limit(8);

    res.status(200).json({
      stats: {
        totalIncome,
        totalExpense,
        netSavings,
      },
      spendingByCategory,
      recentTransactions,
      // Placeholders for future steps - structured now so frontend doesn't need rework later
      budgetHighlights: [],
      activeGoals: [],
      netWorth: null,
      latestInsight: null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard summary', error: error.message });
  }
};

module.exports = { getDashboardSummary };