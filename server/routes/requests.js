import { Router } from 'express';
import { supabase } from '../supabaseServer.js';
import { check, toClient } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

const WITH_DETAILS = `id, option, message, status, created_at, updated_at,
  listing:listings!requests_listing_fkey(id, title, price, size, condition, images, status),
  buyer:profiles!requests_buyer_fkey(id, full_name, program, year_level, rating_avg, rating_count, avatar),
  seller:profiles!requests_seller_fkey(id, full_name, rating_avg, rating_count, avatar)`;

// Buyer creates a request
router.post('/', async (req, res, next) => {
  try {
    const listing = check(await supabase.from('listings').select('id, seller, status').eq('id', req.body.listing).maybeSingle());
    if (!listing || listing.status !== 'available') {
      return res.status(400).json({ message: 'This uniform is no longer available.' });
    }
    if (listing.seller === req.user.id) {
      return res.status(400).json({ message: "You can't request your own listing." });
    }
    const existing = check(await supabase.from('requests').select('id')
      .eq('listing', listing.id).eq('buyer', req.user.id).eq('status', 'pending').maybeSingle());
    if (existing) return res.status(409).json({ message: 'You already have a pending request for this item.' });

    const request = check(await supabase.from('requests').insert({
      listing: listing.id,
      buyer: req.user.id,
      seller: listing.seller,
      option: req.body.option || 'Buy',
      message: req.body.message || '',
    }).select().single());
    res.status(201).json(toClient(request));
  } catch (err) {
    next(err);
  }
});

router.get('/incoming', async (req, res, next) => {
  try {
    const rows = check(await supabase.from('requests').select(WITH_DETAILS).eq('seller', req.user.id).order('created_at', { ascending: false }));
    res.json(toClient(rows));
  } catch (err) {
    next(err);
  }
});

router.get('/outgoing', async (req, res, next) => {
  try {
    const rows = check(await supabase.from('requests').select(WITH_DETAILS).eq('buyer', req.user.id).order('created_at', { ascending: false }));
    res.json(toClient(rows));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/requests/:id/status  { status: 'accepted' | 'declined' | 'cancelled' | 'completed' }
router.patch('/:id/status', async (req, res, next) => {
  try {
    const request = check(await supabase.from('requests').select('*').eq('id', req.params.id).maybeSingle());
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    const { status } = req.body;
    const isSeller = request.seller === req.user.id;
    const isBuyer = request.buyer === req.user.id;

    // who may move the request to which status, and from where
    const rules = {
      accepted: { who: isSeller, from: ['pending'] },
      declined: { who: isSeller, from: ['pending'] },
      cancelled: { who: isBuyer, from: ['pending', 'accepted'] },
      completed: { who: isSeller, from: ['accepted'] },
    };
    const rule = rules[status];
    if (!rule || !rule.who || !rule.from.includes(request.status)) {
      return res.status(400).json({ message: 'That change is not allowed.' });
    }

    const wasAccepted = request.status === 'accepted';
    const updated = check(await supabase.from('requests').update({ status }).eq('id', request.id).select().single());

    // keep the listing in sync
    let listingStatus = { accepted: 'reserved', completed: 'sold' }[status];
    if (status === 'cancelled' && wasAccepted) listingStatus = 'available';
    if (listingStatus) check(await supabase.from('listings').update({ status: listingStatus }).eq('id', request.listing));

    res.json(toClient(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
