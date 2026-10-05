import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/Icon.jsx';
import Avatar from '../components/Avatar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatPrice } from '../constants.js';

// Small listing photo for request and listing rows
function Thumb({ src }) {
  const [broken, setBroken] = useState(false); // missing photo: show the placeholder, not a broken-image icon
  return src && !broken
    ? <img src={src} alt="" onError={() => setBroken(true)} className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-aqua" />
    : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-frost text-slate-500"><Icon name="photo" className="h-5 w-5" /></span>;
}

function Section({ title, action, empty, children }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      <div className="card divide-y divide-aqua/60 overflow-hidden">
        {children?.length ? children : <p className="p-5 text-sm text-slate-600">{empty}</p>}
      </div>
    </section>
  );
}

const rowCls = 'flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between';
const actionsCls = 'flex shrink-0 gap-2 [&>*]:flex-1 sm:[&>*]:flex-none';

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ itemsListed: 0, completedExchanges: 0 });
  const [listings, setListings] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/users/me/stats').then((r) => setStats(r.data));
    api.get('/listings/mine').then((r) => setListings(r.data));
    api.get('/requests/incoming').then((r) => setIncoming(r.data));
    api.get('/requests/outgoing').then((r) => setOutgoing(r.data));
  };
  useEffect(load, []);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/requests/${id}/status`, { status });
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const review = async (requestId) => {
    const rating = Number(prompt('Rate this exchange from 1 to 5'));
    if (!rating) return;
    try {
      await api.post('/users/reviews', { requestId, rating });
      alert('Thanks for your review.');
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await api.delete(`/listings/${id}`);
    load();
  };

  return (
    <div className="space-y-8">
      <section className="card overflow-hidden">
        <div className="relative h-20 overflow-hidden bg-aqua sm:h-24" aria-hidden="true">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-powder" />
          <div className="absolute -bottom-12 right-28 h-28 w-28 rounded-full bg-cream" />
        </div>
        <div className="flex flex-col items-center gap-4 px-5 pb-5 text-center sm:px-6 md:flex-row md:items-end md:text-left">
          <Avatar name={user.fullName} src={user.avatar} className="relative -mt-10 h-20 w-20 text-2xl ring-4 ring-white" />
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-xl font-extrabold tracking-tight sm:text-2xl">{user.fullName}</h1>
            <p className="text-sm text-slate-600">{[user.studentId, user.program, user.yearLevel].filter(Boolean).join(' · ')}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
              <span className="chip bg-frost text-navy">
                <Icon name="star" filled className="h-3.5 w-3.5 text-amber-500" />
                {user.ratingCount ? `${user.ratingAvg} · ${user.ratingCount} review${user.ratingCount === 1 ? '' : 's'}` : 'No reviews yet'}
              </span>
              {user.verified
                ? <span className="chip bg-aqua text-navy"><Icon name="shield" className="h-3.5 w-3.5" /> Verified student</span>
                : <span className="chip bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200">Awaiting verification</span>}
            </div>
          </div>
          <dl className="flex w-full justify-center gap-3 md:w-auto">
            {[['Items listed', stats.itemsListed], ['Completed', stats.completedExchanges]].map(([label, n]) => (
              <div key={label} className="flex min-w-24 flex-1 flex-col-reverse rounded-xl bg-frost px-4 py-2.5 text-center md:flex-none">
                <dt className="text-xs text-slate-600">{label}</dt>
                <dd className="text-2xl font-extrabold text-navy">{n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">{error}</p>}

      <Section title="Requests for my uniforms" empty="No requests yet. They'll show up here when someone wants one of your uniforms.">
        {incoming.map((r) => (
          <div key={r._id} className={rowCls}>
            <div className="flex min-w-0 gap-3">
              <Thumb src={r.listing?.images?.[0]} />
              <div className="min-w-0 break-words text-sm">
                <p className="font-semibold">{r.listing?.title} <span className="font-normal text-slate-500">· {formatPrice(r.listing?.price)}</span></p>
                <p className="text-slate-700">{r.buyer?.fullName} wants to <b>{r.option.toLowerCase()}</b>{r.message && `: “${r.message}”`}</p>
                <div className="mt-1"><StatusBadge status={r.status} /></div>
              </div>
            </div>
            <div className={actionsCls}>
              {r.status === 'pending' && (<>
                <button className="btn-primary btn-sm" onClick={() => setStatus(r._id, 'accepted')}>Accept</button>
                <button className="btn-outline btn-sm" onClick={() => setStatus(r._id, 'declined')}>Decline</button>
              </>)}
              {r.status === 'accepted' && <button className="btn-primary btn-sm" onClick={() => setStatus(r._id, 'completed')}>Mark completed</button>}
              {r.status === 'completed' && <button className="btn-outline btn-sm" onClick={() => review(r._id)}>Leave review</button>}
            </div>
          </div>
        ))}
      </Section>

      <Section title="My requests" empty="You haven't requested anything yet.">
        {outgoing.map((r) => (
          <div key={r._id} className={rowCls}>
            <div className="flex min-w-0 items-center gap-3">
              <Thumb src={r.listing?.images?.[0]} />
              <div className="min-w-0 break-words text-sm">
                <p><b>{r.listing?.title}</b> <span className="text-slate-500">from {r.seller?.fullName}</span></p>
                <div className="mt-1"><StatusBadge status={r.status} /></div>
              </div>
            </div>
            <div className={actionsCls}>
              {['pending', 'accepted'].includes(r.status) && <button className="btn-outline btn-sm" onClick={() => setStatus(r._id, 'cancelled')}>Cancel</button>}
              {r.status === 'completed' && <button className="btn-outline btn-sm" onClick={() => review(r._id)}>Leave review</button>}
            </div>
          </div>
        ))}
      </Section>

      <Section title="My listings" empty="You haven't posted anything yet."
        action={<Link to="/sell" className="btn-primary btn-sm"><Icon name="plus" className="h-4 w-4" strokeWidth={2} /> Post a uniform</Link>}>
        {listings.map((l) => (
          <div key={l._id} className="flex items-center justify-between gap-3 p-4 text-sm">
            <Link to={`/listings/${l._id}`} className="group flex min-w-0 items-center gap-3">
              <Thumb src={l.images?.[0]} />
              <span className="min-w-0">
                <span className="block truncate font-semibold group-hover:underline">{l.title}</span>
                <span className="mt-1 flex items-center gap-2 text-slate-500">{formatPrice(l.price)} <StatusBadge status={l.status} /></span>
              </span>
            </Link>
            <button className="btn-sm shrink-0 rounded-lg font-semibold text-red-600 transition hover:bg-red-50" onClick={() => remove(l._id)}>Delete</button>
          </div>
        ))}
      </Section>
    </div>
  );
}
