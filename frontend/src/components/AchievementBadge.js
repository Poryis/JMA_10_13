// AchievementBadge — soft, round medal style.
//
// Visual story:
//   • Round so it doesn't compete with the chunky rectangular UI elsewhere
//   • Domain color provides the personality (matches rank ladder)
//   • Tier indicated by a thin ring + small text label below (bronze/silver/gold)
//   • Locked: pale grey + small padlock icon, never desaturated metallic noise
//
// Sizes: 'sm' (sticker-book cell), 'md' (modals/toasts), 'lg' (hero blocks).

import { motion } from 'framer-motion';
import { DOMAIN_MAP, TIER_MAP } from '../data/achievements';

const SIZES = {
  sm: { box: 76,  iconImg: 44, ring: 4, labelFs: 9,  nameFs: 10 },
  md: { box: 118, iconImg: 70, ring: 5, labelFs: 11, nameFs: 11 },
  lg: { box: 168, iconImg: 100, ring: 7, labelFs: 13, nameFs: 12 },
};

export default function AchievementBadge({
  domain,
  tier,
  earned = false,
  size = 'md',
  showName = true,
  onClick,
  testId,
}) {
  const dom = DOMAIN_MAP[domain];
  const tr  = TIER_MAP[tier];
  const dims = SIZES[size] || SIZES.md;
  if (!dom || !tr) return null;

  const interactive = !!onClick;
  const isLocked = !earned;

  const ringColor = isLocked ? '#5B6470' : tr.frame;
  const ringHighlight = isLocked ? '#8A939E' : tr.frameHi;
  const ringDark = isLocked ? '#2E3640' : tr.frame;
  const ring = `conic-gradient(from 210deg, ${ringHighlight} 0deg, ${ringColor} 70deg, ${ringDark} 140deg, ${ringHighlight} 200deg, ${ringColor} 270deg, ${ringDark} 330deg, ${ringHighlight} 360deg)`;
  const discBg = isLocked
    ? 'radial-gradient(circle at 50% 40%, #243B5C 0%, #11233A 100%)'
    : `radial-gradient(circle at 38% 30%, #FFFFFF 0%, ${dom.color}2E 55%, ${dom.color}66 100%)`;

  return (
    <motion.button
      data-testid={testId}
      onClick={onClick}
      whileHover={interactive ? { scale: 1.06, y: -3, rotate: isLocked ? 0 : -3 } : undefined}
      whileTap={interactive ? { scale: 0.96 } : undefined}
      className="relative flex flex-col items-center select-none focus:outline-none bg-transparent border-0 p-0"
      style={{ width: dims.box, cursor: interactive ? 'pointer' : 'default' }}
    >
      {/* medal: metallic tier ring (bronze / silver / gold) around the domain disc */}
      <div
        className={`relative rounded-full flex items-center justify-center ${isLocked ? '' : 'medal-earned'}`}
        style={{
          width: dims.box,
          height: dims.box,
          padding: dims.ring + 1,
          background: ring,
          boxShadow: isLocked
            ? 'inset 0 1px 1px rgba(255,255,255,0.25), 0 3px 0 0 rgba(2,36,63,0.45)'
            : `inset 0 1px 1px rgba(255,255,255,0.7), 0 3px 0 0 rgba(2,36,63,0.35), 0 0 16px ${ringColor}66`,
        }}
      >
        <div
          className="rounded-full flex items-center justify-center relative overflow-hidden"
          style={{ width: '100%', height: '100%', background: discBg, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35)' }}
        >
          <img
            src={dom.icon}
            alt={dom.label}
            draggable={false}
            style={{
              width: dims.iconImg,
              height: dims.iconImg,
              objectFit: 'contain',
              filter: isLocked ? 'brightness(0) opacity(0.4)' : 'drop-shadow(0 2px 0 rgba(0,0,0,0.25))',
            }}
          />
          {isLocked && (
            <span className="absolute inset-0 flex items-center justify-center font-black font-display" style={{ fontSize: dims.iconImg * 0.55, color: 'rgba(255,255,255,0.8)', textShadow: '0 2px 0 rgba(0,0,0,0.5)' }}>?</span>
          )}
          {!isLocked && <span aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 45%)' }} />}
        </div>
        {!isLocked && (
          <span aria-hidden="true" className="absolute flex items-center justify-center rounded-full" style={{ top: -4, right: -2, width: dims.box * 0.26, height: dims.box * 0.26, background: '#FFCC00', border: '2px solid var(--jma-dark)' }}>
            <svg viewBox="0 0 24 24" width="70%" height="70%" fill="var(--jma-dark)"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" /></svg>
          </span>
        )}
      </div>

      {/* Tier label — small + soft, no chunky banner */}
      <div
        className="mt-1 font-black font-display uppercase tracking-wider leading-none"
        style={{
          fontSize: dims.labelFs,
          color: isLocked ? 'rgba(255,255,255,0.45)' : ringColor,
          letterSpacing: '0.08em',
        }}
      >
        {tr.ribbon}
      </div>

      {showName && (
        <div
          className="text-center mt-0.5 font-bold leading-tight"
          style={{
            fontSize: dims.nameFs,
            color: isLocked ? '#9AA0A6' : 'var(--jma-dark)',
            opacity: isLocked ? 0.65 : 0.9,
            maxWidth: dims.box * 1.1,
          }}
        >
          {dom.label}
        </div>
      )}
    </motion.button>
  );
}
