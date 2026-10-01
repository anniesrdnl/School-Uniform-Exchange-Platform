import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';
import { Spinner } from '../components/Loader.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
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
    <form onSubmit={submit} className="card mx-auto mt-2 max-w-sm space-y-4 p-5 sm:mt-6 sm:p-6 shadow-xl shadow-navy/5 md:mt-12 md:p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-lg font-extrabold text-white shadow-lg shadow-navy/20" aria-hidden="true">S</span>
        <h1 className="text-xl font-bold">Log in</h1>
      </div>
      {error && <p role="alert" className="animate-fade-up rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div>
        <label className="label" htmlFor="email">Email address</label>
        <input id="email" type="email" required className="input" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" required className="input" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </div>
      <button className="btn-primary w-full" disabled={busy}>{busy ? <><Spinner /> Logging in…</> : 'Log in'}</button>
      <p className="text-center text-sm text-slate-600">
        New here? <Link to="/register" className="font-semibold text-navy">Create an account</Link>
      </p>
    </form>
  );
}
