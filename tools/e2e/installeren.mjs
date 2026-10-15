// Installatiescherm per toestel (screenshots) + controle dat de geïnstalleerde app géén installatiescherm toont,
// en dat de keuze "Gewoon in de browser gebruiken" op de computer onthouden wordt.
// Gebruik: node tools/e2e/installeren.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, UA } from './hulp.mjs';

const browser = await start();
const problemen = [];
const toestellen = [
  ['iPhone SE (Safari 18)', UA.iphone18, 375, 667, true],
  ['iPhone 14 (Safari 26)', UA.iphone26, 390, 844, true],
  ['iPhone (Chrome)', UA.iphoneChrome, 390, 844, true],
  ['iPad (Safari)', UA.ipad, 820, 1180, true],
  ['Android (Chrome)', UA.android, 412, 915, true],
  ['Laptop (Chrome)', UA.laptop, 1366, 800, false],
];

const shots = [];
for (const [naam, ua, w, h, mobiel] of toestellen) {
  const page = await browser.newPage();
  await page.setUserAgent(ua);
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: mobiel, hasTouch: mobiel });
  await page.goto(`${BASE}#/oefening/veld-kaatsen-en-afwerken`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const r = await page.evaluate(() => ({
    poort: !!document.querySelector('.poort'),
    titel: document.querySelector('.poort-kaart-titel')?.textContent,
    stappen: document.querySelectorAll('.poort-stap').length,
    app: !!document.querySelector('.speler, .tegels'),
    breed: document.documentElement.scrollWidth - innerWidth,
    browserKnop: !!document.querySelector('.poort-browser button'),
  }));
  console.log(`${naam}: ${r.titel} · ${r.stappen} stappen${r.browserKnop ? ' · knop "Gewoon in de browser"' : ''}`);
  if (!r.poort || r.app) problemen.push(`${naam}: geen installatiescherm`);
  if (r.breed > 0) problemen.push(`${naam}: ${r.breed}px horizontaal scrollen`);
  if (mobiel === r.browserKnop) problemen.push(`${naam}: knop "Gewoon in de browser" ${mobiel ? 'hoort hier niet' : 'ontbreekt'}`);
  const pad = `${MAP}inst-${naam.replace(/\W+/g, '-').toLowerCase()}.png`;
  await page.screenshot({ path: pad });
  shots.push([pad, naam]);
  await page.close();
}
await blad(browser, shots.slice(0, 5), `${MAP}blad-installeren-mobiel.png`, 5, 2000);

// Geïnstalleerde app (standalone) op telefoon: direct de app.
for (const [naam, ua] of [['iPhone', UA.iphone26], ['Android', UA.android]]) {
  const page = await browser.newPage();
  await alsGeinstalleerd(page);
  await page.setUserAgent(ua);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
  const app = await page.evaluate(() => !!document.querySelector('.tegels') && !document.querySelector('.poort'));
  console.log(`Geïnstalleerde app op ${naam}: ${app ? 'app zichtbaar (goed)' : 'FOUT: installatiescherm'}`);
  if (!app) problemen.push(`${naam} standalone: installatiescherm in plaats van de app`);
  await page.close();
}

// Computer: "Gewoon in de browser gebruiken" → app, en na herladen nog steeds de app; terug via "als app installeren".
const page = await browser.newPage();
await page.setUserAgent(UA.laptop);
await page.setViewport({ width: 1366, height: 800 });
await page.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
await page.click('.poort-browser button');
await slaap(200);
const naKeuze = await page.evaluate(() => !!document.querySelector('.tegels'));
await page.reload({ waitUntil: 'networkidle0' });
const naHerladen = await page.evaluate(() => !!document.querySelector('.tegels'));
await page.screenshot({ path: `${MAP}inst-laptop-app.png` });
await page.click('.link-knop');
await slaap(200);
const terug = await page.evaluate(() => !!document.querySelector('.poort'));
console.log(`Laptop: keuze browser → app ${naKeuze}, na herladen ${naHerladen}, "als app installeren" → uitleg ${terug}`);
if (!naKeuze || !naHerladen || !terug) problemen.push('laptop: keuze voor de browser werkt niet goed');
await page.close();

await browser.close();
console.log(problemen.length ? `Problemen:\n- ${problemen.join('\n- ')}` : 'Geen problemen gevonden.');
