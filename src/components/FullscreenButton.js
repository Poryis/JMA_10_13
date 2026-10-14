// FullscreenButton — floating bottom-right toggle, mounted once at App root.
// Goes fullscreen AND asks for landscape (Android). Hidden when the API is
// missing (iPhone Safari) or the app is already installed / fullscreen via
// the home-screen icon — OrientationGate covers the iPhone tip instead.
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize, Minimize } from 'lucide-react';
import { canFullscreen, enterFullscreen, exitFullscreen, isFullscreen, isStandalone, onFullscreenChange } from '../lib/fullscreen';

export function FullscreenButton() {
  const [full, setFull] = useState(isFullscreen());
  useEffect(() => onFullscreenChange(() => setFull(isFullscreen())), []);
  if (!canFullscreen() || isStandalone()) return null;

  return (
    <motion.button
      type="button"
      data-testid="fullscreen-button"
      className="fixed bottom-3 right-3 md:bottom-4 md:right-4 z-50 chunky-btn bg-white p-1 md:p-2"
      onClick={() => (full ? exitFullscreen() : enterFullscreen())}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={full ? 'Exit Fullscreen' : 'Fullscreen'}
      aria-label={full ? 'Exit fullscreen' : 'Go fullscreen'}
    >
      {full ? (
        <Minimize className="w-3.5 h-3.5 md:w-5 md:h-5" style={{ color: 'var(--jma-dark)' }} />
      ) : (
        <Maximize className="w-3.5 h-3.5 md:w-5 md:h-5" style={{ color: 'var(--jma-dark)' }} />
      )}
    </motion.button>
  );
}

export default FullscreenButton;
