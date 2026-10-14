// useUnlocks — progressive reveal of the Academy.
//
// Brand-new kids see PLAY with three starter games. Everything else greys
// out until they earn their first badge (Polliwog → Tadpole), or a grown-up
// flips "Unlock everything" in the Sticker Book's Manage Progress panel.

import { useCallback, useEffect, useState } from 'react';
import { ALL_ACHIEVEMENT_IDS } from '../data/achievements';
import useRank from './useRank';
import { readEarnedStickers } from './useStickers';

export const UNLOCK_ALL_KEY = 'jma_unlock_all_v1';
export const REVEAL_SEEN_KEY = 'jma_reveal_seen_v1';

const listeners = new Set();
function notify() { listeners.forEach(fn => { try { fn(); } catch (_) {} }); }

export function readUnlockAll() {
  try { return localStorage.getItem(UNLOCK_ALL_KEY) === '1'; } catch (_) { return false; }
}

export function setUnlockAll(on) {
  try {
    localStorage.setItem(UNLOCK_ALL_KEY, on ? '1' : '0');
    if (on) localStorage.setItem(REVEAL_SEEN_KEY, '1');
  } catch (_) {}
  notify();
}

export function readRevealSeen() {
  try { return localStorage.getItem(REVEAL_SEEN_KEY) === '1'; } catch (_) { return false; }
}

export function markRevealSeen() {
  try { localStorage.setItem(REVEAL_SEEN_KEY, '1'); } catch (_) {}
  notify();
}

// Synchronous read for non-hook callers (quest picker).
export function readUnlockedSync() {
  if (readUnlockAll()) return true;
  const earned = readEarnedStickers();
  return ALL_ACHIEVEMENT_IDS.some(id => earned[id]);
}

export default function useUnlocks() {
  const { currentRank } = useRank();
  const [override, setOverride] = useState(readUnlockAll);
  const [revealSeen, setRevealSeen] = useState(readRevealSeen);

  useEffect(() => {
    const refresh = () => { setOverride(readUnlockAll()); setRevealSeen(readRevealSeen()); };
    listeners.add(refresh);
    return () => { listeners.delete(refresh); };
  }, []);

  const unlocked = override || currentRank.id !== 'polliwog';
  const revealPending = unlocked && !revealSeen;

  const dismissReveal = useCallback(() => markRevealSeen(), []);
  const toggleUnlockAll = useCallback(() => setUnlockAll(!readUnlockAll()), []);

  return { unlocked, override, revealPending, dismissReveal, toggleUnlockAll };
}
