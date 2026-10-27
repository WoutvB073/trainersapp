// Beweging van één persoon in losse beelden (filmstrip), met de camera dichtbij en van opzij t.o.v. zijn
// looprichting. Zo zie je of voeten schuiven, knieën goed buigen en de armen meebewegen.
// Gebruik: node tools/e2e/pas.mjs <id> <wie> <t0> <t1> [beelden=8] [kant=zij|voor|schuin] [naam] [basis-url]
//          node tools/e2e/pas.mjs set <setnaam> [basis-url]   (vaste reeksen, zie SETS)
import fs from 'node:fs';
import { createJiti } from 'jiti';
import { alsGeinstalleerd, blad, MAP, slaap, start, zetTijd } from './hulp.mjs';

const jiti = createJiti(import.meta.url);
const { maakTijdlijn, standOp } = await jiti.import('../../src/anim/timeline.ts');
const { afspeelTekening } = await jiti.import('../../src/editor/animatie.ts');

const DATA = new URL('../../src/data/oefeningen/', import.meta.url);
const oefeningen = new Map(
  ['veld', 'keepers'].flatMap((map) => fs.readdirSync(new URL(`${map}/`, DATA)).flatMap((f) => JSON.parse(fs.readFileSync(new URL(`${map}/${f}`, DATA), 'utf8')))).map((o) => [o.id, o]),
);

/** Vaste reeksen: [id, wie, t0, t1, beelden, kant, onderschrift]. */
const SETS = {
  lopen: [
    ['veld-wu-loopscholing', 'a1', 1.2, 1.9, 8, 'zij', 'huppelen'],
    ['veld-wu-loopscholing', 'a4', 8.0, 8.7, 8, 'zij', 'knieheffen'],
    ['veld-wu-loopscholing', 'a2', 3.5, 4.2, 8, 'zij', 'achteruit'],
    ['veld-wu-loopscholing', 'a3', 5.5, 6.2, 8, 'voor', 'zijwaarts'],
    ['veld-wu-loopscholing', 'a1', 5.5, 6.1, 8, 'zij', 'joggen'],
    ['veld-wu-loopscholing', 'a3', 2.0, 2.8, 8, 'zij', 'wandelen'],
    ['veld-lc-lage-hordes', 'a1', 2.45, 2.95, 8, 'zij', 'sprint'],
    ['veld-lc-lage-hordes', 'a1', 1.0, 1.7, 8, 'zij', 'hordes'],
    ['veld-lc-ladder-enkel', 'a1', 1.0, 1.7, 8, 'zij', 'ladder'],
    ['veld-wu-loopscholing', 'a5', 10.0, 10.7, 8, 'zij', 'hakken-billen'],
  ],
};

