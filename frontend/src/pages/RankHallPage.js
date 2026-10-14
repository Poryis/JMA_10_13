// RankHallPage — inside the Bandstand. The kid's own avatar stands center stage
// under a spotlight, the band cheers from the pit, the trophy shelf of ranks sits
// behind, and "TAKE A BOW!" sets off the crowd. Tap a trophy → Charlie explains it.
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Lock, BookOpen, Hand, Heart, Music, VolumeX } from 'lucide-react';
import { RANKS } from '../data/ranks';
import { ACHIEVEMENT_STICKERS } from '../data/achievements';
import useRank from '../hooks/useRank';
import useStickers from '../hooks/useStickers';
import { useStreetMusic } from './CampusMapPage';
import { readAvatarOutfit } from '../hooks/useAvatar';
import AvatarSprite from '../components/AvatarSprite';
import Confetti from '../components/Confetti';
import { GameHeader } from '../components/GameUI';
import HowRanksWorkModal from '../components/HowRanksWorkModal';
import { StageLights, CrowdRow, CROWD_SHOUTS } from './ShredLegendPage';

const CURTAIN = 'repeating-linear-gradient(90deg, #C2173A 0 18px, #8E0C22 18px 36px)';
const FANFARE = ['C4', 'E4', 'G4', 'C5'];
const HALL_TRACKS = [{ src: 'assets/music/magic.mp3', title: 'Magic' }, { src: 'assets/music/brand-new-friend.mp3', title: 'Brand New Friend' }];
const OVATION_AT = 3;

// Camera flashes + hearts/notes rising from the pit on every bow.
function CrowdBurst({ id, big }) {
  const n = big ? 18 : 9;
  const items = Array.from({ length: n }, (_, i) => ({ x: 6 + ((i * 37 + id * 13) % 88), d: (i % 5) * 0.12, heart: i % 3 !== 0 }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 8 }} aria-hidden="true">
      {items.map((it, i) => (
        <motion.span key={`${id}-${i}`} className="absolute" style={{ left: `${it.x}%`, bottom: '16%', color: it.heart ? '#FF2D85' : '#FFCC00' }}
          initial={{ y: 0, opacity: 0, scale: 0.4 }} animate={{ y: [0, -140 - (i % 4) * 40], opacity: [0, 1, 1, 0], scale: [0.4, 1.1, 1, 0.8], x: [0, (i % 2 ? 1 : -1) * (12 + (i % 3) * 10)] }} transition={{ duration: 1.5 + it.d, delay: it.d, ease: 'easeOut' }}>
          {it.heart ? <Heart className="w-5 h-5" fill="currentColor" strokeWidth={0} /> : <Music className="w-5 h-5" strokeWidth={3} />}
        </motion.span>
      ))}
      {Array.from({ length: big ? 10 : 5 }, (_, i) => (
        <motion.span key={`f${id}-${i}`} className="absolute rounded-full bg-white" style={{ left: `${10 + ((i * 53 + id * 7) % 80)}%`, bottom: `${3 + (i % 3) * 5}%`, width: 14, height: 14, boxShadow: '0 0 24px 10px rgba(255,255,255,0.9)' }}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.25, delay: 0.15 + i * 0.18 }} />
      ))}
    </div>
  );
}

// Scrolling ticker of the badges this kid has actually earned.
function BadgeTicker({ names }) {
  const text = names.length ? names.map((n) => `★ ${n}`).join('   ') + '   ' : '★ Earn badges in the games to light up this hall   ';
  return (
    <div className="absolute right-0 overflow-hidden pointer-events-none" style={{ left: 96, top: 'calc(13% + 6px)', height: 18, zIndex: 3 }} data-testid="rank-hall-ticker">
      <motion.div className="whitespace-nowrap font-black text-[11px] tracking-wider" style={{ color: '#FFE8A3', textShadow: '0 1px 0 rgba(0,0,0,0.6)' }}
        animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: Math.max(14, names.length * 4), ease: 'linear' }}>
        {text}{text}
      </motion.div>
    </div>
  );
}

function playFanfare() {
  FANFARE.forEach((n, i) => setTimeout(() => { const a = new Audio(`assets/audio/${n}.mp3`); a.volume = 0.5; a.play().catch(() => {}); }, i * 110));
}

