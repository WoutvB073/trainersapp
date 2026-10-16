import type { Soort } from '../model/types';

export interface Categorie {
  id: string;
  naam: string;
  omschrijving: string;
}

export const CATEGORIEEN: Record<Soort, Categorie[]> = {
  veld: [
    { id: 'warming-up', naam: 'Warming-up', omschrijving: 'Opwarmen met en zonder bal' },
    { id: 'techniek', naam: 'Techniek', omschrijving: 'Balbeheersing, aannemen, kappen en draaien' },
    { id: 'loopcoordinatie', naam: 'Loopcoördinatie', omschrijving: 'Ladders, hordes en voetenwerk' },
    { id: 'pass-en-trap', naam: 'Pass en trap', omschrijving: 'Passen, aannemen en meenemen' },
    { id: 'afwerken', naam: 'Afwerken', omschrijving: 'Scoren na een pass, dribbel of kaats' },
    { id: 'positiespel', naam: 'Positiespel', omschrijving: 'Rondo’s en positiespelen' },
    { id: 'partijvormen', naam: 'Partijvormen', omschrijving: '1v1, 2v2, overtal uitspelen en meer' },
    { id: 'spelletjes', naam: 'Spelletjes', omschrijving: 'Voetvolley en andere spelvormen' },
  ],
  keeper: [
    { id: 'warming-up', naam: 'Warming-up', omschrijving: 'Opwarmen, vangen en voetenwerk' },
    { id: 'laag-duiken', naam: 'Laag duiken', omschrijving: 'Duiken naar lage ballen' },
    { id: 'hoog-duiken', naam: 'Hoog duiken', omschrijving: 'Duiken naar hoge ballen' },
    { id: 'bal-verwerken', naam: 'Bal verwerken', omschrijving: 'Lage en hoge ballen, met stuit' },
    { id: 'voorzetten', naam: 'Voorzetten', omschrijving: 'Uitkomen en voorzetten pakken' },
    { id: 'passing', naam: 'Passing', omschrijving: 'Inspelen, uittrappen en uitgooien' },
    { id: 'een-op-een', naam: '1 op 1', omschrijving: 'Uitkomen en blokken tegen een aanvaller' },
    { id: 'reactie', naam: 'Reactie', omschrijving: 'Snel reageren op verrassende ballen' },
    { id: 'spelletjes', naam: 'Spelletjes', omschrijving: 'Keepersoorlog en andere spelvormen' },
  ],
};

export const SOORT_NAAM: Record<Soort, string> = { veld: 'Spelers', keeper: 'Keepers' };

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
