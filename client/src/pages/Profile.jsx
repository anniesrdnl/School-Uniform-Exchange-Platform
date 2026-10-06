import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/Icon.jsx';
import Avatar from '../components/Avatar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PageBackdrop from '../components/PageBackdrop.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { RowsSkeleton, Spinner } from '../components/Loader.jsx';
import { formatPrice, timeAgo } from '../constants.js';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy';
const TABS = [
  ['incoming', 'Requests for me', 'inbox'],
  ['outgoing', 'My requests', 'send'],
  ['listings', 'My listings', 'tag'],
];

// Small listing photo for request rows
function Thumb({ src }) {
  const [broken, setBroken] = useState(false); // missing photo: show the placeholder, not a broken-image icon
  return src && !broken
    ? <img src={src} alt="" onError={() => setBroken(true)} className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-aqua transition duration-300 group-hover/thumb:scale-105" />
    : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-frost text-slate-500"><Icon name="photo" className="h-5 w-5" /></span>;
}

// Clickable number in the header; takes you to the matching tab
function Stat({ value, label, onClick, highlight }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick}
      className={`flex min-w-0 flex-col items-center rounded-xl px-3 py-2.5 text-center transition duration-200 enabled:hover:-translate-y-0.5 enabled:hover:bg-aqua/70 enabled:hover:shadow-sm enabled:active:scale-[0.97] sm:min-w-24 sm:px-4 ${focusRing} ${highlight ? 'bg-navy text-white' : 'bg-frost text-navy'}`}>
      {value == null
        ? <span className="skeleton my-1 block h-6 w-8" aria-label="Loading" />
        : <span className="text-2xl font-bold leading-8">{value}</span>}
      <span className={`text-xs ${highlight ? 'text-cream' : 'text-slate-600'}`}>{label}</span>
    </button>
  );
}

