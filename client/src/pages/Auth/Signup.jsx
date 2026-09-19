import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full mt-xs px-3 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container';
  const labelCls = 'block text-label-md font-label-md text-on-surface-variant';

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-margin-mobile">
      <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-xl p-md card-shadow">
        <div className="flex items-center gap-3 mb-md">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-bold text-lg">
            F
          </div>
          <div>
            <h1 className="text-headline-md font-headline-md text-on-surface leading-tight">FinTrack</h1>
            <p className="text-label-sm font-label-sm text-secondary">Personal Finance</p>
          </div>
        </div>

        <h2 className="text-headline-md font-headline-md text-on-surface mb-md">Sign Up</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
          <div>
            <label className={labelCls}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className={inputCls}
            />
          </div>

          {error && (
            <p className="text-label-sm font-label-sm text-[#dc2626]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[44px] bg-primary-container text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-xs"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-md text-label-md font-label-md text-secondary text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-container font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;