// Small dot on an avatar's corner: green when the person is active now, grey when they're away.
// The words are always available too (title + screen-reader text), so colour is never the only cue.
// `ring` should match the background behind the avatar so the dot looks cut out of it.
export default function PresenceDot({ online, label, ring = 'ring-white', className = 'h-3 w-3' }) {
  return (
    <span className={`absolute flex ${className}`} title={label}>
      {online && <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-60 [animation-duration:2.4s]" aria-hidden="true" />}
      <span className={`relative h-full w-full rounded-full ring-2 ${ring} ${online ? 'bg-green-500' : 'bg-slate-300'}`} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
