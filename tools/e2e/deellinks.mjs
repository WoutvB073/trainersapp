// 0.31.3: korte deellinks. Elke soort delen (met en zonder account): het deelbericht is twee regels, de link is kort en URL-veilig.
// Openen op een telefoon zonder app en zonder inlog, ook in de WhatsApp-browser op iPhone en Android, in NL en EN: meteen de inhoud,
// geen installatiescherm, onderaan de verwijzing. Onvolledige en ingetrokken links geven de melding met twee knoppen. Zonder internet
// de lange link. Oude lange links blijven werken. Blad: blad-deellinks.png.
// Eerst `npm run emulator` en de preview op poort 4184. Met ECHT=1 tegen het echte project (links worden daarna ingetrokken).
// Gebruik: node tools/e2e/deellinks.mjs [basis-url]
import { readFileSync } from 'node:fs';
import { BASE, MAP, alsGeinstalleerd, blad, slaap, start } from './hulp.mjs';

const ECHT = process.env.ECHT === '1';
const PROJECT = 'demo-toptraining';
const UA = Object.fromEntries(JSON.parse(readFileSync(new URL('./useragents.json', import.meta.url), 'utf8')).lijst.map((x) => [x.naam, x.ua]));
const TEKST = {
  nl: { fout: 'Deze link is niet compleet of bestaat niet meer. Vraag de afzender om hem opnieuw te sturen.', start: 'Naar het startscherm', opnieuw: 'Opnieuw proberen', melding: 'Zet TopTraining op je beginscherm', kop: 'Circuittraining' },
  en: { fout: 'This link is incomplete or no longer exists. Ask the sender to send it again.', start: 'Go to the home screen', opnieuw: 'Try again', melding: 'Add TopTraining to your home screen', kop: 'Circuit session' },
};

const browser = await start();
const fouten = [];
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};
const shots = [];

if (!ECHT) {
  await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
}

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
const TRAINING = { id: 'training-test', naam: 'Testtraining', spelers: 8, keepers: 1, oefeningen: ['veld-pt-derde-man', 'eigen-testoefening'], gemaakt: 1, gewijzigd: 1 };
const CLUB = { id: 'club-test', naam: 'MT', datums: ['2026-11-09'], leeftijd: 'mini-5-7', kinderen: 30, groepjes: 6, trainers: ['Testtrainer 1'], blokken: { techniek: 'eigen-testoefening', 'een-tegen-een': 'veld-mt-over-de-rivier', afwerken: 'veld-mt-pionnen-omgooien', partijvormen: 'veld-mt-3-tegen-3' }, stationTrainers: {}, veldTrainers: {}, afgevinkt: [], gemaakt: 1, gewijzigd: 1 };
const OPSTELLING = { id: 'opst-test', naam: 'Testopstelling', spelvorm: '8v8', formatie: '1-3-3-1', plekken: [{ id: 'p1', x: 21, y: 60, nummer: 1, naam: 'Testspeler 1' }], wissels: [], gemaakt: 1, gewijzigd: 1 };
const BORD = { id: 'bord-test', naam: 'Testbord', soort: 'tactiek', tekening: OEFENING.tekening, gemaakt: 1, gewijzigd: 1 };
const HERVATTING = { id: 'hervatting-test', naam: 'Testcorner', soort: 'hervatting', tekening: OEFENING.tekening, gemaakt: 1, gewijzigd: 1 };

/** Toestel van de maker (in de browser "als app"), met alles erop. */
async function maker(taal = 'nl') {
  const context = await browser.createBrowserContext();
  await context.overridePermissions(new URL(BASE).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
  const page = await context.newPage();
  await alsGeinstalleerd(page);
  await page.evaluateOnNewDocument(
    (echt, taal, o, t, c, op, b) => {
      try {
        localStorage.setItem(echt ? 'trainersapp.echteLinks' : 'trainersapp.emulator', '1');
        localStorage.setItem('trainersapp.taal', taal);
        if (!localStorage.getItem('trainersapp.eigen')) {
          localStorage.setItem('trainersapp.eigen', JSON.stringify({ versie: 1, oefeningen: [o] }));
          localStorage.setItem('trainersapp.trainingen', JSON.stringify({ versie: 1, trainingen: [t] }));
          localStorage.setItem('trainersapp.clubtrainingen', JSON.stringify({ versie: 1, lijst: [c] }));
          localStorage.setItem('trainersapp.opstellingen', JSON.stringify({ versie: 1, lijst: [op] }));
          localStorage.setItem('trainersapp.borden', JSON.stringify({ versie: 1, lijst: b }));
        }
      } catch {
        /* about:blank */
      }
    },
    ECHT,
    taal,
    OEFENING,
    TRAINING,
    CLUB,
    OPSTELLING,
    [BORD, HERVATTING],
  );
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/400|403|404|409|PERMISSION_DENIED|permission|WebGL|GPU|ERR_INTERNET|Failed to fetch/i.test(m.text()) && fouten.push(m.text()));
  page.on('dialog', (d) => void d.accept());
  await page.setViewport({ width: 1366, height: 820 });
  return { context, page };
}

