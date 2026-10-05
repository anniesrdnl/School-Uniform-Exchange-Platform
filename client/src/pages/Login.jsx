import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';
import { Spinner } from '../components/Loader.jsx';
import { LogoMark } from '../components/Logo.jsx';
import AuthLayout, { AuthHeading } from '../components/AuthLayout.jsx';

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
    <AuthLayout headline="Good to see you again."
      text="Pick up where you left off: check your requests, reply to buyers, and find your next uniform.">
      <form onSubmit={submit} className="space-y-5">
        <AuthHeading logo={<LogoMark className="h-12 w-12 rounded-2xl" iconClass="h-6 w-6" />}
          title="Welcome back" subtitle="Log in to buy, sell, and swap uniforms." />
        {justRegistered && !error && (
          <p role="status" className="animate-fade-up rounded-xl bg-green-50 p-3 text-sm text-green-800 ring-1 ring-inset ring-green-200">
            Registration successful. Log in with your new account.
          </p>
        )}
        {error && <p role="alert" className="animate-fade-up rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">{error}</p>}
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="email" required className="input" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" required className="input" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? <><Spinner /> Logging in…</> : 'Log in'}</button>
        <p className="text-center text-sm text-slate-600 lg:text-left">
          New here? <Link to="/register" className="font-semibold text-navy hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
