import { Router } from 'express';
import { supabase } from '../supabaseServer.js';
import { check, toClient } from '../config/db.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadBuffer } from '../config/cloudinary.js';

const router = Router();
router.use(protect);

export async function getMyConversation(id, userId) {
  return check(await supabase.from('conversations').select('*').eq('id', id).contains('participants', [userId]).maybeSingle());
}

// Start (or reuse) a conversation with another user about a listing
router.post('/conversations', async (req, res, next) => {
  try {
    const { userId, listingId } = req.body;
    if (!userId) return res.status(400).json({ message: 'Missing user to message.' });
    if (userId === req.user.id) return res.status(400).json({ message: "You can't message yourself." });

    let query = supabase.from('conversations').select('*').contains('participants', [req.user.id, userId]);
    query = listingId ? query.eq('listing', listingId) : query.is('listing', null);
    let convo = check(await query.limit(1).maybeSingle());
    if (!convo) {
      convo = check(await supabase.from('conversations')
        .insert({ participants: [req.user.id, userId], listing: listingId || null }).select().single());
    }
    res.status(201).json(toClient(convo));
  } catch (err) {
    next(err);
  }
});

router.get('/conversations', async (req, res, next) => {
  try {
    const convos = check(await supabase.from('conversations')
      .select('id, participants, last_message, last_message_at, created_at, updated_at, listing:listings(id, title, images)')
      .contains('participants', [req.user.id])
      .order('last_message_at', { ascending: false }));

    // participants is a uuid[] column, so load those profiles separately
    const ids = [...new Set(convos.flatMap((c) => c.participants))];
    const people = ids.length ? check(await supabase.from('profiles').select('id, full_name, avatar').in('id', ids)) : [];
    const byId = Object.fromEntries(people.map((p) => [p.id, p]));

    res.json(toClient(convos.map((c) => ({ ...c, participants: c.participants.map((id) => byId[id] || { id }) }))));
  } catch (err) {
    next(err);
  }
});

router.get('/conversations/:id/messages', async (req, res, next) => {
  try {
    if (!(await getMyConversation(req.params.id, req.user.id))) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    const messages = check(await supabase.from('messages').select('*').eq('conversation', req.params.id).order('created_at', { ascending: true }));
    res.json(toClient(messages));
  } catch (err) {
    next(err);
  }
});

// Send a message (text and/or one photo). Also pushed live via Socket.io.
router.post('/conversations/:id/messages', upload.single('photo'), async (req, res, next) => {
  try {
    const convo = await getMyConversation(req.params.id, req.user.id);
    if (!convo) return res.status(404).json({ message: 'Conversation not found.' });

    const text = (req.body.text || '').trim();
    const image = req.file ? await uploadBuffer(req.file.buffer, 'uniform-exchange/chat') : '';
    if (!text && !image) return res.status(400).json({ message: 'Write a message or attach a photo.' });

    const message = toClient(check(await supabase.from('messages')
      .insert({ conversation: convo.id, sender: req.user.id, text, image }).select().single()));
    check(await supabase.from('conversations')
      .update({ last_message: text || 'Sent a photo', last_message_at: new Date().toISOString() }).eq('id', convo.id));

    req.app.get('io').to(`conv:${convo.id}`).emit('message:new', message);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

export default router;
