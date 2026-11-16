// Ontwerp Zacht (0.36.0): screenshots van alle hoofdschermen op iPhone SE en laptop, licht en donker (en een clubkleur), met controles:
// niets afgekapt, geen horizontaal scrollen, geen fouten in de browser. Bladen: blad-zacht-<formaat>-<modus>.png.
// Gebruik: node tools/e2e/zacht.mjs [basis-url]   (FORMAAT=SE MODUS=licht THEMA=rood TAAL=en voor een deel)
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, UA } from './hulp.mjs';

const browser = await start();
const problemen = [];
const fouten = [];
const TAAL = process.env.TAAL ?? 'nl';
const THEMA = process.env.THEMA ?? 'standaard';
const MODI = (process.env.MODUS ?? 'licht,donker').split(',');
const FORMATEN = [
  ['SE', { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['laptop', { width: 1366, height: 820, deviceScaleFactor: 1 }],
].filter(([n]) => !process.env.FORMAAT || process.env.FORMAAT.split(',').includes(n));

// [naam, pad of actie, onderschrift]. Een actie maakt eerst iets aan (training, circuittraining, opstelling) en gaat daarheen.
const knop = (re) => async (page) => {
  await page.evaluate((bron) => {
    const re = new RegExp(bron, 'i');
    [...document.querySelectorAll('button, a')].find((b) => re.test(b.textContent.trim()))?.click();
  }, re.source);
  await slaap(900);
};
const SCHERMEN = [
  ['start', '/', 'Startscherm'],
  ['spelers', '/veld', 'Categorieën spelers'],
  ['keepers', '/keepers', 'Categorieën keepers'],
  ['lijst', '/veld/techniek', 'Lijst oefeningen'],
  ['oefening', '/oefening/veld-tq-kappen-draaien', 'Oefening'],
  ['trainingen', '/trainingen', 'Mijn teamtrainingen'],
  ['training', ['/', knop(/^(Teamtraining maken|Create team session)/)], 'Teamtraining'],
  ['kiezen', ['+kiezen'], 'Oefeningen kiezen'],
  ['genereren', ['+genereren'], 'Training genereren'],
  ['wedstrijd', '/wedstrijd', 'Wedstrijd'],
  ['opstelling', ['/wedstrijd', knop(/^(\+\s*)?(Nieuwe opstelling|New line-up)/)], 'Opstelling'],
  ['tactieken', '/tactieken', 'Voorbeeldtactieken'],
  ['tactiek', '/tactiek/hoog-druk-433', 'Voorbeeldtactiek'],
  ['hervattingen', '/hervattingen', 'Voorbeeldhervattingen'],
  ['club', '/club', 'Circuittraining'],
  ['club-nieuw', ['/club', knop(/^(\+\s*)?(Nieuwe circuittraining|New circuit session)/)], 'Nieuwe circuittraining'],
  ['club-bewerk', ['/club', knop(/^(\+\s*)?(Nieuwe circuittraining|New circuit session)/), knop(/^Mini Talents/)], 'Circuittraining'],
  ['club-plan', ['+plan'], 'Plan'],
  ['rooster', '/rooster', 'Trainersrooster'],
  ['eigen', '/eigen', 'Eigen oefeningen'],
  ['eigen-nieuw', '/eigen/nieuw', 'Nieuwe eigen oefening'],
  ['instellingen', '/instellingen', 'Instellingen'],
  ['account', '/account', 'Account'],
  ['teams', '/teams', 'Teams'],
  ['links', '/links', 'Mijn deellinks'],
  ['help', '/help', 'Help'],
  ['help-onderwerp', '/help/installeren', 'Help: installeren'],
];

async function controleer(page, waar) {
  const r = await page.evaluate(() => {
    const breed = document.documentElement.scrollWidth - innerWidth;
    const kap = [...document.querySelectorAll('button, h1, h2, h3, .tegel-titel, .rij-titel, .kaart-titel, .kop-titel, .knop')]
      .filter((e) => e.offsetParent && !e.closest('.speler-vak') && !e.closest('.club-tabel-vak') && e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).textOverflow !== 'ellipsis')
      .map((e) => e.textContent.trim().slice(0, 30));
    return { breed, kap, ontwerp: document.documentElement.dataset.ontwerp ?? '' };
  });
  if (r.breed > 0) problemen.push(`${waar}: ${r.breed} px te breed`);
  if (r.kap.length) problemen.push(`${waar}: afgekapt: ${r.kap.slice(0, 3).join(' | ')}`);
  if (r.ontwerp !== 'c') problemen.push(`${waar}: ontwerp is "${r.ontwerp}"`);
}

for (const [formaat, vp] of FORMATEN) {
  for (const modus of MODI) {
    const waarBlad = `${formaat} ${modus}`;
    const shots = [];
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await alsGeinstalleerd(page);
    await page.evaluateOnNewDocument(
      (taal, thema, modus) => {
        try {
          localStorage.setItem('trainersapp.taal', taal);
          localStorage.setItem('trainersapp.thema', JSON.stringify({ thema, modus }));
          localStorage.setItem('trainersapp.3dAltijd', '0');
        } catch {
          /* about:blank */
        }
      },
      TAAL,
      THEMA,
      modus,
    );
    page.on('pageerror', (e) => fouten.push(`${waarBlad}: ${e.message}`));
    await page.setViewport(vp);
    let laatste = '/';
    for (const [naam, wat, titel] of SCHERMEN) {
      if (typeof wat === 'string') {
        await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#${wat}`, { waitUntil: 'networkidle0' });
      } else if (typeof wat[0] === 'string' && wat[0].startsWith('+')) {
        const hash = await page.evaluate(() => location.hash.slice(1));
        await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#${hash.replace(/\/(kiezen|genereren|plan)$/, '')}/${wat[0].slice(1)}`, { waitUntil: 'networkidle0' });
      } else {
        await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#${wat[0]}`, { waitUntil: 'networkidle0' });
        for (const stap of wat.slice(1)) await stap(page);
      }
      await slaap(naam === 'oefening' || naam === 'tactiek' ? 900 : 350);
      laatste = await page.evaluate(() => location.hash);
      await controleer(page, `${waarBlad} ${naam} (${laatste})`);
      const bestand = `${MAP}z-${formaat}-${modus}-${naam}.png`;
      await page.screenshot({ path: bestand, fullPage: false });
      shots.push([bestand, titel]);
    }
    // Installatiescherm: iPhone in Safari en in WhatsApp (niet geïnstalleerd).
    if (formaat === 'SE') {
      for (const [ua, onder] of [
        [UA.iphone26, 'Installatiescherm (iPhone, Safari)'],
        ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/25.20.0', 'Installatiescherm (iPhone, WhatsApp)'],
      ]) {
        const los = await browser.createBrowserContext();
        const p2 = await los.newPage();
        await p2.evaluateOnNewDocument(
          (taal, thema, modus) => {
            try {
              localStorage.setItem('trainersapp.taal', taal);
              localStorage.setItem('trainersapp.thema', JSON.stringify({ thema, modus }));
            } catch {
              /* about:blank */
            }
          },
          TAAL,
          THEMA,
          modus,
        );
        await p2.setUserAgent(ua);
        await p2.setViewport(vp);
        await p2.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#/`, { waitUntil: 'networkidle0' });
        await slaap(400);
        const bestand = `${MAP}z-${formaat}-${modus}-inst-${shots.length}.png`;
        await p2.screenshot({ path: bestand, fullPage: false });
        shots.push([bestand, onder]);
        const breed = await p2.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (breed > 0) problemen.push(`${waarBlad} ${onder}: ${breed} px te breed`);
        await los.close();
      }
    }
    await blad(browser, shots, `${MAP}blad-zacht-${formaat}-${modus}${TAAL === 'nl' ? '' : `-${TAAL}`}${THEMA === 'standaard' ? '' : `-${THEMA}`}.png`, formaat === 'SE' ? 7 : 4, formaat === 'SE' ? 2600 : 2600);
    await context.close();
    console.log(`${waarBlad}: klaar (${shots.length} schermen)`);
  }
}
await browser.close();
if (fouten.length) {
  console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
  problemen.push('fouten in de browser');
}
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)].slice(0, 60)) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
