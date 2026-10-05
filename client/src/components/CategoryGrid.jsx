import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import { CATEGORIES, CATEGORY_STYLES } from '../constants.js';

// Category cards with live listing counts (Home and the landing page). Each links to Browse filtered by it.
// 2 columns until there is room for 4; icon sits above the label on phones so long names never get squeezed.
export default function CategoryGrid() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    Promise.allSettled(CATEGORIES.map((c) => api.get('/listings', { params: { category: c, limit: 1 } })))
      .then((results) => setCounts(Object.fromEntries(results.map((r, i) => [CATEGORIES[i], r.status === 'fulfilled' ? r.value.data.total : null]))));
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {CATEGORIES.map((c, i) => (
        <Reveal key={c} delay={i * 80}>
          <Link to={`/browse?category=${encodeURIComponent(c)}`}
            className="card group flex h-full flex-col items-start gap-3 p-4 transition duration-300 hover:-translate-y-1 hover:border-powder hover:shadow-lg hover:shadow-navy/10 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:flex-row sm:items-center">
            <span className="icon-tile h-11 w-11 transition duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-navy group-hover:text-mist group-hover:ring-navy sm:h-12 sm:w-12">
              <Icon name={CATEGORY_STYLES[c].icon} className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-navy">{c}</span>
              {counts[c] === undefined
                ? <span className="skeleton mt-1.5 block h-3 w-14" />
                : counts[c] !== null && <span className="mt-0.5 block text-xs text-slate-500">{counts[c]} {counts[c] === 1 ? 'listing' : 'listings'}</span>}
            </span>
            <Icon name="arrow-right" className="hidden h-4 w-4 shrink-0 -translate-x-2 text-navy opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block" />
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
