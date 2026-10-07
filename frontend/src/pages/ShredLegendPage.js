import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, ChevronLeft } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import { FullscreenButton } from '../components/FullscreenButton';
import GuitarInstrument from '../components/GuitarInstrument';
import useAudio from '../hooks/useAudio';
import useShredBand from '../hooks/useShredBand';
import useGamePaused from '../hooks/useGamePause';
import { earnAchievementUpTo, earnSticker } from '../hooks/useStickers';
import { useNavigate } from 'react-router-dom';

const SONG_SECONDS = 45;

// Crowd/rank tiers keyed off the Crowd Meter (0-100).
const TIERS = [
  { min: 0,  label: 'Garage Band', color: '#9DA3A8' },
  { min: 30, label: 'Opening Act', color: '#0FA3B1' },
  { min: 60, label: 'Headliner',   color: '#FF9500' },
  { min: 90, label: 'SHRED LEGEND', color: '#FFCC00' },
];

function tierFor(meter) {
  let t = TIERS[0];
  for (const tier of TIERS) if (meter >= tier.min) t = tier;
  return t;
}

// The crowd is built from the JMA band's own characters so it's 100% in the
// app's hand-drawn style. They bob to the music and go wild as the Crowd
// Meter climbs (higher + faster jumps, more head-bang tilt with energy).
const CROWD_MEMBERS = [
  'assets/characters/finn-danger.png',
  'assets/characters/chunk.png',
  'assets/characters/jazzy.png',
  'assets/characters/charlie.png',
  'assets/characters/stew.png',
  'assets/characters/lou.png',
  'assets/characters/sharky-hiphop.png',
  'assets/characters/dr-jellybone.png',
  'assets/characters/shark.png',
];

