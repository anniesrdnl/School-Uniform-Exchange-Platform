import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkCls = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-lg transition duration-200 ${isActive ? 'bg-white/15 text-white shadow-inner' : 'text-white/75 hover:bg-white/10 hover:text-white'}`;

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
      <header className="sticky top-0 z-30 bg-navy/95 shadow-lg shadow-navy/10 backdrop-blur supports-[backdrop-filter]:bg-navy/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm text-navy transition duration-300 group-hover:rotate-6 group-hover:scale-105">S</span>
            SUEPS
          </Link>

          <nav className="hidden gap-1 md:flex">
            {tabs.map((t) => <NavLink key={t.to} {...t} className={linkCls}>{t.label}</NavLink>)}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <button onClick={() => { logout(); navigate('/'); }}
                className="rounded-lg px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white">Log out</button>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white">Log in</Link>
                <Link to="/register" className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-navy shadow-sm transition hover:bg-sky active:scale-95">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Bottom bar: phones only, mirrors the wireframe's tab bar */}
      {user && (
        <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-4px_20px_rgb(15_23_42/0.06)] backdrop-blur md:hidden">
          {tabs.filter((t) => t.to !== '/admin').map((t) => (
            <NavLink key={t.to} {...t}
              className={({ isActive }) => `relative flex flex-col items-center px-2 py-2 text-xs font-medium transition ${isActive ? 'text-navy' : 'text-slate-500'}`}>
              {({ isActive }) => (
                <>
                  <span className={`absolute top-0 h-0.5 rounded-full bg-navy transition-all duration-300 ${isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'}`} />
                  {t.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </>
  );
}
