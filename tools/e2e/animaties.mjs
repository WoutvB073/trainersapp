// 3D-animaties beoordelen (0.21.0): vaste momenten in een aantal oefeningen (overzicht + close-ups van lopen, passen,
// aannemen, dribbelen, duiken, vangen, gooien, zitten) en een 11 tegen 11-tactiekbord. Met een label (bv. "voor" of
// "na") komen de screenshots in anim-<label>-*.png; bestaan zowel "voor" als "na", dan ook een vergelijkingsblad.
// Meet ook de beeldsnelheid (11 tegen 11, telefoonformaat, gewone en 4× tragere processor) en de laadtijd.
// Gebruik: node tools/e2e/animaties.mjs <label> [basis-url] [alleen: scenes|snelheid|laden]
import fs from 'node:fs';
import { createJiti } from 'jiti';
import { alsGeinstalleerd, blad, MAP, slaap, start, zetTijd } from './hulp.mjs';

const LABEL = process.argv[2] ?? 'na';
const BASIS = process.argv[3] ?? 'http://localhost:4184/trainersapp/';
const ALLEEN = process.argv[4] ?? 'alles';
const jiti = createJiti(import.meta.url);
const { maakTijdlijn, standOp } = await jiti.import('../../src/anim/timeline.ts');
const { opgesteldBord, wedstrijdCode } = await jiti.import('../../src/wedstrijd/wedstrijd.ts');
const { afspeelTekening } = await jiti.import('../../src/editor/animatie.ts');

const DATA = new URL('../../src/data/oefeningen/', import.meta.url);
const oefeningen = new Map(
  ['veld', 'keepers'].flatMap((map) => fs.readdirSync(new URL(`${map}/`, DATA)).flatMap((f) => JSON.parse(fs.readFileSync(new URL(`${map}/${f}`, DATA), 'utf8')))).map((o) => [o.id, o]),
);

/** 11 tegen 11 op het tactiekbord, iedereen loopt (stap 1 vooruit, stap 2 diagonaal sprinten), de bal wordt gedribbeld. */
function bord11() {
  const t = opgesteldBord('11v11', '1-4-3-3');
  const lijnen = [];
  for (const o of t.objecten) {
    if (o.soort !== 'speler') continue;
    const v = o.team === 'A' ? -1 : 1;
    const a = [o.x, o.y];
    const b = [o.x + (o.nummer % 2 ? 3 : -3), o.y + v * 9];
    const c = [b[0] + (o.nummer % 3 ? 6 : -6), b[1] - v * 5];
    lijnen.push({ soort: 'loop', punten: [a, b], van: o.id, stap: 1 });
    lijnen.push({ soort: 'loop', punten: [b, c], stap: 2, manier: 'sprint' });
  }
  return { ...t, camera: 'schuin', lijnen };
}

// ---------- momenten uit de tijdlijn ----------

