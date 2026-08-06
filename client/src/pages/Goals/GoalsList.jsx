import { useState, useEffect } from 'react';
import { getGoalsSummary, deleteGoal } from '../../services/goalService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import GoalForm from '../../components/forms/GoalForm';

const GoalCard = ({ goal, onEdit, onDelete, isCompleted }) => (
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

    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button variant="secondary" onClick={() => onEdit(goal)}>Edit</Button>
      <Button variant="danger" onClick={() => onDelete(goal._id)}>Delete</Button>
    </div>
  </Card>
);

const GoalsList = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await getGoalsSummary();
      setSummary(res.data);
    } catch (err) {
      console.error(err);
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

  if (loading || !summary) {
    return <Spinner />;
  }

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