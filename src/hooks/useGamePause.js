// Global "game pause" bus.
//
// Full-screen celebration overlays (rank-up) and the sticker toast register
// themselves as active while visible. Timer / sequence driven games read
// `isGamePaused()` inside their tick callbacks (or subscribe via the hook)
// so a badge popping up mid-play freezes the content underneath instead of
// letting the clock keep running — kids were getting "not fair" misses when
// a dialog covered the screen.

import { useEffect, useState } from 'react';

const activeKeys = new Set();
const subs = new Set();

export function setOverlayActive(key, active) {
  const was = activeKeys.size > 0;
  if (active) activeKeys.add(key);
  else activeKeys.delete(key);
  const now = activeKeys.size > 0;
  if (was !== now) subs.forEach((fn) => { try { fn(now); } catch (_) { /* ignore */ } });
}

export function isGamePaused() {
  return activeKeys.size > 0;
}

export function subscribeGamePause(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export default function useGamePaused() {
  const [paused, setPaused] = useState(isGamePaused());
  useEffect(() => subscribeGamePause(setPaused), []);
  return paused;
}