function momenten(tekening, wat) {
  const tl = maakTijdlijn(afspeelTekening(tekening));
  const personen = new Set([...tl.objecten.values()].filter((o) => ['speler', 'keeper', 'trainer'].includes(o.soort)).map((o) => o.id));
  const keepers = new Set([...tl.objecten.values()].filter((o) => o.soort === 'keeper').map((o) => o.id));
  const plek = (t, id) => {
    const s = standOp(tl, t).objecten.get(id);
    return { x: s.x, y: s.y };
  };
  const uit = [];
  const voeg = (soort, t, wie, tekst) => uit.push({ soort, t: Math.max(0, Math.round(t * 100) / 100), tekst, ...plek(t, wie) });
  for (const w of wat) {
    if (w === 'pass') {
      const x = tl.loslaten.find((l) => l.soort === 'voet' && l.t > 1);
      if (x) voeg(w, x.t - 0.06, x.wie, 'pass/trap');
    } else if (w === 'schot') {
      const x = [...tl.loslaten].reverse().find((l) => l.soort === 'voet' && !keepers.has(l.wie));
      if (x) voeg(w, x.t - 0.06, x.wie, 'schot');
    } else if (w === 'aanname') {
      for (const lijst of tl.balEvents.values()) {
        const e = lijst.find((e) => e.soort === 'vlucht' && e.t1 > 1 && e.daarna && personen.has(e.daarna) && !keepers.has(e.daarna));
        if (e) {
          voeg(w, e.t1 - 0.05, e.daarna, 'aannemen');
          break;
        }
      }
    } else if (w === 'duik' || w === 'vang') {
      for (const lijst of tl.balEvents.values()) {
        const e = lijst.find((e) => e.soort === 'vlucht' && keepers.has(e.daarna) && standOp(tl, e.t1).objecten.get(e.daarna).liggen > 0.5 === (w === 'duik'));
        if (e) {
          voeg(w, e.t1 - (w === 'duik' ? 0.1 : 0), e.daarna, w === 'duik' ? `duik (${e.h1.toFixed(1)} m)` : `vangt op ${e.h1.toFixed(1)} m`);
          if (w === 'duik') voeg('ligt', e.t1 + 0.45, e.daarna, 'na de duik');
          break;
        }
      }
    } else if (w === 'worp') {
      const x = tl.loslaten.find((l) => l.soort !== 'voet');
      if (x) voeg(w, x.t - 0.12, x.wie, `worp ${x.soort}`);
    } else if (w === 'tik') {
      const [id, lijst] = [...tl.tikken].find(([, l]) => l.length) ?? [];
      if (lijst) voeg(w, (lijst[0].t0 + lijst[0].t1) / 2, id, 'grond tikken');
    } else if (w === 'rij') {
      voeg(w, 0.2, [...personen][personen.size - 1], 'wachten in de rij');
    } else if (typeof w === 'string' && (w.startsWith('loop:') || w === 'dribbel')) {
      const manier = w.slice(5);
      let gevonden = false;
      for (let t = 0.3; t < tl.duur && !gevonden; t += 0.05) {
        const s = standOp(tl, t);
        for (const [id, st] of s.objecten) {
          if (!personen.has(id) || st.snelheid < 1.2) continue;
          const balBij = [...s.objecten.values()].some((b) => b.houder === id && b.hoogte < 0.3);
          if (w === 'dribbel' ? balBij && st.manier : st.manier === manier && !balBij) {
            voeg(w, t + 0.25, id, w === 'dribbel' ? 'dribbelen' : manier);
            gevonden = true;
            break;
          }
        }
      }
    } else if (typeof w === 'number') {
      uit.push({ soort: 'overzicht', t: Math.round(tl.duur * w * 100) / 100, tekst: `overzicht ${Math.round(w * 100)}%` });
    }
  }
  return uit;
}

const SCENES = [
  ['veld-wu-loopscholing', 'Loopscholing', [0.35, 'rij', 'loop:huppel', 'loop:kniehef', 'loop:zijwaarts', 'loop:achteruit']],
  ['veld-lc-lage-hordes', 'Lage hordes', ['loop:hordes', 'loop:jog']],
  ['veld-lc-ladder-enkel', 'Ladder', ['loop:voetenwerk']],
  ['veld-pt-driehoek', 'Passvorm driehoek', [0.4, 'pass', 'aanname', 'loop:jog']],
  ['veld-tq-poortjesdribbel', 'Dribbelen', ['dribbel']],
  ['veld-af-dribbel-afronden', 'Afwerken met keeper', [0.6, 'schot', 'duik']],
  ['keeper-ld-voetenwerk-lange-duik', 'Lage duik', ['duik', 'loop:zijwaarts']],
  ['keeper-hd-tippen-over-de-lat', 'Hoge duik', ['duik']],
  ['keeper-wu-grondoefeningen', 'Grondoefeningen', [0.3, 'tik', 'vang']],
  ['keeper-ps-uitworpen', 'Uitgooien', ['worp']],
  ['keeper-ps-uittrap-handen', 'Uittrappen', ['worp']],
  ['veld-pv-4-4-keepers', 'Partijvorm 4 tegen 4', [0.3, 0.65]],
];

const browser = await start();
const fouten = [];

