import { useState, useEffect } from 'react';
import { getTransactions, deleteTransaction } from '../../services/transactionService';
import { getRangeForPeriod } from '../../utils/dateHelpers';
import TimePeriodSelector from '../../components/common/TimePeriodSelector';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import TransactionForm from '../../components/forms/TransactionForm';
import ErrorState from '../../components/common/ErrorState';

const IncomeList = () => {
  const [period, setPeriod] = useState('month');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchTransactions = async () => {
  setLoading(true);
  setError(false);
  try {
    const { startDate, endDate } = getRangeForPeriod(period);
    const res = await getTransactions({
      type: 'income',
      startDate,
      endDate,
      search: search || undefined,
    });
    setTransactions(res.data);
  } catch (err) {
    console.error(err);
    setError(true);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income entry?')) return;
    await deleteTransaction(id);
    fetchTransactions();
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchTransactions();
  };

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1>Income</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="secondary" onClick={() => window.location.href = '/income/compare'}>
                    Income vs Expense
                </Button>
                <Button onClick={handleAdd}>+ Add Income</Button>
            </div>
        </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <TimePeriodSelector value={period} onChange={setPeriod} />
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.5rem' }}
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <Card style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Total for this period</p>
        <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#16a34a' }}>₹{total.toLocaleString()}</p>
      </Card>

      {loading ? (
      <Spinner />
        ) : error ? (
          <ErrorState onRetry={fetchTransactions} />
        ) : transactions.length === 0 ? (
          <EmptyState message="No income entries found for this period." actionLabel="Add your first income" onAction={handleAdd} />
        ) : (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.5rem' }}>Date</th>
                <th style={{ padding: '0.5rem' }}>Source</th>
                <th style={{ padding: '0.5rem' }}>Note</th>
                <th style={{ padding: '0.5rem' }}>Payment</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '0.5rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem' }}>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.5rem' }}>{t.categoryId?.name || '-'}</td>
                  <td style={{ padding: '0.5rem' }}>{t.note}</td>
                  <td style={{ padding: '0.5rem' }}>{t.paymentMethod}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', color: '#16a34a' }}>₹{t.amount.toLocaleString()}</td>
                  <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <Button variant="secondary" onClick={() => handleEdit(t)}>Edit</Button>
                    <Button variant="danger" onClick={() => handleDelete(t._id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? 'Edit Income' : 'Add Income'}
      >
        <TransactionForm
          type="income"
          existingTransaction={editingTransaction}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default IncomeList;