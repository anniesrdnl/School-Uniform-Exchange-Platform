import { Link } from 'react-router-dom';
import uniformImg from '../assets/uniforms.jpg';
import Icon from '../components/Icon.jsx';

// Staggers entrance animations without extra state
const delay = (ms) => ({ animationDelay: `${ms}ms` });

// Shared type styles: bold (not extra-bold) headings in sentence case read friendlier at large sizes
const eyebrow = 'text-sm font-semibold text-navy';
const sectionTitle = 'mt-2 text-balance text-2xl font-bold leading-tight tracking-[-0.015em] text-ink sm:text-[2rem]';

const HIGHLIGHTS = ['Free to join', 'Buy or swap', 'Chat with sellers'];

const BENEFITS = [
  { title: 'Save money', text: 'Second-hand uniforms at student-friendly prices.', icon: 'money' },
  { title: 'Reduce waste', text: 'Give outgrown uniforms a second life instead of leaving them in storage.', icon: 'recycle' },
  { title: 'Support your community', text: 'Help fellow students get what they need for the school year.', icon: 'users' },
];

// Mirrors the real flow: listing -> request/chat -> seller marks the exchange completed
const STEPS = [
  { title: 'Post your uniform', text: 'Add photos, the size, the condition and your price. It only takes a few minutes.' },
  { title: 'Get a request', text: 'Students send a request to buy or swap, and you can chat with them in the app.' },
  { title: 'Meet and hand it over', text: 'Agree on a time and place on campus, then mark the exchange as completed.' },
];

export default function Splash() {
  return (
    <div className="space-y-20 py-2 sm:space-y-28 sm:py-8">
      <section className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          <p className="chip animate-fade-up bg-cream px-3 py-1 text-navy">
            For students, by students
          </p>
          <h1 className="mt-5 animate-fade-up text-4xl font-bold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.5rem]" style={delay(80)}>
            Exchange. <span className="text-navy">Reuse.</span>
            <br />
            Support students.
          </h1>
          <p className="mx-auto mt-5 max-w-md animate-fade-up text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0" style={delay(160)}>
            A simple, sustainable way to buy, sell, and swap school uniforms with other students on your campus.
          </p>
          <div className="mt-8 flex animate-fade-up flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start" style={delay(240)}>
            <Link to="/register" className="btn-primary group px-6 py-3">
              Get started
              <Icon name="arrow-right" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
            <Link to="/browse" className="btn-outline px-6 py-3">Browse uniforms</Link>
          </div>
          <ul className="mt-8 flex animate-fade-up flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600 lg:justify-start" style={delay(320)}>
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2">
                <Icon name="check" className="h-4 w-4 text-navy" strokeWidth={2.5} />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative mx-auto w-full max-w-lg animate-fade-up pb-6 lg:max-w-none" style={delay(160)}>
          <img src={uniformImg} alt="Folded navy and white school uniforms stacked on a table"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl shadow-navy/15 ring-1 ring-navy/5" />
          <figcaption className="absolute bottom-0 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-navy/10 ring-1 ring-aqua sm:left-6 sm:right-auto">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-frost text-navy">
              <Icon name="recycle" className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-ink">Save Uniform. A Brighter Tomorrow.</span>
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="why-heading" className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-center lg:gap-16">
        <div className="text-center lg:text-left">
          <p className={eyebrow}>Why students use it</p>
          <h2 id="why-heading" className={sectionTitle}>Good for your budget, your school, and the planet.</h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600 lg:mx-0">
            Most uniforms are outgrown long before they wear out. Passing them on keeps them in use and keeps costs down for everyone.
          </p>
        </div>
        <ul className="card divide-y divide-aqua/70">
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex gap-4 p-5 sm:gap-5 sm:p-7">
              <span className="icon-tile h-11 w-11">
                <Icon name={b.icon} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-ink">{b.title}</h3>
                <p className="mt-1 text-base leading-relaxed text-slate-600">{b.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading">
        <div className="mx-auto max-w-2xl text-center">
          <p className={eyebrow}>How it works</p>
          <h2 id="how-heading" className={sectionTitle}>From your closet to a classmate in three steps.</h2>
        </div>
        <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t border-powder pt-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">
                <span className="sr-only">Step {i + 1}: </span>{s.title}
              </h3>
              <p className="mt-1.5 text-base leading-relaxed text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="cta-heading" className="rounded-3xl bg-navy px-6 py-10 text-center text-white sm:px-12 sm:py-14 md:text-left">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="max-w-xl">
            <h2 id="cta-heading" className="text-2xl font-bold leading-tight tracking-[-0.015em] sm:text-3xl">Outgrown your uniform?</h2>
            <p className="mt-2 text-base leading-relaxed text-aqua sm:text-lg">Post it in a few minutes and help another student save.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:shrink-0">
            <Link to="/sell" className="btn-light px-6 py-3">Sell a uniform</Link>
            <Link to="/browse" className="btn-ghost-light px-6 py-3">Browse uniforms</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
