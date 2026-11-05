// 0.31.2: synchroniseren mag nooit iets wegdoen wat je net deed. Ingelogd tegen de emulator: een naam typen (snel en op mensentempo),
// en herhaald een bord maken en meteen herladen. Eerst `npm run emulator` en de preview op poort 4184.
// Gebruik: node tools/e2e/sync-race.mjs [basis-url]
import { BASE, alsGeinstalleerd, slaap, start } from './hulp.mjs';

const PROJECT = 'demo-toptraining';
const browser = await start();
const problemen = [];
await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });

const context = await browser.createBrowserContext();
const page = await context.newPage();
await alsGeinstalleerd(page);
await page.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem('trainersapp.emulator', '1');
    localStorage.setItem('trainersapp.taal', 'nl');
  } catch {
    /* about:blank */
  }
});
await page.setViewport({ width: 1366, height: 820 });
const ga = async (pad) => {
  await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#${pad}`, { waitUntil: 'domcontentloaded' });
  await slaap(600);
};
const knop = (tekst, selector = 'button') => page.evaluate((tekst, selector) => [...document.querySelectorAll(selector)].find((b) => b.textContent.trim().startsWith(tekst))?.click(), tekst, selector);

await ga('/account');
await page.waitForSelector('.account-form');
await knop('Account maken', '[role="tab"]');
await slaap(200);
await page.type('.account-form input[autocomplete="name"]', 'Testtrainer 1');
await page.type('.account-form input[type="email"]', 'test1@example.com');
await page.type('.account-form input[type="password"]', 'testwachtwoord1');
await page.evaluate(() => document.querySelector('.account-form button[type="submit"]')?.click());
await page.waitForFunction(() => document.querySelector('.account-naam')?.textContent === 'Testtrainer 1', { timeout: 20000 });
await slaap(1000);

// Een naam typen.
const NAAM = 'Maandagavond op het hoofdveld';
for (const [wat, delay] of [['snel', 0], ['snel', 0], ['20 ms', 20], ['mensentempo 80 ms', 80], ['mensentempo 150 ms', 150]]) {
  await ga('/club');
  await knop('Nieuwe circuittraining');
  await page.waitForSelector('input[maxlength="80"]');
  await slaap(800);
  await page.type('input[maxlength="80"]', NAAM, { delay });
  await slaap(1500);
  const waarde = await page.$eval('input[maxlength="80"]', (e) => e.value);
  console.log(`typen ${wat}: "${waarde}"`);
  if (waarde !== NAAM) problemen.push(`typen ${wat}: "${waarde}"`);
}

// Bord maken en herladen, kort na het laden van de pagina (dan komt de eerste stand van de server nog binnen).
for (let i = 1; i <= 12; i += 1) {
  await page.goto(`${BASE}?r=b${i}#/hervatting/korte-corner`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Opslaan als eigen bord')), { timeout: 15000 });
  await slaap(i * 40);
  await knop('Opslaan als eigen bord');
  await page.waitForFunction(() => location.hash.startsWith('#/bord/'));
  const bord = await page.evaluate(() => location.hash.slice(1));
  await slaap(300);
  await page.goto(`${BASE}?r=c${i}#${bord}`, { waitUntil: 'domcontentloaded' });
  const ok = await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Delen met team')), { timeout: 6000 }).then(
    () => true,
    () => false,
  );
  console.log(`bord ${i} (na ${i * 40} ms): ${ok ? 'er nog' : 'WEG'}`);
  if (!ok) problemen.push(`bord ${i} is weg na herladen`);
}

await browser.close();
await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
console.log(problemen.length ? `PROBLEMEN:\n- ${problemen.join('\n- ')}` : 'Geen problemen gevonden.');
process.exit(problemen.length ? 1 : 0);
