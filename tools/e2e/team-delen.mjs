// 0.31.2: delen met team, met twee testaccounts, in NL en EN op telefoon en laptop. Testtrainer 1 deelt alles wat je kunt maken
// (teamtraining, circuittraining, eigen oefening, opstelling, tactiekbord, spelhervatting, ook eigen borden uit voorbeelden);
// overal zijn beide knoppen. Testtrainer 2 opent de circuittraining (plan, stations, rotatie, materiaal, animatie) en kopieert hem,
// kopieert een eigen bord uit een voorbeeld, en opent de link van een eigen oefening. Daarna: bijwerken en terugtrekken door de
// eigenaar, verwijderen door de beheerder, en een lid kan dat niet. Link van een oefening op een niet-geïnstalleerde telefoon.
// Eerst `npm run emulator` en de preview op poort 4184. Bladen: blad-team-<taal>-<formaat>.png.
// Met ECHT=1 tegen het echte project (alleen NL, laptop): testaccounts vooraf en na afloop weg via "Account verwijderen" in de app.
// Gebruik: node tools/e2e/team-delen.mjs [basis-url]
import { createJiti } from 'jiti';
import { BASE, MAP, alsGeinstalleerd, blad, slaap, start } from './hulp.mjs';

const jiti = createJiti(import.meta.url);
const { EN } = await jiti.import('../../src/i18n/en.ts');
const { nieuweOpstelling } = await jiti.import('../../src/wedstrijd/wedstrijd.ts');

const ECHT = process.env.ECHT === '1';
const PROJECT = 'demo-toptraining';
const WACHTWOORD = 'testwachtwoord1';
const TESTACCOUNTS = ['test2@example.com', 'test1@example.com'];
const TELEFOON = { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const LAPTOP = { width: 1366, height: 820, deviceScaleFactor: 1 };
const COMBINATIES = ECHT
  ? [['nl', 'laptop', LAPTOP]]
  : [
      ['nl', 'telefoon', TELEFOON],
      ['nl', 'laptop', LAPTOP],
      ['en', 'telefoon', TELEFOON],
      ['en', 'laptop', LAPTOP],
    ];

const browser = await start();
const fouten = [];
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};

const OEFENING = {
  id: 'eigen-testoefening',
  soort: 'veld',
  naam: 'Testoefening passen',
  categorieen: ['techniek'],
  uitleg: 'Testtrainer 1 passt naar de overkant.',
  organisatie: '',
  benodigdheden: ['1 bal', '4 pionnen'],
  spelersNodig: 2,
  keepersNodig: 0,
  doorwisselbaar: true,
  coachpunten: ['Kijk op voor je passt'],
  variaties: { makkelijker: [], moeilijker: [] },
  tekening: {
    veld: { type: 'leeg', breedte: 30, lengte: 20 },
    objecten: [
      { id: 'a1', soort: 'speler', team: 'A', nummer: 1, x: 6, y: 10 },
      { id: 'a2', soort: 'speler', team: 'A', nummer: 2, x: 22, y: 10 },
      { id: 'bal1', soort: 'bal', x: 6, y: 10, bij: 'a1' },
    ],
    lijnen: [{ soort: 'bal', punten: [[6, 10], [22, 10]], van: 'a1', naar: 'a2', stap: 1 }],
  },
  eigen: true,
  gemaakt: 1,
  gewijzigd: 1,
};
const TRAINING = { id: 'training-test', naam: 'Testtraining', spelers: 8, keepers: 1, leeftijd: 'jo8-11', oefeningen: ['veld-pt-derde-man', 'eigen-testoefening'], gemaakt: 1, gewijzigd: 1 };
const CLUB = {
  id: 'club-test',
  naam: 'Testcircuit',
  datums: ['2026-11-09', '2026-11-11'],
  leeftijd: 'mini-5-7',
  kinderen: 30,
  groepjes: 6,
  trainers: ['Testtrainer 1', 'Testtrainer 2'],
  blokken: {},
  // 0.33.0: twee oefeningen in het eerste onderdeel, waarvan één eigen oefening.
  onderdelen: [
    { id: 'techniek', categorie: 'techniek', duur: 15, soort: 'stations', oefening: 'eigen-testoefening', oefeningen: [{ oefening: 'eigen-testoefening' }, { oefening: 'veld-mt-tik-tak', minuten: 5 }] },
    { id: 'een-tegen-een', categorie: 'een-tegen-een', duur: 15, soort: 'stations', oefening: 'veld-mt-over-de-rivier' },
    { id: 'afwerken', categorie: 'afwerken', duur: 15, soort: 'stations', oefening: 'veld-mt-pionnen-omgooien' },
    { id: 'partijvormen', categorie: 'partijvormen', duur: 15, soort: 'samen', oefening: 'veld-mt-3-tegen-3' },
  ],
  stationTrainers: { 1: 'Testtrainer 1' },
  veldTrainers: {},
  afgevinkt: [],
  gemaakt: 1,
  gewijzigd: 1,
};
const OPSTELLING = { ...nieuweOpstelling('8v8', [], 1, 'opst-test'), naam: 'Testopstelling' };
const BORD = { id: 'bord-test', naam: 'Testbord', soort: 'tactiek', tekening: OEFENING.tekening, gemaakt: 1, gewijzigd: 1 };

