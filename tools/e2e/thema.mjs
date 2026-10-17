// Clubkleuren en licht/donker: elk thema in licht en donker op het startscherm, plus enkele schermen in een paar thema's.
// Controleert ook dat het veld en de teamkleuren in elk thema gelijk blijven en dat de keuze onthouden wordt.
// Screenshots: blad-thema-start.png, blad-thema-schermen.png. Gebruik: node tools/e2e/thema.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start } from './hulp.mjs';

const browser = await start();
const fouten = [];
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};
const TELEFOON = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const THEMAS = ['standaard', 'rood', 'blauw', 'geel', 'groen', 'oranje', 'paars', 'zwart'];

async function pagina(viewport = TELEFOON) {
  const page = await browser.newPage();
  await alsGeinstalleerd(page);
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => m.type() === 'error' && fouten.push(m.text()));
  await page.setViewport(viewport);
  return page;
}
const zetThema = (page, thema, modus) => page.evaluate((k) => localStorage.setItem('trainersapp.thema', JSON.stringify(k)), { thema, modus });

const page = await pagina();
await page.goto(`${BASE}?r=t#/`, { waitUntil: 'networkidle0' });
const startShots = [];
let gras;
for (const modus of ['licht', 'donker']) {
  for (const thema of THEMAS) {
    await zetThema(page, thema, modus);
    await page.goto(`${BASE}?r=t${thema}${modus}#/`, { waitUntil: 'networkidle0' });
    await slaap(150);
    const v = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return { primair: s.getPropertyValue('--primair').trim(), gras: s.getPropertyValue('--gras-1').trim(), team: s.getPropertyValue('--team-a').trim(), modus: document.documentElement.dataset.modus, kop: getComputedStyle(document.querySelector('.start-kop')).backgroundColor };
    });
    gras ??= v;
    controle(v.modus === modus, `${thema}/${modus}: data-modus ${v.modus}`);
    controle(v.gras === gras.gras && v.team === gras.team, `${thema}/${modus}: veld of teamkleur veranderd (${v.gras}, ${v.team})`);
    const pad = `${MAP}thema-${thema}-${modus}.png`;
    await page.screenshot({ path: pad });
    startShots.push([pad, `${thema} – ${modus}`]);
  }
}
await blad(browser, startShots, `${MAP}blad-thema-start.png`, 8, 2400);

// Een paar schermen in een paar thema's (instellingen, lijst, detail, editor).
const schermShots = [];
for (const [thema, modus] of [
  ['geel', 'licht'],
  ['zwart', 'donker'],
  ['rood', 'donker'],
  ['blauw', 'licht'],
]) {
  await zetThema(page, thema, modus);
  for (const [pad, naam] of [
    ['#/instellingen', 'instellingen'],
    ['#/veld/afwerken', 'lijst'],
    ['#/oefening/veld-pt-y-vorm', 'detail'],
  ]) {
    await page.goto(`${BASE}?r=s${thema}${naam}${pad}`, { waitUntil: 'networkidle0' });
    await slaap(naam === 'detail' ? 1500 : 300);
    const p = `${MAP}thema-scherm-${thema}-${modus}-${naam}.png`;
    await page.screenshot({ path: p });
    schermShots.push([p, `${thema} ${modus}: ${naam}`]);
  }
}
await blad(browser, schermShots, `${MAP}blad-thema-schermen.png`, 6, 2400);

// Kiezen in Instellingen en onthouden na herladen.
await zetThema(page, 'standaard', 'licht');
await page.goto(`${BASE}?r=k#/instellingen`, { waitUntil: 'networkidle0' });
await page.evaluate(() => [...document.querySelectorAll('.thema-tegel')].find((b) => b.textContent.includes('Paars'))?.click());
await page.evaluate(() => [...document.querySelectorAll('.keuze')].find((b) => b.textContent.includes('Donker'))?.click());
await slaap(200);
await page.goto(`${BASE}?r=k2#/`, { waitUntil: 'networkidle0' });
const na = await page.evaluate(() => ({ thema: document.documentElement.dataset.theme, modus: document.documentElement.dataset.modus }));
controle(na.thema === 'paars' && na.modus === 'donker', `Keuze niet onthouden: ${JSON.stringify(na)}`);
// Automatisch volgt het systeem.
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
await zetThema(page, 'standaard', 'auto');
await page.goto(`${BASE}?r=k3#/`, { waitUntil: 'networkidle0' });
const auto = await page.evaluate(() => document.documentElement.dataset.modus);
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
await slaap(200);
const autoLicht = await page.evaluate(() => document.documentElement.dataset.modus);
controle(auto === 'donker' && autoLicht === 'licht', `Automatisch: ${auto} → ${autoLicht}`);
await zetThema(page, 'standaard', 'licht');

await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)]);
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of problemen) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
