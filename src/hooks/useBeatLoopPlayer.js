// Loops a saved Beat Lab pattern through useAudio so kids can jam over it.
import { useCallback, useEffect, useRef, useState } from 'react';

// `lab` (useBeatLabAudio) replays the EXACT Beat Lab voices (sax, bass, guitar,
// piano, drums, scratches) via each track's id (= Beat Lab key, e.g. 'sax:C4').
export default function useBeatLoopPlayer({ playBellNote, playDrumSound, initAudioContext, lab }) {
  const [playingId, setPlayingId] = useState(null);
  const intervalRef = useRef(null);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setPlayingId(null);
  }, []);

  const start = useCallback(async (beat) => {
    stop();
    if (!beat || !beat.tracks?.length) return;
    initAudioContext();
    const useLab = !!lab && beat.tracks.every((t) => typeof t.id === 'string');
    if (useLab) {
      const insts = [...new Set(beat.tracks.filter((t) => t.id.includes(':')).map((t) => t.id.split(':')[0]))];
      try { await Promise.all([lab.preloadDrums(), ...insts.map((i) => lab.preloadInstrument(i))]); } catch (_) { /* play what loaded */ }
    }
    const playStep = (step) => {
      beat.tracks.forEach((t) => {
        if (!t.steps[step]) return;
        if (useLab) {
          if (t.id.includes(':')) { const [inst, note] = t.id.split(':'); lab.playNote(inst, note); }
          else lab.playDrum(t.id);
          return;
        }
        if (t.type === 'bell') playBellNote(t.note);
        else playDrumSound(t.note);
      });
    };
    let step = 0;
    playStep(0);
    intervalRef.current = setInterval(() => {
      step = (step + 1) % beat.totalSteps;
      playStep(step);
    }, (60 / beat.bpm / 4) * 1000);
    setPlayingId(beat.id);
  }, [stop, initAudioContext, playBellNote, playDrumSound, lab]);

  useEffect(() => stop, [stop]);

  return { start, stop, playingId };
}
