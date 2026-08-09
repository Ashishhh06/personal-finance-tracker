const { computeNetWorth } = require('../services/netWorthService');

const getNetWorth = async (req, res) => {
  try {
    const result = await computeNetWorth(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute net worth', error: error.message });
  }
};

module.exports = { getNetWorth };