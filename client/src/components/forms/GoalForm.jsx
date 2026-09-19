import { useState } from 'react';
import { createGoal, updateGoal } from '../../services/goalService';
import Button from '../common/Button';

const GoalForm = ({ existingGoal, onSuccess, onCancel }) => {
  const [goalName, setGoalName] = useState(existingGoal?.goalName || '');
  const [targetAmount, setTargetAmount] = useState(existingGoal?.targetAmount || '');
  const [currentSavedAmount, setCurrentSavedAmount] = useState(existingGoal?.currentSavedAmount || 0);
  const [deadline, setDeadline] = useState(
    existingGoal?.deadline ? existingGoal.deadline.slice(0, 10) : ''
  );
  const [monthlyContribution, setMonthlyContribution] = useState(existingGoal?.monthlyContribution || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      goalName,
      targetAmount: Number(targetAmount),
      currentSavedAmount: Number(currentSavedAmount),
      deadline,
      monthlyContribution: Number(monthlyContribution) || 0,
    };

    try {
      if (existingGoal) {
        await updateGoal(existingGoal._id, payload);
      } else {
        await createGoal(payload);
      }
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
      <div className={groupCls}>
        <label className={labelCls}>Goal Name</label>
        <input
          type="text"
          value={goalName}
          onChange={(e) => setGoalName(e.target.value)}
          placeholder="e.g. New Laptop"
          required
          className={inputCls}
        />
      </div>
      <div className={groupCls}>
        <label className={labelCls}>Target Amount</label>
        <input
          type="number"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          required
          min="0"
          className={inputCls}
        />
      </div>
      <div className={groupCls}>
        <label className={labelCls}>Currently Saved</label>
        <input
          type="number"
          value={currentSavedAmount}
          onChange={(e) => setCurrentSavedAmount(e.target.value)}
          min="0"
          className={inputCls}
        />
      </div>
      <div className={groupCls}>
        <label className={labelCls}>Deadline</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
          className={inputCls}
        />
      </div>
      <div className={groupCls}>
        <label className={labelCls}>Monthly Contribution (optional)</label>
        <input
          type="number"
          value={monthlyContribution}
          onChange={(e) => setMonthlyContribution(e.target.value)}
          min="0"
          className={inputCls}
        />
      </div>

      {error && <p className="mt-xs text-label-sm font-label-sm text-[#dc2626]">{error}</p>}

      <div className="flex gap-sm mt-md">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : existingGoal ? 'Update Goal' : 'Add Goal'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default GoalForm;