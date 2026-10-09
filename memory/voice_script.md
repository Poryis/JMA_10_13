# JMA Voice Recording Script

**150 lines · 7 voices.** Lou never speaks. **Finn and Sharky are the same character — one actor, one voice.**

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
**Voice:** Sinatra / Louis Prima New York wise guy. Friendly, finger-snapping, "how YOU doin'" warmth. Calls you kid, pal, champ.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `charlie.hub.first` | **Heyyy — welcome to the Academy, kid!** | huge smile | Home — very first visit |
| 2 | `charlie.hub.morning` | **Mornin', champ. Let's make some music.** | bright | Home — before noon |
| 3 | `charlie.hub.afternoon` | **Afternoon, pal! Ya ready?** | bright | Home — noon to 5pm |
| 4 | `charlie.hub.evening` | **Evenin'! Nothin' like a night session.** | cozy, excited | Home — after 5pm |
| 5 | `charlie.hub.streak` | **Look at you — on a streak!** | proud | Home — practice streak ≥ 3 days |
| 6 | `charlie.hub.quests` | **Got fresh quests for ya today.** | eager | Home — fresh quests, none done yet |
| 7 | `charlie.hub.alldone` | **That's the whole list! See ya tomorrow, kid.** | warm, satisfied | Home — all 3 quests done |
| 8 | `charlie.hub.lockbadge` | **Not yet, pal — go earn a badge first.** | playful, kind | Tapping a locked LEARN/CREATE card or tile |
| 9 | `charlie.hub.lockpass` | **Ask a grown-up about that one, kid.** | gentle | Tapping an Academy-Pass-locked room (future) |
| 10 | `charlie.tag.shred` | **Welcome to Shred City, baby!** | rock announcer | Entering Shred City |
| 11 | `charlie.tag.songstudio` | **Step into my studio. Let's write a hit.** | creative, warm | Entering Charlie's Song Studio |
| 12 | `charlie.tag.music101` | **Class is in session, folks.** | teacher-y, fun | Entering Music 101 |
| 13 | `charlie.tag.jmatv` | **You're watchin' JMAtv!** | TV announcer | Entering JMAtv |
| 14 | `charlie.meta.badge` | **Badda-bing — new badge!** | excited | Any achievement badge earned |
| 15 | `charlie.meta.sticker` | **New sticker! Lookin' sharp.** | delighted | Any collection sticker earned |
| 16 | `charlie.meta.gem` | **A Daily Gem! Now THAT'S classy.** | awed | Daily Gem sticker earned |
| 17 | `charlie.meta.rankup` | **You ranked up, kid! Big time!** | huge | Rank-up celebration |
| 18 | `charlie.meta.questsdone` | **All three quests. Whatta pro!** | proud | Daily quests complete overlay |
| 19 | `charlie.meta.academyopen` | **The Academy is OPEN, baby!** | ceremonial | First badge → LEARN/CREATE reveal |
| 20 | `charlie.meta.streak3` | **Three days runnin'! Attaboy!** | proud | Practice streak hits 3 |
| 21 | `charlie.meta.streak7` | **A whole week? Fuhgeddaboudit!** | amazed | Practice streak hits 7 |
| 22 | `charlie.shred.opening` | **Opening act! Here we go!** | announcer | Crowd meter tier: Opening Act |
| 23 | `charlie.shred.headliner` | **You're the headliner, kid!** | bigger | Crowd meter tier: Headliner |
| 24 | `charlie.shred.legend` | **SHRED LEGEND, BABY!** | maximum | Crowd meter maxed |
| 25 | `charlie.shred.encore` | **They want an encore! Encore!** | crowd-chant | Encore round starts |
| 26 | `charlie.shred.toowild` | **Whoa whoa whoa — too wild, pal!** | laughing | Mash guard triggers |
| 27 | `charlie.shred.flawless` | **Flawless encore. Un-be-lievable!** | stunned joy | Result card after a flawless encore |
| 28 | `charlie.correct.1` | **Yeah, that's it!** | quick | Correct |
| 29 | `charlie.correct.2` | **Badda-bing!** | punchy | Correct |
| 30 | `charlie.correct.3` | **Now you're cookin'!** | happy | Correct |
| 31 | `charlie.correct.4` | **That's the stuff, kid.** | rock | Correct |
| 32 | `charlie.perfect.1` | **PERFECT! Whatta pro!** | yell | Perfect |
| 33 | `charlie.perfect.2` | **Oh, you're GOOD.** | thrilled | Perfect |
| 34 | `charlie.perfect.3` | **Ring-a-ding-ding! Flawless!** | amazed | Perfect |
| 35 | `charlie.miss.1` | **Ehh, almost, pal.** | kind | Miss |
| 36 | `charlie.miss.2` | **Not that one — try it again.** | encouraging | Miss |
| 37 | `charlie.miss.3` | **Close, kid. Real close.** | sympathetic | Miss |
| 38 | `charlie.miss.4` | **Shake it off. One more time.** | upbeat | Miss |
| 39 | `charlie.go.1` | **Keep it rollin'!** | cheer | Mid-game encouragement |
| 40 | `charlie.go.2` | **You got this, champ.** | cheer | Mid-game encouragement |
| 41 | `charlie.quest.q_shred` | **Play a show in Shred City, kid!** | rock | Quest: Shred City |
| 42 | `charlie.quest.q_song_save` | **Come write a hit in my studio.** | creative | Quest: Song Studio |
| 43 | `charlie.quest.q_jmatv` | **Catch a show on JMAtv, pal.** | TV | Quest: JMAtv |

