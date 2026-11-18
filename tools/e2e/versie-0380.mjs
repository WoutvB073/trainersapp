// 0.38.0 in de browser (fase 2, deel 4): realistische 3D-weergave.
// - Standaard Realistisch: zonlicht met schaduwen en de echtere figuur (__info3d.realistisch), in de bibliotheek, de trainingsmodus,
//   het tactiekbord 11 tegen 11 en de keepers.
// - Instellingen → 3D-animaties: Realistisch / Gewoon / Eenvoudig kiezen, onthouden, 3D gebruikt het; NL en EN, niets afgekapt.
// - Automatisch: op een (nagebootst) traag toestel eerst Gewoon, daarna Eenvoudig, met melding; Instellingen zegt dat het automatisch
//   lager staat; "Weer automatisch laten kiezen" begint weer bij Realistisch.
// - Duidelijkheid: hesjeskleuren, keepers, rugnummers en looplijnen in Realistisch naast Gewoon (blad).
// Blad: blad-0380.png. Gebruik: node tools/e2e/versie-0380.mjs [basis-url]
import { createJiti } from 'jiti';
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, zetTijd } from './hulp.mjs';

const jiti = createJiti(import.meta.url);
const { opgesteldBord, wedstrijdCode } = await jiti.import('../../src/wedstrijd/wedstrijd.ts');

