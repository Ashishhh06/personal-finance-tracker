import { useState } from 'react';
import { createLoan, updateLoan } from '../../services/loanService';
import Button from '../common/Button';

const LoanForm = ({ existingLoan, onSuccess, onCancel }) => {
  const [loanType, setLoanType] = useState(existingLoan?.loanType || 'personal');
  const [direction, setDirection] = useState(existingLoan?.direction || 'owed_by_me');
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
  const [note, setNote] = useState(existingLoan?.note || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDebt = loanType === 'debt';

  const inputStyle = { width: '100%', padding: '0.5rem', marginTop: '0.25rem' };
  const groupStyle = { marginBottom: '1rem' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      loanType,
      direction,
      lenderName,
      principalAmount: Number(principalAmount),
      emiAmount: emiAmount ? Number(emiAmount) : null,
      interestRate: Number(interestRate) || 0,
      tenureMonths: tenureMonths ? Number(tenureMonths) : null,
      startDate,
      nextDueDate: nextDueDate || null,
      note,
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
        <label>Type</label>
        <select value={loanType} onChange={(e) => setLoanType(e.target.value)} style={inputStyle}>
          <option value="home">Home Loan</option>
          <option value="car">Car Loan</option>
          <option value="personal">Personal Loan</option>
          <option value="education">Education Loan</option>
          <option value="debt">Personal Debt (friend/family)</option>
          <option value="other">Other</option>
        </select>
      </div>

      {isDebt && (
        <div style={groupStyle}>
          <label>Direction</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value)} style={inputStyle}>
            <option value="owed_by_me">I owe them (I borrowed)</option>
            <option value="owed_to_me">They owe me (I lent)</option>
          </select>
        </div>
      )}

      <div style={groupStyle}>
        <label>{isDebt ? "Person's Name" : 'Lender Name'}</label>
        <input
          type="text"
          value={lenderName}
          onChange={(e) => setLenderName(e.target.value)}
          placeholder={isDebt ? 'e.g. Rahul' : 'e.g. ICICI Bank'}
          required
          style={inputStyle}
        />
      </div>

      <div style={groupStyle}>
        <label>{isDebt ? 'Amount' : 'Principal Amount'}</label>
        <input type="number" value={principalAmount} onChange={(e) => setPrincipalAmount(e.target.value)} required min="0" style={inputStyle} />
      </div>

      {!isDebt && (
        <div style={groupStyle}>
          <label>EMI Amount</label>
          <input type="number" value={emiAmount} onChange={(e) => setEmiAmount(e.target.value)} min="0" style={inputStyle} />
        </div>
      )}

      <div style={groupStyle}>
        <label>Interest Rate (% per annum, optional)</label>
        <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} min="0" step="0.01" style={inputStyle} />
      </div>

      {!isDebt && (
        <div style={groupStyle}>
          <label>Tenure (months)</label>
          <input type="number" value={tenureMonths} onChange={(e) => setTenureMonths(e.target.value)} min="1" style={inputStyle} />
        </div>
      )}

      <div style={groupStyle}>
        <label>Start Date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={inputStyle} />
      </div>

      {!isDebt && (
        <div style={groupStyle}>
          <label>Next Due Date</label>
          <input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} style={inputStyle} />
        </div>
      )}

      <div style={groupStyle}>
        <label>Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={isDebt ? 'e.g. lent for bike repair' : 'any additional details'}
          style={inputStyle}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : existingLoan ? 'Update' : 'Add'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export default LoanForm;