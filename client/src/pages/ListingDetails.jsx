import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EmptyState } from '../components/Loader.jsx';
import Icon from '../components/Icon.jsx';
import Avatar from '../components/Avatar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatPrice } from '../constants.js';

// Which request types a listing's exchange option allows
const OPTIONS_FOR = { 'Buy Only': ['Buy'], 'Exchange Only': ['Exchange'] };

function DetailsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:gap-10" role="status" aria-label="Loading listing">
      <div className="skeleton aspect-square rounded-2xl" />
      <div className="space-y-4">
        <div className="skeleton h-5 w-24 rounded-full" />
        <div className="skeleton h-8 w-3/4" />
        <div className="skeleton h-8 w-1/4" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
        </div>
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="skeleton h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [active, setActive] = useState(0);
  const [option, setOption] = useState('Buy');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState({ type: '', text: '' });

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

  const isOwner = user && listing.seller._id === user._id;
  const options = OPTIONS_FOR[listing.exchangeOption] || ['Buy', 'Exchange'];
  const needLogin = () => navigate('/login', { state: { from: { pathname: `/listings/${id}` } } });

  const sendRequest = async () => {
    if (!user) return needLogin();
    try {
      await api.post('/requests', { listing: id, option, message });
      setNotice({ type: 'ok', text: 'Request sent. The seller will respond soon.' });
    } catch (e) {
      setNotice({ type: 'error', text: errMsg(e) });
    }
  };

  const messageSeller = async () => {
    if (!user) return needLogin();
    try {
      await api.post('/messages/conversations', { userId: listing.seller._id, listingId: id });
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

  return (
    <div className="space-y-4">
      <Link to="/browse" className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-navy hover:underline">
        <Icon name="arrow-left" className="h-4 w-4" /> Back to browse
      </Link>

      <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-frost ring-1 ring-aqua/70">
            {listing.images[active]
              ? <img key={active} src={listing.images[active]} alt={listing.title} className="h-full w-full animate-fade-in object-cover" />
              : <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-500"><Icon name="photo" className="h-10 w-10" />No photo</div>}
          </div>
          {listing.images.length > 1 && (
            <div className="scroll-thin -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
              {listing.images.map((src, i) => (
                <button key={src} onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`} aria-pressed={i === active}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition duration-200 ${i === active ? 'border-navy' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={listing.status} />
              <span className="chip bg-frost text-navy">{listing.category}</span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{listing.title}</h1>
            <p className="mt-1 text-3xl font-extrabold text-navy">{formatPrice(listing.price)}</p>
          </div>

          <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            {details.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-frost px-3 py-2.5">
                <dt className="text-xs text-slate-600">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {listing.description && (
            <div>
              <h2 className="text-sm font-bold">Description</h2>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">{listing.description}</p>
            </div>
          )}

          <div className="card flex items-center gap-3 p-4">
            <Avatar name={listing.seller.fullName} src={listing.seller.avatar} className="h-11 w-11 text-base" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Sold by</p>
              <p className="truncate text-sm font-semibold">{listing.seller.fullName}</p>
              <p className="flex items-center gap-1 text-xs text-slate-600">
                {listing.seller.ratingCount
                  ? <><Icon name="star" filled className="h-3.5 w-3.5 text-amber-500" /> {listing.seller.ratingAvg} · {listing.seller.ratingCount} review{listing.seller.ratingCount === 1 ? '' : 's'}</>
                  : 'No reviews yet'}
              </p>
            </div>
          </div>

          {notice.text && (
            <p role={notice.type === 'ok' ? 'status' : 'alert'}
              className={`animate-fade-up rounded-xl p-3 text-sm ring-1 ring-inset ${notice.type === 'ok' ? 'bg-green-50 text-green-800 ring-green-200' : 'bg-red-50 text-red-700 ring-red-200'}`}>
              {notice.text}
            </p>
          )}

          {isOwner ? (
            <p className="rounded-xl bg-cream/60 p-3 text-sm text-navy ring-1 ring-inset ring-cream">This is your listing.</p>
          ) : listing.status !== 'available' ? (
            <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">This uniform is {listing.status}.</p>
          ) : (
            <div className="space-y-3">
              {options.length > 1 && (
                <fieldset>
                  <legend className="label">I want to</legend>
                  <div className="flex gap-1 rounded-xl bg-frost p-1">
                    {options.map((o) => (
                      <button key={o} type="button" onClick={() => setOption(o)} aria-pressed={option === o}
                        className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 ${option === o ? 'bg-white text-navy shadow-sm' : 'text-slate-600 hover:text-navy'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              <div>
                <label className="label" htmlFor="note">Note for the seller <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea id="note" className="input" rows={2} maxLength={500} placeholder="e.g. Can we meet after class on Friday?"
                  value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button className="btn-primary" onClick={sendRequest}>
                  {option === 'Exchange' ? 'Request swap' : 'Request to buy'}
                </button>
                <button className="btn-outline" onClick={messageSeller}>
                  <Icon name="chat" className="h-4 w-4" /> Message seller
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
