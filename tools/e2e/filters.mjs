// Favorieten en filters in de browser (als geïnstalleerde app) op telefoon, tablet en laptop:
// filterbalk (klapbaar op de telefoon), aantallen (onthouden), favorieten (hartje op kaart en detail), geen combinatievormen meer,
// eigen oefeningen, zoeken, aantallen per categorie, lege melding met "Filters wissen", en de filters bij Training maken.
// Screenshots: blad-filters.png. Gebruik: node tools/e2e/filters.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start } from './hulp.mjs';

const browser = await start();
const fouten = [];
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};
const TELEFOON = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const TABLET = { width: 820, height: 1180, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true };
const LAPTOP = { width: 1366, height: 820, deviceScaleFactor: 1 };
const shots = [];
const foto = async (page, naam, tekst, volledig = false) => {
  const pad = `${MAP}filters-${naam}.png`;
  await page.screenshot({ path: pad, fullPage: volledig });
  shots.push([pad, tekst]);
};

async function pagina(viewport) {
  const page = await browser.newPage();
  await alsGeinstalleerd(page);
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => m.type() === 'error' && fouten.push(m.text()));
  page.on('dialog', (d) => void d.accept());
  await page.setViewport(viewport);
  return page;
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
  await slaap(250);
};
const status = (page) => page.evaluate(() => Number((document.querySelector('.filter-status span')?.textContent ?? '').replace(/\D/g, '')));
const kaarten = (page) => page.evaluate(() => [...document.querySelectorAll('.kaart .kaart-titel')].map((t) => t.textContent));
const tellers = (page) => page.evaluate(() => [...document.querySelectorAll('.lijst .rij')].map((r) => [r.querySelector('.rij-titel')?.textContent, r.querySelector('.teller')?.textContent]));
const typ = async (page, tekst) => {
  await page.evaluate(() => {
    const i = document.querySelector('.zoekveld input');
    i.focus();
    i.select();
  });
  await page.keyboard.press('Backspace');
  if (tekst) await page.type('.zoekveld input', tekst);
  await slaap(250);
};

