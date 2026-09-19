import { useState } from 'react';
import { createBankAccount, updateBankAccount } from '../../services/bankAccountService';
import Button from '../common/Button';

const BankAccountForm = ({ existingAccount, onSuccess, onCancel }) => {
  const [accountName, setAccountName] = useState(existingAccount?.accountName || '');
  const [accountType, setAccountType] = useState(existingAccount?.accountType || 'savings');
  const [bankName, setBankName] = useState(existingAccount?.bankName || '');
  const [currentBalance, setCurrentBalance] = useState(existingAccount?.currentBalance || '');
  const [isPrimary, setIsPrimary] = useState(existingAccount?.isPrimary || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = { accountName, accountType, bankName, currentBalance: Number(currentBalance), isPrimary };

    try {
      if (existingAccount) {
        await updateBankAccount(existingAccount._id, payload);
      } else {
        await createBankAccount(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full mt-xs px-3 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container';
  const labelCls = 'block text-label-md font-label-md text-on-surface-variant';
  const groupCls = 'mb-sm';

  return (
    <form onSubmit={handleSubmit}>
      <div className={groupCls}>
        <label className={labelCls}>Account Nickname</label>
        <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g. HDFC Main" required className={inputCls} />
      </div>
      <div className={groupCls}>
        <label className={labelCls}>Bank Name</label>
        <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" required className={inputCls} />
      </div>
      <div className={groupCls}>
        <label className={labelCls}>Account Type</label>
        <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className={inputCls}>
          <option value="savings">Savings</option>
          <option value="current">Current</option>
          <option value="emergency_fund">Emergency Fund</option>
          <option value="salary">Salary</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className={groupCls}>
        <label className={labelCls}>Current Balance</label>
        <input type="number" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} required min="0" className={inputCls} />
      </div>
      <div className={groupCls}>
        <label className="flex items-center gap-sm text-label-md font-label-md text-on-surface cursor-pointer">
          <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} className="w-4 h-4 accent-primary-container" />
          Set as primary account
        </label>
      </div>

      {error && <p className="mt-xs text-label-sm font-label-sm text-[#dc2626]">{error}</p>}

      <div className="flex gap-sm mt-md">
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : existingAccount ? 'Update' : 'Add'} Account</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export default BankAccountForm;