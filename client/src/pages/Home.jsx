import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ListingCard from '../components/ListingCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import CategoryGrid from '../components/CategoryGrid.jsx';
import { EmptyState, ListingGridSkeleton } from '../components/Loader.jsx';
import { CATEGORIES } from '../constants.js';

const POPULAR = ['Polo', 'Skirt', 'PE shirt', 'Necktie'];
const STEPS = [
  ['photo', 'Snap a few photos', 'Front, back and the size tag help buyers decide quickly.'],
  ['tag', 'Set your price', 'Sell it, swap it, or give it to a student who needs it.'],
  ['chat', 'Chat and meet up', 'Agree on a safe spot on campus and hand it over.'],
];
const focusCream = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

// Shortcut on the right of the welcome panel (laptops and up; phones have the same links in the bottom tab bar)
function QuickLink({ to, icon, title, text, badge }) {
  return (
    <Link to={to}
      className={`group flex items-center gap-3.5 rounded-2xl bg-white/[0.07] p-3.5 ring-1 ring-inset ring-white/10 transition duration-200 hover:bg-white/[0.13] hover:ring-white/25 active:scale-[0.98] ${focusCream}`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-navy shadow-sm transition-transform duration-200 group-hover:scale-105">
        <Icon name={icon} className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="block truncate text-xs text-mist/65">{text}</span>
      </span>
      {badge > 0 && (
        <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-navy">{badge}<span className="sr-only"> unread</span></span>
      )}
      <Icon name="arrow-right" className="h-4 w-4 shrink-0 text-cream/50 transition duration-200 group-hover:translate-x-0.5 group-hover:text-cream" />
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState(''); // filter for "Recently listed"
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [total, setTotal] = useState(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let ignore = false; // a slower response for a previous tab must not overwrite this one
    setLoading(true);
    setFailed(false);
    api.get('/listings', { params: { limit: 8, ...(category && { category }) } })
      .then((r) => {
        if (ignore) return;
        setItems(r.data.items);
        if (!category) setTotal(r.data.total);
      })
      .catch(() => !ignore && setFailed(true))
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, [category]);

  // unread chats for the Messages shortcut (kept in step with the header badge)
  useEffect(() => {
    api.get('/messages/unread').then((r) => setUnread(r.data.count)).catch(() => {});
    const onUpdate = (e) => setUnread(e.detail);
    window.addEventListener('sueps:unread', onUpdate);
    return () => window.removeEventListener('sueps:unread', onUpdate);
  }, []);

  const browseLink = category ? `/browse?category=${encodeURIComponent(category)}` : '/browse';

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Welcome panel. Background: one soft glow drifting slowly, and a still dot texture on the right */}
      <section className="relative isolate overflow-hidden rounded-3xl bg-navy px-5 py-7 text-white shadow-xl shadow-navy/20 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] animate-drift rounded-full bg-denim/45 blur-3xl [animation-duration:24s]" />
          <div className="absolute -bottom-48 left-1/4 h-80 w-80 rounded-full bg-cream/10 blur-3xl" />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.1) 1px, transparent 1px)', backgroundSize: '22px 22px', maskImage: 'linear-gradient(100deg, transparent 45%, #000)' }} />
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-cream/90">{greeting()}, {user.fullName?.split(' ')[0] || 'student'}</p>
            <h1 className="mt-2 text-3xl font-bold leading-[1.15] tracking-[-0.02em] sm:text-4xl lg:text-[2.75rem]">
              Find the right uniform, <span className="text-cream">for less.</span>
            </h1>
            <p className="mt-3 max-w-lg text-base text-mist/75 sm:text-lg">
              Buy pre-loved uniforms from fellow students, or pass on the ones you've outgrown.
            </p>

            <SearchBar id="home-search" onSearch={(v) => navigate(v ? `/browse?q=${encodeURIComponent(v)}` : '/browse')}
              className="mt-6 max-w-xl" />

            <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="mr-1 text-sm text-mist/65">Popular:</span>
              {POPULAR.map((q) => (
                <Link key={q} to={`/browse?q=${encodeURIComponent(q)}`}
                  className={`rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-mist ring-1 ring-inset ring-white/15 transition duration-200 hover:bg-white/20 hover:ring-white/30 active:scale-95 sm:py-1.5 sm:text-sm ${focusCream}`}>
                  {q}
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-8">
              <Link to="/sell" className="btn-light h-11 px-5 lg:hidden">
                <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} /> Sell a uniform
              </Link>
              {total != null && (
                <p className="flex items-center gap-2 text-sm text-mist/75">
                  <span className="h-2 w-2 rounded-full bg-cream" aria-hidden="true" />
                  <span><strong className="font-bold text-white">{total}</strong> {total === 1 ? 'uniform' : 'uniforms'} available now</span>
                  <Link to="/browse" className={`group/all inline-flex items-center gap-1 rounded font-semibold text-cream hover:underline ${focusCream}`}>
                    Browse all <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover/all:translate-x-0.5" />
                  </Link>
                </p>
              )}
            </div>
          </div>

          <nav aria-label="Shortcuts" className="hidden gap-2.5 lg:grid">
            <QuickLink to="/sell" icon="plus" title="Sell a uniform" text="Photos, a price, and you're done" />
            <QuickLink to="/messages" icon="chat" title="Messages" text={unread ? 'New messages waiting' : 'Chat with buyers and sellers'} badge={unread} />
            <QuickLink to="/profile" icon="user" title="My profile" text="Requests and your listings" />
          </nav>
        </div>
      </section>

      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="section-title mb-4">Shop by category</h2>
        <CategoryGrid />
      </section>

      <section aria-labelledby="recent-heading">
        <div className="flex items-center justify-between">
          <h2 id="recent-heading" className="section-title">Recently listed</h2>
          <Link to={browseLink} className="group -my-2 inline-flex min-h-11 items-center gap-1 rounded text-sm font-semibold text-navy hover:underline focus-visible:outline-2 focus-visible:outline-navy">
            See all <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div role="group" aria-label="Show category" className="relative -mx-4 mb-4 mt-1 flex h-10 overflow-x-auto px-4 shadow-[inset_0_-1px_0_var(--color-aqua)] [scrollbar-width:none] sm:mx-0 sm:mb-5 sm:mt-2 sm:h-11 sm:px-0">
          {[['', 'All'], ...CATEGORIES.map((c) => [c, c])].map(([value, label]) => (
            <button key={label} type="button" aria-pressed={category === value} onClick={() => setCategory(value)}
              className={`tab first:pl-0 first:after:left-0 ${category === value ? 'tab-on' : ''}`}>
              {label}
            </button>
          ))}
        </div>

        {loading
          ? <ListingGridSkeleton count={4} className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4" />
          : failed
            ? <EmptyState icon={<Icon name="warning" className="h-6 w-6" />} title="Couldn't load listings">Check your connection and refresh the page.</EmptyState>
            : items.length === 0
              ? <EmptyState icon={<Icon name="shirt" className="h-6 w-6" />} title={category ? `No ${category} listings yet` : 'No listings yet'}>
                  Be the first to <Link to="/sell" className="font-semibold text-navy underline-offset-2 hover:underline">post one</Link>.
                </EmptyState>
              // one quiet fade when the tab changes, instead of each card sliding in
              : <div key={category} className="grid animate-fade-in grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
                  {items.map((l) => <ListingCard key={l._id} listing={l} />)}
                </div>}
      </section>

      <Reveal as="section" aria-labelledby="sell-heading" className="relative isolate overflow-hidden rounded-3xl bg-cream px-5 py-7 sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-white/50" aria-hidden="true" />
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,19rem)_1fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-sm font-semibold text-navy">Outgrown a uniform?</p>
            <h2 id="sell-heading" className="mt-1 text-2xl font-bold tracking-[-0.015em] text-ink sm:text-3xl">Give it another school year.</h2>
            <p className="mt-2 text-sm text-slate-700 sm:text-base">It only takes a few steps, and it helps another student save.</p>
            <Link to="/sell" className="btn-primary group mt-5 h-11 px-5">
              Start selling <Icon name="arrow-right" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {STEPS.map(([icon, title, text], i) => (
              <li key={title} className="group rounded-2xl bg-white/75 p-4 ring-1 ring-inset ring-navy/5 transition duration-200 hover:bg-white hover:shadow-md hover:shadow-navy/10">
                <div className="flex items-center justify-between">
                  <span className="icon-tile h-10 w-10 transition-colors duration-200 group-hover:bg-navy group-hover:text-mist group-hover:ring-navy">
                    <Icon name={icon} className="h-5 w-5" />
                  </span>
                  <span className="text-2xl font-bold text-navy/15" aria-hidden="true">{i + 1}</span>
                </div>
                <h3 className="mt-3 font-semibold text-ink"><span className="sr-only">Step {i + 1}: </span>{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </div>
  );
}
