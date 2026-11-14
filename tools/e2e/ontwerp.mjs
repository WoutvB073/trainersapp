// Ontwerprichtingen (fase 1 van de volgende stap): screenshots van het startscherm en de belangrijkste schermen per richting (huidig, a, b, c),
// op iPhone SE en laptop, licht en donker, plus controles: niets afgekapt, geen horizontaal scrollen, wisselknop werkt, clubkleur blijft werken.
// Bladen: blad-ontwerp-<richting>-<formaat>-<modus>.png en blad-ontwerp-start.png (alle startschermen naast elkaar).
// Gebruik: node tools/e2e/ontwerp.mjs [basis-url]   (ONTWERP=a MODUS=licht FORMAAT=SE voor een deel)
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, UA } from './hulp.mjs';

const browser = await start();
const problemen = [];
const fouten = [];
const RICHTINGEN = (process.env.ONTWERP ?? 'huidig,a,b,c').split(',');
const MODI = (process.env.MODUS ?? 'licht,donker').split(',');
const FORMATEN = [
  ['SE', { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['laptop', { width: 1366, height: 820, deviceScaleFactor: 1 }],
].filter(([n]) => !process.env.FORMAAT || process.env.FORMAAT.split(',').includes(n));
const SCHERMEN = [
  ['start', '/', 'Startscherm'],
  ['categorie', '/veld', 'Categorieën spelers'],
  ['lijst', '/veld/techniek', 'Lijst oefeningen'],
  ['oefening', '/oefening/veld-tq-kappen-draaien', 'Oefening'],
  ['wedstrijd', '/wedstrijd', 'Wedstrijd'],
  ['club', '/club', 'Circuittraining'],
  ['instellingen', '/instellingen', 'Instellingen'],
  ['help', '/help', 'Help'],
];
const startShots = [];

for (const richting of RICHTINGEN) {
  for (const [formaat, vp] of FORMATEN) {
    for (const modus of MODI) {
      const waar = `${richting} ${formaat} ${modus}`;
      const shots = [];
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await alsGeinstalleerd(page);
      await page.evaluateOnNewDocument(
        (richting, modus) => {
          try {
            localStorage.setItem('trainersapp.taal', 'nl');
            localStorage.setItem('trainersapp.thema', JSON.stringify({ thema: 'standaard', modus }));
            if (richting === 'huidig') localStorage.removeItem('trainersapp.ontwerp');
            else localStorage.setItem('trainersapp.ontwerp', richting);
            localStorage.setItem('trainersapp.3dAltijd', '0');
          } catch {
            /* about:blank */
          }
        },
        richting,
        modus,
      );
      page.on('pageerror', (e) => fouten.push(`${waar}: ${e.message}`));
      await page.setViewport(vp);
      for (const [naam, pad, titel] of SCHERMEN) {
        await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#${pad}`, { waitUntil: 'networkidle0' });
        await slaap(naam === 'oefening' ? 900 : 350);
        const r = await page.evaluate((scherm) => {
          const breed = Math.max(document.documentElement.scrollWidth, innerWidth) - scherm;
          const kap = [...document.querySelectorAll('button, h1, h2, h3, .tegel-titel, .rij-titel, .kaart-titel, .kop-titel')]
            .filter((e) => e.offsetParent && !e.closest('.speler-vak') && !e.closest('.club-tabel-vak') && e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).textOverflow !== 'ellipsis')
            .map((e) => e.textContent.trim().slice(0, 30));
          return { breed, kap, ontwerp: document.documentElement.dataset.ontwerp ?? 'huidig' };
        }, vp.width);
        if (r.breed > 0) problemen.push(`${waar} ${naam}: ${r.breed} px te breed`);
        if (r.kap.length) problemen.push(`${waar} ${naam}: afgekapt: ${r.kap.slice(0, 3).join(' | ')}`);
        if (r.ontwerp !== richting) problemen.push(`${waar} ${naam}: ontwerp is ${r.ontwerp}`);
        const bestand = `${MAP}sontwerp-${richting}-${formaat}-${modus}-${naam}.png`;
        await page.screenshot({ path: bestand, fullPage: false });
        shots.push([bestand, `${titel}`]);
        if (naam === 'start') startShots.push([bestand, `${richting === 'huidig' ? 'Huidig' : `Richting ${richting.toUpperCase()}`} · ${formaat} · ${modus}`]);
      }
      // Installatiescherm (iPhone in Safari, niet geïnstalleerd) hoort er ook bij.
      if (formaat === 'SE') {
        const p2 = await context.newPage();
        await p2.setUserAgent(UA.iphone26 ?? UA.iphone);
        await p2.setViewport(vp);
        await p2.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#/`, { waitUntil: 'networkidle0' });
        await slaap(400);
        const bestand = `${MAP}sontwerp-${richting}-${formaat}-${modus}-installeren.png`;
        await p2.screenshot({ path: bestand, fullPage: true });
        shots.push([bestand, 'Installatiescherm (iPhone, Safari)']);
        const breed = await p2.evaluate((s) => Math.max(document.documentElement.scrollWidth, innerWidth) - s, vp.width);
        if (breed > 0) problemen.push(`${waar} installeren: ${breed} px te breed`);
        await p2.close();
      }
      await blad(browser, shots, `${MAP}blad-ontwerp-${richting}-${formaat}-${modus}.png`, formaat === 'SE' ? 5 : 3, formaat === 'SE' ? 2000 : 2400);
      await context.close();
      console.log(`${waar}: klaar`);
    }
  }
}

// Wisselknop (alleen in de voorbeeldversie zichtbaar): kiezen wordt onthouden, en een clubkleur blijft werken in elke richting.
if (!process.env.ONTWERP) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('trainersapp.taal', 'nl');
      localStorage.setItem('trainersapp.voorbeeld', '1');
      if (!localStorage.getItem('trainersapp.thema')) localStorage.setItem('trainersapp.thema', JSON.stringify({ thema: 'blauw', modus: 'licht' }));
    } catch {
      /* about:blank */
    }
  });
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#/`, { waitUntil: 'networkidle0' });
  const knop = await page.$('.ontwerp-wissel');
  if (!knop) problemen.push('wisselknop voor de ontwerprichting ontbreekt in de voorbeeldversie');
  else {
    const kleuren = [];
    for (const r of ['a', 'b', 'c', 'huidig']) {
      await page.evaluate((r) => document.querySelector(`.ontwerp-wissel [data-richting="${r}"]`)?.click(), r);
      await slaap(250);
      const nu = await page.evaluate(() => ({ o: document.documentElement.dataset.ontwerp ?? 'huidig', bewaard: localStorage.getItem('trainersapp.ontwerp') ?? 'huidig', primair: getComputedStyle(document.documentElement).getPropertyValue('--primair').trim() }));
      if (nu.o !== r || nu.bewaard !== r) problemen.push(`wisselknop: ${r} gekozen, maar ${JSON.stringify(nu)}`);
      kleuren.push(nu.primair);
    }
    if (new Set(kleuren).size !== 1) problemen.push(`clubkleur verandert met de richting: ${kleuren.join(', ')}`);
  }
  await context.close();
}

if (startShots.length) await blad(browser, startShots, `${MAP}blad-ontwerp-start.png`, 8, 2600);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)].slice(0, 60)) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
