import { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/expenses', label: 'Expenses', icon: 'payments' },
  { path: '/income', label: 'Income', icon: 'trending_up' },
  { path: '/goals', label: 'Goals', icon: 'target' },
  { path: '/investments', label: 'Investments', icon: 'account_balance_wallet' },
  { path: '/budget', label: 'Budget', icon: 'receipt_long' },
  { path: '/lifestyle', label: 'Lifestyle', icon: 'style' },
  { path: '/networth', label: 'Net Worth', icon: 'monitoring' },
  { path: '/loans', label: 'Loans & Debts', icon: 'credit_card' },
  { path: '/bank-accounts', label: 'Bank Accounts', icon: 'account_balance' },
  { path: '/insights', label: 'AI Insights', icon: 'psychology' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <nav
        className={`fixed left-0 top-0 h-full w-[280px] bg-inverse-surface flex flex-col py-md shadow-sm z-50 transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-gutter mb-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-bold text-lg">
            F
          </div>
          <div>
            <h1 className="text-headline-md font-headline-md font-extrabold text-on-primary-fixed leading-tight">
              FinTrack
            </h1>
            <p className="text-label-sm font-label-sm text-surface-variant/70">Personal Finance</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-sm flex flex-col gap-1 sidebar-scroll">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 text-label-md font-label-md ${
                  isActive
                    ? 'text-on-primary-fixed font-bold border-l-4 border-primary-container bg-surface-variant/10'
                    : 'text-surface-variant hover:text-on-primary-fixed hover:bg-surface-variant/20'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="px-sm mt-auto pt-sm border-t border-surface-variant/20">
          <div className="px-3 py-2 text-surface-variant text-label-sm font-label-sm truncate">
            {user?.name}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-error hover:bg-error/10 transition-colors duration-200 text-label-md font-label-md"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <main className="flex-1 md:ml-[280px] w-full flex flex-col">
        {/* TopAppBar */}
        <header className="bg-surface flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-base sticky top-0 z-30 shadow-sm md:shadow-none">
          <button
            className="md:hidden text-primary p-2 rounded hover:bg-surface-variant/20 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="text-headline-md font-headline-md font-extrabold text-primary md:hidden">
            FinTrack
          </h2>

        </header>

        {/* Page Content Canvas */}
        <div className="flex-1 p-margin-mobile md:p-margin-desktop max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;