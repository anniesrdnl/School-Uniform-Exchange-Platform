import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EmptyState } from '../components/Loader.jsx';

function DetailsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2" role="status" aria-label="Loading listing">
      <div className="skeleton aspect-square !rounded-xl" />
      <div className="space-y-4">
        <div className="skeleton h-7 w-3/4" />
        <div className="skeleton h-7 w-1/4" />
        <div className="skeleton h-16 w-full !rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-10" />)}
        </div>
        <div className="skeleton h-11 w-full !rounded-lg" />
        <div className="skeleton h-11 w-full !rounded-lg" />
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
    api.get(`/listings/${id}`).then((r) => setListing(r.data)).catch((e) => setNotice({ type: 'error', text: errMsg(e) }));
  }, [id]);

  if (!listing) return notice.text
    ? <EmptyState icon={<span aria-hidden="true">⚠️</span>}>{notice.text}</EmptyState>
    : <DetailsSkeleton />;

  const isOwner = user && listing.seller._id === user._id;
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

  return (
    <div className="grid gap-5 md:grid-cols-2 md:gap-6">
      <div>
        <div className="aspect-square overflow-hidden rounded-xl bg-sky shadow-lg shadow-navy/10">
          {listing.images[active]
            ? <img key={active} src={listing.images[active]} alt={listing.title} className="h-full w-full animate-fade-in object-cover" />
            : <div className="flex h-full items-center justify-center text-slate-400">No photo</div>}
        </div>
        {listing.images.length > 1 && (
          <div className="scroll-thin -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            {listing.images.map((src, i) => (
              <button key={src} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition duration-200 ${i === active ? 'border-navy ring-2 ring-navy/20' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{listing.title}</h1>
          <p className="text-2xl font-extrabold text-navy">₱{listing.price}</p>
        </div>

        <div className="card flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy font-bold text-white">{listing.seller.fullName?.[0]}</div>
            <div>
            <p className="text-sm font-semibold">{listing.seller.fullName}</p>
            <p className="text-xs text-slate-500">
              {listing.seller.ratingCount ? `★ ${listing.seller.ratingAvg} (${listing.seller.ratingCount} reviews)` : 'No reviews yet'}
            </p>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs text-slate-500">Size</dt><dd className="font-semibold">{listing.size}</dd></div>
          <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs text-slate-500">Condition</dt><dd className="font-semibold">{listing.condition}</dd></div>
          <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs text-slate-500">Category</dt><dd className="font-semibold">{listing.category}</dd></div>
          <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs text-slate-500">Available</dt><dd className="font-semibold">{listing.quantity}</dd></div>
          <div className="col-span-2 rounded-lg bg-white p-3 ring-1 ring-slate-200"><dt className="text-xs text-slate-500">Accepts</dt><dd className="font-semibold">{listing.exchangeOption}</dd></div>
        </dl>

        {listing.description && <p className="text-sm text-slate-700">{listing.description}</p>}

        {notice.text && (
          <p role="status" className={`animate-fade-up rounded-lg p-3 text-sm ${notice.type === 'ok' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>{notice.text}</p>
        )}

        {isOwner ? (
          <p className="rounded-lg bg-sky p-3 text-sm">This is your listing.</p>
        ) : listing.status !== 'available' ? (
          <p className="rounded-lg bg-slate-100 p-3 text-sm">This uniform is {listing.status}.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              {['Buy', 'Exchange'].map((o) => (
                <button key={o} onClick={() => setOption(o)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition duration-200 active:scale-[0.97] ${option === o ? 'border-navy bg-navy text-white shadow-sm' : 'border-slate-300 bg-white hover:border-navy/50'}`}>{o}</button>
              ))}
            </div>
            <textarea className="input" rows={2} placeholder="Add a note for the seller (optional)"
              value={message} onChange={(e) => setMessage(e.target.value)} />
            <button className="btn-primary w-full" onClick={sendRequest}>Request exchange</button>
            <button className="btn-outline w-full" onClick={messageSeller}>Message seller</button>
          </div>
        )}
      </div>
    </div>
  );
}
