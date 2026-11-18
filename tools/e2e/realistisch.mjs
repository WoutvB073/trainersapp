// Realistisch (proef in fase 1, sinds 0.38.0 de standaard): vergelijkt de weergave Gewoon met Realistisch (zonlicht met schaduwen,
// gras met structuur, luchtverloop, echtere figuur) op drie oefeningen (loopvorm, afwerkvorm met keeper, partijvorm) en een 11 tegen 11-bord.
// - blad-realistisch.png: per scène Gewoon en Realistisch naast elkaar (telefoonformaat).
// - realistisch-meting.json: beeldsnelheid (gewone en 4× tragere processor), tekenopdrachten/driehoeken en de tijd tot 3D in beeld is.
// Gebruik: node tools/e2e/realistisch.mjs [basis-url] [alleen: beelden|snelheid]
import fs from 'node:fs';
import { createJiti } from 'jiti';
import { alsGeinstalleerd, blad, MAP, slaap, start, zetTijd } from './hulp.mjs';

const BASIS = process.argv[2] && process.argv[2] !== '-' ? process.argv[2] : 'http://localhost:4184/trainersapp/';
const ALLEEN = process.argv[3] ?? 'alles';
const jiti = createJiti(import.meta.url);
const { opgesteldBord, wedstrijdCode } = await jiti.import('../../src/wedstrijd/wedstrijd.ts');

/** 11 tegen 11 op het tactiekbord: iedereen loopt (zoals in animaties.mjs). */
function bord11() {
  const t = opgesteldBord('11v11', '1-4-3-3');
  const lijnen = [];
  for (const o of t.objecten) {
    if (o.soort !== 'speler') continue;
    const v = o.team === 'A' ? -1 : 1;
    const a = [o.x, o.y];
    const b = [o.x + (o.nummer % 2 ? 3 : -3), o.y + v * 9];
    const c = [b[0] + (o.nummer % 3 ? 6 : -6), b[1] - v * 5];
    lijnen.push({ soort: 'loop', punten: [a, b], van: o.id, stap: 1 });
    lijnen.push({ soort: 'loop', punten: [b, c], stap: 2, manier: 'sprint' });
  }
  return { ...t, camera: 'schuin', lijnen };
}
const code11 = wedstrijdCode({ soort: 'bord', bord: { naam: '11 tegen 11', soort: 'tactiek', tekening: bord11() } });

const SCENES = [
  ['Loopvorm', '#/oefening/veld-wu-loopscholing'],
  ['Afwerkvorm met keeper', '#/oefening/veld-af-schot-rebound-intikken'],
  ['Partijvorm', '#/oefening/veld-pv-4-4-keepers'],
  ['11 tegen 11', `#/w/${code11}`],
];

const browser = await start();
const fouten = [];
const problemen = [];

async function pagina(dpr) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('trainersapp.taal', 'nl');
      localStorage.setItem('trainersapp.3dAltijd', '1');
      localStorage.setItem('trainersapp.testCamera', '1');
    } catch {
      /* about:blank */
    }
    // Rekentijd per beeld: hoe lang de requestAnimationFrame-callbacks (tijdlijn, poppetjes, three.js) samen duren.
    const echt = window.requestAnimationFrame.bind(window);
    window.__werk = [];
    window.requestAnimationFrame = (cb) =>
      echt((nu) => {
        const t0 = performance.now();
        cb(nu);
        window.__werk.push(performance.now() - t0);
      });
  });
  page.on('pageerror', (e) => fouten.push(e.message));
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: dpr, isMobile: true, hasTouch: true });
  return { ctx, page };
}

