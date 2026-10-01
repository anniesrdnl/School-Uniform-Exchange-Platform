import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkCls = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-lg transition duration-200 ${isActive ? 'bg-white/15 text-white shadow-inner' : 'text-white/75 hover:bg-white/10 hover:text-white'}`;

// Outline icons for the phone tab bar, keyed by route
const ICONS = {
  '/': 'm2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  '/browse': 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
  '/sell': 'M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  '/messages': 'M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z',
  '/profile': 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { to: '/', label: 'Home', end: true },
    { to: '/browse', label: 'Browse' },
    ...(user ? [{ to: '/sell', label: 'Sell' }, { to: '/messages', label: 'Messages' }, { to: '/profile', label: 'Profile' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <>
      {/* Top bar: always visible; holds the nav links on desktop */}
      <header className="sticky top-0 z-30 bg-navy/95 pt-[env(safe-area-inset-top)] shadow-lg shadow-navy/10 backdrop-blur supports-[backdrop-filter]:bg-navy/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5 md:py-3">
          <Link to="/" className="group flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm text-navy transition duration-300 group-hover:rotate-6 group-hover:scale-105">S</span>
            SUEPS
          </Link>

          <nav className="hidden gap-1 md:flex">
            {tabs.map((t) => <NavLink key={t.to} {...t} className={linkCls}>{t.label}</NavLink>)}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => `rounded-lg px-2.5 py-1.5 text-sm font-medium md:hidden ${isActive ? 'bg-white/15 text-white' : 'text-white/80'}`}>Admin</NavLink>
            )}
            {user ? (
              <button onClick={() => { logout(); navigate('/'); }}
                className="rounded-lg px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white">Log out</button>
            ) : (
              <>
                <Link to="/login" className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:px-3">Log in</Link>
                <Link to="/register" className="whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-navy shadow-sm transition hover:bg-sky active:scale-95">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Bottom bar: phones only, mirrors the wireframe's tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgb(15_23_42/0.06)] backdrop-blur md:hidden">
        {tabs.filter((t) => t.to !== '/admin').map((t) => (
          <NavLink key={t.to} {...t}
            className={({ isActive }) => `relative flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition active:scale-95 ${isActive ? 'text-navy' : 'text-slate-500'}`}>
            {({ isActive }) => (
              <>
                <span className={`absolute top-0 h-0.5 rounded-full bg-navy transition-all duration-300 ${isActive ? 'w-8 opacity-100' : 'w-0 opacity-0'}`} />
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={isActive ? 2 : 1.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[t.to]} />
                </svg>
                <span className="truncate">{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
