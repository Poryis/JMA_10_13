# JMA Voice Recording Script

**150 lines · 7 voices.** Lou never speaks.

## How to record
- One short take per line, 1–3 seconds. Leave ~150 ms of silence at the start, trim the tail.
- Export **MP3, mono, 44.1 kHz, ~96 kbps**, normalized to about **−3 dBFS** peak.
- File name = the `id` column exactly, plus `.mp3` (e.g. `doctor.correct.2.mp3`).
- Drop files into `frontend/public/assets/voice/`. Missing files are skipped silently, so record in any order.
- Numbered takes (`.1 .2 .3`) are variants of the same moment — the app picks one at random, so vary the delivery.
- Keep the *energy* in the "Emotion" column; the words are short on purpose — the voice does the work.

---

## Charlie the Polliwog — 43 lines
**Rooms:** Academy host · Shred City · Song Studio · Music 101 · JMAtv  
**Voice:** Bright, punky, big-hearted. The kid who is thrilled you showed up.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `charlie.hub.first` | **Welcome to the Academy!** | huge smile | Home — very first visit |
| 2 | `charlie.hub.morning` | **Good morning, Academy!** | bright | Home — before noon |
| 3 | `charlie.hub.afternoon` | **Afternoon, rockstar!** | bright | Home — noon to 5pm |
| 4 | `charlie.hub.evening` | **Evening session? Let's go!** | cozy, excited | Home — after 5pm |
| 5 | `charlie.hub.streak` | **You're on a streak!** | proud | Home — practice streak ≥ 3 days |
| 6 | `charlie.hub.quests` | **New quests today!** | eager | Home — fresh quests, none done yet |
| 7 | `charlie.hub.alldone` | **You did it all! See ya tomorrow.** | warm, satisfied | Home — all 3 quests done |
| 8 | `charlie.hub.lockbadge` | **Earn a badge first!** | playful, kind | Tapping a locked LEARN/CREATE card or tile |
| 9 | `charlie.hub.lockpass` | **Ask a grown-up about that one.** | gentle | Tapping an Academy-Pass-locked room (future) |
| 10 | `charlie.tag.shred` | **Welcome to Shred City!** | rock announcer | Entering Shred City |
| 11 | `charlie.tag.songstudio` | **Let's write a song!** | creative, warm | Entering Charlie's Song Studio |
| 12 | `charlie.tag.music101` | **Class is in session!** | teacher-y, fun | Entering Music 101 |
| 13 | `charlie.tag.jmatv` | **You're watching JMAtv!** | TV announcer | Entering JMAtv |
| 14 | `charlie.meta.badge` | **New badge!** | excited | Any achievement badge earned |
| 15 | `charlie.meta.sticker` | **New sticker!** | delighted | Any collection sticker earned |
| 16 | `charlie.meta.gem` | **You found a Daily Gem!** | awed | Daily Gem sticker earned |
| 17 | `charlie.meta.rankup` | **You ranked up!** | huge | Rank-up celebration |
| 18 | `charlie.meta.questsdone` | **All three quests. Legend!** | proud | Daily quests complete overlay |
| 19 | `charlie.meta.academyopen` | **The Academy is OPEN!** | ceremonial | First badge → LEARN/CREATE reveal |
| 20 | `charlie.meta.streak3` | **Three days in a row!** | proud | Practice streak hits 3 |
| 21 | `charlie.meta.streak7` | **A whole week? WHOA!** | amazed | Practice streak hits 7 |
| 22 | `charlie.shred.opening` | **Opening act!** | announcer | Crowd meter tier: Opening Act |
| 23 | `charlie.shred.headliner` | **You're the headliner!** | bigger | Crowd meter tier: Headliner |
| 24 | `charlie.shred.legend` | **SHRED LEGEND!** | maximum | Crowd meter maxed |
| 25 | `charlie.shred.encore` | **Encore! Encore!** | crowd-chant | Encore round starts |
| 26 | `charlie.shred.toowild` | **Whoa — too wild!** | laughing | Mash guard triggers |
| 27 | `charlie.shred.flawless` | **Flawless encore!** | stunned joy | Result card after a flawless encore |
| 28 | `charlie.correct.1` | **Yes!** | quick | Correct |
| 29 | `charlie.correct.2` | **Nailed it!** | punchy | Correct |
| 30 | `charlie.correct.3` | **That's the one!** | happy | Correct |
| 31 | `charlie.correct.4` | **Rock on!** | rock | Correct |
| 32 | `charlie.perfect.1` | **PERFECT!** | yell | Perfect |
| 33 | `charlie.perfect.2` | **Totally shredded it!** | thrilled | Perfect |
| 34 | `charlie.perfect.3` | **Whoa — flawless!** | amazed | Perfect |
| 35 | `charlie.miss.1` | **Almost!** | kind | Miss |
| 36 | `charlie.miss.2` | **Not that one — try again!** | encouraging | Miss |
| 37 | `charlie.miss.3` | **Ooh, so close.** | sympathetic | Miss |
| 38 | `charlie.miss.4` | **Shake it off, go again!** | upbeat | Miss |
| 39 | `charlie.go.1` | **Keep it going!** | cheer | Mid-game encouragement |
| 40 | `charlie.go.2` | **You've got this!** | cheer | Mid-game encouragement |
| 41 | `charlie.quest.q_shred` | **Play a show in Shred City!** | rock | Quest: Shred City |
| 42 | `charlie.quest.q_song_save` | **Save a song in my studio!** | creative | Quest: Song Studio |
| 43 | `charlie.quest.q_jmatv` | **Watch a show on JMAtv!** | TV | Quest: JMAtv |

