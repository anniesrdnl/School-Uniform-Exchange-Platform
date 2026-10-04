import { Router } from 'express';
import { supabase } from '../supabaseServer.js';
import { check, toClient, PUBLIC_PROFILE } from '../config/db.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadBuffer } from '../config/cloudinary.js';

const router = Router();
const LISTING_COLS = 'id, title, description, category, size, condition, price, exchange_option, quantity, images, status, created_at, updated_at';
const WITH_SELLER = `${LISTING_COLS}, seller:profiles!listings_seller_fkey(${PUBLIC_PROFILE})`;

// Request body (camelCase) -> listing columns (snake_case); only keys that were sent
function listingFields(body) {
  const map = {
    title: 'title', description: 'description', category: 'category', size: 'size', condition: 'condition',
    price: 'price', exchangeOption: 'exchange_option', quantity: 'quantity', status: 'status',
  };
  const out = {};
  for (const [k, col] of Object.entries(map)) if (body[k] !== undefined) out[col] = body[k];
  if (out.price !== undefined) out.price = Number(out.price) || 0;
  if (out.quantity !== undefined) out.quantity = Number(out.quantity) || 1;
  return out;
}

// GET /api/listings?q=&category=&size=&condition=&minPrice=&maxPrice=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { q, category, size, condition, minPrice, maxPrice, sort = 'newest' } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);

    let query = supabase.from('listings').select(WITH_SELLER, { count: 'exact' }).eq('status', 'available');
    if (q) {
      // strip characters that have meaning in PostgREST filter syntax
      const term = String(q).replace(/[,()*%\\"]/g, ' ').trim();
      if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
    if (category) query = query.eq('category', category);
    if (size) query = query.eq('size', size);
    if (condition) query = query.eq('condition', condition);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));

    const [col, ascending] = { newest: ['created_at', false], 'price-asc': ['price', true], 'price-desc': ['price', false] }[sort]
      || ['created_at', false];
    query = query.order(col, { ascending }).range((page - 1) * limit, page * limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    res.json({ items: toClient(data), total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) {
    next(err);
  }
});

router.get('/mine', protect, async (req, res, next) => {
  try {
    const rows = check(await supabase.from('listings').select('*').eq('seller', req.user.id).order('created_at', { ascending: false }));
    res.json(toClient(rows));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const listing = check(await supabase.from('listings').select(WITH_SELLER).eq('id', req.params.id).maybeSingle());
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.json(toClient(listing));
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, upload.array('photos', 5), async (req, res, next) => {
  try {
    const images = await Promise.all((req.files || []).map((f) => uploadBuffer(f.buffer)));
    const fields = listingFields(req.body);
    delete fields.status; // new listings always start as available
    const listing = check(await supabase.from('listings').insert({ ...fields, seller: req.user.id, images }).select().single());
    res.status(201).json(toClient(listing));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const listing = check(await supabase.from('listings').update(listingFields(req.body))
      .eq('id', req.params.id).eq('seller', req.user.id).select().maybeSingle());
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.json(toClient(listing));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const listing = check(await supabase.from('listings').delete()
      .eq('id', req.params.id).eq('seller', req.user.id).select('id').maybeSingle());
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