/** Open een scène in Realistisch (aan) of Gewoon; geeft de tijd (ms) tot 3D in beeld is. */
async function open(page, pad, aan) {
  await page.goto(`${BASIS}?r=${Math.random().toString(36).slice(2)}#/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((aan) => localStorage.setItem('trainersapp.poppetjes', aan ? 'realistisch' : 'gewoon'), aan);
  const t0 = Date.now();
  await page.goto(`${BASIS}?r=${Math.random().toString(36).slice(2)}${pad}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.speler-canvas-3d', { timeout: 30000 });
  const ms = Date.now() - t0;
  await page.evaluate(() => document.fonts.ready);
  await slaap(400);
  return ms;
}

// ---------- beelden: Gewoon en Realistisch naast elkaar ----------
if (ALLEEN === 'alles' || ALLEEN === 'beelden') {
  const { ctx, page } = await pagina(2);
  const shots = [];
  for (const [naam, pad] of SCENES) {
    for (const aan of [false, true]) {
      await open(page, pad, aan);
      const info = await page.evaluate(() => window.__info3d?.() ?? null);
      if (info?.realistisch !== aan) problemen.push(`${naam}: weergave klopt niet (${JSON.stringify(info)})`);
      const duur = Number(await page.evaluate(() => document.querySelector('.speler-balk')?.max ?? 0));
      const vak = await page.$('.speler-vak');
      for (const f of [0.3, 0.62]) {
        await zetTijd(page, duur * f);
        await slaap(200);
        const bestand = `${MAP}real-${naam.replace(/\W+/g, '-')}-${aan ? 'realistisch' : 'gewoon'}-${f}.png`;
        await vak.screenshot({ path: bestand });
        shots.push([bestand, `${naam} · ${aan ? 'Realistisch' : 'Gewoon'} · ${Math.round(f * 100)}%`]);
      }
    }
  }
  // Van dichtbij (camera laag achter het goal) bij de afwerkvorm: daar zie je de schaduwen en het gras het best.
  for (const aan of [false, true]) {
    await open(page, SCENES[1][1], aan);
    await page.evaluate(() => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === 'Achter goal')?.click());
    await slaap(900);
    await zetTijd(page, 3.45);
    await slaap(250);
    const bestand = `${MAP}real-dichtbij-${aan ? 'realistisch' : 'gewoon'}.png`;
    await (await page.$('.speler-vak')).screenshot({ path: bestand });
    shots.push([bestand, `Afwerkvorm, achter het goal · ${aan ? 'Realistisch' : 'Gewoon'}`]);
  }
  await blad(browser, shots, `${MAP}blad-realistisch.png`, 4, 2400);
  await ctx.close();
  console.log(`${shots.length} screenshots → blad-realistisch.png`);
}

// ---------- snelheid ----------
if (ALLEEN === 'alles' || ALLEEN === 'snelheid') {
  const { ctx, page } = await pagina(3);
  const cdp = await page.target().createCDPSession();
  const uit = {};
  const meet = () =>
    page.evaluate(
      () =>
        new Promise((klaar) => {
          const tussen = [];
          let vorige = performance.now();
          window.__werk.length = 0;
          const stap = (nu) => {
            tussen.push(nu - vorige);
            vorige = nu;
            if (tussen.length < 200) requestAnimationFrame(stap);
            else {
              const s = tussen.slice(20).sort((a, b) => a - b);
              const med = s[Math.floor(s.length / 2)];
              const p90 = s[Math.floor(s.length * 0.9)];
              const werk = window.__werk.slice(40);
              const som = werk.reduce((a, b) => a + b, 0) / (tussen.length - 20);
              klaar({ fps: Math.round(1000 / med), 'fps (traagste 10%)': Math.round(1000 / p90), 'rekenwerk per beeld (ms)': Math.round(som * 10) / 10 });
            }
          };
          requestAnimationFrame(stap);
        }),
    );
  for (const [naam, pad] of SCENES) {
    for (const aan of [false, true]) {
      const sleutel = `${naam} · ${aan ? 'realistisch' : 'gewoon'}`;
      uit[sleutel] = {};
      for (const rem of [1, 4]) {
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: rem });
        const laad = await open(page, pad, aan);
        await slaap(900);
        const m = await meet();
        uit[sleutel][`fps cpu×${rem}`] = m.fps;
        uit[sleutel][`traagste 10% cpu×${rem}`] = m['fps (traagste 10%)'];
        uit[sleutel][`rekenwerk ms cpu×${rem}`] = m['rekenwerk per beeld (ms)'];
        uit[sleutel][`3D in beeld ms cpu×${rem}`] = laad;
      }
      const info = await page.evaluate(() => window.__info3d?.() ?? null);
      if (info) {
        uit[sleutel].tekenopdrachten = info.calls ?? info.tekenopdrachten ?? null;
        uit[sleutel].driehoeken = info.triangles ?? info.driehoeken ?? null;
      }
    }
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  console.log('SNELHEID (390×844, dpr 3):');
  console.table(uit);
  fs.writeFileSync(`${MAP}realistisch-meting.json`, JSON.stringify(uit, null, 2));
  await ctx.close();
}

await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)]) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
