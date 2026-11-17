// Droog controleren: tijdlijn, kleinste afstand en fysieke fouten van oefeningen uit een bouwscript, zonder data te schrijven.
// Gebruik: node tools/nieuw/droog.mjs tools/nieuw/<bouwscript>.cjs
import { createJiti } from 'jiti';
import { createRequire } from 'node:module';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

const wortel = fileURLToPath(new URL('../../', import.meta.url));
const jiti = createJiti(wortel + 'x.js');
const { maakTijdlijn, standOp } = await jiti.import(wortel + 'src/anim/timeline.ts');
const { fysiekeFouten } = await jiti.import(wortel + 'src/anim/fysiek.ts');
const require = createRequire(wortel + 'x.js');
const { oefeningen } = require(path.resolve(wortel, process.argv[2]));
for (const o of oefeningen) {
  try {
    const t = JSON.parse(JSON.stringify(o.tekening));
    const tl = maakTijdlijn(t);
    const personen = t.objecten.filter((x) => ['speler', 'keeper', 'trainer'].includes(x.soort)).map((x) => x.id);
    let min = { d: Infinity };
    for (let s = 0; s <= tl.duur; s += 0.05) {
      const st = standOp(tl, s);
      for (let i = 0; i < personen.length; i++)
        for (let j = i + 1; j < personen.length; j++) {
          const a = st.objecten.get(personen[i]);
          const b = st.objecten.get(personen[j]);
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < min.d) min = { d, a: personen[i], b: personen[j], t: s };
        }
    }
    const f = fysiekeFouten(t);
    console.log(`${o.id}: ${tl.duur.toFixed(1)} s, kleinste ${min.d.toFixed(2)} m (${min.a}–${min.b} op ${min.t?.toFixed(1)})${f.length ? '\n   FYSIEK: ' + f.slice(0, 4).join(' | ') : ''}`);
  } catch (e) {
    console.log(`${o.id}: FOUT ${e.message}`);
  }
}
