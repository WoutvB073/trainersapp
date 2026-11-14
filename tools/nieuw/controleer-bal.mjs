// Hulp bij het afstemmen: toont de balgebeurtenissen (vluchten) en bewegingen met hun tijden. Gebruik: node tools/nieuw/controleer-bal.mjs <id>
import { createJiti } from 'jiti';
import fs from 'node:fs';

const jiti = createJiti(import.meta.url);
const { maakTijdlijn } = await jiti.import('../../src/anim/timeline.ts');
const basis = new URL('../../src/data/oefeningen/', import.meta.url);
const alle = [];
for (const map of ['veld', 'keepers']) for (const f of fs.readdirSync(new URL(map + '/', basis))) alle.push(...JSON.parse(fs.readFileSync(new URL(`${map}/${f}`, basis), 'utf8')));
const o = alle.find((x) => x.id === process.argv[2]);
const tekening = JSON.parse(JSON.stringify(o.tekening));
if (process.argv[3]) tekening.animatie = tekening.animatie.slice(0, Number(process.argv[3]));
const tl = maakTijdlijn(tekening);
const n = (p) => (Array.isArray(p) ? `[${p.map((v) => v.toFixed(1)).join(', ')}]` : p);
for (const [bal, lijst] of tl.balEvents) for (const e of lijst) console.log(`bal ${bal}: ${e.soort} ${e.t0?.toFixed(2) ?? e.t?.toFixed(2)}–${e.t1?.toFixed(2) ?? ''} ${e.van ? n(e.van) : ''} → ${e.naar ? n(e.naar) : ''} ${e.daarna ?? ''} ${e.bij ?? e.wie ?? ''}`);
for (const [id, lijst] of tl.bewegingen) for (const b of lijst) console.log(`loop ${id}: ${b.t0.toFixed(2)}–${b.t1.toFixed(2)} ${n(b.pad[0])} → ${n(b.pad.at(-1))} ${(b.lengtes.at(-1) / (b.t1 - b.t0)).toFixed(1)} m/s ${b.manier ?? ''}`);
console.log('duur', tl.duur.toFixed(2));
