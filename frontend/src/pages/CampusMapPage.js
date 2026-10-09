// Campus Map — the Academy as a place. Three streets (PLAY / LEARN / CREATE),
// every room a building. Locked rooms go dark with a lit window; tapping an
// open door zooms the map into the building before the route changes.

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import BlimpFlyby from '../components/BlimpFlyby';
import { CAMPUS_ZONES, CAMPUS_BUILDINGS } from '../data/campus';
import useUnlocks from '../hooks/useUnlocks';
import { say, voiceEnabled } from '../lib/voice';

// Sky follows the clock: dawn → day → dusk → night.
function skyFor(hour) {
  if (hour >= 20 || hour < 5) return { top: '#0B1D3A', bottom: '#2B3F6B', night: true, label: 'night' };
  if (hour < 7)  return { top: '#F6A66B', bottom: '#FFD9A0', night: false, label: 'dawn' };
  if (hour < 17) return { top: '#8FD8FF', bottom: '#CDEFFF', night: false, label: 'day' };
  if (hour < 20) return { top: '#F08A5D', bottom: '#F9C784', night: false, label: 'dusk' };
  return { top: '#8FD8FF', bottom: '#CDEFFF', night: false, label: 'day' };
}

// Jellies strolling the sidewalk — flip to face their direction of travel.
function Strollers({ srcs }) {
  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: 70, zIndex: 5 }} data-testid="campus-strollers">
      {srcs.map((src, i) => {
        const dur = 22 + i * 7;
        return (
          <motion.div
            key={src}
            className="absolute bottom-1"
            style={{ left: 0, width: 'clamp(34px, 5vw, 56px)' }}
            initial={{ x: `${(i * 37) % 100}vw` }}
            animate={{ x: ['-10vw', '100vw', '-10vw'], scaleX: [1, 1, -1, -1, 1] }}
            transition={{
              x: { repeat: Infinity, duration: dur, ease: 'linear', times: [0, 0.5, 1], delay: -i * 9 },
              scaleX: { repeat: Infinity, duration: dur, times: [0, 0.49, 0.5, 0.99, 1], delay: -i * 9 },
            }}
          >
            <motion.img src={src} alt="" draggable={false} className="w-full object-contain object-bottom"
              animate={{ y: [0, -5, 0], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 0.55, ease: 'easeInOut' }} />
          </motion.div>
        );
      })}
    </div>
  );
}

// Low ambient loop per street; starts after the audio-unlock tap, stops on leave.
function useAmbient(src) {
  useEffect(() => {
    if (!src || !voiceEnabled()) return undefined;
    const a = new Audio(src); a.loop = true; a.volume = 0.22;
    const start = () => a.play().catch(() => {});
    let armed = false;
    try { if (sessionStorage.getItem('jma_audio_unlocked_v1') === '1') start(); else { armed = true; document.addEventListener('pointerdown', start, { once: true, capture: true }); } } catch (_) { start(); }
    return () => { a.pause(); if (armed) document.removeEventListener('pointerdown', start, { capture: true }); };
  }, [src]);
}

function Kiosk({ kiosk }) {
  return (
    <div className="relative flex flex-col items-center" style={{ width: '100%' }}>
      <div className="rounded-t-2xl w-[88%] h-4" style={{ background: kiosk.color, border: '3px solid var(--jma-dark)', borderBottom: 'none' }} />
      <div className="relative w-full rounded-2xl flex items-end justify-center" style={{ aspectRatio: '1 / 1.05', background: '#FFF6DD', border: '3px solid var(--jma-dark)', boxShadow: '0 5px 0 0 var(--jma-dark)' }}>
        <img src={kiosk.icon} alt="" draggable={false} className="object-contain object-bottom" style={{ width: '72%', height: '70%' }} />
      </div>
    </div>
  );
}

