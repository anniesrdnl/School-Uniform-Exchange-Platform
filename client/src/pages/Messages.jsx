import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/Icon.jsx';
import Avatar from '../components/Avatar.jsx';
import shrinkImage from '../shrinkImage.js';

const POLL_MS = 3000;

export default function Messages() {
  const { user } = useAuth();
  const [convos, setConvos] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  // Serverless hosting (Vercel) can't hold open sockets, so new messages arrive by polling.
  useEffect(() => {
    const load = () => api.get('/messages/conversations').then((r) => setConvos(r.data)).catch(() => {});
    load();
    const timer = setInterval(load, POLL_MS * 3);
    return () => clearInterval(timer);
  }, []);

  // open a conversation: load its history, then keep checking for new messages
  useEffect(() => {
    if (!activeId) return;
    setMessages([]);
    const load = () => api.get(`/messages/conversations/${activeId}/messages`)
      .then((r) => setMessages((prev) => (r.data.length === prev.length ? prev : r.data))).catch(() => {});
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [activeId]);

  // Braces matter: newer browsers return a Promise from scrollIntoView, and React
  // would try to call that Promise as the effect's cleanup and crash.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = async (e, file) => {
    e?.preventDefault();
    if (!text.trim() && !file) return;
    try {
      const body = new FormData();
      body.append('text', text);
      if (file) body.append('photo', await shrinkImage(file));
      const { data } = await api.post(`/messages/conversations/${activeId}/messages`, body);
      setMessages((prev) => (prev.some((m) => m._id === data._id) ? prev : [...prev, data]));
      setText('');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const other = (c) => c.participants.find((p) => p._id !== user._id);
  const active = convos.find((c) => c._id === activeId);

  return (
    <div className="card -mx-4 grid h-[calc(100dvh-11rem-env(safe-area-inset-bottom))] overflow-hidden rounded-none border-x-0 sm:mx-0 sm:rounded-2xl sm:border-x md:h-[72vh] md:grid-cols-[300px_1fr]">
      {/* list: hidden on phones once a chat is open */}
      <div className={`scroll-thin overflow-y-auto border-aqua/70 md:border-r ${activeId ? 'hidden md:block' : ''}`}>
        <h1 className="sticky top-0 border-b border-aqua/70 bg-white p-4 text-lg font-bold">Messages</h1>
        {convos.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aqua text-navy"><Icon name="chat" className="h-6 w-6" /></span>
            <p className="text-sm text-slate-600">No conversations yet. Message a seller from any listing.</p>
          </div>
        )}
        {convos.map((c) => {
          const person = other(c);
          return (
            <button key={c._id} onClick={() => setActiveId(c._id)} aria-current={c._id === activeId ? 'true' : undefined}
              className={`flex w-full items-center gap-3 border-b border-l-4 border-b-aqua/40 px-4 py-3 text-left transition duration-200 hover:bg-frost ${c._id === activeId ? 'border-l-navy bg-frost' : 'border-l-transparent'}`}>
              <Avatar name={person?.fullName} src={person?.avatar} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{person?.fullName}</span>
                {c.listing?.title && <span className="block truncate text-xs font-medium text-navy">{c.listing.title}</span>}
                <span className="block truncate text-xs text-slate-500">{c.lastMessage}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className={`flex min-h-0 flex-col ${activeId ? '' : 'hidden md:flex'}`}>
        {!activeId ? (
          <div className="m-auto flex flex-col items-center gap-2 p-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-frost text-navy"><Icon name="chat" className="h-6 w-6" /></span>
            <p className="text-sm text-slate-600">Pick a conversation to start chatting.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-aqua/70 px-2 py-2 sm:gap-3 sm:px-4 sm:py-3">
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-navy hover:bg-frost md:hidden" onClick={() => setActiveId(null)} aria-label="Back to conversations">
                <Icon name="arrow-left" className="h-5 w-5" />
              </button>
              <Avatar name={other(active)?.fullName} src={other(active)?.avatar} className="h-9 w-9 text-sm" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{other(active)?.fullName}</p>
                {active?.listing && (
                  <Link to={`/listings/${active.listing._id}`} className="block truncate text-xs font-medium text-navy hover:underline">{active.listing.title}</Link>
                )}
              </div>
            </div>
            <div className="scroll-thin flex-1 space-y-2 overflow-y-auto bg-frost/50 p-4">
              {messages.map((m) => {
                const mine = m.sender === user._id;
                return (
                  <div key={m._id} className={`flex animate-fade-up ${mine ? 'justify-end' : ''}`}>
                    <div className={`max-w-[85%] break-words rounded-2xl px-3.5 py-2 text-sm shadow-sm sm:max-w-[70%] ${mine ? 'rounded-br-md bg-navy text-white' : 'rounded-bl-md bg-white ring-1 ring-aqua'}`}>
                      {m.image && <img src={m.image} alt="Shared photo" className="mb-1 max-h-48 rounded-lg" />}
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            {error && <p role="alert" className="px-4 pt-2 text-xs text-red-600">{error}</p>}
            <form onSubmit={send} className="flex items-center gap-2 border-t border-aqua/70 p-2 sm:p-3">
              <label className="btn-soft shrink-0 cursor-pointer px-3 focus-within:ring-4 focus-within:ring-powder/60">
                <Icon name="photo" className="h-5 w-5" />
                <span className="sr-only">Attach photo</span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files[0] && send(null, e.target.files[0])} />
              </label>
              <label htmlFor="chat-input" className="sr-only">Message</label>
              <input id="chat-input" className="input" placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} />
              <button className="btn-primary shrink-0 px-3 sm:px-4" aria-label="Send">
                <Icon name="send" className="h-5 w-5" /><span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
