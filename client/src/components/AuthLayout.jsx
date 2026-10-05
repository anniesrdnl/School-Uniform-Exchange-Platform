import Icon from './Icon.jsx';
import { LogoMark } from './Logo.jsx';

// How an exchange works: one swinging hang-tag per step on the rack (desktop)
const STEPS = [
  { icon: 'tag', title: 'Post it', text: "List what you've outgrown", drop: 'h-5' },
  { icon: 'chat', title: 'Chat', text: 'Agree on a price or a swap', drop: 'h-12', dark: true },
  { icon: 'recycle', title: 'Pass it on', text: 'Meet up on campus', drop: 'h-8' },
];

// Shape shared by the form tag and the small rack tags: top corners clipped like a garment tag
const tagShape = (cut) => ({ clipPath: `polygon(${cut} 0, calc(100% - ${cut}) 0, 100% ${cut}, 100% 100%, 0 100%, 0 ${cut})` });

// A clothes rail with three hangers; each tag swings gently and holds still while hovered
function Rack() {
  return (
    <div className="relative mt-12 h-[18.5rem] w-full max-w-xl" aria-label="How it works" role="group">
      <span className="absolute -left-1 top-0 h-9 w-2.5 rounded-full bg-navy-deep" aria-hidden="true" />
      <span className="absolute -right-1 top-0 h-9 w-2.5 rounded-full bg-navy-deep" aria-hidden="true" />
      <span className="absolute inset-x-0 top-3 h-2.5 rounded-full bg-linear-to-b from-[#3a4657] to-navy-deep shadow-md shadow-navy/30" aria-hidden="true" />

      <ol className="absolute inset-x-5 top-0 grid grid-cols-3 gap-5">
        {STEPS.map((s, i) => (
          <li key={s.title} className="group flex justify-center">
            <div className="flex origin-top animate-swing flex-col items-center group-hover:[animation-play-state:paused]"
              style={{ animationDelay: `${i * -1.2}s`, animationDuration: `${3.4 + i * 0.5}s` }}>
              {/* hanger hook around the rail, then the string down to the tag */}
              <svg viewBox="0 0 24 30" className="h-8 w-6 text-navy" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M12 30V20c0-4 6-5 6-11a6 6 0 1 0-12 0" />
              </svg>
              <span className={`w-px bg-denim/60 ${s.drop}`} aria-hidden="true" />
              <div className="drop-shadow-[0_14px_22px_rgb(24_38_58/0.16)] transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.04]">
                <div style={tagShape('1.1rem')}
                  className={`relative w-36 px-4 pb-4 pt-8 xl:w-40 ${s.dark ? 'bg-navy text-white' : 'bg-white text-ink'}`}>
                  <span className={`absolute left-1/2 top-3 h-2.5 w-2.5 -translate-x-1/2 rounded-full ring-2 ${s.dark ? 'bg-mist ring-white/40' : 'bg-mist ring-powder'}`} aria-hidden="true" />
                  <div className="flex items-center justify-between">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.dark ? 'bg-white/10 text-cream' : 'bg-frost text-navy'}`}>
                      <Icon name={s.icon} className="h-5 w-5" />
                    </span>
                    <span className={`text-2xl font-bold tabular-nums ${s.dark ? 'text-white/25' : 'text-navy/15'}`} aria-hidden="true">0{i + 1}</span>
                  </div>
                  <p className="mt-3 text-sm font-bold"><span className="sr-only">Step {i + 1}: </span>{s.title}</p>
                  <p className={`mt-0.5 text-xs leading-snug ${s.dark ? 'text-white/70' : 'text-slate-500'}`}>{s.text}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Login/register: the story and the swinging rack on the left (desktop); the form is a large hang-tag, threaded on a
// string through a punched eyelet. `tag` is the small label printed on the tag ("Member login", "New member").
export default function AuthLayout({ headline, text, tag = 'Members', children }) {
  return (
    // centred in the viewport below the header card (0.75rem gap + 2.25rem strip + 4rem row) and the page padding (4.5rem)
    <div className="lg:flex lg:min-h-[calc(100dvh-11.5rem)] lg:items-center">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr] xl:gap-20">
        <aside className="hidden lg:block">
          <span className="chip animate-fade-up bg-cream px-3 py-1 text-navy">For students, by students</span>
          <p className="mt-5 max-w-lg animate-fade-up text-balance text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-ink [animation-delay:80ms] xl:text-5xl">
            {headline}
          </p>
          <p className="mt-4 max-w-md animate-fade-up text-base leading-relaxed text-slate-600 [animation-delay:160ms]">{text}</p>
          <div className="animate-fade-up [animation-delay:240ms]">
            <Rack />
          </div>
        </aside>

        <div className="relative mx-auto w-full max-w-md animate-fade-up pt-14 [animation-delay:120ms]">
          {/* the string: a loop coming down from above and threading through the eyelet */}
          <svg viewBox="0 0 120 84" className="absolute left-1/2 top-0 z-10 h-[5.25rem] w-[7.5rem] -translate-x-1/2 origin-bottom animate-swing text-denim [animation-duration:5s]"
            fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M60 82C59 62 42 52 50 32S82 10 92 0" />
            <path d="M60 82C63 60 80 50 71 30S36 9 26 0" opacity="0.7" />
          </svg>

          <div className="drop-shadow-[0_24px_40px_rgb(24_38_58/0.14)]">
            <div className="relative bg-white px-6 pb-7 pt-14 sm:px-10 sm:pb-9"
              style={{
                ...tagShape('2.25rem'),
                // a real punched hole near the top centre
                WebkitMaskImage: 'radial-gradient(circle at 50% 1.75rem, transparent 0.7rem, #000 calc(0.7rem + 0.5px))',
                maskImage: 'radial-gradient(circle at 50% 1.75rem, transparent 0.7rem, #000 calc(0.7rem + 0.5px))',
              }}>
              {/* metal eyelet around the hole */}
              <span className="absolute left-1/2 top-7 h-[1.9rem] w-[1.9rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] border-[#cbcfd4] shadow-[inset_0_1px_2px_rgb(24_38_58/0.25),0_1px_0_rgb(255_255_255/0.8)]" aria-hidden="true" />

              <div className="mb-7 flex items-center justify-between gap-3 border-b-2 border-dashed border-aqua pb-4">
                <span className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#2e3b4d] to-navy-deep">
                    <LogoMark className="h-5 w-5 brightness-0 invert" />
                  </span>
                  <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.1em] text-navy sm:tracking-[0.16em]">Uniform Exchange</span>
                </span>
                <span className="whitespace-nowrap rounded-full bg-frost px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-denim sm:px-2.5 sm:text-[11px] sm:tracking-wider">{tag}</span>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Form heading on the tag
export function AuthHeading({ title, subtitle }) {
  return (
    <div>
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">{subtitle}</p>
    </div>
  );
}

// Tag stub at the bottom of the form: a dashed tear line above the switch-account link
export function AuthFooter({ children }) {
  return <p className="border-t-2 border-dashed border-aqua pt-5 text-center text-sm text-slate-600">{children}</p>;
}