async function nieuwePagina(breedte, hoogte, dpr, mobiel = false) {
  const page = await browser.newPage();
  await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('trainersapp.testCamera', '1');
    } catch {
      /* about:blank */
    }
  });
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => m.type() === 'error' && fouten.push(m.text()));
  await page.setViewport({ width: breedte, height: hoogte, deviceScaleFactor: dpr, isMobile: mobiel, hasTouch: mobiel });
  return page;
}

let n = 0;
async function open(page, hash) {
  await page.goto(`${BASIS}?r=a${n++}${Date.now() % 1000}${hash}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.speler-canvas-3d', { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await slaap(400);
}

// ---------- screenshots ----------
const shots = [];
if (ALLEEN === 'alles' || ALLEEN === 'scenes') {
  const page = await nieuwePagina(720, 900, 1.5);
  const doe = async (sleutel, titel, hash, lijst) => {
    await open(page, hash);
    const vak = await page.$('.speler-vak');
    for (const [i, m] of lijst.entries()) {
      if (m.soort === 'overzicht') await page.evaluate(() => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === 'Schuin')?.click());
      else await page.evaluate((m) => window.__camera3d?.(m.x, m.y, m.afstand ?? 6.5), m);
      await slaap(900);
      await zetTijd(page, m.t);
      await slaap(250);
      const pad = `${MAP}anim-${LABEL}-${sleutel}-${i}.png`;
      await vak.screenshot({ path: pad });
      shots.push([pad, `${titel} – ${m.tekst} (${m.t} s)`, `${sleutel}-${i}`]);
    }
  };
  for (const [id, titel, wat] of SCENES) {
    const o = oefeningen.get(id);
    if (!o) {
      fouten.push(`onbekend: ${id}`);
      continue;
    }
    await doe(id, titel, `#/oefening/${id}`, momenten(o.tekening, wat));
  }
  const bord = bord11();
  const code = wedstrijdCode({ soort: 'bord', bord: { naam: '11 tegen 11', soort: 'tactiek', tekening: bord } });
  const tl = maakTijdlijn(afspeelTekening(bord));
  const m = [
    { soort: 'overzicht', t: 0, tekst: 'overzicht begin' },
    { soort: 'overzicht', t: Math.round(tl.duur * 0.5 * 100) / 100, tekst: 'overzicht halverwege' },
    { soort: 'close', t: Math.round(tl.duur * 0.3 * 100) / 100, tekst: 'middenveld dichtbij', x: 34, y: 45, afstand: 16 },
  ];
  await doe('bord11', '11 tegen 11', `#/w/${code}`, m);
  await blad(browser, shots, `${MAP}blad-anim-${LABEL}.png`, 4, 2400);
  // Vergelijking voor/na (als beide er zijn).
  const ander = LABEL === 'na' ? 'voor' : null;
  if (ander) {
    const paren = shots.flatMap(([pad, tekst, sleutel]) => {
      const oud = `${MAP}anim-${ander}-${sleutel}.png`;
      return fs.existsSync(oud)
        ? [
            [oud, `VOOR – ${tekst}`],
            [pad, `NA – ${tekst}`],
          ]
        : [];
    });
    if (paren.length) {
      for (let i = 0; i < paren.length; i += 16) await blad(browser, paren.slice(i, i + 16), `${MAP}blad-anim-vergelijk-${i / 16 + 1}.png`, 4, 2400);
    }
  }
  await page.close();
  console.log(`${shots.length} screenshots → blad-anim-${LABEL}.png`);
}

