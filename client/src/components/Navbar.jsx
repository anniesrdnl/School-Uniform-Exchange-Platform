import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';

const linkCls = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 ${isActive ? 'bg-aqua text-navy' : 'text-slate-600 hover:bg-frost hover:text-navy'}`;

const ghostCls = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-frost hover:text-navy';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { to: '/', label: 'Home', icon: 'home', end: true },
    { to: '/browse', label: 'Browse', icon: 'search' },
    ...(user ? [
      { to: '/sell', label: 'Sell', icon: 'plus-circle' },
      { to: '/messages', label: 'Messages', icon: 'chat' },
      { to: '/profile', label: 'Profile', icon: 'user' },
    ] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: 'shield' }] : []),
  ];

  return (
    <>
      {/* Top bar: always visible; holds the nav links on desktop */}
      <header className="sticky top-0 z-30 border-b border-aqua/70 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5 md:py-3">
          <Link to="/" aria-label="SUEPS home" className="shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden gap-1 md:flex">
            {tabs.map((t) => <NavLink key={t.to} to={t.to} end={t.end} className={linkCls}>{t.label}</NavLink>)}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={(s) => `${linkCls(s)} md:hidden`}>Admin</NavLink>
            )}
            {user ? (
              <button onClick={() => { logout(); navigate('/'); }} className={ghostCls}>
                <Icon name="logout" className="h-4 w-4" /> Log out
              </button>
            ) : (
              <>
                <Link to="/login" className={ghostCls}>Log in</Link>
                <Link to="/register" className="btn-primary whitespace-nowrap px-3.5 py-2">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Bottom tab bar: phones only */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-aqua/70 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgb(31_78_121/0.06)] backdrop-blur md:hidden">
        {tabs.filter((t) => t.to !== '/admin').map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className={({ isActive }) => `flex min-w-0 flex-1 flex-col items-center gap-1 pb-2 pt-1.5 text-[11px] font-semibold transition active:scale-95 ${isActive ? 'text-navy' : 'text-slate-500'}`}>
            {({ isActive }) => (
              <>
                <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200 ${isActive ? 'bg-aqua' : ''}`}>
                  <Icon name={t.icon} className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
                </span>
                <span className="truncate">{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
