import { useState, useEffect } from 'react';
import { getBudgetStatus, deleteBudget } from '../../services/budgetService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import BudgetForm from '../../components/forms/BudgetForm';

const STATUS_COLORS = { green: '#16a34a', yellow: '#f59e0b', red: '#dc2626' };
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Budget Planner — {MONTH_NAMES[month - 1]} {year}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => window.location.href = '/budget/history'}>View History</Button>
          <Button onClick={handleAdd}>+ Set Budget</Button>
        </div>
      </div>

      {statuses.length === 0 ? (
        <EmptyState message="No budgets set for this month." actionLabel="Set your first budget" onAction={handleAdd} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {statuses.map((b) => (
            <Card key={b.budgetId}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h4 style={{ margin: 0 }}>{b.category}</h4>
                <Button variant="danger" onClick={() => handleDelete(b.budgetId)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                  ✕
                </Button>
              </div>

              <div style={{ background: '#e5e7eb', borderRadius: '8px', height: '12px', overflow: 'hidden', margin: '0.75rem 0 0.5rem' }}>
                <div
                  style={{
                    width: `${Math.min(100, b.percentUsed)}%`,
                    background: STATUS_COLORS[b.status],
                    height: '100%',
                    transition: 'width 0.3s',
                  }}
                />
              </div>

              <p style={{ fontSize: '0.9rem', margin: 0 }}>
                ₹{b.actualSpent.toLocaleString()} of ₹{b.limitAmount.toLocaleString()}
              </p>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: STATUS_COLORS[b.status], margin: '0.25rem 0 0' }}>
                {b.percentUsed}% used
                {b.status === 'red' && ' — over budget!'}
                {b.status === 'yellow' && ' — getting close'}
              </p>

              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.75rem' }}>
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