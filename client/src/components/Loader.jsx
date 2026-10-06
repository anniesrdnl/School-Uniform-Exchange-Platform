// Loading placeholders: grey blocks shaped like the real layout, with a soft shimmer (.skeleton in index.css).
// Every loading state on the site uses these. Spinners are kept only inside buttons, to show an action is running.

// Card-grid page body (title, subtitle, listing cards), shared by the app and page placeholders below
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

// Whole-app placeholder while the saved login is checked: the floating header, then a page of cards.
// Matches the boot screen in index.html, so the hand-off from plain HTML to React is seamless.
export function AppSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="fixed inset-0 z-50 overflow-hidden bg-mist">
      <div className="px-3 pt-[calc(0.5rem+env(safe-area-inset-top))] sm:px-4 sm:pt-[calc(0.75rem+env(safe-area-inset-top))] lg:px-8" aria-hidden="true">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-2xl bg-white px-3 shadow-lg shadow-navy/5 ring-1 ring-navy/5 sm:h-16 sm:px-5 lg:px-6 2xl:max-w-[88rem]">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-xl" />
            <div className="hidden space-y-1.5 sm:block"><div className="skeleton h-3.5 w-48" /><div className="skeleton h-2.5 w-32" /></div>
          </div>
          <div className="hidden gap-8 md:flex">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-3.5 w-16" />)}</div>
          <div className="flex items-center gap-2">
            <div className="skeleton h-10 w-10 rounded-full" />
            <div className="skeleton hidden h-11 w-24 rounded-full md:block" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-3 sm:pt-6 lg:px-8 2xl:max-w-[88rem]" aria-hidden="true">
        <PageBody />
      </div>
    </div>
  );
}

// Placeholder for a page whose data (or login check) isn't ready yet
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
