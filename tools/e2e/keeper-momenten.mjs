// Keepertechniek van dichtbij: per oefening 3D-screenshots op de sleutelmomenten (worp, duik, vang, tip), met de
// camera dichtbij op de keeper (testhaakje in render3d, alleen met de vlag trainersapp.testCamera).
// Gebruik: node tools/e2e/keeper-momenten.mjs [basis-url] [filter op id]   → blad-momenten-<filter>.png
import fs from 'node:fs';
import { createJiti } from 'jiti';
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, zetTijd } from './hulp.mjs';

const filter = process.argv[3] ?? 'keeper-';
const jiti = createJiti(import.meta.url);
const { maakTijdlijn, standOp } = await jiti.import('../../src/anim/timeline.ts');

// Oefeningen rechtstreeks uit de databestanden.
const DATA = new URL('../../src/data/oefeningen/', import.meta.url);
const oefeningen = ['veld', 'keepers'].flatMap((map) =>
  fs.readdirSync(new URL(`${map}/`, DATA)).flatMap((f) => JSON.parse(fs.readFileSync(new URL(`${map}/${f}`, DATA), 'utf8'))),
);

/** Sleutelmomenten: worpen uit de handen, duiken, vangen en tippen (max. 8 per oefening). */
function momenten(o) {
  const tl = maakTijdlijn(o.tekening);
  const keepers = new Set(o.tekening.objecten.filter((x) => x.soort === 'keeper').map((x) => x.id));
  const m = [];
  for (const [, lijst] of tl.balEvents) {
    for (const e of lijst) {
      if (e.soort !== 'vlucht') continue;
      if (e.daarna && keepers.has(e.daarna)) {
        if (standOp(tl, e.t1).objecten.get(e.daarna).liggen > 0.5) m.push({ t: e.t1 - 0.12, tekst: `duik (${e.h1.toFixed(1)} m)`, wie: e.daarna });
        m.push({ t: e.t1, tekst: `vangt op ${e.h1.toFixed(1)} m`, wie: e.daarna });
      }
      if (keepers.has(e.passeerder) && e.h0 > 1.3) m.push({ t: e.t0, tekst: 'tip/worp hoog', wie: e.passeerder });
    }
  }
  for (const x of tl.loslaten) if (x.soort !== 'voet') m.push({ t: x.t - 0.12, tekst: `worp ${x.soort}`, wie: x.wie });
  for (const x of tl.blokken ?? []) m.push({ t: x.t, tekst: x.soort === 'ster' ? 'blok: spreidsprong' : 'knieblok', wie: x.wie });
  for (const x of tl.stompen ?? []) m.push({ t: x.t, tekst: `stompt (${x.vuisten} vuist${x.vuisten === 2 ? 'en' : ''})`, wie: x.wie });
  m.sort((a, b) => a.t - b.t);
  return m.slice(0, 8).map((x) => {
    const p = standOp(tl, x.t).objecten.get(x.wie);
    return { t: Math.round(x.t * 100) / 100, tekst: x.tekst, x: p.x, y: p.y };
  });
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
await page.setViewport({ width: 900, height: 700, deviceScaleFactor: 1.5 });
const shots = [];
let n = 0;
for (const o of oefeningen) {
  if (!o.id.includes(filter)) continue;
  const lijst = momenten(o);
  if (!lijst.length) continue;
  await page.goto(`${BASE}?r=${n++}#/oefening/${o.id}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.speler-canvas-3d', { timeout: 15000 });
  await slaap(250);
  const vak = await page.$('.speler-vak');
  for (const m of lijst) {
    await page.evaluate((m) => window.__camera3d?.(m.x, m.y, 7), m);
    await slaap(150);
    await zetTijd(page, m.t);
    const pad = `${MAP}moment-${o.id}-${m.t}.png`;
    await vak.screenshot({ path: pad });
    shots.push([pad, `${o.naam} t=${m.t}: ${m.tekst}`]);
  }
}
await blad(browser, shots, `${MAP}blad-momenten-${filter.replace(/[^a-z0-9]/gi, '')}.png`, 4, 1800);
await browser.close();
console.log(`${shots.length} momenten`);
