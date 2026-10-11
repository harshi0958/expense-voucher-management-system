import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api';
import ThemeToggle from '../../components/ThemeToggle';

const PORTALS = {
  employee: { title: 'Employee sign in', accent: 'blue', identifier: 'Work email' },
  director: { title: 'Director sign in', accent: 'purple', identifier: 'Work email' },
  accounts: { title: 'Accounts sign in', accent: 'teal', identifier: 'Work email' },
  admin: { title: 'Admin sign in', accent: 'slate', identifier: 'Username' },
};

const Login = ({ role = 'employee' }) => {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestLogin, completeLogin } = useAuth();
  const navigate = useNavigate();
  const portal = PORTALS[role] || PORTALS.employee;

  const handleCredentials = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await requestLogin(identity, password, role);
      setChallengeToken(result.challengeToken);
      setNotice(result.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await completeLogin(challengeToken, code);
      navigate(`/${user.role}`, { replace: true });
    } catch (verifyError) {
      setError(verifyError.response?.data?.message || 'Code verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await authApi.resendOtp({
        challengeToken,
        purpose: 'login',
      });
      setNotice(result.data.message);
    } catch (resendError) {
      setError(resendError.response?.data?.message || 'Unable to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight text-gray-900">ExpenseVMS</Link>
        <ThemeToggle />
      </div>
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-12 py-10 lg:grid-cols-2">
        <section className="hidden lg:block">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Expense management, made clear</p>
          <h1 className="max-w-xl text-5xl font-bold leading-tight text-gray-950">A better way to move expenses forward.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
            Submit with confidence, track every decision, and keep your team in sync from claim to approval.
          </p>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {['Secure access', 'Clear approvals', 'Live tracking'].map((item) => (
              <div key={item} className="rounded-xl border border-gray-200 bg-white/70 p-4 text-sm font-medium text-gray-700">{item}</div>
            ))}
          </div>
        </section>

        <section className="auth-card mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
          <div className="mb-7">
            <p className="text-sm font-semibold text-blue-700">{role === 'admin' ? 'Administration' : 'Welcome back'}</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">{challengeToken ? 'Check your email' : portal.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {challengeToken
                ? 'Enter the one-time code sent to your registered email address.'
                : 'Sign in with your credentials. We’ll send a one-time code to verify it’s you.'}
            </p>
          </div>

          {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {notice && <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

          {!challengeToken ? (
            <form onSubmit={handleCredentials} className="space-y-5">
              <div>
                <label className="label" htmlFor="login-identity">{portal.identifier}</label>
                <input
                  id="login-identity"
                  type={role === 'admin' ? 'text' : 'email'}
                  value={identity}
                  onChange={(event) => setIdentity(event.target.value)}
                  required
                  autoComplete={role === 'admin' ? 'username' : 'email'}
                  className="input-field"
                  placeholder={role === 'admin' ? 'admin' : 'you@company.com'}
                />
              </div>
              <div>
                <label className="label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  className="input-field"
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Sending secure code…' : 'Continue securely'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="label" htmlFor="login-code">6-digit verification code</label>
                <input
                  id="login-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  className="input-field text-center text-xl tracking-[0.4em]"
                  placeholder="000000"
                />
              </div>
              <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full py-3">
                {loading ? 'Verifying…' : 'Verify and sign in'}
              </button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={handleResend} disabled={loading} className="font-medium text-blue-700 hover:text-blue-800 disabled:opacity-50">
                  Resend code
                </button>
                <button type="button" onClick={() => { setChallengeToken(''); setCode(''); setNotice(''); setError(''); }} className="text-gray-500 hover:text-gray-800">
                  Use another account
                </button>
              </div>
            </form>
          )}
          {role !== 'admin' && !challengeToken && (
            <p className="mt-7 border-t border-gray-100 pt-5 text-center text-sm text-gray-600">
              New here? <Link to={`/${role}/register`} className="font-semibold text-blue-700 hover:underline">Create an account</Link>
            </p>
          )}
          {role === 'employee' && (
            <p className="mt-3 text-center text-sm text-gray-500">
              Director? <Link to="/director/login" className="font-medium text-gray-700 hover:underline">Use Director sign in</Link>
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default Login;
