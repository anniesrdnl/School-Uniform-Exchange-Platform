import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api.js';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';
import Avatar from './Avatar.jsx';
import UserMenu from './UserMenu.jsx';
import { showsHelpChat } from './HelpChat.jsx';

// Number of chats with unread messages (muted chats don't count). Checked every 30 seconds while the tab is visible,
// and updated straight away by the Messages page (a 'sueps:unread' event) as chats are read, muted or deleted.
function useUnreadCount(userId) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!userId) { setCount(0); return undefined; }
    const load = () => {
      if (!document.hidden) api.get('/messages/unread').then((r) => setCount(r.data.count)).catch(() => {});
    };
    const onUpdate = (e) => setCount(e.detail);
    load();
    const timer = setInterval(load, 30000);
    window.addEventListener('sueps:unread', onUpdate);
    document.addEventListener('visibilitychange', load);
    return () => {
      clearInterval(timer);
      window.removeEventListener('sueps:unread', onUpdate);
      document.removeEventListener('visibilitychange', load);
    };
  }, [userId]);
  return count;
}

// Small count bubble; screen readers hear "N unread"
function UnreadBadge({ count, className = '' }) {
  if (!count) return null;
  return (
    <span className={`inline-flex h-[1.125rem] min-w-[1.125rem] animate-pop items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ${className}`}>
      {count > 9 ? '9+' : count}<span className="sr-only"> unread</span>
    </span>
  );
}

// Phone tab: solid icon + Midnight label when active, outline icon when not (shape changes too, not just colour)
function Tab({ tab, user }) {
  return (
    <NavLink to={tab.to} end={tab.end}
      className={({ isActive }) => `group flex h-[3.85rem] min-w-0 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors duration-200 ${isActive ? 'text-navy' : 'text-slate-500 hover:text-navy'}`}>
      {({ isActive }) => (
        <>
          <span className="relative flex h-7 w-7 items-center justify-center transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-90">
            <UnreadBadge count={tab.badge} className="absolute -right-2 -top-1 ring-2 ring-white" />
            {tab.avatar
              ? <Avatar name={user.fullName} src={user.avatar}
                  className={`h-7 w-7 text-xs ring-2 ring-offset-2 ring-offset-white transition ${isActive ? 'ring-navy' : 'ring-transparent'}`} />
              : <Icon name={tab.icon} solid={isActive} className={`h-6 w-6 ${isActive ? 'animate-pop' : ''}`} strokeWidth={1.7} />}
          </span>
          <span className="max-w-full truncate px-1">{tab.label}</span>
        </>
      )}
    </NavLink>
  );
}

// Raised centre button that sits in the notch cut out of the bar (.tabbar-notch in index.css):
// Sell when logged in, Browse when logged out
function CenterButton({ tab }) {
  return (
    <NavLink to={tab.to} end={tab.end}
      className={({ isActive }) => `absolute left-1/2 top-0 flex h-[3.75rem] w-[3.75rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold text-mist shadow-md shadow-navy/25 transition duration-200 hover:-translate-y-[calc(50%+3px)] hover:shadow-lg active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${isActive ? 'bg-navy-deep ring-2 ring-inset ring-mist/40' : 'bg-navy hover:bg-navy-deep'}`}>
      <Icon name={tab.icon} className="h-6 w-6" strokeWidth={2.2} />
      {tab.label}
    </NavLink>
  );
}

