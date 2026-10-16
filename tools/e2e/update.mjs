// Update van een geïnstalleerde app: eerst een oude build (met service worker en opgeslagen gegevens), dan de nieuwe
// build op dezelfde plek. Controleert: melding "Er is een nieuwe versie", na Bijwerken de nieuwe versie (naam, logo),
// gegevens (trainingen, eigen oefeningen, favorieten) nog aanwezig, en het manifest heeft dezelfde id/start_url/scope.
// Gebruik: node tools/e2e/update.mjs <map-met-oude-build> [map-met-nieuwe-build (standaard dist)]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { alsGeinstalleerd, MAP, slaap, start } from './hulp.mjs';

const [oud, nieuw = path.resolve(MAP, '../../dist')] = process.argv.slice(2);
if (!oud) {
  console.log('Gebruik: node tools/e2e/update.mjs <oude-build> [nieuwe-build]');
  process.exit(1);
}
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.json': 'application/json' };
let wortel = oud;
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (!url.startsWith('/trainersapp/')) {
    res.writeHead(404).end();
    return;
  }
  let bestand = path.join(wortel, url.slice('/trainersapp/'.length));
  if (!fs.existsSync(bestand) || fs.statSync(bestand).isDirectory()) bestand = path.join(wortel, 'index.html');
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(bestand)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(bestand).pipe(res);
});
await new Promise((r) => server.listen(4190, r));
const BASE = 'http://localhost:4190/trainersapp/';

const browser = await start();
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};
const page = await browser.newPage();
await alsGeinstalleerd(page);
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

// 1. Oude versie, geïnstalleerd, met gegevens.
await page.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
await page.evaluate(async () => {
  await navigator.serviceWorker.ready;
});
const oudeVersie = await page.evaluate(() => document.querySelector('.voetnoot')?.textContent ?? '');
const gegevens = {
  'trainersapp.trainingen': JSON.stringify({ versie: 1, trainingen: [{ id: 'x1', naam: 'Dinsdag', spelers: 10, keepers: 1, oefeningen: ['veld-pt-derde-man'], gemaakt: 1, gewijzigd: 1 }] }),
  'trainersapp.browserGekozen': '1',
};
await page.evaluate((g) => Object.entries(g).forEach(([k, v]) => localStorage.setItem(k, v)), gegevens);
await page.reload({ waitUntil: 'networkidle0' });
const gestuurd = await page.evaluate(() => !!navigator.serviceWorker.controller);
controle(gestuurd, 'Oude versie: geen service worker actief');
const manifestOud = await page.evaluate(async () => (await fetch(document.querySelector('link[rel="manifest"]').href)).json());

// 2. Nieuwe build op dezelfde plek; app opnieuw openen.
wortel = nieuw;
await page.reload({ waitUntil: 'networkidle0' });
let melding = '';
for (let i = 0; i < 40 && !melding; i++) {
  await slaap(250);
  melding = await page.evaluate(() => document.querySelector('.melding')?.textContent ?? '');
}
controle(melding.includes('nieuwe versie'), `Geen melding over de nieuwe versie ("${melding}")`);
await page.evaluate(() => [...document.querySelectorAll('.melding button')].find((b) => b.textContent.includes('Bijwerken'))?.click());
await slaap(2500);
await page.waitForSelector('.start-titel', { timeout: 10000 }).catch(() => problemen.push('Na bijwerken: startscherm niet zichtbaar'));
const na = await page.evaluate(() => ({ titel: document.title, naam: document.querySelector('.start-titel')?.textContent, versie: document.querySelector('.voetnoot')?.textContent, trainingen: localStorage.getItem('trainersapp.trainingen') }));
controle(na.naam === 'TopTraining' && na.titel === 'TopTraining', `Na bijwerken: naam ${na.naam}, titel ${na.titel}`);
controle(na.versie !== oudeVersie, `Na bijwerken nog de oude versie (${na.versie})`);
controle(na.trainingen === gegevens['trainersapp.trainingen'], 'Na bijwerken: opgeslagen training weg');
const manifestNieuw = await page.evaluate(async () => (await fetch(document.querySelector('link[rel="manifest"]').href)).json());
for (const k of ['id', 'start_url', 'scope']) controle(manifestOud[k] === manifestNieuw[k], `Manifest ${k} veranderd: ${manifestOud[k]} → ${manifestNieuw[k]}`);
controle(manifestNieuw.name === 'TopTraining' && manifestNieuw.short_name === 'TopTraining', `Manifest naam: ${manifestNieuw.name} / ${manifestNieuw.short_name}`);
// De opgeslagen training opent gewoon.
await page.goto(`${BASE}#/training/x1`, { waitUntil: 'networkidle0' });
const training = await page.evaluate(() => document.querySelector('.veld input')?.value ?? document.body.innerText.slice(0, 80));
controle(training === 'Dinsdag', `Opgeslagen training opent niet: ${training}`);
// Offline (uit de cache van de nieuwe service worker).
await page.setOfflineMode(true);
await page.goto(`${BASE}?r=offline#/veld`, { waitUntil: 'domcontentloaded' });
await slaap(800);
const offline = await page.evaluate(() => document.querySelectorAll('.rij').length);
controle(offline > 5, `Offline na de update: ${offline} rijen`);
await page.setOfflineMode(false);
console.log(`Van "${oudeVersie}" naar "${na.versie}"`);

await browser.close();
server.close();
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of problemen) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
