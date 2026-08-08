const BankAccount = require('../models/BankAccount');

const getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ userId: req.user._id }).sort({ isPrimary: -1, createdAt: -1 });
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bank accounts', error: error.message });
  }
};

const createBankAccount = async (req, res) => {
  try {
    const { accountName, accountType, bankName, currentBalance, isPrimary } = req.body;

    if (!accountName || !bankName) {
      return res.status(400).json({ message: 'accountName and bankName are required' });
    }

    // If this one is marked primary, un-mark any existing primary account
    if (isPrimary) {
      await BankAccount.updateMany({ userId: req.user._id }, { isPrimary: false });
    }

    const account = await BankAccount.create({
      userId: req.user._id,
      accountName,
      accountType,
      bankName,
      currentBalance: currentBalance || 0,
      isPrimary: !!isPrimary,
    });

    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create bank account', error: error.message });
  }
};

const updateBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findOne({ _id: req.params.id, userId: req.user._id });
    if (!account) return res.status(404).json({ message: 'Bank account not found' });

    if (req.body.isPrimary === true) {
      await BankAccount.updateMany({ userId: req.user._id }, { isPrimary: false });
    }

    const updatableFields = ['accountName', 'accountType', 'bankName', 'currentBalance', 'isPrimary'];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        account[field] = req.body[field];
      }
    });

    await account.save();
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update bank account', error: error.message });
  }
};

const deleteBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findOne({ _id: req.params.id, userId: req.user._id });
    if (!account) return res.status(404).json({ message: 'Bank account not found' });

    await account.deleteOne();
    res.status(200).json({ message: 'Bank account deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete bank account', error: error.message });
  }
};

const getTotalBalance = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ userId: req.user._id });
    const total = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
    res.status(200).json({ total, accountCount: accounts.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute total balance', error: error.message });
  }
};

module.exports = { getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount, getTotalBalance };