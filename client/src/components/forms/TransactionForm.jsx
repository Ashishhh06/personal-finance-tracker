import { useState, useEffect } from 'react';
import { getCategories } from '../../services/categoryService';
import { createTransaction, updateTransaction } from '../../services/transactionService';
import Button from '../common/Button';

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

  useEffect(() => {
    getCategories(type).then((res) => setCategories(res.data));
  }, [type]);

  const selectedCategory = categories.find((c) => c._id === categoryId);
  const extraFields = selectedCategory?.extraFields || [];

  const handleExtraFieldChange = (field, value) => {
    setExtraData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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

  const inputStyle = { width: '100%', padding: '0.5rem', marginTop: '0.25rem' };
  const groupStyle = { marginBottom: '1rem' };

  return (
    <form onSubmit={handleSubmit}>
      <div style={groupStyle}>
        <label>Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div style={groupStyle}>
        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          style={inputStyle}
        />
      </div>

      <div style={groupStyle}>
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      <div style={groupStyle}>
        <label>Note</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Swiggy dinner order"
          style={inputStyle}
        />
      </div>

      <div style={groupStyle}>
        <label>Payment Method</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
          <option value="">Select</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="UPI">UPI</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
      </div>


      {type === 'expense' && (
        <div style={groupStyle}>
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. food, movies, trip:Goa2026"
            style={inputStyle}
          />
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
          Common tags: food, movies, trips, shopping
          </p>
        </div>
      )}

      {/* Dynamic extra fields based on selected category */}
      {extraFields.length > 0 && (
        <div style={{ ...groupStyle, padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Additional details for {selectedCategory.name}</p>
          {extraFields.map((field) => (
            <div key={field} style={groupStyle}>
              <label style={{ textTransform: 'capitalize' }}>
                {field.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type="text"
                value={extraData[field] || ''}
                onChange={(e) => handleExtraFieldChange(field, e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      )}

      <div style={groupStyle}>
        <label>
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Recurring
        </label>
        {isRecurring && (
          <select
            value={recurringFrequency}
            onChange={(e) => setRecurringFrequency(e.target.value)}
            style={{ ...inputStyle, marginTop: '0.5rem' }}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        )}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
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