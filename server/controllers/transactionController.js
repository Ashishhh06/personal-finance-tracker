const Transaction = require('../models/Transaction');
const getDateRangeForPeriod = require('../utils/dateRangeHelper');
const { callLLM } = require('../services/aiService');
const { matchKeyword } = require('../utils/keywordCategoryMap');
const Category = require('../models/Category');

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


// POST /api/transactions/auto-categorize
const autoCategorize = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || note.trim().length < 2) {
      return res.status(200).json({ category: null, confidence: 0, source: 'none' });
    }

    const keywordMatch = matchKeyword(note);
    if (keywordMatch) {
      return res.status(200).json({ category: keywordMatch, confidence: 90, source: 'keyword' });
    }

    const categories = await Category.find({
      type: 'expense',
      $or: [{ userId: null }, { userId: req.user._id }],
    });
    const categoryNames = categories.map((c) => c.name);

    const systemPrompt = `You are a transaction categorization assistant. Given a transaction note/merchant name and a list of available categories, return ONLY a JSON object with this exact format, nothing else, no markdown, no explanation:
{"category": "<best matching category from the list>", "confidence": <0-100>}
If nothing matches well, return {"category": "Miscellaneous", "confidence": 0}`;

    const userPrompt = `Transaction note: "${note}"\nAvailable categories: ${categoryNames.join(', ')}`;

    const llmResponse = await callLLM(systemPrompt, userPrompt);

    let parsed;
    try {
      const cleaned = llmResponse.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return res.status(200).json({ category: 'Miscellaneous', confidence: 0, source: 'ai_parse_failed' });
    }

    return res.status(200).json({
      category: parsed.category || 'Miscellaneous',
      confidence: parsed.confidence ?? 0,
      source: 'ai',
    });
  } catch (error) {
    console.error('Auto-categorize failed:', error.message);
    return res.status(200).json({ category: null, confidence: 0, source: 'error' });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  autoCategorize,
};