---

## Dr. Jellybone — 18 lines
**Rooms:** Detective · Ear Quest  
**Voice:** Dry, gentlemanly sleuth. Calm, a little theatrical, never loud.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `doctor.tag.detective` | **I've got a case for you.** | noir, inviting | Entering Detective |
| 2 | `doctor.tag.earquest` | **Use your ears, detective.** | calm | Entering Ear Quest |
| 3 | `doctor.correct.1` | **Case closed!** | satisfied | Correct |
| 4 | `doctor.correct.2` | **Elementary!** | smug-fun | Correct |
| 5 | `doctor.correct.3` | **Sharp ears!** | impressed | Correct |
| 6 | `doctor.correct.4` | **Precisely.** | dry | Correct |
| 7 | `doctor.perfect.1` | **Flawless detective work!** | delighted | Perfect |
| 8 | `doctor.perfect.2` | **Not a single clue missed!** | proud | Perfect |
| 9 | `doctor.perfect.3` | **Brilliant!** | warm | Perfect |
| 10 | `doctor.miss.1` | **Hmm — not that note.** | thoughtful | Miss |
| 11 | `doctor.miss.2` | **A red herring! Listen again.** | playful | Miss |
| 12 | `doctor.miss.3` | **The clue slipped by.** | gentle | Miss |
| 13 | `doctor.miss.4` | **Close. Trust your ears.** | reassuring | Miss |
| 14 | `doctor.go.1` | **Listen closely…** | hushed | Mid-game |
| 15 | `doctor.go.2` | **Think, detective.** | coaxing | Mid-game |
| 16 | `doctor.quest.q_detective_case` | **A case awaits, kid.** | noir | Quest: Crack a case |
| 17 | `doctor.quest.q_detective_3` | **Three cases today. Can you crack 'em?** | challenge | Quest: Crack 3 cases |
| 18 | `doctor.quest.q_ear_quest` | **Five right in Ear Quest. Go.** | cool | Quest: Ear Quest |

---

## Stew — 18 lines
**Rooms:** Stew Kazoo Says · Fun Facts Clubhouse  
**Voice:** Goofy, buzzy, easily delighted. Laughs at his own kazoo.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `stew.tag.kazoo` | **Stew Kazoo says… PLAY!** | goofy | Entering Stew Kazoo Says |
| 2 | `stew.tag.funfacts` | **Welcome to the Clubhouse!** | buzzy | Entering Fun Facts Clubhouse |
| 3 | `stew.correct.1` | **Kazoo-tastic!** | silly | Correct |
| 4 | `stew.correct.2` | **You remembered!** | thrilled | Correct |
| 5 | `stew.correct.3` | **Yesss!** | squeaky | Correct |
| 6 | `stew.correct.4` | **Bzzz-rilliant!** | kazoo-buzz | Correct |
| 7 | `stew.perfect.1` | **Every single one! WOW!** | exploding | Perfect |
| 8 | `stew.perfect.2` | **Perfect memory!** | proud | Perfect |
| 9 | `stew.perfect.3` | **Stew says: AMAZING!** | announcer | Perfect |
| 10 | `stew.miss.1` | **Oopsie!** | cute | Miss |
| 11 | `stew.miss.2` | **Stew says… try again!** | kind | Miss |
| 12 | `stew.miss.3` | **Almost had it!** | cheerful | Miss |
| 13 | `stew.miss.4` | **That's okay — one more time!** | warm | Miss |
| 14 | `stew.go.1` | **Watch and listen!** | eager | Mid-game |
| 15 | `stew.go.2` | **You can do it!** | cheer | Mid-game |
| 16 | `stew.quest.q_stew_2` | **Beat my level two!** | dare | Quest: Stew level 2 |
| 17 | `stew.quest.q_stew_4` | **Level four? You're brave!** | impressed | Quest: Stew level 4 |
| 18 | `stew.quest.q_facts_3` | **Find three friends in the Clubhouse!** | eager | Quest: Fun Facts ×3 |

