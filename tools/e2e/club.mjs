// 0.31.0: Clubtraining op iPhone SE en laptop in NL en EN: nieuw, leeg weer weg, instellen, genereren, kiezen, veldplan, rotatie,
// materiaal afvinken (onthouden), dupliceren naar volgende week, deellink op een niet-geïnstalleerde telefoon zonder inlog (station in
// 3D en 2D), kwartiertimer. Blad: blad-club.png.   Gebruik: node tools/e2e/club.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, UA } from './hulp.mjs';

const browser = await start();
const problemen = [];
const shots = [];
const FORMATEN = [
  ['se', 375, 667, true],
  ['laptop', 1366, 800, false],
];
let deellink = '';

async function nieuw(ctx, taal, w, h, mobiel, waar, geinstalleerd = true) {
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problemen.push(`${waar}: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && !/favicon|ERR_|WebGL/.test(m.text()) && problemen.push(`${waar}: ${m.text()}`));
  if (geinstalleerd) await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument((taal) => {
    try {
      localStorage.setItem('trainersapp.taal', taal);
    } catch {
      /* about:blank */
    }
  }, taal);
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobiel, hasTouch: mobiel });
  return page;
}

async function controleer(page, waar) {
  const r = await page.evaluate(() => ({
    breed: document.documentElement.scrollWidth - innerWidth,
    kap: [...document.querySelectorAll('button, .label, h1, h2, h3, .club-vak-kop span')]
      .filter((e) => {
        const s = getComputedStyle(e);
        return e.offsetParent && (s.overflow === 'hidden' || s.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 2;
      })
      .map((e) => e.innerText.slice(0, 30)),
    uit: [...document.querySelectorAll('.club-vak')].filter((e) => {
      const b = e.getBoundingClientRect();
      const v = e.closest('.club-veld').getBoundingClientRect();
      return b.right > v.right + 1 || b.bottom > v.bottom + 1;
    }).length,
  }));
  if (r.breed > 0) problemen.push(`${waar}: ${r.breed}px horizontaal scrollen`);
  if (r.kap.length) problemen.push(`${waar}: afgekapt: ${r.kap.join(' | ')}`);
  if (r.uit) problemen.push(`${waar}: ${r.uit} vakken buiten het veld`);
}

const tik = (page, tekst) => page.evaluate((tekst) => {
  const b = [...document.querySelectorAll('button, a')].find((x) => x.textContent.trim().includes(tekst));
  b?.click();
  return !!b;
}, tekst);

for (const taal of ['nl', 'en']) {
  const T = taal === 'nl'
    ? { nieuw: 'Nieuwe circuittraining', alles: 'Genereer alles', plan: 'Veldplan, rotatie', partij: 'Partij', rotatie: 'Rotatie', materiaal: 'Materiaal', timer: 'Rondetimer', start: 'Start', volgende: 'Volgende', stoppen: 'Stoppen', stations: 'Stations' }
    : { nieuw: 'New circuit session', alles: 'Generate all', plan: 'Pitch plan, rotation', partij: 'Games', rotatie: 'Rotation', materiaal: 'Equipment', timer: 'Round timer', start: 'Start', volgende: 'Next', stoppen: 'Stop', stations: 'Stations' };
  for (const [naam, w, h, mobiel] of FORMATEN) {
    const waar = `${taal} ${naam}`;
    const ctx = await browser.createBrowserContext();
    const page = await nieuw(ctx, taal, w, h, mobiel, waar);
    const foto = async (titel) => {
      await slaap(250);
      await controleer(page, `${waar} ${titel}`);
      const pad = `${MAP}club-${taal}-${naam}-${titel}.png`;
      await page.screenshot({ path: pad, fullPage: true });
      if (naam === 'se' && taal === 'nl') shots.push([pad, titel]);
      if (naam === 'laptop' && taal === 'en' && titel === 'stations') shots.push([pad, `laptop en · ${titel}`]);
    };
    const open = (pad) => page.goto(`${BASE}?r=${Math.random()}#${pad}`, { waitUntil: 'networkidle0' });

    // Leeg en terug: niet bewaard.
    await open('/club');
    await tik(page, T.nieuw);
    await slaap(200);
    await tik(page, 'Mini Talents');
    await slaap(200);
    await page.goBack();
    await slaap(300);
    const leeg = await page.evaluate(() => document.querySelectorAll('.training-regel').length);
    if (leeg !== 0) problemen.push(`${waar}: lege clubtraining blijft staan`);

    // Instellen en genereren.
    await tik(page, T.nieuw);
    await slaap(200);
    await tik(page, 'Mini Talents');
    await slaap(200);
    const id = await page.evaluate(() => location.hash.split('/')[2]);
    await page.type('.club-gegevens input', 'Mini Talents');
    await page.type('.club-gegevens textarea', 'Testtrainer 1\nTesttrainer 2\nTesttrainer 3');
    await tik(page, T.alles);
    await slaap(300);
    const blokken = await page.evaluate(() => document.querySelectorAll('.club-blok-oefening').length);
    if (blokken !== 4) problemen.push(`${waar}: ${blokken} blokken gevuld`);
    await foto('bewerken');
    const voor = await page.evaluate(() => document.querySelector('.club-blok-naam').textContent);
    await page.evaluate(() => document.querySelector('.club-oefening-acties button').click());
    await slaap(200);
    const na = await page.evaluate(() => document.querySelector('.club-blok-naam').textContent);
    if (voor === na) problemen.push(`${waar}: een andere oefening gaf dezelfde oefening`);

    // Oefening kiezen.
    await open(`/club/${id}/kiezen/techniek`);
    await foto('kiezen');
    const gekozen = await page.evaluate(() => {
      const kaart = [...document.querySelectorAll('.kies-kaart')].find((k) => !k.classList.contains('gekozen'));
      kaart.querySelector('.toevoeg-knop').click();
      return kaart.querySelector('.kaart-titel').textContent;
    });
    await slaap(300);
    await open(`/club/${id}`);
    const nu = await page.evaluate(() => [...document.querySelector('.club-blok').querySelectorAll('.club-blok-naam')].map((e) => e.textContent).join(' | '));
    if (!nu.includes(gekozen)) problemen.push(`${waar}: gekozen oefening niet bewaard (${nu})`);

    // Plan.
    await open(`/club/${id}/plan`);
    const stations = await page.evaluate(() => document.querySelectorAll('.club-vak').length);
    if (stations !== 6) problemen.push(`${waar}: ${stations} stations`);
    await foto('stations');
    await tik(page, T.partij);
    await slaap(200);
    const velden = await page.evaluate(() => document.querySelectorAll('.club-vak').length);
    if (velden !== 3) problemen.push(`${waar}: ${velden} partijvelden`);
    await foto('partij');
    await tik(page, T.rotatie);
    await foto('rotatie');
    await tik(page, T.materiaal);
    await slaap(200);
    await page.click('.club-afvink input');
    await foto('materiaal');
    await open(`/club/${id}/plan`);
    await tik(page, T.materiaal);
    await slaap(200);
    const afgevinkt = await page.evaluate(() => document.querySelectorAll('.club-afvink input:checked').length);
    if (afgevinkt !== 1) problemen.push(`${waar}: afvinken niet onthouden (${afgevinkt})`);

    // Timer.
    await open(`/club/${id}/timer`);
    await tik(page, T.start);
    await slaap(1300);
    const tijd = await page.evaluate(() => document.querySelector('.club-timer-tijd').textContent);
    if (!/^14:5\d$/.test(tijd)) problemen.push(`${waar}: timer staat op ${tijd}`);
    await tik(page, T.volgende);
    await slaap(400);
    await foto('timer');
    const ronde = await page.evaluate(() => document.querySelector('.club-timer-blok').textContent);
    if (!/2/.test(ronde)) problemen.push(`${waar}: timer niet naar ronde 2 (${ronde})`);
    await tik(page, T.stoppen);

    // Dupliceren naar volgende week.
    await open('/club');
    await page.click('.training-acties .icoon-knop:nth-child(2)');
    await slaap(300);
    const lijst = await page.evaluate(() => [...document.querySelectorAll('.rij-sub')].map((e) => e.textContent));
    if (lijst.length !== 2 || lijst[0] === lijst[1]) problemen.push(`${waar}: volgende week klopt niet (${lijst.join(' / ')})`);
    await foto('lijst');

    // Deellink ophalen uit de code in de app.
    if (taal === 'nl' && naam === 'se') {
      await open(`/club/${id}`);
      await page.evaluate(() => {
        navigator.share = undefined;
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: (t) => ((window.__link = t), Promise.resolve()) }, configurable: true });
      });
      await tik(page, 'Deel met trainers');
      await slaap(300);
      deellink = (await page.evaluate(() => window.__link ?? '')).split('\n').pop();
      if (!deellink.includes('#/c/')) problemen.push(`${waar}: geen deellink (${deellink})`);
      console.log(`Deellink: ${deellink.length} tekens`);
    }
    await ctx.close();
  }
}

