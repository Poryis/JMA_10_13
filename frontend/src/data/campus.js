// The Academy campus — every room as a building on the map.
// Every building has illustrated art; `kiosk` remains supported as a fallback.

const CH = 'assets/characters/';

export const CAMPUS_ZONES = [
  { id: 'play',   label: 'PLAY',   street: 'Jelly Jam Boulevard', color: '#FFCC00', ground: '#9BE27A', ambient: 'assets/ambient/play.mp3',   strollers: [`${CH}charlie.png`, `${CH}finn-danger.png`, `${CH}jazzy.png`] },
  { id: 'learn',  label: 'LEARN',  street: 'Music 101 Lane',      color: '#C8A8F2', ground: '#7FD1B9', ambient: 'assets/ambient/learn.mp3',  strollers: [`${CH}charlie-grad.png`, `${CH}dr-jellybone.png`, `${CH}llama-lou-stew.png`] },
  { id: 'create', label: 'CREATE', street: 'Studio Row',          color: '#7DD3C0', ground: '#F2C878', ambient: 'assets/ambient/create.mp3', strollers: [`${CH}chunk.png`, `${CH}charlie-studio.png`, `${CH}jazzy-disco.png`] },
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
  { id: 'jam-session',         zone: 'create', name: 'Jam Session',          path: '/free-play',      art: 'assets/campus/jam-session.png',       host: `${CH}jazzy-disco.png`,           size: 0.95 },
  { id: 'beat-lab',            zone: 'create', name: 'Beat Lab',             path: '/loop-studio',    art: 'assets/campus/beat-lab.png',          host: `${CH}chunk.png`,                 size: 0.95 },
  { id: 'song-studio',         zone: 'create', name: "Charlie's Song Studio", path: '/song-studio',   art: 'assets/campus/song-studio.png',       host: `${CH}charlie-studio.png`,        size: 1.0 },
];
