const BankAccount = require('../models/BankAccount');
const Investment = require('../models/Investment');
const Property = require('../models/Property');
const Loan = require('../models/Loan');

const computeNetWorth = async (userId) => {
  const [bankAccounts, investments, properties, loans] = await Promise.all([
    BankAccount.find({ userId }),
    Investment.find({ userId }),
    Property.find({ userId }),
    Loan.find({ userId, status: 'active' }),
  ]);

  const bankTotal = bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  const investmentTotal = investments.reduce((sum, inv) => {
    if (inv.investmentType === 'fd') {
      const now = new Date();
      const yearsElapsed = (now - inv.purchaseDate) / (1000 * 60 * 60 * 24 * 365);
      const rate = inv.interestRate || 0;
      const currentValue = inv.purchasePrice * (1 + (rate / 100) * Math.max(0, yearsElapsed));
      return sum + currentValue;
    }
    const qty = inv.quantity || 0;
    const currentValue = (inv.currentPrice ?? inv.purchasePrice) * qty;
    return sum + currentValue;
  }, 0);

  const propertyTotal = properties.reduce((sum, p) => sum + p.currentEstimatedValue, 0);

  // Loans owed BY me are liabilities; loans owed TO me (money others owe me) are assets (receivables)
  const loanLiabilityTotal = loans
    .filter((l) => l.direction !== 'owed_to_me')
    .reduce((sum, l) => sum + l.outstandingAmount, 0);
  const receivablesTotal = loans
    .filter((l) => l.direction === 'owed_to_me')
    .reduce((sum, l) => sum + l.outstandingAmount, 0);

  const netWorth = bankTotal + investmentTotal + propertyTotal + receivablesTotal - loanLiabilityTotal;

  return {
    netWorth: Math.round(netWorth * 100) / 100,
    breakdown: {
      bankTotal: Math.round(bankTotal * 100) / 100,
      investmentTotal: Math.round(investmentTotal * 100) / 100,
      propertyTotal: Math.round(propertyTotal * 100) / 100,
      receivablesTotal: Math.round(receivablesTotal * 100) / 100,
      loanTotal: Math.round(loanLiabilityTotal * 100) / 100,
    },
  };
};

module.exports = { computeNetWorth };