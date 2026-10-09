// Voice-line registry — every spoken blurb in the Academy.
//
// Audio files live at public/assets/voice/<id>.mp3 and are recorded by real
// humans. The app plays a line via say('group') (see lib/voice.js); groups
// with numbered variants (e.g. 'doctor.correct') pick a random take.
// Missing files fail silently so lines can be dropped in as they're recorded.

export const VOICE_CHARACTERS = {
  charlie: { name: 'Charlie the Polliwog', role: 'Academy host · Shred City · Song Studio · Music 101 · JMAtv', vibe: 'Bright, punky, big-hearted. The kid who is thrilled you showed up.' },
  doctor:  { name: 'Dr. Jellybone',        role: 'Detective · Ear Quest',                                     vibe: 'Dry, gentlemanly sleuth. Calm, a little theatrical, never loud.' },
  stew:    { name: 'Stew',                  role: 'Stew Kazoo Says · Fun Facts Clubhouse',                     vibe: 'Goofy, buzzy, easily delighted. Laughs at his own kazoo.' },
  jazzy:   { name: 'Jazzy',                 role: 'Jelly Jukebox · Jam Session',                               vibe: 'Smooth, unhurried, cool. Everything is a groove.' },
  chunk:   { name: 'Chunk',                 role: "Beat Lab · Robot Boogie · Who's Got the Rhythm",            vibe: 'Deep, gentle giant. Few words, big warmth.' },
  finn:    { name: 'Finn',                  role: 'Sight-Reading Sprint · Name That Note',                     vibe: 'Quick, witty daredevil. Dares you to keep up.' },
  sharky:  { name: 'Sharky',                role: 'Note Match',                                                vibe: 'Laid-back hip-hop cool. Short, punchy.' },
  // Lou never talks. By design.
};

// id format: <character>.<group>[.<variant>]
const L = (id, text, emotion, where) => {
  const [char] = id.split('.');
  return { id, char, text, emotion, where };
};

