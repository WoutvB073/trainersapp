// Editor (eigen oefeningen) in de browser, als geïnstalleerde app, op telefoon en tablet (vinger) en laptop (muis):
// objecten plaatsen, slepen, draaien, maat veranderen, lijnen tekenen en buigen, ongedaan maken, zoomen (twee vingers /
// muiswiel), de pagina schuift niet mee, 3D bekijken, gegevens invullen, in de bibliotheek, in een training delen met een
// andere telefoon (eigen oefening gaat mee in de link), een ingebouwde oefening kopiëren (animatie vervalt na een vraag).
// Screenshots: blad-editor.png. Gebruik: node tools/e2e/editor.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start } from './hulp.mjs';

const browser = await start();
const fouten = [];
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};
const origin = new URL(BASE).origin;
await browser.defaultBrowserContext().overridePermissions(origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);

const TELEFOON = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const TABLET = { width: 820, height: 1180, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true };
const LAPTOP = { width: 1366, height: 820, deviceScaleFactor: 1 };

async function nieuwePagina(viewport, context = browser.defaultBrowserContext()) {
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
  return page;
}

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
  if (!ok) problemen.push(`Knop "${tekst}" niet gevonden`);
  await slaap(300);
};

const shots = [];
const foto = async (page, naam, tekst, volledig = false) => {
  const pad = `${MAP}editor-${naam}.png`;
  await page.screenshot({ path: pad, fullPage: volledig });
  shots.push([pad, tekst]);
};

// ---------- invoer: vinger (CDP, ook met twee vingers) of muis ----------
const cdps = new Map();
async function cdp(page) {
  if (!cdps.has(page)) cdps.set(page, await page.createCDPSession());
  return cdps.get(page);
}
async function vingers(page, type, punten) {
  await (await cdp(page)).send('Input.dispatchTouchEvent', { type, touchPoints: punten.map(([x, y], id) => ({ x, y, id })) });
}
const scherm = (page, p) => page.evaluate((p) => window.__editor.naarScherm(p), p);
const tekening = (page) => page.evaluate(() => window.__editor.tekening());
const handvatten = (page) => page.evaluate(() => window.__editor.handvatten());

async function tik(page, modus, [x, y]) {
  if (modus === 'muis') {
    await page.mouse.click(x, y);
  } else {
    await vingers(page, 'touchStart', [[x, y]]);
    await slaap(40);
    await vingers(page, 'touchEnd', []);
  }
  await slaap(120);
}
async function sleep(page, modus, [x0, y0], [x1, y1], stappen = 12) {
  if (modus === 'muis') {
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    for (let i = 1; i <= stappen; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / stappen, y0 + ((y1 - y0) * i) / stappen);
    await page.mouse.up();
  } else {
    await vingers(page, 'touchStart', [[x0, y0]]);
    for (let i = 1; i <= stappen; i++) {
      await vingers(page, 'touchMove', [[x0 + ((x1 - x0) * i) / stappen, y0 + ((y1 - y0) * i) / stappen]]);
      await slaap(16);
    }
    await vingers(page, 'touchEnd', []);
  }
  await slaap(150);
}
const veldTik = async (page, modus, p) => tik(page, modus, await scherm(page, p));
const veldSleep = async (page, modus, a, b) => sleep(page, modus, await scherm(page, a), await scherm(page, b));
async function plaats(page, modus, naam, punten) {
  await klik(page, 'Toevoegen', '.editor-balk button');
  await klik(page, naam, '.palet-item');
  for (const p of punten) await veldTik(page, modus, p);
  await klik(page, 'Klaar met plaatsen');
}
const bijna = (a, b, marge = 0.3) => Math.abs(a - b) <= marge;
const scroll = (page) => page.evaluate(() => [window.scrollY, document.scrollingElement.scrollTop, document.documentElement.scrollHeight <= window.innerHeight + 2]);

