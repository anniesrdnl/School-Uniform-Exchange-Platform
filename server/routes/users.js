import { Router } from 'express';
import { supabase } from '../supabaseServer.js';
import { check, toClient } from '../config/db.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadBuffer } from '../config/cloudinary.js';

const router = Router();

const countOf = async (query) => {
  const { count, error } = await query;
  if (error) throw error;
  return count;
};

// My profile stats
router.get('/me/stats', protect, async (req, res, next) => {
  try {
    const [itemsListed, completedExchanges] = await Promise.all([
      countOf(supabase.from('listings').select('id', { count: 'exact', head: true }).eq('seller', req.user.id)),
      countOf(supabase.from('requests').select('id', { count: 'exact', head: true })
        .eq('status', 'completed').or(`seller.eq.${req.user.id},buyer.eq.${req.user.id}`)),
    ]);
    res.json({ itemsListed, completedExchanges });
  } catch (err) {
    next(err);
  }
});

router.put('/me', protect, upload.single('avatar'), async (req, res, next) => {
  try {
    const update = {};
    if (req.body.fullName) update.full_name = req.body.fullName;
    if (req.body.program) update.program = req.body.program;
    if (req.body.yearLevel) update.year_level = req.body.yearLevel;
    if (req.file) update.avatar = await uploadBuffer(req.file.buffer, 'uniform-exchange/avatars');
    if (!Object.keys(update).length) return res.json(req.user);

    const profile = check(await supabase.from('profiles').update(update).eq('id', req.user.id).select().single());
    res.json(toClient(profile));
  } catch (err) {
    next(err);
  }
});

// Leave a review after a completed exchange
router.post('/reviews', protect, async (req, res, next) => {
  try {
    const { requestId, rating, comment } = req.body;
    const request = check(await supabase.from('requests').select('*').eq('id', requestId).maybeSingle());
    if (!request || request.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review completed exchanges.' });
    }
    const isBuyer = request.buyer === req.user.id;
    const isSeller = request.seller === req.user.id;
    if (!isBuyer && !isSeller) return res.status(403).json({ message: 'Not your exchange.' });

    const reviewee = isBuyer ? request.seller : request.buyer;
    const { data: review, error } = await supabase.from('reviews')
      .insert({ reviewer: req.user.id, reviewee, request: request.id, rating, comment: comment || '' }).select().single();
    if (error?.code === '23505') return res.status(409).json({ message: 'You already reviewed this exchange.' });
    if (error) throw error;

    // recompute the reviewee's average rating
    const ratings = check(await supabase.from('reviews').select('rating').eq('reviewee', reviewee));
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    check(await supabase.from('profiles')
      .update({ rating_avg: Math.round(avg * 10) / 10, rating_count: ratings.length }).eq('id', reviewee));

    res.status(201).json(toClient(review));
  } catch (err) {
    next(err);
  }
});

// Report a user or listing
router.post('/reports', protect, async (req, res, next) => {
  try {
    const { targetType, targetId, reason } = req.body;
    const report = check(await supabase.from('reports')
      .insert({ reporter: req.user.id, target_type: targetType, target_id: targetId, reason }).select().single());
    res.status(201).json(toClient(report));
  } catch (err) {
    next(err);
  }
});

// Public seller profile + reviews (keep last so it doesn't shadow /me and /reviews)
router.get('/:id', async (req, res, next) => {
  try {
    const user = check(await supabase.from('profiles')
      .select('id, full_name, avatar, program, year_level, rating_avg, rating_count, created_at').eq('id', req.params.id).maybeSingle());
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const reviews = check(await supabase.from('reviews')
      .select('id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_fkey(id, full_name, avatar)')
      .eq('reviewee', user.id).order('created_at', { ascending: false }).limit(20));
    res.json({ user: toClient(user), reviews: toClient(reviews) });
  } catch (err) {
    next(err);
  }
});

export default router;