---

## Jazzy — 18 lines
**Rooms:** Jelly Jukebox · Jam Session  
**Voice:** Smooth, unhurried, cool. Everything is a groove.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `jazzy.tag.jukebox` | **Jelly Jukebox! Catch the groove.** | smooth DJ | Entering Jelly Jukebox |
| 2 | `jazzy.tag.jam` | **Jam Session. Make it groove!** | laid back | Entering Jam Session |
| 3 | `jazzy.correct.1` | **Smooth!** | cool | Correct / good song |
| 4 | `jazzy.correct.2` | **In the pocket!** | approving | Correct |
| 5 | `jazzy.correct.3` | **Groovy!** | warm | Correct |
| 6 | `jazzy.correct.4` | **That's the groove!** | nodding | Correct |
| 7 | `jazzy.perfect.1` | **Perfect timing!** | impressed | Perfect |
| 8 | `jazzy.perfect.2` | **Ooh — silky!** | delighted | Perfect |
| 9 | `jazzy.perfect.3` | **You ARE the beat!** | big | Perfect |
| 10 | `jazzy.miss.1` | **Missed the beat — catch the next one.** | easy | Miss |
| 11 | `jazzy.miss.2` | **Little late. That's cool.** | chill | Miss |
| 12 | `jazzy.miss.3` | **Feel it… wait for it.** | coaching | Miss |
| 13 | `jazzy.miss.4` | **Shake it off!** | light | Miss |
| 14 | `jazzy.go.1` | **Stay on the beat!** | steady | Mid-game |
| 15 | `jazzy.go.2` | **Feel the groove!** | smooth | Mid-game |
| 16 | `jazzy.quest.q_jukebox_song` | **Finish a song with me!** | inviting | Quest: Jukebox song |
| 17 | `jazzy.quest.q_jukebox_streak` | **Ten in a row. Can you?** | sly | Quest: Jukebox 10-streak |
| 18 | `jazzy.quest.q_jam_8` | **Play eight notes in the Jam Hall.** | smooth | Quest: Jam 8 notes |

---

## Chunk — 20 lines
**Rooms:** Beat Lab · Robot Boogie · Who's Got the Rhythm  
**Voice:** Deep, gentle giant. Few words, big warmth.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `chunk.tag.beatlab` | **Welcome to the Beat Lab!** | deep, warm | Entering Beat Lab |
| 2 | `chunk.tag.robot` | **Robot Boogie! Let's dance.** | rumbly fun | Entering Robot Boogie |
| 3 | `chunk.tag.boom` | **Who's got the rhythm?** | call-out | Entering Who's Got the Rhythm |
| 4 | `chunk.correct.1` | **Big beat!** | booming | Correct |
| 5 | `chunk.correct.2` | **Boom — yes!** | punchy | Correct |
| 6 | `chunk.correct.3` | **That's heavy!** | approving | Correct |
| 7 | `chunk.correct.4` | **Right on.** | calm | Correct |
| 8 | `chunk.perfect.1` | **MASSIVE!** | huge | Perfect |
| 9 | `chunk.perfect.2` | **Perfect rhythm!** | proud | Perfect |
| 10 | `chunk.perfect.3` | **Boom boom PERFECT!** | drum-like | Perfect |
| 11 | `chunk.miss.1` | **Hmm. Off a bit.** | gentle | Miss |
| 12 | `chunk.miss.2` | **Try the rhythm again.** | patient | Miss |
| 13 | `chunk.miss.3` | **Almost, big time.** | kind | Miss |
| 14 | `chunk.miss.4` | **Listen to the drums.** | coaching | Miss |
| 15 | `chunk.go.1` | **Keep the beat!** | steady | Mid-game |
| 16 | `chunk.go.2` | **Nice and steady.** | soothing | Mid-game |
| 17 | `chunk.quest.q_beat_loop` | **Build a loop in my lab.** | warm | Quest: Beat Lab loop |
| 18 | `chunk.quest.q_beat_3` | **Three tracks. Big sound!** | booming | Quest: 3-track loop |
| 19 | `chunk.quest.q_robot_4` | **Get four robots dancing!** | fun | Quest: Robot Boogie ×4 |
| 20 | `chunk.quest.q_boom` | **Pass a round of rhythm with me.** | steady | Quest: Who's Got the Rhythm |

