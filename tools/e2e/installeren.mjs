// Installatiescherm (0.29.1) met de echte user-agents van alle combinaties (tools/e2e/useragents.json), op telefoon-
// (iPhone SE) en tabletformaat, in het Nederlands en Engels: juiste stappen, pijl "Begin hier" binnen beeld, niets
// afgekapt, geen horizontaal scrollen, knoppen "Lukt het niet?", "Andere browser of telefoon" en "Gewoon in de browser".
// Daarna: keuze voor de browser onthouden (telefoon en laptop), "Je hebt de app al", bevestiging na installeren,
// geïnstalleerde app = direct de app, Openen in Chrome (intent-link).
// Bladen: blad-inst-<groep>-<taal>.png.   Gebruik: node tools/e2e/installeren.mjs [basis-url]
import fs from 'node:fs';
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, UA } from './hulp.mjs';

const { lijst } = JSON.parse(fs.readFileSync(new URL('./useragents.json', import.meta.url), 'utf8'));

/** Verwachte pijl per sleutel (telefoon; iPad Safari wijst naar rechtsboven). */
const PIJL = {
  'ios-safari-26': 'onder-rechts',
  'ios-safari': 'onder-midden',
  'ios-chrome': 'boven-rechts',
  'ios-edge': 'onder-midden',
  'ios-firefox': 'onder-rechts',
  'android-chrome': 'boven-rechts',
  'android-samsung': 'onder-rechts',
  'android-edge': 'onder-midden',
};
const NL_WOORDEN = ['de', 'het', 'een', 'en', 'op', 'naar', 'Tik', 'Kies', 'Gewoon', 'Lukt', 'Toevoegen', 'beginscherm', 'startscherm', 'Deel', 'Delen', 'Openen', 'Kopieer', 'Andere', 'Zet', 'Voeg'];
const EN_WOORDEN = ['Tap', 'Choose', 'Share', 'Add to', 'Install app', 'Copy link', 'Not working', 'Just use', 'the'];

const browser = await start();
const problemen = [];
const shots = {};
const tabel = [];

/** `verzoek: false`: geen installatieverzoek (zoals in Samsung Internet zonder verzoek, Xiaomi, Huawei …), zodat de stappen en de pijl te zien zijn. */
async function nieuwePagina(ua, w, h, taal, extra = {}, verzoek = false) {
  const page = await browser.newPage();
  if (!verzoek) await page.evaluateOnNewDocument(() => window.addEventListener('beforeinstallprompt', (e) => e.stopImmediatePropagation(), true));
  await page.evaluateOnNewDocument(
    (taal, extra) => {
      try {
        localStorage.setItem('trainersapp.taal', taal);
        for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, v);
      } catch {
        /* about:blank */
      }
    },
    taal,
    extra,
  );
  await page.setUserAgent(ua);
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 1000, hasTouch: w < 1000 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]); // pijl stil voor de controle
  return page;
}

