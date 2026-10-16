// Startscherm op alle formaten (als geïnstalleerde app) in een paar thema's: volgorde Training → Veld/Keepers → Eigen,
// op telefoons (ook iPhone SE en liggend) alles volledig in beeld, geen horizontaal scrollen; tandwiel op meerdere maten.
// Bladen: blad-start-formaten.png, blad-start-tandwiel.png. Gebruik: node tools/e2e/start.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start } from './hulp.mjs';

const browser = await start();
const fouten = [];
const problemen = [];
const controle = (ok, tekst) => {
  if (!ok) problemen.push(tekst);
};
const FORMATEN = [
  ['iPhone SE', { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, true],
  ['iPhone SE liggend', { width: 667, height: 375, deviceScaleFactor: 2, isMobile: true, hasTouch: true, isLandscape: true }, true],
  ['iPhone 14', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, true],
  ['iPhone 14 liggend', { width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true, isLandscape: true }, true],
  ['Android', { width: 412, height: 915, deviceScaleFactor: 2.6, isMobile: true, hasTouch: true }, true],
  ['Klein (320)', { width: 320, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, true],
  ['Tablet', { width: 820, height: 1180, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }, false],
  ['Tablet liggend', { width: 1180, height: 820, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }, false],
  ['Laptop', { width: 1366, height: 768, deviceScaleFactor: 1 }, false],
];
const THEMAS = [
  ['standaard', 'licht'],
  ['geel', 'licht'],
  ['zwart', 'donker'],
  ['rood', 'donker'],
];

const page = await browser.newPage();
await alsGeinstalleerd(page);
page.on('pageerror', (e) => fouten.push(e.message));
const shots = [];
for (const [naam, vp, telefoon] of FORMATEN) {
  await page.setViewport(vp);
  for (const [thema, modus] of THEMAS) {
    // Alle thema's op de telefoons; op tablet/laptop alleen het eerste en het laatste.
    if (!telefoon && thema !== 'standaard' && thema !== 'rood') continue;
    await page.goto(`${BASE}?r=s#/`, { waitUntil: 'networkidle0' });
    await page.evaluate((k) => localStorage.setItem('trainersapp.thema', JSON.stringify(k)), { thema, modus });
    await page.goto(`${BASE}?r=s${thema}${naam.replace(/\W/g, '')}#/`, { waitUntil: 'networkidle0' });
    await slaap(200);
    const m = await page.evaluate(() => {
      const tegels = [...document.querySelectorAll('.tegels > .tegel')];
      return {
        volgorde: tegels.map((t) => t.querySelector('.tegel-titel')?.textContent),
        rijen: tegels.map((t) => Math.round(t.getBoundingClientRect().top)),
        onderkant: Math.max(...tegels.map((t) => t.getBoundingClientRect().bottom)),
        knoppen: Math.max(...[...document.querySelectorAll('.tegel button, .tegel a')].map((b) => b.getBoundingClientRect().bottom)),
        breed: document.documentElement.scrollWidth - window.innerWidth,
        hoogte: window.innerHeight,
        sectie: !!document.querySelector('.sectie-titel'),
        tandwiel: !!document.querySelector('[aria-label="Instellingen"] svg'),
      };
    });
    if (thema === 'standaard') {
      controle(JSON.stringify(m.volgorde) === JSON.stringify(['Training', 'Veld', 'Keepers', 'Eigen oefeningen']), `${naam}: volgorde ${m.volgorde.join(', ')}`);
      controle(!m.sectie, `${naam}: de tekst "Oefenbibliotheek …" staat er nog`);
      controle(m.tandwiel, `${naam}: geen tandwiel`);
      // Veld en Keepers naast elkaar.
      controle(m.rijen[1] === m.rijen[2], `${naam}: Veld en Keepers niet naast elkaar`);
    }
    controle(m.breed <= 0, `${naam}/${thema}: pagina scrolt horizontaal (${m.breed}px)`);
    if (telefoon) controle(Math.max(m.onderkant, m.knoppen) <= m.hoogte, `${naam}/${thema}: niet alles in beeld (onderkant ${Math.round(Math.max(m.onderkant, m.knoppen))} > ${m.hoogte})`);
    const pad = `${MAP}start-${naam.replace(/\W/g, '')}-${thema}-${modus}.png`;
    await page.screenshot({ path: pad });
    shots.push([pad, `${naam} – ${thema} ${modus}`]);
  }
}
await blad(browser, shots.filter((s) => /standaard|rood/.test(s[1])), `${MAP}blad-start-formaten.png`, 6, 2600);
await blad(browser, shots.filter((s) => /iPhone SE –|iPhone 14 –/.test(s[1])), `${MAP}blad-start-themas.png`, 8, 2600);

// Tandwiel los, op meerdere maten, licht en donker.
const p2 = await browser.newPage();
await alsGeinstalleerd(p2);
await p2.setViewport({ width: 700, height: 220 });
await p2.goto(`${BASE}?r=tw#/`, { waitUntil: 'networkidle0' });
const svg = await p2.evaluate(() => document.querySelector('[aria-label="Instellingen"] svg').outerHTML);
const rij = (achter, kleur) => [16, 20, 24, 32, 48, 96].map((m) => `<span style="display:inline-grid;place-items:center;width:110px;height:110px;background:${achter};color:${kleur}">${svg.replace(/width="\d+"/, `width="${m}"`).replace(/height="\d+"/, `height="${m}"`)}</span>`).join('');
await p2.setContent(`<div style="font:0/0 a">${rij('#0f6b3a', '#fff')}<br>${rij('#ffffff', '#15211b')}<br>${rij('#ffd100', '#141414')}</div>`);
await p2.screenshot({ path: `${MAP}blad-start-tandwiel.png` });

await page.evaluate(() => localStorage.setItem('trainersapp.thema', JSON.stringify({ thema: 'standaard', modus: 'licht' })));
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)]);
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const x of problemen) console.log(' -', x);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
