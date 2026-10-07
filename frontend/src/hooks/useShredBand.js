// useShredBand — a self-contained Web-Audio backing band (drums + bass) for
// the Shred Legend game. Everything is SYNTHESIZED and sample-free so the
// groove is perfectly in time and works offline. Every song cycles chords
// that live in A-minor, which is exactly the key the guitar's pentatonic
// Notes strip is in, so whatever the kid plays on top sounds great.
//
// Exposes start(songIndex)/stop plus nearestEighthOffsetMs() so the game can
// score how "in the pocket" each guitar hit is against the beat grid, and a
// SONGS list so the kid can keep replaying to a fresh groove.

import { useCallback, useEffect, useRef } from 'react';

const SEC = (bpm) => 60 / bpm;
const STEPS_PER_BAR = 16;
const BARS = 4;
const TOTAL_STEPS = STEPS_PER_BAR * BARS; // 64

// A-minor friendly chord roots (low bass octave). Am=55, F=43.65, C=65.41,
// G=49, D=36.71, E=41.20.
export const SONGS = [
  { name: 'Garage Stomp', bpm: 96,  style: 'rock',     roots: [55.00, 43.65, 65.41, 49.00] },
  { name: 'Surf Riot',    bpm: 124, style: 'surf',     roots: [55.00, 65.41, 49.00, 43.65] },
  { name: 'Giant Stomp',  bpm: 82,  style: 'halftime', roots: [55.00, 49.00, 43.65, 49.00] },
];

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
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const nextStepTimeRef = useRef(0);
  const stepRef = useRef(0);
  const playingRef = useRef(false);
  const songRef = useRef(SONGS[0]);
  const stepSecRef = useRef(SEC(96) / 4);

  const kick = useCallback((t) => {
    const ctx = ctxRef.current, out = outRef.current;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.95, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g); g.connect(out);
    osc.start(t); osc.stop(t + 0.22);
  }, []);

  const snare = useCallback((t) => {
    const ctx = ctxRef.current, out = outRef.current;
    const src = ctx.createBufferSource();
    src.buffer = noiseRef.current;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    src.connect(bp); bp.connect(g); g.connect(out);
    src.start(t); src.stop(t + 0.16);
    const osc = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(180, t);
    g2.gain.setValueAtTime(0.25, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g2); g2.connect(out);
    osc.start(t); osc.stop(t + 0.11);
  }, []);

  const hat = useCallback((t, open = false) => {
    const ctx = ctxRef.current, out = outRef.current;
    const src = ctx.createBufferSource();
    src.buffer = noiseRef.current;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = ctx.createGain();
    const dur = open ? 0.12 : 0.04;
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(hp); hp.connect(g); g.connect(out);
    src.start(t); src.stop(t + dur + 0.02);
  }, []);

  // Warm, plucky electric/upright-style bass: a sine sub + triangle body
  // through a lowpass that opens on the pluck then rounds off. Much warmer
  // than a raw sawtooth.
  const bass = useCallback((t, freq, dur = 0.3) => {
    const ctx = ctxRef.current, out = outRef.current;
    const sub = ctx.createOscillator();
    const body = ctx.createOscillator();
    sub.type = 'sine'; sub.frequency.setValueAtTime(freq, t);
    body.type = 'triangle'; body.frequency.setValueAtTime(freq, t);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 1.0;
    lp.frequency.setValueAtTime(900, t);
    lp.frequency.exponentialRampToValueAtTime(300, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.6, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    sub.connect(lp); body.connect(lp); lp.connect(g); g.connect(out);
    sub.start(t); body.start(t);
    sub.stop(t + dur + 0.05); body.stop(t + dur + 0.05);
  }, []);

  const scheduleStep = useCallback((step, t) => {
    const song = songRef.current;
    const inBar = step % STEPS_PER_BAR;
    const bar = Math.floor(step / STEPS_PER_BAR) % BARS;
    const root = song.roots[bar];

    if (song.style === 'surf') {
      // Busy driving surf/punk: hats on every 16th, kick 0/8 + push 2/10,
      // snare backbeat 4/12.
      hat(t, inBar === 8);
      if (inBar === 0 || inBar === 8 || inBar === 2 || inBar === 10) kick(t);
      if (inBar === 4 || inBar === 12) snare(t);
      if (inBar === 0) bass(t, root, 0.3);
      if (inBar === 8) bass(t, root, 0.3);
      if (inBar === 6 || inBar === 14) bass(t, root * 1.5, 0.18);
    } else if (song.style === 'halftime') {
      // Big slow stomp: hats on 8ths, kick on 1 (+ pickup 10), snare on 3.
      if (inBar % 2 === 0) hat(t, inBar === 8);
      if (inBar === 0 || inBar === 10) kick(t);
      if (inBar === 8) snare(t);
      if (inBar === 0) bass(t, root, 0.55);
      if (inBar === 8) bass(t, root, 0.4);
      if (inBar === 12) bass(t, root * 1.5, 0.22);
    } else {
      // rock (default)
      if (inBar % 2 === 0) hat(t, inBar === 8);
      if (inBar === 0 || inBar === 8 || inBar === 11) kick(t);
      if (inBar === 4 || inBar === 12) snare(t);
      if (inBar === 0) bass(t, root, 0.4);
      if (inBar === 8) bass(t, root, 0.3);
      if (inBar === 11) bass(t, root * 1.5, 0.2);
      if (inBar === 14) bass(t, root * 2, 0.2);
    }
  }, [hat, kick, snare, bass]);

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
  }, [getAudioGraph, initAudioContext, tick]);

  const stop = useCallback(() => {
    playingRef.current = false;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // ms to the NEAREST 8th-note of the current groove grid (abs). Lower = tighter.
  const nearestEighthOffsetMs = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !playingRef.current) return 9999;
    const eighth = stepSecRef.current * 2;
    const elapsed = ctx.currentTime - startTimeRef.current;
    const nearest = Math.round(elapsed / eighth) * eighth;
    return Math.abs(elapsed - nearest) * 1000;
  }, []);

  useEffect(() => () => stop(), [stop]);

  // Stable object identity so consumers can safely use `band` in effect deps.
  const apiRef = useRef(null);
  if (!apiRef.current) apiRef.current = {};
  Object.assign(apiRef.current, {
    start, stop, nearestEighthOffsetMs,
    isPlaying: () => playingRef.current,
    songs: SONGS,
  });
  return apiRef.current;
}
