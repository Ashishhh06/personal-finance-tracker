import { useState, useEffect } from 'react';
import { getCategories } from '../../services/categoryService';
import { createBudget } from '../../services/budgetService';
import Button from '../common/Button';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const BudgetForm = ({ month, year, onSuccess, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories('expense').then((res) => setCategories(res.data));
  }, []);

  const inputStyle = { width: '100%', padding: '0.5rem', marginTop: '0.25rem' };
  const groupStyle = { marginBottom: '1rem' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createBudget({ categoryId, limitAmount: Number(limitAmount), month, year });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        Setting budget for {MONTH_NAMES[month - 1]} {year}
      </p>
      <div style={groupStyle}>
        <label>Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required style={inputStyle}>
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div style={groupStyle}>
        <label>Monthly Limit</label>
        <input type="number" value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)} required min="0" style={inputStyle} />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Set Budget'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export default BudgetForm;