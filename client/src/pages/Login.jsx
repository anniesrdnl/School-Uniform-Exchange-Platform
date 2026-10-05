import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';
import { Spinner } from '../components/Loader.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import AuthLayout, { AuthFooter, AuthHeading } from '../components/AuthLayout.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const justRegistered = location.state?.registered;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout tag="Member login" headline="Your next uniform might already be on campus."
      text="Pick up where you left off: check your requests, reply to buyers, and find your next uniform.">
      <form onSubmit={submit} className="space-y-4 sm:space-y-5">
        <AuthHeading title="Welcome back" subtitle="Log in to your account to continue." />
        {justRegistered && !error && (
          <p role="status" className="alert-success animate-fade-up">
            Registration successful. Log in with your new account.
          </p>
        )}
        {error && <p role="alert" className="alert-error animate-fade-up">{error}</p>}
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="email" required className="input" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <PasswordInput id="password" autoComplete="current-password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? <><Spinner /> Logging in…</> : 'Log in'}</button>
        <AuthFooter>
          New here? <Link to="/register" className="font-semibold text-navy hover:underline">Create an account</Link>
        </AuthFooter>
      </form>
    </AuthLayout>
  );
}