export const VOICE_LINES = [
  // ───────────── CHARLIE — Academy host (Home hub) ─────────────
  L('charlie.hub.first',     'Welcome to the Academy!',            'huge smile',     'Home — very first visit'),
  L('charlie.hub.morning',   'Good morning, Academy!',             'bright',         'Home — before noon'),
  L('charlie.hub.afternoon', 'Afternoon, rockstar!',               'bright',         'Home — noon to 5pm'),
  L('charlie.hub.evening',   'Evening session? Let\'s go!',        'cozy, excited',  'Home — after 5pm'),
  L('charlie.hub.streak',    'You\'re on a streak!',               'proud',          'Home — practice streak ≥ 3 days'),
  L('charlie.hub.quests',    'New quests today!',                  'eager',          'Home — fresh quests, none done yet'),
  L('charlie.hub.alldone',   'You did it all! See ya tomorrow.',   'warm, satisfied','Home — all 3 quests done'),
  L('charlie.hub.lockbadge', 'Earn a badge first!',                'playful, kind',  'Tapping a locked LEARN/CREATE card or tile'),
  L('charlie.hub.lockpass',  'Ask a grown-up about that one.',     'gentle',         'Tapping an Academy-Pass-locked room (future)'),

  // Charlie — room taglines
  L('charlie.tag.shred',     'Welcome to Shred City!',             'rock announcer', 'Entering Shred City'),
  L('charlie.tag.songstudio','Let\'s write a song!',               'creative, warm', 'Entering Charlie\'s Song Studio'),
  L('charlie.tag.music101',  'Class is in session!',               'teacher-y, fun', 'Entering Music 101'),
  L('charlie.tag.jmatv',     'You\'re watching JMAtv!',            'TV announcer',   'Entering JMAtv'),

  // Charlie — meta moments
  L('charlie.meta.badge',      'New badge!',                       'excited',        'Any achievement badge earned'),
  L('charlie.meta.sticker',    'New sticker!',                     'delighted',      'Any collection sticker earned'),
  L('charlie.meta.gem',        'You found a Daily Gem!',           'awed',           'Daily Gem sticker earned'),
  L('charlie.meta.rankup',     'You ranked up!',                   'huge',           'Rank-up celebration'),
  L('charlie.meta.questsdone', 'All three quests. Legend!',        'proud',          'Daily quests complete overlay'),
  L('charlie.meta.academyopen','The Academy is OPEN!',             'ceremonial',     'First badge → LEARN/CREATE reveal'),
  L('charlie.meta.streak3',    'Three days in a row!',             'proud',          'Practice streak hits 3'),
  L('charlie.meta.streak7',    'A whole week? WHOA!',              'amazed',         'Practice streak hits 7'),

  // Charlie — Shred City moments
  L('charlie.shred.opening',   'Opening act!',                     'announcer',      'Crowd meter tier: Opening Act'),
  L('charlie.shred.headliner', 'You\'re the headliner!',           'bigger',         'Crowd meter tier: Headliner'),
  L('charlie.shred.legend',    'SHRED LEGEND!',                    'maximum',        'Crowd meter maxed'),
  L('charlie.shred.encore',    'Encore! Encore!',                  'crowd-chant',    'Encore round starts'),
  L('charlie.shred.toowild',   'Whoa — too wild!',                 'laughing',       'Mash guard triggers'),
  L('charlie.shred.flawless',  'Flawless encore!',                 'stunned joy',    'Result card after a flawless encore'),

  // Charlie — reactions (Song Studio / Shred / lessons)
  L('charlie.correct.1', 'Yes!',                 'quick',   'Correct'),
  L('charlie.correct.2', 'Nailed it!',           'punchy',  'Correct'),
  L('charlie.correct.3', 'That\'s the one!',     'happy',   'Correct'),
  L('charlie.correct.4', 'Rock on!',             'rock',    'Correct'),
  L('charlie.perfect.1', 'PERFECT!',             'yell',    'Perfect'),
  L('charlie.perfect.2', 'Totally shredded it!', 'thrilled','Perfect'),
  L('charlie.perfect.3', 'Whoa — flawless!',     'amazed',  'Perfect'),
  L('charlie.miss.1',    'Almost!',              'kind',    'Miss'),
  L('charlie.miss.2',    'Not that one — try again!', 'encouraging', 'Miss'),
  L('charlie.miss.3',    'Ooh, so close.',       'sympathetic', 'Miss'),
  L('charlie.miss.4',    'Shake it off, go again!', 'upbeat', 'Miss'),
  L('charlie.go.1',      'Keep it going!',       'cheer',   'Mid-game encouragement'),
  L('charlie.go.2',      'You\'ve got this!',    'cheer',   'Mid-game encouragement'),

  // ───────────── DR. JELLYBONE — Detective, Ear Quest ─────────────
  L('doctor.tag.detective', 'I\'ve got a case for you.',  'noir, inviting', 'Entering Detective'),
  L('doctor.tag.earquest',  'Use your ears, detective.',  'calm',           'Entering Ear Quest'),
  L('doctor.correct.1', 'Case closed!',        'satisfied',   'Correct'),
  L('doctor.correct.2', 'Elementary!',         'smug-fun',    'Correct'),
  L('doctor.correct.3', 'Sharp ears!',         'impressed',   'Correct'),
  L('doctor.correct.4', 'Precisely.',          'dry',         'Correct'),
  L('doctor.perfect.1', 'Flawless detective work!', 'delighted', 'Perfect'),
  L('doctor.perfect.2', 'Not a single clue missed!', 'proud',    'Perfect'),
  L('doctor.perfect.3', 'Brilliant!',          'warm',        'Perfect'),
  L('doctor.miss.1',    'Hmm — not that note.', 'thoughtful',  'Miss'),
  L('doctor.miss.2',    'A red herring! Listen again.', 'playful', 'Miss'),
  L('doctor.miss.3',    'The clue slipped by.', 'gentle',      'Miss'),
  L('doctor.miss.4',    'Close. Trust your ears.', 'reassuring', 'Miss'),
  L('doctor.go.1',      'Listen closely…',     'hushed',      'Mid-game'),
  L('doctor.go.2',      'Think, detective.',   'coaxing',     'Mid-game'),

  // ───────────── STEW — Stew Kazoo Says, Fun Facts ─────────────
  L('stew.tag.kazoo',    'Stew Kazoo says… PLAY!',       'goofy',    'Entering Stew Kazoo Says'),
  L('stew.tag.funfacts', 'Welcome to the Clubhouse!',    'buzzy',    'Entering Fun Facts Clubhouse'),
  L('stew.correct.1', 'Kazoo-tastic!',          'silly',      'Correct'),
  L('stew.correct.2', 'You remembered!',        'thrilled',   'Correct'),
  L('stew.correct.3', 'Yesss!',                 'squeaky',    'Correct'),
  L('stew.correct.4', 'Bzzz-rilliant!',         'kazoo-buzz', 'Correct'),
  L('stew.perfect.1', 'Every single one! WOW!', 'exploding',  'Perfect'),
  L('stew.perfect.2', 'Perfect memory!',        'proud',      'Perfect'),
  L('stew.perfect.3', 'Stew says: AMAZING!',    'announcer',  'Perfect'),
  L('stew.miss.1',    'Oopsie!',                'cute',       'Miss'),
  L('stew.miss.2',    'Stew says… try again!',  'kind',       'Miss'),
  L('stew.miss.3',    'Almost had it!',         'cheerful',   'Miss'),
  L('stew.miss.4',    'That\'s okay — one more time!', 'warm', 'Miss'),
  L('stew.go.1',      'Watch and listen!',      'eager',      'Mid-game'),
  L('stew.go.2',      'You can do it!',         'cheer',      'Mid-game'),

  // ───────────── JAZZY — Jelly Jukebox, Jam Session ─────────────
  L('jazzy.tag.jukebox', 'Jelly Jukebox! Catch the groove.', 'smooth DJ', 'Entering Jelly Jukebox'),
  L('jazzy.tag.jam',     'Jam Session. Make it groove!',     'laid back',  'Entering Jam Session'),
  L('jazzy.correct.1', 'Smooth!',               'cool',       'Correct / good song'),
  L('jazzy.correct.2', 'In the pocket!',        'approving',  'Correct'),
  L('jazzy.correct.3', 'Groovy!',               'warm',       'Correct'),
  L('jazzy.correct.4', 'That\'s the groove!',   'nodding',    'Correct'),
  L('jazzy.perfect.1', 'Perfect timing!',       'impressed',  'Perfect'),
  L('jazzy.perfect.2', 'Ooh — silky!',          'delighted',  'Perfect'),
  L('jazzy.perfect.3', 'You ARE the beat!',     'big',        'Perfect'),
  L('jazzy.miss.1',    'Missed the beat — catch the next one.', 'easy', 'Miss'),
  L('jazzy.miss.2',    'Little late. That\'s cool.', 'chill',   'Miss'),
  L('jazzy.miss.3',    'Feel it… wait for it.', 'coaching',   'Miss'),
  L('jazzy.miss.4',    'Shake it off!',         'light',      'Miss'),
  L('jazzy.go.1',      'Stay on the beat!',     'steady',     'Mid-game'),
  L('jazzy.go.2',      'Feel the groove!',      'smooth',     'Mid-game'),

  // ───────────── CHUNK — Beat Lab, Robot Boogie, Who's Got the Rhythm ─────────────
  L('chunk.tag.beatlab', 'Welcome to the Beat Lab!',  'deep, warm',  'Entering Beat Lab'),
  L('chunk.tag.robot',   'Robot Boogie! Let\'s dance.', 'rumbly fun', 'Entering Robot Boogie'),
  L('chunk.tag.boom',    'Who\'s got the rhythm?',    'call-out',    "Entering Who's Got the Rhythm"),
  L('chunk.correct.1', 'Big beat!',             'booming',    'Correct'),
  L('chunk.correct.2', 'Boom — yes!',           'punchy',     'Correct'),
  L('chunk.correct.3', 'That\'s heavy!',        'approving',  'Correct'),
  L('chunk.correct.4', 'Right on.',             'calm',       'Correct'),
  L('chunk.perfect.1', 'MASSIVE!',              'huge',       'Perfect'),
  L('chunk.perfect.2', 'Perfect rhythm!',       'proud',      'Perfect'),
  L('chunk.perfect.3', 'Boom boom PERFECT!',    'drum-like',  'Perfect'),
  L('chunk.miss.1',    'Hmm. Off a bit.',       'gentle',     'Miss'),
  L('chunk.miss.2',    'Try the rhythm again.', 'patient',    'Miss'),
  L('chunk.miss.3',    'Almost, big time.',     'kind',       'Miss'),
  L('chunk.miss.4',    'Listen to the drums.',  'coaching',   'Miss'),
  L('chunk.go.1',      'Keep the beat!',        'steady',     'Mid-game'),
  L('chunk.go.2',      'Nice and steady.',      'soothing',   'Mid-game'),

  // ───────────── FINN — Sight-Reading, Name That Note ─────────────
  L('finn.tag.sightread', 'Sight-Reading Sprint! Ready?', 'daring',  'Entering Sight-Reading Sprint'),
  L('finn.tag.namenote',  'Name That Note!',              'game-show','Entering Name That Note'),
  L('finn.correct.1', 'Correct!',              'snappy',     'Correct'),
  L('finn.correct.2', 'You read that!',        'impressed',  'Correct'),
  L('finn.correct.3', 'Yes! Next!',            'fast',       'Correct'),
  L('finn.correct.4', 'Sharp!',                'quick',      'Correct'),
  L('finn.perfect.1', 'Perfect score!',        'big',        'Perfect'),
  L('finn.perfect.2', 'Speed reader!',         'amazed',     'Perfect'),
  L('finn.perfect.3', 'Nothing gets past you!','proud',      'Perfect'),
  L('finn.miss.1',    'Nope — look again.',    'quick, kind','Miss'),
  L('finn.miss.2',    'Lines and spaces!',     'hinting',    'Miss'),
  L('finn.miss.3',    'Not quite.',            'light',      'Miss'),
  L('finn.miss.4',    'Try the next one.',     'moving on',  'Miss'),
  L('finn.go.1',      'Read ahead!',           'urging',     'Mid-game'),
  L('finn.go.2',      'Eyes on the staff!',    'coach',      'Mid-game'),

  // ───────────── SHARKY — Note Match ─────────────
  L('sharky.tag.notematch', 'Note Match! Find the twins.', 'hip-hop cool', 'Entering Note Match'),
  L('sharky.correct.1', 'Match!',              'punchy',     'Pair found'),
  L('sharky.correct.2', 'Twins!',              'fun',        'Pair found'),
  L('sharky.correct.3', 'Yo — nice!',          'cool',       'Pair found'),
  L('sharky.correct.4', 'Found it!',           'happy',      'Pair found'),
  L('sharky.perfect.1', 'Clean sweep!',        'big',        'Round cleared'),
  L('sharky.perfect.2', 'Perfect match-up!',   'proud',      'Round cleared'),
  L('sharky.perfect.3', 'Flawless, yo!',       'thrilled',   'Round cleared'),
  L('sharky.miss.1',    'Nah — not twins.',    'easy',       'Mismatch'),
  L('sharky.miss.2',    'Remember that one!',  'hinting',    'Mismatch'),
  L('sharky.miss.3',    'Try again.',          'chill',      'Mismatch'),
  L('sharky.miss.4',    'Keep looking.',       'calm',       'Mismatch'),
  L('sharky.go.1',      'Remember the sounds.','coach',      'Mid-game'),
  L('sharky.go.2',      'You got this.',       'cool',       'Mid-game'),

  // ───────────── QUEST NUDGES (tap GO on a Daily Quest) ─────────────
  L('doctor.quest.q_detective_case', 'A case awaits, kid.',                 'noir',     'Quest: Crack a case'),
  L('doctor.quest.q_detective_3',    'Three cases today. Can you crack \'em?', 'challenge', 'Quest: Crack 3 cases'),
  L('doctor.quest.q_ear_quest',      'Five right in Ear Quest. Go.',        'cool',     'Quest: Ear Quest'),
  L('stew.quest.q_stew_2',           'Beat my level two!',                  'dare',     'Quest: Stew level 2'),
  L('stew.quest.q_stew_4',           'Level four? You\'re brave!',          'impressed','Quest: Stew level 4'),
  L('stew.quest.q_facts_3',          'Find three friends in the Clubhouse!','eager',    'Quest: Fun Facts ×3'),
  L('jazzy.quest.q_jukebox_song',    'Finish a song with me!',              'inviting', 'Quest: Jukebox song'),
  L('jazzy.quest.q_jukebox_streak',  'Ten in a row. Can you?',              'sly',      'Quest: Jukebox 10-streak'),
  L('jazzy.quest.q_jam_8',           'Play eight notes in the Jam Hall.',   'smooth',   'Quest: Jam 8 notes'),
  L('chunk.quest.q_beat_loop',       'Build a loop in my lab.',             'warm',     'Quest: Beat Lab loop'),
  L('chunk.quest.q_beat_3',          'Three tracks. Big sound!',            'booming',  'Quest: 3-track loop'),
  L('chunk.quest.q_robot_4',         'Get four robots dancing!',            'fun',      'Quest: Robot Boogie ×4'),
  L('chunk.quest.q_boom',            'Pass a round of rhythm with me.',     'steady',   "Quest: Who's Got the Rhythm"),
  L('finn.quest.q_sight_read',       'Run a sprint with me!',               'daring',   'Quest: Sight-Reading'),
  L('finn.quest.q_name_note',        'Eight out of ten. Dare ya!',          'dare',     'Quest: Name That Note'),
  L('finn.quest.q_lesson',           'Class time! Watch a lesson.',         'bright',   'Quest: Music 101 lesson'),
  L('sharky.quest.q_note_match',     'Clear a round of Note Match.',        'cool',     'Quest: Note Match'),
  L('charlie.quest.q_shred',         'Play a show in Shred City!',          'rock',     'Quest: Shred City'),
  L('charlie.quest.q_song_save',     'Save a song in my studio!',           'creative', 'Quest: Song Studio'),
  L('charlie.quest.q_jmatv',         'Watch a show on JMAtv!',              'TV',       'Quest: JMAtv'),
];

export const VOICE_MAP = Object.fromEntries(VOICE_LINES.map(l => [l.id, l]));

// Which character "owns" a quest's voice line → id for say().
export function questVoiceId(questId) {
  return VOICE_LINES.find(l => l.id.endsWith(`.quest.${questId}`))?.id || null;
}
