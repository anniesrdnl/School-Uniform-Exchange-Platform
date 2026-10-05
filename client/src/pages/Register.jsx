import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';
import { Spinner } from '../components/Loader.jsx';
import Icon from '../components/Icon.jsx';
import { LogoMark } from '../components/Logo.jsx';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    studentId: '',
    email: '',
    program: '',
    yearLevel: YEARS[0],
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // { email, emailConfirmationRequired } after success

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const data = await register(form);
      // Show the confirmation screen; the user logs in manually afterwards
      setDone({ email: form.email, emailConfirmationRequired: data?.emailConfirmationRequired });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const field = (id, label, type = 'text', props = {}) => (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} type={type} required className="input" value={form[id]} onChange={set(id)} {...props} />
    </div>
  );

  if (done) {
    return (
      <div className="card mx-auto mt-2 max-w-md space-y-4 p-6 text-center sm:mt-8 sm:p-8 md:mt-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700 ring-1 ring-inset ring-green-200">
          <Icon name="check" className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">Account created!</h1>
        <p role="status" className="text-sm text-slate-600">
          {done.emailConfirmationRequired ? (
            <>We sent a verification link to <strong className="text-ink">{done.email}</strong>. Please confirm your email, then log in with your new account.</>
          ) : (
            <>Your account for <strong className="text-ink">{done.email}</strong> is ready. Please log in with your registered email and password.</>
          )}
        </p>
        <button type="button" className="btn-primary w-full py-3"
          onClick={() => navigate('/login', { state: { email: done.email, registered: true } })}>
          Go to log in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card mx-auto mt-2 max-w-lg space-y-5 p-6 sm:mt-8 sm:p-8 md:mt-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <LogoMark className="h-12 w-12 rounded-2xl" iconClass="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-slate-600">Join your school's uniform exchange.</p>
        </div>
      </div>

      {error && <p role="alert" className="animate-fade-up rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">{error}</p>}

      {field('fullName', 'Full name', 'text', { autoComplete: 'name' })}
      <div className="grid gap-4 sm:grid-cols-2">
        {field('studentId', 'Student ID')}
        {field('email', 'Email address', 'email', { autoComplete: 'email' })}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field('program', 'Program / Course')}
        <div>
          <label className="label" htmlFor="yearLevel">Year level</label>
          <select id="yearLevel" className="input" value={form.yearLevel} onChange={set('yearLevel')}>
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field('password', 'Password', 'password', { autoComplete: 'new-password', minLength: 6 })}
        {field('confirmPassword', 'Confirm password', 'password', { autoComplete: 'new-password', minLength: 6 })}
      </div>
      <p className="-mt-2 text-xs text-slate-500">Use at least 6 characters.</p>

      <button className="btn-primary w-full py-3" disabled={busy}>
        {busy ? <><Spinner /> Creating account…</> : 'Create account'}
      </button>

      <p className="text-center text-sm text-slate-600">
        Already have an account? <Link to="/login" className="font-semibold text-navy hover:underline">Log in</Link>
      </p>
    </form>
  );
}
