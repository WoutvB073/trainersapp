// Deel A (0.17.0) in de browser, als geïnstalleerde app, op telefoon en tablet (vinger) en laptop (muis):
// - A1 Training maken: 4 spelers en 1 keeper, datumveld even breed als de naam, lege training niet bewaard (ook oude opgeruimd)
// - A2 Training genereren: onderdelen aantikken, slepen, genereren, "Andere oefening", alles opnieuw, geen passende oefening,
//   resultaat is een gewone training (ook "Andere oefening" daar)
// - A3 Looplijnen in de animatie standaard uit, knop aan/uit (onthouden), pass- en dribbellijnen blijven
// - A4 Doelnet: palet in de editor (hangt in het goal), schot door een gat en terugkaatsen, in 2D en 3D
// - A5/A6 "Spelers" in plaats van "Veld", geen Combinatievorm meer
// - A7 Exporteren (bestand) en importeren op een ander toestel (samenvoegen, nog eens = niets dubbel)
// Screenshots: blad-deel-a.png. Gebruik: node tools/e2e/deel-a.mjs [basis-url]
import { mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
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

// Een ingebouwde combinatievorm (om te zien dat het woord weg is maar het verloop blijft).
const COMBI = (() => {
  const map = path.join(MAP, '..', '..', 'src', 'data', 'oefeningen');
  for (const soort of ['veld', 'keepers'])
    for (const f of readdirSync(path.join(map, soort))) {
      const o = JSON.parse(readFileSync(path.join(map, soort, f), 'utf8')).find((x) => x.combinatievorm);
      if (o) return o.id;
    }
  return null;
})();

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
  const pad = `${MAP}a-${naam}.png`;
  await page.screenshot({ path: pad, fullPage: volledig });
  shots.push([pad, tekst]);
};

// ---------- invoer: vinger (CDP) of muis ----------
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
  await slaap(150);
}
const midden = (page, selector, i = 0) =>
  page.evaluate(
    (selector, i) => {
      const el = document.querySelectorAll(selector)[i];
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return [r.x + r.width / 2, r.y + r.height / 2];
    },
    selector,
    i,
  );

const genNamen = (page) => page.evaluate(() => [...document.querySelectorAll('.gen-regel')].map((r) => r.querySelector('.onderdeel-naam')?.textContent ?? (r.querySelector('.gen-geen') ? '—' : '')));
const genOnderdelen = (page) => page.evaluate(() => [...document.querySelectorAll('.gen-regel .gen-naam')].map((x) => x.textContent));

const EIGEN_DOELNET = {
  id: 'eigen-doelnet',
  soort: 'veld',
  naam: 'Testoefening doelnet',
  categorieen: ['afwerken'],
  uitleg: 'Speler 1 schiet door het gat linksonder, speler 2 tegen het net.',
  organisatie: '',
  benodigdheden: ['1 groot goal', '1 doelnet', '2 ballen'],
  spelersNodig: 2,
  keepersNodig: 0,
  doorwisselbaar: true,
  coachpunten: [],
  variaties: { makkelijker: [], moeilijker: [] },
  tekening: {
    veld: { type: 'leeg', breedte: 30, lengte: 24 },
    objecten: [
      { id: 'g1', soort: 'goal', x: 15, y: 1 },
      { id: 'dn1', soort: 'doelnet', x: 15, y: 1, doel: 'g1', hoek: 0, breedte: 7.32, hoogte: 2.44 },
      { id: 'a1', soort: 'speler', team: 'A', nummer: 1, x: 9, y: 15 },
      { id: 'a2', soort: 'speler', team: 'A', nummer: 2, x: 21, y: 15 },
      { id: 'b1', soort: 'bal', x: 9, y: 15, bij: 'a1' },
      { id: 'b2', soort: 'bal', x: 21, y: 15, bij: 'a2' },
    ],
    lijnen: [
      { soort: 'bal', punten: [[9, 15], [11.7, 1]], van: 'a1', stap: 1 },
      { soort: 'bal', punten: [[21, 15], [15.5, 1]], van: 'a2', stap: 2, hoogte: 'hoog' },
    ],
  },
  eigen: true,
  gemaakt: 1,
  gewijzigd: 1,
};

const downloads = path.join(MAP, 'downloads');
rmSync(downloads, { recursive: true, force: true });
mkdirSync(downloads, { recursive: true });
let exportBestand = null;

