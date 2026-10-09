// Campus Map — an underwater panorama per street. Pan sideways across a
// reef shelf; every room is a building with its host Jelly at the door,
// glowing windows, floating notes, kelp, fish and bubbles. Locked rooms go
// dark. Tapping an open door zooms into the building before the route changes.

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Music, ChevronsRight } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import BlimpFlyby from '../components/BlimpFlyby';
import UnderwaterBackdrop, { UNDERWATER_BG_COLOR } from '../components/UnderwaterBackdrop';
import AvatarSprite from '../components/AvatarSprite';
import { CAMPUS_ZONES, CAMPUS_BUILDINGS } from '../data/campus';
import useUnlocks from '../hooks/useUnlocks';
import { readAvatarOutfit } from '../hooks/useAvatar';
import { say, voiceEnabled } from '../lib/voice';

const slotFor = (w) => (w < 640 ? 220 : 300); // horizontal space per building (px)
const SHOUTS = ['Hey!', 'Come in!', 'Over here!', 'Woo!', 'Jam time!', 'Psst!'];

function isNight() { const h = new Date().getHours(); return h >= 20 || h < 5; }

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

// Flat, outlined kelp blade that sways.
function Kelp({ x, h, delay, color = '#2E9E6B' }) {
  return (
    <motion.svg viewBox="0 0 40 160" className="absolute bottom-0 pointer-events-none" style={{ left: x, width: 34, height: h, transformOrigin: 'bottom center' }}
      animate={{ rotate: [-6, 6, -6], skewX: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 3.6, delay, ease: 'easeInOut' }}>
      <path d="M20 160 C 2 130, 38 110, 20 80 C 2 50, 38 30, 20 0" stroke="#0A2540" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M20 160 C 2 130, 38 110, 20 80 C 2 50, 38 30, 20 0" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" />
    </motion.svg>
  );
}

function Coral({ x, color, size = 56 }) {
  return (
    <svg viewBox="0 0 60 60" className="absolute bottom-0 pointer-events-none" style={{ left: x, width: size, height: size }}>
      <g stroke="#0A2540" strokeWidth="4" fill={color} strokeLinejoin="round">
        <circle cx="30" cy="40" r="18" /><circle cx="14" cy="30" r="11" /><circle cx="46" cy="28" r="12" /><circle cx="30" cy="18" r="10" />
      </g>
    </svg>
  );
}

function Fish({ y, dur, delay, color, flip }) {
  return (
    <motion.svg viewBox="0 0 60 30" className="absolute pointer-events-none" style={{ top: y, width: 44, height: 22, left: 0 }}
      initial={{ x: flip ? '110vw' : '-10vw', scaleX: flip ? -1 : 1 }} animate={{ x: flip ? '-10vw' : '110vw' }} transition={{ repeat: Infinity, duration: dur, delay, ease: 'linear' }}>
      <g stroke="#0A2540" strokeWidth="3" fill={color}><ellipse cx="26" cy="15" rx="20" ry="11" /><path d="M44 15 L58 4 L58 26 Z" /></g>
      <circle cx="16" cy="12" r="2.5" fill="#0A2540" />
    </motion.svg>
  );
}