for (const [naam, vp] of [
  ['telefoon', TELEFOON],
  ['tablet', TABLET],
  ['laptop', LAPTOP],
]) {
  const page = await pagina(vp);
  await page.goto(`${BASE}?r=f${naam}#/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => ['trainersapp.favorieten', 'trainersapp.filterAantallen', 'trainersapp.filterAantallenLaatst', 'trainersapp.trainingen'].forEach((k) => localStorage.removeItem(k)));
  await page.goto(`${BASE}?r=f${naam}2#/veld`, { waitUntil: 'networkidle0' });
  await slaap(300);
  const totaal = await status(page);
  controle(totaal >= 75, `${naam}: categorieën: totaal ${totaal}`);
  const paneelOpen = await page.evaluate(() => !!document.querySelector('.filter-paneel'));
  controle(naam === 'laptop' ? paneelOpen : !paneelOpen, `${naam}: filterpaneel ${paneelOpen ? 'open' : 'dicht'} bij het openen`);
  if (!paneelOpen) await klik(page, 'Filters', '.filter-knop');

  // Aantallen: 4 spelers, 0 keepers.
  await page.evaluate(() => document.querySelector('.filter-schakel input')?.click());
  await slaap(150);
  for (let i = 0; i < 8; i++) await page.evaluate(() => document.querySelector('[aria-label="Eén spelers minder"]')?.click());
  await page.evaluate(() => document.querySelector('[aria-label="Eén keepers minder"]')?.click());
  await slaap(200);
  const met4 = await status(page);
  const cat = await tellers(page);
  controle(met4 > 10 && met4 < totaal, `${naam}: 4 spelers/0 keepers: ${met4} van ${totaal}`);
  controle(cat[0]?.[1] === String(met4), `${naam}: "Alle oefeningen" toont ${cat[0]?.[1]} (verwacht ${met4})`);
  await foto(page, `${naam}-categorieen`, `${naam}: categorieën met filters (4 spelers, 0 keepers)`, naam !== 'laptop');

  // Oefenlijst Afwerken: aantallen gelden ook hier; hartjes op de kaarten.
  await page.goto(`${BASE}?r=f${naam}3#/veld/afwerken`, { waitUntil: 'networkidle0' });
  await slaap(300);
  const onthouden = await page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.filterAantallen') ?? 'null'));
  controle(onthouden?.spelers === 4 && onthouden?.keepers === 0, `${naam}: aantallen niet onthouden (${JSON.stringify(onthouden)})`);
  // Aantallen uit, twee favorieten aanzetten.
  if (!(await page.evaluate(() => !!document.querySelector('.filter-paneel')))) await klik(page, 'Filters', '.filter-knop');
  await page.evaluate(() => document.querySelector('.filter-schakel input')?.click());
  await slaap(200);
  const alleAfwerken = await status(page);
  const harten = await page.$$('.kaarten .hart');
  controle(harten.length === alleAfwerken, `${naam}: ${harten.length} hartjes bij ${alleAfwerken} kaarten`);
  await harten[0].click();
  await slaap(100);
  await harten[2].click();
  await slaap(200);
  const favs = await page.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.favorieten') ?? '{}').ids ?? []);
  controle(favs.length === 2, `${naam}: favorieten opgeslagen: ${favs.length}`);
  controle(page.url().includes('/veld/afwerken'), `${naam}: tik op het hartje opende de oefening (${page.url()})`);
  await klik(page, 'Favorieten', '.filter-chips button');
  controle((await status(page)) === 2, `${naam}: alleen favorieten: ${await status(page)}`);
  await foto(page, `${naam}-favorieten`, `${naam}: Afwerken, alleen favorieten`, naam === 'telefoon');
  // Niets gevonden → lege melding met "Filters wissen".
  await typ(page, 'zzz-bestaat-niet');
  const leeg = await page.evaluate(() => ({ tekst: document.querySelector('.leeg-titel')?.textContent, knop: !!document.querySelector('.leeg .knop') }));
  controle(leeg.tekst === 'Geen oefeningen gevonden' && leeg.knop, `${naam}: lege melding ${JSON.stringify(leeg)}`);
  if (naam === 'telefoon') await foto(page, 'leeg', 'Niets gevonden: melding met Filters wissen');
  await klik(page, 'Filters wissen', '.leeg button');
  controle((await status(page)) === alleAfwerken, `${naam}: na wissen ${await status(page)} (verwacht ${alleAfwerken})`);
  // Zoeken zonder hoofdletters en accenten.
  await typ(page, 'VOORZET');
  const gevonden = await kaarten(page);
  controle(gevonden.length > 0 && gevonden.every((t) => /voorzet/i.test(t)), `${naam}: zoeken op "VOORZET": ${gevonden.join(' | ')}`);
  await typ(page, '');
  // Geen combinatievorm-filter of -badge meer.
  if (!(await page.evaluate(() => !!document.querySelector('.filter-paneel')))) await klik(page, 'Filters', '.filter-knop');
  const combi = await page.evaluate(() => document.body.innerText.includes('Combinatievorm'));
  controle(!combi, `${naam}: het woord Combinatievorm staat nog in beeld`);

  // Detailpagina: hartje.
  await page.goto(`${BASE}?r=f${naam}4#/oefening/veld-pt-y-vorm`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.querySelector('.hart-groot')?.click());
  await slaap(200);
  const opDetail = await page.evaluate(() => document.querySelector('.hart-groot')?.getAttribute('aria-pressed'));
  controle(opDetail === 'true', `${naam}: hartje op de detailpagina`);
  if (naam === 'telefoon') await foto(page, 'detail', 'Detailpagina met hartje (favoriet)');

  // Training maken: aantallen van de training, favorieten-filter werkt ook hier.
  await page.goto(`${BASE}?r=f${naam}5#/`, { waitUntil: 'networkidle0' });
  await klik(page, 'Training maken');
  await klik(page, 'Oefeningen toevoegen');
  await slaap(300);
  const zonder = await status(page);
  if (!(await page.evaluate(() => !!document.querySelector('.filter-paneel')))) await klik(page, 'Filters', '.filter-knop');
  const noot = await page.evaluate(() => document.querySelector('.filter-noot')?.textContent ?? '');
  controle(noot.includes('van de training'), `${naam}: kiezen: geen uitleg over de aantallen van de training ("${noot}")`);
  await klik(page, 'Favorieten', '.filter-chips button');
  const kiesFav = await status(page);
  controle(kiesFav >= 1 && kiesFav <= 3 && kiesFav < zonder, `${naam}: kiezen met favorieten: ${kiesFav} van ${zonder}`);
  await foto(page, `${naam}-kiezen`, `${naam}: Training maken → kiezen, alleen favorieten`, naam === 'telefoon');
  await klik(page, 'Favorieten', '.filter-chips button');
  await page.close();
}

// De gekozen aantallen blijven bewaard na opnieuw openen.
const p = await pagina(TELEFOON);
await p.goto(`${BASE}?r=fw#/`, { waitUntil: 'networkidle0' });
await p.evaluate(() => localStorage.setItem('trainersapp.filterAantallen', JSON.stringify({ spelers: 6, keepers: 1 })));
await p.goto(`${BASE}?r=fw2#/keepers`, { waitUntil: 'networkidle0' });
const keepersTotaal = await status(p);
controle(keepersTotaal > 0 && keepersTotaal < 71, `Keepers met 6 spelers/1 keeper: ${keepersTotaal}`);
await p.evaluate(() => localStorage.removeItem('trainersapp.filterAantallen'));
await p.close();

await blad(browser, shots, `${MAP}blad-filters.png`, 4, 2000);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)]);
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const x of problemen) console.log(' -', x);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
