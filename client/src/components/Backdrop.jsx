import { useEffect, useRef } from 'react';

// Living page background behind every page: soft palette glows drift slowly, a faint dot grid pans,
// and the glows lean a little away from the mouse and rise as you scroll. Decoration only (styles in index.css).
export default function Backdrop() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const el = ref.current;
    let raf = 0;
    let mx = 0;
    let my = 0;
    // one style write per frame, however many events arrive
    const paint = () => {
      raf = 0;
      el.style.setProperty('--bx', mx.toFixed(3));
      el.style.setProperty('--by', my.toFixed(3));
      el.style.setProperty('--sy', Math.min(window.scrollY, 1500).toFixed(0));
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      queue();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', queue, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', queue);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="backdrop" aria-hidden="true">
      <div className="backdrop-glows">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
        <span className="orb orb-4" />
        <span className="orb orb-5" />
      </div>
      <div className="backdrop-dots" />
    </div>
  );
}
