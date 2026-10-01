import { useEffect, useState } from 'react';
import api from '../api.js';

const TABS = ['Users', 'Listings', 'Reports'];

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('Users');
  const [rows, setRows] = useState([]);

  const loadStats = () => api.get('/admin/stats').then((r) => setStats(r.data));
  const loadRows = () => api.get(`/admin/${tab.toLowerCase()}`).then((r) => setRows(r.data));

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { setRows([]); loadRows(); }, [tab]);

  const act = async (fn) => { await fn(); loadRows(); loadStats(); };

  const cards = stats && [
    ['Total users', stats.totalUsers], ['Active listings', stats.activeListings],
    ['Completed exchanges', stats.completedExchanges], ['Open reports', stats.openReports],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Admin dashboard</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards
          ? cards.map(([label, n], i) => (
              <div key={label} className="card animate-fade-up p-4 transition hover:shadow-md" style={{ animationDelay: `${i * 60}ms` }}>
                <p className="text-3xl font-extrabold text-navy">{n}</p><p className="text-sm text-slate-500">{label}</p>
              </div>
            ))
          : Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="card space-y-2 p-4" aria-hidden="true"><div className="skeleton h-8 w-12" /><div className="skeleton h-4 w-24" /></div>
            ))}
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'btn-primary' : 'btn-outline'}>{t}</button>
        ))}
      </div>

      {/* wide tables scroll sideways inside their own box on phones */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <tbody>
            {rows.length === 0 && <tr><td className="p-4 text-slate-500">Nothing to show.</td></tr>}

            {tab === 'Users' && rows.map((u) => (
              <tr key={u._id} className="border-b border-slate-100">
                <td className="p-3"><b>{u.fullName}</b><br /><span className="text-xs text-slate-500">{u.studentId} · {u.email}</span></td>
                <td className="p-3">{u.verified ? 'Verified' : 'Unverified'}{u.banned && ' · Banned'}</td>
                <td className="space-x-2 p-3 text-right">
                  {u.role !== 'admin' && (<>
                    <button className="btn-outline" onClick={() => act(() => api.patch(`/admin/users/${u._id}`, { verified: !u.verified }))}>{u.verified ? 'Unverify' : 'Verify'}</button>
                    <button className="btn-outline" onClick={() => act(() => api.patch(`/admin/users/${u._id}`, { banned: !u.banned }))}>{u.banned ? 'Unban' : 'Ban'}</button>
                  </>)}
                </td>
              </tr>
            ))}

            {tab === 'Listings' && rows.map((l) => (
              <tr key={l._id} className="border-b border-slate-100">
                <td className="p-3"><b>{l.title}</b><br /><span className="text-xs text-slate-500">by {l.seller?.fullName} · ₱{l.price} · {l.status}</span></td>
                <td className="p-3 text-right"><button className="btn-outline" onClick={() => act(() => api.delete(`/admin/listings/${l._id}`))}>Remove</button></td>
              </tr>
            ))}

            {tab === 'Reports' && rows.map((r) => (
              <tr key={r._id} className="border-b border-slate-100">
                <td className="p-3"><b>{r.targetType}</b> reported by {r.reporter?.fullName}<br /><span className="text-xs text-slate-500">{r.reason}</span></td>
                <td className="p-3">{r.status}</td>
                <td className="space-x-2 p-3 text-right">
                  {r.status === 'open' && (<>
                    <button className="btn-outline" onClick={() => act(() => api.patch(`/admin/reports/${r._id}`, { status: 'resolved' }))}>Resolve</button>
                    <button className="btn-outline" onClick={() => act(() => api.patch(`/admin/reports/${r._id}`, { status: 'dismissed' }))}>Dismiss</button>
                  </>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
