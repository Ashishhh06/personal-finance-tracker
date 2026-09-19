import { useState, useEffect } from 'react';
import { getCategories } from '../../services/categoryService';
import { createTransaction, updateTransaction } from '../../services/transactionService';
import Button from '../common/Button';
import { getBudgetStatus } from '../../services/budgetService';
import { autoCategorize } from '../../services/transactionService';

const TransactionForm = ({ type, existingTransaction, onSuccess, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(existingTransaction?.categoryId?._id || existingTransaction?.categoryId || '');
  const [amount, setAmount] = useState(existingTransaction?.amount || '');
  const [date, setDate] = useState(
    existingTransaction?.date ? existingTransaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState(existingTransaction?.note || '');
  const [paymentMethod, setPaymentMethod] = useState(existingTransaction?.paymentMethod || '');
  const [isRecurring, setIsRecurring] = useState(existingTransaction?.isRecurring || false);
  const [recurringFrequency, setRecurringFrequency] = useState(existingTransaction?.recurringFrequency || 'monthly');
  const [tags, setTags] = useState(existingTransaction?.tags?.join(', ') || '');
  const [extraData, setExtraData] = useState(existingTransaction?.extraData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiConfidence, setAiConfidence] = useState(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  useEffect(() => {
    getCategories(type).then((res) => setCategories(res.data));
  }, [type]);

  const selectedCategory = categories.find((c) => c._id === categoryId);
  const extraFields = selectedCategory?.extraFields || [];

  const handleExtraFieldChange = (field, value) => {
    setExtraData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
  if (type !== 'expense' || !note || note.trim().length < 3 || existingTransaction) {
    return;
  }

  const timer = setTimeout(async () => {
    setAiSuggesting(true);
    try {
      const res = await autoCategorize(note);
      if (res.data.category) {
        const matchedCategory = categories.find(
          (c) => c.name.toLowerCase() === res.data.category.toLowerCase()
        );
        if (matchedCategory) {
          setCategoryId(matchedCategory._id);
          setAiConfidence(res.data.confidence);
        }
      }
    } catch (err) {
      console.error('Auto-categorize failed:', err);
    } finally {
      setAiSuggesting(false);
    }
  }, 600);

  return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [note, type, categories]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  const payload = {
    type,
    categoryId,
    amount: Number(amount),
    date,
    note,
    paymentMethod,
    isRecurring,
    recurringFrequency: isRecurring ? recurringFrequency : null,
    tags: tags
      ? tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [],
    extraData,
  };

  // Pre-save budget check, only for new expenses (not edits, to keep this simple)
  if (type === 'expense' && categoryId && !existingTransaction) {
    try {
      const dateObj = new Date(date);
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();
      const statusRes = await getBudgetStatus(month, year);
      const matchingBudget = statusRes.data.find((b) => b.categoryId === categoryId);

      if (matchingBudget) {
        const projectedSpent = matchingBudget.actualSpent + Number(amount);
        const projectedPercent = Math.round((projectedSpent / matchingBudget.limitAmount) * 100);

        if (projectedPercent > 100) {
          const overBy = projectedPercent - 100;
          const confirmed = window.confirm(
            `This will put you ${overBy}% over your ${matchingBudget.category} budget for this month. Add anyway?`
          );
          if (!confirmed) return;
        }
      }
    } catch (err) {
      // If the budget check itself fails, don't block the user from saving - fail silently
      console.error('Budget check failed:', err);
    }
  }

  setLoading(true);
  try {
    if (existingTransaction) {
      await updateTransaction(existingTransaction._id, payload);
    } else {
      await createTransaction(payload);
    }
    onSuccess();
  } catch (err) {
    setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
        <label className={labelCls}>Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className={inputCls}
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className={groupCls}>
        <label className={labelCls}>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          className={inputCls}
        />
      </div>

      <div className={groupCls}>
        <label className={labelCls}>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className={inputCls}
        />
      </div>

      <div className={groupCls}>
        <label className={labelCls}>Note</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Swiggy dinner order"
          className={inputCls}
        />
        {aiSuggesting && (
          <p className="mt-xs text-label-sm font-label-sm text-secondary">Checking category...</p>
        )}
        {!aiSuggesting && aiConfidence !== null && aiConfidence < 50 && (
          <p className="mt-xs text-label-sm font-label-sm text-[#f59e0b]">
            AI wasn't sure — please confirm the category.
          </p>
        )}
      </div>

      <div className={groupCls}>
        <label className={labelCls}>Payment Method</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputCls}>
          <option value="">Select</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="UPI">UPI</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
      </div>


      {type === 'expense' && (
        <div className={groupCls}>
          <label className={labelCls}>Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. food, movies, trip:Goa2026"
            className={inputCls}
          />
          <p className="mt-xs text-label-sm font-label-sm text-secondary">
          Common tags: food, movies, trips, shopping
          </p>
        </div>
      )}

      {/* Dynamic extra fields based on selected category */}
      {extraFields.length > 0 && (
        <div className="mb-sm p-sm bg-surface-container-low rounded-lg">
          <p className="text-label-md font-label-md font-semibold text-on-surface mb-sm">Additional details for {selectedCategory.name}</p>
          {extraFields.map((field) => (
            <div key={field} className={groupCls}>
              <label className={`${labelCls} capitalize`}>
                {field.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type="text"
                value={extraData[field] || ''}
                onChange={(e) => handleExtraFieldChange(field, e.target.value)}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      )}

      <div className={groupCls}>
        <label className="flex items-center gap-sm text-label-md font-label-md text-on-surface cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 accent-primary-container"
          />
          Recurring
        </label>
        {isRecurring && (
          <select
            value={recurringFrequency}
            onChange={(e) => setRecurringFrequency(e.target.value)}
            className={`${inputCls} mt-sm`}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        )}
      </div>

      {error && <p className="mt-xs text-label-sm font-label-sm text-[#dc2626]">{error}</p>}

      <div className="flex gap-sm mt-md">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : existingTransaction ? 'Update' : 'Add'} {type === 'expense' ? 'Expense' : 'Income'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;