// 0.28.0: voorbeeldtactieken. Twee delen:
//   node tools/e2e/tactieken.mjs schermen [url]  – Wedstrijd → Nieuw tactiekbord → Voorbeeldtactiek, lijst, voorbeeld (11/8-keuze,
//     uitleg), Opslaan als eigen bord (uitleg in het bord), Aanpassen (editor), Help; iPhone SE en laptop, Nederlands en Engels.
//     Blad: blad-tactieken.png.
//   node tools/e2e/tactieken.mjs borden [url] [filter]  – alle borden in 3D (drie momenten) en 2D (eind), bladen
//     blad-tactiek-<groep>.png; plus een iPhone-SE-blad (blad-tactiek-se.png) met het hele voorbeeldscherm.
import { alsGeinstalleerd, blad, MAP, slaap, start, zetTijd } from './hulp.mjs';

const deel = process.argv[2] ?? 'schermen';
const BASIS = process.argv[3] ?? 'http://localhost:4184/trainersapp/';
const FILTER = process.argv[4] ?? '';
const browser = await start();
const fouten = [];
let n = 0;

/** Afgekapte tekst en horizontaal scrollen. */
async function controleer(page, waar, kopMag = false) {
  const r = await page.evaluate((kopMag) => {
    const kap = [];
    for (const e of document.querySelectorAll('button, .rij-titel, .rij-sub, h1, h2, h3, summary, .gen-chip, .keuze-kaart strong')) {
      if (e.offsetParent === null || (kopMag && e.closest('.kop'))) continue;
      const s = getComputedStyle(e);
      const verborgen = s.overflow === 'hidden' || s.overflowX === 'hidden' || s.textOverflow === 'ellipsis' || s.whiteSpace === 'nowrap';
      if (verborgen && e.scrollWidth > e.clientWidth + 2 && e.innerText.trim()) kap.push(e.innerText.trim().slice(0, 40));
    }
    return { kap, breed: document.documentElement.scrollWidth - window.innerWidth, tekst: document.body.innerText };
  }, kopMag);
  if (r.kap.length) fouten.push(`${waar}: afgekapt: ${r.kap.join(' | ')}`);
  if (r.breed > 0) fouten.push(`${waar}: ${r.breed}px horizontaal scrollen`);
  return r.tekst;
}
const klik = (page, tekst, sel = 'button, a') =>
  page.evaluate(
    (tekst, sel) => {
      const e = [...document.querySelectorAll(sel)].find((x) => x.textContent.trim().includes(tekst));
      e?.click();
      return !!e;
    },
    tekst,
    sel,
  );

