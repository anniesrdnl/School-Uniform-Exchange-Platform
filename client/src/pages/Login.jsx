import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';
import { Spinner } from '../components/Loader.jsx';
import { LogoMark } from '../components/Logo.jsx';

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
    <form onSubmit={submit} className="card mx-auto mt-2 max-w-sm space-y-5 p-6 sm:mt-8 sm:p-8 md:mt-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <LogoMark className="h-12 w-12 rounded-2xl" iconClass="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">Log in to buy, sell, and swap uniforms.</p>
        </div>
      </div>
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
      <p className="text-center text-sm text-slate-600">
        New here? <Link to="/register" className="font-semibold text-navy hover:underline">Create an account</Link>
      </p>
    </form>
  );
}
