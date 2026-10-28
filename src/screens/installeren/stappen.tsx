import type { ReactNode } from 'react';
import type { Omgeving } from '../../engine/platform';
import type { IcoonNaam } from '../../components/Icoon';
import { t } from '../../i18n/t';
import { zin } from '../../i18n/zin';

export { zin };

/**
 * Installatie-uitleg per toestel en browser (0.29.1). Elke combinatie heeft een sleutel; `sleutelVoor` kiest hem uit de
 * omgeving, `uitlegVoor` geeft de stappen (met de knopnamen zoals ze in die browser heten), `alternatieven` de andere
 * mogelijke stappen voor hetzelfde toestel ("Lukt het niet?") en `HANDMATIG` alle keuzes voor "Andere browser of telefoon".
 * Puur, getest in tests/installeren.test.ts.
 */

export interface Stap {
  icoon: IcoonNaam;
  tekst: ReactNode;
}

export interface Uitleg {
  titel: string;
  /** Korte uitleg vóór de stappen. */
  intro?: ReactNode;
  stappen: Stap[];
  /** Eigen "Installeren"-knop tonen als de browser dat toestaat (Chrome/Edge en andere Chromium-browsers). */
  installeerKnop?: boolean;
  /** Knop "Kopieer link". */
  kopieerLink?: boolean;
  /** Android: knop "Openen in Chrome" (intent-link). */
  openInChrome?: boolean;
  /** Wijzende pijl naar de knop in de browserbalk (buiten de pagina). */
  pijl?: 'onder-midden' | 'onder-rechts' | 'boven-rechts';
  tip?: ReactNode;
}

export type Sleutel =
  | 'ios-safari-26'
  | 'ios-safari'
  | 'ios-chrome'
  | 'ios-edge'
  | 'ios-firefox'
  | 'ios-anders'
  | 'ios-oud'
  | 'android-chrome'
  | 'android-samsung'
  | 'android-firefox'
  | 'android-edge'
  | 'android-opera'
  | 'android-xiaomi'
  | 'android-huawei'
  | 'android-anders'
  | 'inapp-ios'
  | 'inapp-android'
  | 'computer-chrome'
  | 'computer-edge'
  | 'computer-safari'
  | 'computer-firefox'
  | 'computer-anders'
  | 'onbekend';

const OPEN_APP: Stap = { icoon: 'huis', tekst: zin('Open {app} voortaan via het nieuwe icoon.') };
const VOEG_TOE: Stap = { icoon: 'plus', tekst: zin('Tik rechtsboven op **Voeg toe**.') };
const ZET_OP_BEGINSCHERM: Stap = { icoon: 'plusVierkant', tekst: zin('Kies **Zet op beginscherm** (zie je het niet? Scroll omlaag).') };

/** Vanaf iOS 16.4 kan "Zet op beginscherm" ook in Chrome, Edge en Firefox (via Delen). */
const kanVanuitElkeBrowser = (o: Omgeving) => o.iosVersie === undefined || o.iosVersie >= 16.4;

/** De juiste uitleg voor dit toestel en deze browser. */
export function sleutelVoor(o: Omgeving, computer = false): Sleutel {
  if (o.browser === 'inapp') return o.os === 'android' ? 'inapp-android' : 'inapp-ios';
  if (computer || !o.mobiel) {
    if (o.browser === 'chrome' || o.browser === 'opera') return 'computer-chrome';
    if (o.browser === 'edge') return 'computer-edge';
    if (o.browser === 'safari') return 'computer-safari';
    if (o.browser === 'firefox') return 'computer-firefox';
    return 'computer-anders';
  }
  if (o.os === 'ios') {
    if (o.browser === 'safari') return (o.safariVersie ?? 0) >= 26 ? 'ios-safari-26' : 'ios-safari';
    if (!kanVanuitElkeBrowser(o)) return 'ios-oud';
    if (o.browser === 'chrome') return 'ios-chrome';
    if (o.browser === 'edge') return 'ios-edge';
    if (o.browser === 'firefox') return 'ios-firefox';
    return 'ios-anders';
  }
  if (o.os === 'android') {
    const m: Partial<Record<Omgeving['browser'], Sleutel>> = {
      chrome: 'android-chrome',
      samsung: 'android-samsung',
      firefox: 'android-firefox',
      edge: 'android-edge',
      opera: 'android-opera',
      xiaomi: 'android-xiaomi',
      huawei: 'android-huawei',
    };
    return m[o.browser] ?? 'android-anders';
  }
  return 'onbekend';
}

