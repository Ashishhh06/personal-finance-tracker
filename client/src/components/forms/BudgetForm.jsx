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

  const inputCls = 'w-full mt-xs px-3 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container';
  const labelCls = 'block text-label-md font-label-md text-on-surface-variant';
  const groupCls = 'mb-sm';

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-label-md font-label-md text-secondary mb-sm">
        Setting budget for {MONTH_NAMES[month - 1]} {year}
      </p>
      <div className={groupCls}>
        <label className={labelCls}>Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className={inputCls}>
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className={groupCls}>
        <label className={labelCls}>Monthly Limit</label>
        <input type="number" value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)} required min="0" className={inputCls} />
      </div>

      {error && <p className="mt-xs text-label-sm font-label-sm text-[#dc2626]">{error}</p>}

      <div className="flex gap-sm mt-md">
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Set Budget'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export default BudgetForm;