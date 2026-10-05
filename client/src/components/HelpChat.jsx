import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FAQ_BY_ID, START_SUGGESTIONS, answerFor, reply } from '../helpFaq.js';
import Icon from './Icon.jsx';
import { LogoMark } from './Logo.jsx';

// The floating button would cover the message composer on the chat page
export const showsHelpChat = (pathname) => !pathname.startsWith('/messages');

const REPLY_DELAY = 450; // short pause so answers read as a reply, not a page swap

// Floating help assistant: answers common questions from helpFaq.js. Runs entirely in the browser (no API calls).
export default function HelpChat() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { id, from: 'bot' | 'user', text, link?, suggestions? }
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const panelId = useId();
  const titleId = useId();
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const timerRef = useRef(null);
  const nextId = useRef(1);

  // Greet the first time the panel opens
  useEffect(() => {
    if (!open || messages.length) return;
    const name = user?.fullName?.split(' ')[0];
    setMessages([{
      id: 0,
      from: 'bot',
      text: `Hi${name ? ` ${name}` : ''}! I can answer common questions about buying, selling and swapping uniforms. Pick a topic or type your question.`,
      suggestions: START_SUGGESTIONS,
    }]);
  }, [open, messages.length, user]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => setOpen(false), [pathname]); // following an answer's link closes the panel

  // Braces matter: newer browsers return a Promise from scrollIntoView, which React would call as a cleanup and crash
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, typing]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  // A topic chip passes its FAQ id so the exact answer is used; typed text goes through the matcher
  const ask = (question, faqId) => {
    const q = question.trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { id: nextId.current++, from: 'user', text: q }]);
    setText('');
    setTyping(true);
    timerRef.current = setTimeout(() => {
      setMessages((m) => [...m, { id: nextId.current++, from: 'bot', ...(faqId ? answerFor(faqId) : reply(q)) }]);
      setTyping(false);
    }, REPLY_DELAY);
  };

  if (!showsHelpChat(pathname)) return null;

  const last = messages[messages.length - 1];

  return (
    <>
      {open && (
        <section id={panelId} role="dialog" aria-labelledby={titleId}
          onKeyDown={(e) => e.key === 'Escape' && close()}
          className="fixed inset-x-3 bottom-[calc(9.5rem+env(safe-area-inset-bottom))] top-24 z-40 flex animate-fade-up flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-navy/20 ring-1 ring-aqua sm:inset-x-auto sm:right-4 sm:top-auto sm:h-[34rem] sm:max-h-[calc(100dvh-12rem)] sm:w-[23rem] md:bottom-24 md:right-6">
          <header className="flex items-center gap-3 border-b border-aqua/70 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-frost">
              <LogoMark className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-sm font-bold text-ink">Help assistant</h2>
              <p className="text-xs text-slate-500">Quick answers to common questions</p>
            </div>
            <button type="button" onClick={close} aria-label="Close help"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-frost hover:text-navy focus-visible:outline-2 focus-visible:outline-navy">
              <Icon name="x" className="h-5 w-5" />
            </button>
          </header>

          <div role="log" aria-live="polite" className="scroll-thin flex-1 space-y-3 overflow-y-auto bg-mist px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : ''}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.from === 'user'
                  ? 'rounded-br-md bg-navy text-white'
                  : 'rounded-bl-md bg-white text-ink shadow-sm ring-1 ring-aqua/80'}`}>
                  {m.from === 'user' && <span className="sr-only">You: </span>}
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.link && (
                    <Link to={m.link.to} onClick={() => setOpen(false)} className="mt-2 inline-flex items-center gap-1 font-semibold text-navy underline-offset-2 hover:underline">
                      {m.link.label} <Icon name="arrow-right" className="h-3.5 w-3.5" strokeWidth={2} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex" aria-label="Assistant is typing">
                <span className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm ring-1 ring-aqua/80">
                  {[0, 150, 300].map((d) => <span key={d} className="h-1.5 w-1.5 animate-pulse rounded-full bg-denim" style={{ animationDelay: `${d}ms` }} />)}
                </span>
              </div>
            )}
            {/* topic chips only under the latest answer, to keep the thread tidy */}
            {!typing && last?.from === 'bot' && last.suggestions?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {last.suggestions.map((id) => (
                  <button key={id} type="button" onClick={() => ask(FAQ_BY_ID[id].question, id)}
                    className="rounded-full bg-white px-3 py-1.5 text-left text-xs font-semibold text-navy ring-1 ring-inset ring-powder transition hover:bg-frost hover:ring-denim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy">
                    {FAQ_BY_ID[id].question}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="flex items-center gap-2 border-t border-aqua/70 p-3">
            <label htmlFor={`${panelId}-input`} className="sr-only">Type your question</label>
            <input id={`${panelId}-input`} ref={inputRef} className="input" placeholder="Type your question…" autoComplete="off"
              maxLength={200} value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn-primary shrink-0 px-3" disabled={!text.trim() || typing} aria-label="Send question">
              <Icon name="send" className="h-5 w-5" />
            </button>
          </form>
        </section>
      )}

      {/* Logo-only launcher with no backing circle; the accessible name says what it does since there is no visible text.
          The logo bobs gently above a soft white aura that slowly breathes. */}
      <button ref={launcherRef} type="button" onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open} aria-controls={open ? panelId : undefined} aria-label={open ? 'Close help assistant' : 'Open help assistant'}
        className="group fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full transition duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy md:bottom-6 md:right-6 md:h-16 md:w-16">
        <span className="absolute -inset-2 animate-breathe rounded-full bg-white/70 blur-[2px] transition-colors duration-300 group-hover:bg-white/90" aria-hidden="true" />
        <span className="relative animate-float drop-shadow-[0_6px_10px_rgb(16_46_74/0.25)] [animation-duration:6s]">
          {open
            ? <Icon name="x" className="h-8 w-8 text-navy" strokeWidth={2.2} />
            : <LogoMark className="h-12 w-12 md:h-14 md:w-14" />}
        </span>
      </button>
    </>
  );
}
