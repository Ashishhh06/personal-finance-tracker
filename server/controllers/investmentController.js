const Investment = require('../models/Investment');

// GET /api/investments?type=mutual_fund|stock|fd|crypto|bond
const getInvestments = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.investmentType = type;

    const investments = await Investment.find(filter).sort({ purchaseDate: -1 });
    res.status(200).json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch investments', error: error.message });
  }
};

// GET /api/investments/:id
const getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    res.status(200).json(investment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch investment', error: error.message });
  }
};

// POST /api/investments
const createInvestment = async (req, res) => {
  try {
    const {
      investmentType, name, quantity, purchasePrice, currentPrice,
      interestRate, maturityDate, purchaseDate,
    } = req.body;

    if (!investmentType || !name || !purchasePrice || !purchaseDate) {
      return res.status(400).json({ message: 'investmentType, name, purchasePrice, and purchaseDate are required' });
    }

    const investment = await Investment.create({
      userId: req.user._id,
      investmentType,
      name,
      quantity: quantity || null,
      purchasePrice,
      currentPrice: currentPrice || null,
      interestRate: interestRate || null,
      maturityDate: maturityDate || null,
      purchaseDate,
    });

    res.status(201).json(investment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create investment', error: error.message });
  }
};

// PUT /api/investments/:id
const updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!investment) return res.status(404).json({ message: 'Investment not found' });

    const updatableFields = [
      'investmentType', 'name', 'quantity', 'purchasePrice', 'currentPrice',
      'interestRate', 'maturityDate', 'purchaseDate',
    ];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        investment[field] = req.body[field];
      }
    });

    await investment.save();
    res.status(200).json(investment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update investment', error: error.message });
  }
};

// DELETE /api/investments/:id
const deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!investment) return res.status(404).json({ message: 'Investment not found' });

    await investment.deleteOne();
    res.status(200).json({ message: 'Investment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete investment', error: error.message });
  }
};









// GET /api/investments/summary
const getInvestmentSummary = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id });

    let totalInvested = 0;
    let totalCurrentValue = 0;
    const allocationMap = {};

    investments.forEach((inv) => {
      let invested = 0;
      let currentValue = 0;

      if (inv.investmentType === 'fd') {
        invested = inv.purchasePrice;
        // Simple approximation: linear accrued interest based on time elapsed since purchase
        const now = new Date();
        const yearsElapsed = (now - inv.purchaseDate) / (1000 * 60 * 60 * 24 * 365);
        const rate = inv.interestRate || 0;
        currentValue = inv.purchasePrice * (1 + (rate / 100) * Math.max(0, yearsElapsed));
      } else {
        const qty = inv.quantity || 0;
        invested = inv.purchasePrice * qty;
        currentValue = (inv.currentPrice ?? inv.purchasePrice) * qty;
      }

      totalInvested += invested;
      totalCurrentValue += currentValue;

      const typeLabel = inv.investmentType;
      allocationMap[typeLabel] = (allocationMap[typeLabel] || 0) + currentValue;
    });

    const overallReturnPercent = totalInvested > 0
      ? Math.round(((totalCurrentValue - totalInvested) / totalInvested) * 10000) / 100
      : 0;

    const allocationBreakdown = Object.entries(allocationMap).map(([type, value]) => ({
      type,
      value: Math.round(value * 100) / 100,
    }));

    res.status(200).json({
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
      overallReturnPercent,
      allocationBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch investment summary', error: error.message });
  }
};


module.exports = { getInvestments, getInvestmentById, createInvestment, updateInvestment, deleteInvestment, getInvestmentSummary };