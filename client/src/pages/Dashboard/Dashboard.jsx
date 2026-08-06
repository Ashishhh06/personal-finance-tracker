import { useState, useEffect, useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AuthContext } from '../../context/AuthContext';
import { getDashboardSummary } from '../../services/dashboardService';
import TimePeriodSelector from '../../components/common/TimePeriodSelector';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

const COLORS = ['#4f46e5', '#f59e0b', '#16a34a', '#dc2626', '#0891b2', '#9333ea', '#e11d48', '#0284c7'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await getDashboardSummary(period);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [period]);

  if (loading || !data) {
    return <Spinner />;
  }

  const { stats, spendingByCategory, recentTransactions } = data;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: '#6b7280' }}>Welcome back, {user?.name}</p>
        </div>
        <TimePeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Income</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#16a34a' }}>
            ₹{stats.totalIncome.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Expense</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#dc2626' }}>
            ₹{stats.totalExpense.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Net Savings</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: stats.netSavings >= 0 ? '#16a34a' : '#dc2626' }}>
            ₹{stats.netSavings.toLocaleString()}
          </p>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Spending by category */}
        <Card>
          <h3 style={{ marginBottom: '1rem' }}>Spending by Category</h3>
          {spendingByCategory.length === 0 ? (
            <p style={{ color: '#6b7280', padding: '2rem 0', textAlign: 'center' }}>
              No expenses recorded for this period.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Recent transactions */}
        <Card>
          <h3 style={{ marginBottom: '1rem' }}>Recent Transactions</h3>
          {recentTransactions.length === 0 ? (
            <p style={{ color: '#6b7280', padding: '2rem 0', textAlign: 'center' }}>
              No transactions yet.
            </p>
          ) : (
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {recentTransactions.map((t) => (
                <div
                  key={t._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <div>
                    <p style={{ margin: 0 }}>{t.note || t.categoryId?.name || 'Uncategorized'}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                      {t.categoryId?.name} · {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      color: t.type === 'income' ? '#16a34a' : '#dc2626',
                    }}
                  >
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Placeholder sections for future steps */}
      <div style={{ marginTop: '1.5rem', padding: '1rem', color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>
        Budget highlights, active goals, net worth, and AI insights will appear here in later steps.
      </div>
    </div>
  );
};

export default Dashboard;