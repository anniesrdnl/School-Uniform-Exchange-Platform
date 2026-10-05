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

  // "Ask our assistant" in the header strip opens the panel
  useEffect(() => {
    const openHelp = () => setOpen(true);
    window.addEventListener('sueps:open-help', openHelp);
    return () => window.removeEventListener('sueps:open-help', openHelp);
  }, []);

  // Braces matter: newer browsers return a Promise from scrollIntoView, which React would call as a cleanup and crash
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, typing]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const close = () => {
    setOpen(false);
    // next frame: on short screens the launcher is hidden while the panel is open, so it must reappear first
    requestAnimationFrame(() => launcherRef.current?.focus());
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
          className="fixed inset-x-3 bottom-[calc(8.5rem+env(safe-area-inset-bottom))] top-20 z-40 [@media(max-height:32rem)]:bottom-3! [@media(max-height:32rem)]:top-3! [@media(max-height:32rem)]:h-auto! [@media(max-height:32rem)]:max-h-none! flex animate-fade-up flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-navy/25 ring-1 ring-navy/5 sm:inset-x-auto sm:right-4 sm:top-auto sm:h-[34rem] sm:max-h-[calc(100dvh-12rem)] sm:w-[23rem] md:bottom-24 md:right-6">
          {/* Midnight header with white text; the soft circles are decoration */}
          <header className="relative isolate flex items-center gap-3 overflow-hidden bg-navy px-4 py-4 text-white">
            <span className="pointer-events-none absolute -right-8 -top-16 -z-10 h-36 w-36 rounded-full bg-white/10" aria-hidden="true" />
            <span className="pointer-events-none absolute -bottom-12 right-16 -z-10 h-20 w-20 rounded-full bg-white/5" aria-hidden="true" />
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-md shadow-navy-deep/30">
              <LogoMark className="h-7 w-7" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-navy" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-[15px] font-bold leading-tight">Help assistant</h2>
              <p className="mt-0.5 text-xs text-white/70">Online · replies instantly</p>
            </div>
            <button type="button" onClick={close} aria-label="Close help"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-white">
              <Icon name="x" className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          <div role="log" aria-live="polite" className="scroll-thin flex-1 space-y-3 overflow-y-auto bg-white px-4 py-5">
            {messages.map((m) => (m.from === 'user'
              ? (
                <div key={m.id} className="flex animate-fade-up justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-navy px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm shadow-navy/20">
                    <span className="sr-only">You: </span>
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex animate-fade-up items-end gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-aqua" aria-hidden="true">
                    <LogoMark className="h-5 w-5" />
                  </span>
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-frost px-3.5 py-2.5 text-sm leading-relaxed text-ink">
                    <p className="whitespace-pre-line">{m.text}</p>
                    {m.link && (
                      <Link to={m.link.to} onClick={() => setOpen(false)}
                        className="group mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-sm ring-1 ring-aqua transition hover:bg-navy hover:text-white hover:ring-navy">
                        {m.link.label} <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                      </Link>
                    )}
                  </div>
                </div>
              )))}
            {typing && (
              <div className="flex items-end gap-2" aria-label="Assistant is typing">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-aqua" aria-hidden="true">
                  <LogoMark className="h-5 w-5" />
                </span>
                <span className="flex gap-1 rounded-2xl rounded-bl-md bg-frost px-3.5 py-3.5">
                  {[0, 150, 300].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-denim" style={{ animationDelay: `${d}ms` }} />)}
                </span>
              </div>
            )}
            {/* topic chips only under the latest answer, to keep the thread tidy */}
            {!typing && last?.from === 'bot' && last.suggestions?.length > 0 && (
              <div className="animate-fade-up pl-9 pt-1">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Suggested topics</p>
                <div className="flex flex-wrap gap-2">
                  {last.suggestions.map((id) => (
                    <button key={id} type="button" onClick={() => ask(FAQ_BY_ID[id].question, id)}
                      className="group inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-left text-xs font-semibold text-navy shadow-sm ring-1 ring-inset ring-aqua transition duration-200 hover:bg-navy hover:text-white hover:ring-navy active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy">
                      {FAQ_BY_ID[id].question}
                      <Icon name="arrow-right" className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100" strokeWidth={2} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="border-t border-aqua/60 bg-white p-3">
            <div className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1.5 ring-1 ring-aqua transition focus-within:ring-2 focus-within:ring-navy/25">
              <label htmlFor={`${panelId}-input`} className="sr-only">Type your question</label>
              <input id={`${panelId}-input`} ref={inputRef} placeholder="Type your question…" autoComplete="off"
                maxLength={200} value={text} onChange={(e) => setText(e.target.value)}
                className="h-9 w-full min-w-0 bg-transparent text-base text-ink placeholder:text-slate-400 focus:outline-none sm:text-sm" />
              <button disabled={!text.trim() || typing} aria-label="Send question"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-white shadow-sm transition hover:bg-navy-deep active:scale-90 disabled:bg-aqua disabled:text-slate-400 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy">
                <Icon name="send" className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Logo-only launcher with no backing circle; the accessible name says what it does since there is no visible text.
          The logo sits still above a soft Anchor Navy aura (10% opacity). On short screens the open panel fills the
          height and has its own close button, so the launcher steps aside instead of covering the message box. */}
      <button ref={launcherRef} type="button" onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open} aria-controls={open ? panelId : undefined} aria-label={open ? 'Close help assistant' : 'Open help assistant'}
        className={`group fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 z-40 flex h-12 w-12 items-center justify-center rounded-full transition duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy md:bottom-6 md:right-6 md:h-16 md:w-16 ${open ? '[@media(max-height:32rem)]:hidden' : ''}`}>
        <span className="absolute -inset-2 rounded-full bg-navy/10 blur-[2px] transition-colors duration-300 group-hover:bg-navy/15" aria-hidden="true" />
        <span className="relative drop-shadow-[0_6px_10px_rgb(14_54_97/0.25)]">
          {open
            ? <Icon name="x" className="h-8 w-8 text-navy" strokeWidth={2.2} />
            : <LogoMark className="h-10 w-10 md:h-14 md:w-14" />}
        </span>
      </button>
    </>
  );
}
