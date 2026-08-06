import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getTransactions } from '../../services/transactionService';
import { getRangeForPeriod } from '../../utils/dateHelpers';
import TimePeriodSelector from '../../components/common/TimePeriodSelector';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';

const COLORS = ['#4f46e5', '#f59e0b', '#16a34a', '#dc2626', '#0891b2', '#9333ea', '#e11d48', '#0284c7'];
const MAX_SLICES = 6; // show top N tags individually, group the rest into "Other"

const LifestyleDashboard = () => {
  const [period, setPeriod] = useState('month');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { startDate, endDate } = getRangeForPeriod(period);
        const res = await getTransactions({
          type: 'expense',
          startDate,
          endDate,
        });
        // Only keep expenses that actually have at least one tag
        const taggedOnly = res.data.filter((t) => t.tags && t.tags.length > 0);
        setTransactions(taggedOnly);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  // Dynamically build totals per tag - works for ANY tag the user has typed, not just fixed ones
  const tagTotals = {};
  transactions.forEach((t) => {
    t.tags.forEach((tag) => {
      tagTotals[tag] = (tagTotals[tag] || 0) + t.amount;
    });
  });

  // Sort tags by amount, descending
  const sortedTags = Object.entries(tagTotals).sort((a, b) => b[1] - a[1]);

  // Keep top N individually, group the rest into "Other"
  let chartData = sortedTags.slice(0, MAX_SLICES).map(([tag, amount]) => ({
    name: tag.charAt(0).toUpperCase() + tag.slice(1),
    value: amount,
  }));

  if (sortedTags.length > MAX_SLICES) {
    const otherTotal = sortedTags.slice(MAX_SLICES).reduce((sum, [, amount]) => sum + amount, 0);
    chartData.push({ name: 'Other', value: otherTotal });
  }

  const total = Object.values(tagTotals).reduce((sum, v) => sum + v, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Lifestyle</h1>
        <TimePeriodSelector value={period} onChange={setPeriod} />
      </div>

      {loading ? (
        <Spinner />
      ) : transactions.length === 0 ? (
        <EmptyState message="No tagged expenses found for this period. Add a tag (e.g. food, movies, trips, shopping, gym, gifts - anything you like) to an expense to see it here." />
      ) : (
        <>
          <Card style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Total tagged spend this period</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{total.toLocaleString()}</p>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Card>
              <h3 style={{ marginBottom: '1rem' }}>Spend by Tag</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 style={{ marginBottom: '1rem' }}>Tagged Transactions</h3>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {transactions.map((t) => (
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
                      <p style={{ margin: 0 }}>{t.note || t.categoryId?.name}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                        {t.tags.join(', ')} · {new Date(t.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p style={{ margin: 0, fontWeight: 600 }}>₹{t.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default LifestyleDashboard;