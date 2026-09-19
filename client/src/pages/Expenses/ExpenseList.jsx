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

const ExpenseList = () => {
  const [period, setPeriod] = useState('month');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [error, setError] = useState(false);

  const fetchTransactions = async () => {
  setLoading(true);
  setError(false);
  try {
    const { startDate, endDate } = getRangeForPeriod(period);
    const res = await getTransactions({
      type: 'expense',
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
    if (!window.confirm('Delete this expense?')) return;
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
      {/* Page header */}
      <div className="flex flex-wrap justify-between items-center gap-sm mb-md">
        <h1 className="text-headline-lg font-headline-lg text-on-surface">Expenses</h1>
        <Button onClick={handleAdd}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Expense
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap justify-between items-center gap-sm mb-md">
        <TimePeriodSelector value={period} onChange={setPeriod} />
        <form onSubmit={handleSearchSubmit} className="flex gap-sm items-center">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-secondary text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 border border-outline-variant rounded-lg text-label-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      {/* Summary card */}
      <Card className="mb-md">
        <p className="text-label-md font-label-md text-secondary">Total for this period</p>
        <p className="text-stat-lg font-stat-lg text-[#dc2626]">₹{total.toLocaleString()}</p>
      </Card>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState onRetry={fetchTransactions} />
      ) : transactions.length === 0 ? (
        <EmptyState message="No expenses found for this period." actionLabel="Add your first expense" onAction={handleAdd} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-body-md font-body-md">
              <thead>
                <tr className="border-b border-surface-container-high">
                  <th className="px-sm py-2 text-left text-label-sm font-label-sm text-secondary">Date</th>
                  <th className="px-sm py-2 text-left text-label-sm font-label-sm text-secondary">Category</th>
                  <th className="px-sm py-2 text-left text-label-sm font-label-sm text-secondary">Note</th>
                  <th className="px-sm py-2 text-left text-label-sm font-label-sm text-secondary">Payment</th>
                  <th className="px-sm py-2 text-right text-label-sm font-label-sm text-secondary">Amount</th>
                  <th className="px-sm py-2"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id} className="border-b border-surface-container-low hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-sm py-3 text-label-md font-label-md text-secondary whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-sm py-3 text-on-surface">{t.categoryId?.name || '-'}</td>
                    <td className="px-sm py-3 text-on-surface">{t.note}</td>
                    <td className="px-sm py-3 text-on-surface">{t.paymentMethod}</td>
                    <td className="px-sm py-3 text-right font-semibold text-[#dc2626]">₹{t.amount.toLocaleString()}</td>
                    <td className="px-sm py-3">
                      <div className="flex gap-xs">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1 rounded-lg text-secondary hover:text-primary-container hover:bg-primary-fixed/20 transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="p-1 rounded-lg text-secondary hover:text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? 'Edit Expense' : 'Add Expense'}
      >
        <TransactionForm
          type="expense"
          existingTransaction={editingTransaction}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ExpenseList;