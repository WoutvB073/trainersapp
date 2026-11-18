// Voorbeeldversie (fase 1 van de volgende stap): controleert de aparte voorbeeld-build (lokaal of op de testlink).
// - online staat uit: geen Inloggen/Teams, en geen enkel verzoek naar Firebase of Google tijdens het gebruik (ook niet bij Delen);
// - titel "(voorbeeld)", niet vindbaar voor zoekmachines, eigen naam in het manifest;
// - de wisselknop voor het ontwerp is er zonder testvlag (de proef Realistisch is sinds 0.38.0 een gewone instelling, in beide builds);
// - de vijf uitgewerkte oefeningen openen in 3D;
// - een deellink wijst naar de voorbeeldversie zelf.
// Met "gewoon" als tweede argument: de gewone build (poort 4184) heeft juist géén wisselknop en wél Inloggen.
// Gebruik: node tools/e2e/voorbeeld.mjs [basis-url] [gewoon]
import { alsGeinstalleerd, slaap, start } from './hulp.mjs';

const GEWOON = process.argv[3] === 'gewoon';
const BASIS = process.argv[2] && process.argv[2] !== '-' ? process.argv[2] : GEWOON ? 'http://localhost:4184/trainersapp/' : 'http://localhost:4185/trainersapp/';
const VIJF = ['veld-tq-kruis-opendraaien', 'veld-pt-ruit-derde-man', 'veld-af-schot-rebound-intikken', 'veld-vo-kantelen-blok', 'keeper-ld-zit-sta-duik'];
const browser = await start();
const problemen = [];
const fouten = [];
const ctx = await browser.createBrowserContext();
const page = await ctx.newPage();
await alsGeinstalleerd(page);
await page.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem('trainersapp.taal', 'nl');
  } catch {
    /* about:blank */
  }
});
page.on('pageerror', (e) => fouten.push(e.message));
// Elk verzoek naar buiten de eigen site bijhouden.
const eigen = new URL(BASIS).origin;
const buiten = new Set();
page.on('request', (r) => {
  const u = r.url();
  if (u.startsWith('data:') || u.startsWith('blob:') || u.startsWith(eigen)) return;
  buiten.add(new URL(u).host);
});
await page.setViewport({ width: 1100, height: 820, deviceScaleFactor: 1 });
const ga = async (pad) => {
  await page.goto(`${BASIS}?r=${Math.random().toString(36).slice(2)}#${pad}`, { waitUntil: 'domcontentloaded' });
  await slaap(500);
};
const tekst = () => page.evaluate(() => document.body.innerText);

await ga('/');
const kop = await page.evaluate(() => ({ titel: document.title, robots: document.querySelector('meta[name="robots"]')?.content ?? '', wissel: !!document.querySelector('.ontwerp-wissel') }));
const manifest = await page.evaluate(async () => {
  const l = document.querySelector('link[rel="manifest"]');
  return l ? (await fetch(l.href).then((r) => r.json())).name : '';
});

await ga('/instellingen');
const instellingen = await tekst();
const inloggen = /inloggen/i.test(instellingen);

await ga(`/oefening/${VIJF[2]}`);
await page.waitForSelector('.speler-canvas-3d', { timeout: 30000 }).catch(() => problemen.push('3D laadt niet'));
await slaap(400);
// Sinds 0.38.0 geen proefschakelaar meer in het beeld (Realistisch staat bij Instellingen).
const proef = !!(await page.$('.speler-proef'));

if (GEWOON) {
  if (kop.wissel) problemen.push('gewone build: wisselknop voor het ontwerp is te zien');
  if (proef) problemen.push('gewone build: oude schakelaar Realistisch (proef) is te zien');
  if (!inloggen) problemen.push('gewone build: Inloggen ontbreekt bij Instellingen');
  if (/voorbeeld/i.test(kop.titel) || /noindex/.test(kop.robots)) problemen.push(`gewone build: titel of robots van de voorbeeldversie (${kop.titel} / ${kop.robots})`);
  if (manifest !== 'TopTraining') problemen.push(`gewone build: manifestnaam is ${manifest}`);
} else {
  if (!/voorbeeld/i.test(kop.titel)) problemen.push(`titel is ${kop.titel}`);
  if (!/noindex/.test(kop.robots)) problemen.push('robots noindex ontbreekt');
  if (manifest !== 'TopTraining voorbeeld') problemen.push(`manifestnaam is ${manifest}`);
  if (!kop.wissel) problemen.push('wisselknop voor het ontwerp ontbreekt');
  if (inloggen) problemen.push('Inloggen staat bij Instellingen (online hoort uit te staan)');
  if (proef) problemen.push('oude schakelaar Realistisch (proef) is nog te zien');

  // Alle richtingen kiezen: de pagina blijft werken.
  await ga('/');
  for (const r of ['a', 'b', 'c', 'huidig']) {
    await page.evaluate((r) => document.querySelector(`.ontwerp-wissel [data-richting="${r}"]`)?.click(), r);
    await slaap(200);
    const nu = await page.evaluate(() => document.documentElement.dataset.ontwerp ?? 'huidig');
    if (nu !== r) problemen.push(`ontwerp ${r} gekozen, maar het is ${nu}`);
  }

  // De vijf uitgewerkte oefeningen openen in 3D (standaard Realistisch).
  for (const id of VIJF) {
    await ga(`/oefening/${id}`);
    const ok = await page.waitForSelector('.speler-canvas-3d', { timeout: 30000 }).catch(() => null);
    if (!ok) problemen.push(`${id}: geen 3D`);
    const titel = await page.evaluate(() => document.querySelector('.detail-titel')?.textContent ?? '');
    if (!titel) problemen.push(`${id}: geen titel`);
  }

  // Een training maken en delen: de link wijst naar de voorbeeldversie zelf en er gaat niets naar Firebase.
  await ga('/wedstrijd');
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /nieuwe opstelling/i.test(b.textContent))?.click());
  await slaap(900);
  const deel = await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /^deel|delen|link/i.test(b.textContent.trim()))?.textContent ?? '');
  if (deel) {
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /^deel|delen|link/i.test(b.textContent.trim()))?.click());
    await slaap(1200);
  }
}

const verdacht = [...buiten].filter((h) => /firebase|googleapis|google|gstatic|firestore/i.test(h));
if (!GEWOON && verdacht.length) problemen.push(`verzoeken naar Firebase/Google: ${verdacht.join(', ')}`);
if (!GEWOON && buiten.size) console.log('Verzoeken buiten de eigen site:', [...buiten].join(', '));
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)]) console.log(' -', p);
  process.exit(1);
}
console.log(GEWOON ? 'Gewone build: geen wisselknop, geen proef, Inloggen aanwezig.' : `Voorbeeldversie in orde: online uit, geen verzoeken naar Firebase of Google${buiten.size ? '' : ' (helemaal geen verzoeken buiten de eigen site)'}.`);