for (const x of lijst) {
  const formaat = x.computer ? [1366, 800] : x.tablet ? (x.sleutel.startsWith('android') ? [800, 1280] : [820, 1180]) : [375, 667];
  for (const taal of ['nl', 'en']) {
    const page = await nieuwePagina(x.ua, formaat[0], formaat[1], taal);
    if (x.mac) {
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
        Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 });
      });
    }
    await page.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(
      (nlW, enW) => {
        const zoek = (w) => new RegExp(`(^|[^\\p{L}'’-])(${w.join('|')})(?=$|[^\\p{L}'’-])`, 'gu');
        const poort = document.querySelector('.poort');
        const tekst = poort?.innerText ?? '';
        const kap = [];
        for (const e of document.querySelectorAll('.poort button, .poort a, .poort h1, .poort h2, .poort h3, .poort p, .poort-stap-tekst')) {
          const b = e.getBoundingClientRect();
          if (!b.width) continue;
          if (b.right > innerWidth + 1 || b.left < -1) kap.push(`buiten beeld: ${e.innerText.slice(0, 30)}`);
          const s = getComputedStyle(e);
          if ((s.overflow === 'hidden' || s.textOverflow === 'ellipsis' || s.whiteSpace === 'nowrap') && e.scrollWidth > e.clientWidth + 2) kap.push(e.innerText.slice(0, 30));
        }
        const pijlEl = document.querySelector('.poort-pijl');
        const pijl = pijlEl ? [...pijlEl.classList].find((c) => c.startsWith('poort-pijl--'))?.replace('poort-pijl--', '') : null;
        const pb = pijlEl?.querySelector('.poort-pijl-binnen')?.getBoundingClientRect();
        return {
          poort: !!poort,
          titel: document.querySelector('.poort-kaart-titel')?.textContent,
          stappen: [...document.querySelectorAll('.poort-kaart:not(.poort-anders) .poort-stap-tekst')].map((e) => e.textContent),
          knoppen: [...document.querySelectorAll('.poort button, .poort a.poort-knop')].map((e) => e.textContent.trim()),
          chrome: document.querySelector('a.poort-knop')?.getAttribute('href') ?? null,
          browserKnop: !!document.querySelector('.poort-browser button'),
          hulp: document.querySelectorAll('.poort-hulp-knop').length,
          pijl,
          pijlInBeeld: !pb || (pb.left >= 0 && pb.right <= innerWidth && pb.top >= 0 && pb.bottom <= innerHeight),
          kap,
          breed: document.documentElement.scrollWidth - innerWidth,
          nl: [...new Set([...tekst.matchAll(zoek(nlW))].map((m) => m[2]))],
          en: [...new Set([...tekst.matchAll(zoek(enW))].map((m) => m[2]))],
        };
      },
      NL_WOORDEN,
      EN_WOORDEN,
    );
    const waar = `${x.naam} (${taal})`;
    if (!r.poort) problemen.push(`${waar}: geen installatiescherm`);
    if (!r.browserKnop) problemen.push(`${waar}: knop "Gewoon in de browser gebruiken" ontbreekt`);
    if (r.hulp !== 2) problemen.push(`${waar}: "Lukt het niet?"/"Andere browser of telefoon" ontbreekt`);
    if (r.breed > 0) problemen.push(`${waar}: ${r.breed}px horizontaal scrollen`);
    if (r.kap.length) problemen.push(`${waar}: afgekapt: ${r.kap.join(' | ')}`);
    if (!r.pijlInBeeld) problemen.push(`${waar}: pijl "Begin hier" niet helemaal in beeld`);
    // Chrome/Edge/Samsung op Android: met installatieverzoek de knop Installeren (geen pijl), anders de pijl naar het menu.
    const knop = r.knoppen.some((k) => k === 'Installeren' || k === 'Install');
    const verwacht = x.computer || knop ? undefined : x.tablet && PIJL[x.sleutel] ? 'boven-rechts' : PIJL[x.sleutel]; // tablet: knoppen bovenin
    if ((verwacht ?? null) !== r.pijl) problemen.push(`${waar}: pijl ${r.pijl} in plaats van ${verwacht}`);
    if (taal === 'en' && r.nl.length) problemen.push(`${waar}: Nederlands in het Engels: ${r.nl.join(', ')}`);
    if (taal === 'nl' && r.en.length) problemen.push(`${waar}: Engels in het Nederlands: ${r.en.join(', ')}`);
    if (x.sleutel === 'inapp-android' && !r.chrome?.startsWith('intent://')) problemen.push(`${waar}: knop Openen in Chrome ontbreekt`);
    if (x.sleutel.startsWith('inapp') && x.app && !(await page.evaluate((a) => document.querySelector('.poort-intro')?.textContent.includes(a), x.app)))
      problemen.push(`${waar}: appnaam niet genoemd`);
    if (taal === 'nl') tabel.push({ naam: x.naam, titel: r.titel, stappen: r.stappen, pijl: r.pijl, knoppen: r.knoppen.filter((k) => /Kopieer|Openen in Chrome|Installeren/.test(k)) });
    const groep = x.computer ? 'computer' : x.sleutel.startsWith('inapp') ? 'inapp' : x.sleutel.startsWith('ios') ? 'ios' : 'android';
    const pad = `${MAP}inst-${taal}-${x.naam.replace(/\W+/g, '-').toLowerCase()}.png`;
    await page.screenshot({ path: pad });
    (shots[`${groep}-${taal}`] ??= []).push([pad, x.naam]);
    await page.close();
  }
}
for (const [groep, s] of Object.entries(shots)) await blad(browser, s, `${MAP}blad-inst-${groep}.png`, groep === 'computer' ? 4 : 7, groep === 'computer' ? 2400 : 2600);

