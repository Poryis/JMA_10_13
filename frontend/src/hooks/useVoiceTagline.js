// useVoiceTagline — speak a room's tagline once when the page mounts.
import { useEffect } from 'react';
import { say } from '../lib/voice';

export default function useVoiceTagline(id, delayMs = 450) {
  useEffect(() => {
    say(id, { delayMs, minGapMs: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
