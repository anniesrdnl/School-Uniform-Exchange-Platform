import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import api from '../api.js';
import ListingCard from '../components/ListingCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { EmptyState, ListingGridSkeleton } from '../components/Loader.jsx';
import { BROWSE_GRID, CATEGORIES, CATEGORY_STYLES, CONDITIONS, CONDITION_HINTS, SIZES, formatPrice } from '../constants.js';

// Everything lives in the URL (?q=&category=&size=&condition=&minPrice=&maxPrice=&sort=&page=) so results can be shared
const FILTER_KEYS = ['category', 'size', 'condition', 'minPrice', 'maxPrice'];
const SORTS = [['newest', 'Newest first'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']];
const GRID = BROWSE_GRID;
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy';

// One-tap price ranges; a custom min/max form sits under them
const PRICE_RANGES = [
  { min: '', max: '200', label: 'Under ₱200' },
  { min: '200', max: '500', label: '₱200–₱500' },
  { min: '500', max: '1000', label: '₱500–₱1,000' },
  { min: '1000', max: '', label: 'Over ₱1,000' },
];

const PANEL_WIDTH = 288; // w-72

// Filter button in the filter row: shows its current value ("Size: M") and opens a small panel of choices.
// The panel is portalled and position: fixed under the button, so the sideways-scrolling row on phones never
// clips it. It closes on an outside click, Escape, scrolling, or once a choice is made (children get `close`).
function FilterButton({ label, value, children }) {
  const [pos, setPos] = useState(null); // null = closed
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();
  const active = Boolean(value);

  const close = (focusButton = false) => {
    setPos(null);
    if (focusButton) buttonRef.current?.focus();
  };
  const toggle = () => {
    if (pos) return close();
    const r = buttonRef.current.getBoundingClientRect();
    const width = Math.min(PANEL_WIDTH, window.innerWidth - 32);
    setPos({ top: r.bottom + 8, left: Math.min(Math.max(16, r.left), window.innerWidth - width - 16), width });
  };

  useEffect(() => {
    if (!pos) return undefined;
    panelRef.current?.querySelector('button, input')?.focus();
    const onPointer = (e) => {
      if (!panelRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) close();
    };
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(true); } };
    const onScroll = (e) => { if (!panelRef.current?.contains(e.target)) close(); };
    const onResize = () => close();
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [pos]);

  return (
    <>
      <button ref={buttonRef} type="button" onClick={toggle} aria-expanded={Boolean(pos)} aria-haspopup="dialog" aria-controls={pos ? panelId : undefined}
        className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full pl-4 pr-3 text-sm font-semibold ring-1 ring-inset transition duration-200 active:scale-[0.97] ${focusRing} ${active
          ? 'bg-navy text-white ring-navy hover:bg-navy-deep'
          : pos ? 'bg-frost text-navy ring-denim/50' : 'bg-white text-ink ring-aqua hover:bg-frost hover:ring-denim/50'}`}>
        {label}{active && <span className="max-w-32 truncate font-medium text-cream">: {value}</span>}
        <Icon name="chevron-down" strokeWidth={2} className={`h-4 w-4 transition-transform duration-200 ${pos ? 'rotate-180' : ''} ${active ? 'text-cream' : 'text-slate-500'}`} />
      </button>

      {pos && createPortal(
        <div ref={panelRef} id={panelId} role="dialog" aria-label={`${label} filter`} style={{ top: pos.top, left: pos.left, width: pos.width }}
          className="fixed z-[70] animate-fade-in rounded-2xl bg-white p-3 shadow-xl shadow-navy/15 ring-1 ring-aqua">
          {children(() => close(true))}
        </div>,
        document.body,
      )}
    </>
  );
}

// Panel header: the filter's name and a Clear link when it's set
function PanelHead({ title, onClear }) {
  return (
    <div className="mb-2.5 flex items-center justify-between px-1">
      <p className="text-sm font-bold text-ink">{title}</p>
      {onClear && <button type="button" onClick={onClear} className={`rounded text-xs font-semibold text-navy hover:underline ${focusRing}`}>Clear</button>}
    </div>
  );
}

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const get = (k) => params.get(k) || '';
  const page = Number(get('page') || 1);
  const [q, category, size, condition, minPrice, maxPrice] = ['q', ...FILTER_KEYS].map(get);
  const narrowing = Boolean(q || category || size || condition || minPrice || maxPrice);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };
  const setParam = (key, value) => update({ [key]: value });
  const clearAll = () => update(Object.fromEntries(['q', ...FILTER_KEYS].map((k) => [k, ''])));
  const clearFilters = () => update({ size: '', condition: '', minPrice: '', maxPrice: '' });

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    api.get('/listings', { params: Object.fromEntries(params) })
      .then((r) => setData(r.data))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [params]);

  const activeRange = PRICE_RANGES.find((r) => r.min === minPrice && r.max === maxPrice);
  const priceLabel = !minPrice && !maxPrice ? ''
    : activeRange ? activeRange.label
      : minPrice && maxPrice ? `${formatPrice(minPrice)}–${formatPrice(maxPrice)}`
        : minPrice ? `${formatPrice(minPrice)}+` : `Up to ${formatPrice(maxPrice)}`;

  const option = (selected) => `flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition duration-200 active:scale-[0.98] ${focusRing} ${selected
    ? 'bg-frost text-navy'
    : 'text-ink hover:bg-frost/70'}`;
  const chip = (selected) => `rounded-lg py-2 text-xs font-semibold ring-1 ring-inset transition duration-200 active:scale-95 ${focusRing} ${selected
    ? 'bg-navy text-mist ring-navy'
    : 'bg-white text-slate-700 ring-aqua hover:bg-frost hover:text-navy'}`;

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

      {/* Filter row: one compact button per filter (its panel opens on tap), sort on the right.
          On phones the filter buttons scroll sideways while Sort stays put. */}
      <div className="flex items-center gap-2">
        <div role="group" aria-label="Filters" className="-mx-4 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <FilterButton label="Size" value={size}>
            {(close) => (
              <>
                <PanelHead title="Size" onClear={size ? () => { setParam('size', ''); close(); } : null} />
                <div className="grid grid-cols-3 gap-1.5">
                  {SIZES.map((s) => (
                    <button key={s} type="button" aria-pressed={size === s} onClick={() => { setParam('size', size === s ? '' : s); close(); }} className={chip(size === s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </FilterButton>

          <FilterButton label="Condition" value={condition}>
            {(close) => (
              <>
                <PanelHead title="Condition" onClear={condition ? () => { setParam('condition', ''); close(); } : null} />
                <div className="space-y-0.5">
                  {CONDITIONS.map((c) => (
                    <button key={c} type="button" aria-pressed={condition === c} onClick={() => { setParam('condition', condition === c ? '' : c); close(); }} className={option(condition === c)}>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{c}</span>
                        <span className="block truncate text-xs text-slate-500">{CONDITION_HINTS[c]}</span>
                      </span>
                      {condition === c && <Icon name="check" className="h-4 w-4 shrink-0 text-navy" strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </FilterButton>

          <FilterButton label="Price" value={priceLabel}>
            {(close) => (
              <>
                <PanelHead title="Price" onClear={priceLabel ? () => { update({ minPrice: '', maxPrice: '' }); close(); } : null} />
                <div className="grid grid-cols-2 gap-1.5">
                  {PRICE_RANGES.map((r) => {
                    const on = activeRange === r;
                    return (
                      <button key={r.label} type="button" aria-pressed={on} className={`px-2 ${chip(on)}`}
                        onClick={() => { update(on ? { minPrice: '', maxPrice: '' } : { minPrice: r.min, maxPrice: r.max }); close(); }}>
                        {r.label}
                      </button>
                    );
                  })}
                </div>
                {/* custom range */}
                <form aria-label="Custom price range" className="mt-3 border-t border-aqua/70 pt-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    update({ minPrice: f.get('minPrice').trim(), maxPrice: f.get('maxPrice').trim() });
                    close();
                  }}>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    {[['minPrice', 'Min', 'Minimum price'], ['maxPrice', 'Max', 'Maximum price']].map(([key, placeholder, label], i) => (
                      <div key={key} className={`relative min-w-0 ${i ? 'col-start-3' : ''}`}>
                        <label htmlFor={key} className="sr-only">{label}</label>
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500" aria-hidden="true">₱</span>
                        <input id={key} name={key} defaultValue={get(key)} type="number" min="0" inputMode="numeric"
                          placeholder={placeholder} className="input no-spin py-2 pl-7" />
                      </div>
                    ))}
                    <span className="col-start-2 row-start-1 text-slate-400" aria-hidden="true">–</span>
                  </div>
                  <button className="btn-primary mt-2 w-full py-2">Apply price</button>
                </form>
              </>
            )}
          </FilterButton>

          {(size || condition || minPrice || maxPrice) && (
            <button type="button" onClick={clearFilters}
              className={`inline-flex h-10 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-semibold text-slate-600 transition hover:bg-frost hover:text-navy active:scale-[0.97] ${focusRing}`}>
              <Icon name="x" className="h-4 w-4" strokeWidth={2} /> Clear
            </button>
          )}
        </div>

        {/* native select (best on phones and for screen readers) dressed as a filter button */}
        <div className="relative shrink-0">
          <label htmlFor="sort" className="sr-only">Sort by</label>
          <Icon name="sort" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <select id="sort" value={get('sort') || 'newest'} onChange={(e) => setParam('sort', e.target.value)}
            className={`h-10 w-[2.5rem] cursor-pointer appearance-none rounded-full bg-white pl-9 text-sm font-semibold text-transparent ring-1 ring-inset ring-aqua transition hover:bg-frost hover:ring-denim/50 sm:w-auto sm:pr-9 sm:text-ink ${focusRing}`}>
            {SORTS.map(([v, l]) => <option key={v} value={v} className="text-ink">{l}</option>)}
          </select>
          <Icon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-500 sm:block" strokeWidth={2} />
        </div>
      </div>

      <section aria-labelledby="results-heading">
        <h2 id="results-heading" aria-live="polite" className="text-sm text-slate-600">
          {loading ? <><span className="skeleton inline-block h-4 w-28 align-middle" aria-hidden="true" /><span className="sr-only">Loading uniforms</span></> : (
            <><b className="font-bold text-ink">{data.total}</b> uniform{data.total === 1 ? '' : 's'}{q && <> for <b className="font-semibold text-ink">“{q}”</b></>}</>
          )}
        </h2>

        <div className="mt-3 sm:mt-4">
          {loading ? (
            <ListingGridSkeleton count={8} className={GRID} />
          ) : failed ? (
            <EmptyState icon={<Icon name="warning" className="h-6 w-6" />} title="Couldn't load uniforms">
              Check your connection and try again.
            </EmptyState>
          ) : data.items.length === 0 ? (
            <EmptyState icon={<Icon name="search" className="h-6 w-6" />} title={narrowing ? 'No matches' : 'No uniforms yet'}>
              {narrowing ? (
                <>
                  <p>No uniforms match your search and filters.</p>
                  <button type="button" onClick={clearAll} className="btn-outline mt-4">Clear search and filters</button>
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
  );
}
