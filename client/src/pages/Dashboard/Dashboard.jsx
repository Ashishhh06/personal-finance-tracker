import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import TimePeriodSelector from '../../components/common/TimePeriodSelector';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [period, setPeriod] = useState('month');

  return (
    <div>
      <h1>Dashboard</h1>
      <TimePeriodSelector value={period} onChange={setPeriod} />
      <p style={{ marginTop: '1rem' }}>Welcome, {user?.name}!</p>
      <p>Email: {user?.email}</p>
      <p>Selected period: {period}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;