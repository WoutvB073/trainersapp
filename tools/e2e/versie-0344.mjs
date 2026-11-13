// 0.34.4: sessies in Circuittraining op iPhone SE en laptop in NL en EN: een tweede sessie op dezelfde avond (19:00), groep uit het
// rooster met een begintijd per trainer, per sessie eigen aantal groepjes en kinderen, andere leeftijd met melding, plan/rotatie/materiaal
// (ook voor de hele avond) en rondetimer per sessie, trainerslink zonder app in de WhatsApp-browser (iPhone en Android) met Ik ben… voor
// een trainer bij beide sessies, Naar volgende week en een sessie weghalen. Ook het rooster: begintijd van een trainer.
// Blad: blad-0344.png. Gebruik: node tools/e2e/versie-0344.mjs [basis-url]. TAAL=nl voor één taal. EMULATOR=1: korte link.
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
const trainer = (id, naam, w) => ({ id, naam, dagen: [1], ritme: 'elke', beginWeek: '2026-11-16', groepen: ['O7'], wissel: false, gewijzigd: 1, ...w });
const ROOSTER = [trainer('t1', 'Testtrainer 1', { tijd: '18:00' }), trainer('t2', 'Testtrainer 2', { tijd: '19:00' }), trainer('t3', 'Testtrainer 3')];
const o = (id, categorie, oefening) => ({ id, categorie, duur: 15, soort: 'stations', oefening });
const CLUB = {
  id: 'avond',
  naam: 'Testavond',
  datums: ['2026-11-23'],
  starttijd: '18:00',
  leeftijd: 'mini-5-7',
  kinderen: 10,
  groepjes: 2,
  trainers: [],
  blokken: {},
  onderdelen: [o('tech', 'techniek', 'veld-tq-kappen-draaien'), o('een', 'een-tegen-een', 'veld-o7-tik-het-hoedje'), o('afw', 'afwerken', 'veld-o7-schietduel')],
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
            localStorage.removeItem('trainersapp.dag');
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
    const zetVeld = async (p, sel, waarde) => {
      await p.evaluate(
        (sel, waarde) => {
          const s = document.querySelector(sel);
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(s, String(waarde));
          s.dispatchEvent(new Event('input', { bubbles: true }));
        },
        sel,
        waarde,
      );
      await slaap(300);
    };
    const sessie = async (p, i, sel = '.club-dagen') => {
      await p.evaluate((i, sel) => document.querySelector(sel)?.querySelectorAll('button')[i]?.click(), i, sel);
      await slaap(300);
    };
    const tekst = (p) => p.evaluate(() => document.body.innerText);
    const opgeslagen = () => page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.clubtrainingen')).lijst);
    const foto = async (p, naam, uitleg, heel = true) => {
      const pad = `${MAP}s0344-${taal}-${formaat}-${naam}.png`;
      await p.screenshot({ path: pad, fullPage: heel });
      shots.push([pad, `${waar}: ${uitleg}`]);
    };
    const opmaak = async (p, stap) => {
      const scherm = p.viewport().width;
      const r = await p.evaluate(
        (scherm) => ({
          breed: Math.max(document.documentElement.scrollWidth, innerWidth) - scherm,
          kap: [...document.querySelectorAll('button, h1, h2, h3, small, summary b, .rij-titel')]
            .filter((e) => e.offsetParent && !e.closest('.kop') && !e.closest('.club-tabel-vak') && !e.closest('.club-vak') && e.scrollWidth > e.clientWidth + 2)
            .map((e) => e.textContent.slice(0, 40)),
          smal: [...document.querySelectorAll('.club-sessie input')].filter((e) => e.offsetParent && e.getBoundingClientRect().width < 90).length,
        }),
        scherm,
      );
      controle(r.breed <= 0, `${waar}: ${stap}: ${r.breed} px te breed`);
      controle(!r.kap.length, `${waar}: ${stap}: afgekapt: ${r.kap.slice(0, 3)}`);
      controle(!r.smal, `${waar}: ${stap}: datum- of tijdveld te smal`);
    };
    const tekstvak = () => page.$eval('.club-gegevens textarea', (e) => e.value.split('\n').filter(Boolean).join(','));
    const knoppen = (p, sel = '.club-dagen') => p.$$eval(`${sel} button`, (x) => x.map((e) => e.textContent));

    // Eén sessie; een tweede erbij op dezelfde avond.
    await ga(page, '/club/avond');
    await page.waitForSelector('.club-sessie');
    controle((await page.$$('.club-sessie')).length === 1 && !(await page.$('.club-sessie-weg')), `${waar}: niet één sessie zonder wegknop`);
    await page.click('.club-sessie-erbij');
    await slaap(400);
    const tijden = await page.$$eval('.club-sessie input[type="time"]', (x) => x.map((e) => e.value));
    const datums = await page.$$eval('.club-sessie input[type="date"]', (x) => x.map((e) => e.value));
    controle(tijden.join() === '18:00,19:00' && datums.join() === '2026-11-23,2026-11-23', `${waar}: tweede sessie: ${datums} ${tijden}`);
    const labels = await knoppen(page, '.club-gegevens .club-dagen');
    controle(labels.length === 2 && labels[0].includes('18:00') && labels[1].includes('19:00'), `${waar}: sessiekeuze: ${labels}`);

    // Groep op de eerste sessie: per sessie de trainers volgens het rooster (met begintijd).
    await sessie(page, 0, '.club-gegevens .club-dagen');
    await kiesSelect(page, '.club-groep select', 'O7');
    controle((await tekstvak()) === 'Testtrainer 1,Testtrainer 3', `${waar}: trainers 18:00: ${await tekstvak()}`);
    await sessie(page, 1, '.club-gegevens .club-dagen');
    controle((await tekstvak()) === 'Testtrainer 2,Testtrainer 3', `${waar}: trainers 19:00: ${await tekstvak()}`);

    // Tweede sessie: 4 groepjes en 20 kinderen.
    await kiesSelect(page, '.club-groepjes', '4');
    await zetVeld(page, '.club-gegevens input[type="number"]', 20);
    const na = (await opgeslagen()).find((x) => x.id === 'avond');
    controle(na.groepjes === 2 && na.perDag?.[1]?.groepjes === 4 && na.perDag?.[1]?.kinderen === 20, `${waar}: groepjes per sessie: ${na.groepjes} / ${na.perDag?.[1]?.groepjes} ${na.perDag?.[1]?.kinderen}`);
    controle((await tekst(page)).includes(T('{s} stations, ± {k} kinderen per groepje.', { s: 6, k: 5 })), `${waar}: geen 6 stations bij 4 groepjes`);
    // Andere leeftijd: melding.
    await kiesSelect(page, '.club-leeftijd select', 'mini-3-5');
    const melding = await page.$eval('.club-gegevens .club-melding', (e) => e.textContent).catch(() => '');
    controle(melding.startsWith(T('Niet voor {leeftijd}: {w0}. Kies voor deze sessie een eigen opzet met andere oefeningen, of een andere leeftijd.').split(':')[0].replace('{leeftijd}', '').trim().slice(0, 8)), `${waar}: geen leeftijdsmelding: ${melding}`);
    await opmaak(page, 'bewerken');
    await foto(page, 'bewerk', 'Twee sessies, sessie 2: 4 groepjes, O6 met melding');
    await kiesSelect(page, '.club-leeftijd select', 'mini-5-7');
    controle(!(await page.$('.club-gegevens .club-melding')), `${waar}: leeftijdsmelding blijft staan`);
    await sessie(page, 0, '.club-gegevens .club-dagen');
    controle((await tekst(page)).includes(T('{s} stations, ± {k} kinderen per groepje.', { s: 3, k: 5 })), `${waar}: eerste sessie niet 3 stations`);

    // Plan per sessie.
    await ga(page, '/club/avond/plan');
    await page.waitForSelector('.club-dagen');
    await sessie(page, 0);
    const s1 = await page.$$eval('.club-plek-kies', (x) => x.length);
    await sessie(page, 1);
    const s2 = await page.$$eval('.club-plek-kies', (x) => x.length);
    controle(s1 >= 3 && s2 >= 6 && s2 > s1, `${waar}: stations per sessie in het plan: ${s1} / ${s2}`);
    await opmaak(page, 'plan');
    await foto(page, 'plan', 'Plan 19:00: 4 groepjes');
    await klik(page, T('Rotatie'), '[role="tab"]');
    controle((await page.$$eval('.club-tabel tbody tr', (x) => x.length)) === 4, `${waar}: rotatie 19:00 niet 4 groepjes`);
    await klik(page, T('Materiaal'), '[role="tab"]');
    controle((await tekst(page)).includes(T('Voor de hele avond')), `${waar}: geen materiaal voor de hele avond`);
    await opmaak(page, 'materiaal');
    await foto(page, 'materiaal', 'Materiaal: ook voor de hele avond');

    // Rondetimer per sessie.
    await ga(page, '/club/avond/timer');
    await page.waitForSelector('.club-ronde');
    await sessie(page, 1);
    const timer = await page.$eval('.club-ronde', (e) => e.textContent);
    const groepen = await page.$$eval('.club-ronde li > b', (x) => x.map((e) => e.textContent).join(','));
    controle(timer.includes('Testtrainer 2') && groepen.includes('D'),`${waar}: timer 19:00: ${timer.slice(0, 120)}`);
    controle((await tekst(page)).includes('19:00'), `${waar}: timer zonder begintijd 19:00`);
    await opmaak(page, 'timer');

    // Trainerslink zonder app.
    await ga(page, '/club/avond');
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
      await p2.waitForSelector('.club-dagen button', { timeout: 20000 }).catch(() => problemen.push(`${waar} ${toestel}: trainerslink zonder sessiekeuze`));
      await slaap(400);
      const ls = await knoppen(p2);
      controle(ls.length === 2 && ls[0].includes('18:00') && ls[1].includes('19:00'), `${waar} ${toestel}: sessies in de link: ${ls}`);
      await sessie(p2, 0);
      // Een trainer bij beide sessies ziet ze allebei.
      await p2.select('.club-ik-ben select', 'Testtrainer 3');
      await slaap(300);
      const eigen = await p2.$$eval('.club-mijn:not(.club-mijn-ook) li', (x) => x.length);
      const ook = await p2.$$eval('.club-mijn-ook li', (x) => x.length);
      controle(eigen === 3 && ook === 3 && (await tekst(p2)).toLowerCase().includes(T('Ook bij {sessie}', { sessie: '' }).trim().toLowerCase()), `${waar} ${toestel}: Ik ben (beide sessies): ${eigen} + ${ook}`);
      await opmaak(p2, `link ${toestel}`);
      if (toestel === 'iPhone' && formaat === 'SE') await foto(p2, 'link', 'Trainerslink: Ik ben bij beide sessies', false);
      // Een trainer alleen om 18:00: om 19:00 de melding met een knop.
      await p2.select('.club-ik-ben select', 'Testtrainer 1');
      await slaap(300);
      await sessie(p2, 1);
      controle(!(await p2.$('.club-mijn')) && !!(await p2.$('.gedeeld-kop .club-noot button')), `${waar} ${toestel}: trainer 18:00 op de sessie van 19:00`);
      await ander.close();
    }

    // Rooster: begintijd van een trainer.
    await ga(page, '/rooster/t1');
    await page.waitForSelector('.rooster-tijd input');
    controle((await page.$eval('.rooster-tijd input', (e) => e.value)) === '18:00', `${waar}: rooster zonder begintijd`);
    await opmaak(page, 'rooster');

    // Naar volgende week: beide sessies mee.
    await ga(page, '/club');
    await klik(page, T('{w0} dupliceren naar volgende week', { w0: 'Testavond' }));
    const volgende = (await opgeslagen()).find((x) => x.datums[0] === '2026-11-30');
    controle(volgende?.datums?.join() === '2026-11-30,2026-11-30' && volgende.perDag?.[1]?.groepjes === 4 && volgende.perDag?.[1]?.tijd === '19:00', `${waar}: volgende week: ${JSON.stringify(volgende?.datums)} ${volgende?.perDag?.[1]?.groepjes}`);
    await opmaak(page, 'lijst');

    // Sessie weghalen (met bevestiging).
    await ga(page, '/club/avond');
    await page.waitForSelector('.club-sessie-weg');
    await page.evaluate(() => [...document.querySelectorAll('.club-sessie-weg')].pop().click());
    await slaap(400);
    controle((await page.$$('.club-sessie')).length === 1, `${waar}: sessie niet weggehaald`);
    await context.close();
    console.log(`${waar}: klaar`);
  }
}

await blad(browser, shots, `${MAP}blad-0344.png`, 4, 2400);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)].slice(0, 40)) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
