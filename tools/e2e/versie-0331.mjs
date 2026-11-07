// 0.33.1: meer trainers per station op iPhone SE en laptop in NL en EN: automatisch verdelen (10 trainers over 4 stations), aanvinken,
// botsing met melding, verplaatsen, Automatisch verdelen, partijvelden, rotatie, rondetimer, meelopen met een groepje, oude training, en de
// trainerslink zonder app in de WhatsApp-browser op iPhone en Android met Ik ben… (onthouden). Blad: blad-0331.png.
// Gebruik: node tools/e2e/versie-0331.mjs [basis-url]. TAAL=nl voor één taal. EMULATOR=1: de korte link (`npm run emulator`).
// ECHT=1 met de online URL: korte link op de echte site; de link wordt ingetrokken, daarna `node tools/firebase-anoniem-opruimen.cjs <starttijd>`.
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
const NAMEN = Array.from({ length: 10 }, (_, i) => `Testtrainer ${i + 1}`);
const basis = { datums: ['2026-11-09'], leeftijd: 'jo8-11', blokken: {}, stationTrainers: {}, veldTrainers: {}, afgevinkt: [], gemaakt: 1, gewijzigd: 1 };
const CLUB = {
  ...basis,
  id: 'tien',
  naam: 'Tien trainers',
  kinderen: 16,
  groepjes: 4,
  trainers: NAMEN,
  onderdelen: [
    { id: 'a', categorie: 'loopcoordinatie', duur: 15, soort: 'stations', oefening: 'veld-lc-slalom', oefeningen: [{ oefening: 'veld-lc-slalom' }, { oefening: 'veld-lc-vallende-pion' }] },
    { id: 'b', categorie: 'techniek', duur: 15, soort: 'stations', oefening: 'veld-tq-hooghouden' },
    { id: 'c', categorie: 'afwerken', duur: 15, soort: 'stations', oefening: 'veld-af-dribbel-afronden' },
    { id: 'd', categorie: 'pass-en-trap', duur: 15, soort: 'stations' },
    { id: 'e', categorie: 'partijvormen', duur: 10, soort: 'samen' },
  ],
};
const OUD = { ...basis, id: 'oud', naam: 'Oude training', leeftijd: 'mini-5-7', kinderen: 30, groepjes: 6, trainers: ['Testtrainer 1', 'Testtrainer 2'], stationTrainers: { 1: 'Testtrainer 2' } };
const WHATSAPP = {
  iPhone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/2.25',
  Android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 WhatsApp/2.25',
};
const ECHT = !!process.env.ECHT;
const EMULATOR = !!process.env.EMULATOR;

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
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await alsGeinstalleerd(page);
    await page.evaluateOnNewDocument(
      (taal, lijst, emulator) => {
        try {
          localStorage.setItem('trainersapp.taal', taal);
          if (emulator) localStorage.setItem('trainersapp.emulator', '1');
          if (!localStorage.getItem('trainersapp.clubtrainingen')) localStorage.setItem('trainersapp.clubtrainingen', JSON.stringify({ versie: 1, lijst }));
        } catch {
          /* about:blank */
        }
      },
      taal,
      [CLUB, OUD],
      EMULATOR,
    );
    page.on('pageerror', (e) => fouten.push(`${waar}: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && !/WebGL|GPU/.test(m.text()) && fouten.push(`${waar}: ${m.text().slice(0, 140)}`));
    page.on('dialog', (d) => void d.accept());
    await page.setViewport(vp);

    const ga = async (pad) => {
      await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#${pad}`, { waitUntil: ECHT ? 'domcontentloaded' : 'networkidle0' });
      await slaap(ECHT ? 900 : 250);
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
      const pad = `${MAP}s0331-${taal}-${formaat}-${naam}.png`;
      await p.screenshot({ path: pad, fullPage: heel });
      shots.push([pad, `${waar}: ${tekst}`]);
    };
    const opmaak = async (p, stap) => {
      const r = await p.evaluate(() => ({
        breed: document.documentElement.scrollWidth - innerWidth,
        kap: [...document.querySelectorAll('button, h1, h2, h3, small, summary b, select')]
          .filter((e) => e.offsetParent && !e.closest('.kop') && !e.closest('.club-tabel-vak') && !e.closest('.club-vak') && e.tagName !== 'SELECT' && e.scrollWidth > e.clientWidth + 2)
          .map((e) => e.textContent.slice(0, 40)),
      }));
      controle(r.breed <= 0, `${waar}: ${stap}: ${r.breed} px horizontaal scrollen`);
      controle(!r.kap.length, `${waar}: ${stap}: afgekapt: ${r.kap.slice(0, 3)}`);
    };
    /** Per plek de namen. */
    const ploegen = () => page.$$eval('.club-plek-kies summary span', (x) => x.map((e) => e.textContent.split(', ').filter((n) => n.startsWith('Testtrainer'))));
    const vink = async (plek, naam) => {
      await page.evaluate(
        (plek, naam) => {
          const d = document.querySelector(`.club-plek-kies[data-plek="${plek}"]`);
          d.open = true;
          [...d.querySelectorAll('label')].find((l) => l.textContent.trim().startsWith(naam) && !l.textContent.trim().slice(naam.length).match(/^\d/)).querySelector('input').click();
        },
        plek,
        naam,
      );
      await slaap(300);
    };

    // Automatisch: 10 over 4 stations.
    await ga('/club/tien/plan');
    await page.waitForSelector('.club-plek-kies');
    const eerst = await ploegen();
    controle(eerst.map((p) => p.length).join() === '3,3,2,2', `${waar}: verdeling ${eerst.map((p) => p.length)}`);
    controle(new Set(eerst.flat()).size === 10, `${waar}: niet alle 10 trainers ingedeeld`);
    controle((await page.$$eval('.club-vak-voet', (x) => x.map((e) => e.textContent))).some((t) => t.includes('Testtrainer 1, Testtrainer 5')), `${waar}: trainers staan niet op het veldplan`);
    await opmaak(page, 'stations');

    // Aanvinken dat botst, dan oplossen.
    const naam2 = eerst[1][0];
    await vink('s:1', naam2);
    const botsing = await page.$$eval('.club-botsing', (x) => x.map((e) => e.textContent));
    controle(botsing.length === 1 && botsing[0].includes(naam2), `${waar}: geen melding bij dubbel: ${botsing}`);
    await foto(page, 'botsing', 'Melding: op twee plekken');
    await opmaak(page, 'botsing');
    await vink('s:2', naam2);
    controle(!(await page.$('.club-botsing')), `${waar}: melding blijft staan`);
    controle((await ploegen())[0].includes(naam2), `${waar}: trainer niet op station 1`);

    // Verplaatsen.
    await page.evaluate(() => {
      const d = document.querySelector('.club-plek-kies[data-plek="s:1"]');
      d.open = true;
      const s = d.querySelector('select');
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, 's:3');
      s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await slaap(300);
    const verplaatst = await ploegen();
    controle(verplaatst[2].length === 3 && !(await page.$('.club-botsing')), `${waar}: verplaatsen: ${verplaatst.map((p) => p.length)}`);

    // Terug naar automatisch.
    await klik(page, T('Automatisch verdelen'));
    await slaap(200);
    controle((await ploegen()).map((p) => p.length).join() === '3,3,2,2', `${waar}: Automatisch verdelen werkt niet`);

    // Partijvelden.
    await klik(page, T('Partij'), '[role="tab"]');
    const velden = await ploegen();
    controle(velden.map((p) => p.length).join() === '5,5', `${waar}: partijvelden ${velden.map((p) => p.length)}`);
    await opmaak(page, 'partij');
    await foto(page, 'partij', 'Trainers per veld');

    // Rotatie: elke ronde alle trainers.
    await klik(page, T('Rotatie'), '[role="tab"]');
    const rondes = await page.$$eval('.club-ronde-kaart', (x) => x.map((e) => e.textContent));
    controle(rondes.length === 5 && rondes.every((t) => t.includes('Testtrainer 10')), `${waar}: niet alle trainers in de rotatie`);
    await opmaak(page, 'rotatie');
    await foto(page, 'rotatie', 'Rotatie met alle trainers');

    // Rondetimer.
    await ga('/club/tien/timer');
    controle((await page.$eval('.club-ronde', (e) => e.textContent)).includes('Testtrainer 10'), `${waar}: timer zonder alle trainers`);
    await opmaak(page, 'timer');

    // Meelopen met een groepje.
    await ga('/club/tien');
    await page.evaluate(() => {
      const s = document.querySelector('.club-trainer-modus select');
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, 'groepje');
      s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await slaap(300);
    await opmaak(page, 'bewerken');
    await ga('/club/tien/plan');
    const groep = await ploegen();
    controle(groep.map((p) => p.length).join() === '3,3,2,2', `${waar}: groepjes ${groep.map((p) => p.length)}`);
    await foto(page, 'meelopen', 'Trainers lopen mee');
    await klik(page, T('Rotatie'), '[role="tab"]');
    const plek = await page.$$eval('.club-ronde-kaart', (x) =>
      x.slice(0, 4).map((k) => [...k.querySelectorAll('.club-ronde li')].find((l) => l.textContent.includes('Testtrainer 1,') || l.textContent.includes('Testtrainer 1'))?.querySelector('.club-nr')?.textContent),
    );
    controle(new Set(plek).size === 4, `${waar}: meelopen: trainer staat niet op elk station: ${plek}`);
    await ga('/club/tien');
    await page.evaluate(() => {
      const s = document.querySelector('.club-trainer-modus select');
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, 'station');
      s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await slaap(300);

    // Oude training met één trainer per station.
    await ga('/club/oud/plan');
    await page.waitForSelector('.club-plek-kies');
    const oud = await ploegen();
    controle(oud[0].join() === 'Testtrainer 2' && oud.flat().length === 2, `${waar}: oude training ${JSON.stringify(oud)}`);

    // Trainerslink zonder app en zonder account.
    await ga('/club/tien');
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: (t) => ((window.__link = t), Promise.resolve()) }, configurable: true });
    });
    await klik(page, T('Deel met trainers'));
    await page.waitForFunction(() => !!window.__link, { timeout: 20000, polling: 200 });
    const link = (await page.evaluate(() => window.__link)).split(/\r?\n/).pop();
    if (EMULATOR || ECHT) controle(link.includes('#/d/'), `${waar}: geen korte link: ${link.slice(0, 80)}`);
    for (const [toestel, ua] of Object.entries(WHATSAPP)) {
      const ander = await browser.createBrowserContext();
      const p2 = await ander.newPage();
      await p2.setUserAgent(ua);
      await p2.evaluateOnNewDocument(
        (taal, emulator) => {
          try {
            localStorage.setItem('trainersapp.taal', taal);
            if (emulator) localStorage.setItem('trainersapp.emulator', '1');
          } catch {
            /* about:blank */
          }
        },
        taal,
        EMULATOR,
      );
      p2.on('pageerror', (e) => fouten.push(`${waar} ${toestel}: ${e.message}`));
      await p2.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await p2.goto(link, { waitUntil: 'domcontentloaded' });
      await p2.waitForSelector('.club-station-knoppen button', { timeout: 20000 }).catch(() => problemen.push(`${waar} ${toestel}: trainerslink opent niet`));
      await slaap(400);
      const knoppen = await p2.$$eval('.club-station-knoppen button', (x) => x.map((e) => e.textContent));
      controle(knoppen[0]?.includes('Testtrainer 1, Testtrainer 5, Testtrainer 9'), `${waar} ${toestel}: trainers niet bij het station: ${knoppen[0]}`);
      controle(!(await p2.$('.club-mijn')), `${waar} ${toestel}: Jouw rondes zonder keuze`);
      await p2.select('.club-ik-ben select', 'Testtrainer 2');
      await slaap(300);
      const mijn = await p2.$$eval('.club-mijn li', (x) => x.map((e) => e.textContent));
      controle(mijn.length === 5, `${waar} ${toestel}: ${mijn.length} rondes bij Ik ben`);
      controle((await p2.$$('.club-station-knoppen .club-ik')).length === 1, `${waar} ${toestel}: eigen station niet uitgelicht`);
      controle((await p2.$$('.club-ronde li.club-ik')).length >= 4, `${waar} ${toestel}: eigen plek niet uitgelicht in de rotatie`);
      await opmaak(p2, `trainerslink ${toestel}`);
      if (toestel === 'iPhone' && formaat === 'SE') await foto(p2, 'link', 'Ik ben… in WhatsApp', false);
      // Onthouden op dit toestel.
      await p2.reload({ waitUntil: 'domcontentloaded' });
      await p2.waitForSelector('.club-ik-ben select', { timeout: 20000 });
      await slaap(300);
      controle((await p2.$eval('.club-ik-ben select', (e) => e.value)) === 'Testtrainer 2', `${waar} ${toestel}: Ik ben niet onthouden`);
      // Station openen vanuit Jouw rondes.
      await p2.evaluate(() => document.querySelector('.club-mijn-kaart').click());
      await p2.waitForSelector('.detail-media', { timeout: 12000 }).catch(() => problemen.push(`${waar} ${toestel}: station opent niet vanuit Jouw rondes`));
      controle((await p2.evaluate(() => document.querySelector('.club-plek')?.textContent ?? '')).includes('Testtrainer 2'), `${waar} ${toestel}: trainers staan niet op de stationpagina`);
      await ander.close();
    }
    if (ECHT) {
      await ga('/links');
      await page.waitForSelector('.training-regel .icoon-knop', { timeout: 8000 }).catch(() => problemen.push(`${waar}: Mijn deellinks is leeg`));
      for (let i = 0; i < 4 && (await page.$('.training-regel .icoon-knop')); i += 1) {
        await page.evaluate(() => document.querySelector('.training-regel .icoon-knop').click());
        await slaap(1200);
      }
      controle(!(await page.$('.training-regel')), `${waar}: link niet ingetrokken`);
    }
    await context.close();
    console.log(`${waar}: klaar`);
  }
}

await blad(browser, shots, `${MAP}blad-0331.png`, 6, 2600);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)].slice(0, 40)) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
