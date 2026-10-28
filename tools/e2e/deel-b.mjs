// Deel B (0.18.0) in de browser, als geïnstalleerde app, op telefoon en tablet (vinger) en laptop (muis):
// - Wedstrijd-tegel en overzicht
// - B1 Opstelling: spelvorm/formatie, spelers van de bank op posities slepen, tikken, ruilen, naar de bank, positie vrij
//   verslepen, wissels automatisch neerzetten, namen onthouden, dupliceren, delen via een link (en openen op een ander toestel)
// - B2 Tactiekbord: vanuit een opstelling, lijnen tekenen in de editor, lijnen wissen, afspelen in 2D en 3D
// - B3 Spelhervattingen: beginsituatie (vrije trap) en voorbeeld (corner eerste paal) dat afspeelt
// Screenshots: blad-deel-b.png. Gebruik: node tools/e2e/deel-b.mjs [basis-url]
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
const NAMEN = ['Anna', 'Bram', 'Cas', 'Daan', 'Eva', 'Finn', 'Gijs', 'Hugo', 'Ilse', 'Jens', 'Kim', 'Lars', 'Mila'];

async function toestel(viewport) {
  const context = await browser.createBrowserContext();
  await context.overridePermissions(new URL(BASE).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
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
  const pad = `${MAP}b-${naam}.png`;
  await page.screenshot({ path: pad, fullPage: volledig });
  shots.push([pad, tekst]);
};

// ---------- invoer ----------
const cdps = new Map();
async function cdp(page) {
  if (!cdps.has(page)) cdps.set(page, await page.createCDPSession());
  return cdps.get(page);
}
async function vingers(page, type, punten) {
  await (await cdp(page)).send('Input.dispatchTouchEvent', { type, touchPoints: punten.map(([x, y], id) => ({ x, y, id })) });
}
async function sleep(page, modus, [x0, y0], [x1, y1], stappen = 14) {
  if (modus === 'muis') {
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    for (let i = 1; i <= stappen; i++) {
      await page.mouse.move(x0 + ((x1 - x0) * i) / stappen, y0 + ((y1 - y0) * i) / stappen);
      await slaap(16);
    }
    await page.mouse.up();
  } else {
    await vingers(page, 'touchStart', [[x0, y0]]);
    for (let i = 1; i <= stappen; i++) {
      await vingers(page, 'touchMove', [[x0 + ((x1 - x0) * i) / stappen, y0 + ((y1 - y0) * i) / stappen]]);
      await slaap(20);
    }
    await vingers(page, 'touchEnd', []);
  }
  await slaap(300);
}
async function tik(page, modus, [x, y]) {
  if (modus === 'muis') await page.mouse.click(x, y);
  else {
    await vingers(page, 'touchStart', [[x, y]]);
    await slaap(40);
    await vingers(page, 'touchEnd', []);
  }
  await slaap(200);
}
/** Midden van een element (na het in beeld scrollen); `voor` = alleen meten, niet scrollen. */
const midden = (page, selector, scroll = true) =>
  page.evaluate(
    (selector, scroll) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      if (scroll) el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return [r.x + r.width / 2, r.y + r.height / 2];
    },
    selector,
    scroll,
  );
const opstelling = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.opstellingen') ?? '{"lijst":[]}').lijst[0]);
const naamOp = (o, plek) => o?.plekken.find((p) => p.id === plek)?.naam;

// Editor (testhaakje)
const scherm = (page, p) => page.evaluate((p) => window.__editor.naarScherm(p), p);
const tekening = (page) => page.evaluate(() => window.__editor.tekening());

let gedeeldeLink = null;

