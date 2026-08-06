const mongoose = require('mongoose');

const savingGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    goalName: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
    },
    currentSavedAmount: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
      required: true,
    },
    monthlyContribution: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavingGoal', savingGoalSchema);