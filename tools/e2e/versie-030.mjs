// 0.30.0: leeftijdsfilter in de bibliotheek (onthouden na herladen), bij de oefening, Training maken (kiezen, oranje markering),
// Training genereren, categorie 1 tegen 1 en Help, in NL en EN op iPhone SE en laptop. Blad: blad-030.png.
// Gebruik: node tools/e2e/versie-030.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start } from './hulp.mjs';

const browser = await start();
const problemen = [];
const shots = [];
const FORMATEN = [
  ['se', 375, 667, true],
  ['laptop', 1366, 800, false],
];

for (const taal of ['nl', 'en']) {
  for (const [naam, w, h, mobiel] of FORMATEN) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    const waar = `${taal} ${naam}`;
    page.on('pageerror', (e) => problemen.push(`${waar}: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && !/favicon|ERR_/.test(m.text()) && problemen.push(`${waar}: ${m.text()}`));
    await alsGeinstalleerd(page);
    await page.evaluateOnNewDocument((taal) => {
      try {
        localStorage.setItem('trainersapp.taal', taal);
      } catch {
        /* about:blank */
      }
    }, taal);
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobiel, hasTouch: mobiel });
    const foto = async (titel) => {
      const pad = `${MAP}v030-${taal}-${naam}-${titel}.png`;
      await page.screenshot({ path: pad });
      if (naam === 'se') shots.push([pad, `${taal} · ${titel}`]);
      const r = await page.evaluate(() => ({
        breed: document.documentElement.scrollWidth - innerWidth,
        kap: [...document.querySelectorAll('button, select, .label, h1, h2, h3')].filter((e) => {
          const s = getComputedStyle(e);
          return e.offsetParent && (s.overflow === 'hidden' || s.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 2 && e.tagName !== 'SELECT';
        }).map((e) => e.innerText.slice(0, 30)),
      }));
      if (r.breed > 0) problemen.push(`${waar} ${titel}: ${r.breed}px horizontaal scrollen`);
      if (r.kap.length) problemen.push(`${waar} ${titel}: afgekapt: ${r.kap.join(' | ')}`);
    };
    const open = async (pad) => {
      await page.goto(`${BASE}?r=${Math.random()}#${pad}`, { waitUntil: 'networkidle0' });
      await slaap(200);
    };
    const filterOpen = async () => {
      if (!(await page.$('.leeftijd-keuze select'))) await page.click('.filter-knop');
      await slaap(120);
    };
    const teller = () => page.evaluate(() => parseInt(document.querySelector('.filter-status span')?.textContent ?? '0', 10));

    // Bibliotheek: alle spelersoefeningen, dan Mini's 3–5.
    await open('/veld/alle');
    await filterOpen();
    const alle = await teller();
    await page.select('.leeftijd-keuze select', 'mini-3-5');
    await slaap(200);
    const mini = await teller();
    await foto('filter');
    console.log(`${waar}: ${alle} oefeningen, mini's ${mini}`);
    if (!(mini >= 70 && mini < alle)) problemen.push(`${waar}: filter Mini's klopt niet (${alle} → ${mini})`);

    // Onthouden na herladen.
    await open('/veld/alle');
    await filterOpen();
    const onthouden = await page.evaluate(() => document.querySelector('.leeftijd-keuze select')?.value);
    if (onthouden !== 'mini-3-5') problemen.push(`${waar}: leeftijd niet onthouden (${onthouden})`);

    // Categorie 1 tegen 1.
    await open('/veld/een-tegen-een');
    if ((await teller()) < 15) problemen.push(`${waar}: te weinig oefeningen bij 1 tegen 1`);
    await foto('1-tegen-1');

    // Oefening: leeftijden en kleuteruitleg.
    await open('/oefening/veld-mt-verkeerslicht');
    const detail = await page.evaluate(() => document.querySelector('.detail-leeftijden')?.textContent);
    if (!detail?.includes('3–5')) problemen.push(`${waar}: leeftijden niet bij de oefening (${detail})`);

    // Training maken: nieuwe training begint met de laatst gekozen leeftijd; alleen mini-oefeningen te kiezen.
    const id = await page.evaluate(() => {
      const id = `t${Date.now()}`;
      const t = { id, naam: 'Test', spelers: 10, keepers: 0, leeftijd: 'mini-3-5', oefeningen: ['veld-af-cutback'], gemaakt: 1, gewijzigd: 1 };
      localStorage.setItem('trainersapp.trainingen', JSON.stringify({ versie: 1, trainingen: [t] }));
      return id;
    });
    await open(`/training/${id}`);
    const bewerk = await page.evaluate(() => ({ keuze: document.querySelector('.leeftijd-keuze select')?.value, oranje: document.querySelector('.waarschuwing')?.textContent ?? '' }));
    await foto('training');
    if (bewerk.keuze !== 'mini-3-5') problemen.push(`${waar}: training zonder leeftijd (${bewerk.keuze})`);
    if (!/3–5/.test(bewerk.oranje)) problemen.push(`${waar}: geen oranje melding voor de leeftijd (${bewerk.oranje})`);
    await open(`/training/${id}/kiezen`);
    if (!(await page.$('.filter-noot'))) await page.click('.filter-knop');
    await slaap(120);
    await foto('kiezen');
    const kiezen = await page.evaluate(() => document.querySelector('.filter-noot')?.textContent ?? '');
    if (!/3–5/.test(kiezen)) problemen.push(`${waar}: leeftijd niet bij Oefeningen kiezen (${kiezen})`);
    await open(`/training/${id}/genereren`);
    await foto('genereren');

    // Help.
    await open('/help/zoeken');
    await foto('help');
    await ctx.close();
  }
}
await blad(browser, shots, `${MAP}blad-030.png`, 6, 2400);
await browser.close();
console.log(problemen.length ? `Problemen:\n- ${[...new Set(problemen)].join('\n- ')}` : 'Geen problemen gevonden.');
