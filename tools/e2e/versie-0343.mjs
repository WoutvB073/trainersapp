// 0.34.3: per dag een eigen opzet in Circuittraining, op iPhone SE en laptop in NL en EN: maandag en woensdag gelijk ("Zelfde als"),
// woensdag een eigen opzet (Techniek weg, Loopcoördinatie met 2 groepjes samen vooraan), label "aangepast" in de dagkeuze, de eerste dag
// aanpassen verandert woensdag niet, plan/rotatie/materiaal/rondetimer per dag, de looptrainer (vaste plek) alleen bij Loopcoördinatie,
// trainerslink zonder app in de WhatsApp-browser (iPhone en Android) per dag met Ik ben…, Naar volgende week en Weer gelijk maken.
// Blad: blad-0343.png. Gebruik: node tools/e2e/versie-0343.mjs [basis-url]. TAAL=nl voor één taal. EMULATOR=1: korte link.
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
const trainer = (id, naam, w) => ({ id, naam, dagen: [1, 3], ritme: 'elke', beginWeek: '2026-11-16', groepen: ['Mini'], wissel: false, gewijzigd: 1, ...w });
const ROOSTER = [trainer('lc', 'Testtrainer LC', { dagen: [3], plek: 'loopcoordinatie' }), trainer('t1', 'Testtrainer 1'), trainer('t2', 'Testtrainer 2'), trainer('t3', 'Testtrainer 3'), trainer('t4', 'Testtrainer 4')];
const o = (id, categorie, soort, extra = {}) => ({ id, categorie, duur: 15, soort, ...extra });
const CLUB = {
  id: 'dagen',
  naam: 'Testcircuit',
  datums: ['2026-11-23', '2026-11-25'],
  leeftijd: 'mini-5-7',
  kinderen: 30,
  groepjes: 6,
  trainers: [],
  blokken: {},
  onderdelen: [o('tech', 'techniek', 'stations', { oefening: 'veld-tq-kappen-draaien' }), o('een', 'een-tegen-een', 'stations'), o('afw', 'afwerken', 'stations'), o('partij', 'partijvormen', 'samen')],
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
      (taal, club, rooster, emulator) => {
        try {
          localStorage.setItem('trainersapp.taal', taal);
          if (emulator) localStorage.setItem('trainersapp.emulator', '1');
          if (!localStorage.getItem('trainersapp.clubtrainingen')) {
            localStorage.setItem('trainersapp.clubtrainingen', JSON.stringify({ versie: 1, lijst: [club] }));
            localStorage.setItem('trainersapp.rooster', JSON.stringify({ versie: 1, lijst: rooster }));
            localStorage.setItem('trainersapp.dag', club.datums[0]);
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
    const kiesSelect = async (p, sel, waarde, i = 0) => {
      await p.evaluate(
        (sel, waarde, i) => {
          const s = document.querySelectorAll(sel)[i];
          Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, waarde);
          s.dispatchEvent(new Event('change', { bubbles: true }));
        },
        sel,
        waarde,
        i,
      );
      await slaap(300);
    };
    const dag = async (p, i, sel = '.club-dagen') => {
      await p.evaluate((i, sel) => document.querySelector(sel)?.querySelectorAll('button')[i]?.click(), i, sel);
      await slaap(300);
    };
    const tekst = (p) => p.evaluate(() => document.body.innerText);
    const opgeslagen = () => page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.clubtrainingen')).lijst);
    const foto = async (p, naam, uitleg, heel = true) => {
      const pad = `${MAP}s0343-${taal}-${formaat}-${naam}.png`;
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
    const blokken = () => page.$$eval('.club-blokken > li .club-blok-titel', (x) => x.map((e) => e.textContent));

    // Groep kiezen (trainers per dag uit het rooster); woensdag volgt maandag.
    await ga(page, '/club/dagen');
    await page.waitForSelector('.club-groep select');
    await kiesSelect(page, '.club-groep select', 'Mini');
    await page.waitForSelector('.club-dag-opzet');
    await dag(page, 1, '.club-dag-opzet .club-dagen');
    controle((await page.$eval('.club-opzet-keuze select', (s) => s.value)) === 'zelfde', `${waar}: woensdag niet standaard Zelfde als`);
    controle((await page.$$('.club-opzet-lijst li')).length === 4 && !(await page.$('.club-blokken')), `${waar}: Zelfde als toont niet de 4 onderdelen van maandag`);
    await opmaak(page, 'zelfde als');
    await foto(page, 'zelfde', 'Woensdag: Zelfde als maandag');

    // Eigen opzet: Techniek weg, Loopcoördinatie erbij (Samen, 2 groepjes), vooraan.
    await kiesSelect(page, '.club-opzet-keuze select', 'eigen');
    await page.waitForSelector('.club-blokken');
    controle((await blokken()).length === 4, `${waar}: eigen opzet niet gekopieerd: ${await blokken()}`);
    controle((await page.$eval('.club-dag-opzet .club-dagen', (e) => e.querySelectorAll('button')[1].textContent)).includes(T('aangepast')), `${waar}: geen label aangepast`);
    await page.evaluate(() => document.querySelector('.club-blokken > li .club-blok-weg')?.click());
    await slaap(300);
    await kiesSelect(page, '.club-toevoegen select', 'loopcoordinatie');
    controle((await blokken()).join('|') === [T('1 tegen 1'), T('Afwerken'), T('Partijvormen'), LC].join('|'), `${waar}: onderdelen woensdag: ${await blokken()}`);
    // Loopcoördinatie op Samen met 2 groepjes, en met het toetsenbord naar boven slepen.
    await page.evaluate(() => {
      const li = [...document.querySelectorAll('.club-blokken > li')].pop();
      [...li.querySelectorAll('.club-soort button')][1].click();
    });
    await slaap(300);
    await page.evaluate(() => {
      const li = [...document.querySelectorAll('.club-blokken > li')].pop();
      const s = li.querySelector('.club-samen-keuze select');
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, '2');
      s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await slaap(300);
    await page.evaluate(() => document.activeElement?.blur());
    const grepen = await page.$$('.club-blokken > li .club-greep');
    await grepen[grepen.length - 1].focus();
    await page.keyboard.press('Space');
    await slaap(200);
    for (let i = 0; i < 3; i += 1) {
      await page.keyboard.press('ArrowUp');
      await slaap(200);
    }
    await page.keyboard.press('Space');
    await slaap(500);
    controle((await blokken())[0] === LC, `${waar}: Loopcoördinatie niet vooraan: ${await blokken()}`);
    controle(!(await page.$('.club-melding')), `${waar}: melding bij 2 groepjes samen`);
    await opmaak(page, 'eigen opzet');
    await foto(page, 'eigen', 'Woensdag: eigen opzet met Loopcoördinatie');

    // De eerste dag aanpassen: woensdag verandert niet mee.
    await dag(page, 0, '.club-dag-opzet .club-dagen');
    controle((await blokken())[0] === T('Techniek'), `${waar}: maandag is veranderd: ${await blokken()}`);
    controle((await tekst(page)).includes(T('Dit is de opzet van {dag}. Sessies met Zelfde als veranderen mee; {w0} heeft een eigen opzet en verandert niet mee.', { dag: '', w0: '' }).split('.')[0].trim().slice(0, 20)), `${waar}: geen uitleg bij de eerste dag`);
    await kiesSelect(page, '.club-blokken > li .club-duur select', '20', 2);
    const na = (await opgeslagen()).find((x) => x.id === 'dagen');
    controle(na.onderdelen.find((x) => x.id === 'afw').duur === 20, `${waar}: duur maandag niet aangepast`);
    controle(na.perDag[1].onderdelen.every((x) => x.duur === 15), `${waar}: woensdag veranderde mee met maandag`);
    controle(na.perDag[1].onderdelen.map((x) => x.categorie).join() === 'loopcoordinatie,een-tegen-een,afwerken,partijvormen', `${waar}: opzet woensdag: ${na.perDag[1].onderdelen.map((x) => x.categorie)}`);
    controle(na.perDag[1].vast?.['Testtrainer LC'] === 'loopcoordinatie', `${waar}: vaste plek woensdag weg`);

    // Plan per dag.
    await ga(page, '/club/dagen/plan');
    await page.waitForSelector('.club-dagen');
    await dag(page, 1);
    controle((await page.$eval('.club-dagen', (e) => e.querySelectorAll('button')[1].textContent)).includes(T('aangepast')), `${waar}: plan zonder label aangepast`);
    const wo = await tekst(page);
    controle(wo.includes(T('{w0} ({n} groepjes samen)', { w0: LC, n: 2 })) && !wo.includes(`. ${T('Techniek')}`), `${waar}: plan woensdag zonder gedeeld station of met Techniek`);
    const ploegen = await page.$$eval('.club-plek-kies summary span', (x) => x.map((e) => e.textContent));
    controle(ploegen[0] === 'Testtrainer LC', `${waar}: looptrainer niet alleen bij Loopcoördinatie: ${ploegen[0]}`);
    await opmaak(page, 'plan wo');
    await foto(page, 'plan-wo', 'Plan woensdag (aangepast)');
    await klik(page, T('Rotatie'), '[role="tab"]');
    controle((await tekst(page)).includes(T('{w0} – groepje {w1} samen', { w0: LC, w1: `A ${en} B` })), `${waar}: rotatie woensdag zonder duo's`);
    await klik(page, T('Materiaal'), '[role="tab"]');
    await opmaak(page, 'materiaal wo');
    await dag(page, 0);
    await klik(page, T('Rotatie'), '[role="tab"]');
    const ma = await tekst(page);
    controle(ma.includes(T('Techniek')) && !ma.includes(T('{w0} – groepje {w1} samen', { w0: LC, w1: `A ${en} B` })), `${waar}: rotatie maandag klopt niet`);

    // Rondetimer per dag.
    await ga(page, '/club/dagen/timer');
    await page.waitForSelector('.club-ronde');
    await dag(page, 1);
    const timer = await page.$eval('.club-ronde', (e) => e.textContent);
    controle(timer.includes(T('{w0} – groepje {w1} samen', { w0: LC, w1: `A ${en} B` })) && timer.includes('Testtrainer LC'), `${waar}: timer woensdag: ${timer.slice(0, 120)}`);
    await opmaak(page, 'timer');
    if (formaat === 'SE') await foto(page, 'timer', 'Rondetimer woensdag', false);

    // Trainerslink zonder app.
    await ga(page, '/club/dagen');
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
      controle((await p2.$eval('.club-dagen', (e) => e.querySelectorAll('button')[1].textContent)).includes(T('aangepast')), `${waar} ${toestel}: link zonder label aangepast`);
      await dag(p2, 0);
      controle((await tekst(p2)).includes(T('Techniek')) && !(await tekst(p2)).includes(T('{w0} ({n} groepjes samen)', { w0: LC, n: 2 })), `${waar} ${toestel}: maandag in de link klopt niet`);
      await dag(p2, 1);
      controle((await tekst(p2)).includes(T('{w0} ({n} groepjes samen)', { w0: LC, n: 2 })), `${waar} ${toestel}: woensdag in de link zonder gedeeld station`);
      await p2.select('.club-ik-ben select', 'Testtrainer LC');
      await slaap(300);
      const mijn = await p2.$$eval('.club-mijn li', (x) => x.map((e) => e.textContent));
      controle(mijn.length === 4 && mijn[0].includes(T('{w0} – groepje {w1} samen', { w0: LC, w1: `A ${en} B` })), `${waar} ${toestel}: Jouw rondes woensdag: ${mijn.length} ${mijn[0]?.slice(0, 80)}`);
      await opmaak(p2, `link ${toestel}`);
      if (toestel === 'iPhone' && formaat === 'SE') await foto(p2, 'link', 'Trainerslink: woensdag, Ik ben de looptrainer', false);
      await ander.close();
    }

    // Naar volgende week: de opzet van woensdag gaat mee.
    await ga(page, '/club');
    await klik(page, T('{w0} dupliceren naar volgende week', { w0: 'Testcircuit' }));
    const volgende = (await opgeslagen()).find((x) => x.datums[0] === '2026-11-30');
    controle(!!volgende?.perDag?.[1]?.onderdelen?.length && volgende.perDag[1].onderdelen[0].categorie === 'loopcoordinatie', `${waar}: volgende week zonder de opzet van woensdag`);
    controle(volgende?.perDag?.[1]?.trainers?.includes('Testtrainer LC'), `${waar}: volgende week zonder de looptrainer`);
    await opmaak(page, 'lijst');

    // Weer gelijk maken (met bevestiging).
    await ga(page, '/club/dagen');
    await page.waitForSelector('.club-dag-opzet');
    await dag(page, 1, '.club-dag-opzet .club-dagen');
    await page.evaluate(() => document.querySelector('.club-gelijk')?.click());
    await slaap(400);
    controle((await page.$eval('.club-opzet-keuze select', (s) => s.value)) === 'zelfde', `${waar}: weer gelijk maken werkt niet`);
    controle(!(await page.$eval('.club-dag-opzet .club-dagen', (e) => e.textContent)).includes(T('aangepast')), `${waar}: label aangepast blijft staan`);
    const terug = (await opgeslagen()).find((x) => x.id === 'dagen');
    controle(!terug.perDag[1].onderdelen && terug.perDag[1].trainers.includes('Testtrainer LC'), `${waar}: na gelijk maken: opzet of trainers kloppen niet`);
    await context.close();
    console.log(`${waar}: klaar`);
  }
}

await blad(browser, shots, `${MAP}blad-0343.png`, 5, 2400);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)].slice(0, 40)) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
