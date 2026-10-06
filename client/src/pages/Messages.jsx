import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/Icon.jsx';
import Avatar from '../components/Avatar.jsx';
import PageBackdrop from '../components/PageBackdrop.jsx';
import PresenceDot from '../components/PresenceDot.jsx';
import ActionMenu from '../components/ActionMenu.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { ChatBubblesSkeleton, ChatHeaderSkeleton, ConversationListSkeleton, MESSAGES_CARD } from '../components/PageSkeletons.jsx';
import { presence } from '../constants.js';
import { Spinner } from '../components/Loader.jsx';
import shrinkImage from '../shrinkImage.js';

const CHAT_POLL_MS = 1500; // open chat: how often to check for new, edited or deleted messages
const LIST_POLL_MS = 5000; // chat list: previews, unread dots, online status
const GROUP_MS = 5 * 60 * 1000; // messages from one person less than 5 minutes apart sit together
const QUICK_REPLIES = ['Hi! Is this still available?', 'Can we meet on campus?', 'Could you send more photos?'];
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy';
// "⋯" buttons: always shown on touch screens; with a mouse they appear on hover or keyboard focus, and stay while open
// (written out in full so Tailwind can find the class names)
const REVEAL_IN_ROW = 'transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover/row:opacity-100 pointer-fine:focus-within:opacity-100 pointer-fine:data-open:opacity-100';

const DAY_MS = 86400000;
const dayStart = (date) => { const d = new Date(date); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
const daysAgo = (date) => Math.round((dayStart(Date.now()) - dayStart(date)) / DAY_MS);
const clock = (date) => new Date(date).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });

// Conversation list: "3:41 PM" today, "Yesterday", "Mon" this week, "Oct 3" before that
function listTime(date) {
  const days = daysAgo(date);
  if (days <= 0) return clock(date);
  if (days === 1) return 'Yesterday';
  if (days < 7) return new Date(date).toLocaleDateString('en-PH', { weekday: 'short' });
  return new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

// Divider between days inside a chat
function dayLabel(date) {
  const days = daysAgo(date);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return new Date(date).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Flat list of day dividers and messages; `first`/`last` mark where each run of messages from one person starts and ends
function buildRows(messages) {
  const close = (a, b) => a && b && a.sender === b.sender && dayStart(a.createdAt) === dayStart(b.createdAt)
    && Math.abs(new Date(b.createdAt) - new Date(a.createdAt)) < GROUP_MS;
  const rows = [];
  messages.forEach((m, i) => {
    const prev = messages[i - 1];
    if (!prev || dayStart(prev.createdAt) !== dayStart(m.createdAt)) rows.push({ day: dayLabel(m.createdAt), key: `day-${m._id}` });
    rows.push({ m, key: m._id, first: !close(prev, m), last: !close(m, messages[i + 1]) });
  });
  return rows;
}

// Fingerprint of a chat's saved messages, so a full reload that changed nothing keeps the same array
const fingerprint = (list) => list.map((m) => `${m._id}:${m.updatedAt}:${m.deletedAt || ''}`).join('|');

// The newest updatedAt in a chat, sent back as ?since= so the server only returns what changed after it
const newestChange = (list) => list.reduce((best, m) => (m.updatedAt && (!best || Date.parse(m.updatedAt) > Date.parse(best)) ? m.updatedAt : best), null);

// Fold changed messages (new, edited or deleted for everyone) into a chat, keeping it in time order
function mergeChanges(list, changes) {
  const byId = new Map(list.map((m) => [m._id, m]));
  changes.forEach((m) => byId.set(m._id, m));
  return [...byId.values()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

// Soft glows and the moving pinstripe behind the chat pane (styles: .chat-bg in index.css)
function ChatBackground() {
  return (
    <div className="chat-bg" aria-hidden="true">
      <span className="chat-bg-glow chat-bg-glow-1" />
      <span className="chat-bg-glow chat-bg-glow-2" />
    </div>
  );
}

function ConversationRow({ convo, person, active, unread, actions, onOpen }) {
  const thumb = convo.listing?.images?.[0];
  const name = person?.fullName || 'Student';
  return (
    <li className="group/row relative">
      <button type="button" onClick={onOpen} aria-current={active ? 'true' : undefined}
        className={`flex w-full items-center gap-3 rounded-xl py-3 pl-3 pr-11 text-left transition duration-200 active:scale-[0.99] ${focusRing} ${active
          ? 'bg-navy text-white shadow-md shadow-navy/20'
          : 'hover:bg-frost'}`}>
        <span className="relative shrink-0">
          <Avatar name={person?.fullName} src={person?.avatar} className="h-11 w-11 text-base" />
          <PresenceDot {...presence(person?.lastSeenAt)} ring={active ? 'ring-navy' : 'ring-white'} className="-right-0.5 -top-0.5 h-3 w-3" />
          {thumb && (
            <img src={thumb} alt="" className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-md object-cover ring-2 ${active ? 'ring-navy' : 'ring-white'}`} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className={`truncate text-sm ${unread ? 'font-bold' : 'font-semibold'}`}>{name}</span>
              {convo.muted && (
                <span title="Muted" className={active ? 'text-cream' : 'text-slate-400'}>
                  <Icon name="bell-slash" className="h-3.5 w-3.5" /><span className="sr-only">Muted</span>
                </span>
              )}
            </span>
            <span className={`flex shrink-0 items-center gap-1.5 text-[11px] ${active ? 'text-cream' : unread && !convo.muted ? 'font-semibold text-navy' : 'text-slate-500'}`}>
              {listTime(convo.lastMessageAt)}
              {unread && (
                <span className={`h-2.5 w-2.5 rounded-full ${convo.muted ? 'bg-slate-300' : 'bg-navy'}`} title="Unread"><span className="sr-only">Unread</span></span>
              )}
            </span>
          </span>
          {convo.listing?.title && (
            <span className={`block truncate text-xs font-medium ${active ? 'text-cream' : 'text-navy'}`}>{convo.listing.title}</span>
          )}
          <span className={`block truncate text-xs ${active ? 'text-white/80' : unread ? 'font-semibold text-ink' : 'text-slate-500'} ${convo.lastMessage ? '' : 'italic'}`}>
            {convo.lastMessage || 'No messages yet'}
          </span>
        </span>
      </button>
      <ActionMenu label={`Options for your chat with ${name}`} items={actions}
        className={`absolute right-2 top-1/2 -translate-y-1/2 ${REVEAL_IN_ROW}`}
        buttonClassName={`h-8 w-8 ${active ? 'text-white hover:bg-white/15' : 'text-slate-500 hover:bg-white hover:text-navy hover:shadow-sm'}`} />
    </li>
  );
}

// Shared photo in a chat bubble: a shimmering box holds its place until it has downloaded
function ChatPhoto({ src, onLoad }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={`block ${loaded ? '' : 'skeleton h-40 w-56 max-w-full rounded-xl'}`}>
      <img src={src} alt="Shared photo" onLoad={() => { setLoaded(true); onLoad(); }}
        className={`max-h-60 w-auto transition duration-300 hover:scale-[1.03] ${loaded ? 'opacity-100' : 'h-0 opacity-0'}`} />
    </span>
  );
}

// One message. Clicking (or tapping, or Enter on) the bubble opens its options right next to it: Edit,
// Delete for you, Delete for everyone. Messages that are still sending have no options yet.
function Bubble({ m, mine, person, first, last, editing, actions, onImageLoad }) {
  const corner = mine ? (last ? 'rounded-br-md' : '') : (last ? 'rounded-bl-md' : '');
  const deleted = Boolean(m.deletedAt);
  const clickable = !m.pending && actions.length > 0;

  const bubble = ({ open, ...trigger } = {}) => {
    const shape = `rounded-2xl px-3.5 py-2 text-sm ${corner} ${clickable
      ? `cursor-pointer transition duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${open || editing ? 'ring-2 ring-offset-2 ring-offset-white ring-denim' : ''}`
      : ''}`;
    // dragging to select text (to copy it) doesn't open the menu; a plain click or tap does
    const onClick = (e) => { if (!String(window.getSelection() || '')) trigger.onClick(e); };
    const props = clickable ? { ...trigger, onClick, role: 'button', tabIndex: 0 } : {};
    const hint = clickable && <span className="sr-only">. Message options</span>;

    if (deleted) {
      return (
        <div {...props} className={`flex items-center gap-1.5 bg-white/70 italic text-slate-500 ring-1 ring-inset ring-aqua hover:bg-white ${shape}`}>
          <Icon name="no-symbol" className="h-4 w-4 shrink-0" />
          {mine ? 'You deleted this message' : 'This message was deleted'}
          {hint}
        </div>
      );
    }
    return (
      <div {...props} title={m.pending ? 'Sending…' : clock(m.createdAt)}
        className={`break-words leading-relaxed shadow-sm hover:shadow-md ${shape} ${m.pending ? 'opacity-70' : ''} ${mine
          ? `bg-navy text-white shadow-navy/20 ${clickable ? 'hover:bg-navy-deep' : ''}`
          : `bg-white text-ink ring-1 ring-aqua ${clickable ? 'hover:bg-frost' : ''}`}`}>
        {m.image && m.pending && (
          <img src={m.image} alt="Photo being sent" onLoad={onImageLoad} className={`-mx-1.5 mb-1 block max-h-60 w-auto rounded-xl ${m.text ? '' : '-mb-0.5'}`} />
        )}
        {m.image && !m.pending && (
          // the photo still opens full size; clicking it doesn't open the message options
          <a href={m.image} target="_blank" rel="noopener noreferrer" aria-label="Open photo in a new tab"
            onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}
            className={`-mx-1.5 mb-1 block overflow-hidden rounded-xl ${m.text ? '' : '-mb-0.5'} ${focusRing}`}>
            <ChatPhoto src={m.image} onLoad={onImageLoad} />
          </a>
        )}
        {m.text && <p className="whitespace-pre-line">{m.text}</p>}
        {m.editedAt && <span className={`mt-0.5 block text-right text-[10px] ${mine ? 'text-white/70' : 'text-slate-500'}`}>Edited</span>}
        {hint}
      </div>
    );
  };

  return (
    <div className={`flex animate-fade-up items-end gap-2 ${mine ? 'justify-end' : ''} ${first ? 'mt-3' : 'mt-0.5'}`}>
      {/* their avatar sits beside the last bubble of a run; an empty slot keeps the others aligned */}
      {!mine && (last
        ? <Avatar name={person?.fullName} src={person?.avatar} className="h-7 w-7 text-[11px]" />
        : <span className="w-7 shrink-0" />)}
      <div className={`flex max-w-[78%] flex-col sm:max-w-[65%] ${mine ? 'items-end' : 'items-start'}`}>
        {clickable
          ? <ActionMenu label="Message options" items={actions} align={mine ? 'end' : 'start'} className="max-w-full" trigger={bubble} />
          : bubble()}
        {last && (m.pending
          ? <span className="mt-1 flex items-center gap-1 px-1 text-[11px] text-slate-500"><Spinner className="h-3 w-3" /> Sending…</span>
          : <span className="mt-1 px-1 text-[11px] text-slate-500">{clock(m.createdAt)}</span>)}
      </div>
    </div>
  );
}

// Centered message for the empty right-hand pane
function PaneMessage({ title, children }) {
  return (
    <div className="relative m-auto flex max-w-sm flex-col items-center gap-3 p-6 text-center animate-fade-up">
      <span className="flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-white text-navy shadow-lg shadow-navy/10 ring-1 ring-aqua">
        <Icon name="chat" className="h-8 w-8" />
      </span>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <div className="text-sm text-slate-600">{children}</div>
    </div>
  );
}

// Short note at the bottom of the screen ("Chat archived · Undo"). Portalled so it's fixed to the screen,
// not to the page wrapper (which animates with a transform).
function Toast({ notice, onUndo, onDismiss }) {
  if (!notice) return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] flex justify-center px-4 md:bottom-6" role="status" aria-live="polite">
      <div key={notice.key} className="pointer-events-auto flex max-w-md animate-fade-up items-center gap-3 rounded-full bg-ink py-2 pl-4 pr-2 text-sm text-white shadow-xl shadow-navy/30">
        <span className="min-w-0">{notice.text}</span>
        {notice.undo && (
          <button type="button" onClick={onUndo}
            className="shrink-0 rounded-full px-3 py-1 font-semibold text-cream transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-cream">Undo</button>
        )}
        <button type="button" onClick={onDismiss} aria-label="Dismiss"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white">
          <Icon name="x" className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default function Messages() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const activeId = params.get('c'); // the open chat lives in the URL (?c=<id>), so links and the back button work
  const [convos, setConvos] = useState(null); // null while loading
  // Messages for every chat opened so far ({ [conversationId]: [...] }), so going back to a chat is instant.
  // A chat that isn't in here yet is still loading.
  const [chats, setChats] = useState({});
  const [view, setView] = useState('inbox'); // 'inbox' | 'archived'
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(null); // the message being edited, or null
  const [confirm, setConfirm] = useState(null); // { kind: 'chat' | 'everyone' | 'me', convo?, message? }
  const [notice, setNotice] = useState(null); // { text, undo?, key }
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const scrolled = useRef({ id: null, count: 0 });
  const busyIn = useRef({}); // { [conversationId]: changes in flight }: polls wait, so nothing flickers back
  // Chats deleted on this page: { [conversationId]: its lastMessageAt when deleted }. A list refresh that was already
  // on its way can't bring them back; only a newer message does (which is also when the server shows them again).
  const removedChats = useRef({});
  const messages = activeId ? chats[activeId] : undefined;
  const chatsRef = useRef(chats);
  chatsRef.current = chats; // read by the polling timer, which outlives a single render

  const setChat = (id, update) => setChats((prev) => ({ ...prev, [id]: update(prev[id]) }));
  const updateConvo = (id, fields) => setConvos((prev) => prev?.map((c) => (c._id === id ? { ...c, ...fields } : c)));
  const open = (id) => setParams(id ? { c: id } : {});
  const flash = (msg, undo) => setNotice({ text: msg, undo, key: Date.now() });
  const busy = async (id, work) => {
    busyIn.current[id] = (busyIn.current[id] || 0) + 1;
    try { return await work(); } finally { busyIn.current[id] -= 1; }
  };

  // Serverless hosting (Vercel) can't hold open sockets, so changes arrive by polling. Checks pause while the tab is
  // hidden, run again the moment you come back, and never overlap (a slow reply isn't asked for twice).
  useEffect(() => {
    let running = false;
    const load = () => {
      if (running || document.hidden) return;
      running = true;
      api.get('/messages/conversations')
        .then((r) => setConvos(r.data.filter((c) => {
          const removedAt = removedChats.current[c._id];
          return !removedAt || Date.parse(c.lastMessageAt) > Date.parse(removedAt);
        })))
        .catch(() => setConvos((prev) => prev ?? []))
        .finally(() => { running = false; });
    };
    load();
    const timer = setInterval(load, LIST_POLL_MS);
    window.addEventListener('focus', load);
    document.addEventListener('visibilitychange', load);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', load);
      document.removeEventListener('visibilitychange', load);
    };
  }, []);

  // Open a conversation: load its history (a chat opened before shows straight away), then keep checking for changes.
  // The server marks the chat read whenever it sends new messages.
  useEffect(() => {
    if (!activeId) return undefined;
    setError('');
    setEditing(null);
    updateConvo(activeId, { unread: false });
    let alive = true;
    let first = true; // the first check after opening loads the whole chat; later ones only fetch what changed
    let running = false;
    const load = () => {
      if (running || busyIn.current[activeId] || (!first && document.hidden)) return;
      const since = first ? null : newestChange((chatsRef.current[activeId] || []).filter((m) => !m.pending));
      running = true;
      api.get(`/messages/conversations/${activeId}/messages`, { params: since ? { since } : {} })
        .then((r) => {
          if (!alive || busyIn.current[activeId]) return;
          setChat(activeId, (prev) => {
            const saved = (prev || []).filter((m) => !m.pending);
            const pending = (prev || []).filter((m) => m.pending);
            if (since) return r.data.length ? [...mergeChanges(saved, r.data), ...pending] : prev;
            // full load that changed nothing: keep the old array so the list doesn't re-render
            if (prev && fingerprint(saved) === fingerprint(r.data)) return prev;
            return [...r.data, ...pending];
          });
          first = false;
        })
        .catch((e) => {
          if (!alive || !first) return;
          first = false;
          setError(errMsg(e));
          setChat(activeId, (prev) => prev ?? []);
        })
        .finally(() => { running = false; });
    };
    load();
    const timer = setInterval(load, CHAT_POLL_MS);
    window.addEventListener('focus', load);
    document.addEventListener('visibilitychange', load);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener('focus', load);
      document.removeEventListener('visibilitychange', load);
    };
  }, [activeId]);

  // Keep the Messages badge in the header in step (the open chat counts as read; muted chats never count)
  useEffect(() => {
    if (!convos) return;
    const count = convos.filter((c) => c.unread && !c.muted && c._id !== activeId).length;
    window.dispatchEvent(new CustomEvent('sueps:unread', { detail: count }));
  }, [convos, activeId]);

  // Jump to the newest message when a chat opens; scroll smoothly when a new one arrives in the open chat
  useEffect(() => {
    const el = listRef.current;
    if (!activeId) { scrolled.current = { id: null, count: 0 }; return; }
    if (!el || !messages) return;
    const same = scrolled.current.id === activeId;
    if (!same || messages.length !== scrolled.current.count) {
      el.scrollTo({ top: el.scrollHeight, behavior: same ? 'smooth' : 'auto' });
    }
    scrolled.current = { id: activeId, count: messages.length };
  }, [messages, activeId]);

  // Notes at the bottom of the screen fade after a few seconds
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  // A photo that finishes loading makes the chat taller: stay pinned to the bottom if the reader was already there
  const keepAtBottom = () => {
    const el = listRef.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 320) el.scrollTo({ top: el.scrollHeight });
  };

  // ---------------------------------------------------------------- sending and editing

  // The message shows in the chat at once (faded, "Sending…") and is swapped for the saved one when the server replies
  const send = async (file) => {
    const body = text.trim();
    if (!body && !file) return;
    const id = activeId;
    const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const preview = file ? URL.createObjectURL(file) : '';
    setChat(id, (prev) => [...(prev || []),
      { _id: tempId, pending: true, sender: user._id, text: body, image: preview, createdAt: new Date().toISOString() }]);
    setText('');
    setError('');
    await busy(id, async () => {
      try {
        const form = new FormData();
        form.append('text', body);
        if (file) form.append('photo', await shrinkImage(file));
        const { data } = await api.post(`/messages/conversations/${id}/messages`, form);
        setChat(id, (prev = []) => {
          const rest = prev.filter((m) => m._id !== tempId);
          return rest.some((m) => m._id === data._id) ? rest : [...rest, data];
        });
        // move this chat to the top of the inbox with its new preview (a new message un-archives it)
        setConvos((prev) => {
          const convo = prev?.find((c) => c._id === id);
          if (!convo) return prev;
          return [{ ...convo, archived: false, lastMessage: body || 'Sent a photo', lastMessageAt: data.createdAt }, ...prev.filter((c) => c !== convo)];
        });
      } catch (err) {
        setChat(id, (prev = []) => prev.filter((m) => m._id !== tempId));
        setText((current) => current || body); // give the unsent words back
        setError(errMsg(err));
      } finally {
        if (preview) URL.revokeObjectURL(preview);
      }
    });
  };

  const startEdit = (m) => {
    setEditing(m);
    setText(m.text);
    setError('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const cancelEdit = () => { setEditing(null); setText(''); };

  // Saves straight away on screen; puts the old text back if the server refuses
  const saveEdit = async () => {
    const original = editing;
    const body = text.trim();
    if (body === original.text) return cancelEdit();
    if (!body && !original.image) return setError("A message can't be empty.");
    const id = activeId;
    const isLatest = messages?.filter((m) => !m.pending).at(-1)?._id === original._id;
    setChat(id, (list = []) => list.map((m) => (m._id === original._id ? { ...m, text: body, editedAt: new Date().toISOString() } : m)));
    cancelEdit();
    setError('');
    await busy(id, async () => {
      try {
        const { data } = await api.patch(`/messages/conversations/${id}/messages/${original._id}`, { text: body });
        setChat(id, (list = []) => list.map((m) => (m._id === data._id ? data : m)));
        if (isLatest) updateConvo(id, { lastMessage: body || 'Sent a photo' });
      } catch (err) {
        setChat(id, (list = []) => list.map((m) => (m._id === original._id ? original : m)));
        setError(errMsg(err));
      }
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (editing) saveEdit();
    else send();
  };

  // ---------------------------------------------------------------- chat settings (mute, archive, delete)

  const changeSettings = async (convo, fields, doneText, undoFields) => {
    const before = { muted: convo.muted, archived: convo.archived };
    updateConvo(convo._id, fields);
    try {
      await api.patch(`/messages/conversations/${convo._id}/settings`, fields);
      flash(doneText, undoFields && (() => changeSettings({ ...convo, ...fields }, undoFields, 'Undone')));
    } catch (err) {
      updateConvo(convo._id, before);
      flash(errMsg(err));
    }
  };

  const chatActions = (convo) => [
    convo.muted
      ? { label: 'Unmute', icon: 'bell', onSelect: () => changeSettings(convo, { muted: false }, 'Chat unmuted') }
      : { label: 'Mute', icon: 'bell-slash', onSelect: () => changeSettings(convo, { muted: true }, "Muted. This chat won't light up or count as unread.") },
    convo.archived
      ? { label: 'Move to inbox', icon: 'inbox', onSelect: () => changeSettings(convo, { archived: false }, 'Moved to your inbox', { archived: true }) }
      : { label: 'Archive', icon: 'archive', onSelect: () => changeSettings(convo, { archived: true }, 'Chat archived', { archived: false }) },
    { label: 'Delete chat', icon: 'trash', danger: true, onSelect: () => setConfirm({ kind: 'chat', convo }) },
  ];

  // ---------------------------------------------------------------- single messages

  const messageActions = (m) => {
    if (m.pending) return [];
    const mine = m.sender === user._id;
    const live = !m.deletedAt;
    return [
      ...(mine && live ? [{ label: 'Edit', icon: 'pencil', onSelect: () => startEdit(m) }] : []),
      { label: 'Delete for you', icon: 'trash', danger: true, onSelect: () => setConfirm({ kind: 'me', message: m }) },
      ...(mine && live ? [{ label: 'Delete for everyone', icon: 'trash', danger: true, onSelect: () => setConfirm({ kind: 'everyone', message: m }) }] : []),
    ];
  };

  // ---------------------------------------------------------------- confirmed deletes

  // Deletes take effect on screen the moment you confirm; the server is told in the background.
  // If it refuses, whatever was removed comes back and the reason is shown.
  const runConfirmed = () => {
    const { kind, convo, message } = confirm;
    setConfirm(null);
    if (kind === 'chat') deleteChat(convo);
    else deleteMessage(message, kind === 'everyone');
  };

  const deleteChat = async (convo) => {
    const id = convo._id;
    const savedChat = chatsRef.current[id];
    removedChats.current[id] = convo.lastMessageAt;
    setConvos((prev) => prev?.filter((c) => c._id !== id));
    setChats((prev) => { const next = { ...prev }; delete next[id]; return next; });
    if (activeId === id) open(null);
    flash('Chat deleted');
    try {
      await busy(id, () => api.delete(`/messages/conversations/${id}`));
    } catch (err) {
      delete removedChats.current[id];
      setConvos((prev) => (prev && !prev.some((c) => c._id === id)
        ? [...prev, convo].sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt))
        : prev));
      if (savedChat) setChat(id, (list) => list ?? savedChat);
      flash(`Couldn't delete the chat. ${errMsg(err)}`);
    }
  };

  const deleteMessage = async (message, forEveryone) => {
    const id = activeId;
    const now = new Date().toISOString();
    setChat(id, (list = []) => (forEveryone
      ? list.map((m) => (m._id === message._id ? { ...m, text: '', image: '', deletedAt: now } : m))
      : list.filter((m) => m._id !== message._id)));
    if (editing?._id === message._id) cancelEdit();
    flash(forEveryone ? 'Message deleted for everyone' : 'Message deleted for you');
    try {
      await busy(id, async () => {
        const { data } = await api.delete(`/messages/conversations/${id}/messages/${message._id}${forEveryone ? '?for=everyone' : ''}`);
        if (forEveryone) setChat(id, (list = []) => list.map((m) => (m._id === message._id ? data : m)));
      });
    } catch (err) {
      // put the message back where it was
      setChat(id, (list = []) => {
        const rest = list.filter((m) => m._id !== message._id);
        return [...rest, message].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
      });
      flash(`Couldn't delete the message. ${errMsg(err)}`);
    }
  };

  // ---------------------------------------------------------------- what's on screen

  const other = (c) => c?.participants.find((p) => p._id !== user._id);
  const active = convos?.find((c) => c._id === activeId);
  const person = other(active);
  const firstName = person?.fullName?.split(' ')[0] || 'They';
  const status = presence(person?.lastSeenAt); // refreshed with the chat list every few seconds
  const isUnread = (c) => c.unread && c._id !== activeId;
  const archivedCount = (convos || []).filter((c) => c.archived).length;
  const inboxUnread = (convos || []).filter((c) => !c.archived && isUnread(c) && !c.muted).length;
  const term = search.trim().toLowerCase();
  const shown = (convos || []).filter((c) => (view === 'archived' ? c.archived : !c.archived) && (!term
    || other(c)?.fullName?.toLowerCase().includes(term)
    || c.listing?.title?.toLowerCase().includes(term)));
  const listing = active?.listing;

  const CONFIRM_TEXT = {
    chat: {
      title: 'Delete this chat?',
      body: `It will be removed from your messages and its history cleared for you. ${other(confirm?.convo)?.fullName?.split(' ')[0] || 'The other person'} keeps their copy. If either of you sends a new message, the chat comes back.`,
      button: 'Delete chat',
    },
    everyone: { title: 'Delete for everyone?', body: `This message will be removed for you and ${firstName}. A note saying it was deleted stays in its place.`, button: 'Delete for everyone' },
    me: { title: 'Delete for you?', body: `The message will be removed from your chat only. ${firstName} will still see it.`, button: 'Delete for you' },
  }[confirm?.kind || 'me'];

  return (
    <>
      <PageBackdrop />
      <div className={MESSAGES_CARD}>
        {/* conversation list: hidden on phones once a chat is open */}
        <section aria-label="Conversations" className={`min-h-0 flex-col border-aqua/70 bg-white md:flex md:border-r ${activeId ? 'hidden' : 'flex'}`}>
          <div className="space-y-3 border-b border-aqua/70 p-4">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-bold tracking-[-0.015em] text-ink">Messages</h1>
              {inboxUnread > 0 && <span className="chip bg-navy text-white">{inboxUnread} unread</span>}
            </div>
            {convos?.length > 0 && (
              <>
                <div className="relative">
                  <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <label htmlFor="chat-search" className="sr-only">Search conversations</label>
                  <input id="chat-search" type="search" className="input rounded-full bg-frost/70 pl-9 hover:bg-white focus:bg-white" placeholder="Search by name or uniform"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {/* Inbox / Archived switch */}
                <div className="grid grid-cols-2 rounded-xl bg-frost p-1 ring-1 ring-inset ring-aqua/70" role="group" aria-label="Show">
                  {[['inbox', 'Inbox', 'inbox'], ['archived', 'Archived', 'archive']].map(([value, label, icon]) => (
                    <button key={value} type="button" onClick={() => setView(value)} aria-pressed={view === value}
                      className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition duration-200 active:scale-[0.98] ${focusRing} ${view === value
                        ? 'bg-white text-navy shadow-sm shadow-navy/10 ring-1 ring-aqua'
                        : 'text-slate-500 hover:text-navy'}`}>
                      <Icon name={icon} className="h-4 w-4" /> {label}
                      {value === 'archived' && archivedCount > 0 && <span className="text-xs font-medium text-slate-500">({archivedCount})</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
            {convos === null ? <ConversationListSkeleton /> : convos.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center animate-fade-up">
                <span className="icon-tile h-12 w-12"><Icon name="chat" className="h-6 w-6" /></span>
                <div>
                  <p className="font-semibold text-ink">No conversations yet</p>
                  <p className="mt-1 text-sm text-slate-600">Open any listing and tap “Message seller” to ask a question.</p>
                </div>
                <Link to="/browse" className="btn-primary btn-sm group/cta">
                  Browse uniforms <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5" />
                </Link>
              </div>
            ) : shown.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-slate-600 animate-fade-up">
                <span className="icon-tile h-10 w-10"><Icon name={view === 'archived' ? 'archive' : 'inbox'} className="h-5 w-5" /></span>
                {term
                  ? <p>No chats match “{search.trim()}”.</p>
                  : view === 'archived'
                    ? <p>No archived chats. Archive a chat to tidy your inbox without deleting it.</p>
                    : <p>Your inbox is empty. {archivedCount} archived {archivedCount === 1 ? 'chat' : 'chats'}.</p>}
              </div>
            ) : (
              <ul className="space-y-1 p-2">
                {shown.map((c) => (
                  <ConversationRow key={c._id} convo={c} person={other(c)} active={c._id === activeId} unread={isUnread(c)}
                    actions={chatActions(c)} onOpen={() => open(c._id)} />
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* chat pane */}
        <section aria-label={person ? `Chat with ${person.fullName}` : 'Chat'}
          className={`relative min-h-0 flex-col md:flex ${activeId ? 'flex' : 'hidden'}`}>
          <ChatBackground />

          {!activeId || (convos && !active) ? (
            <PaneMessage title={activeId ? 'Conversation not found' : convos?.length ? 'Pick a conversation' : 'Your messages live here'}>
              {activeId
                ? <>It may have been deleted. <button type="button" onClick={() => open(null)} className="font-semibold text-navy hover:underline">Back to all chats</button></>
                : convos?.length
                  ? 'Choose a chat on the left to read and reply.'
                  : 'When you message a seller, the conversation shows up here.'}
            </PaneMessage>
          ) : (
            <>
              <header className="relative flex items-center gap-2 border-b border-aqua/70 bg-white/85 px-2 py-2.5 backdrop-blur sm:gap-3 sm:px-4 sm:py-3">
                <button type="button" onClick={() => open(null)} aria-label="Back to conversations"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-navy transition hover:bg-frost active:scale-95 md:hidden ${focusRing}`}>
                  <Icon name="arrow-left" className="h-5 w-5" />
                </button>
                {!active ? <ChatHeaderSkeleton /> : <>
                  <span className="relative shrink-0">
                    <Avatar name={person?.fullName} src={person?.avatar} className="h-10 w-10 text-sm" />
                    <PresenceDot {...status} className="bottom-0 right-0 h-3 w-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex min-w-0 items-center gap-1.5 font-semibold text-ink">
                      <span className="truncate">{person?.fullName}</span>
                      {active.muted && <span title="Muted" className="text-slate-400"><Icon name="bell-slash" className="h-4 w-4" /><span className="sr-only">Muted</span></span>}
                    </p>
                    <p className={`text-xs ${status.online ? 'font-medium text-green-700' : 'text-slate-500'}`}>{status.label}</p>
                  </div>
                  {/* the uniform this chat is about, as an icon button (its name shows on hover) */}
                  {listing && (
                    <Link to={`/listings/${listing._id}`} aria-label={`View listing: ${listing.title}`} title={`View listing: ${listing.title}`}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition duration-200 hover:bg-frost hover:text-navy active:scale-90 ${focusRing}`}>
                      <Icon name="tag" className="h-5 w-5" />
                    </Link>
                  )}
                  <ActionMenu label="Chat options" items={chatActions(active)} buttonClassName="h-10 w-10 text-slate-600 hover:bg-frost hover:text-navy" />
                </>}
              </header>

              <div ref={listRef} role="log" aria-live="polite" aria-label="Messages" className="scroll-thin relative min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
                {messages === undefined ? <ChatBubblesSkeleton /> : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center animate-fade-up">
                    <Avatar name={person?.fullName} src={person?.avatar} className="h-14 w-14 text-lg ring-4 ring-white" />
                    <div>
                      <p className="font-semibold text-ink">Say hi to {person?.fullName?.split(' ')[0] || 'them'}</p>
                      <p className="mt-1 text-sm text-slate-600">{listing ? `Ask about the ${listing.title}.` : 'Start the conversation.'}</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {QUICK_REPLIES.map((q) => (
                        <button key={q} type="button" onClick={() => { setText(q); inputRef.current?.focus(); }}
                          className="choice bg-white/90 py-1.5 text-xs">{q}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  buildRows(messages).map((row) => (row.day ? (
                    <div key={row.key} className="my-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 first:mt-0">
                      <span className="h-px flex-1 bg-aqua" /><span>{row.day}</span><span className="h-px flex-1 bg-aqua" />
                    </div>
                  ) : (
                    <Bubble key={row.key} m={row.m} mine={row.m.sender === user._id} person={person} first={row.first} last={row.last}
                      editing={editing?._id === row.m._id} actions={messageActions(row.m)} onImageLoad={keepAtBottom} />
                  )))
                )}
              </div>

              {error && <p role="alert" className="relative mx-3 mb-1 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-inset ring-red-200 sm:mx-4">{error}</p>}

              {editing && (
                <div className="relative flex animate-fade-up items-center gap-2 border-t border-aqua/70 bg-frost/90 py-1.5 pl-4 pr-2 text-xs text-navy backdrop-blur">
                  <Icon name="pencil" className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1"><b>Editing message</b> <span className="text-slate-500">· Esc to cancel</span></span>
                  <button type="button" onClick={cancelEdit} className={`rounded-full px-3 py-1 font-semibold transition hover:bg-white ${focusRing}`}>Cancel</button>
                </div>
              )}

              <form onSubmit={submit} className={`relative flex items-center gap-2 bg-white/90 p-2 backdrop-blur sm:p-3 ${editing ? '' : 'border-t border-aqua/70'}`}>
                {!editing && (
                  <label title="Attach a photo"
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-600 transition duration-200 hover:bg-frost hover:text-navy active:scale-95 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy">
                    <Icon name="photo" className="h-5 w-5" />
                    <span className="sr-only">Attach a photo</span>
                    <input type="file" accept="image/*" className="sr-only"
                      onChange={(e) => { const file = e.target.files[0]; e.target.value = ''; if (file) send(file); }} />
                  </label>
                )}
                <label htmlFor="chat-input" className="sr-only">{editing ? 'Edit message' : 'Message'}</label>
                <input id="chat-input" ref={inputRef} autoComplete="off" maxLength={2000} className="input h-11 rounded-full px-4"
                  placeholder={editing ? 'Edit your message…' : 'Write a message…'} value={text} onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape' && editing) { e.preventDefault(); cancelEdit(); } }} />
                <button type="submit" aria-label={editing ? 'Save changes' : 'Send message'} title={editing ? 'Save changes' : 'Send'}
                  disabled={!text.trim() && !(editing && editing.image)}
                  className="btn-primary group/send h-11 w-11 shrink-0 rounded-full p-0">
                  <Icon name={editing ? 'check' : 'send'} strokeWidth={editing ? 2.2 : 1.5}
                    className={`h-5 w-5 transition-transform duration-200 ${editing ? 'group-hover/send:scale-110' : 'group-hover/send:-translate-y-0.5 group-hover/send:translate-x-0.5'}`} />
                </button>
              </form>
            </>
          )}
        </section>
      </div>

      <ConfirmDialog open={Boolean(confirm)} title={CONFIRM_TEXT.title} confirmLabel={CONFIRM_TEXT.button}
        onConfirm={runConfirmed} onClose={() => setConfirm(null)}>
        {CONFIRM_TEXT.body}
      </ConfirmDialog>

      <Toast notice={notice} onDismiss={() => setNotice(null)}
        onUndo={() => { const undo = notice?.undo; setNotice(null); undo?.(); }} />
    </>
  );
}
