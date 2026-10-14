// RankHallPage — inside the Bandstand. The kid's own avatar stands center stage
// under a spotlight, the band cheers from the pit, the trophy shelf of ranks sits
// behind, and "TAKE A BOW!" sets off the crowd. Tap a trophy → Charlie explains it.
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Lock, BookOpen, Hand } from 'lucide-react';
import { RANKS } from '../data/ranks';
import useRank from '../hooks/useRank';
import { readAvatarOutfit } from '../hooks/useAvatar';
import AvatarSprite from '../components/AvatarSprite';
import Confetti from '../components/Confetti';
import { GameHeader } from '../components/GameUI';
import HowRanksWorkModal from '../components/HowRanksWorkModal';
import { StageLights, CrowdRow, CROWD_SHOUTS } from './ShredLegendPage';

const CURTAIN = 'repeating-linear-gradient(90deg, #C2173A 0 18px, #8E0C22 18px 36px)';
const FANFARE = ['C4', 'E4', 'G4', 'C5'];

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
  const curIdx = RANKS.findIndex((r) => r.id === currentRank.id);
  const avatar = readAvatarOutfit();
  const host = /charlie/.test(avatar.src) ? { src: 'assets/characters/dr-jellybone.png', name: 'Dr. Jellybone' } : { src: 'assets/characters/charlie.png', name: 'Charlie' };
  const [howOpen, setHowOpen] = useState(false);
  const [bow, setBow] = useState(0);
  const [energy, setEnergy] = useState(0.3);
  const [shouts, setShouts] = useState([]);
  const [confetti, setConfetti] = useState(0);
  const [bubble, setBubble] = useState(`Welcome to the Rank Hall, ${currentRank.title}! Tap a trophy, or take a bow!`);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const takeBow = useCallback(() => {
    setBow((b) => b + 1); setEnergy(1); setConfetti((c) => c + 1); playFanfare();
    setShouts([0, 2, 4, 6].map((m, i) => ({ id: Date.now() + i, member: m, text: CROWD_SHOUTS[(m + i) % CROWD_SHOUTS.length] })));
    setBubble(['The crowd goes wild!', 'Encore! Encore!', 'That bow had STYLE, kid.', 'Hear that? That\'s all for you.'][bow % 4]);
    timers.current.push(setTimeout(() => { setEnergy(0.3); setShouts([]); }, 2600));
  }, [bow]);

  const pickTrophy = (rank, state) => {
    if (state === 'future') setBubble(`${rank.title} — ${rank.requirement.label}. You'll get there!`);
    else if (state === 'current') setBubble(`${rank.title}: ${rank.blurb}`);
    else setBubble(`${rank.title} — you've already earned this one. ${rank.blurb}`);
  };

  return (
    <div className="relative overflow-hidden" data-testid="rank-hall-page" style={{ height: '100dvh', minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 20%, #1E3A5C 0%, #0B1E33 55%, #060F1C 100%)' }}>
      <StageLights energy={energy} style="halftime" />
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
      <motion.div aria-hidden="true" className="absolute left-1/2 pointer-events-none" style={{ bottom: '30%', width: 'min(60vw, 520px)', height: '62%', transformOrigin: 'top center', zIndex: 3, clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)', background: 'linear-gradient(180deg, rgba(255,240,180,0.0) 0%, rgba(255,240,180,0.22) 60%, rgba(255,240,180,0.35) 100%)' }}
        animate={{ x: ['-50%', '-46%', '-54%', '-50%'] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} />
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
          animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}><Hand className="w-4 h-4" strokeWidth={3} /> TAKE A BOW!</motion.button>
        <button type="button" data-testid="rank-hall-how" onClick={() => setHowOpen(true)} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black" style={{ background: 'white', color: 'var(--jma-dark)' }}>How do ranks work?</button>
        <button type="button" data-testid="rank-hall-stickers" onClick={() => navigate('/sticker-book')} className="chunky-btn px-3 py-1.5 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }}><BookOpen className="w-4 h-4" strokeWidth={3} /> Sticker Shack</button>
      </div>

      {/* the band cheers from the pit */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: '20%', zIndex: 7 }}>
        <CrowdRow energy={energy} burstId={bow} shouts={shouts} />
      </div>

      {confetti > 0 && <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 40 }}><Confetti key={confetti} mega testId="rank-hall-confetti" /></div>}
      <HowRanksWorkModal open={howOpen} onClose={() => setHowOpen(false)} />
    </div>
  );
}
