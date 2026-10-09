// AcademyRevealCelebration — one-time "the doors are open" ceremony shown
// on the Home page the first time LEARN and CREATE unlock.

import { motion, AnimatePresence } from 'framer-motion';
import { Unlock } from 'lucide-react';
import Confetti from './Confetti';

const ROOMS = [
  { label: 'LEARN', icon: 'assets/home/learn/storybook no accents.png', bg: '#C8A8F2' },
  { label: 'CREATE', icon: 'assets/home/create/beat pad.png', bg: '#7DD3C0' },
];

export default function AcademyRevealCelebration({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="academy-reveal-overlay"
          className="fixed inset-0 z-[980] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Confetti mega testId="academy-reveal-confetti" />
          <motion.div
            className="relative bg-white rounded-3xl border-4 max-w-sm w-full p-6 text-center"
            style={{ borderColor: 'var(--jma-dark)', boxShadow: '0 10px 0 0 var(--jma-dark)' }}
            initial={{ scale: 0.5, y: 50, rotate: -6 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: 'spring', stiffness: 250, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFCC00', boxShadow: '0 3px 0 0 var(--jma-dark)' }}>
              <Unlock className="w-6 h-6" style={{ color: 'var(--jma-dark)' }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black font-display mt-3" style={{ color: 'var(--jma-dark)' }}>
              The Academy is Open!
            </h2>
            <p className="text-sm md:text-base font-bold mt-1 opacity-75" style={{ color: 'var(--jma-dark)' }}>
              You earned your first badge. Two new rooms just unlocked!
            </p>

            <div className="flex justify-center gap-4 my-5">
              {ROOMS.map((r, i) => (
                <motion.div
                  key={r.label}
                  className="flex flex-col items-center gap-1.5 rounded-2xl p-3"
                  style={{ backgroundColor: r.bg, border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)', width: 120 }}
                  initial={{ filter: 'grayscale(1)', scale: 0.8, opacity: 0.5 }}
                  animate={{ filter: 'grayscale(0)', scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.35, type: 'spring', stiffness: 220 }}
                >
                  <img src={r.icon} alt="" draggable={false} className="object-contain" style={{ width: 70, height: 60, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))' }} />
                  <span className="font-black font-display text-lg" style={{ color: 'var(--jma-dark)', WebkitTextStroke: '1px white', paintOrder: 'stroke fill' }}>{r.label}</span>
                </motion.div>
              ))}
            </div>

            <button
              type="button"
              data-testid="academy-reveal-close"
              onClick={onClose}
              className="chunky-btn w-full px-4 py-2.5 text-sm font-black"
              style={{ backgroundColor: '#FFCC00', color: 'var(--jma-dark)' }}
            >
              Let&apos;s Go!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
