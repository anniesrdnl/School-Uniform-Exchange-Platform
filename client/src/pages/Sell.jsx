import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { Spinner } from '../components/Loader.jsx';
import Icon from '../components/Icon.jsx';
import shrinkImage from '../shrinkImage.js';
import { CATEGORIES, CONDITIONS, EXCHANGE_OPTIONS, SIZES } from '../constants.js';

const MAX_PHOTOS = 5;

// Radio buttons styled as selectable pills
function PillGroup({ name, label, options, value, onChange, cols }) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className={`grid gap-2 ${cols}`}>
        {options.map((o) => (
          <label key={o}
            className="cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-center text-sm font-semibold text-slate-600 transition hover:border-denim has-[:checked]:border-navy has-[:checked]:bg-aqua has-[:checked]:text-navy has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-powder/60">
            <input type="radio" name={name} value={o} checked={value === o} onChange={onChange} className="sr-only" />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function Sell() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', category: '', description: '', size: '', condition: 'Good', price: '', exchangeOption: 'Buy Only', quantity: 1,
  });
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Object URLs for the thumbnails, released when the photo list changes
  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  const pick = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
    e.target.value = ''; // allow picking the same file again after removing it
  };
  const removePhoto = (i) => setPhotos((prev) => prev.filter((_, j) => j !== i));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, v));
      (await Promise.all(photos.map(shrinkImage))).forEach((f) => body.append('photos', f));
      const { data } = await api.post('/listings', body);
      navigate(`/listings/${data._id}`);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const sectionTitle = 'text-base font-bold';

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Post a uniform</h1>
        <p className="mt-1 text-sm text-slate-600">Clear photos and honest details help your listing find a new owner faster.</p>
      </header>

      <form onSubmit={submit} className="card divide-y divide-aqua/70">
        {error && <p role="alert" className="m-5 animate-fade-up rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-200 sm:m-6">{error}</p>}

        <section className="space-y-3 p-5 sm:p-6" aria-labelledby="photos-title">
          <div className="flex items-baseline justify-between">
            <h2 id="photos-title" className={sectionTitle}>Photos</h2>
            <span className="text-xs text-slate-500">{photos.length}/{MAX_PHOTOS}</span>
          </div>
          {photos.length < MAX_PHOTOS && (
            <label htmlFor="photos"
              className="flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-denim bg-frost/60 px-4 py-8 text-center transition hover:bg-frost focus-within:ring-4 focus-within:ring-powder/60">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-navy shadow-sm"><Icon name="upload" className="h-6 w-6" /></span>
              <span className="text-sm font-semibold text-navy">Add photos</span>
              <span className="text-xs text-slate-600">Up to {MAX_PHOTOS} images, 5 MB each. The first photo is the cover.</span>
              <input id="photos" type="file" accept="image/*" multiple onChange={pick} className="sr-only" />
            </label>
          )}
          {previews.length > 0 && (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {previews.map((src, i) => (
                <li key={src} className="relative animate-fade-up">
                  <img src={src} alt={`Photo ${i + 1}`} className="aspect-square w-full rounded-xl object-cover ring-1 ring-aqua" />
                  {i === 0 && <span className="chip absolute bottom-1.5 left-1.5 bg-white/95 text-[10px] text-navy">Cover</span>}
                  <button type="button" onClick={() => removePhoto(i)} aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm hover:text-red-600">
                    <Icon name="x" className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4 p-5 sm:p-6" aria-labelledby="details-title">
          <h2 id="details-title" className={sectionTitle}>Details</h2>
          <div>
            <label className="label" htmlFor="title">Title</label>
            <input id="title" required maxLength={100} className="input" placeholder="e.g. White polo shirt with school logo" value={form.title} onChange={set('title')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="category">Category</label>
              <select id="category" required className="input" value={form.category} onChange={set('category')}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="size">Size</label>
              <input id="size" required list="size-options" className="input" placeholder="S, M, L…" value={form.size} onChange={set('size')} />
              <datalist id="size-options">{SIZES.map((s) => <option key={s} value={s} />)}</datalist>
            </div>
          </div>
          <PillGroup name="condition" label="Condition" options={CONDITIONS} value={form.condition} onChange={set('condition')} cols="grid-cols-2 sm:grid-cols-4" />
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" rows={4} maxLength={1000} className="input" placeholder="Fit, flaws, how long it was worn, where you can meet…"
              value={form.description} onChange={set('description')} />
            <p className="mt-1 text-right text-xs text-slate-500">{form.description.length}/1000</p>
          </div>
        </section>

        <section className="space-y-4 p-5 sm:p-6" aria-labelledby="pricing-title">
          <h2 id="pricing-title" className={sectionTitle}>Price & exchange</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="price">Price (₱)</label>
              <input id="price" type="number" min="0" inputMode="decimal" required className="input" placeholder="0" value={form.price} onChange={set('price')} />
            </div>
            <div>
              <label className="label" htmlFor="quantity">Quantity</label>
              <input id="quantity" type="number" min="1" inputMode="numeric" className="input" value={form.quantity} onChange={set('quantity')} />
            </div>
          </div>
          <PillGroup name="exchangeOption" label="Open to" options={EXCHANGE_OPTIONS} value={form.exchangeOption} onChange={set('exchangeOption')} cols="sm:grid-cols-3" />
        </section>

        <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:justify-end sm:p-6">
          <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn-primary sm:px-6" disabled={busy}>{busy ? <><Spinner /> Posting…</> : 'Post uniform'}</button>
        </div>
      </form>
    </div>
  );
}
