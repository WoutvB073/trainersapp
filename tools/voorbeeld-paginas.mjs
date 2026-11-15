// Losse pagina's voor de voorbeeldversie (fase 1 van de volgende stap), gemaakt bij `node tools/voorbeeld.mjs build`:
//   voorbeeld/fase1/index.html        overzicht
//   voorbeeld/fase1/oefeningen.html   VOORSTEL-OEFENINGEN.md per categorie, met vinkjes (onthouden op het toestel) en "Kopieer lijst"
//   voorbeeld/fase1/nummers.html      rugnummers per formatie (getekend uit src/wedstrijd/wedstrijd.ts), de twijfelgevallen en de
//                                     conclusie over Realistisch
// Ze staan buiten /trainersapp/, dus buiten de service worker van de app, en horen niet bij de echte app.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';

const wortel = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const uit = path.join(wortel, 'voorbeeld', 'fase1');
const jiti = createJiti(import.meta.url);
const { SPELVORMEN, formatiePlekken } = await jiti.import('../src/wedstrijd/wedstrijd.ts');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const APP = '../trainersapp/';

// ---------- gedeelde opmaak ----------
const CSS = `
:root{--bg:#f4f6f5;--kaart:#fff;--tekst:#15201a;--zacht:#5b6a62;--lijn:#dfe5e1;--groen:#0f6b3a;--groen-zacht:#e3f1e8;--geel:#ffd23f;--rood:#c92a2a;--op-groen:#fff;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#101513;--kaart:#18201c;--tekst:#e8efe9;--zacht:#9db0a5;--lijn:#2a352f;--groen:#3fbf74;--groen-zacht:#1d3327;--op-groen:#08130d;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--tekst);font:16px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-text-size-adjust:100%}
.kop{position:sticky;top:0;z-index:5;background:#0f6b3a;color:#fff;padding:12px 16px calc(12px);padding-top:calc(12px + env(safe-area-inset-top))}
.kop a{color:#fff}
.kop h1{margin:0;font-size:1.15rem}
.kop p{margin:2px 0 0;font-size:.85rem;opacity:.85}
main{max-width:860px;margin:0 auto;padding:16px 16px calc(110px + env(safe-area-inset-bottom))}
h2{font-size:1.1rem;margin:28px 0 8px}
h3{font-size:1rem;margin:20px 0 6px}
section,h2,h3{scroll-margin-top:90px}
.kaart{background:var(--kaart);border:1px solid var(--lijn);border-radius:14px;padding:14px 16px;margin:10px 0}
.zacht{color:var(--zacht);font-size:.9rem}
a{color:var(--groen)}
table{width:100%;border-collapse:collapse;font-size:.9rem}
th,td{text-align:left;padding:7px 6px;border-bottom:1px solid var(--lijn);vertical-align:top}
th{font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;color:var(--zacht)}
.knop{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 16px;border:0;border-radius:999px;background:var(--groen);color:var(--op-groen);font:inherit;font-weight:700;text-decoration:none}
.knop.licht{background:var(--groen-zacht);color:var(--groen)}
.label{display:inline-block;padding:1px 8px;border-radius:999px;background:var(--groen-zacht);color:var(--groen);font-size:.75rem;font-weight:700}
.twijfel{border-left:4px solid var(--geel);padding-left:12px}
`;
const pagina = (titel, sub, inhoud, script = '') => `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow"><title>${esc(titel)}</title><style>${CSS}</style></head>
<body><header class="kop"><h1>${esc(titel)}</h1><p>${sub}</p></header><main>${inhoud}</main>${script ? `<script>${script}</script>` : ''}</body></html>
`;

// ---------- voorstel oefeningen ----------
function leesVoorstel() {
  const regels = fs.readFileSync(path.join(wortel, 'VOORSTEL-OEFENINGEN.md'), 'utf8').split(/\r?\n/);
  const groepen = [];
  const bronnen = [];
  let groep = null;
  let cat = null;
  let inBronnen = false;
  for (const r of regels) {
    if (/^\| Afkorting \| Bron \|/.test(r)) {
      inBronnen = true;
      continue;
    }
    if (inBronnen) {
      if (!r.startsWith('|')) inBronnen = false;
      else if (!/^\|---/.test(r)) {
        const [, a, b] = r.split('|').map((c) => c.trim());
        bronnen.push([a, b]);
      }
      continue;
    }
    const g = /^# (Spelers|Keepers)\s*$/.exec(r);
    if (g) {
      groep = { naam: g[1], categorieen: [] };
      groepen.push(groep);
      continue;
    }
    const c = /^## (.+?) \((\d+)\)\s*$/.exec(r);
    if (c && groep) {
      cat = { naam: c[1], oefeningen: [] };
      groep.categorieen.push(cat);
      continue;
    }
    if (cat && /^\| \[ \] \| /.test(r)) {
      const k = r.split('|').map((x) => x.trim());
      const naam = k[3];
      cat.oefeningen.push({ nr: k[2], naam: naam.replace(/^★\s*/, ''), ster: naam.startsWith('★'), uitleg: k[4], leeftijd: k[5], aantal: k[6], bron: k[7] });
    }
  }
  return { groepen, bronnen };
}

