// Snelle controle van een of meer oefeningen tijdens het bouwen: maakt de tijdlijn en toont per stap de tijden en wie de bal heeft.
// Gebruik: node tools/nieuw/controleer.mjs <id> [id …]
import { createJiti } from 'jiti';
import fs from 'node:fs';
import path from 'node:path';

const jiti = createJiti(import.meta.url);
const { maakTijdlijn, standOp, rondeDuur } = await jiti.import('../../src/anim/timeline.ts');
const basis = new URL('../../src/data/oefeningen/', import.meta.url);
const alle = [];
for (const map of ['veld', 'keepers']) for (const f of fs.readdirSync(new URL(map + '/', basis))) alle.push(...JSON.parse(fs.readFileSync(new URL(`${map}/${f}`, basis), 'utf8')));

for (const id of process.argv.slice(2)) {
  const o = alle.find((x) => x.id === id);
  if (!o) {
    console.log(id, ': niet gevonden');
    continue;
  }
  try {
    const tl = maakTijdlijn(o.tekening);
    const duur = rondeDuur(tl);
    console.log(`${id}: ${duur.toFixed(1)} s`);
    const personen = o.tekening.objecten.filter((x) => ['speler', 'keeper', 'trainer'].includes(x.soort)).map((x) => x.id);
    // Kleinste afstand tussen twee personen over de hele animatie.
    let min = [99, '', 0];
    for (let t = 0; t <= duur; t += 0.05) {
      const s = standOp(tl, t);
      for (let i = 0; i < personen.length; i++)
        for (let j = i + 1; j < personen.length; j++) {
          const a = s.objecten.get(personen[i]);
          const b = s.objecten.get(personen[j]);
          if (!a || !b) continue;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < min[0]) min = [d, `${personen[i]}–${personen[j]}`, t];
        }
    }
    console.log(`  kleinste afstand: ${min[0].toFixed(2)} m (${min[1]} op ${min[2].toFixed(1)} s)`);
  } catch (e) {
    console.log(`${id}: FOUT ${e.message}`);
  }
}
