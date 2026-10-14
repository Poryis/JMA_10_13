// MyMusicShelf — the "MY MUSIC" sheet in Jam Session. Big cassette-tape
// cards a 5-year-old can tap: My Beats (from Beat Lab) · My Songs (from
// Song Studio) · Jelly Songs. One tap = it loops under whatever instrument
// the kid is playing. Empty tabs point at the room that fills them.
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Drum, Piano, Music, Play, Square, ArrowRight } from 'lucide-react';

const TAPE_COLORS = ['#FF2D85', '#4FC3F7', '#FFCC00', '#7DD3C0', '#C8A8F2', '#FF9500', '#4CD964'];
const colorFor = (id = '') => TAPE_COLORS[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % TAPE_COLORS.length];

export function TapeCard({ item, sub, active, onPick, onStop, testId }) {
  const color = colorFor(item.id);
  return (
    <motion.button type="button" data-testid={testId} onClick={active ? onStop : onPick}
      className="relative flex-shrink-0 flex flex-col justify-between rounded-2xl p-2 text-left touch-manipulation"
      style={{ width: 150, height: 96, background: active ? 'var(--jma-dark)' : '#FFF9E9', border: '3px solid var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}
      whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }} animate={active ? { rotate: [0, -1.5, 1.5, 0] } : {}} transition={active ? { repeat: Infinity, duration: 0.9 } : {}}>
      <div className="rounded-lg px-2 py-1 text-[11px] font-black leading-tight truncate" style={{ background: color, color: 'var(--jma-dark)', border: '2px solid var(--jma-dark)' }}>{item.name}</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {[0, 1].map((n) => (
            <motion.span key={n} className="block rounded-full" style={{ width: 18, height: 18, border: '3px solid var(--jma-dark)', background: active ? 'white' : '#ddd' }}
              animate={active ? { rotate: 360 } : {}} transition={active ? { repeat: Infinity, duration: 1.4, ease: 'linear' } : {}} />
          ))}
          <span className="text-[10px] font-bold ml-1" style={{ color: active ? 'white' : 'rgba(10,37,64,0.6)' }}>{sub}</span>
        </div>
        <span className="flex items-center justify-center rounded-full" style={{ width: 26, height: 26, background: active ? '#FF3B30' : '#FFCC00', border: '2px solid var(--jma-dark)' }}>
          {active ? <Square className="w-3 h-3 fill-current" style={{ color: 'white' }} /> : <Play className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--jma-dark)' }} />}
        </span>
      </div>
    </motion.button>
  );
}

const TABS = [
  { id: 'beats', label: 'My Beats', icon: Drum },
  { id: 'songs', label: 'My Songs', icon: Piano },
  { id: 'jelly', label: 'Jelly Songs', icon: Music },
];

export default function MyMusicShelf({ open, onClose, beats, songs, jelly, currentId, onPickBeat, onPickSong, onPickJelly, onStop, initialTab = 'beats' }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(initialTab);
  const empty = { beats: { text: 'Make a beat in Beat Lab to fill this shelf!', cta: 'Go to Beat Lab', to: '/loop-studio' }, songs: { text: "Write a song in Charlie's Song Studio and it shows up here!", cta: 'Go to Song Studio', to: '/song-studio' } };
  const items = tab === 'beats' ? beats : tab === 'songs' ? songs : jelly;
  return (
    <AnimatePresence>
      {open && (
        <motion.div data-testid="my-music-shelf" className="fixed inset-0 z-[120] flex items-end md:items-center justify-center" style={{ background: 'rgba(10,37,64,0.55)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="w-full md:max-w-2xl rounded-t-3xl md:rounded-3xl p-3 md:p-4" style={{ background: '#FFF9E9', border: '4px solid var(--jma-dark)', boxShadow: '0 8px 0 0 var(--jma-dark)' }}
            initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-black font-display text-lg md:text-xl" style={{ color: 'var(--jma-dark)' }}>MY MUSIC</h2>
              <button type="button" data-testid="my-music-close" aria-label="Close" onClick={onClose} className="rounded-full p-1" style={{ background: 'white', border: '2px solid var(--jma-dark)' }}><X className="w-4 h-4" strokeWidth={3} /></button>
            </div>
            <div className="flex gap-1.5 mb-3">
              {TABS.map((t) => { const Icon = t.icon; const n = t.id === 'beats' ? beats.length : t.id === 'songs' ? songs.length : jelly.length; return (
                <button key={t.id} type="button" data-testid={`my-music-tab-${t.id}`} onClick={() => setTab(t.id)}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] md:text-xs font-black touch-manipulation"
                  style={{ background: tab === t.id ? 'var(--jma-dark)' : 'white', color: tab === t.id ? 'white' : 'var(--jma-dark)', border: '2px solid var(--jma-dark)' }}>
                  <Icon className="w-3.5 h-3.5" strokeWidth={3} /> {t.label} <span className="opacity-70">{n}</span>
                </button>
              ); })}
            </div>
            {items.length === 0 ? (
              <div data-testid="my-music-empty" className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="font-bold text-sm" style={{ color: 'var(--jma-dark)' }}>{empty[tab].text}</p>
                <button type="button" data-testid="my-music-empty-cta" onClick={() => navigate(empty[tab].to)} className="flex items-center gap-1.5 rounded-full px-4 py-2 font-black font-display text-sm" style={{ background: '#FFCC00', color: 'var(--jma-dark)', border: '3px solid var(--jma-dark)', boxShadow: '0 3px 0 0 var(--jma-dark)' }}>
                  {empty[tab].cta} <ArrowRight className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1" style={{ scrollbarWidth: 'none' }}>
                {items.map((it) => {
                  const key = tab === 'beats' ? `beat:${it.id}` : tab === 'songs' ? `song:${it.id}` : it.id;
                  const sub = tab === 'beats' ? `${it.bpm} bpm` : tab === 'songs' ? (it.moodId || 'song') : 'Jelly';
                  const pick = tab === 'beats' ? () => onPickBeat(it) : tab === 'songs' ? () => onPickSong(it) : () => onPickJelly(it);
                  return <TapeCard key={key} item={it} sub={sub} active={currentId === key} onPick={pick} onStop={onStop} testId={`tape-${key.replace(':', '-')}`} />;
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
