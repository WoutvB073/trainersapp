// 0.25.0: de app in het Engels én het Nederlands op telefoon (iPhone SE staand/liggend, 320 px), tablet en laptop.
// Per scherm: geen Nederlandse woorden in de Engelse weergave (ook aria-label/title/placeholder), geen afgekapte tekst in
// knoppen/labels/koppen, geen horizontaal scrollen, geen fouten in de console. Daarnaast: taal wisselen bij Instellingen,
// Automatisch (telefoon in het Engels/Duits) en het installatiescherm in het Engels.
// Bladen: blad-taal-en.png, blad-taal-nl.png, blad-taal-se.png.   Gebruik: node tools/e2e/taal.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, UA } from './hulp.mjs';

const NL_WOORDEN = [
  'de',
  'het',
  'een',
  'en',
  'van',
  'met',
  'naar',
  'op',
  'je',
  'jij',
  'jouw',
  'niet',
  'wordt',
  'worden',
  'bij',
  'voor',
  'als',
  'ook',
  'maar',
  'dat',
  'deze',
  'zijn',
  'hij',
  'zij',
  'kun',
  'kan',
  'moet',
  'nog',
  'weer',
  'uit',
  'aan',
  'om',
  'tot',
  'onder',
  'tussen',
  'achter',
  'oefening',
  'oefeningen',
  'spelers',
  'speler',
  'bal',
  'ballen',
  'pion',
  'pionnen',
  'doel',
  'schiet',
  'loopt',
  'gooit',
  'vangt',
  'duikt',
  'trapt',
  'wissel',
  'hoedje',
  'hoedjes',
  'zestien',
  'paal',
  'goed',
  'snel',
  'eerst',
  'daarna',
  'dan',
  'waar',
  'wie',
  'wat',
  'hoe',
  'geen',
  'alle',
  'veld',
  'vak',
  'tegen',
  'blijft',
  'staat',
  'trainingen',
  'opstelling',
  'tactiekbord',
  'instellingen',
  'opslaan',
  'verwijderen',
  'delen',
];

const FORMATEN = [
  { naam: 'se', w: 375, h: 667, mobiel: true },
  { naam: '320', w: 320, h: 568, mobiel: true },
  { naam: 'se-liggend', w: 667, h: 375, mobiel: true },
  { naam: 'tablet', w: 820, h: 1180, mobiel: true },
  { naam: 'laptop', w: 1366, h: 800, mobiel: false },
];

const VAST = [
  ['start', '#/'],
  ['spelers', '#/veld'],
  ['keepers-lijst', '#/keepers/passing'],
  ['detail-keeper', '#/oefening/keeper-vz-een-hand-stompen-paal', 'moeilijker'],
  ['detail-spelers', '#/oefening/veld-pv-5-5-flank', 'makkelijker'],
  ['instellingen', '#/instellingen'],
  ['help', '#/help/animatie'],
  ['eigen-nieuw', '#/eigen/nieuw'],
  ['wedstrijd', '#/wedstrijd'],
  ['account', '#/account'],
  ['trainingen', '#/trainingen'],
];

const browser = await start();
const fouten = [];
const shots = { en: [], nl: [], se: [] };
let n = 0;

