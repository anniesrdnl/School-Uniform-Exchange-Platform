import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Messages() {
  const { user } = useAuth();
  const [convos, setConvos] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // one socket connection for the whole page
  useEffect(() => {
    const socket = io({ auth: { token: localStorage.getItem('token') } });
    socketRef.current = socket;
    socket.on('message:new', (msg) => {
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    api.get('/messages/conversations').then((r) => setConvos(r.data));
  }, []);

  // open a conversation: join its room + load history
  useEffect(() => {
    if (!activeId) return;
    socketRef.current?.emit('conversation:join', activeId);
    api.get(`/messages/conversations/${activeId}/messages`).then((r) => setMessages(r.data));
  }, [activeId]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const send = async (e, file) => {
    e?.preventDefault();
    if (!text.trim() && !file) return;
    try {
      const body = new FormData();
      body.append('text', text);
      if (file) body.append('photo', file);
      await api.post(`/messages/conversations/${activeId}/messages`, body);
      setText('');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const other = (c) => c.participants.find((p) => p._id !== user._id);
  const active = convos.find((c) => c._id === activeId);

  return (
    <div className="card grid h-[70vh] overflow-hidden md:grid-cols-[280px_1fr]">
      {/* list: hidden on phones once a chat is open */}
      <div className={`scroll-thin overflow-y-auto border-slate-200 md:border-r ${activeId ? 'hidden md:block' : ''}`}>
        <h1 className="border-b border-slate-200 p-4 font-bold">Messages</h1>
        {convos.length === 0 && <p className="p-4 text-sm text-slate-500">No conversations yet. Message a seller from a listing.</p>}
        {convos.map((c) => (
          <button key={c._id} onClick={() => setActiveId(c._id)}
            className={`block w-full border-b border-l-4 border-b-slate-100 p-4 text-left transition duration-200 hover:bg-sky ${c._id === activeId ? 'border-l-navy bg-sky' : 'border-l-transparent'}`}>
            <p className="text-sm font-semibold">{other(c)?.fullName}</p>
            <p className="truncate text-xs text-slate-500">{c.listing?.title}</p>
            <p className="truncate text-xs text-slate-400">{c.lastMessage}</p>
          </button>
        ))}
      </div>

      <div className={`flex min-h-0 flex-col ${activeId ? '' : 'hidden md:flex'}`}>
        {!activeId ? (
          <p className="m-auto text-sm text-slate-500">Pick a conversation to start chatting.</p>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-slate-200 p-4">
              <button className="text-sm text-navy md:hidden" onClick={() => setActiveId(null)}>Back</button>
              <p className="font-semibold">{other(active)?.fullName}</p>
            </div>
            <div className="scroll-thin flex-1 space-y-2 overflow-y-auto bg-mist p-4">
              {messages.map((m) => {
                const mine = m.sender === user._id;
                return (
                  <div key={m._id} className={`flex animate-fade-up ${mine ? 'justify-end' : ''}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${mine ? 'rounded-br-md bg-navy text-white' : 'rounded-bl-md bg-white border border-slate-200'}`}>
                      {m.image && <img src={m.image} alt="Shared" className="mb-1 max-h-48 rounded-lg" />}
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            {error && <p role="alert" className="px-4 text-xs text-red-600">{error}</p>}
            <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-200 p-3">
              <label className="btn-outline cursor-pointer !px-3" aria-label="Attach photo">
                Photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && send(null, e.target.files[0])} />
              </label>
              <input className="input" placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} />
              <button className="btn-primary">Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
