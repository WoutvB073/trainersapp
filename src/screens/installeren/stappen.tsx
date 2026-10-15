import type { ReactNode } from 'react';
import type { Omgeving } from '../../engine/platform';
import type { IcoonNaam } from '../../components/Icoon';
import { APP_NAAM } from '../../config';

export interface Stap {
  icoon: IcoonNaam;
  tekst: ReactNode;
}

export interface Uitleg {
  titel: string;
  /** Korte uitleg vóór de stappen. */
  intro?: ReactNode;
  stappen: Stap[];
  /** Eigen "Installeren"-knop tonen als de browser dat toestaat (Chrome/Edge). */
  installeerKnop?: boolean;
  /** Knop "Kopieer link". */
  kopieerLink?: boolean;
  /** Wijzende pijl naar de knop in de browserbalk (buiten de pagina). */
  pijl?: 'onder-midden' | 'onder-rechts' | 'boven-rechts';
  tip?: ReactNode;
}

const OPEN_APP: Stap = { icoon: 'huis', tekst: <>Open {APP_NAAM} voortaan via het nieuwe icoon.</> };

/** Kiest de juiste uitleg voor dit toestel en deze browser. */
export function kiesUitleg(o: Omgeving): Uitleg {
  // ── Ingebouwde browser van een app (WhatsApp, Instagram, …) ──
  if (o.browser === 'inapp') {
    const doel = o.os === 'ios' ? 'Safari' : 'Chrome';
    return {
      titel: `Open deze pagina in ${doel}`,
      intro: (
        <>
          Je bekijkt deze pagina in {o.appNaam ? <>de browser van <strong>{o.appNaam}</strong></> : 'de browser van een app'}.
          Daar kun je {APP_NAAM} niet installeren.
        </>
      ),
      stappen:
        o.os === 'ios'
          ? [
              { icoon: 'meer', tekst: <>Tik op <strong>•••</strong> of het kompas-icoon.</> },
              { icoon: 'kompas', tekst: <>Kies <strong>Open in Safari</strong> (of <strong>Open in browser</strong>).</> },
              { icoon: 'deel', tekst: <>In Safari zie je deze pagina weer, met de stappen om te installeren.</> },
            ]
          : [
              { icoon: 'puntjes', tekst: <>Tik rechtsboven op <strong>⋮</strong>.</> },
              { icoon: 'kompas', tekst: <>Kies <strong>Openen in Chrome</strong> (of <strong>Openen in browser</strong>).</> },
              { icoon: 'download', tekst: <>In Chrome zie je deze pagina weer, met de knop om te installeren.</> },
            ],
      kopieerLink: true,
      tip: <>Lukt dat niet? Kopieer de link en plak hem in de adresbalk van {doel}.</>,
    };
  }

  // ── iPhone / iPad ──
  if (o.os === 'ios') {
    if (o.browser !== 'safari') {
      return {
        titel: 'Open deze pagina in Safari',
        intro: <>Op {o.tablet ? 'de iPad' : 'de iPhone'} zet je {APP_NAAM} op je beginscherm via <strong>Safari</strong>.</>,
        stappen: [
          { icoon: 'kopieer', tekst: <>Tik hieronder op <strong>Kopieer link</strong>.</> },
          { icoon: 'kompas', tekst: <>Open de app <strong>Safari</strong>.</> },
          { icoon: 'plusVierkant', tekst: <>Tik op de adresbalk, kies <strong>Plak en ga</strong> en volg daar de stappen.</> },
        ],
        kopieerLink: true,
      };
    }
    const nieuw = (o.safariVersie ?? 0) >= 26;
    const stappen: Stap[] = nieuw
      ? [
          { icoon: 'meer', tekst: <>Tik {o.tablet ? 'rechtsboven' : 'rechtsonder'} op <strong>•••</strong>.</> },
          { icoon: 'deel', tekst: <>Tik op <strong>Deel</strong>.</> },
          { icoon: 'plusVierkant', tekst: <>Kies <strong>Zet op beginscherm</strong> (zie je het niet? Scroll omlaag).</> },
          { icoon: 'schakelaar', tekst: <>Laat <strong>Open als webapp</strong> aan staan en tik op <strong>Voeg toe</strong>.</> },
          OPEN_APP,
        ]
      : [
          { icoon: 'deel', tekst: <>Tik {o.tablet ? 'rechtsboven' : 'onderin'} op de <strong>Deel</strong>-knop.</> },
          { icoon: 'plusVierkant', tekst: <>Kies <strong>Zet op beginscherm</strong> (zie je het niet? Scroll omlaag).</> },
          { icoon: 'plus', tekst: <>Tik rechtsboven op <strong>Voeg toe</strong>.</> },
          OPEN_APP,
        ];
    return {
      titel: 'Zet de app op je beginscherm',
      stappen,
      pijl: o.tablet ? 'boven-rechts' : nieuw ? 'onder-rechts' : 'onder-midden',
    };
  }

  // ── Android ──
  if (o.os === 'android') {
    if (o.browser === 'chrome') {
      return {
        titel: 'Zet de app op je startscherm',
        stappen: [
          { icoon: 'puntjes', tekst: <>Tik rechtsboven op <strong>⋮</strong>.</> },
          { icoon: 'download', tekst: <>Kies <strong>App installeren</strong> of <strong>Toevoegen aan startscherm</strong>.</> },
          { icoon: 'vink', tekst: <>Tik op <strong>Installeren</strong>.</> },
          OPEN_APP,
        ],
        installeerKnop: true,
        pijl: 'boven-rechts',
      };
    }
    return {
      titel: 'Zet de app op je startscherm',
      intro: <>Installeren werkt het best via <strong>Chrome</strong>. Kopieer de link en open hem in Chrome, of gebruik het menu van deze browser:</>,
      stappen: [
        { icoon: 'puntjes', tekst: <>Open het menu van je browser (<strong>⋮</strong> of <strong>☰</strong>).</> },
        { icoon: 'plusVierkant', tekst: <>Kies <strong>App installeren</strong> of <strong>Toevoegen aan startscherm</strong>.</> },
        OPEN_APP,
      ],
      installeerKnop: true,
      kopieerLink: true,
    };
  }

  // ── Onbekend mobiel toestel ──
  return {
    titel: 'Zet de app op je beginscherm',
    stappen: [
      { icoon: 'puntjes', tekst: <>Open het menu van je browser.</> },
      { icoon: 'plusVierkant', tekst: <>Kies <strong>App installeren</strong> of <strong>Toevoegen aan beginscherm</strong>.</> },
      OPEN_APP,
    ],
    installeerKnop: true,
  };
}

