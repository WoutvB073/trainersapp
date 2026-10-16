// Online (account, synchronisatie, teams) in de browser met twee testaccounts, tegen de Firebase-emulator
// (eerst `npm run emulator` starten; de preview op poort 4184 moet draaien). Op telefoon, tablet en laptop:
// account maken (met de vraag of de gegevens van het apparaat mee mogen), team maken, met de code joinen op het tweede
// account, een oefening en een training delen, die op het tweede account gebruiken (bibliotheek met teambadge,
// training kopiëren), rollen, en tot slot de testaccounts verwijderen. Alleen nep-adressen (test1@example.com …).
// Screenshots: blad-online.png. Gebruik: node tools/e2e/online.mjs [basis-url]
// Met ECHT=1 tegen het echte Firebase-project (zonder emulator): de testaccounts worden dan vooraf en na afloop via
// "Account verwijderen" in de app opgeruimd (dat verwijdert ook hun gegevens en teams), en gecontroleerd dat ze weg zijn.
import { BASE, MAP, alsGeinstalleerd, blad, slaap, start } from './hulp.mjs';

const browser = await start();
const fouten = [];
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};
const TELEFOON = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const TABLET = { width: 820, height: 1180, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true };
const LAPTOP = { width: 1366, height: 820, deviceScaleFactor: 1 };
const PROJECT = 'demo-toptraining';
const WACHTWOORD = 'testwachtwoord1';
const ECHT = process.env.ECHT === '1';
const TESTACCOUNTS = ['test2@example.com', 'test1@example.com'];

async function leegmaken() {
  if (ECHT) {
    for (const email of TESTACCOUNTS) await verwijderViaApp(email);
    return;
  }
  await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
}

const shots = [];
const foto = async (page, naam, tekst, volledig = false) => {
  const pad = `${MAP}online-${naam}.png`;
  await page.screenshot({ path: pad, fullPage: volledig });
  shots.push([pad, tekst]);
};

/** Een "toestel": eigen browsercontext (eigen opslag), als geïnstalleerde app, verbonden met de emulator. */
async function toestel(viewport) {
  const context = await browser.createBrowserContext();
  await context.overridePermissions(new URL(BASE).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
  const page = await context.newPage();
  await alsGeinstalleerd(page);
  if (!ECHT)
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem('trainersapp.emulator', '1');
      } catch {
        /* about:blank */
      }
    });
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/400|403|PERMISSION_DENIED|permission/i.test(m.text()) && fouten.push(m.text()));
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
  if (!ok) problemen.push(`Knop "${tekst}" niet gevonden`);
  await slaap(300);
};
const vul = async (page, selector, tekst) => {
  const ok = await page.waitForSelector(selector, { timeout: 20000 }).catch(() => null);
  if (!ok) {
    problemen.push(`Veld ${selector} niet gevonden op ${page.url()}: ${(await tekst_(page)).slice(0, 200)}`);
    await page.screenshot({ path: `${MAP}online-fout-${problemen.length}.png` });
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
    problemen.push(`Wachten duurde te lang: ${wat} (zie online-fout-${problemen.length + 1}.png)`);
    await page.screenshot({ path: `${MAP}online-fout-${problemen.length}.png` }).catch(() => {});
  }
};
const tekst_ = (page) => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
const tekst = (page) => page.evaluate(() => document.body.innerText);
/** Wachten tot de teams (na herladen) weer binnen zijn. */
const wachtTeams = (page, wat) =>
  wachtOp(page, () => Object.keys(localStorage).some((k) => k.startsWith('trainersapp.u.') && k.endsWith('.teams') && (JSON.parse(localStorage.getItem(k) ?? '[]') ?? []).length > 0), null, wat);

