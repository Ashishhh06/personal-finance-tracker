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

  const inputStyle = { width: '100%', padding: '0.5rem', marginTop: '0.25rem' };
  const groupStyle = { marginBottom: '1rem' };

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

  return (
    <form onSubmit={handleSubmit}>
      <div style={groupStyle}>
        <label>Goal Name</label>
        <input
          type="text"
          value={goalName}
          onChange={(e) => setGoalName(e.target.value)}
          placeholder="e.g. New Laptop"
          required
          style={inputStyle}
        />
      </div>
      <div style={groupStyle}>
        <label>Target Amount</label>
        <input
          type="number"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          required
          min="0"
          style={inputStyle}
        />
      </div>
      <div style={groupStyle}>
        <label>Currently Saved</label>
        <input
          type="number"
          value={currentSavedAmount}
          onChange={(e) => setCurrentSavedAmount(e.target.value)}
          min="0"
          style={inputStyle}
        />
      </div>
      <div style={groupStyle}>
        <label>Deadline</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      <div style={groupStyle}>
        <label>Monthly Contribution (optional)</label>
        <input
          type="number"
          value={monthlyContribution}
          onChange={(e) => setMonthlyContribution(e.target.value)}
          min="0"
          style={inputStyle}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
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