import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';
import Avatar from './Avatar.jsx';
import UserMenu from './UserMenu.jsx';

const pillCls = ({ isActive }) =>
  `rounded-full px-4 py-1.5 text-sm font-semibold transition duration-200 active:scale-95 ${isActive
    ? 'bg-white text-navy shadow-sm shadow-navy/10'
    : 'text-slate-600 hover:bg-white/60 hover:text-navy'}`;

// Phone tab: solid icon + Midnight label when active, outline icon when not (shape changes too, not just colour)
function Tab({ tab, user }) {
  return (
    <NavLink to={tab.to} end={tab.end}
      className={({ isActive }) => `group flex h-[4.25rem] min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors duration-200 ${isActive ? 'text-navy' : 'text-slate-500 hover:text-navy'}`}>
      {({ isActive }) => (
        <>
          <span className="flex h-7 w-7 items-center justify-center transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-90">
            {tab.avatar
              ? <Avatar name={user.fullName} src={user.avatar}
                  className={`h-7 w-7 text-xs ring-2 ring-offset-2 ring-offset-white transition ${isActive ? 'ring-navy' : 'ring-transparent'}`} />
              : <Icon name={tab.icon} solid={isActive} className="h-6 w-6" strokeWidth={1.7} />}
          </span>
          <span className="max-w-full truncate px-1">{tab.label}</span>
        </>
      )}
    </NavLink>
  );
}

// Raised Sell button that sits in the notch cut out of the bar (.tabbar-notch in index.css)
function SellButton() {
  return (
    <NavLink to="/sell"
      className={({ isActive }) => `absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold text-mist shadow-md shadow-navy/25 transition duration-200 hover:-translate-y-[calc(50%+3px)] hover:shadow-lg active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${isActive ? 'bg-navy-deep ring-2 ring-inset ring-mist/40' : 'bg-navy hover:bg-navy-deep'}`}>
      <Icon name="plus" className="h-6 w-6" strokeWidth={2.2} />
      Sell
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Logged-in users are redirected from / to /home, so Home must point there to ever show as active
  const home = user ? '/home' : '/';

  // Desktop centre links; Sell and the account menu sit on the right
  const links = [
    { to: home, label: 'Home', end: true },
    { to: '/browse', label: 'Browse' },
    ...(user ? [{ to: '/messages', label: 'Messages' }] : []),
  ];

  // Phone tab bar: Sell takes the raised centre slot when logged in
  const tabs = user
    ? [
        { to: home, label: 'Home', icon: 'home', end: true },
        { to: '/browse', label: 'Browse', icon: 'search' },
        { center: true },
        { to: '/messages', label: 'Messages', icon: 'chat' },
        { to: '/profile', label: 'Profile', avatar: true },
      ]
    : [
        { to: home, label: 'Home', icon: 'home', end: true },
        { to: '/browse', label: 'Browse', icon: 'search' },
        { to: '/login', label: 'Log in', icon: 'user' },
      ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-aqua/70 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link to="/" className="shrink-0 justify-self-start rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 rounded-full bg-frost p-1 ring-1 ring-inset ring-aqua/70 md:flex">
            {links.map((l) => <NavLink key={l.label} to={l.to} end={l.end} className={pillCls}>{l.label}</NavLink>)}
          </nav>

          <div className="flex items-center justify-end gap-2">
            {user ? (
              <>
                <Link to="/sell" className="btn-primary hidden py-2 pl-3 pr-4 hover:-translate-y-px hover:shadow-md md:inline-flex">
                  <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} /> Sell
                </Link>
                <UserMenu user={user} onLogout={() => { logout(); navigate('/'); }} />
              </>
            ) : (
              <>
                <Link to="/login" className="hidden whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-frost hover:text-navy active:scale-95 min-[360px]:inline-flex">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary whitespace-nowrap px-4 py-2 hover:-translate-y-px hover:shadow-md">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Bottom tab bar: phones only. The white shape is a separate layer so the notch can be masked out of it
          while drop-shadow (on the nav) still follows the notched outline */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 drop-shadow-[0_-6px_16px_rgb(16_46_74/0.10)] md:hidden">
        <div className={`absolute inset-0 rounded-t-[1.75rem] bg-white ${user ? 'tabbar-notch' : ''}`} aria-hidden="true" />
        <ul className="relative grid px-2 pb-[env(safe-area-inset-bottom)]" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((t) => (
            <li key={t.center ? 'sell' : t.label} className="relative">
              {t.center ? <SellButton /> : <Tab tab={t} user={user} />}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
