import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import uniformImg from '../assets/uniforms.jpg';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import CategoryGrid from '../components/CategoryGrid.jsx';
import { prefersReducedMotion, useCountUp } from '../hooks.js';

// Staggers entrance animations without extra state
const delay = (ms) => ({ animationDelay: `${ms}ms` });

// Shared type styles: bold (not extra-bold) headings in sentence case read friendlier at large sizes
const eyebrow = 'text-sm font-semibold text-denim';
const sectionTitle = 'mt-2 text-balance text-2xl font-bold leading-tight tracking-[-0.015em] text-ink sm:text-[2rem]';

const HIGHLIGHTS = ['Free to join', 'Buy or swap', 'Chat with sellers'];

const BENEFITS = [
  { title: 'Save money', text: 'Second-hand uniforms at student-friendly prices.', icon: 'money' },
  { title: 'Reduce waste', text: 'Give outgrown uniforms a second life instead of leaving them in storage.', icon: 'recycle' },
  { title: 'Support your community', text: 'Help fellow students get what they need for the school year.', icon: 'users' },
];

// Mirrors the real flow: listing -> request/chat -> seller marks the exchange completed
const STEPS = [
  { title: 'Post your uniform', text: 'Add photos, the size, the condition and your price. It only takes a few minutes.', icon: 'tag' },
  { title: 'Get a request', text: 'Students send a request to buy or swap, and you can chat with them in the app.', icon: 'chat' },
  { title: 'Meet and hand it over', text: 'Agree on a time and place on campus, then mark the exchange as completed.', icon: 'recycle' },
];
const STEP_MS = 4000;

// Outline uniform icons drifting behind the hero. depth = how far (px) each one follows the mouse.
const FLOATERS = [
  { icon: 'shirt', top: '-6%', left: '-1%', size: 'h-12 w-12', r: '-12deg', depth: 40, dur: 9 },
  { icon: 'tie', top: '-4%', left: '44%', size: 'h-10 w-10', r: '14deg', depth: 70, dur: 7 },
  { icon: 'pants', top: '88%', left: '1%', size: 'h-11 w-11', r: '-8deg', depth: 30, dur: 10 },
  { icon: 'jersey', top: '92%', left: '42%', size: 'h-10 w-10', r: '10deg', depth: 60, dur: 8 },
];

function Floaters() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 hidden sm:block" aria-hidden="true">
      {FLOATERS.map((f, i) => (
        <span key={f.icon} className="absolute transition-[translate] duration-[1200ms] ease-out"
          style={{ top: f.top, left: f.left, translate: `calc(var(--bx) * ${f.depth}px) calc(var(--by) * ${f.depth}px)` }}>
          <span className="block animate-bob text-navy/15" style={{ '--r': f.r, animationDuration: `${f.dur}s`, animationDelay: `${i * -2}s` }}>
            <Icon name={f.icon} className={f.size} strokeWidth={1.2} />
          </span>
        </span>
      ))}
    </div>
  );
}

