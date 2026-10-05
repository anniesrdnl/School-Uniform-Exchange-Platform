import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ListingCard from '../components/ListingCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Icon from '../components/Icon.jsx';
import { EmptyState, ListingGridSkeleton } from '../components/Loader.jsx';
import { CATEGORIES, CATEGORY_STYLES } from '../constants.js';

export default function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/listings', { params: { limit: 8 } })
      .then((r) => setItems(r.data.items))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);


  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-aqua px-5 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12">
        <div className="pointer-events-none absolute -right-12 -top-16 hidden h-60 w-60 rounded-full bg-powder sm:block" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 right-32 hidden h-44 w-44 rounded-full bg-cream sm:block" aria-hidden="true" />

        <p className="relative text-sm font-semibold text-navy">Welcome back, {user.fullName?.split(' ')[0] || 'student'}</p>
        <h1 className="relative mt-1 max-w-xl text-2xl font-bold leading-tight tracking-[-0.015em] text-ink sm:text-3xl md:text-4xl">
          Find the uniform you need, or pass on the one you've outgrown.
        </h1>
        <SearchBar id="home-search" onSearch={(v) => navigate(v ? `/browse?q=${encodeURIComponent(v)}` : '/browse')} className="relative mt-6 max-w-xl" />
        <Link to="/sell" className="relative mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-semibold text-navy hover:underline">
          <Icon name="plus-circle" className="h-5 w-5" /> Sell a uniform
        </Link>
      </section>

      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="section-title mb-3">Shop by category</h2>
        {/* 2 columns until there is room for 4; icon sits above the label on phones so long names never get squeezed */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Link key={c} to={`/browse?category=${encodeURIComponent(c)}`} style={{ animationDelay: `${i * 70}ms` }}
              className="card group flex animate-fade-up flex-col items-start gap-2.5 p-3.5 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 hover:border-powder hover:shadow-md hover:shadow-navy/5 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
              <span className="icon-tile h-10 w-10 transition duration-300 group-hover:scale-105 group-hover:bg-aqua sm:h-11 sm:w-11">
                <Icon name={CATEGORY_STYLES[c].icon} className="h-6 w-6" />
              </span>
              <span className="min-w-0 leading-snug transition group-hover:text-navy">{c}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-heading" className="section-title">Recently listed</h2>
          <Link to="/browse" className="group -my-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-navy">
            See all <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        {loading
          ? <ListingGridSkeleton count={4} />
          : failed
            ? <EmptyState icon={<Icon name="warning" className="h-6 w-6" />} title="Couldn't load listings">Check your connection and refresh the page.</EmptyState>
            : items.length === 0
              ? <EmptyState icon={<Icon name="shirt" className="h-6 w-6" />} title="No listings yet">Be the first to post a uniform.</EmptyState>
              : <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                  {items.map((l, i) => (
                    <div key={l._id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}><ListingCard listing={l} /></div>
                  ))}
                </div>}
      </section>
    </div>
  );
}
