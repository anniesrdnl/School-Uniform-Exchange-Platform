import uniformImg from '../assets/uniforms.jpg';
import Icon from './Icon.jsx';

const HIGHLIGHTS = ['Free to join', 'Buy or swap uniforms with other students', 'Chat with sellers in the app'];

// Split screen for login/register: palette panel on desktop, plain centred card on smaller screens
export default function AuthLayout({ headline, text, children }) {
  return (
    // min-height fills the viewport below the 64px header + page padding (8.5rem) and the header's 1px border
    <div className="card mx-auto grid max-w-lg overflow-hidden lg:min-h-[calc(100dvh-8.5rem-1px)] lg:max-w-none lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col justify-between gap-10 overflow-hidden bg-aqua p-10 lg:flex xl:p-12">
        <div className="pointer-events-none absolute -right-36 -top-40 h-80 w-80 rounded-full bg-powder" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-cream" aria-hidden="true" />

        <div className="relative">
          <span className="chip bg-cream px-3 py-1 text-navy ring-1 ring-inset ring-amber-200/70">For students, by students</span>
          <p className="mt-5 max-w-md text-4xl font-extrabold leading-[1.1] tracking-tight text-ink xl:text-[2.75rem]">{headline}</p>
          <p className="mt-3 max-w-sm leading-relaxed text-slate-700">{text}</p>
          {/* hidden on short laptop screens so the panel fits without scrolling */}
          <ul className="mt-6 space-y-2.5 text-sm font-medium text-slate-700 [@media(max-height:820px)]:hidden">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-navy shadow-sm">
                  <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-3xl bg-powder p-2.5 shadow-xl shadow-navy/10">
          <img src={uniformImg} alt="Folded navy and white school uniforms stacked on a table"
            className="aspect-[16/10] max-h-[32dvh] w-full rounded-[1.25rem] object-cover" />
        </div>
      </aside>

      <div className="flex items-center justify-center p-6 sm:p-10 xl:p-14">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

// Form heading: logo tile on small screens (the side panel replaces it on desktop), left-aligned beside the panel
export function AuthHeading({ logo, title, subtitle }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
      <span className="lg:hidden">{logo}</span>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>
    </div>
  );
}
