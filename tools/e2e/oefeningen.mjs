// Per oefening screenshots op telefoonformaat: 3D op 35% en 65% van de animatie (startcamera) en 2D op 65%,
// samengevoegd tot één blad per categorie (blad-oef-<categorie>.png). Controleert ook de aantallen per categorie
// en het label "Keeper nodig".
// Gebruik: node tools/e2e/oefeningen.mjs [basis-url] [filter op id]
import fs from 'node:fs';
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, zetTijd } from './hulp.mjs';

const filter = process.argv[3] ?? '';
const DATA = new URL('../../src/data/oefeningen/', import.meta.url);
const bestanden = ['veld', 'keepers'].flatMap((map) =>
  fs.readdirSync(new URL(`${map}/`, DATA)).map((f) => ({ map, cat: f.replace('.json', ''), oef: JSON.parse(fs.readFileSync(new URL(`${map}/${f}`, DATA), 'utf8')) })),
);

const browser = await start();
const fouten = [];
const page = await browser.newPage();
await alsGeinstalleerd(page);
page.on('pageerror', (e) => fouten.push(e.message));
page.on('console', (m) => m.type() === 'error' && fouten.push(m.text()));
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

const kies = (tekst) => page.evaluate((tekst) => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === tekst)?.click(), tekst);
let n = 0;
for (const { map, cat, oef } of bestanden) {
  const shots = [];
  for (const o of oef) {
    if (filter && !o.id.includes(filter)) continue;
    await page.goto(`${BASE}?r=${n++}#/oefening/${o.id}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.speler-canvas-3d', { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    await slaap(200);
    const duur = (await page.evaluate(() => Number(document.querySelector('.speler-balk').max))) - 1.2;
    const vak = await page.$('.speler-vak');
    for (const f of [0.35, 0.65]) {
      await zetTijd(page, duur * f);
      const pad = `${MAP}oef-${o.id}-3d-${f}.png`;
      await vak.screenshot({ path: pad });
      shots.push([pad, `${o.naam} – 3D ${Math.round(f * 100)}%`]);
    }
    await kies('2D');
    await slaap(250);
    await zetTijd(page, duur * 0.65);
    const pad = `${MAP}oef-${o.id}-2d.png`;
    await (await page.$('.speler-vak')).screenshot({ path: pad });
    shots.push([pad, `${o.naam} – 2D 65% (${o.spelersNodig} sp.)`]);
    await kies('3D');
  }
  if (shots.length) await blad(browser, shots, `${MAP}blad-oef-${map}-${cat}.png`, 3, 1500);
}

// Aantallen per categorie en het label "Keeper nodig".
for (const [soort, pad] of [['veld', 'veld'], ['keeper', 'keepers']]) {
  await page.goto(`${BASE}?r=${n++}#/${pad}`, { waitUntil: 'networkidle0' });
  const rijen = await page.evaluate(() =>
    [...document.querySelectorAll('.rij')].map((r) => [r.querySelector('.rij-titel').textContent, r.querySelector('.teller').textContent]),
  );
  const verwacht = new Map();
  for (const { oef } of bestanden) for (const o of oef) if (o.soort === soort) for (const c of o.categorieen) verwacht.set(c, (verwacht.get(c) ?? 0) + 1);
  console.log(`${pad}: ${rijen.map(([t, a]) => `${t} ${a}`).join(' · ')}`);
  const totaal = bestanden.flatMap((b) => b.oef).filter((o) => o.soort === soort).length;
  if (rijen[0][1] !== String(totaal)) fouten.push(`${pad}: "Alle oefeningen" toont ${rijen[0][1]}, verwacht ${totaal}`);
  const cats = await page.evaluate(() => [...document.querySelectorAll('.rij')].slice(1).map((r) => r.getAttribute('href').split('/').pop()));
  cats.forEach((c, i) => {
    const v = verwacht.get(c) ?? 0;
    const getoond = rijen[i + 1][1];
    if (getoond !== (v === 0 ? 'Nog leeg' : String(v))) fouten.push(`${pad}/${c}: toont ${getoond}, verwacht ${v}`);
  });
}
await page.goto(`${BASE}?r=${n++}#/veld/alle`, { waitUntil: 'networkidle0' });
const labels = await page.evaluate(() =>
  [...document.querySelectorAll('.kaart')].map((k) => [k.querySelector('.kaart-titel').textContent, !!k.querySelector('.label-keeper')]),
);
const metLabel = labels.filter(([, l]) => l).map(([t]) => t);
const moet = bestanden.flatMap((b) => b.oef).filter((o) => o.soort === 'veld' && o.keepersNodig > 0).map((o) => o.naam);
console.log(`"Keeper nodig" bij: ${metLabel.join(', ') || '(geen)'}`);
if (metLabel.sort().join() !== moet.sort().join()) fouten.push(`"Keeper nodig" klopt niet: getoond ${metLabel}, verwacht ${moet}`);

await browser.close();
console.log(fouten.length ? `Problemen:\n- ${[...new Set(fouten)].join('\n- ')}` : 'Geen problemen gevonden.');
