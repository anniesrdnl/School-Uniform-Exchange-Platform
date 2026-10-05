import Icon from './Icon.jsx';

export const BRAND = 'School Uniform Exchange Platform';

// Brand mark (shirt in a navy tile); kept in sync with the boot screen in index.html
export function LogoMark({ className = 'h-9 w-9 rounded-xl', iconClass = 'h-5 w-5' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center bg-navy text-white shadow-sm shadow-navy/25 ${className}`} aria-hidden="true">
      <Icon name="shirt" className={iconClass} strokeWidth={1.8} />
    </span>
  );
}

// Mark + full name stacked on two lines so it fits beside the nav actions on phones
export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="flex flex-col text-[13px] font-extrabold leading-[1.15] tracking-tight text-navy sm:text-sm">
        <span>School Uniform</span>
        <span>Exchange Platform</span>
      </span>
    </span>
  );
}
