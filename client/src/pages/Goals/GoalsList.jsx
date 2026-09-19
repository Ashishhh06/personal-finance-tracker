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
      <div className="flex justify-between items-start gap-xs mb-xs">
        <h3 className="text-headline-md font-headline-md text-on-surface leading-snug">{goal.goalName}</h3>
        {isCompleted && (
          <span className="bg-[#16a34a]/10 text-[#16a34a] px-2.5 py-0.5 rounded-full text-label-sm font-semibold shrink-0">
            ✓ Completed
          </span>
        )}
      </div>
      <p className="text-label-sm font-label-sm text-secondary mb-sm">
        Deadline: {new Date(goal.deadline).toLocaleDateString()}
      </p>

      <div className="bg-surface-container-high rounded-full h-2.5 overflow-hidden mb-xs">
        <div
          className={`h-full transition-all duration-300 ${isCompleted ? 'bg-[#16a34a]' : 'bg-primary-container'}`}
          style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
        />
      </div>

      <p className="text-body-md font-body-md text-on-surface mb-sm">
        ₹{goal.currentSavedAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()} ({goal.progressPercent}%)
      </p>

      {tip && (
        <div className="bg-primary-container/10 border border-primary-container/20 p-sm rounded-lg mb-sm text-label-md leading-relaxed">
          <p className="font-semibold text-primary-container mb-xs">✨ AI Tip</p>
          <p className="text-on-surface whitespace-pre-line">{tip}</p>
        </div>
      )}

      <div className="flex gap-xs flex-wrap mt-xs">
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
      <div className="flex flex-wrap justify-between items-center gap-sm mb-md">
        <h1 className="text-headline-lg font-headline-lg text-on-surface">Saving Goals</h1>
        <Button onClick={handleAdd}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Goal
        </Button>
      </div>

      <Card className="mb-md">
        <p className="text-label-md font-label-md text-secondary">Current Total Savings (all-time income − expenses)</p>
        <p className={`text-stat-lg font-stat-lg ${summary.currentTotalSavings >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
          ₹{summary.currentTotalSavings.toLocaleString()}
        </p>
      </Card>

      <h3 className="text-headline-md font-headline-md text-on-surface mb-sm">Active Goals</h3>
      {summary.activeGoals.length === 0 ? (
        <EmptyState message="No active goals yet." actionLabel="Add your first goal" onAction={handleAdd} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-lg">
          {summary.activeGoals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} onEdit={handleEdit} onDelete={handleDelete} isCompleted={false} />
          ))}
        </div>
      )}

      {summary.completedGoals.length > 0 && (
        <div className="mt-md">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-xs font-semibold text-on-surface text-label-md hover:text-primary-container transition-colors mb-sm cursor-pointer"
          >
            <span>{showCompleted ? '▼' : '▶'}</span> Completed Goals ({summary.completedGoals.length})
          </button>

          {showCompleted && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
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