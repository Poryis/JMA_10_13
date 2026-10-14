// HowToVoiceButton — tap to hear Charlie say the game's one-line how-to.
import { Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { say } from '../lib/voice';

export function HowToVoiceButton({ lineId, className = '', size = 36, dark = false }) {
  return (
    <motion.button
      type="button"
      data-testid={`howto-voice-${lineId.split('.').slice(2).join('-')}`}
      aria-label="Hear how to play"
      onClick={(e) => { e.stopPropagation(); say(lineId, { minGapMs: 0 }); }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`howto-voice-btn rounded-full border-3 flex items-center justify-center cursor-pointer ${className}`}
      style={{
        width: size, height: size,
        backgroundColor: dark ? '#FFCC00' : 'var(--jma-yellow)',
        borderColor: 'var(--jma-dark)',
        boxShadow: '0 3px 0 0 var(--jma-dark)',
        color: 'var(--jma-dark)',
      }}
    >
      <Volume2 style={{ width: size * 0.55, height: size * 0.55 }} />
    </motion.button>
  );
}

export default HowToVoiceButton;
