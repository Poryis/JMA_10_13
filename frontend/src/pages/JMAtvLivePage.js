// JMAtv LIVE — the always-on channel.
//
// Plays one continuously-running produced "variety show" video. We join it
// mid-stream using the wall-clock (so it feels genuinely live and different
// each time you tune in) and loop it forever. Because it's a SINGLE video,
// sound is turned on ONCE and stays on — no tap-for-sound on every clip.
// We arrive here via a tap (banner / card), so we try to start WITH sound
// immediately and only show a one-tap "sound" fallback if the browser blocks
// unmuted autoplay.

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Player from '@vimeo/player';
import { Maximize2, Volume2 } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import SpaceBackdrop, { SPACE_BG_STYLE } from '../components/SpaceBackdrop';
import { LIVE_VARIETY } from '../data/jmatv';

export default function JMAtvLivePage() {
  const navigate = useNavigate();
  const [loadError, setLoadError] = useState(false);
  const [needsUnmute, setNeedsUnmute] = useState(false);

  const iframeRef = useRef(null);
  const playerRef = useRef(null);

  const destroyPlayer = useCallback(() => {
    const p = playerRef.current;
    playerRef.current = null;
    if (!p) return;
    try { p.destroy(); } catch { /* ignore */ }
  }, []);

  const initPlayer = useCallback(() => {
    const el = iframeRef.current;
    if (!el || !el.isConnected) return;
    destroyPlayer();
    let player;
    try { player = new Player(el); } catch { return; }
    playerRef.current = player;

    player.ready().then(async () => {
      // Join mid-stream by the clock.
      try {
        const dur = await player.getDuration();
        if (dur && dur > 10) {
          const offset = Math.floor(Date.now() / 1000) % Math.floor(dur - 4);
          if (offset > 2) await player.setCurrentTime(offset);
        }
      } catch { /* seek not critical */ }

      // Try to play WITH sound right away (we got here via a tap).
      try {
        await player.setMuted(false);
        await player.setVolume(1);
        await player.play();
        setNeedsUnmute(false);
      } catch {
        // Browser blocked unmuted autoplay → muted fallback + one-tap unmute.
        try { await player.setMuted(true); await player.play(); } catch { /* ignore */ }
        setNeedsUnmute(true);
      }
    }).catch(() => setLoadError(true));

    try { player.on('error', () => setLoadError(true)); } catch { /* ignore */ }
  }, [destroyPlayer]);

  useEffect(() => () => destroyPlayer(), [destroyPlayer]);

  const handleUnmute = useCallback(async () => {
    const player = playerRef.current;
    setNeedsUnmute(false);
    if (!player) return;
    try {
      await player.setMuted(false);
      await player.setVolume(1);
      await player.play();
    } catch { /* no-op */ }
  }, []);

  const handleFullscreen = () => {
    const player = playerRef.current;
    const el = iframeRef.current;
    const native = () => {
      if (!el) return;
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (!req) return;
      try { const r = req.call(el); if (r && r.catch) r.catch(() => {}); } catch { /* ignore */ }
    };
    if (!player) { native(); return; }
    try { const r = player.requestFullscreen(); if (r && r.catch) r.catch(native); } catch { native(); }
  };

  // autoplay + loop (loop keeps the channel "always on"); muted=1 guarantees the
  // initial autoplay even before we unmute in the ready handler above.
  const iframeSrc = `https://player.vimeo.com/video/${LIVE_VARIETY.vimeoId}?app_id=122963&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0&dnt=1`;

  return (
    <div
      data-testid="jmatv-live-page"
      className="min-h-screen flex flex-col items-center px-3 sm:px-6 pt-24 md:pt-28 pb-10 relative overflow-x-hidden"
      style={SPACE_BG_STYLE}
    >
      <SpaceBackdrop />
      <GameHeader showHomeButton={true} backTo="/jmatv" />

      {/* LIVE badge + now-playing */}
      <motion.div
        className="relative z-10 w-full max-w-4xl flex flex-col items-center mb-3"
        initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            data-testid="jmatv-live-badge"
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-widest"
            style={{ backgroundColor: '#FF3B30', color: 'white', border: '2px solid white' }}
          >
            <span
              className="inline-block rounded-full"
              style={{ width: 8, height: 8, backgroundColor: 'white', animation: 'jma-pulse 1.3s ease-in-out infinite' }}
            />
            Live
          </span>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#FFE7C2' }}>
            JMAtv Channel 1
          </span>
        </div>
        <h1
          data-testid="jmatv-live-title"
          className="font-black font-display leading-none text-center"
          style={{ fontSize: 'clamp(18px, 2.6vw, 30px)', color: 'white' }}
        >
          {LIVE_VARIETY.title}
        </h1>
        <p className="text-xs md:text-sm font-bold mt-1" style={{ color: '#FFE7C2' }}>
          Always on — sit back and watch!
        </p>
      </motion.div>

      {/* CRT frame */}
      <motion.div
        data-testid="jmatv-live-frame"
        className="relative z-10 w-full max-w-4xl"
        initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
      >
        <div
          className="relative rounded-3xl"
          style={{
            background: 'repeating-linear-gradient(90deg, #8B5A2B 0px, #8B5A2B 2px, #A0673A 2px, #A0673A 5px), linear-gradient(180deg, #A0673A, #6B4423)',
            backgroundBlendMode: 'multiply',
            border: '6px solid #000',
            boxShadow: '0 14px 0 0 #000, inset 0 0 0 4px #3F2A14, inset 0 0 0 7px rgba(255,255,255,0.08)',
            padding: 'clamp(12px, 2vw, 22px)',
          }}
        >
          <div
            className="relative rounded-xl overflow-hidden"
            style={{ background: '#000', border: '4px solid #1F2937', boxShadow: 'inset 0 0 18px rgba(0,0,0,0.8)', paddingBottom: '56.25%', height: 0 }}
          >
            <iframe
              ref={iframeRef}
              title={LIVE_VARIETY.title}
              src={iframeSrc}
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              onLoad={() => { setLoadError(false); initPlayer(); }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            />

            {/* LIVE bug top-right */}
            <img
              src="assets/ui/jmatv-logo-v2.png"
              alt="" aria-hidden="true" draggable={false}
              className="absolute pointer-events-none hidden md:block"
              style={{ top: 10, right: 10, width: 'clamp(40px, 6vw, 64px)', opacity: 0.88, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))', zIndex: 5 }}
            />

            {/* Scanlines */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 1px, transparent 1px, transparent 4px)', mixBlendMode: 'multiply' }}
            />

            <AnimatePresence>
              {needsUnmute && !loadError && (
                <motion.button
                  key="unmute-overlay"
                  data-testid="jmatv-live-unmute"
                  type="button"
                  onClick={handleUnmute}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(10,37,64,0.5) 0%, rgba(10,37,64,0.82) 100%)', color: 'white', zIndex: 6, border: 0 }}
                  aria-label="Tap to unmute"
                >
                  <motion.div
                    initial={{ scale: 0.85, y: 8 }} animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                    className="flex flex-col items-center gap-2 md:gap-3"
                  >
                    <div
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4"
                      style={{ backgroundColor: '#FFCC00', borderColor: 'white', boxShadow: '0 6px 0 0 rgba(0,0,0,0.5), 0 0 24px rgba(255,204,0,0.55)' }}
                    >
                      <Volume2 className="w-8 h-8 md:w-10 md:h-10" style={{ color: 'var(--jma-dark)' }} />
                    </div>
                    <div className="text-base md:text-xl font-black font-display uppercase tracking-wider">Tap for sound</div>
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>

            {loadError && (
              <div
                data-testid="jmatv-live-error"
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                style={{ backgroundColor: 'rgba(10,37,64,0.96)', color: 'white' }}
              >
                <div className="text-5xl mb-2">📡</div>
                <h3 className="text-xl md:text-2xl font-black font-display mb-1">Signal dropped</h3>
                <p className="text-sm md:text-base font-bold opacity-90 max-w-md">Couldn’t reach the channel. Try again in a bit.</p>
                <button
                  onClick={() => navigate('/jmatv')}
                  className="mt-4 px-4 py-2 rounded-full font-black border-3"
                  style={{ backgroundColor: '#FFCC00', color: 'var(--jma-dark)', borderColor: 'white', boxShadow: '0 4px 0 0 rgba(0,0,0,0.4)' }}
                  data-testid="jmatv-live-error-back"
                >
                  Back to JMAtv
                </button>
              </div>
            )}
          </div>

          {/* TV controls strip */}
          <div className="flex items-center justify-between mt-3 px-1">
            <div
              aria-hidden="true"
              style={{ width: '40%', height: 18, borderRadius: 5, background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.45) 0 2px, rgba(255,255,255,0.06) 2px 5px)', border: '1.5px solid #3F2A14' }}
            />
            <span className="text-[11px] font-black tracking-[0.18em] uppercase">JMAtv LIVE</span>
            <div className="flex items-center gap-1.5">
              {[0, 1].map((i) => (
                <div key={i} aria-hidden="true" style={{ width: 16, height: 16, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #E5C597, #5A3A1A)', border: '2px solid #3F2A14' }} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action row */}
      <div className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          data-testid="jmatv-live-fullscreen"
          onClick={handleFullscreen}
          className="px-3 py-1.5 rounded-full font-black text-sm border-2 flex items-center gap-1.5"
          style={{ backgroundColor: '#FFCC00', color: 'var(--jma-dark)', borderColor: 'var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }}
        >
          <Maximize2 className="w-4 h-4" /> Fullscreen
        </button>
      </div>
    </div>
  );
}
