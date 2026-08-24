const Transaction = require('../models/Transaction');
const SavingGoal = require('../models/SavingGoal');
const Category = require('../models/Category');

// Computes real spending numbers via MongoDB aggregation - NO AI involved here.
// The LLM later only phrases these pre-computed numbers into natural language.
const computeSpendingAggregates = async (userId) => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const getCategoryTotals = async (start, end, type) => {
    const results = await Transaction.aggregate([
      { $match: { userId, type, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { category: { $ifNull: ['$category.name', 'Uncategorized'] }, total: 1 } },
    ]);
    const map = {};
    results.forEach((r) => { map[r.category] = r.total; });
    return map;
  };

  const thisMonthByCategory = await getCategoryTotals(thisMonthStart, thisMonthEnd, 'expense');
  const lastMonthByCategory = await getCategoryTotals(lastMonthStart, lastMonthEnd, 'expense');

  const thisMonthIncomeAgg = await Transaction.aggregate([
    { $match: { userId, type: 'income', date: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const thisMonthExpenseAgg = await Transaction.aggregate([
    { $match: { userId, type: 'expense', date: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const totalIncome = thisMonthIncomeAgg[0]?.total || 0;
  const totalExpense = thisMonthExpenseAgg[0]?.total || 0;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Anomaly detection: any single transaction > 2x that category's average over the last 3 months
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const recentExpenses = await Transaction.find({
    userId,
    type: 'expense',
    date: { $gte: threeMonthsAgo, $lte: thisMonthEnd },
  }).populate('categoryId', 'name');

  const categoryAmounts = {};
  recentExpenses.forEach((t) => {
    const catName = t.categoryId?.name || 'Uncategorized';
    if (!categoryAmounts[catName]) categoryAmounts[catName] = [];
    categoryAmounts[catName].push(t.amount);
  });

  const categoryAverages = {};
  Object.entries(categoryAmounts).forEach(([cat, amounts]) => {
    categoryAverages[cat] = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
  });

  const anomalies = recentExpenses
    .filter((t) => {
      const catName = t.categoryId?.name || 'Uncategorized';
      const avg = categoryAverages[catName];
      return avg && t.amount > avg * 2;
    })
    .map((t) => ({
      category: t.categoryId?.name || 'Uncategorized',
      amount: t.amount,
      note: t.note,
      date: t.date,
      categoryAverage: Math.round(categoryAverages[t.categoryId?.name || 'Uncategorized']),
    }))
    .slice(0, 5); // cap at 5 to keep the prompt concise

  return {
    thisMonthByCategory,
    lastMonthByCategory,
    totalIncome,
    totalExpense,
    savingsRate,
    anomalies,
  };
};



const computeGoalContext = async (userId, goalId) => {
  const goal = await SavingGoal.findOne({ _id: goalId, userId });
  if (!goal) {
    throw new Error('Goal not found');
  }

  const now = new Date();
  const deadline = new Date(goal.deadline);
  const monthsRemaining = Math.max(
    1,
    Math.round((deadline - now) / (1000 * 60 * 60 * 24 * 30))
  );

  const amountRemaining = Math.max(0, goal.targetAmount - goal.currentSavedAmount);
  const requiredMonthlySaving = Math.round(amountRemaining / monthsRemaining);

  // Actual saving rate: average of (income - expense) over the last 3 months
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const [incomeAgg, expenseAgg] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId, type: 'income', date: { $gte: threeMonthsAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { userId, type: 'expense', date: { $gte: threeMonthsAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);
  const totalIncome3mo = incomeAgg[0]?.total || 0;
  const totalExpense3mo = expenseAgg[0]?.total || 0;
  const avgMonthlySavingRate = Math.round((totalIncome3mo - totalExpense3mo) / 3);

  // Top 3 discretionary spending categories this month
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const topCategoriesAgg = await Transaction.aggregate([
    { $match: { userId, type: 'expense', date: { $gte: thisMonthStart } } },
    { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 3 },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $project: { category: { $ifNull: ['$category.name', 'Uncategorized'] }, total: 1 } },
  ]);

  return {
    goalName: goal.goalName,
    targetAmount: goal.targetAmount,
    currentSavedAmount: goal.currentSavedAmount,
    monthsRemaining,
    requiredMonthlySaving,
    avgMonthlySavingRate,
    topCategories: topCategoriesAgg,
  };
};

module.exports = { computeSpendingAggregates, computeGoalContext };