if (deel === 'schermen') {
  const shots = [];
  const TEKST = {
    nl: { nieuw: 'Nieuw tactiekbord', keuze: 'Kies een voorbeeldtactiek', lijst: 'Voorbeeldtactieken', groepen: ['Druk zetten', 'Opbouwen', 'Aanvallen en omschakelen'], t1: 'Hoog druk zetten in een 1-4-3-3', acht: '8 tegen 8', elf: '11 tegen 11', opslaan: 'Opslaan als eigen bord', aanpassen: 'Aanpassen', uitleg: 'Uitleg bij deze tactiek', kopjes: ['Wat', 'Wanneer gebruiken', 'Aandachtspunten'], help: 'Voorbeeldtactieken', zoek: 'fuik' },
    en: { nieuw: 'New tactics board', keuze: 'Choose an example tactic', lijst: 'Example tactics', groepen: ['Pressing', 'Build-up', 'Attacking & transition'], t1: 'High press in a 1-4-3-3', acht: '8v8', elf: '11v11', opslaan: 'Save as my own board', aanpassen: 'Edit', uitleg: 'About this tactic', kopjes: ['What', 'When to use it', 'Key points'], help: 'Example tactics', zoek: 'trap' },
  };
  const NL_WOORDEN = /\b(Druk zetten|Opbouwen|Aandachtspunten|Wanneer gebruiken|Voorbeeldtactiek|tegen 8|spits|buitenspeler|middenvelder)\b/;
  for (const taal of ['nl', 'en']) {
    for (const [formaat, viewport] of [
      ['se', { width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true }],
      ['laptop', { width: 1280, height: 800, deviceScaleFactor: 1 }],
    ]) {
      const T = TEKST[taal];
      const waar = `${taal}/${formaat}`;
      const page = await browser.newPage();
      await alsGeinstalleerd(page);
      await page.evaluateOnNewDocument((tl) => {
        try {
          localStorage.setItem('trainersapp.taal', tl);
        } catch {
          /* about:blank */
        }
      }, taal);
      page.on('pageerror', (e) => fouten.push(`${waar}: ${e.message}`));
      await page.setViewport(viewport);
      const foto = async (naam, vol = true) => {
        const pad = `${MAP}tk-${taal}-${formaat}-${naam}.png`;
        await page.screenshot({ path: pad, fullPage: vol });
        shots.push([pad, `${waar} ${naam}`]);
      };
      // 1. Wedstrijd → Nieuw tactiekbord: de keuze Voorbeeldtactiek.
      await page.goto(`${BASIS}?r=${n++}#/wedstrijd`, { waitUntil: 'networkidle0' });
      await klik(page, T.nieuw);
      await slaap(300);
      if (!(await page.evaluate((k) => document.querySelector('.wedstrijd-paneel')?.innerText.includes(k), T.keuze))) fouten.push(`${waar}: keuze "${T.keuze}" niet in het paneel`);
      if (formaat === 'se') {
        await page.evaluate((k) => [...document.querySelectorAll('.keuze-kaart')].find((x) => x.textContent.includes(k))?.scrollIntoView({ block: 'center' }), T.keuze);
        await slaap(200);
        await foto('paneel', false);
      }
      await klik(page, T.keuze, '.keuze-kaart');
      await page.waitForFunction(() => location.hash === '#/tactieken', { timeout: 5000 }).catch(() => fouten.push(`${waar}: niet naar #/tactieken`));
      await slaap(300);
      // 2. De lijst: drie groepen, 17 tactieken.
      const lijst = await controleer(page, `${waar} lijst`);
      for (const g of T.groepen) if (!lijst.toLowerCase().includes(g.toLowerCase())) fouten.push(`${waar} lijst: groep "${g}" ontbreekt`);
      const rijen = await page.evaluate(() => document.querySelectorAll('.lijst .rij').length);
      if (rijen !== 17) fouten.push(`${waar} lijst: ${rijen} tactieken (verwacht 17)`);
      if (taal === 'en' && NL_WOORDEN.test(lijst)) fouten.push(`${waar} lijst: Nederlands in het Engels: ${lijst.match(NL_WOORDEN)[0]}`);
      await foto('lijst');
      // 3. Het voorbeeld: 11/8-keuze bovenaan, animatie, uitleg open.
      await klik(page, T.t1, '.rij');
      await page.waitForSelector('.speler-vak', { timeout: 15000 }).catch(() => fouten.push(`${waar}: geen animatie`));
      await slaap(600);
      const chips = await page.evaluate(() => [...document.querySelectorAll('.tactiek-versies .gen-chip')].map((b) => b.textContent));
      if (chips.join('|') !== `${T.elf}|${T.acht}`) fouten.push(`${waar}: versiekeuze ${chips.join('|')}`);
      const vb = await controleer(page, `${waar} voorbeeld`);
      for (const k of T.kopjes) if (!vb.includes(k)) fouten.push(`${waar} voorbeeld: kopje "${k}" ontbreekt`);
      if (taal === 'en' && NL_WOORDEN.test(vb)) fouten.push(`${waar} voorbeeld: Nederlands in het Engels: ${vb.match(NL_WOORDEN)[0]}`);
      // Passen alle 22 spelers in beeld (2D)?
      await foto('voorbeeld-11');
      await klik(page, T.acht, '.tactiek-versies .gen-chip');
      await slaap(800);
      if (!(await page.evaluate(() => location.hash.endsWith('/8v8')))) fouten.push(`${waar}: 8 tegen 8 niet in het adres`);
      await foto('voorbeeld-8');
      // 4. Opslaan als eigen bord: uitleg in het bord (ingeklapt), te openen.
      await klik(page, T.opslaan);
      await page.waitForFunction(() => /^#\/bord\/[^/]+$/.test(location.hash), { timeout: 5000 }).catch(() => fouten.push(`${waar}: niet naar het eigen bord`));
      await slaap(500);
      const dicht = await page.evaluate(() => document.querySelector('.tactiek-uitleg')?.open);
      if (dicht !== false) fouten.push(`${waar} bord: uitleg niet (ingeklapt) aanwezig`);
      await page.evaluate(() => document.querySelector('.tactiek-uitleg summary')?.click());
      await slaap(200);
      const bord = await controleer(page, `${waar} eigen bord`, true);
      if (!bord.includes(T.kopjes[2])) fouten.push(`${waar} bord: uitleg gaat niet open`);
      const naam = await page.evaluate(() => document.querySelector('.bord-pagina input[maxlength="80"]')?.value);
      if (!naam?.startsWith(T.t1)) fouten.push(`${waar} bord: naam "${naam}"`);
      await foto('eigen-bord');
      // 5. Aanpassen opent de editor met een eigen kopie; het voorbeeld blijft gelijk.
      await page.goto(`${BASIS}?r=${n++}#/tactiek/fuik-flank`, { waitUntil: 'networkidle0' });
      await slaap(400);
      await klik(page, T.aanpassen);
      await page.waitForFunction(() => /^#\/bord\/[^/]+\/tekenen$/.test(location.hash), { timeout: 5000 }).catch(() => fouten.push(`${waar}: Aanpassen opent de editor niet`));
      await slaap(500);
      if (formaat === 'laptop') await foto('aanpassen', false);
      // 6. Help: onderwerp en zoeken.
      await page.goto(`${BASIS}?r=${n++}#/help/tactieken`, { waitUntil: 'networkidle0' });
      await slaap(300);
      const help = await controleer(page, `${waar} help`);
      if (!help.includes(T.help)) fouten.push(`${waar} help: onderwerp ontbreekt`);
      await page.type('.help-zoek input', T.zoek);
      await slaap(300);
      const gevonden = await page.evaluate(() => document.body.innerText);
      if (!gevonden.includes(T.help)) fouten.push(`${waar} help: zoeken op "${T.zoek}" vindt de tactieken niet`);
      await page.close();
    }
  }
  await blad(browser, shots, `${MAP}blad-tactieken.png`, 6, 2600);
} else {
  // Alle borden.
  const fs = await import('node:fs');
  const { createJiti } = await import('jiti');
  const jiti = createJiti(import.meta.url);
  const { TACTIEKEN } = await jiti.import('../../src/wedstrijd/tactieken.ts');
  const page = await browser.newPage();
  await alsGeinstalleerd(page);
  page.on('pageerror', (e) => fouten.push(e.message));
  await page.setViewport({ width: 560, height: 900, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
  const kies = (tekst) => page.evaluate((tekst) => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === tekst)?.click(), tekst);
  for (const groep of ['druk', 'opbouw', 'aanval']) {
    const shots = [];
    for (const x of TACTIEKEN.filter((t) => t.groep === groep && t.id.includes(FILTER))) {
      for (const v of x.versies) {
        await page.goto(`${BASIS}?r=b${n++}#/tactiek/${x.id}/${v.id}`, { waitUntil: 'networkidle0' });
        const ok = await page.waitForSelector('.speler-canvas-3d', { timeout: 15000 }).catch(() => null);
        if (!ok) {
          fouten.push(`${x.id}/${v.id}: geen 3D`);
          continue;
        }
        await slaap(400);
        const duur = Number(await page.evaluate(() => document.querySelector('.speler-balk').max));
        for (const f of [0.3, 0.7, 1]) {
          await zetTijd(page, duur * f - (f === 1 ? 0.05 : 0));
          await slaap(150);
          const pad = `${MAP}tk-${x.id}-${v.id}-${f}.png`;
          await (await page.$('.speler-vak')).screenshot({ path: pad });
          shots.push([pad, `${x.naam} (${v.naam}) – 3D ${Math.round(f * 100)}% (${duur.toFixed(1)} s)`]);
        }
        await kies('2D');
        await slaap(250);
        await zetTijd(page, duur - 0.05);
        const pad = `${MAP}tk-${x.id}-${v.id}-2d.png`;
        await (await page.$('.speler-vak')).screenshot({ path: pad });
        shots.push([pad, `${x.naam} (${v.naam}) – 2D einde`]);
        await kies('3D');
      }
    }
    if (shots.length) await blad(browser, shots, `${MAP}blad-tactiek-${groep}.png`, 4, 2400);
    for (const [p] of shots) fs.rmSync(p, { force: true });
  }
  // iPhone SE: hele voorbeeldscherm (passen 22 spelers, lijnen en uitleg?).
  const se = await browser.newPage();
  await alsGeinstalleerd(se);
  await se.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const seShots = [];
  for (const [id, versie] of [
    ['hoog-druk-433', '11v11'],
    ['middenblok-442', '11v11'],
    ['counter', '8v8'],
    ['opbouw-8v8', '1-3-3-1'],
  ]) {
    await se.goto(`${BASIS}?r=s${n++}#/tactiek/${id}/${versie}`, { waitUntil: 'networkidle0' });
    await se.waitForSelector('.speler-vak', { timeout: 15000 }).catch(() => null);
    await slaap(500);
    await se.evaluate(() => [...document.querySelectorAll('.speler-groep button')].find((b) => b.textContent === '2D')?.click());
    await slaap(300);
    await zetTijd(se, Number(await se.evaluate(() => document.querySelector('.speler-balk').max)) - 0.05);
    const pad = `${MAP}tk-se-${id}.png`;
    await se.screenshot({ path: pad, fullPage: true });
    seShots.push([pad, `iPhone SE: ${id} (${versie})`]);
  }
  await blad(browser, seShots, `${MAP}blad-tactiek-se.png`, 4, 1800);
}
await browser.close();
console.log(fouten.length ? `Problemen:\n- ${[...new Set(fouten)].join('\n- ')}` : 'Geen problemen gevonden.');
process.exit(fouten.length ? 1 : 0);
