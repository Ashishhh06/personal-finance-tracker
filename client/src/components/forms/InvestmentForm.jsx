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

  const inputCls = 'w-full mt-xs px-3 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container';
  const labelCls = 'block text-label-md font-label-md text-on-surface-variant';
  const groupCls = 'mb-sm';

  return (
    <form onSubmit={handleSubmit}>
      <div className={groupCls}>
        <label className={labelCls}>Type</label>
        <select
          value={investmentType}
          onChange={(e) => setInvestmentType(e.target.value)}
          className={inputCls}
        >
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className={groupCls}>
        <label className={labelCls}>{isFD ? 'Bank Name' : 'Name'}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isFD ? 'e.g. HDFC Bank' : 'e.g. Reliance Industries'}
          required
          className={inputCls}
        />
      </div>

      {showQuantity && (
        <div className={groupCls}>
          <label className={labelCls}>Quantity / Units</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0"
            step="0.0001"
            className={inputCls}
          />
        </div>
      )}

      <div className={groupCls}>
        <label className={labelCls}>{isFD ? 'Principal Amount' : 'Purchase Price (per unit)'}</label>
        <input
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          required
          min="0"
          className={inputCls}
        />
      </div>

      {showCurrentPrice && (
        <div className={groupCls}>
          <label className={labelCls}>Current Price (per unit)</label>
          <input
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            min="0"
            className={inputCls}
          />
        </div>
      )}

      {isFD && (
        <>
          <div className={groupCls}>
            <label className={labelCls}>Interest Rate (% per annum)</label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              min="0"
              step="0.01"
              className={inputCls}
            />
          </div>
          <div className={groupCls}>
            <label className={labelCls}>Maturity Date</label>
            <input
              type="date"
              value={maturityDate}
              onChange={(e) => setMaturityDate(e.target.value)}
              className={inputCls}
            />
          </div>
        </>
      )}

      <div className={groupCls}>
        <label className={labelCls}>Purchase Date</label>
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          required
          className={inputCls}
        />
      </div>

      {error && <p className="mt-xs text-label-sm font-label-sm text-[#dc2626]">{error}</p>}

      <div className="flex gap-sm mt-md">
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