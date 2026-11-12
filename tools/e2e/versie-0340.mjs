// 0.34.0: trainers per dag en het trainersrooster op iPhone SE en laptop in NL en EN: groep kiezen vult per dag de trainers (rooster),
// dag wisselen, met de hand aanpassen voor één week, vaste plek bij Loopcoördinatie, plan/rotatie/rondetimer per dag, Naar volgende week
// (weer volgens het rooster, O6/O7 om de week), een trainer toevoegen in het rooster, en de trainerslink zonder app in de WhatsApp-browser
// met de dagkeuze en Ik ben… per dag. Blad: blad-0340.png. Gebruik: node tools/e2e/versie-0340.mjs [basis-url]. TAAL=nl voor één taal.
// EMULATOR=1: de korte link (`npm run emulator`). ECHT=1 met de online URL: korte link op de echte site, link wordt ingetrokken.
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
const trainer = (id, naam, w) => ({ id, naam, dagen: [], ritme: 'elke', beginWeek: '2026-11-16', groepen: ['O6'], wissel: false, gewijzigd: 1, ...w });
const ROOSTER = [
  trainer('lc', 'Testtrainer LC', { dagen: [3], groepen: ['O7', 'O6'], wissel: true, plek: 'loopcoordinatie' }),
  trainer('t1', 'Testtrainer 1', { dagen: [1] }),
  trainer('t2', 'Testtrainer 2', { dagen: [1, 3] }),
  trainer('t3', 'Testtrainer 3', { dagen: [3] }),
];
const CLUB = {
  id: 'o6',
  naam: 'Testgroep O6',
  datums: ['2026-11-23', '2026-11-25'],
  leeftijd: 'mini-5-7',
  kinderen: 20,
  groepjes: 4,
  trainers: [],
  blokken: {},
  onderdelen: [
    { id: 'a', categorie: 'loopcoordinatie', duur: 15, soort: 'stations', oefening: 'veld-lc-slalom' },
    { id: 'b', categorie: 'techniek', duur: 15, soort: 'stations', oefening: 'veld-tq-hooghouden' },
    { id: 'c', categorie: 'afwerken', duur: 15, soort: 'stations' },
    { id: 'd', categorie: 'een-tegen-een', duur: 15, soort: 'stations' },
    { id: 'e', categorie: 'partijvormen', duur: 10, soort: 'samen' },
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
      (taal, club, rooster, emulator) => {
        try {
          localStorage.setItem('trainersapp.taal', taal);
          if (emulator) localStorage.setItem('trainersapp.emulator', '1');
          if (!localStorage.getItem('trainersapp.clubtrainingen')) {
            localStorage.setItem('trainersapp.clubtrainingen', JSON.stringify({ versie: 1, lijst: [club] }));
            localStorage.setItem('trainersapp.rooster', JSON.stringify({ versie: 1, lijst: rooster }));
          }
        } catch {
          /* about:blank */
        }
      },
      taal,
      CLUB,
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
    const dag = async (p, i) => {
      await p.evaluate((i) => document.querySelectorAll('.club-dagen button')[i]?.click(), i);
      await slaap(300);
    };
    const foto = async (p, naam, tekst, heel = true) => {
      const pad = `${MAP}s0340-${taal}-${formaat}-${naam}.png`;
      await p.screenshot({ path: pad, fullPage: heel });
      shots.push([pad, `${waar}: ${tekst}`]);
    };
    const opmaak = async (p, stap) => {
      const scherm = p.viewport().width;
      const r = await p.evaluate(
        (scherm) => ({
          breed: Math.max(document.documentElement.scrollWidth, innerWidth) - scherm,
          kap: [...document.querySelectorAll('button, h1, h2, h3, small, summary b, .rij-titel')]
            .filter((e) => e.offsetParent && !e.closest('.kop') && !e.closest('.club-tabel-vak') && !e.closest('.club-vak') && e.scrollWidth > e.clientWidth + 2)
            .map((e) => e.textContent.slice(0, 40)),
        }),
        scherm,
      );
      controle(r.breed <= 0, `${waar}: ${stap}: ${r.breed} px te breed`);
      controle(!r.kap.length, `${waar}: ${stap}: afgekapt: ${r.kap.slice(0, 3)}`);
    };
    const tekstvak = () => page.$eval('.club-gegevens textarea', (e) => e.value.split('\n').filter(Boolean));
    const ploegen = () => page.$$eval('.club-plek-kies summary span', (x) => x.map((e) => e.textContent));

    // Groep kiezen: per dag de trainers uit het rooster.
    await ga(page, '/club/o6');
    await page.waitForSelector('.club-groep select');
    await kiesSelect(page, '.club-groep select', 'O6');
    controle((await page.$$('.club-dagen button')).length === 2, `${waar}: geen keuze per dag`);
    await dag(page, 0);
    controle((await tekstvak()).join() === 'Testtrainer 1,Testtrainer 2', `${waar}: maandag ${await tekstvak()}`);
    await dag(page, 1);
    controle((await tekstvak()).join() === 'Testtrainer LC,Testtrainer 2,Testtrainer 3', `${waar}: woensdag ${await tekstvak()}`);
    controle((await page.evaluate(() => document.body.innerText)).includes(T('Ingevuld volgens het trainersrooster. Pas je het hier aan, dan geldt dat alleen voor deze week.')), `${waar}: geen melding rooster`);
    await opmaak(page, 'bewerken');
    await foto(page, 'bewerk', 'Groep gekozen: trainers per dag');

    // Met de hand aanpassen voor deze week.
    await page.focus('.club-gegevens textarea');
    await page.keyboard.press('End');
    await page.keyboard.type('\nTestinvaller');
    await slaap(300);
    controle((await tekstvak()).includes('Testinvaller'), `${waar}: invaller niet toegevoegd`);
    controle(!(await page.evaluate(() => document.body.innerText)).includes(T('Ingevuld volgens het trainersrooster. Pas je het hier aan, dan geldt dat alleen voor deze week.')), `${waar}: melding rooster blijft na aanpassen`);
    await page.evaluate(() => document.activeElement?.blur());

    // Plan per dag: de vaste plek bij Loopcoördinatie.
    await ga(page, '/club/o6/plan');
    await page.waitForSelector('.club-plek-kies');
    await dag(page, 1);
    const wo = await ploegen();
    controle(wo[0]?.includes('Testtrainer LC'), `${waar}: woensdag staat de LC-trainer niet bij Loopcoördinatie: ${wo[0]}`);
    controle(wo.join().includes('Testinvaller'), `${waar}: invaller niet op woensdag`);
    await foto(page, 'plan-wo', 'Plan woensdag: LC-trainer bij Loopcoördinatie');
    await opmaak(page, 'plan');
    await dag(page, 0);
    const ma = await ploegen();
    controle(!ma.join().includes('Testtrainer LC') && ma.join().includes('Testtrainer 1'), `${waar}: maandag: ${ma}`);
    await klik(page, T('Rotatie'), '[role="tab"]');
    controle(!(await page.evaluate(() => document.body.innerText)).includes('Testinvaller'), `${waar}: invaller in de rotatie op maandag`);
    await dag(page, 1);
    controle((await page.evaluate(() => document.body.innerText)).includes('Testinvaller'), `${waar}: invaller niet in de rotatie op woensdag`);

    // Rondetimer: dag bovenaan.
    await ga(page, '/club/o6/timer');
    controle((await page.$$('.club-dagen button')).length === 2, `${waar}: timer zonder dagkeuze`);
    controle((await page.$eval('.club-ronde', (e) => e.textContent)).includes('Testinvaller'), `${waar}: timer zonder de trainers van woensdag`);
    await opmaak(page, 'timer');

    // Trainerslink: dag kiezen en Ik ben… per dag.
    await ga(page, '/club/o6');
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: (t) => ((window.__link = t), Promise.resolve()) }, configurable: true });
    });
    await klik(page, T('Deel met trainers'));
    await page.waitForFunction(() => !!window.__link, { timeout: 20000, polling: 200 });
    const link = (await page.evaluate(() => window.__link)).split(/\r?\n/).pop();
    if (EMULATOR || ECHT) controle(link.includes('#/d/'), `${waar}: geen korte link`);
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
      await p2.waitForSelector('.club-dagen button', { timeout: 20000 }).catch(() => problemen.push(`${waar} ${toestel}: trainerslink zonder dagkeuze`));
      await slaap(400);
      await dag(p2, 1);
      await p2.select('.club-ik-ben select', 'Testtrainer LC');
      await slaap(300);
      const mijn = await p2.$$eval('.club-mijn li', (x) => x.map((e) => e.textContent));
      controle(mijn.length === 5 && mijn[0].includes(T('Loopcoördinatie')), `${waar} ${toestel}: Jouw rondes op woensdag: ${mijn.length} ${mijn[0]?.slice(0, 60)}`);
      await opmaak(p2, `link ${toestel}`);
      if (toestel === 'iPhone' && formaat === 'SE') await foto(p2, 'link', 'Trainerslink: woensdag, Ik ben de LC-trainer', false);
      // Op maandag staat hij er niet: melding met een knop naar woensdag.
      await dag(p2, 0);
      controle(!(await p2.$('.club-mijn')), `${waar} ${toestel}: Jouw rondes op een dag zonder deze trainer`);
      const noot = await p2.evaluate(() => document.querySelector('.gedeeld-kop .club-noot')?.textContent ?? '');
      controle(noot.startsWith(T('Je staat niet op {dag}.', { dag: '' }).split(' ')[0]), `${waar} ${toestel}: geen melding andere dag: ${noot}`);
      await p2.evaluate(() => document.querySelector('.gedeeld-kop .club-noot button')?.click());
      await slaap(300);
      controle((await p2.$$('.club-mijn li')).length === 5, `${waar} ${toestel}: knop naar de andere dag werkt niet`);
      await ander.close();
    }

    // Naar volgende week: weer volgens het rooster (week 49: de LC-trainer is dan bij O7), de invaller valt weg.
    await ga(page, '/club');
    await klik(page, T('{w0} dupliceren naar volgende week', { w0: 'Testgroep O6' }));
    const volgende = await page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.clubtrainingen')).lijst.find((c) => c.datums[0] === '2026-11-30'));
    controle(!!volgende, `${waar}: geen training voor volgende week`);
    if (volgende) {
      const w = volgende.perDag?.map((d) => d.trainers.join('+'));
      controle(w?.join('|') === 'Testtrainer 1+Testtrainer 2|Testtrainer 2+Testtrainer 3', `${waar}: volgende week: ${w}`);
    }
    await opmaak(page, 'lijst');

    // Trainersrooster: een trainer toevoegen.
    await ga(page, '/rooster');
    controle((await page.$$('.lijst .training-regel')).length === 4, `${waar}: rooster heeft niet 4 trainers`);
    await klik(page, T('Trainer toevoegen'));
    await page.waitForSelector('.rooster-trainer input');
    await page.type('.rooster-trainer input[maxlength="40"]', 'Testtrainer 4');
    await page.evaluate(() => {
      const groepen = [...document.querySelectorAll('.rooster-keuze')];
      groepen[0].querySelectorAll('button')[2].click();
    });
    await slaap(200);
    await page.evaluate(() => [...document.querySelectorAll('.rooster-keuze')][1].querySelectorAll('button')[1].click());
    await slaap(200);
    await page.evaluate(() => [...document.querySelectorAll('.rooster-keuze')][2].querySelector('button').click());
    await slaap(200);
    await kiesSelect(page, '.rooster-plek select', 'techniek');
    await opmaak(page, 'rooster trainer');
    await foto(page, 'trainer', 'Rooster: een trainer instellen');
    await ga(page, '/rooster');
    const regels = await page.$$eval('.lijst .rij-sub', (x) => x.map((e) => e.textContent));
    controle(regels.some((r) => r.includes(T('om de week (vanaf week {w})', { w: '' }).split('(')[0].trim())), `${waar}: nieuwe trainer niet om de week: ${regels.join(' | ').slice(0, 200)}`);
    await opmaak(page, 'rooster');
    await foto(page, 'rooster', 'Trainersrooster');
    await context.close();
    console.log(`${waar}: klaar`);
  }
}

await blad(browser, shots, `${MAP}blad-0340.png`, 6, 2600);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)].slice(0, 40)) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