// ---------- beeldsnelheid ----------
if (ALLEEN === 'alles' || ALLEEN === 'snelheid') {
  const page = await nieuwePagina(390, 844, 3, true);
  const bord = bord11();
  const code = wedstrijdCode({ soort: 'bord', bord: { naam: '11 tegen 11', soort: 'tactiek', tekening: bord } });
  // Rekentijd per beeld: hoe lang de requestAnimationFrame-callbacks (tijdlijn, poppetjes, three.js) samen duren.
  await page.evaluateOnNewDocument(() => {
    const echt = window.requestAnimationFrame.bind(window);
    window.__werk = [];
    window.requestAnimationFrame = (cb) =>
      echt((nu) => {
        const t0 = performance.now();
        cb(nu);
        window.__werk.push(performance.now() - t0);
      });
  });
  const cdp = await page.target().createCDPSession();
  const meet = async (rem, camera, eenvoudig = false) => {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: rem });
    await page.evaluate((e) => (e ? localStorage.setItem('trainersapp.poppetjes', 'eenvoudig') : localStorage.removeItem('trainersapp.poppetjes')), eenvoudig).catch(() => {});
    await open(page, `#/w/${code}`);
    await page.evaluate((c) => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === c)?.click(), camera);
    await slaap(1200);
    return page.evaluate(
      () =>
        new Promise((klaar) => {
          const tussen = [];
          let vorige = performance.now();
          window.__werk.length = 0;
          const stap = (nu) => {
            tussen.push(nu - vorige);
            vorige = nu;
            if (tussen.length < 200) requestAnimationFrame(stap);
            else {
              const s = tussen.slice(20).sort((a, b) => a - b);
              const med = s[Math.floor(s.length / 2)];
              const p90 = s[Math.floor(s.length * 0.9)];
              // Werk per beeld (alle callbacks van één beeld bij elkaar ≈ som / aantal beelden).
              const werk = window.__werk.slice(40);
              const som = werk.reduce((a, b) => a + b, 0) / (tussen.length - 20);
              const w = [...werk].sort((a, b) => a - b);
              klaar({
                mediaan: Math.round(med * 10) / 10,
                p90: Math.round(p90 * 10) / 10,
                fps: Math.round(1000 / med),
                fps90: Math.round(1000 / p90),
                'werk/beeld ms': Math.round(som * 10) / 10,
                'grootste callback ms': Math.round(w[Math.floor(w.length * 0.95)] * 10) / 10,
              });
            }
          };
          requestAnimationFrame(stap);
        }),
    );
  };
  const uit = {};
  for (const rem of [1, 4, 6]) for (const cam of ['Schuin', 'Boven']) uit[`${cam} cpu×${rem}`] = await meet(rem, cam);
  uit.infoGewoon = await page.evaluate(() => window.__info3d?.() ?? null);
  for (const rem of [4, 6]) uit[`eenvoudig Schuin cpu×${rem}`] = await meet(rem, 'Schuin', true);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  // Hoeveel tekenopdrachten (draw calls) en driehoeken per beeld.
  uit.infoEenvoudig = await page.evaluate(() => window.__info3d?.() ?? null);
  await page.evaluate(() => localStorage.removeItem('trainersapp.poppetjes'));
  console.log('BEELDSNELHEID (11 tegen 11, 390×844, dpr 3):');
  console.table(uit);
  fs.writeFileSync(`${MAP}anim-${LABEL}-snelheid.json`, JSON.stringify(uit, null, 2));
  await page.close();
}

// ---------- laadtijd ----------
if (ALLEEN === 'alles' || ALLEEN === 'laden') {
  const uit = {};
  for (const [naam, net] of [
    ['4G', { latency: 70, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8 }],
    ['snel 3G', { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (0.75 * 1024 * 1024) / 8 }],
  ]) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await alsGeinstalleerd(page);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const cdp = await page.target().createCDPSession();
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, ...net });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const t0 = Date.now();
    await page.goto(`${BASIS}?r=l${Date.now()}#/oefening/veld-pt-driehoek`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.speler-vak', { timeout: 60000 });
    const scherm = Date.now() - t0;
    await page.waitForSelector('.speler-canvas-3d', { timeout: 60000 });
    const drieD = Date.now() - t0;
    uit[naam] = { 'oefening in beeld (ms)': scherm, '3D in beeld (ms)': drieD };
    await ctx.close();
  }
  console.log('LAADTIJD (eerste bezoek, geen cache, processor 4× trager):');
  console.table(uit);
  fs.writeFileSync(`${MAP}anim-${LABEL}-laden.json`, JSON.stringify(uit, null, 2));
}

await browser.close();
if (fouten.length) console.log('FOUTEN:', [...new Set(fouten)].slice(0, 20));
