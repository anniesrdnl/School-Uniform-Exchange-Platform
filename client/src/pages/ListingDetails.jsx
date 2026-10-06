import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EmptyState, ListingGridSkeleton, Spinner } from '../components/Loader.jsx';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import Avatar from '../components/Avatar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ListingCard from '../components/ListingCard.jsx';
import PageBackdrop from '../components/PageBackdrop.jsx';
import { CONDITION_HINTS, formatPrice, timeAgo } from '../constants.js';

// Which request types a listing's exchange option allows
const OPTIONS_FOR = { 'Buy Only': ['Buy'], 'Exchange Only': ['Exchange'] };

// Desktop: gallery + description on the left (7/12), purchase panel on the right (5/12) that stays in view.
// Phones: gallery, then the purchase panel, then the description (plain DOM order).
const LAYOUT = {
  gallery: 'lg:col-span-7',
  panel: 'lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-24',
  about: 'lg:col-span-7',
};

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy';
// Breadcrumb link: an underline grows in from the left on hover
const crumbLink = `relative whitespace-nowrap font-semibold text-navy transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-navy after:transition-transform after:duration-300 hover:text-navy-deep hover:after:scale-x-100 ${focusRing}`;

function DetailsSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading listing">
      <div className="skeleton h-5 w-56" />
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-3 lg:col-span-7">
          <div className="skeleton aspect-square rounded-3xl sm:aspect-[4/3]" />
          <div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 w-16 rounded-xl sm:h-20 sm:w-20" />)}</div>
        </div>
        <div className="card space-y-4 p-6 lg:col-span-5">
          <div className="skeleton h-5 w-40 rounded-full" />
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-9 w-1/3" />
          <div className="grid grid-cols-2 gap-2">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          <div className="skeleton h-16 w-full rounded-2xl" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function Gallery({ images, title }) {
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState(false);
  const touchX = useRef(null);
  const count = images.length;
  const show = (i) => { setBroken(false); setActive((i + count) % count); };
  const go = (step) => show(active + step);

  // Arrow keys when the photo has focus, and a sideways swipe on touch screens
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - (touchX.current ?? e.changedTouches[0].clientX);
    touchX.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };
  const many = count > 1;

  return (
    <div className="space-y-3">
      <div
        {...(many && {
          role: 'region',
          'aria-roledescription': 'carousel',
          'aria-label': `${title} photos. Use the left and right arrow keys to switch.`,
          tabIndex: 0,
          onKeyDown,
          onTouchStart: (e) => { touchX.current = e.touches[0].clientX; },
          onTouchEnd,
        })}
        className={`group relative aspect-square overflow-hidden rounded-3xl bg-frost shadow-[0_1px_2px_rgb(14_54_97/0.05),0_18px_40px_-20px_rgb(14_54_97/0.35)] ring-1 ring-aqua/80 sm:aspect-[4/3] ${focusRing} focus-visible:outline-offset-4`}>
        {count > 0 && !broken ? (
          <>
            {/* the same photo, blurred, fills the frame so wide or tall photos never sit on empty grey bars */}
            <img key={`fill-${active}`} src={images[active]} alt="" aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-125 animate-fade-in object-cover opacity-50 blur-2xl" />
            <div className="absolute inset-0 bg-white/35" aria-hidden="true" />
            <img key={active} src={images[active]} alt={`${title}, photo ${active + 1} of ${count}`} onError={() => setBroken(true)}
              className="relative h-full w-full animate-fade-in object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
            <span className="icon-tile h-14 w-14 bg-white"><Icon name="photo" className="h-7 w-7" /></span>
            <span className="text-sm font-medium">No photo yet</span>
          </div>
        )}

        {many && (
          <>
            {/* mouse: arrows fade in on hover; touch screens: always shown */}
            {[['arrow-left', -1, 'Previous photo', 'left-3'], ['arrow-right', 1, 'Next photo', 'right-3']].map(([icon, step, label, side]) => (
              <button key={label} type="button" onClick={() => go(step)} aria-label={label} tabIndex={-1}
                className={`absolute top-1/2 ${side} flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-md shadow-navy/15 backdrop-blur transition duration-200 hover:scale-105 hover:bg-white hover:shadow-lg active:scale-95 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-visible:opacity-100`}>
                <Icon name={icon} className="h-5 w-5" strokeWidth={2} />
              </button>
            ))}
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur" aria-hidden="true">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {many && (
        <div className="scroll-thin -mx-1 flex gap-2 overflow-x-auto px-1 py-1.5">
          {images.map((src, i) => {
            const on = i === active;
            return (
              <button key={src} type="button" onClick={() => show(i)} aria-label={`Show photo ${i + 1}`} aria-pressed={on}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-frost transition duration-200 active:scale-95 sm:h-20 sm:w-20 ${focusRing} ${on
                  ? 'ring-2 ring-navy ring-offset-2 ring-offset-white'
                  : 'opacity-60 ring-1 ring-aqua hover:-translate-y-0.5 hover:opacity-100 hover:ring-denim'}`}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// One fact about the uniform. With `to`, the tile links to Browse filtered by that value.
function Fact({ icon, label, value, hint, to, linkLabel }) {
  const body = (
    <>
      <span className="icon-tile h-9 w-9 bg-white transition-colors duration-200 group-hover:bg-navy group-hover:text-white group-hover:ring-navy">
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-slate-500">{label}</span>
        <span className="block truncate text-sm font-semibold text-ink">{value}</span>
        {hint && <span className="block truncate text-xs text-slate-500">{hint}</span>}
      </span>
      {to && <Icon name="arrow-right" className="h-4 w-4 shrink-0 text-slate-400 transition duration-200 group-hover:translate-x-0.5 group-hover:text-navy" />}
    </>
  );
  const base = 'flex h-full items-center gap-3 rounded-xl bg-frost/70 px-3 py-2.5 ring-1 ring-inset ring-aqua/70';
  return (
    <li>
      {to
        ? <Link to={to} aria-label={linkLabel}
            className={`group ${base} transition duration-200 hover:bg-white hover:shadow-md hover:shadow-navy/10 hover:ring-denim/40 active:scale-[0.98] ${focusRing}`}>{body}</Link>
        : <div className={base}>{body}</div>}
    </li>
  );
}

// "I want to" switch: real radio buttons (arrow keys work) under a white thumb that slides to the choice
function OptionSwitch({ options, value, onChange }) {
  const index = Math.max(options.indexOf(value), 0);
  return (
    <fieldset>
      <legend className="label">I want to</legend>
      <div className="relative grid grid-cols-2 rounded-xl bg-frost p-1 ring-1 ring-inset ring-aqua/70">
        <span aria-hidden="true"
          className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-white shadow-sm shadow-navy/10 ring-1 ring-aqua transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${index ? 'translate-x-full' : ''}`} />
        {options.map((o) => (
          <label key={o}
            className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition duration-200 active:scale-[0.98] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy ${value === o ? 'text-navy' : 'text-slate-500 hover:text-navy'}`}>
            <input type="radio" name="request-option" value={o} checked={value === o} onChange={() => onChange(o)} className="sr-only" />
            <Icon name={o === 'Buy' ? 'money' : 'recycle'} className="h-4 w-4" />
            {o === 'Buy' ? 'Buy it' : 'Swap for it'}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// Small rounded note inside the panel (owner view, sold/reserved view)
function PanelNote({ icon, title, children }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-frost/70 p-4 ring-1 ring-inset ring-aqua animate-fade-up">
      <span className="icon-tile h-10 w-10 bg-white"><Icon name={icon} className="h-5 w-5" /></span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-ink">{title}</p>
        <div className="mt-0.5 text-slate-600">{children}</div>
      </div>
    </div>
  );
}

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [similar, setSimilar] = useState(null); // null while loading
  const [option, setOption] = useState('Buy');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(''); // 'request' | 'message' while that action is running

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then((r) => {
        setListing(r.data);
        setOption((OPTIONS_FOR[r.data.exchangeOption] || ['Buy'])[0]);
      })
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  // Other available uniforms in the same category
  const category = listing?.category;
  useEffect(() => {
    if (!category) return;
    api.get('/listings', { params: { category, limit: 5 } })
      .then((r) => setSimilar(r.data.items.filter((l) => l._id !== id).slice(0, 4)))
      .catch(() => setSimilar([]));
  }, [category, id]);

  if (!listing) {
    return (
      <>
        <PageBackdrop />
        {error
          ? <EmptyState icon={<Icon name="warning" className="h-6 w-6" />} title="Listing unavailable">
              <p>{error}</p>
              <Link to="/browse" className="btn-primary btn-sm mt-4">Browse uniforms</Link>
            </EmptyState>
          : <DetailsSkeleton />}
      </>
    );
  }

  const { seller } = listing;
  const isOwner = user && seller._id === user._id;
  const options = OPTIONS_FOR[listing.exchangeOption] || ['Buy', 'Exchange'];
  const browseCategory = `/browse?category=${encodeURIComponent(listing.category)}`;
  const sellerFirstName = seller.fullName?.split(' ')[0] || 'The seller';
  const sellerInfo = [seller.program, seller.yearLevel].filter(Boolean).join(' · ');
  const needLogin = () => navigate('/login', { state: { from: { pathname: `/listings/${id}` } } });

  const sendRequest = async () => {
    if (!user) return needLogin();
    setBusy('request');
    setError('');
    try {
      await api.post('/requests', { listing: id, option, message });
      setSent(true);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy('');
    }
  };

  const messageSeller = async () => {
    if (!user) return needLogin();
    setBusy('message');
    setError('');
    try {
      const { data } = await api.post('/messages/conversations', { userId: seller._id, listingId: id });
      navigate(`/messages?c=${data._id}`); // open this chat straight away
    } catch (e) {
      setError(errMsg(e));
      setBusy('');
    }
  };

  const facts = [
    { icon: 'tag', label: 'Size', value: listing.size, to: `/browse?size=${encodeURIComponent(listing.size)}`, linkLabel: `Size ${listing.size}. See more uniforms in this size` },
    { icon: 'sparkles', label: 'Condition', value: listing.condition, hint: CONDITION_HINTS[listing.condition], to: `/browse?condition=${encodeURIComponent(listing.condition)}`, linkLabel: `Condition ${listing.condition}. See more uniforms in this condition` },
    { icon: 'cube', label: 'Quantity', value: `${listing.quantity} available` },
    { icon: 'recycle', label: 'Open to', value: listing.exchangeOption },
  ];

  const messageButton = (
    <button type="button" className={`btn-outline group/msg py-3 ${sent ? 'w-full' : ''}`} onClick={messageSeller} disabled={busy === 'message'}>
      {busy === 'message'
        ? <><Spinner /> Opening chat…</>
        : <><Icon name="chat" className="h-4 w-4 transition-transform duration-200 group-hover/msg:-rotate-6 group-hover/msg:scale-110" /> Message {sellerFirstName}</>}
    </button>
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageBackdrop />

      <nav aria-label="Breadcrumb">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm text-slate-600">
          <li><Link to="/browse" className={crumbLink}>Browse</Link></li>
          <li aria-hidden="true"><Icon name="chevron-down" className="h-3.5 w-3.5 -rotate-90" strokeWidth={2} /></li>
          <li><Link to={browseCategory} className={crumbLink}>{listing.category}</Link></li>
          <li aria-hidden="true"><Icon name="chevron-down" className="h-3.5 w-3.5 -rotate-90" strokeWidth={2} /></li>
          <li aria-current="page" className="min-w-0 truncate">{listing.title}</li>
        </ol>
      </nav>

      {/* rows: [gallery][description takes the rest], so the tall panel never stretches the gap under the photo */}
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-8">
        <div className={`animate-fade-up ${LAYOUT.gallery}`}>
          <Gallery images={listing.images} title={listing.title} />
        </div>

        <aside aria-label="Price and request" className={`card animate-fade-up p-5 [animation-delay:80ms] sm:p-6 ${LAYOUT.panel}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={listing.status} />
              <Link to={browseCategory} className={`chip bg-frost text-navy ring-1 ring-inset ring-aqua transition duration-200 hover:bg-navy hover:text-white hover:ring-navy ${focusRing}`}>
                {listing.category}
              </Link>
            </div>
            <span className="text-xs text-slate-500">Listed {timeAgo(listing.createdAt)}</span>
          </div>

          <h1 className="mt-4 break-words text-2xl font-bold leading-tight tracking-[-0.015em] text-ink sm:text-[1.75rem]">{listing.title}</h1>
          <p className="mt-2 text-3xl font-bold tracking-[-0.02em] text-navy">{formatPrice(listing.price)}</p>

          <ul className="mt-5 grid grid-cols-2 gap-2" aria-label="Uniform details">
            {facts.map((f) => <Fact key={f.label} {...f} />)}
          </ul>

          <div className="mt-5 flex items-center gap-3 border-y border-aqua/70 py-4">
            <Avatar name={seller.fullName} src={seller.avatar} className="h-11 w-11 text-base ring-2 ring-frost" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">Sold by</p>
              <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-ink">
                <span className="truncate">{seller.fullName}</span>
                {seller.verified && (
                  <span className="chip shrink-0 bg-aqua px-2 text-[11px] text-navy"><Icon name="shield" className="h-3.5 w-3.5" /> Verified</span>
                )}
              </p>
              {sellerInfo && <p className="truncate text-xs text-slate-600">{sellerInfo}</p>}
            </div>
            <p className="flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-600">
              {seller.ratingCount
                ? <><Icon name="star" filled className="h-4 w-4 text-amber-500" /> {seller.ratingAvg} <span className="font-normal">({seller.ratingCount})</span></>
                : <span className="font-normal">No reviews yet</span>}
            </p>
          </div>

          {error && <p role="alert" className="alert-error mt-5 animate-fade-up">{error}</p>}

          <div className="mt-5 space-y-4">
            {isOwner ? (
              <PanelNote icon="user" title="This is your listing">
                Requests from buyers show up in your profile.
                <Link to="/profile" className={`group/link mt-2 flex w-fit items-center gap-1 font-semibold text-navy hover:underline ${focusRing}`}>
                  Go to my profile <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                </Link>
              </PanelNote>
            ) : listing.status !== 'available' ? (
              <PanelNote icon="tag" title={`This uniform is ${listing.status}`}>
                It can't be requested right now.
                <Link to={browseCategory} className={`group/link mt-2 flex w-fit items-center gap-1 font-semibold text-navy hover:underline ${focusRing}`}>
                  See similar uniforms <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                </Link>
              </PanelNote>
            ) : sent ? (
              <>
                <div role="status" className="alert-success flex animate-fade-up gap-3">
                  <span className="flex h-7 w-7 shrink-0 animate-pop items-center justify-center rounded-full bg-green-600 text-white">
                    <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span>
                    <b className="block">Request sent</b>
                    {sellerFirstName} will reply soon. Track it in <Link to="/profile" className="font-semibold underline">your profile</Link>, or say hi now.
                  </span>
                </div>
                {messageButton}
              </>
            ) : (
              <>
                {options.length > 1
                  ? <OptionSwitch options={options} value={option} onChange={setOption} />
                  : <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Icon name={options[0] === 'Buy' ? 'money' : 'recycle'} className="h-4 w-4 text-navy" />
                      {options[0] === 'Buy' ? 'This seller is selling only, not swapping.' : 'This seller only wants to swap.'}
                    </p>}
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="label" htmlFor="note">Note for {sellerFirstName} <span className="font-normal text-slate-500">(optional)</span></label>
                    <span className="text-xs text-slate-500">{message.length}/500</span>
                  </div>
                  <textarea id="note" className="input resize-none" rows={2} maxLength={500} placeholder="e.g. Can we meet after class on Friday?"
                    value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button type="button" className="btn-primary btn-shine group/cta py-3" onClick={sendRequest} disabled={busy === 'request'}>
                    {busy === 'request'
                      ? <><Spinner /> Sending…</>
                      : <>{option === 'Exchange' ? 'Request swap' : 'Request to buy'}
                          <Icon name="arrow-right" className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-1" /></>}
                  </button>
                  {messageButton}
                </div>
              </>
            )}
          </div>

          <p className="mt-5 flex gap-2.5 rounded-xl bg-frost/60 p-3 text-xs leading-relaxed text-slate-600">
            <Icon name="shield" className="h-4 w-4 shrink-0 text-navy" />
            Meet on campus in a busy place, and check the uniform before you pay.
          </p>
        </aside>

        <Reveal as="section" aria-labelledby="about-heading" className={LAYOUT.about}>
          <h2 id="about-heading" className="section-title">About this uniform</h2>
          {listing.description
            ? <p className="mt-2 max-w-prose whitespace-pre-line break-words text-base leading-relaxed text-slate-700">{listing.description}</p>
            : <p className="mt-2 text-sm text-slate-500">The seller didn't add a description. Message them to ask about fit or flaws.</p>}
        </Reveal>
      </div>

      {(similar === null || similar.length > 0) && (
        <Reveal as="section" aria-labelledby="similar-heading" className="space-y-3 pt-2 sm:pt-4">
          <div className="flex items-end justify-between gap-3">
            <h2 id="similar-heading" className="section-title">More in {listing.category}</h2>
            <Link to={browseCategory} className={`group/link flex shrink-0 items-center gap-1 text-sm font-semibold text-navy hover:underline ${focusRing}`}>
              See all <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          </div>
          {similar === null
            ? <ListingGridSkeleton count={4} />
            : <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                {similar.map((l) => <ListingCard key={l._id} listing={l} />)}
              </div>}
        </Reveal>
      )}
    </div>
  );
}