/** Menuknop en keuze om een link in de gewone browser te openen, per app (iOS en Android). Bij het laden vertaald. */
const APP_MENU: Record<string, { ios: [string, string]; android: [string, string] }> = {
  // 'kompas': de ingebouwde Safari-weergave met het kompas-icoon rechtsonder.
  WhatsApp: { ios: ['kompas', t('Openen in Safari')], android: ['⋮', t('Openen in Chrome')] },
  Instagram: { ios: ['•••', t('Openen in externe browser')], android: ['⋮', t('Openen in Chrome')] },
  Facebook: { ios: ['•••', t('Openen in externe browser')], android: ['⋮', t('Openen in externe browser')] },
  Messenger: { ios: ['•••', t('Openen in externe browser')], android: ['⋮', t('Openen in externe browser')] },
  Gmail: { ios: ['•••', t('Openen in browser')], android: ['⋮', t('Openen in Chrome')] },
  Outlook: { ios: ['•••', t('Openen in browser')], android: ['⋮', t('Openen in browser')] },
  LinkedIn: { ios: ['•••', t('Openen in browser')], android: ['⋮', t('Openen in browser')] },
  TikTok: { ios: ['•••', t('Openen in browser')], android: ['⋮', t('Openen in browser')] },
  Snapchat: { ios: ['•••', t('Openen in browser')], android: ['⋮', t('Openen in browser')] },
  Telegram: { ios: ['kompas', t('Openen in Safari')], android: ['⋮', t('Openen in Chrome')] },
  X: { ios: ['•••', t('Openen in Safari')], android: ['⋮', t('Openen in browser')] },
};

