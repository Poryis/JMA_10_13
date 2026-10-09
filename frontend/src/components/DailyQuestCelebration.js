// DailyQuestCelebration — fires the moment the kid completes the third
// quest of the day (usually inside a game). Mounted globally in App.js.

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useDailyQuests from '../hooks/useDailyQuests';
import { setOverlayActive } from '../hooks/useGamePause';
import { STICKER_MAP } from '../data/stickers';
import Confetti from './Confetti';

export default function DailyQuestCelebration() {
  const navigate = useNavigate();
  const { allDone, celebrated, gem, questDays, dismissCelebration } = useDailyQuests();
  const show = allDone && !celebrated;
  const gemSticker = gem ? STICKER_MAP[gem] : null;

  useEffect(() => {
    setOverlayActive('daily-quest', show);
    return () => setOverlayActive('daily-quest', false);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-testid="daily-quest-celebration"
          className="fixed inset-0 z-[990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissCelebration}
        >
          <Confetti mega testId="daily-quest-confetti" />
          <motion.div
            className="relative bg-white rounded-3xl border-4 max-w-sm w-full p-6 text-center"
            style={{ borderColor: '#FFCC00', boxShadow: '0 10px 0 0 #B8860B' }}
            initial={{ scale: 0.5, y: 50, rotate: 6 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: 'spring', stiffness: 250, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] md:text-xs uppercase tracking-[0.18em] font-black" style={{ color: '#B8860B' }}>
              Today at the Academy
            </p>
            <h2 className="text-3xl md:text-4xl font-black font-display mt-1" style={{ color: 'var(--jma-dark)' }}>
              Quests Complete!
            </h2>

            <motion.div
              className="mx-auto my-4 flex items-center justify-center"
              animate={{ y: [0, -8, 0], rotate: [-4, 4, -4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src={gemSticker ? gemSticker.icon : 'assets/ui/sun.png'}
                alt=""
                draggable={false}
                className="object-contain"
                style={{ width: 120, height: 120, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.22))' }}
              />
            </motion.div>

            {gemSticker ? (
              <p className="text-sm md:text-base font-black" style={{ color: 'var(--jma-dark)' }} data-testid="daily-quest-gem-name">
                New Daily Gem: <span style={{ color: gemSticker.color }}>{gemSticker.name}</span>
              </p>
            ) : (
              <p className="text-sm md:text-base font-black" style={{ color: 'var(--jma-dark)' }}>
                You finished all 3 quests today!
              </p>
            )}
            <p className="text-xs md:text-sm font-bold mt-1 opacity-70" style={{ color: 'var(--jma-dark)' }}>
              {questDays} quest {questDays === 1 ? 'day' : 'days'} completed · new quests tomorrow
            </p>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                data-testid="daily-quest-celebration-close"
                onClick={dismissCelebration}
                className="chunky-btn flex-1 px-4 py-2.5 text-sm font-black"
                style={{ backgroundColor: 'white', color: 'var(--jma-dark)' }}
              >
                Keep Playing
              </button>
              <button
                type="button"
                data-testid="daily-quest-celebration-home"
                onClick={() => { dismissCelebration(); navigate('/home'); }}
                className="chunky-btn flex-1 px-4 py-2.5 text-sm font-black"
                style={{ backgroundColor: '#FFCC00', color: 'var(--jma-dark)' }}
              >
                Back Home
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