// Header actions: round icon buttons, and the call to action as a raised Midnight pill.
// No display class in these: each use adds flex/inline-flex (or hidden + a breakpoint) itself.
const iconBtn = 'h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition duration-200 hover:bg-frost hover:text-navy active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy';
const cta = 'btn-shine h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-linear-to-b from-[#264a71] to-navy px-4 text-sm font-semibold text-white shadow-lg shadow-navy/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-navy/35 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:h-11 sm:px-6';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Logged-in users are redirected from / to /home, so Home must point there to ever show as active
  const home = user ? '/home' : '/';
  const { pathname } = useLocation();
  const unread = useUnreadCount(user?._id);
  // Once you scroll, the info strip folds away and the card's shadow deepens
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Desktop centre links; Sell and the account menu sit on the right
  const links = [
    { to: home, label: 'Home', end: true },
    { to: '/browse', label: 'Browse' },
    ...(user ? [{ to: '/messages', label: 'Messages', badge: unread }] : []),
  ];

  // Phone tab bar: same notched design either way. The middle button is raised:
  // Sell when logged in, Browse (the logged-out bar keeps its three buttons) when logged out
  const tabs = user
    ? [
        { to: home, label: 'Home', icon: 'home', end: true },
        { to: '/browse', label: 'Browse', icon: 'search' },
        { to: '/sell', label: 'Sell', icon: 'plus', center: true },
        { to: '/messages', label: 'Messages', icon: 'chat', badge: unread },
        { to: '/profile', label: 'Profile', avatar: true },
      ]
    : [
        { to: home, label: 'Home', icon: 'home', end: true },
        { to: '/browse', label: 'Browse', icon: 'search', center: true },
        { to: '/login', label: 'Log in', icon: 'user' },
      ];

  return (
    <>
      {/* Floating white card: a slim info strip on top (desktop, folds away on scroll), then brand, links and actions */}
      <header className="sticky top-0 z-30 px-3 pt-[calc(0.5rem+env(safe-area-inset-top))] sm:px-4 sm:pt-[calc(0.75rem+env(safe-area-inset-top))] lg:px-8">
        <div className={`mx-auto max-w-7xl rounded-2xl bg-white 2xl:max-w-[88rem] ring-1 ring-navy/5 transition-shadow duration-300 ${scrolled
          ? 'shadow-xl shadow-navy/10'
          : 'shadow-lg shadow-navy/5'}`}>
          <div className={`hidden overflow-hidden rounded-t-2xl bg-linear-to-r [@media(max-height:40rem)]:hidden! from-cream/80 via-white to-frost transition-[max-height,opacity] duration-300 md:block ${scrolled
            ? 'max-h-0 opacity-0'
            : 'max-h-10 opacity-100'}`}>
            <div className="flex h-9 items-center justify-between gap-4 px-6 text-xs text-slate-600">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1.5"><Icon name="shield" className="h-3.5 w-3.5 text-navy" /> Safe meetups on campus</span>
                <span className="flex items-center gap-1.5"><Icon name="recycle" className="h-3.5 w-3.5 text-navy" /> Free to join · buy, sell or swap</span>
              </div>
              {showsHelpChat(pathname) && (
                <button type="button" onClick={() => window.dispatchEvent(new Event('sueps:open-help'))}
                  className="group flex items-center gap-1.5 rounded-full font-medium transition-colors hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy">
                  <Icon name="help" className="h-3.5 w-3.5 text-navy" /> Need help? <span className="underline-offset-2 group-hover:underline">Ask our assistant</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex h-14 items-center justify-between gap-3 px-3 sm:h-16 sm:px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-6">
            <Link to="/" className="shrink-0 justify-self-start rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">
              <Logo />
            </Link>

            {/* plain text links; a short Midnight bar grows under the current page */}
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <NavLink key={l.label} to={l.to} end={l.end}
                  className={({ isActive }) => `relative rounded-full px-3 py-2 text-sm font-semibold transition-colors duration-200 after:absolute after:inset-x-3 after:bottom-0.5 lg:px-4 lg:after:inset-x-4 after:h-0.5 after:rounded-full after:bg-navy after:transition-transform after:duration-200 focus-visible:outline-2 focus-visible:outline-navy ${isActive
                    ? 'text-navy after:scale-x-100'
                    : 'text-slate-500 after:scale-x-0 hover:text-navy hover:after:scale-x-50'}`}>
                  {l.label}{l.badge > 0 && <UnreadBadge count={l.badge} className="ml-1.5 align-[1px]" />}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center justify-end gap-1 sm:gap-2">
              <Link to="/browse" aria-label="Search uniforms" title="Search uniforms" className={`${iconBtn} hidden lg:flex`}>
                <Icon name="search" className="h-5 w-5" />
              </Link>
              {user ? (
                <>
                  <UserMenu user={user} onLogout={() => { logout(); navigate('/'); }} />
                  <Link to="/sell" className={`${cta} hidden md:inline-flex`}>
                    <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} /> Sell
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" aria-label="Log in" title="Log in" className={`${iconBtn} flex`}>
                    <Icon name="user" className="h-5 w-5" />
                  </Link>
                  <Link to="/register" className={`${cta} inline-flex`}>Sign up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom tab bar: phones only. The white shape is a separate layer so the notch can be masked out of it
          while drop-shadow (on the nav) still follows the notched outline */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 drop-shadow-[0_-6px_16px_rgb(14_54_97/0.10)] md:hidden">
        <div className="tabbar-notch absolute inset-0 rounded-t-[1.75rem] bg-white" aria-hidden="true" />
        <ul className="relative grid px-2 pb-[env(safe-area-inset-bottom)]" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((t) => (
            <li key={t.label} className="relative">
              {t.center ? <CenterButton tab={t} /> : <Tab tab={t} user={user} />}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