for (const [naam, vp, modus] of [
  ['telefoon', TELEFOON, 'vinger'],
  ['tablet', TABLET, 'vinger'],
  ['laptop', LAPTOP, 'muis'],
]) {
  const { context, page } = await toestel(vp);

  // ---------- A5: Spelers op het startscherm ----------
  await ga(page, '#/', `${naam}1`);
  const titels = await page.evaluate(() => [...document.querySelectorAll('.tegel-titel')].map((x) => x.textContent));
  controle(titels.includes('Spelers') && !titels.includes('Veld'), `${naam}: tegels ${titels.join(', ')}`);
  controle((await page.evaluate(() => document.querySelectorAll('.tegel-soort svg.tegel-plaatje').length)) === 2, `${naam}: illustraties op de tegels`);
  if (naam === 'telefoon') await foto(page, 'start', 'Startscherm: Spelers en Keepers met getekende illustraties');
  await ga(page, '#/veld', `${naam}2`);
  controle((await page.evaluate(() => document.querySelector('.kop-titel')?.textContent)) === 'Spelers', `${naam}: titel categorieën Spelers`);

  // ---------- A1: Training maken ----------
  await page.evaluate(() =>
    localStorage.setItem('trainersapp.trainingen', JSON.stringify({ versie: 1, trainingen: [{ id: 'leeg-oud', naam: '', spelers: 12, keepers: 1, oefeningen: [], gemaakt: 1, gewijzigd: 1 }] })),
  );
  await ga(page, '#/trainingen', `${naam}3`);
  const opgeruimd = await page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.trainingen')).trainingen.length);
  controle(opgeruimd === 0, `${naam}: oude lege training niet opgeruimd (${opgeruimd})`);
  await klik(page, 'Training maken');
  await wachtOp(page, () => location.hash.startsWith('#/training/'), null, `${naam}: training maken`);
  await slaap(300);
  const aantallen = await page.evaluate(() => [...document.querySelectorAll('.stapper output')].map((o) => o.textContent));
  controle(aantallen.join(',') === '4,1', `${naam}: standaard aantallen ${aantallen.join(',')}`);
  const velden = await page.evaluate(() => [...document.querySelectorAll('.training-gegevens input')].map((i) => {
    const r = i.getBoundingClientRect();
    return { type: i.type, x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) };
  }));
  const [naamVeld, datumVeld] = velden;
  controle(naamVeld && datumVeld && naamVeld.w === datumVeld.w && Math.abs(naamVeld.h - datumVeld.h) <= 2, `${naam}: naam- en datumveld ${JSON.stringify(velden)}`);
  if (naam === 'telefoon') controle(naamVeld.x === datumVeld.x, `${naam}: datumveld niet uitgelijnd ${JSON.stringify(velden)}`);
  if (naam === 'telefoon') await foto(page, 'training-maken', 'Training maken: 4 spelers, 1 keeper; datum even breed als de naam');
  await klik(page, 'Terug');
  await slaap(400);
  const naTerug = await page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.trainingen')).trainingen.length);
  controle(naTerug === 0, `${naam}: lege training toch bewaard (${naTerug})`);
  controle(await page.evaluate(() => !!document.querySelector('.leeg')), `${naam}: Mijn trainingen niet leeg`);

  // ---------- A2: Training genereren ----------
  await klik(page, 'Training genereren');
  await wachtOp(page, () => location.hash.endsWith('/genereren'), null, `${naam}: genereren`);
  await slaap(300);
  for (const [groep, chip] of [
    [0, 'Warming-up'],
    [1, 'Laag duiken'],
    [1, 'Reactie'],
    [1, '1 op 1'],
    [0, 'Spelletjes'],
  ])
    await page.evaluate((groep, chip) => [...document.querySelectorAll('.gen-groep')[groep].querySelectorAll('button')].find((b) => b.textContent.trim() === chip)?.click(), groep, chip);
  await slaap(300);
  let onderdelen = await genOnderdelen(page);
  controle(onderdelen.join('|') === 'Spelers · Warming-up|Keepers · Laag duiken|Keepers · Reactie|Keepers · 1 op 1|Spelers · Spelletjes', `${naam}: onderdelen ${onderdelen.join('|')}`);
  // Slepen: Spelletjes (5) naar boven.
  const [van, naar] = await page.evaluate(() => {
    document.querySelector('.gen-lijst').scrollIntoView({ block: 'start' });
    window.scrollBy(0, -70);
    const m = (el) => {
      const r = el.getBoundingClientRect();
      return [r.x + r.width / 2, r.y + r.height / 2];
    };
    const g = document.querySelectorAll('.gen-regel .greep');
    return [m(g[4]), m(g[0])];
  });
  await slaap(200);
  await sleep(page, modus, van, [naar[0], naar[1] - 12]);
  onderdelen = await genOnderdelen(page);
  controle(onderdelen[0] === 'Spelers · Spelletjes' && onderdelen.length === 5, `${naam}: na slepen ${onderdelen.join('|')}`);
  if (naam === 'telefoon') await foto(page, 'gen-kiezen', 'Training genereren: onderdelen aangetikt en versleept', true);
  await klik(page, 'Genereren', '.knoppenrij button');
  await slaap(300);
  let namen = await genNamen(page);
  controle(namen.length === 5 && namen.every((n) => n && n !== '—') && new Set(namen).size === 5, `${naam}: gegenereerd ${namen.join(' | ')}`);
  const voor = namen[2];
  await page.evaluate(() => document.querySelectorAll('.gen-regel')[2].querySelector('.gen-ander')?.click());
  await slaap(300);
  namen = await genNamen(page);
  controle(namen[2] !== voor && namen.length === 5 && new Set(namen).size === 5, `${naam}: andere oefening ${voor} → ${namen[2]}`);
  const trainingId = await page.evaluate(() => location.hash.split('/')[2]);
  let opgeslagen = await page.evaluate((id) => JSON.parse(localStorage.getItem('trainersapp.trainingen')).trainingen.find((t) => t.id === id), trainingId);
  controle(opgeslagen?.oefeningen.length === 5, `${naam}: training heeft ${opgeslagen?.oefeningen.length} oefeningen`);
  if (naam === 'telefoon') await foto(page, 'gen-resultaat', 'Gegenereerde training met "Andere oefening" per onderdeel', true);
  await klik(page, 'Alles opnieuw genereren');
  namen = await genNamen(page);
  controle(namen.length === 5 && namen.every((n) => n && n !== '—'), `${naam}: alles opnieuw ${namen.join(' | ')}`);
  // Geen keeper: keeperonderdelen melden dat er niets past.
  await klik(page, 'Eén keepers minder');
  await klik(page, 'Alles opnieuw genereren');
  const geen = await page.evaluate(() => [...document.querySelectorAll('.gen-geen')].map((x) => x.textContent));
  controle(geen.length === 3 && geen.every((t) => /Geen passende oefening/.test(t) && /keeper/.test(t)), `${naam}: meldingen zonder keeper: ${geen.length}`);
  if (naam === 'telefoon') await foto(page, 'gen-geen', 'Zonder keeper: melding bij de keeperonderdelen', true);
  await klik(page, 'Eén keepers meer');
  await klik(page, 'Alles opnieuw genereren');
  await klik(page, 'Naar de training');
  await wachtOp(page, () => document.querySelectorAll('.onderdeel').length === 5, null, `${naam}: training met 5 oefeningen`);
  const eerste = await page.evaluate(() => document.querySelector('.onderdeel .onderdeel-naam')?.textContent);
  await page.evaluate(() => document.querySelector('.onderdeel [title="Andere oefening"]')?.click());
  await slaap(300);
  const eersteNa = await page.evaluate(() => document.querySelector('.onderdeel .onderdeel-naam')?.textContent);
  controle(eerste && eersteNa && eerste !== eersteNa, `${naam}: Andere oefening in de training ${eerste} → ${eersteNa}`);
  controle(await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Start training') && !b.disabled)), `${naam}: Start training`);
  if (naam === 'telefoon') await foto(page, 'gen-training', 'Het resultaat is een gewone training', true);

  // ---------- A3: looplijnen ----------
  await ga(page, '#/oefening/veld-pt-y-vorm', `${naam}4`);
  await wachtOp(page, () => !!document.querySelector('[aria-label="Looplijnen"]'), null, `${naam}: knop Looplijnen`);
  controle((await page.evaluate(() => document.querySelector('[aria-label="Looplijnen"]')?.getAttribute('aria-pressed'))) === 'false', `${naam}: looplijnen staan standaard aan`);
  await klik(page, '2D', '.speler-groep button');
  await slaap(400);
  await zetTijd(page, 30);
  const zonder = await page.evaluate(() => document.querySelector('.speler-canvas')?.toDataURL());
  if (naam === 'telefoon') await foto(page, 'lijnen-uit', 'Animatie: looplijnen uit (standaard), passlijnen blijven');
  await klik(page, 'Looplijnen');
  await slaap(200);
  const met = await page.evaluate(() => document.querySelector('.speler-canvas')?.toDataURL());
  controle(zonder && met && zonder !== met, `${naam}: looplijnen aanzetten verandert het beeld niet`);
  controle((await page.evaluate(() => localStorage.getItem('trainersapp.looplijnen'))) === '1', `${naam}: keuze looplijnen niet onthouden`);
  if (naam === 'telefoon') await foto(page, 'lijnen-aan', 'Animatie: looplijnen aan');
  await ga(page, '#/oefening/veld-pt-y-vorm', `${naam}5`);
  controle((await page.evaluate(() => document.querySelector('[aria-label="Looplijnen"]')?.getAttribute('aria-pressed'))) === 'true', `${naam}: na herladen staan looplijnen niet meer aan`);
  await klik(page, 'Looplijnen');
  // Miniatuur in de lijst houdt de looplijnen (zelfde tekening als voorheen).

  // ---------- A6: geen Combinatievorm ----------
  if (COMBI) {
    await ga(page, `#/oefening/${COMBI}`, `${naam}6`);
    const tekst = await page.evaluate(() => document.body.innerText);
    controle(!/Combinatievorm/i.test(tekst), `${naam}: het woord Combinatievorm staat op ${COMBI}`);
    controle(await page.evaluate(() => !!document.querySelector('.verloop li')), `${naam}: verloop weg op ${COMBI}`);
    if (naam === 'telefoon') await foto(page, 'combi', 'Voormalige combinatievorm: genummerd verloop, geen badge');
  }

  // ---------- A4: doelnet ----------
  await page.evaluate((o) => localStorage.setItem('trainersapp.eigen', JSON.stringify({ versie: 1, oefeningen: [o] })), EIGEN_DOELNET);
  await ga(page, '#/oefening/eigen-doelnet', `${naam}7`);
  await wachtOp(page, () => !!document.querySelector('.speler-balk'), null, `${naam}: animatie doelnet`);
  const totaal = await page.evaluate(() => Number(document.querySelector('.speler-balk')?.max ?? 0));
  controle(totaal > 2, `${naam}: animatie doelnet duurt ${totaal}`);
  if (naam !== 'laptop') {
    await klik(page, '2D', '.speler-groep button');
    await slaap(300);
    await zetTijd(page, totaal);
    if (naam === 'telefoon') await foto(page, 'doelnet-2d', 'Doelnet in 2D: bal 1 door het gat, bal 2 teruggekaatst');
  } else {
    await page.evaluate(() => localStorage.setItem('trainersapp.3dAltijd', '1'));
    await klik(page, '3D', '.speler-groep button');
    await wachtOp(page, () => !!document.querySelector('.speler-canvas-3d'), null, 'laptop: 3D doelnet', 15000);
    await slaap(800);
    await klik(page, 'Achter goal', '.speler-groep button');
    await slaap(900);
    await zetTijd(page, totaal * 0.42);
    await slaap(300);
    await foto(page, 'doelnet-3d-gat', 'Doelnet in 3D: schot door het gat linksonder');
    await zetTijd(page, totaal * 0.83);
    await slaap(300);
    await foto(page, 'doelnet-3d-terug', 'Doelnet in 3D: hoog schot tegen het net, bal kaatst terug');
    await klik(page, 'Schuin', '.speler-groep button');
    await slaap(900);
    await zetTijd(page, totaal * 0.5);
    await foto(page, 'doelnet-3d-schuin', 'Doelnet in 3D (schuin)');
  }
  // Editor: doelnet uit het palet hangt in het goal.
  await ga(page, '#/eigen/eigen-doelnet/tekenen', `${naam}8`);
  await wachtOp(page, () => !!window.__editor, null, `${naam}: editor`);
  await klik(page, 'Toevoegen', '.editor-balk button');
  const inPalet = await page.evaluate(() => [...document.querySelectorAll('.palet-item')].some((b) => b.textContent.trim().startsWith('Doelnet')));
  controle(inPalet, `${naam}: Doelnet staat niet in het palet`);
  if (naam === 'telefoon') await foto(page, 'palet', 'Editor: Doelnet in het palet bij Doelen');
  await page.evaluate(() => document.querySelector('.paneel-achter')?.click());

  // ---------- A7: exporteren en importeren ----------
  await page.evaluate(() => {
    localStorage.setItem('trainersapp.favorieten', JSON.stringify({ versie: 1, ids: ['veld-pt-y-vorm'] }));
  });
  await ga(page, '#/instellingen', `${naam}9`);
  const blok = await page.evaluate(() => [...document.querySelectorAll('.blok h3')].map((h) => h.textContent));
  controle(blok.includes('Je gegevens'), `${naam}: blok Je gegevens ontbreekt (${blok.join(', ')})`);
  if (naam === 'laptop') {
    const s = await browser.target().createCDPSession();
    await s.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads, browserContextId: context.id, eventsEnabled: true });
    await klik(page, 'Exporteren');
    for (let i = 0; i < 30 && !readdirSync(downloads).some((f) => f.endsWith('.json')); i++) await slaap(200);
    const f = readdirSync(downloads).find((x) => x.endsWith('.json'));
    controle(!!f && /^toptraining-\d{4}-\d{2}-\d{2}\.json$/.test(f), `exportbestand: ${f}`);
    if (f) {
      exportBestand = path.join(downloads, f);
      const data = JSON.parse(readFileSync(exportBestand, 'utf8'));
      controle(data.soort === 'toptraining-gegevens' && data.eigenOefeningen.length === 1 && data.trainingen.length === 1 && data.favorieten.length === 1, `exportbestand inhoud: ${data.eigenOefeningen?.length}/${data.trainingen?.length}/${data.favorieten?.length}`);
    }
    await foto(page, 'export', 'Instellingen: Je gegevens (exporteren en importeren)');
  }
  await context.close();
}

