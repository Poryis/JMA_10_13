// Where the lights are on each campus building. Coordinates are % of the
// building ART (not the square slot) — x/y = top-left, w/h = size.
// kind: warm (lit window) · bulb (glowing lamp) · disco (sparkling ball)
//       spot (stage light, colour-cycling) · neon (jukebox arch, hue cycle)
//       pads (blinking beat pads)
// `aspect` = art width / height, needed to map % onto the drawn image.
const R = (x, y, w, h, kind = 'warm') => ({ x, y, w, h, kind, shape: 'rect' });
const C = (x, y, w, h, kind = 'warm') => ({ x, y, w, h, kind, shape: 'circle' });

export const CAMPUS_LIGHTS = {
  'jelly-jukebox':       { aspect: 940 / 868,  lights: [R(8, 33, 40, 21), R(62, 24, 30, 68, 'neon'), R(66, 53, 20, 13, 'warm')] },
  'shred-legend':        { aspect: 940 / 928,  lights: [C(39, 27, 12, 14, 'spot'), C(81, 29, 12, 14, 'spot'), R(63, 56, 19, 38, 'neon')] },
  'stew-kazoo':          { aspect: 985 / 1022, lights: [C(45, 64, 23, 24), R(82, 66, 15, 28), R(19, 70, 20, 25, 'warm')] },
  'note-match':          { aspect: 784 / 959,  lights: [R(28, 37, 18, 21), R(54, 37, 18, 21)] },
  'detective-jellybone': { aspect: 922 / 916,  lights: [R(14, 27, 18, 15), C(9, 53, 25, 26), C(44, 56, 9, 14, 'bulb')] },
  'sight-reading':       { aspect: 855 / 997,  lights: [R(58, 33, 24, 22), R(3, 32, 37, 24)] },
  'robot-boogie':        { aspect: 886 / 945,  lights: [C(8, 46, 14, 16), C(38, 47, 16, 15), C(76, 48, 14, 14), C(55, 9, 17, 19, 'disco')] },
  'lessons':             { aspect: 884 / 894,  lights: [R(70, 62, 10, 23), R(82, 62, 10, 23), R(34, 10, 10, 12, 'bulb')] },
  'fun-facts':           { aspect: 829 / 940,  lights: [C(56, 46, 24, 24, 'bulb')] },
  'boom-garden':         { aspect: 872 / 814,  lights: [] },
  'ear-quest':           { aspect: 938 / 993,  lights: [C(8, 50, 28, 30), R(62, 60, 26, 35, 'warm')] },
  'name-that-note':      { aspect: 912 / 876,  lights: [R(40, 56, 22, 24), R(16, 60, 16, 30, 'warm')] },
  'jam-session':         { aspect: 964 / 854,  lights: [R(8, 32, 42, 23), R(55, 53, 30, 42, 'neon')] },
  'beat-lab':            { aspect: 647 / 894,  lights: [C(48, 22, 14, 12), R(3, 58, 24, 37, 'pads')] },
  'song-studio':         { aspect: 846 / 1020, lights: [R(58, 35, 24, 25), R(40, 72, 24, 25, 'warm')] },
};
