// FitStage — phone-landscape "fit to screen". Games were laid out for
// portrait / desktop heights; on a short landscape viewport (< 520px tall)
// we measure the page's natural height and scale the whole stage down so
// everything is visible without scrolling. `fixed` children (headers,
// banners) stay aligned because the transformed stage is their viewport.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MIN_SCALE = 0.55;
const isShort = () => window.innerHeight < 520 && window.innerWidth > window.innerHeight;

export default function FitStage({ children }) {
  const location = useLocation();
  const ref = useRef(null);
  const [active, setActive] = useState(isShort);
  const [scale, setScale] = useState(1);
  const sRef = useRef(1);
  const steps = useRef(0);

  useEffect(() => {
    const f = () => { setActive(isShort()); steps.current = 0; };
    window.addEventListener('resize', f); window.addEventListener('orientationchange', f);
    return () => { window.removeEventListener('resize', f); window.removeEventListener('orientationchange', f); };
  }, []);

  // New page → start from 1 and let the observer settle.
  useLayoutEffect(() => { sRef.current = 1; setScale(1); steps.current = 0; }, [location.pathname]);

  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const el = ref.current;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const natural = el.scrollHeight; // stage-local px (pre-transform)
      const target = Math.max(MIN_SCALE, Math.min(1, window.innerHeight / Math.max(1, natural)));
      // damped + bounded iterations so width changes can't oscillate forever
      if (Math.abs(target - sRef.current) > 0.03 && steps.current < 4) {
        steps.current += 1;
        sRef.current = target; setScale(target);
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };
    const ro = new ResizeObserver(() => { steps.current = Math.min(steps.current, 3); schedule(); });
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    const mo = new MutationObserver(() => { steps.current = 0; schedule(); });
    mo.observe(el, { childList: true, subtree: true, attributes: false });
    schedule();
    return () => { ro.disconnect(); mo.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [active, location.pathname]);

  if (!active) return children;
  const pct = 100 / scale;
  return (
    <div data-testid="fit-stage" data-scale={scale.toFixed(2)} className="fixed inset-0 overflow-hidden" style={{ background: '#02243F' }}>
      <div ref={ref} className="overflow-y-auto overflow-x-hidden"
        style={{ width: `${pct}vw`, height: `${pct}vh`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}
