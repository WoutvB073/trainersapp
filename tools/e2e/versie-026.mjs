// 0.26.0 (deel A): categorie Verdedigen en omschakelen met plaatjes, in het Nederlands en Engels, op een iPhone SE en een
// laptop: categorielijst, de categorie zelf, filters, Training genereren en Help. Blad: blad-026.png.
// Gebruik: node tools/e2e/versie-026.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start } from './hulp.mjs';

const NAAM = { nl: 'Verdedigen en omschakelen', en: 'Defending & transition' };
const FORMATEN = [
  ['se', { width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true }],
  ['laptop', { width: 1280, height: 800, deviceScaleFactor: 1 }],
];
const browser = await start();
const fouten = [];
const shots = [];
let n = 0;

for (const taal of ['nl', 'en']) {
  for (const [formaat, viewport] of FORMATEN) {
    const page = await browser.newPage();
    await alsGeinstalleerd(page);
    await page.evaluateOnNewDocument((tl) => localStorage.setItem('trainersapp.taal', tl), taal);
    await page.setViewport(viewport);
    const waar = `${taal}/${formaat}`;
    const controleer = async (scherm) => {
      const r = await page.evaluate(() => {
        const kap = [];
        for (const e of document.querySelectorAll('button, .rij-titel, .rij-sub, h1, h2, h3, .gen-chip')) {
          if (e.offsetParent === null) continue;
          const s = getComputedStyle(e);
          const verborgen = s.overflow === 'hidden' || s.overflowX === 'hidden' || s.textOverflow === 'ellipsis' || s.whiteSpace === 'nowrap';
          if (verborgen && e.scrollWidth > e.clientWidth + 2 && e.innerText.trim()) kap.push(e.innerText.trim().slice(0, 40));
        }
        return { kap, breed: document.documentElement.scrollWidth - window.innerWidth, tekst: document.body.innerText };
      });
      if (r.kap.length) fouten.push(`${waar} ${scherm}: afgekapt: ${r.kap.join(' | ')}`);
      if (r.breed > 0) fouten.push(`${waar} ${scherm}: ${r.breed}px horizontaal scrollen`);
      return r.tekst;
    };
    const foto = async (naam, vol = false) => {
      const pad = `${MAP}026-${taal}-${formaat}-${naam}.png`;
      await page.screenshot({ path: pad, fullPage: vol });
      shots.push([pad, `${waar} ${naam}`]);
    };

    // Categorielijst Spelers en Keepers: elke rij een plaatje, de nieuwe categorie vóór Partijvormen.
    for (const [soort, hash] of [
      ['spelers', '#/veld'],
      ['keepers', '#/keepers'],
    ]) {
      await page.goto(`${BASE}?r=${n++}${hash}`, { waitUntil: 'networkidle0' });
      await slaap(300);
      const tekst = await controleer(soort);
      const telling = await page.evaluate(() => {
        const rijen = [...document.querySelectorAll('.lijst .rij')].filter((r) => r.closest('section, main'));
        return { rijen: rijen.length, plaatjes: document.querySelectorAll('.lijst .rij .cat-plaatje').length, titels: [...document.querySelectorAll('.lijst .rij-titel')].map((e) => e.textContent) };
      });
      if (telling.plaatjes === 0 || telling.plaatjes < telling.titels.length - 1) fouten.push(`${waar} ${soort}: ${telling.plaatjes} plaatjes bij ${telling.titels.length} rijen`);
      if (soort === 'spelers') {
        const i = telling.titels.indexOf(NAAM[taal]);
        if (i < 0) fouten.push(`${waar}: "${NAAM[taal]}" niet in de categorielijst`);
        else if (!/^(Partijvormen|Small-sided games)/.test(telling.titels[i + 1] ?? '')) fouten.push(`${waar}: na "${NAAM[taal]}" komt "${telling.titels[i + 1]}"`);
        if (taal === 'en' && tekst.includes('Verdedigen')) fouten.push(`${waar}: Nederlands in de Engelse lijst`);
      }
      await foto(soort, formaat === 'se');
    }

    // De categorie zelf: bestaande en nieuwe oefeningen.
    await page.goto(`${BASE}?r=${n++}#/veld/verdedigen-omschakelen`, { waitUntil: 'networkidle0' });
    await slaap(300);
    const cat = await controleer('categorie');
    for (const [nl, en] of [
      ['Snel afronden na balwinst', 'Quick finish after winning the ball'],
      ['Omschakelen', 'Transition'],
    ])
      if (!cat.includes(taal === 'nl' ? nl : en)) fouten.push(`${waar} categorie: "${taal === 'nl' ? nl : en}" niet gevonden`);
    await foto('categorie', true);

    // Training genereren: de categorie is te kiezen.
    if (formaat === 'se') {
      await page.goto(`${BASE}?r=${n++}#/`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.querySelector('.tegel-training .knop-primair')?.click());
      await page.waitForFunction(() => /#\/training\//.test(location.hash));
      const id = await page.evaluate(() => location.hash.split('/')[2]);
      await page.goto(`${BASE}?r=${n++}#/training/${id}/genereren`, { waitUntil: 'networkidle0' });
      await slaap(300);
      const gen = await controleer('genereren');
      if (!gen.includes(NAAM[taal])) fouten.push(`${waar} genereren: "${NAAM[taal]}" niet te kiezen`);
      await foto('genereren', true);
    }

    // Help noemt de categorie.
    await page.goto(`${BASE}?r=${n++}#/help/zoeken`, { waitUntil: 'networkidle0' });
    await slaap(300);
    const help = await page.evaluate(() => document.body.innerText);
    if (!help.includes(NAAM[taal]) && !(await page.evaluate((naam) => [...document.querySelectorAll('details, section')].some((e) => e.textContent.includes(naam)), NAAM[taal])))
      fouten.push(`${waar} help: "${NAAM[taal]}" niet gevonden`);
    await page.close();
  }
}
await blad(browser, shots, `${MAP}blad-026.png`, 6, 2600);
await browser.close();
console.log(fouten.length ? `Problemen:\n- ${fouten.join('\n- ')}` : 'Geen problemen gevonden.');
process.exit(fouten.length ? 1 : 0);
