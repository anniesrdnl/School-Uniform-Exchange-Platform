import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api.js';
import ListingCard from '../components/ListingCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { EmptyState, ListingGridSkeleton } from '../components/Loader.jsx';
import { CATEGORIES, CATEGORY_STYLES, CONDITIONS, CONDITION_HINTS, SIZES, formatPrice } from '../constants.js';

// Everything lives in the URL (?q=&category=&size=&condition=&minPrice=&maxPrice=&sort=&page=) so results can be shared
const FILTER_KEYS = ['category', 'size', 'condition', 'minPrice', 'maxPrice'];
const SORTS = [['newest', 'Newest first'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']];
const GRID = 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 2xl:grid-cols-5';

// One-tap price ranges; a custom min/max form sits under them
const PRICE_RANGES = [
  { min: '', max: '200', label: 'Under ₱200' },
  { min: '200', max: '500', label: '₱200–₱500' },
  { min: '500', max: '1000', label: '₱500–₱1,000' },
  { min: '1000', max: '', label: 'Over ₱1,000' },
];

// A filter group: title on the left, the current choice on the right
function FilterSection({ id, title, value, children }) {
  return (
    <section aria-labelledby={id} className="py-5 first:pt-0 last:pb-0">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 id={id} className="text-sm font-bold text-ink">{title}</h3>
        <span className="truncate text-xs font-medium text-slate-500">{value}</span>
      </div>
      {children}
    </section>
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

  const activeRange = PRICE_RANGES.find((r) => r.min === minPrice && r.max === maxPrice);
  const resetPanel = () => update({ size: '', condition: '', minPrice: '', maxPrice: '' });
  const applyCustomPrice = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    update({ minPrice: f.get('minPrice').trim(), maxPrice: f.get('maxPrice').trim() });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="space-y-3.5 sm:space-y-5">
        <div>
          <h1 className="page-title">Browse uniforms</h1>
          <p className="page-subtitle">Second-hand uniforms from students on your campus.</p>
        </div>

        <SearchBar id="q" defaultValue={q} onSearch={(v) => setParam('q', v)} className="max-w-2xl" />

        {/* underline tabs (same style as the header links); the row scrolls sideways on phones */}
        <div role="group" aria-label="Category"
          className="relative -mx-4 flex h-10 overflow-x-auto px-4 sm:h-11 shadow-[inset_0_-1px_0_var(--color-aqua)] [scrollbar-width:none] sm:mx-0 sm:px-0">
          {[['', 'All', 'grid'], ...CATEGORIES.map((c) => [c, c, CATEGORY_STYLES[c].icon])].map(([value, label, icon]) => (
            <button key={label} type="button" aria-pressed={category === value} onClick={() => setParam('category', value)}
              className={`tab group first:pl-0 first:after:left-0 ${category === value ? 'tab-on' : ''}`}>
              {/* filled icon on the selected category; outline icons lift slightly on hover */}
              <Icon name={icon} filled={category === value} className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" /> {label}
            </button>
          ))}
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[17rem_1fr] lg:items-start lg:gap-8">
        {/* Filters: sticky sidebar on laptops and up, opened with the Filters button on smaller screens */}
        <aside id="filters" aria-label="Filters"
          className={`card mb-4 p-4 sm:mb-5 sm:p-5 lg:sticky lg:top-24 lg:mb-0 lg:block ${showFilters ? 'block animate-fade-up' : 'hidden'}`}>
          <div className="mb-5 flex items-center justify-between border-b border-aqua/70 pb-4">
            <h2 className="flex items-center gap-2 font-bold text-ink">
              <Icon name="filter" className="h-4 w-4 text-navy" /> Filters
              {panelFilters > 0 && <span className="chip bg-navy px-2 text-mist">{panelFilters}</span>}
            </h2>
            {panelFilters > 0 && (
              <button type="button" onClick={resetPanel} className="rounded text-sm font-semibold text-navy hover:underline">Reset</button>
            )}
          </div>

          <div className="divide-y divide-aqua/70">
            <FilterSection id="f-size" title="Size" value={size || 'Any'}>
              {/* same segmented style as the site's other switches; tapping the selected size clears it */}
              <div className="grid grid-cols-6 gap-1 rounded-xl bg-frost p-1">
                {SIZES.map((s) => (
                  <button key={s} type="button" onClick={() => toggle('size', s)} aria-pressed={size === s} aria-label={`Size ${s}`}
                    className={`rounded-lg py-2 text-xs font-semibold transition duration-200 active:scale-95 ${size === s ? 'bg-white text-navy shadow-sm shadow-navy/10' : 'text-slate-600 hover:bg-white/60 hover:text-navy'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection id="f-condition" title="Condition" value={condition || 'Any'}>
              <div role="radiogroup" aria-labelledby="f-condition" className="-mx-2 space-y-0.5">
                {['', ...CONDITIONS].map((c) => (
                  <label key={c || 'any'} className="relative flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-frost has-[:checked]:bg-frost">
                    <input type="radio" name="condition" value={c} checked={condition === c} onChange={() => setParam('condition', c)} className="peer sr-only" />
                    <span aria-hidden="true"
                      className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-slate-300 bg-white transition-all peer-checked:border-[5px] peer-checked:border-navy peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">{c || 'Any condition'}</span>
                      {c && <span className="block text-xs text-slate-500">{CONDITION_HINTS[c]}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection id="f-price" title="Price" value={minPrice || maxPrice ? priceLabel : 'Any'}>
              <div className="grid grid-cols-2 gap-1.5">
                {PRICE_RANGES.map((r) => {
                  const on = activeRange === r;
                  return (
                    <button key={r.label} type="button" aria-pressed={on} onClick={() => update(on ? { minPrice: '', maxPrice: '' } : { minPrice: r.min, maxPrice: r.max })}
                      className={`rounded-lg px-2 py-2 text-xs font-semibold ring-1 ring-inset transition duration-200 active:scale-95 ${on ? 'bg-navy text-mist ring-navy' : 'bg-white text-slate-700 ring-aqua hover:bg-frost hover:text-navy'}`}>
                      {r.label}
                    </button>
                  );
                })}
              </div>
              {/* custom range: keyed by the URL values so presets and removed chips refresh the boxes */}
              <form onSubmit={applyCustomPrice} aria-label="Custom price range" className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                {[['minPrice', 'Min', 'Minimum price'], ['maxPrice', 'Max', 'Maximum price']].map(([key, placeholder, label], i) => (
                  <div key={key} className={`relative min-w-0 ${i ? 'col-start-3' : ''}`}>
                    <label htmlFor={key} className="sr-only">{label}</label>
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500" aria-hidden="true">₱</span>
                    <input id={key} name={key} key={get(key)} defaultValue={get(key)} type="number" min="0" inputMode="numeric"
                      placeholder={placeholder} className="input no-spin py-2 pl-7" />
                  </div>
                ))}
                <span className="col-start-2 row-start-1 text-slate-400" aria-hidden="true">–</span>
                <button className="btn-outline col-span-3 py-2">Apply price</button>
              </form>
            </FilterSection>
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
                className={`control lg:hidden ${showFilters ? 'bg-frost' : ''}`}>
                <Icon name="filter" className="h-4 w-4" />
                Filters
                {panelFilters > 0 && <span className="chip bg-navy px-2 text-mist">{panelFilters}</span>}
              </button>
              {/* native select (best on phones and for screen readers) dressed as a control */}
              <div className="relative">
                <label htmlFor="sort" className="sr-only">Sort by</label>
                <Icon name="sort" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select id="sort" className="control cursor-pointer appearance-none pl-9 pr-9" value={get('sort') || 'newest'} onChange={(e) => setParam('sort', e.target.value)}>
                  {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <Icon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" strokeWidth={2} />
              </div>
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
                  <Reveal key={l._id} delay={(i % 4) * 60}><ListingCard listing={l} /></Reveal>
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
