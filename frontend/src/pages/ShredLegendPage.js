import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, ChevronLeft } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import { FullscreenButton } from '../components/FullscreenButton';
import GuitarInstrument from '../components/GuitarInstrument';
import useAudio from '../hooks/useAudio';
import useShredBand, { SONGS } from '../hooks/useShredBand';
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

// The crowd is built from the JMA band's own characters (one each — no dupes)
// so it's 100% in the app's hand-drawn style. Per-character `scale` balances
// the wildly different source-PNG proportions so nobody towers over everyone.
const CROWD_MEMBERS = [
  { src: 'assets/characters/finn-danger.png', scale: 0.92 },
  { src: 'assets/characters/chunk.png',        scale: 1.00 },
  { src: 'assets/characters/jazzy.png',        scale: 0.88 },
  { src: 'assets/characters/charlie-punk.png', scale: 0.96 },
  { src: 'assets/characters/lou.png',          scale: 0.90 },
  { src: 'assets/characters/stew.png',         scale: 0.98 },
  { src: 'assets/characters/dr-jellybone.png', scale: 1.00 },
];

function CrowdRow({ energy }) {
  // Bucket the energy so the jump height/speed only change at a few
  // thresholds — continuously-changing framer targets caused the taller
  // sprites (Finn, Lou) to jitter/glitch while celebrating.
  const e = Math.round(energy * 3) / 3;
  const lift = 6 + e * 42;
  const dur = Math.max(0.28, 0.72 - e * 0.4);
  return (
    <div className="w-full h-full flex items-end justify-center gap-1 md:gap-3 pointer-events-none select-none">
      {CROWD_MEMBERS.map((m, i) => {
        const delay = (i % 4) * 0.07;
        const tilt = e * 5 * (i % 2 === 0 ? 1 : -1);
        return (
          <motion.img
            key={i}
            src={m.src}
            alt=""
            draggable={false}
            className="object-contain object-bottom"
            style={{ width: 'auto', height: `${Math.round(m.scale * 100)}%`, transformOrigin: 'bottom center', willChange: 'transform' }}
            animate={{ y: [0, -lift, 0], rotate: [0, tilt, 0] }}
            transition={{ repeat: Infinity, duration: dur, delay, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}

const LIGHT_PALETTES = {
  // per song STYLE: beam colors + glow + how fast/strobe-y
  punk:     { beams: ['rgba(255,40,40,0.40)', 'rgba(255,255,255,0.32)', 'rgba(255,40,40,0.40)'], glow: 'rgba(255,60,60,0.26)', strobe: true,  speed: 0.6 },
  surf:     { beams: ['rgba(15,180,190,0.34)', 'rgba(255,140,0,0.30)',  'rgba(15,180,190,0.34)'], glow: 'rgba(255,150,0,0.22)',  strobe: false, speed: 1.0 },
  halftime: { beams: ['rgba(120,90,255,0.34)', 'rgba(60,120,255,0.30)', 'rgba(170,80,255,0.32)'], glow: 'rgba(130,90,255,0.22)', strobe: false, speed: 1.3 },
  rock:     { beams: ['rgba(255,80,80,0.30)', 'rgba(255,204,0,0.28)',  'rgba(15,163,177,0.30)'], glow: 'rgba(255,204,0,0.22)',  strobe: false, speed: 1.0 },
};

function StageLights({ energy, style = 'rock' }) {
  const pal = LIGHT_PALETTES[style] || LIGHT_PALETTES.rock;
  const beams = [
    { color: pal.beams[0], x: '18%', delay: 0 },
    { color: pal.beams[1], x: '50%', delay: pal.strobe ? 0.12 : 0.6 },
    { color: pal.beams[2], x: '82%', delay: pal.strobe ? 0.06 : 1.2 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2, mixBlendMode: 'screen' }}>
      {beams.map((b, i) => (
        <motion.div
          key={i}
          className="absolute top-[-10%]"
          style={{
            left: b.x,
            width: '42vw',
            height: '120%',
            transformOrigin: 'top center',
            background: `linear-gradient(180deg, ${b.color} 0%, rgba(0,0,0,0) 72%)`,
            filter: 'blur(6px)',
          }}
          animate={pal.strobe
            ? { opacity: [0.2, 1, 0.2], rotate: i % 2 === 0 ? -12 : 12 }
            : { rotate: [i % 2 === 0 ? -16 : 16, i % 2 === 0 ? 16 : -16, i % 2 === 0 ? -16 : 16] }}
          transition={pal.strobe
            ? { repeat: Infinity, duration: Math.max(0.16, (0.4 - energy * 0.2) * pal.speed), delay: b.delay, ease: 'linear' }
            : { repeat: Infinity, duration: Math.max(2.4, (5 - energy * 2.4) * pal.speed), delay: b.delay, ease: 'easeInOut' }}
        />
      ))}
      <motion.div
        className="absolute left-1/2 top-[20%]"
        style={{
          width: '70vw', height: '55vh', transform: 'translateX(-50%)',
          background: `radial-gradient(ellipse at center, ${pal.glow} 0%, rgba(0,0,0,0) 65%)`,
        }}
        animate={{ opacity: [0.35 + energy * 0.5, 0.6 + energy * 0.4, 0.35 + energy * 0.5] }}
        transition={{ repeat: Infinity, duration: Math.max(0.5, 1.2 - energy), ease: 'easeInOut' }}
      />
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
  const [songIndex, setSongIndex] = useState(() => Math.floor(Math.random() * SONGS.length));

  const meterRef = useRef(0);
  const comboRef = useRef(0);
  const peakRef = useRef(0);
  const inPocketRef = useRef(0);
  const reachedLegendRef = useRef(false);
  const lastTierRef = useRef('Garage Band');
  const holdingRef = useRef(false);          // a note is being sustained
  const lastOnsetRef = useRef(0);            // time of last note hit (ms)
  const lastScoredRef = useRef(0);           // time of last hit that EARNED meter (ms)
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // Preload the app's drum + bass samples up front so the groove is ready.
  useEffect(() => { band.preload(); }, [band]);

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
    const now = performance.now();
    lastOnsetRef.current = now;
    const off = band.nearestEighthOffsetMs();
    const beatIdx = band.nearestEighthIndex();
    const onBeat = off <= 110;
    if (onBeat) { comboRef.current += 1; inPocketRef.current += 1; }
    else comboRef.current = 0;
    setCombo(comboRef.current);

    // ONE score per beat: mashing many notes inside the same 8th-note earns
    // nothing extra, so the meter can only climb as fast as you actually play
    // IN TIME. Tight hits are worth much more than sloppy ones.
    if (beatIdx === lastScoredRef.current) {
      if (onBeat) pushFloat(off <= 65 ? 'PERFECT!' : 'NICE!', off <= 65 ? '#FFCC00' : '#0FA3B1');
      return;
    }
    lastScoredRef.current = beatIdx;
    const add = off <= 65 ? 4 : (off <= 130 ? 2 : 0.8);
    bumpMeter(add);
    if (onBeat) pushFloat(off <= 65 ? 'PERFECT!' : 'NICE!', off <= 65 ? '#FFCC00' : '#0FA3B1');
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
        bumpMeter(0.6);          // ~6/sec sustained
      } else if (!recentlyPlayed) {
        meterRef.current = Math.max(0, meterRef.current - 1.1); // ~11/sec idle
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

  const startSong = useCallback((idx) => {
    initAudioContext();
    const chosen = (typeof idx === 'number') ? idx : Math.floor(Math.random() * SONGS.length);
    setSongIndex(chosen);
    meterRef.current = 0; comboRef.current = 0; peakRef.current = 0;
    inPocketRef.current = 0; reachedLegendRef.current = false; lastTierRef.current = 'Garage Band';
    holdingRef.current = false; lastOnsetRef.current = 0; lastScoredRef.current = -1;
    setMeter(0); setCombo(0); setTimeLeft(SONG_SECONDS);
    setScreen('ready'); setReadyCount(3);
  }, [initAudioContext]);

  // ready countdown 3-2-1 then start band + play
  useEffect(() => {
    if (screen !== 'ready') return;
    if (readyCount <= 0) {
      band.start(songIndex);
      setScreen('playing');
      return;
    }
    const t = setTimeout(() => setReadyCount((c) => c - 1), 650);
    return () => clearTimeout(t);
  }, [screen, readyCount, band, songIndex]);

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
        backgroundImage: 'url(assets/backgrounds/shred-stage-jma.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundColor: '#8A8F96',
      }}
    >
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,20,32,0) 0%, rgba(10,20,32,0) 55%, rgba(10,20,32,0.35) 100%)' }} />

      {(screen === 'playing' || screen === 'ready') && <StageLights energy={energy} style={SONGS[songIndex].style} />}

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
              <img src="assets/characters/charlie-punk.png" alt="" className="w-28 h-28 object-contain mx-auto mb-1" />
              <h1 className="font-black font-display text-white text-4xl leading-none mb-2">SHRED LEGEND</h1>
              <p className="text-xs mb-3" style={{ color: '#9DB4CC' }}>
                Pick your jam, then <span style={{ color: '#FFCC00' }}>solo</span> on the strip (no wrong notes!) and play in time to fill the <b>Crowd Meter</b>.
              </p>
              <div className="grid grid-cols-1 gap-2 mb-2" data-testid="shred-song-picker">
                {SONGS.map((s, i) => (
                  <button
                    key={s.name}
                    data-testid={`shred-song-${i}`}
                    onClick={() => startSong(i)}
                    className="w-full rounded-xl px-4 py-2.5 flex items-center justify-between font-black touch-manipulation border-2"
                    style={{ background: '#243854', borderColor: '#FFCC00', color: '#E8F4FF' }}
                  >
                    <span className="flex items-center gap-2"><Play className="w-4 h-4 fill-current" style={{ color: '#FFCC00' }} /> {s.name}</span>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: '#9DB4CC' }}>{s.bpm} bpm</span>
                  </button>
                ))}
              </div>
              <button
                data-testid="shred-start-btn"
                onClick={() => startSong()}
                className="chunky-btn text-[var(--jma-dark)] w-full px-6 py-3 flex items-center justify-center gap-2 text-lg font-black touch-manipulation"
                style={{ backgroundColor: '#FFCC00' }}
              >
                <Play className="w-5 h-5 fill-current" /> Surprise Me!
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
                <span className="text-xs font-black uppercase tracking-widest text-white/90" data-testid="shred-song-name">
                  ♪ {SONGS[songIndex].name}
                </span>
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

            {/* Reacting crowd (their own band characters) — fixed-height band
                pushed to sit right above the guitar so sizes stay consistent
                and nobody balloons while the guitar samples load. */}
            <div
              className="w-full mt-auto flex items-end justify-center"
              style={{ height: 'clamp(84px, 17vh, 140px)' }}
              data-testid="shred-crowd"
            >
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
                <img src="assets/characters/charlie-punk.png" alt="" className="w-32 h-32 object-contain mx-auto mb-1" />
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
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  data-testid="shred-again-btn"
                  onClick={() => startSong()}
                  className="chunky-btn text-[var(--jma-dark)] px-5 py-3 flex items-center gap-2 font-black touch-manipulation"
                  style={{ backgroundColor: '#FFCC00' }}
                >
                  <RotateCcw className="w-5 h-5" /> Random
                </button>
                <button
                  data-testid="shred-pick-btn"
                  onClick={() => setScreen('intro')}
                  className="chunky-btn bg-white text-[var(--jma-dark)] px-5 py-3 flex items-center gap-2 font-black touch-manipulation"
                >
                  <Play className="w-4 h-4 fill-current" /> Pick Song
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
