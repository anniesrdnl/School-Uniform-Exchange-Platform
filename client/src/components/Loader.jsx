import { LogoMark } from './Logo.jsx';

// Branded full-screen loader; matches the boot screen in index.html so the hand-off is seamless.
export function FullScreenLoader() {
  return (
    <div role="status" aria-label="Loading" className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-mist">
      <LogoMark className="h-16 w-16 animate-pulse rounded-2xl shadow-xl" iconClass="h-8 w-8" />
      <p className="text-sm font-extrabold tracking-widest text-navy">SUEPS</p>
      <div className="h-1 w-28 overflow-hidden rounded-full bg-frost">
        <div className="h-full w-2/5 animate-slide rounded-full bg-navy" />
      </div>
    </div>
  );
}

export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-20 text-slate-600 animate-fade-in">
      <Spinner className="h-8 w-8 text-navy" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="skeleton aspect-square rounded-none" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-5 w-1/3" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 8, className = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4' }) {
  return (
    <div className={className} role="status" aria-label="Loading uniforms">
      {Array.from({ length: count }, (_, i) => <ListingCardSkeleton key={i} />)}
    </div>
  );
}

export function EmptyState({ icon, title, children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-denim bg-white/70 px-6 py-12 text-center animate-fade-in">
      {icon && <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-aqua text-navy">{icon}</div>}
      {title && <p className="font-bold text-ink">{title}</p>}
      {children && <div className="max-w-sm text-sm text-slate-600">{children}</div>}
    </div>
  );
}
