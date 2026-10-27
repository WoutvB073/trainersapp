import type { ReactNode } from 'react';
import type { Omgeving } from '../../engine/platform';
import type { IcoonNaam } from '../../components/Icoon';
import { t } from '../../i18n/t';

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

import { zin } from '../../i18n/zin';

export { zin };

const OPEN_APP: Stap = { icoon: 'huis', tekst: zin('Open {app} voortaan via het nieuwe icoon.') };

/** Kiest de juiste uitleg voor dit toestel en deze browser. */
export function kiesUitleg(o: Omgeving): Uitleg {
  // ── Ingebouwde browser van een app (WhatsApp, Instagram, …) ──
  if (o.browser === 'inapp') {
    const doel = o.os === 'ios' ? 'Safari' : 'Chrome';
    return {
      titel: t('Open deze pagina in {doel}', { doel }),
      intro: o.appNaam
        ? zin('Je bekijkt deze pagina in de browser van **{appNaam}**. Daar kun je {app} niet installeren.', { appNaam: o.appNaam })
        : zin('Je bekijkt deze pagina in de browser van een app. Daar kun je {app} niet installeren.'),
      stappen:
        o.os === 'ios'
          ? [
              { icoon: 'meer', tekst: zin('Tik op **•••** of het kompas-icoon.') },
              { icoon: 'kompas', tekst: zin('Kies **Open in Safari** (of **Open in browser**).') },
              { icoon: 'deel', tekst: zin('In Safari zie je deze pagina weer, met de stappen om te installeren.') },
            ]
          : [
              { icoon: 'puntjes', tekst: zin('Tik rechtsboven op **⋮**.') },
              { icoon: 'kompas', tekst: zin('Kies **Openen in Chrome** (of **Openen in browser**).') },
              { icoon: 'download', tekst: zin('In Chrome zie je deze pagina weer, met de knop om te installeren.') },
            ],
      kopieerLink: true,
      tip: zin('Lukt dat niet? Kopieer de link en plak hem in de adresbalk van {doel}.', { doel }),
    };
  }

  // ── iPhone / iPad ──
  if (o.os === 'ios') {
    if (o.browser !== 'safari') {
      return {
        titel: t('Open deze pagina in Safari'),
        intro: o.tablet ? zin('Op de iPad zet je {app} op je beginscherm via **Safari**.') : zin('Op de iPhone zet je {app} op je beginscherm via **Safari**.'),
        stappen: [
          { icoon: 'kopieer', tekst: zin('Tik hieronder op **Kopieer link**.') },
          { icoon: 'kompas', tekst: zin('Open de app **Safari**.') },
          { icoon: 'plusVierkant', tekst: zin('Tik op de adresbalk, kies **Plak en ga** en volg daar de stappen.') },
        ],
        kopieerLink: true,
      };
    }
    const nieuw = (o.safariVersie ?? 0) >= 26;
    const stappen: Stap[] = nieuw
      ? [
          { icoon: 'meer', tekst: o.tablet ? zin('Tik rechtsboven op **•••**.') : zin('Tik rechtsonder op **•••**.') },
          { icoon: 'deel', tekst: zin('Tik op **Deel**.') },
          { icoon: 'plusVierkant', tekst: zin('Kies **Zet op beginscherm** (zie je het niet? Scroll omlaag).') },
          { icoon: 'schakelaar', tekst: zin('Laat **Open als webapp** aan staan en tik op **Voeg toe**.') },
          OPEN_APP,
        ]
      : [
          { icoon: 'deel', tekst: o.tablet ? zin('Tik rechtsboven op de **Deel**-knop.') : zin('Tik onderin op de **Deel**-knop.') },
          { icoon: 'plusVierkant', tekst: zin('Kies **Zet op beginscherm** (zie je het niet? Scroll omlaag).') },
          { icoon: 'plus', tekst: zin('Tik rechtsboven op **Voeg toe**.') },
          OPEN_APP,
        ];
    return {
      titel: t('Zet de app op je beginscherm'),
      stappen,
      pijl: o.tablet ? 'boven-rechts' : nieuw ? 'onder-rechts' : 'onder-midden',
    };
  }

  // ── Android ──
  if (o.os === 'android') {
    if (o.browser === 'chrome') {
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
    }
    return {
      titel: t('Zet de app op je startscherm'),
      intro: zin('Installeren werkt het best via **Chrome**. Kopieer de link en open hem in Chrome, of gebruik het menu van deze browser:'),
      stappen: [
        { icoon: 'puntjes', tekst: zin('Open het menu van je browser (**⋮** of **☰**).') },
        { icoon: 'plusVierkant', tekst: zin('Kies **App installeren** of **Toevoegen aan startscherm**.') },
        OPEN_APP,
      ],
      installeerKnop: true,
      kopieerLink: true,
    };
  }

  // ── Onbekend mobiel toestel ──
  return {
    titel: t('Zet de app op je beginscherm'),
    stappen: [{ icoon: 'puntjes', tekst: zin('Open het menu van je browser.') }, { icoon: 'plusVierkant', tekst: zin('Kies **App installeren** of **Toevoegen aan beginscherm**.') }, OPEN_APP],
    installeerKnop: true,
  };
}

/** Laptop/computer. */
export function kiesUitlegComputer(o: Omgeving): Uitleg {
  if (o.browser === 'chrome' || o.browser === 'edge') {
    const chrome = o.browser === 'chrome';
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
  if (o.browser === 'safari') {
    return {
      titel: t('Zet de app in je Dock'),
      stappen: [
        { icoon: 'browser', tekst: zin('Kies in de menubalk **Archief** → **Voeg toe aan Dock**.') },
        { icoon: 'vink', tekst: zin('Klik op **Voeg toe**. {app} staat nu in je Dock.') },
      ],
    };
  }
  return {
    titel: t('Installeren via Chrome of Edge'),
    intro: zin('Deze browser kan {app} niet als app installeren. Open deze pagina in **Chrome** of **Edge**, of gebruik hem gewoon in de browser.'),
    stappen: [],
    kopieerLink: true,
  };
}
