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

  const inputStyle = { width: '100%', padding: '0.5rem', marginTop: '0.25rem' };
  const groupStyle = { marginBottom: '1rem' };

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

  return (
    <form onSubmit={handleSubmit}>
      <div style={groupStyle}>
        <label>Account Nickname</label>
        <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g. HDFC Main" required style={inputStyle} />
      </div>
      <div style={groupStyle}>
        <label>Bank Name</label>
        <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" required style={inputStyle} />
      </div>
      <div style={groupStyle}>
        <label>Account Type</label>
        <select value={accountType} onChange={(e) => setAccountType(e.target.value)} style={inputStyle}>
          <option value="savings">Savings</option>
          <option value="current">Current</option>
          <option value="emergency_fund">Emergency Fund</option>
          <option value="salary">Salary</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div style={groupStyle}>
        <label>Current Balance</label>
        <input type="number" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} required min="0" style={inputStyle} />
      </div>
      <div style={groupStyle}>
        <label>
          <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} style={{ marginRight: '0.5rem' }} />
          Set as primary account
        </label>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : existingAccount ? 'Update' : 'Add'} Account</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export default BankAccountForm;