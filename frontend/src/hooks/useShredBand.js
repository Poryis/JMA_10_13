// useShredBand — the Shred Legend backing band. Uses the app's OWN recorded
// drum samples (Bass drum, Snare, Hi-Hat, Crash) and a bass voiced from the
// app's clean-guitar sample pitched down an octave, so it sounds like the
// JMA world — not generic synth. One song ("Giant Stomp") keeps the punchy
// synth kit on purpose for variety. Everything is scheduled on a Web-Audio
// lookahead clock so it stays perfectly in time, and every song's chords live
// in A-minor to match the guitar's pentatonic Notes strip.

import { useCallback, useEffect, useRef } from 'react';

const SEC = (bpm) => 60 / bpm;
const STEPS_PER_BAR = 16;
const BARS = 4;
const TOTAL_STEPS = STEPS_PER_BAR * BARS; // 64

// A-minor friendly chord roots (low octave). Am=55, F=43.65, C=65.41, G=49.
export const SONGS = [
  { name: 'Garage Stomp',   bpm: 96,  style: 'rock',     kit: 'samples', roots: [55.00, 43.65, 65.41, 49.00] },
  { name: 'Surf Riot',      bpm: 126, style: 'surf',     kit: 'samples', roots: [55.00, 65.41, 49.00, 43.65] },
  { name: 'Giant Stomp',    bpm: 82,  style: 'halftime', kit: 'synth',   roots: [55.00, 49.00, 43.65, 49.00] },
  { name: 'Kindie Riot',    bpm: 168, style: 'punk',     kit: 'samples', roots: [55.00, 55.00, 43.65, 49.00] },
  { name: 'Alley Cat Strut',bpm: 104, style: 'rock',     kit: 'samples', roots: [55.00, 43.65, 49.00, 65.41] },
];

const SAMPLE_URLS = {
  kick:  'assets/audio/Bass drum - kick.mp3',
  snare: 'assets/audio/Snare.mp3',
  hihat: 'assets/audio/Hi Hat closed.mp3',
  crash: 'assets/audio/Crash cymbal.mp3',
  bass:  'assets/audio/guitar-clean/A3.mp3',   // 220Hz, pitched down for bass
};
const BASS_SAMPLE_FREQ = 220.0;

