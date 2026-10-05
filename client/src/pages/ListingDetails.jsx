import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EmptyState } from '../components/Loader.jsx';
import Icon from '../components/Icon.jsx';
import Avatar from '../components/Avatar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatPrice, timeAgo } from '../constants.js';

// Which request types a listing's exchange option allows
const OPTIONS_FOR = { 'Buy Only': ['Buy'], 'Exchange Only': ['Exchange'] };

// Desktop: gallery + description on the left (7/12), purchase panel on the right (5/12) that stays in view.
// Phones: gallery, then the purchase panel, then the description (plain DOM order).
const LAYOUT = {
  gallery: 'lg:col-span-7',
  panel: 'lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-24',
  about: 'lg:col-span-7',
};

function DetailsSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading listing">
      <div className="skeleton h-5 w-56" />
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="skeleton aspect-[4/3] rounded-3xl lg:col-span-7" />
        <div className="card space-y-4 p-6 lg:col-span-5">
          <div className="skeleton h-5 w-32 rounded-full" />
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-9 w-1/3" />
          <div className="skeleton h-28 w-full rounded-xl" />
          <div className="skeleton h-16 w-full rounded-xl" />
          <div className="skeleton h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function Gallery({ images, title }) {
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState(false);
  const count = images.length;
  const go = (step) => { setBroken(false); setActive((i) => (i + step + count) % count); };

  return (
    <div>
      {/* object-contain: the whole uniform is visible, never cropped */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-frost ring-1 ring-aqua/70">
        {count > 0 && !broken
          ? <img key={active} src={images[active]} alt={`${title}, photo ${active + 1} of ${count}`} onError={() => setBroken(true)}
              className="h-full w-full animate-fade-in object-contain" />
          : <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500"><Icon name="photo" className="h-12 w-12" />No photo</div>}

        {count > 1 && (
          <>
            {[['arrow-left', -1, 'Previous photo', 'left-3'], ['arrow-right', 1, 'Next photo', 'right-3']].map(([icon, step, label, side]) => (
              <button key={label} type="button" onClick={() => go(step)} aria-label={label}
                className={`absolute top-1/2 ${side} flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-md shadow-navy/10 transition hover:bg-white active:scale-95`}>
                <Icon name={icon} className="h-5 w-5" strokeWidth={2} />
              </button>
            ))}
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="relative mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {images.map((src, i) => (
            <button key={src} type="button" onClick={() => { setBroken(false); setActive(i); }} aria-label={`Show photo ${i + 1}`} aria-pressed={i === active}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-frost ring-2 transition duration-200 ${i === active ? 'ring-navy' : 'ring-transparent opacity-70 hover:opacity-100'}`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [option, setOption] = useState('Buy');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then((r) => {
        setListing(r.data);
        setOption((OPTIONS_FOR[r.data.exchangeOption] || ['Buy'])[0]);
      })
      .catch((e) => setNotice({ type: 'error', text: errMsg(e) }));
  }, [id]);

  if (!listing) return notice.text
    ? <EmptyState icon={<Icon name="warning" className="h-6 w-6" />} title="Listing unavailable">{notice.text}</EmptyState>
    : <DetailsSkeleton />;

  const { seller } = listing;
  const isOwner = user && seller._id === user._id;
  const options = OPTIONS_FOR[listing.exchangeOption] || ['Buy', 'Exchange'];
  const needLogin = () => navigate('/login', { state: { from: { pathname: `/listings/${id}` } } });

  const sendRequest = async () => {
    if (!user) return needLogin();
    setBusy(true);
    try {
      await api.post('/requests', { listing: id, option, message });
      setNotice({ type: 'ok', text: 'Request sent. The seller will respond soon.' });
    } catch (e) {
      setNotice({ type: 'error', text: errMsg(e) });
    } finally {
      setBusy(false);
    }
  };

  const messageSeller = async () => {
    if (!user) return needLogin();
    try {
      await api.post('/messages/conversations', { userId: seller._id, listingId: id });
      navigate('/messages');
    } catch (e) {
      setNotice({ type: 'error', text: errMsg(e) });
    }
  };

  const details = [
    ['Size', listing.size],
    ['Condition', listing.condition],
    ['Quantity', listing.quantity],
    ['Accepts', listing.exchangeOption],
  ];
  const sellerInfo = [seller.program, seller.yearLevel].filter(Boolean).join(' · ');

  return (
    <div className="space-y-5">
      <nav aria-label="Breadcrumb">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm text-slate-600">
          <li><Link to="/browse" className="font-semibold text-navy hover:underline">Browse</Link></li>
          <li aria-hidden="true"><Icon name="chevron-down" className="h-3.5 w-3.5 -rotate-90" strokeWidth={2} /></li>
          <li><Link to={`/browse?category=${encodeURIComponent(listing.category)}`} className="whitespace-nowrap font-semibold text-navy hover:underline">{listing.category}</Link></li>
          <li aria-hidden="true"><Icon name="chevron-down" className="h-3.5 w-3.5 -rotate-90" strokeWidth={2} /></li>
          <li aria-current="page" className="min-w-0 truncate">{listing.title}</li>
        </ol>
      </nav>

      {/* rows: [gallery][description takes the rest], so the tall panel never stretches the gap under the photo */}
      <div className="grid gap-6 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-8">
        <div className={LAYOUT.gallery}>
          <Gallery images={listing.images} title={listing.title} />
        </div>

        <aside aria-label="Price and request" className={`card p-5 sm:p-6 ${LAYOUT.panel}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={listing.status} />
              <span className="chip bg-frost text-navy">{listing.category}</span>
            </div>
            <span className="text-xs text-slate-500">Listed {timeAgo(listing.createdAt)}</span>
          </div>

          <h1 className="page-title mt-3 break-words">{listing.title}</h1>
          <p className="mt-1 text-3xl font-bold tracking-[-0.015em] text-navy">{formatPrice(listing.price)}</p>

          {/* one bordered grid with hairline dividers instead of four separate boxes */}
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-aqua ring-1 ring-aqua">
            {details.map(([label, value]) => (
              <div key={label} className="bg-white px-4 py-3">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex items-center gap-3 border-y border-aqua/70 py-4">
            <Avatar name={seller.fullName} src={seller.avatar} className="h-11 w-11 text-base" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">Sold by</p>
              <p className="truncate text-sm font-semibold text-ink">{seller.fullName}</p>
              {sellerInfo && <p className="truncate text-xs text-slate-600">{sellerInfo}</p>}
            </div>
            <p className="flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-600">
              {seller.ratingCount
                ? <><Icon name="star" filled className="h-4 w-4 text-amber-500" /> {seller.ratingAvg} <span className="font-normal">({seller.ratingCount})</span></>
                : <span className="font-normal">No reviews yet</span>}
            </p>
          </div>

          {notice.text && (
            <p role={notice.type === 'ok' ? 'status' : 'alert'} className={`mt-5 animate-fade-up ${notice.type === 'ok' ? 'alert-success' : 'alert-error'}`}>
              {notice.text}
            </p>
          )}

          {isOwner ? (
            <p className="mt-5 rounded-xl bg-cream/60 p-3 text-sm text-navy ring-1 ring-inset ring-cream">This is your listing.</p>
          ) : listing.status !== 'available' ? (
            <p className="mt-5 rounded-xl bg-frost p-3 text-sm text-slate-700">This uniform is {listing.status}.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {options.length > 1 && (
                <fieldset>
                  <legend className="label">I want to</legend>
                  <div className="flex gap-1 rounded-xl bg-frost p-1">
                    {options.map((o) => (
                      <button key={o} type="button" onClick={() => setOption(o)} aria-pressed={option === o}
                        className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 active:scale-[0.98] ${option === o ? 'bg-white text-navy shadow-sm' : 'text-slate-600 hover:text-navy'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              <div>
                <label className="label" htmlFor="note">Note for the seller <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea id="note" className="input resize-none" rows={2} maxLength={500} placeholder="e.g. Can we meet after class on Friday?"
                  value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button className="btn-primary py-3" onClick={sendRequest} disabled={busy}>
                  {option === 'Exchange' ? 'Request swap' : 'Request to buy'}
                </button>
                <button className="btn-outline py-3" onClick={messageSeller}>
                  <Icon name="chat" className="h-4 w-4" /> Message seller
                </button>
              </div>
            </div>
          )}

          <p className="mt-5 flex gap-2 text-xs leading-relaxed text-slate-600">
            <Icon name="shield" className="h-4 w-4 shrink-0 text-navy" />
            Meet on campus in a busy place, and check the uniform before you pay.
          </p>
        </aside>

        {listing.description && (
          <section aria-labelledby="about-heading" className={LAYOUT.about}>
            <h2 id="about-heading" className="section-title">About this uniform</h2>
            <p className="mt-2 max-w-prose whitespace-pre-line break-words text-base leading-relaxed text-slate-700">{listing.description}</p>
          </section>
        )}
      </div>
    </div>
  );
}
