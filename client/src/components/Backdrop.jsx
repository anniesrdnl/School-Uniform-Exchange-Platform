import { useEffect, useState } from 'react';

// Stitched "seam" threads that flow across the page: a double row of stitches like a uniform's topstitching.
// period/amp: wave length and height in px; flow/sway: loop lengths in seconds; reverse: flows right instead of left.
const THREADS = [
  { top: '14%', period: 360, amp: 22, flow: 60, sway: 13, opacity: 0.26 },
  { top: '52%', period: 300, amp: 30, flow: 75, sway: 17, opacity: 0.2, reverse: true },
  { top: '84%', period: 420, amp: 18, flow: 90, sway: 15, opacity: 0.24 },
];
const STITCH = 12; // one stitch + gap, in px
const ROW_GAP = 6; // distance between the two rows of stitches

// A smooth wave `count` periods long. pathLength is chosen so each period holds a whole number of stitches,
// which lets the svg slide left by exactly one period and loop with no visible jump.
function thread({ period, amp }, count) {
  const mid = amp + 4;
  let d = `M0 ${mid} Q ${period / 4} ${mid - amp * 2} ${period / 2} ${mid}`;
  for (let x = period; x <= period * count; x += period / 2) d += ` T ${x} ${mid}`;
  const arc = period * (1 + (Math.PI * amp / period) ** 2); // approximate length of one period
  const pathLength = Math.round(arc / STITCH) * STITCH * count;
  return { d, pathLength, width: period * count, height: mid * 2 + ROW_GAP };
}

// Living page background behind every page: soft palette glows drift slowly, stitched threads flow across,
// a faint dot grid pans, and the layers lean a little away from the mouse and rise as you scroll.
// Decoration only (styles in index.css). The mouse/scroll values are set on <html> (--bx, --by, --sy)
// so any page can add its own parallax.
export default function Backdrop() {
  // enough periods to cover the widest this screen can get, plus one for the loop
  const [threads] = useState(() => {
    const screenWidth = Math.max(window.screen?.width || 0, window.innerWidth);
    return THREADS.map((t) => ({ ...t, ...thread(t, Math.ceil(screenWidth / t.period) + 1) }));
  });

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const root = document.documentElement;
    let raf = 0;
    let mx = 0;
    let my = 0;
    // one style write per frame, however many events arrive
    const paint = () => {
      raf = 0;
      root.style.setProperty('--bx', mx.toFixed(3));
      root.style.setProperty('--by', my.toFixed(3));
      root.style.setProperty('--sy', Math.min(window.scrollY, 1500).toFixed(0));
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
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-glows">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
        <span className="orb orb-4" />
        <span className="orb orb-5" />
      </div>
      <div className="backdrop-dots" />
      <div className="backdrop-threads">
        {threads.map((t) => (
          <div key={t.top} className="thread"
            style={{ top: t.top, opacity: t.opacity, '--p': t.period, '--flow': `${t.flow}s`, '--sway': `${t.sway}s` }}>
            <svg className={`thread-line ${t.reverse ? 'thread-reverse' : ''}`} width={t.width} height={t.height}
              viewBox={`0 0 ${t.width} ${t.height}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d={t.d} pathLength={t.pathLength} strokeDasharray={`${STITCH / 2} ${STITCH / 2}`} />
              <path d={t.d} pathLength={t.pathLength} strokeDasharray={`${STITCH / 2} ${STITCH / 2}`}
                transform={`translate(0 ${ROW_GAP})`} opacity="0.55" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
