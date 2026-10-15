// Rondgang over alle schermen op telefoon-, tablet- en laptopformaat: screenshots (tools/e2e/*.png),
// controle op horizontaal scrollen en fouten in de console, een offline-test (ook 3D) en de 2D-knop.
// De app wordt geopend alsof hij geïnstalleerd is (anders toont een telefoon het installatiescherm).
// Gebruik: node tools/e2e/schermen.mjs [basis-url]   (standaard: npm run preview op poort 4184)
import { alsGeinstalleerd, BASE, MAP, slaap, start, zetTijd } from './hulp.mjs';

const FORMATEN = [
  { naam: 'se', w: 375, h: 667, mobiel: true },
  { naam: 'iphone14', w: 390, h: 844, mobiel: true },
  { naam: 'liggend', w: 844, h: 390, mobiel: true },
  { naam: 'tablet', w: 820, h: 1180, mobiel: true },
  { naam: 'laptop', w: 1366, h: 800, mobiel: false },
];
const SCHERMEN = [
  { naam: 'start', hash: '#/' },
  { naam: 'veld', hash: '#/veld' },
  { naam: 'lijst', hash: '#/veld/afwerken' },
  { naam: 'detail-veld', hash: '#/oefening/veld-kaatsen-en-afwerken', moeilijker: true },
  { naam: 'detail-keeper', hash: '#/oefening/keeper-laag-duiken-kniezit' },
  { naam: 'keepers-leeg', hash: '#/keepers/voorzetten' },
];

const browser = await start();
const fouten = [];
let n = 0;
for (const f of FORMATEN) {
  const page = await browser.newPage();
  await alsGeinstalleerd(page);
  page.on('pageerror', (e) => fouten.push(`${f.naam}: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && fouten.push(`${f.naam}: ${m.text()}`));
  await page.setViewport({ width: f.w, height: f.h, deviceScaleFactor: 2, isMobile: f.mobiel, hasTouch: f.mobiel });
  for (const s of SCHERMEN) {
    await page.goto(`${BASE}?r=${n++}${s.hash}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    if (s.hash.includes('oefening')) {
      await page.waitForSelector('.speler-canvas-3d', { timeout: 15000 });
      await zetTijd(page, 3.5);
    }
    if (s.moeilijker) await page.click('.variatie-knop.moeilijker');
    await slaap(150);
    const breed = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (breed > 0) fouten.push(`${f.naam}/${s.naam}: ${breed}px horizontaal scrollen`);
    await page.screenshot({ path: `${MAP}${f.naam}-${s.naam}.png`, fullPage: true });
  }
  await page.close();
}

// Offline: eerst online laden (service worker vult de cache), dan offline herladen. Ook Three.js moet uit de cache komen.
const page = await browser.newPage();
await alsGeinstalleerd(page);
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await page.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => navigator.serviceWorker.ready);
await slaap(2000);
await page.setOfflineMode(true);
await page.goto(`${BASE}#/oefening/keeper-laag-duiken-kniezit`, { waitUntil: 'load' });
await page.waitForSelector('.speler-canvas-3d', { timeout: 10000 }).catch(() => {});
const offline = await page.evaluate(() => ({ titel: document.querySelector('.detail-titel')?.textContent ?? '', drieD: !!document.querySelector('.speler-canvas-3d') }));
console.log(`Offline: ${offline.titel ? `OK ("${offline.titel}")` : 'MISLUKT'} · 3D (Three.js) offline: ${offline.drieD ? 'OK' : 'MISLUKT'}`);
if (!offline.titel || !offline.drieD) fouten.push('offline: detailpagina of 3D niet geladen');

// Wisselen naar 2D en terug.
const kies = (tekst) => page.evaluate((tekst) => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === tekst)?.click(), tekst);
await kies('2D');
await slaap(300);
const tweeD = await page.evaluate(() => !!document.querySelector('.speler-canvas') && !document.querySelector('.speler-canvas-3d'));
await kies('3D');
await page.waitForSelector('.speler-canvas-3d', { timeout: 10000 }).catch(() => {});
const terug = await page.evaluate(() => document.querySelectorAll('canvas').length === 1 && !!document.querySelector('.speler-canvas-3d'));
console.log(`Wisselen naar 2D: ${tweeD ? 'OK' : 'MISLUKT'} · terug naar 3D: ${terug ? 'OK' : 'MISLUKT'}`);
if (!tweeD || !terug) fouten.push('wisselen 2D/3D werkt niet');

await browser.close();
console.log(fouten.length ? `Problemen:\n- ${fouten.join('\n- ')}` : 'Geen problemen gevonden.');