// Star rating + comment, shown after a completed exchange (replaces the browser's prompt box)
function ReviewDialog({ target, onClose, onDone }) {
  const ref = useRef(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = ref.current;
    if (target && !dialog.open) {
      setRating(0); setHover(0); setComment(''); setError('');
      dialog.showModal();
    }
    if (!target && dialog.open) dialog.close();
  }, [target]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Choose from 1 to 5 stars.');
    setBusy(true);
    setError('');
    try {
      await api.post('/users/reviews', { requestId: target.requestId, rating, comment: comment.trim() });
      onDone(target.name);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const shown = hover || rating;
  const words = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

  return (
    <dialog ref={ref} onClose={onClose} onCancel={(e) => busy && e.preventDefault()} aria-labelledby="review-title"
      className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-2xl bg-white p-0 text-ink shadow-2xl shadow-navy/25 ring-1 ring-aqua backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] open:animate-fade-up">
      <form onSubmit={submit} className="p-5 sm:p-6">
        <h2 id="review-title" className="text-lg font-bold">Rate your exchange</h2>
        <p className="mt-1 text-sm text-slate-600">How was it dealing with {target?.name || 'them'}? Your review shows on their profile.</p>

        <div className="mt-5 flex items-center gap-3">
          <div role="radiogroup" aria-label="Rating" className="flex" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
                onClick={() => { setRating(n); setError(''); }} onMouseEnter={() => setHover(n)}
                className={`rounded-lg p-1 transition duration-150 hover:scale-110 active:scale-90 ${focusRing}`}>
                <Icon name="star" filled={n <= shown} className={`h-8 w-8 ${n <= shown ? 'text-amber-500' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>
          <span className="text-sm font-semibold text-navy" aria-live="polite">{words[shown]}</span>
        </div>

        <label htmlFor="review-comment" className="label mt-5">Comment <span className="font-normal text-slate-500">(optional)</span></label>
        <textarea id="review-comment" rows={3} maxLength={300} className="input resize-none" placeholder="On time, item as described…"
          value={comment} onChange={(e) => setComment(e.target.value)} />
        <p className="mt-1 text-right text-xs text-slate-500">{comment.length}/300</p>

        {error && <p role="alert" className="alert-error mt-3">{error}</p>}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy ? <><Spinner /> Sending…</> : 'Send review'}</button>
        </div>
      </form>
    </dialog>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([id]) => id === params.get('tab')) ? params.get('tab') : 'incoming'; // the open tab lives in the URL
  // null = still loading (placeholders show); reloads after an action keep the current data on screen
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState(null);
  const [incoming, setIncoming] = useState(null);
  const [outgoing, setOutgoing] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(''); // `${requestId}:${action}` while that button is working
  const [reviewing, setReviewing] = useState(null); // { requestId, name }
  const [deleting, setDeleting] = useState(null); // listing to delete (confirm dialog)
  const tabRefs = useRef([]);

  const load = () => {
    const fetchInto = (url, set, fallback) => api.get(url).then((r) => set(r.data)).catch((e) => {
      set((prev) => prev ?? fallback);
      setError(errMsg(e));
    });
    fetchInto('/users/me/stats', setStats, { itemsListed: 0, completedExchanges: 0 });
    fetchInto('/listings/mine', setListings, []);
    fetchInto('/requests/incoming', setIncoming, []);
    fetchInto('/requests/outgoing', setOutgoing, []);
  };
  useEffect(load, []);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const openTab = (id) => setParams(id === 'incoming' ? {} : { tab: id }, { replace: true });
  // left/right arrow keys move between tabs
  const onTabKey = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
    openTab(TABS[next][0]);
    tabRefs.current[next]?.focus();
  };

  const setStatus = async (id, status) => {
    setBusy(`${id}:${status}`);
    setError('');
    try {
      await api.patch(`/requests/${id}/status`, { status });
      setNotice({ accepted: 'Request accepted. The uniform is now reserved.', declined: 'Request declined.', completed: 'Marked as completed.', cancelled: 'Request cancelled.' }[status]);
      load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy('');
    }
  };

  // open (or reuse) the chat with the other person about this listing
  const messagePerson = async (r, personId) => {
    setBusy(`${r._id}:message`);
    try {
      const { data } = await api.post('/messages/conversations', { userId: personId, listingId: r.listing?._id });
      navigate(`/messages?c=${data._id}`);
    } catch (e) {
      setError(errMsg(e));
      setBusy('');
    }
  };

  // removed from the grid straight away; put back if the server refuses
  const deleteListing = async () => {
    const listing = deleting;
    setDeleting(null);
    setListings((prev) => prev?.filter((l) => l._id !== listing._id));
    setStats((s) => s && { ...s, itemsListed: Math.max(0, s.itemsListed - 1) });
    try {
      await api.delete(`/listings/${listing._id}`);
      setNotice('Listing deleted.');
      load();
    } catch (e) {
      setListings((prev) => (prev ? [listing, ...prev] : prev));
      setStats((s) => s && { ...s, itemsListed: s.itemsListed + 1 });
      setError(errMsg(e));
    }
  };

  const waiting = incoming?.filter((r) => r.status === 'pending').length ?? null;
  const counts = { incoming: incoming?.length, outgoing: outgoing?.length, listings: listings?.length };
  const info = [user.studentId, user.program, user.yearLevel].filter(Boolean).join(' · ');

  const actionBtn = (r, status, label, primary) => (
    <button type="button" onClick={() => setStatus(r._id, status)} disabled={Boolean(busy)}
      className={`${primary ? 'btn-primary' : 'btn-outline'} btn-sm h-9 px-3.5`}>
      {busy === `${r._id}:${status}` ? <Spinner className="h-3.5 w-3.5" /> : label}
    </button>
  );
  const messageBtn = (r, person) => person?._id && (
    <button type="button" onClick={() => messagePerson(r, person._id)} disabled={Boolean(busy)} aria-label={`Message ${person.fullName}`} title={`Message ${person.fullName}`}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 ring-1 ring-inset ring-aqua transition duration-200 hover:bg-frost hover:text-navy hover:ring-denim/50 active:scale-95 disabled:opacity-50 ${focusRing}`}>
      {busy === `${r._id}:message` ? <Spinner className="h-4 w-4" /> : <Icon name="chat" className="h-4 w-4" />}
    </button>
  );

  // One request: photo, title, who and what, their note, status, actions
  const requestRow = (r, mine) => {
    const person = mine ? r.seller : r.buyer;
    const swap = r.option === 'Exchange';
    return (
      <li key={r._id} className="flex flex-col gap-3 p-4 transition-colors duration-200 hover:bg-frost/50 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <Link to={`/listings/${r.listing?._id}`} className={`group/thumb shrink-0 overflow-hidden rounded-xl ${focusRing}`} tabIndex={-1} aria-hidden="true">
            <Thumb src={r.listing?.images?.[0]} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link to={`/listings/${r.listing?._id}`} className={`truncate rounded font-semibold text-ink hover:text-navy hover:underline ${focusRing}`}>{r.listing?.title || 'Removed listing'}</Link>
              {r.listing && <span className="text-sm text-slate-500">{formatPrice(r.listing.price)}</span>}
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-700">
              <Avatar name={person?.fullName} src={person?.avatar} className="h-5 w-5 text-[10px]" />
              {mine
                ? <>You asked <b className="font-semibold">{person?.fullName}</b> to {swap ? 'swap' : 'buy'}</>
                : <><b className="font-semibold">{person?.fullName}</b> wants to {swap ? 'swap for it' : 'buy it'}</>}
              <span className="text-slate-400" aria-hidden="true">·</span>
              <span className="text-slate-500">{timeAgo(r.createdAt)}</span>
            </p>
            {r.message && <p className="mt-2 rounded-lg bg-frost/80 px-3 py-1.5 text-sm text-slate-600">“{r.message}”</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 [&>button:not([aria-label])]:flex-1 sm:[&>button:not([aria-label])]:flex-none">
          {!mine && r.status === 'pending' && <>{actionBtn(r, 'accepted', 'Accept', true)}{actionBtn(r, 'declined', 'Decline')}</>}
          {!mine && r.status === 'accepted' && actionBtn(r, 'completed', 'Mark completed', true)}
          {mine && ['pending', 'accepted'].includes(r.status) && actionBtn(r, 'cancelled', 'Cancel request')}
          {r.status === 'completed' && (
            <button type="button" onClick={() => setReviewing({ requestId: r._id, name: person?.fullName?.split(' ')[0] })}
              className="btn-outline btn-sm h-9 px-3.5">
              <Icon name="star" className="h-4 w-4" /> Leave review
            </button>
          )}
          {messageBtn(r, person)}
        </div>
      </li>
    );
  };

  const emptyState = (icon, title, text, cta) => (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center animate-fade-in">
      <span className="icon-tile h-12 w-12"><Icon name={icon} className="h-6 w-6" /></span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-slate-600">{text}</p>
      </div>
      {cta}
    </div>
  );
  const ctaLink = (to, label, icon) => (
    <Link to={to} className="btn-primary btn-sm group/cta h-9 px-4">
      {icon && <Icon name={icon} className="h-4 w-4" strokeWidth={2} />} {label}
      {!icon && <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5" />}
    </Link>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageBackdrop />

      {/* Header: navy banner with one slow glow, then avatar, name, badges and clickable stats */}
      <section className="card overflow-hidden">
        <div className="relative isolate h-24 overflow-hidden bg-navy sm:h-28" aria-hidden="true">
          <div className="absolute -right-24 -top-32 h-80 w-80 animate-drift rounded-full bg-denim/50 blur-3xl [animation-duration:24s]" />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px', maskImage: 'linear-gradient(100deg, transparent 40%, #000)' }} />
        </div>
        <div className="flex flex-col items-center gap-4 px-5 pb-5 text-center sm:px-6 md:flex-row md:items-end md:text-left">
          <Avatar name={user.fullName} src={user.avatar} className="relative -mt-12 h-24 w-24 text-3xl shadow-lg shadow-navy/20 ring-4 ring-white" />
          <div className="min-w-0 flex-1 md:pb-1">
            <h1 className="break-words text-xl font-bold tracking-[-0.015em] text-ink sm:text-2xl">{user.fullName}</h1>
            {info && <p className="text-sm text-slate-600">{info}</p>}
            <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
              <span className="chip bg-frost text-navy ring-1 ring-inset ring-aqua">
                <Icon name="star" filled className="h-3.5 w-3.5 text-amber-500" />
                {user.ratingCount ? `${user.ratingAvg} · ${user.ratingCount} review${user.ratingCount === 1 ? '' : 's'}` : 'No reviews yet'}
              </span>
              {user.verified
                ? <span className="chip bg-aqua text-navy"><Icon name="shield" className="h-3.5 w-3.5" /> Verified student</span>
                : <span className="chip bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200">Awaiting verification</span>}
            </div>
          </div>
          <div className="grid w-full grid-cols-3 gap-2 md:w-auto">
            <Stat value={stats?.itemsListed} label="Listed" onClick={() => openTab('listings')} />
            <Stat value={waiting} label="Waiting for you" onClick={() => openTab('incoming')} highlight={waiting > 0} />
            <Stat value={stats?.completedExchanges} label="Completed" />
          </div>
        </div>
      </section>

      {error && <p role="alert" className="alert-error animate-fade-up">{error}</p>}
      {notice && <p role="status" className="alert-success animate-fade-up">{notice}</p>}

      <section>
        <div className="flex items-end justify-between gap-3">
          <div role="tablist" aria-label="Your activity"
            className="-mx-4 flex h-11 min-w-0 flex-1 overflow-x-auto px-4 shadow-[inset_0_-1px_0_var(--color-aqua)] [scrollbar-width:none] sm:mx-0 sm:px-0">
            {TABS.map(([id, label, icon], i) => (
              <button key={id} ref={(el) => { tabRefs.current[i] = el; }} type="button" role="tab" id={`tab-${id}`}
                aria-selected={tab === id} aria-controls={`panel-${id}`} tabIndex={tab === id ? 0 : -1}
                onClick={() => openTab(id)} onKeyDown={(e) => onTabKey(e, i)}
                className={`tab group first:pl-0 first:after:left-0 ${tab === id ? 'tab-on' : ''}`}>
                <Icon name={icon} className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" /> {label}
                {counts[id] > 0 && (
                  <span className={`rounded-full px-1.5 text-[11px] font-bold leading-5 ${tab === id ? 'bg-navy text-white' : 'bg-frost text-slate-600'}`}>{counts[id]}</span>
                )}
              </button>
            ))}
          </div>
          <Link to="/sell" className="btn-primary btn-sm group/post mb-1.5 hidden h-9 px-4 sm:inline-flex">
            <Icon name="plus" className="h-4 w-4 transition-transform duration-200 group-hover/post:rotate-90" strokeWidth={2} /> Post a uniform
          </Link>
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-4 sm:mt-5">
          {tab === 'incoming' && (
            <div className="card overflow-hidden">
              {incoming === null ? <RowsSkeleton count={3} label="Loading requests" />
                : incoming.length === 0
                  ? emptyState('inbox', 'No requests yet', "They'll show up here when someone wants one of your uniforms.", ctaLink('/sell', 'Post a uniform', 'plus'))
                  : <ul className="divide-y divide-aqua/60">{incoming.map((r) => requestRow(r, false))}</ul>}
            </div>
          )}

          {tab === 'outgoing' && (
            <div className="card overflow-hidden">
              {outgoing === null ? <RowsSkeleton count={3} label="Loading your requests" />
                : outgoing.length === 0
                  ? emptyState('send', "You haven't requested anything yet", 'Find a uniform you like and tap “Request to buy”.', ctaLink('/browse', 'Browse uniforms'))
                  : <ul className="divide-y divide-aqua/60">{outgoing.map((r) => requestRow(r, true))}</ul>}
            </div>
          )}

          {tab === 'listings' && (
            listings === null
              ? <div className="card overflow-hidden"><RowsSkeleton count={3} label="Loading your listings" /></div>
              : listings.length === 0
                ? <div className="card">{emptyState('tag', "You haven't posted anything yet", 'Outgrown a uniform? It only takes a minute to list it.', ctaLink('/sell', 'Post a uniform', 'plus'))}</div>
                : (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                    {listings.map((l) => (
                      <li key={l._id} className="card group flex animate-fade-in flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-powder hover:shadow-lg hover:shadow-navy/10">
                        <Link to={`/listings/${l._id}`} className={`block flex-1 ${focusRing} focus-visible:-outline-offset-2`}>
                          <div className="relative aspect-square overflow-hidden bg-frost">
                            {l.images?.[0]
                              ? <img src={l.images[0]} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                              : <div className="flex h-full items-center justify-center text-slate-400"><Icon name="photo" className="h-8 w-8" /></div>}
                            <span className="absolute left-2 top-2"><StatusBadge status={l.status} /></span>
                          </div>
                          <div className="space-y-0.5 p-3">
                            <p className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-navy">{l.title}</p>
                            <p className="truncate text-xs text-slate-500">Size {l.size} · {timeAgo(l.createdAt)}</p>
                            <p className="pt-1 font-bold text-navy">{formatPrice(l.price)}</p>
                          </div>
                        </Link>
                        <div className="flex border-t border-aqua/70 text-xs font-semibold">
                          <Link to={`/listings/${l._id}`} className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-navy transition hover:bg-frost active:bg-aqua ${focusRing} focus-visible:-outline-offset-2`}>
                            <Icon name="eye" className="h-4 w-4" /> View
                          </Link>
                          <button type="button" onClick={() => setDeleting(l)}
                            className={`flex flex-1 items-center justify-center gap-1.5 border-l border-aqua/70 py-2.5 text-red-600 transition hover:bg-red-50 active:bg-red-100 ${focusRing} focus-visible:-outline-offset-2`}>
                            <Icon name="trash" className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
          )}
        </div>
      </section>

      <ConfirmDialog open={Boolean(deleting)} title="Delete this listing?" confirmLabel="Delete listing"
        onConfirm={deleteListing} onClose={() => setDeleting(null)}>
        “{deleting?.title}” will be removed from the site, along with any requests for it. This can't be undone.
      </ConfirmDialog>

      <ReviewDialog target={reviewing} onClose={() => setReviewing(null)}
        onDone={(name) => { setReviewing(null); setNotice(`Thanks! Your review for ${name || 'them'} was posted.`); }} />
    </div>
  );
}
