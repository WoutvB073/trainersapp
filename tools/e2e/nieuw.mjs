// Close-ups van nieuwe oefeningen: per oefening 3D op vier momenten (startcamera) en 2D halverwege, op één blad.
// Gebruik: node tools/e2e/nieuw.mjs <id,id,...> [blad-naam] [basis-url]
import { alsGeinstalleerd, blad, MAP, slaap, start, zetTijd } from './hulp.mjs';

const ids = (process.argv[2] ?? '').split(',').filter(Boolean);
const naam = process.argv[3] ?? 'nieuw';
const BASIS = process.argv[4] ?? 'http://localhost:4184/trainersapp/';
const browser = await start();
const fouten = [];
const page = await browser.newPage();
await alsGeinstalleerd(page);
page.on('pageerror', (e) => fouten.push(e.message));
page.on('console', (m) => m.type() === 'error' && fouten.push(m.text()));
await page.setViewport({ width: 560, height: 900, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
const kies = (tekst) => page.evaluate((tekst) => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === tekst)?.click(), tekst);
const shots = [];
let n = 0;
for (const id of ids) {
  await page.goto(`${BASIS}?r=n${n++}#/oefening/${id}`, { waitUntil: 'networkidle0' });
  const ok = await page.waitForSelector('.speler-canvas-3d', { timeout: 15000 }).catch(() => null);
  if (!ok) {
    fouten.push(`${id}: geen 3D`);
    continue;
  }
  await page.evaluate(() => document.fonts.ready);
  await slaap(300);
  const titel = await page.evaluate(() => document.querySelector('.detail-titel')?.textContent ?? '');
  const duur = Number(await page.evaluate(() => document.querySelector('.speler-balk').max));
  const vak = await page.$('.speler-vak');
  for (const f of [0.15, 0.4, 0.65, 0.88]) {
    await zetTijd(page, duur * f);
    await slaap(120);
    const pad = `${MAP}n-${id}-${f}.png`;
    await vak.screenshot({ path: pad });
    shots.push([pad, `${titel} – 3D ${Math.round(f * 100)}% (${duur.toFixed(1)} s)`]);
  }
  await kies('2D');
  await slaap(250);
  await zetTijd(page, duur * 0.5);
  const pad = `${MAP}n-${id}-2d.png`;
  await (await page.$('.speler-vak')).screenshot({ path: pad });
  shots.push([pad, `${titel} – 2D 50%`]);
  await kies('3D');
}
await blad(browser, shots, `${MAP}blad-${naam}.png`, 5, 2400);
await browser.close();
if (fouten.length) console.log('FOUTEN:', [...new Set(fouten)]);
console.log(`${shots.length} screenshots → blad-${naam}.png`);
