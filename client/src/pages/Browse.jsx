import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api.js';
import ListingCard from '../components/ListingCard.jsx';
import { EmptyState, ListingGridSkeleton, Spinner } from '../components/Loader.jsx';

const CATEGORIES = ['Uniform Shirt', 'Pants / Skirt', 'PE Uniform', 'Accessories'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(params.get('page') || 1);
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    setLoading(true);
    api.get('/listings', { params: Object.fromEntries(params) })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [params]);

  const select = (key, label, options) => (
    <div>
      <label className="label" htmlFor={key}>{label}</label>
      <select id={key} className="input" value={params.get(key) || ''} onChange={(e) => setParam(key, e.target.value)}>
        <option value="">Any</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="md:grid md:grid-cols-[220px_1fr] md:gap-6">
      {/* Filters: collapsible on phones, always-on sidebar on desktop */}
      <aside>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-outline mb-3 w-full md:hidden">
          {showFilters ? 'Hide filters' : 'Show filters'}
        </button>
        <div className={`card space-y-4 p-4 md:sticky md:top-20 ${showFilters ? 'block animate-fade-up' : 'hidden'} md:block`}>
          <div>
            <label className="label" htmlFor="q">Search</label>
            <input id="q" className="input" defaultValue={params.get('q') || ''}
              onKeyDown={(e) => e.key === 'Enter' && setParam('q', e.target.value)} placeholder="Press Enter" />
          </div>
          {select('category', 'Category', CATEGORIES)}
          {select('size', 'Size', SIZES)}
          {select('condition', 'Condition', CONDITIONS)}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label" htmlFor="minPrice">Min ₱</label>
              <input id="minPrice" type="number" min="0" className="input" defaultValue={params.get('minPrice') || ''}
                onBlur={(e) => setParam('minPrice', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="maxPrice">Max ₱</label>
              <input id="maxPrice" type="number" min="0" className="input" defaultValue={params.get('maxPrice') || ''}
                onBlur={(e) => setParam('maxPrice', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="sort">Sort by</label>
            <select id="sort" className="input" value={params.get('sort') || 'newest'} onChange={(e) => setParam('sort', e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
          <button className="btn-outline w-full" onClick={() => setParams({})}>Clear filters</button>
        </div>
      </aside>

      <section className="mt-4 md:mt-0">
        <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">
          {loading ? <><Spinner className="h-3.5 w-3.5 text-navy" /> Loading…</> : `${data.total} uniform${data.total === 1 ? '' : 's'}`}
        </p>
        {loading ? (
          <ListingGridSkeleton count={8} className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4" />
        ) : data.items.length === 0 ? (
          <EmptyState icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
            </svg>
          }>No uniforms match those filters. Try clearing some.</EmptyState>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((l, i) => (
              <div key={l._id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }}><ListingCard listing={l} /></div>
            ))}
          </div>
        )}
        {data.pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button className="btn-outline" disabled={page <= 1} onClick={() => setParam('page', page - 1)}>Previous</button>
            <span className="text-sm">Page {page} of {data.pages}</span>
            <button className="btn-outline" disabled={page >= data.pages} onClick={() => setParam('page', page + 1)}>Next</button>
          </div>
        )}
      </section>
    </div>
  );
}
