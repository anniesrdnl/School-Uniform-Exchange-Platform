import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { Spinner } from './Loader.jsx';

// Confirmation pop-up for actions that can't be undone. Uses the native <dialog>, so focus stays inside it,
// Escape closes it, and the rest of the page can't be clicked while it's open. Cancel has focus first.
export default function ConfirmDialog({ open, title, children, confirmLabel = 'Delete', busy = false, onConfirm, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose} onCancel={(e) => busy && e.preventDefault()} aria-labelledby="confirm-title"
      className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-2xl bg-white p-0 text-ink shadow-2xl shadow-navy/25 ring-1 ring-aqua backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] open:animate-fade-up">
      <div className="p-5 sm:p-6">
        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-inset ring-red-200">
            <Icon name="trash" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-lg font-bold">{title}</h2>
            <div className="mt-1 text-sm text-slate-600">{children}</div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-outline" onClick={onClose} autoFocus>Cancel</button>
          <button type="button" onClick={onConfirm} disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition duration-200 hover:bg-red-700 active:scale-[0.97] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
            {busy ? <><Spinner /> Deleting…</> : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
