// 0.32.0: circuittraining samenstellen op iPhone SE en laptop, in NL en EN: Zelf samenstellen, onderdelen toevoegen, weghalen en
// verslepen, duur en Stations/Samen aanpassen, totale tijd, sjabloon opslaan en gebruiken, rotatie (het voorbeeld met 2 groepjes),
// rondetimer, oude training als Mini Talents, deellink. Blad: blad-0320.png. Gebruik: node tools/e2e/versie-0320.mjs [basis-url]
import { createJiti } from 'jiti';
import { alsGeinstalleerd, BASE, blad, MAP, slaap, start } from './hulp.mjs';

const jiti = createJiti(import.meta.url);
const { EN } = await jiti.import('../../src/i18n/en.ts');

const browser = await start();
const problemen = [];
const fouten = [];
const shots = [];
const controle = (ok, t) => {
  if (!ok) problemen.push(t);
};
const OUD = { id: 'oud', naam: 'Oude training', datums: ['2026-11-09'], leeftijd: 'mini-5-7', kinderen: 30, groepjes: 6, trainers: ['Testtrainer 1'], blokken: { techniek: 'veld-mt-tik-tak', 'een-tegen-een': 'veld-mt-over-de-rivier', afwerken: 'veld-mt-pionnen-omgooien', partijvormen: 'veld-mt-3-tegen-3' }, stationTrainers: {}, veldTrainers: {}, afgevinkt: [], gemaakt: 1, gewijzigd: 1 };

