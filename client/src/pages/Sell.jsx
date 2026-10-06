import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from '../components/Loader.jsx';
import Icon from '../components/Icon.jsx';
import Avatar from '../components/Avatar.jsx';
import PageBackdrop from '../components/PageBackdrop.jsx';
import shrinkImage from '../shrinkImage.js';
import { CATEGORIES, CATEGORY_STYLES, CONDITIONS, CONDITION_HINTS, EXCHANGE_OPTIONS, SIZES, formatPrice } from '../constants.js';

const MAX_PHOTOS = 5;
const MAX_QTY = 20;
const OPTION_INFO = {
  'Buy Only': ['money', 'Sell it for a price'],
  'Exchange Only': ['recycle', 'Swap it for another uniform'],
  'Buy or Exchange': ['tag', 'Open to either'],
};
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy';
// photo buttons: always visible on touch screens; with a mouse they appear when the photo is hovered or focused
const revealOnHover = 'pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100';

// A numbered step of the form; the number turns into a check once the step is complete
function Step({ n, title, hint, done, children }) {
  return (
    <section className="card p-4 sm:p-6" aria-labelledby={`step-${n}`}>
      <div className="mb-5 flex items-start gap-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300 ${done
          ? 'bg-navy text-white'
          : 'bg-frost text-navy ring-1 ring-inset ring-aqua'}`}>
          {done ? <Icon name="check" className="h-4 w-4" strokeWidth={2.5} /> : n}
          <span className="sr-only">{done ? ' (done)' : ''}</span>
        </span>
        <div className="min-w-0">
          <h2 id={`step-${n}`} className="section-title leading-8">{title}</h2>
          {hint && <p className="text-sm text-slate-500">{hint}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 flex animate-fade-in items-center gap-1 text-xs font-medium text-red-600">
      <Icon name="warning" className="h-3.5 w-3.5 shrink-0" /> {children}
    </p>
  );
}

// A radio button shown as a selectable card (category, condition, open to). The real radio stays inside the label,
// so arrow keys, Tab and screen readers work as usual.
function ChoiceCard({ name, value, checked, onChange, icon, title, hint, id }) {
  return (
    <label className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition duration-200 active:scale-[0.98] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy ${checked
      ? 'bg-frost text-navy ring-2 ring-inset ring-navy'
      : 'bg-white text-ink ring-1 ring-inset ring-aqua hover:bg-frost/60 hover:ring-denim/50'}`}>
      <input id={id} type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {icon && (
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${checked ? 'bg-navy text-white' : 'bg-frost text-navy group-hover:bg-white'}`}>
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-tight">{title}</span>
        {hint && <span className="mt-0.5 block text-xs leading-snug text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}

export default function Sell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', category: '', description: '', size: '', condition: 'Good', price: '', exchangeOption: 'Buy Only', quantity: 1,
  });
  const [customSize, setCustomSize] = useState(false); // "Other" size typed in by hand
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [photoNote, setPhotoNote] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const swapOnly = form.exchangeOption === 'Exchange Only';

  // Object URLs for the thumbnails and the preview, released when the photo list changes
  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  const addFiles = (fileList) => {
    const images = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    const room = MAX_PHOTOS - photos.length;
    setPhotoNote(images.length < fileList.length ? 'Only image files can be added.'
      : images.length > room ? `Only ${MAX_PHOTOS} photos fit, so the first ${room} were added.` : '');
    setPhotos((prev) => [...prev, ...images].slice(0, MAX_PHOTOS));
  };
  const pick = (e) => {
    addFiles(e.target.files);
    e.target.value = ''; // allow picking the same file again after removing it
  };
  const removePhoto = (i) => { setPhotos((prev) => prev.filter((_, j) => j !== i)); setPhotoNote(''); };
  const makeCover = (i) => setPhotos((prev) => [prev[i], ...prev.filter((_, j) => j !== i)]);
  const dropHandlers = {
    onDragOver: (e) => { e.preventDefault(); setDragging(true); },
    onDragLeave: () => setDragging(false),
    onDrop: (e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); },
  };

  const setQuantity = (n) => set('quantity', Math.min(MAX_QTY, Math.max(1, Number(n) || 1)));

  // What's still missing (shown in the checklist, and as messages under the fields on submit)
  const priceOk = swapOnly || (form.price !== '' && Number(form.price) >= 0);
  const checks = [
    ['Add a photo', photos.length > 0],
    ['Write a title', Boolean(form.title.trim())],
    ['Pick a category', Boolean(form.category)],
    ['Choose a size', Boolean(form.size.trim())],
    [swapOnly ? 'Swap only, no price needed' : 'Set a price', priceOk],
  ];
  const doneCount = checks.filter(([, ok]) => ok).length;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Give your listing a short title.';
    if (!form.category) e.category = 'Pick the type of uniform.';
    if (!form.size.trim()) e.size = 'Choose a size, or type one under Other.';
    if (!priceOk) e.price = form.price !== '' ? "The price can't be negative." : 'Enter a price, or 0 to give it away.';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    const first = ['title', 'category', 'size', 'price'].find((k) => found[k]);
    if (first) {
      const el = document.getElementById(first === 'category' ? 'category-0' : first === 'size' ? 'size-0' : first);
      el?.focus();
      el?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      Object.entries({ ...form, title: form.title.trim(), size: form.size.trim(), price: form.price === '' ? '0' : form.price })
        .forEach(([k, v]) => body.append(k, v));
      (await Promise.all(photos.map(shrinkImage))).forEach((f) => body.append('photos', f));
      const { data } = await api.post('/listings', body);
      navigate(`/listings/${data._id}`);
    } catch (err) {
      setError(errMsg(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBusy(false);
    }
  };

  const postButton = (className) => (
    <button type="submit" className={`btn-primary btn-shine group/post ${className}`} disabled={busy}>
      {busy
        ? <><Spinner /> Posting…</>
        : <>Post uniform <Icon name="arrow-right" className="h-4 w-4 transition-transform duration-200 group-hover/post:translate-x-0.5" /></>}
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
      <PageBackdrop />
      <header>
        <h1 className="page-title">Post a uniform</h1>
        <p className="page-subtitle">Clear photos and honest details help your listing find a new owner faster.</p>
      </header>

      {error && <p role="alert" className="alert-error animate-fade-up">{error}</p>}

      <form onSubmit={submit} noValidate className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-4 sm:space-y-5">
          {/* 1. Photos */}
          <Step n={1} title="Photos" hint="Up to 5. Front, back and the size tag work best." done={photos.length > 0}>
            {photos.length === 0 ? (
              <label htmlFor="photos" {...dropHandlers}
                className={`group flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy ${dragging
                  ? 'border-navy bg-aqua/60'
                  : 'border-powder bg-frost/50 hover:border-denim hover:bg-frost'}`}>
                <span className={`flex h-12 w-12 items-center justify-center rounded-full bg-white text-navy shadow-sm transition duration-200 ${dragging ? '-translate-y-1 shadow-md' : 'group-hover:-translate-y-0.5 group-hover:shadow-md'}`}>
                  <Icon name="upload" className="h-6 w-6" />
                </span>
                <span className="text-sm font-semibold text-navy">{dragging ? 'Drop to add' : 'Drag photos here, or click to choose'}</span>
                <span className="text-xs text-slate-500">JPG or PNG, up to 5 MB each. The first photo is the cover.</span>
                <input id="photos" type="file" accept="image/*" multiple onChange={pick} className="sr-only" />
              </label>
            ) : (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5" aria-label="Photos">
                {previews.map((src, i) => (
                  <li key={src} className="group relative aspect-square animate-fade-in overflow-hidden rounded-xl bg-frost ring-1 ring-aqua">
                    <img src={src} alt={`Photo ${i + 1}${i === 0 ? ', cover' : ''}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    {i === 0
                      ? <span className="chip absolute bottom-1.5 left-1.5 bg-white/95 text-[10px] text-navy shadow-sm">Cover</span>
                      : (
                        <button type="button" onClick={() => makeCover(i)}
                          className={`absolute bottom-1.5 left-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-navy shadow-sm transition duration-200 hover:bg-navy hover:text-white active:scale-95 ${focusRing} ${revealOnHover}`}>
                          Make cover
                        </button>
                      )}
                    <button type="button" onClick={() => removePhoto(i)} aria-label={`Remove photo ${i + 1}`}
                      className={`absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm transition duration-200 hover:bg-red-600 hover:text-white active:scale-90 ${focusRing} ${revealOnHover}`}>
                      <Icon name="x" className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  </li>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <li>
                    <label htmlFor="photos" {...dropHandlers}
                      className={`group flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs font-semibold transition duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy ${dragging
                        ? 'border-navy bg-aqua/60 text-navy'
                        : 'border-powder text-slate-500 hover:border-denim hover:bg-frost hover:text-navy'}`}>
                      <Icon name="plus" className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                      Add <span className="font-normal">{photos.length}/{MAX_PHOTOS}</span>
                      <input id="photos" type="file" accept="image/*" multiple onChange={pick} className="sr-only" />
                    </label>
                  </li>
                )}
              </ul>
            )}
            {photoNote && <p className="text-xs font-medium text-amber-700" role="status">{photoNote}</p>}
          </Step>

          {/* 2. Details */}
          <Step n={2} title="Details" hint="What it is, the size, and how worn it is." done={Boolean(form.title.trim() && form.category && form.size.trim())}>
            <div>
              <div className="flex items-baseline justify-between">
                <label className="label" htmlFor="title">Title</label>
                <span className="text-xs text-slate-500">{form.title.length}/100</span>
              </div>
              <input id="title" maxLength={100} className={`input ${errors.title ? 'border-red-400' : ''}`} placeholder="e.g. White polo shirt with school logo"
                value={form.title} onChange={(e) => set('title', e.target.value)} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : undefined} />
              <FieldError id="title-error">{errors.title}</FieldError>
            </div>

            <fieldset aria-describedby={errors.category ? 'category-error' : undefined}>
              <legend className="label">Category</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CATEGORIES.map((c, i) => (
                  <ChoiceCard key={c} id={`category-${i}`} name="category" value={c} checked={form.category === c} onChange={() => set('category', c)}
                    icon={CATEGORY_STYLES[c].icon} title={c} />
                ))}
              </div>
              <FieldError id="category-error">{errors.category}</FieldError>
            </fieldset>

            <fieldset aria-describedby={errors.size ? 'size-error' : undefined}>
              <legend className="label">Size</legend>
              <div className="flex flex-wrap gap-2">
                {[...SIZES, 'Other'].map((s, i) => {
                  const on = s === 'Other' ? customSize : !customSize && form.size === s;
                  return (
                    <label key={s} className={`flex h-10 min-w-12 cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-semibold transition duration-200 active:scale-95 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy ${on
                      ? 'bg-navy text-white shadow-sm shadow-navy/20'
                      : 'bg-white text-slate-700 ring-1 ring-inset ring-aqua hover:bg-frost hover:text-navy hover:ring-denim/50'}`}>
                      <input id={`size-${i}`} type="radio" name="size" className="sr-only" checked={on}
                        onChange={() => {
                          if (s === 'Other') { setCustomSize(true); set('size', ''); setTimeout(() => document.getElementById('size-custom')?.focus()); }
                          else { setCustomSize(false); set('size', s); }
                        }} />
                      {s}
                    </label>
                  );
                })}
              </div>
              {customSize && (
                <input id="size-custom" maxLength={20} className="input mt-2 max-w-xs animate-fade-in" placeholder="e.g. 14, Waist 28, Free size"
                  value={form.size} onChange={(e) => set('size', e.target.value)} aria-label="Other size" />
              )}
              <FieldError id="size-error">{errors.size}</FieldError>
            </fieldset>

            <fieldset>
              <legend className="label">Condition</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {CONDITIONS.map((c) => (
                  <ChoiceCard key={c} name="condition" value={c} checked={form.condition === c} onChange={() => set('condition', c)}
                    title={c} hint={CONDITION_HINTS[c]} />
                ))}
              </div>
            </fieldset>

            <div>
              <div className="flex items-baseline justify-between">
                <label className="label" htmlFor="description">Description <span className="font-normal text-slate-500">(optional)</span></label>
                <span className="text-xs text-slate-500">{form.description.length}/1000</span>
              </div>
              <textarea id="description" rows={4} maxLength={1000} className="input resize-y" placeholder="Fit, flaws, how long it was worn, where you can meet…"
                value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
          </Step>

          {/* 3. Price & exchange */}
          <Step n={3} title="Price & exchange" hint="How you'd like to hand it on." done={priceOk}>
            <fieldset>
              <legend className="label">Open to</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {EXCHANGE_OPTIONS.map((o) => (
                  <ChoiceCard key={o} name="exchangeOption" value={o} checked={form.exchangeOption === o}
                    onChange={() => { set('exchangeOption', o); setErrors((e) => ({ ...e, price: undefined })); }}
                    icon={OPTION_INFO[o][0]} title={o} hint={OPTION_INFO[o][1]} />
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="price">Price {swapOnly && <span className="font-normal text-slate-500">(optional for swaps)</span>}</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500" aria-hidden="true">₱</span>
                  <input id="price" type="number" min="0" step="0.01" inputMode="decimal" className={`input no-spin pl-8 ${errors.price ? 'border-red-400' : ''}`}
                    placeholder={swapOnly ? 'Optional' : '0'} value={form.price} onChange={(e) => set('price', e.target.value)}
                    aria-invalid={Boolean(errors.price)} aria-describedby={errors.price ? 'price-error' : 'price-hint'} />
                </div>
                {errors.price
                  ? <FieldError id="price-error">{errors.price}</FieldError>
                  : <p id="price-hint" className="mt-1.5 text-xs text-slate-500">Use 0 to give it away for free.</p>}
              </div>
              <div>
                <label className="label" htmlFor="quantity">Quantity</label>
                <div className="flex h-11 items-center overflow-hidden rounded-xl bg-white ring-1 ring-inset ring-slate-300 transition focus-within:ring-2 focus-within:ring-navy/50 hover:ring-denim">
                  <button type="button" aria-label="One fewer" disabled={form.quantity <= 1} onClick={() => setQuantity(form.quantity - 1)}
                    className="flex h-full w-11 shrink-0 items-center justify-center text-navy transition hover:bg-frost active:bg-aqua disabled:pointer-events-none disabled:text-slate-300">
                    <Icon name="minus" className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                  <input id="quantity" type="number" inputMode="numeric" min="1" max={MAX_QTY} value={form.quantity} onChange={(e) => setQuantity(e.target.value)}
                    className="no-spin h-full w-full min-w-0 border-x border-slate-200 bg-transparent text-center text-base font-semibold text-ink focus:outline-none sm:text-sm" />
                  <button type="button" aria-label="One more" disabled={form.quantity >= MAX_QTY} onClick={() => setQuantity(form.quantity + 1)}
                    className="flex h-full w-11 shrink-0 items-center justify-center text-navy transition hover:bg-frost active:bg-aqua disabled:pointer-events-none disabled:text-slate-300">
                    <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </div>
          </Step>

          {/* buttons on phones and tablets (laptops have them in the side panel) */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end lg:hidden">
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            {postButton('sm:px-6')}
          </div>
        </div>

        {/* Live preview + checklist; stays in view beside the form on laptops */}
        <aside aria-label="Preview" className="space-y-4 lg:sticky lg:top-24">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-600"><Icon name="eye" className="h-4 w-4" /> How buyers will see it</p>
            <div className="card mx-auto max-w-xs overflow-hidden lg:max-w-none">
              <div className="relative aspect-square bg-frost">
                {previews[0]
                  ? <img key={previews[0]} src={previews[0]} alt="" className="h-full w-full animate-fade-in object-cover" />
                  : <div className="flex h-full flex-col items-center justify-center gap-1.5 text-sm text-slate-400"><Icon name="photo" className="h-9 w-9" />Your cover photo</div>}
                <span className="chip absolute left-2 top-2 bg-white/95 text-navy shadow-sm">{form.condition}</span>
              </div>
              <div className="space-y-0.5 p-3.5">
                <p className={`truncate text-sm font-semibold ${form.title.trim() ? 'text-ink' : 'text-slate-400'}`}>{form.title.trim() || 'Your uniform’s title'}</p>
                <p className="truncate text-xs text-slate-500">Size {form.size.trim() || '—'}{form.category && ` · ${form.category}`}</p>
                <div className="flex items-center justify-between gap-2 pt-1.5">
                  <p className="font-bold text-navy">{swapOnly && form.price === '' ? 'For swap' : form.price === '' ? '₱—' : formatPrice(form.price)}</p>
                  <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                    <Avatar name={user.fullName} src={user.avatar} className="h-5 w-5 text-[10px]" />
                    <span className="truncate">{user.fullName?.split(' ')[0]}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">Ready to post</span>
              <span className="text-slate-500">{doneCount}/{checks.length}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-frost" role="progressbar" aria-label="Listing completeness"
              aria-valuemin={0} aria-valuemax={checks.length} aria-valuenow={doneCount}>
              <div className="h-full rounded-full bg-navy transition-[width] duration-500 ease-out" style={{ width: `${(doneCount / checks.length) * 100}%` }} />
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {checks.map(([label, ok]) => (
                <li key={label} className={`flex items-center gap-2 transition-colors ${ok ? 'text-ink' : 'text-slate-500'}`}>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition duration-300 ${ok ? 'bg-navy text-white' : 'ring-1 ring-inset ring-slate-300'}`}>
                    {ok && <Icon name="check" className="h-3 w-3 animate-pop" strokeWidth={3} />}
                  </span>
                  {label}
                  <span className="sr-only">{ok ? ' (done)' : ' (to do)'}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 hidden space-y-2 lg:block">
              {postButton('w-full py-3')}
              <button type="button" className="btn-outline w-full" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
