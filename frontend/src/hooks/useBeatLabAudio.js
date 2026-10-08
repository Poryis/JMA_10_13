// Beat Lab audio engine — loads & plays every Beat Lab voice (drums, scratch
// FX, and the melodic instruments: sax, bass, piano, guitar power chords).
// Everything routes through the shared master node from useAudio so the MP3
// recorder captures it. Samples are lazy-loaded per instrument the first time
// they're needed and cached for the life of the page.
import { useCallback, useRef } from 'react';

const noteFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// --- one-shot percussion / FX (reuse existing samples) ---
const DRUM_FILES = {
  kick: 'assets/audio/Bass drum - kick.mp3',
  snare: 'assets/audio/Snare.mp3',
  hihat: 'assets/audio/Hi Hat closed.mp3',
  crash: 'assets/audio/Crash cymbal.mp3',
  push: 'assets/audio/scratch-push.mp3',
  pushpull: 'assets/audio/scratch-push-pull.mp3',
};

// --- melodic sample banks (one file per note) ---
const SAX_NOTES = ['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5'];
const BASS_NOTES = ['A2','B2','C3','D3','E3','F3','G3','A3'];
const PIANO_NOTES = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5','B5','C6'];

const MELODY_FILES = {
  sax: SAX_NOTES.reduce((m, n) => { m[n] = `assets/audio/sax/${n}.mp3`; return m; }, {}),
  bass: BASS_NOTES.reduce((m, n) => { m[n] = `assets/audio/bass/${n}.mp3`; return m; }, {}),
  piano: PIANO_NOTES.reduce((m, n) => { m[n] = `assets/audio/${n}.mp3`; return m; }, {}),
};

// --- guitar power chords (built by stacking 3 real guitar samples) ---
const GUITAR_SEMITONES = [
  { midi: 48, file: 'C3.mp3' },  { midi: 49, file: 'Db3.mp3' }, { midi: 50, file: 'D3.mp3' },
  { midi: 51, file: 'Eb3.mp3' }, { midi: 52, file: 'E3.mp3' },  { midi: 53, file: 'F3.mp3' },
  { midi: 54, file: 'Gb3.mp3' }, { midi: 55, file: 'G3.mp3' },  { midi: 56, file: 'Ab3.mp3' },
  { midi: 57, file: 'A3.mp3' },  { midi: 58, file: 'Bb3.mp3' }, { midi: 59, file: 'B3.mp3' },
  { midi: 60, file: 'C4.mp3' },  { midi: 61, file: 'Db4.mp3' }, { midi: 62, file: 'D4.mp3' },
  { midi: 63, file: 'Eb4.mp3' }, { midi: 64, file: 'E4.mp3' },  { midi: 65, file: 'F4.mp3' },
  { midi: 66, file: 'Gb4.mp3' }, { midi: 67, file: 'G4.mp3' },  { midi: 68, file: 'Ab4.mp3' },
  { midi: 69, file: 'A4.mp3' },  { midi: 70, file: 'Bb4.mp3' }, { midi: 71, file: 'B4.mp3' },
  { midi: 72, file: 'C5.mp3' },  { midi: 74, file: 'D5.mp3' },  { midi: 76, file: 'E5.mp3' },
].map((s) => ({ ...s, freq: noteFreq(s.midi) }));

export const GUITAR_CHORDS = {
  Em: [82.41, 123.47, 164.81],
  F:  [87.31, 130.81, 174.61],
  G:  [98.00, 146.83, 196.00],
  Am: [110.00, 164.81, 220.00],
  C:  [130.81, 196.00, 261.63],
  Dm: [146.83, 220.00, 293.66],
};

function nearestGuitar(freq) {
  let best = GUITAR_SEMITONES[0], bestDist = Infinity;
  for (const s of GUITAR_SEMITONES) {
    const d = Math.abs(Math.log2(freq / s.freq));
    if (d < bestDist) { bestDist = d; best = s; }
  }
  return best;
}

export default function useBeatLabAudio(getAudioGraph, initAudioContext) {
  const buffersRef = useRef({});          // key -> AudioBuffer
  const loadedRef = useRef(new Set());    // which banks are loaded

  const decode = useCallback(async (ctx, url) => {
    const resp = await fetch(url);
    const arr = await resp.arrayBuffer();
    return ctx.decodeAudioData(arr);
  }, []);

  const loadMap = useCallback(async (prefix, fileMap) => {
    if (loadedRef.current.has(prefix)) return;
    loadedRef.current.add(prefix);
    const graph = getAudioGraph && getAudioGraph();
    if (!graph) { loadedRef.current.delete(prefix); return; }
    await Promise.all(Object.entries(fileMap).map(async ([note, url]) => {
      try { buffersRef.current[`${prefix}:${note}`] = await decode(graph.ctx, url); }
      catch (e) { /* missing sample — silent */ }
    }));
  }, [getAudioGraph, decode]);

  const preloadDrums = useCallback(() => loadMap('drum', DRUM_FILES), [loadMap]);

  const preloadInstrument = useCallback((inst) => {
    if (inst === 'guitar') {
      const map = GUITAR_SEMITONES.reduce((m, s) => { m[s.file.replace('.mp3', '')] = `assets/audio/guitar-crunch/${s.file}`; return m; }, {});
      return loadMap('gtr', map);
    }
    if (MELODY_FILES[inst]) return loadMap(inst, MELODY_FILES[inst]);
    return Promise.resolve();
  }, [loadMap]);

  const voice = useCallback((buffer, { rate = 1, gain = 0.8, startAt = 0 } = {}) => {
    const graph = getAudioGraph && getAudioGraph();
    if (!graph || !buffer) return;
    const { ctx, masterNode } = graph;
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buffer;
    src.playbackRate.value = rate;
    const t = ctx.currentTime + startAt;
    g.gain.setValueAtTime(gain, t);
    src.connect(g); g.connect(masterNode);
    src.start(t);
  }, [getAudioGraph]);

  const playDrum = useCallback((id) => {
    if (initAudioContext) initAudioContext();
    const gainMap = { kick: 0.95, snare: 0.85, hihat: 0.7, crash: 0.7, push: 0.8, pushpull: 0.8 };
    voice(buffersRef.current[`drum:${id}`], { gain: gainMap[id] ?? 0.8 });
  }, [voice, initAudioContext]);

  const playNote = useCallback((inst, note) => {
    if (initAudioContext) initAudioContext();
    if (inst === 'guitar') {
      const freqs = GUITAR_CHORDS[note];
      if (!freqs) return;
      freqs.forEach((f, i) => {
        const s = nearestGuitar(f);
        voice(buffersRef.current[`gtr:${s.file.replace('.mp3', '')}`], { rate: f / s.freq, gain: 0.5 - i * 0.03, startAt: i * 0.02 });
      });
      return;
    }
    const gainMap = { sax: 0.75, bass: 0.9, piano: 0.7 };
    voice(buffersRef.current[`${inst}:${note}`], { gain: gainMap[inst] ?? 0.8 });
  }, [voice, initAudioContext]);

  return { preloadDrums, preloadInstrument, playDrum, playNote };
}
