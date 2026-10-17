// Hulp voor het toevoegen van ingebouwde oefeningen: zet of vervangt oefeningen (op id) in het bestand van hun eerste
// categorie, en haalt ze uit een ander bestand als de hoofdcategorie veranderd is.
const fs = require('fs');
const path = require('path');

const MAP = path.join(__dirname, '..', '..', 'src', 'data', 'oefeningen');

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
  for (const o of oefeningen) {
    const volledig = { id: o.id, soort, ...o };
    const pad = path.join(dir, `${o.categorieen[0]}.json`);
    const lijst = fs.existsSync(pad) ? JSON.parse(fs.readFileSync(pad, 'utf8')) : [];
    lijst.push(volledig);
    fs.writeFileSync(pad, JSON.stringify(lijst, null, 2) + '\n');
  }
  console.log(`${oefeningen.length} oefeningen gezet (${map})`);
}

module.exports = { zet };