/** Nederlandse woorden en afgekapte teksten op de huidige pagina. */
async function controleer(page, taal, waar) {
  const r = await page.evaluate((woorden) => {
    const tekst = [
      document.body.innerText,
      ...[...document.querySelectorAll('[aria-label],[title],[placeholder]')].map((e) => [e.getAttribute('aria-label'), e.getAttribute('title'), e.getAttribute('placeholder')].join(' ')),
    ]
      .join('\n')
      .replace(/Taal \/ Language|Nederlands/g, ' ');
    const re = new RegExp(`(^|[^\\p{L}'’-])(${woorden.join('|')})(?=$|[^\\p{L}'’-])`, 'giu');
    const nl = [...new Set([...tekst.matchAll(re)].map((m) => m[2]))];
    // Afgekapt: tekst past niet in zijn vak (knoppen, labels, koppen, tegels).
    const kap = [];
    for (const e of document.querySelectorAll('button, .knop, .label, h1, h2, h3, .tegel-titel, .tegel-sub, .kop-titel, .chips button, .keuze, .gen-chip, .tabs button')) {
      const s = getComputedStyle(e);
      if (e.offsetParent === null) continue;
      const verborgen = s.overflow === 'hidden' || s.overflowX === 'hidden' || s.textOverflow === 'ellipsis' || s.whiteSpace === 'nowrap';
      if (verborgen && e.scrollWidth > e.clientWidth + 2 && e.innerText.trim()) kap.push(e.innerText.trim().slice(0, 40));
    }
    const breed = document.documentElement.scrollWidth - window.innerWidth;
    return { nl, kap, breed };
  }, NL_WOORDEN);
  if (taal === 'en' && r.nl.length) fouten.push(`${waar}: Nederlands in het Engels: ${r.nl.join(', ')}`);
  if (r.kap.length) fouten.push(`${waar}: afgekapt: ${r.kap.join(' | ')}`);
  if (r.breed > 0) fouten.push(`${waar}: ${r.breed}px horizontaal scrollen`);
}

async function foto(page, taal, f, naam) {
  const pad = `${MAP}taal-${taal}-${f.naam}-${naam}.png`;
  await page.screenshot({ path: pad, fullPage: f.naam !== 'laptop' });
  if (taal === 'en' && ['se', 'tablet', 'laptop'].includes(f.naam)) shots.en.push([pad, `${f.naam} · ${naam}`]);
  if (taal === 'nl' && f.naam === 'se') shots.nl.push([pad, `${f.naam} · ${naam}`]);
  if (f.naam === '320' || f.naam === 'se-liggend') shots.se.push([pad, `${taal} · ${f.naam} · ${naam}`]);
}

for (const taal of ['en', 'nl']) {
  for (const f of FORMATEN) {
    const page = await browser.newPage();
    await alsGeinstalleerd(page);
    await page.evaluateOnNewDocument((taal) => {
      try {
        localStorage.setItem('trainersapp.taal', taal);
      } catch {
        /* about:blank */
      }
    }, taal);
    page.on('pageerror', (e) => fouten.push(`${taal}/${f.naam}: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && fouten.push(`${taal}/${f.naam}: ${m.text()}`));
    await page.setViewport({ width: f.w, height: f.h, deviceScaleFactor: 1, isMobile: f.mobiel, hasTouch: f.mobiel });
    const ga = async (hash) => {
      await page.goto(`${BASE}?r=${n++}${hash}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      await slaap(250);
    };
    for (const [naam, hash, variatie] of VAST) {
      await ga(hash);
      if (variatie) await page.click(`.variatie-knop.${variatie}`).catch(() => {});
      await slaap(150);
      await controleer(page, taal, `${taal}/${f.naam}/${naam}`);
      await foto(page, taal, f, naam);
    }
    // Training maken → kiezen (twee oefeningen) → genereren → trainingsmodus.
    await ga('#/');
    await page.click('.tegel-training .knop-primair');
    await page.waitForFunction(() => /#\/training\//.test(location.hash));
    const id = await page.evaluate(() => location.hash.split('/')[2]);
    await ga(`#/training/${id}/kiezen`);
    for (const i of [0, 1]) {
      await page.evaluate((i) => document.querySelectorAll('.toevoeg-knop')[i]?.click(), i);
      await slaap(150);
    }
    await slaap(150);
    await controleer(page, taal, `${taal}/${f.naam}/kiezen`);
    await foto(page, taal, f, 'kiezen');
    for (const [naam, hash] of [
      ['training', `#/training/${id}`],
      ['genereren', `#/training/${id}/genereren`],
      ['modus', `#/training/${id}/modus/1`],
    ]) {
      await ga(hash);
      await controleer(page, taal, `${taal}/${f.naam}/${naam}`);
      await foto(page, taal, f, naam);
    }
    // Nieuwe opstelling en de editor van een eigen oefening.
    await ga('#/wedstrijd');
    await page.click('.knop.knop-primair.knop-breed');
    await page.waitForFunction(() => /#\/opstelling\//.test(location.hash));
    await slaap(300);
    await controleer(page, taal, `${taal}/${f.naam}/opstelling`);
    await foto(page, taal, f, 'opstelling');
    await ga('#/eigen/nieuw');
    await page.click('main .knop.knop-primair.knop-breed');
    await page.waitForFunction(() => /#\/eigen\/.+\/tekenen/.test(location.hash));
    await slaap(400);
    await controleer(page, taal, `${taal}/${f.naam}/tekenen`);
    await foto(page, taal, f, 'tekenen');
    await page.close();
  }
}

// Taal wisselen bij Instellingen: Nederlands → English → de app laadt opnieuw in het Engels.
{
  const page = await browser.newPage();
  await alsGeinstalleerd(page);
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}?r=${n++}#/instellingen`, { waitUntil: 'networkidle0' });
  const knop = await page.$$('#taal button');
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), knop[1].click()]);
  await page.goto(`${BASE}?r=${n++}#/`, { waitUntil: 'networkidle0' });
  const titel = await page.$eval('.tegel-veld .tegel-titel', (e) => e.textContent);
  console.log(`Taal wisselen naar English: ${titel === 'Players' ? 'OK' : `MISLUKT (${titel})`}`);
  if (titel !== 'Players') fouten.push(`taal wisselen: "${titel}"`);
  const onthouden = await page.evaluate(() => localStorage.getItem('trainersapp.taal'));
  if (onthouden !== 'en') fouten.push(`taalkeuze niet onthouden (${onthouden})`);
  await page.close();
}