function Building({ b, index, locked, onEnter }) {
  const [shake, setShake] = useState(0);
  const handle = () => {
    if (locked) { setShake((s) => s + 1); say('charlie.hub.lockbadge'); return; }
    onEnter(b);
  };
  return (
    <motion.button
      type="button"
      data-testid={`campus-building-${b.id}`}
      data-locked={locked ? 'true' : 'false'}
      aria-disabled={locked}
      onClick={handle}
      className={`relative flex flex-col items-center bg-transparent border-0 p-0 ${locked ? 'cursor-not-allowed' : 'cursor-pointer'} touch-manipulation`}
      style={{ width: `clamp(${Math.round(100 * b.size)}px, ${Math.round(21 * b.size)}vw, ${Math.round(250 * b.size)}px)` }}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.08 + index * 0.06, type: 'spring', stiffness: 220 }}
      whileHover={locked ? {} : { y: -6 }}
      whileTap={locked ? {} : { scale: 0.96 }}
    >
      <motion.div
        key={shake}
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="relative w-full"
        style={{ filter: locked ? 'brightness(0.32) saturate(0.4)' : 'none', transition: 'filter 0.6s ease' }}
      >
        <div className="absolute left-[8%] right-[8%] rounded-[50%] pointer-events-none" style={{ bottom: -6, height: 14, background: 'rgba(10,37,64,0.22)' }} />
        {b.art
          ? <div className="w-full flex items-end justify-center" style={{ aspectRatio: '1 / 1' }}><img src={b.art} alt="" draggable={false} className="w-full h-full object-contain object-bottom" style={{ filter: 'drop-shadow(0 6px 0 rgba(10,37,64,0.35))' }} /></div>
          : <Kiosk kiosk={b.kiosk} />}
      </motion.div>
      {locked && (
        <>
          <motion.span
            className="absolute rounded-sm pointer-events-none"
            style={{ width: '14%', height: '10%', left: '43%', top: '48%', background: '#FFE28A', boxShadow: '0 0 18px 6px rgba(255,226,138,0.8)' }}
            animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 1.8 }}
          />
          <span data-testid={`campus-building-${b.id}-lock`} className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] md:text-[10px] font-black text-white whitespace-nowrap" style={{ background: 'rgba(10,37,64,0.92)', border: '2px solid white' }}>
            <Lock className="w-3 h-3" strokeWidth={3} /> Earn 1 badge
          </span>
        </>
      )}
      <span
        className="mt-1 rounded-full px-2 py-0.5 text-[10px] md:text-xs font-black font-display text-center leading-tight"
        style={{ background: 'white', color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)', boxShadow: '0 2px 0 0 var(--jma-dark)', opacity: locked ? 0.7 : 1 }}
      >
        {b.name}
      </span>
    </motion.button>
  );
}

