const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ['savings', 'current', 'emergency_fund', 'salary', 'other'],
      default: 'savings',
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BankAccount', bankAccountSchema);