SETS.keeper = [
  ['keeper-ld-voetenwerk-lange-duik', 'auto:duik', 'gezicht', 'lage duik'],
  ['keeper-ld-voetenwerk-lange-duik', 'auto:opstaan', 'gezicht', 'opstaan'],
  ['keeper-cv-hoog-dan-laag', 'auto:duik', 'gezicht', 'hoge duik'],
  ['keeper-hd-hordes-zijwaarts', 'auto:duik', 'gezicht', 'hoge duik 2'],
  ['keeper-bv-stuitballen', 'auto:vang', 'schuin', 'vangen laag'],
  ['keeper-wu-ladder-borstbal', 'auto:vang', 'schuin', 'vangen borst'],
  ['keeper-ps-uitworpen', 'auto:worp:onderhands', 'zij', 'uitrollen'],
  ['keeper-ps-uitworpen', 'auto:worp:bovenhands', 'zij', 'bovenhands'],
  ['keeper-ps-uitworpen', 'auto:worp:zwaai', 'zij', 'zwaaiworp'],
  ['keeper-ps-uittrap-handen', 'auto:worp:volley', 'zij', 'uittrap'],
  ['keeper-wu-grondoefeningen', 'auto:tik', 'zij', 'grond tikken'],
  ['keeper-1o1-spreidsprong', 'auto:blok', 'voor', 'spreidsprong'],
  ['keeper-1o1-knieblok', 'auto:blok', 'voor', 'knieblok'],
  ['keeper-vz-stompen-tussen-poppen', 'auto:stomp', 'voor', 'stompen'],
  ['keeper-ld-kniezit-hurkzit-stand', 'auto:duik', 'gezicht', 'duik vanuit kniezit'],
];
SETS.kort = [
  ['veld-wu-loopscholing', 'a5', 10.0, 10.7, 8, 'zij', 'hakken-billen'],
  ['veld-pt-driehoek', 'auto:aanname', 'zij', 'aannemen'],
  ['keeper-bv-stuitballen', 'auto:vang', 'gezicht', 'basishouding en vangen'],
];
SETS.k022 = [
  ['keeper-bv-stuitballen', 'auto:vang', 'gezicht', 'stuitbal'],
  ['keeper-bv-stuitballen', 'auto:duik', 'gezicht', 'lage bal na stuitbal'],
  ['keeper-ld-kniezit-hurkzit-stand', 'auto:duik', 'gezicht', 'duik vanuit kniezit'],
  ['keeper-re-korte-afstand', 'auto:draai', 'schuin', 'omdraaien en schot'],
  ['keeper-1o1-spreidsprong', 'auto:blok', 'schuin', 'spreidsprong na kaatsen'],
  ['keeper-ld-drie-pionnen-korte-hoek', 'auto:aantik', 'gezicht', 'pion aantikken en duik'],
  ['keeper-hd-horde-volley-hoog', 'auto:duik', 'gezicht', 'hoge duik na horde'],
  ['keeper-bv-schuin-twee-lage', 'auto:duik', 'gezicht', 'lage bal richting midden'],
];
SETS.blok022 = [
  ['keeper-1o1-spreidsprong', 'auto:blok', 'schuin', 'spreidsprong na kaatsen'],
  ['keeper-re-korte-afstand', 'k1', 0.3, 1.9, 8, 'zij', 'rug naar trainer, omdraaien'],
];
SETS.k023 = [
  ['keeper-hd-buiklig-verre-paal', 'k1', 0.2, 1.7, 8, 'zij', 'buiklig en opstaan'],
  ['keeper-hd-halfknie-pion-hoog', 'k1', 0.3, 1.6, 8, 'gezicht', 'halfknielend vangen'],
  ['keeper-re-draaisprong-voetenblok', 'k1', 0.7, 1.4, 8, 'zij', 'draaisprong'],
  ['keeper-re-draaisprong-voetenblok', 'auto:blok', 'zij', 'blok met de voeten vooruit'],
  ['keeper-re-pion-voet-achteruit', 'auto:aantik', 'schuin', 'pion aantikken met de voet'],
  ['keeper-sp-stompen-eigen-bal', 'k1', 1.4, 3.6, 8, 'schuin', 'stompen, eigen bal vangen'],
  ['keeper-wu-twee-ballen', 'k1', 0.3, 2.9, 8, 'schuin', 'twee ballen'],
  ['keeper-hd-slalom-pion-duiken', 'auto:aantik', 'gezicht', 'pion aantikken en hoge duik'],
];
SETS.k024 = [
  ['keeper-vz-een-hand-stompen-paal', 'auto:worp:tik', 'schuin', 'wegtikken met één hand'],
  ['keeper-vz-een-hand-stompen-paal', 'auto:stomp', 'zij', 'stompen'],
  ['keeper-ps-wegwerken-en-terug', 'auto:keepertrap', 'zij', 'kopbal wegwerken'],
  ['keeper-1op1-stilliggende-bal-lezen', 'auto:blok', 'zij', 'voeten vooruit'],
  ['keeper-sp-een-op-een-competitie', 'auto:blok', 'zij', 'knieblok'],
  ['keeper-ps-drie-poorten-dropkicks', 'auto:worp:dropkick', 'zij', 'dropkick'],
  ['keeper-ps-lange-bal-lange-worp', 'auto:worp:zwaai', 'zij', 'lange zwaaiworp'],
  ['keeper-ps-aannemen-wegdraaien-pop', 'auto:keepertrap:1', 'zij', 'aannemen en wegdraaien'],
];
SETS.spelers = [
  ['veld-pt-driehoek', 'auto:trap', 'zij', 'pass'],
  ['veld-pt-driehoek', 'auto:aanname', 'zij', 'aannemen'],
  ['veld-af-dribbel-afronden', 'auto:schot', 'zij', 'schot'],
  ['veld-tq-poortjesdribbel', 'auto:dribbel', 'zij', 'dribbelen'],
  ['veld-tq-aannemen-uit-de-lucht', 'auto:aanname', 'zij', 'aannemen uit de lucht'],
  ['veld-wu-loopscholing', 'auto:rij', 'schuin', 'wachten in de rij'],
];

