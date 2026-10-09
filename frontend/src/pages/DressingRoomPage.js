// Dressing Room — pick your Jelly, wear the outfits you've earned.
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Lock, Check, Shirt } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import UnderwaterBackdrop, { UNDERWATER_BG_COLOR } from '../components/UnderwaterBackdrop';
import useAvatar from '../hooks/useAvatar';
import { AVATARS } from '../data/avatars';
import { say } from '../lib/voice';
import AvatarSprite from '../components/AvatarSprite';

function CharacterPick({ a, active, unlockedCount, onPick }) {
  return (
    <motion.button
      type="button"
      data-testid={`avatar-pick-${a.id}`}
      data-active={active ? 'true' : 'false'}
      onClick={onPick}
      className="relative flex-shrink-0 flex flex-col items-center rounded-2xl p-1.5 md:p-2 bg-white touch-manipulation"
      style={{ width: 'clamp(72px, 11vw, 96px)', border: `3px solid ${active ? a.color : 'var(--jma-dark)'}`, boxShadow: active ? `0 4px 0 0 ${a.color}` : '0 4px 0 0 var(--jma-dark)', transform: active ? 'translateY(-4px)' : 'none' }}
      whileTap={{ scale: 0.95 }}
    >
      <img src={a.outfits[0].src} alt="" draggable={false} className="object-contain" style={{ height: 'clamp(48px, 8vw, 70px)' }} />
      <span className="text-[10px] md:text-xs font-black font-display mt-1 truncate w-full text-center" style={{ color: 'var(--jma-dark)' }}>{a.name}</span>
      <span className="text-[9px] font-black" style={{ color: a.color }}>{unlockedCount}/{a.outfits.length}</span>
      {active && (
        <div className="absolute -top-2 -right-2 rounded-full flex items-center justify-center" style={{ width: 22, height: 22, background: a.color, border: '2px solid var(--jma-dark)' }}>
          <Check className="w-3 h-3 text-white" strokeWidth={4} />
        </div>
      )}
    </motion.button>
  );
}

function OutfitTile({ o, worn, color, onWear }) {
  return (
    <motion.button
      type="button"
      data-testid={`outfit-${o.id}`}
      data-unlocked={o.unlocked ? 'true' : 'false'}
      data-worn={worn ? 'true' : 'false'}
      onClick={onWear}
      className="relative flex flex-col items-center rounded-2xl p-2 bg-white touch-manipulation text-center"
      style={{ border: `3px solid ${worn ? color : 'var(--jma-dark)'}`, boxShadow: worn ? `0 4px 0 0 ${color}` : '0 4px 0 0 var(--jma-dark)', opacity: o.unlocked ? 1 : 0.85 }}
      whileTap={o.unlocked ? { scale: 0.95 } : { x: [0, -6, 6, -4, 4, 0] }}
      layout
    >
      <div className="flex items-end justify-center" style={{ height: 'clamp(64px, 10vw, 96px)' }}>
        <AvatarSprite src={o.src} helmet={!!o.helmet} width={o.helmet ? 'clamp(44px, 6vw, 60px)' : undefined} className="object-contain max-h-full" style={{ filter: o.unlocked ? 'none' : 'grayscale(1) brightness(0.25) contrast(0.8)' }} imgStyle={o.helmet ? {} : { height: 'clamp(64px, 10vw, 96px)' }} />
      </div>
      <span className="text-[11px] md:text-sm font-black font-display mt-1" style={{ color: 'var(--jma-dark)' }}>{o.name}</span>
      {!o.unlocked && (
        <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold mt-0.5 leading-tight" style={{ color: 'var(--jma-dark)', opacity: 0.7 }}>
          <Lock className="w-3 h-3 flex-shrink-0" /> {o.unlock.hint}
        </span>
      )}
      {worn && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[9px] font-black text-white" style={{ background: color, border: '2px solid var(--jma-dark)' }}>WEARING</span>
      )}
    </motion.button>
  );
}

