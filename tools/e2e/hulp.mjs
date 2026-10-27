// Gedeelde hulpjes voor de browsertests (puppeteer-core + lokale Chrome).
import puppeteer from 'puppeteer-core';

export const BASE = process.argv[2] ?? 'http://localhost:4184/trainersapp/';
export const MAP = new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
export const slaap = (ms) => new Promise((r) => setTimeout(r, ms));

export const UA = {
  iphone26:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
  iphone18:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  iphoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.7339.101 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  laptop:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
};

export async function start() {
  return puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    // Echte videokaart gebruiken (anders rekent Chrome 3D op de processor uit en is het veel trager dan op een telefoon).
    // Nederlandse browser: de app staat dan op Automatisch in het Nederlands (taal.mjs test het Engels apart).
    args: ['--lang=nl-NL', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  });
}

/** Doe alsof de app vanaf het beginscherm geopend is (standalone). */
export async function alsGeinstalleerd(page) {
  await page.evaluateOnNewDocument(() => {
    const echt = window.matchMedia.bind(window);
    window.matchMedia = (q) =>
      q.includes('display-mode: standalone')
        ? { matches: true, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }
        : echt(q);
    try {
      localStorage.setItem('trainersapp.3dAltijd', '1'); // test: niet terugvallen op 2D door de snelheidsmeting
      localStorage.setItem('trainersapp.uitleg3d', '1'); // uitleg over draaien niet in de screenshots
    } catch {
      /* about:blank */
    }
  });
}

/** Animatie pauzeren en op tijdstip t zetten. */
export async function zetTijd(page, t) {
  await page.evaluate((t) => {
    document.querySelector('[aria-label="Pauze"]')?.click();
    const r = document.querySelector('.speler-balk');
    if (!r) return;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(r, String(t));
    r.dispatchEvent(new Event('input', { bubbles: true }));
  }, t);
  await slaap(120);
}

/** Losse screenshots naast elkaar op één blad (met onderschrift). */
export async function blad(browser, bestanden, uit, kolommen = 3, breedte = 1500) {
  const fs = await import('node:fs');
  const page = await browser.newPage();
  await page.setViewport({ width: breedte, height: 800 });
  const items = bestanden
    .map(([pad, tekst]) => `<figure><img src="data:image/png;base64,${fs.readFileSync(pad).toString('base64')}"><figcaption>${tekst}</figcaption></figure>`)
    .join('');
  await page.setContent(
    `<style>body{margin:0;padding:12px;background:#e9eeeb;font:600 15px system-ui}
     .g{display:grid;grid-template-columns:repeat(${kolommen},1fr);gap:12px;align-items:start}
     figure{margin:0;background:#fff;padding:6px;border-radius:8px} img{width:100%;display:block;border-radius:4px}
     figcaption{padding:6px 2px 0}</style><div class="g">${items}</div>`,
  );
  await page.screenshot({ path: uit, fullPage: true });
  await page.close();
}
