import { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/expenses', label: 'Expenses' },
  { path: '/income', label: 'Income' },
  { path: '/goals', label: 'Goals' },
  { path: '/investments', label: 'Investments' },
  { path: '/budget', label: 'Budget' },
  { path: '/lifestyle', label: 'Lifestyle' },
  { path: '/networth', label: 'Net Worth' },
  { path: '/loans', label: 'Loans' },
  { path: '/bank-accounts', label: 'Bank Accounts' },
  { path: '/insights', label: 'AI Insights' },
  { path: '/settings', label: 'Settings' },
];

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: '220px',
          background: '#1e1e2f',
          color: '#fff',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2 style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>FinTrack</h2>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                color: '#fff',
                textDecoration: 'none',
                background: isActive ? '#4f46e5' : 'transparent',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #333' }}>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{user?.name}</p>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '2rem', background: '#f5f5f7' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;