/** De stappen voor één combinatie. `o` vult de details in (iPad of iPhone, naam van de app). */
export function uitlegVoor(s: Sleutel, o: Omgeving): Uitleg {
  switch (s) {
    // ── iPhone / iPad ──
    case 'ios-safari-26':
      return {
        titel: t('Zet de app op je beginscherm'),
        stappen: [
          { icoon: 'meer', tekst: o.tablet ? zin('Tik rechtsboven op **•••**.') : zin('Tik rechtsonder op **•••**.') },
          { icoon: 'deel', tekst: zin('Tik op **Deel**.') },
          ZET_OP_BEGINSCHERM,
          { icoon: 'schakelaar', tekst: zin('Laat **Open als webapp** aan staan en tik op **Voeg toe**.') },
          OPEN_APP,
        ],
        pijl: o.tablet ? 'boven-rechts' : 'onder-rechts',
      };
    case 'ios-safari':
      return {
        titel: t('Zet de app op je beginscherm'),
        stappen: [{ icoon: 'deel', tekst: o.tablet ? zin('Tik rechtsboven op de **Deel**-knop.') : zin('Tik onderin op de **Deel**-knop.') }, ZET_OP_BEGINSCHERM, VOEG_TOE, OPEN_APP],
        pijl: o.tablet ? 'boven-rechts' : 'onder-midden',
      };
    case 'ios-chrome':
      return {
        titel: t('Zet de app op je beginscherm'),
        stappen: [{ icoon: 'deel', tekst: zin('Tik rechts in de adresbalk op de **Deel**-knop.') }, ZET_OP_BEGINSCHERM, VOEG_TOE, OPEN_APP],
        pijl: 'boven-rechts',
      };
    case 'ios-edge':
      return {
        titel: t('Zet de app op je beginscherm'),
        stappen: [
          { icoon: 'meer', tekst: o.tablet ? zin('Tik rechtsboven op **•••**.') : zin('Tik onderin op **•••**.') },
          { icoon: 'deel', tekst: zin('Tik op **Delen**.') },
          ZET_OP_BEGINSCHERM,
          VOEG_TOE,
          OPEN_APP,
        ],
        pijl: o.tablet ? 'boven-rechts' : 'onder-midden',
      };
    case 'ios-firefox':
      return {
        titel: t('Zet de app op je beginscherm'),
        stappen: [
          { icoon: 'menu', tekst: o.tablet ? zin('Tik rechtsboven op **☰**.') : zin('Tik rechtsonder op **☰**.') },
          { icoon: 'deel', tekst: zin('Tik op **Delen**.') },
          ZET_OP_BEGINSCHERM,
          VOEG_TOE,
          OPEN_APP,
        ],
        pijl: o.tablet ? 'boven-rechts' : 'onder-rechts',
      };
    case 'ios-anders':
      return {
        titel: t('Zet de app op je beginscherm'),
        intro: zin('Zoek in deze browser de **Deel**-knop (vaak in het menu) en kies daar **Zet op beginscherm**. Lukt dat niet, open deze pagina dan in **Safari**.'),
        stappen: [{ icoon: 'deel', tekst: zin('Tik op de **Deel**-knop of open het menu en kies **Delen**.') }, ZET_OP_BEGINSCHERM, VOEG_TOE, OPEN_APP],
        kopieerLink: true,
      };
    case 'ios-oud':
      return {
        titel: t('Open deze pagina in Safari'),
        intro: o.tablet ? zin('Op deze iPad zet je {app} op je beginscherm via **Safari**.') : zin('Op deze iPhone zet je {app} op je beginscherm via **Safari**.'),
        stappen: [
          { icoon: 'kopieer', tekst: zin('Tik hieronder op **Kopieer link**.') },
          { icoon: 'kompas', tekst: zin('Open de app **Safari**.') },
          { icoon: 'plusVierkant', tekst: zin('Tik op de adresbalk, kies **Plak en ga** en volg daar de stappen.') },
        ],
        kopieerLink: true,
      };

    // ── Android ──
    case 'android-chrome':
      return {
        titel: t('Zet de app op je startscherm'),
        stappen: [
          { icoon: 'puntjes', tekst: zin('Tik rechtsboven op **⋮**.') },
          { icoon: 'download', tekst: zin('Kies **App installeren** of **Toevoegen aan startscherm**.') },
          { icoon: 'vink', tekst: zin('Tik op **Installeren**.') },
          OPEN_APP,
        ],
        installeerKnop: true,
        pijl: 'boven-rechts',
      };
    case 'android-samsung':
      return {
        titel: t('Zet de app op je startscherm'),
        stappen: [
          { icoon: 'menu', tekst: o.tablet ? zin('Tik rechtsboven op **☰**.') : zin('Tik rechtsonder op **☰**.') },
          { icoon: 'plusVierkant', tekst: zin('Kies **Pagina toevoegen aan** en dan **Startscherm**.') },
          { icoon: 'vink', tekst: zin('Tik op **Toevoegen**.') },
          OPEN_APP,
        ],
        installeerKnop: true,
        pijl: o.tablet ? 'boven-rechts' : 'onder-rechts',
      };
    case 'android-firefox':
      return {
        titel: t('Zet de app op je startscherm'),
        stappen: [
          { icoon: 'puntjes', tekst: zin('Tik op **⋮** (rechtsboven of rechtsonder, naast de adresbalk).') },
          { icoon: 'download', tekst: zin('Kies **Installeren** of **Toevoegen aan startscherm**.') },
          { icoon: 'vink', tekst: zin('Tik op **Toevoegen**.') },
          OPEN_APP,
        ],
      };
    case 'android-edge':
      return {
        titel: t('Zet de app op je startscherm'),
        stappen: [
          { icoon: 'meer', tekst: o.tablet ? zin('Tik rechtsboven op **•••**.') : zin('Tik onderin op **•••**.') },
          { icoon: 'download', tekst: zin('Kies **Toevoegen aan telefoon** (of **App installeren**).') },
          { icoon: 'vink', tekst: zin('Tik op **Installeren**.') },
          OPEN_APP,
        ],
        installeerKnop: true,
        pijl: o.tablet ? 'boven-rechts' : 'onder-midden',
      };
    case 'android-opera':
      return {
        titel: t('Zet de app op je startscherm'),
        stappen: [
          { icoon: 'puntjes', tekst: zin('Open het menu van Opera (**⋮** of het **O**-logo).') },
          { icoon: 'plusVierkant', tekst: zin('Kies **Toevoegen aan** en dan **Startscherm**.') },
          { icoon: 'vink', tekst: zin('Tik op **Toevoegen**.') },
          OPEN_APP,
        ],
        installeerKnop: true,
      };
    case 'android-xiaomi':
    case 'android-huawei':
    case 'android-anders':
      return {
        titel: t('Zet de app op je startscherm'),
        intro:
          s === 'android-anders'
            ? zin('Installeren werkt het best in **Chrome**. Open deze pagina in Chrome, of gebruik het menu van deze browser:')
            : zin('Installeren werkt het best in **Chrome**. In deze browser kan het ook via het menu:'),
        stappen: [
          { icoon: 'menu', tekst: s === 'android-xiaomi' ? zin('Tik rechtsonder op **☰** (of je profiel).') : zin('Open het menu van je browser (**⋮** of **☰**).') },
          { icoon: 'plusVierkant', tekst: zin('Kies **Toevoegen aan startscherm** (of **Snelkoppeling toevoegen**).') },
          OPEN_APP,
        ],
        installeerKnop: true,
        openInChrome: true,
        kopieerLink: true,
      };

    // ── Ingebouwde browser van een app ──
    case 'inapp-ios':
    case 'inapp-android': {
      const ios = s === 'inapp-ios';
      const doel = ios ? 'Safari' : 'Chrome';
      const menu = o.appNaam ? APP_MENU[o.appNaam]?.[ios ? 'ios' : 'android'] : undefined;
      return {
        titel: t('Open deze pagina in {doel}', { doel }),
        intro: o.appNaam
          ? zin('Je bekijkt deze pagina in de browser van **{appNaam}**. Daar kun je {app} niet installeren.', { appNaam: o.appNaam })
          : zin('Je bekijkt deze pagina in de browser van een app. Daar kun je {app} niet installeren.'),
        stappen: [
          menu?.[0] === 'kompas'
            ? { icoon: 'kompas', tekst: zin('Tik rechtsonder op het kompas-icoon (of op **•••**).') }
            : menu
              ? { icoon: menu[0] === '⋮' ? 'puntjes' : 'meer', tekst: zin('Tik op **{knop}** (meestal rechtsboven).', { knop: menu[0] }) }
              : { icoon: ios ? 'meer' : 'puntjes', tekst: ios ? zin('Tik op **•••** of het kompas-icoon.') : zin('Tik rechtsboven op **⋮**.') },
          {
            icoon: menu?.[0] === 'kompas' ? 'deel' : 'kompas',
            tekst: menu ? zin('Kies **{keuze}**.', { keuze: menu[1] }) : ios ? zin('Kies **Open in Safari** (of **Open in browser**).') : zin('Kies **Openen in Chrome** (of **Openen in browser**).'),
          },
          {
            icoon: ios ? 'deel' : 'download',
            tekst: ios ? zin('In Safari zie je deze pagina weer, met de stappen om te installeren.') : zin('In Chrome zie je deze pagina weer, met de knop om te installeren.'),
          },
        ],
        kopieerLink: true,
        openInChrome: !ios,
        tip: zin('Lukt dat niet? Kopieer de link en plak hem in de adresbalk van {doel}.', { doel }),
      };
    }

    // ── Computer ──
    case 'computer-chrome':
    case 'computer-edge': {
      const chrome = s === 'computer-chrome';
      return {
        titel: t('Installeer de app op je computer'),
        stappen: [
          { icoon: 'computer', tekst: zin('Klik rechts in de **adresbalk** op het installatie-icoon.') },
          { icoon: 'vink', tekst: zin('Klik op **Installeren**. {app} opent in een eigen venster.') },
          chrome
            ? { icoon: 'puntjes', tekst: zin('Geen icoon? Menu **⋮** → **Casten, opslaan en delen** → **{app} installeren**.') }
            : { icoon: 'meer', tekst: zin('Geen icoon? Menu **•••** → **Apps** → **{app} installeren**.') },
        ],
        installeerKnop: true,
      };
    }
    case 'computer-safari':
      return {
        titel: t('Zet de app in je Dock'),
        stappen: [
          { icoon: 'browser', tekst: zin('Kies in de menubalk **Archief** → **Voeg toe aan Dock**.') },
          { icoon: 'vink', tekst: zin('Klik op **Voeg toe**. {app} staat nu in je Dock.') },
        ],
      };
    case 'computer-firefox':
      return {
        titel: t('Gewoon in de browser gebruiken'),
        intro: zin('Firefox kan {app} niet als app installeren. Gebruik hem gewoon in de browser (met een bladwijzer), of open deze pagina in **Chrome** of **Edge** om hem te installeren.'),
        stappen: [{ icoon: 'ster', tekst: zin('Maak een bladwijzer met **Ctrl+D** (Mac: **Cmd+D**).') }],
        kopieerLink: true,
      };
    case 'computer-anders':
      return {
        titel: t('Installeren via Chrome of Edge'),
        intro: zin('Deze browser kan {app} niet als app installeren. Open deze pagina in **Chrome** of **Edge**, of gebruik hem gewoon in de browser.'),
        stappen: [],
        kopieerLink: true,
      };

    // ── Onbekend toestel ──
    case 'onbekend':
      return {
        titel: t('Zet de app op je beginscherm'),
        intro: zin('Zoek in het menu van je browser naar **Toevoegen aan beginscherm** of **App installeren**.'),
        stappen: [{ icoon: 'menu', tekst: zin('Open het menu van je browser.') }, { icoon: 'plusVierkant', tekst: zin('Kies **App installeren** of **Toevoegen aan beginscherm**.') }, OPEN_APP],
        installeerKnop: true,
        kopieerLink: true,
      };
  }
}

