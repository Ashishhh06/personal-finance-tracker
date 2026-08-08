const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyType: {
      type: String,
      enum: ['house', 'land', 'gold', 'vehicle', 'other'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    currentEstimatedValue: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', propertySchema);