// Training maken: de hele flow in de browser (als geïnstalleerde app) op telefoon, tablet en laptop.
// Aantallen invullen, oefeningen kiezen (filter), slepen met de vinger, trainingsmodus (knoppen en vegen), delen via
// een link, opslaan, dupliceren, verwijderen, en offline openen. Screenshots: blad-training-*.png
// Gebruik: node tools/e2e/training.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, UA } from './hulp.mjs';

const browser = await start();
const fouten = [];
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};
const origin = new URL(BASE).origin;
await browser.defaultBrowserContext().overridePermissions(origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);

async function nieuwePagina(viewport, geinstalleerd = true) {
  const page = await browser.newPage();
  if (geinstalleerd) await alsGeinstalleerd(page);
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => m.type() === 'error' && fouten.push(m.text()));
  page.on('dialog', (d) => void d.accept());
  await page.setViewport(viewport);
  return page;
}
const klik = async (page, tekst, selector = 'button') => {
  const ok = await page.evaluate(
    (tekst, selector) => {
      const el = [...document.querySelectorAll(selector)].find((b) => b.textContent.trim().startsWith(tekst) && !b.disabled);
      el?.click();
      return !!el;
    },
    tekst,
    selector,
  );
  if (!ok) problemen.push(`Knop "${tekst}" niet gevonden`);
  await slaap(350);
};
const volgorde = (page) => page.evaluate(() => [...document.querySelectorAll('.onderdelen .onderdeel')].map((li) => li.dataset.id));

const TELEFOON = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const shots = [];
const foto = async (page, naam, tekst, volledig = false) => {
  const pad = `${MAP}training-${naam}.png`;
  await page.screenshot({ path: pad, fullPage: volledig });
  shots.push([pad, tekst]);
};