for (const [naam, vp, modus] of [
  ['telefoon', TELEFOON, 'vinger'],
  ['tablet', TABLET, 'vinger'],
  ['laptop', LAPTOP, 'muis'],
]) {
  const { context, page } = await toestel(vp);
  await ga(page, '#/', `${naam}0`);
  await page.evaluate((namen) => localStorage.setItem('trainersapp.spelersnamen', JSON.stringify(namen)), NAMEN);
  await ga(page, '#/', `${naam}1`);
  controle(await page.evaluate(() => [...document.querySelectorAll('.tegel-titel')].some((t) => t.textContent === 'Wedstrijd')), `${naam}: tegel Wedstrijd`);
  await page.evaluate(() => document.querySelector('.tegel-wedstrijd')?.click());
  await wachtOp(page, () => location.hash === '#/wedstrijd', null, `${naam}: naar Wedstrijd`);
  if (naam === 'telefoon') await foto(page, 'overzicht-leeg', 'Wedstrijd: opstellingen, tactiekborden, spelhervattingen');

  // ---------- B1 opstelling ----------
  await klik(page, 'Nieuwe opstelling');
  await wachtOp(page, () => location.hash.startsWith('#/opstelling/') && document.querySelectorAll('.opst-plek').length === 11, null, `${naam}: opstelling 11 tegen 11`);
  let o = await opstelling(page);
  controle(o?.spelvorm === '11v11' && o.formatie === '1-4-3-3' && o.wissels.length === 13, `${naam}: nieuwe opstelling ${o?.spelvorm} ${o?.formatie} wissels ${o?.wissels.length}`);
  // Slepen: Anna van de bank naar positie 1 (keeper).
  let van = await midden(page, '[data-naam="Anna"]');
  let naar = await midden(page, '[data-plek="p1"]', false);
  // Na scrollen opnieuw meten (beide in dezelfde stand).
  naar = await midden(page, '[data-plek="p1"]', false);
  van = await midden(page, '[data-naam="Anna"]', false);
  if (naar[1] < 0 || naar[1] > vp.height) {
    await page.evaluate(() => document.querySelector('.opst-veld').scrollIntoView({ block: 'end' }));
    van = await midden(page, '[data-naam="Anna"]', false);
    naar = await midden(page, '[data-plek="p1"]', false);
  }
  await sleep(page, modus, van, naar);
  o = await opstelling(page);
  controle(naamOp(o, 'p1') === 'Anna' && !o.wissels.includes('Anna'), `${naam}: slepen bank → positie 1: ${naamOp(o, 'p1')}`);
  // Tikken: Bram en dan positie 2.
  await tik(page, modus, await midden(page, '[data-naam="Bram"]'));
  controle(await page.evaluate(() => !!document.querySelector('.opst-wissel.gekozen')), `${naam}: Bram niet gekozen`);
  await tik(page, modus, await midden(page, '[data-plek="p2"]'));
  o = await opstelling(page);
  controle(naamOp(o, 'p2') === 'Bram', `${naam}: tikken bank → positie 2: ${naamOp(o, 'p2')}`);
  // Automatisch neerzetten.
  await klik(page, 'Wissels op de lege posities zetten');
  o = await opstelling(page);
  controle(o.plekken.every((p) => p.naam) && o.wissels.length === 2, `${naam}: wissels neerzetten: ${o.wissels.length} op de bank`);
  // Ruilen: speler van positie 3 naar positie 4.
  const voor3 = naamOp(o, 'p3');
  const voor4 = naamOp(o, 'p4');
  await page.evaluate(() => document.querySelector('.opst-veld').scrollIntoView({ block: 'center' }));
  await sleep(page, modus, await midden(page, '[data-plek="p3"]', false), await midden(page, '[data-plek="p4"]', false));
  o = await opstelling(page);
  controle(naamOp(o, 'p3') === voor4 && naamOp(o, 'p4') === voor3, `${naam}: ruilen 3 ↔ 4: ${naamOp(o, 'p3')} / ${naamOp(o, 'p4')}`);
  // Naar de bank: positie 5 slepen op de wissels.
  const voor5 = naamOp(o, 'p5');
  await page.evaluate(() => document.querySelector('.opst-bank').scrollIntoView({ block: 'end' }));
  await sleep(page, modus, await midden(page, '[data-plek="p5"]', false), await midden(page, '.opst-bank', false));
  o = await opstelling(page);
  controle(!naamOp(o, 'p5') && o.wissels.includes(voor5), `${naam}: positie 5 naar de bank (${voor5})`);
  // Lege positie 5 vrij verslepen.
  const oud5 = o.plekken.find((p) => p.id === 'p5');
  await page.evaluate(() => document.querySelector('.opst-veld').scrollIntoView({ block: 'center' }));
  const p5 = await midden(page, '[data-plek="p5"]', false);
  await sleep(page, modus, p5, [p5[0] + 40, p5[1] - 50]);
  o = await opstelling(page);
  const nieuw5 = o.plekken.find((p) => p.id === 'p5');
  controle(nieuw5.x > oud5.x && nieuw5.y < oud5.y, `${naam}: positie 5 verslepen ${JSON.stringify(oud5)} → ${JSON.stringify(nieuw5)}`);
  if (naam !== 'laptop') await foto(page, 'opstelling', `${naam}: opstelling 11 tegen 11 (slepen, ruilen, wissels)`, naam === 'telefoon');
  // Formatie en spelvorm.
  await klik(page, '1-4-4-2', '.gen-chip');
  o = await opstelling(page);
  controle(o.formatie === '1-4-4-2' && o.plekken.filter((p) => p.naam).length === 10, `${naam}: formatie 1-4-4-2 (${o.plekken.filter((p) => p.naam).length} spelers)`);
  await klik(page, '8 tegen 8', '.gen-chip');
  o = await opstelling(page);
  controle(o.spelvorm === '8v8' && o.plekken.length === 8 && o.formatie === '1-3-3-1', `${naam}: 8 tegen 8 ${o.plekken.length}`);
  if (naam === 'tablet') await foto(page, 'opstelling-8', 'Tablet: 8 tegen 8 (veld schaalt mee)');
  // Nieuwe speler (onthouden).
  await page.type('[aria-label="Naam van de speler"]', 'Noor');
  await klik(page, 'Toevoegen', '.team-form button');
  o = await opstelling(page);
  const onthouden = await page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.spelersnamen')));
  controle(o.wissels.includes('Noor') && onthouden.includes('Noor'), `${naam}: Noor toevoegen (bank en lijst)`);
  await klik(page, '11 tegen 11', '.gen-chip');
  await page.type('.training-gegevens input:not([type])', 'Zaterdag');
  await slaap(300);
  if (naam === 'laptop') await foto(page, 'opstelling-laptop', 'Laptop: opstelling met spelvorm, formatie en spelers ernaast');
  // Delen (link gekopieerd).
  if (naam === 'laptop') {
    await page.evaluate(() => {
      navigator.share = undefined;
    });
    await klik(page, 'Delen', '.knoppenrij button');
    gedeeldeLink = await page.evaluate(() => navigator.clipboard.readText());
    controle(/#\/w\/[A-Za-z0-9_-]+$/.test(gedeeldeLink ?? ''), `deellink opstelling: ${gedeeldeLink}`);
  }
  // Dupliceren.
  await klik(page, 'Dupliceren', '.knoppenrij button');
  const aantalOps = await page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.opstellingen')).lijst.length);
  controle(aantalOps === 2, `${naam}: dupliceren → ${aantalOps} opstellingen`);

  // ---------- B2 tactiekbord vanuit de opstelling ----------
  await klik(page, 'Tactiekbord maken');
  await wachtOp(page, () => location.hash.endsWith('/tekenen') && !!window.__editor, null, `${naam}: editor tactiekbord`);
  let t = await tekening(page);
  controle(t.objecten.filter((x) => x.soort === 'speler').length === 20 && t.objecten.some((x) => x.soort === 'bal'), `${naam}: bord vanuit opstelling ${t.objecten.length} objecten`);
  const a11 = t.objecten.find((x) => x.id === 'a11');
  const a10 = t.objecten.find((x) => x.id === 'a10');
  await klik(page, 'Lopen', '.editor-balk button');
  await sleep(page, modus, await scherm(page, [a11.x, a11.y]), await scherm(page, [a11.x + 6, a11.y - 12]));
  await klik(page, 'Dribbel', '.editor-balk button');
  await sleep(page, modus, await scherm(page, [a10.x, a10.y]), await scherm(page, [a10.x - 6, a10.y - 10]));
  t = await tekening(page);
  controle(t.lijnen.length === 2, `${naam}: lijnen getekend: ${t.lijnen.length}`);
  await klik(page, 'Lijnen wissen');
  t = await tekening(page);
  controle(t.lijnen.length === 0, `${naam}: lijnen wissen in de editor: ${t.lijnen.length}`);
  await klik(page, 'Lopen', '.editor-balk button');
  await sleep(page, modus, await scherm(page, [a11.x, a11.y]), await scherm(page, [a11.x + 8, a11.y - 14]));
  if (naam === 'telefoon') await foto(page, 'bord-editor', 'Tactiekbord vanuit de opstelling in de editor (zelfde editor, knop Lijnen wissen)');
  await klik(page, 'Klaar', '.editor-gegevens');
  await wachtOp(page, () => location.hash.startsWith('#/bord/') && !location.hash.endsWith('/tekenen'), null, `${naam}: terug naar het bord`);
  await wachtOp(page, () => Number(document.querySelector('.speler-balk')?.max ?? 0) > 0, null, `${naam}: bord speelt af`);
  if (naam === 'laptop') {
    await page.evaluate(() => localStorage.setItem('trainersapp.3dAltijd', '1'));
    await wachtOp(page, () => !!document.querySelector('.speler-canvas-3d'), null, 'laptop: 3D bord', 15000);
    await slaap(1000);
    await zetTijd(page, 1.2);
    await foto(page, 'bord-3d', 'Laptop: tactiekbord afspelen in 3D');
  }

  // ---------- B3 spelhervattingen ----------
  await ga(page, '#/wedstrijd', `${naam}2`);
  await klik(page, 'Nieuwe spelhervatting');
  if (naam === 'telefoon') await foto(page, 'hervatting-kiezen', 'Nieuwe spelhervatting: beginsituaties en voorbeelden');
  // 0.29.0: de voorbeelden staan in de bibliotheek (Voorbeeldhervatting → lijst → voorbeeld → eigen bord).
  await klik(page, 'Kies een voorbeeldhervatting', '.keuze-kaart');
  await wachtOp(page, () => location.hash === '#/hervattingen', null, `${naam}: lijst voorbeeldhervattingen`);
  await klik(page, 'Corner op de eerste paal', '.rij');
  await wachtOp(page, () => location.hash.startsWith('#/hervatting/') && !!document.querySelector('.speler-balk'), null, `${naam}: voorbeeld corner`);
  await klik(page, 'Opslaan als eigen bord');
  await wachtOp(page, () => location.hash.startsWith('#/bord/') && Number(document.querySelector('.speler-balk')?.max ?? 0) > 2, null, `${naam}: voorbeeld corner speelt af`);
  if (naam !== 'laptop') {
    await klik(page, '2D', '.speler-groep button');
    await slaap(300);
    const max = await page.evaluate(() => Number(document.querySelector('.speler-balk').max));
    await zetTijd(page, max * 0.62);
    if (naam === 'telefoon') await foto(page, 'corner-2d', 'Voorbeeld: corner op de eerste paal (2D)');
  } else {
    await wachtOp(page, () => !!document.querySelector('.speler-canvas-3d'), null, 'laptop: 3D corner', 15000);
    await slaap(900);
    const max = await page.evaluate(() => Number(document.querySelector('.speler-balk').max));
    await zetTijd(page, max * 0.6);
    await slaap(300);
    await foto(page, 'corner-3d', 'Voorbeeld: corner op de eerste paal (3D)');
  }
  await ga(page, '#/wedstrijd', `${naam}3`);
  await klik(page, 'Nieuwe spelhervatting');
  await klik(page, 'Vrije trap 25 m', '.gen-chip');
  await wachtOp(page, () => location.hash.endsWith('/tekenen') && !!window.__editor, null, `${naam}: editor vrije trap`);
  t = await tekening(page);
  controle(t.objecten.filter((x) => x.team === 'B').length >= 6 && t.objecten.some((x) => x.soort === 'keeper'), `${naam}: vrije trap: muurtje en keeper`);
  if (naam === 'tablet') await foto(page, 'vrije-trap', 'Beginsituatie vrije trap 25 m in de editor');
  await ga(page, '#/wedstrijd', `${naam}4`);
  const lijsten = await page.evaluate(() => [...document.querySelectorAll('.wedstrijd-deel')].map((d) => d.querySelectorAll('li').length));
  controle(lijsten.join(',') === '2,1,2', `${naam}: overzicht ${lijsten.join(',')} (verwacht 2 opstellingen, 1 bord, 2 hervattingen)`);
  if (naam === 'telefoon') await foto(page, 'overzicht', 'Wedstrijd: overzicht met opgeslagen opstellingen en borden', true);
  await context.close();
}

// Gedeelde opstelling openen op een ander toestel.
if (gedeeldeLink) {
  const { context, page } = await toestel(TELEFOON);
  const hash = gedeeldeLink.slice(gedeeldeLink.indexOf('#'));
  await ga(page, hash, 'gedeeld');
  await wachtOp(page, () => document.querySelectorAll('.opst-plek').length === 11, null, 'gedeelde opstelling');
  const titel = await page.evaluate(() => document.querySelector('.detail-titel')?.textContent);
  controle(titel === 'Zaterdag', `gedeelde opstelling: titel ${titel}`);
  await foto(page, 'gedeeld', 'Gedeelde opstelling openen op een andere telefoon', true);
  await klik(page, 'Opslaan bij mijn wedstrijd');
  await wachtOp(page, () => location.hash.startsWith('#/opstelling/'), null, 'gedeelde opstelling opslaan');
  const n = await page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.opstellingen')).lijst.length);
  controle(n === 1, `gedeelde opstelling opgeslagen: ${n}`);
  await context.close();
}

await blad(browser, shots, `${MAP}blad-deel-b.png`, 4, 2000);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)]);
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of problemen) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
