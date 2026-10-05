import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import Avatar from './Avatar.jsx';
import { formatPrice } from '../constants.js';

export default function ListingCard({ listing }) {
  const { _id, title, price, size, category, condition, images, seller } = listing;
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false); // photo URL failed: show the placeholder instead of an endless shimmer
  const cover = !broken && images?.[0];
  return (
    <Link to={`/listings/${_id}`}
      className="card group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-powder hover:shadow-lg hover:shadow-navy/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy">
      <div className={`relative aspect-square overflow-hidden bg-frost ${cover && !loaded ? 'skeleton rounded-none' : ''}`}>
        {cover
          ? <img src={cover} alt={title} onLoad={() => setLoaded(true)} onError={() => setBroken(true)} loading="lazy"
              className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
          : <div className="flex h-full flex-col items-center justify-center gap-1 text-sm text-slate-500">
              <Icon name="photo" className="h-8 w-8" />
              No photo
            </div>}
        {condition && (
          <span className="chip absolute left-2 top-2 bg-white/95 text-navy shadow-sm">{condition}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-2.5 sm:p-3">
        <h3 className="truncate text-sm font-semibold transition group-hover:text-navy">{title}</h3>
        <p className="truncate text-xs text-slate-500">Size {size}{category && ` · ${category}`}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5 sm:pt-2">
          <p className="text-base font-bold text-navy">{formatPrice(price)}</p>
          {seller && (
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
              <Avatar name={seller.fullName} src={seller.avatar} className="h-5 w-5 text-[10px]" />
              {/* avatar only on very narrow phones, where the name would crowd the price */}
              <span className="truncate max-[359px]:hidden">{seller.fullName?.split(' ')[0]}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