const aantalTekst = (a) => {
  const [s, k] = a.split('/').map((x) => Number(x.trim()));
  return `${s} ${s === 1 ? 'speler' : 'spelers'}, ${k} ${k === 1 ? 'keeper' : 'keepers'}`;
};
const GEBOUWD = { T12: 'veld-tq-kruis-opendraaien', P1: 'veld-pt-ruit-derde-man', A1: 'veld-af-schot-rebound-intikken', V1: 'veld-vo-kantelen-blok', KL1: 'keeper-ld-zit-sta-duik' };

function oefeningenPagina() {
  const { groepen, bronnen } = leesVoorstel();
  const totaal = groepen.reduce((s, g) => s + g.categorieen.reduce((t, c) => t + c.oefeningen.length, 0), 0);
  if (totaal < 150) throw new Error(`voorstel: maar ${totaal} oefeningen gevonden`);
  const navigatie = groepen.map((g) => `<p><b>${esc(g.naam)}:</b> ${g.categorieen.map((c, i) => `<a href="#${esc(g.naam)}-${i}">${esc(c.naam)}</a>`).join(' · ')}</p>`).join('');
  const lijsten = groepen
    .map(
      (g) =>
        `<h2>${esc(g.naam)}</h2>` +
        g.categorieen
          .map(
            (c, i) => `<section class="cat" id="${esc(g.naam)}-${i}" data-groep="${esc(g.naam)}" data-cat="${esc(c.naam)}">
<h3>${esc(c.naam)} <span class="zacht teller-cat"></span></h3>
${c.oefeningen
  .map(
    (o) => `<label class="oef" data-nr="${esc(o.nr)}" data-naam="${esc(o.naam)}">
<input type="checkbox" value="${esc(o.nr)}">
<span class="oef-tekst"><span class="oef-kop"><b>${esc(o.nr)}</b> ${esc(o.naam)}${o.ster ? ` <span class="label">staat al in de voorbeeldversie</span>` : ''}</span>
<span class="oef-uitleg">${esc(o.uitleg)}</span>
<span class="zacht oef-info">${esc(o.leeftijd)} · ${esc(aantalTekst(o.aantal))} · ${esc(o.bron)}${GEBOUWD[o.nr] ? ` · <a href="${APP}#/oefening/${GEBOUWD[o.nr]}">bekijk de animatie</a>` : ''}</span></span>
</label>`,
  )
  .join('\n')}
</section>`,
          )
          .join('\n'),
    )
    .join('\n');
  const inhoud = `
<div class="kaart"><p style="margin:0">Vink aan wat je wilt hebben. Je vinkjes blijven op dit toestel bewaard (ook als je de pagina sluit). Met <b>Kopieer lijst</b> zet je de aangevinkte oefeningen per categorie op het klembord, zodat je ze in een bericht kunt plakken.</p>
<p class="zacht" style="margin:8px 0 0">${totaal} oefeningen. De vijf met het label “staat al in de voorbeeldversie” kun je in de app al bekijken.</p></div>
<div class="kaart filters"><label><input type="checkbox" id="alleen"> Alleen aangevinkte tonen</label> <button class="knop licht" id="alles-uit" type="button">Alle vinkjes weg</button></div>
<div class="kaart">${navigatie}</div>
${lijsten}
<h2>Inspiratiebronnen</h2>
<div class="kaart"><p class="zacht" style="margin-top:0">De bron is de site of het document waar ik dit soort oefening tegenkwam. Naam, uitwerking en tekst zijn van mij; er staan geen namen van bronnen in de app.</p>
<table>${bronnen.map(([a, b]) => `<tr><td><b>${esc(a)}</b></td><td>${esc(b)}</td></tr>`).join('')}</table></div>
<div class="balk"><span id="teller">0 aangevinkt</span><button class="knop" id="kopieer" type="button">Kopieer lijst</button></div>
<textarea id="tekst" readonly aria-hidden="true" tabindex="-1"></textarea>
<style>
.oef{display:flex;gap:12px;align-items:flex-start;background:var(--kaart);border:1px solid var(--lijn);border-radius:12px;padding:12px;margin:8px 0;cursor:pointer}
.oef input{width:24px;height:24px;margin:2px 0 0;flex:none;accent-color:var(--groen)}
.oef.aan{border-color:var(--groen);box-shadow:inset 0 0 0 1px var(--groen)}
.oef-tekst{display:grid;gap:3px;min-width:0}
.oef-uitleg{font-size:.92rem}
.filters{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}
.filters label{display:flex;gap:8px;align-items:center}
.filters input{width:22px;height:22px;accent-color:var(--groen)}
body.alleen .oef:not(.aan),body.alleen .cat.leeg{display:none}
.balk{position:fixed;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:var(--kaart);border-top:1px solid var(--lijn);box-shadow:0 -6px 20px rgb(0 0 0/.08);z-index:6}
#teller{font-weight:700}
#tekst{position:fixed;left:-9999px;top:0;width:1px;height:1px}
</style>`;
  const script = `
const SLEUTEL='fase1.vinkjes';
let vink=new Set();try{vink=new Set(JSON.parse(localStorage.getItem(SLEUTEL)||'[]'))}catch{}
const vakjes=[...document.querySelectorAll('.oef input')];
function bewaar(){try{localStorage.setItem(SLEUTEL,JSON.stringify([...vink]))}catch{}}
function teken(){
  for(const v of vakjes){v.checked=vink.has(v.value);v.closest('.oef').classList.toggle('aan',v.checked)}
  for(const s of document.querySelectorAll('.cat')){const n=s.querySelectorAll('.oef.aan').length;s.querySelector('.teller-cat').textContent=n?'('+n+' aangevinkt)':'';s.classList.toggle('leeg',!n)}
  document.getElementById('teller').textContent=vink.size+' aangevinkt';
}
for(const v of vakjes)v.addEventListener('change',()=>{v.checked?vink.add(v.value):vink.delete(v.value);bewaar();teken()});
document.getElementById('alleen').addEventListener('change',(e)=>document.body.classList.toggle('alleen',e.target.checked));
document.getElementById('alles-uit').addEventListener('click',()=>{if(!vink.size||confirm('Alle vinkjes weghalen?')){vink.clear();bewaar();teken()}});
function lijst(){
  const uit=[];let groep='';
  for(const s of document.querySelectorAll('.cat')){
    const aan=[...s.querySelectorAll('.oef.aan')];if(!aan.length)continue;
    if(s.dataset.groep!==groep){groep=s.dataset.groep;uit.push((uit.length?'\\n':'')+groep.toUpperCase())}
    uit.push(s.dataset.cat+':');for(const o of aan)uit.push('- '+o.dataset.nr+' '+o.dataset.naam);
  }
  return 'Gekozen oefeningen ('+vink.size+')\\n\\n'+uit.join('\\n');
}
document.getElementById('kopieer').addEventListener('click',async()=>{
  const knop=document.getElementById('kopieer');
  if(!vink.size){knop.textContent='Nog niets aangevinkt';setTimeout(()=>knop.textContent='Kopieer lijst',1600);return}
  const t=lijst();let gelukt=false;
  try{await navigator.clipboard.writeText(t);gelukt=true}catch{}
  if(!gelukt){const v=document.getElementById('tekst');v.value=t;v.removeAttribute('aria-hidden');v.focus();v.select();v.setSelectionRange(0,t.length);try{gelukt=document.execCommand('copy')}catch{}v.setAttribute('aria-hidden','true')}
  knop.textContent=gelukt?'Gekopieerd ✓':'Kopiëren lukte niet';setTimeout(()=>knop.textContent='Kopieer lijst',1800);
  window.__laatsteLijst=t;
});
teken();`;
  return pagina('Voorstel nieuwe oefeningen', `${totaal} oefeningen · <a href="./">terug naar het overzicht</a>`, inhoud, script);
}

