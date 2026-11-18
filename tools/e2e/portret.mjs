// Portretten van de 3D-poppetjes (0.38.0): één persoon van dichtbij, van voren, opzij en van achteren, in de weergave
// Realistisch en (ter vergelijking) Gewoon. Zo beoordeel je de figuur: schouders, gezicht, kapsel, shirt, broek, kousen, schoenen.
// Gebruik: node tools/e2e/portret.mjs [naam] [basis-url] [niveaus=realistisch,gewoon]
//          (de personen en momenten staan hieronder in PORTRETTEN)
import fs from 'node:fs';
import { createJiti } from 'jiti';
import { alsGeinstalleerd, blad, MAP, slaap, start, zetTijd } from './hulp.mjs';

const NAAM = process.argv[2] ?? 'portret';
const BASIS = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : 'http://localhost:4184/trainersapp/';
const NIVEAUS = (process.argv[4] ?? 'realistisch,gewoon').split(',');

const jiti = createJiti(import.meta.url);
const { maakTijdlijn, standOp } = await jiti.import('../../src/anim/timeline.ts');
const { afspeelTekening } = await jiti.import('../../src/editor/animatie.ts');
const DATA = new URL('../../src/data/oefeningen/', import.meta.url);
const oefeningen = new Map(
  ['veld', 'keepers'].flatMap((map) => fs.readdirSync(new URL(`${map}/`, DATA)).flatMap((f) => JSON.parse(fs.readFileSync(new URL(`${map}/${f}`, DATA), 'utf8')))).map((o) => [o.id, o]),
);

/** [id, wie, tijd, onderschrift] */
const PORTRETTEN = [
  ['veld-wu-loopscholing', 'a5', 0.2, 'speler (staand)'],
  ['veld-wu-loopscholing', 'a1', 0.2, 'speler 2'],
  ['keeper-wu-bal-om-je-lichaam', 'k1', 0.3, 'keeper'],
  ['keeper-re-twee-tennisballen', 't1', 0.2, 'trainer'],
];
const KANTEN = [
  ['voor', 180],
  ['opzij', 90],
  ['achter', 0],
];

const browser = await start();
const shots = [];
const fouten = [];
for (const niveau of NIVEAUS) {
  const page = await browser.newPage();
  await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument((niveau) => {
    try {
      localStorage.setItem('trainersapp.testCamera', '1');
      localStorage.setItem('trainersapp.3dAltijd', '1');
      localStorage.setItem('trainersapp.poppetjes', niveau);
    } catch {
      /* about:blank */
    }
  }, niveau);
  page.on('pageerror', (e) => fouten.push(e.message));
  await page.setViewport({ width: 520, height: 900, deviceScaleFactor: 2 });
  let n = 0;
  for (const [id, wie, t, tekst] of PORTRETTEN) {
    const o = oefeningen.get(id);
    if (!o) throw new Error(`onbekend: ${id}`);
    const tl = maakTijdlijn(afspeelTekening(o.tekening));
    const s = standOp(tl, t).objecten.get(wie);
    if (!s) throw new Error(`onbekend: ${id} ${wie}`);
    await page.goto(`${BASIS}?r=po${n++}${Date.now() % 1000}#/oefening/${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.speler-canvas-3d', { timeout: 20000 });
    await slaap(500);
    const vak = await page.$('.speler-vak');
    for (const [kant, draai] of KANTEN) {
      await zetTijd(page, t);
      await page.evaluate((x, y, k) => window.__camera3d?.(x, y, 2.3, k, 7), s.x, s.y, s.hoek + draai);
      await slaap(200);
      await zetTijd(page, t);
      const pad = `${MAP}portret-${NAAM}-${shots.length}.png`;
      const r = await vak.boundingBox();
      await page.screenshot({ path: pad, clip: { x: r.x + r.width / 2 - 110, y: r.y + r.height / 2 - 175, width: 220, height: 330 } });
      shots.push([pad, `${niveau} · ${tekst} · ${kant}`]);
    }
  }
  await page.close();
}
await blad(browser, shots, `${MAP}blad-portret-${NAAM}.png`, 6, 2400);
await browser.close();
if (fouten.length) console.log('FOUTEN:', [...new Set(fouten)].slice(0, 8));
console.log(`${shots.length} beelden → blad-portret-${NAAM}.png`);