async function leegmaken() {
  if (ECHT) {
    for (const email of TESTACCOUNTS) await verwijderViaApp(email);
    return;
  }
  await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
}

async function toestel(viewport, taal = 'nl') {
  const context = await browser.createBrowserContext();
  await context.overridePermissions(new URL(BASE).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
  const page = await context.newPage();
  await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument(
    (echt, taal) => {
      try {
        if (!echt) localStorage.setItem('trainersapp.emulator', '1');
        localStorage.setItem('trainersapp.taal', taal);
      } catch {
        /* about:blank */
      }
    },
    ECHT,
    taal,
  );
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/400|403|PERMISSION_DENIED|permission|WebGL|GPU/i.test(m.text()) && fouten.push(m.text()));
  page.on('dialog', (d) => void d.accept());
  await page.setViewport(viewport);
  return { context, page };
}

const klik = async (page, tekst, selector = 'button') => {
  const ok = await page.evaluate(
    (tekst, selector) => {
      const el = [...document.querySelectorAll(selector)].find((b) => (b.textContent.trim().startsWith(tekst) || b.getAttribute('aria-label') === tekst) && !b.disabled);
      el?.click();
      return !!el;
    },
    tekst,
    selector,
  );
  if (!ok) problemen.push(`Knop "${tekst}" niet gevonden op ${page.url().slice(-60)}`);
  await slaap(300);
};
const heeftKnop = (page, tekst) => page.evaluate((tekst) => [...document.querySelectorAll('button')].some((b) => b.textContent.trim().startsWith(tekst) || b.getAttribute('aria-label') === tekst), tekst);
const vul = async (page, selector, tekst) => {
  const ok = await page.waitForSelector(selector, { timeout: 20000 }).catch(() => null);
  if (!ok) {
    problemen.push(`Veld ${selector} niet gevonden op ${page.url()}`);
    return;
  }
  await page.$eval(selector, (el) => {
    el.value = '';
  });
  await page.type(selector, tekst);
};
const wachtOp = async (page, f, arg, wat, ms = ECHT ? 40000 : 15000) => {
  try {
    await page.waitForFunction(f, { timeout: ms }, arg);
  } catch {
    problemen.push(`Wachten duurde te lang: ${wat} (team-fout-${problemen.length + 1}.png)`);
    await page.screenshot({ path: `${MAP}team-fout-${problemen.length}.png` }).catch(() => {});
  }
};
const wachtTekst = (page, tekst, wat) => wachtOp(page, (t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()), tekst, wat);
/** Tekst op de pagina, in kleine letters: kopjes staan met text-transform in hoofdletters. */
const bevat = async (page, t) => (await page.evaluate(() => document.body.innerText)).toLowerCase().includes(t.toLowerCase());
const wachtTeams = (page, wat) =>
  wachtOp(page, () => Object.keys(localStorage).some((k) => k.startsWith('trainersapp.u.') && k.endsWith('.teams') && (JSON.parse(localStorage.getItem(k) ?? '[]') ?? []).length > 0), null, wat);
