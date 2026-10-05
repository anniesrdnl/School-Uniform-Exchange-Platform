import Icon from './Icon.jsx';

// Brand mark (shirt in a navy tile) with optional wordmark; kept in sync with the boot screen in index.html
export function LogoMark({ className = 'h-9 w-9 rounded-xl', iconClass = 'h-5 w-5' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center bg-navy text-white shadow-sm shadow-navy/25 ${className}`} aria-hidden="true">
      <Icon name="shirt" className={iconClass} strokeWidth={1.8} />
    </span>
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="text-lg font-extrabold tracking-tight text-navy">SUEPS</span>
    </span>
  );
}
