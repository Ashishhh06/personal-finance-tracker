import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;