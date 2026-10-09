// Avatars — the kid's own Jelly and the outfits they can earn.
// Outfit art already exists; unlocks lean on badges, ranks and stickers.

export const AVATAR_KEY = 'jma_avatar_v1'; // { character, outfit }

// unlock kinds: free | badge (any Cadet badge → rank ≠ polliwog) | rank (id) | sticker (id)
const FIRST_BADGE = { kind: 'badge', hint: 'Earn your first badge' };
const APPRENTICE  = { kind: 'rank', value: 'apprentice', hint: 'Reach Apprentice rank' };
const RHYTHM_PRO  = { kind: 'sticker', value: 'ach_rhythm_pro', hint: 'Earn the Rhythm Pro badge' };
const STREAK_3    = { kind: 'sticker', value: 'practice_buddy_3', hint: 'Practice 3 days in a row' };
const GEM_3       = { kind: 'sticker', value: 'gem_3', hint: 'Finish the daily quests on 3 days' };
const SHRED       = { kind: 'sticker', value: 'shred_legend', hint: 'Max the crowd in Shred City' };
const SONG        = { kind: 'sticker', value: 'ach_song_cadet', hint: 'Save a song in Charlie\'s Studio' };
const LESSON      = { kind: 'sticker', value: 'lesson_graduate', hint: 'Finish Music 101' };
const DETECTIVE   = { kind: 'sticker', value: 'ach_ear_pro', hint: 'Earn the Ear Pro badge' };
const BEAT_PRO    = { kind: 'sticker', value: 'ach_beat_pro', hint: 'Earn the Beat Pro badge' };

const C = 'assets/characters/';
const outfit = (id, name, file, unlock = { kind: 'free' }) => ({ id, name, src: `${C}${file}.png`, unlock });

export const AVATARS = [
  { id: 'charlie', name: 'Charlie',       color: '#FFCC00', outfits: [
    outfit('classic',   'Classic',       'charlie'),
    outfit('disco',     'Disco',         'charlie-disco', FIRST_BADGE),
    outfit('surf',      'Surf',          'charlie-surf', STREAK_3),
    outfit('punk',      'Punk',          'charlie-punk', SHRED),
    outfit('zoot',      'Zoot Suit',     'charlie-zoot', APPRENTICE),
    outfit('rundmc',    'Old School',    'charlie-rundmc', RHYTHM_PRO),
    outfit('steampunk', 'Steampunk',     'charlie-steampunk', GEM_3),
    outfit('studio',    'Producer',      'charlie-studio', SONG),
    outfit('drummajor', 'Drum Major',    'charlie-drum-major', BEAT_PRO),
    outfit('grad',      'Graduate',      'charlie-grad', LESSON),
  ] },
  { id: 'finn',    name: 'Finn',          color: '#4285F4', outfits: [
    outfit('classic', 'Daredevil', 'finn-danger'),
    outfit('disco',   'Disco',     'finn-disco', FIRST_BADGE),
  ] },
  { id: 'chunk',   name: 'Chunk',         color: '#34A853', outfits: [
    outfit('classic',   'Classic',   'chunk'),
    outfit('disco',     'Disco',     'chunk-disco', FIRST_BADGE),
    outfit('marching',  'Marching',  'chunk-marching', BEAT_PRO),
    outfit('steampunk', 'Steampunk', 'chunk-steampunk', GEM_3),
  ] },
  { id: 'jazzy',   name: 'Jazzy',         color: '#AF52DE', outfits: [
    outfit('classic',  'Classic',  'jazzy'),
    outfit('disco',    'Disco',    'jazzy-disco', FIRST_BADGE),
    outfit('marching', 'Marching', 'jazzy-marching', RHYTHM_PRO),
  ] },
  { id: 'stew',    name: 'Stew',          color: '#FF9500', outfits: [
    outfit('classic',  'Classic',   'stew'),
    { id: 'kazoo', name: 'Kazoo', src: 'assets/stew/stew-neutral.png', unlock: { kind: 'sticker', value: 'ach_keyboard_cadet', hint: 'Earn the Keyboard Cadet badge' } },
    outfit('drumline', 'Drum Line', 'stew-drumline', RHYTHM_PRO),
  ] },
  { id: 'doctor',  name: 'Dr. Jellybone', color: '#0FA3B1', outfits: [
    outfit('classic',   'Classic',   'dr-jellybone'),
    outfit('detective', 'Detective', 'dr-jellybone-detective', DETECTIVE),
    outfit('astro',     'Astronaut', 'dr-jellybone-astro-1', GEM_3),
  ] },
  { id: 'sharky',  name: 'Sharky',        color: '#FF3B30', outfits: [
    outfit('classic', 'Classic', 'shark'),
    outfit('hiphop',  'Hip-Hop', 'sharky-hiphop', FIRST_BADGE),
    outfit('snorkel', 'Snorkel', 'sharky-snorkel', STREAK_3),
    outfit('zoot',    'Zoot Suit', 'sharky-zoot', APPRENTICE),
  ] },
  { id: 'lou',     name: 'Lou',           color: '#8E8E93', outfits: [
    outfit('classic', 'Classic', 'lou'),
    outfit('disco',   'Disco',   'lou-disco', FIRST_BADGE),
  ] },
];

export const AVATAR_MAP = Object.fromEntries(AVATARS.map(a => [a.id, a]));

export function isOutfitUnlocked(o, { earned, rankIndex, rankIds }) {
  const u = o.unlock;
  if (u.kind === 'free') return true;
  if (u.kind === 'badge') return rankIndex > 0;
  if (u.kind === 'rank') return rankIndex >= rankIds.indexOf(u.value);
  if (u.kind === 'sticker') return !!earned[u.value];
  return false;
}
