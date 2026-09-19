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
      <div className="flex flex-wrap justify-between items-center gap-sm mb-md">
        <h1 className="text-headline-lg font-headline-lg text-on-surface">Income vs Expense</h1>
        <TimePeriodSelector value={period} onChange={setPeriod} />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm mb-md">
            <Card>
              <p className="text-label-md font-label-md text-secondary">Total Income</p>
              <p className="text-stat-lg font-stat-lg text-[#16a34a]">₹{income.toLocaleString()}</p>
            </Card>
            <Card>
              <p className="text-label-md font-label-md text-secondary">Total Expense</p>
              <p className="text-stat-lg font-stat-lg text-[#dc2626]">₹{expense.toLocaleString()}</p>
            </Card>
            <Card>
              <p className="text-label-md font-label-md text-secondary">Net Savings</p>
              <p className={`text-stat-lg font-stat-lg ${netSavings >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
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