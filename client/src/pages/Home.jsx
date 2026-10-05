import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ListingCard from '../components/ListingCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import CategoryGrid from '../components/CategoryGrid.jsx';
import { prefersReducedMotion, useCountUp } from '../hooks.js';
import { EmptyState, ListingGridSkeleton } from '../components/Loader.jsx';
import { CATEGORIES, formatPrice } from '../constants.js';
import uniformImg from '../assets/uniforms.jpg';

const WORDS = ['school polo', 'PE uniform', 'pleated skirt', 'necktie', 'slacks'];
const POPULAR = ['Polo', 'Skirt', 'PE shirt', 'Necktie'];
const STEPS = [
  ['photo', 'Snap a few photos', 'Front, back and the size tag help buyers decide quickly.'],
  ['tag', 'Set your price', 'Sell it, swap it, or give it to a student who needs it.'],
  ['chat', 'Chat and meet up', 'Agree on a safe spot on campus and hand it over.'],
];
// Fanned card positions in the hero, front card first
const STACK = [
  'left-1/2 top-8 z-30 -translate-x-1/2',
  'right-0 top-0 z-20 rotate-[6deg]',
  'left-0 top-14 z-10 -rotate-[7deg]',
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

// The cream word in the headline: cycles through uniform pieces, sliding each one up into place
function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % WORDS.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="block overflow-hidden pb-2" aria-hidden="true">
      <span key={i} className="relative inline-block animate-word-in text-cream">
        {WORDS[i]}
        <span className="absolute inset-x-0 -bottom-1 h-1 origin-left animate-underline rounded-full bg-cream/60" />
      </span>
    </span>
  );
}

// Hero card photo; a link that fails to load shows the same placeholder as ListingCard
function CardPhoto({ src }) {
  const [broken, setBroken] = useState(false);
  return broken
    ? <span className="flex aspect-square w-full items-center justify-center rounded-xl bg-frost text-slate-400"><Icon name="photo" className="h-8 w-8" /></span>
    : <img src={src} alt="" onError={() => setBroken(true)} className="aspect-square w-full rounded-xl bg-frost object-cover" />;
}

