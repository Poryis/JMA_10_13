// Campus Map — an underwater panorama per street built from the user's own
// scene layers (water, wave bands, sand dunes, seaweed, shells, fish).
// Pan sideways along the sea floor; every room is a building with its host
// Jelly at the door. Locked rooms go dark. Tap an open door and YOUR Jelly
// swims over, shrinks into the doorway, then the camera zooms in.

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Music, ChevronsRight } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import BlimpFlyby from '../components/BlimpFlyby';
import { Bubbles, Swimmer, SandStrip, Seaweed, UW_ASSETS, UNDERWATER_WATER, FRONT_TROUGH } from '../components/UnderwaterBackdrop';
import AvatarSprite from '../components/AvatarSprite';
import { CAMPUS_ZONES, CAMPUS_BUILDINGS } from '../data/campus';
import useUnlocks from '../hooks/useUnlocks';
import { readAvatarOutfit } from '../hooks/useAvatar';
import { say, voiceEnabled } from '../lib/voice';

// Shelf layouts: wide (tablet/desktop), narrow (phone portrait), short (phone landscape — little headroom).
const LAYOUTS = {
  wide:   { slot: 300, bw: 230, left: 120, sandBack: 190, sandFront: 118, floor: 56, lift: 1,    you: 64 },
  narrow: { slot: 220, bw: 170, left: 96,  sandBack: 130, sandFront: 84,  floor: 46, lift: 0.7,  you: 64 },
  short:  { slot: 176, bw: 132, left: 72,  sandBack: 84,  sandFront: 56,  floor: 30, lift: 0.4,  you: 46 },
};
const layoutFor = (w, h) => (h < 520 ? LAYOUTS.short : w < 640 ? LAYOUTS.narrow : LAYOUTS.wide);
const SHOUTS = ['Hey!', 'Come in!', 'Over here!', 'Woo!', 'Jam time!', 'Psst!'];
const YOU_LEFT = 16;

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

