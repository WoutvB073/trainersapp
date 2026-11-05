// 0.31.1: nieuw startscherm en nieuwe namen. Startscherm op 7 formaten in NL en EN (volgorde, in beeld, niets afgekapt), de hernoemde
// schermen zonder oude namen, en een oude clubtraining-link. Bladen: blad-0311-nl.png, blad-0311-en.png, blad-0311-schermen.png.
// Gebruik: node tools/e2e/versie-0311.mjs [basis-url]
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start } from './hulp.mjs';

const FORMATEN = [
  ['iPhone SE', 375, 667, true],
  ['Telefoon', 390, 844, true],
  ['Klein 320', 320, 568, true],
  ['SE liggend', 667, 375, true],
  ['14 liggend', 844, 390, true],
  ['Tablet', 820, 1180, true],
  ['Laptop', 1366, 800, false],
];
const TITELS = {
  nl: ['Teamtraining', 'Wedstrijd', 'Circuittraining', 'Oefeningen spelers', 'Oefeningen keepers', 'Oefening maken'],
  en: ['Team session', 'Match day', 'Circuit session', 'Player drills', 'Goalkeeper drills', 'Create a drill'],
};
const OUD = /Clubtraining|clubtraining|Training maken|Mijn trainingen|Training genereren|Club session|club session|Plan a session|My sessions|Generate a session/;

const browser = await start();
const problemen = [];
const shots = { nl: [], en: [], schermen: [] };

const controle = (page) =>
  page.evaluate(() => ({
    breed: document.documentElement.scrollWidth - innerWidth,
    kap: [...document.querySelectorAll('button, a, h1, h2, h3, .tegel-titel, .tegel-sub')]
      .filter((e) => {
        const s = getComputedStyle(e);
        const b = e.getBoundingClientRect();
        const uit = b.width > 0 && (b.right > innerWidth + 1 || b.left < -1);
        return e.offsetParent && (uit || ((s.overflow === 'hidden' || s.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 2));
      })
      .map((e) => e.innerText.slice(0, 30)),
  }));

for (const taal of ['nl', 'en']) {
  for (const [naam, w, h, mobiel] of FORMATEN) {
    const waar = `${taal} ${naam}`;
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    page.on('pageerror', (e) => problemen.push(`${waar}: ${e.message}`));
    await alsGeinstalleerd(page);
    await page.evaluateOnNewDocument((taal) => {
      try {
        localStorage.setItem('trainersapp.taal', taal);
      } catch {
        /* about:blank */
      }
    }, taal);
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobiel, hasTouch: mobiel });
    await page.goto(`${BASE}?r=${naam.replace(/\W/g, '')}${taal}#/`, { waitUntil: 'networkidle0' });
    await slaap(200);
    const m = await page.evaluate(() => {
      const tegels = [...document.querySelectorAll('.tegels > .tegel')];
      const rect = (t) => t.getBoundingClientRect();
      return {
        titels: tegels.map((t) => t.querySelector('.tegel-titel').textContent),
        boven: tegels.map((t) => Math.round(rect(t).top)),
        onder: Math.max(...tegels.map((t) => rect(t).bottom)),
        drieGroot: Math.max(...tegels.slice(0, 3).map((t) => rect(t).bottom)),
        hoog: innerHeight,
        sub: tegels.slice(0, 3).map((t) => t.querySelector('.tegel-sub').textContent),
        iconen: ['[aria-label="Help"], [aria-label="Instellingen"], [aria-label="Settings"]'].map((q) => document.querySelectorAll(q).length)[0],
      };
    });
    const r = await controle(page);
    if (JSON.stringify(m.titels) !== JSON.stringify(TITELS[taal])) problemen.push(`${waar}: titels ${m.titels.join(', ')}`);
    if (m.boven[1] !== m.boven[2] && !naam.includes('liggend')) problemen.push(`${waar}: Wedstrijd en Circuittraining niet naast elkaar`);
    if (m.boven[3] !== m.boven[4] || m.boven[4] !== m.boven[5]) problemen.push(`${waar}: drie kleine tegels niet op één rij`);
    if (m.drieGroot > m.hoog) problemen.push(`${waar}: grote tegels niet in beeld (${Math.round(m.drieGroot)} > ${m.hoog})`);
    console.log(`${waar}: onderkant ${Math.round(m.onder)} van ${m.hoog}`);
    if (['iPhone SE', 'Telefoon', 'SE liggend', '14 liggend'].includes(naam) && m.onder > m.hoog) problemen.push(`${waar}: past niet zonder scrollen (${Math.round(m.onder)} > ${m.hoog})`);
    if (r.breed > 0) problemen.push(`${waar}: ${r.breed}px horizontaal scrollen`);
    if (r.kap.length) problemen.push(`${waar}: afgekapt: ${r.kap.join(' | ')}`);
    const pad = `${MAP}s0311-${taal}-${naam.replace(/\W/g, '')}.png`;
    await page.screenshot({ path: pad });
    shots[taal].push([pad, naam]);

    // Hernoemde schermen (iPhone SE en laptop).
    if (naam === 'iPhone SE' || naam === 'Laptop') {
      const id = await page.evaluate(() => {
        localStorage.setItem('trainersapp.trainingen', JSON.stringify({ versie: 1, trainingen: [{ id: 't1', naam: '', spelers: 4, keepers: 1, oefeningen: ['veld-af-cutback'], gemaakt: 1, gewijzigd: 1 }] }));
        localStorage.setItem('trainersapp.clubtrainingen', JSON.stringify({ versie: 1, lijst: [{ id: 'c1', naam: 'Maandag', datums: ['2026-11-09'], leeftijd: 'mini-5-7', kinderen: 30, groepjes: 6, trainers: [], blokken: { techniek: 'veld-mt-tik-tak' }, stationTrainers: {}, veldTrainers: {}, afgevinkt: [], gemaakt: 1, gewijzigd: 1 }] }));
        return 'c1';
      });
      for (const [titel, pad2] of [['trainingen', '/trainingen'], ['training', '/training/t1'], ['genereren', '/training/t1/genereren'], ['club', '/club'], ['clubbewerk', `/club/${id}`], ['help', '/help/club'], ['help2', '/help/training']]) {
        await page.goto(`${BASE}?r=${Math.random()}#${pad2}`, { waitUntil: 'networkidle0' });
        await slaap(200);
        const tekst = await page.evaluate(() => document.body.innerText);
        const oud = OUD.exec(tekst);
        if (oud) problemen.push(`${waar} ${pad2}: oude naam "${oud[0]}"`);
        const c = await controle(page);
        if (c.breed > 0 || c.kap.length) problemen.push(`${waar} ${pad2}: ${c.breed}px, afgekapt ${c.kap.join(' | ')}`);
        if (naam === 'iPhone SE') {
          const p3 = `${MAP}s0311-${taal}-${titel}.png`;
          await page.screenshot({ path: p3 });
          shots.schermen.push([p3, `${taal} · ${titel}`]);
        }
      }
    }
    await ctx.close();
  }
}

