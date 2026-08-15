import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getBudgetHistory } from '../../services/budgetService';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

const BudgetHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await getBudgetHistory(6);
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <Spinner />;

  const chartData = history.map((h) => ({
    name: h.label,
    Budgeted: h.totalBudgeted,
    Spent: h.totalSpent,
  }));

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Budget History</h1>

      <Card style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Last 6 Months — Budgeted vs Actual Spend</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="Budgeted" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Spent" fill="#dc2626" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '0.5rem' }}>Month</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Budgeted</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actual Spent</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Difference</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => {
              const diff = h.totalBudgeted - h.totalSpent;
              return (
                <tr key={`${h.month}-${h.year}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem' }}>{h.label}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{h.totalBudgeted.toLocaleString()}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{h.totalSpent.toLocaleString()}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', color: diff >= 0 ? '#16a34a' : '#dc2626' }}>
                    {diff >= 0 ? '+' : ''}₹{diff.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default BudgetHistory;