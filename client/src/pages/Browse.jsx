import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api.js';
import ListingCard from '../components/ListingCard.jsx';
import Icon from '../components/Icon.jsx';
import { EmptyState, ListingGridSkeleton } from '../components/Loader.jsx';
import { CATEGORIES, CATEGORY_STYLES, CONDITIONS, SIZES, formatPrice } from '../constants.js';

// Everything lives in the URL (?q=&category=&size=&condition=&minPrice=&maxPrice=&sort=&page=) so results can be shared
const FILTER_KEYS = ['category', 'size', 'condition', 'minPrice', 'maxPrice'];
const SORTS = [['newest', 'Newest'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']];
const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4';

// Pill toggle for categories, sizes and conditions; aria-pressed tells screen readers which one is on
function Toggle({ active, onClick, children, className = '' }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${active
        ? 'bg-navy text-mist shadow-sm shadow-navy/20'
        : 'bg-white text-slate-700 ring-1 ring-inset ring-aqua hover:bg-frost hover:text-navy hover:ring-denim/50'} ${className}`}>
      {children}
    </button>
  );
}

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const get = (k) => params.get(k) || '';
  const page = Number(get('page') || 1);
  const [q, category, size, condition, minPrice, maxPrice] = ['q', ...FILTER_KEYS].map(get);
  const panelFilters = [size, condition, minPrice || maxPrice].filter(Boolean).length; // the ones inside the Filters panel

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };
  const setParam = (key, value) => update({ [key]: value });
  const toggle = (key, value) => setParam(key, get(key) === value ? '' : value); // tapping the active choice clears it
  const clearAll = () => update(Object.fromEntries(['q', ...FILTER_KEYS].map((k) => [k, ''])));

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

  const priceLabel = minPrice && maxPrice ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
    : minPrice ? `${formatPrice(minPrice)} and up` : `Up to ${formatPrice(maxPrice)}`;

  // Removable summary of everything that narrows the results
  const chips = [
    q && { label: `“${q}”`, clear: { q: '' } },
    category && { label: category, clear: { category: '' } },
    size && { label: `Size ${size}`, clear: { size: '' } },
    condition && { label: condition, clear: { condition: '' } },
    (minPrice || maxPrice) && { label: priceLabel, clear: { minPrice: '', maxPrice: '' } },
  ].filter(Boolean);

  // Uncontrolled inputs are keyed by their URL value so removing the filter chip resets them too
  const priceInput = (key, label) => (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor={key}>{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500" aria-hidden="true">₱</span>
        <input id={key} key={get(key)} type="number" min="0" inputMode="numeric" className="input pl-7" placeholder="0"
          defaultValue={get(key)} onBlur={(e) => setParam(key, e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setParam(key, e.target.value)} />
      </div>
    </div>
  );

  const legend = 'mb-2.5 text-sm font-bold text-ink';

  return (
    <div className="space-y-6">
      <header className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.015em] text-ink sm:text-3xl">Browse uniforms</h1>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">Second-hand uniforms from students on your campus.</p>
        </div>

        <form onSubmit={search} role="search"
          className="flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-1.5 shadow-sm shadow-navy/5 ring-1 ring-aqua transition focus-within:ring-2 focus-within:ring-navy/40">
          <Icon name="search" className="ml-2.5 h-5 w-5 shrink-0 text-slate-400" />
          <label htmlFor="q" className="sr-only">Search uniforms</label>
          <input id="q" name="q" key={q} defaultValue={q} placeholder="Search polo, skirt, PE shirt…"
            className="w-full min-w-0 bg-transparent py-2.5 text-base text-ink placeholder:text-slate-500 focus:outline-none sm:text-sm" />
          <button className="btn-primary shrink-0">Search</button>
        </form>

        {/* one row that scrolls sideways on phones, wraps on larger screens */}
        <div role="group" aria-label="Category" className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <Toggle active={!category} onClick={() => setParam('category', '')}>All</Toggle>
          {CATEGORIES.map((c) => (
            <Toggle key={c} active={category === c} onClick={() => toggle('category', c)}>
              <Icon name={CATEGORY_STYLES[c].icon} className="h-4 w-4" /> {c}
            </Toggle>
          ))}
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[15.5rem_1fr] lg:items-start lg:gap-8">
        {/* Filters: sticky sidebar on laptops and up, opened with the Filters button on smaller screens */}
        <aside id="filters" aria-label="Filters"
          className={`card mb-5 p-5 lg:sticky lg:top-24 lg:mb-0 lg:block ${showFilters ? 'block animate-fade-up' : 'hidden'}`}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-bold text-ink">Filters</h2>
            {chips.length > 0 && (
              <button type="button" onClick={clearAll} className="rounded text-sm font-semibold text-navy hover:underline">Clear all</button>
            )}
          </div>
          <div className="space-y-6">
            <fieldset>
              <legend className={legend}>Size</legend>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((s) => (
                  <Toggle key={s} active={size === s} onClick={() => toggle('size', s)} className="rounded-xl px-0">{s}</Toggle>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className={legend}>Condition</legend>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <Toggle key={c} active={condition === c} onClick={() => toggle('condition', c)}>{c}</Toggle>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className={legend}>Price</legend>
              <div className="grid grid-cols-2 gap-2">
                {priceInput('minPrice', 'Min')}
                {priceInput('maxPrice', 'Max')}
              </div>
              <p className="mt-2 text-xs text-slate-500">Press Enter or tap outside the box to apply.</p>
            </fieldset>
          </div>
        </aside>

        <section aria-labelledby="results-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="results-heading" aria-live="polite" className="text-sm text-slate-600">
              {loading ? 'Loading…' : (
                <><b className="font-bold text-ink">{data.total}</b> uniform{data.total === 1 ? '' : 's'}{q && <> for <b className="font-semibold text-ink">“{q}”</b></>}</>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} aria-controls="filters"
                className="btn-outline px-3 py-2 lg:hidden">
                <Icon name="filter" className="h-4 w-4" />
                Filters
                {panelFilters > 0 && <span className="chip bg-navy px-2 text-mist">{panelFilters}</span>}
              </button>
              <label htmlFor="sort" className="hidden text-sm text-slate-600 sm:inline">Sort by</label>
              <select id="sort" className="input w-auto py-2" value={get('sort') || 'newest'} onChange={(e) => setParam('sort', e.target.value)}>
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.label}>
                  <button type="button" onClick={() => update(c.clear)} aria-label={`Remove filter: ${c.label}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-frost py-1.5 pl-3 pr-2 text-xs font-semibold text-navy ring-1 ring-inset ring-aqua transition hover:bg-aqua active:scale-95">
                    {c.label} <Icon name="x" className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={clearAll} className="px-1 text-xs font-semibold text-slate-600 underline-offset-2 hover:text-navy hover:underline">
                  Clear all
                </button>
              </li>
            </ul>
          )}

          <div className="mt-4">
            {loading ? (
              <ListingGridSkeleton count={8} className={GRID} />
            ) : failed ? (
              <EmptyState icon={<Icon name="warning" className="h-6 w-6" />} title="Couldn't load uniforms">
                Check your connection and try again.
              </EmptyState>
            ) : data.items.length === 0 ? (
              <EmptyState icon={<Icon name="search" className="h-6 w-6" />} title={chips.length ? 'No matches' : 'No uniforms yet'}>
                {chips.length ? (
                  <>
                    <p>No uniforms match your search and filters.</p>
                    <button type="button" onClick={clearAll} className="btn-outline mt-4">Clear filters</button>
                  </>
                ) : 'Nothing has been posted yet. Check back soon.'}
              </EmptyState>
            ) : (
              <div className={GRID}>
                {data.items.map((l, i) => (
                  <div key={l._id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }}><ListingCard listing={l} /></div>
                ))}
              </div>
            )}
          </div>

          {data.pages > 1 && !failed && (
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
              <button className="btn-outline" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
                <Icon name="arrow-left" className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm font-medium text-slate-600">Page {page} of {data.pages}</span>
              <button className="btn-outline" disabled={page >= data.pages} onClick={() => update({ page: String(page + 1) })}>
                Next <Icon name="arrow-right" className="h-4 w-4" />
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
