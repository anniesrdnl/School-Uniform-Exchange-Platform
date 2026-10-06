import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon.jsx';

const ITEM_HEIGHT = 40; // px per item, used to decide whether the menu fits below the button
const MENU_WIDTH = 208; // w-52

// "⋯" button that opens a small menu of actions (chat list rows, chat header, single messages).
// The menu is portalled to <body> and placed with position: fixed beside the button, so scrolling lists and
// overflow-hidden cards never clip it. It opens upward when there's no room below, and closes on an outside
// click, Escape, scrolling or picking an item. Arrow keys move between items.
// items: [{ label, icon, onSelect, danger? }]
export default function ActionMenu({ label, items, className = '', buttonClassName = '', iconClassName = 'h-5 w-5' }) {
  const [pos, setPos] = useState(null); // null = closed
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const close = (focusButton = false) => {
    setPos(null);
    if (focusButton) buttonRef.current?.focus();
  };

  const toggle = (e) => {
    e.stopPropagation(); // the button can sit on top of a clickable row
    if (pos) return close();
    const r = buttonRef.current.getBoundingClientRect();
    const height = items.length * ITEM_HEIGHT + 12;
    const up = r.bottom + height + 8 > window.innerHeight && r.top > height + 8;
    const left = Math.min(Math.max(8, r.right - MENU_WIDTH), window.innerWidth - MENU_WIDTH - 8);
    setPos({ top: up ? r.top - height - 6 : r.bottom + 6, left });
  };

  useEffect(() => {
    if (!pos) return undefined;
    menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    const onPointer = (e) => {
      if (!menuRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key === 'Tab') { close(); return; }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const all = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
      const i = all.indexOf(document.activeElement);
      all[(i + (e.key === 'ArrowDown' ? 1 : -1) + all.length) % all.length]?.focus();
    };
    const onMove = () => close();
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [pos]);

  return (
    <div className={className} data-open={pos ? '' : undefined}>
      <button ref={buttonRef} type="button" onClick={toggle} aria-label={label} title={label}
        aria-haspopup="menu" aria-expanded={Boolean(pos)} aria-controls={pos ? menuId : undefined}
        className={`flex items-center justify-center rounded-full transition duration-200 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${pos ? 'bg-frost text-navy' : ''} ${buttonClassName}`}>
        <Icon name="dots" className={iconClassName} strokeWidth={2} />
      </button>

      {pos && createPortal(
        <div ref={menuRef} id={menuId} role="menu" aria-label={label} style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
          className="fixed z-[70] animate-fade-in rounded-xl bg-white p-1.5 shadow-xl shadow-navy/15 ring-1 ring-aqua">
          {items.map((item) => (
            <button key={item.label} type="button" role="menuitem" tabIndex={-1}
              onClick={() => { close(true); item.onSelect(); }}
              className={`flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium transition focus:outline-none ${item.danger
                ? 'text-red-600 hover:bg-red-50 focus:bg-red-50'
                : 'text-slate-700 hover:bg-frost hover:text-navy focus:bg-frost focus:text-navy'}`}>
              <Icon name={item.icon} className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
