// Ingebouwde oefeningen uit de bibliotheek halen: ze gaan naar src/data/oefeningen/archief.json (niet wissen), zodat
// trainingen, deellinks, teams en favorieten die ze bevatten blijven werken. Gebruik: node tools/nieuw/archiveer.cjs id id …
const fs = require('fs');
const path = require('path');

const MAP = path.join(__dirname, '..', '..', 'src', 'data', 'oefeningen');
const ids = process.argv.slice(2);
if (!ids.length) throw new Error('Geef de id’s van de oefeningen');
const archiefPad = path.join(MAP, 'archief.json');
const archief = JSON.parse(fs.readFileSync(archiefPad, 'utf8'));
const gevonden = new Set();
for (const map of ['veld', 'keepers']) {
  for (const f of fs.readdirSync(path.join(MAP, map))) {
    const pad = path.join(MAP, map, f);
    const lijst = JSON.parse(fs.readFileSync(pad, 'utf8'));
    const weg = lijst.filter((o) => ids.includes(o.id));
    if (!weg.length) continue;
    for (const o of weg) {
      const i = archief.findIndex((x) => x.id === o.id);
      if (i >= 0) archief[i] = o;
      else archief.push(o);
      gevonden.add(o.id);
    }
    fs.writeFileSync(pad, JSON.stringify(lijst.filter((o) => !ids.includes(o.id)), null, 2) + '\n');
  }
}
const mist = ids.filter((id) => !gevonden.has(id) && !archief.some((x) => x.id === id));
if (mist.length) throw new Error('Niet gevonden: ' + mist.join(', '));
fs.writeFileSync(archiefPad, JSON.stringify(archief, null, 2) + '\n');
console.log(`${gevonden.size} naar het archief`);
