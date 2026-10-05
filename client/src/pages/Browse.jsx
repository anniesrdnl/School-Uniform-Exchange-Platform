import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api.js';
import ListingCard from '../components/ListingCard.jsx';
import Icon from '../components/Icon.jsx';
import { EmptyState, ListingGridSkeleton } from '../components/Loader.jsx';
import { CATEGORIES, CONDITIONS, SIZES } from '../constants.js';

const FILTER_KEYS = ['category', 'size', 'condition', 'minPrice', 'maxPrice'];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(params.get('page') || 1);
  const activeFilters = FILTER_KEYS.filter((k) => params.get(k)).length;

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  // Clears the sidebar filters but keeps the search term and sort order
  const clearFilters = () => {
    const next = new URLSearchParams(params);
    [...FILTER_KEYS, 'page'].forEach((k) => next.delete(k));
    setParams(next);
  };

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    api.get('/listings', { params: Object.fromEntries(params) })
      .then((r) => setData(r.data))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [params]);

  const search = (e) => {
    e.preventDefault();
    setParam('q', new FormData(e.currentTarget).get('q').trim());
  };

  const select = (key, label, options) => (
    <div>
      <label className="label" htmlFor={key}>{label}</label>
      <select id={key} className="input" value={params.get(key) || ''} onChange={(e) => setParam(key, e.target.value)}>
        <option value="">Any</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  // Uncontrolled inputs are keyed by their URL value so "Clear filters" resets them too
  const priceInput = (key, label) => (
    <div>
      <label className="label" htmlFor={key}>{label}</label>
      <input id={key} key={params.get(key) || ''} type="number" min="0" inputMode="numeric" className="input" placeholder="₱"
        defaultValue={params.get(key) || ''} onBlur={(e) => setParam(key, e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && setParam(key, e.target.value)} />
    </div>
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Browse uniforms</h1>
          <p className="mt-1 text-sm text-slate-600">Second-hand uniforms from students on your campus.</p>
        </div>
        <form onSubmit={search} role="search" className="flex w-full gap-2 sm:max-w-sm">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <label htmlFor="q" className="sr-only">Search uniforms</label>
            <input id="q" name="q" key={params.get('q') || ''} className="input pl-11" defaultValue={params.get('q') || ''} placeholder="Search uniforms" />
          </div>
          <button className="btn-primary shrink-0">Search</button>
        </form>
      </header>

      <div className="md:grid md:grid-cols-[240px_1fr] md:items-start md:gap-6">
        {/* Filters: collapsible on phones, sticky sidebar on desktop */}
        <aside>
          <button onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} aria-controls="filters"
            className="btn-outline mb-3 w-full md:hidden">
            <Icon name="filter" className="h-4 w-4" />
            {showFilters ? 'Hide filters' : 'Filters'}
            {activeFilters > 0 && <span className="chip bg-navy text-white">{activeFilters}</span>}
          </button>
          <div id="filters" className={`card space-y-4 p-4 md:sticky md:top-24 md:block ${showFilters ? 'block animate-fade-up' : 'hidden'}`}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Filters</h2>
              {activeFilters > 0 && (
                <button className="rounded text-sm font-semibold text-navy hover:underline" onClick={clearFilters}>
                  Clear all
                </button>
              )}
            </div>
            {select('category', 'Category', CATEGORIES)}
            {select('size', 'Size', SIZES)}
            {select('condition', 'Condition', CONDITIONS)}
            <div className="grid grid-cols-2 gap-2">
              {priceInput('minPrice', 'Min price')}
              {priceInput('maxPrice', 'Max price')}
            </div>
          </div>
        </aside>

        <section className="mt-4 md:mt-0" aria-labelledby="results-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="results-heading" className="text-sm font-semibold text-slate-600" aria-live="polite">
              {loading ? 'Loading…' : `${data.total} uniform${data.total === 1 ? '' : 's'}`}
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-slate-600">Sort</label>
              <select id="sort" className="input w-auto py-2" value={params.get('sort') || 'newest'} onChange={(e) => setParam('sort', e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <ListingGridSkeleton count={8} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4" />
          ) : failed ? (
            <EmptyState icon={<Icon name="warning" className="h-6 w-6" />} title="Couldn't load uniforms">
              Check your connection and try again.
            </EmptyState>
          ) : data.items.length === 0 ? (
            <EmptyState icon={<Icon name="search" className="h-6 w-6" />} title="No matches">
              No uniforms match those filters. Try clearing some.
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {data.items.map((l, i) => (
                <div key={l._id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }}><ListingCard listing={l} /></div>
              ))}
            </div>
          )}

          {data.pages > 1 && !failed && (
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
              <button className="btn-outline" disabled={page <= 1} onClick={() => setParam('page', page - 1)}>
                <Icon name="arrow-left" className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm font-medium text-slate-600">Page {page} of {data.pages}</span>
              <button className="btn-outline" disabled={page >= data.pages} onClick={() => setParam('page', page + 1)}>
                Next <Icon name="arrow-right" className="h-4 w-4" />
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
