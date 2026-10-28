import type { Soort } from '../model/types';
import { t } from '../i18n/t';

export interface Categorie {
  id: string;
  naam: string;
  omschrijving: string;
}

export const CATEGORIEEN: Record<Soort, Categorie[]> = {
  veld: [
    { id: 'warming-up', naam: t('Warming-up'), omschrijving: t('Opwarmen met en zonder bal') },
    { id: 'techniek', naam: t('Techniek'), omschrijving: t('Balbeheersing, aannemen, kappen en draaien') },
    { id: 'loopcoordinatie', naam: t('Loopcoördinatie'), omschrijving: t('Ladders, hordes en voetenwerk') },
    { id: 'pass-en-trap', naam: t('Pass en trap'), omschrijving: t('Passen, aannemen en meenemen') },
    { id: 'afwerken', naam: t('Afwerken'), omschrijving: t('Scoren na een pass, dribbel of kaats') },
    { id: 'positiespel', naam: t('Positiespel'), omschrijving: t('Rondo’s en positiespelen') },
    { id: 'verdedigen-omschakelen', naam: t('Verdedigen en omschakelen'), omschrijving: t('Druk zetten, de bal veroveren en snel omschakelen') },
    { id: 'partijvormen', naam: t('Partijvormen'), omschrijving: t('1v1, 2v2, overtal uitspelen en meer') },
    { id: 'spelletjes', naam: t('Spelletjes'), omschrijving: t('Voetvolley en andere spelvormen') },
  ],
  keeper: [
    { id: 'warming-up', naam: t('Warming-up'), omschrijving: t('Opwarmen, vangen en voetenwerk') },
    { id: 'laag-duiken', naam: t('Laag duiken'), omschrijving: t('Duiken naar lage ballen') },
    { id: 'hoog-duiken', naam: t('Hoog duiken'), omschrijving: t('Duiken naar hoge ballen') },
    { id: 'bal-verwerken', naam: t('Bal verwerken'), omschrijving: t('Lage en hoge ballen, met stuit') },
    { id: 'voorzetten', naam: t('Voorzetten'), omschrijving: t('Uitkomen en voorzetten pakken') },
    { id: 'passing', naam: t('Passing'), omschrijving: t('Inspelen, uittrappen en uitgooien') },
    { id: 'een-op-een', naam: t('1 op 1'), omschrijving: t('Uitkomen en blokken tegen een aanvaller') },
    { id: 'reactie', naam: t('Reactie'), omschrijving: t('Snel reageren op verrassende ballen') },
    { id: 'spelletjes', naam: t('Spelletjes'), omschrijving: t('Keepersoorlog en andere spelvormen') },
  ],
};

export const SOORT_NAAM: Record<Soort, string> = { veld: t('Spelers'), keeper: t('Keepers') };

/** Routes gebruiken "veld" en "keepers". */
export const SOORT_PAD: Record<Soort, string> = { veld: 'veld', keeper: 'keepers' };

export function soortUitPad(pad: string | undefined): Soort | undefined {
  if (pad === 'veld') return 'veld';
  if (pad === 'keepers') return 'keeper';
  return undefined;
}

export function vindCategorie(soort: Soort, id: string): Categorie | undefined {
  return CATEGORIEEN[soort].find((c) => c.id === id);
}
