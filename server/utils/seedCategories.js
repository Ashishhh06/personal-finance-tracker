require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const expenseCategories = [
  { name: 'Rent', extraFields: ['landlordName', 'dueDate'] },
  { name: 'Loan EMI', extraFields: ['lenderName', 'loanType', 'tenureLeft'] },
  { name: 'Utilities', extraFields: [] },
  { name: 'Groceries', extraFields: [] },
  { name: 'Food & Dining', extraFields: [] },
  { name: 'Transport', extraFields: [] },
  { name: 'Subscriptions', extraFields: [] },
  { name: 'Insurance Premium', extraFields: [] },
  { name: 'Medical', extraFields: [] },
  { name: 'Education', extraFields: [] },
  { name: 'Shopping', extraFields: [] },
  { name: 'Entertainment', extraFields: [] },
  { name: 'Travel', extraFields: [] },
  { name: 'Miscellaneous', extraFields: [] },
];

const incomeCategories = [
  { name: 'Salary', extraFields: ['employerName', 'isRecurring'] },
  { name: 'Rental Income', extraFields: ['propertyName', 'tenantName'] },
  { name: 'Freelance/Business', extraFields: [] },
  { name: 'Interest/Dividends', extraFields: [] },
  { name: 'Bonus', extraFields: [] },
  { name: 'Gifts', extraFields: [] },
  { name: 'Refunds', extraFields: [] },
  { name: 'Other', extraFields: [] },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Clear existing built-in categories to avoid duplicates on re-run
    await Category.deleteMany({ isBuiltIn: true });

    const expenseDocs = expenseCategories.map((c) => ({
      ...c,
      type: 'expense',
      isBuiltIn: true,
      userId: null,
    }));

    const incomeDocs = incomeCategories.map((c) => ({
      ...c,
      type: 'income',
      isBuiltIn: true,
      userId: null,
    }));

    await Category.insertMany([...expenseDocs, ...incomeDocs]);

    console.log(`Seeded ${expenseDocs.length} expense categories and ${incomeDocs.length} income categories`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();