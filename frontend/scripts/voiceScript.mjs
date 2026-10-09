import fs from 'fs';
const src = fs.readFileSync('src/data/voiceLines.js','utf8')
  .replace(/^export /gm,'')
  .replace(/export function[\s\S]*$/,'');
const mod = {};
new Function('mod', src + '\nmod.VOICE_CHARACTERS=VOICE_CHARACTERS; mod.VOICE_LINES=VOICE_LINES;')(mod);
const { VOICE_CHARACTERS: C, VOICE_LINES: L } = mod;
let out = `# JMA Voice Recording Script\n\n`;
out += `**${L.length} lines · ${Object.keys(C).length} voices.** Lou never speaks.\n\n`;
out += `## How to record\n- One short take per line, 1–3 seconds. Leave ~150 ms of silence at the start, trim the tail.\n- Export **MP3, mono, 44.1 kHz, ~96 kbps**, normalized to about **−3 dBFS** peak.\n- File name = the \`id\` column exactly, plus \`.mp3\` (e.g. \`doctor.correct.2.mp3\`).\n- Drop files into \`frontend/public/assets/voice/\`. Missing files are skipped silently, so record in any order.\n- Numbered takes (\`.1 .2 .3\`) are variants of the same moment — the app picks one at random, so vary the delivery.\n- Keep the *energy* in the "Emotion" column; the words are short on purpose — the voice does the work.\n\n`;
for (const [key, c] of Object.entries(C)) {
  const lines = L.filter(l => l.char === key);
  out += `---\n\n## ${c.name} — ${lines.length} lines\n**Rooms:** ${c.role}  \n**Voice:** ${c.vibe}\n\n| # | File (id) | Line | Emotion | Plays when |\n|---|---|---|---|---|\n`;
  lines.forEach((l, i) => { out += `| ${i+1} | \`${l.id}\` | **${l.text}** | ${l.emotion} | ${l.where} |\n`; });
  out += '\n';
}
fs.writeFileSync('/app/memory/voice_script.md', out);
fs.writeFileSync('public/assets/voice/README.md', `Drop recorded lines here as <id>.mp3 — see /app/memory/voice_script.md for the full list.\n`);
console.log(L.length, 'lines written');