// ---------- rugnummers en Realistisch ----------
const TWIJFEL = {
  '11v11 1-4-3-3':
    'Twijfel: de 10 staat vóór de 6 en de 8 (middenveld met de punt naar voren). In 14 van de 25 voorbeeldtactieken speelt het middenveld juist met de punt naar achteren en staat de 8 rechts van de 10.',
  '11v11 1-3-4-3':
    'Twijfel: een ruit op het middenveld met de 4 als controleur voor de verdediging, 8 links, 6 rechts en 10 achter de spits. Alternatief: de 6 voor de verdediging en 4 als derde centrale verdediger.',
  '11v11 1-4-4-2': 'Twijfel: twee spitsen als 10 en 9, omdat 7 en 11 al op de flanken van het middenveld staan.',
  '8v8 1-2-3-2': 'Twijfel: twee verdedigers zijn 4 en 3 (de centrale verdedigers), niet 2 en 5; twee spitsen zijn 10 en 9.',
  '8v8 1-3-2-2': 'Twijfel: twee voorste spelers als buitenspelers 11 en 7, niet als spitsen 10 en 9.',
  '6v6 1-2-1-2': 'Twijfel: de enige middenvelder is 6 (niet 10); voorin 11 en 7.',
  '6v6 1-3-2': 'Twijfel: twee voorste spelers als 11 en 7.',
  '4v4 1-2-1': 'Twijfel: zonder keeper; de enige verdediger is 3.',
  '4v4 2-2': 'Twijfel: zonder keeper; achterin 4 en 3, voorin 11 en 7.',
};

