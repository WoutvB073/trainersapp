/**
 * Datamodel. Ingebouwde oefeningen, gekopieerde oefeningen en editor-tekeningen gebruiken
 * precies dit formaat (zie PLAN.md → Datamodel). Alle maten in meters.
 */

export type Soort = 'veld' | 'keeper';

/** [x, y] in meters. x = breedte (links → rechts), y = lengte (boven → onder in bovenaanzicht). */
export type Punt = [number, number];

export type VeldType = 'leeg' | 'half' | 'heel';

export interface Veld {
  type: VeldType;
  breedte?: number;
  lengte?: number;
}

export interface Uitsnede {
  x: number;
  y: number;
  breedte: number;
  lengte: number;
}

export type ObjectSoort =
  | 'speler'
  | 'keeper'
  | 'trainer'
  | 'bal'
  | 'goal'
  | 'klein-goal'
  | 'pion'
  | 'hoedje'
  | 'paaltje'
  | 'ladder'
  | 'horde'
  | 'ring'
  | 'zone'
  | 'muurtje'
  | 'rebounder'
  | 'keepersmat'
  | 'stok'
  | 'tekst';

/** Personen kunnen bewegen en een bal hebben. */
export const PERSONEN: readonly ObjectSoort[] = ['speler', 'keeper', 'trainer'];

export type Team = 'A' | 'B' | 'C';

export interface VeldObject {
  id: string;
  soort: ObjectSoort;
  x: number;
  y: number;
  /** Speler: team A/B, C = extra hesjeskleur. */
  team?: Team;
  nummer?: number;
  /** Bal: id van wie de bal aan het begin heeft. */
  bij?: string;
  /** Draaiing in graden (goals: 0 = opening naar beneden / +y). */
  hoek?: number;
  /** Personen: kijkrichting in graden (0 = rechts, 90 = omlaag). */
  kijkrichting?: number;
  /** Zone, ladder, muurtje, mat, stok: afmetingen in meters. */
  breedte?: number;
  lengte?: number;
  tekst?: string;
  /** Optionele eigen kleur (zone, hoedje, pion). */
  kleur?: string;
}

export type LijnSoort = 'bal' | 'loop' | 'dribbel';

export interface Lijn {
  soort: LijnSoort;
  punten: Punt[];
}

interface ActieBasis {
  /** Seconden na het begin van de stap. */
  start?: number;
  /** Duur in seconden (anders berekend uit afstand en snelheid). */
  duur?: number;
}

/**
 * Hoe hoog de bal door de lucht gaat (hoogste punt van de boog):
 * - `grond`: rollend over het gras (0 m) – standaard bij een pass
 * - `laag`: lage boog (± 1 m), bv. een laag schot of een worp naar de keeper – standaard bij een schot
 * - `halfhoog`: ± 2,5 m
 * - `hoog`: lob/voorzet, hoogte hangt af van de afstand (max. 7 m)
 * - een getal: hoogste punt in meters
 */
export type BalHoogte = 'grond' | 'laag' | 'halfhoog' | 'hoog' | number;

export interface BalActie extends ActieBasis {
  type: 'pass' | 'schot';
  van: string;
  /** Id van een persoon (bal komt aan waar die persoon dan is) of een punt. */
  naar: string | Punt;
  /** Welke bal (standaard de bal die `van` heeft). */
  bal?: string;
  /** Hoogte van de bal (optioneel, zie BalHoogte). */
  hoogte?: BalHoogte;
  /** Verouderd: `hoog: true` = `hoogte: 'hoog'`. Blijft werken voor oude tekeningen. */
  hoog?: boolean;
}

export interface BeweegActie extends ActieBasis {
  type: 'loop' | 'dribbel' | 'duik';
  wie: string;
  naar: Punt;
}

export interface PersoonActie extends ActieBasis {
  type: 'opstaan' | 'pak';
  wie: string;
  bal?: string;
}

export type Actie = BalActie | BeweegActie | PersoonActie;

export interface AnimatieStap {
  acties: Actie[];
  /** Minimale duur van de stap in seconden (ook voor een pauze zonder acties). */
  duur?: number;
}

export interface Tekening {
  veld: Veld;
  weergave?: Uitsnede;
  objecten: VeldObject[];
  lijnen?: Lijn[];
  animatie?: AnimatieStap[];
}

export interface Oefening {
  id: string;
  soort: Soort;
  naam: string;
  /** Categorie-id's; de eerste is de hoofdcategorie (= bestandsnaam). */
  categorieen: string[];
  uitleg: string;
  benodigdheden: string[];
  spelersNodig: number;
  keepersNodig: number;
  coachpunten: string[];
  variaties: { makkelijker: string[]; moeilijker: string[] };
  tekening: Tekening;
}
