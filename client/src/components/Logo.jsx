import logoSrc from '../assets/logo.png';

export const BRAND = 'School Uniform Exchange Platform';

// Brand mark (assets/logo.png). Decorative: the brand name is always next to it.
// The artwork fills only ~79% of the image (transparent margin), so it is drawn at 1.25x to fill its box.
// Kept in sync with the favicon and boot screen in index.html.
export function LogoMark({ className = 'h-11 w-11' }) {
  return <img src={logoSrc} alt="" width={256} height={256} draggable={false} className={`shrink-0 scale-[1.25] object-contain ${className}`} />;
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
