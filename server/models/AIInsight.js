const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['spending_trend', 'saving_tip', 'anomaly', 'summary'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedModule: {
      type: String,
      enum: ['expense', 'saving', 'budget', 'investment'],
      required: true,
    },
    periodContext: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIInsight', aiInsightSchema);