function Host({ src, shout }) {
  return (
    <motion.div className="absolute pointer-events-none flex flex-col items-center" style={{ left: '-12%', bottom: 6, height: '34%', zIndex: 4 }}
      animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
      <AnimatePresence>
        {shout && (
          <motion.div key={shout.id} className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl px-2 py-0.5 text-[10px] md:text-xs font-black font-display"
            style={{ bottom: '104%', background: 'white', color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)', boxShadow: '0 2px 0 0 var(--jma-dark)' }}
            initial={{ opacity: 0, y: 8, scale: 0.6 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}>{shout.text}</motion.div>
        )}
      </AnimatePresence>
      <img src={src} alt="" draggable={false} className="h-full w-auto object-contain object-bottom" style={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.35))' }} />
    </motion.div>
  );
}

// Tiny air bubbles leaking from the roofline — it's underwater after all.
function RoofBubbles({ index }) {
  return (
    <div aria-hidden="true" className="absolute pointer-events-none" style={{ left: '50%', top: '6%', zIndex: 3 }}>
      {[0, 1, 2].map((n) => (
        <motion.span key={n} className="absolute rounded-full" style={{ width: 5 + n * 3, height: 5 + n * 3, left: (n - 1) * 10, border: '1.5px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.25)' }}
          animate={{ y: [0, -70 - n * 15], x: [0, (n % 2 ? 8 : -8), 0], opacity: [0, 0.9, 0] }}
          transition={{ repeat: Infinity, duration: 3.6 + n * 0.7, delay: n * 1.1 + (index % 4) * 0.5, ease: 'easeOut' }} />
      ))}
    </div>
  );
}

function Building({ b, index, locked, onEnter, shout, L, entering }) {
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
      aria-label={b.name}
      onClick={handle}
      className={`absolute bottom-0 flex flex-col items-center bg-transparent border-0 p-0 touch-manipulation ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ left: L.left + index * L.slot, width: Math.round(L.bw * b.size * scale), marginBottom: L.floor + lift * L.lift, zIndex: 10 - (index % 3) }}
      initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1, scale: entering ? 1.04 : 1 }} transition={{ delay: entering ? 0 : 0.1 + index * 0.07, type: 'spring', stiffness: 200 }}
      whileHover={locked ? {} : { y: -6 }} whileTap={locked ? {} : { scale: 0.97 }}
    >
      <motion.div key={shake} animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.45 }} className="relative w-full">
        <motion.div className="relative w-full" style={{ aspectRatio: '1 / 1', filter: locked ? 'brightness(0.3) saturate(0.4)' : 'none', transition: 'filter 0.6s' }}
          animate={locked ? {} : { y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 3 + (index % 3), ease: 'easeInOut' }}>
          <img src={b.art} alt="" draggable={false} className="w-full h-full object-contain object-bottom" style={{ filter: 'drop-shadow(0 8px 0 rgba(2,36,63,0.35))' }} />
          {!locked && <RoofBubbles index={index} />}
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
    </motion.button>
  );
}

export default function CampusMapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unlocked } = useUnlocks();
  const scroller = useRef(null);
  const shelfRef = useRef(null);
  const [leaving, setLeaving] = useState(null);
  const [swim, setSwim] = useState(null); // { x, y, dur, buildingId }
  const [scrollX, setScrollX] = useState(0);
  const [shout, setShout] = useState(null); // { id, buildingId, text }
  const [hint, setHint] = useState(true);
  const zoneId = new URLSearchParams(location.search).get('zone') || 'play';
  const zone = CAMPUS_ZONES.find((z) => z.id === zoneId) || CAMPUS_ZONES[0];
  const buildings = useMemo(() => CAMPUS_BUILDINGS.filter((b) => b.zone === zone.id), [zone.id]);
  const night = useMemo(isNight, []);
  const avatar = useMemo(readAvatarOutfit, []);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => { const f = () => setVp({ w: window.innerWidth, h: window.innerHeight }); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  const L = layoutFor(vp.w, vp.h);
  const short = L === LAYOUTS.short;
  const { slot, sandBack, sandFront, floor } = L;
  const acc = short ? 0.62 : L === LAYOUTS.narrow ? 0.72 : 1; // accent art scale
  const width = 200 + buildings.length * slot;
  const youBottom = floor + 2;
  const YOU_W = L.you;
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

  const zoomIn = (b) => {
    const el = document.querySelector(`[data-testid="campus-building-${b.id}"]`);
    const r = el ? el.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    setLeaving({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setTimeout(() => navigate(b.path), 520);
  };

  // Your Jelly swims from the street entrance to the tapped door, then we go in.
  const enter = (b) => {
    if (swim || leaving) return;
    const el = shelfRef.current && shelfRef.current.querySelector(`[data-testid="campus-building-${b.id}"]`);
    if (!el) { zoomIn(b); return; }
    const door = { x: el.offsetLeft + el.offsetWidth * 0.5, bottom: (parseFloat(el.style.marginBottom) || 0) + el.offsetWidth * 0.1 };
    const dx = door.x - (YOU_LEFT + YOU_W / 2);
    const dy = -(door.bottom - youBottom);
    const dur = Math.min(1.5, Math.max(0.75, Math.abs(dx) / 800));
    setSwim({ x: dx, y: dy, dur, buildingId: b.id });
    setTimeout(() => zoomIn(b), dur * 1000 + 120);
  };

  const backAccents = useMemo(() => {
    const items = [];
    const n = Math.ceil((width + 400) / slot);
    for (let i = 0; i < n; i++) {
      const x = i * slot + (i % 2 ? 40 : 160);
      if (i % 2 === 0) items.push({ kind: 'weed', src: UW_ASSETS.seaweed2, x, w: Math.round(100 * acc), bottom: sandBack * 0.5, delay: i * 0.5 });
      else items.push({ kind: 'shell', src: UW_ASSETS.shell1, x, w: Math.round(90 * acc), bottom: sandBack * 0.42 });
    }
    return items;
  }, [width, slot, acc, sandBack]);

  const frontAccents = useMemo(() => {
    const items = [];
    const n = Math.ceil((width + 600) / (slot * 1.5));
    for (let i = 0; i < n; i++) {
      const x = i * slot * 1.5 + 200;
      items.push({ kind: 'weed', src: UW_ASSETS.seaweed1, x, w: Math.round(130 * acc), bottom: 0, delay: i * 0.7 });
      if (i % 2) items.push({ kind: 'shell', src: UW_ASSETS.shell2, x: x + Math.round(160 * acc), w: Math.round(48 * acc), bottom: 10 });
    }
    return items;
  }, [width, slot, acc]);

  return (
    <div className="h-screen relative overflow-hidden" style={{ background: UNDERWATER_WATER }} data-testid="campus-map-page" data-zone={zone.id} data-sky={night ? 'night' : 'day'}>
      {/* water + wave bands (user's layers) */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: '82%', zIndex: 0, backgroundImage: `url(${UW_ASSETS.bands})`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x', backgroundPosition: 'center bottom' }} />
      <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '32vh', zIndex: 0, background: 'linear-gradient(180deg, rgba(2,36,63,0.45) 0%, rgba(2,36,63,0.12) 60%, transparent 100%)' }} />
      <Bubbles className="absolute inset-0 z-[2]" />
      <BlimpFlyby />
      <GameHeader title={zone.label} showHomeButton={true} backTo="/home" />


      {/* the user's fish — every sprite faces the way it swims */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }} data-testid="campus-fish">
        <Swimmer src={UW_ASSETS.fishSchool} top="11%" dur={64} delay={18} width="clamp(90px, 10vw, 170px)" />
        <Swimmer src={UW_ASSETS.fish1} top="30%" dur={30} delay={6} width="clamp(40px, 5vw, 80px)" dir="left" />
        <Swimmer src={UW_ASSETS.fish2} top="20%" dur={24} delay={2} width="clamp(44px, 5vw, 84px)" />
        <Swimmer src={UW_ASSETS.fish1} top="44%" dur={38} delay={16} width="clamp(32px, 4vw, 64px)" />
      </div>

      {/* Surf Charlie paddles right, Snorkel Finn swims left */}
      {(zone.strollers || []).slice(0, 2).map((src, i) => (
        <Swimmer key={src} src={src} top={`${24 + i * 14}%`} dur={40 + i * 8} delay={i * 13} width="clamp(56px, 8vw, 100px)" dir={i ? 'left' : 'right'} bob={14} zIndex={4}
          style={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.25))' }} />
      ))}

      {night && <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(2,20,45,0.32)', zIndex: 4 }} />}

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
        <div ref={shelfRef} className="relative h-full" style={{ width, minWidth: '100vw' }} data-testid="campus-shelf">
          {/* back dune + its accents (parallax: drifts slower than the street) */}
          <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: width + 400, height: sandBack, transform: `translateX(${scrollX * 0.3}px)`, zIndex: 1 }} data-testid="campus-sand-back">
            <SandStrip src={UW_ASSETS.sandBack} height={sandBack} />
            {backAccents.map((a, i) => a.kind === 'weed'
              ? <Seaweed key={i} src={a.src} left={a.x} width={a.w} bottom={a.bottom} delay={a.delay} zIndex={2} />
              : <img key={i} src={a.src} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: a.x, width: a.w, bottom: a.bottom, zIndex: 2 }} />)}
          </div>
          {/* front dune — the street everyone stands on */}
          <SandStrip src={UW_ASSETS.sandFront} height={sandFront} shift={FRONT_TROUGH} style={{ zIndex: 3 }} />
          {/* the kid's Jelly at the street entrance — swims to the tapped door */}
          <motion.div className="absolute flex flex-col items-center" style={{ left: YOU_LEFT, bottom: youBottom, width: YOU_W, zIndex: 11 }} data-testid="campus-you" data-swimming={swim ? 'true' : 'false'}
            animate={swim ? { x: swim.x, y: swim.y, scale: [1, 0.9, 0.28], opacity: [1, 1, 1, 0] } : { x: 0, y: 0, scale: 1, opacity: 1 }}
            transition={swim ? { duration: swim.dur, ease: 'easeInOut', scale: { duration: swim.dur, times: [0, 0.7, 1] }, opacity: { duration: swim.dur, times: [0, 0.7, 0.92, 1] } } : { duration: 0 }}>
            <motion.span className="rounded-full px-1.5 text-[9px] font-black text-white mb-0.5" style={{ background: '#FF2D85', border: '2px solid var(--jma-dark)' }} animate={{ opacity: swim ? 0 : 1 }}>YOU</motion.span>
            <motion.div animate={swim ? { y: [0, -8, 0, -8, 0], rotate: [0, 6, 0, 6, 0] } : { y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: swim ? 0.7 : 1.6, ease: 'easeInOut' }}>
              <AvatarSprite src={avatar.src} helmet={!!avatar.helmet} width={Math.round((avatar.helmet ? 44 : 60) * (YOU_W / 64))} imgStyle={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.35))' }} />
            </motion.div>
          </motion.div>
          {/* buildings */}
          {buildings.map((b, i) => (
            <Building key={b.id} b={b} index={i} L={L} locked={!unlocked && !b.starter} onEnter={enter} entering={!!swim && swim.buildingId === b.id} shout={shout && shout.buildingId === b.id ? shout : null} />
          ))}
          {/* near seaweed + shells (parallax, in front) */}
          <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: width + 600, height: sandFront + 120, transform: `translateX(${-scrollX * 0.2}px)`, zIndex: 7 }} data-testid="campus-front-accents">
            {frontAccents.map((a, i) => a.kind === 'weed'
              ? <Seaweed key={i} src={a.src} left={a.x} width={a.w} bottom={a.bottom} delay={a.delay} />
              : <img key={i} src={a.src} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: a.x, width: a.w, bottom: a.bottom }} />)}
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
