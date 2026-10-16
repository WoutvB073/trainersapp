import type { Oefening, Soort } from '../model/types';
import { eigenOefeningen } from '../eigen/opslag';
import { inBibliotheek } from '../eigen/eigen';

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

/** Alleen de ingebouwde oefeningen. */
export const OEFENINGEN: Oefening[] = BESTANDEN.flatMap((b) => b.oefeningen);

const opId = new Map(OEFENINGEN.map((o) => [o.id, o]));

/** Ingebouwd én eigen (eigen alleen als ze een naam en een categorie hebben). */
export function alleOefeningen(): Oefening[] {
  return [...OEFENINGEN, ...eigenOefeningen.lijst().filter(inBibliotheek)];
}

/** Zoekt ook in de eigen oefeningen (ook als die nog niet af zijn). */
export function vindOefening(id: string): Oefening | undefined {
  return opId.get(id) ?? eigenOefeningen.haal(id);
}

export function oefeningenVan(soort: Soort, categorie?: string): Oefening[] {
  return alleOefeningen()
    .filter((o) => o.soort === soort && (!categorie || o.categorieen.includes(categorie)))
    .sort((a, b) => a.naam.localeCompare(b.naam, 'nl'));
}