/** Tekenen op één toestel. Geeft de pagina terug (in de editor). */
async function teken(naam, viewport, modus) {
  const page = await nieuwePagina(viewport);
  await page.goto(`${BASE}?r=${naam}#/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.removeItem('trainersapp.eigen'));
  await page.goto(`${BASE}?r=${naam}2#/`, { waitUntil: 'networkidle0' });
  const tegel = await page.evaluate(() => [...document.querySelectorAll('.tegel-titel')].map((t) => t.textContent));
  controle(tegel.includes('Eigen oefeningen'), `${naam}: geen tegel Eigen oefeningen (${tegel.join(', ')})`);
  if (naam === 'telefoon') await foto(page, 'start', 'Startscherm met de tegel Eigen oefeningen', true);
  await klik(page, 'Nieuwe oefening');
  await klik(page, 'Beginnen met tekenen');
  await page.waitForSelector('.editor-canvas');
  await slaap(300);

  // Objecten plaatsen (leeg veld 30 × 20).
  await plaats(page, modus, 'Pion', [
    [5, 5],
    [25, 5],
    [5, 15],
    [25, 15],
  ]);
  await plaats(page, modus, 'Speler team A', [
    [8, 10],
    [20, 10],
  ]);
  await plaats(page, modus, 'Speler team B', [[14, 6]]);
  await plaats(page, modus, 'Bal', [[8.3, 10.3]]);
  await plaats(page, modus, 'Ladder', [[14, 15]]);
  let t = await tekening(page);
  const tel = (s) => t.objecten.filter((o) => o.soort === s).length;
  controle(tel('pion') === 4 && tel('speler') === 3 && tel('bal') === 1 && tel('ladder') === 1, `${naam}: geplaatst ${t.objecten.map((o) => o.soort).join(',')}`);
  controle(t.objecten.find((o) => o.soort === 'bal')?.bij === 'a1', `${naam}: bal hoort niet bij speler 1`);
  controle(JSON.stringify(t.objecten.filter((o) => o.soort === 'speler').map((o) => o.team + o.nummer)) === '["A1","A2","B1"]', `${naam}: nummers ${t.objecten.map((o) => o.nummer).join(',')}`);

  // Slepen: pion 1 van (5,5) naar (7,3).
  await klik(page, 'Kiezen', '.editor-balk button');
  await veldSleep(page, modus, [5, 5], [7, 3]);
  t = await tekening(page);
  const p1 = t.objecten.find((o) => o.id === 'p1');
  controle(bijna(p1.x, 7) && bijna(p1.y, 3), `${naam}: pion gesleept naar ${p1.x}, ${p1.y}`);

  // Ladder kiezen, draaien (handvat naar rechts = 90°) en langer maken.
  await veldTik(page, modus, [14, 15]);
  let h = await handvatten(page);
  controle(!!h.draai && !!h.maat, `${naam}: ladder heeft geen handvatten`);
  if (h.draai) await sleep(page, modus, await scherm(page, h.draai), await scherm(page, [17.5, 15]));
  t = await tekening(page);
  const ladder = () => t.objecten.find((o) => o.soort === 'ladder');
  controle(ladder().hoek === 90, `${naam}: ladder gedraaid naar ${ladder().hoek} (verwacht 90)`);
  h = await handvatten(page);
  if (h.maat) {
    // Eind van de ladder 3 m van het midden: 6 m lang.
    const r = [h.maat[0] - 14, h.maat[1] - 15];
    const l = Math.hypot(...r) || 1;
    await sleep(page, modus, await scherm(page, h.maat), await scherm(page, [14 + (r[0] / l) * 3, 15 + (r[1] / l) * 3]));
  }
  t = await tekening(page);
  controle(bijna(ladder().lengte, 6, 0.4), `${naam}: ladder lengte ${ladder().lengte} (verwacht 6)`);

  // Passlijn van speler 1 naar speler 2 (zit aan beide vast), dan buigen.
  await klik(page, 'Pass', '.editor-balk button');
  await veldSleep(page, modus, [8, 10], [20, 10]);
  t = await tekening(page);
  const lijn = () => t.lijnen?.[0];
  controle(lijn()?.van === 'a1' && lijn()?.naar === 'a2', `${naam}: lijn ${JSON.stringify(lijn())}`);
  h = await handvatten(page);
  if (h.midden) await sleep(page, modus, await scherm(page, h.midden), await scherm(page, [14, 13]));
  t = await tekening(page);
  controle(lijn()?.bocht && bijna(lijn().bocht[1], 13, 0.5), `${naam}: lijn niet gebogen ${JSON.stringify(lijn())}`);
  // Speler 2 verplaatsen: de lijn gaat mee (hij zit eraan vast).
  await klik(page, 'Kiezen', '.editor-balk button');
  await veldSleep(page, modus, [20, 10], [22, 8]);
  t = await tekening(page);
  const a2 = t.objecten.find((o) => o.id === 'a2');
  controle(bijna(a2.x, 22) && bijna(a2.y, 8) && lijn()?.naar === 'a2', `${naam}: speler 2 naar ${a2.x},${a2.y}, lijn ${JSON.stringify(lijn())}`);
  // Lijn kiezen voor de screenshot met handvatten.
  await veldTik(page, modus, [14, 13]);
  await foto(page, `${naam}-tekening`, `${naam}: pionnen, spelers, bal, gedraaide ladder, gebogen passlijn (handvatten)`);

  // Ongedaan maken en opnieuw.
  await klik(page, 'Ongedaan maken');
  t = await tekening(page);
  controle(bijna(t.objecten.find((o) => o.id === 'a2').x, 20), `${naam}: ongedaan maken zet speler 2 niet terug`);
  await klik(page, 'Opnieuw');
  t = await tekening(page);
  controle(bijna(t.objecten.find((o) => o.id === 'a2').x, 22), `${naam}: opnieuw werkt niet`);

  // Zoomen: twee vingers uit elkaar of het muiswiel; de pagina schuift niet.
  const voor = await page.evaluate(() => window.__editor.beeld());
  const [cx, cy] = await scherm(page, [15, 10]);
  if (modus === 'muis') {
    await page.mouse.move(cx, cy);
    for (let i = 0; i < 4; i++) await page.mouse.wheel({ deltaY: -150 });
  } else {
    await vingers(page, 'touchStart', [
      [cx - 30, cy],
      [cx + 30, cy],
    ]);
    for (let i = 1; i <= 10; i++) {
      await vingers(page, 'touchMove', [
        [cx - 30 - i * 8, cy],
        [cx + 30 + i * 8, cy],
      ]);
      await slaap(16);
    }
    await vingers(page, 'touchEnd', []);
  }
  await slaap(200);
  const na = await page.evaluate(() => window.__editor.beeld());
  controle(na.breedte < voor.breedte * 0.75, `${naam}: zoomen werkt niet (${voor.breedte.toFixed(1)} → ${na.breedte.toFixed(1)} m)`);
  const s = await scroll(page);
  controle(s[0] === 0 && s[1] === 0, `${naam}: pagina is gescrold tijdens het tekenen (${s.join(', ')})`);
  t = await tekening(page);
  controle(t.objecten.length === 9, `${naam}: zoomen heeft iets veranderd aan de tekening`);
  await foto(page, `${naam}-zoom`, `${naam}: ingezoomd (${modus === 'muis' ? 'muiswiel' : 'twee vingers'})`);
  await klik(page, 'Heel veld in beeld');
  return page;
}

// ---------- telefoon: alles ----------
let page = await teken('telefoon', TELEFOON, 'vinger');

// Toevoegen-paneel.
await klik(page, 'Toevoegen', '.editor-balk button');
await slaap(300);
const items = await page.evaluate(() => [...document.querySelectorAll('.palet-item')].map((b) => b.textContent.trim()));
for (const n of ['Groot goal', 'Klein goal', 'Jeugdgoal', 'Pion', 'Hoedje', 'Paaltje', 'Stok', 'Ladder', 'Horde laag', 'Horde hoog', 'Ring', 'Bank', 'Pop / dummy', 'Rebounder', 'Net', 'Lint', 'Keepersmat', 'Landingskussen', 'Vak / zone', 'Bal', 'Speler team A', 'Speler team B', 'Joker', 'Keeper', 'Trainer', 'Tekst'])
  controle(items.includes(n), `Toevoegen: "${n}" ontbreekt`);
await foto(page, 'palet', 'Toevoegen: alle objecten');
await klik(page, 'Sluiten', '.paneel button');

// Vak met kleur en een tekstlabel.
await plaats(page, 'vinger', 'Vak / zone', [[15, 10]]);
await veldTik(page, 'vinger', [19.5, 6]);
let t = await tekening(page);
const zone = t.objecten.find((o) => o.soort === 'zone');
controle(!!zone, 'Geen vak geplaatst');
await page.evaluate(() => {
  const s = window.__editor.tekening().objecten.find((o) => o.soort === 'zone');
  void s;
});
await klik(page, 'Kleur #3fa9f5');
t = await tekening(page);
controle(t.objecten.find((o) => o.soort === 'zone')?.kleur === '#3fa9f5', `Vak kreeg geen kleur (${JSON.stringify(t.objecten.find((o) => o.soort === 'zone'))})`);

// 3D bekijken.
await klik(page, 'Bekijken in 3D');
await page.waitForSelector('.paneel .speler-canvas', { timeout: 15000 }).catch(() => problemen.push('3D-weergave verschijnt niet'));
await slaap(1500);
await foto(page, '3d', 'Bekijken in 3D (stilstaand, draaien en camerastanden)');
await klik(page, 'Sluiten', '.paneel button');

// Gegevens.
await klik(page, 'Gegevens');
await page.waitForSelector('.formulier');
await klik(page, 'Opslaan');
const fout = await page.evaluate(() => document.querySelector('.waarschuwing')?.textContent ?? '');
controle(fout.includes('naam') && fout.includes('categorie'), `Opslaan zonder naam/categorie: "${fout}"`);
await page.type('.formulier input', 'Passen rond de ladder');
await klik(page, 'Techniek', '.chips button');
await klik(page, 'Pass en trap', '.chips button');
const voorstel = await page.evaluate(() => document.querySelector('.formulier textarea:nth-of-type(1)') && [...document.querySelectorAll('.formulier textarea')][2].value);
controle(voorstel.includes('4 pionnen') && voorstel.includes('1 loopladder') && voorstel.includes('1 bal') && voorstel.includes('Hesjes'), `Benodigdheden-voorstel: ${JSON.stringify(voorstel)}`);
await page.type('.formulier textarea', 'Speler 1 passt rond de ladder naar speler 2, speler 4 zet druk.');
await foto(page, 'gegevens', 'Gegevens: naam, categorieën, voorstel benodigdheden', true);
await klik(page, 'Opslaan');
await slaap(500);
controle(page.url().includes('#/oefening/eigen-'), `Na opslaan: ${page.url()}`);
const detail = await page.evaluate(() => ({ titel: document.querySelector('.detail-titel')?.textContent, labels: [...document.querySelectorAll('.label')].map((l) => l.textContent) }));
controle(detail.titel === 'Passen rond de ladder' && detail.labels.includes('Eigen') && detail.labels.includes('3+ spelers'), `Detail: ${JSON.stringify(detail)}`);
await slaap(1200);
await foto(page, 'detail', 'Detailpagina van de eigen oefening (badge Eigen)', true);

// In de bibliotheek.
await page.goto(`${BASE}?r=b#/veld/techniek`, { waitUntil: 'networkidle0' });
const inLijst = await page.evaluate(() => [...document.querySelectorAll('.kaart')].some((k) => k.textContent.includes('Passen rond de ladder') && k.textContent.includes('Eigen')));
controle(inLijst, 'Eigen oefening staat niet in Veld → Techniek');

// Training met de eigen oefening, delen, ontvanger op een andere telefoon.
await page.goto(`${BASE}?r=c#/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.removeItem('trainersapp.trainingen'));
await klik(page, 'Training maken');
await klik(page, 'Oefeningen toevoegen');
await klik(page, 'Techniek', '.chips button');
const toegevoegd = await page.evaluate(() => {
  const k = [...document.querySelectorAll('.kies-kaart')].find((x) => x.textContent.includes('Passen rond de ladder'));
  k?.querySelector('.toevoeg-knop')?.click();
  return !!k;
});
controle(toegevoegd, 'Eigen oefening niet te kiezen in Training maken');
await page.evaluate(() => document.querySelector('.toevoeg-knop:not(.aan)')?.click());
await slaap(200);
await klik(page, 'Klaar');
await page.evaluate(() => {
  navigator.share = undefined;
});
await klik(page, 'Delen');
await slaap(300);
const link = await page.evaluate(() => navigator.clipboard.readText());
controle(link.includes('#/t/'), `Geen deellink: ${link.slice(0, 80)}`);
const anderToestel = await browser.createBrowserContext();
const ontvanger = await nieuwePagina(TELEFOON, anderToestel);
await ontvanger.goto(link.replace(/^https?:\/\/[^/]+\/trainersapp\//, BASE), { waitUntil: 'networkidle0' });
await slaap(500);
const ontvangen = await ontvanger.evaluate(() => [...document.querySelectorAll('.onderdeel-naam')].map((x) => x.textContent));
controle(ontvangen.includes('Passen rond de ladder') && ontvangen.length === 2, `Ontvanger ziet: ${ontvangen.join(' | ')}`);
await foto(ontvanger, 'gedeeld', 'Andere telefoon opent de link: eigen oefening zit erin', true);
await klik(ontvanger, 'Opslaan in mijn trainingen');
await slaap(400);
const bijOntvanger = await ontvanger.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.eigen') ?? '{}').oefeningen?.map((o) => o.naam) ?? []);
controle(bijOntvanger.length === 1 && bijOntvanger[0] === 'Passen rond de ladder', `Eigen oefening bij ontvanger: ${bijOntvanger.join(', ')}`);
await klik(ontvanger, 'Start training');
await slaap(1200);
const modusTitel = await ontvanger.evaluate(() => document.querySelector('.detail-titel')?.textContent);
controle(!!modusTitel, 'Trainingsmodus bij de ontvanger opent niet');
await anderToestel.close();

// Ingebouwde oefening kopiëren: animatie blijft tot je iets verschuift. (Nieuwe pagina op hetzelfde toestel.)
await page.close();
page = await nieuwePagina(TELEFOON);
await page.goto(`${BASE}?r=d#/oefening/veld-ps-rondo-4-2`, { waitUntil: 'networkidle0' });
await klik(page, 'Kopiëren naar eigen oefeningen');
await page.waitForSelector('.editor-canvas');
await slaap(400);
t = await tekening(page);
controle((t.animatie?.length ?? 0) > 0, 'Kopie heeft geen animatie meer');
const melding = await page.evaluate(() => document.querySelector('.editor-melding')?.textContent ?? '');
controle(melding.includes('animatie'), `Geen melding over de animatie: "${melding}"`);
const speler = t.objecten.find((o) => o.soort === 'speler' && o.team === 'B');
await veldSleep(page, 'vinger', [speler.x, speler.y], [speler.x + 1.5, speler.y + 1]);
const vraag = await page.evaluate(() => document.querySelector('.paneel-vraag h2')?.textContent ?? '');
controle(vraag.includes('Animatie'), `Geen vraag voor het vervallen van de animatie: "${vraag}"`);
await foto(page, 'kopie-vraag', 'Kopie van "Rondo 4 tegen 2": eerst vragen of de animatie mag vervallen');
await klik(page, 'Ja, aanpassen');
t = await tekening(page);
controle(!t.animatie && t.objecten.find((o) => o.id === speler.id), `Na "Ja": animatie ${t.animatie?.length}`);
await veldSleep(page, 'vinger', [speler.x, speler.y], [speler.x + 1.5, speler.y + 1]);
t = await tekening(page);
const verplaatst = t.objecten.find((o) => o.id === speler.id);
controle(bijna(verplaatst.x, speler.x + 1.5, 0.4), `Kopie: speler niet verplaatst (${verplaatst.x})`);
await foto(page, 'kopie', 'Kopie zonder animatie, verdediger verschoven');

// Eigen oefeningen: lijst, dupliceren, verwijderen.
await page.goto(`${BASE}?r=e#/eigen`, { waitUntil: 'networkidle0' });
let regels = await page.evaluate(() => document.querySelectorAll('.eigen-regel').length);
controle(regels === 2, `Eigen oefeningen: ${regels} (verwacht 2)`);
await page.evaluate(() => document.querySelector('[aria-label$="dupliceren"]')?.click());
await slaap(300);
regels = await page.evaluate(() => document.querySelectorAll('.eigen-regel').length);
controle(regels === 3, `Na dupliceren: ${regels}`);
await foto(page, 'lijst', 'Eigen oefeningen: lijst met bewerken, dupliceren, verwijderen', true);
await page.evaluate(() => document.querySelector('[aria-label$="verwijderen"]')?.click());
await slaap(300);
regels = await page.evaluate(() => document.querySelectorAll('.eigen-regel').length);
controle(regels === 2, `Na verwijderen: ${regels}`);
await page.close();

// ---------- tablet en laptop: tekenen ----------
for (const [naam, vp, modus] of [
  ['tablet', TABLET, 'vinger'],
  ['laptop', LAPTOP, 'muis'],
]) {
  const p = await teken(naam, vp, modus);
  await p.close();
}

await blad(browser, shots, `${MAP}blad-editor.png`, 4, 1800);
await browser.close();

if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)]);
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of problemen) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