function Street({ zone, buildings, locked, onEnter, refEl }) {
  return (
    <section ref={refEl} data-testid={`campus-zone-${zone.id}`} className="relative w-full min-h-[calc(100vh-56px)] flex flex-col justify-end pb-6" style={{ scrollMarginTop: 72 }}>
      {/* street sign */}
      <div className="relative z-10 flex items-center gap-2 px-3 md:px-6 pt-3">
        <div className="rounded-xl px-3 py-1 font-black font-display text-lg md:text-2xl" style={{ background: zone.color, color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}>{zone.label}</div>
        <div className="rounded-lg px-2 py-0.5 text-[10px] md:text-xs font-black text-white" style={{ background: 'var(--jma-dark)' }}>{zone.street}</div>
      </div>
      {/* ground */}
      <div className="relative mt-2 px-3 md:px-6 pb-6 rounded-t-[40px]" style={{ background: zone.ground, borderTop: '3px solid var(--jma-dark)' }}>
        <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-6 md:gap-x-8 pt-6">
          {buildings.map((b, i) => (
            <Building key={b.id} b={b} index={i} locked={locked && !b.starter} onEnter={onEnter} />
          ))}
        </div>
        {/* sidewalk */}
        <div className="absolute inset-x-0 bottom-0 h-3" style={{ background: 'repeating-linear-gradient(90deg, #E9DFC8 0 28px, #D6C9AC 28px 56px)', borderTop: '3px solid var(--jma-dark)' }} />
        <Strollers srcs={zone.strollers || []} />
      </div>
    </section>
  );
}

export default function CampusMapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unlocked } = useUnlocks();
  const [leaving, setLeaving] = useState(null); // { x, y, path }
  const zoneRefs = useRef({});
  const zoneId = new URLSearchParams(location.search).get('zone') || 'play';
  const zone = CAMPUS_ZONES.find((z) => z.id === zoneId) || CAMPUS_ZONES[0];
  const sky = useMemo(() => skyFor(new Date().getHours()), []);
  useAmbient(zone.ambient);
  useEffect(() => { window.scrollTo(0, 0); }, [zoneId]);

  const enter = (b) => {
    const el = document.querySelector(`[data-testid="campus-building-${b.id}"]`);
    const r = el ? el.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    setLeaving({ x: r.left + r.width / 2, y: r.top + r.height / 2, path: b.path });
    setTimeout(() => navigate(b.path), 520);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.bottom} 100%)` }} data-testid="campus-map-page" data-zone={zone.id} data-sky={sky.label}>
      {sky.night && [...Array(26)].map((_, i) => (
        <motion.span key={i} className="absolute rounded-full bg-white pointer-events-none" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 55}%`, width: i % 3 ? 2 : 3, height: i % 3 ? 2 : 3 }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.6 + (i % 5) * 0.4, delay: (i % 7) * 0.3 }} />
      ))}
      {sky.night ? (
        <motion.div data-testid="campus-sun-moon" data-kind="moon" className="absolute rounded-full pointer-events-none" style={{ right: '8%', top: 70, width: 'clamp(40px, 6vw, 64px)', height: 'clamp(40px, 6vw, 64px)', background: '#F4F1DE', border: '3px solid var(--jma-dark)', boxShadow: '0 0 24px 6px rgba(244,241,222,0.45)' }} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} />
      ) : (
        <motion.img data-testid="campus-sun-moon" data-kind="sun" src="assets/ui/sun.png" alt="" draggable={false} className="absolute pointer-events-none object-contain" style={{ right: '7%', top: 62, width: 'clamp(56px, 8vw, 96px)', filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.18))' }} animate={{ rotate: [0, 10, 0], y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }} />
      )}
      <BlimpFlyby />
      <GameHeader title={`${zone.label} STREET`} showHomeButton={true} />
      <motion.main
        className="relative pt-14 md:pt-16 max-w-6xl mx-auto"
        style={{ transformOrigin: leaving ? `${leaving.x}px ${leaving.y}px` : 'center' }}
        animate={leaving ? { scale: 2.6, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.6, 0, 0.8, 1] }}
      >
        {/* clouds */}
        {[12, 48, 78].map((x, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white/80" style={{ left: `${x}%`, top: 60 + i * 26, width: 90 + i * 20, height: 28 }} animate={{ x: [0, 18, 0] }} transition={{ repeat: Infinity, duration: 9 + i * 2, ease: 'easeInOut' }} />
        ))}
        <Street
          key={zone.id}
          zone={zone}
          refEl={(el) => { zoneRefs.current[zone.id] = el; }}
          buildings={CAMPUS_BUILDINGS.filter((b) => b.zone === zone.id)}
          locked={!unlocked}
          onEnter={enter}
        />
      </motion.main>
      {/* door-open dark iris */}
      {leaving && (
        <motion.div data-testid="campus-door-transition" className="fixed inset-0 pointer-events-none" style={{ background: 'var(--jma-dark)', zIndex: 60 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.1 }} />
      )}
    </div>
  );
}