const ga = async (page, pad) => {
  await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#${pad}`, { waitUntil: 'domcontentloaded' });
  await slaap(600);
};
/** Opgeslagen lijst van het ingelogde account. */
const lokaal = (page, naam) => page.evaluate((naam) => Object.keys(localStorage).filter((k) => k.startsWith('trainersapp.u.') && k.endsWith(`.${naam}`)).map((k) => localStorage.getItem(k)).join(' '), naam);

/** Niets afgekapt, geen horizontaal scrollen. */
const opmaak = async (page, waar) => {
  const r = await page.evaluate(() => ({
    breed: document.documentElement.scrollWidth - innerWidth,
    kap: [...document.querySelectorAll('button, a, h1, h2, h3, .rij-titel, .rij-sub, .club-station-naam')]
      .filter((e) => {
        if (!e.offsetParent || e.closest('.kop')) return false;
        const s = getComputedStyle(e);
        const b = e.getBoundingClientRect();
        return (b.width > 0 && (b.right > innerWidth + 1 || b.left < -1)) || ((s.overflow === 'hidden' || s.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 2);
      })
      .map((e) => `${e.innerText.slice(0, 30)} [${e.className} ${e.scrollWidth}>${e.clientWidth}]`),
  }));
  if (r.breed > 0) problemen.push(`${waar}: ${r.breed}px horizontaal scrollen`);
  if (r.kap.length) problemen.push(`${waar}: afgekapt: ${r.kap.join(' | ')}`);
};

async function account(page, naam, email, T, maken = true) {
  await ga(page, '/account');
  await page.waitForSelector('.account-form', { timeout: 15000 }).catch(() => problemen.push('Accountformulier verschijnt niet'));
  if (maken) {
    await klik(page, T('Account maken'), '[role="tab"]');
    await vul(page, '.account-form input[autocomplete="name"]', naam);
  }
  await vul(page, '.account-form input[type="email"]', email);
  await vul(page, '.account-form input[type="password"]', WACHTWOORD);
  await page.evaluate(() => document.querySelector('.account-form button[type="submit"]')?.click());
}

async function verwijderViaApp(email) {
  const t = await toestel(LAPTOP);
  const T = (s) => s;
  await account(t.page, '', email, T, false);
  await t.page.waitForFunction(() => document.querySelector('.account-naam') || document.querySelector('.account-form .waarschuwing'), { timeout: 20000 }).catch(() => {});
  const bestond = !!(await t.page.$('.account-naam'));
  if (bestond) {
    await klik(t.page, 'Account verwijderen…');
    await vul(t.page, '.gevaar-blok input[type="password"]', WACHTWOORD);
    await klik(t.page, 'Definitief verwijderen');
    await wachtOp(t.page, () => !!document.querySelector('.account-form'), null, `${email} verwijderen`, 60000);
  }
  await t.context.close();
  return bestond;
}

for (const [taal, formaat, vp] of COMBINATIES) {
  const waar = `${taal} ${formaat}`;
  const T = (s, vars = {}) => {
    let x = taal === 'en' ? (EN[s] ?? s) : s;
    for (const [k, v] of Object.entries(vars)) x = x.replaceAll(`{${k}}`, v);
    return x;
  };
  const shots = [];
  const foto = async (page, naam, tekst, volledig = true) => {
    const pad = `${MAP}team-${taal}-${formaat}-${naam}.png`;
    await slaap(150);
    await page.screenshot({ path: pad, fullPage: volledig });
    shots.push([pad, tekst]);
  };
  await leegmaken();

  // ---------- Testtrainer 1: alles op het apparaat, account, team ----------
  const t1 = await toestel(vp, taal);
  await ga(t1.page, '/');
  await t1.page.evaluate(
    (o, t, c, op, b) => {
      localStorage.setItem('trainersapp.eigen', JSON.stringify({ versie: 1, oefeningen: [o] }));
      localStorage.setItem('trainersapp.trainingen', JSON.stringify({ versie: 1, trainingen: [t] }));
      localStorage.setItem('trainersapp.clubtrainingen', JSON.stringify({ versie: 1, lijst: [c] }));
      localStorage.setItem('trainersapp.opstellingen', JSON.stringify({ versie: 1, lijst: [op] }));
      localStorage.setItem('trainersapp.borden', JSON.stringify({ versie: 1, lijst: [b] }));
    },
    OEFENING,
    TRAINING,
    CLUB,
    OPSTELLING,
    BORD,
  );
  await account(t1.page, 'Testtrainer 1', 'test1@example.com', T);
  await wachtOp(t1.page, () => !!document.querySelector('.paneel-vraag'), null, `${waar}: vraag om gegevens mee te nemen`);
  await klik(t1.page, T('Ja, meenemen'), '.paneel-vraag button');
  await wachtOp(t1.page, () => document.querySelector('.account-naam')?.textContent === 'Testtrainer 1', null, `${waar}: ingelogd als Testtrainer 1`);
  await wachtOp(t1.page, (t) => document.querySelector('.sync-regel')?.textContent.includes(t), T('Alles staat online'), `${waar}: alles online`);

  await ga(t1.page, '/teams');
  await vul(t1.page, `.team-form input[aria-label="${T('Naam van het team')}"]`, 'Testteam');
  await klik(t1.page, T('Maken'), '.team-form button');
  await wachtOp(t1.page, () => /^[A-Z2-9]{6}$/.test(document.querySelector('.team-code .code')?.textContent ?? ''), null, `${waar}: teamcode zichtbaar`);
  const code = await t1.page.evaluate(() => document.querySelector('.team-code .code')?.textContent ?? '');
  const teamId = await t1.page.evaluate(() => location.hash.split('/')[2]);

  // Eigen borden uit de voorbeelden.
  await ga(t1.page, '/hervatting/korte-corner');
  await klik(t1.page, T('Opslaan als eigen bord'));
  await wachtOp(t1.page, () => location.hash.startsWith('#/bord/'), null, `${waar}: eigen bord uit voorbeeldhervatting`);
  const hervatting = await t1.page.evaluate(() => location.hash.slice(2));
  await ga(t1.page, '/tactieken');
  await wachtOp(t1.page, () => !!document.querySelector('a[href^="#/tactiek/"]'), null, `${waar}: lijst voorbeeldtactieken`);
  const voorbeeld = await t1.page.evaluate(() => document.querySelector('a[href^="#/tactiek/"]')?.getAttribute('href').slice(1));
  await ga(t1.page, voorbeeld);
  await klik(t1.page, T('Opslaan als eigen bord'));
  await wachtOp(t1.page, () => location.hash.startsWith('#/bord/'), null, `${waar}: eigen bord uit voorbeeldtactiek`);
  const tactiek = await t1.page.evaluate(() => location.hash.slice(2));

  // Overal beide knoppen; alles delen met het team.
  const ITEMS = [
    ['teamtraining', '/training/training-test', T('Delen')],
    ['circuittraining', '/club/club-test', T('Deel met trainers')],
    ['eigen oefening', '/oefening/eigen-testoefening', T('Delen')],
    ['opstelling', '/opstelling/opst-test', T('Delen')],
    ['tactiekbord', '/bord/bord-test', T('Delen')],
    ['bord uit voorbeeldhervatting', `/${hervatting}`, T('Delen')],
    ['bord uit voorbeeldtactiek', `/${tactiek}`, T('Delen')],
  ];
  for (const [naam, pad, link] of ITEMS) {
    await ga(t1.page, pad);
    await wachtOp(t1.page, (t) => [...document.querySelectorAll('button')].some((b) => b.textContent.includes(t)), T('Delen met team'), `${waar}: knop Delen met team bij ${naam}`);
    const knoppen = await t1.page.evaluate(() => [...document.querySelectorAll('button')].map((b) => b.textContent.trim()));
    controle(knoppen.includes(link), `${waar}: geen knop "${link}" bij ${naam}: ${knoppen.join(' | ').slice(0, 200)}`);
    await wachtTeams(t1.page, `${waar}: teams geladen (${naam})`);
    await klik(t1.page, T('Delen met team'));
    await wachtTekst(t1.page, T('Gedeeld met {teams}', { teams: 'Testteam' }), `${waar}: ${naam} gedeeld`);
    await opmaak(t1.page, `${waar} ${naam}`);
    if (naam === 'circuittraining') await foto(t1.page, 'bewerk', 'Testtrainer 1: circuittraining met Delen met team');
    if (naam === 'eigen oefening') await foto(t1.page, 'oefening', 'Testtrainer 1: eigen oefening met Delen en Delen met team');
    if (naam === 'opstelling') await foto(t1.page, 'opstelling', 'Testtrainer 1: opstelling');
  }

  // De link van de eigen oefening.
  await ga(t1.page, '/oefening/eigen-testoefening');
  await t1.page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
  });
  await klik(t1.page, T('Delen'));
  await slaap(300);
  const link = (await t1.page.evaluate(() => navigator.clipboard.readText().catch(() => ''))).split('\n').pop();
  controle(/#\/d\/[A-Z2-9]{12}$/.test(link), `${waar}: link van de eigen oefening: ${link.slice(0, 80)}`);

  // ---------- Testtrainer 2 ----------
  const t2 = await toestel(vp, taal);
  await account(t2.page, 'Testtrainer 2', 'test2@example.com', T);
  await wachtOp(t2.page, () => document.querySelector('.account-naam')?.textContent === 'Testtrainer 2', null, `${waar}: ingelogd als Testtrainer 2`);
  await ga(t2.page, '/teams');
  await vul(t2.page, '.code-invoer', code.toLowerCase());
  await klik(t2.page, T('Joinen'), '.team-form button');
  await wachtOp(t2.page, () => document.querySelectorAll('.lid-regel').length === 2 && document.body.innerText.includes('Testcircuit'), null, `${waar}: team bij Testtrainer 2`);
  await foto(t2.page, 'team', 'Team bij Testtrainer 2');
  controle(await bevat(t2.page, `Testtrainer 2 (${T('jij')})`), `${waar}: eigen naam in de ledenlijst`);
  await opmaak(t2.page, `${waar} team`);
  controle(await bevat(t2.page, T('Gedeelde circuittrainingen')), `${waar}: geen kopje Gedeelde circuittrainingen`);
  const regel = await t2.page.evaluate(() => [...document.querySelectorAll('.training-regel')].find((r) => r.textContent.includes('Testcircuit'))?.textContent ?? '');
  controle(regel.includes(T('Gedeeld door {naam}', { naam: 'Testtrainer 1' })), `${waar}: naam van wie deelde: "${regel}"`);
  const borden = await t2.page.evaluate(() => [...document.querySelectorAll('.rij-sub')].map((x) => x.textContent).join(' | '));
  controle(borden.includes(T('Spelhervatting')), `${waar}: spelhervatting heet in de lijst: ${borden.slice(0, 200)}`);
  // Een lid kan het item van een ander niet terugtrekken of verwijderen.
  controle(!(await heeftKnop(t2.page, T('{naam} terugtrekken', { naam: 'Testcircuit' }))) && !(await heeftKnop(t2.page, T('{naam} uit het team verwijderen', { naam: 'Testcircuit' }))), `${waar}: lid ziet knoppen om het item weg te halen`);

  // Openen: plan, stations, rotatie, materiaal.
  await t2.page.evaluate(() => [...document.querySelectorAll('.training-regel .rij')].find((a) => a.textContent.includes('Testcircuit'))?.click());
  await wachtOp(t2.page, () => !!document.querySelector('.gedeeld-kop'), null, `${waar}: gedeelde circuittraining`);
  await foto(t2.page, 'circuit', 'Gedeelde circuittraining bij Testtrainer 2');
  await opmaak(t2.page, `${waar} circuit`);
  for (const t of [T('Gedeeld door {naam}', { naam: 'Testtrainer 1' }), 'Testcircuit', T('Rotatieschema'), T('Materiaal'), T('Open jouw station'), T('Extra voor de partijvelden')]) controle(await bevat(t2.page, t), `${waar}: "${t}" ontbreekt in de gedeelde circuittraining`);
  controle((await t2.page.$$('.club-station-knoppen button')).length === 7, `${waar}: 6 stations + partijvelden verwacht`);
  controle(!(await heeftKnop(t2.page, T('Aanpassen'))), `${waar}: lid ziet Aanpassen`);
  const basis = await t2.page.evaluate(() => location.hash.slice(1));
  controle(basis === `/team/${teamId}/club/club-test`, `${waar}: adres ${basis}`);

  // Station met de eigen oefening van Testtrainer 1, met animatie.
  await t2.page.evaluate(() => document.querySelector('.club-station-knoppen button')?.click());
  await wachtOp(t2.page, (t) => document.body.innerText.includes(t) && !!document.querySelector('.detail-media canvas'), 'Testoefening passen', `${waar}: station 1 met animatie`);
  await slaap(800);
  await foto(t2.page, 'station', 'Station 1 (eigen oefening van Testtrainer 1, animatie)');
  await opmaak(t2.page, `${waar} station`);
  // Tweede oefening in hetzelfde onderdeel.
  controle((await t2.page.$$('.club-oefening-keuze button')).length === 2, `${waar}: Oefening 1, 2 ontbreekt in het team`);
  const eersteTitel = await t2.page.evaluate(() => document.querySelector('.detail-titel')?.textContent);
  await t2.page.evaluate(() => document.querySelectorAll('.club-oefening-keuze button')[1]?.click());
  await slaap(700);
  controle((await t2.page.evaluate(() => document.querySelector('.detail-titel')?.textContent)) !== eersteTitel && !!(await t2.page.$('.detail-media canvas')), `${waar}: tweede oefening opent niet`);
  await ga(t2.page, `${basis}/partij`);
  await wachtOp(t2.page, () => !!document.querySelector('.detail-media canvas'), null, `${waar}: partijveld met animatie`);

  // Kopiëren.
  await ga(t2.page, basis);
  await wachtOp(t2.page, () => !!document.querySelector('.gedeeld-kop'), null, `${waar}: terug op de gedeelde circuittraining`);
  await klik(t2.page, T('Kopiëren naar mijn circuittrainingen'));
  await wachtOp(t2.page, () => /^#\/club\/[^/]+$/.test(location.hash) && !location.hash.includes('club-test'), null, `${waar}: gekopieerde circuittraining`);
  const kopie = await t2.page.evaluate(() => location.hash.split('/')[2]);
  controle((await lokaal(t2.page, 'clubtrainingen')).includes('Testcircuit'), `${waar}: kopie staat niet bij Testtrainer 2`);
  controle((await lokaal(t2.page, 'eigen')).includes('Testoefening passen'), `${waar}: eigen oefening kwam niet mee met de kopie`);
  await ga(t2.page, `/club/${kopie}/plan`);
  await wachtOp(t2.page, () => !!document.querySelector('.tabs.club-tabs'), null, `${waar}: plan van de kopie`);
  await foto(t2.page, 'kopie', 'Kopie: eigen circuittraining van Testtrainer 2', false);
  await ga(t2.page, '/club');
  await wachtTekst(t2.page, 'Testcircuit', `${waar}: kopie in de lijst`);

  // Teamtraining: leeftijd gaat mee. Bord uit voorbeeld: uitleg blijft.
  const data = await t2.page.evaluate(() => Object.keys(localStorage).filter((k) => k.endsWith('.teams')).map((k) => localStorage.getItem(k)).join(''));
  controle(data.includes('jo8-11'), `${waar}: leeftijd niet in de gedeelde teamtraining`);
  const bordId = hervatting.split('/')[1];
  await ga(t2.page, `/team/${teamId}/wedstrijd/${bordId}`);
  await wachtOp(t2.page, () => !!document.querySelector('.opst-soort'), null, `${waar}: gedeeld bord`);
  controle((await t2.page.evaluate(() => document.querySelector('.opst-soort')?.textContent)) === T('Spelhervatting'), `${waar}: gedeeld bord is geen spelhervatting`);
  controle((await t2.page.evaluate(() => document.querySelector('.kop h1')?.textContent ?? '')).includes(T('Spelhervatting')), `${waar}: titel gedeeld bord`);
  await foto(t2.page, 'bord', 'Gedeelde spelhervatting');
  await wachtOp(t2.page, (t) => [...document.querySelectorAll('button')].some((b) => b.textContent.trim().startsWith(t)), T('Kopiëren naar mijn wedstrijd'), `${waar}: knop kopiëren`);
  await slaap(500);
  await klik(t2.page, T('Kopiëren naar mijn wedstrijd'));
  await wachtOp(t2.page, () => location.hash.startsWith('#/bord/'), null, `${waar}: bord gekopieerd`);
  controle((await lokaal(t2.page, 'borden')).includes('korte-corner'), `${waar}: koppeling met het voorbeeld is weg na kopiëren`);

  // Link van de eigen oefening bij Testtrainer 2.
  const code2 = link.split('#')[1];
  await ga(t2.page, code2);
  await wachtOp(t2.page, () => !!document.querySelector('.gedeeld-kop') && !!document.querySelector('.detail-media canvas'), null, `${waar}: gedeelde oefening via link`);
  await foto(t2.page, 'link', 'Link van een eigen oefening');
  await opmaak(t2.page, `${waar} oefeninglink`);
  await klik(t2.page, T('Opslaan in mijn eigen oefeningen'));
  await wachtOp(t2.page, () => location.hash.startsWith('#/oefening/eigen-'), null, `${waar}: gedeelde oefening opgeslagen`);
  await ga(t2.page, '/eigen');
  await klik(t2.page, T('Gedeelde oefening openen via een link'));
  await vul(t2.page, '#deellink', link);
  await slaap(200);
  await klik(t2.page, T('Openen'), '.link-formulier button');
  await wachtOp(t2.page, () => location.hash.startsWith('#/d/'), null, `${waar}: link plakken bij Eigen oefeningen`);

  // ---------- Aanpassen en terugtrekken door de eigenaar ----------
  await ga(t1.page, `/team/${teamId}/club/club-test`);
  await wachtOp(t1.page, () => !!document.querySelector('.gedeeld-kop'), null, `${waar}: eigenaar opent zijn item`);
  controle(await bevat(t1.page, T('Gedeeld door jou')), `${waar}: eigenaar ziet niet Gedeeld door jou`);
  await foto(t1.page, 'eigenaar', 'Eigenaar: Aanpassen');
  await klik(t1.page, T('Aanpassen'));
  await wachtOp(t1.page, () => location.hash === '#/club/club-test', null, `${waar}: Aanpassen opent de eigen circuittraining`);
  await t1.page.$eval('input[maxlength="80"]', (e) => e.select());
  await t1.page.type('input[maxlength="80"]', 'Testcircuit nieuw');
  await slaap(300);
  await klik(t1.page, T('Delen met team'));
  await wachtTekst(t1.page, T('Gedeeld met {naam}', { naam: 'Testteam' }), `${waar}: opnieuw gedeeld`);
  await slaap(500);
  await ga(t2.page, `/team/${teamId}`);
  await wachtTekst(t2.page, 'Testcircuit nieuw', `${waar}: bijgewerkte naam bij Testtrainer 2`);
  await ga(t1.page, `/team/${teamId}`);
  await wachtTekst(t1.page, 'Testcircuit nieuw', `${waar}: eigenaar ziet de nieuwe naam`);
  await klik(t1.page, T('{naam} terugtrekken', { naam: 'Testcircuit nieuw' }));
  await wachtOp(t2.page, () => !document.body.innerText.includes('Testcircuit nieuw'), null, `${waar}: teruggetrokken bij Testtrainer 2`);
  await ga(t2.page, `/team/${teamId}/club/club-test`);
  await wachtOp(t2.page, (t) => !document.querySelector('.gedeeld-kop') && document.body.innerText.length > 0, null, `${waar}: teruggetrokken item opent niet meer`);
  controle((await lokaal(t2.page, 'clubtrainingen')).includes('Testcircuit'), `${waar}: de kopie van Testtrainer 2 is verdwenen`);

  // ---------- Beheerder verwijdert het item van een lid ----------
  await ga(t2.page, `/club/${kopie}`);
  await wachtTeams(t2.page, `${waar}: teams bij Testtrainer 2`);
  await wachtOp(t2.page, (t) => [...document.querySelectorAll('button')].some((b) => b.textContent.includes(t)), T('Delen met team'), `${waar}: knop bij de kopie`);
  await klik(t2.page, T('Delen met team'));
  await wachtTekst(t2.page, T('Gedeeld met {teams}', { teams: 'Testteam' }), `${waar}: lid deelt zijn kopie`);
  await ga(t1.page, `/team/${teamId}`);
  await wachtTekst(t1.page, 'Testcircuit', `${waar}: beheerder ziet het item van het lid`);
  await klik(t1.page, T('{naam} uit het team verwijderen', { naam: 'Testcircuit' }));
  await wachtOp(t1.page, () => !document.body.innerText.includes('Testcircuit'), null, `${waar}: beheerder heeft verwijderd`);
  await foto(t1.page, 'na', 'Team na terugtrekken en verwijderen');

  // De deellink van deze test intrekken: het account wordt straks op een ander toestel verwijderd, dat deze link niet kent.
  await ga(t1.page, '/links');
  for (let i = 0; i < 4; i += 1) {
    await t1.page.evaluate(() => document.querySelector('.training-regel .icoon-knop')?.click());
    await slaap(700);
  }
  controle((await t1.page.$$('.training-regel')).length === 0, `${waar}: deellink niet ingetrokken`);

  await t1.context.close();
  await t2.context.close();
  await blad(browser, shots, `${MAP}blad-team-${taal}-${formaat}.png`, formaat === 'telefoon' ? 6 : 3, 2600);
  console.log(`${waar}: klaar (${problemen.length} problemen tot nu toe)`);
}

// Link op een telefoon zonder de app.
if (!ECHT) {
  const o = await jiti.import('../../src/eigen/eigen.ts');
  const code = o.oefeningNaarCode(o.voorDelen(OEFENING));
  for (const taal of ['nl', 'en']) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36');
    await page.evaluateOnNewDocument((taal) => {
      try {
        localStorage.setItem('trainersapp.taal', taal);
      } catch {
        /* about:blank */
      }
    }, taal);
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.goto(`${BASE}?r=link#/o/${code}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.gedeeld-kop', { timeout: 10000 }).catch(() => problemen.push(`${taal}: oefeninglink zonder app opent niet`));
    await slaap(500);
    const r = await page.evaluate(() => ({ poort: !!document.querySelector('.poort'), uitleg: !!document.querySelector('.gedeeld-uitleg'), naam: document.querySelector('.detail-titel')?.textContent }));
    controle(!r.poort && r.uitleg && r.naam === OEFENING.naam, `${taal}: oefeninglink zonder app: ${JSON.stringify(r)}`);
    await page.screenshot({ path: `${MAP}team-link-${taal}.png`, fullPage: true });
    await context.close();
  }
}

await leegmaken();
if (ECHT) for (const email of TESTACCOUNTS) controle(!(await verwijderViaApp(email)), `${email} bestaat na afloop nog`);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)]);
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)]) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
