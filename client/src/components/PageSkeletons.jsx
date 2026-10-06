import { useLocation } from 'react-router-dom';
import { ListingCardSkeleton, PageSkeleton, RowsSkeleton } from './Loader.jsx';
import { BROWSE_GRID } from '../constants.js';

// Page-shaped loading placeholders. Each one copies the real page's layout (same grid, spacing, card and control
// sizes) so nothing jumps when the content arrives. Pages use the pieces below while their data loads, and
// RouteSkeleton picks the right whole-page placeholder while the login check or a page guard is still running.
// The plain-HTML boot screen in index.html mirrors these shapes for the moment before React starts.

const Bone = ({ className = '' }) => <div className={`skeleton ${className}`} />;
const Dark = ({ className = '' }) => <div className={`skeleton-dark ${className}`} />;

// Announced once to screen readers; the grey shapes themselves are hidden from them
function Shell({ label, className = '', children }) {
  return (
    <div role="status" aria-label={label}>
      <div aria-hidden="true" className={className}>{children}</div>
    </div>
  );
}

// Same type scale as .page-title / .page-subtitle
function TitleBlock({ title = 'w-56', subtitle = 'w-80' }) {
  return (
    <div>
      <Bone className={`h-8 max-w-full sm:h-9 ${title}`} />
      <Bone className={`mt-2 h-4 max-w-full sm:h-5 ${subtitle}`} />
    </div>
  );
}

function Field({ label = 'w-20', input = 'h-11 rounded-xl' }) {
  return (
    <div>
      <Bone className={`mb-1.5 h-4 ${label}`} />
      <Bone className={input} />
    </div>
  );
}

// Underline tab row (Browse categories, Home "Recently listed")
function TabRow({ widths }) {
  return (
    <div className="-mx-4 flex h-10 items-center gap-6 overflow-hidden px-4 shadow-[inset_0_-1px_0_var(--color-aqua)] sm:mx-0 sm:h-11 sm:px-0">
      {widths.map((w, i) => <Bone key={i} className={`h-3.5 shrink-0 ${w}`} />)}
    </div>
  );
}

/* ---------------------------------------------------------------- Home (logged in) */

const HERO_STACK = ['left-1/2 top-8 z-30 -translate-x-1/2', 'right-0 top-0 z-20 rotate-[6deg]', 'left-0 top-14 z-10 -rotate-[7deg]'];