for (const [formaat, vp] of [
  ['SE', { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['laptop', { width: 1366, height: 820, deviceScaleFactor: 1 }],
]) {
  for (const taal of process.env.TAAL ? [process.env.TAAL] : ['nl', 'en']) {
    const waar = `${taal} ${formaat}`;
    const T = (s, vars = {}) => {
      let x = taal === 'en' ? (EN[s] ?? s) : s;
      for (const [k, v] of Object.entries(vars)) x = x.replaceAll(`{${k}}`, v);
      return x;
    };
    const naamVan = (k) => T({ loopcoordinatie: 'Loopcoördinatie', techniek: 'Techniek', afwerken: 'Afwerken', 'een-tegen-een': '1 tegen 1', partijvormen: 'Partijvormen', 'warming-up': 'Warming-up' }[k]);
    const context = await browser.createBrowserContext();
    await context.overridePermissions(new URL(BASE).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
    const page = await context.newPage();
    await alsGeinstalleerd(page);
    await page.evaluateOnNewDocument(
      (taal, oud) => {
        try {
          localStorage.setItem('trainersapp.taal', taal);
          if (!localStorage.getItem('trainersapp.clubtrainingen')) localStorage.setItem('trainersapp.clubtrainingen', JSON.stringify({ versie: 1, lijst: [oud] }));
        } catch {
          /* about:blank */
        }
      },
      taal,
      OUD,
    );
    page.on('pageerror', (e) => fouten.push(`${waar}: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && !/WebGL|GPU/.test(m.text()) && fouten.push(`${waar}: ${m.text().slice(0, 140)}`));
    let antwoord = 'Klein groepje';
    page.on('dialog', (d) => void d.accept(d.type() === 'prompt' ? antwoord : undefined));
    await page.setViewport(vp);

    const ga = async (pad) => {
      await page.goto(`${BASE}?r=${Math.random().toString(36).slice(2)}#${pad}`, { waitUntil: 'networkidle0' });
      await slaap(250);
    };
    const klik = async (tekst, sel = 'button') => {
      const ok = await page.evaluate(
        (tekst, sel) => {
          const b = [...document.querySelectorAll(sel)].find((x) => x.textContent.trim().startsWith(tekst) || x.getAttribute('aria-label') === tekst);
          b?.click();
          return !!b;
        },
        tekst,
        sel,
      );
      if (!ok) problemen.push(`${waar}: knop "${tekst}" niet gevonden op ${await page.evaluate(() => location.hash)}`);
      await slaap(200);
    };
    const foto = async (naam, tekst, heel = true) => {
      const p = `${MAP}s0320-${taal}-${formaat}-${naam}.png`;
      await page.screenshot({ path: p, fullPage: heel });
      shots.push([p, `${waar}: ${tekst}`]);
    };
    const opmaak = async (stap) => {
      const r = await page.evaluate(() => ({
        breed: document.documentElement.scrollWidth - innerWidth,
        kap: [...document.querySelectorAll('button, h1, h2, h3, .rij-titel, .rij-sub, select')]
          .filter((e) => {
            if (!e.offsetParent || e.closest('.kop') || e.closest('.club-tabel-vak')) return false;
            const b = e.getBoundingClientRect();
            return b.width > 0 && (b.right > innerWidth + 1 || b.left < -1);
          })
          .map((e) => e.innerText.slice(0, 30)),
      }));
      if (r.breed > 0) problemen.push(`${waar} ${stap}: ${r.breed}px horizontaal scrollen`);
      if (r.kap.length) problemen.push(`${waar} ${stap}: buiten beeld: ${r.kap.join(' | ')}`);
    };
    const delen = () => page.evaluate(() => [...document.querySelectorAll('.club-blok-titel')].map((e) => e.textContent));
    const voegToe = async (categorie) => {
      await page.select('.club-toevoegen select', categorie);
      await slaap(250);
    };

    // Keuze bij een nieuwe training.
    await ga('/club');
    await klik(T('Nieuwe circuittraining'));
    await page.waitForSelector('.paneel');
    const paneel = await page.evaluate(() => document.querySelector('.paneel').innerText);
    for (const t of [T('Mini Talents'), T('Zelf samenstellen')]) controle(paneel.includes(t), `${waar}: "${t}" ontbreekt in de keuze`);
    await foto('keuze', 'Nieuwe circuittraining', false);
    await klik(T('Zelf samenstellen'), '.paneel button');
    await page.waitForSelector('.club-blokken');

    // Het voorbeeld opbouwen: Loopcoördinatie, Techniek, Afwerken, 1 tegen 1, Partijspel samen, 2 groepjes, 10 kinderen.
    await page.$eval('input[maxlength="80"]', (e) => e.focus());
    await page.type('input[maxlength="80"]', 'Klein');
    await page.$eval('input[type="number"]', (e) => e.select());
    await page.type('input[type="number"]', '10');
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('.club-twee select')].at(-1);
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, '2');
      s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await slaap(200);
    // Warming-up weghalen en onderdelen toevoegen.
    await klik(T('{w0} weghalen', { w0: naamVan('warming-up') }));
    await voegToe('loopcoordinatie');
    await voegToe('een-tegen-een');
    controle((await delen()).length === 5, `${waar}: 5 onderdelen verwacht: ${await delen()}`);

    // Verslepen: Loopcoördinatie naar boven, 1 tegen 1 onder Afwerken.
    const sleep = async (naam, doel) => {
      const r = await page.evaluate(
        (naam, doel) => {
          const kaart = (n) => [...document.querySelectorAll('.club-blok')].find((k) => k.querySelector('.club-blok-titel').textContent === n);
          const van = kaart(naam).querySelector('.club-greep');
          van.scrollIntoView({ block: 'center' });
          const a = van.getBoundingClientRect();
          const b = kaart(doel).getBoundingClientRect();
          return { x: a.x + a.width / 2, y: a.y + a.height / 2, y2: b.y + 8 };
        },
        naam,
        doel,
      );
      await page.mouse.move(r.x, r.y);
      await page.mouse.down();
      await page.mouse.move(r.x, r.y + (r.y2 > r.y ? 12 : -12), { steps: 4 });
      await page.mouse.move(r.x, r.y2, { steps: 12 });
      await slaap(150);
      await page.mouse.up();
      await slaap(350);
    };
    // Volgorde nu: Techniek, Afwerken, Partijvormen, Loopcoördinatie, 1 tegen 1.
    if (!vp.hasTouch) {
      await sleep(naamVan('loopcoordinatie'), naamVan('techniek'));
      await sleep(naamVan('partijvormen'), naamVan('een-tegen-een'));
    } else {
      // Op de telefoon met de vinger, één plek per keer (bij de rand van het scherm scrolt de pagina mee).
      const stap = async (naam, richting) => {
        const r = await page.evaluate((naam) => {
          const kaart = [...document.querySelectorAll('.club-blok')].find((k) => k.querySelector('.club-blok-titel').textContent === naam);
          const greep = kaart.querySelector('.club-greep');
          greep.scrollIntoView({ block: 'center' });
          const g = greep.getBoundingClientRect();
          return { x: g.x + g.width / 2, y: g.y + g.height / 2, h: kaart.getBoundingClientRect().height };
        }, naam);
        const y2 = r.y + richting * r.h * 0.7;
        const c = await page.createCDPSession();
        await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y }] });
        for (let i = 1; i <= 14; i += 1) {
          await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: r.x, y: r.y + ((y2 - r.y) * i) / 14 }] });
          await slaap(20);
        }
        await slaap(150);
        await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await slaap(350);
      };
      await page.evaluate(() => document.activeElement?.blur());
      for (let i = 0; i < 3; i += 1) await stap(naamVan('loopcoordinatie'), -1);
      await stap(naamVan('een-tegen-een'), -1);
    }
    const volgorde = await delen();
    const verwacht = [naamVan('loopcoordinatie'), naamVan('techniek'), naamVan('afwerken'), naamVan('een-tegen-een'), naamVan('partijvormen')];
    controle(JSON.stringify(volgorde) === JSON.stringify(verwacht), `${waar}: volgorde na slepen: ${volgorde.join(', ')}`);

    // Duur: Loopcoördinatie, Techniek, Afwerken en 1 tegen 1 op 10, Partijspel op 15 of zelf invullen.
    const zetDuur = async (naam, waarde) => {
      await page.evaluate(
        (label, waarde) => {
          const s = document.querySelector(`select[aria-label="${label}"]`);
          Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, waarde);
          s.dispatchEvent(new Event('change', { bubbles: true }));
        },
        T('Duur van {w0}', { w0: naam }),
        waarde,
      );
      await slaap(150);
    };
    await zetDuur(naamVan('loopcoordinatie'), '10');
    await zetDuur(naamVan('een-tegen-een'), '10');
    await zetDuur(naamVan('partijvormen'), 'anders');
    const veld = `input[aria-label="${T('Minuten voor {w0}', { w0: naamVan('partijvormen') })}"]`;
    await page.waitForSelector(veld);
    await page.$eval(veld, (e) => e.select());
    await page.type(veld, '17');
    await slaap(250);
    const totaal = await page.evaluate(() => document.querySelector('.club-totaal strong')?.textContent);
    controle(totaal === T('{m} min', { m: 57 }), `${waar}: totale tijd ${totaal} (4 × 10 + 17)`);
    await opmaak('samenstellen');
    await foto('samenstellen', 'Onderdelen samengesteld');

    // Stations en Samen wisselen geeft een andere tijd niet, wel een ander plan.
    const soort = `[aria-label="${T('Soort voor {w0}', { w0: naamVan('partijvormen') })}"]`;
    controle((await page.$eval(`${soort} button[aria-checked="true"]`, (e) => e.textContent)) === T('Samen'), `${waar}: Partijvormen staat niet op Samen`);

    // Oefeningen genereren, sjabloon opslaan.
    await klik(T('Genereer alles'));
    await slaap(300);
    antwoord = 'Klein groepje';
    await klik(T('Opslaan als sjabloon'));
    await slaap(300);

    // Rotatie: precies het voorbeeld.
    const id = await page.evaluate(() => location.hash.split('/')[2]);
    await ga(`/club/${id}/plan`);
    await klik(T('Rotatie'), '[role="tab"]');
    await page.waitForSelector('.club-ronde-kaart');
    const rondes = await page.evaluate(() => [...document.querySelectorAll('.club-ronde-kaart')].map((k) => ({ tijd: k.querySelector('.club-ronde-tijd').textContent, regels: [...k.querySelectorAll('li')].map((l) => l.innerText.replace(/\s+/g, ' ')) })));
    console.log(waar, JSON.stringify(rondes.map((r) => r.tijd)));
    controle(rondes.length === 5, `${waar}: ${rondes.length} rondes`);
    const bevat = (i, ...t) => t.every((x, j) => rondes[i]?.regels[j]?.includes(x));
    controle(bevat(0, naamVan('loopcoordinatie'), naamVan('techniek')), `${waar}: ronde 1: ${rondes[0]?.regels}`);
    controle(bevat(1, naamVan('techniek'), naamVan('loopcoordinatie')), `${waar}: ronde 2: ${rondes[1]?.regels}`);
    controle(bevat(2, naamVan('afwerken'), naamVan('een-tegen-een')), `${waar}: ronde 3: ${rondes[2]?.regels}`);
    controle(bevat(3, naamVan('een-tegen-een'), naamVan('afwerken')), `${waar}: ronde 4: ${rondes[3]?.regels}`);
    controle(rondes[4]?.regels.join(' ').includes('A + B'), `${waar}: ronde 5: ${rondes[4]?.regels}`);
    controle(rondes[4]?.tijd === '40–57 min', `${waar}: tijd ronde 5: ${rondes[4]?.tijd}`);
    await opmaak('rotatie');
    await foto('rotatie', 'Rotatie, 2 groepjes');
    await klik(T('Stations'), '[role="tab"]');
    await slaap(300);
    controle((await page.$$('.club-veld')).length === 2, `${waar}: twee veldplannen verwacht`);
    await foto('stations', 'Stations in twee fases');
    await klik(T('Partij'), '[role="tab"]');
    await slaap(200);
    await foto('partij', 'Partij: 1 veld');
    await klik(T('Materiaal'), '[role="tab"]');
    await slaap(200);
    await opmaak('materiaal');

    // Rondetimer volgt de duur.
    await ga(`/club/${id}/timer`);
    const tijd = await page.evaluate(() => document.querySelector('.club-timer-tijd').textContent);
    controle(tijd === '10:00', `${waar}: timer begint op ${tijd}`);
    await klik(T('Start'));
    await slaap(200);
    for (let i = 0; i < 4; i += 1) await klik(T('Volgende'));
    await slaap(300);
    const laatste = await page.evaluate(() => ({ tijd: document.querySelector('.club-timer-tijd').textContent, kop: document.querySelector('.club-timer-blok').textContent }));
    controle(laatste.tijd.startsWith('17:') || laatste.tijd.startsWith('16:'), `${waar}: laatste ronde ${laatste.tijd}`);
    controle(laatste.kop === naamVan('partijvormen'), `${waar}: laatste ronde heet ${laatste.kop}`);
    await klik(T('Stoppen'));

    // Sjabloon gebruiken.
    await ga('/club');
    const lijst = await page.evaluate(() => [...document.querySelectorAll('.club-lijst .rij-titel')].map((e) => e.textContent));
    controle(!lijst.includes('Klein groepje'), `${waar}: het sjabloon staat tussen de trainingen`);
    await klik(T('Nieuwe circuittraining'));
    await page.waitForSelector('.paneel');
    await klik('Klein groepje', '.paneel button');
    await page.waitForSelector('.club-blokken');
    controle(JSON.stringify(await delen()) === JSON.stringify(verwacht), `${waar}: sjabloon geeft ${await delen()}`);
    controle((await page.evaluate(() => document.querySelector('.club-totaal strong')?.textContent)) === T('{m} min', { m: 57 }), `${waar}: tijd uit sjabloon`);

    // Oude training opent als Mini Talents.
    await ga('/club/oud');
    await page.waitForSelector('.club-blokken');
    const oud = await delen();
    controle(oud.length === 4 && oud[3] === naamVan('partijvormen'), `${waar}: oude training: ${oud}`);
    controle((await page.evaluate(() => document.querySelector('.club-totaal strong')?.textContent)) === T('{u} uur {m} min', { u: 1, m: 0 }), `${waar}: oude training duurt geen uur`);
    await ga('/club/oud/plan');
    await klik(T('Rotatie'), '[role="tab"]');
    controle((await page.$$('.club-ronde-kaart')).length === 4, `${waar}: oude training heeft geen 4 rondes`);

    // Deellink met de nieuwe opzet, op een ander toestel.
    await ga(`/club/${id}`);
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    });
    await page.evaluate(() => navigator.clipboard.writeText(''));
    await klik(T('Deel met trainers'));
    await page.waitForFunction(() => navigator.clipboard.readText().then((t) => t.length > 0), { timeout: 12000, polling: 200 });
    const link = (await page.evaluate(() => navigator.clipboard.readText())).split(/\r?\n/).pop();
    const ander = await browser.createBrowserContext();
    const p2 = await ander.newPage();
    await p2.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/2.25');
    await p2.evaluateOnNewDocument((taal) => {
      try {
        localStorage.setItem('trainersapp.taal', taal);
      } catch {
        /* about:blank */
      }
    }, taal);
    await p2.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await p2.goto(link, { waitUntil: 'networkidle0' });
    await slaap(300);
    const gedeeld = await p2.evaluate(() => ({ titel: document.querySelector('.detail-titel')?.textContent, knoppen: document.querySelectorAll('.club-station-knoppen button').length, rondes: document.querySelectorAll('.club-ronde-kaart').length, poort: !!document.querySelector('.poort') }));
    controle(gedeeld.titel === 'Klein' && gedeeld.knoppen === 5 && gedeeld.rondes === 5 && !gedeeld.poort, `${waar}: deellink ${JSON.stringify(gedeeld)}`);
    await ander.close();
    await context.close();
    console.log(`${waar}: klaar`);
  }
}

await blad(browser, shots, `${MAP}blad-0320.png`, 6, 2600);
await browser.close();
if (fouten.length) console.log('FOUTEN IN DE BROWSER:', [...new Set(fouten)].slice(0, 8));
if (problemen.length) {
  console.log('PROBLEMEN:');
  for (const p of [...new Set(problemen)].slice(0, 40)) console.log(' -', p);
  process.exit(1);
}
console.log('Geen problemen gevonden.');
