// 0.21.0 in de browser: realistischere 3D-poppetjes.
// - Snelheidsknop 0,5× / 1× / 2× (en de animatie loopt echt zo snel)
// - Instellingen → "Eenvoudige poppetjes": aan/uit, onthouden, 3D gebruikt ze
// - Automatisch: op een (nagebootst) traag toestel eerst eenvoudige poppetjes, daarna zo nodig 2D
// - Het nieuwe poppetje overal: bibliotheek, trainingsmodus, tactiekbord (11 tegen 11, met namen), spelhervatting,
//   gedeelde link; 2D blijft werken
// Screenshots: blad-021.png. Gebruik: node tools/e2e/versie-021.mjs [basis-url]
import { createJiti } from 'jiti';
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, zetTijd } from './hulp.mjs';

const jiti = createJiti(import.meta.url);
const { opgesteldBord, wedstrijdCode } = await jiti.import('../../src/wedstrijd/wedstrijd.ts');
const { VOORBEELDEN } = await jiti.import('../../src/wedstrijd/hervattingen.ts');
const { maakTijdlijn, standOp } = await jiti.import('../../src/anim/timeline.ts');
const fs = await import('node:fs');
const duik = JSON.parse(fs.readFileSync(new URL('../../src/data/oefeningen/keepers/laag-duiken.json', import.meta.url), 'utf8')).find((o) => o.id === 'keeper-ld-voetenwerk-lange-duik');
const kp = standOp(maakTijdlijn(duik.tekening), 1.5).objecten.get('k1');

const browser = await start();
const fouten = [];
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};
const TELEFOON = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const shots = [];