export function HomeSkeleton() {
  return (
    <Shell label="Loading home" className="space-y-8 sm:space-y-14">
      <section className="rounded-3xl bg-navy px-4 py-6 shadow-xl shadow-navy/20 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="min-w-0">
            <Dark className="h-4 w-36" />
            <div className="mt-3 space-y-2.5">
              <Dark className="h-9 w-11/12 max-w-md sm:h-12" />
              <Dark className="h-9 w-2/3 max-w-sm sm:h-12" />
            </div>
            <Dark className="mt-4 h-4 w-full max-w-lg" />
            <Dark className="mt-2 h-4 w-3/4 max-w-md" />
            <Dark className="mt-5 h-12 max-w-xl rounded-2xl sm:mt-7 sm:h-14" />
            <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
              {['w-14', 'w-20', 'w-24', 'w-20'].map((w, i) => <Dark key={i} className={`h-7 rounded-full ${w}`} />)}
            </div>
            <Dark className="mt-5 h-11 w-40 rounded-xl sm:mt-8" />
          </div>
          <div className="relative hidden h-[23rem] lg:block">
            {HERO_STACK.map((pos) => (
              <div key={pos} className={`absolute ${pos}`}>
                <div className="w-48 space-y-2 rounded-2xl bg-white/10 p-2 ring-1 ring-white/15">
                  <Dark className="aspect-square rounded-xl" />
                  <Dark className="h-3.5 w-3/4" />
                  <Dark className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <Bone className="mb-4 h-6 w-44" />
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card flex items-center gap-2.5 p-3 sm:gap-3 sm:p-4">
              <Bone className="h-9 w-9 shrink-0 rounded-xl sm:h-12 sm:w-12" />
              <div className="flex-1 space-y-1.5"><Bone className="h-3.5 w-4/5" /><Bone className="h-3 w-14" /></div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between"><Bone className="h-6 w-36" /><Bone className="h-4 w-14" /></div>
        <div className="mb-4 mt-1 sm:mb-5 sm:mt-2"><TabRow widths={['w-6', 'w-24', 'w-24', 'w-20', 'w-24']} /></div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <ListingCardSkeleton key={i} />)}
        </div>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------- Landing page (logged out "/") */

export function SplashSkeleton() {
  return (
    <Shell label="Loading" className="py-1 sm:py-8">
      <section className="grid items-center gap-10 sm:gap-14 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-center lg:items-start">
          <Bone className="h-8 w-64 max-w-full rounded-full" />
          <div className="mt-6 flex w-full flex-col items-center gap-3 lg:items-start">
            <Bone className="h-10 w-3/5 max-w-xs sm:h-12 lg:h-14" />
            <Bone className="h-10 w-4/5 max-w-md sm:h-12 lg:h-14" />
            <Bone className="h-10 w-3/4 max-w-sm sm:h-12 lg:h-14" />
          </div>
          <Bone className="mt-5 h-4 w-full max-w-md" />
          <Bone className="mt-2 h-4 w-3/4 max-w-sm" />
          <div className="mt-7 flex gap-2.5 sm:mt-8 sm:gap-3">
            <Bone className="h-11 w-36 rounded-xl sm:h-12 sm:w-44" />
            <Bone className="h-11 w-32 rounded-xl sm:h-12 sm:w-40" />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 sm:mt-8 lg:justify-start">
            {[0, 1, 2].map((i) => <Bone key={i} className="h-4 w-28" />)}
          </div>
        </div>
        <div className="mx-auto w-full max-w-lg pb-8 lg:max-w-none">
          <Bone className="aspect-[4/3] w-full rounded-3xl" />
        </div>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------- Browse */

export function BrowseSkeleton() {
  return (
    <Shell label="Loading uniforms" className="space-y-4 sm:space-y-6">
      <div className="space-y-3.5 sm:space-y-5">
        <TitleBlock title="w-60" subtitle="w-96" />
        {/* search bar: icon, text, Search button */}
        <div className="flex h-12 max-w-2xl items-center gap-3 rounded-2xl bg-white pl-4 pr-1 shadow-sm shadow-navy/5 ring-1 ring-aqua sm:h-14 sm:pr-1.5">
          <Bone className="h-5 w-5 shrink-0 rounded-full" />
          <Bone className="h-4 w-48 max-w-full" />
          <Bone className="ml-auto h-10 w-20 shrink-0 rounded-xl sm:h-11 sm:w-24" />
        </div>
        <TabRow widths={['w-10', 'w-28', 'w-28', 'w-24', 'w-28']} />
      </div>

      <div className="lg:grid lg:grid-cols-[17rem_1fr] lg:items-start lg:gap-8">
        <div className="card hidden p-5 lg:block">
          <div className="mb-5 border-b border-aqua/70 pb-4"><Bone className="h-5 w-20" /></div>
          <div className="space-y-6">
            <div className="space-y-3"><Bone className="h-4 w-12" /><Bone className="h-9 rounded-xl" /></div>
            <div className="space-y-3">
              <Bone className="h-4 w-20" />
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3"><Bone className="h-[18px] w-[18px] shrink-0 rounded-full" /><Bone className="h-3.5 w-28" /></div>
              ))}
            </div>
            <div className="space-y-3">
              <Bone className="h-4 w-12" />
              <div className="grid grid-cols-2 gap-1.5">{[0, 1, 2, 3].map((i) => <Bone key={i} className="h-8 rounded-lg" />)}</div>
              <Bone className="h-10 rounded-xl" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <Bone className="h-4 w-28" />
            <div className="flex gap-2"><Bone className="h-10 w-24 rounded-xl lg:hidden" /><Bone className="h-10 w-36 rounded-xl" /></div>
          </div>
          <div className="mt-4">
            <div className={BROWSE_GRID}>{Array.from({ length: 8 }, (_, i) => <ListingCardSkeleton key={i} />)}</div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------------------------------------------------------- Listing details */

export function DetailsSkeleton() {
  return (
    <Shell label="Loading listing" className="space-y-5 sm:space-y-6">
      <div className="flex items-center gap-2"><Bone className="h-4 w-14" /><Bone className="h-4 w-24" /><Bone className="h-4 w-32" /></div>
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-8">
        <div className="space-y-3 lg:col-span-7">
          <Bone className="aspect-square rounded-3xl sm:aspect-[4/3]" />
          <div className="flex gap-2 py-1.5">{[0, 1, 2].map((i) => <Bone key={i} className="h-16 w-16 rounded-xl sm:h-20 sm:w-20" />)}</div>
        </div>

        <div className="card p-5 sm:p-6 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2"><Bone className="h-6 w-20 rounded-full" /><Bone className="h-6 w-24 rounded-full" /></div>
            <Bone className="h-3 w-24" />
          </div>
          <Bone className="mt-4 h-8 w-3/4" />
          <Bone className="mt-2 h-9 w-1/3" />
          <div className="mt-5 grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-frost/70 px-3 py-2.5 ring-1 ring-inset ring-aqua/70">
                <Bone className="h-9 w-9 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-1.5"><Bone className="h-3 w-12" /><Bone className="h-4 w-4/5" /></div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3 border-y border-aqua/70 py-4">
            <Bone className="h-11 w-11 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5"><Bone className="h-3 w-12" /><Bone className="h-4 w-32" /><Bone className="h-3 w-24" /></div>
            <Bone className="h-3 w-16" />
          </div>
          <div className="mt-5 space-y-4">
            <div><Bone className="mb-1.5 h-4 w-20" /><Bone className="h-12 rounded-xl" /></div>
            <div><Bone className="mb-1.5 h-4 w-36" /><Bone className="h-[4.25rem] rounded-xl" /></div>
            <div className="grid gap-2 sm:grid-cols-2"><Bone className="h-12 rounded-xl" /><Bone className="h-12 rounded-xl" /></div>
          </div>
          <Bone className="mt-5 h-12 rounded-xl" />
        </div>

        <div className="space-y-3 lg:col-span-7">
          <Bone className="h-6 w-48" />
          <Bone className="h-4 w-full max-w-prose" />
          <Bone className="h-4 w-11/12 max-w-prose" />
          <Bone className="h-4 w-2/3 max-w-prose" />
        </div>
      </div>
    </Shell>
  );
}

/* ---------------------------------------------------------------- Messages */

// Card that holds the chat list and chat pane (shared with Messages.jsx so the placeholder lines up exactly)
export const MESSAGES_CARD = 'card -mx-4 grid h-[calc(100dvh-11.4rem-env(safe-area-inset-bottom))] overflow-hidden rounded-none border-x-0 sm:mx-0 sm:rounded-3xl sm:border-x md:h-[min(calc(100dvh-12.5rem),52rem)] md:min-h-[30rem] md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr]';

// Conversation rows: avatar, name + time, uniform title, last message
export function ConversationListSkeleton() {
  return (
    <div className="space-y-1 p-2" role="status" aria-label="Loading conversations">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3" aria-hidden="true">
          <Bone className="h-11 w-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between gap-2"><Bone className="h-3.5 w-1/2" /><Bone className="h-3 w-10" /></div>
            <Bone className="h-3 w-2/3" />
            <Bone className="h-3 w-11/12" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Chat bubbles on both sides, like a real conversation
const BUBBLES = [['in', 'w-44'], ['in', 'w-60'], ['out', 'w-52'], ['in', 'w-36'], ['out', 'w-64'], ['out', 'w-40'], ['in', 'w-56']];
export function ChatBubblesSkeleton() {
  return (
    <div className="flex min-h-full flex-col justify-end gap-2.5" role="status" aria-label="Loading messages">
      {BUBBLES.map(([side, width], i) => (
        <div key={i} className={`flex items-end gap-2 ${side === 'out' ? 'justify-end' : ''}`} aria-hidden="true">
          {side === 'in' && <Bone className="h-7 w-7 shrink-0 rounded-full" />}
          <Bone className={`h-9 max-w-[70%] rounded-2xl ${width}`} />
        </div>
      ))}
    </div>
  );
}

// Chat header: avatar, name and status line
export function ChatHeaderSkeleton() {
  return (
    <div className="flex flex-1 items-center gap-3" aria-hidden="true">
      <Bone className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-1.5"><Bone className="h-3.5 w-36" /><Bone className="h-3 w-24" /></div>
    </div>
  );
}

// Whole Messages page. chatOpen (?c= in the URL): phones show the chat instead of the list
export function MessagesPageSkeleton({ chatOpen = false }) {
  return (
    <div className={MESSAGES_CARD} role="status" aria-label="Loading messages">
      <div className={`min-h-0 flex-col border-aqua/70 bg-white md:flex md:border-r ${chatOpen ? 'hidden' : 'flex'}`} aria-hidden="true">
        <div className="space-y-3 border-b border-aqua/70 p-4">
          <div className="flex items-center justify-between"><Bone className="h-7 w-32" /><Bone className="h-5 w-8 rounded-full" /></div>
          <Bone className="h-11 rounded-full" />
          <Bone className="h-10 rounded-xl" />
        </div>
        <ConversationListSkeleton />
      </div>
      <div className={`relative min-h-0 flex-col md:flex ${chatOpen ? 'flex' : 'hidden'}`} aria-hidden="true">
        <div className="chat-bg" />
        {chatOpen ? (
          <>
            <div className="relative flex items-center gap-3 border-b border-aqua/70 bg-white/85 px-3 py-3 sm:px-4"><ChatHeaderSkeleton /></div>
            <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-4 sm:px-5"><ChatBubblesSkeleton /></div>
            <div className="relative flex items-center gap-2 border-t border-aqua/70 bg-white/90 p-2 sm:p-3">
              <Bone className="h-11 w-11 shrink-0 rounded-full" /><Bone className="h-11 flex-1 rounded-full" /><Bone className="h-11 w-11 shrink-0 rounded-full" />
            </div>
          </>
        ) : (
          <div className="relative m-auto flex flex-col items-center gap-3 p-6">
            <Bone className="h-16 w-16 rounded-2xl" /><Bone className="h-5 w-44" /><Bone className="h-4 w-64" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Profile */

export function ProfileSkeleton() {
  return (
    <Shell label="Loading profile" className="space-y-6 sm:space-y-8">
      <section className="card overflow-hidden">
        <div className="h-20 bg-aqua sm:h-24" />
        <div className="flex flex-col items-center gap-4 px-5 pb-5 sm:px-6 md:flex-row md:items-end">
          <Bone className="relative -mt-10 h-20 w-20 shrink-0 rounded-full ring-4 ring-white" />
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2 md:items-start">
            <Bone className="h-7 w-48" />
            <Bone className="h-4 w-64 max-w-full" />
            <div className="mt-1 flex gap-2"><Bone className="h-5 w-28 rounded-full" /><Bone className="h-5 w-32 rounded-full" /></div>
          </div>
          <div className="flex w-full justify-center gap-3 md:w-auto">
            {[0, 1].map((i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-frost px-4 py-2.5 sm:min-w-24 md:flex-none">
                <Bone className="h-7 w-8" /><Bone className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
      {['w-56', 'w-36', 'w-32'].map((w, i) => (
        <section key={w}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <Bone className={`h-6 ${w}`} />
            {i === 2 && <Bone className="h-8 w-36 rounded-lg" />}
          </div>
          <div className="card overflow-hidden"><RowsSkeleton /></div>
        </section>
      ))}
    </Shell>
  );
}

/* ---------------------------------------------------------------- Sell */

export function SellSkeleton() {
  return (
    <Shell label="Loading form" className="mx-auto max-w-2xl space-y-4 sm:space-y-5">
      <TitleBlock title="w-52" subtitle="w-full max-w-md" />
      <div className="card divide-y divide-aqua/70">
        <section className="space-y-3 p-4 sm:p-6">
          <div className="flex justify-between"><Bone className="h-6 w-20" /><Bone className="h-3 w-8" /></div>
          <Bone className="h-[9.5rem] rounded-2xl" />
        </section>
        <section className="space-y-3.5 p-4 sm:space-y-4 sm:p-6">
          <Bone className="h-6 w-20" />
          <Field label="w-12" />
          <div className="grid gap-4 sm:grid-cols-2"><Field label="w-20" /><Field label="w-10" /></div>
          <div>
            <Bone className="mb-1.5 h-4 w-20" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <Bone key={i} className="h-10 rounded-full" />)}</div>
          </div>
          <Field label="w-24" input="h-28 rounded-xl" />
        </section>
        <section className="space-y-3.5 p-4 sm:space-y-4 sm:p-6">
          <Bone className="h-6 w-36" />
          <div className="grid gap-4 sm:grid-cols-2"><Field label="w-16" /><Field label="w-16" /></div>
          <div>
            <Bone className="mb-1.5 h-4 w-14" />
            <div className="grid gap-2 sm:grid-cols-3">{[0, 1, 2].map((i) => <Bone key={i} className="h-10 rounded-full" />)}</div>
          </div>
        </section>
        <div className="flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end sm:p-6">
          <Bone className="h-11 rounded-xl sm:w-24" /><Bone className="h-11 rounded-xl sm:w-36" />
        </div>
      </div>
    </Shell>
  );
}

/* ---------------------------------------------------------------- Admin */

export function AdminSkeleton() {
  return (
    <Shell label="Loading dashboard" className="space-y-6">
      <TitleBlock title="w-64" subtitle="w-96" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card flex items-center gap-3 p-4">
            <Bone className="hidden h-11 w-11 shrink-0 rounded-xl sm:block" />
            <div className="space-y-2"><Bone className="h-7 w-12" /><Bone className="h-3.5 w-24" /></div>
          </div>
        ))}
      </div>
      <Bone className="h-11 w-64 rounded-xl" />
      <div className="card overflow-hidden">
        <div className="h-10 bg-frost/60" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 border-t border-aqua/60 px-4 py-3">
            <div className="flex-1 space-y-1.5"><Bone className="h-4 w-40" /><Bone className="h-3 w-56 max-w-full" /></div>
            <Bone className="h-5 w-20 rounded-full" />
            <Bone className="hidden h-7 w-28 rounded-lg sm:block" />
          </div>
        ))}
      </div>
    </Shell>
  );
}

/* ---------------------------------------------------------------- Log in / Sign up */

export function AuthSkeleton({ fields = 2 }) {
  return (
    <Shell label="Loading" className="lg:flex lg:min-h-[calc(100dvh-11.5rem)] lg:items-center">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr] xl:gap-20">
        <div className="hidden lg:block">
          <Bone className="h-6 w-44 rounded-full" />
          <div className="mt-5 space-y-3"><Bone className="h-11 w-full max-w-lg" /><Bone className="h-11 w-4/5 max-w-md" /></div>
          <Bone className="mt-4 h-4 w-full max-w-md" />
          <Bone className="mt-2 h-4 w-3/4 max-w-sm" />
          <Bone className="mt-12 h-[18.5rem] w-full max-w-xl rounded-3xl" />
        </div>
        <div className="mx-auto w-full max-w-md pt-9 sm:pt-14">
          <div className="card space-y-4 rounded-3xl px-5 pb-5 pt-11 sm:space-y-5 sm:px-10 sm:pb-9 sm:pt-14">
            <div className="flex flex-col items-center gap-2"><Bone className="h-7 w-40" /><Bone className="h-4 w-56" /></div>
            {Array.from({ length: fields }, (_, i) => <Field key={i} label={i % 2 ? 'w-20' : 'w-28'} />)}
            <Bone className="h-12 rounded-xl" />
            <Bone className="mx-auto h-4 w-48" />
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------------------------------------------------------- Picking one */

const hasToken = () => {
  try { return Boolean(localStorage.getItem('token')); } catch { return false; }
};

// The placeholder that matches the page at this address
export function RouteSkeleton({ pathname, search = '' }) {
  if (pathname === '/') return hasToken() ? <HomeSkeleton /> : <SplashSkeleton />; // signed-in visitors are sent to /home
  if (pathname === '/home') return <HomeSkeleton />;
  if (pathname.startsWith('/browse')) return <BrowseSkeleton />;
  if (pathname.startsWith('/listings/')) return <DetailsSkeleton />;
  if (pathname.startsWith('/messages')) return <MessagesPageSkeleton chatOpen={new URLSearchParams(search).has('c')} />;
  if (pathname.startsWith('/profile')) return <ProfileSkeleton />;
  if (pathname.startsWith('/sell')) return <SellSkeleton />;
  if (pathname.startsWith('/admin')) return <AdminSkeleton />;
  if (pathname === '/login') return <AuthSkeleton fields={2} />;
  if (pathname === '/register') return <AuthSkeleton fields={5} />;
  return <PageSkeleton />;
}

// Whole-app placeholder while the saved login is checked: the floating header, the current page's skeleton,
// and the phone tab bar. Takes over from the boot screen in index.html, which has the same shapes.
export function AppSkeleton() {
  const { pathname, search } = useLocation();
  const signedIn = hasToken();
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-mist">
      <div className="px-3 pt-[calc(0.5rem+env(safe-area-inset-top))] sm:px-4 sm:pt-[calc(0.75rem+env(safe-area-inset-top))] lg:px-8" aria-hidden="true">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white shadow-lg shadow-navy/5 ring-1 ring-navy/5 2xl:max-w-[88rem]">
          <div className="hidden h-9 items-center justify-between rounded-t-2xl bg-linear-to-r from-cream/80 via-white to-frost px-6 md:flex">
            <div className="flex gap-6"><Bone className="h-3 w-36" /><Bone className="h-3 w-44" /></div>
            <Bone className="h-3 w-40" />
          </div>
          <div className="flex h-14 items-center justify-between gap-3 px-3 sm:h-16 sm:px-5 lg:px-6">
            <div className="flex items-center gap-3">
              <Bone className="h-10 w-10 rounded-xl" />
              <div className="hidden space-y-1.5 sm:block"><Bone className="h-3.5 w-48" /><Bone className="h-2.5 w-32" /></div>
            </div>
            <div className="hidden gap-8 md:flex">{[0, 1, ...(signedIn ? [2] : [])].map((i) => <Bone key={i} className="h-3.5 w-16" />)}</div>
            <div className="flex items-center gap-2">
              <Bone className={`h-10 rounded-full ${signedIn ? 'w-10 sm:w-28' : 'w-10'}`} />
              <Bone className="hidden h-11 w-24 rounded-full md:block" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-3 sm:pt-6 lg:px-8 2xl:max-w-[88rem]">
        <RouteSkeleton pathname={pathname} search={search} />
      </div>

      {/* phone tab bar */}
      <div className="fixed inset-x-0 bottom-0 grid h-[3.85rem] rounded-t-[1.75rem] bg-white px-2 shadow-[0_-6px_16px_rgb(14_54_97/0.10)] md:hidden"
        style={{ gridTemplateColumns: `repeat(${signedIn ? 5 : 3}, minmax(0, 1fr))` }} aria-hidden="true">
        {Array.from({ length: signedIn ? 5 : 3 }, (_, i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-1"><Bone className="h-6 w-6 rounded-lg" /><Bone className="h-2.5 w-10" /></div>
        ))}
      </div>
    </div>
  );
}
