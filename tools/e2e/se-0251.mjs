// 0.25.1: iPhone SE in het Engels op de plekken waar "Games" en "wide block" staan. Blad: blad-se-0251.png.
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start } from './hulp.mjs';

const SCHERMEN = [
  ['spelers', '#/veld'],
  ['keepers', '#/keepers'],
  ['keepers-games', '#/keepers/spelletjes'],
  ['wide-block', '#/oefening/keeper-1o1-spreidsprong'],
  ['stompen-1op1', '#/oefening/keeper-cv-stompen-1op1'],
];
const browser = await start();
const page = await browser.newPage();
await alsGeinstalleerd(page);
await page.evaluateOnNewDocument(() => localStorage.setItem('trainersapp.taal', 'en'));
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const fouten = [];
const shots = [];
let n = 0;
const controleer = async (waar) => {
  const r = await page.evaluate(() => {
    const kap = [];
    for (const e of document.querySelectorAll('button, .knop, .label, h1, h2, h3, .kop-titel, .chips button, .gen-chip, .tabs button, .kaart-titel')) {
      if (e.offsetParent === null) continue;
      const s = getComputedStyle(e);
      const verborgen = s.overflow === 'hidden' || s.overflowX === 'hidden' || s.textOverflow === 'ellipsis' || s.whiteSpace === 'nowrap';
      if (verborgen && e.scrollWidth > e.clientWidth + 2 && e.innerText.trim()) kap.push(e.innerText.trim().slice(0, 40));
    }
    return { kap, breed: document.documentElement.scrollWidth - window.innerWidth, tekst: document.body.innerText };
  });
  if (r.kap.length) fouten.push(`${waar}: afgekapt: ${r.kap.join(' | ')}`);
  if (r.breed > 0) fouten.push(`${waar}: ${r.breed}px horizontaal scrollen`);
  if (/fun games|star jump/i.test(r.tekst)) fouten.push(`${waar}: oude term in beeld`);
  return r.tekst;
};
for (const [naam, hash] of SCHERMEN) {
  await page.goto(`${BASE}?r=${n++}${hash}`, { waitUntil: 'networkidle0' });
  await slaap(300);
  const tekst = await controleer(naam);
  if (naam === 'wide-block' && !/Wide block: passing and then 1v1/.test(tekst)) fouten.push('naam "Wide block: …" niet gevonden');
  const pad = `${MAP}se-0251-${naam}.png`;
  await page.screenshot({ path: pad, fullPage: naam.startsWith('keepers') || naam === 'spelers' });
  shots.push([pad, naam]);
}
// Training genereren: de onderdelen heten nu "Games".
await page.goto(`${BASE}?r=${n++}#/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.querySelector('.tegel-training .knop-primair')?.click());
await page.waitForFunction(() => /#\/training\//.test(location.hash));
const id = await page.evaluate(() => location.hash.split('/')[2]);
await page.goto(`${BASE}?r=${n++}#/training/${id}/genereren`, { waitUntil: 'networkidle0' });
await slaap(300);
const gen = await controleer('genereren');
const games = (gen.match(/\bGames\b/g) ?? []).length;
if (games < 2) fouten.push(`genereren: "Games" ${games}× gevonden (verwacht 2)`);
await page.screenshot({ path: `${MAP}se-0251-genereren.png`, fullPage: true });
shots.push([`${MAP}se-0251-genereren.png`, 'genereren']);
await page.goto(`${BASE}?r=${n++}#/training/${id}/kiezen`, { waitUntil: 'networkidle0' });
await slaap(300);
await controleer('kiezen');
await page.screenshot({ path: `${MAP}se-0251-kiezen.png` });
shots.push([`${MAP}se-0251-kiezen.png`, 'kiezen']);
await blad(browser, shots, `${MAP}blad-se-0251.png`, 7, 2600);
await browser.close();
console.log(fouten.length ? `Problemen:\n- ${fouten.join('\n- ')}` : 'Geen problemen gevonden.');
process.exit(fouten.length ? 1 : 0);
