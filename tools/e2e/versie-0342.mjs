// 0.34.2: Samen met een deel van de groepjes op iPhone SE en laptop in NL en EN: sjabloon Mini Talents + loopcoördinatie, keuze
// "Groepjes samen" (2, 3, Alle groepjes) met meldingen, de looptrainer (vaste plek uit het rooster) alleen bij het gedeelde station,
// Stations/Rotatie/Materiaal, de rondetimer en de trainerslink zonder app in de WhatsApp-browser (iPhone en Android) met Ik ben….
// Blad: blad-0342.png. Gebruik: node tools/e2e/versie-0342.mjs [basis-url]. TAAL=nl voor één taal. EMULATOR=1: korte link.
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
const trainer = (id, naam, w) => ({ id, naam, dagen: [1, 3], ritme: 'elke', beginWeek: '2026-11-09', groepen: ['Mini'], wissel: false, gewijzigd: 1, ...w });
const ROOSTER = [
  trainer('lc', 'Testtrainer LC', { plek: 'loopcoordinatie' }),
  trainer('t1', 'Testtrainer 1'),
  trainer('t2', 'Testtrainer 2'),
  trainer('t3', 'Testtrainer 3'),
  trainer('t4', 'Testtrainer 4'),
];
const WHATSAPP = {
  iPhone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/2.25',
  Android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 WhatsApp/2.25',
};
const EMULATOR = !!process.env.EMULATOR;
const ECHT = !!process.env.ECHT;

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
    const en = taal === 'en' ? 'and' : 'en';
    const LC = T('Loopcoördinatie');
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await alsGeinstalleerd(page);
    await page.evaluateOnNewDocument(
      (taal, rooster, emulator) => {
        try {
          localStorage.setItem('trainersapp.taal', taal);
          if (emulator) localStorage.setItem('trainersapp.emulator', '1');
          if (!localStorage.getItem('trainersapp.rooster')) localStorage.setItem('trainersapp.rooster', JSON.stringify({ versie: 1, lijst: rooster }));
        } catch {
          /* about:blank */
        }
      },
      taal,
      ROOSTER,
      EMULATOR,
    );
    page.on('pageerror', (e) => fouten.push(`${waar}: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && !/WebGL|GPU/.test(m.text()) && fouten.push(`${waar}: ${m.text().slice(0, 140)}`));
    page.on('dialog', (d) => void d.accept());
    await page.setViewport(vp);

    const ga = async (p, pad) => {
      await p.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#${pad}`, { waitUntil: ECHT ? 'domcontentloaded' : 'networkidle0' });
      await slaap(ECHT ? 900 : 300);
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
      await slaap(300);
    };
    const kiesSelect = async (p, sel, waarde) => {
      await p.evaluate(
        (sel, waarde) => {
          const s = document.querySelector(sel);
          Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, waarde);
          s.dispatchEvent(new Event('change', { bubbles: true }));
        },
        sel,
        waarde,
      );
      await slaap(300);
    };
    const tekst = (p) => p.evaluate(() => document.body.innerText);
    const foto = async (p, naam, uitleg, heel = true) => {
      const pad = `${MAP}s0342-${taal}-${formaat}-${naam}.png`;
      await p.screenshot({ path: pad, fullPage: heel });
      shots.push([pad, `${waar}: ${uitleg}`]);
    };
    const opmaak = async (p, stap) => {
      const scherm = p.viewport().width;
      const r = await p.evaluate(
        (scherm) => ({
          breed: Math.max(document.documentElement.scrollWidth, innerWidth) - scherm,
          kap: [...document.querySelectorAll('button, h1, h2, h3, small, summary b, .rij-titel, select')]
            .filter((e) => e.offsetParent && !e.closest('.kop') && !e.closest('.club-tabel-vak') && !e.closest('.club-vak') && e.scrollWidth > e.clientWidth + 2)
            .map((e) => e.textContent.slice(0, 40)),
        }),
        scherm,
      );
      controle(r.breed <= 0, `${waar}: ${stap}: ${r.breed} px te breed`);
      controle(!r.kap.length, `${waar}: ${stap}: afgekapt: ${r.kap.slice(0, 3)}`);
    };

    // Sjabloon Mini Talents + loopcoördinatie.
    await ga(page, '/club');
    await klik(page, T('Nieuwe circuittraining'));
    await page.waitForSelector('.club-loop-sjabloon');
    await opmaak(page, 'nieuw-paneel');
    await page.click('.club-loop-sjabloon');
    await page.waitForSelector('.club-samen-keuze select');
    await slaap(300);
    const id = (await page.evaluate(() => location.hash)).split('/')[2];
    controle((await page.$$eval('.club-samen-keuze select', (x) => x.map((s) => s.value))).join() === '2,0', `${waar}: Groepjes samen niet 2 en Alle groepjes`);
    controle((await tekst(page)).includes(T('Per ronde komen er {n} groepjes samen op één station; de andere groepjes draaien door langs de gewone stations.', { n: 2 })), `${waar}: geen uitleg bij 2 groepjes samen`);
    controle(!(await page.$('.club-melding')), `${waar}: melding bij 6 groepjes en 2 samen`);
    await kiesSelect(page, '.club-groep select', 'Mini');
    await opmaak(page, 'bewerken');
    await foto(page, 'bewerk', 'Sjabloon: Loopcoördinatie met 2 groepjes samen');

    // 3 samen: in elke ronde een onderdeel leeg (melding); terug naar 2.
    await kiesSelect(page, '.club-samen-keuze select', '3');
    const melding3 = await page.$$eval('.club-melding', (x) => x.map((e) => e.textContent).join(' '));
    controle(melding3.includes(T('Er gaan maar {u} keer {n} groepjes langs {k} onderdelen: in elke ronde blijft er een onderdeel leeg.', { u: 2, n: 3, k: 3 })), `${waar}: geen melding bij 3 samen: ${melding3}`);
    await kiesSelect(page, '.club-samen-keuze select', '2');
    controle(!(await page.$('.club-melding')), `${waar}: melding blijft staan na terug naar 2`);
    // De groep vult de trainers per dag (rooster); na de wijziging van de opzet blijft de vaste plek.

    // Plan: het gedeelde station en de looptrainer.
    await ga(page, `/club/${id}/plan`);
    await page.waitForSelector('.club-plek-kies');
    const plan = await tekst(page);
    controle(plan.includes(T('{w0} ({n} groepjes samen)', { w0: LC, n: 2 })), `${waar}: Stations zonder "${T('{w0} ({n} groepjes samen)', { w0: LC, n: 2 })}"`);
    const ploegen = await page.$$eval('.club-plek-kies summary span', (x) => x.map((e) => e.textContent));
    controle(ploegen[0] === 'Testtrainer LC', `${waar}: looptrainer niet alleen bij Loopcoördinatie: ${ploegen[0]}`);
    controle(ploegen.slice(1).every((p) => !p.includes('Testtrainer LC')) && ploegen.slice(1).join().split('Testtrainer').length - 1 === 4, `${waar}: andere trainers niet over de andere stations: ${ploegen.join(' | ')}`);
    await opmaak(page, 'stations');
    await foto(page, 'stations', 'Stations: gedeeld station met de looptrainer');
    await klik(page, T('Rotatie'), '[role="tab"]');
    const rotatie = await tekst(page);
    controle(rotatie.includes(T('{w0} – groepje {w1} samen', { w0: LC, w1: `A ${en} B` })), `${waar}: rotatie zonder "groepje A en B samen"`);
    controle(rotatie.includes(T('{w0} (station {nr}): steeds {n} groepjes samen, in vaste groepjes: {w1}.', { w0: LC, nr: 1, n: 2, w1: 'A + B, C + D, E + F' })), `${waar}: rotatie zonder uitleg vaste duo's`);
    await opmaak(page, 'rotatie');
    await foto(page, 'rotatie', 'Rotatie: duo’s samen bij Loopcoördinatie');
    await klik(page, T('Materiaal'), '[role="tab"]');
    await opmaak(page, 'materiaal');

    // Rondetimer.
    await ga(page, `/club/${id}/timer`);
    await page.waitForSelector('.club-ronde');
    const timer = await page.$eval('.club-ronde', (e) => e.textContent);
    controle(timer.includes(T('{w0} – groepje {w1} samen', { w0: LC, w1: `A ${en} B` })) && timer.includes('Testtrainer LC'), `${waar}: timer zonder gedeeld station: ${timer.slice(0, 120)}`);
    await opmaak(page, 'timer');
    if (formaat === 'SE') await foto(page, 'timer', 'Rondetimer ronde 1', false);

    // Trainerslink zonder app.
    await ga(page, `/club/${id}`);
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: (t) => ((window.__link = t), Promise.resolve()) }, configurable: true });
    });
    await klik(page, T('Deel met trainers'));
    await page.waitForFunction(() => !!window.__link, { timeout: 20000, polling: 200 });
    const link = (await page.evaluate(() => window.__link)).split(/\r?\n/).pop();
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
      await p2.waitForSelector('.club-ik-ben select', { timeout: 20000 }).catch(() => problemen.push(`${waar} ${toestel}: trainerslink opent niet`));
      await slaap(400);
      controle((await tekst(p2)).includes(T('{w0} ({n} groepjes samen)', { w0: LC, n: 2 })), `${waar} ${toestel}: link zonder gedeeld station`);
      await p2.select('.club-ik-ben select', 'Testtrainer LC');
      await slaap(300);
      const mijn = await p2.$$eval('.club-mijn li', (x) => x.map((e) => e.textContent));
      controle(mijn.length === 4 && mijn[0].includes(T('{w0} – groepje {w1} samen', { w0: LC, w1: `A ${en} B` })), `${waar} ${toestel}: Jouw rondes: ${mijn.length} ${mijn[0]?.slice(0, 80)}`);
      await opmaak(p2, `link ${toestel}`);
      if (toestel === 'iPhone' && formaat === 'SE') await foto(p2, 'link', 'Trainerslink: Ik ben de looptrainer', false);
      // Het station openen: welke groepjes per ronde.
      const nr = await p2.evaluate(() => {
        const a = [...document.querySelectorAll('a, button')].find((x) => /\(2 (groepjes samen|groups together)\)/.test(x.textContent));
        a?.click();
        return !!a;
      });
      await slaap(500);
      if (nr) controle((await tekst(p2)).includes(T('Ronde {nr}: {w0} samen', { nr: 1, w0: T('groepjes {w0}', { w0: `A ${en} B` }) })), `${waar} ${toestel}: station zonder "Ronde 1: groepjes A en B samen"`);
      await ander.close();
    }
    await context.close();
    console.log(`${waar}: klaar`);
  }
}

await blad(browser, shots, `${MAP}blad-0342.png`, 5, 2400);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)].slice(0, 40)) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
