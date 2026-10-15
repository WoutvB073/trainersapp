import type { Oefening, Soort } from '../model/types';

/**
 * Alle ingebouwde oefeningen. Elk bestand in oefeningen/veld en oefeningen/keepers is een lijst oefeningen;
 * de bestandsnaam is de hoofdcategorie. Nieuwe bestanden worden automatisch opgepakt.
 */
const bestanden = import.meta.glob<Oefening[]>('./oefeningen/*/*.json', { eager: true, import: 'default' });

export interface Bestand {
  pad: string;
  map: string;
  categorie: string;
  oefeningen: Oefening[];
}

export const BESTANDEN: Bestand[] = Object.entries(bestanden).map(([pad, oefeningen]) => {
  const [, map = '', naam = ''] = pad.match(/oefeningen\/([^/]+)\/([^/]+)\.json$/) ?? [];
  return { pad, map, categorie: naam, oefeningen };
});

export const OEFENINGEN: Oefening[] = BESTANDEN.flatMap((b) => b.oefeningen);

const opId = new Map(OEFENINGEN.map((o) => [o.id, o]));

export function vindOefening(id: string): Oefening | undefined {
  return opId.get(id);
}

export function oefeningenVan(soort: Soort, categorie?: string): Oefening[] {
  return OEFENINGEN.filter((o) => o.soort === soort && (!categorie || o.categorieen.includes(categorie))).sort(
    (a, b) => a.naam.localeCompare(b.naam, 'nl'),
  );
}
