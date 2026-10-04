import { Router } from 'express';
import { supabase } from '../supabaseServer.js';
import { check, toClient } from '../config/db.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(protect, adminOnly);

const countWhere = async (table, column, value) => {
  const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true }).eq(column, value);
  if (error) throw error;
  return count;
};

router.get('/stats', async (_req, res, next) => {
  try {
    const [totalUsers, activeListings, completedExchanges, openReports] = await Promise.all([
      countWhere('profiles', 'role', 'student'),
      countWhere('listings', 'status', 'available'),
      countWhere('requests', 'status', 'completed'),
      countWhere('reports', 'status', 'open'),
    ]);
    res.json({ totalUsers, activeListings, completedExchanges, openReports });
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    let query = supabase.from('profiles').select('*');
    if (req.query.verified) query = query.eq('verified', req.query.verified === 'true');
    res.json(toClient(check(await query.order('created_at', { ascending: false }).limit(200))));
  } catch (err) {
    next(err);
  }
});

// { verified?: boolean, banned?: boolean }
router.patch('/users/:id', async (req, res, next) => {
  try {
    const update = {};
    if (typeof req.body.verified === 'boolean') update.verified = req.body.verified;
    if (typeof req.body.banned === 'boolean') update.banned = req.body.banned;
    const user = check(await supabase.from('profiles').update(update).eq('id', req.params.id).select().maybeSingle());
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(toClient(user));
  } catch (err) {
    next(err);
  }
});

router.get('/listings', async (_req, res, next) => {
  try {
    const rows = check(await supabase.from('listings')
      .select('id, title, description, category, size, condition, price, exchange_option, quantity, images, status, created_at, updated_at, seller:profiles!listings_seller_fkey(id, full_name)')
      .order('created_at', { ascending: false }).limit(200));
    res.json(toClient(rows));
  } catch (err) {
    next(err);
  }
});

router.delete('/listings/:id', async (req, res, next) => {
  try {
    check(await supabase.from('listings').delete().eq('id', req.params.id));
    res.json({ message: 'Listing removed.' });
  } catch (err) {
    next(err);
  }
});

router.get('/reports', async (_req, res, next) => {
  try {
    const rows = check(await supabase.from('reports')
      .select('id, target_type, target_id, reason, status, created_at, updated_at, reporter:profiles!reports_reporter_fkey(id, full_name)')
      .order('created_at', { ascending: false }).limit(200));
    res.json(toClient(rows));
  } catch (err) {
    next(err);
  }
});

router.patch('/reports/:id', async (req, res, next) => {
  try {
    const report = check(await supabase.from('reports').update({ status: req.body.status }).eq('id', req.params.id).select().maybeSingle());
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    res.json(toClient(report));
  } catch (err) {
    next(err);
  }
});

export default router;
