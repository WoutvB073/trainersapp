// Rugnummers in de voorbeeldtactieken, voorbeeldhervattingen en beginsituaties nalopen (0.35.0), met de regels uit
// src/wedstrijd/nummerControle.ts. Gebruik: node tools/nummers-audit.mjs [-v]
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const { TACTIEKEN } = await jiti.import('../src/wedstrijd/tactieken.ts');
const { HERVATTINGEN } = await jiti.import('../src/wedstrijd/hervattingVoorbeelden.ts');
const { SITUATIES } = await jiti.import('../src/wedstrijd/hervattingen.ts');
const { nummerFouten } = await jiti.import('../src/wedstrijd/nummerControle.ts');
const uitgebreid = process.argv.includes('-v');

let fout = 0;
let aantal = 0;
const loop = (soort, id, versie, tekening) => {
  aantal++;
  const fouten = nummerFouten(tekening);
  if (fouten.length) {
    fout++;
    console.log(`${soort} ${id} [${versie}]: ${fouten.join('; ')}`);
  } else if (uitgebreid) console.log(`${soort} ${id} [${versie}]: goed`);
};
for (const t of TACTIEKEN) for (const v of t.versies) loop('tactiek', t.id, v.id, v.maak());
for (const t of HERVATTINGEN) for (const v of t.versies) loop('hervatting', t.id, v.id, v.maak());
for (const s of SITUATIES) loop('situatie', s.id, '-', s.maak());
console.log(`${aantal} borden bekeken, ${fout} met een nummer op de verkeerde kant of dubbel.`);
process.exit(fout ? 1 : 0);
