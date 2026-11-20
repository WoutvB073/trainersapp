// 0.38.1: lijnen klikken vast aan spelers in de editor (feedback van een trainer op een Samsung-telefoon).
// Speelt de situatie uit de schermafbeelding na met de vinger op 360 px (Samsung) en iPhone SE, in NL en EN:
// half veld, spelers met een pion op ± 1 m ernaast, een bal die in beeld tegen blauw 2 aan ligt, lijnen die net naast de
// speler beginnen (ring tijdens het slepen), een dribbel zonder bal (geel driehoekje + reden + knop), een pass vanaf een
// lege plek (begint bij de balbezitter), een looplijn vanaf een lege plek (menu "Bij welke speler hoort deze lijn?"),
// later het beginpunt naar een speler slepen, pass en lopen in dezelfde stap (na elkaar, geen melding) en de bovenbalk
// (naam leesbaar, Gegevens leesbaar en nergens overheen).
// Blad: blad-0381.png.   Gebruik: node tools/e2e/versie-0381.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start } from './hulp.mjs';

const browser = await start();
const fouten = [];
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};
const shots = [];

const FORMATEN = [
  { naam: 'samsung', viewport: { width: 360, height: 780, deviceScaleFactor: 3, isMobile: true, hasTouch: true } },
  { naam: 'se', viewport: { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
];
const TALEN = (process.env.TAAL ?? 'nl,en').split(',');

const T = {
  nl: {
    half: 'Half veld',
    begin: 'Beginnen met tekenen',
    toevoegen: 'Toevoegen',
    klaar: 'Klaar met plaatsen',
    kiezen: 'Kiezen',
    pass: 'Pass',
    lopen: 'Lopen',
    dribbel: 'Dribbel',
    teamA: 'Speler team A',
    teamB: 'Speler team B',
    pion: 'Pion',
    bal: 'Bal',
    keeper: 'Keeper',
    nietVast: 'zit niet vast aan een speler',
    geenBal: 'heeft de bal nog niet',
    looplijn: 'Maak er een looplijn van',
    vraag: 'Bij welke speler hoort deze lijn?',
    later: 'Later',
    gegevens: 'Gegevens',
    lager: 'Lager stapnummer',
    hint: 'Begin bij een speler en sleep naar waar hij heen gaat.',
  },
  en: {
    half: 'Half pitch',
    begin: 'Start drawing',
    toevoegen: 'Add',
    klaar: 'Done placing',
    kiezen: 'Select',
    pass: 'Pass',
    lopen: 'Run',
    dribbel: 'Dribble',
    teamA: 'Player team A',
    teamB: 'Player team B',
    pion: 'Cone',
    bal: 'Ball',
    keeper: 'Keeper',
    nietVast: "isn't attached to a player",
    geenBal: "doesn't have the ball yet",
    looplijn: 'Make it a movement line',
    vraag: 'Which player does this line belong to?',
    later: 'Later',
    gegevens: 'Details',
    lager: 'Lower step number',
    hint: 'Start at a player and drag to where they go.',
  },
};

async function nieuwePagina(viewport, taal) {
  const page = await browser.newPage();
  await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument((taal) => {
    try {
      localStorage.setItem('trainersapp.testEditor', '1');
      localStorage.setItem('trainersapp.taal', taal);
    } catch {
      /* about:blank */
    }
  }, taal);
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => m.type() === 'error' && fouten.push(m.text()));
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
  await slaap(250);
  return ok;
};

// ---------- vinger (CDP) ----------
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
const meldingen = (page) => page.evaluate(() => window.__editor.meldingen());
async function tik(page, [x, y]) {
  await vingers(page, 'touchStart', [[x, y]]);
  await slaap(40);
  await vingers(page, 'touchEnd', []);
  await slaap(150);
}
/** Slepen met de vinger; `halverwege` = callback als de vinger nog op het scherm staat (voor een screenshot). */
async function sleep(page, [x0, y0], [x1, y1], halverwege) {
  const n = 12;
  await vingers(page, 'touchStart', [[x0, y0]]);
  for (let i = 1; i <= n; i++) {
    await vingers(page, 'touchMove', [[x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]]);
    await slaap(16);
    if (i === n && halverwege) await halverwege();
  }
  await vingers(page, 'touchEnd', []);
  await slaap(200);
}
const veldTik = async (page, p) => tik(page, await scherm(page, p));
const veldSleep = async (page, a, b, halverwege) => sleep(page, await scherm(page, a), await scherm(page, b), halverwege);
async function plaats(page, w, naam, punten) {
  await klik(page, w.toevoegen, '.editor-balk button');
  await klik(page, naam, '.palet-item');
  for (const p of punten) await veldTik(page, p);
  await klik(page, w.klaar);
}
async function foto(page, naam, tekst) {
  const pad = `${MAP}0381-${naam}.png`;
  await page.screenshot({ path: pad });
  shots.push([pad, tekst]);
}
const waarschuwing = (page) => page.evaluate(() => document.querySelector('.editor-waarschuwing')?.textContent ?? '');

/** Bovenbalk: naam leesbaar, Gegevens leesbaar (contrast) en niet over andere knoppen. */
async function bovenbalk(page, waar, w) {
  const r = await page.evaluate(() => {
    const kop = document.querySelector('.editor-kop');
    const titel = kop.querySelector('.editor-titel');
    const g = kop.querySelector('.editor-gegevens');
    const knoppen = [...kop.querySelectorAll('button')].filter((b) => b !== g);
    const rg = g.getBoundingClientRect();
    const overlap = knoppen.some((b) => {
      const r = b.getBoundingClientRect();
      return r.right > rg.left + 0.5 && r.left < rg.right - 0.5 && r.bottom > rg.top + 0.5 && r.top < rg.bottom - 0.5;
    });
    const kleur = (s) =>
      s
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number);
    const lum = ([r, g, b]) => {
      const c = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const sk = getComputedStyle(kop);
    const terug = getComputedStyle(kop.querySelector('.kop-terug'));
    const sg = getComputedStyle(g);
    const bg = sg.backgroundImage !== 'none' ? null : kleur(sg.backgroundColor);
    const fg = kleur(sg.color);
    const contrast = bg ? (Math.max(lum(bg), lum(fg)) + 0.05) / (Math.min(lum(bg), lum(fg)) + 0.05) : 0;
    const kb = kleur(sk.backgroundColor);
    const kt = kleur(terug.color);
    const terugContrast = (Math.max(lum(kb), lum(kt)) + 0.05) / (Math.min(lum(kb), lum(kt)) + 0.05);
    return {
      terugContrast,
      titel: titel.textContent,
      titelPast: titel.scrollWidth <= titel.clientWidth + 1,
      titelBreed: titel.clientWidth,
      gegevens: g.textContent.trim(),
      gegevensPast: g.scrollWidth <= g.clientWidth + 1 && rg.right <= window.innerWidth + 0.5,
      overlap,
      contrast,
      breed: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  controle(r.titelPast, `${waar}: naam "${r.titel}" afgekapt (${r.titelBreed}px breed)`);
  controle(r.gegevens.startsWith(w.gegevens) && r.gegevensPast, `${waar}: knop Gegevens "${r.gegevens}" niet helemaal te zien`);
  controle(!r.overlap, `${waar}: Gegevens ligt over een andere knop`);
  controle(r.contrast >= 4.5, `${waar}: Gegevens slecht leesbaar (contrast ${r.contrast.toFixed(2)})`);
  controle(r.terugContrast >= 3, `${waar}: terugknop onzichtbaar (contrast ${r.terugContrast.toFixed(2)})`);
  controle(r.breed <= 0, `${waar}: ${r.breed}px horizontaal scrollen`);
}

for (const taal of TALEN) {
  const w = T[taal];
  for (const f of FORMATEN) {
    const waar = `${f.naam}/${taal}`;
    const page = await nieuwePagina(f.viewport, taal);
    await page.goto(`${BASE}?r=0381${f.naam}${taal}#/eigen/nieuw`, { waitUntil: 'networkidle0' });
    await klik(page, w.half, '.veld-keuze');
    await klik(page, w.begin);
    await page.waitForSelector('.editor-canvas');
    await slaap(400);
    await bovenbalk(page, waar, w);

    // De situatie uit de schermafbeelding (half veld, zo ver uitgezoomd als de trainer).
    await plaats(page, w, w.keeper, [[34.9, 1.4]]);
    await plaats(page, w, w.teamA, [
      [27.8, 27.4],
      [41.4, 27.6],
    ]);
    await plaats(page, w, w.teamB, [
      [16.5, 35.2],
      [36.8, 47.4],
      [52.5, 34.2],
    ]);
    // Pionnen op ± 1 m naast de spelers, en waar ze bij de trainer stonden (3 à 4 m: in beeld vlak naast de speler).
    await plaats(page, w, w.pion, [
      [17.4, 34.4],
      [37.8, 46.9],
      [51.6, 33.6],
      [17.4, 31],
      [34.7, 37.4],
      [51.8, 31],
    ]);
    // Bal die er in beeld tegenaan ligt (3,3 m van blauw 2; zo lag hij bij de trainer los).
    await plaats(page, w, w.bal, [[37.8, 44.2]]);
    let t = await tekening(page);
    const id = (team, nr) => t.objecten.find((o) => o.soort === 'speler' && o.team === team && o.nummer === nr)?.id;
    const b1 = id('B', 1);
    const b2 = id('B', 2);
    const b3 = id('B', 3);
    const a2 = id('A', 2);
    controle(t.objecten.find((o) => o.soort === 'bal')?.bij === b2, `${waar}: bal tegen blauw 2 aan hoort niet bij hem (${JSON.stringify(t.objecten.find((o) => o.soort === 'bal'))})`);

    // 1. Pass die net naast blauw 2 begint (aan de kant van de pion), naar vlak bij rood 2: zit aan beide vast. Ring tijdens het slepen.
    await klik(page, w.pass, '.editor-balk button');
    const hint = await page.evaluate(() => document.querySelector('.editor-plaats')?.textContent ?? '');
    controle(hint.includes(w.hint), `${waar}: hint bij Pass "${hint}"`);
    await veldSleep(page, [38.6, 46.6], [43, 29.2], async () => {
      if (taal === 'nl') await foto(page, `${f.naam}-ring`, `${f.naam}: pass slepen vanaf net naast blauw 2 – ring om blauw 2 en rood 2`);
    });
    t = await tekening(page);
    controle(t.lijnen?.[0]?.van === b2 && t.lijnen?.[0]?.naar === a2, `${waar}: pass zit niet vast aan blauw 2 → rood 2: ${JSON.stringify(t.lijnen?.[0])}`);
    let m = await meldingen(page);
    controle(!m.some((x) => x.soort === 'fout'), `${waar}: pass van blauw 2 geeft een melding: ${JSON.stringify(m)}`);

    // 2. Looplijn van blauw 2 (begint net naast hem), 3. dribbel van blauw 1 (begint tussen hem en zijn pion).
    await klik(page, w.lopen, '.editor-balk button');
    await veldSleep(page, [35.6, 46.2], [12, 17.9]);
    await klik(page, w.dribbel, '.editor-balk button');
    await veldSleep(page, [17, 33.2], [9.3, 14.6]);
    t = await tekening(page);
    controle(t.lijnen?.[1]?.van === b2, `${waar}: looplijn zit niet vast aan blauw 2: ${JSON.stringify(t.lijnen?.[1])}`);
    controle(t.lijnen?.[2]?.van === b1, `${waar}: dribbel zit niet vast aan blauw 1: ${JSON.stringify(t.lijnen?.[2])}`);
    m = await meldingen(page);
    controle(
      m.some((x) => x.lijn === 2 && x.soort === 'fout' && !x.los),
      `${waar}: dribbel zonder bal geeft geen melding: ${JSON.stringify(m)}`,
    );
    let balk = await waarschuwing(page);
    controle(balk.includes(w.geenBal) && balk.includes(w.looplijn), `${waar}: waarschuwing noemt de reden niet: "${balk}"`);
    await klik(page, w.kiezen, '.editor-balk button');
    await foto(page, `${f.naam}-${taal}-melding`, `${waar}: dribbel zonder bal – geel driehoekje, reden en knop`);
    // Tik op het driehoekje: opties met de uitleg (gaat voor de pion en speler eronder).
    const dh = await page.evaluate(() => window.__editor.driehoekPunt(2));
    await veldTik(page, dh);
    const opties = await page.evaluate(() => document.querySelector('.paneel .editor-meldingen')?.textContent ?? '');
    controle(opties.includes(w.geenBal), `${waar}: tik op het driehoekje opent de uitleg niet ("${opties}")`);
    if (taal === 'nl' && f.naam === 'samsung') await foto(page, `${f.naam}-opties`, `${waar}: tik op het driehoekje – uitleg met knoppen`);
    // Met één tik oplossen.
    await klik(page, w.looplijn, '.paneel .editor-oplossing');
    await page.evaluate(() => document.querySelector('.paneel .paneel-kop button')?.click());
    await slaap(200);
    t = await tekening(page);
    m = await meldingen(page);
    controle(t.lijnen?.[2]?.soort === 'loop' && !m.some((x) => x.soort === 'fout'), `${waar}: oplossing Looplijn werkt niet: ${JSON.stringify(m)}`);

    // 4. Pass en lopen in dezelfde stap: looplijn van blauw 2 naar stap 1 → na elkaar, geen melding.
    await tik(page, await scherm(page, await page.evaluate(() => window.__editor.stapPunt(1))));
    await klik(page, w.lager);
    t = await tekening(page);
    m = await meldingen(page);
    controle(
      t.lijnen?.[1]?.stap === 1 && !m.some((x) => x.soort === 'fout'),
      `${waar}: pass + lopen in stap 1 geeft een melding: ${JSON.stringify(m)} ${JSON.stringify(t.lijnen?.map((l) => l.stap))}`,
    );

    // 5. Pass vanaf een lege plek: begint bij de speler met de bal (rood 2, na de pass).
    await klik(page, w.pass, '.editor-balk button');
    await veldSleep(page, [30, 12], [26, 6]);
    t = await tekening(page);
    controle(t.lijnen?.[3]?.van === a2, `${waar}: pass vanaf een lege plek begint niet bij de balbezitter: ${JSON.stringify(t.lijnen?.[3])}`);

    // 6. Looplijn vanaf een lege plek: menu "Bij welke speler hoort deze lijn?", kies de eerste.
    await klik(page, w.lopen, '.editor-balk button');
    await veldSleep(page, [52, 46], [58, 40]);
    const vraag = await page.evaluate(() => document.querySelector('.koppel-menu h2')?.textContent ?? '');
    controle(vraag === w.vraag, `${waar}: geen keuzemenu ("${vraag}")`);
    const keuzes = await page.evaluate(() => [...document.querySelectorAll('.koppel-keuze')].map((b) => b.textContent));
    controle(keuzes.length >= 3, `${waar}: te weinig spelers in het menu: ${keuzes.join(' | ')}`);
    await foto(page, `${f.naam}-${taal}-menu`, `${waar}: looplijn vanaf een lege plek – Bij welke speler hoort deze lijn?`);
    await page.evaluate(() => document.querySelector('.koppel-keuze')?.click());
    await slaap(200);
    t = await tekening(page);
    controle(t.lijnen?.[4]?.van === b3, `${waar}: gekozen speler niet gekoppeld (verwacht blauw 3): ${JSON.stringify(t.lijnen?.[4])}`);

    // 7. Nog een losse looplijn, "Later": geel driehoekje + tekst; daarna het begin naar een speler slepen.
    await veldSleep(page, [60, 12], [64, 6]);
    await klik(page, w.later, '.koppel-menu button');
    balk = await waarschuwing(page);
    controle(balk.includes(w.nietVast), `${waar}: waarschuwing voor een losse lijn: "${balk}"`);
    if (taal === 'nl') await foto(page, `${f.naam}-los`, `${waar}: losse lijn (Later) – geel driehoekje en uitleg onderin`);
    await klik(page, w.kiezen, '.editor-balk button');
    await tik(page, await scherm(page, await page.evaluate(() => window.__editor.stapPunt(5))));
    const h = await page.evaluate(() => window.__editor.handvatten());
    if (h.begin) await sleep(page, await scherm(page, h.begin), await scherm(page, [54, 35]));
    t = await tekening(page);
    m = await meldingen(page);
    controle(t.lijnen?.[5]?.van === b3 && !m.some((x) => x.los), `${waar}: begin naar blauw 3 slepen koppelt niet: ${JSON.stringify(t.lijnen?.[5])}`);
    controle(!(await page.evaluate(() => !!document.querySelector('.editor-waarschuwing'))) || !(await waarschuwing(page)).includes(w.nietVast), `${waar}: waarschuwing blijft staan`);

    // Spelers zonder lijn (rood 1, keeper) geven nergens een melding.
    controle(!m.some((x) => x.lijn < 0), `${waar}: algemene melding ${JSON.stringify(m)}`);
    await bovenbalk(page, `${waar} (na tekenen)`, w);
    if (f.naam === 'samsung') await foto(page, `${f.naam}-${taal}-klaar`, `${waar}: alles gekoppeld, geen meldingen; bovenbalk met naam en ${w.gegevens}`);
    await page.close();
  }
}

await blad(browser, shots, `${MAP}blad-0381.png`, 4, 1800);
await browser.close();
const echteFouten = fouten.filter((f) => !/favicon|Failed to load resource.*404/.test(f));
if (echteFouten.length) console.log('Browserfouten:\n' + echteFouten.join('\n'));
if (problemen.length) {
  console.log(`${problemen.length} problemen:\n` + problemen.join('\n'));
  process.exit(1);
}
console.log(`versie-0381: alles goed (${shots.length} screenshots, blad-0381.png)`);
