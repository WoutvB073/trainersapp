// 3D-animatie: screenshots op een paar momenten (beide voorbeeldoefeningen, drie camerastanden, telefoon/tablet/laptop)
// en een meting van de beeldsnelheid op telefoonformaat (ook met 4× trager gemaakte processor).
// Gebruik: node tools/e2e/drie-d.mjs [basis-url]   (preview op poort 4184)
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start, UA, zetTijd } from './hulp.mjs';

const browser = await start();
const fouten = [];
const sleutel = (p) => {
  p.on('pageerror', (e) => fouten.push(e.message));
  p.on('console', (m) => m.type() === 'error' && fouten.push(m.text()));
};

async function detail(page, id) {
  await page.goto(`${BASE}?r=${Math.random()}#/oefening/${id}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.speler-canvas-3d', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await slaap(300);
}

async function camera(page, naam) {
  await page.evaluate((naam) => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === naam)?.click(), naam);
  await slaap(950);
}

// ---------- momenten op telefoonformaat ----------
const page = await browser.newPage();
sleutel(page);
await alsGeinstalleerd(page);
await page.setUserAgent(UA.iphone26);
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

const shots = [];
const moment = async (naam, tekst) => {
  const pad = `${MAP}3d-${naam}.png`;
  const vak = await page.$('.speler-vak');
  await vak.screenshot({ path: pad });
  shots.push([pad, tekst]);
};

await detail(page, 'veld-kaatsen-en-afwerken');
const info = await page.evaluate(() => ({ webgl: !!document.querySelector('.speler-canvas-3d'), modus: document.querySelector('.speler-groep:last-child .aan')?.textContent }));
console.log('Veld 3D:', info);
for (const [t, tekst] of [
  [0, 'Veld – begin (schuin)'],
  [1.0, 'Pass 9 → 10 rolt over het gras'],
  [3.3, 'Kaats terug in de loop'],
  [5.0, 'Dribbel richting de zestien'],
  [6.05, 'Schot met lage boog, keeper duikt'],
  [6.6, 'Keeper ligt, bal in het net'],
]) {
  await zetTijd(page, t);
  await moment(`veld-${t}`, `${tekst} (t=${t})`);
}
await zetTijd(page, 6.05);
await camera(page, 'Boven');
await moment('veld-boven', 'Camera: Boven (t=6.05)');
await camera(page, 'Achter goal');
await moment('veld-achter', 'Camera: Achter goal (t=6.05)');

await detail(page, 'keeper-laag-duiken-kniezit');
for (const [t, tekst] of [
  [0.35, 'Keeper – worp met boog'],
  [0.6, 'Keeper duikt naar links'],
  [1.2, 'Ligt met de bal'],
  [1.75, 'Staat op'],
  [2.75, 'Rolt de bal terug (grond)'],
  [5.1, 'Duik naar rechts'],
]) {
  await zetTijd(page, t);
  await moment(`keeper-${t}`, `${tekst} (t=${t})`);
}
await zetTijd(page, 5.1);
await camera(page, 'Achter goal');
await moment('keeper-achter', 'Camera: Achter goal (t=5.1)');
await camera(page, 'Boven');
await moment('keeper-boven', 'Camera: Boven (t=5.1)');
await blad(browser, shots, `${MAP}blad-3d-momenten.png`, 4, 1600);

// ---------- draaien/zoomen: camera blijft boven het gras en binnen bereik ----------
await detail(page, 'veld-kaatsen-en-afwerken');
const vak = await page.$('.speler-canvas-3d');
const box = await vak.boundingBox();
const muis = page.mouse;
for (let i = 0; i < 3; i++) {
  await muis.move(box.x + box.width / 2, box.y + 40);
  await muis.down();
  await muis.move(box.x + box.width / 2 + 10, box.y + box.height - 5, { steps: 12 }); // ver naar beneden slepen = camera omlaag
  await muis.up();
}
await muis.move(box.x + box.width / 2, box.y + box.height / 2);
for (let i = 0; i < 40; i++) await muis.wheel({ deltaY: 400 }); // ver uitzoomen
await slaap(800);
await page.screenshot({ path: `${MAP}3d-grens.png`, clip: box });
const pauze = await page.evaluate(() => document.querySelector('.knop-hoofd')?.getAttribute('aria-label'));
console.log('Na slepen speelt de animatie nog (niet gepauzeerd door slepen):', pauze === 'Pauze');
await page.close();

// ---------- tablet en laptop ----------
const formaten = [
  ['tablet', 820, 1180, UA.ipad, true],
  ['laptop', 1366, 800, UA.laptop, false],
];
const groot = [];
for (const [naam, w, h, ua, mobiel] of formaten) {
  const p = await browser.newPage();
  sleutel(p);
  await alsGeinstalleerd(p);
  await p.setUserAgent(ua);
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobiel, hasTouch: mobiel });
  for (const [id, t] of [['veld-kaatsen-en-afwerken', 6.05], ['keeper-laag-duiken-kniezit', 0.6]]) {
    await detail(p, id);
    await zetTijd(p, t);
    const pad = `${MAP}3d-${naam}-${id.split('-')[0]}.png`;
    await p.screenshot({ path: pad });
    groot.push([pad, `${naam} – ${id}`]);
  }
  await p.close();
}
await blad(browser, groot, `${MAP}blad-3d-groot.png`, 2, 1800);

// ---------- vloeiendheid: beeldtijd tijdens afspelen ----------
async function meet(cpu) {
  const p = await browser.newPage();
  await alsGeinstalleerd(p);
  await p.setUserAgent(UA.android);
  await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 2.6, isMobile: true, hasTouch: true });
  const cdp = await p.createCDPSession();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  await detail(p, 'veld-kaatsen-en-afwerken');
  const r = await p.evaluate(
    () =>
      new Promise((klaar) => {
        const tijden = [];
        let vorige = performance.now();
        const stap = (nu) => {
          tijden.push(nu - vorige);
          vorige = nu;
          if (tijden.length < 180) requestAnimationFrame(stap);
          else {
            const s = tijden.slice(20).sort((a, b) => a - b);
            klaar({ mediaan: s[Math.floor(s.length / 2)], p90: s[Math.floor(s.length * 0.9)], gl: (() => { const c = document.createElement('canvas').getContext('webgl2'); const d = c?.getExtension('WEBGL_debug_renderer_info'); return d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : '?'; })() });
          }
        };
        requestAnimationFrame(stap);
      }),
  );
  const modus = await p.evaluate(() => document.querySelector('.speler-groep:last-child .aan')?.textContent);
  await p.close();
  return { ...r, modus };
}
for (const cpu of [1, 4]) {
  const r = await meet(cpu);
  console.log(`Beeldtijd (processor ${cpu}× trager): mediaan ${r.mediaan.toFixed(1)} ms, 90% onder ${r.p90.toFixed(1)} ms → ± ${Math.round(1000 / r.mediaan)} beelden/s · ${r.modus} · ${r.gl}`);
}

await browser.close();
console.log(fouten.length ? `Fouten:\n- ${[...new Set(fouten)].join('\n- ')}` : 'Geen fouten in de console.');
