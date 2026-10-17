// 0.19.0 in de browser (telefoon en tablet met de vinger, laptop met de muis):
// - A1 Training maken → leeg → Training genereren → resultaat blijft bewaard (met automatische naam); gewone training
//   met alleen oefeningen blijft ook bewaard
// - A2 Aantallenfilter onthoudt de laatst gebruikte aantallen
// - A3 Nieuw tactiekbord met spelvorm en formaties (veld in de maat van de spelvorm), namen tonen, naam invullen
// - A4 Weggehaalde oefening: niet in de bibliotheek, wel te openen met melding, ook in een oude training
// - A5 Categorieën (steekproef)
// Screenshots: blad-019.png. Gebruik: node tools/e2e/versie-019.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, zetTijd } from './hulp.mjs';

const browser = await start();
const fouten = [];
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};
const TELEFOON = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const TABLET = { width: 820, height: 1180, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true };
const LAPTOP = { width: 1366, height: 820, deviceScaleFactor: 1 };

async function toestel(viewport) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('trainersapp.testEditor', '1');
    } catch {
      /* about:blank */
    }
  });
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => m.type() === 'error' && fouten.push(m.text()));
  page.on('dialog', (d) => void d.accept());
  await page.setViewport(viewport);
  return { context, page };
}
const ga = async (page, hash, r) => {
  await page.goto(`${BASE}?r=${r}${hash}`, { waitUntil: 'domcontentloaded' });
  await slaap(600);
};
const klik = async (page, tekst, selector = 'button') => {
  const ok = await page.evaluate(
    (tekst, selector) => {
      const el = [...document.querySelectorAll(selector)].find((b) => (b.textContent.trim().startsWith(tekst) || b.getAttribute('aria-label') === tekst) && !b.disabled);
      el?.click();
      return !!el;
    },
    tekst,
    selector,
  );
  if (!ok) problemen.push(`Knop "${tekst}" niet gevonden (${selector})`);
  await slaap(300);
};
const wachtOp = async (page, f, arg, wat, ms = 10000) => {
  try {
    await page.waitForFunction(f, { timeout: ms }, arg);
  } catch {
    problemen.push(`Wachten duurde te lang: ${wat}`);
  }
};
const shots = [];
const foto = async (page, naam, tekst, volledig = false) => {
  const pad = `${MAP}c-${naam}.png`;
  await page.screenshot({ path: pad, fullPage: volledig });
  shots.push([pad, tekst]);
};
const cdps = new Map();
async function tik(page, modus, [x, y]) {
  if (modus === 'muis') await page.mouse.click(x, y);
  else {
    if (!cdps.has(page)) cdps.set(page, await page.createCDPSession());
    const s = cdps.get(page);
    await s.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 0 }] });
    await slaap(40);
    await s.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  await slaap(200);
}
const trainingenOpslag = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.trainingen') ?? '{"trainingen":[]}').trainingen);