// "How it works": the highlighted step advances on its own (its top bar fills as a timer); hovering a step holds it
function Steps() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || prefersReducedMotion()) return undefined;
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, paused]);

  return (
    <ol className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6" onMouseLeave={() => setPaused(false)}>
      {STEPS.map((s, i) => {
        const on = i === active;
        const timing = on && !paused;
        return (
          <li key={s.title} onMouseEnter={() => { setActive(i); setPaused(true); }}
            className={`relative overflow-hidden rounded-2xl p-6 pt-7 ring-1 transition duration-300 sm:p-7 sm:pt-8 ${on
              ? 'bg-white shadow-xl shadow-navy/10 ring-aqua'
              : 'bg-white/40 ring-aqua/70 hover:bg-white/70'}`}>
            <span className="absolute inset-x-0 top-0 h-1 bg-aqua/70" aria-hidden="true">
              <span key={timing ? `run-${active}` : 'still'}
                className={`block h-full origin-left bg-navy ${timing ? 'animate-[progress_linear_both]' : 'transition-transform duration-300'}`}
                style={timing ? { animationDuration: `${STEP_MS}ms` } : { transform: `scaleX(${i <= active ? 1 : 0})` }} />
            </span>
            <div className="flex items-center justify-between">
              <span aria-hidden="true"
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition duration-300 ${on
                  ? 'scale-110 bg-navy text-white shadow-lg shadow-navy/25'
                  : 'bg-white text-navy ring-1 ring-inset ring-powder'}`}>
                {i + 1}
              </span>
              <Icon name={s.icon} className={`h-6 w-6 transition duration-300 ${on ? 'text-navy' : 'text-navy/25'}`} />
            </div>
            <h3 className={`mt-5 text-lg font-semibold transition-colors duration-300 ${on ? 'text-navy' : 'text-ink'}`}>
              <span className="sr-only">Step {i + 1}: </span>{s.title}
            </h3>
            <p className="mt-1.5 text-base leading-relaxed text-slate-600">{s.text}</p>
          </li>
        );
      })}
    </ol>
  );
}

export default function Splash() {
  const [total, setTotal] = useState(null);
  const shownTotal = useCountUp(total);

  useEffect(() => {
    api.get('/listings', { params: { limit: 1 } }).then((r) => setTotal(r.data.total)).catch(() => {});
  }, []);

  // Cursor position over the closing panel as 0–1, for its spotlight
  const track = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', ((e.clientX - r.left) / r.width).toFixed(3));
    e.currentTarget.style.setProperty('--my', ((e.clientY - r.top) / r.height).toFixed(3));
  };

  return (
    <div className="space-y-24 py-2 sm:space-y-32 sm:py-8">
      <section className="relative isolate grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <Floaters />

        <div className="text-center lg:text-left">
          <Link to="/browse"
            className="group inline-flex animate-fade-up items-center gap-2.5 rounded-full bg-white/80 py-1 pl-1 pr-3 text-sm font-medium text-slate-700 shadow-sm shadow-navy/5 ring-1 ring-aqua backdrop-blur transition duration-300 hover:bg-white hover:shadow-md hover:ring-denim/40 active:scale-[0.98]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-mist">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inset-0 animate-ping rounded-full bg-cream" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-cream" />
              </span>
              Live
            </span>
            {total == null
              ? 'Uniforms from students on your campus'
              : <span><strong className="font-bold tabular-nums text-ink">{shownTotal}</strong> {total === 1 ? 'uniform' : 'uniforms'} available now</span>}
            <Icon name="arrow-right" className="h-4 w-4 text-navy transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.5rem]">
            <span className="inline-block animate-fade-up" style={delay(80)}>Exchange.</span>{' '}
            <span className="inline-block animate-fade-up" style={delay(180)}>
              <span className="animate-sheen bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #586a79, #102e4a 50%, #586a79)', backgroundSize: '200% auto' }}>
                Reuse.
              </span>
            </span>
            <br />
            <span className="inline-block animate-fade-up" style={delay(280)}>Support students.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md animate-fade-up text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0" style={delay(360)}>
            A simple, sustainable way to buy, sell, and swap school uniforms with other students on your campus.
          </p>
          <div className="mt-8 flex animate-fade-up flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start" style={delay(440)}>
            <Link to="/register" className="btn-primary btn-shine group px-6 py-3 hover:-translate-y-0.5">
              Get started
              <Icon name="arrow-right" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2} />
            </Link>
            <Link to="/browse" className="btn-outline group px-6 py-3 hover:-translate-y-0.5 hover:shadow-md hover:shadow-navy/10">
              <Icon name="search" className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
              Browse uniforms
            </Link>
          </div>
          <ul className="mt-8 flex animate-fade-up flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600 lg:justify-start" style={delay(520)}>
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy text-mist">
                  <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative mx-auto w-full max-w-lg animate-fade-up pb-8 lg:max-w-none" style={delay(200)}>
          {/* soft cream shape that slowly changes form behind the photo */}
          <div className="absolute -inset-3 -z-10 animate-morph bg-cream sm:-inset-6" aria-hidden="true" />
          {/* the photo leans gently toward the mouse (--bx/--by from Backdrop.jsx) */}
          <div className="relative transition-transform duration-700 ease-out"
            style={{ transform: 'perspective(1400px) rotateY(calc(var(--bx) * 8deg)) rotateX(calc(var(--by) * -8deg))' }}>
            <div className="overflow-hidden rounded-3xl shadow-2xl shadow-navy/20 ring-1 ring-navy/5">
              <img src={uniformImg} alt="Folded navy and white school uniforms stacked on a table"
                className="aspect-[4/3] w-full animate-kenburns object-cover" />
            </div>
            <figcaption className="absolute -bottom-8 left-4 right-4 flex animate-float items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-navy/15 ring-1 ring-aqua sm:left-6 sm:right-auto">
              <span className="icon-tile h-9 w-9">
                <Icon name="recycle" className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-ink">Save Uniform. A Brighter Tomorrow.</span>
            </figcaption>
            <p className="absolute -top-4 right-4 hidden animate-float items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-navy shadow-xl shadow-navy/15 ring-1 ring-aqua [animation-delay:-3s] sm:flex">
              <span className="icon-tile h-7 w-7 rounded-full"><Icon name="shield" className="h-4 w-4" /></span>
              Safe campus meetups
            </p>
          </div>
        </figure>
      </section>

      <section aria-labelledby="category-heading">
        <Reveal className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={eyebrow}>Browse by category</p>
            <h2 id="category-heading" className={sectionTitle}>Everything for the school year.</h2>
          </div>
          <Link to="/browse" className="group inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-navy sm:self-auto">
            See all uniforms <Icon name="arrow-right" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <CategoryGrid />
      </section>

      <section aria-labelledby="why-heading">
        <Reveal className="grid gap-4 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className={eyebrow}>Why students use it</p>
            <h2 id="why-heading" className={sectionTitle}>Good for your budget, your school, and the planet.</h2>
          </div>
          <p className="max-w-lg text-base leading-relaxed text-slate-600">
            Most uniforms are outgrown long before they wear out. Passing them on keeps them in use and keeps costs down for everyone.
          </p>
        </Reveal>
        <ul className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {BENEFITS.map((b, i) => (
            <Reveal as="li" key={b.title} delay={i * 110}>
              <div className="card group relative h-full overflow-hidden p-6 transition duration-300 hover:-translate-y-1.5 hover:border-powder hover:shadow-xl hover:shadow-navy/10 sm:p-7">
                <span className="icon-tile h-12 w-12 transition duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-navy group-hover:text-mist group-hover:ring-navy">
                  <Icon name={b.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink transition-colors group-hover:text-navy">{b.title}</h3>
                <p className="mt-1.5 text-base leading-relaxed text-slate-600">{b.text}</p>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-navy transition-transform duration-500 group-hover:scale-x-100" aria-hidden="true" />
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <Reveal as="section" aria-labelledby="how-heading">
        <div className="mx-auto max-w-2xl text-center">
          <p className={eyebrow}>How it works</p>
          <h2 id="how-heading" className={sectionTitle}>From your closet to a classmate in three steps.</h2>
        </div>
        <Steps />
      </Reveal>

      <Reveal as="section" aria-labelledby="cta-heading" onPointerMove={track}
        className="group/cta relative isolate overflow-hidden rounded-3xl bg-navy px-6 py-12 text-center text-white shadow-xl shadow-navy/20 [--mx:0.5] [--my:0.5] sm:px-12 sm:py-16 md:text-left">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -right-20 -top-28 h-80 w-80 animate-drift rounded-full bg-denim/50 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 h-72 w-72 animate-drift rounded-full bg-cream/15 blur-3xl [animation-delay:-8s]" />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(rgb(255 247 230 / 0.12) 1px, transparent 1px)', backgroundSize: '22px 22px', maskImage: 'linear-gradient(100deg, transparent 30%, #000)' }} />
          <Icon name="recycle" className="absolute -bottom-16 -right-12 h-72 w-72 animate-[spin_60s_linear_infinite] text-white/5" strokeWidth={1} />
          {/* soft light that follows the mouse */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/cta:opacity-100"
            style={{ background: 'radial-gradient(28rem circle at calc(var(--mx) * 100%) calc(var(--my) * 100%), rgb(255 247 230 / 0.1), transparent 65%)' }} />
        </div>
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="max-w-xl">
            <h2 id="cta-heading" className="text-2xl font-bold leading-tight tracking-[-0.015em] sm:text-3xl">Outgrown your uniform?</h2>
            <p className="mt-2 text-base leading-relaxed text-aqua sm:text-lg">Post it in a few minutes and help another student save.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:shrink-0">
            <Link to="/sell" className="btn-light group px-6 py-3 hover:-translate-y-0.5 hover:shadow-lg">
              <Icon name="plus-circle" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> Sell a uniform
            </Link>
            <Link to="/browse" className="btn-ghost-light px-6 py-3 hover:-translate-y-0.5">Browse uniforms</Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
