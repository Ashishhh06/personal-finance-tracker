const Transaction = require('../models/Transaction');
const getDateRangeForPeriod = require('../utils/dateRangeHelper');

// GET /api/transactions?type=&period=&category=&tags=&search=&startDate=&endDate=
const getTransactions = async (req, res) => {
  try {
    const { type, period, category, tags, search, startDate, endDate } = req.query;

    const filter = { userId: req.user._id };

    if (type) filter.type = type;
    if (category) filter.categoryId = category;

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim());
      filter.tags = { $in: tagList };
    }

    if (search) {
      filter.note = { $regex: search, $options: 'i' };
    }

    // Date range: explicit startDate/endDate takes priority, else use period
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (period) {
      const range = getDateRangeForPeriod(period);
      filter.date = { $gte: range.startDate, $lte: range.endDate };
    }

    const transactions = await Transaction.find(filter)
      .populate('categoryId', 'name icon')
      .sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
};

// GET /api/transactions/:id
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('categoryId', 'name icon');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transaction', error: error.message });
  }
};

// POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const {
      type,
      categoryId,
      amount,
      date,
      note,
      paymentMethod,
      isRecurring,
      recurringFrequency,
      tags,
      extraData,
      aiCategoryConfidence,
    } = req.body;

    if (!type || !amount || !date) {
      return res.status(400).json({ message: 'type, amount, and date are required' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      categoryId,
      amount,
      date,
      note,
      paymentMethod,
      isRecurring,
      recurringFrequency,
      tags,
      extraData,
      aiCategoryConfidence,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create transaction', error: error.message });
  }
};

// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const updatableFields = [
      'type', 'categoryId', 'amount', 'date', 'note', 'paymentMethod',
      'isRecurring', 'recurringFrequency', 'tags', 'extraData', 'aiCategoryConfidence',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        transaction[field] = req.body[field];
      }
    });

    await transaction.save();
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update transaction', error: error.message });
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.deleteOne();
    res.status(200).json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction', error: error.message });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};