/** Venster rond een moment uit de tijdlijn: [wie, t0, t1] (of null). */
function automatisch(tl, wat) {
  const keepers = new Set([...tl.objecten.values()].filter((o) => o.soort === 'keeper').map((o) => o.id));
  const personen = new Set([...tl.objecten.values()].filter((o) => ['speler', 'keeper', 'trainer'].includes(o.soort)).map((o) => o.id));
  const vluchten = [...tl.balEvents.values()]
    .flat()
    .filter((e) => e.soort === 'vlucht')
    .sort((a, b) => a.t1 - b.t1);
  const [, soort, extra] = wat.split(':');
  if (soort === 'duik' || soort === 'opstaan') {
    const e = vluchten.find((e) => keepers.has(e.daarna) && standOp(tl, e.t1).objecten.get(e.daarna).liggen > 0.5);
    if (!e) return null;
    return soort === 'duik' ? [e.daarna, e.t1 - 0.55, e.t1 + 0.35] : [e.daarna, e.t1 + 0.4, e.t1 + 1.6];
  }
  if (soort === 'vang') {
    const e = vluchten.find((e) => keepers.has(e.daarna) && standOp(tl, e.t1).objecten.get(e.daarna).liggen < 0.1);
    return e ? [e.daarna, e.t1 - 0.5, e.t1 + 0.35] : null;
  }
  if (soort === 'worp') {
    const x = tl.loslaten.find((l) => l.soort === extra);
    return x ? [x.wie, x.t - 0.42, x.t + 0.3] : null;
  }
  if (soort === 'trap' || soort === 'schot') {
    const lijst = tl.loslaten.filter((l) => l.soort === 'voet' && !keepers.has(l.wie) && l.t > 0.5);
    const x = soort === 'trap' ? lijst[0] : lijst.at(-1);
    return x ? [x.wie, x.t - 0.35, x.t + 0.35] : null;
  }
  if (soort === 'keepertrap') {
    // Keeper speelt met de voet (of het hoofd); extra = welke (0 = eerste).
    const x = tl.loslaten.filter((l) => l.soort === 'voet' && keepers.has(l.wie))[Number(extra ?? 0)];
    return x ? [x.wie, x.t - 0.45, x.t + 0.35] : null;
  }
  if (soort === 'aanname') {
    const e = vluchten.find((e) => e.t1 > 0.5 && personen.has(e.daarna) && standOp(tl, e.t1).objecten.get(e.daarna).aanname);
    return e ? [e.daarna, e.t1 - 0.35, e.t1 + 0.35] : null;
  }
  if (soort === 'tik') {
    const [id, l] = [...tl.tikken].find(([, l]) => l.length) ?? [];
    return l ? [id, l[0].t0 - 0.1, l[0].t1 + 0.1] : null;
  }
  if (soort === 'blok') {
    const x = tl.blokken[0];
    return x ? [x.wie, x.t - 0.45, x.t + 0.5] : null;
  }
  if (soort === 'stomp') {
    const x = tl.stompen[0];
    return x ? [x.wie, x.t - 0.4, x.t + 0.4] : null;
  }
  if (soort === 'aantik') {
    const [id, l] = [...(tl.aantikken ?? new Map())].find(([, l]) => l.length) ?? [];
    return l ? [id, l[0].t0 - 0.3, l[0].t1 + 1.4] : null;
  }
  if (soort === 'draai') {
    const e = vluchten.find((e) => keepers.has(e.daarna));
    return e ? [e.daarna, e.t0 - 0.6, e.t1 + 0.3] : null;
  }
  if (soort === 'rij') return [[...personen].at(-1), 0.2, 2.0];
  if (soort === 'dribbel') {
    for (let t = 0.3; t < tl.duur; t += 0.05) {
      const s = standOp(tl, t).objecten;
      for (const [id, st] of s) {
        if (!personen.has(id) || st.snelheid < 2) continue;
        if ([...s.values()].some((b) => b.houder === id && b.hoogte < 0.3)) return [id, t, t + 0.7];
      }
    }
  }
  return null;
}

