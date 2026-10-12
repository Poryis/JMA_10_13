// OrientationGate — phones work far better sideways, so in portrait on a
// phone we cover the app with a friendly "turn me!" card. Offers fullscreen
// (Android / iPad) or the Add-to-Home-Screen tip (iPhone), with a small
// escape hatch for kids who really want to stay upright this session.
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Maximize, Share } from 'lucide-react';
import { canFullscreen, enterFullscreen, isIOS, isStandalone, isTouchDevice } from '../lib/fullscreen';

const DISMISS_KEY = 'jma_portrait_ok_v1';

function phonePortrait() {
  const w = window.innerWidth; const h = window.innerHeight;
  return isTouchDevice() && h > w && w < 600;
}

export default function OrientationGate() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const check = () => {
      let dismissed = false;
      try { dismissed = sessionStorage.getItem(DISMISS_KEY) === '1'; } catch (_) { /* ignore */ }
      setShow(!dismissed && phonePortrait());
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => { window.removeEventListener('resize', check); window.removeEventListener('orientationchange', check); };
  }, []);

  const dismiss = () => { try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (_) { /* ignore */ } setShow(false); };
  const ios = isIOS();
  const fs = canFullscreen();

  return (
    <AnimatePresence>
      {show && (
        <motion.div data-testid="orientation-gate" className="fixed inset-0 z-[190] flex flex-col items-center justify-center px-6 text-center"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(10,37,64,0.85) 0%, rgba(10,37,64,0.97) 100%)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="mb-5 rounded-3xl p-4" style={{ background: 'linear-gradient(135deg, #FFCC00 0%, #FF9500 100%)', border: '4px solid var(--jma-dark)', boxShadow: '0 6px 0 0 var(--jma-dark)' }}
            animate={{ rotate: [0, 0, -90, -90, 0] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.2, 0.5, 0.8, 1], ease: 'easeInOut' }}>
            <Smartphone className="w-14 h-14" style={{ color: 'var(--jma-dark)' }} strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-black font-display text-white mb-2">Turn me sideways!</h1>
          <p className="text-base font-bold text-white/85 max-w-xs">The Academy is built for landscape — rotate your device to see the whole street.</p>

          {fs && !isStandalone() && (
            <button type="button" data-testid="orientation-fullscreen-btn" onClick={enterFullscreen}
              className="mt-6 flex items-center gap-2 rounded-full px-5 py-3 font-black font-display text-base active:scale-95"
              style={{ background: '#FFCC00', color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}>
              <Maximize className="w-5 h-5" strokeWidth={3} /> Go fullscreen
            </button>
          )}
          {ios && !isStandalone() && (
            <div data-testid="orientation-ios-tip" className="mt-6 flex items-start gap-2 rounded-2xl px-4 py-3 text-left text-sm font-bold max-w-xs" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}>
              <Share className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>Hide the address bar for good: tap <b>Share</b> → <b>Add to Home Screen</b>, then open JMA from your home screen.</span>
            </div>
          )}

          <button type="button" data-testid="orientation-dismiss" onClick={dismiss} className="mt-8 text-xs font-black uppercase tracking-widest underline bg-transparent border-0" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Keep it upright for now
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