// Importeren op een ander toestel (telefoon), twee keer.
if (exportBestand) {
  const { context, page } = await toestel(TELEFOON);
  await ga(page, '#/instellingen', 'imp1');
  const invoer = await page.$('input[type="file"]');
  await invoer.uploadFile(exportBestand);
  await wachtOp(page, () => /Erbij gekomen/.test(document.body.innerText), null, 'import: melding');
  const melding = await page.evaluate(() => document.querySelector('.melding-goed')?.textContent ?? '');
  controle(/1 eigen oefening/.test(melding) && /1 training/.test(melding) && /1 favoriet/.test(melding), `import: ${melding}`);
  const tel = await page.evaluate(() => [JSON.parse(localStorage.getItem('trainersapp.eigen')).oefeningen.length, JSON.parse(localStorage.getItem('trainersapp.trainingen')).trainingen.length, JSON.parse(localStorage.getItem('trainersapp.favorieten')).ids.length]);
  controle(tel.join(',') === '1,1,1', `import: op het toestel ${tel.join(',')}`);
  await page.evaluate(() => document.querySelector('.melding-goed')?.scrollIntoView({ block: 'center' }));
  await foto(page, 'import', 'Importeren op een ander toestel: alles erbij');
  const invoer2 = await page.$('input[type="file"]');
  await invoer2.uploadFile(exportBestand);
  await wachtOp(page, () => /Er kwam niets bij/.test(document.body.innerText), null, 'import 2: niets dubbel');
  const tel2 = await page.evaluate(() => [JSON.parse(localStorage.getItem('trainersapp.eigen')).oefeningen.length, JSON.parse(localStorage.getItem('trainersapp.trainingen')).trainingen.length, JSON.parse(localStorage.getItem('trainersapp.favorieten')).ids.length]);
  controle(tel2.join(',') === '1,1,1', `import 2: ${tel2.join(',')}`);
  // Geen TopTraining-bestand.
  await page.evaluate(() => {
    const dt = new DataTransfer();
    dt.items.add(new File(['hallo'], 'x.json', { type: 'application/json' }));
    const i = document.querySelector('input[type="file"]');
    i.files = dt.files;
    i.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await wachtOp(page, () => /geen TopTraining-bestand/.test(document.body.innerText), null, 'import: verkeerd bestand');
  await context.close();
} else problemen.push('Geen exportbestand om te importeren');

await blad(browser, shots, `${MAP}blad-deel-a.png`, 4, 2000);
await browser.close();
rmSync(downloads, { recursive: true, force: true });
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)]);
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of problemen) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
