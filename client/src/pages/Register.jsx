import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';
import { Spinner } from '../components/Loader.jsx';
import Icon from '../components/Icon.jsx';
import AuthLayout, { AuthFooter, AuthHeading } from '../components/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';

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

  const passwordField = (id, label, props = {}) => (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <PasswordInput id={id} required minLength={6} autoComplete="new-password" value={form[id]} onChange={set(id)} {...props} />
    </div>
  );

  const layout = { tag: 'New member', headline: 'Pass it on. Save on the next one.', text: 'Join students who buy, sell, and swap school uniforms on campus.' };

  if (done) {
    return (
      <AuthLayout {...layout}>
        <div className="space-y-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700 ring-1 ring-inset ring-green-200">
            <Icon name="check" className="h-7 w-7" strokeWidth={2.5} />
          </span>
          <h1 className="page-title">Account created!</h1>
          <p role="status" className="text-sm leading-relaxed text-slate-600">
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
      </AuthLayout>
    );
  }

  return (
    <AuthLayout {...layout}>
      <form onSubmit={submit} className="space-y-4 sm:space-y-5">
        <AuthHeading title="Create your account" subtitle="Free to join. It takes about a minute." />

        {error && <p role="alert" className="alert-error animate-fade-up">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {field('fullName', 'Full name', 'text', { autoComplete: 'name' })}
          {field('studentId', 'Student ID')}
        </div>
        {field('email', 'Email address', 'email', { autoComplete: 'email' })}
        <div className="grid gap-4 sm:grid-cols-2">
          {field('program', 'Program / Course')}
          <div>
            <label className="label" htmlFor="yearLevel">Year level</label>
            <select id="yearLevel" className="input" value={form.yearLevel} onChange={set('yearLevel')}>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {passwordField('password', 'Password', { 'aria-describedby': 'password-hint' })}
            {passwordField('confirmPassword', 'Confirm password')}
          </div>
          <p id="password-hint" className="mt-1.5 text-xs text-slate-500">Use at least 6 characters.</p>
        </div>

        <button className="btn-primary w-full py-3" disabled={busy}>
          {busy ? <><Spinner /> Creating account…</> : 'Create account'}
        </button>

        <AuthFooter>
          Already have an account? <Link to="/login" className="font-semibold text-navy hover:underline">Log in</Link>
        </AuthFooter>
      </form>
    </AuthLayout>
  );
}