/** "Lukt het niet?": de andere mogelijke stappen voor hetzelfde toestel (andere menunamen of een andere weg). */
export function alternatieven(s: Sleutel, o: Omgeving): Uitleg[] {
  const andere = (titel: string, stappen: Stap[], extra: Partial<Uitleg> = {}): Uitleg => ({ titel, stappen, ...extra });
  switch (s) {
    case 'ios-safari-26':
      return [
        andere(t('Deel-knop direct in beeld?'), [{ icoon: 'deel', tekst: zin('Tik op de **Deel**-knop (vierkantje met pijl omhoog).') }, ZET_OP_BEGINSCHERM, VOEG_TOE]),
        andere(t('Zie je Zet op beginscherm niet?'), [
          { icoon: 'deel', tekst: zin('Scroll in het deelmenu helemaal omlaag en tik op **Wijzig handelingen**.') },
          { icoon: 'plus', tekst: zin('Zet **Zet op beginscherm** aan en probeer het opnieuw.') },
        ]),
      ];
    case 'ios-safari':
      return [
        andere(t('Andere indeling van Safari?'), [
          { icoon: 'meer', tekst: zin('Tik op **•••** naast de adresbalk.') },
          { icoon: 'deel', tekst: zin('Tik op **Deel**.') },
          ZET_OP_BEGINSCHERM,
          VOEG_TOE,
        ]),
        andere(t('Zie je Zet op beginscherm niet?'), [
          { icoon: 'deel', tekst: zin('Scroll in het deelmenu helemaal omlaag en tik op **Wijzig handelingen**.') },
          { icoon: 'plus', tekst: zin('Zet **Zet op beginscherm** aan en probeer het opnieuw.') },
        ]),
      ];
    case 'ios-chrome':
      return [
        andere(t('Geen Deel-knop in de adresbalk?'), [{ icoon: 'meer', tekst: zin('Tik rechtsonder op **•••**.') }, { icoon: 'deel', tekst: zin('Tik op **Delen**.') }, ZET_OP_BEGINSCHERM, VOEG_TOE]),
        uitlegVoor('ios-oud', o),
      ];
    case 'ios-edge':
    case 'ios-firefox':
    case 'ios-anders':
      return [andere(t('Deel-knop in de adresbalk?'), [{ icoon: 'deel', tekst: zin('Tik op de **Deel**-knop in of naast de adresbalk.') }, ZET_OP_BEGINSCHERM, VOEG_TOE]), uitlegVoor('ios-oud', o)];
    case 'android-chrome':
      return [
        andere(t('Zie je App installeren niet?'), [
          { icoon: 'puntjes', tekst: zin('Tik rechtsboven op **⋮**.') },
          { icoon: 'plusVierkant', tekst: zin('Kies **Toevoegen aan startscherm** en dan **Installeren** (of **Snelkoppeling maken**).') },
        ]),
        andere(t('Staat er helemaal niets in het menu?'), [{ icoon: 'download', tekst: zin('Werk **Chrome** bij via de **Play Store** en open deze pagina opnieuw.') }]),
      ];
    case 'android-samsung':
      return [
        andere(t('Icoon in de adresbalk?'), [
          { icoon: 'download', tekst: zin('Tik in de adresbalk op het icoon met de pijl naar beneden.') },
          { icoon: 'vink', tekst: zin('Tik op **Installeren**.') },
        ]),
        uitlegVoor('android-anders', o),
      ];
    case 'android-firefox':
    case 'android-edge':
    case 'android-opera':
    case 'android-xiaomi':
    case 'android-huawei':
      return [uitlegVoor('android-anders', o)];
    case 'android-anders':
      return [uitlegVoor('android-chrome', o)];
    case 'inapp-ios':
    case 'inapp-android':
      return [
        andere(t('Geen menu te zien?'), [
          { icoon: 'kopieer', tekst: zin('Tik hieronder op **Kopieer link**.') },
          { icoon: 'kompas', tekst: s === 'inapp-ios' ? zin('Open **Safari** en plak de link in de adresbalk.') : zin('Open **Chrome** en plak de link in de adresbalk.') },
        ]),
      ];
    case 'ios-oud':
      return [
        andere(t('Heb je iOS 16.4 of nieuwer?'), [
          { icoon: 'deel', tekst: zin('Dan kan het ook in deze browser: tik op de **Deel**-knop (of open het menu en kies **Delen**).') },
          ZET_OP_BEGINSCHERM,
          VOEG_TOE,
        ]),
      ];
    case 'computer-chrome':
    case 'computer-edge':
    case 'computer-safari':
    case 'computer-firefox':
    case 'computer-anders':
    case 'onbekend':
      return [];
  }
}

