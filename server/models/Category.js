const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = system default/built-in category
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
    },
    isBuiltIn: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '',
    },
    extraFields: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);