function Trophy({ rank, state, index, onPick, picked }) {
  const reached = state !== 'future';
  return (
    <motion.button type="button" onClick={() => onPick(rank, state)} data-testid={`rank-hall-trophy-${rank.id}`} data-state={state}
      className="relative flex flex-col items-center bg-transparent border-0 p-0 cursor-pointer" style={{ width: 'clamp(52px, 7vw, 76px)' }}
      initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + index * 0.06, type: 'spring', stiffness: 220 }}
      whileHover={{ y: -4 }} whileTap={{ scale: 0.92 }}>
      <div className="relative rounded-full flex items-center justify-center overflow-hidden" style={{ width: '80%', aspectRatio: '1', background: reached ? rank.badgeBg : '#0F2238', border: `3px solid ${reached ? rank.color : '#2B4660'}`, boxShadow: state === 'current' || picked ? `0 0 0 3px #FFCC00, 0 0 18px ${rank.color}` : reached ? `0 3px 0 0 ${rank.color}` : 'none' }}>
        <img src={rank.icon} alt="" draggable={false} className="w-[82%] h-[82%] object-contain" style={{ filter: reached ? 'none' : 'brightness(0) opacity(0.45)' }} />
        {!reached && <Lock className="absolute w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} strokeWidth={3} />}
      </div>
      <span className="w-full mt-0.5 rounded-sm text-[8px] md:text-[9px] font-black text-center leading-tight py-0.5" style={{ background: '#2B1A0C', color: reached ? '#FFE8A3' : 'rgba(255,232,163,0.4)', border: '1px solid #000' }}>{rank.title}</span>
    </motion.button>
  );
}