const OEFENING = {
  id: 'eigen-testoefening',
  soort: 'veld',
  naam: 'Testoefening passen',
  categorieen: ['techniek'],
  uitleg: 'Testtrainer 1 passt naar de overkant.',
  organisatie: '',
  benodigdheden: ['1 bal'],
  spelersNodig: 2,
  keepersNodig: 0,
  doorwisselbaar: true,
  coachpunten: [],
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
const TRAINING = { id: 'training-test', naam: 'Testtraining', spelers: 8, keepers: 1, oefeningen: ['veld-pt-derde-man', 'eigen-testoefening'], gemaakt: 1, gewijzigd: 1 };

async function account(page, naam, email, maken = true) {
  await page.goto(`${BASE}?r=acc#/account`, { waitUntil: 'domcontentloaded' });
  await slaap(500);
  await page.waitForSelector('.account-form', { timeout: 15000 }).catch(() => problemen.push('Accountformulier verschijnt niet'));
  if (maken) {
    await klik(page, 'Account maken', '[role="tab"]');
    await vul(page, '.account-form input[autocomplete="name"]', naam);
  }
  await vul(page, '.account-form input[type="email"]', email);
  await vul(page, '.account-form input[type="password"]', WACHTWOORD);
  await page.evaluate(() => document.querySelector('.account-form button[type="submit"]')?.click());
}

/** Inloggen met een testaccount; bestaat het, dan via de app verwijderen. Geeft terug of het bestond. */
async function verwijderViaApp(email) {
  const t = await toestel(LAPTOP);
  await account(t.page, '', email, false);
  await t.page.waitForFunction(() => document.querySelector('.account-naam') || document.querySelector('.account-form .waarschuwing'), { timeout: 20000 }).catch(() => {});
  const bestond = !!(await t.page.$('.account-naam'));
  if (bestond) {
    await klik(t.page, 'Account verwijderen…');
    await vul(t.page, '.gevaar-blok input[type="password"]', WACHTWOORD);
    await klik(t.page, 'Definitief verwijderen');
    await wachtOp(t.page, () => !!document.querySelector('.account-form'), null, `${email} verwijderen`, 30000);
  }
  await t.context.close();
  return bestond;
}

for (const [naam, vp] of [
  ['telefoon', TELEFOON],
  ['tablet', TABLET],
  ['laptop', LAPTOP],
]) {
  await leegmaken();
  // ---------- Testtrainer 1: eigen spullen op het apparaat, dan account maken ----------
  const t1 = await toestel(vp);
  await t1.page.goto(`${BASE}?r=1#/`, { waitUntil: 'domcontentloaded' });
  await slaap(700);
  await t1.page.evaluate(
    (o, t) => {
      localStorage.setItem('trainersapp.eigen', JSON.stringify({ versie: 1, oefeningen: [o] }));
      localStorage.setItem('trainersapp.trainingen', JSON.stringify({ versie: 1, trainingen: [t] }));
      localStorage.setItem('trainersapp.favorieten', JSON.stringify({ versie: 1, ids: ['veld-pt-derde-man'] }));
    },
    OEFENING,
    TRAINING,
  );
  await account(t1.page, 'Testtrainer 1', 'test1@example.com');
  await wachtOp(t1.page, () => !!document.querySelector('.paneel-vraag'), null, `${naam}: vraag om gegevens mee te nemen`);
  const vraag = await t1.page.evaluate(() => document.querySelector('.paneel-vraag')?.textContent ?? '');
  controle(/1 eigen oefening/.test(vraag) && /1 training/.test(vraag) && /1 favoriet/.test(vraag), `${naam}: vraag samenvoegen: "${vraag.slice(0, 120)}"`);
  if (naam === 'telefoon') await foto(t1.page, 'samenvoegen', 'Eerste keer inloggen: gegevens van dit apparaat meenemen?');
  await klik(t1.page, 'Ja, meenemen', '.paneel-vraag button');
  await wachtOp(t1.page, () => document.querySelector('.account-naam')?.textContent === 'Testtrainer 1', null, `${naam}: ingelogd als Testtrainer 1`);
  await wachtOp(t1.page, () => document.querySelector('.sync-regel')?.textContent.includes('Alles staat online'), null, `${naam}: alles online`);
  await slaap(2000);
  const blijft = await t1.page.evaluate(() => document.querySelector('.sync-regel')?.textContent ?? '');
  controle(blijft.includes('Alles staat online'), `${naam}: status blijft niet 'alles online' maar: ${blijft}`);
  await foto(t1.page, `${naam}-account`, `${naam}: account van Testtrainer 1 (alles staat online)`);

  // Team maken.
  await t1.page.goto(`${BASE}?r=2#/teams`, { waitUntil: 'domcontentloaded' });
  await slaap(700);
  await vul(t1.page, '.team-form input[aria-label="Naam van het team"]', 'Testteam');
  await klik(t1.page, 'Maken', '.team-form button');
  await wachtOp(t1.page, () => /^[A-Z2-9]{6}$/.test(document.querySelector('.team-code .code')?.textContent ?? ''), null, `${naam}: teamcode zichtbaar`);
  const code = await t1.page.evaluate(() => document.querySelector('.team-code .code')?.textContent ?? '');
  controle(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/.test(code), `${naam}: code ${code}`);

  // Oefening en training delen.
  await t1.page.goto(`${BASE}?r=3#/oefening/eigen-testoefening`, { waitUntil: 'domcontentloaded' });
  await slaap(700);
  await wachtOp(t1.page, () => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Delen met team')), null, `${naam}: knop Delen met team (oefening)`);
  await wachtTeams(t1.page, naam + ': teams geladen');
  await klik(t1.page, 'Delen met team');
  await wachtOp(t1.page, () => document.body.innerText.includes('Gedeeld met Testteam'), null, `${naam}: oefening gedeeld`);
  await t1.page.goto(`${BASE}?r=4#/training/training-test`, { waitUntil: 'domcontentloaded' });
  await slaap(700);
  await wachtOp(t1.page, () => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Delen met team')), null, `${naam}: knop Delen met team (training)`);
  await wachtTeams(t1.page, naam + ': teams geladen');
  await klik(t1.page, 'Delen met team');
  await wachtOp(t1.page, () => document.body.innerText.includes('Gedeeld met Testteam'), null, `${naam}: training gedeeld`);

  // ---------- Testtrainer 2: ander toestel, account maken, joinen met de code ----------
  const t2 = await toestel(vp);
  await account(t2.page, 'Testtrainer 2', 'test2@example.com');
  await wachtOp(t2.page, () => document.querySelector('.account-naam')?.textContent === 'Testtrainer 2', null, `${naam}: ingelogd als Testtrainer 2`);
  controle(!(await t2.page.evaluate(() => !!document.querySelector('.paneel-vraag'))), `${naam}: vraag samenvoegen zonder eigen gegevens`);
  await t2.page.goto(`${BASE}?r=5#/teams`, { waitUntil: 'domcontentloaded' });
  await slaap(700);
  await vul(t2.page, '.code-invoer', code.toLowerCase());
  await klik(t2.page, 'Joinen', '.team-form button');
  await wachtOp(t2.page, () => document.querySelectorAll('.lid-regel').length === 2 && document.body.innerText.includes('Testoefening passen') && document.body.innerText.includes('Testtraining'), null, `${naam}: team bij Testtrainer 2 met gedeelde items`);
  await foto(t2.page, `${naam}-team`, `${naam}: team bij Testtrainer 2 (gedeelde oefening en training, leden)`, naam === 'telefoon');
  // Leden zien geen beheerknoppen.
  controle(!(await t2.page.evaluate(() => [...document.querySelectorAll('button')].some((b) => /Nieuwe code|Team opheffen|Beheerder maken/.test(b.textContent)))), `${naam}: lid ziet beheerknoppen`);

  // In de bibliotheek met teambadge (ook met zoeken).
  await t2.page.goto(`${BASE}?r=6#/veld/techniek`, { waitUntil: 'domcontentloaded' });
  await slaap(700);
  await t2.page.type('.zoekveld input', 'Testoefening');
  await slaap(300);
  const kaart = await t2.page.evaluate(() => [...document.querySelectorAll('.kaart')].map((k) => k.textContent).join(' | '));
  controle(kaart.includes('Testoefening passen') && kaart.includes('Testteam'), `${naam}: teamoefening in de bibliotheek: ${kaart.slice(0, 120)}`);
  if (naam === 'telefoon') await foto(t2.page, 'bibliotheek', 'Bibliotheek bij Testtrainer 2: gedeelde oefening met de teambadge');

  // Gedeelde training kopiëren en gebruiken.
  await t2.page.goto(`${BASE}?r=7#/teams`, { waitUntil: 'domcontentloaded' });
  await slaap(700);
  await wachtOp(t2.page, () => !!document.querySelector('.lijst .rij'), null, naam + ': teamlijst');
  await t2.page.evaluate(() => document.querySelector('.lijst .rij')?.click());
  await wachtOp(t2.page, () => document.body.innerText.includes('Testtraining'), null, `${naam}: teampagina`);
  await t2.page.evaluate(() => [...document.querySelectorAll('.training-regel .rij')].find((a) => a.textContent.includes('Testtraining'))?.click());
  await wachtOp(t2.page, () => !!document.querySelector('.gedeeld-kop'), null, `${naam}: gedeelde training`);
  const oefeningenInTraining = await t2.page.evaluate(() => [...document.querySelectorAll('.onderdeel-naam')].map((x) => x.textContent));
  controle(oefeningenInTraining.length === 2 && oefeningenInTraining.includes('Testoefening passen'), `${naam}: gedeelde training toont ${oefeningenInTraining.join(', ')}`);
  if (naam === 'telefoon') await foto(t2.page, 'teamtraining', 'Gedeelde training bij Testtrainer 2', true);
  await klik(t2.page, 'Kopiëren naar mijn trainingen');
  await wachtOp(t2.page, () => location.hash.startsWith('#/training/') && document.querySelectorAll('.onderdeel').length === 2, null, `${naam}: gekopieerde training`);
  await t2.page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.startsWith('Start training'))?.click());
  await slaap(1200);
  const speelt = await t2.page.evaluate(() => Number(document.querySelector('.speler-balk')?.max ?? 0));
  controle(speelt > 0, `${naam}: gekopieerde training speelt de oefening niet af`);

  // Wedstrijd: opstelling delen met het team en bij Testtrainer 2 kopiëren.
  await t1.page.goto(`${BASE}?r=w1#/wedstrijd`, { waitUntil: 'domcontentloaded' });
  await slaap(700);
  await klik(t1.page, 'Nieuwe opstelling');
  await wachtOp(t1.page, () => location.hash.startsWith('#/opstelling/'), null, `${naam}: opstelling gemaakt`);
  await wachtTeams(t1.page, naam + ': teams geladen (opstelling)');
  await wachtOp(t1.page, () => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Delen met team')), null, `${naam}: knop Delen met team (opstelling)`);
  await klik(t1.page, 'Delen met team');
  await wachtOp(t1.page, () => document.body.innerText.includes('Gedeeld met Testteam'), null, `${naam}: opstelling gedeeld`);
  await t2.page.goto(`${BASE}?r=w2#/teams`, { waitUntil: 'domcontentloaded' });
  await slaap(700);
  await wachtOp(t2.page, () => !!document.querySelector('.lijst .rij'), null, naam + ': teamlijst (wedstrijd)');
  await t2.page.evaluate(() => document.querySelector('.lijst .rij')?.click());
  await wachtOp(t2.page, () => [...document.querySelectorAll('.rij-sub')].some((x) => x.textContent.startsWith('Opstelling')), null, `${naam}: gedeelde opstelling bij Testtrainer 2`);
  await t2.page.evaluate(() => [...document.querySelectorAll('.rij')].find((a) => a.querySelector('.rij-sub')?.textContent.startsWith('Opstelling'))?.click());
  await wachtOp(t2.page, () => document.querySelectorAll('.opst-plek').length === 11, null, `${naam}: gedeelde opstelling openen`);
  if (naam === 'telefoon') await foto(t2.page, 'team-opstelling', 'Gedeelde opstelling in het team (Testtrainer 2)', true);
  await klik(t2.page, 'Kopiëren naar mijn wedstrijd');
  await wachtOp(t2.page, () => location.hash.startsWith('#/opstelling/'), null, `${naam}: opstelling gekopieerd`);

  // Rollen: Testtrainer 1 maakt Testtrainer 2 beheerder; die ziet dan de beheerknoppen.
  await t1.page.goto(`${BASE}?r=8#/teams`, { waitUntil: 'domcontentloaded' });
  await slaap(700);
  await wachtOp(t1.page, () => !!document.querySelector('.lijst .rij'), null, naam + ': teamlijst');
  await t1.page.evaluate(() => document.querySelector('.lijst .rij')?.click());
  await wachtOp(t1.page, () => document.querySelectorAll('.lid-regel').length === 2, null, `${naam}: leden bij de beheerder`);
  if (naam === 'telefoon') await foto(t1.page, 'beheerder', 'Teampagina bij de beheerder (code, delen, leden beheren)', true);
  await klik(t1.page, 'Beheerder maken');
  await wachtOp(t2.page, () => true, null, '');
  await t2.page.goto(`${BASE}?r=9#/teams`, { waitUntil: 'domcontentloaded' });
  await slaap(700);
  await wachtOp(t2.page, () => !!document.querySelector('.lijst .rij'), null, naam + ': teamlijst');
  await t2.page.evaluate(() => document.querySelector('.lijst .rij')?.click());
  await wachtOp(t2.page, () => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Nieuwe code')), null, `${naam}: nieuwe beheerder ziet "Nieuwe code"`);

  // Instellingen met account.
  if (naam === 'telefoon') {
    await t1.page.goto(`${BASE}?r=10#/instellingen`, { waitUntil: 'domcontentloaded' });
    await wachtOp(t1.page, () => document.querySelector('.sync-regel')?.textContent.includes('Alles staat online'), null, 'instellingen: alles online');
    await slaap(500);
    await foto(t1.page, 'instellingen', 'Instellingen: account en teams', true);
    // Uitloggen: de gegevens van het apparaat zijn er weer.
    await t1.page.goto(`${BASE}?r=11#/account`, { waitUntil: 'domcontentloaded' });
    await slaap(700);
    await klik(t1.page, 'Uitloggen');
    await wachtOp(t1.page, () => !!document.querySelector('.account-form'), null, 'uitgelogd');
    const lokaal = await t1.page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.eigen') ?? '{}').oefeningen?.length ?? 0);
    controle(lokaal === 1, `Na uitloggen: ${lokaal} eigen oefeningen op het apparaat`);
    // Opnieuw inloggen: geen vraag meer (dit apparaat is al gekoppeld) en alles is er.
    await account(t1.page, '', 'test1@example.com', false);
    await wachtOp(t1.page, () => document.querySelector('.account-naam')?.textContent === 'Testtrainer 1', null, 'opnieuw ingelogd');
    controle(!(await t1.page.evaluate(() => !!document.querySelector('.paneel-vraag'))), 'Opnieuw inloggen: toch weer de vraag om samen te voegen');
    // Account verwijderen (Testtrainer 2) via de app.
    await t2.page.goto(`${BASE}?r=12#/account`, { waitUntil: 'domcontentloaded' });
    await slaap(700);
    await klik(t2.page, 'Account verwijderen…');
    await vul(t2.page, '.gevaar-blok input[type="password"]', WACHTWOORD);
    await klik(t2.page, 'Definitief verwijderen');
    await wachtOp(t2.page, () => !!document.querySelector('.account-form'), null, 'account verwijderd');
  }
  await t1.context.close();
  await t2.context.close();
}

// Alle testaccounts en gegevens weg (emulator leeg, of in het echte project via de app verwijderd en gecontroleerd).
await leegmaken();
if (ECHT) for (const email of TESTACCOUNTS) controle(!(await verwijderViaApp(email)), `${email} bestaat na afloop nog`);
await blad(browser, shots, `${MAP}blad-online.png`, 4, 2000);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)]);
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of problemen) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