function noiseBuffer(ctx) {
  const len = Math.floor(ctx.sampleRate * 0.3);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export default function useShredBand(getAudioGraph, initAudioContext) {
  const ctxRef = useRef(null);
  const outRef = useRef(null);
  const noiseRef = useRef(null);
  const buffersRef = useRef({});        // decoded samples
  const loadedRef = useRef(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const nextStepTimeRef = useRef(0);
  const stepRef = useRef(0);
  const playingRef = useRef(false);
  const songRef = useRef(SONGS[0]);
  const stepSecRef = useRef(SEC(96) / 4);

  // ---- load the app's own samples (idempotent) ----
  const preload = useCallback(async () => {
    if (loadedRef.current) return;
    const graph = getAudioGraph && getAudioGraph();
    if (!graph) return;
    const ctx = graph.ctx;
    try {
      const entries = await Promise.all(
        Object.entries(SAMPLE_URLS).map(async ([k, url]) => {
          const res = await fetch(url);
          const arr = await res.arrayBuffer();
          const buf = await ctx.decodeAudioData(arr);
          return [k, buf];
        }),
      );
      entries.forEach(([k, buf]) => { buffersRef.current[k] = buf; });
      loadedRef.current = true;
    } catch (_) { /* fall back to synth */ }
  }, [getAudioGraph]);

  const playSample = useCallback((buf, t, gain = 1, rate = 1, dur = null) => {
    if (!buf) return;
    const ctx = ctxRef.current, out = outRef.current;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g); g.connect(out);
    src.start(t);
    if (dur) { try { src.stop(t + dur); } catch (_) {} }
  }, []);

  // ---- synthesized kit (fallback + 'Giant Stomp') ----
  const synthKick = useCallback((t) => {
    const ctx = ctxRef.current, out = outRef.current;
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.95, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g); g.connect(out); osc.start(t); osc.stop(t + 0.22);
  }, []);
  const synthSnare = useCallback((t) => {
    const ctx = ctxRef.current, out = outRef.current;
    const src = ctx.createBufferSource(); src.buffer = noiseRef.current;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    src.connect(bp); bp.connect(g); g.connect(out); src.start(t); src.stop(t + 0.16);
    const osc = ctx.createOscillator(); const g2 = ctx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(180, t);
    g2.gain.setValueAtTime(0.25, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g2); g2.connect(out); osc.start(t); osc.stop(t + 0.11);
  }, []);
  const synthHat = useCallback((t, open = false) => {
    const ctx = ctxRef.current, out = outRef.current;
    const src = ctx.createBufferSource(); src.buffer = noiseRef.current;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = ctx.createGain(); const dur = open ? 0.12 : 0.04;
    g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(hp); hp.connect(g); g.connect(out); src.start(t); src.stop(t + dur + 0.02);
  }, []);

  // ---- drum voices route to samples or synth depending on the song's kit ----
  const kick = useCallback((t) => {
    const b = buffersRef.current.kick;
    if (songRef.current.kit === 'samples' && b) playSample(b, t, 0.95);
    else synthKick(t);
  }, [playSample, synthKick]);
  const snare = useCallback((t) => {
    const b = buffersRef.current.snare;
    if (songRef.current.kit === 'samples' && b) playSample(b, t, 0.8);
    else synthSnare(t);
  }, [playSample, synthSnare]);
  const hat = useCallback((t, open = false) => {
    const b = buffersRef.current.hihat;
    if (songRef.current.kit === 'samples' && b) playSample(b, t, open ? 0.5 : 0.35);
    else synthHat(t, open);
  }, [playSample, synthHat]);
  const crash = useCallback((t) => {
    const b = buffersRef.current.crash;
    if (songRef.current.kit === 'samples' && b) playSample(b, t, 0.5);
  }, [playSample]);

  // ---- bass: the clean-guitar sample pitched down an octave (warm, real) ----
  const synthBass = useCallback((t, freq, dur = 0.3) => {
    const ctx = ctxRef.current, out = outRef.current;
    const sub = ctx.createOscillator(); const body = ctx.createOscillator();
    sub.type = 'sine'; sub.frequency.setValueAtTime(freq, t);
    body.type = 'triangle'; body.frequency.setValueAtTime(freq, t);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.0;
    lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.6, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    sub.connect(lp); body.connect(lp); lp.connect(g); g.connect(out);
    sub.start(t); body.start(t); sub.stop(t + dur + 0.05); body.stop(t + dur + 0.05);
  }, []);

  const bass = useCallback((t, rootFreq, dur = 0.3) => {
    const b = buffersRef.current.bass;
    if (b) {
      // Play the bass an octave up from the very low root so it sits in a
      // warm bass-guitar register (root*2), pitched from the 220Hz sample.
      const target = rootFreq * 2;
      const ctx = ctxRef.current, out = outRef.current;
      const src = ctx.createBufferSource(); src.buffer = b;
      src.playbackRate.value = target / BASS_SAMPLE_FREQ;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1600; lp.Q.value = 0.7;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0, t); g.gain.linearRampToValueAtTime(0.9, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
      src.connect(lp); lp.connect(g); g.connect(out);
      src.start(t); try { src.stop(t + dur + 0.3); } catch (_) {}
    } else {
      synthBass(t, rootFreq, dur);
    }
  }, [synthBass]);

  const scheduleStep = useCallback((step, t) => {
    const song = songRef.current;
    const inBar = step % STEPS_PER_BAR;
    const bar = Math.floor(step / STEPS_PER_BAR) % BARS;
    const root = song.roots[bar];

    if (song.style === 'punk') {
      // Fast driving punk: hats on 8ths, kick 1 & 3 + pickup, snare 2 & 4,
      // crash on the downbeat of bar 1.
      if (inBar % 2 === 0) hat(t);
      if (inBar === 0 || inBar === 8 || inBar === 14) kick(t);
      if (inBar === 4 || inBar === 12) snare(t);
      if (step === 0) crash(t);
      if (inBar === 0) bass(t, root, 0.26);
      if (inBar === 8) bass(t, root, 0.26);
      if (inBar === 4 || inBar === 12) bass(t, root, 0.2);
    } else if (song.style === 'surf') {
      hat(t, inBar === 8);
      if (inBar === 0 || inBar === 8 || inBar === 2 || inBar === 10) kick(t);
      if (inBar === 4 || inBar === 12) snare(t);
      if (step === 0) crash(t);
      if (inBar === 0) bass(t, root, 0.3);
      if (inBar === 8) bass(t, root, 0.3);
      if (inBar === 6 || inBar === 14) bass(t, root * 1.5, 0.18);
    } else if (song.style === 'halftime') {
      if (inBar % 2 === 0) hat(t, inBar === 8);
      if (inBar === 0 || inBar === 10) kick(t);
      if (inBar === 8) snare(t);
      if (inBar === 0) bass(t, root, 0.55);
      if (inBar === 8) bass(t, root, 0.4);
      if (inBar === 12) bass(t, root * 1.5, 0.22);
    } else {
      // rock
      if (inBar % 2 === 0) hat(t, inBar === 8);
      if (inBar === 0 || inBar === 8 || inBar === 11) kick(t);
      if (inBar === 4 || inBar === 12) snare(t);
      if (inBar === 0) bass(t, root, 0.4);
      if (inBar === 8) bass(t, root, 0.3);
      if (inBar === 11) bass(t, root * 1.5, 0.2);
      if (inBar === 14) bass(t, root * 2, 0.2);
    }
  }, [hat, kick, snare, crash, bass]);

  const tick = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !playingRef.current) return;
    const lookahead = 0.12;
    while (nextStepTimeRef.current < ctx.currentTime + lookahead) {
      scheduleStep(stepRef.current % TOTAL_STEPS, nextStepTimeRef.current);
      nextStepTimeRef.current += stepSecRef.current;
      stepRef.current += 1;
    }
  }, [scheduleStep]);

  const start = useCallback((songIndex = 0) => {
    if (initAudioContext) initAudioContext();
    const graph = getAudioGraph && getAudioGraph();
    if (!graph) return;
    ctxRef.current = graph.ctx;
    outRef.current = graph.masterNode;
    if (!noiseRef.current) noiseRef.current = noiseBuffer(graph.ctx);
    if (!loadedRef.current) preload();
    const song = SONGS[songIndex % SONGS.length];
    songRef.current = song;
    stepSecRef.current = SEC(song.bpm) / 4;
    const t0 = graph.ctx.currentTime + 0.12;
    startTimeRef.current = t0;
    nextStepTimeRef.current = t0;
    stepRef.current = 0;
    playingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, 25);
    tick();
  }, [getAudioGraph, initAudioContext, preload, tick]);

  const stop = useCallback(() => {
    playingRef.current = false;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const nearestEighthOffsetMs = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !playingRef.current) return 9999;
    const eighth = stepSecRef.current * 2;
    const elapsed = ctx.currentTime - startTimeRef.current;
    const nearest = Math.round(elapsed / eighth) * eighth;
    return Math.abs(elapsed - nearest) * 1000;
  }, []);

  useEffect(() => () => stop(), [stop]);

  const apiRef = useRef(null);
  if (!apiRef.current) apiRef.current = {};
  Object.assign(apiRef.current, {
    start, stop, preload, nearestEighthOffsetMs,
    isPlaying: () => playingRef.current,
    songs: SONGS,
  });
  return apiRef.current;
}
