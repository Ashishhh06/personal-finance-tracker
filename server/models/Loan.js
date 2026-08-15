const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loanType: {
      type: String,
      enum: ['home', 'car', 'personal', 'education', 'debt', 'other'],
      required: true,
    },
    // For formal loans: the bank/lender. For informal debts: the person's name.
    lenderName: {
      type: String,
      required: true,
      trim: true,
    },
    // Who owes whom - relevant mainly for "debt" type (defaults to owed_by_me for bank loans)
    direction: {
      type: String,
      enum: ['owed_by_me', 'owed_to_me'],
      default: 'owed_by_me',
    },
    principalAmount: {
      type: Number,
      required: true,
    },
    outstandingAmount: {
      type: Number,
      required: true,
    },
    // Optional now - informal debts often don't have a fixed EMI
    emiAmount: {
      type: Number,
      default: null,
    },
    interestRate: {
      type: Number,
      default: 0,
    },
    tenureMonths: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    nextDueDate: {
      type: Date,
      default: null,
    },
    // Free text for context - "lent for bike repair", "borrowed for rent shortfall", etc.
    note: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loan', loanSchema);