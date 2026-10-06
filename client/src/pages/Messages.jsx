import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/Icon.jsx';
import Avatar from '../components/Avatar.jsx';
import PageBackdrop from '../components/PageBackdrop.jsx';
import PresenceDot from '../components/PresenceDot.jsx';
import { presence } from '../constants.js';
import { Spinner } from '../components/Loader.jsx';
import shrinkImage from '../shrinkImage.js';

const POLL_MS = 3000;
const GROUP_MS = 5 * 60 * 1000; // messages from one person less than 5 minutes apart sit together
const QUICK_REPLIES = ['Hi! Is this still available?', 'Can we meet on campus?', 'Could you send more photos?'];
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy';

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

// Soft glows and the moving pinstripe behind the chat pane (styles: .chat-bg in index.css)
function ChatBackground() {
  return (
    <div className="chat-bg" aria-hidden="true">
      <span className="chat-bg-glow chat-bg-glow-1" />
      <span className="chat-bg-glow chat-bg-glow-2" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-1 p-2" role="status" aria-label="Loading conversations">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="skeleton h-11 w-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2"><div className="skeleton h-3.5 w-2/3" /><div className="skeleton h-3 w-11/12" /></div>
        </div>
      ))}
    </div>
  );
}

// Placeholder chat while its messages load: bubbles on both sides, like a real conversation
const BUBBLE_SKELETON = [['in', 'w-44'], ['in', 'w-60'], ['out', 'w-52'], ['in', 'w-36'], ['out', 'w-64'], ['out', 'w-40'], ['in', 'w-56']];
function MessagesSkeleton() {
  return (
    <div className="flex min-h-full flex-col justify-end gap-2.5" role="status" aria-label="Loading messages">
      {BUBBLE_SKELETON.map(([side, width], i) => (
        <div key={i} className={`flex items-end gap-2 ${side === 'out' ? 'justify-end' : ''}`}>
          {side === 'in' && <div className="skeleton h-7 w-7 shrink-0 rounded-full" />}
          <div className={`skeleton h-9 max-w-[70%] rounded-2xl ${width}`} />
        </div>
      ))}
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex flex-1 items-center gap-3" aria-hidden="true">
      <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-1.5"><div className="skeleton h-3.5 w-36" /><div className="skeleton h-3 w-24" /></div>
    </div>
  );
}