function Host({ src, shout }) {
  return (
    <motion.div className="absolute pointer-events-none" style={{ left: '-14%', bottom: 6, width: '30%', zIndex: 4 }}
      animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
      <AnimatePresence>
        {shout && (
          <motion.div key={shout.id} className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl px-2 py-0.5 text-[10px] md:text-xs font-black font-display"
            style={{ bottom: '104%', background: 'white', color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)', boxShadow: '0 2px 0 0 var(--jma-dark)' }}
            initial={{ opacity: 0, y: 8, scale: 0.6 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}>{shout.text}</motion.div>
        )}
      </AnimatePresence>
      <img src={src} alt="" draggable={false} className="w-full object-contain object-bottom" style={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.35))' }} />
    </motion.div>
  );
}

function Building({ b, index, locked, onEnter, shout, slot }) {
  const narrow = slot < 300;
  const [shake, setShake] = useState(0);
  const lift = index % 3 === 1 ? 54 : index % 3 === 2 ? 22 : 0; // varied depth on the shelf
  const scale = index % 3 === 1 ? 0.86 : 1;
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
      className={`absolute bottom-0 flex flex-col items-center bg-transparent border-0 p-0 touch-manipulation ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ left: (narrow ? 96 : 120) + index * slot, width: Math.round((narrow ? 170 : 230) * b.size * scale), marginBottom: (narrow ? 50 : 56) + (narrow ? lift * 0.7 : lift), zIndex: 10 - (index % 3) }}
      initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + index * 0.07, type: 'spring', stiffness: 200 }}
      whileHover={locked ? {} : { y: -6 }} whileTap={locked ? {} : { scale: 0.97 }}
    >
      <motion.div key={shake} animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.45 }} className="relative w-full">
        <motion.div className="relative w-full" style={{ aspectRatio: '1 / 1', filter: locked ? 'brightness(0.3) saturate(0.4)' : 'none', transition: 'filter 0.6s' }}
          animate={locked ? {} : { y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 3 + (index % 3), ease: 'easeInOut' }}>
          <img src={b.art} alt="" draggable={false} className="w-full h-full object-contain object-bottom" style={{ filter: 'drop-shadow(0 8px 0 rgba(2,36,63,0.45))' }} />
          {/* window glow pulsing to a beat */}
          <motion.span className="absolute rounded-full pointer-events-none" style={{ left: '38%', top: '38%', width: '24%', height: '18%', background: 'radial-gradient(circle, rgba(255,226,138,0.85) 0%, rgba(255,226,138,0) 70%)' }}
            animate={{ opacity: locked ? [0.2, 0.9, 0.2] : [0.35, 0.95, 0.35], scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: locked ? 2.6 : 0.9 + (index % 2) * 0.3 }} />
          {/* floating notes from the door */}
          {!locked && [0, 1, 2].map((n) => (
            <motion.span key={n} className="absolute pointer-events-none" style={{ left: `${44 + n * 10}%`, bottom: '22%', color: ['#FFCC00', '#FF2D85', '#4FC3F7'][n] }}
              animate={{ y: [0, -90 - n * 20], x: [0, (n % 2 ? 1 : -1) * 18], opacity: [0, 1, 0], rotate: [0, n % 2 ? 25 : -25] }}
              transition={{ repeat: Infinity, duration: 2.4 + n * 0.5, delay: n * 0.8 + (index % 3) * 0.4, ease: 'easeOut' }}>
              <Music className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
            </motion.span>
          ))}
          {!locked && b.host && <Host src={b.host} shout={shout} />}
        </motion.div>
        {locked && (
          <span data-testid={`campus-building-${b.id}-lock`} className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] md:text-[10px] font-black text-white whitespace-nowrap" style={{ background: 'rgba(10,37,64,0.92)', border: '2px solid white', zIndex: 6 }}>
            <Lock className="w-3 h-3" strokeWidth={3} /> Earn 1 badge
          </span>
        )}
      </motion.div>
      <span className="mt-1 rounded-full px-2.5 py-0.5 text-[10px] md:text-xs font-black font-display text-center leading-tight" style={{ background: 'white', color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)', boxShadow: '0 2px 0 0 var(--jma-dark)', opacity: locked ? 0.7 : 1 }}>
        {b.name}
      </span>
    </motion.button>
  );
}

export default function CampusMapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unlocked } = useUnlocks();
  const scroller = useRef(null);
  const [leaving, setLeaving] = useState(null);
  const [scrollX, setScrollX] = useState(0);
  const [shout, setShout] = useState(null); // { id, buildingId, text }
  const [hint, setHint] = useState(true);
  const zoneId = new URLSearchParams(location.search).get('zone') || 'play';
  const zone = CAMPUS_ZONES.find((z) => z.id === zoneId) || CAMPUS_ZONES[0];
  const buildings = useMemo(() => CAMPUS_BUILDINGS.filter((b) => b.zone === zone.id), [zone.id]);
  const night = useMemo(isNight, []);
  const avatar = useMemo(readAvatarOutfit, []);
  const [vw, setVw] = useState(window.innerWidth);
  useEffect(() => { const f = () => setVw(window.innerWidth); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  const slot = slotFor(vw);
  const width = 200 + buildings.length * slot;
  useAmbient(zone.ambient);

  // Hosts shout now and then.
  useEffect(() => {
    const iv = setInterval(() => {
      const open = buildings.filter((b) => unlocked || b.starter);
      if (!open.length) return;
      const b = open[Math.floor(Math.random() * open.length)];
      const s = { id: Date.now(), buildingId: b.id, text: SHOUTS[Math.floor(Math.random() * SHOUTS.length)] };
      setShout(s);
      setTimeout(() => setShout((cur) => (cur && cur.id === s.id ? null : cur)), 1600);
    }, 3200);
    return () => clearInterval(iv);
  }, [buildings, unlocked]);

  // Desktop drag-to-pan (touch uses native scrolling).
  const drag = useRef(null);
  const onPointerDown = (e) => { if (e.pointerType === 'mouse') drag.current = { x: e.clientX, left: scroller.current.scrollLeft }; };
  const onPointerMove = (e) => { if (drag.current) scroller.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x); };
  const onPointerUp = () => { drag.current = null; };

  const enter = (b) => {
    const el = document.querySelector(`[data-testid="campus-building-${b.id}"]`);
    const r = el ? el.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    setLeaving({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setTimeout(() => navigate(b.path), 520);
  };

  return (
    <div className="h-screen relative overflow-hidden" style={{ background: UNDERWATER_BG_COLOR }} data-testid="campus-map-page" data-zone={zone.id} data-sky={night ? 'night' : 'day'}>
      <UnderwaterBackdrop deep={night} />
      {night && <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(2,20,45,0.45)', zIndex: 1 }} />}
      <BlimpFlyby />
      <GameHeader title={`${zone.label} STREET`} showHomeButton={true} />

      {/* street name under the header title */}
      <div className="absolute inset-x-0 top-14 md:top-[72px] z-20 flex justify-center pointer-events-none">
        <div className="rounded-full px-3 py-0.5 text-[10px] md:text-xs font-black" style={{ background: zone.color, color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)', boxShadow: '0 2px 0 0 var(--jma-dark)' }}>{zone.street}</div>
      </div>

      {/* fish */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <Fish y="22%" dur={26} delay={0} color="#FF9500" />
        <Fish y="34%" dur={34} delay={6} color="#4FC3F7" flip />
        <Fish y="16%" dur={40} delay={14} color="#FFCC00" />
      </div>

      {/* swimming Jellies */}
      {(zone.strollers || []).slice(0, 2).map((src, i) => (
        <motion.img key={src} src={src} alt="" draggable={false} className="absolute pointer-events-none object-contain" style={{ top: `${26 + i * 12}%`, width: 'clamp(40px, 6vw, 70px)', zIndex: 3, left: 0 }}
          initial={{ x: i ? '100vw' : '-12vw', scaleX: i ? -1 : 1 }} animate={{ x: i ? '-12vw' : '100vw', y: [0, -14, 0, 10, 0] }}
          transition={{ x: { repeat: Infinity, duration: 38 + i * 9, ease: 'linear', delay: -i * 11 }, y: { repeat: Infinity, duration: 3, ease: 'easeInOut' } }} />
      ))}

      {/* panorama scroller */}
      <motion.div
        ref={scroller}
        data-testid="campus-panorama"
        className="absolute inset-x-0 bottom-0 overflow-x-auto overflow-y-hidden"
        style={{ top: 0, zIndex: 5, transformOrigin: leaving ? `${leaving.x}px ${leaving.y}px` : 'center', scrollbarWidth: 'none', cursor: 'grab', touchAction: 'pan-x' }}
        onScroll={(e) => { setScrollX(e.currentTarget.scrollLeft); if (hint) setHint(false); }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
        animate={leaving ? { scale: 2.6, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.6, 0, 0.8, 1] }}
      >
        <div className="relative h-full" style={{ width, minWidth: '100vw' }} data-testid="campus-shelf">
          {/* far reef (parallax) */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: '46%', transform: `translateX(${scrollX * 0.35}px)` }}>
            {[...Array(Math.ceil(width / 260) + 2)].map((_, i) => (
              <div key={i} className="absolute bottom-0 rounded-t-[50%]" style={{ left: i * 260 - 60, width: 300, height: 90 + (i % 3) * 60, background: night ? '#0A3356' : '#0E4A72', opacity: 0.85 }} />
            ))}
          </div>
          {/* sand shelf */}
          <svg className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: 120 }} viewBox={`0 0 ${width} 120`} preserveAspectRatio="none">
            <path d={`M0 60 Q ${width * 0.12} 30, ${width * 0.25} 58 T ${width * 0.5} 54 T ${width * 0.75} 60 T ${width} 50 L ${width} 120 L 0 120 Z`} fill="#0A2540" />
            <path d={`M0 68 Q ${width * 0.12} 38, ${width * 0.25} 66 T ${width * 0.5} 62 T ${width * 0.75} 68 T ${width} 58 L ${width} 120 L 0 120 Z`} fill={night ? '#B9A36E' : '#E9D28A'} />
          </svg>
          {/* back kelp + coral */}
          {buildings.map((b, i) => (
            <div key={`deco-${b.id}`}>
              <Kelp x={60 + i * slot} h={150 + (i % 2) * 40} delay={i * 0.4} />
              <Coral x={200 + i * slot + (i % 2) * 40} color={['#FF6B6B', '#FF9500', '#C8A8F2'][i % 3]} size={44 + (i % 2) * 16} />
            </div>
          ))}
          {/* the kid's Jelly at the street entrance */}
          <div className="absolute flex flex-col items-center" style={{ left: 16, bottom: 58, width: 64, zIndex: 9 }} data-testid="campus-you">
            <span className="rounded-full px-1.5 text-[9px] font-black text-white mb-0.5" style={{ background: '#FF2D85', border: '2px solid var(--jma-dark)' }}>YOU</span>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
              <AvatarSprite src={avatar.src} helmet={!!avatar.helmet} width={avatar.helmet ? 44 : 60} imgStyle={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.35))' }} />
            </motion.div>
          </div>
          {/* buildings */}
          {buildings.map((b, i) => (
            <Building key={b.id} b={b} index={i} slot={slot} locked={!unlocked && !b.starter} onEnter={enter} shout={shout && shout.buildingId === b.id ? shout : null} />
          ))}
          {/* near kelp (parallax, in front) */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: 140, transform: `translateX(${-scrollX * 0.25}px)`, zIndex: 12 }}>
            {[...Array(Math.ceil(width / 420) + 2)].map((_, i) => (
              <Kelp key={i} x={i * 420 + 150} h={120 + (i % 2) * 30} delay={i * 0.7} color="#1F7A4F" />
            ))}
          </div>
        </div>
      </motion.div>

      {/* swipe hint */}
      <AnimatePresence>
        {hint && buildings.length > 3 && (
          <motion.div data-testid="campus-swipe-hint" className="absolute bottom-6 right-4 z-20 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black pointer-events-none" style={{ background: 'white', color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1, x: [0, 8, 0] }} exit={{ opacity: 0 }} transition={{ x: { repeat: Infinity, duration: 1.2 } }}>
            Swipe to explore <ChevronsRight className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {leaving && (
        <motion.div data-testid="campus-door-transition" className="fixed inset-0 pointer-events-none" style={{ background: 'var(--jma-dark)', zIndex: 60 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.1 }} />
      )}
    </div>
  );
}
