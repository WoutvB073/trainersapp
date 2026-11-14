// Eén oefening in 3D (startcamera) op zelf gekozen tijdstippen, voor sleutelmomenten die tussen de vaste momenten van nieuw.mjs vallen.
// Gebruik: node tools/e2e/moment.mjs <id> <t1,t2,...> [blad-naam] [basis-url] [2d]
import { alsGeinstalleerd, blad, MAP, slaap, start, zetTijd } from './hulp.mjs';

const id = process.argv[2];
const tijden = (process.argv[3] ?? '').split(',').filter(Boolean).map(Number);
const naam = process.argv[4] ?? `moment-${id}`;
const BASIS = process.argv[5] && process.argv[5] !== '-' ? process.argv[5] : 'http://localhost:4184/trainersapp/';
const tweeD = process.argv[6] === '2d';
const browser = await start();
const fouten = [];
const page = await browser.newPage();
await alsGeinstalleerd(page);
page.on('pageerror', (e) => fouten.push(e.message));
await page.setViewport({ width: 560, height: 900, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
await page.goto(`${BASIS}?r=m${Date.now()}#/oefening/${id}`, { waitUntil: 'networkidle0' });
await page.waitForSelector('.speler-canvas-3d', { timeout: 15000 });
await page.evaluate(() => document.fonts.ready);
await slaap(300);
if (tweeD) {
  await page.evaluate(() => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === '2D')?.click());
  await slaap(250);
}
const vak = await page.$('.speler-vak');
const shots = [];
for (const t of tijden) {
  await zetTijd(page, t);
  await slaap(120);
  const pad = `${MAP}m-${id}-${t}.png`;
  await vak.screenshot({ path: pad });
  shots.push([pad, `${t.toFixed(2)} s`]);
}
await blad(browser, shots, `${MAP}blad-${naam}.png`, Math.min(6, shots.length), 2400);
await browser.close();
if (fouten.length) console.log('FOUTEN:', [...new Set(fouten)]);
console.log(`${shots.length} screenshots → blad-${naam}.png`);
