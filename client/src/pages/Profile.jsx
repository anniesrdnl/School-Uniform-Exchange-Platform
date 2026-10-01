import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

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
    <div className="space-y-6">
      <section className="card flex flex-col items-center gap-3 p-5 text-center sm:p-6 md:flex-row md:gap-6 md:text-left">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-navy to-navy-soft text-2xl font-bold text-white shadow-lg shadow-navy/20 ring-4 ring-sky">
          {user.fullName[0]}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-xl font-bold">{user.fullName}</h1>
          <p className="text-sm text-slate-500">{user.studentId} · {user.program} · {user.yearLevel}</p>
          <p className="text-sm">{user.ratingCount ? `★ ${user.ratingAvg} (${user.ratingCount} reviews)` : 'No reviews yet'}
            {!user.verified && <span className="ml-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Awaiting verification</span>}</p>
        </div>
        <div className="flex w-full justify-center gap-8 border-t border-slate-100 pt-3 text-center md:w-auto md:border-0 md:pt-0">
          <div><p className="text-2xl font-bold">{stats.itemsListed}</p><p className="text-xs text-slate-500">Items listed</p></div>
          <div><p className="text-2xl font-bold">{stats.completedExchanges}</p><p className="text-xs text-slate-500">Completed</p></div>
        </div>
      </section>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section>
        <h2 className="mb-2 text-lg font-bold">Requests for my uniforms</h2>
        {incoming.length === 0 ? <p className="text-sm text-slate-500">No requests yet.</p> : (
          <div className="space-y-2">
            {incoming.map((r) => (
              <div key={r._id} className="card flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 break-words text-sm">
                  <p className="font-semibold">{r.listing?.title} <span className="font-normal text-slate-500">· ₱{r.listing?.price}</span></p>
                  <p>{r.buyer?.fullName} wants to <b>{r.option.toLowerCase()}</b>{r.message && `: “${r.message}”`}</p>
                  <p className="text-xs text-slate-500">Status: {r.status}</p>
                </div>
                <div className="flex shrink-0 gap-2 [&>*]:flex-1 md:[&>*]:flex-none">
                  {r.status === 'pending' && (<>
                    <button className="btn-primary" onClick={() => setStatus(r._id, 'accepted')}>Accept</button>
                    <button className="btn-outline" onClick={() => setStatus(r._id, 'declined')}>Decline</button>
                  </>)}
                  {r.status === 'accepted' && <button className="btn-primary" onClick={() => setStatus(r._id, 'completed')}>Mark completed</button>}
                  {r.status === 'completed' && <button className="btn-outline" onClick={() => review(r._id)}>Leave review</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">My requests</h2>
        {outgoing.length === 0 ? <p className="text-sm text-slate-500">You haven't requested anything yet.</p> : (
          <div className="space-y-2">
            {outgoing.map((r) => (
              <div key={r._id} className="card flex flex-col gap-2 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 break-words"><b>{r.listing?.title}</b> from {r.seller?.fullName} · {r.status}</p>
                <div className="flex shrink-0 gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
                  {['pending', 'accepted'].includes(r.status) && <button className="btn-outline" onClick={() => setStatus(r._id, 'cancelled')}>Cancel</button>}
                  {r.status === 'completed' && <button className="btn-outline" onClick={() => review(r._id)}>Leave review</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">My listings</h2>
          <Link to="/sell" className="btn-primary">Post a uniform</Link>
        </div>
        {listings.length === 0 ? <p className="text-sm text-slate-500">You haven't posted anything yet.</p> : (
          <div className="space-y-2">
            {listings.map((l) => (
              <div key={l._id} className="card flex items-center justify-between gap-3 p-4 text-sm">
                <Link to={`/listings/${l._id}`} className="min-w-0 break-words font-semibold hover:underline">{l.title} · ₱{l.price} · {l.status}</Link>
                <button className="shrink-0 rounded-lg px-2 py-1 text-red-600 hover:bg-red-50" onClick={() => remove(l._id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