// Oude link naar een clubtraining (zoals gedeeld in 0.31.0), op een niet-geïnstalleerde telefoon.
{
  const code = Buffer.from(JSON.stringify({ v: 1, n: 'Maandag', d: ['2026-11-09'], l: 'mini-5-7', k: 30, g: 6, t: [], b: ['v:mt-tik-tak', '', '', ''], s: {}, f: {} })).toString('base64url');
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36');
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}?r=oud#/c/${code}`, { waitUntil: 'networkidle0' });
  await slaap(300);
  const r = await page.evaluate(() => ({ poort: !!document.querySelector('.poort'), titel: document.querySelector('.detail-titel')?.textContent, tekst: document.body.innerText }));
  console.log(`Oude link: ${r.titel}`);
  if (r.poort || r.titel !== 'Maandag') problemen.push(`oude link: ${JSON.stringify({ poort: r.poort, titel: r.titel })}`);
  if (OUD.test(r.tekst)) problemen.push('oude link: oude naam zichtbaar');
  await ctx.close();
}

await blad(browser, shots.nl, `${MAP}blad-0311-nl.png`, 7, 2600);
await blad(browser, shots.en, `${MAP}blad-0311-en.png`, 7, 2600);
await blad(browser, shots.schermen, `${MAP}blad-0311-schermen.png`, 7, 2600);
await browser.close();
console.log(problemen.length ? `Problemen:\n- ${[...new Set(problemen)].join('\n- ')}` : 'Geen problemen gevonden.');
