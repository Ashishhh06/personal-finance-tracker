import { useState, useEffect, useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AuthContext } from '../../context/AuthContext';
import { getDashboardSummary } from '../../services/dashboardService';
import TimePeriodSelector from '../../components/common/TimePeriodSelector';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { getNetWorth } from '../../services/netWorthService';
import { getInsights } from '../../services/insightService';

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
      const [summaryRes, netWorthRes, insightsRes] = await Promise.all([
        getDashboardSummary(period),
        getNetWorth(),
        getInsights(),
      ]);
      setData({
        ...summaryRes.data,
        netWorth: netWorthRes.data.netWorth,
        latestInsight: insightsRes.data[0] || null,
      });
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
      {/* Page header */}
      <div className="flex flex-wrap justify-between items-center gap-sm mb-md">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Dashboard</h1>
          <p className="text-body-md font-body-md text-secondary">Welcome back, {user?.name}</p>
        </div>
        <TimePeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm mb-md">
        <Card>
          <p className="text-label-md font-label-md text-secondary">Total Income</p>
          <p className="text-stat-lg font-stat-lg text-[#16a34a]">
            ₹{stats.totalIncome.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-label-md font-label-md text-secondary">Total Expense</p>
          <p className="text-stat-lg font-stat-lg text-[#dc2626]">
            ₹{stats.totalExpense.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-label-md font-label-md text-secondary">Net Savings</p>
          <p className={`text-stat-lg font-stat-lg ${stats.netSavings >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
            ₹{stats.netSavings.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Chart + recent transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
        {/* Spending by category */}
        <Card>
          <h3 className="text-headline-md font-headline-md text-on-surface mb-sm">Spending by Category</h3>
          {spendingByCategory.length === 0 ? (
            <p className="text-body-md font-body-md text-secondary py-xl text-center">
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
          <h3 className="text-headline-md font-headline-md text-on-surface mb-sm">Recent Transactions</h3>
          {recentTransactions.length === 0 ? (
            <p className="text-body-md font-body-md text-secondary py-xl text-center">
              No transactions yet.
            </p>
          ) : (
            <div className="max-h-[280px] overflow-y-auto">
              {recentTransactions.map((t) => (
                <div
                  key={t._id}
                  className="flex justify-between items-start py-2 border-b border-surface-container-high last:border-0"
                >
                  <div>
                    <p className="text-body-md font-body-md text-on-surface">{t.note || t.categoryId?.name || 'Uncategorized'}</p>
                    <p className="text-label-sm font-label-sm text-secondary">
                      {t.categoryId?.name} · {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`text-label-md font-label-md font-semibold shrink-0 ml-sm ${t.type === 'income' ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Net Worth card */}
      <Card className="mb-sm">
        <p className="text-label-md font-label-md text-secondary">Net Worth</p>
        <p className={`text-stat-lg font-stat-lg ${data.netWorth >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
          ₹{data.netWorth?.toLocaleString() ?? '—'}
        </p>
      </Card>

      {/* AI Insight card */}
      {data.latestInsight ? (
        <Card className="mb-sm">
          <div className="flex justify-between items-center mb-sm">
            <p className="text-label-md font-label-md font-semibold text-on-surface">✨ Latest AI Insight</p>
            <a href="/insights" className="text-label-sm font-label-sm text-primary-container hover:underline">View all →</a>
          </div>
          <p className="text-body-md font-body-md text-on-surface whitespace-pre-line leading-relaxed">
            {data.latestInsight.message}
          </p>
        </Card>
      ) : (
        <Card className="mb-sm text-center">
          <p className="text-body-md font-body-md text-secondary">
            No AI insights yet — <a href="/insights" className="text-primary-container hover:underline">generate one</a>
          </p>
        </Card>
      )}

      <div className="mt-sm p-sm text-secondary text-label-sm font-label-sm text-center">
        Budget highlights and active goals will appear here in later steps.
      </div>
    </div>
  );
};

export default Dashboard;