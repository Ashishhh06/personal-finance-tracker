const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    investmentType: {
      type: String,
      enum: ['mutual_fund', 'stock', 'fd', 'crypto', 'bond'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: null,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      default: null,
    },
    interestRate: {
      type: Number,
      default: null,
    },
    maturityDate: {
      type: Date,
      default: null,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Investment', investmentSchema);