function CrowdRow({ energy }) {
  return (
    <div className="w-full h-full flex items-end justify-center gap-0 md:gap-1 pointer-events-none select-none">
      {CROWD_MEMBERS.map((src, i) => {
        const delay = (i % 4) * 0.07;
        const lift = 6 + energy * 42;                 // jump height
        const dur = Math.max(0.26, 0.72 - energy * 0.42); // jump speed
        const tilt = energy * 6 * (i % 2 === 0 ? 1 : -1); // head-bang
        return (
          <motion.img
            key={i}
            src={src}
            alt=""
            draggable={false}
            className="object-contain object-bottom drop-none"
            style={{
              width: 'clamp(42px, 10vw, 104px)',
              height: '100%',
              marginLeft: i === 0 ? 0 : '-1.5%',
              filter: 'drop-shadow(0 -2px 0 rgba(0,0,0,0.15))',
            }}
            animate={{ y: [0, -lift, 0], rotate: [0, tilt, 0] }}
            transition={{ repeat: Infinity, duration: dur, delay, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}

export default function ShredLegendPage() {
  const navigate = useNavigate();
  const { getAudioGraph, initAudioContext } = useAudio();
  const band = useShredBand(getAudioGraph, initAudioContext);
  const paused = useGamePaused();

  const [screen, setScreen] = useState('intro');   // intro | ready | playing | result
  const [meter, setMeter] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SONG_SECONDS);
  const [floats, setFloats] = useState([]);         // floating feedback words
  const [readyCount, setReadyCount] = useState(3);

  const meterRef = useRef(0);
  const comboRef = useRef(0);
  const peakRef = useRef(0);
  const inPocketRef = useRef(0);
  const reachedLegendRef = useRef(false);
  const lastTierRef = useRef('Garage Band');
  const holdingRef = useRef(false);          // a note is being sustained
  const lastOnsetRef = useRef(0);            // time of last note hit (ms)
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // ---- crowd cheer SFX (synth noise swell) ----
  const cheer = useCallback((big = false) => {
    const graph = getAudioGraph && getAudioGraph();
    if (!graph) return;
    const { ctx, masterNode } = graph;
    const len = Math.floor(ctx.sampleRate * (big ? 1.1 : 0.6));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.6;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = big ? 1400 : 1000; bp.Q.value = 0.6;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(big ? 0.5 : 0.3, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, t + (big ? 1.0 : 0.55));
    src.connect(bp); bp.connect(g); g.connect(masterNode);
    src.start(t); src.stop(t + (big ? 1.1 : 0.6));
  }, [getAudioGraph]);

  const pushFloat = useCallback((text, color) => {
    const id = Date.now() + Math.random();
    setFloats((f) => [...f, { id, text, color }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 750);
  }, []);

  // ---- guitar NOTE HIT (onset) → always adds energy; a little extra sparkle
  // if it lands on the beat. The crowd just loves that you're PLAYING. ----
  const onGuitarPlay = useCallback(() => {
    if (screen !== 'playing' || pausedRef.current) return;
    lastOnsetRef.current = performance.now();
    const off = band.nearestEighthOffsetMs();
    const onBeat = off <= 140;
    comboRef.current = onBeat ? comboRef.current + 1 : 0;
    if (onBeat) inPocketRef.current += 1;
    setCombo(comboRef.current);

    // Base energy for any hit, plus an on-beat sparkle bonus. Never negative.
    const add = 6 + (onBeat ? 4 : 0);
    bumpMeter(add);
    if (onBeat) pushFloat(off <= 70 ? 'PERFECT!' : 'NICE!', off <= 70 ? '#FFCC00' : '#0FA3B1');
  }, [screen, band, pushFloat]);

  // Shared meter-raise + tier/cheer handling.
  const bumpMeter = useCallback((amount) => {
    meterRef.current = Math.min(100, meterRef.current + amount);
    setMeter(meterRef.current);
    if (meterRef.current > peakRef.current) peakRef.current = meterRef.current;
    const tier = tierFor(meterRef.current).label;
    if (tier !== lastTierRef.current) {
      const prevIdx = TIERS.findIndex((t) => t.label === lastTierRef.current);
      const newIdx = TIERS.findIndex((t) => t.label === tier);
      if (newIdx > prevIdx) cheer(tier === 'SHRED LEGEND');
      lastTierRef.current = tier;
    }
    if (meterRef.current >= 100 && !reachedLegendRef.current) {
      reachedLegendRef.current = true;
      cheer(true);
    }
  }, [cheer]);

  // Parent gets told when a note is held (sustained) vs released.
  const onGuitarActive = useCallback((active) => {
    holdingRef.current = active;
  }, []);

  // ---- song loop: countdown timer + sustain fill / idle decay ----
  useEffect(() => {
    if (screen !== 'playing') return;
    const iv = setInterval(() => {
      if (pausedRef.current) return;
      const now = performance.now();
      const recentlyPlayed = now - lastOnsetRef.current < 350;
      if (holdingRef.current) {
        // Sustained soaring note → crowd keeps rising. This is the fix for
        // "holding a note felt bad" — now it's rewarded.
        bumpMeter(1.4);          // ~14/sec
      } else if (!recentlyPlayed) {
        // Only drift down when the kid has actually gone quiet.
        meterRef.current = Math.max(0, meterRef.current - 0.8); // ~8/sec
        setMeter(meterRef.current);
      }
    }, 100);
    const sec = setInterval(() => {
      if (pausedRef.current) return;
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(sec); endSong(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { clearInterval(iv); clearInterval(sec); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const beginReady = useCallback(() => {
    initAudioContext();
    meterRef.current = 0; comboRef.current = 0; peakRef.current = 0;
    inPocketRef.current = 0; reachedLegendRef.current = false; lastTierRef.current = 'Garage Band';
    holdingRef.current = false; lastOnsetRef.current = 0;
    setMeter(0); setCombo(0); setTimeLeft(SONG_SECONDS);
    setScreen('ready'); setReadyCount(3);
  }, [initAudioContext]);

  // ready countdown 3-2-1 then start band + play
  useEffect(() => {
    if (screen !== 'ready') return;
    if (readyCount <= 0) {
      band.start();
      setScreen('playing');
      return;
    }
    const t = setTimeout(() => setReadyCount((c) => c - 1), 650);
    return () => clearTimeout(t);
  }, [screen, readyCount, band]);

  const endSong = useCallback(() => {
    band.stop();
    setScreen('result');
    // Award rhythm achievement ladder + the Shred Legend collectible.
    if (inPocketRef.current >= 8) earnAchievementUpTo('rhythm', 'cadet');
    if (peakRef.current >= 60) earnAchievementUpTo('rhythm', 'pro');
    if (reachedLegendRef.current) {
      earnAchievementUpTo('rhythm', 'master');
      earnSticker('shred_legend');
    }
  }, [band]);

  useEffect(() => () => band.stop(), [band]);

  const currentTier = tierFor(meter);
  const energy = Math.min(1, meter / 100);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      data-testid="shred-legend-page"
      style={{
        backgroundImage: 'url(assets/backgrounds/jelly-stage.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundColor: '#8A8F96',
      }}
    >
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,20,32,0) 0%, rgba(10,20,32,0) 55%, rgba(10,20,32,0.35) 100%)' }} />

      <GameHeader title="SHRED LEGEND" showHomeButton={true} backLink={{ to: '/play', label: 'Play' }} />
      <FullscreenButton />

      {/* Crowd during the 3-2-1 countdown (sits on stage, bottom layer) */}
      {screen === 'ready' && (
        <div className="absolute left-0 right-0 bottom-0" style={{ height: '38vh', maxHeight: 300, zIndex: 6 }}>
          <CrowdRow energy={0.15} />
        </div>
      )}

      {/* Floating feedback */}
      <AnimatePresence>
        {floats.map((f) => (
          <motion.div
            key={f.id}
            className="absolute left-1/2 top-[38%] font-black pointer-events-none"
            style={{ color: f.color, textShadow: '0 2px 0 #0A1420', fontSize: '28px', zIndex: 30 }}
            initial={{ y: 0, opacity: 0, scale: 0.6, x: '-50%' }}
            animate={{ y: -50, opacity: 1, scale: 1.1, x: '-50%' }}
            exit={{ opacity: 0, y: -70 }}
            transition={{ duration: 0.5 }}
          >
            {f.text}
          </motion.div>
        ))}
      </AnimatePresence>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-end pt-16 pb-2 px-2">
        {/* INTRO */}
        {screen === 'intro' && (
          <div className="flex-1 flex items-center justify-center w-full">
            <motion.div
              data-testid="shred-intro-card"
              className="max-w-md w-full text-center rounded-3xl px-6 py-7"
              style={{ background: 'rgba(16,24,38,0.92)', border: '4px solid #FFCC00', boxShadow: '0 8px 0 0 #0A1420' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            >
              <img src="assets/stickers/shred-legend-badge.png" alt="" className="w-28 h-28 object-contain mx-auto mb-2" />
              <h1 className="font-black font-display text-white text-4xl leading-none mb-2">SHRED LEGEND</h1>
              <p className="text-sm font-bold mb-1" style={{ color: '#FFE7C2' }}>
                The band's locked in. Grab your axe and <span style={{ color: '#FFCC00' }}>solo</span> over the groove.
              </p>
              <p className="text-xs mb-4" style={{ color: '#9DB4CC' }}>
                Play in time with the beat to fill the <b>Crowd Meter</b>. On the pentatonic strip there are no wrong notes — just shred!
              </p>
              <button
                data-testid="shred-start-btn"
                onClick={beginReady}
                className="chunky-btn text-[var(--jma-dark)] px-6 py-3 flex items-center gap-2 text-lg font-black mx-auto touch-manipulation"
                style={{ backgroundColor: '#FFCC00' }}
              >
                <Play className="w-5 h-5 fill-current" /> Take the Stage
              </button>
            </motion.div>
          </div>
        )}

        {/* READY countdown */}
        {screen === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center z-40">
            <motion.div
              key={readyCount}
              initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ opacity: 0 }}
              className="font-black font-display text-white"
              style={{ fontSize: '120px', textShadow: '0 4px 0 #0A1420' }}
              data-testid="shred-ready-count"
            >
              {readyCount > 0 ? readyCount : 'GO!'}
            </motion.div>
          </div>
        )}

        {/* PLAYING HUD + crowd + guitar */}
        {(screen === 'playing') && (
          <div className="w-full max-w-[900px] flex-1 flex flex-col items-center gap-2">
            {/* Crowd meter */}
            <div className="w-full max-w-[640px]" data-testid="shred-crowd-meter">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-white/90">Crowd Meter</span>
                <span className="text-sm font-black uppercase tracking-wider" style={{ color: currentTier.color }} data-testid="shred-tier-label">
                  {currentTier.label}
                </span>
                <span className="text-xs font-black text-white/90" data-testid="shred-timeleft">{timeLeft}s</span>
              </div>
              <div className="relative w-full h-5 rounded-full overflow-hidden" style={{ background: 'rgba(10,20,32,0.8)', border: '3px solid #0A1420' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, #0FA3B1, #FF9500, #FFCC00)` }}
                  animate={{ width: `${meter}%` }}
                  transition={{ duration: 0.12 }}
                  data-testid="shred-meter-fill"
                />
                {TIERS.slice(1).map((t) => (
                  <div key={t.label} className="absolute top-0 bottom-0" style={{ left: `${t.min}%`, width: 2, background: 'rgba(255,255,255,0.4)' }} />
                ))}
              </div>
              {combo > 3 && (
                <div className="text-center mt-1 text-xs font-black" style={{ color: '#FFCC00' }} data-testid="shred-combo">
                  {combo} IN A ROW!
                </div>
              )}
            </div>

            {/* Reacting crowd (their own band characters) — fills the space
                between the meter and the guitar so it's always visible. */}
            <div className="flex-1 w-full min-h-[90px] flex items-end justify-center" data-testid="shred-crowd">
              <CrowdRow energy={energy} />
            </div>

            {/* Guitar */}
            <GuitarInstrument
              initAudioContext={initAudioContext}
              getAudioGraph={getAudioGraph}
              onPlay={onGuitarPlay}
              onActiveChange={onGuitarActive}
            />
          </div>
        )}

        {/* RESULT */}
        {screen === 'result' && (
          <div className="flex-1 flex items-center justify-center w-full">
            <motion.div
              data-testid="shred-result-card"
              className="max-w-md w-full text-center rounded-3xl px-6 py-7"
              style={{ background: 'rgba(16,24,38,0.95)', border: `4px solid ${tierFor(peakRef.current).color}`, boxShadow: '0 8px 0 0 #0A1420' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            >
              {reachedLegendRef.current && (
                <img src="assets/stickers/shred-legend-badge.png" alt="" className="w-28 h-28 object-contain mx-auto mb-1" />
              )}
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#9DB4CC' }}>You played the</p>
              <h1 className="font-black font-display text-4xl leading-none mb-2" style={{ color: tierFor(peakRef.current).color }} data-testid="shred-result-tier">
                {tierFor(peakRef.current).label}
              </h1>
              <p className="text-sm font-bold text-white mb-1">
                {reachedLegendRef.current
                  ? 'You maxed the Crowd Meter — the place went NUTS!'
                  : `${inPocketRef.current} notes right in the pocket.`}
              </p>
              <p className="text-xs mb-4" style={{ color: '#9DB4CC' }}>
                {reachedLegendRef.current ? 'Shred Legend sticker unlocked!' : 'Keep the beat longer to fill the meter all the way!'}
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  data-testid="shred-again-btn"
                  onClick={beginReady}
                  className="chunky-btn text-[var(--jma-dark)] px-5 py-3 flex items-center gap-2 font-black touch-manipulation"
                  style={{ backgroundColor: '#FFCC00' }}
                >
                  <RotateCcw className="w-5 h-5" /> Encore!
                </button>
                <button
                  data-testid="shred-back-btn"
                  onClick={() => navigate('/play')}
                  className="chunky-btn bg-white text-[var(--jma-dark)] px-5 py-3 flex items-center gap-2 font-black touch-manipulation"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
