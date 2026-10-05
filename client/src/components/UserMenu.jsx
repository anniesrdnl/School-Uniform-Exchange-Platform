import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import Avatar from './Avatar.jsx';

const itemCls = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-frost hover:text-navy';

// Account button with a dropdown (disclosure pattern): profile, admin, log out
export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]); // close after navigating

  // close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button ref={buttonRef} onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={panelId}
        className={`flex items-center gap-2 rounded-full p-1 transition hover:bg-frost focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:pr-3 ${open ? 'bg-frost' : ''}`}>
        <Avatar name={user.fullName} src={user.avatar} className="h-8 w-8 text-sm" />
        <span className="hidden max-w-28 truncate text-sm font-semibold text-ink sm:block">{user.fullName?.split(' ')[0]}</span>
        <Icon name="chevron-down" className={`hidden h-4 w-4 text-slate-500 transition-transform sm:block ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
        <span className="sr-only">Account menu</span>
      </button>

      {open && (
        <div id={panelId} className="card absolute right-0 mt-2 w-64 animate-fade-in p-1.5">
          <div className="flex items-center gap-3 border-b border-aqua/70 px-3 pb-3 pt-2">
            <Avatar name={user.fullName} src={user.avatar} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.fullName}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="space-y-0.5 pt-1.5">
            <Link to="/profile" className={itemCls}><Icon name="user" className="h-4 w-4" /> My profile</Link>
            {user.role === 'admin' && <Link to="/admin" className={itemCls}><Icon name="shield" className="h-4 w-4" /> Admin dashboard</Link>}
            <button onClick={onLogout} className={itemCls}><Icon name="logout" className="h-4 w-4" /> Log out</button>
          </div>
        </div>
      )}
    </div>
  );
}