// De link op een telefoon zonder de app en zonder inlog.
if (deellink) {
  const code = deellink.split('#')[1];
  const basis = `${BASE}?r=d`;
  for (const taal of ['nl', 'en']) {
    const ctx = await browser.createBrowserContext();
    const page = await nieuw(ctx, taal, 375, 667, true, `deellink ${taal}`, false);
    await page.setUserAgent(UA.android);
    await page.goto(`${basis}#${code}`, { waitUntil: 'networkidle0' });
    await slaap(400);
    await controleer(page, `deellink ${taal}`);
    const r = await page.evaluate(() => ({ poort: !!document.querySelector('.poort'), knoppen: document.querySelectorAll('.club-station-knoppen .knop').length, vakken: document.querySelectorAll('.club-vak').length, tabel: !!document.querySelector('.club-tabel') }));
    if (r.poort) problemen.push(`deellink ${taal}: installatiescherm`);
    if (r.knoppen !== 7 || r.vakken !== 9 || !r.tabel) problemen.push(`deellink ${taal}: ${JSON.stringify(r)}`);
    const pad = `${MAP}club-deel-${taal}.png`;
    await page.screenshot({ path: pad, fullPage: true });
    if (taal === 'nl') shots.push([pad, 'deellink']);
    await page.click('.club-station-knoppen .knop');
    await page.waitForSelector('.speler-vak', { timeout: 15000 }).catch(() => problemen.push(`deellink ${taal}: geen animatie`));
    await slaap(900);
    const s = await page.evaluate(() => ({ titel: document.querySelector('.kop-titel')?.textContent, knoppen: [...document.querySelectorAll('.speler-groep button')].map((b) => b.textContent), coach: document.querySelectorAll('.vinkjes li').length }));
    if (!s.knoppen.includes('3D') || !s.knoppen.includes('2D') || !s.coach) problemen.push(`deellink ${taal} station: ${JSON.stringify(s)}`);
    await controleer(page, `deellink ${taal} station`);
    const p2 = `${MAP}club-station-${taal}.png`;
    await page.screenshot({ path: p2, fullPage: true });
    if (taal === 'nl') shots.push([p2, 'station']);
    await ctx.close();
  }
}

