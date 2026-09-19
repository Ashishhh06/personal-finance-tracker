import { useState, useEffect } from 'react';
import { getBudgetStatus, deleteBudget } from '../../services/budgetService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import BudgetForm from '../../components/forms/BudgetForm';

const STATUS_BG = { green: 'bg-[#16a34a]', yellow: 'bg-[#f59e0b]', red: 'bg-[#dc2626]' };
const STATUS_TEXT = { green: 'text-[#16a34a]', yellow: 'text-[#f59e0b]', red: 'text-[#dc2626]' };
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const BudgetOverview = () => {
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getBudgetStatus(month, year);
      setStatuses(res.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleAdd = () => setIsModalOpen(true);
  const handleSuccess = () => { setIsModalOpen(false); fetchStatus(); };

  const handleDelete = async (budgetId) => {
    if (!window.confirm('Remove this budget?')) return;
    await deleteBudget(budgetId);
    fetchStatus();
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();

  if (loading) return <Spinner />;
  if (error) return <ErrorState onRetry={fetchStatus} />;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-sm mb-md">
        <h1 className="text-headline-lg font-headline-lg text-on-surface">Budget Planner — {MONTH_NAMES[month - 1]} {year}</h1>
        <div className="flex gap-sm">
          <Button variant="secondary" onClick={() => window.location.href = '/budget/history'}>View History</Button>
          <Button onClick={handleAdd}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Set Budget
          </Button>
        </div>
      </div>

      {statuses.length === 0 ? (
        <EmptyState message="No budgets set for this month." actionLabel="Set your first budget" onAction={handleAdd} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {statuses.map((b) => (
            <Card key={b.budgetId}>
              <div className="flex justify-between items-start mb-xs">
                <h4 className="text-headline-md font-headline-md text-on-surface">{b.category}</h4>
                <button
                  onClick={() => handleDelete(b.budgetId)}
                  className="p-1 rounded-lg text-secondary hover:text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors cursor-pointer"
                  title="Remove budget"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="bg-surface-container-high rounded-full h-3 overflow-hidden my-sm">
                <div
                  className={`h-full transition-all duration-300 ${STATUS_BG[b.status] || 'bg-primary-container'}`}
                  style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                />
              </div>

              <p className="text-body-md font-body-md text-on-surface">
                ₹{b.actualSpent.toLocaleString()} of ₹{b.limitAmount.toLocaleString()}
              </p>
              <p className={`text-label-md font-label-md font-semibold mt-xs ${STATUS_TEXT[b.status] || 'text-secondary'}`}>
                {b.percentUsed}% used
                {b.status === 'red' && ' — over budget!'}
                {b.status === 'yellow' && ' — getting close'}
              </p>

              <p className="text-label-sm font-label-sm text-secondary mt-sm">
                {b.limitAmount - b.actualSpent >= 0
                  ? `${daysRemaining} days left, ₹${(b.limitAmount - b.actualSpent).toLocaleString()} left in this budget`
                  : `You're ₹${(b.actualSpent - b.limitAmount).toLocaleString()} over, with ${daysRemaining} days left`}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set Budget">
        <BudgetForm month={month} year={year} onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default BudgetOverview;