import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

// Search field with a clear (x) button and the Search button inside it. Shared by Home and Browse.
// onSearch receives the trimmed text. The box follows defaultValue, so clearing the search elsewhere empties it.
export default function SearchBar({ id, defaultValue = '', onSearch, className = '' }) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);
  useEffect(() => setValue(defaultValue), [defaultValue]);

  const submit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };
  const clear = () => {
    setValue('');
    inputRef.current?.focus();
    if (defaultValue) onSearch(''); // an active search was cleared, so show everything again
  };

  return (
    <form onSubmit={submit} role="search"
      className={`group relative flex h-14 items-center gap-1 rounded-2xl bg-white pl-4 pr-1.5 shadow-sm shadow-navy/5 ring-1 ring-aqua transition duration-200 focus-within:shadow-md focus-within:ring-2 focus-within:ring-navy/40 ${className}`}>
      <Icon name="search" className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-focus-within:text-navy" />
      <label htmlFor={id} className="sr-only">Search uniforms</label>
      <input ref={inputRef} id={id} type="search" enterKeyHint="search" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)}
        placeholder="Search polo, skirt, PE shirt…"
        className="h-full w-full min-w-0 bg-transparent px-2 text-base text-ink placeholder:text-slate-500 focus:outline-none sm:text-sm [&::-webkit-search-cancel-button]:hidden" />
      {value && (
        <button type="button" onClick={clear} aria-label="Clear search"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-frost hover:text-navy">
          <Icon name="x" className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
      <button className="btn-primary h-11 shrink-0 px-5">Search</button>
    </form>
  );
}