/** Laptop/computer. */
export function kiesUitlegComputer(o: Omgeving): Uitleg {
  if (o.browser === 'chrome' || o.browser === 'edge') {
    const chrome = o.browser === 'chrome';
    return {
      titel: 'Installeer de app op je computer',
      stappen: [
        { icoon: 'computer', tekst: <>Klik rechts in de <strong>adresbalk</strong> op het installatie-icoon.</> },
        { icoon: 'vink', tekst: <>Klik op <strong>Installeren</strong>. {APP_NAAM} opent in een eigen venster.</> },
        chrome
          ? { icoon: 'puntjes', tekst: <>Geen icoon? Menu <strong>⋮</strong> → <strong>Casten, opslaan en delen</strong> → <strong>{APP_NAAM} installeren</strong>.</> }
          : { icoon: 'meer', tekst: <>Geen icoon? Menu <strong>•••</strong> → <strong>Apps</strong> → <strong>{APP_NAAM} installeren</strong>.</> },
      ],
      installeerKnop: true,
    };
  }
  if (o.browser === 'safari') {
    return {
      titel: 'Zet de app in je Dock',
      stappen: [
        { icoon: 'browser', tekst: <>Kies in de menubalk <strong>Archief</strong> → <strong>Voeg toe aan Dock</strong>.</> },
        { icoon: 'vink', tekst: <>Klik op <strong>Voeg toe</strong>. {APP_NAAM} staat nu in je Dock.</> },
      ],
    };
  }
  return {
    titel: 'Installeren via Chrome of Edge',
    intro: <>Deze browser kan {APP_NAAM} niet als app installeren. Open deze pagina in <strong>Chrome</strong> of <strong>Edge</strong>, of gebruik hem gewoon in de browser.</>,
    stappen: [],
    kopieerLink: true,
  };
}
