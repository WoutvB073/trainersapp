// 0.33.0: meerdere oefeningen in één onderdeel van een circuittraining, op iPhone SE en laptop, in NL en EN: toevoegen (Genereer en
// Kies), richttijd, verslepen, plan met Oefening 1, 2, 3, losse oefeningen openen (3D en 2D), materiaal, rondetimer, en de trainerslink
// zonder app en zonder account in de WhatsApp-browser op iPhone en Android. Blad: blad-0330.png.
// Gebruik: node tools/e2e/versie-0330.mjs [basis-url]. TAAL=nl voor één taal.
import { createJiti } from 'jiti';
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start } from './hulp.mjs';

const jiti = createJiti(import.meta.url);
const { EN } = await jiti.import('../../src/i18n/en.ts');

const browser = await start();
const problemen = [];
const fouten = [];
const shots = [];
const controle = (ok, t) => {
  if (!ok) problemen.push(t);
};
const CLUB = {
  id: 'meer',
  naam: 'Meer oefeningen',
  datums: ['2026-11-09'],
  leeftijd: 'jo8-11',
  kinderen: 12,
  groepjes: 3,
  trainers: ['Testtrainer 1'],
  blokken: {},
  onderdelen: [
    { id: 'a', categorie: 'loopcoordinatie', duur: 15, soort: 'stations', oefening: 'veld-lc-slalom' },
    { id: 'b', categorie: 'techniek', duur: 15, soort: 'stations', oefening: 'veld-tq-hooghouden' },
    { id: 'c', categorie: 'afwerken', duur: 15, soort: 'stations' },
    { id: 'd', categorie: 'partijvormen', duur: 10, soort: 'samen' },
  ],
  stationTrainers: {},
  veldTrainers: {},
  afgevinkt: [],
  gemaakt: 1,
  gewijzigd: 1,
};
const WHATSAPP = {
  iPhone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/2.25',
  Android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 WhatsApp/2.25',
};