export default function DressingRoomPage() {
  const { chosen, character, outfit, outfits, choose, wear, unlockedFor, totalUnlocked, totalOutfits } = useAvatar();
  const [preview, setPreview] = useState(character.id);
  const previewChar = AVATARS.find(a => a.id === preview) || character;
  const previewOutfits = previewChar.id === character.id ? outfits : previewChar.outfits.map(o => ({ ...o, unlocked: o.unlock.kind === 'free' || unlockedFor({ outfits: [o] }) > 0 }));
  const isCurrent = previewChar.id === character.id;
  const shownOutfit = isCurrent ? outfit : previewChar.outfits[0];
  const shownSrc = shownOutfit.src;

  const pick = (a) => {
    setPreview(a.id);
    if (a.id !== character.id) { choose(a.id, 'classic'); say('charlie.correct'); }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: UNDERWATER_BG_COLOR }} data-testid="dressing-room-page">
      <UnderwaterBackdrop />
      <GameHeader title="DRESSING ROOM" showHomeButton={true} backLink={{ to: '/sticker-book', label: 'Stickers' }} />

      <main className="relative z-10 max-w-4xl mx-auto px-3 pt-16 md:pt-20 pb-10 flex flex-col gap-4">
        {/* Preview */}
        <section className="rounded-3xl p-4 md:p-5 flex items-center gap-4" style={{ background: 'white', border: '4px solid var(--jma-dark)', boxShadow: '0 6px 0 0 var(--jma-dark)' }} data-testid="avatar-preview">
          <AnimatePresence initial={false}>
            <motion.div
              key={shownSrc}
              className="flex-shrink-0 flex items-end justify-center"
              style={{ height: 'clamp(110px, 20vw, 170px)', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.25))' }}
              initial={{ scale: 0.6, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.8, opacity: 0, position: 'absolute' }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, opacity: { duration: 0.15 } }}
            >
              <AvatarSprite src={shownSrc} helmet={!!shownOutfit.helmet} width={shownOutfit.helmet ? 'clamp(80px, 13vw, 118px)' : undefined} className="max-h-full" imgStyle={shownOutfit.helmet ? {} : { height: 'clamp(110px, 20vw, 170px)', objectFit: 'contain' }} testId="avatar-preview-sprite" />
            </motion.div>
          </AnimatePresence>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.15em] font-black" style={{ color: previewChar.color }}>{chosen ? 'Your Jelly' : 'Pick your Jelly!'}</span>
            <span className="text-2xl md:text-4xl font-black font-display leading-none" style={{ color: 'var(--jma-dark)' }} data-testid="avatar-name">{previewChar.name}</span>
            <span className="text-xs md:text-sm font-bold mt-1 opacity-70" style={{ color: 'var(--jma-dark)' }}>
              {isCurrent ? `Wearing: ${outfit.name}` : 'Tap below to make this your Jelly'}
            </span>
            <span className="flex items-center gap-1 text-[11px] md:text-xs font-black mt-2" style={{ color: 'var(--jma-dark)' }} data-testid="avatar-outfit-count">
              <Shirt className="w-3.5 h-3.5" /> {totalUnlocked} / {totalOutfits} outfits unlocked
            </span>
          </div>
        </section>

        {/* Characters */}
        <section>
          <h2 className="text-base md:text-lg font-black font-display text-white mb-2" style={{ textShadow: '0 2px 0 var(--jma-dark)' }}>Choose a Jelly</h2>
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-3 pt-2 px-1" data-testid="avatar-character-row">
            {AVATARS.map(a => (
              <CharacterPick key={a.id} a={a} active={a.id === character.id} unlockedCount={unlockedFor(a)} onPick={() => pick(a)} />
            ))}
          </div>
        </section>

        {/* Outfits */}
        <section>
          <h2 className="text-base md:text-lg font-black font-display text-white mb-2" style={{ textShadow: '0 2px 0 var(--jma-dark)' }}>
            {previewChar.name}&apos;s Wardrobe
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 px-1 pt-2" data-testid="avatar-outfit-grid">
            {previewOutfits.map(o => (
              <OutfitTile
                key={o.id} o={o} color={previewChar.color}
                worn={isCurrent && o.id === outfit.id}
                onWear={() => {
                  if (!o.unlocked) { say('charlie.hub.lockbadge'); return; }
                  if (!isCurrent) choose(previewChar.id, o.id); else wear(o.id);
                  say('charlie.correct');
                }}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