// Android Chrome mét installatieverzoek: de knop Installeren (geen pijl), stappen onder Zo doe je het zelf.
{
  const page = await nieuwePagina(UA.android, 375, 667, 'nl', {}, true);
  await page.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
  await slaap(300);
  const r = await page.evaluate(() => ({
    knop: document.querySelector('.poort-kaart .poort-knop')?.textContent,
    pijl: !!document.querySelector('.poort-pijl'),
    zelf: document.querySelectorAll('.poort-zelf .poort-stap').length,
  }));
  await page.screenshot({ path: `${MAP}inst-verzoek.png` });
  console.log(`Android Chrome met installatieverzoek: knop ${r.knop}, pijl ${r.pijl}, ${r.zelf} stappen onder Zo doe je het zelf`);
  if (r.knop !== 'Installeren' || r.pijl || r.zelf < 3) problemen.push('Android Chrome: knop Installeren klopt niet');
  await page.close();
}

// iPhone SE: "Lukt het niet?" en "Andere browser of telefoon" openen, Samsung kiezen (geen pijl meer, wel stappen).
{
  const page = await nieuwePagina(lijst.find((x) => x.naam === 'iPhone Chrome').ua, 375, 667, 'nl');
  await page.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
  await page.click('.poort-hulp-knop');
  await slaap(150);
  const anders = await page.evaluate(() => [...document.querySelectorAll('.poort-anders .poort-alternatief-titel')].map((e) => e.textContent));
  await page.screenshot({ path: `${MAP}inst-lukt-niet.png`, fullPage: true });
  await page.click('.poort-hulp-knop:nth-child(2)');
  await slaap(150);
  await page.screenshot({ path: `${MAP}inst-kiezen.png`, fullPage: true });
  const knoppen = await page.$$('.poort-keuze-knop');
  for (const k of knoppen) if ((await k.evaluate((e) => e.textContent)) === 'Samsung Internet') await k.click();
  await slaap(150);
  const na = await page.evaluate(() => ({
    titel: document.querySelector('.poort-gekozen')?.textContent,
    pijl: !!document.querySelector('.poort-pijl'),
    stappen: document.querySelectorAll('.poort-stap').length,
  }));
  await page.screenshot({ path: `${MAP}inst-gekozen.png`, fullPage: true });
  console.log(`Lukt het niet? → ${anders.join(' · ')}; gekozen: ${na.titel}, ${na.stappen} stappen, pijl ${na.pijl}`);
  if (anders.length < 2) problemen.push('Lukt het niet?: geen andere stappen');
  if (!na.titel?.includes('Samsung') || na.pijl || na.stappen < 3) problemen.push('Andere browser kiezen werkt niet');
  await page.close();
  await blad(
    browser,
    [
      [`${MAP}inst-lukt-niet.png`, 'Lukt het niet?'],
      [`${MAP}inst-kiezen.png`, 'Andere browser of telefoon'],
      [`${MAP}inst-gekozen.png`, 'Samsung gekozen'],
    ],
    `${MAP}blad-inst-hulp.png`,
    3,
    1400,
  );
}

// Telefoon: "Gewoon in de browser gebruiken" → app, onthouden na herladen; via het startscherm terug naar de uitleg.
for (const [naam, ua, w, h] of [
  ['iPhone SE', UA.iphone18, 375, 667],
  ['Laptop', UA.laptop, 1366, 800],
]) {
  const page = await nieuwePagina(ua, w, h, 'nl');
  await page.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
  await page.click('.poort-browser button');
  await slaap(200);
  const naKeuze = await page.evaluate(() => !!document.querySelector('.tegels'));
  await page.reload({ waitUntil: 'networkidle0' });
  const naHerladen = await page.evaluate(() => !!document.querySelector('.tegels'));
  await page.click('.link-knop');
  await slaap(200);
  const terug = await page.evaluate(() => !!document.querySelector('.poort'));
  console.log(`${naam}: browser gekozen → app ${naKeuze}, na herladen ${naHerladen}, "als app installeren" → uitleg ${terug}`);
  if (!naKeuze || !naHerladen || !terug) problemen.push(`${naam}: keuze voor de browser werkt niet goed`);
  await page.close();
}

