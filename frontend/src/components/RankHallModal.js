// RankHallModal — the Bandstand's "Rank Hall": your current rank under a
// spotlight, the trophy shelf of every Academy rank, and the next step.
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Star, Lock, Sparkles, BookOpen } from 'lucide-react';
import { RANKS } from '../data/ranks';
import useRank from '../hooks/useRank';
import FitBox from './FitBox';

const CURTAIN = 'repeating-linear-gradient(90deg, #C2173A 0 16px, #8E0C22 16px 32px)';

function Trophy({ rank, state, index }) {
  const reached = state !== 'future';
  return (
    <div className="flex flex-col items-center" style={{ width: 64 }} data-testid={`rank-hall-trophy-${rank.id}`} data-state={state}>
      <motion.div className="relative rounded-full flex items-center justify-center overflow-hidden"
        style={{ width: 52, height: 52, background: reached ? rank.badgeBg : '#0F2238', border: `3px solid ${reached ? rank.color : '#2B4660'}`, boxShadow: state === 'current' ? `0 0 0 3px #FFCC00, 0 0 18px ${rank.color}` : reached ? `0 3px 0 0 ${rank.color}` : 'none' }}
        initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + index * 0.06, type: 'spring', stiffness: 220 }}>
        <img src={rank.icon} alt="" draggable={false} className="w-[82%] h-[82%] object-contain" style={{ filter: reached ? 'none' : 'brightness(0) opacity(0.45)' }} />
        {!reached && <Lock className="absolute w-4 h-4" style={{ color: 'rgba(255,255,255,0.55)' }} strokeWidth={3} />}
      </motion.div>
      <span className="mt-1 text-[9px] font-black text-center leading-tight" style={{ color: reached ? 'white' : 'rgba(255,255,255,0.4)' }}>{rank.title}</span>
    </div>
  );
}

export default function RankHallModal({ open, onClose, onHowRanks }) {
  const navigate = useNavigate();
  const { currentRank, nextRank, progress, achievementCount } = useRank();
  const curIdx = RANKS.findIndex((r) => r.id === currentRank.id);
  return (
    <AnimatePresence>
      {open && (
        <motion.div data-testid="rank-hall-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2,36,63,0.78)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <FitBox className="w-full max-w-2xl">
            <motion.div className="relative rounded-[28px] overflow-hidden" style={{ background: '#0B1E33', border: '4px solid var(--jma-dark)', boxShadow: '0 10px 0 0 var(--jma-dark)' }}
              initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <button type="button" data-testid="rank-hall-close" aria-label="Close" onClick={onClose}
                className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#FF2D85', color: 'white', border: '3px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }}>
                <X className="w-5 h-5" strokeWidth={3} />
              </button>

              {/* curtain valance */}
              <div className="relative h-14 flex items-end justify-center" style={{ background: CURTAIN, borderBottom: '4px solid #FFCC00', boxShadow: 'inset 0 -14px 20px rgba(0,0,0,0.35)' }}>
                <span className="mb-2 px-4 py-1 rounded-full font-black font-display text-sm tracking-[0.2em]" style={{ background: '#FFCC00', color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }} data-testid="rank-hall-title">RANK HALL</span>
              </div>

              {/* spotlight + current rank */}
              <div className="relative px-5 pt-4 pb-3 flex flex-col md:flex-row items-center gap-4 md:gap-6" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,236,160,0.28) 0%, rgba(255,236,160,0.06) 38%, transparent 60%)' }}>
                <motion.div className="relative flex-shrink-0 rounded-full flex items-center justify-center" style={{ width: 128, height: 128, background: currentRank.badgeBg, border: `5px solid ${currentRank.color}`, boxShadow: `0 0 0 4px #FFCC00, 0 0 40px ${currentRank.color}99` }}
                  animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}>
                  <img src={currentRank.icon} alt={currentRank.title} draggable={false} className="w-[84%] h-[84%] object-contain" style={{ filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.25))' }} />
                  <motion.span className="absolute -top-2 -right-1" animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Sparkles className="w-7 h-7" style={{ color: '#FFCC00', filter: 'drop-shadow(0 2px 0 var(--jma-dark))' }} strokeWidth={2.5} />
                  </motion.span>
                </motion.div>
                <div className="text-center md:text-left min-w-0 flex-1">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: '#FFCC00' }}>Your Academy Rank</div>
                  <div className="text-3xl md:text-4xl font-black font-display leading-none text-white" data-testid="rank-hall-current">{currentRank.title}</div>
                  <div className="text-sm font-bold mt-1" style={{ color: currentRank.color }}>{currentRank.subtitle}</div>
                  <p className="text-xs md:text-sm mt-2 text-white/75 font-medium">{currentRank.blurb}</p>
                  <div className="mt-3 rounded-2xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)' }} data-testid="rank-hall-next">
                    {nextRank ? (
                      <>
                        <div className="flex items-center justify-between gap-2 text-[11px] md:text-xs font-black text-white">
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" style={{ color: '#FFCC00' }} strokeWidth={3} /> Next: {nextRank.title}</span>
                          <span style={{ color: '#FFCC00' }}>{progress.current}/{progress.target}</span>
                        </div>
                        <div className="mt-1.5 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
                          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #FFCC00, #FF9500)' }} initial={{ width: 0 }} animate={{ width: `${progress.pct}%` }} transition={{ delay: 0.3, duration: 0.8 }} />
                        </div>
                        <div className="mt-1 text-[10px] md:text-[11px] font-bold text-white/70">{nextRank.requirement.label}</div>
                      </>
                    ) : (
                      <div className="text-xs font-black text-white">Maestro! Every rank earned — {achievementCount} badges strong.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* trophy shelf */}
              <div className="px-5 pb-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Trophy shelf</div>
                <div className="relative rounded-2xl px-2 pt-3 pb-2" style={{ background: 'linear-gradient(180deg, #8B5A2B 0%, #6E4320 100%)', border: '3px solid var(--jma-dark)', boxShadow: 'inset 0 4px 0 rgba(255,255,255,0.12), 0 4px 0 0 var(--jma-dark)' }}>
                  <div className="flex flex-wrap justify-center gap-1" data-testid="rank-hall-shelf">
                    {RANKS.map((r, i) => <Trophy key={r.id} rank={r} index={i} state={i < curIdx ? 'reached' : i === curIdx ? 'current' : 'future'} />)}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <button type="button" data-testid="rank-hall-how" onClick={onHowRanks} className="chunky-btn px-4 py-2 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: 'white', color: 'var(--jma-dark)' }}>How do ranks work?</button>
                  <button type="button" data-testid="rank-hall-stickers" onClick={() => navigate('/sticker-book')} className="chunky-btn px-4 py-2 text-xs md:text-sm font-black flex items-center gap-1.5" style={{ background: '#FFCC00', color: 'var(--jma-dark)' }}><BookOpen className="w-4 h-4" strokeWidth={3} /> Sticker Shack</button>
                </div>
              </div>
            </motion.div>
          </FitBox>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
