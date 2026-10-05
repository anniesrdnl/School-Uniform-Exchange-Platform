import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';
import UserMenu from './UserMenu.jsx';

const pillCls = ({ isActive }) =>
  `rounded-full px-4 py-1.5 text-sm font-semibold transition duration-200 ${isActive ? 'bg-white text-navy shadow-sm shadow-navy/10' : 'text-slate-600 hover:text-navy'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Desktop centre links; Sell and the account menu sit on the right
  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/browse', label: 'Browse' },
    ...(user ? [{ to: '/messages', label: 'Messages' }] : []),
  ];

  // Phone tab bar
  const tabs = [
    { to: '/', label: 'Home', icon: 'home', end: true },
    { to: '/browse', label: 'Browse', icon: 'search' },
    ...(user ? [
      { to: '/sell', label: 'Sell', icon: 'plus-circle' },
      { to: '/messages', label: 'Messages', icon: 'chat' },
      { to: '/profile', label: 'Profile', icon: 'user' },
    ] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-aqua/70 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link to="/" className="shrink-0 justify-self-start rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 rounded-full bg-frost p-1 ring-1 ring-inset ring-aqua/70 md:flex">
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={pillCls}>{l.label}</NavLink>)}
          </nav>

          <div className="flex items-center justify-end gap-2">
            {user ? (
              <>
                <Link to="/sell" className="btn-primary hidden rounded-full py-2 pl-3 pr-4 md:inline-flex">
                  <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} /> Sell
                </Link>
                <UserMenu user={user} onLogout={() => { logout(); navigate('/'); }} />
              </>
            ) : (
              <>
                <Link to="/login" className="hidden whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-frost hover:text-navy min-[360px]:inline-flex">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary whitespace-nowrap rounded-full px-4 py-2">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Bottom tab bar: phones only */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-aqua/70 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgb(31_95_99/0.06)] backdrop-blur md:hidden">
        {tabs.map((t) => (
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
