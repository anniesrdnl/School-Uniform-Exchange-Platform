// Coloured pill for listing, request and report statuses. The status word is always shown, so colour is never the only cue.
const STYLES = {
  available: 'bg-green-50 text-green-800 ring-green-200',
  completed: 'bg-green-50 text-green-800 ring-green-200',
  resolved: 'bg-green-50 text-green-800 ring-green-200',
  reserved: 'bg-amber-50 text-amber-800 ring-amber-200',
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  open: 'bg-amber-50 text-amber-800 ring-amber-200',
  accepted: 'bg-aqua text-navy ring-powder',
};
const NEUTRAL = 'bg-slate-100 text-slate-600 ring-slate-200'; // sold, declined, cancelled, dismissed

export default function StatusBadge({ status }) {
  return <span className={`chip capitalize ring-1 ring-inset ${STYLES[status] || NEUTRAL}`}>{status}</span>;
}