async function toestel(viewport, extra = {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument((extra) => {
    try {
      localStorage.setItem('trainersapp.testCamera', '1');
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
  await page.goto(`${BASE}?r=v21${r++}${Date.now() % 1000}${hash}`, { waitUntil: 'domcontentloaded' });
  await slaap(500);
};
const drieD = async (page, wat) => {
  const ok = await page.waitForSelector('.speler-canvas-3d', { timeout: 20000 }).catch(() => null);
  controle(!!ok, `${wat}: geen 3D`);
  await slaap(500);
  const info = await page.evaluate(() => window.__info3d?.() ?? null);
  controle(!!info && info.poppetjes > 0, `${wat}: geen poppetjes in 3D (${JSON.stringify(info)})`);
  return info;
};
const foto = async (page, naam, tekst) => {
  const pad = `${MAP}v21-${naam}.png`;
  await page.screenshot({ path: pad });
  shots.push([pad, tekst]);
};

// ---------- snelheidsknop ----------
{
  const { context, page } = await toestel(TELEFOON);
  await ga(page, '#/oefening/veld-pt-driehoek');
  await drieD(page, 'oefening');
  const knoppen = await page.evaluate(() => [...document.querySelectorAll('.snelheid button')].map((b) => b.textContent));
  controle(JSON.stringify(knoppen) === JSON.stringify(['0,5×', '1×', '2×']), `snelheidsknoppen: ${JSON.stringify(knoppen)}`);
  const tempo = async (tekst) => {
    await page.evaluate((tekst) => [...document.querySelectorAll('.snelheid button')].find((b) => b.textContent === tekst)?.click(), tekst);
    await zetTijd(page, 0.5);
    await page.evaluate(() => document.querySelector('[aria-label="Afspelen"]')?.click());
    const t0 = await page.evaluate(() => [Number(document.querySelector('.speler-balk').value), performance.now()]);
    await slaap(1500);
    const t1 = await page.evaluate(() => [Number(document.querySelector('.speler-balk').value), performance.now()]);
    return (t1[0] - t0[0]) / ((t1[1] - t0[1]) / 1000);
  };
  const half = await tempo('0,5×');
  const een = await tempo('1×');
  const twee = await tempo('2×');
  controle(Math.abs(half - 0.5) < 0.12 && Math.abs(een - 1) < 0.15 && Math.abs(twee - 2) < 0.3, `tempo 0,5×/1×/2×: ${half.toFixed(2)} / ${een.toFixed(2)} / ${twee.toFixed(2)}`);
  const aan = await page.evaluate(() => document.querySelector('.snelheid button.aan')?.textContent);
  controle(aan === '2×', `gekozen snelheid: ${aan}`);
  await zetTijd(page, 2.2);
  await foto(page, 'snelheid', `Snelheidsknop 0,5× · 1× · 2× (gemeten ${half.toFixed(2)} / ${een.toFixed(2)} / ${twee.toFixed(2)})`);
  await context.close();
}

// ---------- instelling Eenvoudige poppetjes ----------
{
  const { context, page } = await toestel(TELEFOON);
  await ga(page, '#/instellingen');
  const vak = await page.waitForFunction(() => [...document.querySelectorAll('label')].find((l) => l.textContent.includes('Eenvoudige poppetjes')), { timeout: 8000 }).catch(() => null);
  controle(!!vak, 'Instellingen: schakelaar Eenvoudige poppetjes ontbreekt');
  await page.evaluate(() => [...document.querySelectorAll('label')].find((l) => l.textContent.includes('Eenvoudige poppetjes'))?.scrollIntoView({ block: 'center' }));
  await page.evaluate(() =>
    [...document.querySelectorAll('label')]
      .find((l) => l.textContent.includes('Eenvoudige poppetjes'))
      ?.querySelector('input')
      ?.click(),
  );
  await slaap(300);
  controle((await page.evaluate(() => localStorage.getItem('trainersapp.poppetjes'))) === 'eenvoudig', 'Eenvoudige poppetjes aanzetten wordt niet bewaard');
  await foto(page, 'instelling', 'Instellingen: 3D-animaties → Eenvoudige poppetjes');
  await ga(page, '#/oefening/keeper-ld-voetenwerk-lange-duik');
  const info = await drieD(page, 'eenvoudig');
  controle(info?.eenvoudig === true, `3D gebruikt geen eenvoudige poppetjes: ${JSON.stringify(info)}`);
  await page.evaluate((x, y) => window.__camera3d?.(x, y, 5), kp.x, kp.y);
  await zetTijd(page, 1.5);
  await foto(page, 'eenvoudig', `Eenvoudige poppetjes (${info?.tekenopdrachten} tekenopdrachten)`);
  await ga(page, '#/instellingen');
  await slaap(300);
  await page.evaluate(() =>
    [...document.querySelectorAll('label')]
      .find((l) => l.textContent.includes('Eenvoudige poppetjes'))
      ?.querySelector('input')
      ?.click(),
  );
  await ga(page, '#/oefening/keeper-ld-voetenwerk-lange-duik');
  const info2 = await drieD(page, 'gewoon');
  controle(info2?.eenvoudig === false, `Uitzetten werkt niet: ${JSON.stringify(info2)}`);
  await page.evaluate((x, y) => window.__camera3d?.(x, y, 5), kp.x, kp.y);
  await zetTijd(page, 1.5);
  await foto(page, 'gewoon', `Gewone poppetjes (${info2?.tekenopdrachten} tekenopdrachten)`);
  await context.close();
}

// ---------- automatisch: traag toestel ----------
{
  const { context, page } = await toestel(TELEFOON, { 'trainersapp.3dAltijd': null, 'trainersapp.3dTraag': null });
  const cdp = await page.target().createCDPSession();
  await ga(page, '#/oefening/veld-pv-4-4-keepers');
  await page.waitForSelector('.speler-canvas-3d', { timeout: 20000 }).catch(() => null);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 12 });
  const melding = await page
    .waitForFunction(() => document.querySelector('.speler-melding')?.textContent.includes('eenvoudige poppetjes'), { timeout: 60000 })
    .then(() => page.evaluate(() => document.querySelector('.speler-melding').textContent))
    .catch(() => null);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  controle(!!melding, 'Traag toestel: geen melding over eenvoudige poppetjes');
  controle((await page.evaluate(() => localStorage.getItem('trainersapp.poppetjesAuto'))) === '1', 'Traag toestel: eenvoudige poppetjes niet automatisch aangezet');
  await foto(page, 'automatisch', 'Traag toestel: automatisch eenvoudige poppetjes (melding)');
  await ga(page, '#/instellingen');
  await slaap(300);
  const uitleg = await page.evaluate(() => document.body.textContent.includes('Automatisch aangezet'));
  controle(uitleg, 'Instellingen: geen uitleg dat het automatisch aanstaat');
  await page.evaluate(() => [...document.querySelectorAll('label')].find((l) => l.textContent.includes('Eenvoudige poppetjes'))?.scrollIntoView({ block: 'center' }));
  await foto(page, 'automatisch-instelling', 'Instellingen na automatisch aanzetten');
  await context.close();
}

// ---------- het nieuwe poppetje overal ----------
{
  const { context, page } = await toestel(TELEFOON);
  // Trainingsmodus (training klaarzetten in de opslag).
  const nu = Date.now();
  await page.evaluateOnNewDocument((nu) => {
    try {
      const t = { id: 't021', naam: 'Test 0.21', spelers: 8, keepers: 2, oefeningen: ['veld-wu-loopscholing', 'keeper-ld-voetenwerk-lange-duik'], gemaakt: nu, gewijzigd: nu };
      if (!localStorage.getItem('trainersapp.trainingen')) localStorage.setItem('trainersapp.trainingen', JSON.stringify({ versie: 1, trainingen: [t] }));
    } catch {
      /* about:blank */
    }
  }, nu);
  await ga(page, '#/training/t021/modus/1');
  await drieD(page, 'trainingsmodus');
  await zetTijd(page, 9);
  await foto(page, 'modus', 'Trainingsmodus: loopscholing (hakken-billen, knieheffen)');

  // Tactiekbord 11 tegen 11 met namen (gedeelde link).
  const t = opgesteldBord('11v11', '1-4-3-3');
  for (const o of t.objecten) if (o.soort === 'speler' && o.team === 'A') o.naam = `Speler ${o.nummer}`;
  const lijnen = t.objecten
    .filter((o) => o.soort === 'speler')
    .map((o) => ({
      soort: 'loop',
      punten: [
        [o.x, o.y],
        [o.x, o.y + (o.team === 'A' ? -8 : 8)],
      ],
      van: o.id,
      stap: 1,
    }));
  const code = wedstrijdCode({ soort: 'bord', bord: { naam: '11 tegen 11', soort: 'tactiek', tekening: { ...t, namen: true, lijnen } } });
  await ga(page, `#/w/${code}`);
  const info = await drieD(page, 'tactiekbord');
  controle(info?.poppetjes === 22, `tactiekbord: ${info?.poppetjes} poppetjes`);
  await zetTijd(page, 1);
  await foto(page, 'bord', 'Tactiekbord 11 tegen 11 met namen (gedeelde link)');
  await page.evaluate(() => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === '2D')?.click());
  await slaap(500);
  controle(await page.evaluate(() => !!document.querySelector('.speler-canvas:not(.speler-canvas-3d)')), 'tactiekbord: 2D werkt niet');
  await foto(page, 'bord-2d', 'Zelfde bord in 2D (ongewijzigd)');
  await page.evaluate(() => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === '3D')?.click());

  // Spelhervatting (voorbeeld corner).
  const v = VOORBEELDEN[0];
  const codeH = wedstrijdCode({ soort: 'bord', bord: { naam: v.naam, soort: 'hervatting', tekening: v.maak() } });
  await ga(page, `#/w/${codeH}`);
  await drieD(page, 'spelhervatting');
  await zetTijd(page, 2.4);
  await foto(page, 'hervatting', `Spelhervatting: ${v.naam}`);
  await context.close();
}

await blad(browser, shots, `${MAP}blad-021.png`, 4, 2000);
await browser.close();
const echt = fouten.filter((f) => !f.includes('favicon'));
if (echt.length) console.log('FOUTEN:', [...new Set(echt)].slice(0, 10));
console.log(problemen.length ? `PROBLEMEN (${problemen.length}):\n- ${problemen.join('\n- ')}` : 'Alles goed.');
console.log(`${shots.length} screenshots → blad-021.png`);
process.exit(problemen.length || echt.length ? 1 : 0);