const args = process.argv.slice(2);
let reeksen;
let naam;
let BASIS;
if (args[0] === 'set') {
  reeksen = SETS[args[1]];
  naam = args[1];
  BASIS = args[2] ?? 'http://localhost:4184/trainersapp/';
} else {
  const [id, wie, t0, t1, n = '8', kant = 'zij', nm, url] = args;
  reeksen = [[id, wie, Number(t0), Number(t1), Number(n), kant, nm ?? `${id} ${wie}`]];
  naam = nm ?? 'pas';
  BASIS = url ?? 'http://localhost:4184/trainersapp/';
}

const browser = await start();
const page = await browser.newPage();
await alsGeinstalleerd(page);
await page.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem('trainersapp.testCamera', '1');
  } catch {
    /* about:blank */
  }
});
const fouten = [];
page.on('pageerror', (e) => fouten.push(e.message));
await page.setViewport({ width: 520, height: 900, deviceScaleFactor: 1.5 });
const shots = [];
let teller = 0;
for (let [id, wie, t0, t1, n, kant, tekst] of reeksen) {
  const o = oefeningen.get(id);
  if (!o) throw new Error(`onbekend: ${id}`);
  const tl = maakTijdlijn(afspeelTekening(o.tekening));
  // [id, 'auto:…', kant, onderschrift]: het moment komt uit de tijdlijn.
  if (String(wie).startsWith('auto:')) {
    const r = automatisch(tl, wie);
    [kant, tekst] = [t0, t1];
    if (!r) {
      console.log('geen moment:', id, wie);
      continue;
    }
    [wie, t0, t1] = r;
    t0 = Math.max(0, t0);
    n = 8;
  }
  await page.goto(`${BASIS}?r=p${teller++}${Date.now() % 1000}#/oefening/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.speler-canvas-3d', { timeout: 20000 });
  await slaap(500);
  const vak = await page.$('.speler-vak');
  // Vaste kijkrichting: loodrecht op de looprichting halverwege (zij), erlangs (voor) of schuin.
  const midden = standOp(tl, (t0 + t1) / 2).objecten.get(wie);
  const loop = midden.looprichting ?? midden.hoek;
  // 'gezicht': vóór de persoon (zoals de schutter een keeper ziet), los van waar hij heen beweegt.
  const kijk = kant === 'gezicht' ? midden.hoek + 180 : kant === 'zij' ? loop + 90 : kant === 'voor' ? loop + 180 : loop + 135;
  for (let i = 0; i < n; i++) {
    const t = Math.round((t0 + ((t1 - t0) * i) / Math.max(1, n - 1)) * 100) / 100;
    const s = standOp(tl, t).objecten.get(wie);
    await zetTijd(page, t);
    await page.evaluate((x, y, k) => window.__camera3d?.(x, y, 3.4, k, 6), s.x, s.y, kijk);
    await slaap(160);
    await zetTijd(page, t);
    const pad = `${MAP}pas-${naam}-${shots.length}.png`;
    const r = await vak.boundingBox();
    await page.screenshot({ path: pad, clip: { x: r.x + r.width / 2 - 140, y: r.y + r.height / 2 - 165, width: 280, height: 330 } });
    shots.push([pad, `${tekst} ${t} s · ${(s.snelheid ?? 0).toFixed(1)} m/s`]);
  }
}
await blad(browser, shots, `${MAP}blad-pas-${naam}.png`, 8, 2400);
await browser.close();
if (fouten.length) console.log('FOUTEN:', fouten.slice(0, 10));
console.log(`${shots.length} beelden → blad-pas-${naam}.png`);
