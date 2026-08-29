const AIInsight = require('../models/AIInsight');
const { computeSpendingAggregates, computeGoalContext } = require('../services/insightService');
const { callLLM } = require('../services/aiService');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const getDateRangeForPeriod = require('../utils/dateRangeHelper');


// GET /api/insights?module=expense|saving|budget|investment
const getInsights = async (req, res) => {
  try {
    const { module } = req.query;
    const filter = { userId: req.user._id };
    if (module) filter.relatedModule = module;

    const insights = await AIInsight.find(filter).sort({ createdAt: -1 }).limit(10);
    res.status(200).json(insights);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch insights', error: error.message });
  }
};

// POST /api/insights/generate
const generateInsight = async (req, res) => {
  try {
    const aggregates = await computeSpendingAggregates(req.user._id);

    const systemPrompt = `You are a financial insights assistant. Given spending data, write 2-3 short, friendly, actionable insights in plain English. Be specific with numbers from the data provided. Interpret the data, don't just repeat it verbatim. Keep the total response under 100 words. Do not invent any numbers not present in the data.`;

    const userPrompt = `This month's spending by category: ${JSON.stringify(aggregates.thisMonthByCategory)}
Last month's spending by category: ${JSON.stringify(aggregates.lastMonthByCategory)}
Total income this month: ₹${aggregates.totalIncome}
Total expense this month: ₹${aggregates.totalExpense}
Savings rate this month: ${aggregates.savingsRate}%
Unusual transactions flagged (amount significantly above that category's recent average): ${JSON.stringify(aggregates.anomalies)}`;

    let message;
    try {
      message = await callLLM(systemPrompt, userPrompt);
    } catch (llmError) {
      return res.status(200).json({
        message: 'Insights are temporarily unavailable. Please try again in a moment.',
        generated: false,
      });
    }

    const insight = await AIInsight.create({
      userId: req.user._id,
      type: 'summary',
      message,
      relatedModule: 'expense',
      periodContext: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
    });

    res.status(201).json(insight);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate insight', error: error.message });
  }
};


// POST /api/insights/goals/:goalId/generate
const generateGoalInsight = async (req, res) => {
  try {
    const { goalId } = req.params;
    let context;
    try {
      context = await computeGoalContext(req.user._id, goalId);
    } catch (err) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const systemPrompt = `You are a financial coach. Given a savings goal and the user's real spending/saving data, suggest 1-2 realistic, specific ways to help them hit their goal on time. Reference actual numbers and categories from the data. Keep it under 60 words and always end with a complete sentence. Be encouraging but honest. Do not invent any numbers not present in the data.`;

    const userPrompt = `Goal: "${context.goalName}"
    Target amount: ₹${context.targetAmount}
    Currently saved: ₹${context.currentSavedAmount}
    Months remaining until deadline: ${context.monthsRemaining}
    Required monthly saving to hit the goal: ₹${context.requiredMonthlySaving}
    User's actual average monthly saving rate (last 3 months): ₹${context.avgMonthlySavingRate}
    Top 3 discretionary spending categories this month: ${JSON.stringify(context.topCategories)}`;

    let message;
    try {
      message = await callLLM(systemPrompt, userPrompt);
    } catch (llmError) {
      return res.status(200).json({
        message: 'Saving tips are temporarily unavailable. Please try again in a moment.',
        generated: false,
      });
    }

    const insight = await AIInsight.create({
      userId: req.user._id,
      type: 'saving_tip',
      message,
      relatedModule: 'saving',
      periodContext: goalId,
    });

    res.status(201).json(insight);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate goal insight', error: error.message });
  }
};




// POST /api/insights/ask
const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length < 3) {
      return res.status(400).json({ message: 'Please provide a question' });
    }

    // STEP 1: LLM parses the question into structured filters (no numbers generated here)
        const parsePrompt = `Convert the user's question into a JSON filter object with this exact structure, nothing else, no markdown, no explanation:
    {"type": "expense" | "income" | "both", "category": "<category name or null>", "period": "day" | "week" | "month" | "year" | "custom", "startDate": "<ISO date or null>", "endDate": "<ISO date or null>", "aggregation": "sum" | "average" | "count" | "comparison"}
    Today's date is ${new Date().toISOString()}.`;

    let filters;
    try {
      const filterResponse = await callLLM(parsePrompt, `Question: "${question}"`);
      const cleaned = filterResponse.replace(/```json|```/g, '').trim();
      filters = JSON.parse(cleaned);
    } catch (err) {
      return res.status(200).json({
        answer: "I couldn't understand that question. Try asking something like 'How much did I spend on food last month?'",
      });
    }

    // STEP 2: Run a REAL MongoDB query using those filters - this is where actual numbers come from
    const now = new Date();
    let startDate, endDate;

    if (filters.period === 'custom' && filters.startDate && filters.endDate) {
      startDate = new Date(filters.startDate);
      endDate = new Date(filters.endDate);
    } else {
      const range = getDateRangeForPeriod(filters.period || 'month');
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const matchStage = {
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    };

    if (filters.type && filters.type !== 'both') {
      matchStage.type = filters.type;
    }

   if (filters.category) {
  const category = await Category.findOne({
    name: { $regex: new RegExp(filters.category, 'i') },
  });
  if (category) {
    matchStage.categoryId = category._id;
  } else {
    // Category mentioned but not found - don't silently sum everything, return 0 instead
    matchStage.categoryId = null;
  }
}

    let queryResult;
    if (filters.aggregation === 'count') {
      const count = await Transaction.countDocuments(matchStage);
      queryResult = { count };
    } else if (filters.aggregation === 'average') {
      const agg = await Transaction.aggregate([
        { $match: matchStage },
        { $group: { _id: null, average: { $avg: '$amount' }, count: { $sum: 1 } } },
      ]);
      queryResult = { average: Math.round(agg[0]?.average || 0), transactionCount: agg[0]?.count || 0 };
    } else {
      // default: sum
      const agg = await Transaction.aggregate([
        { $match: matchStage },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      queryResult = { total: agg[0]?.total || 0, transactionCount: await Transaction.countDocuments(matchStage) };
    }

    // STEP 3: LLM phrases the REAL result into a natural sentence - it does not invent any numbers
   const answerPrompt = `Given the user's original question and the real data result, answer in one clear, friendly sentence with the actual number included. If the number represents a money amount, format it in Indian Rupees using the ₹ symbol (e.g. ₹1,200). If the number is a count of transactions, state it as a plain number with no currency symbol (e.g. "3 transactions"). Do not add any numbers not present in the data result.`;
    const answerUserPrompt = `Question: "${question}"\nData result: ${JSON.stringify(queryResult)}\nFilters used: ${JSON.stringify(filters)}`;

    let answer;
    try {
      answer = await callLLM(answerPrompt, answerUserPrompt);
    } catch (err) {
      // Fallback: construct a basic answer directly from the real data if the LLM phrasing step fails
      answer = `Result: ${JSON.stringify(queryResult)}`;
    }

    res.status(200).json({ answer, filters, queryResult });
  } catch (error) {
    res.status(500).json({ message: 'Failed to answer question', error: error.message });
  }
};

module.exports = { getInsights, generateInsight, generateGoalInsight, askQuestion };