// Desktop-only fan of the newest listings. It tilts toward the cursor (via --mx/--my set on the hero) and each card bobs.
function HeroStack({ listings, loading }) {
  const picks = listings.filter((l) => l.images?.[0]).slice(0, 3);
  const tilt = { transform: 'rotateY(calc((var(--mx) - 0.5) * 14deg)) rotateX(calc((0.5 - var(--my)) * 10deg))' };

  return (
    <div className="relative hidden h-[23rem] [perspective:1200px] lg:block">
      <div className="relative h-full w-full transition-transform duration-300 ease-out [transform-style:preserve-3d]" style={tilt}>
        {loading
          ? STACK.map((pos, i) => (
              <div key={pos} className={`absolute ${pos}`}>
                <div className="h-64 w-48 animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/15" style={{ animationDelay: `${i * 150}ms` }} />
              </div>
            ))
          : picks.length
            ? picks.map((l, i) => (
                <div key={l._id} className={`absolute ${STACK[i]} hover:z-40 focus-within:z-40`}>
                  <div className="animate-float" style={{ animationDelay: `${i * -2}s` }}>
                    <Link to={`/listings/${l._id}`}
                      className="block w-48 rounded-2xl bg-white p-2 text-ink shadow-2xl shadow-navy-deep/50 transition duration-300 hover:-translate-y-2 hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream">
                      <CardPhoto src={l.images[0]} />
                      <span className="block px-1.5 pb-1 pt-2.5">
                        <span className="block truncate text-sm font-semibold">{l.title}</span>
                        <span className="mt-1 flex items-center justify-between gap-2">
                          <span className="font-bold text-navy">{formatPrice(l.price)}</span>
                          <span className="chip bg-frost text-navy">Size {l.size}</span>
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              ))
            : (
              <div className={`absolute ${STACK[0]}`}>
                <div className="animate-float">
                  <Link to="/sell" className="block w-52 rounded-2xl bg-white p-2 text-ink shadow-2xl shadow-navy-deep/50 transition duration-300 hover:-translate-y-2 hover:scale-[1.04]">
                    <img src={uniformImg} alt="" className="aspect-square w-full rounded-xl object-cover" />
                    <span className="block px-1.5 pb-1 pt-2.5 text-sm font-semibold">Your uniform could be here</span>
                  </Link>
                </div>
              </div>
            )}
      </div>

      <p className="absolute bottom-4 left-2 z-40 flex animate-float items-center gap-2 rounded-full bg-white/95 py-2 pl-2 pr-4 text-sm font-semibold text-navy shadow-xl shadow-navy-deep/40 [animation-delay:-3s]">
        <span className="icon-tile h-7 w-7 rounded-full"><Icon name="shield" className="h-4 w-4" /></span>
        Meet up safely on campus
      </p>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState(''); // filter for "Recently listed"
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [newest, setNewest] = useState([]); // unfiltered newest listings for the hero
  const [total, setTotal] = useState(null);
  const shownTotal = useCountUp(total);

  useEffect(() => {
    let ignore = false; // a slower response for a previous tab must not overwrite this one
    setLoading(true);
    setFailed(false);
    api.get('/listings', { params: { limit: 8, ...(category && { category }) } })
      .then((r) => {
        if (ignore) return;
        setItems(r.data.items);
        if (!category) { setNewest(r.data.items); setTotal(r.data.total); }
      })
      .catch(() => !ignore && setFailed(true))
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, [category]);

  // Cursor position over the hero as 0–1, read by the spotlight and the card tilt
  const track = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', ((e.clientX - r.left) / r.width).toFixed(3));
    e.currentTarget.style.setProperty('--my', ((e.clientY - r.top) / r.height).toFixed(3));
  };
  const untrack = (e) => {
    e.currentTarget.style.removeProperty('--mx');
    e.currentTarget.style.removeProperty('--my');
  };

  const browseLink = category ? `/browse?category=${encodeURIComponent(category)}` : '/browse';

  return (
    <div className="space-y-12 sm:space-y-14">
      <section onPointerMove={track} onPointerLeave={untrack}
        className="group/hero relative isolate overflow-hidden rounded-3xl bg-navy px-5 py-9 text-white shadow-xl shadow-navy/20 [--mx:0.5] [--my:0.5] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -right-24 -top-32 h-96 w-96 animate-drift rounded-full bg-denim/50 blur-3xl" />
          <div className="absolute -bottom-40 left-1/4 h-80 w-80 animate-drift rounded-full bg-cream/15 blur-3xl [animation-delay:-8s]" />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(rgb(255 247 230 / 0.13) 1px, transparent 1px)', backgroundSize: '22px 22px', maskImage: 'linear-gradient(100deg, transparent 35%, #000)' }} />
          {/* soft light that follows the mouse */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/hero:opacity-100"
            style={{ background: 'radial-gradient(32rem circle at calc(var(--mx) * 100%) calc(var(--my) * 100%), rgb(255 247 230 / 0.09), transparent 65%)' }} />
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="min-w-0">
            <p className="animate-fade-up text-sm font-semibold text-cream/90">
              {greeting()}, {user.fullName?.split(' ')[0] || 'student'}
            </p>
            <h1 className="mt-3 animate-fade-up text-3xl font-bold leading-[1.1] tracking-[-0.02em] [animation-delay:80ms] min-[400px]:text-4xl sm:text-5xl">
              Find the right <span className="sr-only">uniform</span>
              <RotatingWord />
            </h1>
            <p className="mt-3 max-w-lg animate-fade-up text-base text-mist/80 [animation-delay:160ms] sm:text-lg">
              Buy pre-loved uniforms from fellow students, or pass on the ones you've outgrown.
            </p>

            <SearchBar id="home-search" onSearch={(v) => navigate(v ? `/browse?q=${encodeURIComponent(v)}` : '/browse')}
              className="relative mt-7 max-w-xl animate-fade-up [animation-delay:240ms]" />

            <div className="mt-4 flex animate-fade-up flex-wrap items-center gap-2 [animation-delay:320ms]">
              <span className="mr-1 text-sm text-mist/70">Popular:</span>
              {POPULAR.map((q) => (
                <Link key={q} to={`/browse?q=${encodeURIComponent(q)}`}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-mist ring-1 ring-inset ring-white/15 transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:ring-white/35 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream">
                  {q}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:400ms]">
              <Link to="/sell" className="btn-light group/sell h-11 px-5 hover:-translate-y-0.5 hover:shadow-lg">
                <Icon name="plus-circle" className="h-5 w-5 transition-transform duration-300 group-hover/sell:rotate-90" /> Sell a uniform
              </Link>
              {total != null && (
                <p className="flex items-center gap-2.5 text-sm text-mist/80">
                  <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                    <span className="absolute inset-0 animate-ping rounded-full bg-cream/70" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-cream" />
                  </span>
                  <span><strong className="font-bold tabular-nums text-white">{shownTotal}</strong> {total === 1 ? 'uniform' : 'uniforms'} available now</span>
                </p>
              )}
            </div>
          </div>

          <HeroStack listings={newest} loading={loading && !newest.length && !failed} />
        </div>
      </section>

      <section aria-labelledby="categories-heading">
        <Reveal className="mb-4 flex items-end justify-between gap-4">
          <h2 id="categories-heading" className="section-title">Shop by category</h2>
        </Reveal>
        <CategoryGrid />
      </section>

      <section aria-labelledby="recent-heading">
        <Reveal>
          <div className="flex items-center justify-between">
            <h2 id="recent-heading" className="section-title">Recently listed</h2>
            <Link to={browseLink} className="group -my-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-navy">
              See all <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div role="group" aria-label="Show category" className="relative -mx-4 mb-5 mt-2 flex h-11 overflow-x-auto px-4 shadow-[inset_0_-1px_0_var(--color-aqua)] [scrollbar-width:none] sm:mx-0 sm:px-0">
            {[['', 'All'], ...CATEGORIES.map((c) => [c, c])].map(([value, label]) => (
              <button key={label} type="button" aria-pressed={category === value} onClick={() => setCategory(value)}
                className={`tab first:pl-0 first:after:left-0 ${category === value ? 'tab-on' : ''}`}>
                {label}
              </button>
            ))}
          </div>
        </Reveal>

        {loading
          ? <ListingGridSkeleton count={4} />
          : failed
            ? <EmptyState icon={<Icon name="warning" className="h-6 w-6" />} title="Couldn't load listings">Check your connection and refresh the page.</EmptyState>
            : items.length === 0
              ? <EmptyState icon={<Icon name="shirt" className="h-6 w-6" />} title={category ? `No ${category} listings yet` : 'No listings yet'}>
                  Be the first to <Link to="/sell" className="font-semibold text-navy underline-offset-2 hover:underline">post one</Link>.
                </EmptyState>
              : <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                  {items.map((l, i) => (
                    <Reveal key={`${category}-${l._id}`} delay={(i % 4) * 70}><ListingCard listing={l} /></Reveal>
                  ))}
                </div>}
      </section>

      <Reveal as="section" aria-labelledby="sell-heading" className="relative isolate overflow-hidden rounded-3xl bg-cream px-5 py-9 sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-white/50" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 -z-10 h-56 w-56 rounded-full bg-aqua/60" aria-hidden="true" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,19rem)_1fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-sm font-semibold text-navy">Outgrown a uniform?</p>
            <h2 id="sell-heading" className="mt-1 text-2xl font-bold tracking-[-0.015em] text-ink sm:text-3xl">Give it another school year.</h2>
            <p className="mt-2 text-sm text-slate-700 sm:text-base">It only takes a few steps, and it helps another student save.</p>
            <Link to="/sell" className="btn-primary group mt-6 h-11 px-5 hover:-translate-y-0.5">
              Start selling <Icon name="arrow-right" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {STEPS.map(([icon, title, text], i) => (
              <Reveal as="li" key={title} delay={150 + i * 120}>
                <div className="group h-full rounded-2xl bg-white/75 p-4 ring-1 ring-inset ring-navy/5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-navy/10">
                  <div className="flex items-center justify-between">
                    <span className="icon-tile h-11 w-11 transition duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-navy group-hover:text-mist group-hover:ring-navy">
                      <Icon name={icon} className="h-5 w-5" />
                    </span>
                    <span className="text-3xl font-bold text-navy/10 transition-colors duration-300 group-hover:text-navy/25" aria-hidden="true">{i + 1}</span>
                  </div>
                  <h3 className="mt-3 font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Reveal>
    </div>
  );
}
