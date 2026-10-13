// The Academy campus — every room as a building on the map.
// Every building has illustrated art; `kiosk` remains supported as a fallback.

const MU = 'assets/music/'; // Jelly instrumentals — each street spins its own playlist
const T = (file, title) => ({ src: `${MU}${file}.mp3`, title });
const CH = 'assets/characters/';

export const CAMPUS_ZONES = [
  { id: 'play',   label: 'PLAY',   street: 'Jelly Jam Boulevard', color: '#FFCC00', ground: '#9BE27A', tracks: [T('play-one-skip-one', 'Play One, Skip One'), T('goody-bag', 'Goody Bag'), T('food-fight', 'Food Fight')],   strollers: [`${CH}charlie-surf.png`, `${CH}sharky-snorkel.png`] },
  { id: 'learn',  label: 'LEARN',  street: 'Music 101 Lane',      color: '#C8A8F2', ground: '#7FD1B9', tracks: [T('magic', 'Magic'), T('brand-new-friend', 'Brand New Friend')],  strollers: [`${CH}charlie-surf.png`, `${CH}sharky-snorkel.png`] },
  { id: 'create', label: 'CREATE', street: 'Studio Row',          color: '#7DD3C0', ground: '#F2C878', tracks: [T('faster-as-we-go', 'Faster As We Go'), T('food-fight', 'Food Fight'), T('goody-bag', 'Goody Bag')], strollers: [`${CH}charlie-surf.png`, `${CH}sharky-snorkel.png`] },
];

export const CAMPUS_BUILDINGS = [
  // PLAY
  { id: 'jelly-jukebox',       zone: 'play',   name: 'Jelly Jukebox',        path: '/rhythm-game',    art: 'assets/campus/jukebox-diner.png',     host: `${CH}jazzy.png`,                 starter: true,  size: 1.0 },
  { id: 'shred-legend',        zone: 'play',   name: 'Shred City',           path: '/shred-legend',   art: 'assets/campus/shred-club.png',        host: `${CH}charlie-punk.png`,          starter: false, size: 1.0 },
  { id: 'stew-kazoo',          zone: 'play',   name: 'Stew Kazoo Says',      path: '/simon-says',     art: 'assets/campus/stew-room-kazoo.png',         host: `${CH}stew.png`,                  starter: true,  size: 0.95 },
  { id: 'note-match',          zone: 'play',   name: 'Note Match',           path: '/note-match',     art: 'assets/campus/note-match.png',        host: `${CH}sharky-hiphop.png`,         starter: false, size: 0.85 },
  { id: 'detective-jellybone', zone: 'play',   name: "Dr. Jellybone's Office", path: '/detective',    art: 'assets/campus/detective-office.png',  host: `${CH}dr-jellybone-detective.png`, starter: true, size: 1.0 },
  { id: 'sight-reading',       zone: 'play',   name: 'Sight-Reading Sprint', path: '/sight-reading',  art: 'assets/campus/sight-reading.png',     host: `${CH}finn-danger.png`,           starter: false, size: 0.9 },
  { id: 'robot-boogie',        zone: 'play',   name: 'Robot Boogie',         path: '/robot-boogie',   art: 'assets/campus/robot-boogie.png',      host: 'assets/robot-boogie/robot1-card-hero.png', starter: false, size: 0.9 },
  // LEARN
  { id: 'lessons',             zone: 'learn',  name: 'Music 101',            path: '/lessons',        art: 'assets/campus/music-101.png',         host: `${CH}charlie-grad.png`,          size: 1.0 },
  { id: 'fun-facts',           zone: 'learn',  name: 'Fun Facts Clubhouse',  path: '/fun-facts',      art: 'assets/campus/fun-facts.png',         host: `${CH}stew.png`,                  size: 0.9 },
  { id: 'boom-garden',         zone: 'learn',  name: "Who's Got the Rhythm", path: '/boom-garden',    art: 'assets/campus/football-field.png',    host: `${CH}chunk-marching.png`,        size: 1.05 },
  { id: 'ear-quest',           zone: 'learn',  name: 'Ear Quest',            path: '/ear-trainer',    art: 'assets/campus/ear-quest.png',         host: `${CH}dr-jellybone.png`,          size: 0.9 },
  { id: 'name-that-note',      zone: 'learn',  name: 'Name That Note',       path: '/name-that-note', art: 'assets/campus/name-that-note.png',    host: `${CH}finn-danger.png`,           size: 0.9 },
  // CREATE
  { id: 'beat-lab',            zone: 'create', name: 'Beat Lab',             path: '/loop-studio',    art: 'assets/campus/beat-lab.png',          host: `${CH}chunk.png`,                 size: 0.95 },
  { id: 'jam-session',         zone: 'create', name: 'Jam Session',          path: '/free-play',      art: 'assets/campus/jam-session.png',       host: `${CH}jazzy-disco.png`,           size: 0.95 },
  { id: 'song-studio',         zone: 'create', name: "Charlie's Song Studio", path: '/song-studio',   art: 'assets/campus/song-studio.png',       host: `${CH}charlie-studio.png`,        size: 1.0 },
];

