import { useState, useEffect } from 'react';
import { getGoalsSummary, deleteGoal } from '../../services/goalService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import GoalForm from '../../components/forms/GoalForm';
import { generateGoalInsight } from '../../services/insightService';

const GoalCard = ({ goal, onEdit, onDelete, isCompleted }) => {
  const [tip, setTip] = useState(null);
  const [loadingTip, setLoadingTip] = useState(false);

  const handleGetTip = async () => {
    setLoadingTip(true);
    try {
      const res = await generateGoalInsight(goal._id);
      setTip(res.data.message);
    } catch (err) {
      alert('Failed to get saving tips. Please try again.');
    } finally {
      setLoadingTip(false);
    }
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <h3 style={{ margin: 0 }}>{goal.goalName}</h3>
        {isCompleted && (
          <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
            ✓ Completed
          </span>
        )}
      </div>
      <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.5rem 0' }}>
        Deadline: {new Date(goal.deadline).toLocaleDateString()}
      </p>

      <div style={{ background: '#e5e7eb', borderRadius: '8px', height: '10px', overflow: 'hidden', marginBottom: '0.5rem' }}>
        <div
          style={{
            width: `${goal.progressPercent}%`,
            background: isCompleted ? '#16a34a' : '#4f46e5',
            height: '100%',
            transition: 'width 0.3s',
          }}
        />
      </div>

      <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
        ₹{goal.currentSavedAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()} ({goal.progressPercent}%)
      </p>

      {tip && (
        <div style={{ background: '#f5f3ff', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#4f46e5', marginBottom: '0.25rem' }}>✨ AI Tip</p>
          <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{tip}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {!isCompleted && (
          <Button variant="secondary" onClick={handleGetTip} disabled={loadingTip}>
            {loadingTip ? 'Thinking...' : '✨ Get Saving Tips'}
          </Button>
        )}
        <Button variant="secondary" onClick={() => onEdit(goal)}>Edit</Button>
        <Button variant="danger" onClick={() => onDelete(goal._id)}>Delete</Button>
      </div>
    </Card>
  );
};

const GoalsList = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getGoalsSummary();
      setSummary(res.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleAdd = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await deleteGoal(id);
    fetchSummary();
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchSummary();
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState onRetry={fetchSummary} />;
  if (!summary) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Saving Goals</h1>
        <Button onClick={handleAdd}>+ Add Goal</Button>
      </div>

      <Card style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Current Total Savings (all-time income − expenses)</p>
        <p style={{ fontSize: '1.8rem', fontWeight: 700, color: summary.currentTotalSavings >= 0 ? '#16a34a' : '#dc2626' }}>
          ₹{summary.currentTotalSavings.toLocaleString()}
        </p>
      </Card>

      <h3 style={{ marginBottom: '1rem' }}>Active Goals</h3>
      {summary.activeGoals.length === 0 ? (
        <EmptyState message="No active goals yet." actionLabel="Add your first goal" onAction={handleAdd} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {summary.activeGoals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} onEdit={handleEdit} onDelete={handleDelete} isCompleted={false} />
          ))}
        </div>
      )}

      {summary.completedGoals.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              marginBottom: '1rem',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {showCompleted ? '▼' : '▶'} Completed Goals ({summary.completedGoals.length})
          </button>

          {showCompleted && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {summary.completedGoals.map((goal) => (
                <GoalCard key={goal._id} goal={goal} onEdit={handleEdit} onDelete={handleDelete} isCompleted={true} />
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Goal' : 'Add Goal'}
      >
        <GoalForm existingGoal={editingGoal} onSuccess={handleFormSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default GoalsList;