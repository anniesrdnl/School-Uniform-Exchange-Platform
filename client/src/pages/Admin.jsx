import { useEffect, useState } from 'react';
import api from '../api.js';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatPrice } from '../constants.js';

const TABS = ['Users', 'Listings', 'Reports'];
const HEADERS = {
  Users: ['Student', 'Status', ''],
  Listings: ['Listing', 'Status', ''],
  Reports: ['Report', 'Status', ''],
};

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('Users');
  const [rows, setRows] = useState(null); // null while the tab's rows load (placeholder rows show)

  const loadStats = () => api.get('/admin/stats').then((r) => setStats(r.data));
  const fetchRows = (t) => api.get(`/admin/${t.toLowerCase()}`).then((r) => r.data);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    let ignore = false; // switching tabs quickly: only the latest tab's rows are shown
    setRows(null);
    fetchRows(tab).then((data) => !ignore && setRows(data)).catch(() => !ignore && setRows([]));
    return () => { ignore = true; };
  }, [tab]);

  // after an action, refresh in place (the current rows stay on screen until the new ones arrive)
  const act = async (fn) => { await fn(); setRows(await fetchRows(tab)); loadStats(); };

  const cards = stats && [
    ['Total users', stats.totalUsers, 'users'],
    ['Active listings', stats.activeListings, 'tag'],
    ['Completed exchanges', stats.completedExchanges, 'recycle'],
    ['Open reports', stats.openReports, 'flag'],
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Admin dashboard</h1>
        <p className="page-subtitle">Verify students, moderate listings, and handle reports.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {cards
          ? cards.map(([label, n, icon], i) => (
              <div key={label} className="card flex animate-fade-up items-center gap-3 p-4" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="icon-tile hidden h-11 w-11 sm:flex"><Icon name={icon} className="h-6 w-6" /></span>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-navy">{n}</p>
                  <p className="text-xs text-slate-600 sm:text-sm">{label}</p>
                </div>
              </div>
            ))
          : Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="card space-y-2 p-4" aria-hidden="true"><div className="skeleton h-8 w-12" /><div className="skeleton h-4 w-24" /></div>
            ))}
      </div>

      <div className="inline-flex gap-1 rounded-xl bg-frost p-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-white text-navy shadow-sm' : 'text-slate-600 hover:text-navy'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* wide tables scroll sideways inside their own box on phones. "relative" keeps the sr-only header label
          positioned inside this box; without it, it escaped and widened the whole page on phones */}
      <Reveal className="card scroll-thin relative overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm" aria-busy={rows === null}>
          <thead className="bg-frost/60 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              {HEADERS[tab].map((h, i) => <th key={i} scope="col" className={`px-4 py-3 font-semibold ${i === 2 ? 'text-right' : ''}`}>{h || <span className="sr-only">Actions</span>}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-aqua/60">
            {rows === null && [0, 1, 2, 3].map((i) => (
              <tr key={i} aria-hidden="true">
                <td className="px-4 py-3"><div className="skeleton h-4 w-40" /><div className="skeleton mt-1.5 h-3 w-56" /></td>
                <td className="px-4 py-3"><div className="skeleton h-5 w-20 rounded-full" /></td>
                <td className="px-4 py-3"><div className="skeleton ml-auto h-7 w-28 rounded-lg" /></td>
              </tr>
            ))}
            {rows?.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-slate-600">Nothing to show.</td></tr>}

            {tab === 'Users' && rows?.map((u) => (
              <tr key={u._id}>
                <td className="px-4 py-3"><b>{u.fullName}</b><br /><span className="text-xs text-slate-500">{u.studentId} · {u.email}</span></td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap gap-1.5">
                    {u.verified
                      ? <span className="chip bg-aqua text-navy">Verified</span>
                      : <span className="chip bg-slate-100 text-slate-600">Unverified</span>}
                    {u.banned && <span className="chip bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">Banned</span>}
                  </span>
                </td>
                <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right">
                  {u.role !== 'admin' && (<>
                    <button className="btn-outline btn-sm" onClick={() => act(() => api.patch(`/admin/users/${u._id}`, { verified: !u.verified }))}>{u.verified ? 'Unverify' : 'Verify'}</button>
                    <button className="btn-outline btn-sm" onClick={() => act(() => api.patch(`/admin/users/${u._id}`, { banned: !u.banned }))}>{u.banned ? 'Unban' : 'Ban'}</button>
                  </>)}
                </td>
              </tr>
            ))}

            {tab === 'Listings' && rows?.map((l) => (
              <tr key={l._id}>
                <td className="px-4 py-3"><b>{l.title}</b><br /><span className="text-xs text-slate-500">by {l.seller?.fullName} · {formatPrice(l.price)}</span></td>
                <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-right"><button className="btn-outline btn-sm" onClick={() => act(() => api.delete(`/admin/listings/${l._id}`))}>Remove</button></td>
              </tr>
            ))}

            {tab === 'Reports' && rows?.map((r) => (
              <tr key={r._id}>
                <td className="px-4 py-3"><b className="capitalize">{r.targetType}</b> reported by {r.reporter?.fullName}<br /><span className="text-xs text-slate-500">{r.reason}</span></td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right">
                  {r.status === 'open' && (<>
                    <button className="btn-outline btn-sm" onClick={() => act(() => api.patch(`/admin/reports/${r._id}`, { status: 'resolved' }))}>Resolve</button>
                    <button className="btn-outline btn-sm" onClick={() => act(() => api.patch(`/admin/reports/${r._id}`, { status: 'dismissed' }))}>Dismiss</button>
                  </>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </div>
  );
}
