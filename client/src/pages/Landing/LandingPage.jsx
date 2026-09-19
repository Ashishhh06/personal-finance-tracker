import { useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const features = [
  {
    icon: 'payments',
    title: 'Expense & Income Tracking',
    desc: 'Log every transaction in seconds and see exactly where your money comes and goes.',
  },
  {
    icon: 'receipt_long',
    title: 'Budgets & Goals',
    desc: 'Set monthly budgets per category and track savings goals with live progress bars.',
  },
  {
    icon: 'monitoring',
    title: 'Investments & Net Worth',
    desc: 'Monitor your portfolio, properties, and loans — and watch your net worth grow.',
  },
  {
    icon: 'psychology',
    title: 'AI-Powered Insights',
    desc: 'Get smart spending analysis and personalised tips generated automatically for you.',
  },
];

const LandingPage = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // While auth state is resolving show nothing (avoids flash)
  if (loading) return null;

  // Already logged in — go straight to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-surface flex flex-col">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="w-full px-margin-mobile md:px-margin-desktop py-base flex items-center justify-between border-b border-surface-container-high">
        {/* Logo mark — same style as the sidebar in Layout.jsx */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-bold text-lg shrink-0">
            F
          </div>
          <div>
            <span className="text-headline-md font-headline-md font-extrabold text-on-surface leading-tight">
              FinTrack
            </span>
            <p className="text-label-sm font-label-sm text-secondary">Personal Finance</p>
          </div>
        </div>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors px-3 py-2 rounded-lg hover:bg-surface-container-low"
          >
            Log In
          </button>
          <Button onClick={() => navigate('/signup')}>
            Get Started Free
          </Button>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-margin-mobile md:px-margin-desktop py-xl gap-6">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 bg-primary-container/15 text-primary-container border border-primary-container/30 rounded-full px-4 py-1 text-label-sm font-label-sm">
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          AI-powered personal finance
        </span>

        {/* Headline */}
        <h1 className="text-display-lg font-headline-lg font-extrabold text-on-surface max-w-[720px] leading-tight">
          Take control of your money — for good.
        </h1>

        {/* Subheadline */}
        <p className="text-body-lg font-body-md text-secondary max-w-[560px]">
          FinTrack brings your expenses, income, budgets, investments, and AI-powered insights
          together in one beautifully simple dashboard.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <Button onClick={() => navigate('/signup')} className="px-xl text-label-lg">
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            Sign Up Free
          </Button>
          <button
            onClick={() => navigate('/login')}
            className="h-[44px] px-md rounded-lg font-label-md text-label-md text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            Log In
          </button>
        </div>

        {/* Trust note */}
        <p className="text-label-sm font-label-sm text-secondary mt-1">
          Free to use · No credit card required · Your data stays private
        </p>
      </main>

      {/* ── Feature highlights ───────────────────────────────────────────── */}
      <section className="px-margin-mobile md:px-margin-desktop py-lg bg-surface-container-lowest border-t border-surface-container-high">
        <h2 className="text-headline-md font-headline-md font-extrabold text-on-surface text-center mb-lg">
          Everything you need, nothing you don't
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3 p-md bg-surface rounded-xl border border-surface-container-high card-hover transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-container/15 flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined">{f.icon}</span>
              </div>
              <div>
                <h3 className="text-label-lg font-label-md font-semibold text-on-surface mb-1">
                  {f.title}
                </h3>
                <p className="text-body-sm font-body-md text-secondary leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="text-center py-base text-label-sm font-label-sm text-secondary border-t border-surface-container-high">
        © {new Date().getFullYear()} FinTrack · Built for your financial freedom
      </footer>
    </div>
  );
};

export default LandingPage;
