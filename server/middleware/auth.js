import jwt from 'jsonwebtoken';
import { supabase } from '../supabaseServer.js';
import { toClient } from '../config/db.js';

const SEEN_EVERY_MS = 60 * 1000; // how often last_seen_at is refreshed for an active user

export async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });

  let id;
  try {
    // 1. Verify the local JWT token
    ({ id } = jwt.verify(token, process.env.JWT_SECRET));
  } catch {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }

  // 2. Load the user's profile row
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) return next(error);
  if (!profile || profile.banned) {
    return res.status(401).json({ message: 'Account not available.' });
  }

  // 3. Record activity for the online/offline indicator (at most once a minute per user). A failure here,
  //    e.g. before the last_seen_at column exists, never blocks the request.
  const seen = profile.last_seen_at ? Date.parse(profile.last_seen_at) : 0;
  if (Date.now() - seen > SEEN_EVERY_MS) {
    await supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', id);
  }

  // 4. Attach profile to req.user (camelCase, with _id) for downstream routes
  req.user = toClient(profile);
  next();
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only.' });
  }
  next();
}
