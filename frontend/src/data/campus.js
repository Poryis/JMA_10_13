// The Academy campus — every room as a building on the map.
// Buildings without approved art yet use a `kiosk` (CSS stand with the room's icon).

export const CAMPUS_ZONES = [
  { id: 'play',   label: 'PLAY',   street: 'Jelly Jam Boulevard', color: '#FFCC00', sky: '#8FD8FF', ground: '#9BE27A' },
  { id: 'learn',  label: 'LEARN',  street: 'Music 101 Lane',      color: '#C8A8F2', sky: '#B7E3FF', ground: '#7FD1B9' },
  { id: 'create', label: 'CREATE', street: 'Studio Row',          color: '#7DD3C0', sky: '#CDEFFF', ground: '#F2C878' },
];

const CH = 'assets/characters/';
export const CAMPUS_BUILDINGS = [
  // PLAY
  { id: 'jelly-jukebox',       zone: 'play',   name: 'Jelly Jukebox',        path: '/rhythm-game',    art: 'assets/campus/jukebox-diner.png',     host: `${CH}jazzy.png`,                 starter: true,  size: 1.0 },
  { id: 'shred-legend',        zone: 'play',   name: 'Shred City',           path: '/shred-legend',   art: 'assets/campus/shred-club.png',        host: `${CH}charlie-punk.png`,          starter: false, size: 1.0 },
  { id: 'stew-kazoo',          zone: 'play',   name: 'Stew Kazoo Says',      path: '/simon-says',     art: 'assets/campus/stew-room.png',         host: `${CH}stew.png`,                  starter: true,  size: 0.95 },
  { id: 'detective-jellybone', zone: 'play',   name: "Dr. Jellybone's Office", path: '/detective',    art: 'assets/campus/detective-office.png',  host: `${CH}dr-jellybone-detective.png`, starter: true, size: 1.0 },
  { id: 'note-match',          zone: 'play',   name: 'Note Match',           path: '/note-match',     kiosk: { icon: `${CH}sharky-hiphop.png`, color: '#4285F4' }, starter: false, size: 0.8 },
  { id: 'sight-reading',       zone: 'play',   name: 'Sight-Reading Sprint', path: '/sight-reading',  kiosk: { icon: `${CH}finn-danger.png`, color: '#34A853' }, starter: false, size: 0.8 },
  { id: 'robot-boogie',        zone: 'play',   name: 'Robot Boogie',         path: '/robot-boogie',   kiosk: { icon: 'assets/robot-boogie/robot1-card-hero.png', color: '#AF52DE' }, starter: false, size: 0.8 },
  // LEARN
  { id: 'lessons',             zone: 'learn',  name: 'Music 101',            path: '/lessons',        kiosk: { icon: `${CH}charlie-grad.png`, color: '#C8A8F2' }, size: 0.95 },
  { id: 'fun-facts',           zone: 'learn',  name: 'Fun Facts Clubhouse',  path: '/fun-facts',      kiosk: { icon: `${CH}stew.png`, color: '#FF9500' }, size: 0.8 },
  { id: 'boom-garden',         zone: 'learn',  name: "Who's Got the Rhythm", path: '/boom-garden',    kiosk: { icon: `${CH}chunk-marching.png`, color: '#FF9500' }, size: 0.85 },
  { id: 'ear-quest',           zone: 'learn',  name: 'Ear Quest',            path: '/ear-trainer',    kiosk: { icon: `${CH}dr-jellybone.png`, color: '#0FA3B1' }, size: 0.8 },
  { id: 'name-that-note',      zone: 'learn',  name: 'Name That Note',       path: '/name-that-note', kiosk: { icon: `${CH}finn-danger.png`, color: '#4285F4' }, size: 0.8 },
  // CREATE
  { id: 'jam-session',         zone: 'create', name: 'Jam Session',          path: '/free-play',      kiosk: { icon: `${CH}jazzy-disco.png`, color: '#FF3B30' }, size: 0.85 },
  { id: 'beat-lab',            zone: 'create', name: 'Beat Lab',             path: '/loop-studio',    art: 'assets/campus/beat-lab.png',          host: `${CH}chunk.png`,                 size: 0.95 },
  { id: 'song-studio',         zone: 'create', name: "Charlie's Song Studio", path: '/song-studio',   art: 'assets/campus/song-studio.png',       host: `${CH}charlie-studio.png`,        size: 1.0 },
];