---

## Dr. Jellybone — 18 lines
**Rooms:** Detective · Ear Quest  
**Voice:** Smooth-talking jazz cat. Velvet, unhurried, gentlemanly. NEVER loud — the excitement is in the eyebrows.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `doctor.tag.detective` | **Mmm… I've got a case for you.** | noir, inviting | Entering Detective |
| 2 | `doctor.tag.earquest` | **Easy now. Just use those ears.** | calm | Entering Ear Quest |
| 3 | `doctor.correct.1` | **Case closed, baby.** | satisfied | Correct |
| 4 | `doctor.correct.2` | **Mmm-hmm. That's the one.** | smug-fun | Correct |
| 5 | `doctor.correct.3` | **Sharp ears. Real sharp.** | impressed | Correct |
| 6 | `doctor.correct.4` | **Precisely.** | dry | Correct |
| 7 | `doctor.perfect.1` | **Ohh, that was smooth.** | delighted | Perfect |
| 8 | `doctor.perfect.2` | **Not a single clue slipped by.** | proud | Perfect |
| 9 | `doctor.perfect.3` | **Now that… is detective work.** | warm | Perfect |
| 10 | `doctor.miss.1` | **Mmm, not that note.** | thoughtful | Miss |
| 11 | `doctor.miss.2` | **A red herring. Listen again.** | playful | Miss |
| 12 | `doctor.miss.3` | **The clue slipped by. It happens.** | gentle | Miss |
| 13 | `doctor.miss.4` | **Close. Trust those ears.** | reassuring | Miss |
| 14 | `doctor.go.1` | **Listen close now…** | hushed | Mid-game |
| 15 | `doctor.go.2` | **Take your time, detective.** | coaxing | Mid-game |
| 16 | `doctor.quest.q_detective_case` | **A case awaits, baby. Easy does it.** | noir | Quest: Crack a case |
| 17 | `doctor.quest.q_detective_3` | **Three cases today. Think you can hang?** | challenge | Quest: Crack 3 cases |
| 18 | `doctor.quest.q_ear_quest` | **Five right in Ear Quest. Smooth and easy.** | cool | Quest: Ear Quest |

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
**Voice:** LOUD, boisterous, fun-loving pun machine. Big belly laughs, groans at her own jokes, means every word.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `jazzy.tag.jukebox` | **JELLY JUKEBOX! Let's get this show on the ROAD!** | smooth DJ | Entering Jelly Jukebox |
| 2 | `jazzy.tag.jam` | **JAM SESSION! I hope you brought the peanut butter! HA!** | laid back | Entering Jam Session |
| 3 | `jazzy.correct.1` | **YES! That's what I'm TALKIN' about!** | cool | Correct / good song |
| 4 | `jazzy.correct.2` | **You're on a ROLL — and I'm not talkin' bread! HA!** | approving | Correct |
| 5 | `jazzy.correct.3` | **Sharp! Like a C-sharp! Get it?!** | warm | Correct |
| 6 | `jazzy.correct.4` | **THAT'S the groove, baby!** | nodding | Correct |
| 7 | `jazzy.perfect.1` | **PERFECT TIMING! Somebody call a doctor — you're ON FIRE!** | impressed | Perfect |
| 8 | `jazzy.perfect.2` | **WOW! That was NOTE-worthy! HA HA!** | delighted | Perfect |
| 9 | `jazzy.perfect.3` | **You ARE the beat! Can't BEAT that!** | big | Perfect |
| 10 | `jazzy.miss.1` | **Missed it! But hey — catch the next one!** | easy | Miss |
| 11 | `jazzy.miss.2` | **A little late — fashionably late! HA!** | chill | Miss |
| 12 | `jazzy.miss.3` | **Oof! Feel it… wait for it…** | coaching | Miss |
| 13 | `jazzy.miss.4` | **Shake it off! Like a maraca!** | light | Miss |
| 14 | `jazzy.go.1` | **STAY on that beat!** | steady | Mid-game |
| 15 | `jazzy.go.2` | **Feel the groove, baby!** | smooth | Mid-game |
| 16 | `jazzy.quest.q_jukebox_song` | **Finish a song with me! It'll be MUSIC to my ears! HA!** | inviting | Quest: Jukebox song |
| 17 | `jazzy.quest.q_jukebox_streak` | **TEN in a row! I DARE ya!** | sly | Quest: Jukebox 10-streak |
| 18 | `jazzy.quest.q_jam_8` | **Eight notes in the Jam Hall — go go GO!** | smooth | Quest: Jam 8 notes |

