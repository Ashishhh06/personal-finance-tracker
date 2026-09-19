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
      <h1 className="text-headline-lg font-headline-lg text-on-surface mb-md">Budget History</h1>

      <Card className="mb-md">
        <h3 className="text-headline-md font-headline-md text-on-surface mb-sm">Last 6 Months — Budgeted vs Actual Spend</h3>
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
        <div className="overflow-x-auto">
          <table className="w-full text-body-md font-body-md">
            <thead>
              <tr className="border-b border-surface-container-high">
                <th className="px-sm py-2 text-left text-label-sm font-label-sm text-secondary">Month</th>
                <th className="px-sm py-2 text-right text-label-sm font-label-sm text-secondary">Budgeted</th>
                <th className="px-sm py-2 text-right text-label-sm font-label-sm text-secondary">Actual Spent</th>
                <th className="px-sm py-2 text-right text-label-sm font-label-sm text-secondary">Difference</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => {
                const diff = h.totalBudgeted - h.totalSpent;
                return (
                  <tr key={`${h.month}-${h.year}`} className="border-b border-surface-container-low hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-sm py-3 text-on-surface">{h.label}</td>
                    <td className="px-sm py-3 text-right text-on-surface">₹{h.totalBudgeted.toLocaleString()}</td>
                    <td className="px-sm py-3 text-right text-on-surface">₹{h.totalSpent.toLocaleString()}</td>
                    <td className={`px-sm py-3 text-right font-semibold ${diff >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                      {diff >= 0 ? '+' : ''}₹{diff.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BudgetHistory;