const browser = await start();
const fouten = [];
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};
const TELEFOON = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const SE = { width: 320, height: 568, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const shots = [];

async function toestel(viewport, extra = {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument((extra) => {
    try {
      localStorage.setItem('trainersapp.testCamera', '1');
      localStorage.setItem('trainersapp.3dAltijd', '1');
      for (const [k, v] of Object.entries(extra)) {
        if (v === null) localStorage.removeItem(k);
        else localStorage.setItem(k, v);
      }
    } catch {
      /* about:blank */
    }
  }, extra);
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => m.type() === 'error' && fouten.push(m.text()));
  await page.setViewport(viewport);
  return { context, page };
}
let r = 0;
const ga = async (page, hash) => {
  await page.goto(`${BASE}?r=v38${r++}${Date.now() % 1000}${hash}`, { waitUntil: 'domcontentloaded' });
  await slaap(500);
};
const drieD = async (page, wat) => {
  const ok = await page.waitForSelector('.speler-canvas-3d', { timeout: 25000 }).catch(() => null);
  controle(!!ok, `${wat}: geen 3D`);
  await slaap(600);
  const info = await page.evaluate(() => window.__info3d?.() ?? null);
  controle(!!info && info.poppetjes > 0, `${wat}: geen poppetjes in 3D (${JSON.stringify(info)})`);
  return info;
};
const foto = async (page, naam, tekst, alleenVak = true) => {
  const pad = `${MAP}v38-${naam}.png`;
  const vak = alleenVak ? await page.$('.speler-vak') : null;
  if (vak) await vak.screenshot({ path: pad });
  else await page.screenshot({ path: pad });
  shots.push([pad, tekst]);
};
const niveauKnoppen = (page) => page.evaluate(() => [...document.querySelectorAll('#poppetjes .keuze')].map((b) => ({ tekst: b.textContent.trim(), aan: b.getAttribute('aria-checked') === 'true' })));
const kies = (page, tekst) => page.evaluate((tekst) => [...document.querySelectorAll('#poppetjes .keuze')].find((b) => b.textContent.trim() === tekst)?.click(), tekst);

/** 11 tegen 11 op het tactiekbord (rugnummers en looplijnen). */
function bord11() {
  const t = opgesteldBord('11v11', '1-4-3-3');
  const lijnen = [];
  for (const o of t.objecten) {
    if (o.soort !== 'speler') continue;
    const v = o.team === 'A' ? -1 : 1;
    lijnen.push({ soort: 'loop', punten: [[o.x, o.y], [o.x + (o.nummer % 2 ? 3 : -3), o.y + v * 6]], van: o.id, stap: 1 });
  }
  return { ...t, camera: 'schuin', lijnen };
}
const code11 = wedstrijdCode({ soort: 'bord', bord: { naam: '11 tegen 11', soort: 'tactiek', tekening: bord11() } });

// ---------- standaard Realistisch, overal ----------
{
  const { context, page } = await toestel(TELEFOON);
  for (const [pad, wat, t] of [
    ['#/oefening/veld-pv-4-4-keepers', 'partijvorm met keepers', 3],
    ['#/oefening/keeper-hd-over-de-liggende-keeper', 'keeper duikt over de liggende keeper', 2.2],
    ['#/oefening/veld-wu-loopscholing', 'loopvorm', 6],
    [`#/w/${code11}`, 'tactiekbord 11 tegen 11', 1.5],
  ]) {
    await ga(page, pad);
    const info = await drieD(page, wat);
    controle(info?.realistisch === true && info?.schaduwen === true, `${wat}: niet realistisch (${JSON.stringify(info)})`);
    await zetTijd(page, t);
    await slaap(250);
    await foto(page, `std-${shots.length}`, `Standaard Realistisch · ${wat}`);
  }
  // Zelfde scènes in Gewoon, ter vergelijking (duidelijkheid: hesjes, keepers, nummers, looplijnen).
  await page.evaluate(() => localStorage.setItem('trainersapp.poppetjes', 'gewoon'));
  for (const [pad, wat, t] of [
    ['#/oefening/veld-pv-4-4-keepers', 'partijvorm met keepers', 3],
    [`#/w/${code11}`, 'tactiekbord 11 tegen 11', 1.5],
  ]) {
    await ga(page, pad);
    const info = await drieD(page, wat);
    controle(info?.realistisch === false && info?.eenvoudig === false, `${wat}: Gewoon klopt niet (${JSON.stringify(info)})`);
    await zetTijd(page, t);
    await slaap(250);
    await foto(page, `gewoon-${shots.length}`, `Gewoon · ${wat}`);
  }
  // Looplijnen aan in Realistisch.
  await page.evaluate(() => {
    localStorage.removeItem('trainersapp.poppetjes');
    localStorage.setItem('trainersapp.looplijnen', '1');
  });
  await ga(page, '#/oefening/veld-pv-4-4-keepers');
  await drieD(page, 'looplijnen');
  await zetTijd(page, 4);
  await slaap(250);
  await foto(page, 'lijnen', 'Realistisch met looplijnen');
  await page.evaluate(() => localStorage.removeItem('trainersapp.looplijnen'));
  // Trainingsmodus.
  const nu = Date.now();
  await page.evaluate((nu) => {
    const t = { id: 't038', naam: 'Test 0.38', spelers: 8, keepers: 2, oefeningen: ['veld-pt-driehoek', 'keeper-wu-bal-om-je-lichaam'], gemaakt: nu, gewijzigd: nu };
    localStorage.setItem('trainersapp.trainingen', JSON.stringify({ versie: 1, trainingen: [t] }));
  }, nu);
  await ga(page, '#/training/t038/modus/1');
  const tm = await drieD(page, 'trainingsmodus');
  controle(tm?.realistisch === true, `trainingsmodus: niet realistisch (${JSON.stringify(tm)})`);
  await context.close();
}

// ---------- Instellingen: kiezen, onthouden, NL en EN ----------
for (const [taal, vp, naam] of [
  ['nl', TELEFOON, 'telefoon'],
  ['en', SE, 'SE'],
]) {
  const { context, page } = await toestel(vp, { 'trainersapp.taal': taal });
  await ga(page, '#/instellingen');
  await page.waitForSelector('#poppetjes .keuze', { timeout: 10000 }).catch(() => null);
  await page.evaluate(() => document.querySelector('#poppetjes')?.scrollIntoView({ block: 'center' }));
  const knoppen = await niveauKnoppen(page);
  const verwacht = taal === 'nl' ? ['Realistisch', 'Gewoon', 'Eenvoudig'] : ['Realistic', 'Standard', 'Simple'];
  controle(JSON.stringify(knoppen.map((k) => k.tekst)) === JSON.stringify(verwacht), `${taal}: knoppen ${JSON.stringify(knoppen)}`);
  controle(knoppen[0]?.aan === true, `${taal}: Realistisch staat niet standaard aan`);
  // Niets afgekapt, geen horizontaal scrollen.
  const afgekapt = await page.evaluate(() =>
    [...document.querySelectorAll('#poppetjes .keuze, #poppetjes p, #poppetjes h3')].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent),
  );
  controle(afgekapt.length === 0, `${taal}: afgekapt ${JSON.stringify(afgekapt)}`);
  controle(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${taal}: horizontaal scrollen`);
  await foto(page, `inst-${taal}`, `Instellingen (${taal.toUpperCase()}, ${naam}): standaard`, false);
  for (const [i, n] of [
    [1, 'gewoon'],
    [2, 'eenvoudig'],
    [0, 'realistisch'],
  ]) {
    await kies(page, verwacht[i]);
    await slaap(250);
    controle((await page.evaluate(() => localStorage.getItem('trainersapp.poppetjes'))) === n, `${taal}: ${n} niet bewaard`);
    if (taal === 'nl') {
      await ga(page, '#/oefening/keeper-ld-voetenwerk-lange-duik');
      const info = await drieD(page, n);
      controle(info?.realistisch === (n === 'realistisch') && info?.eenvoudig === (n === 'eenvoudig'), `${n}: 3D gebruikt het niet (${JSON.stringify(info)})`);
      await ga(page, '#/instellingen');
      await page.waitForSelector('#poppetjes .keuze', { timeout: 10000 }).catch(() => null);
    }
  }
  const tekst = await page.evaluate(() => document.querySelector('#poppetjes')?.textContent ?? '');
  controle(tekst.includes(taal === 'nl' ? 'Zelf gekozen' : 'Your own choice'), `${taal}: geen uitleg bij zelf gekozen`);
  await page.evaluate(() => document.querySelector('.poppetjes-auto')?.click());
  await slaap(250);
  controle((await page.evaluate(() => localStorage.getItem('trainersapp.poppetjes'))) === null, `${taal}: weer automatisch werkt niet`);
  await context.close();
}

// ---------- automatisch: traag toestel ----------
{
  const { context, page } = await toestel(TELEFOON, { 'trainersapp.3dAltijd': null, 'trainersapp.3dTraag': null, 'trainersapp.poppetjes': null, 'trainersapp.poppetjesAuto': null });
  const cdp = await page.target().createCDPSession();
  const traag = async (stap) => {
    await ga(page, '#/oefening/veld-pv-4-4-keepers');
    await page.waitForSelector('.speler-canvas-3d', { timeout: 25000 }).catch(() => null);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 14 });
    const melding = await page
      .waitForFunction(() => document.querySelector('.speler-melding')?.textContent ?? null, { timeout: 90000 })
      .then((h) => h.jsonValue())
      .catch(() => null);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await slaap(400);
    await foto(page, `auto-${stap}`, `Traag toestel, stap ${stap}: ${melding ?? 'geen melding'}`);
    return melding;
  };
  const m1 = await traag(1);
  controle(!!m1 && m1.includes('gewone poppetjes'), `traag toestel: eerst niet naar Gewoon (${m1})`);
  controle((await page.evaluate(() => localStorage.getItem('trainersapp.poppetjesAuto'))) === 'gewoon', 'traag toestel: Gewoon niet onthouden');
  const m2 = await traag(2);
  controle(!!m2 && m2.includes('eenvoudige poppetjes'), `traag toestel: daarna niet naar Eenvoudig (${m2})`);
  controle((await page.evaluate(() => localStorage.getItem('trainersapp.poppetjesAuto'))) === '1', 'traag toestel: Eenvoudig niet onthouden');
  await ga(page, '#/instellingen');
  await page.waitForSelector('#poppetjes .keuze', { timeout: 10000 }).catch(() => null);
  await page.evaluate(() => document.querySelector('#poppetjes')?.scrollIntoView({ block: 'center' }));
  const tekst = await page.evaluate(() => document.querySelector('#poppetjes')?.textContent ?? '');
  controle(tekst.includes('Automatisch lager gezet'), 'Instellingen: geen uitleg dat het automatisch lager staat');
  const knoppen = await niveauKnoppen(page);
  controle(knoppen[2]?.aan === true, `Instellingen: Eenvoudig staat niet aan (${JSON.stringify(knoppen)})`);
  await foto(page, 'auto-inst', 'Instellingen na automatisch lager zetten', false);
  await page.evaluate(() => document.querySelector('.poppetjes-auto')?.click());
  await slaap(250);
  controle((await niveauKnoppen(page))[0]?.aan === true, 'Weer automatisch: niet terug naar Realistisch');
  controle((await page.evaluate(() => localStorage.getItem('trainersapp.poppetjesAuto'))) === null, 'Weer automatisch: oude stand niet gewist');
  await context.close();
}

await blad(browser, shots, `${MAP}blad-0380.png`, 4, 2400);
await browser.close();
const echteFouten = [...new Set(fouten)].filter((f) => !/Failed to load resource|ERR_|favicon/.test(f));
if (echteFouten.length) problemen.push(`fouten in de browser: ${echteFouten.slice(0, 5).join(' | ')}`);
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of problemen) console.log(' -', p);
  process.exit(1);
}
console.log(`${shots.length} screenshots → blad-0380.png. Geen problemen gevonden.`);
