import { createPortal } from 'react-dom';

// Moving background for a single page (listing and messages pages), drawn over the site-wide Backdrop.
// Portalled to <body>: the page wrapper in App.jsx animates with a transform, which would otherwise pin this
// fixed layer to the wrapper instead of the whole screen. Styles: .page-bg in index.css.
export default function PageBackdrop() {
  return createPortal(
    <div className="page-bg" aria-hidden="true">
      <span className="page-bg-glow page-bg-glow-1" />
      <span className="page-bg-glow page-bg-glow-2" />
      <span className="page-bg-glow page-bg-glow-3" />
      <span className="page-bg-weave" />
    </div>,
    document.body,
  );
}
