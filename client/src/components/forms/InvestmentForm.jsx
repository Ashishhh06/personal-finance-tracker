import { useState } from 'react';
import { createInvestment, updateInvestment } from '../../services/investmentService';
import Button from '../common/Button';

const TYPE_LABELS = {
  mutual_fund: 'Mutual Fund',
  stock: 'Stock',
  fd: 'Fixed Deposit',
  crypto: 'Crypto',
  bond: 'Bond',
};

const InvestmentForm = ({ existingInvestment, onSuccess, onCancel }) => {
  const [investmentType, setInvestmentType] = useState(existingInvestment?.investmentType || 'mutual_fund');
  const [name, setName] = useState(existingInvestment?.name || '');
  const [quantity, setQuantity] = useState(existingInvestment?.quantity || '');
  const [purchasePrice, setPurchasePrice] = useState(existingInvestment?.purchasePrice || '');
  const [currentPrice, setCurrentPrice] = useState(existingInvestment?.currentPrice || '');
  const [interestRate, setInterestRate] = useState(existingInvestment?.interestRate || '');
  const [maturityDate, setMaturityDate] = useState(
    existingInvestment?.maturityDate ? existingInvestment.maturityDate.slice(0, 10) : ''
  );
  const [purchaseDate, setPurchaseDate] = useState(
    existingInvestment?.purchaseDate ? existingInvestment.purchaseDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFD = investmentType === 'fd';
  const showQuantity = ['mutual_fund', 'stock', 'crypto'].includes(investmentType);
  const showCurrentPrice = ['mutual_fund', 'stock', 'crypto', 'bond'].includes(investmentType);

  const inputStyle = { width: '100%', padding: '0.5rem', marginTop: '0.25rem' };
  const groupStyle = { marginBottom: '1rem' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      investmentType,
      name,
      purchasePrice: Number(purchasePrice),
      purchaseDate,
      quantity: showQuantity ? Number(quantity) : null,
      currentPrice: showCurrentPrice ? Number(currentPrice) : null,
      interestRate: isFD ? Number(interestRate) : null,
      maturityDate: isFD ? maturityDate : null,
    };

    try {
      if (existingInvestment) {
        await updateInvestment(existingInvestment._id, payload);
      } else {
        await createInvestment(payload);
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
        <select
          value={investmentType}
          onChange={(e) => setInvestmentType(e.target.value)}
          style={inputStyle}
        >
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div style={groupStyle}>
        <label>{isFD ? 'Bank Name' : 'Name'}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isFD ? 'e.g. HDFC Bank' : 'e.g. Reliance Industries'}
          required
          style={inputStyle}
        />
      </div>

      {showQuantity && (
        <div style={groupStyle}>
          <label>Quantity / Units</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0"
            step="0.0001"
            style={inputStyle}
          />
        </div>
      )}

      <div style={groupStyle}>
        <label>{isFD ? 'Principal Amount' : 'Purchase Price (per unit)'}</label>
        <input
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          required
          min="0"
          style={inputStyle}
        />
      </div>

      {showCurrentPrice && (
        <div style={groupStyle}>
          <label>Current Price (per unit)</label>
          <input
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            min="0"
            style={inputStyle}
          />
        </div>
      )}

      {isFD && (
        <>
          <div style={groupStyle}>
            <label>Interest Rate (% per annum)</label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              min="0"
              step="0.01"
              style={inputStyle}
            />
          </div>
          <div style={groupStyle}>
            <label>Maturity Date</label>
            <input
              type="date"
              value={maturityDate}
              onChange={(e) => setMaturityDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </>
      )}

      <div style={groupStyle}>
        <label>Purchase Date</label>
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : existingInvestment ? 'Update' : 'Add'} Investment
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default InvestmentForm;