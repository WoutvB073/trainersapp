// Externe verzoeken (0.37.0): loopt de belangrijkste schermen langs (als geïnstalleerde app, niet ingelogd) en het installatiescherm,
// en noteert elk verzoek dat niet naar de eigen site gaat. Alleen Firebase (Google-adressen van Firebase) mag; lettertypes en
// al het andere moeten uit de app zelf komen. Gebruik: node tools/e2e/extern.mjs [basis-url]
import { alsGeinstalleerd, BASE, slaap, start, UA } from './hulp.mjs';

const FIREBASE = /(^|\.)(firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com|firebaseinstallations\.googleapis\.com|firebase\.googleapis\.com|toptraining-40a90\.firebaseapp\.com)$/;
const SCHERMEN = ['/', '/veld', '/veld/techniek', '/oefening/veld-tq-kappen-draaien', '/keepers', '/trainingen', '/wedstrijd', '/tactiek/hoog-druk-433', '/club', '/eigen', '/eigen/nieuw', '/instellingen', '/account', '/teams', '/help', '/help/installeren'];

const browser = await start();
const eigen = new URL(BASE).origin;
const buiten = new Map();
const noteer = (r) => {
  const u = r.url();
  if (u.startsWith('data:') || u.startsWith('blob:') || u.startsWith(eigen)) return;
  const host = new URL(u).host;
  if (!buiten.has(host)) buiten.set(host, u.slice(0, 120));
};
const fouten = [];

// Als geïnstalleerde app, niet ingelogd.
{
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await alsGeinstalleerd(page);
  page.on('request', noteer);
  page.on('pageerror', (e) => fouten.push(e.message));
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  for (const pad of SCHERMEN) {
    await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#${pad}`, { waitUntil: 'domcontentloaded' });
    await slaap(pad.startsWith('/oefening') || pad.startsWith('/tactiek') ? 2500 : 900);
  }
  await ctx.close();
}
// Installatiescherm in Safari en in WhatsApp (niet geïnstalleerd).
for (const ua of [UA.iphone26, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/25.20.0', UA.android]) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  page.on('request', noteer);
  await page.setUserAgent(ua);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#/`, { waitUntil: 'domcontentloaded' });
  await slaap(1200);
  await ctx.close();
}
await browser.close();

const hosts = [...buiten.keys()];
const nietFirebase = hosts.filter((h) => !FIREBASE.test(h));
console.log(`Externe adressen: ${hosts.length ? hosts.join(', ') : 'geen'}`);
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 5));
if (nietFirebase.length) {
  console.log('PROBLEMEN: verzoeken buiten de app die niet van Firebase zijn:');
  for (const h of nietFirebase) console.log(' -', buiten.get(h));
  process.exit(1);
}
console.log('Geen problemen gevonden: geen lettertypes of andere bestanden van buiten, alleen Firebase.');