/** "Andere browser of telefoon": alle combinaties om zelf te kiezen. */
export const HANDMATIG: { groep: string; keuzes: { sleutel: Sleutel; naam: string }[] }[] = [
  {
    groep: t('iPhone en iPad'),
    keuzes: [
      { sleutel: 'ios-safari-26', naam: t('Safari (iOS 26)') },
      { sleutel: 'ios-safari', naam: t('Safari (ouder)') },
      { sleutel: 'ios-chrome', naam: 'Chrome' },
      { sleutel: 'ios-edge', naam: 'Edge' },
      { sleutel: 'ios-firefox', naam: 'Firefox' },
      { sleutel: 'inapp-ios', naam: t('In een app (WhatsApp, Instagram …)') },
    ],
  },
  {
    groep: 'Android',
    keuzes: [
      { sleutel: 'android-chrome', naam: 'Chrome' },
      { sleutel: 'android-samsung', naam: 'Samsung Internet' },
      { sleutel: 'android-firefox', naam: 'Firefox' },
      { sleutel: 'android-edge', naam: 'Edge' },
      { sleutel: 'android-opera', naam: 'Opera' }, // i18n-ok
      { sleutel: 'android-anders', naam: t('Andere browser (Xiaomi, Huawei …)') },
      { sleutel: 'inapp-android', naam: t('In een app (WhatsApp, Instagram …)') },
    ],
  },
  {
    groep: t('Computer'),
    keuzes: [
      { sleutel: 'computer-chrome', naam: 'Chrome' },
      { sleutel: 'computer-edge', naam: 'Edge' },
      { sleutel: 'computer-safari', naam: 'Safari (Mac)' }, // i18n-ok
      { sleutel: 'computer-firefox', naam: 'Firefox' },
    ],
  },
];

/** Uitleg voor dit toestel (telefoon/tablet) – zoals vóór 0.29.1, voor bestaande code en tests. */
export function kiesUitleg(o: Omgeving): Uitleg {
  return uitlegVoor(sleutelVoor(o), o);
}

/** Uitleg voor de computer. */
export function kiesUitlegComputer(o: Omgeving): Uitleg {
  return uitlegVoor(sleutelVoor({ ...o, mobiel: false }, true), o);
}
