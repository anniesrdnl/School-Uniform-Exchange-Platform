// Profile photo, or the first letter of the name on a palette tile. Decorative: the name is always shown next to it.
export default function Avatar({ name = '', src = '', className = 'h-10 w-10 text-sm' }) {
  if (src) return <img src={src} alt="" className={`shrink-0 rounded-full object-cover ${className}`} />;
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-aqua font-bold text-navy ${className}`} aria-hidden="true">
      {name.trim()[0]?.toUpperCase() || '?'}
    </span>
  );
}