// Academy Plaza — the town square where the three streets meet. Home.
const PZ = 'assets/plaza/';
export const PLAZA_ZONE = {
  id: 'plaza', label: 'ACADEMY PLAZA', street: 'Academy Plaza', color: '#FFCC00', ground: '#9BE27A',
  tracks: [T('goody-bag', 'Goody Bag'), T('magic', 'Magic'), T('faster-as-we-go', 'Faster As We Go'), T('brand-new-friend', 'Brand New Friend')],
  strollers: [`${CH}charlie-surf.png`, `${CH}sharky-snorkel.png`],
};
export const PLAZA_BUILDINGS = [
  { id: 'quest-board',   zone: 'plaza', name: 'Quest Board',   action: 'quests',             art: `${PZ}quest-board.png`,    starter: true,  size: 0.78, flat: true, sign: 'QUESTS', signPos: { x: 50, y: 10 }, signColor: '#FFCC00' },
  { id: 'gate-play',     zone: 'plaza', name: 'Play Street',   path: '/campus?zone=play',    art: `${PZ}gate-play.png`,      host: `${CH}jazzy.png`,        starter: true,  size: 1.0,  flat: true, sign: 'PLAY',   signPos: { x: 51, y: 35 } },
  { id: 'bandstand',     zone: 'plaza', name: 'JMA Bandstand', action: 'band',               art: `${PZ}bandstand.png`, host: `${CH}charlie.png`, starter: true, size: 1.5, flat: true, custom: 'bandstand' },
  { id: 'gate-learn',    zone: 'plaza', name: 'Learn Street',  path: '/campus?zone=learn',   art: `${PZ}gate-learn.png`,     host: `${CH}charlie-grad.png`, starter: false, size: 1.0,  flat: true, sign: 'LEARN',  signPos: { x: 51, y: 26 } },
  { id: 'gate-create',   zone: 'plaza', name: 'Create Street', path: '/campus?zone=create',  art: `${PZ}gate-create.png`,    host: `${CH}chunk.png`,        starter: false, size: 1.0,  flat: true, sign: 'CREATE', signPos: { x: 51, y: 35 } },
  { id: 'jmatv',         zone: 'plaza', name: 'JMAtv',         path: '/jmatv',               art: null, custom: 'tv',                                       starter: true,  size: 1.0,  flat: true },
  { id: 'sticker-shack', zone: 'plaza', name: 'Sticker Shack', path: '/sticker-book',        art: `${PZ}sticker-shack.png`,  host: `${CH}stew.png`,         starter: true,  size: 0.9,  flat: true, sign: 'STICKERS', signPos: { x: 50, y: 7 }, signColor: '#FF2D85' },
  { id: 'dressing-room', zone: 'plaza', name: 'Dressing Room', path: '/dressing-room',       art: `${PZ}dressing-room.png`,  starter: true,  size: 0.95, flat: true, sign: 'DRESSING ROOM', signPos: { x: 50, y: 4 }, signColor: '#F9A8D4' },
];
