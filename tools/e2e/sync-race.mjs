// 0.31.2/0.31.3: synchroniseren mag nooit iets wegdoen wat je net deed. Ingelogd tegen de emulator: een naam typen (snel en op
// mensentempo), herhaald een bord maken en meteen herladen, snel favorieten wisselen en meteen herladen, snel afvinken, snel een
// instelling wisselen, en een nieuw toestel met de spelerslijst. Eerst `npm run emulator` en de preview op poort 4184.
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
const SNEL = process.env.SNEL === '1'; // alleen favorieten, afvinken, thema en nieuw toestel
for (const [wat, delay] of SNEL ? [] : [['snel', 0], ['snel', 0], ['20 ms', 20], ['mensentempo 80 ms', 80], ['mensentempo 150 ms', 150]]) {
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
for (let i = 1; i <= (SNEL ? 0 : 12); i += 1) {
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

// Favorieten: snel wisselen en meteen herladen.
const lokaal = (naam) => page.evaluate((naam) => Object.keys(localStorage).filter((k) => k.startsWith('trainersapp.u.') && !k.includes('.sync.') && k.endsWith(`.${naam}`)).map((k) => localStorage.getItem(k)).join(' '), naam);
const favorieten = async () => JSON.parse((await lokaal('favorieten')) || '{}').ids ?? [];
for (const wacht of [0, 30, 120]) {
  await ga('/veld/techniek');
  await page.waitForSelector('.hart');
  await slaap(wacht === 0 ? 0 : 400);
  const voor = await favorieten();
  const aan = await page.evaluate(() => {
    const h = [...document.querySelectorAll('.hart')].filter((x) => x.getAttribute('aria-pressed') !== 'true').slice(0, 3);
    h.forEach((x) => x.click());
    return h.length;
  });
  await slaap(wacht);
  await ga('/veld/techniek');
  await slaap(1800);
  await ga('/veld/techniek');
  await slaap(800);
  const na = await favorieten();
  console.log(`favorieten ${aan} erbij, herladen na ${wacht} ms: ${voor.length} → ${na.length}`);
  if (na.length !== voor.length + aan) problemen.push(`favorieten: ${voor.length} + ${aan} werd ${na.length} (herladen na ${wacht} ms)`);
}

// Afvinklijst: twee vinkjes vlak achter elkaar.
const uid = await page.evaluate(() => Object.keys(localStorage).find((k) => k.endsWith('.sync.favorieten'))?.split('.')[2]);
await page.evaluate((uid) => {
  const k = `trainersapp.u.${uid}.clubtrainingen`;
  const d = JSON.parse(localStorage.getItem(k) ?? '{"versie":1,"lijst":[]}');
  d.lijst.unshift({ id: 'c-vink', naam: 'Afvinken', datums: ['2026-11-09'], leeftijd: 'mini-5-7', kinderen: 30, groepjes: 6, trainers: [], blokken: { techniek: 'veld-mt-tik-tak', 'een-tegen-een': 'veld-mt-over-de-rivier', afwerken: 'veld-mt-pionnen-omgooien', partijvormen: 'veld-mt-3-tegen-3' }, stationTrainers: {}, veldTrainers: {}, afgevinkt: [], gemaakt: 1, gewijzigd: Date.now() });
  localStorage.setItem(k, JSON.stringify(d));
}, uid);
await ga('/club/c-vink/plan');
await slaap(800);
await knop('Materiaal', '.tabs button, [role="tab"]');
await page.waitForSelector('.club-afvink input');
await page.evaluate(() => {
  const v = [...document.querySelectorAll('.club-afvink input')].slice(0, 3);
  v.forEach((x) => x.click());
});
await slaap(600);
const vinkjes = await page.evaluate(() => document.querySelectorAll('.club-afvink input:checked').length);
console.log(`afvinken: 3 vlak achter elkaar → ${vinkjes} aangevinkt`);
if (vinkjes !== 3) problemen.push(`afvinken: 3 vlak achter elkaar werd ${vinkjes}`);

// Thema: snel wisselen en meteen herladen.
await ga('/instellingen');
await page.waitForSelector('.thema-tegels button');
const themaVoor = await page.evaluate(() => localStorage.getItem('trainersapp.thema'));
await page.evaluate(() => {
  const k = [...document.querySelectorAll('.thema-tegels button')];
  k.slice(1, 4).forEach((x) => x.click());
});
const themaNa = await page.evaluate(() => localStorage.getItem('trainersapp.thema'));
await ga('/instellingen');
await slaap(1800);
await ga('/instellingen');
await slaap(600);
const themaEind = await page.evaluate(() => localStorage.getItem('trainersapp.thema'));
console.log(`thema: ${themaVoor} → ${themaNa} → na herladen ${themaEind}`);
if (themaEind !== themaNa) problemen.push(`thema: ${themaNa} werd ${themaEind}`);

// Spelerslijst op een nieuw toestel.
await page.evaluate((uid) => {
  const k = `trainersapp.u.${uid}.opstellingen`;
  const d = JSON.parse(localStorage.getItem(k) ?? '{"versie":1,"lijst":[]}');
  d.lijst.unshift({ id: 'o-namen', naam: 'Zaterdag', spelvorm: '8v8', formatie: '1-3-3-1', plekken: [{ id: 'p1', x: 21, y: 60, nummer: 1, naam: 'Testspeler 1' }], wissels: ['Testspeler 2'], gemaakt: 1, gewijzigd: Date.now() });
  localStorage.setItem(k, JSON.stringify(d));
}, uid);
await ga('/account');
await page.waitForFunction(() => document.querySelector('.sync-regel')?.textContent.includes('Alles staat online'), { timeout: 45000 }).catch(() => problemen.push('toestel 1 komt niet op Alles staat online')); // de emulator bevestigt soms pas na precies 30 seconden
const nieuw = await browser.createBrowserContext();
const p2 = await nieuw.newPage();
await alsGeinstalleerd(p2);
await p2.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem('trainersapp.emulator', '1');
    localStorage.setItem('trainersapp.taal', 'nl');
  } catch {
    /* about:blank */
  }
});
await p2.setViewport({ width: 1366, height: 820 });
await p2.goto(`${BASE}?r=nieuw#/account`, { waitUntil: 'domcontentloaded' });
await p2.waitForSelector('.account-form');
await p2.type('.account-form input[type="email"]', 'test1@example.com');
await p2.type('.account-form input[type="password"]', 'testwachtwoord1');
await p2.evaluate(() => document.querySelector('.account-form button[type="submit"]')?.click());
await p2.waitForFunction(() => document.querySelector('.account-naam')?.textContent === 'Testtrainer 1', { timeout: 20000 });
await p2.waitForFunction(() => Object.keys(localStorage).some((k) => k.endsWith('.sync.opstellingen') && localStorage.getItem(k).includes('o-namen')) && Object.keys(localStorage).some((k) => k.endsWith('.sync.favorieten') && localStorage.getItem(k) !== '[]'), { timeout: 15000 }).catch(async () => problemen.push(`nieuw toestel: gegevens komen niet binnen: ${await p2.evaluate(() => JSON.stringify({ regel: document.querySelector('.sync-regel')?.textContent, hash: location.hash, sleutels: Object.keys(localStorage).filter((k) => k.includes('.sync.')).map((k) => k.split('.').slice(3).join('.') + '=' + localStorage.getItem(k).length) }))}`));
await slaap(300);
const namen = await p2.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.spelersnamen') ?? '[]'));
console.log(`spelerslijst op het nieuwe toestel: ${JSON.stringify(namen)}`);
if (!namen.includes('Testspeler 1') || !namen.includes('Testspeler 2')) problemen.push(`spelerslijst op een nieuw toestel: ${JSON.stringify(namen)}`);
const favNieuw = await p2.evaluate(() => Object.keys(localStorage).filter((k) => k.endsWith('.favorieten') && !k.includes('.sync.')).map((k) => JSON.parse(localStorage.getItem(k)).ids.length).join());
console.log(`favorieten op het nieuwe toestel: ${favNieuw}`);
await nieuw.close();

await browser.close();
await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
console.log(problemen.length ? `PROBLEMEN:\n- ${problemen.join('\n- ')}` : 'Geen problemen gevonden.');
process.exit(problemen.length ? 1 : 0);
