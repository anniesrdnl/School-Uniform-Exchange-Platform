import { useEffect, useState } from 'react';

export const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Counts from 0 up to target with an ease-out, once target is known
export function useCountUp(target, ms = 1000) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (target == null) return undefined;
    if (prefersReducedMotion()) { setN(target); return undefined; }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / ms, 1);
      setN(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}
