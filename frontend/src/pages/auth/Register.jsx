import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api';
import ThemeToggle from '../../components/ThemeToggle';

const Register = ({ role }) => {
  const isDirector = role === 'director';
  const [form, setForm] = useState({ name: '', email: '', employee_id: '', password: '', confirmPassword: '' });
  const [challengeToken, setChallengeToken] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.register({
        name: form.name,
        email: form.email,
        employee_id: form.employee_id || undefined,
        password: form.password,
        role,
      });
      setChallengeToken(result.data.challengeToken);
      setNotice(result.data.message);
    } catch (registerError) {
      setError(registerError.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await authApi.verifyRegistration({ challengeToken, code });
      setNotice(result.data.message);
      setChallengeToken('verified');
    } catch (verifyError) {
      setError(verifyError.response?.data?.message || 'Email verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await authApi.resendOtp({ challengeToken, purpose: 'registration' });
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
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">One workspace. Clear accountability.</p>
          <h1 className="max-w-xl text-5xl font-bold leading-tight text-gray-950">Join a more transparent expense process.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
            Create your account, verify your work email, and keep every claim and decision easy to follow.
          </p>
          {isDirector && <p className="mt-6 max-w-lg rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm leading-6 text-purple-900">Director access is enabled only after email verification and Admin authorization.</p>}
        </section>
        <section className="auth-card mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
          <div className="mb-7">
            <p className="text-sm font-semibold text-blue-700">{isDirector ? 'Director portal' : 'Employee portal'}</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {challengeToken === 'verified' ? 'Email verified' : challengeToken ? 'Verify your email' : `Create ${isDirector ? 'Director' : 'Employee'} account`}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {challengeToken === 'verified'
                ? notice
                : challengeToken
                  ? 'Enter the six-digit code sent to your email address.'
                  : 'Use your work email and a strong password to get started.'}
            </p>
          </div>
          {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {notice && challengeToken !== 'verified' && <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

          {challengeToken === 'verified' ? (
            <div className="space-y-4">
              {isDirector && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Your email is confirmed. An administrator must authorize this account before you can sign in.</div>}
              <Link to={`/${role}/login`} className="btn-primary block w-full text-center">{isDirector ? 'Return to Director sign in' : 'Continue to sign in'}</Link>
            </div>
          ) : challengeToken ? (
            <div className="space-y-5">
              <form onSubmit={verifyEmail} className="space-y-5">
                <div>
                  <label className="label" htmlFor="registration-code">6-digit verification code</label>
                  <input id="registration-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} required
                    className="input-field text-center text-xl tracking-[0.4em]" placeholder="000000" />
                </div>
                <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full py-3">{loading ? 'Verifying…' : 'Verify email'}</button>
              </form>
              <button type="button" onClick={resend} disabled={loading} className="w-full text-sm font-medium text-blue-700 hover:underline disabled:opacity-50">Resend verification code</button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="label" htmlFor="name">Full name</label>
                <input id="name" name="name" value={form.name} onChange={update} minLength={2} maxLength={255} required className="input-field" autoComplete="name" />
              </div>
              <div>
                <label className="label" htmlFor="email">Work email</label>
                <input id="email" type="email" name="email" value={form.email} onChange={update} maxLength={255} required className="input-field" autoComplete="email" />
              </div>
              {!isDirector && <div>
                <label className="label" htmlFor="employee_id">Employee ID <span className="font-normal text-gray-400">(optional)</span></label>
                <input id="employee_id" name="employee_id" value={form.employee_id} onChange={update} maxLength={50} className="input-field" />
              </div>}
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input id="password" type="password" name="password" value={form.password} onChange={update} minLength={10} maxLength={128} required className="input-field" autoComplete="new-password" />
                <p className="mt-1 text-xs text-gray-500">Use at least 10 characters.</p>
              </div>
              <div>
                <label className="label" htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" type="password" name="confirmPassword" value={form.confirmPassword} onChange={update} required className="input-field" autoComplete="new-password" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Creating account…' : 'Create account'}</button>
            </form>
          )}

          {challengeToken !== 'verified' && <p className="mt-7 border-t border-gray-100 pt-5 text-center text-sm text-gray-600">Already registered? <Link to={`/${role}/login`} className="font-semibold text-blue-700 hover:underline">Sign in</Link></p>}
        </section>
      </div>
    </main>
  );
};

export default Register;
