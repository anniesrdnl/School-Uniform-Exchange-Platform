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

// ---------------------------------------------------------------------------------------------------------------
// Per-person chat settings (conversation_members): mute, archive, delete and read position. Each row belongs to one
// person, so muting, archiving or deleting a chat never changes it for the other person.
// Rows are created on first use. Until the table exists (see supabase/schema.sql), chats work without these extras.
// ---------------------------------------------------------------------------------------------------------------

const DEFAULTS = { muted: false, archived: false, hidden: false, cleared_at: null, last_read_at: null };

// Missing table or column: the database hasn't been migrated yet
const notMigrated = (error) => ['42P01', '42703', 'PGRST204', 'PGRST205'].includes(error?.code);

// Run a write that depends on the new table/columns; skip it quietly on a database that doesn't have them yet
async function optional(query) {
  const { error } = await query;
  if (error && !notMigrated(error)) throw error;
}

// { conversationId: settings } for one person
async function settingsFor(userId, conversationIds) {
  if (!conversationIds.length) return {};
  const { data, error } = await supabase.from('conversation_members').select('*')
    .eq('member', userId).in('conversation', conversationIds);
  if (error) {
    if (notMigrated(error)) return {};
    throw error;
  }
  return Object.fromEntries(data.map((row) => [row.conversation, row]));
}

const saveSettings = (conversation, member, fields) => supabase.from('conversation_members')
  .upsert({ conversation, member, ...fields }, { onConflict: 'conversation,member' });

const time = (value) => (value ? Date.parse(value) : 0);
const MAX_TEXT = 2000;

// My chats with my settings applied: deleted ones left out, each marked muted / archived / unread
async function myConversations(userId, columns) {
  const convos = check(await supabase.from('conversations').select(columns)
    .contains('participants', [userId]).order('last_message_at', { ascending: false }));
  const settings = await settingsFor(userId, convos.map((c) => c.id));

  return convos.flatMap((c) => {
    const s = { ...DEFAULTS, ...settings[c.id] };
    if (s.hidden) return [];
    const lastAt = time(c.last_message_at);
    const cleared = s.cleared_at && lastAt <= time(s.cleared_at); // nothing new since I deleted it
    const unread = Boolean(c.last_sender) && c.last_sender !== userId && !cleared && lastAt > time(s.last_read_at);
    return [{ ...c, last_message: cleared ? '' : c.last_message, muted: s.muted, archived: s.archived, unread }];
  });
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
    } else {
      // reopening a chat I deleted or archived brings it back to my inbox (deleted history stays hidden)
      await optional(saveSettings(convo.id, req.user.id, { hidden: false, archived: false }));
    }
    res.status(201).json(toClient(convo));
  } catch (err) {
    next(err);
  }
});

router.get('/conversations', async (req, res, next) => {
  try {
    // select('*') so this keeps working before the last_sender column exists
    const convos = await myConversations(req.user.id, '*, listing:listings(id, title, images)');

    // participants is a uuid[] column, so load those profiles separately. select('*') and pick the public fields,
    // so this keeps working on a database that doesn't have the last_seen_at column yet.
    const ids = [...new Set(convos.flatMap((c) => c.participants))];
    const people = ids.length ? check(await supabase.from('profiles').select('*').in('id', ids)) : [];
    const byId = Object.fromEntries(people.map((p) => [p.id, {
      id: p.id, full_name: p.full_name, avatar: p.avatar, last_seen_at: p.last_seen_at ?? null,
    }]));

    res.json(toClient(convos.map((c) => ({ ...c, participants: c.participants.map((id) => byId[id] || { id }) }))));
  } catch (err) {
    next(err);
  }
});

// Number of chats with a new message from the other person (muted chats don't count): the Messages badge
router.get('/unread', async (req, res, next) => {
  try {
    const convos = await myConversations(req.user.id, '*');
    res.json({ count: convos.filter((c) => c.unread && !c.muted).length });
  } catch (err) {
    next(err);
  }
});