// Automatisch: Engelse telefoon → Engels, Duitse telefoon → Nederlands.
for (const [talen, verwacht] of [
  [['en-GB', 'en'], 'Players'],
  [['de-DE', 'en'], 'Spelers'],
  [['nl-NL'], 'Spelers'],
]) {
  const page = await browser.newPage();
  await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument((talen) => {
    try {
      localStorage.removeItem('trainersapp.taal'); // Automatisch
    } catch {
      /* about:blank */
    }
    Object.defineProperty(navigator, 'languages', { get: () => talen });
    Object.defineProperty(navigator, 'language', { get: () => talen[0] });
  }, talen);
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}?r=${n++}#/`, { waitUntil: 'networkidle0' });
  const titel = await page.$eval('.tegel-veld .tegel-titel', (e) => e.textContent);
  console.log(`Automatisch (${talen[0]}): ${titel === verwacht ? 'OK' : 'MISLUKT'} – "${titel}"`);
  if (titel !== verwacht) fouten.push(`automatisch ${talen[0]}: "${titel}"`);
  await page.close();
}

// Installatiescherm (telefoon in de browser) in het Engels.
for (const [naam, ua] of [
  ['iphone', UA.iphone26],
  ['android', UA.android],
]) {
  const page = await browser.newPage();
  await page.setUserAgent(ua);
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('trainersapp.taal', 'en');
    } catch {
      /* about:blank */
    }
  });
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}?r=${n++}#/`, { waitUntil: 'networkidle0' });
  await controleer(page, 'en', `en/installeren-${naam}`);
  const pad = `${MAP}taal-en-installeren-${naam}.png`;
  await page.screenshot({ path: pad, fullPage: true });
  shots.se.push([pad, `en · installeren · ${naam}`]);
  await page.close();
}

await blad(browser, shots.en, `${MAP}blad-taal-en.png`, 6, 2400);
await blad(browser, shots.nl, `${MAP}blad-taal-nl.png`, 6, 2000);
await blad(browser, shots.se, `${MAP}blad-taal-se.png`, 6, 2400);
await browser.close();
console.log(fouten.length ? `Problemen:\n- ${[...new Set(fouten)].join('\n- ')}` : 'Geen problemen gevonden.');
process.exit(fouten.length ? 1 : 0);