// Ander aantal groepjes op de iPhone SE: veldplan en rotatie blijven passen.
for (const g of [3, 5, 8]) {
  const ctx = await browser.createBrowserContext();
  const page = await nieuw(ctx, 'nl', 375, 667, true, `${g} groepjes`);
  await page.goto(`${BASE}?r=g${g}#/club`, { waitUntil: 'networkidle0' });
  await tik(page, 'Nieuwe circuittraining');
  await slaap(200);
  await tik(page, 'Mini Talents');
  await slaap(200);
  await page.evaluate((g) => {
    const s = [...document.querySelectorAll('.club-gegevens .veld select')][0];
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, String(g));
    s.dispatchEvent(new Event('change', { bubbles: true }));
  }, g);
  await tik(page, 'Genereer alles');
  await slaap(300);
  const id = await page.evaluate(() => location.hash.split('/')[2]);
  await page.goto(`${BASE}?r=h${g}#/club/${id}/plan`, { waitUntil: 'networkidle0' });
  await slaap(300);
  await controleer(page, `${g} groepjes stations`);
  const pad = `${MAP}club-g${g}.png`;
  await page.screenshot({ path: pad, fullPage: true });
  shots.push([pad, `${g} groepjes`]);
  await tik(page, 'Partij');
  await slaap(250);
  await controleer(page, `${g} groepjes partij`);
  const p2 = `${MAP}club-g${g}-partij.png`;
  await page.screenshot({ path: p2, fullPage: true });
  shots.push([p2, `${g} groepjes partij`]);
  await ctx.close();
}

await blad(browser, shots, `${MAP}blad-club.png`, 6, 2600);
await browser.close();
console.log(problemen.length ? `Problemen:\n- ${[...new Set(problemen)].join('\n- ')}` : 'Geen problemen gevonden.');