// { muted?: boolean, archived?: boolean }
router.patch('/conversations/:id/settings', async (req, res, next) => {
  try {
    if (!(await getMyConversation(req.params.id, req.user.id))) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    const fields = {};
    if (typeof req.body.muted === 'boolean') fields.muted = req.body.muted;
    if (typeof req.body.archived === 'boolean') fields.archived = req.body.archived;
    if (!Object.keys(fields).length) return res.status(400).json({ message: 'Nothing to change.' });

    const { error } = await saveSettings(req.params.id, req.user.id, fields);
    if (notMigrated(error)) return res.status(503).json({ message: 'Chat settings are not set up on the server yet.' });
    if (error) throw error;
    res.json(fields);
  } catch (err) {
    next(err);
  }
});

// Delete a chat for me only: it leaves my list and its history is cleared for me. The other person keeps theirs.
// If either of us sends a new message, the chat comes back with only the new messages.
router.delete('/conversations/:id', async (req, res, next) => {
  try {
    if (!(await getMyConversation(req.params.id, req.user.id))) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    const now = new Date().toISOString();
    const { error } = await saveSettings(req.params.id, req.user.id, { hidden: true, archived: false, cleared_at: now, last_read_at: now });
    if (notMigrated(error)) return res.status(503).json({ message: 'Chat settings are not set up on the server yet.' });
    if (error) throw error;
    res.json({ message: 'Chat deleted.' });
  } catch (err) {
    next(err);
  }
});

// Messages in a chat (minus any I deleted). Opening a chat marks it read.
// ?since=<newest updatedAt the browser already has>: only messages sent, edited or deleted after that. The open chat
// checks every second, so this keeps each check small and quick.
router.get('/conversations/:id/messages', async (req, res, next) => {
  try {
    // the chat and my settings for it don't depend on each other, so look both up at once
    const [convo, settings] = await Promise.all([
      getMyConversation(req.params.id, req.user.id),
      settingsFor(req.user.id, [req.params.id]),
    ]);
    if (!convo) return res.status(404).json({ message: 'Conversation not found.' });
    const mine = { ...DEFAULTS, ...settings[convo.id] };
    const since = typeof req.query.since === 'string' && !Number.isNaN(Date.parse(req.query.since)) ? req.query.since : null;

    const load = (skipHidden) => {
      let query = supabase.from('messages').select('*').eq('conversation', convo.id);
      if (mine.cleared_at) query = query.gt('created_at', mine.cleared_at);
      if (since) query = query.gt('updated_at', since);
      if (skipHidden) query = query.not('hidden_for', 'cs', `{${req.user.id}}`); // "delete for you"
      return query.order('created_at', { ascending: true });
    };
    // mark it read (only when something arrived since I last read it) while the messages load
    const markRead = time(convo.last_message_at) > time(mine.last_read_at)
      ? optional(saveSettings(convo.id, req.user.id, { last_read_at: new Date().toISOString() }))
      : null;
    let [result] = await Promise.all([load(true), markRead]);
    if (notMigrated(result.error)) result = await load(false);

    res.json(toClient(check(result)));
  } catch (err) {
    next(err);
  }
});