export default function RankHallPage() {
  const navigate = useNavigate();
  const { currentRank, nextRank, progress, achievementCount } = useRank();
  const { earned } = useStickers();
  const badgeNames = ACHIEVEMENT_STICKERS.filter((a) => earned[a.id]).map((a) => a.name);
  const { nowPlaying, muted, toggleMute } = useStreetMusic(HALL_TRACKS);
  const curIdx = RANKS.findIndex((r) => r.id === currentRank.id);
  const avatar = readAvatarOutfit();
  const host = /charlie/.test(avatar.src) ? { src: 'assets/characters/dr-jellybone.png', name: 'Dr. Jellybone' } : { src: 'assets/characters/charlie.png', name: 'Charlie' };
  const [howOpen, setHowOpen] = useState(false);
  const [bow, setBow] = useState(0);
  const [energy, setEnergy] = useState(0.3);
  const [shouts, setShouts] = useState([]);
  const [confetti, setConfetti] = useState(0);
  const [bubble, setBubble] = useState(`Welcome to the Rank Hall, ${currentRank.title}! Tap a trophy, or take a bow!`);
  const [hype, setHype] = useState(0);
  const [ovation, setOvation] = useState(false);
  const [spotX, setSpotX] = useState(50);
  const timers = useRef([]);
  const hypeTimer = useRef(null);
  useEffect(() => () => { timers.current.forEach(clearTimeout); clearTimeout(hypeTimer.current); }, []);

  const takeBow = useCallback(() => {
    const nextHype = hype + 1;
    const big = nextHype >= OVATION_AT;
    setBow((b) => b + 1); setEnergy(1); setConfetti((c) => c + 1); playFanfare();
    if (big) { timers.current.push(setTimeout(playFanfare, 500)); setOvation(true); setHype(0); timers.current.push(setTimeout(() => setOvation(false), 3200)); }
    else setHype(nextHype);
    clearTimeout(hypeTimer.current); hypeTimer.current = setTimeout(() => setHype(0), 7000);
    const members = big ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 2, 4, 6];
    setShouts(members.map((m, i) => ({ id: Date.now() + i, member: m, text: CROWD_SHOUTS[(m + i + bow) % CROWD_SHOUTS.length] })));
    setBubble(big ? 'STANDING OVATION! They love you!' : ['The crowd goes wild!', 'Encore! Encore!', 'That bow had STYLE, kid.', 'Hear that? That\'s all for you.', 'One more and they\'ll stand up!'][Math.min(hype, 4)]);
    timers.current.push(setTimeout(() => { setEnergy(0.3); setShouts([]); }, big ? 4200 : 2600));
  }, [bow, hype]);

  // Tap anywhere on the boards → the spotlight swings over there, then drifts back to you.
  const aimSpot = (e) => {
    if (e.target.closest('button')) return;
    const x = Math.max(12, Math.min(88, (e.clientX / window.innerWidth) * 100));
    setSpotX(x);
    timers.current.push(setTimeout(() => setSpotX(50), 2600));
  };

  const pickTrophy = (rank, state) => {
    if (state === 'future') setBubble(`${rank.title} — ${rank.requirement.label}. You'll get there!`);
    else if (state === 'current') setBubble(`${rank.title}: ${rank.blurb}`);
    else setBubble(`${rank.title} — you've already earned this one. ${rank.blurb}`);
  };

  return (
    <div className="relative overflow-hidden" data-testid="rank-hall-page" onPointerDown={aimSpot} style={{ height: '100dvh', minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 20%, #1E3A5C 0%, #0B1E33 55%, #060F1C 100%)' }}>
      <StageLights energy={energy} style="halftime" />
      <BadgeTicker names={badgeNames} />
      <GameHeader title="Rank Hall" showHomeButton={true} backTo="/home" />

      {/* curtain valance */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '13%', background: CURTAIN, borderBottom: '4px solid #FFCC00', boxShadow: 'inset 0 -16px 24px rgba(0,0,0,0.45)', zIndex: 2 }} />

      {/* marquee: your rank in lights */}
      <motion.div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-1 whitespace-nowrap" data-testid="rank-hall-marquee"
        style={{ top: '13%', marginTop: -16, zIndex: 6, background: 'radial-gradient(circle, #FFF2A8 0 2.5px, rgba(255,255,255,0) 3.5px) 1px 1px / 14px 14px, var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <span className="rounded-full px-3 py-0.5 font-black font-display text-sm md:text-base" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }}>
          <Star className="inline w-4 h-4 -mt-0.5 mr-1" strokeWidth={3} />{currentRank.title.toUpperCase()}<Star className="inline w-4 h-4 -mt-0.5 ml-1" strokeWidth={3} />
        </span>
      </motion.div>

      {/* now playing / mute */}
      {nowPlaying && (
        <button type="button" data-testid="rank-hall-now-playing" data-muted={muted ? 'true' : 'false'} onClick={toggleMute} aria-label={muted ? 'Unmute music' : 'Mute music'}
          className="rank-hall-music absolute flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black cursor-pointer" style={{ right: '2%', top: 'calc(13% + 28px)', zIndex: 6, background: 'rgba(10,37,64,0.85)', color: 'white', border: '2px solid white', boxShadow: '0 3px 0 0 rgba(0,0,0,0.35)', opacity: muted ? 0.7 : 1 }}>
          {muted ? <VolumeX className="w-3.5 h-3.5" strokeWidth={3} /> : <motion.span animate={{ rotate: [-12, 12, -12] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}><Music className="w-3.5 h-3.5" strokeWidth={3} /></motion.span>}
          <span style={{ textDecoration: muted ? 'line-through' : 'none' }}>{nowPlaying}</span>
        </button>
      )}

      {/* trophy shelf behind the stage */}
      <div className="rank-hall-shelf absolute left-1/2 -translate-x-1/2 w-[min(92vw,760px)] rounded-2xl px-2 pt-2 pb-1" data-testid="rank-hall-shelf"
        style={{ top: '21%', zIndex: 3, background: 'linear-gradient(180deg, #8B5A2B 0%, #6E4320 100%)', border: '3px solid var(--jma-dark)', boxShadow: 'inset 0 4px 0 rgba(255,255,255,0.12), 0 5px 0 0 var(--jma-dark)' }}>
        <div className="flex justify-center gap-1 md:gap-2">
          {RANKS.map((r, i) => <Trophy key={r.id} rank={r} index={i} state={i < curIdx ? 'reached' : i === curIdx ? 'current' : 'future'} onPick={pickTrophy} />)}
        </div>
      </div>

      {/* stage floor */}
      <div aria-hidden="true" className="absolute inset-x-0 pointer-events-none" style={{ bottom: '18%', height: '16%', background: 'repeating-linear-gradient(90deg, #A67B4C 0 60px, #8B6540 60px 62px)', borderTop: '4px solid var(--jma-dark)', boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.35)', zIndex: 2 }} />

      {/* spotlight + YOU */}
      <motion.div aria-hidden="true" className="absolute pointer-events-none" style={{ bottom: '30%', width: 'min(60vw, 520px)', height: '62%', zIndex: 3, x: '-50%', clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)', background: ovation ? 'linear-gradient(180deg, rgba(255,240,180,0.0) 0%, rgba(255,240,180,0.4) 60%, rgba(255,240,180,0.6) 100%)' : 'linear-gradient(180deg, rgba(255,240,180,0.0) 0%, rgba(255,240,180,0.22) 60%, rgba(255,240,180,0.35) 100%)' }}
        animate={{ left: `${spotX}%` }} transition={{ type: 'spring', stiffness: 60, damping: 14 }} data-testid="rank-hall-spotlight" />
      <motion.button type="button" data-testid="rank-hall-you" onClick={takeBow} aria-label="Take a bow"
        className="rank-hall-you absolute left-1/2 -translate-x-1/2 bg-transparent border-0 p-0 cursor-pointer flex flex-col items-center" style={{ bottom: '31%', zIndex: 5, height: '40%' }}>
        <motion.div key={bow} className="h-full flex items-end" style={{ transformOrigin: 'bottom center' }}
          animate={bow ? { rotate: [0, 0, -22, -22, 0], y: [0, -26, 0, 0, 0] } : { y: [0, -4, 0] }} transition={bow ? { duration: 1.4, times: [0, 0.2, 0.45, 0.8, 1] } : { repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}>
          <AvatarSprite src={avatar.src} helmet={!!avatar.helmet} className="h-full w-auto" imgStyle={{ height: '100%', width: 'auto', filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.45))' }} />
        </motion.div>
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-black text-white whitespace-nowrap" style={{ background: '#FF2D85', border: '2px solid var(--jma-dark)' }}>YOU</span>
      </motion.button>

      {/* Charlie, the host, with a speech bubble */}
      <div className="rank-hall-host absolute flex items-end gap-2" style={{ left: '3%', bottom: '31%', zIndex: 5, height: '34%' }}>
        <img src={host.src} alt={host.name} draggable={false} className="h-full w-auto object-contain" style={{ filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.4))' }} />
        <AnimatePresence mode="wait">
          <motion.div key={bubble} data-testid="rank-hall-bubble" className="rank-hall-bubble relative mb-[55%] rounded-2xl px-3 py-2 text-[11px] md:text-sm font-bold leading-snug bg-white" style={{ color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)', width: 'clamp(150px, 20vw, 240px)' }}
            initial={{ opacity: 0, scale: 0.7, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}>
            {bubble}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* next rank — the applause meter */}
      <div className="rank-hall-next absolute rounded-2xl px-3 py-2" data-testid="rank-hall-next" style={{ right: '3%', bottom: '36%', zIndex: 5, width: 'clamp(180px, 24vw, 280px)', background: 'rgba(5,15,28,0.85)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}>
        {nextRank ? (
          <>
            <div className="flex items-center justify-between gap-2 text-[11px] md:text-xs font-black text-white">
              <span>Next: {nextRank.title}</span><span style={{ color: '#FFCC00' }}>{progress.current}/{progress.target}</span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #FFCC00, #FF9500)' }} initial={{ width: 0 }} animate={{ width: `${progress.pct}%` }} transition={{ delay: 0.4, duration: 0.8 }} />
            </div>
            <div className="mt-1 text-[10px] font-bold text-white/70 leading-tight">{nextRank.requirement.label}</div>
          </>
        ) : <div className="text-xs font-black text-white">Maestro! Every rank earned — {achievementCount} badges strong.</div>}
      </div>

      {/* buttons on the lip of the stage */}
      <div className="rank-hall-actions absolute left-1/2 -translate-x-1/2 flex flex-nowrap justify-center gap-2 whitespace-nowrap" style={{ bottom: '19.5%', zIndex: 6 }}>
        <motion.button type="button" data-testid="rank-hall-bow" onClick={takeBow} className="chunky-btn px-4 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: '#FF2D85', color: 'white' }}
          animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}><Hand className="w-4 h-4" strokeWidth={3} /> TAKE A BOW!
          <span className="flex items-center gap-0.5 ml-1" data-testid="rank-hall-hype" data-hype={hype}>{Array.from({ length: OVATION_AT }, (_, i) => <Heart key={i} className="w-3 h-3" fill={i < hype ? 'white' : 'none'} strokeWidth={3} />)}</span></motion.button>
        <button type="button" data-testid="rank-hall-how" onClick={() => setHowOpen(true)} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black" style={{ background: 'white', color: 'var(--jma-dark)' }}>How do ranks work?</button>
        <button type="button" data-testid="rank-hall-stickers" onClick={() => navigate('/sticker-book')} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }}><BookOpen className="w-4 h-4" strokeWidth={3} /> Sticker Shack</button>
      </div>

      {/* the band cheers from the pit */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: '20%', zIndex: 7 }}>
        <CrowdRow energy={energy} burstId={bow} shouts={shouts} />
      </div>

      {bow > 0 && <CrowdBurst key={`burst-${bow}`} id={bow} big={ovation} />}
      <AnimatePresence>
        {ovation && (
          <motion.div key="ovation" data-testid="rank-hall-ovation" className="absolute left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl font-black font-display text-2xl md:text-4xl whitespace-nowrap"
            style={{ top: '38%', zIndex: 30, background: '#FFCC00', color: 'var(--jma-dark)', border: '4px solid var(--jma-dark)', boxShadow: '0 6px 0 0 var(--jma-dark)' }}
            initial={{ scale: 0, rotate: -8 }} animate={{ scale: [0, 1.2, 1], rotate: [-8, 4, -2] }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.6 }}>
            STANDING OVATION!
          </motion.div>
        )}
      </AnimatePresence>
      {confetti > 0 && <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 40 }}><Confetti key={confetti} mega testId="rank-hall-confetti" /></div>}
      <HowRanksWorkModal open={howOpen} onClose={() => setHowOpen(false)} />
    </div>
  );
}
