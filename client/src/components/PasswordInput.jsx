import { useState } from 'react';
import Icon from './Icon.jsx';

// Password field with a show/hide toggle and a Caps Lock hint. Other props (value, onChange,
// autoComplete, minLength, aria-describedby…) go straight to the <input>. Use it for every password field.
export default function PasswordInput({ id, className = '', ...props }) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const checkCaps = (e) => setCapsLock(Boolean(e.getModifierState?.('CapsLock')));

  return (
    <>
      <div className="relative">
        <input {...props} id={id} type={visible ? 'text' : 'password'} className={`input pr-12 ${className}`}
          autoCapitalize="none" autoCorrect="off" spellCheck={false}
          onKeyDown={checkCaps} onKeyUp={checkCaps} onBlur={() => setCapsLock(false)} />
        {/* constant label + aria-pressed: screen readers announce "Show password, pressed" while it is visible */}
        <button type="button" onClick={() => setVisible(!visible)} aria-pressed={visible} aria-controls={id}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-500 transition hover:text-navy focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-navy">
          <Icon name={visible ? 'eye-slash' : 'eye'} className="h-5 w-5" />
          <span className="sr-only">Show password</span>
        </button>
      </div>
      <div aria-live="polite">
        {capsLock && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-800">
            <Icon name="warning" className="h-4 w-4" /> Caps Lock is on
          </p>
        )}
      </div>
    </>
  );
}