// ---------- telefoon: hele flow ----------
const page = await nieuwePagina(TELEFOON);
await page.goto(`${BASE}?r=1#/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.removeItem('trainersapp.trainingen'));
await page.goto(`${BASE}?r=2#/`, { waitUntil: 'networkidle0' });
await slaap(300);
await foto(page, 'start', 'Startscherm met Training maken');

await klik(page, 'Training maken');
controle(page.url().includes('#/training/'), 'Training maken opent de training niet');
await page.type('.veld input', 'Dinsdag JO11-1');
// Spelers van 12 naar 8, keepers blijft 1.
await page.evaluate(() => {
  const min = document.querySelector('[aria-label="Eén spelers minder"]');
  for (let i = 0; i < 4; i++) min?.click();
});
await slaap(200);
const aantallen = await page.evaluate(() => [...document.querySelectorAll('.stapper output')].map((o) => o.textContent));
controle(aantallen[0] === '8' && aantallen[1] === '1', `Stappers: ${aantallen.join(', ')} (verwacht 8, 1)`);
await foto(page, 'leeg', 'Nieuwe training: naam, aantallen');

await klik(page, 'Oefeningen toevoegen');
const veldKaarten = await page.evaluate(() => document.querySelectorAll('.kies-kaart').length);
controle(veldKaarten > 20, `Te weinig veldoefeningen bij 8 spelers: ${veldKaarten}`);
await foto(page, 'kiezen', 'Oefeningen kiezen (veld, gefilterd)');
// Drie veldoefeningen en één keeperoefening toevoegen.
await page.evaluate(() => [...document.querySelectorAll('.toevoeg-knop')].slice(0, 3).forEach((b) => b.click()));
await slaap(200);
await klik(page, 'Keepers', '.tabs button');
await page.evaluate(() => document.querySelector('.toevoeg-knop')?.click());
await slaap(200);
await foto(page, 'kiezen-keepers', 'Keepers-tab, één toegevoegd');
await klik(page, 'Klaar');
let ids = await volgorde(page);
controle(ids.length === 4, `Verwacht 4 oefeningen in de training, kreeg ${ids.length}`);
await foto(page, 'training', 'Training met 4 oefeningen', true);

// Slepen met de vinger: oefening 1 naar plek 3.
const grepen = await page.$$('.greep');
const a = await grepen[0].boundingBox();
const b = await grepen[2].boundingBox();
const x = a.x + a.width / 2;
await page.touchscreen.touchStart(x, a.y + a.height / 2);
for (let i = 1; i <= 12; i++) {
  await page.touchscreen.touchMove(x, a.y + a.height / 2 + ((b.y + b.height / 2 + 8 - (a.y + a.height / 2)) * i) / 12);
  await slaap(25);
}
await page.touchscreen.touchEnd();
await slaap(500);
const na = await volgorde(page);
controle(JSON.stringify(na) === JSON.stringify([ids[1], ids[2], ids[0], ids[3]]), `Slepen: volgorde ${na.join(',')} (verwacht ${[ids[1], ids[2], ids[0], ids[3]].join(',')})`);
ids = na;
await foto(page, 'gesleept', 'Na slepen: oefening 1 staat nu op plek 3');

// Minder spelers: niet passende oefeningen worden gemarkeerd, niet verwijderd.
await page.evaluate(() => {
  const min = document.querySelector('[aria-label="Eén spelers minder"]');
  for (let i = 0; i < 8; i++) min?.click();
});
await slaap(300);
const markering = await page.evaluate(() => ({ waarschuwing: !!document.querySelector('.waarschuwing'), passenNiet: document.querySelectorAll('.past-niet').length, totaal: document.querySelectorAll('.onderdeel').length }));
controle(markering.waarschuwing && markering.passenNiet >= 3 && markering.totaal === 4, `Markering bij 0 spelers: ${JSON.stringify(markering)}`);
await foto(page, 'past-niet', '0 spelers: veldoefeningen gemarkeerd (niet verwijderd)', true);
await page.evaluate(() => {
  const plus = document.querySelector('[aria-label="Eén spelers meer"]');
  for (let i = 0; i < 8; i++) plus?.click();
});
await slaap(200);

// Trainingsmodus: knoppen en vegen.
await klik(page, 'Start training');
await slaap(1200);
await foto(page, 'modus-1', 'Trainingsmodus: oefening 1');
await klik(page, 'Volgende', '.modus-knoppen button');
controle(page.url().endsWith('/modus/2'), `Volgende: ${page.url()}`);
const tekst = await page.$('.detail-tekst');
const tb = await tekst.boundingBox();
const y = tb.y + 80;
await page.touchscreen.touchStart(tb.x + tb.width - 30, y);
for (let i = 1; i <= 8; i++) await page.touchscreen.touchMove(tb.x + tb.width - 30 - i * 30, y + 4);
await page.touchscreen.touchEnd();
await slaap(500);
controle(page.url().endsWith('/modus/3'), `Vegen naar links: ${page.url()}`);
await slaap(900);
await foto(page, 'modus-3', 'Na vegen: oefening 3');
await klik(page, 'Vorige', '.modus-knoppen button');
controle(page.url().endsWith('/modus/2'), `Vorige: ${page.url()}`);

// Delen (headless Chrome: geen deelmenu, dus "Link gekopieerd").
await page.goto(`${BASE}?r=3#/trainingen`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.querySelector('.training-regel .rij')?.click());
await slaap(300);
// 1) Telefoon met deelmenu: de standaard deelfunctie krijgt de link.
await page.evaluate(() => {
  window.__gedeeld = null;
  navigator.share = async (data) => {
    window.__gedeeld = data;
  };
});
await klik(page, 'Delen');
await slaap(300);
const viaDelen = await page.evaluate(() => window.__gedeeld);
controle(viaDelen?.url?.includes('#/t/') && viaDelen.title === 'Dinsdag JO11-1', `Deelmenu: ${JSON.stringify(viaDelen)}`);
// 2) Zonder deelmenu: link kopiëren.
await page.evaluate(() => {
  navigator.share = undefined;
});
await klik(page, 'Delen');
await slaap(300);
const melding = await page.evaluate(() => document.querySelector('.toast')?.textContent ?? '');
const link = await page.evaluate(() => navigator.clipboard.readText());
controle(melding === 'Link gekopieerd' && link === viaDelen?.url, `Kopieer link: melding "${melding}", link ${link.slice(0, 60)}`);
if (!link.includes('#/t/')) {
  console.log('PROBLEMEN:', problemen);
  process.exit(1);
}

// Ontvanger (andere telefoon, schone opslag): opent de link en slaat op.
const ontvanger = await nieuwePagina(TELEFOON);
await ontvanger.goto(`${BASE}?r=4#/`, { waitUntil: 'networkidle0' });
await ontvanger.evaluate(() => localStorage.removeItem('trainersapp.trainingen'));
await ontvanger.goto(link.replace(/^https?:\/\/[^/]+\/trainersapp\//, BASE), { waitUntil: 'networkidle0' });
await slaap(400);
const gedeeld = await ontvanger.evaluate(() => ({ titel: document.querySelector('.detail-titel')?.textContent, aantal: document.querySelectorAll('.onderdeel').length }));
controle(gedeeld.titel === 'Dinsdag JO11-1' && gedeeld.aantal === 4, `Gedeelde link: ${JSON.stringify(gedeeld)}`);
await foto(ontvanger, 'gedeeld', 'Ontvanger opent de link', true);
await klik(ontvanger, 'Opslaan in mijn trainingen');
const opgeslagen = await ontvanger.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.trainingen') ?? '{}').trainingen?.length ?? 0);
controle(opgeslagen === 1 && ontvanger.url().includes('#/training/'), `Opslaan bij ontvanger: ${opgeslagen}, ${ontvanger.url()}`);
const volgordeOntvanger = await volgorde(ontvanger);
controle(JSON.stringify(volgordeOntvanger) === JSON.stringify(ids), 'Gedeelde training heeft een andere volgorde');

// Dupliceren en verwijderen in Mijn trainingen.
await page.goto(`${BASE}?r=5#/trainingen`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.querySelector('[aria-label$="dupliceren"]')?.click());
await slaap(300);
let regels = await page.evaluate(() => [...document.querySelectorAll('.training-regel .rij-titel')].map((x) => x.textContent));
controle(regels.length === 2 && regels.includes('Dinsdag JO11-1 (kopie)'), `Dupliceren: ${regels.join(' | ')}`);
await foto(page, 'mijn-trainingen', 'Mijn trainingen na dupliceren');
await page.evaluate(() => document.querySelectorAll('[aria-label$="verwijderen"]')[0]?.click());
await slaap(300);
regels = await page.evaluate(() => [...document.querySelectorAll('.training-regel .rij-titel')].map((x) => x.textContent));
controle(regels.length === 1, `Verwijderen: ${regels.join(' | ')}`);

// Offline: opgeslagen training en gedeelde link openen zonder netwerk.
await page.evaluate(() => navigator.serviceWorker?.ready);
await slaap(500);
await page.setOfflineMode(true);
await page.goto(`${BASE}#/trainingen`, { waitUntil: 'domcontentloaded' });
await slaap(800);
const offlineLijst = await page.evaluate(() => document.querySelectorAll('.training-regel').length);
await page.goto(link.replace(/^https?:\/\/[^/]+\/trainersapp\//, BASE), { waitUntil: 'domcontentloaded' });
await slaap(800);
const offlineGedeeld = await page.evaluate(() => document.querySelectorAll('.onderdeel').length);
controle(offlineLijst === 1 && offlineGedeeld === 4, `Offline: lijst ${offlineLijst}, gedeelde link ${offlineGedeeld}`);
await page.setOfflineMode(false);

// Gedeelde link in de gewone browser op een telefoon (app niet geïnstalleerd).
const browserTel = await nieuwePagina(TELEFOON, false);
await browserTel.setUserAgent(UA.iphone26);
await browserTel.goto(link.replace(/^https?:\/\/[^/]+\/trainersapp\//, BASE), { waitUntil: 'networkidle0' });
await slaap(400);
const uitleg = await browserTel.evaluate(() => !!document.querySelector('.gedeeld-uitleg'));
controle(uitleg, 'Gedeelde link in de browser: geen uitleg om de app te openen');
await foto(browserTel, 'gedeeld-browser', 'Gedeelde link in de browser (niet geïnstalleerd)', true);

// ---------- tablet en laptop ----------
for (const [naam, viewport] of [
  ['tablet', { width: 820, height: 1180, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }],
  ['laptop', { width: 1366, height: 820, deviceScaleFactor: 1 }],
]) {
  const p = await nieuwePagina(viewport);
  const id = await p.goto(`${BASE}?r=6#/trainingen`, { waitUntil: 'networkidle0' }).then(() => p.evaluate(() => JSON.parse(localStorage.getItem('trainersapp.trainingen')).trainingen[0].id));
  await p.goto(`${BASE}?r=7#/training/${id}`, { waitUntil: 'networkidle0' });
  await slaap(400);
  await foto(p, `${naam}-training`, `${naam}: training`);
  await p.goto(`${BASE}?r=8#/training/${id}/kiezen`, { waitUntil: 'networkidle0' });
  await slaap(400);
  await foto(p, `${naam}-kiezen`, `${naam}: oefeningen kiezen`);
  await p.goto(`${BASE}?r=9#/training/${id}/modus/1`, { waitUntil: 'networkidle0' });
  await slaap(1200);
  await foto(p, `${naam}-modus`, `${naam}: trainingsmodus`);
}

await blad(browser, shots, `${MAP}blad-training.png`, 4, 1800);
await browser.close();
const echt = fouten.filter((f) => !/favicon|net::ERR_INTERNET_DISCONNECTED|Failed to fetch/i.test(f));
if (echt.length) console.log('Fouten in de console:', [...new Set(echt)].slice(0, 5));
console.log(problemen.length ? `PROBLEMEN:\n- ${problemen.join('\n- ')}` : 'Geen problemen gevonden.');
