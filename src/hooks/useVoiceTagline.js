// useVoiceTagline — speak a room's tagline once when the page mounts, then
// (optionally) Charlie's one-line how-to right after it finishes.
import { useEffect } from 'react';
import { say } from '../lib/voice';

export default function useVoiceTagline(id, howToId = null, delayMs = 450) {
  useEffect(() => {
    let cancelled = false;
    let timer = null;
    const sayHowTo = (gapMs) => {
      if (!howToId || cancelled) return;
      timer = setTimeout(() => { if (!cancelled) say(howToId, { minGapMs: 0 }); }, gapMs);
    };
    const started = say(id, { delayMs, minGapMs: 0, onDone: () => sayHowTo(400) });
    if (!started) sayHowTo(delayMs + 300);
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