/** Telefoon zonder app en zonder account. */
async function ontvanger(ua, taal, viewport = { width: 375, height: 667, isMobile: true, hasTouch: true }) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setUserAgent(ua);
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
  page.on('pageerror', (e) => fouten.push(`ontvanger: ${e.message}`));
  await page.setViewport(viewport);
  return { context, page };
}

const ga = async (page, pad) => {
  await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#${pad}`, { waitUntil: 'domcontentloaded' });
  await slaap(500);
};
const knopMet = (page, tekst) => page.evaluate((tekst) => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim().startsWith(tekst)); b?.click(); return !!b; }, tekst);
const tekstVan = (page) => page.evaluate(() => document.body.innerText);

/** Knop indrukken en het deelbericht van het klembord halen. */
async function deel(page, pad, knop) {
  await ga(page, pad);
  await page.waitForFunction((k) => [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === k), { timeout: 15000 }, knop);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    navigator.clipboard.writeText('');
  });
  await knopMet(page, knop);
  await page.waitForFunction(() => navigator.clipboard.readText().then((t) => t.length > 0), { timeout: 12000, polling: 200 }).catch(() => problemen.push(`${pad}: niets gekopieerd`));
  return page.evaluate(() => navigator.clipboard.readText());
}

// ---------- 1. Maken zonder account ----------
const m = await maker();
await ga(m.page, '/');
const SOORTEN = [
  ['Teamtraining', '/training/training-test', 'Delen', 'Teamtraining: Testtraining'],
  ['Circuittraining', '/club/club-test', 'Deel met trainers', 'Circuittraining: MT'],
  ['Eigen oefening', '/oefening/eigen-testoefening', 'Delen', 'Oefening: Testoefening passen'],
  ['Opstelling', '/opstelling/opst-test', 'Delen', 'Opstelling: Testopstelling'],
  ['Tactiekbord', '/bord/bord-test', 'Delen', 'Tactiekbord: Testbord'],
  ['Spelhervatting', '/bord/hervatting-test', 'Delen', 'Spelhervatting: Testcorner'],
];
const links = {};
for (const [naam, pad, knop, regel] of SOORTEN) {
  const bericht = await deel(m.page, pad, knop);
  const [eerste, tweede, ...rest] = bericht.split(/\r?\n/);
  links[naam] = tweede;
  console.log(`${naam}: ${JSON.stringify(eerste)} / ${tweede} (${tweede?.length} tekens)`);
  controle(eerste === regel, `${naam}: eerste regel "${eerste}"`);
  controle(rest.length === 0, `${naam}: meer dan twee regels`);
  controle(/\/#\/d\/[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{12}$/.test(tweede ?? ''), `${naam}: geen korte link: ${tweede?.slice(0, 80)}`);
  const lengte = (tweede ?? '').replace(/^.*\/#\/d\//, 'https://woutvb073.github.io/trainersapp/#/d/').length;
  controle(lengte <= 60, `${naam}: link van ${lengte} tekens`);
  controle(/^[A-Za-z0-9:/.#-]+$/.test(tweede ?? ''), `${naam}: onveilige tekens in de link`);
}
// Nog eens delen: dezelfde link (geen tweede document).
controle((await deel(m.page, '/club/club-test', 'Deel met trainers')).endsWith(links.Circuittraining), 'nog eens delen geeft een andere link');
// Een anonieme sessie is geen account.
await ga(m.page, '/instellingen');
const instellingen = await tekstVan(m.page);
controle(/Inloggen/.test(instellingen) && !/Uitloggen/.test(instellingen), 'na het maken van een link lijkt het alsof je ingelogd bent');
controle(/Mijn deellinks/i.test(instellingen), 'Mijn deellinks ontbreekt bij Instellingen');

// ---------- 2. Openen zonder app, ook in de WhatsApp-browser ----------
const pad = (link) => link.slice(link.indexOf('#') + 1);
const CONTROLES = { Teamtraining: 'Testtraining', Circuittraining: 'MT', 'Eigen oefening': 'Testoefening passen', Opstelling: 'Testopstelling', Tactiekbord: 'Testbord', Spelhervatting: 'Testcorner' };
for (const [wie, ua] of [['WhatsApp iPhone', UA['iPhone WhatsApp']], ['WhatsApp Android', UA['Android WhatsApp']], ['Safari iPhone', UA['iPhone Safari (iOS 18)']], ['Instagram iPhone', UA['iPhone Instagram']]]) {
  for (const taal of ['nl', 'en']) {
    const o = await ontvanger(ua, taal);
    for (const [naam, inhoud] of Object.entries(CONTROLES)) {
      if (wie !== 'WhatsApp iPhone' && wie !== 'WhatsApp Android' && naam !== 'Circuittraining') continue;
      const waar = `${wie} ${taal} ${naam}`;
      await ga(o.page, pad(links[naam]));
      await o.page.waitForFunction((t) => document.body.innerText.includes(t), { timeout: 12000 }, inhoud).catch(() => problemen.push(`${waar}: inhoud komt niet`));
      const r = await o.page.evaluate(() => ({ poort: !!document.querySelector('.poort'), melding: document.querySelector('.installeer-melding')?.innerText ?? '', breed: document.documentElement.scrollWidth - innerWidth, fout: !!document.querySelector('.link-fout') }));
      controle(!r.poort, `${waar}: installatiescherm in beeld`);
      controle(!r.fout, `${waar}: foutmelding`);
      controle(r.melding.includes(TEKST[taal].melding), `${waar}: melding onderaan: "${r.melding}"`);
      controle(r.breed <= 0, `${waar}: ${r.breed}px horizontaal scrollen`);
      if (wie === 'WhatsApp iPhone' && taal === 'nl') {
        const p = `${MAP}dl-${naam.replace(/\W/g, '')}.png`;
        await o.page.screenshot({ path: p, fullPage: true });
        shots.push([p, `WhatsApp iPhone: ${naam}`]);
      }
    }
    if (wie === 'WhatsApp iPhone') {
      // Station uit een circuittraining, met animatie, en terug.
      await ga(o.page, `${pad(links.Circuittraining)}/station/1`);
      await o.page.waitForFunction(() => !!document.querySelector('.detail-media canvas'), { timeout: 12000 }).catch(() => problemen.push(`${taal}: station zonder animatie`));
      // De melding brengt je bij de installatie-uitleg.
      await knopMet(o.page, TEKST[taal].melding);
      await slaap(300);
      controle(await o.page.evaluate(() => !!document.querySelector('.poort')), `${taal}: de melding opent de installatie-uitleg niet`);
    }
    await o.context.close();
  }
}

// ---------- 3. Onvolledige en kapotte links ----------
const oudeClub = Buffer.from(JSON.stringify({ v: 1, n: 'Maandag', d: ['2026-11-09'], l: 'mini-5-7', k: 30, g: 6, t: [], b: ['v:mt-tik-tak', '', '', ''], s: {}, f: {} })).toString('base64url');
for (const [wie, ua] of [['WhatsApp iPhone', UA['iPhone WhatsApp']], ['Android Chrome', UA['Android Chrome']]]) {
  for (const taal of ['nl', 'en']) {
    const o = await ontvanger(ua, taal);
    for (const stuk of ['/c/', '/c', '/d/', '/t/', '/o/', '/w/', '/d/ABC', '/d/ZZZZZZZZZZZZ', `/c/${oudeClub.slice(0, 20)}`, '/t/eyJ2Ijox', '/o/zzzz', '/w/zzzz']) {
      const waar = `${wie} ${taal} ${stuk}`;
      await ga(o.page, stuk);
      await o.page.waitForFunction(() => !!document.querySelector('.link-fout'), { timeout: 8000 }).catch(() => {});
      const t = await tekstVan(o.page);
      controle(t.includes(TEKST[taal].fout), `${waar}: geen melding: ${t.slice(0, 80).replace(/\s+/g, ' ')}`);
      controle(t.includes(TEKST[taal].start) && t.includes(TEKST[taal].opnieuw), `${waar}: knoppen ontbreken`);
      controle(!(await o.page.$('.poort')), `${waar}: installatiescherm`);
    }
    if (wie === 'WhatsApp iPhone') {
      const p = `${MAP}dl-fout-${taal}.png`;
      await o.page.screenshot({ path: p });
      shots.push([p, `Kapotte link (${taal})`]);
    }
    await knopMet(o.page, TEKST[taal].start);
    await slaap(400);
    controle(!(await o.page.$('.link-fout')), `${wie} ${taal}: Naar het startscherm werkt niet`);
    await o.context.close();
  }
}

// ---------- 4. Oude lange links en de lange terugval ----------
{
  const o = await ontvanger(UA['iPhone WhatsApp'], 'nl');
  await ga(o.page, `/c/${oudeClub}`);
  await o.page.waitForFunction(() => document.querySelector('.detail-titel')?.textContent === 'Maandag', { timeout: 8000 }).catch(() => problemen.push('oude lange link opent niet'));
  await o.context.close();

  await ga(m.page, '/club/club-test');
  await m.page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Deel met trainers'));
  await m.page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'onLine', { get: () => false, configurable: true });
  });
  await knopMet(m.page, 'Deel met trainers');
  await slaap(600);
  const bericht = await m.page.evaluate(() => navigator.clipboard.readText());
  const [eerste, lang] = bericht.split(/\r?\n/);
  console.log(`Zonder internet: ${lang?.length} tekens`);
  controle(eerste === 'Circuittraining: MT', `terugval: eerste regel "${eerste}"`);
  controle(/\/#\/c\/z[A-Za-z0-9_-]+$/.test(lang ?? ''), `terugval: ${lang?.slice(0, 80)}`);
  const p = await ontvanger(UA['Android WhatsApp'], 'en');
  await ga(p.page, pad(lang));
  await p.page.waitForFunction(() => document.querySelector('.detail-titel')?.textContent === 'MT', { timeout: 8000 }).catch(() => problemen.push('lange terugval opent niet'));
  await p.context.close();
}

// ---------- 5. Intrekken ----------
await ga(m.page, '/links');
await m.page.waitForSelector('.training-regel', { timeout: 8000 }).catch(() => problemen.push('Mijn deellinks is leeg'));
const pf = `${MAP}dl-mijnlinks.png`;
await m.page.screenshot({ path: pf });
shots.push([pf, 'Mijn deellinks']);
const aantal = (await m.page.$$('.training-regel')).length;
controle(aantal === SOORTEN.length, `Mijn deellinks: ${aantal} van ${SOORTEN.length}`);
await m.page.evaluate(() => document.querySelector('.training-regel .icoon-knop')?.click());
await m.page.waitForFunction((n) => document.querySelectorAll('.training-regel').length === n - 1, { timeout: 8000 }, aantal).catch(() => problemen.push('intrekken lukt niet'));
const ingetrokken = await m.page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.deellinks')).length);
{
  // De laatst gemaakte (bovenaan) is ingetrokken: dat is de spelhervatting.
  const o = await ontvanger(UA['iPhone WhatsApp'], 'nl');
  await ga(o.page, pad(links.Spelhervatting));
  await o.page.waitForFunction(() => !!document.querySelector('.link-fout'), { timeout: 8000 }).catch(() => problemen.push('ingetrokken link opent nog'));
  await ga(o.page, pad(links.Opstelling));
  await o.page.waitForFunction(() => document.body.innerText.includes('Testopstelling'), { timeout: 8000 }).catch(() => problemen.push('andere link werkt niet meer na intrekken'));
  await o.context.close();
}
console.log(`Ingetrokken: over ${ingetrokken}`);

// Opruimen: alle links van deze test intrekken.
await ga(m.page, '/links');
for (let i = 0; i < 12; i += 1) {
  const over = await m.page.evaluate(() => {
    const k = document.querySelector('.training-regel .icoon-knop');
    k?.click();
    return !!k;
  });
  if (!over) break;
  await slaap(700);
}
controle((await m.page.$$('.training-regel')).length === 0, 'niet alle testlinks zijn ingetrokken');

await blad(browser, shots, `${MAP}blad-deellinks.png`, 5, 2400);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)].slice(0, 40)) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