---

## Finn — 18 lines
**Rooms:** Sight-Reading Sprint · Name That Note  
**Voice:** Quick, witty daredevil. Dares you to keep up.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `finn.tag.sightread` | **Sight-Reading Sprint! Ready?** | daring | Entering Sight-Reading Sprint |
| 2 | `finn.tag.namenote` | **Name That Note!** | game-show | Entering Name That Note |
| 3 | `finn.correct.1` | **Correct!** | snappy | Correct |
| 4 | `finn.correct.2` | **You read that!** | impressed | Correct |
| 5 | `finn.correct.3` | **Yes! Next!** | fast | Correct |
| 6 | `finn.correct.4` | **Sharp!** | quick | Correct |
| 7 | `finn.perfect.1` | **Perfect score!** | big | Perfect |
| 8 | `finn.perfect.2` | **Speed reader!** | amazed | Perfect |
| 9 | `finn.perfect.3` | **Nothing gets past you!** | proud | Perfect |
| 10 | `finn.miss.1` | **Nope — look again.** | quick, kind | Miss |
| 11 | `finn.miss.2` | **Lines and spaces!** | hinting | Miss |
| 12 | `finn.miss.3` | **Not quite.** | light | Miss |
| 13 | `finn.miss.4` | **Try the next one.** | moving on | Miss |
| 14 | `finn.go.1` | **Read ahead!** | urging | Mid-game |
| 15 | `finn.go.2` | **Eyes on the staff!** | coach | Mid-game |
| 16 | `finn.quest.q_sight_read` | **Run a sprint with me!** | daring | Quest: Sight-Reading |
| 17 | `finn.quest.q_name_note` | **Eight out of ten. Dare ya!** | dare | Quest: Name That Note |
| 18 | `finn.quest.q_lesson` | **Class time! Watch a lesson.** | bright | Quest: Music 101 lesson |

---

## Sharky — 15 lines
**Rooms:** Note Match  
**Voice:** Laid-back hip-hop cool. Short, punchy.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `sharky.tag.notematch` | **Note Match! Find the twins.** | hip-hop cool | Entering Note Match |
| 2 | `sharky.correct.1` | **Match!** | punchy | Pair found |
| 3 | `sharky.correct.2` | **Twins!** | fun | Pair found |
| 4 | `sharky.correct.3` | **Yo — nice!** | cool | Pair found |
| 5 | `sharky.correct.4` | **Found it!** | happy | Pair found |
| 6 | `sharky.perfect.1` | **Clean sweep!** | big | Round cleared |
| 7 | `sharky.perfect.2` | **Perfect match-up!** | proud | Round cleared |
| 8 | `sharky.perfect.3` | **Flawless, yo!** | thrilled | Round cleared |
| 9 | `sharky.miss.1` | **Nah — not twins.** | easy | Mismatch |
| 10 | `sharky.miss.2` | **Remember that one!** | hinting | Mismatch |
| 11 | `sharky.miss.3` | **Try again.** | chill | Mismatch |
| 12 | `sharky.miss.4` | **Keep looking.** | calm | Mismatch |
| 13 | `sharky.go.1` | **Remember the sounds.** | coach | Mid-game |
| 14 | `sharky.go.2` | **You got this.** | cool | Mid-game |
| 15 | `sharky.quest.q_note_match` | **Clear a round of Note Match.** | cool | Quest: Note Match |