function veldje(vorm, formatie) {
  const plekken = formatiePlekken(vorm, formatie);
  const B = 140;
  const H = 190;
  const p = (x, y) => [10 + x * (B - 20), 8 + y * (H - 16)];
  const stippen = plekken
    .map((pl) => {
      const [x, y] = p(pl.x, pl.y);
      const keeper = pl.nummer === 1 && vorm !== '4v4';
      return `<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10.5" fill="${keeper ? '#1aa3b8' : '#d93636'}" stroke="#fff" stroke-width="1.6"/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">${pl.nummer}</text></g>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${B} ${H}" width="${B}" height="${H}" role="img" aria-label="${esc(`${vorm} ${formatie}`)}">
<rect x="0" y="0" width="${B}" height="${H}" rx="8" fill="#2f8f4a"/>
<g fill="none" stroke="rgb(255 255 255/.7)" stroke-width="1.2"><rect x="6" y="5" width="${B - 12}" height="${H - 10}" rx="2"/><line x1="6" y1="5" x2="${B - 6}" y2="5"/><rect x="${B / 2 - 30}" y="${H - 34}" width="60" height="29"/><path d="M ${B / 2 - 22} 5 a 22 22 0 0 0 44 0"/></g>
${stippen}</svg>`;
}

function nummersPagina() {
  const rijen = SPELVORMEN.slice()
    .reverse()
    .map(
      (s) => `<h3>${esc(s.naam)}${s.keeper ? '' : ' <span class="zacht">(zonder keeper)</span>'}</h3>
<div class="veldjes">${s.formaties
        .map((f) => {
          const twijfel = TWIJFEL[`${s.id} ${f}`];
          return `<figure class="kaart veld${twijfel ? ' met-twijfel' : ''}">${veldje(s.id, f)}<figcaption><b>${esc(f)}</b>${twijfel ? `<span class="twijfel zacht">${esc(twijfel)}</span>` : ''}</figcaption></figure>`;
        })
        .join('')}</div>`,
    )
    .join('');

  const inhoud = `
<div class="kaart"><p style="margin:0">Het eigen doel is onderaan. Links op het veldje is de linkerkant van het team. Deze veldjes zijn rechtstreeks getekend uit de app, dus zo staan de nummers ook in de opstelling en op het tactiekbord van de voorbeeldversie.</p></div>
<h2>Het systeem</h2>
<div class="kaart"><table>
<tr><td><b>1</b></td><td>keeper</td><td><b>6</b></td><td>controlerende middenvelder rechts</td></tr>
<tr><td><b>2</b></td><td>rechtsback</td><td><b>8</b></td><td>controlerende middenvelder links</td></tr>
<tr><td><b>3</b></td><td>rechter centrale verdediger</td><td><b>10</b></td><td>aanvallende middenvelder</td></tr>
<tr><td><b>4</b></td><td>linker centrale verdediger</td><td><b>7</b></td><td>rechtsbuiten</td></tr>
<tr><td><b>5</b></td><td>linksback</td><td><b>11</b></td><td>linksbuiten</td></tr>
<tr><td></td><td></td><td><b>9</b></td><td>spits</td></tr></table>
<p class="zacht">Bij minder spelers: drie verdedigers zijn 5, 3 en 2; twee verdedigers zijn 4 en 3; één verdediger is 3; één middenvelder is 6; twee voorste spelers zijn 11 en 7, of 10 en 9 als 7 en 11 al op het middenveld staan.</p></div>

<h2>Per formatie</h2>
<p class="zacht">Formaties met een gele streep zijn twijfelgevallen: kijk daar even goed naar.</p>
${rijen}

<h2>Twijfelgevallen op een rij</h2>
<div class="kaart"><ol>
<li><b>1-4-3-3:</b> de 10 vóór de 6 en de 8 (punt naar voren)?</li>
<li><b>Voorbeeldtactieken:</b> in 14 van de 25 borden staat de 8 rechts van de 10 (punt naar achteren). Alleen de nummers 8 en 10 omwisselen (snel, de tekening blijft gelijk), of de borden ombouwen naar de punt naar voren (meer werk, de tactiek verandert een beetje)?</li>
<li><b>1-3-4-3 met een ruit:</b> de 4 als controleur voor de verdediging, of de 6?</li>
<li><b>Twee spitsen:</b> 10 en 9 (zoals nu bij 1-4-4-2 en 8 tegen 8 1-2-3-2) of 9 en 11?</li>
<li><b>Twee voorste spelers bij 6 tegen 6 en 8 tegen 8 1-3-2-2:</b> als buitenspelers 11 en 7, of als 10 en 9?</li>
<li><b>Eén verdediger</b> (4 tegen 4): 3, of liever 4?</li>
<li><b>Spelhervattingen op een half veld:</b> die loop ik in fase 2 één voor één na.</li>
</ol></div>

<h2>Realistische 3D-animaties: de conclusie</h2>
<div class="kaart"><p style="margin-top:0"><b>Volledig realistische animaties met echte bewegingsopnames voor alle oefeningen zijn nu niet haalbaar binnen je eisen.</b></p>
<ol>
<li>Er bestaan geen vrij te gebruiken opnames van voetbalbewegingen: juist schieten, duiken, vangen en koppen ontbreken.</li>
<li>Een opname is een vast filmpje. Onze oefeningen vragen dat een speler op een precies moment op een precieze plek de bal raakt of vangt; dat lukt nu omdat elke beweging wordt uitgerekend.</li>
<li>De app heeft ruim dertig soorten acties in ruim 340 oefeningen. Die moeten allemaal blijven werken.</li>
<li>Figuren en bewegingen samen zijn al snel 1,5 tot 3 MB extra op een app van 3,5 MB, en 22 zware figuren zijn te veel voor een gemiddelde telefoon.</li>
</ol>
<p><b>Wel haalbaar, in drie stappen:</b></p>
<ul>
<li><b>R1 – Licht, schaduw, gras en lucht</b> op de huidige poppetjes. Dit is de schakelaar <b>Realistisch (proef)</b> bij elke oefening in 3D. Er is niets voor gedownload.</li>
<li><b>R2 – Een realistischer figuur</b> (één vloeiend lichaam met shirt, broek, sokken en schoenen) op het bestaande skelet. De beweging blijft uitgerekend, dus alle oefeningen blijven werken. Geschat 150 tot 300 kB extra.</li>
<li><b>R3 – Echte loopbewegingen</b> (wandelen, joggen, sprinten, zijwaarts, achteruit) uit een vrije bibliotheek (CC0), gemengd op het figuur van R2. Balacties blijven uitgerekend. Geschat 100 tot 250 kB extra.</li>
</ul>
<p class="zacht">Voor R2 en R3 wil ik vrije CC0-bestanden downloaden. Dat doe ik pas als jij het goed vindt.</p></div>

<h3>Wat ik onderzocht heb</h3>
<div class="kaart"><table>
<tr><th>Bron</th><th>Licentie</th><th>Bruikbaar?</th></tr>
<tr><td>Vrije bibliotheek met 250+ algemene bewegingen (lopen in acht richtingen, joggen, sprinten, zitten)</td><td>CC0, vrij, ook commercieel</td><td>Ja, voor lopen. Geen voetbalbewegingen.</td></tr>
<tr><td>Vrije basisfiguren op hetzelfde skelet (± 13.000 driehoeken)</td><td>CC0</td><td>Ja, maar eerst veel lichter maken.</td></tr>
<tr><td>Grote commerciële animatiedienst met voetbalbewegingen</td><td>Eigen voorwaarden: losse bestanden verspreiden mag niet</td><td>Nee: geen vrije licentie, en onze code staat openbaar.</td></tr>
<tr><td>Universitaire database met bewegingsopnames</td><td>Eigen tekst, niet uit de eerste hand te controleren; een veelgebruikte omzetting is niet-commercieel</td><td>Twijfel, en veel omzetwerk.</td></tr>
<tr><td>Voetbalopnames uit wetenschappelijk onderzoek</td><td>Meestal niet vrijgegeven</td><td>Nee.</td></tr>
</table></div>

<h3>Metingen van de proef (telefoonformaat)</h3>
<div class="kaart"><table>
<tr><th>Scène</th><th>Beelden per seconde</th><th>Rekenwerk per beeld</th><th>4× tragere processor</th></tr>
<tr><td>Loopvorm</td><td>60 → 60</td><td>3,0 → 6,6 ms</td><td>30 → 30</td></tr>
<tr><td>Afwerkvorm met keeper</td><td>60 → 60</td><td>5,2 → 8,0 ms</td><td>30 → 30</td></tr>
<tr><td>Partijvorm 4 tegen 4</td><td>60 → 60</td><td>5,9 → 8,5 ms</td><td>30 → 30</td></tr>
<tr><td>11 tegen 11</td><td>60 → 60</td><td>6,0 → 11,0 ms</td><td>30 → 30 (traagste beelden 29 → 20)</td></tr>
</table>
<p class="zacht">De app wordt 2,2 kB groter; geen extra laadtijd. Gemeten op een laptop met een vertraagde processor: de videokaart van een telefoon kan ik zo niet nabootsen, en schaduwen kosten juist daar rekenkracht. Probeer het dus op je eigen telefoon. Met Eenvoudige poppetjes staat de proef uit.</p></div>

<h3>Zelf vergelijken</h3>
<div class="kaart"><p style="margin-top:0">Open een oefening, kies 3D en tik op <b>Realistisch (proef)</b> om aan en uit te wisselen:</p>
<p><a class="knop licht" href="${APP}#/oefening/veld-wu-loopscholing">Loopvorm</a> <a class="knop licht" href="${APP}#/oefening/veld-af-schot-rebound-intikken">Afwerkvorm met keeper</a> <a class="knop licht" href="${APP}#/oefening/veld-pv-4-4-keepers">Partijvorm</a></p>
<p class="zacht">Kies bij de afwerkvorm ook de camera Achter goal: daar zie je de schaduwen en het gras het best. Zie je eerst het installatiescherm, kies dan “Gewoon in de browser gebruiken”.</p></div>
<style>
.veldjes{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
.veld{margin:0;padding:10px;display:grid;gap:6px;justify-items:center;align-content:start}
.veld svg{max-width:100%;height:auto}
.veld figcaption{display:grid;gap:4px;width:100%;text-align:center}
.veld .twijfel{text-align:left;font-size:.8rem}
.met-twijfel{border-color:var(--geel);box-shadow:inset 0 0 0 1px var(--geel)}
</style>`;
  return pagina('Rugnummers en Realistisch', '<a href="./">terug naar het overzicht</a>', inhoud);
}

function overzicht() {
  const inhoud = `
<div class="kaart"><p style="margin-top:0">Dit zijn de pagina's bij fase 1 van de volgende stap. Ze horen bij de voorbeeldversie en komen niet in de echte app.</p>
<p><a class="knop" href="oefeningen.html">Voorstel nieuwe oefeningen</a></p>
<p class="zacht">157 oefeningen per categorie, met vinkjes en een knop om je keuze als lijst te kopiëren.</p>
<p><a class="knop" href="nummers.html">Rugnummers en Realistisch</a></p>
<p class="zacht">De nummers per formatie getekend op een veldje, de twijfelgevallen, en de conclusie over realistische animaties met de metingen.</p>
<p><a class="knop licht" href="${APP}">Naar de voorbeeldversie van de app</a></p></div>`;
  return pagina('Fase 1: bekijken en kiezen', 'TopTraining voorbeeld', inhoud);
}

fs.mkdirSync(uit, { recursive: true });
fs.writeFileSync(path.join(uit, 'index.html'), overzicht());
fs.writeFileSync(path.join(uit, 'oefeningen.html'), oefeningenPagina());
fs.writeFileSync(path.join(uit, 'nummers.html'), nummersPagina());
console.log("Pagina's gemaakt in voorbeeld/fase1 (overzicht, oefeningen, nummers).");
