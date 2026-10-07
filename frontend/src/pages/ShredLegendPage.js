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
const DECAY_PER_SEC = 7;

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

// A row of bouncing cartoon crowd silhouettes. `energy` (0-1) drives how
// high and fast they jump.
function CrowdRow({ energy }) {
  const heads = 14;
  return (
    <div className="absolute left-0 right-0 bottom-0 flex items-end justify-center gap-1 md:gap-2 pointer-events-none" style={{ zIndex: 5 }}>
      {Array.from({ length: heads }).map((_, i) => {
        const delay = (i % 5) * 0.05;
        const lift = 2 + energy * 16;
        return (
          <motion.svg
            key={i}
            width="34" height="54" viewBox="0 0 34 54"
            className="w-6 h-10 md:w-9 md:h-14"
            animate={{ y: [0, -lift, 0] }}
            transition={{ repeat: Infinity, duration: Math.max(0.28, 0.7 - energy * 0.4), delay, ease: 'easeInOut' }}
          >
            {/* raised arms */}
            <path d={`M8 34 L3 ${18 - energy * 8}`} stroke="#0A1420" strokeWidth="4" strokeLinecap="round" />
            <path d={`M26 34 L31 ${18 - energy * 8}`} stroke="#0A1420" strokeWidth="4" strokeLinecap="round" />
            {/* body + head */}
            <rect x="7" y="30" width="20" height="24" rx="8" fill="#0A1420" />
            <circle cx="17" cy="20" r="9" fill="#0A1420" />
          </motion.svg>
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

  // ---- guitar hit → score against the band grid ----
  const onGuitarPlay = useCallback(() => {
    if (screen !== 'playing' || pausedRef.current) return;
    const off = band.nearestEighthOffsetMs();
    let add, text, color;
    if (off <= 70) { add = 9; text = 'PERFECT!'; color = '#FFCC00'; }
    else if (off <= 140) { add = 5; text = 'NICE'; color = '#0FA3B1'; }
    else { add = 1.5; text = ''; color = '#9DA3A8'; }

    if (off <= 140) {
      comboRef.current += 1;
      inPocketRef.current += 1;
    } else {
      comboRef.current = 0;
    }
    setCombo(comboRef.current);
    const mult = 1 + Math.min(comboRef.current, 10) * 0.08;
    meterRef.current = Math.min(100, meterRef.current + add * mult);
    setMeter(meterRef.current);
    if (meterRef.current > peakRef.current) peakRef.current = meterRef.current;
    if (text) pushFloat(text + (comboRef.current > 3 ? ` x${comboRef.current}` : ''), color);

    // Tier-crossing cheers
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
  }, [screen, band, cheer, pushFloat]);

  // ---- song loop: countdown timer + meter decay ----
  useEffect(() => {
    if (screen !== 'playing') return;
    const iv = setInterval(() => {
      if (pausedRef.current) return;
      // decay
      meterRef.current = Math.max(0, meterRef.current - DECAY_PER_SEC * 0.1);
      setMeter(meterRef.current);
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
        backgroundImage: 'url(assets/backgrounds/shred-stage.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,20,32,0.35) 0%, rgba(10,20,32,0.15) 40%, rgba(10,20,32,0.6) 100%)' }} />

      <GameHeader title="SHRED LEGEND" showHomeButton={true} backLink={{ to: '/play', label: 'Play' }} />
      <FullscreenButton />

      {/* Crowd */}
      {(screen === 'playing' || screen === 'ready') && <CrowdRow energy={energy} />}

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

        {/* PLAYING HUD + guitar */}
        {(screen === 'playing') && (
          <div className="w-full max-w-[900px] flex flex-col items-center gap-2">
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
                  🔥 {combo} in a row!
                </div>
              )}
            </div>

            {/* Guitar */}
            <GuitarInstrument
              initAudioContext={initAudioContext}
              getAudioGraph={getAudioGraph}
              onPlay={onGuitarPlay}
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
