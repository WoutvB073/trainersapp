// Rondgang over alle schermen op telefoon-, tablet- en laptopformaat: screenshots (tools/e2e/*.png),
// controle op horizontaal scrollen en fouten in de console, en een offline-test.
// Gebruik: node tools/e2e/schermen.mjs [basis-url]   (standaard: npm run preview op poort 4184)
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] ?? 'http://localhost:4184/trainersapp/';
const MAP = new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
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

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const fouten = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let n = 0;
for (const f of FORMATEN) {
  const page = await browser.newPage();
  page.on('pageerror', (e) => fouten.push(`${f.naam}: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && fouten.push(`${f.naam}: ${m.text()}`));
  await page.setViewport({ width: f.w, height: f.h, deviceScaleFactor: 2, isMobile: f.mobiel, hasTouch: f.mobiel });
  for (const s of SCHERMEN) {
    await page.goto(`${BASE}?r=${n++}${s.hash}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    if (s.moeilijker) await page.click('.variatie-knop.moeilijker');
    // Animatie op een vast moment zetten (pauze + schuif), zodat screenshots vergelijkbaar zijn.
    await page.evaluate(() => {
      document.querySelector('[aria-label="Pauze"]')?.click();
      const r = document.querySelector('.speler-balk');
      if (!r) return;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(r, '3.5');
      r.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await sleep(150);
    const breed = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (breed > 0) fouten.push(`${f.naam}/${s.naam}: ${breed}px horizontaal scrollen`);
    await page.screenshot({ path: `${MAP}${f.naam}-${s.naam}.png`, fullPage: true });
  }
  await page.close();
}

// Offline: eerst online laden (service worker vult de cache), dan offline herladen.
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await page.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => navigator.serviceWorker.ready);
await sleep(1500);
await page.setOfflineMode(true);
await page.goto(`${BASE}#/oefening/keeper-laag-duiken-kniezit`, { waitUntil: 'load' });
await sleep(800);
const offline = await page.evaluate(() => document.querySelector('.detail-titel')?.textContent ?? '');
console.log(`Offline: ${offline ? `OK ("${offline}")` : 'MISLUKT'}`);
if (!offline) fouten.push('offline: detailpagina niet geladen');

await browser.close();
console.log(fouten.length ? `Problemen:\n- ${fouten.join('\n- ')}` : 'Geen problemen gevonden.');