// Al geïnstalleerd (Android): "Je hebt de app al" → "Toch in de browser gebruiken" → app; "Opnieuw installeren" → stappen.
{
  const page = await nieuwePagina(UA.android, 375, 667, 'nl', { 'trainersapp.geinstalleerd': '1' });
  await page.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
  const r = await page.evaluate(() => ({ titel: document.querySelector('.poort-kaart-titel')?.textContent, knop: document.querySelector('.poort-browser button')?.textContent }));
  await page.screenshot({ path: `${MAP}inst-al.png` });
  await page.click('.poort-kaart .poort-knop');
  await slaap(150);
  const opnieuw = await page.evaluate(() => document.querySelectorAll('.poort-stap').length);
  console.log(`Al geïnstalleerd: ${r.titel} · ${r.knop} · opnieuw installeren: ${opnieuw} stappen`);
  if (r.titel !== 'Je hebt de app al' || r.knop !== 'Toch in de browser gebruiken' || opnieuw < 3) problemen.push('Je hebt de app al: klopt niet');
  await page.close();
  const en = await nieuwePagina(UA.android, 375, 667, 'en', { 'trainersapp.geinstalleerd': '1' });
  await en.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
  await en.screenshot({ path: `${MAP}inst-al-en.png` });
  await en.close();
}

// Bevestiging na installeren (appinstalled), telefoon en laptop.
for (const [naam, ua, w, h] of [
  ['Android', UA.android, 375, 667],
  ['Laptop', UA.laptop, 1366, 800],
]) {
  const page = await nieuwePagina(ua, w, h, 'nl');
  await page.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await slaap(150);
  const r = await page.evaluate(() => ({
    titel: document.querySelector('.poort-titel')?.textContent,
    lead: document.querySelector('.poort-lead')?.textContent,
    vlag: localStorage.getItem('trainersapp.geinstalleerd'),
  }));
  await page.screenshot({ path: `${MAP}inst-gelukt-${naam.toLowerCase()}.png` });
  console.log(`Na installeren (${naam}): ${r.titel} ${r.lead}`);
  if (r.titel !== 'Gelukt!' || r.vlag !== '1') problemen.push(`${naam}: geen bevestiging na installeren`);
  await page.close();
}
await blad(
  browser,
  [
    [`${MAP}inst-al.png`, 'Je hebt de app al'],
    [`${MAP}inst-al-en.png`, 'You already have the app'],
    [`${MAP}inst-gelukt-android.png`, 'Gelukt (Android)'],
    [`${MAP}inst-gelukt-laptop.png`, 'Gelukt (laptop)'],
  ],
  `${MAP}blad-inst-status.png`,
  4,
  2400,
);

// Geïnstalleerde app (standalone): direct de app, en de vlag "al geïnstalleerd" wordt gezet.
for (const [naam, ua] of [
  ['iPhone', UA.iphone26],
  ['Android', UA.android],
]) {
  const page = await browser.newPage();
  await alsGeinstalleerd(page);
  await page.setUserAgent(ua);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}#/`, { waitUntil: 'networkidle0' });
  const r = await page.evaluate(() => ({ app: !!document.querySelector('.tegels') && !document.querySelector('.poort'), vlag: localStorage.getItem('trainersapp.geinstalleerd') }));
  console.log(`Geïnstalleerde app op ${naam}: ${r.app ? 'app zichtbaar (goed)' : 'FOUT: installatiescherm'}`);
  if (!r.app || r.vlag !== '1') problemen.push(`${naam} standalone: installatiescherm of geen vlag`);
  await page.close();
}

fs.writeFileSync(`${MAP}inst-tabel.json`, JSON.stringify(tabel, null, 1));
await browser.close();
console.log(`${lijst.length} combinaties × 2 talen bekeken (tabel: inst-tabel.json).`);
console.log(problemen.length ? `Problemen:\n- ${problemen.join('\n- ')}` : 'Geen problemen gevonden.');
