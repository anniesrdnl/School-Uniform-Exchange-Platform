import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { Spinner } from '../components/Loader.jsx';

const CATEGORIES = ['Uniform Shirt', 'Pants / Skirt', 'PE Uniform', 'Accessories'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const OPTIONS = ['Buy Only', 'Exchange Only', 'Buy or Exchange'];

export default function Sell() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', category: '', description: '', size: '', condition: 'Good', price: '', exchangeOption: 'Buy Only', quantity: 1,
  });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const pick = (e) => setPhotos(Array.from(e.target.files).slice(0, 5));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, v));
      photos.forEach((f) => body.append('photos', f));
      const { data } = await api.post('/listings', body);
      navigate(`/listings/${data._id}`);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-xl font-bold">Post a uniform</h1>
      {error && <p role="alert" className="animate-fade-up rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div>
        <label className="label" htmlFor="photos">Photos (up to 5)</label>
        <input id="photos" type="file" accept="image/*" multiple onChange={pick} className="input" />
        {photos.length > 0 && (
          <div className="mt-2 flex gap-2">
            {photos.map((f) => <img key={f.name} src={URL.createObjectURL(f)} alt="" className="h-16 w-16 animate-fade-up rounded-lg object-cover shadow-sm ring-1 ring-slate-200" />)}
          </div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="title">Title</label>
        <input id="title" required className="input" placeholder="e.g. School polo shirt" value={form.title} onChange={set('title')} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" required className="input" value={form.category} onChange={set('category')}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="size">Size</label>
          <input id="size" required className="input" placeholder="S, M, L…" value={form.size} onChange={set('size')} />
        </div>
        <div>
          <label className="label" htmlFor="condition">Condition</label>
          <select id="condition" className="input" value={form.condition} onChange={set('condition')}>
            {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="price">Price (₱)</label>
          <input id="price" type="number" min="0" required className="input" value={form.price} onChange={set('price')} />
        </div>
        <div>
          <label className="label" htmlFor="exchangeOption">Exchange option</label>
          <select id="exchangeOption" className="input" value={form.exchangeOption} onChange={set('exchangeOption')}>
            {OPTIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="quantity">Quantity</label>
          <input id="quantity" type="number" min="1" className="input" value={form.quantity} onChange={set('quantity')} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" rows={3} className="input" placeholder="Describe the item" value={form.description} onChange={set('description')} />
      </div>

      <button className="btn-primary w-full" disabled={busy}>{busy ? <><Spinner /> Posting…</> : 'Post uniform'}</button>
    </form>
  );
}
