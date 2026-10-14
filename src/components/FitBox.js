// FitBox — scales its content so it always fits inside its parent (and the
// viewport), never bigger than natural on-screen size. Used around results /
// end cards so a short phone-landscape screen can't cut them off.
import { useLayoutEffect, useRef, useState } from 'react';

export function FitBox({ children, className = '', inset = 16, testId }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [fit, setFit] = useState({ s: 1, h: 0 });

  useLayoutEffect(() => {
    const outer = outerRef.current, inner = innerRef.current;
    if (!outer || !inner) return undefined;
    const parent = outer.parentElement;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const w = inner.offsetWidth, h = inner.offsetHeight;
      if (!w || !h) return;
      const rect = parent.getBoundingClientRect();
      const stageScale = parent.clientHeight ? rect.height / parent.clientHeight : 1;
      const availW = parent.clientWidth - inset * 2;
      const availH = Math.min(parent.clientHeight, window.innerHeight / stageScale) - inset * 2;
      const s = Math.max(0.3, Math.min(availW / w, availH / h, 1 / stageScale));
      setFit((prev) => (Math.abs(prev.s - s) > 0.01 || prev.h !== h ? { s, h } : prev));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };
    const ro = new ResizeObserver(schedule);
    ro.observe(inner); ro.observe(parent);
    window.addEventListener('resize', schedule);
    schedule();
    return () => { ro.disconnect(); window.removeEventListener('resize', schedule); if (raf) cancelAnimationFrame(raf); };
  }, [inset]);

  const scaled = Math.abs(fit.s - 1) > 0.01;
  return (
    <div ref={outerRef} className={className} data-testid={testId} data-fit-scale={fit.s.toFixed(2)}
      style={{ position: 'relative', flexShrink: 0, height: scaled && fit.h ? fit.h * fit.s : undefined }}>
      <div ref={innerRef} style={{ transform: scaled ? `scale(${fit.s})` : undefined, transformOrigin: 'top center' }}>
        {children}
      </div>
    </div>
  );
}

export default FitBox;
