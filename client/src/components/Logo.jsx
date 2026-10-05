import logoSrc from '../assets/logo.png';

export const BRAND = 'School Uniform Exchange Platform';

// Brand mark (assets/logo.png). Decorative: the brand name is always next to it.
// The artwork fills only ~79% of the image (transparent margin), so it is drawn at 1.25x to fill its box.
// Kept in sync with the favicon and boot screen in index.html.
export function LogoMark({ className = 'h-11 w-11' }) {
  return <img src={logoSrc} alt="" width={256} height={256} draggable={false} className={`shrink-0 scale-[1.25] object-contain ${className}`} />;
}

// Header brand: the mark in white on a Midnight tile, then the name. Below lg the name stacks on two lines
// (room for the nav); from lg it sits on one line with the tagline underneath.
export default function Logo() {
  return (
    <span className="group flex items-center gap-2.5 lg:gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 bg-linear-to-br from-[#264a71] to-navy-deep shadow-md shadow-navy/25 transition duration-300 group-hover:-rotate-6 group-hover:scale-105">
        <LogoMark className="h-6 w-6 brightness-0 invert" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="whitespace-nowrap text-[13px] font-extrabold leading-[1.15] tracking-tight text-navy sm:text-sm lg:text-[15px]">
          School Uniform <br className="lg:hidden" />Exchange Platform
        </span>
        <span className="mt-0.5 hidden text-[11px] font-medium tracking-wide text-slate-500 lg:block">Exchange • Reuse • Support students</span>
      </span>
    </span>
  );
}
