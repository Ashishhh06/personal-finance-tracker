const SavingGoal = require('../models/SavingGoal');
const Transaction = require('../models/Transaction');

// GET /api/goals
const getGoals = async (req, res) => {
  try {
    const goals = await SavingGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch goals', error: error.message });
  }
};

// GET /api/goals/:id
const getGoalById = async (req, res) => {
  try {
    const goal = await SavingGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch goal', error: error.message });
  }
};

// POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { goalName, targetAmount, currentSavedAmount, deadline, monthlyContribution } = req.body;

    if (!goalName || !targetAmount || !deadline) {
      return res.status(400).json({ message: 'goalName, targetAmount, and deadline are required' });
    }

    const goal = await SavingGoal.create({
      userId: req.user._id,
      goalName,
      targetAmount,
      currentSavedAmount: currentSavedAmount || 0,
      deadline,
      monthlyContribution: monthlyContribution || 0,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create goal', error: error.message });
  }
};

// PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await SavingGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const updatableFields = ['goalName', 'targetAmount', 'currentSavedAmount', 'deadline', 'monthlyContribution', 'status'];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        goal[field] = req.body[field];
      }
    });

    // Auto-mark as completed if saved amount reaches target
    if (goal.currentSavedAmount >= goal.targetAmount && goal.status === 'active') {
      goal.status = 'completed';
    }

    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update goal', error: error.message });
  }
};

// DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const goal = await SavingGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    await goal.deleteOne();
    res.status(200).json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete goal', error: error.message });
  }
};

// GET /api/goals/summary
// Computes current total savings LIVE from transaction data (never stored, always accurate)
// GET /api/goals/summary
const getGoalsSummary = async (req, res) => {
  try {
    const [incomeAgg, expenseAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpense = expenseAgg[0]?.total || 0;
    const currentTotalSavings = totalIncome - totalExpense;

    const addProgress = (goal) => ({
      ...goal.toObject(),
      progressPercent: goal.targetAmount > 0
        ? Math.min(100, Math.round((goal.currentSavedAmount / goal.targetAmount) * 100))
        : 0,
    });

    const [activeGoalsRaw, completedGoalsRaw] = await Promise.all([
      SavingGoal.find({ userId: req.user._id, status: 'active' }).sort({ deadline: 1 }),
      SavingGoal.find({ userId: req.user._id, status: 'completed' }).sort({ updatedAt: -1 }),
    ]);

    res.status(200).json({
      currentTotalSavings,
      totalIncome,
      totalExpense,
      activeGoals: activeGoalsRaw.map(addProgress),
      completedGoals: completedGoalsRaw.map(addProgress),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch goals summary', error: error.message });
  }
};

module.exports = { getGoals, getGoalById, createGoal, updateGoal, deleteGoal, getGoalsSummary };