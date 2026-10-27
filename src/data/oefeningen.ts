import type { Oefening, Soort } from '../model/types';
import { eigenOefeningen } from '../eigen/opslag';
import { inBibliotheek } from '../eigen/eigen';
import { teamOefeningen, vindTeamOefening } from '../engine/teams';
import { vergelijk } from '../i18n/t';

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

/**
 * Oefeningen die uit de bibliotheek zijn gehaald. Ze staan niet meer in de lijsten en worden niet meer gekozen, maar
 * een training, deellink, teamtraining of favoriet die ernaar verwijst toont ze nog (met een melding).
 */
const archiefBestand = import.meta.glob<Oefening[]>('./oefeningen/archief.json', { eager: true, import: 'default' });
export const ARCHIEF: Oefening[] = Object.values(archiefBestand)
  .flat()
  .map((o) => ({ ...o, verwijderd: true }));
const archiefOpId = new Map(ARCHIEF.map((o) => [o.id, o]));

/** Ingebouwd, eigen (met naam en categorie) en gedeeld in je teams. */
export function alleOefeningen(): Oefening[] {
  return [...OEFENINGEN, ...eigenOefeningen.lijst().filter(inBibliotheek), ...teamOefeningen().filter(inBibliotheek)];
}

/** Zoekt ook in de eigen oefeningen (ook als die nog niet af zijn). */
export function vindOefening(id: string): Oefening | undefined {
  return opId.get(id) ?? archiefOpId.get(id) ?? eigenOefeningen.haal(id) ?? vindTeamOefening(id);
}

export function oefeningenVan(soort: Soort, categorie?: string): Oefening[] {
  return alleOefeningen()
    .filter((o) => o.soort === soort && (!categorie || o.categorieen.includes(categorie)))
    .sort((a, b) => vergelijk(a.naam, b.naam));
}
