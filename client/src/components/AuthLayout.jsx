import uniformImg from '../assets/uniforms.jpg';
import Icon from './Icon.jsx';

// How an exchange works, shown under the photo on desktop
const STEPS = [
  { icon: 'tag', title: 'Post it', text: "List what you've outgrown" },
  { icon: 'chat', title: 'Chat', text: 'Agree on a price or a swap' },
  { icon: 'recycle', title: 'Pass it on', text: 'Meet up on campus' },
];

// Split screen for login/register: photo + navy story panel on desktop, plain centred card on smaller screens
export default function AuthLayout({ headline, text, children }) {
  return (
    // centred in the viewport below the header card (0.75rem gap + 2.25rem strip + 4rem row) and the page padding (4.5rem)
    <div className="lg:flex lg:min-h-[calc(100dvh-11.5rem)] lg:items-center">
      <div className="card mx-auto grid w-full max-w-lg overflow-hidden lg:min-h-[38rem] lg:max-w-5xl lg:grid-cols-2">
        <aside className="hidden flex-col bg-navy text-white lg:flex">
          <div className="relative min-h-56 flex-1 overflow-hidden">
            <img src={uniformImg} alt="Folded navy and white school uniforms stacked on a table"
              className="absolute inset-0 h-full w-full animate-kenburns object-cover" />
          </div>

          <div className="shrink-0 p-8 xl:p-10">
            <span className="chip bg-white/10 px-3 py-1 text-aqua ring-1 ring-inset ring-white/15">For students, by students</span>
            <p className="mt-4 max-w-sm text-balance text-2xl font-bold leading-tight tracking-[-0.015em] xl:text-3xl">{headline}</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-aqua">{text}</p>

            <ol className="mt-6 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className="min-w-0 animate-fade-up" style={{ animationDelay: `${300 + i * 120}ms` }}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-aqua">
                    <Icon name={s.icon} className="h-5 w-5" />
                  </span>
                  <p className="mt-2 text-sm font-bold">{s.title}</p>
                  <p className="text-xs leading-snug text-aqua">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="flex items-center justify-center p-6 sm:p-10 xl:p-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
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
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
