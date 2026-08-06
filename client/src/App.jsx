import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

import Signup from './pages/Auth/Signup';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ExpenseList from './pages/Expenses/ExpenseList';
import IncomeList from './pages/Income/IncomeList';
import IncomeVsExpense from './pages/Income/IncomeVsExpense';
import GoalsList from './pages/Goals/GoalsList';
import PortfolioOverview from './pages/Investments/PortfolioOverview';
import BudgetOverview from './pages/Budget/BudgetOverview';
import LifestyleDashboard from './pages/Lifestyle/LifestyleDashboard';
import NetWorthPage from './pages/NetWorth/NetWorthPage';
import LoansList from './pages/Loans/LoansList';
import BankAccountsList from './pages/BankAccounts/BankAccountsList';
import InsightsPage from './pages/Insights/InsightsPage';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/income" element={<IncomeList />} />
            <Route path="/income/compare" element={<IncomeVsExpense />} />
            <Route path="/goals" element={<GoalsList />} />
            <Route path="/investments" element={<PortfolioOverview />} />
            <Route path="/budget" element={<BudgetOverview />} />
            <Route path="/lifestyle" element={<LifestyleDashboard />} />
            <Route path="/networth" element={<NetWorthPage />} />
            <Route path="/loans" element={<LoansList />} />
            <Route path="/bank-accounts" element={<BankAccountsList />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;