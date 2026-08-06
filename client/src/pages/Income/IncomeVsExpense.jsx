import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getTransactions } from '../../services/transactionService';
import { getRangeForPeriod } from '../../utils/dateHelpers';
import TimePeriodSelector from '../../components/common/TimePeriodSelector';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

const IncomeVsExpense = () => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { startDate, endDate } = getRangeForPeriod(period);

        const [incomeRes, expenseRes] = await Promise.all([
          getTransactions({ type: 'income', startDate, endDate }),
          getTransactions({ type: 'expense', startDate, endDate }),
        ]);

        const incomeTotal = incomeRes.data.reduce((sum, t) => sum + t.amount, 0);
        const expenseTotal = expenseRes.data.reduce((sum, t) => sum + t.amount, 0);

        setIncome(incomeTotal);
        setExpense(expenseTotal);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const netSavings = income - expense;
  const chartData = [
    { name: 'This Period', Income: income, Expense: expense },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Income vs Expense</h1>
        <TimePeriodSelector value={period} onChange={setPeriod} />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <Card>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Income</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#16a34a' }}>₹{income.toLocaleString()}</p>
            </Card>
            <Card>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Expense</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#dc2626' }}>₹{expense.toLocaleString()}</p>
            </Card>
            <Card>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Net Savings</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 700, color: netSavings >= 0 ? '#16a34a' : '#dc2626' }}>
                ₹{netSavings.toLocaleString()}
              </p>
            </Card>
          </div>

          <Card>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Income" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
};

export default IncomeVsExpense;