for (const [formaat, vp] of [
  ['SE', { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['laptop', { width: 1366, height: 820, deviceScaleFactor: 1 }],
]) {
  for (const taal of process.env.TAAL ? [process.env.TAAL] : ['nl', 'en']) {
    const waar = `${taal} ${formaat}`;
    const T = (s, vars = {}) => {
      let x = taal === 'en' ? (EN[s] ?? s) : s;
      for (const [k, v] of Object.entries(vars)) x = x.replaceAll(`{${k}}`, v);
      return x;
    };
    const lc = T('Loopcoördinatie');
    const context = await browser.createBrowserContext();
    await context.overridePermissions(new URL(BASE).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
    const page = await context.newPage();
    await alsGeinstalleerd(page);
    await page.evaluateOnNewDocument(
      (taal, club) => {
        try {
          localStorage.setItem('trainersapp.taal', taal);
          localStorage.setItem('trainersapp.3dAltijd', '1');
          if (!localStorage.getItem('trainersapp.clubtrainingen')) localStorage.setItem('trainersapp.clubtrainingen', JSON.stringify({ versie: 1, lijst: [club] }));
        } catch {
          /* about:blank */
        }
      },
      taal,
      CLUB,
    );
    page.on('pageerror', (e) => fouten.push(`${waar}: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && !/WebGL|GPU/.test(m.text()) && fouten.push(`${waar}: ${m.text().slice(0, 140)}`));
    await page.setViewport(vp);

    const ga = async (pad) => {
      await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#${pad}`, { waitUntil: 'networkidle0' });
      await slaap(250);
    };
    const klik = async (p, tekst, sel = 'button') => {
      const ok = await p.evaluate(
        (tekst, sel) => {
          const b = [...document.querySelectorAll(sel)].find((x) => x.textContent.trim().startsWith(tekst) || x.getAttribute('aria-label') === tekst);
          b?.click();
          return !!b;
        },
        tekst,
        sel,
      );
      if (!ok) problemen.push(`${waar}: knop "${tekst}" niet gevonden op ${await p.evaluate(() => location.hash)}`);
      await slaap(250);
    };
    const foto = async (p, naam, tekst, heel = true) => {
      const pad = `${MAP}s0330-${taal}-${formaat}-${naam}.png`;
      await p.screenshot({ path: pad, fullPage: heel });
      shots.push([pad, `${waar}: ${tekst}`]);
    };
    const opmaak = async (p, stap) => {
      const r = await p.evaluate(() => ({
        breed: document.documentElement.scrollWidth - innerWidth,
        kap: [...document.querySelectorAll('button, h1, h2, h3, small')]
          .filter((e) => e.offsetParent && !e.closest('.kop') && !e.closest('.club-tabel-vak') && !e.closest('.club-oefening-keuze') && !e.closest('.speler-vak') && !e.closest('.speler-bediening') && e.scrollWidth > e.clientWidth + 2)
          .map((e) => e.textContent.slice(0, 40)),
      }));
      controle(r.breed <= 0, `${waar}: ${stap}: ${r.breed} px horizontaal scrollen`);
      controle(!r.kap.length, `${waar}: ${stap}: afgekapt: ${r.kap.slice(0, 3)}`);
    };
    const rijen = () => page.$$eval('.club-blok[data-id="a"] .club-oefening', (x) => x.map((e) => e.getAttribute('data-oefening')));

    // Toevoegen.
    await ga('/club/meer');
    controle((await rijen()).length === 1, `${waar}: één oefening verwacht`);
    controle(!(await page.$('.club-blok[data-id="a"] .club-richttijd')), `${waar}: richttijd bij één oefening`);
    await klik(page, T('Genereer {blok}', { blok: lc }));
    controle((await rijen()).length === 2, `${waar}: Genereer voegt geen oefening toe: ${await rijen()}`);
    await klik(page, T('Oefening kiezen voor {blok}', { blok: lc }));
    await page.waitForSelector('.toevoeg-knop');
    const gekozen = await page.$$eval('.toevoeg-knop.aan', (x) => x.length);
    controle(gekozen === 2, `${waar}: ${gekozen} gekozen in de lijst`);
    await page.evaluate(() => document.querySelector('.toevoeg-knop:not(.aan)').click());
    await page.waitForSelector('.club-blok[data-id="a"]');
    await slaap(300);
    controle((await rijen()).length === 3, `${waar}: Kies voegt geen oefening toe: ${await rijen()}`);

    // Richttijd: de rest wordt gelijk verdeeld.
    await page.$eval('.club-blok[data-id="a"] .club-richttijd input', (e) => e.focus());
    await page.keyboard.type('7');
    await slaap(250);
    const plaats = await page.$$eval('.club-blok[data-id="a"] .club-richttijd input', (x) => x.map((e) => e.value || e.placeholder));
    controle(plaats.join() === '7,4,4', `${waar}: richttijden ${plaats}`);

    // Verslepen: de derde naar boven.
    await page.evaluate(() => document.activeElement?.blur());
    const volgorde = await rijen();
    const r = await page.evaluate(() => {
      const greep = [...document.querySelectorAll('.club-blok[data-id="a"] .club-oefening-greep')];
      greep[2].scrollIntoView({ block: 'center' });
      const a = greep[2].getBoundingClientRect();
      const b = greep[0].getBoundingClientRect();
      return { x: a.x + a.width / 2, y: a.y + a.height / 2, y2: b.y - 4 };
    });
    await slaap(200);
    if (vp.hasTouch) {
      await page.touchscreen.touchStart(r.x, r.y);
      for (let i = 1; i <= 12; i += 1) {
        await page.touchscreen.touchMove(r.x, r.y + ((r.y2 - r.y) * i) / 12);
        await slaap(30);
      }
      await page.touchscreen.touchEnd();
    } else {
      await page.mouse.move(r.x, r.y);
      await page.mouse.down();
      await page.mouse.move(r.x, r.y + ((r.y2 - r.y) * 3) / 12, { steps: 4 });
      await page.mouse.move(r.x, r.y2, { steps: 10 });
      await slaap(120);
      await page.mouse.up();
    }
    await slaap(500);
    const nieuw = await rijen();
    controle(nieuw[0] === volgorde[2] && nieuw.length === 3, `${waar}: verslepen werkte niet: ${nieuw}`);
    await opmaak(page, 'bewerken');
    await foto(page, 'bewerk', 'Drie oefeningen in Loopcoördinatie');

    // Plan.
    await ga('/club/meer/plan');
    const vak = await page.$$eval('.club-vak', (x) => x.map((e) => e.textContent));
    const nummers = T('Oefening {lijst}', { lijst: '1, 2, 3' });
    controle(vak.some((t) => t.includes(nummers)), `${waar}: "${nummers}" niet in het plan: ${vak.join(' | ').slice(0, 200)}`);
    await foto(page, 'plan', 'Veldplan');
    await page.evaluate((n) => [...document.querySelectorAll('.club-vak')].find((e) => e.textContent.includes(n)).click(), nummers);
    await page.waitForSelector('.club-oefening-keuze');
    await slaap(400);
    controle((await page.evaluate(() => location.hash)) === '#/club/meer/blok/a', `${waar}: plan opent het onderdeel niet`);
    const namen = new Set();
    for (let i = 0; i < 3; i += 1) {
      await page.evaluate((i) => document.querySelectorAll('.club-oefening-keuze button')[i].click(), i);
      await slaap(500);
      namen.add(await page.evaluate(() => document.querySelector('.detail-titel')?.textContent));
      controle(!!(await page.$('.speler-vak')), `${waar}: oefening ${i + 1} heeft geen animatie`);
    }
    controle(namen.size === 3, `${waar}: oefeningen openen niet apart: ${[...namen]}`);
    await opmaak(page, 'onderdeel');
    await foto(page, 'blok', 'Oefening 1, 2, 3 openen', false);

    // Materiaal.
    await ga('/club/meer/plan');
    await klik(page, T('Materiaal'), '[role="tab"]');
    controle((await page.evaluate(() => document.body.innerText)).includes(T('De oefeningen in één onderdeel doe je na elkaar op dezelfde plek. Daarom telt per onderdeel het grootste aantal van elk soort materiaal, niet de som. Stations naast elkaar tellen wel op.').slice(0, 40)), `${waar}: uitleg materiaal ontbreekt`);

    // Rondetimer.
    await ga('/club/meer/timer');
    const timer = await page.$$eval('.club-ronde-oefeningen li', (x) => x.map((e) => e.className));
    controle(timer.length === 3 && timer[0] === 'nu', `${waar}: rondetimer: ${timer}`);
    await opmaak(page, 'timer');
    await foto(page, 'timer', 'Rondetimer');
    await page.evaluate(() => document.querySelector('.club-ronde-oefeningen button').click());
    await page.waitForSelector('.club-oefening-keuze');

    // Trainerslink zonder app en zonder account.
    await ga('/club/meer');
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    });
    await page.evaluate(() => navigator.clipboard.writeText(''));
    await klik(page, T('Deel met trainers'));
    await page.waitForFunction(() => navigator.clipboard.readText().then((t) => t.length > 0), { timeout: 12000, polling: 200 });
    const link = (await page.evaluate(() => navigator.clipboard.readText())).split(/\r?\n/).pop();
    for (const [toestel, ua] of Object.entries(WHATSAPP)) {
      const ander = await browser.createBrowserContext();
      const p2 = await ander.newPage();
      await p2.setUserAgent(ua);
      await p2.evaluateOnNewDocument((taal) => {
        try {
          localStorage.setItem('trainersapp.taal', taal);
          localStorage.setItem('trainersapp.3dAltijd', '1');
        } catch {
          /* about:blank */
        }
      }, taal);
      p2.on('pageerror', (e) => fouten.push(`${waar} ${toestel}: ${e.message}`));
      await p2.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await p2.goto(link, { waitUntil: 'networkidle0' });
      await slaap(400);
      const hoofd = await p2.evaluate(() => ({ titel: document.querySelector('.detail-titel')?.textContent, knop: document.querySelector('.club-station-knoppen button')?.textContent ?? '', poort: !!document.querySelector('.installeren, .installatie') }));
      controle(hoofd.titel === 'Meer oefeningen' && !hoofd.poort, `${waar} ${toestel}: trainerslink ${JSON.stringify(hoofd)}`);
      controle(hoofd.knop.includes(nummers), `${waar} ${toestel}: geen "${nummers}" bij het station: ${hoofd.knop}`);
      await p2.evaluate(() => document.querySelector('.club-station-knoppen button').click());
      await p2.waitForSelector('.club-oefening-keuze');
      await slaap(500);
      const titels = new Set();
      for (let i = 0; i < 3; i += 1) {
        await p2.evaluate((i) => document.querySelectorAll('.club-oefening-keuze button')[i].click(), i);
        await slaap(600);
        titels.add(await p2.evaluate(() => document.querySelector('.detail-titel')?.textContent));
        const heeft = await p2.evaluate(() => ({ uitleg: document.querySelectorAll('.blok').length, animatie: !!document.querySelector('.speler-vak'), knoppen: [...document.querySelectorAll('.speler-groep button')].map((b) => b.textContent) }));
        controle(heeft.animatie && heeft.uitleg >= 3 && heeft.knoppen.includes('2D') && heeft.knoppen.includes('3D'), `${waar} ${toestel}: oefening ${i + 1}: ${JSON.stringify(heeft)}`);
      }
      controle(titels.size === 3, `${waar} ${toestel}: oefeningen: ${[...titels]}`);
      await p2.evaluate(() => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === '2D')?.click());
      await slaap(300);
      await opmaak(p2, `trainerslink ${toestel}`);
      if (toestel === 'iPhone' && formaat === 'SE') await foto(p2, 'link', 'Trainerslink in WhatsApp', false);
      await ander.close();
    }
    await context.close();
    console.log(`${waar}: klaar`);
  }
}

await blad(browser, shots, `${MAP}blad-0330.png`, 6, 2600);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)].slice(0, 40)) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
