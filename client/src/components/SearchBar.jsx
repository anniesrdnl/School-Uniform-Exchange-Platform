import Icon from './Icon.jsx';

// Search field with the button inside it. Shared by Home and Browse so both look and behave the same.
// Input props (id, name, value/onChange or defaultValue, key…) are passed straight through.
export default function SearchBar({ onSubmit, className = '', ...inputProps }) {
  return (
    <form onSubmit={onSubmit} role="search"
      className={`flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-sm shadow-navy/5 ring-1 ring-aqua transition focus-within:ring-2 focus-within:ring-navy/40 ${className}`}>
      <Icon name="search" className="ml-2.5 h-5 w-5 shrink-0 text-slate-400" />
      <label htmlFor={inputProps.id} className="sr-only">Search uniforms</label>
      <input placeholder="Search polo, skirt, PE shirt…" {...inputProps}
        className="w-full min-w-0 bg-transparent py-2.5 text-base text-ink placeholder:text-slate-500 focus:outline-none sm:text-sm" />
      <button className="btn-primary shrink-0">Search</button>
    </form>
  );
}