function ConversationRow({ convo, person, active, onOpen }) {
  const thumb = convo.listing?.images?.[0];
  return (
    <li>
      <button type="button" onClick={onOpen} aria-current={active ? 'true' : undefined}
        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition duration-200 active:scale-[0.99] ${focusRing} ${active
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
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold">{person?.fullName || 'Student'}</span>
            <span className={`shrink-0 text-[11px] ${active ? 'text-cream' : 'text-slate-500'}`}>{listTime(convo.lastMessageAt)}</span>
          </span>
          {convo.listing?.title && (
            <span className={`block truncate text-xs font-medium ${active ? 'text-cream' : 'text-navy'}`}>{convo.listing.title}</span>
          )}
          <span className={`block truncate text-xs ${active ? 'text-white/80' : 'text-slate-500'} ${convo.lastMessage ? '' : 'italic'}`}>
            {convo.lastMessage || 'No messages yet'}
          </span>
        </span>
      </button>
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

function Bubble({ m, mine, person, first, last, onImageLoad }) {
  const corner = mine ? (last ? 'rounded-br-md' : '') : (last ? 'rounded-bl-md' : '');
  return (
    <div className={`flex animate-fade-up items-end gap-2 ${mine ? 'justify-end' : ''} ${first ? 'mt-3' : 'mt-0.5'}`}>
      {/* their avatar sits beside the last bubble of a run; an empty slot keeps the others aligned */}
      {!mine && (last
        ? <Avatar name={person?.fullName} src={person?.avatar} className="h-7 w-7 text-[11px]" />
        : <span className="w-7 shrink-0" />)}
      <div className={`flex max-w-[80%] flex-col sm:max-w-[65%] ${mine ? 'items-end' : 'items-start'}`}>
        <div title={m.pending ? 'Sending…' : clock(m.createdAt)}
          className={`break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm transition duration-200 hover:shadow-md ${corner} ${m.pending ? 'opacity-70' : ''} ${mine
            ? 'bg-navy text-white shadow-navy/20'
            : 'bg-white text-ink ring-1 ring-aqua'}`}>
          {m.image && m.pending && (
            <img src={m.image} alt="Photo being sent" onLoad={onImageLoad} className={`-mx-1.5 mb-1 block max-h-60 w-auto rounded-xl ${m.text ? '' : '-mb-0.5'}`} />
          )}
          {m.image && !m.pending && (
            <a href={m.image} target="_blank" rel="noopener noreferrer" aria-label="Open photo in a new tab"
              className={`-mx-1.5 mb-1 block overflow-hidden rounded-xl ${m.text ? '' : '-mb-0.5'} ${focusRing}`}>
              <ChatPhoto src={m.image} onLoad={onImageLoad} />
            </a>
          )}
          {m.text && <p className="whitespace-pre-line">{m.text}</p>}
        </div>
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

export default function Messages() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const activeId = params.get('c'); // the open chat lives in the URL (?c=<id>), so links and the back button work
  const [convos, setConvos] = useState(null); // null while loading
  // Messages for every chat opened so far ({ [conversationId]: [...] }), so going back to a chat is instant.
  // A chat that isn't in here yet is still loading.
  const [chats, setChats] = useState({});
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const scrolled = useRef({ id: null, count: 0 });
  const sendingTo = useRef({}); // { [conversationId]: sends in flight }: polls wait, so a message being sent never flickers
  const messages = activeId ? chats[activeId] : undefined;

  const setChat = (id, update) => setChats((prev) => ({ ...prev, [id]: update(prev[id]) }));
  const open = (id) => setParams(id ? { c: id } : {});

  // Serverless hosting (Vercel) can't hold open sockets, so new messages arrive by polling (paused while the tab is hidden)
  useEffect(() => {
    const load = () => api.get('/messages/conversations').then((r) => setConvos(r.data)).catch(() => setConvos((prev) => prev ?? []));
    load();
    const timer = setInterval(() => { if (!document.hidden) load(); }, POLL_MS * 3);
    return () => clearInterval(timer);
  }, []);

  // Open a conversation: load its history (a chat opened before shows straight away), then keep checking for new messages
  useEffect(() => {
    if (!activeId) return undefined;
    setError('');
    let alive = true;
    let first = true;
    const load = () => {
      if (sendingTo.current[activeId]) return;
      api.get(`/messages/conversations/${activeId}/messages`)
        .then((r) => {
          if (!alive || sendingTo.current[activeId]) return;
          setChat(activeId, (prev) => {
            const saved = (prev || []).filter((m) => !m.pending);
            // same messages as before: keep the old array so the list doesn't re-render every poll
            if (prev && saved.length === r.data.length && saved.at(-1)?._id === r.data.at(-1)?._id) return prev;
            return [...r.data, ...(prev || []).filter((m) => m.pending)];
          });
        })
        .catch((e) => {
          if (!alive || !first) return;
          setError(errMsg(e));
          setChat(activeId, (prev) => prev ?? []);
        })
        .finally(() => { first = false; });
    };
    load();
    const timer = setInterval(() => { if (!document.hidden) load(); }, POLL_MS);
    return () => { alive = false; clearInterval(timer); };
  }, [activeId]);

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

  // A photo that finishes loading makes the chat taller: stay pinned to the bottom if the reader was already there
  const keepAtBottom = () => {
    const el = listRef.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 320) el.scrollTo({ top: el.scrollHeight });
  };

  // The message shows in the chat at once (faded, "Sending…") and is swapped for the saved one when the server replies
  const send = async (e, file) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body && !file) return;
    const id = activeId;
    const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const preview = file ? URL.createObjectURL(file) : '';
    setChat(id, (prev) => [...(prev || []),
      { _id: tempId, pending: true, sender: user._id, text: body, image: preview, createdAt: new Date().toISOString() }]);
    setText('');
    setError('');
    sendingTo.current[id] = (sendingTo.current[id] || 0) + 1;
    try {
      const form = new FormData();
      form.append('text', body);
      if (file) form.append('photo', await shrinkImage(file));
      const { data } = await api.post(`/messages/conversations/${id}/messages`, form);
      setChat(id, (prev = []) => {
        const rest = prev.filter((m) => m._id !== tempId);
        return rest.some((m) => m._id === data._id) ? rest : [...rest, data];
      });
      // move this chat to the top of the list with its new preview
      setConvos((prev) => {
        const convo = prev?.find((c) => c._id === id);
        if (!convo) return prev;
        return [{ ...convo, lastMessage: body || 'Sent a photo', lastMessageAt: data.createdAt }, ...prev.filter((c) => c !== convo)];
      });
    } catch (err) {
      setChat(id, (prev = []) => prev.filter((m) => m._id !== tempId));
      setText((current) => current || body); // give the unsent words back
      setError(errMsg(err));
    } finally {
      sendingTo.current[id] -= 1;
      if (preview) URL.revokeObjectURL(preview);
    }
  };

  const other = (c) => c?.participants.find((p) => p._id !== user._id);
  const active = convos?.find((c) => c._id === activeId);
  const person = other(active);
  const status = presence(person?.lastSeenAt); // refreshed with the chat list every few seconds
  const term = search.trim().toLowerCase();
  const shown = (convos || []).filter((c) => !term
    || other(c)?.fullName?.toLowerCase().includes(term)
    || c.listing?.title?.toLowerCase().includes(term));

  return (
    <>
      <PageBackdrop />
      <div className="card -mx-4 grid h-[calc(100dvh-11.4rem-env(safe-area-inset-bottom))] overflow-hidden rounded-none border-x-0 sm:mx-0 sm:rounded-3xl sm:border-x md:h-[min(calc(100dvh-12.5rem),52rem)] md:min-h-[30rem] md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr]">
        {/* conversation list: hidden on phones once a chat is open */}
        <section aria-label="Conversations" className={`min-h-0 flex-col border-aqua/70 bg-white md:flex md:border-r ${activeId ? 'hidden' : 'flex'}`}>
          <div className="space-y-3 border-b border-aqua/70 p-4">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-bold tracking-[-0.015em] text-ink">Messages</h1>
              {convos?.length > 0 && <span className="chip bg-frost text-navy ring-1 ring-inset ring-aqua">{convos.length}</span>}
            </div>
            {convos?.length > 0 && (
              <div className="relative">
                <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <label htmlFor="chat-search" className="sr-only">Search conversations</label>
                <input id="chat-search" type="search" className="input rounded-full bg-frost/70 pl-9 hover:bg-white focus:bg-white" placeholder="Search by name or uniform"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            )}
          </div>

          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
            {convos === null ? <ListSkeleton /> : convos.length === 0 ? (
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
              <p className="px-6 py-10 text-center text-sm text-slate-600">No chats match “{search.trim()}”.</p>
            ) : (
              <ul className="space-y-1 p-2">
                {shown.map((c) => (
                  <ConversationRow key={c._id} convo={c} person={other(c)} active={c._id === activeId} onOpen={() => open(c._id)} />
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
                ? <>It may have been removed. <button type="button" onClick={() => open(null)} className="font-semibold text-navy hover:underline">Back to all chats</button></>
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
                {!active ? <HeaderSkeleton /> : <>
                <span className="relative shrink-0">
                  <Avatar name={person?.fullName} src={person?.avatar} className="h-10 w-10 text-sm" />
                  <PresenceDot {...status} className="bottom-0 right-0 h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{person?.fullName}</p>
                  {/* status in words; on phones the uniform's link shares this line */}
                  <p className="flex min-w-0 items-center gap-1.5 text-xs">
                    <span className={`shrink-0 ${status.online ? 'font-medium text-green-700' : 'text-slate-500'}`}>{status.label}</span>
                    {active?.listing && (<>
                      <span className="text-slate-300 sm:hidden" aria-hidden="true">·</span>
                      <Link to={`/listings/${active.listing._id}`} className="truncate font-medium text-navy hover:underline sm:hidden">
                        {active.listing.title}
                      </Link>
                    </>)}
                  </p>
                </div>
                {active?.listing && (
                  <Link to={`/listings/${active.listing._id}`}
                    className={`group/listing hidden max-w-[16rem] shrink-0 items-center gap-2 rounded-xl bg-white py-1.5 pl-1.5 pr-3 ring-1 ring-inset ring-aqua transition duration-200 hover:bg-frost hover:shadow-sm hover:ring-denim/40 active:scale-[0.98] sm:flex ${focusRing}`}>
                    {active.listing.images?.[0]
                      ? <img src={active.listing.images[0]} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                      : <span className="icon-tile h-8 w-8 rounded-lg"><Icon name="photo" className="h-4 w-4" /></span>}
                    <span className="min-w-0">
                      <span className="block text-[11px] text-slate-500">About</span>
                      <span className="block truncate text-xs font-semibold text-navy">{active.listing.title}</span>
                    </span>
                    <Icon name="arrow-right" className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover/listing:translate-x-0.5 group-hover/listing:text-navy" />
                  </Link>
                )}
                </>}
              </header>

              <div ref={listRef} role="log" aria-live="polite" aria-label="Messages" className="scroll-thin relative min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
                {messages === undefined ? <MessagesSkeleton /> : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center animate-fade-up">
                    <Avatar name={person?.fullName} src={person?.avatar} className="h-14 w-14 text-lg ring-4 ring-white" />
                    <div>
                      <p className="font-semibold text-ink">Say hi to {person?.fullName?.split(' ')[0] || 'them'}</p>
                      <p className="mt-1 text-sm text-slate-600">{active?.listing ? `Ask about the ${active.listing.title}.` : 'Start the conversation.'}</p>
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
                    <Bubble key={row.key} m={row.m} mine={row.m.sender === user._id} person={person} first={row.first} last={row.last} onImageLoad={keepAtBottom} />
                  )))
                )}
              </div>

              {error && <p role="alert" className="relative mx-3 mb-1 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-inset ring-red-200 sm:mx-4">{error}</p>}

              <form onSubmit={send} className="relative flex items-center gap-2 border-t border-aqua/70 bg-white/90 p-2 backdrop-blur sm:p-3">
                <label title="Attach a photo"
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-600 transition duration-200 hover:bg-frost hover:text-navy active:scale-95 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy">
                  <Icon name="photo" className="h-5 w-5" />
                  <span className="sr-only">Attach a photo</span>
                  <input type="file" accept="image/*" className="sr-only"
                    onChange={(e) => { const file = e.target.files[0]; e.target.value = ''; if (file) send(null, file); }} />
                </label>
                <label htmlFor="chat-input" className="sr-only">Message</label>
                <input id="chat-input" ref={inputRef} autoComplete="off" maxLength={2000} className="input h-11 rounded-full px-4"
                  placeholder="Write a message…" value={text} onChange={(e) => setText(e.target.value)} />
                <button type="submit" aria-label="Send message" disabled={!text.trim()}
                  className="btn-primary group/send h-11 w-11 shrink-0 rounded-full p-0">
                  <Icon name="send" className="h-5 w-5 transition-transform duration-200 group-hover/send:-translate-y-0.5 group-hover/send:translate-x-0.5" />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </>
  );
}