---

## Chunk — 20 lines
**Rooms:** Beat Lab · Robot Boogie · Who's Got the Rhythm  
**Voice:** Stereotypical surfer bro. "Duuude." Laid back, stoked, everything is gnarly or epic.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `chunk.tag.beatlab` | **Duuude. Welcome to the Beat Lab.** | deep, warm | Entering Beat Lab |
| 2 | `chunk.tag.robot` | **Robot Boogie, bro! Let's dance.** | rumbly fun | Entering Robot Boogie |
| 3 | `chunk.tag.boom` | **Who's got the rhythm, dude?** | call-out | Entering Who's Got the Rhythm |
| 4 | `chunk.correct.1` | **Gnarly beat, bro!** | booming | Correct |
| 5 | `chunk.correct.2` | **Booom! Yes, dude!** | punchy | Correct |
| 6 | `chunk.correct.3` | **That's heavy, man.** | approving | Correct |
| 7 | `chunk.correct.4` | **Right on, bro.** | calm | Correct |
| 8 | `chunk.perfect.1` | **DUUUDE. Epic.** | huge | Perfect |
| 9 | `chunk.perfect.2` | **Perfect rhythm! Totally stoked!** | proud | Perfect |
| 10 | `chunk.perfect.3` | **Boom boom PERFECT, brah!** | drum-like | Perfect |
| 11 | `chunk.miss.1` | **Whoa, little off, dude.** | gentle | Miss |
| 12 | `chunk.miss.2` | **Try the rhythm again, bro.** | patient | Miss |
| 13 | `chunk.miss.3` | **Almost, man. Almost.** | kind | Miss |
| 14 | `chunk.miss.4` | **Listen to the drums, dude.** | coaching | Miss |
| 15 | `chunk.go.1` | **Keep the beat, bro!** | steady | Mid-game |
| 16 | `chunk.go.2` | **Nice and mellow, dude.** | soothing | Mid-game |
| 17 | `chunk.quest.q_beat_loop` | **Build a loop in my lab, dude.** | warm | Quest: Beat Lab loop |
| 18 | `chunk.quest.q_beat_3` | **Three tracks, bro. BIG sound.** | booming | Quest: 3-track loop |
| 19 | `chunk.quest.q_robot_4` | **Get four robots dancin', dude!** | fun | Quest: Robot Boogie ×4 |
| 20 | `chunk.quest.q_boom` | **Pass a round of rhythm with me, bro.** | steady | Quest: Who's Got the Rhythm |

---

