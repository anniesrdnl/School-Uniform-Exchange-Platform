import jwt from 'jsonwebtoken';
import { supabase } from '../supabaseServer.js';
import { toClient } from '../config/db.js';

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

  // 3. Attach profile to req.user (camelCase, with _id) for downstream routes
  req.user = toClient(profile);
  next();
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only.' });
  }
  next();
}
