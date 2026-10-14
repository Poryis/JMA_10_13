// JMAtv LIVE — a never-ending, auto-advancing variety feed.
//
// Interleaves every channel's episodes into one continuous stream. When a kid
// tunes in we use the wall-clock to drop them onto the current segment AND
// (via the Vimeo SDK's getDuration) seek into it so it feels genuinely live —
// not like pressing play on a playlist. When a segment ends it auto-advances
// to the next and loops forever. No scrub bar (that's the whole "live" point);
// we keep tap-for-sound + fullscreen, mirroring JMAtvPlayerPage's CRT.

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Player from '@vimeo/player';
import { Maximize2, Volume2, SkipForward } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import SpaceBackdrop, { SPACE_BG_STYLE } from '../components/SpaceBackdrop';
import { buildLivePlaylist, getLiveStartIndex } from '../data/jmatv';
import { earnSticker } from '../hooks/useStickers';
import { reportQuestEvent } from '../hooks/useDailyQuests';

export default function JMAtvLivePage() {
  const navigate = useNavigate();
  const playlist = useMemo(() => buildLivePlaylist(), []);
  const len = playlist.length;

  // Pin the "tune-in" index once so the initial iframe src never changes
  // (changing src would reload the iframe and re-mute — the whole bug).
  const startIndexRef = useRef(getLiveStartIndex(len));
  const [index, setIndex] = useState(startIndexRef.current);
  const [loadError, setLoadError] = useState(false);
  const [needsUnmute, setNeedsUnmute] = useState(false);

  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  // Once the kid has unmuted (one tap) we remember it and keep every
  // following segment unmuted — no tap-for-sound on every clip.
  const unmutedRef = useRef(false);
  const indexRef = useRef(index);
  useEffect(() => { indexRef.current = index; }, [index]);

  const current = len ? playlist[index] : null;
  const next = len ? playlist[(index + 1) % len] : null;

  const destroyPlayer = useCallback(() => {
    const p = playerRef.current;
    playerRef.current = null;
    if (!p) return;
    try { p.destroy(); } catch { /* ignore */ }
  }, []);

  // Swap to a new segment WITHOUT reloading the iframe. Because we reuse the
  // same Vimeo Player instance (loadVideo), the audio permission the kid
  // granted on their first unmute tap carries across every clip.
  const playIndex = useCallback((i) => {
    setLoadError(false);
    setIndex(i);
    const player = playerRef.current;
    if (!player || !len) return;
    player.loadVideo(playlist[i].vimeoId).then(async () => {
      try {
        if (unmutedRef.current) { await player.setMuted(false); await player.setVolume(1); }
        await player.play();
      } catch { /* no-op */ }
    }).catch(() => setLoadError(true));
  }, [len, playlist]);

  const advance = useCallback(() => {
    if (!len) return;
    playIndex((indexRef.current + 1) % len);
  }, [len, playIndex]);

  const initPlayer = useCallback(() => {
    const el = iframeRef.current;
    if (!el || !el.isConnected) return;
    // Single persistent player — never recreate it (recreating = re-mute).
    if (playerRef.current) return;
    let player;
    try { player = new Player(el); } catch { return; }
    playerRef.current = player;

    player.ready().then(async () => {
      // iOS/Safari autoplays muted — offer a one-tap unmute (just once).
      try {
        const muted = await player.getMuted();
        setNeedsUnmute(!!muted);
      } catch { /* no-op */ }

      // Clock-based "join mid-show" — seek into the first segment once.
      try {
        const dur = await player.getDuration();
        if (dur && dur > 8) {
          const offset = (Math.floor(Date.now() / 1000) % Math.floor(dur - 4));
          if (offset > 2) { await player.setCurrentTime(offset); await player.play(); }
        }
      } catch { /* seek not critical */ }
    }).catch(() => setLoadError(true));

    // Auto-advance when a segment finishes.
    try {
      player.on('ended', () => { advance(); });
      // On a load/playback error, show the error card with a manual skip
      // (NOT auto-advance — that could storm through the whole feed if the
      // network/embed is unreachable).
      player.on('error', () => { setLoadError(true); });
    } catch { /* ignore */ }
  }, [advance]);

  useEffect(() => () => destroyPlayer(), [destroyPlayer]);
  useEffect(() => { earnSticker('jmatv-first-watch'); reportQuestEvent('jmatv_watch'); }, []);

  const handleUnmute = useCallback(async () => {
    const player = playerRef.current;
    unmutedRef.current = true;
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

  if (!current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-6 text-center">
        <div>
          <h1 className="text-2xl font-black mb-3">Nothing on air yet</h1>
          <button
            data-testid="jmatv-live-notfound-back"
            className="mt-2 px-4 py-2 rounded-full bg-yellow-400 text-gray-900 font-black"
            onClick={() => navigate('/jmatv')}
          >
            Back to JMAtv
          </button>
        </div>
      </div>
    );
  }

  const iframeSrc = `https://player.vimeo.com/video/${playlist[startIndexRef.current].vimeoId}?app_id=122963&autoplay=1&muted=1&title=0&byline=0&portrait=0&dnt=1`;

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
            JMAtv LIVE
          </span>
        </div>
        <h1
          data-testid="jmatv-live-title"
          className="font-black font-display leading-none text-center"
          style={{ fontSize: 'clamp(18px, 2.6vw, 30px)', color: 'white' }}
        >
          {current.title}
        </h1>
        <p className="text-xs md:text-sm font-bold mt-1" style={{ color: current.color || '#FFE7C2' }}>
          {current.channelTitle}
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
              title="JMAtv LIVE"
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
                  style={{ background: 'radial-gradient(ellipse at center, rgba(10,37,64,0.55) 0%, rgba(10,37,64,0.85) 100%)', color: 'white', zIndex: 6, border: 0 }}
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
                <p className="text-sm md:text-base font-bold opacity-90 max-w-md">Tap “Next Show” to keep watching.</p>
                <button
                  onClick={advance}
                  className="mt-4 px-4 py-2 rounded-full font-black border-3"
                  style={{ backgroundColor: '#FFCC00', color: 'var(--jma-dark)', borderColor: 'white', boxShadow: '0 4px 0 0 rgba(0,0,0,0.4)' }}
                  data-testid="jmatv-live-skip-error"
                >
                  Next Show
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
          data-testid="jmatv-live-skip"
          onClick={advance}
          className="px-3 py-1.5 rounded-full font-black text-sm border-2 flex items-center gap-1.5"
          style={{ backgroundColor: 'white', color: 'var(--jma-dark)', borderColor: 'var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }}
        >
          <SkipForward className="w-4 h-4" /> Next Show
        </button>
        <button
          data-testid="jmatv-live-fullscreen"
          onClick={handleFullscreen}
          className="px-3 py-1.5 rounded-full font-black text-sm border-2 flex items-center gap-1.5"
          style={{ backgroundColor: '#FFCC00', color: 'var(--jma-dark)', borderColor: 'var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }}
        >
          <Maximize2 className="w-4 h-4" /> Fullscreen
        </button>
      </div>

      {/* Up next ticker */}
      {next && (
        <div className="relative z-10 mt-6 w-full max-w-4xl text-center">
          <span className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: '#FFE7C2' }}>
            Up Next:
          </span>{' '}
          <span data-testid="jmatv-live-upnext" className="text-xs md:text-sm font-black" style={{ color: 'white' }}>
            {next.title} <span style={{ color: next.color, opacity: 0.9 }}>· {next.channelTitle}</span>
          </span>
        </div>
      )}
    </div>
  );
}
