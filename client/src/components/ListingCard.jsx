import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  const { _id, title, price, size, condition, images, seller } = listing;
  const [loaded, setLoaded] = useState(false);
  return (
    <Link to={`/listings/${_id}`}
      className="card group block overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-navy/40 hover:shadow-lg hover:shadow-navy/10">
      <div className={`relative aspect-square overflow-hidden bg-sky ${images?.[0] && !loaded ? 'skeleton !rounded-none' : ''}`}>
        {images?.[0]
          ? <img src={images[0]} alt={title} onLoad={() => setLoaded(true)} loading="lazy"
              className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
          : <div className="flex h-full flex-col items-center justify-center gap-1 text-sm text-slate-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.16-5.16a2.25 2.25 0 0 1 3.18 0l5.16 5.16m-1.5-1.5 1.41-1.41a2.25 2.25 0 0 1 3.18 0l2.91 2.91M3.75 21h16.5A1.5 1.5 0 0 0 21.75 19.5V4.5A1.5 1.5 0 0 0 20.25 3H3.75A1.5 1.5 0 0 0 2.25 4.5v15A1.5 1.5 0 0 0 3.75 21Z" />
              </svg>
              No photo
            </div>}
        {condition && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-navy shadow-sm backdrop-blur">{condition}</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold transition group-hover:text-navy">{title}</h3>
        <p className="text-xs text-slate-500">Size {size} · {condition}</p>
        <p className="mt-1 text-base font-bold text-navy">₱{price}</p>
        {seller && <p className="mt-1 truncate text-xs text-slate-500">{seller.fullName}</p>}
      </div>
    </Link>
  );
}
