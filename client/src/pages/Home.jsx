import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';
import ListingCard from '../components/ListingCard.jsx';
import { EmptyState, ListingGridSkeleton } from '../components/Loader.jsx';

const CATEGORIES = ['Uniform Shirt', 'Pants / Skirt', 'PE Uniform', 'Accessories'];
const CATEGORY_ICONS = {
  'Uniform Shirt': '👔',
  'Pants / Skirt': '👖',
  'PE Uniform': '🏃',
  'Accessories': '🎒',
};

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/listings', { params: { limit: 8 } }).then((r) => setItems(r.data.items)).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy-soft px-6 py-10 text-white shadow-xl shadow-navy/20 md:px-12 md:py-14">
        {/* decorative rings */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[40px] border-white/5" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-leaf/20 blur-3xl" aria-hidden="true" />

        <h1 className="relative max-w-xl text-3xl font-extrabold leading-tight md:text-4xl">
          Pass on the uniform you've outgrown. Find the one you need.
        </h1>
        <p className="relative mt-3 max-w-lg text-white/80">
          Buy, sell, or swap school uniforms with other students on your campus.
        </p>
        <form onSubmit={search} className="relative mt-6 flex max-w-lg gap-2 rounded-xl bg-white/10 p-1.5 ring-1 ring-white/15 backdrop-blur transition focus-within:bg-white/15 focus-within:ring-white/30">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search polo, skirt, PE shirt…"
            className="w-full rounded-lg px-4 py-3 text-sm text-ink placeholder:text-slate-400 focus:outline-none" aria-label="Search uniforms" />
          <button className="rounded-lg bg-white px-5 text-sm font-semibold text-navy transition hover:bg-sky active:scale-95">Search</button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Categories</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Link key={c} to={`/browse?category=${encodeURIComponent(c)}`} style={{ animationDelay: `${i * 70}ms` }}
              className="card group flex animate-fade-up flex-col items-center gap-2 p-4 text-center text-sm font-semibold transition duration-300 hover:-translate-y-1 hover:border-navy/40 hover:shadow-md hover:shadow-navy/10">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky text-xl transition duration-300 group-hover:scale-110" aria-hidden="true">{CATEGORY_ICONS[c]}</span>
              <span className="transition group-hover:text-navy">{c}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Featured uniforms</h2>
          <Link to="/browse" className="group text-sm font-medium text-navy">
            See all <span className="inline-block transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
          </Link>
        </div>
        {loading
          ? <ListingGridSkeleton count={4} />
          : items.length === 0
            ? <EmptyState icon={<span aria-hidden="true">👕</span>}>No listings yet. Be the first to post a uniform.</EmptyState>
            : <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {items.map((l, i) => (
                  <div key={l._id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}><ListingCard listing={l} /></div>
                ))}
              </div>}
      </section>
    </div>
  );
}
