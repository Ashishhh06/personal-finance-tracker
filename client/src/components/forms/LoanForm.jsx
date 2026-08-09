import { useState } from 'react';
import { createLoan, updateLoan } from '../../services/loanService';
import Button from '../common/Button';

const LoanForm = ({ existingLoan, onSuccess, onCancel }) => {
  const [loanType, setLoanType] = useState(existingLoan?.loanType || 'personal');
  const [lenderName, setLenderName] = useState(existingLoan?.lenderName || '');
  const [principalAmount, setPrincipalAmount] = useState(existingLoan?.principalAmount || '');
  const [emiAmount, setEmiAmount] = useState(existingLoan?.emiAmount || '');
  const [interestRate, setInterestRate] = useState(existingLoan?.interestRate || '');
  const [tenureMonths, setTenureMonths] = useState(existingLoan?.tenureMonths || '');
  const [startDate, setStartDate] = useState(
    existingLoan?.startDate ? existingLoan.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [nextDueDate, setNextDueDate] = useState(
    existingLoan?.nextDueDate ? existingLoan.nextDueDate.slice(0, 10) : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = { width: '100%', padding: '0.5rem', marginTop: '0.25rem' };
  const groupStyle = { marginBottom: '1rem' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      loanType,
      lenderName,
      principalAmount: Number(principalAmount),
      emiAmount: Number(emiAmount),
      interestRate: Number(interestRate) || 0,
      tenureMonths: Number(tenureMonths),
      startDate,
      nextDueDate,
    };

    try {
      if (existingLoan) {
        await updateLoan(existingLoan._id, payload);
      } else {
        await createLoan(payload);
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
        <label>Loan Type</label>
        <select value={loanType} onChange={(e) => setLoanType(e.target.value)} style={inputStyle}>
          <option value="home">Home</option>
          <option value="car">Car</option>
          <option value="personal">Personal</option>
          <option value="education">Education</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div style={groupStyle}>
        <label>Lender Name</label>
        <input type="text" value={lenderName} onChange={(e) => setLenderName(e.target.value)} placeholder="e.g. ICICI Bank" required style={inputStyle} />
      </div>
      <div style={groupStyle}>
        <label>Principal Amount</label>
        <input type="number" value={principalAmount} onChange={(e) => setPrincipalAmount(e.target.value)} required min="0" style={inputStyle} />
      </div>
      <div style={groupStyle}>
        <label>EMI Amount</label>
        <input type="number" value={emiAmount} onChange={(e) => setEmiAmount(e.target.value)} required min="0" style={inputStyle} />
      </div>
      <div style={groupStyle}>
        <label>Interest Rate (% per annum)</label>
        <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} min="0" step="0.01" style={inputStyle} />
      </div>
      <div style={groupStyle}>
        <label>Tenure (months)</label>
        <input type="number" value={tenureMonths} onChange={(e) => setTenureMonths(e.target.value)} required min="1" style={inputStyle} />
      </div>
      <div style={groupStyle}>
        <label>Start Date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={inputStyle} />
      </div>
      <div style={groupStyle}>
        <label>Next Due Date</label>
        <input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} required style={inputStyle} />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : existingLoan ? 'Update' : 'Add'} Loan</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export default LoanForm;