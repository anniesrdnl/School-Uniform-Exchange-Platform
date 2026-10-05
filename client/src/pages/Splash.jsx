import { Link } from 'react-router-dom';
import uniformImg from '../assets/uniforms.jpg';
import Icon from '../components/Icon.jsx';

// Staggers entrance animations without extra state
const delay = (ms) => ({ animationDelay: `${ms}ms` });

const HIGHLIGHTS = ['Free to join', 'Buy or swap', 'Chat with sellers'];

const FEATURES = [
  { title: 'Save money', text: 'Second-hand uniforms at student-friendly prices.', icon: 'money', tile: 'bg-cream' },
  { title: 'Reduce waste', text: 'Give outgrown uniforms a second life instead of leaving them in storage.', icon: 'recycle', tile: 'bg-aqua' },
  { title: 'Support your community', text: 'Help fellow students get what they need for the school year.', icon: 'users', tile: 'bg-powder' },
];

export default function Splash() {
  return (
    <div className="space-y-16 py-2 sm:space-y-20 sm:py-6">
      <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
        <div className="text-center lg:text-left">
          <p className="chip animate-fade-up bg-cream px-3 py-1 text-navy">
            For students, by students
          </p>
          <h1 className="mt-5 animate-fade-up text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]" style={delay(80)}>
            Exchange. <span className="marker">Reuse.</span>
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
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-aqua text-navy">
                  <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Photo on stacked bands that echo the brand palette */}
        <div className="relative mx-auto w-full max-w-lg animate-fade-up pt-6 lg:max-w-none" style={delay(160)}>
          <div className="absolute inset-x-8 top-0 bottom-12 rounded-[2rem] bg-cream" aria-hidden="true" />
          <div className="absolute inset-x-4 top-3 bottom-6 rounded-[2rem] bg-aqua" aria-hidden="true" />
          <div className="relative mt-3 overflow-hidden rounded-[2rem] bg-powder p-3 shadow-xl shadow-navy/10 sm:p-4">
            <img src={uniformImg} alt="Folded navy and white school uniforms stacked on a table"
              className="aspect-[4/3] w-full rounded-[1.5rem] object-cover" />
          </div>
          <p className="absolute -bottom-4 left-1/2 flex w-max max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-navy shadow-lg shadow-navy/10 ring-1 ring-aqua sm:text-sm">
            <Icon name="recycle" className="h-4 w-4 shrink-0" />
            Save Uniform. A Brighter Tomorrow.
          </p>
        </div>
      </section>

      <section aria-labelledby="why-heading" className="rounded-[2rem] bg-white/80 p-6 ring-1 ring-aqua/70 sm:p-10">
        <h2 id="why-heading" className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">Why swap uniforms here?</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="animate-fade-up text-center md:text-left" style={delay(400 + i * 80)}>
              <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-navy md:mx-0 ${f.tile}`}>
                <Icon name={f.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-5 rounded-[2rem] bg-navy px-6 py-10 text-center text-white sm:px-10 md:flex-row md:justify-between md:text-left">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Outgrown your uniform?</h2>
          <p className="mt-1 text-white/80">Post it in a few minutes and help another student save.</p>
        </div>
        <Link to="/sell" className="btn-cream shrink-0 px-6 py-3">Sell a uniform</Link>
      </section>
    </div>
  );
}
