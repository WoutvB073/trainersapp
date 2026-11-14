// Opstelling slepen (fase 1 van de volgende stap): wat je ziet meeschuiven is waar de speler landt. Met de vinger op iPhone SE, een gewone
// telefoon en een tablet, en met de muis op een tablet en een laptop: vrij neerzetten (ook vastgepakt bij de naam en met een gescrolde
// pagina), vastklikken op een andere positie met markering vóór het loslaten (ruilen), net naast een andere speler blijft hij staan,
// wissel naar het veld, speler naar de bank, lege positie verslepen, buiten het veld en de rand van het veld.
// Blad: blad-opstelling.png. Gebruik: node tools/e2e/opstelling.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start } from './hulp.mjs';

const browser = await start();
const problemen = [];
const fouten = [];
const shots = [];
const controle = (ok, t) => {
  if (!ok) problemen.push(t);
};
const plekken = [
  ['p1', 0.5, 0.94, 1],
  ['p2', 0.12, 0.8, 2],
  ['p3', 0.373, 0.8, 3],
  ['p4', 0.627, 0.8, 4],
  ['p5', 0.88, 0.8, 5],
  ['p6', 0.2, 0.55, 6],
  ['p7', 0.5, 0.55, 7],
  ['p8', 0.8, 0.55, 8],
  ['p9', 0.2, 0.3, 9],
  ['p10', 0.5, 0.3, 10],
  ['p11', 0.8, 0.3, 11],
].map(([id, x, y, nummer], i) => ({ id, x, y, nummer, ...(i < 10 ? { naam: `Speler ${i + 1}` } : {}) }));
const O = { id: 'o1', naam: 'Test', spelvorm: '11v11', formatie: '1-4-3-3', plekken, wissels: ['Wissel 1', 'Wissel 2'], gemaakt: 1, gewijzigd: 1 };
const afstand = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

