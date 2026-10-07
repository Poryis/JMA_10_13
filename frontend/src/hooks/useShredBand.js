// useShredBand — a self-contained Web-Audio backing band (drums + bass) for
// the Shred Legend game. Everything is SYNTHESIZED and sample-free so the
// groove is perfectly in time and works offline. A driving rock backbeat in
// A-minor cycles Am - F - C - G (one bar each), which is exactly the key the
// guitar's pentatonic Notes strip lives in, so whatever the kid plays on top
// sounds great.
//
// Exposes start/stop plus nearestEighthOffsetMs() so the game can score how
// "in the pocket" each guitar hit is against the band's beat grid.

import { useCallback, useEffect, useRef } from 'react';

const BPM = 96;
const SEC_PER_BEAT = 60 / BPM;          // 0.625s
const SEC_PER_16TH = SEC_PER_BEAT / 4;  // 0.15625s
const SEC_PER_8TH = SEC_PER_BEAT / 2;   // 0.3125s
const STEPS_PER_BAR = 16;
const BARS = 4;
const TOTAL_STEPS = STEPS_PER_BAR * BARS; // 64

// Bass root (low) for each bar's chord: Am, F, C, G.
const BAR_ROOTS = [55.00, 43.65, 65.41, 49.00];

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

  const kick = useCallback((t) => {
    const ctx = ctxRef.current, out = outRef.current;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(g); g.connect(out);
    osc.start(t); osc.stop(t + 0.2);
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
    // body tone
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
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(hp); hp.connect(g); g.connect(out);
    src.start(t); src.stop(t + dur + 0.02);
  }, []);

  const bass = useCallback((t, freq, dur = 0.26) => {
    const ctx = ctxRef.current, out = outRef.current;
    const osc = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(freq, t);
    lp.type = 'lowpass'; lp.frequency.value = 500;
    g.gain.setValueAtTime(0.0, t);
    g.gain.linearRampToValueAtTime(0.5, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(lp); lp.connect(g); g.connect(out);
    osc.start(t); osc.stop(t + dur + 0.02);
  }, []);

  const scheduleStep = useCallback((step, t) => {
    const inBar = step % STEPS_PER_BAR;
    const bar = Math.floor(step / STEPS_PER_BAR) % BARS;
    const root = BAR_ROOTS[bar];
    // Hi-hat on every 8th (even 16ths)
    if (inBar % 2 === 0) hat(t, inBar === 8);
    // Kick on beats 1 & 3 (+ a push on the "and" of 3)
    if (inBar === 0 || inBar === 8 || inBar === 11) kick(t);
    // Snare backbeat on 2 & 4
    if (inBar === 4 || inBar === 12) snare(t);
    // Bass: root on 1 & 3, octave-ish walk-up into the next bar
    if (inBar === 0) bass(t, root, 0.4);
    if (inBar === 8) bass(t, root, 0.3);
    if (inBar === 11) bass(t, root * 1.5, 0.2);   // fifth
    if (inBar === 14) bass(t, root * 2, 0.2);     // octave push
  }, [hat, kick, snare, bass]);

  const tick = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !playingRef.current) return;
    const lookahead = 0.12;
    while (nextStepTimeRef.current < ctx.currentTime + lookahead) {
      scheduleStep(stepRef.current % TOTAL_STEPS, nextStepTimeRef.current);
      nextStepTimeRef.current += SEC_PER_16TH;
      stepRef.current += 1;
    }
  }, [scheduleStep]);

  const start = useCallback(() => {
    if (initAudioContext) initAudioContext();
    const graph = getAudioGraph && getAudioGraph();
    if (!graph) return;
    ctxRef.current = graph.ctx;
    outRef.current = graph.masterNode;
    if (!noiseRef.current) noiseRef.current = noiseBuffer(graph.ctx);
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

  // ms to the NEAREST 8th-note of the groove grid (abs value). Lower = tighter.
  const nearestEighthOffsetMs = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !playingRef.current) return 9999;
    const elapsed = ctx.currentTime - startTimeRef.current;
    const nearest = Math.round(elapsed / SEC_PER_8TH) * SEC_PER_8TH;
    return Math.abs(elapsed - nearest) * 1000;
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { start, stop, nearestEighthOffsetMs, isPlaying: () => playingRef.current, bpm: BPM };
}