// Send a message (text and/or one photo). The other person's chat page picks it up by polling.
router.post('/conversations/:id/messages', upload.single('photo'), async (req, res, next) => {
  try {
    const convo = await getMyConversation(req.params.id, req.user.id);
    if (!convo) return res.status(404).json({ message: 'Conversation not found.' });

    const text = (req.body.text || '').trim();
    const image = req.file ? await uploadBuffer(req.file.buffer, 'uniform-exchange/chat') : '';
    if (!text && !image) return res.status(400).json({ message: 'Write a message or attach a photo.' });
    if (text.length > MAX_TEXT) return res.status(400).json({ message: `Messages can be up to ${MAX_TEXT} characters.` });

    const message = toClient(check(await supabase.from('messages')
      .insert({ conversation: convo.id, sender: req.user.id, text, image }).select().single()));

    const preview = { last_message: text || 'Sent a photo', last_message_at: message.createdAt };
    const { error } = await supabase.from('conversations').update({ ...preview, last_sender: req.user.id }).eq('id', convo.id);
    if (notMigrated(error)) check(await supabase.from('conversations').update(preview).eq('id', convo.id));
    else if (error) throw error;

    // a new message brings the chat back for anyone who archived or deleted it; my own message counts as read
    await optional(supabase.from('conversation_members').update({ archived: false, hidden: false }).eq('conversation', convo.id));
    await optional(saveSettings(convo.id, req.user.id, { last_read_at: message.createdAt }));

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------------------------------------------
// Editing and deleting single messages
// ---------------------------------------------------------------------------------------------------------------

// The message from the URL, only if it's in a chat I'm part of
async function findMessage(req) {
  const convo = await getMyConversation(req.params.id, req.user.id);
  if (!convo) return {};
  const message = check(await supabase.from('messages').select('*')
    .eq('id', req.params.messageId).eq('conversation', convo.id).maybeSingle());
  return { convo, message };
}

// Keep the chat list preview in step when the newest message is edited or deleted for everyone
async function refreshPreview(convo, message, preview) {
  const latest = check(await supabase.from('messages').select('id')
    .eq('conversation', convo.id).order('created_at', { ascending: false }).limit(1).maybeSingle());
  if (latest?.id === message.id) check(await supabase.from('conversations').update({ last_message: preview }).eq('id', convo.id));
}

const notSetUp = (res) => res.status(503).json({ message: 'Editing and deleting messages is not set up on the server yet.' });

// Edit my own message: { text }
router.patch('/conversations/:id/messages/:messageId', async (req, res, next) => {
  try {
    const { convo, message } = await findMessage(req);
    if (!message) return res.status(404).json({ message: 'Message not found.' });
    if (message.sender !== req.user.id) return res.status(403).json({ message: 'You can only edit your own messages.' });
    if (message.deleted_at) return res.status(400).json({ message: 'This message was deleted.' });

    const text = String(req.body.text ?? '').trim();
    if (!text && !message.image) return res.status(400).json({ message: "A message can't be empty." });
    if (text.length > MAX_TEXT) return res.status(400).json({ message: `Messages can be up to ${MAX_TEXT} characters.` });

    const now = new Date().toISOString();
    const { data, error } = await supabase.from('messages')
      .update({ text, edited_at: now, updated_at: now }).eq('id', message.id).select().single();
    if (notMigrated(error)) return notSetUp(res);
    if (error) throw error;
    await refreshPreview(convo, message, text || 'Sent a photo');
    res.json(toClient(data));
  } catch (err) {
    next(err);
  }
});

// Delete a message. ?for=everyone (my own messages only): its text and photo are removed for both people and a
// "deleted" note stays in its place. Otherwise it is hidden for me only.
router.delete('/conversations/:id/messages/:messageId', async (req, res, next) => {
  try {
    const { convo, message } = await findMessage(req);
    if (!message) return res.status(404).json({ message: 'Message not found.' });
    const now = new Date().toISOString();

    if (req.query.for === 'everyone') {
      if (message.sender !== req.user.id) return res.status(403).json({ message: 'You can only delete your own messages for everyone.' });
      const { data, error } = await supabase.from('messages')
        .update({ text: '', image: '', deleted_at: now, updated_at: now }).eq('id', message.id).select().single();
      if (notMigrated(error)) return notSetUp(res);
      if (error) throw error;
      await refreshPreview(convo, message, 'Message deleted');
      return res.json(toClient(data));
    }

    if (!('hidden_for' in message)) return notSetUp(res);
    const hiddenFor = [...new Set([...(message.hidden_for || []), req.user.id])];
    check(await supabase.from('messages').update({ hidden_for: hiddenFor }).eq('id', message.id));
    res.json({ message: 'Deleted for you.' });
  } catch (err) {
    next(err);
  }
});

export default router;
