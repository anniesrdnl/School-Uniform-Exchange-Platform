// Loading placeholders: grey blocks shaped like the real layout, with a soft shimmer (.skeleton in index.css).
// Every loading state on the site uses these. Spinners are kept only inside buttons, to show an action is running.

// Card-grid page body (title, subtitle, listing cards) for pages without a placeholder of their own
function PageBody() {
  return (
    <>
      <div className="space-y-2">
        <div className="skeleton h-8 w-56 max-w-full" />
        <div className="skeleton h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => <ListingCardSkeleton key={i} />)}
      </div>
    </>
  );
}

// Generic page placeholder; page-shaped ones are in PageSkeletons.jsx
export function PageSkeleton({ label = 'Loading page' }) {
  return (
    <div className="space-y-6" role="status" aria-label={label}>
      <PageBody />
    </div>
  );
}

// Placeholder rows for lists inside a card (profile requests, my listings): thumbnail, two lines, an action
export function RowsSkeleton({ count = 2, label = 'Loading' }) {
  return (
    <div className="divide-y divide-aqua/60" role="status" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <div className="skeleton h-12 w-12 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2"><div className="skeleton h-3.5 w-1/2" /><div className="skeleton h-3 w-1/3" /></div>
          <div className="skeleton hidden h-8 w-20 rounded-lg sm:block" />
        </div>
      ))}
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
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-powder bg-white/70 px-6 py-12 text-center animate-fade-in">
      {icon && <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-aqua text-navy">{icon}</div>}
      {title && <p className="font-bold text-ink">{title}</p>}
      {children && <div className="max-w-sm text-sm text-slate-600">{children}</div>}
    </div>
  );
}