## Finn — 18 lines
**Rooms:** Sight-Reading Sprint · Name That Note  
**Voice:** Jerry Lewis "HEY LADY!" energy — always on the brink of joyous laughter, can't contain his excitement at ANYTHING. SAME VOICE as Sharky.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `finn.tag.sightread` | **Sight-Reading SPRINT! Oh boy oh boy, ready?!** | daring | Entering Sight-Reading Sprint |
| 2 | `finn.tag.namenote` | **NAME! THAT! NOTE! Hee-hee!** | game-show | Entering Name That Note |
| 3 | `finn.correct.1` | **YES! Ha-HA!** | snappy | Correct |
| 4 | `finn.correct.2` | **You READ that! Oh, I love it!** | impressed | Correct |
| 5 | `finn.correct.3` | **Right! Next one, next one!** | fast | Correct |
| 6 | `finn.correct.4` | **Oh, that's SHARP!** | quick | Correct |
| 7 | `finn.perfect.1` | **PERFECT SCORE! I can't — I CAN'T!** | big | Perfect |
| 8 | `finn.perfect.2` | **Speed reader! HEY, LOOK at you!** | amazed | Perfect |
| 9 | `finn.perfect.3` | **Nothing gets past you! NOTHING! Ha!** | proud | Perfect |
| 10 | `finn.miss.1` | **Nope-nope-nope — look again!** | quick, kind | Miss |
| 11 | `finn.miss.2` | **Lines and spaces, lines and spaces!** | hinting | Miss |
| 12 | `finn.miss.3` | **Not quite — ha! — try again!** | light | Miss |
| 13 | `finn.miss.4` | **Ooh! Next one, next one!** | moving on | Miss |
| 14 | `finn.go.1` | **Read ahead, read ahead!** | urging | Mid-game |
| 15 | `finn.go.2` | **Eyes on the staff! Hee!** | coach | Mid-game |
| 16 | `finn.quest.q_sight_read` | **Run a sprint with me! Oh boy!** | daring | Quest: Sight-Reading |
| 17 | `finn.quest.q_name_note` | **Eight outta ten! I DARE ya! Hee-hee!** | dare | Quest: Name That Note |
| 18 | `finn.quest.q_lesson` | **Class time! Watch a lesson — it's FUN!** | bright | Quest: Music 101 lesson |

---

## Sharky — 15 lines
**Rooms:** Note Match  
**Voice:** Same character/voice as Finn: Jerry Lewis "HEY LADY!" — giddy, cracking up, thrilled by everything.

| # | File (id) | Line | Emotion | Plays when |
|---|---|---|---|---|
| 1 | `sharky.tag.notematch` | **NOTE MATCH! Find the twins! Oh, I love this one!** | hip-hop cool | Entering Note Match |
| 2 | `sharky.correct.1` | **MATCH! Ha-HA!** | punchy | Pair found |
| 3 | `sharky.correct.2` | **TWINS! Oh, look at 'em!** | fun | Pair found |
| 4 | `sharky.correct.3` | **YES! You found it!** | cool | Pair found |
| 5 | `sharky.correct.4` | **That's a match! Hee-hee!** | happy | Pair found |
| 6 | `sharky.perfect.1` | **CLEAN SWEEP! I can't believe it!** | big | Round cleared |
| 7 | `sharky.perfect.2` | **Perfect match-up! HEY, LOOK at that!** | proud | Round cleared |
| 8 | `sharky.perfect.3` | **Flawless! FLAWLESS! Ha!** | thrilled | Round cleared |
| 9 | `sharky.miss.1` | **Nope! Not twins! Ha!** | easy | Mismatch |
| 10 | `sharky.miss.2` | **Ooh, remember that one!** | hinting | Mismatch |
| 11 | `sharky.miss.3` | **Try again, try again!** | chill | Mismatch |
| 12 | `sharky.miss.4` | **Keep lookin'! Hee!** | calm | Mismatch |
| 13 | `sharky.go.1` | **Remember the sounds!** | coach | Mid-game |
| 14 | `sharky.go.2` | **You got this! Oh boy!** | cool | Mid-game |
| 15 | `sharky.quest.q_note_match` | **Clear a round of Note Match! Oh boy oh boy!** | cool | Quest: Note Match |

