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
  /** Horde (laag 0,15 / hoog 0,3 m) en paaltje: hoogte in meters. */
  hoogte?: number;
  tekst?: string;
  /** Optionele eigen kleur (zone/vak, hoedje, pion, ring, ladder, horde). Een zone wordt een doorzichtig gekleurd vlak. */
  kleur?: string;
}

/** Standaardhoogte van een horde. */
export const HORDE = { laag: 0.15, hoog: 0.3 } as const;

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

/**
 * Loopwijze. Bepaalt de standaardsnelheid, hoe het poppetje beweegt (3D) en de kijkrichting:
 * - `jog` (standaard), `sprint`, `wandel`
 * - `huppel` (skippen), `kniehef`, `sprong` (hinkelen/springen, bv. door ringen)
 * - `zijwaarts` (kijkt 90° naast de looprichting, of `kijk`), `achteruit` (kijkt tegen de looprichting in)
 * - `voetenwerk` (kleine snelle pasjes, bv. door een ladder), `hordes` (over lage hordes)
 * Bij voetenwerk, hordes, kniehef en sprong toont het spoor losse pasjes.
 */
export type Manier = 'jog' | 'sprint' | 'wandel' | 'huppel' | 'kniehef' | 'sprong' | 'zijwaarts' | 'achteruit' | 'voetenwerk' | 'hordes';

export interface BeweegActie extends ActieBasis {
  type: 'loop' | 'dribbel' | 'duik';
  wie: string;
  naar: Punt;
  /** Tussenpunten (bv. slalom of zigzag); de lijn loopt door deze punten. */
  via?: Punt[];
  /** Draai om dit object (pion, paaltje) heen, na de tussenpunten en vóór `naar`. */
  om?: string;
  /** Kant waar het object blijft bij `om` (standaard links). */
  kant?: 'links' | 'rechts';
  /** Straal van de draai om het object (standaard 0,9 m). */
  straal?: number;
  manier?: Manier;
  /** Vaste kijkrichting tijdens deze beweging (graden), bv. zijwaarts met de neus naar de trainer. */
  kijk?: number;
  /** false = geen lijn achterlaten. */
  spoor?: boolean;
}

export interface PersoonActie extends ActieBasis {
  type: 'opstaan' | 'pak';
  wie: string;
  bal?: string;
}

/** Achteraan een rij aansluiten (loopt buitenom, zonder door de rij te lopen). */
export interface AansluitActie extends ActieBasis {
  type: 'aansluiten';
  wie: string;
  /** Id van de rij … */
  rij?: string;
  /** … of: de rij waar deze persoon in staat (of het laatst stond). */
  bij?: string;
  manier?: Manier;
  /** Standaard geen lijn (houdt het beeld rustig). */
  spoor?: boolean;
}

/** Ander hesje/team, bv. bij tikspelen: wie getikt is wordt tikker. */
export interface TeamActie extends ActieBasis {
  type: 'team';
  wie: string;
  team: Team;
}

export type Actie = BalActie | BeweegActie | PersoonActie | AansluitActie | TeamActie;

export interface AnimatieStap {
  acties: Actie[];
  /** Minimale duur van de stap in seconden (ook voor een pauze zonder acties). */
  duur?: number;
}

/**
 * Herhaal dezelfde stappen voor meerdere spelers achter elkaar (bv. een rij die om de beurt een parcours loopt).
 * In de stappen staat `@` voor de speler van dat moment, `@volgende` en `@vorige` voor de buren in de lijst.
 */
export interface HerhaalStap {
  herhaal: {
    spelers: string[];
    stappen: AnimatieStap[];
    /** Seconden tussen de start van de ene en de volgende speler (overlappend). Zonder: na elkaar. */
    tussen?: number;
    /** Hoe vaak de hele lijst (standaard 1). */
    rondes?: number;
    /**
     * Per speler een andere waarde: `{ "manier": ["huppel", "zijwaarts"] }` vult `"@manier"` in de stappen in
     * met de waarde voor speler 1, 2, … (de lijst wordt herhaald als hij korter is).
     */
    waarden?: Record<string, (string | number)[]>;
  };
}

/** Meerdere reeksen stappen tegelijk (bv. twee teams in een estafette); klaar als de langste klaar is. */
export interface TegelijkStap {
  tegelijk: Stap[][];
}

export type Stap = AnimatieStap | HerhaalStap | TegelijkStap;

/**
 * Een rij wachtende spelers. Plek 0 = voorste (op x, y); de rij loopt in `richting` (graden) naar achteren,
 * met `afstand` meter tussen de spelers (standaard 1,6). De spelers kijken naar voren.
 * Wie uit de rij vertrekt, laat de rest automatisch doorschuiven; `aansluiten` zet iemand achteraan.
 * De posities van de spelers in de rij volgen uit de rij (hun eigen x/y wordt genegeerd).
 */
export interface Rij {
  id: string;
  x: number;
  y: number;
  richting: number;
  afstand?: number;
  spelers: string[];
}

export type CameraStand = 'boven' | 'schuin' | 'achter';

export interface Tekening {
  veld: Veld;
  weergave?: Uitsnede;
  objecten: VeldObject[];
  lijnen?: Lijn[];
  rijen?: Rij[];
  animatie?: Stap[];
  /** Beginstand van de 3D-camera (standaard schuin). */
  camera?: CameraStand;
}

export interface Oefening {
  id: string;
  soort: Soort;
  naam: string;
  /** Categorie-id's; de eerste is de hoofdcategorie (= bestandsnaam). */
  categorieen: string[];
  uitleg: string;
  /** Hoe zet je het neer: vakgrootte, afstanden, waar staan de spelers. */
  organisatie?: string;
  benodigdheden: string[];
  spelersNodig: number;
  keepersNodig: number;
  coachpunten: string[];
  variaties: { makkelijker: string[]; moeilijker: string[] };
  tekening: Tekening;
}
