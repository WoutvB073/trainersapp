// De pagina's van fase 1 in de voorbeeldversie (voorbeeld/fase1): voorstel met vinkjes, kopiëren, rugnummers en Realistisch.
// Zonder url start dit script zelf een kleine server op de map voorbeeld/ (eerst `node tools/voorbeeld.mjs build`).
// Gebruik: node tools/e2e/fase1-paginas.mjs [basis-url, bv. https://…web.app/]
// Bladen: blad-fase1-paginas.png (iPhone SE licht en donker, laptop).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blad, MAP, slaap, start } from './hulp.mjs';

let basis = process.argv[2];
let server;
if (!basis) {
  const map = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'voorbeeld');
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(map, p);
    if (!f.startsWith(map) || !fs.existsSync(f)) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }).end(fs.readFileSync(f));
  });
  await new Promise((k) => server.listen(4186, k));
  basis = 'http://localhost:4186/';
}
if (!basis.endsWith('/')) basis += '/';

const browser = await start();
const problemen = [];
const fouten = [];
const shots = [];
const ctx = await browser.createBrowserContext();
const page = await ctx.newPage();
page.on('pageerror', (e) => fouten.push(e.message));
const breed = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

for (const [naam, vp, schema] of [
  ['SE licht', { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, 'light'],
  ['SE donker', { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, 'dark'],
  ['laptop', { width: 1280, height: 820, deviceScaleFactor: 1 }, 'light'],
]) {
  await page.setViewport(vp);
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: schema }]);
  for (const p of ['', 'oefeningen.html', 'nummers.html']) {
    await page.goto(`${basis}fase1/${p}`, { waitUntil: 'domcontentloaded' });
    await slaap(250);
    if ((await breed()) > 0) problemen.push(`${naam} ${p || 'overzicht'}: ${await breed()} px te breed`);
    const bestand = `${MAP}f1-${naam.replace(' ', '-')}-${p.replace('.html', '') || 'overzicht'}.png`;
    await page.screenshot({ path: bestand });
    shots.push([bestand, `${p || 'overzicht'} · ${naam}`]);
  }
}

// Vinkjes, onthouden, alleen aangevinkt, kopiëren.
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(`${basis}fase1/oefeningen.html`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.removeItem('fase1.vinkjes'));
await page.reload({ waitUntil: 'domcontentloaded' });
const aantal = await page.$$eval('.oef input', (l) => l.length);
if (aantal !== 157) problemen.push(`oefeningen: ${aantal} vakjes in plaats van 157`);
const cats = await page.$$eval('.cat', (l) => l.length);
if (cats !== 19) problemen.push(`oefeningen: ${cats} categorieën in plaats van 19`);
for (const nr of ['W3', 'P1', 'KL1']) await page.click(`.oef[data-nr="${nr}"]`);
if ((await page.$eval('#teller', (e) => e.textContent)) !== '3 aangevinkt') problemen.push('teller klopt niet na 3 vinkjes');
await page.reload({ waitUntil: 'domcontentloaded' });
const na = await page.$$eval('.oef.aan', (l) => l.map((e) => e.dataset.nr));
if (na.join() !== 'W3,P1,KL1') problemen.push(`vinkjes niet onthouden: ${na.join()}`);
await page.click('#alleen');
const zichtbaar = await page.$$eval('.oef', (l) => l.filter((e) => e.offsetParent).length);
if (zichtbaar !== 3) problemen.push(`alleen aangevinkt: ${zichtbaar} zichtbaar`);
const bestand = `${MAP}f1-alleen-aangevinkt.png`;
await page.screenshot({ path: bestand });
shots.push([bestand, 'alleen aangevinkt · SE']);
await page.click('#kopieer');
await slaap(400);
const lijst = await page.evaluate(() => window.__laatsteLijst ?? '');
for (const s of ['Gekozen oefeningen (3)', 'SPELERS', 'Warming-up:', '- W3 Tunneltikkertje met bal', '- P1 Ruit met de derde man', 'KEEPERS', '- KL1 Zit, sta op en duik'])
  if (!lijst.includes(s)) problemen.push(`gekopieerde lijst mist "${s}"`);
console.log('Gekopieerde lijst:\n' + lijst);

// Rugnummers: 12 veldjes, per veldje unieke nummers en evenveel als de spelvorm.
await page.goto(`${basis}fase1/nummers.html`, { waitUntil: 'domcontentloaded' });
const velden = await page.$$eval('.veld', (l) => l.map((f) => ({ f: f.querySelector('figcaption b').textContent, nrs: [...f.querySelectorAll('text')].map((t) => t.textContent) })));
if (velden.length !== 12) problemen.push(`nummers: ${velden.length} veldjes`);
for (const v of velden) if (new Set(v.nrs).size !== v.nrs.length) problemen.push(`nummers ${v.f}: dubbele nummers ${v.nrs.join(',')}`);
if ((await page.$$('.met-twijfel')).length < 5) problemen.push('nummers: te weinig twijfelgevallen gemarkeerd');

await blad(browser, shots, `${MAP}blad-fase1-paginas.png`, 5, 2400);
await browser.close();
server?.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)]);
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of problemen) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
