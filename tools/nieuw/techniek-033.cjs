// 0.33.0: categorie Techniek opschonen. Techniek is alleen balcontrole; deze oefeningen hebben een schot op doel of zijn een partijvorm
// en houden hun andere categorieën. De eerste categorie = het bestand, dus sommige verhuizen. Draaien: node tools/nieuw/techniek-033.cjs
const fs = require('fs');
const path = require('path');

const MAP = path.join(__dirname, '..', '..', 'src', 'data', 'oefeningen', 'veld');
const EN = path.join(__dirname, '..', '..', 'src', 'data', 'en');
const WEG = [
  'veld-af-dribbel-afronden',
  'veld-cv-ladder-slalom-schot',
  'veld-cv-draaien-voorzet',
  'veld-pv-1-1-doeltjes',
  'veld-cv-1t1-2t1',
  'veld-sp-pannavoetbal',
  'veld-cv-estafette',
  'veld-af-kleine-doeltjes',
  'veld-cv-aanname-lucht-schot',
  'veld-cv-rebounder-doeltjes',
  'veld-tq-gerichte-aanname-voren',
  'veld-tq-vrijlopen-rug-verdediger',
];

const lees = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const schrijf = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');

const verhuizen = [];
for (const f of fs.readdirSync(MAP)) {
  const pad = path.join(MAP, f);
  const lijst = lees(pad);
  const blijft = [];
  for (const o of lijst) {
    if (WEG.includes(o.id) && o.categorieen.includes('techniek')) {
      o.categorieen = o.categorieen.filter((c) => c !== 'techniek');
      if (o.categorieen[0] !== path.basename(f, '.json')) {
        verhuizen.push({ o, van: path.basename(f, '.json') });
        continue;
      }
    }
    blijft.push(o);
  }
  schrijf(pad, blijft);
}
for (const { o, van } of verhuizen) {
  const naar = o.categorieen[0];
  const pad = path.join(MAP, `${naar}.json`);
  schrijf(pad, [...lees(pad), o]);
  const enVan = path.join(EN, `veld-${van}.json`);
  const enNaar = path.join(EN, `veld-${naar}.json`);
  const a = lees(enVan);
  const b = fs.existsSync(enNaar) ? lees(enNaar) : {};
  b[o.id] = a[o.id];
  delete a[o.id];
  schrijf(enVan, a);
  schrijf(enNaar, b);
}
console.log(`${WEG.length} oefeningen nagelopen, ${verhuizen.length} verhuisd`);
