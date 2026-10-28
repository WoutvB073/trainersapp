import type { Oefening } from '../model/types';

/**
 * Engelse teksten van de ingebouwde oefeningen (0.25.0). Per id in `src/data/en/<bestand>.json` (spelers, keepers en
 * archief); alleen geladen als de app in het Engels draait. Eigen en teamoefeningen worden nooit vertaald.
 */
export interface OefeningTekst {
  naam: string;
  uitleg: string;
  organisatie?: string;
  benodigdheden: string[];
  coachpunten: string[];
  variaties: { makkelijker: string[]; moeilijker: string[] };
  meerSpelers?: string;
  onderdelen?: string[];
}

export type Vertalingen = Record<string, OefeningTekst>;

/** Teksten die als label in een tekening staan (bijv. een tekst-object op het veld). */
export const TEKENING_TEKST: Record<string, string> = {
  Koning: 'King',
  'schutter → doel': 'shooter → goal',
  'keeper → rij': 'keeper → queue',
  'Rood 0 – 2 Blauw': 'Red 0 – 2 Blue',
  dobbelsteen: 'dice',
};

/** De Engelse versie van een oefening (de tekening blijft gelijk, op tekst-labels na). */
export function vertaal(o: Oefening, en: OefeningTekst | undefined): Oefening {
  if (!en) return o;
  const objecten = o.tekening.objecten.some((x) => x.tekst && TEKENING_TEKST[x.tekst])
    ? o.tekening.objecten.map((x) => (x.tekst && TEKENING_TEKST[x.tekst] ? { ...x, tekst: TEKENING_TEKST[x.tekst] } : x))
    : o.tekening.objecten;
  return {
    ...o,
    naam: en.naam,
    uitleg: en.uitleg,
    ...(o.organisatie !== undefined ? { organisatie: en.organisatie ?? o.organisatie } : {}),
    benodigdheden: en.benodigdheden,
    coachpunten: en.coachpunten,
    variaties: en.variaties,
    ...(o.meerSpelers !== undefined ? { meerSpelers: en.meerSpelers ?? o.meerSpelers } : {}),
    ...(o.onderdelen !== undefined ? { onderdelen: en.onderdelen ?? o.onderdelen } : {}),
    tekening: objecten === o.tekening.objecten ? o.tekening : { ...o.tekening, objecten },
  };
}

/** Alle Engelse teksten samen (lui geladen: Nederlandse gebruikers laden ze nooit). */
export async function laadEngels(): Promise<Vertalingen> {
  const bestanden = import.meta.glob<Vertalingen>('./en/*.json', { import: 'default' });
  const delen = await Promise.all(Object.values(bestanden).map((laad) => laad()));
  return Object.assign({}, ...delen);
}

/** Zet de Engelse teksten in de lijsten zelf (dezelfde objecten, zodat alles wat ernaar verwijst meegaat). */
export function pasToe(lijsten: Oefening[][], en: Vertalingen): void {
  for (const lijst of lijsten) {
    for (let i = 0; i < lijst.length; i++) {
      const o = lijst[i]!;
      const v = vertaal(o, en[o.id]);
      if (v !== o) Object.assign(o, v);
    }
  }
}
