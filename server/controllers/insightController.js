const AIInsight = require('../models/AIInsight');
const { computeSpendingAggregates } = require('../services/insightService');
const { callLLM } = require('../services/aiService');
const Transaction = require('../models/Transaction');

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

module.exports = { getInsights, generateInsight };