for (const [naam, vp, aanraak] of [
  ['iPhone SE vinger', { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, true],
  ['telefoon vinger', { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, true],
  ['tablet vinger', { width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, true],
  ['tablet muis', { width: 820, height: 1180, deviceScaleFactor: 2 }, false],
  ['laptop muis', { width: 1366, height: 820, deviceScaleFactor: 1 }, false],
]) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument((o) => {
    try {
      if (!localStorage.getItem('trainersapp.opstellingen')) localStorage.setItem('trainersapp.opstellingen', JSON.stringify({ versie: 1, lijst: [o] }));
    } catch {
      /* about:blank */
    }
  }, O);
  page.on('pageerror', (e) => fouten.push(`${naam}: ${e.message}`));
  await page.setViewport(vp);
  await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#/opstelling/o1`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.opst-plek');
  await page.bringToFront();
  const cdp = await page.createCDPSession();

  const midden = (sel) =>
    page.evaluate((sel) => {
      const e = document.querySelector(sel);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    }, sel);
  const cirkel = (id) => midden(`[data-plek="${id}"] .opst-nr`);
  /** Zo scrollen dat deze elementen allemaal in beeld staan (onder de kop); daarna pas meten. */
  const toon = async (...sels) => {
    await page.evaluate((sels) => {
      const rs = sels.map((s) => document.querySelector(s).getBoundingClientRect());
      const boven = Math.min(...rs.map((x) => x.top));
      const onder = Math.max(...rs.map((x) => x.bottom));
      if (boven < 90) window.scrollBy(0, boven - 90);
      else if (onder > innerHeight - 24) window.scrollBy(0, Math.min(onder - innerHeight + 24, boven - 90));
    }, sels);
    await slaap(140);
  };
  const P = (id) => `[data-plek="${id}"]`;
  const wie = (id) => page.$eval(`[data-plek="${id}"] .opst-naam`, (e) => e.textContent).catch(() => '');
  const bank = () => page.$$eval('.opst-wissel-naam', (x) => x.map((e) => e.textContent).join(','));
  const opgeslagen = () => page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.opstellingen')).lijst[0]);
  /** Wat er tijdens het slepen te zien is, vlak voor het loslaten. */
  const kijk = () =>
    page.evaluate(() => {
      const g = document.querySelector('.opst-geest');
      const nr = g?.querySelector('.opst-nr')?.getBoundingClientRect();
      return {
        geest: nr ? [nr.left + nr.width / 2, nr.top + nr.height / 2] : null,
        uitleg: g?.querySelector('.opst-geest-uitleg')?.textContent ?? '',
        doelSoort: g?.dataset.doel ?? '',
        doelPlek: document.querySelector('.opst-plek.doel:not(.opst-geest)')?.dataset.plek ?? '',
        doelMidden: (() => {
          const d = document.querySelector('.opst-plek.doel:not(.opst-geest) .opst-nr')?.getBoundingClientRect();
          return d ? [d.left + d.width / 2, d.top + d.height / 2] : null;
        })(),
        bankDoel: !!document.querySelector('.opst-bank.doel'),
        vaag: document.querySelector('.opst-plek.versleept, .opst-wissel.versleept') ? 1 : 0,
      };
    });
  /** Slepen; `foto` = naam voor een screenshot vlak voor het loslaten. */
  const sleep = async ([x0, y0], [x1, y1], foto) => {
    const n = 14;
    if (aanraak) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 0 }] });
      for (let i = 1; i <= n; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + ((x1 - x0) * i) / n, y: y0 + ((y1 - y0) * i) / n, id: 0 }] });
    } else {
      await page.mouse.move(x0, y0);
      await page.mouse.down();
      for (let i = 1; i <= n; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n);
    }
    await slaap(90);
    const gezien = await kijk();
    if (foto) {
      const pad = `${MAP}sopst-${naam.replaceAll(' ', '-')}-${foto[0]}.png`;
      await page.screenshot({ path: pad });
      shots.push([pad, `${naam}: ${foto[1]}`]);
    }
    if (aanraak) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    else await page.mouse.up();
    await slaap(160);
    return gezien;
  };

  // A. Vrij neerzetten, vastgepakt in het midden van het rondje.
  await toon(P('p7'));
  let van = await cirkel('p7');
  let doel = [van[0] + 44, van[1] - 58];
  let g = await sleep(van, doel, naam.startsWith('laptop') ? ['vrij', 'vrij neerzetten: de speler zelf schuift mee'] : null);
  let nu = await cirkel('p7');
  controle(g.geest && afstand(g.geest, nu) <= 2 && afstand(nu, doel) <= 2, `${naam} A: landt niet waar je hem zag (zag ${g.geest?.map(Math.round)}, landt ${nu.map(Math.round)}, losgelaten ${doel.map(Math.round)})`);
  controle(g.doelSoort === 'vrij' && !g.doelPlek && g.vaag === 1 && !g.uitleg, `${naam} A: tijdens het slepen: ${JSON.stringify(g)}`);
  controle((await wie('p7')) === 'Speler 7', `${naam} A: speler 7 is van positie veranderd`);

  // B. Vastgepakt bij de naam: geen sprong.
  await toon(P('p10'));
  const c0 = await cirkel('p10');
  van = await midden('[data-plek="p10"] .opst-naam');
  g = await sleep(van, [van[0] + 30, van[1] - 30]);
  nu = await cirkel('p10');
  controle(afstand(nu, [c0[0] + 30, c0[1] - 30]) <= 2 && afstand(g.geest, nu) <= 2, `${naam} B: sprong bij vastpakken aan de naam (${nu.map(Math.round)} i.p.v. ${[c0[0] + 30, c0[1] - 30].map(Math.round)})`);

  // C. Met een gescrolde pagina.
  await page.evaluate(() => window.scrollTo(0, 60));
  await slaap(120);
  van = await cirkel('p6');
  doel = [van[0] + 26, van[1] + 48];
  g = await sleep(van, doel);
  nu = await cirkel('p6');
  controle(g.geest && afstand(g.geest, nu) <= 2 && afstand(nu, doel) <= 2, `${naam} C: gescrold: zag ${g.geest?.map(Math.round)}, landt ${nu.map(Math.round)}, losgelaten ${doel.map(Math.round)}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await slaap(120);

  // D. Vlak bij een andere speler: klikt zichtbaar vast (markering en uitleg vóór het loslaten), daarna geruild.
  await toon(P('p3'), P('p4'));
  van = await cirkel('p3');
  let ander = await cirkel('p4');
  g = await sleep(van, [ander[0] - 14, ander[1] + 10], naam.startsWith('iPhone') ? ['ruil', 'vlak bij een andere speler: klikt vast, positie licht op, "Ruilen met …"'] : null);
  controle(g.doelPlek === 'p4' && g.doelSoort === 'plek' && /Speler 4/.test(g.uitleg) && afstand(g.geest, g.doelMidden) <= 2 && afstand(g.geest, ander) <= 2, `${naam} D: geen duidelijke markering vóór het ruilen: ${JSON.stringify(g)}`);
  controle((await wie('p3')) === 'Speler 4' && (await wie('p4')) === 'Speler 3', `${naam} D: niet geruild: p3 ${await wie('p3')}, p4 ${await wie('p4')}`);
  controle(afstand(await cirkel('p4'), ander) <= 1, `${naam} D: de positie zelf is verschoven bij het ruilen`);

  // E. Net naast een andere speler (op zijn naamlabel, buiten het vangbereik): blijft daar staan, er wordt niet geruild.
  await toon(P('p2'), P('p3'));
  van = await cirkel('p2');
  ander = await cirkel('p3');
  doel = [ander[0] - 38, ander[1] + 24];
  g = await sleep(van, doel);
  nu = await cirkel('p2');
  controle(g.doelSoort === 'vrij' && !g.doelPlek && afstand(nu, doel) <= 2, `${naam} E: naast een speler niet vrij neergezet: ${JSON.stringify(g)} → ${nu.map(Math.round)}`);
  controle((await wie('p2')) === 'Speler 2' && (await wie('p3')) === 'Speler 4', `${naam} E: toch geruild`);

  // F. Wissel naar het veld: klikt vast op de dichtstbijzijnde positie (hier de lege p11), met markering.
  await toon(P('p11'), '[data-naam="Wissel 1"]');
  van = await midden('[data-naam="Wissel 1"]');
  const leeg = await cirkel('p11');
  g = await sleep(van, [leeg[0] + 28, leeg[1] - 42], naam.startsWith('telefoon') ? ['wissel', 'wissel naar het veld: dichtstbijzijnde positie licht op'] : null);
  controle(g.doelPlek === 'p11' && /11/.test(g.uitleg) && afstand(g.geest, leeg) <= 2, `${naam} F: wissel klikt niet zichtbaar vast: ${JSON.stringify(g)}`);
  controle((await wie('p11')) === 'Wissel 1' && (await bank()) === 'Wissel 2', `${naam} F: wissel niet op p11: ${await wie('p11')} / bank ${await bank()}`);

  // G. Wissel op een bezette positie: die speler gaat naar de bank.
  await toon(P('p9'), '[data-naam="Wissel 2"]');
  van = await midden('[data-naam="Wissel 2"]');
  ander = await cirkel('p9');
  g = await sleep(van, [ander[0] + 8, ander[1] + 6]);
  controle(g.doelPlek === 'p9' && /Speler 9/.test(g.uitleg), `${naam} G: uitleg bij wissel op een bezette positie: ${JSON.stringify(g)}`);
  controle((await wie('p9')) === 'Wissel 2' && (await bank()) === 'Speler 9', `${naam} G: p9 ${await wie('p9')}, bank ${await bank()}`);

  // H. Speler naar de bank: de bank licht op vóór het loslaten.
  await toon(P('p8'), '.opst-bank');
  van = await cirkel('p8');
  const bankPunt = await midden('.opst-bank');
  g = await sleep(van, bankPunt, naam.startsWith('tablet vinger') ? ['bank', 'naar de wissels: de bank licht op'] : null);
  controle(g.bankDoel && g.doelSoort === 'bank' && !!g.uitleg, `${naam} H: bank niet gemarkeerd: ${JSON.stringify(g)}`);
  controle((await wie('p8')) === '' && (await bank()).includes('Speler 8'), `${naam} H: speler 8 niet op de bank: ${await bank()}`);

  // I. Lege positie verslepen: vrij, ook vlak bij een andere positie (geen ruil).
  await toon(P('p8'), P('p5'));
  van = await cirkel('p8');
  ander = await cirkel('p5');
  doel = [ander[0] - 12, ander[1] - 16];
  g = await sleep(van, doel);
  nu = await cirkel('p8');
  controle(g.doelSoort === 'vrij' && afstand(nu, doel) <= 2 && (await wie('p5')) === 'Speler 5', `${naam} I: lege positie: ${JSON.stringify(g)} → ${nu.map(Math.round)}`);

  // J. Buiten het veld en de bank loslaten: er verandert niets (de speler is vaag).
  const voor = JSON.stringify((await opgeslagen()).plekken);
  await page.evaluate(() => window.scrollTo(0, 0));
  await slaap(140);
  van = await cirkel('p1');
  g = await sleep(van, [van[0], 20]);
  const kanNiet = await page.evaluate(() => 1);
  controle(g.doelSoort === 'geen' && JSON.stringify((await opgeslagen()).plekken) === voor && kanNiet === 1, `${naam} J: buiten het veld loslaten veranderde iets: ${JSON.stringify(g)}`);

  // K. Tegen de rand: hij stopt zichtbaar aan de rand en landt daar.
  await toon(P('p2'));
  van = await cirkel('p2');
  const veld = await page.evaluate(() => {
    const r = document.querySelector('.opst-veld').getBoundingClientRect();
    return { rechts: r.right, links: r.left, breed: r.width };
  });
  g = await sleep(van, [veld.links + 2, van[1] - 20]);
  nu = await cirkel('p2');
  const px = (await opgeslagen()).plekken.find((p) => p.id === 'p2').x;
  controle(px === 0.03 && afstand(g.geest, nu) <= 2, `${naam} K: rand: x = ${px}, zag ${g.geest?.map(Math.round)}, landt ${nu.map(Math.round)}`);

  // M. Een lege positie staat op dezelfde hoogte als een bezette: het rondje verspringt niet als er een speler op komt of af gaat.
  {
    const hoogte = await page.evaluate(() => {
      const v = document.querySelector('.opst-veld').getBoundingClientRect();
      return [...document.querySelectorAll('.opst-veld .opst-plek')].map((e) => {
        const nr = e.querySelector('.opst-nr').getBoundingClientRect();
        return Math.abs(nr.top + nr.height / 2 - (v.top + (parseFloat(e.style.top) / 100) * v.height - 4));
      });
    });
    controle(Math.max(...hoogte) <= 1.5, `${naam} M: een positie staat niet op zijn plek (afwijking ${Math.max(...hoogte).toFixed(1)} px)`);
  }

  // L. Tikken werkt nog: speler aantikken en dan een andere positie = ruilen.
  const tik = async (p) => {
    if (aanraak) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p[0], y: p[1], id: 0 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else await page.mouse.click(p[0], p[1]);
    await slaap(160);
  };
  await toon(P('p6'), P('p7'));
  await tik(await cirkel('p6'));
  await tik(await cirkel('p7'));
  controle((await wie('p6')) === 'Speler 7' && (await wie('p7')) === 'Speler 6', `${naam} L: tikken ruilt niet: p6 ${await wie('p6')}, p7 ${await wie('p7')}`);

  await context.close();
  console.log(`${naam}: klaar`);
}

if (shots.length) await blad(browser, shots, `${MAP}blad-opstelling.png`, 4, 2000);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)].slice(0, 40)) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
