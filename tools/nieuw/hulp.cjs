// Hulp voor het toevoegen van ingebouwde oefeningen: zet of vervangt oefeningen (op id) in het bestand van hun eerste
// categorie, en haalt ze uit een ander bestand als de hoofdcategorie veranderd is.
// 0.26.0: een oefening mag een `en`-blok hebben (naam, uitleg, organisatie, benodigdheden, coachpunten, variaties,
// meerSpelers, onderdelen); dat gaat naar src/data/en/<map>-<categorie>.json.
const fs = require('fs');
const path = require('path');

const MAP = path.join(__dirname, '..', '..', 'src', 'data', 'oefeningen');
const EN = path.join(__dirname, '..', '..', 'src', 'data', 'en');

function zet(map, oefeningen) {
  const soort = map === 'keepers' ? 'keeper' : 'veld';
  const dir = path.join(MAP, map);
  const ids = new Set(oefeningen.map((o) => o.id));
  // Eerst overal weghalen (ook als de hoofdcategorie veranderde).
  for (const f of fs.readdirSync(dir)) {
    const pad = path.join(dir, f);
    const lijst = JSON.parse(fs.readFileSync(pad, 'utf8'));
    const rest = lijst.filter((o) => !ids.has(o.id));
    if (rest.length !== lijst.length) fs.writeFileSync(pad, JSON.stringify(rest, null, 2) + '\n');
  }
  const metEngels = oefeningen.filter((o) => o.en);
  if (metEngels.length) {
    for (const f of fs.readdirSync(EN).filter((f) => f.startsWith(`${map}-`))) {
      const pad = path.join(EN, f);
      const d = JSON.parse(fs.readFileSync(pad, 'utf8'));
      let weg = false;
      for (const o of metEngels) if (d[o.id]) (delete d[o.id], (weg = true));
      if (weg) fs.writeFileSync(pad, JSON.stringify(d, null, 2) + '\n');
    }
  }
  for (const { en, ...o } of oefeningen) {
    const volledig = { id: o.id, soort, ...o };
    const pad = path.join(dir, `${o.categorieen[0]}.json`);
    const lijst = fs.existsSync(pad) ? JSON.parse(fs.readFileSync(pad, 'utf8')) : [];
    lijst.push(volledig);
    fs.writeFileSync(pad, JSON.stringify(lijst, null, 2) + '\n');
    if (en) {
      const enPad = path.join(EN, `${map}-${o.categorieen[0]}.json`);
      const d = fs.existsSync(enPad) ? JSON.parse(fs.readFileSync(enPad, 'utf8')) : {};
      d[o.id] = en;
      fs.writeFileSync(enPad, JSON.stringify(d, null, 2) + '\n');
    }
  }
  console.log(`${oefeningen.length} oefeningen gezet (${map}), ${metEngels.length} met Engels`);
}

module.exports = { zet };
