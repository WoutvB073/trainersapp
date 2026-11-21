// Doorstuurpagina op het oude adres https://woutvb073.github.io/trainersapp/ (0.39.0). Stuurt elke link door naar
// https://app.toptrainerapp.com/ met het pad en de #… erbij, en neemt de gegevens van dit toestel mee (pakket.js).
// In de oude, geïnstalleerde app: eerst de melding "TopTrainer is verhuisd" met uitleg. In een gewone browser: meteen door.
// De instellingen (doel, Firebase) zet tools/verhuis/bouw.mjs in instellingen.js.
import { VERHUIS } from './instellingen.js';
import { verzamel, zetKlaar } from './pakket.js';

const opslag = (() => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
})();

const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const ua = navigator.userAgent;
const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
const android = /Android/.test(ua);

const taalKeuze = opslag?.getItem('trainersapp.taal');
const taal = taalKeuze === 'en' || (taalKeuze !== 'nl' && !/^nl\b/i.test(navigator.language || '')) ? 'en' : 'nl';
document.documentElement.lang = taal;

/** Het nieuwe adres met het pad na /trainersapp/ en de zoekterm. */
const rest = location.pathname.replace(/^.*?\/trainersapp(\/|$)/, '').replace(/^index\.html$|^404\.html$/, '');
const basis = VERHUIS.doel + rest + location.search;
const hash = location.hash.replace(/^#/, '');
const zonderGegevens = basis + location.hash;

const TEKST = {
  nl: {
    titel: 'TopTrainer is verhuisd',
    even: 'TopTraining heet nu TopTrainer en staat op een nieuw adres. Even geduld…',
    uitleg:
      'TopTraining heet nu <b>TopTrainer</b> en staat op een nieuw adres: <b>app.toptrainerapp.com</b>. Deze app op je beginscherm wordt niet meer bijgewerkt. Zet de nieuwe app erop; je gegevens gaan vanzelf mee.',
    open: 'Open TopTrainer',
    openSafari: 'Open TopTrainer in Safari',
    ios: [
      'Tik hierboven op <b>Open TopTrainer in Safari</b>. Opent hij in een venster binnen deze app? Tik dan rechtsonder op het Safari-kompas.',
      'Tik in Safari op <b>Deel</b> (soms eerst op de drie puntjes) en kies <b>Zet op beginscherm</b>.',
      'Open TopTrainer via het nieuwe icoon. Je gegevens staan erin. Was je ingelogd? Log dan één keer opnieuw in.',
      'Verwijder daarna deze oude app: houd het icoon ingedrukt en kies <b>Verwijder app</b>.',
    ],
    android: [
      'Tik hierboven op <b>Open TopTrainer</b>.',
      'Tik in de browser op <b>Installeren</b>, of op het menu (drie puntjes) en dan <b>App installeren</b> of <b>Toevoegen aan startscherm</b>.',
      'Open TopTrainer via het nieuwe icoon. Je gegevens staan erin. Was je ingelogd? Log dan één keer opnieuw in.',
      'Verwijder daarna deze oude app: houd het icoon ingedrukt en kies <b>Verwijderen</b> (of <b>App-info</b> → <b>Verwijderen</b>).',
    ],
    computer: [
      'Klik hierboven op <b>Open TopTrainer</b>.',
      'Installeer de app via het installatie-icoon rechts in de adresbalk (of via het menu).',
      'Was je ingelogd? Log dan één keer opnieuw in. Je gegevens staan erin.',
      'Verwijder daarna deze oude app (in Chrome of Edge: menu van de app → <b>TopTraining verwijderen</b>).',
    ],
    stappen: 'Zo zet je TopTrainer op je telefoon',
    fout: 'Je gegevens overzetten lukt nu niet. Heb je internet? Probeer het opnieuw. Je gegevens blijven hier bewaard tot het lukt.',
    opnieuw: 'Opnieuw proberen',
    zonder: 'Doorgaan zonder mijn gegevens',
    klaar: 'Je gegevens staan klaar voor de nieuwe app (30 dagen).',
  },
  en: {
    titel: 'TopTrainer has moved',
    even: 'TopTraining is now called TopTrainer and has a new address. One moment…',
    uitleg:
      "TopTraining is now called <b>TopTrainer</b> and has a new address: <b>app.toptrainerapp.com</b>. This app on your home screen won't be updated any more. Add the new app; your data comes along automatically.",
    open: 'Open TopTrainer',
    openSafari: 'Open TopTrainer in Safari',
    ios: [
      'Tap <b>Open TopTrainer in Safari</b> above. If it opens in a window inside this app, tap the Safari compass at the bottom right.',
      'In Safari, tap <b>Share</b> (sometimes after the three dots) and choose <b>Add to Home Screen</b>.',
      'Open TopTrainer from the new icon. Your data is there. Were you logged in? Then log in once more.',
      'Then delete this old app: press and hold the icon and choose <b>Remove App</b>.',
    ],
    android: [
      'Tap <b>Open TopTrainer</b> above.',
      'In the browser, tap <b>Install</b>, or the menu (three dots) and then <b>Install app</b> or <b>Add to Home screen</b>.',
      'Open TopTrainer from the new icon. Your data is there. Were you logged in? Then log in once more.',
      'Then delete this old app: press and hold the icon and choose <b>Uninstall</b> (or <b>App info</b> → <b>Uninstall</b>).',
    ],
    computer: [
      'Click <b>Open TopTrainer</b> above.',
      'Install the app with the install icon on the right of the address bar (or from the menu).',
      'Were you logged in? Then log in once more. Your data is there.',
      "Then remove this old app (in Chrome or Edge: the app's menu → <b>Uninstall TopTraining</b>).",
    ],
    stappen: 'How to put TopTrainer on your phone',
    fout: "Moving your data isn't working right now. Are you online? Please try again. Your data stays here until it works.",
    opnieuw: 'Try again',
    zonder: 'Continue without my data',
    klaar: 'Your data is ready for the new app (30 days).',
  },
}[taal];

const $ = (id) => document.getElementById(id);

function toon(html) {
  $('inhoud').innerHTML = html;
}

/** Het nieuwe adres met de verhuiscode; de link die je wilde openen gaat erachter mee. */
function doelMet(code) {
  return `${basis}#/verhuis/${code}${hash && hash !== '/' ? `?naar=${encodeURIComponent(hash)}` : ''}`;
}

/** Safari openen vanuit de app op het beginscherm (iOS 17+); anders gewoon de link. */
const inSafari = (url) => `x-safari-${url}`;

function verhuisdScherm(doel) {
  const stappen = ios ? TEKST.ios : android ? TEKST.android : TEKST.computer;
  toon(`
    <h1>${TEKST.titel}</h1>
    <p>${TEKST.uitleg}</p>
    ${ios ? `<a class="knop" id="open" href="${inSafari(doel)}">${TEKST.openSafari}</a><a class="link" href="${doel}">${TEKST.open}</a>` : `<a class="knop" id="open" href="${doel}">${TEKST.open}</a>`}
    <h2>${TEKST.stappen}</h2>
    <ol>${stappen.map((s) => `<li>${s}</li>`).join('')}</ol>`);
}

function foutScherm() {
  toon(`
    <h1>${TEKST.titel}</h1>
    <p class="fout" role="alert">${TEKST.fout}</p>
    <button class="knop" id="opnieuw">${TEKST.opnieuw}</button>
    <a class="link" href="${zonderGegevens}">${TEKST.zonder}</a>`);
  $('opnieuw').addEventListener('click', () => void start());
}

/** Bestaande code hergebruiken als de gegevens niet veranderd zijn en hij nog minstens een dag geldig is. */
async function code(gegevens) {
  const tekst = JSON.stringify(gegevens);
  const bytes = new TextEncoder().encode(tekst);
  const vinger = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('');
  try {
    const oud = JSON.parse(opslag?.getItem('trainersapp.verhuisd') ?? 'null');
    if (oud && oud.vinger === vinger && oud.tot > Date.now() + 86400000 && typeof oud.code === 'string') return oud.code;
  } catch {
    /* opnieuw */
  }
  const k = await zetKlaar(gegevens, VERHUIS.firebase);
  try {
    opslag?.setItem('trainersapp.verhuisd', JSON.stringify({ code: k.code, tot: k.tot, vinger }));
  } catch {
    /* niet erg */
  }
  return k.code;
}

async function start() {
  toon(`<h1>${TEKST.titel}</h1><p>${TEKST.even}</p>`);
  const gegevens = opslag ? verzamel(opslag) : {};
  if (!Object.keys(gegevens).length) {
    if (standalone) verhuisdScherm(zonderGegevens);
    else location.replace(zonderGegevens);
    return;
  }
  let c;
  try {
    c = await code(gegevens);
  } catch {
    foutScherm();
    return;
  }
  if (standalone) verhuisdScherm(doelMet(c));
  else location.replace(doelMet(c));
}

void start();