for (const [naam, vp, modus] of [
  ['telefoon', TELEFOON, 'vinger'],
  ['tablet', TABLET, 'vinger'],
  ['laptop', LAPTOP, 'muis'],
]) {
  const { context, page } = await toestel(vp);

  // ---------- A1 ----------
  await ga(page, '#/', `${naam}1`);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith('Training maken'))?.click());
  await wachtOp(page, () => /^#\/training\/[^/]+$/.test(location.hash), null, `${naam}: training maken`);
  await klik(page, 'Training genereren', '.leeg button');
  await wachtOp(page, () => location.hash.endsWith('/genereren'), null, `${naam}: genereren vanuit de training`);
  await slaap(400);
  controle(await page.evaluate(() => !document.body.innerText.includes('bestaat niet') && !!document.querySelector('.gen-kiezen')), `${naam}: genereren vanuit een training geeft "pagina bestaat niet"`);
  for (const [g, c] of [
    [0, 'Warming-up'],
    [1, 'Laag duiken'],
    [0, 'Spelletjes'],
  ])
    await page.evaluate((g, c) => [...document.querySelectorAll('.gen-groep')[g].querySelectorAll('button')].find((b) => b.textContent.trim() === c)?.click(), g, c);
  await klik(page, 'Genereren', '.knoppenrij button');
  await klik(page, 'Naar de training');
  await wachtOp(page, () => document.querySelectorAll('.onderdeel').length === 3, null, `${naam}: gegenereerde training`);
  await ga(page, '#/trainingen', `${naam}2`);
  let lijst = await trainingenOpslag(page);
  controle(lijst.length === 1 && /^Training \d+ \w+$/.test(lijst[0].naam) && lijst[0].oefeningen.length === 3, `${naam}: gegenereerde training bewaard: ${JSON.stringify(lijst.map((t) => [t.naam, t.oefeningen.length]))}`);
  if (naam === 'telefoon') await foto(page, 'trainingen', 'Gegenereerde training zonder naam: bewaard, met automatische naam');
  // Gewone training met alleen oefeningen.
  await klik(page, 'Training maken');
  await klik(page, 'Oefeningen toevoegen');
  await page.evaluate(() => document.querySelector('.toevoeg-knop')?.click());
  await slaap(300);
  await ga(page, '#/trainingen', `${naam}3`);
  lijst = await trainingenOpslag(page);
  controle(lijst.length === 2 && lijst.every((t) => t.naam && t.oefeningen.length), `${naam}: gewone training met alleen oefeningen: ${JSON.stringify(lijst.map((t) => [t.naam, t.oefeningen.length]))}`);

  // ---------- A2 ----------
  await ga(page, '#/veld/techniek', `${naam}4`);
  if (!(await page.evaluate(() => !!document.querySelector('.filter-paneel')))) await klik(page, 'Filters', '.filter-knop');
  await page.evaluate(() => document.querySelector('.filter-aantallen input[type="checkbox"]')?.click());
  await slaap(200);
  for (let i = 0; i < 5; i++) await page.evaluate(() => document.querySelector('.filter-aantallen [aria-label="Eén spelers minder"]')?.click());
  await page.evaluate(() => document.querySelector('.filter-aantallen input[type="checkbox"]')?.click());
  await slaap(200);
  await page.evaluate(() => document.querySelector('.filter-aantallen input[type="checkbox"]')?.click());
  await slaap(200);
  const aantal = await page.evaluate(() => document.querySelector('.filter-aantallen output')?.textContent);
  controle(aantal === '7', `${naam}: aantallenfilter onthoudt ${aantal} (verwacht 7)`);
  if (naam === 'telefoon') await foto(page, 'filter', 'Aantallenfilter: weer aangezet met de laatst gebruikte aantallen (7)');

  // ---------- A3 ----------
  await ga(page, '#/wedstrijd', `${naam}5`);
  await klik(page, 'Nieuw tactiekbord');
  await klik(page, '8 tegen 8', '.wedstrijd-paneel .gen-chip');
  await page.evaluate(() => {
    const groepen = document.querySelectorAll('.wedstrijd-paneel [role="radiogroup"]');
    [...groepen[1].querySelectorAll('button')].find((b) => b.textContent === '1-2-3-2')?.click();
    [...groepen[2].querySelectorAll('button')].find((b) => b.textContent === '1-3-2-2')?.click();
  });
  await slaap(200);
  if (naam === 'telefoon') await foto(page, 'nieuw-bord', 'Nieuw tactiekbord: spelvorm en formaties kiezen');
  await klik(page, 'Bord met beide teams maken');
  await wachtOp(page, () => location.hash.endsWith('/tekenen') && !!window.__editor, null, `${naam}: editor 8 tegen 8`);
  let t = await page.evaluate(() => window.__editor.tekening());
  controle(t.veld.breedte === 42.5 && t.veld.lengte === 64, `${naam}: veld 8 tegen 8 ${JSON.stringify(t.veld)}`);
  controle(t.objecten.filter((o) => o.soort === 'speler' || o.soort === 'keeper').length === 16, `${naam}: 16 personen op het bord`);
  // Naam invullen bij speler a2.
  const a2 = t.objecten.find((o) => o.id === 'a2');
  await tik(page, modus, await page.evaluate((p) => window.__editor.naarScherm(p), [a2.x, a2.y]));
  await wachtOp(page, () => !!document.querySelector('[aria-label="Naam van de speler"]'), null, `${naam}: naamveld in de editor`);
  await page.type('[aria-label="Naam van de speler"]', 'Sanne');
  await slaap(300);
  t = await page.evaluate(() => window.__editor.tekening());
  controle(t.objecten.find((o) => o.id === 'a2')?.naam === 'Sanne' && t.namen === true, `${naam}: naam in de editor`);
  if (naam === 'telefoon') await foto(page, 'editor-naam', 'Tactiekbord 8 tegen 8 in de editor: naam bij een speler');
  await klik(page, 'Klaar', '.editor-gegevens');
  await wachtOp(page, () => !!document.querySelector('.speler-vak'), null, `${naam}: bord`);
  controle(await page.evaluate(() => [...document.querySelectorAll('button[aria-pressed="true"]')].some((b) => b.textContent.includes('Namen verbergen'))), `${naam}: namen staan aan na invullen`);
  if (naam !== 'laptop') {
    await klik(page, '2D', '.speler-groep button');
    await slaap(400);
    if (naam === 'telefoon') await foto(page, 'bord-2d', 'Bord 8 tegen 8 (2D): rugnummers en de ingevulde naam');
  } else {
    await page.evaluate(() => localStorage.setItem('trainersapp.3dAltijd', '1'));
    await wachtOp(page, () => !!document.querySelector('.speler-canvas-3d'), null, 'laptop: 3D bord', 15000);
    await slaap(900);
    await foto(page, 'bord-3d', 'Bord 8 tegen 8 in 3D met naam');
  }
  await klik(page, 'Namen verbergen');
  controle(await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Namen tonen'))), `${naam}: namen verbergen`);
  // Vanuit een opstelling (namen uit de opstelling, veld 6 tegen 6).
  await page.evaluate(() => localStorage.setItem('trainersapp.spelersnamen', JSON.stringify(['Anna', 'Bram', 'Cas', 'Daan', 'Eva', 'Finn'])));
  await ga(page, '#/wedstrijd', `${naam}6`);
  await klik(page, 'Nieuwe opstelling');
  await klik(page, '6 tegen 6', '.gen-chip');
  await klik(page, 'Wissels op de lege posities zetten');
  await klik(page, 'Tactiekbord maken');
  await wachtOp(page, () => location.hash.endsWith('/tekenen') && !!window.__editor, null, `${naam}: bord uit opstelling`);
  t = await page.evaluate(() => window.__editor.tekening());
  controle(t.veld.breedte === 30 && t.objecten.filter((o) => o.naam).length === 6 && !t.namen, `${naam}: bord uit opstelling 6 tegen 6: ${JSON.stringify(t.veld)} namen ${t.objecten.filter((o) => o.naam).length}`);
  await klik(page, 'Klaar', '.editor-gegevens');
  await wachtOp(page, () => !!document.querySelector('.speler-vak'), null, `${naam}: bord uit opstelling`);
  await klik(page, 'Namen tonen');
  if (naam === 'tablet') {
    await klik(page, '2D', '.speler-groep button');
    await slaap(400);
    await foto(page, 'bord-opstelling', 'Tablet: bord uit een opstelling 6 tegen 6, namen aan (2D)');
  }

  // ---------- A4 ----------
  await ga(page, '#/veld/pass-en-trap', `${naam}7`);
  const namen = await page.evaluate(() => [...document.querySelectorAll('.kaart-titel')].map((x) => x.textContent));
  controle(!namen.includes('Derde man in de driehoek') && namen.length > 3, `${naam}: weggehaalde oefening staat nog in de lijst`);
  await ga(page, '#/oefening/veld-pt-derde-man', `${naam}8`);
  const melding = await page.evaluate(() => document.body.innerText);
  controle(/niet meer in de bibliotheek/i.test(melding) && melding.includes('Derde man in de driehoek'), `${naam}: weggehaalde oefening openen`);
  if (naam === 'telefoon') await foto(page, 'weg', 'Weggehaalde oefening via een oude link: inhoud en melding', true);
  await page.evaluate(() =>
    localStorage.setItem('trainersapp.trainingen', JSON.stringify({ versie: 1, trainingen: [{ id: 'oud', naam: 'Oude training', spelers: 8, keepers: 1, oefeningen: ['veld-pt-derde-man', 'keeper-bv-kommetje'], gemaakt: 1, gewijzigd: 1 }] })),
  );
  await ga(page, '#/training/oud', `${naam}9`);
  const regels = await page.evaluate(() => [...document.querySelectorAll('.onderdeel')].map((x) => x.textContent));
  controle(regels.length === 2 && regels.every((r) => /Niet meer in de bibliotheek/.test(r)), `${naam}: oude training met weggehaalde oefeningen: ${regels.join(' | ')}`);
  if (naam === 'telefoon') await foto(page, 'oude-training', 'Oude training met weggehaalde oefeningen');

  // ---------- A5 ----------
  await ga(page, '#/veld/loopcoordinatie', `${naam}10`);
  const lc = await page.evaluate(() => [...document.querySelectorAll('.kaart-titel')].map((x) => x.textContent));
  controle(lc.includes('Kleurenreactie in tweetallen') && lc.includes('Coördinatie-estafette'), `${naam}: loopcoördinatie: ${lc.join(', ')}`);
  await ga(page, '#/veld/techniek', `${naam}11`);
  const te = await page.evaluate(() => [...document.querySelectorAll('.kaart-titel')].map((x) => x.textContent));
  controle(te.includes('Kleurenreactie met bal') && te.includes('Hooghouden'), `${naam}: techniek: ${te.join(', ')}`);
  if (naam === 'laptop') {
    await ga(page, '#/oefening/veld-te-kleurenreactie-bal', 'kl');
    await wachtOp(page, () => !!document.querySelector('.speler-canvas-3d'), null, 'laptop: 3D kleurenreactie', 15000);
    await slaap(900);
    await zetTijd(page, 1.6);
    await foto(page, 'kleurenreactie', 'Nieuw: Kleurenreactie met bal (3D)');
  }
  await context.close();
}

await blad(browser, shots, `${MAP}blad-019.png`, 4, 2000);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)]);
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of problemen) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
