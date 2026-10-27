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
  | 'tekst'
  /** Voetvolleynet of lint tussen twee paaltjes (breedte = lengte van het net, hoogte instelbaar). */
  | 'net'
  | 'bank'
  /** Pannakooi: lage boarding rond een klein vak (breedte × lengte). */
  | 'kooi'
  /** Losse pop/dummy (± 1,8 m): hindernis in de zestien of om de bal van richting te laten veranderen. */
  | 'pop'
  /** Doelnet/schotnet in een goal (in plaats van een keeper), met een gat in elke hoek (zie src/anim/doelnet.ts). */
  | 'doelnet';

/** Personen kunnen bewegen en een bal hebben. */
export const PERSONEN: readonly ObjectSoort[] = ['speler', 'keeper', 'trainer'];

/** A/B = teams, C = extra hesjeskleur, J = joker (neutrale speler, speelt altijd met de balbezitter mee). */
export type Team = 'A' | 'B' | 'C' | 'J';

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
  /**
   * Keeper: id van het goal dat hij verdedigt. Hij beweegt dan vanzelf mee met de bal (tussen bal en midden
   * van het goal), zet zich bij een schot en reageert op schoten met `afloop`.
   */
  verdedigt?: string;
  /** Persoon: naam (tactiekbord); alleen in beeld als de tekening `namen` aan heeft. Het rugnummer blijft altijd. */
  naam?: string;
  /** Doelnet: id van het goal waar het in hangt (plek, draaiing en maat volgen dat goal). */
  doel?: string;
  /** Keeper mag buiten het doelgebied komen (bv. 1 tegen keeper). */
  uitkomen?: boolean;
  /** Bal: een reactiebal (stuit alle kanten op) of tennisbal (klein). */
  variant?: 'reactiebal' | 'tennisbal';
  /** Keeper: begint in kniezit of hurkzit (tot hij beweegt of duikt). */
  houding?: Zithouding;
  /** Zone, ladder, muurtje, mat, stok: afmetingen in meters. */
  breedte?: number;
  lengte?: number;
  /**
   * Hoogte in meters: horde (laag 0,15 / hoog 0,3), paaltje, net (standaard 1), goal (standaard 2,44; jeugdgoal 2),
   * keepersmat (vanaf 0,1 = landingskussen: een dik kussen waar de keeper op landt).
   */
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
  /** Editor: buigpunt. De lijn loopt dan als een vloeiende boog van het eerste naar het laatste punt, door dit punt. */
  bocht?: Punt;
  /** Editor: begin of eind vast aan een object (bv. een speler); de lijn beweegt mee als dat object verschuift. */
  van?: string;
  naar?: string;
  /**
   * Editor-animatie: stapnummer (1, 2, 3 …). Lijnen met hetzelfde nummer gebeuren tegelijk. De app zet de lijnen om naar
   * gewone animatiestappen (src/editor/animatie.ts): looplijn = lopen, dribbellijn = dribbelen, ballijn = pass, schot op
   * een goal of kaatsen tegen een rebounder/pop. Zonder nummer is het alleen een getekende lijn.
   */
  stap?: number;
  /** Looplijn: loopwijze (standaard normaal; over een ladder/horde/ring vanzelf voetenwerk/hordes/huppelen). */
  manier?: 'sprint' | 'zijwaarts' | 'achteruit';
  /** Ballijn: hoogte (standaard grond bij een pass, laag bij een schot). */
  hoogte?: 'grond' | 'halfhoog' | 'hoog';
  /** Ballijn naar een goal (schot): afloop. Standaard: keeper vangt (als er een keeper is), anders goal. */
  afloop?: 'goal' | 'vangt' | 'duikt' | 'naast';
  /** Wachttijd in seconden vóór deze stap (de langste van de lijnen met dit nummer telt). */
  wacht?: number;
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
  /**
   * Id van een persoon (bal komt aan waar die persoon dan is), een punt, of een rebounder/muurtje/pop:
   * dan kaatst de bal terug naar `terug` (standaard de passeerder zelf). Een persoon met `terug` = die raakt de bal
   * en die verandert van richting (bv. een tweede keeper die de bal aantikt).
   */
  naar: string | Punt;
  /**
   * Bij een pass op een rebounder, muurtje, bank, pop of persoon: naar wie (of waar) de bal daarna gaat. Is dat een keeper
   * en staat er `duikNaar`, dan duikt hij naar de afgeketste bal.
   */
  terug?: string | Punt;
  /** Hoogte van de bal na het afketsen (standaard over de grond). */
  terugHoogte?: BalHoogte;
  /**
   * Afloop van een schot op een goal met een keeper (`verdedigt`): `goal` (keeper duikt maar is te laat),
   * `vangt`, `stompt` (bal weggestompt, ligt daarna los) of `naast`. `naar` is dan het punt waar het schot heen gaat.
   */
  afloop?: 'goal' | 'vangt' | 'stompt' | 'naast' | 'tipt';
  /**
   * Bij stompt: waar de bal heen gaat; bij vangt: waar de keeper hem daarna heen rolt; bij tipt: waar de getipte bal
   * landt. `tipt` = over de lat (hoge bal) of om de paal (bal bij de paal); geef met `eindHoogte` de hoogte bij het doel.
   */
  afloopNaar?: Punt;
  /**
   * Aanspelen uit de handen: `onderhands` (rollend met `hoogte: "grond"`, anders met een boogje), `bovenhands`,
   * `zwaai` (zijwaartse zwaaiworp, vlak en ver), `volley` (bal uit de handen laten vallen en trappen), `dropkick`
   * (halfvolley: trappen op het moment dat de bal de grond raakt) of `trap` (van de grond: bal neerleggen of een losse
   * bal, zoals een doeltrap). `voet` = een keeper speelt met de voet (terugspeelbal aannemen en wegspelen).
   * `tik` = een (stil)liggende bal met één hand wegtikken (bv. vanuit kniezit).
   * Zonder `worp` speelt een veldspeler of trainer met de voet; een keeper rolt de bal onderhands weg. Een keeper die een
   * hoge bal met `worp: "voet"` en `direct` doorspeelt, kopt hem weg (vanaf ± 1,3 m) of trapt hem weg op die hoogte.
   */
  worp?: 'onderhands' | 'bovenhands' | 'zwaai' | 'volley' | 'dropkick' | 'trap' | 'voet' | 'tik';
  /**
   * Bal naar een keeper die ervoor duikt: de keeper duikt naar dit punt en pakt de bal precies aan het eind van
   * zijn duik (de duik wordt vanzelf op de bal afgestemd). `duikHoogte` = hoogte van de handen (hoge duik).
   */
  duikNaar?: Punt;
  duikHoogte?: number;
  /**
   * Voorzet: deze keeper komt uit, loopt naar de bal en vangt hem in de sprong op het hoogste punt (± 2,5 m, of
   * `vangHoogte`). Met `stompNaar` stompt hij de bal weg (`vuisten`: 1 of 2, standaard 2).
   */
  uitkomen?: string;
  vangHoogte?: number;
  /**
   * 1 op 1: de keeper blokt het schot met zijn lichaam (`blokSoort`: `ster` = spreidsprong/stervorm, `knie` = knieblok,
   * `voeten` = glijdend met de voeten vooruit);
   * de bal kaatst af naar `afloopNaar`.
   */
  blokt?: string;
  blokSoort?: 'ster' | 'knie' | 'voeten';
  /** Bij `afloop: "vangt"`: de keeper houdt de bal vast (bv. keepersoorlog: hij gooit hem zelf terug). */
  vasthouden?: boolean;
  stompNaar?: Punt;
  vuisten?: 1 | 2;
  /** Hoogte (m) waarop de bal aankomt: bv. 0,6 voor een volley, 2 voor een kopbal. */
  eindHoogte?: number;
  /** In één keer (volley, kopbal, direct doorspelen): geen aanname. */
  direct?: boolean;
  /** Eigen balsnelheid in m/s (bv. 24 voor een hard schot). */
  snelheid?: number;
  /** Id van een verdediger die deze pass onderschept (hij loopt naar de passlijn en krijgt de bal). */
  onderschept?: string;
  /** De bal stuit eerst op dit punt en gaat dan verder naar `naar` (voetvolley, voetbaltennis). */
  stuitOp?: Punt;
  /**
   * Schot tegen de lat, de paal of een doelnet: `naar` is het punt op de doellijn; de bal springt terug naar `terugNaar`.
   * Bij `net` raakt de bal het doek op hoogte `eindHoogte`.
   */
  raakt?: 'lat' | 'paal' | 'net';
  terugNaar?: Punt;
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
 * - `huppel` (skippen), `kniehef`, `hakbil` (hakken-billen), `sprong` (hinkelen/springen, bv. door ringen)
 * - `zijwaarts` (kijkt 90° naast de looprichting, of `kijk`), `achteruit` (kijkt tegen de looprichting in)
 * - `voetenwerk` (kleine snelle pasjes, bv. door een ladder), `hordes` (over lage hordes)
 * - `kruispas` (keeper: zijwaarts met gekruiste passen). Een keeper die `zijwaarts` of met `kruispas` gaat, blijft
 *   (zonder `kijk`) dezelfde kant op kijken.
 * Bij voetenwerk, hordes, kniehef en sprong toont het spoor losse pasjes.
 */
export type Manier =
  | 'jog'
  | 'sprint'
  | 'wandel'
  | 'huppel'
  | 'kniehef'
  /** Hakken-billen: hielen om en om naar de billen. */
  | 'hakbil'
  | 'sprong'
  | 'zijwaarts'
  | 'achteruit'
  | 'voetenwerk'
  | 'hordes'
  /** Keeper: zijwaarts met kruispassen (het achterste been kruist voor langs). */
  | 'kruispas'
  /** Intern: schijnbeweging (zie SchijnActie). */
  | 'schijn';

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
  /**
   * Duik: hoogte (m) van de handen bij de bal. Vanaf ± 0,8 m is het een hoge duik: de keeper zet af, hangt
   * horizontaal in de lucht en landt daarna op zijn zij (op een landingskussen als dat er ligt).
   */
  hoogte?: number;
}

/**
 * Kniezit, hurkzit, of op de billen: `zit` (benen gestrekt naar voren) of `zit-opgetrokken` (knieën opgetrokken),
 * bv. grondoefeningen in de warming-up van keepers. `buik` = op de buik liggen (gezicht naar beneden, in de kijkrichting),
 * `halfknie` = halfknielend (rechterknie op de grond, linkervoet voor). Opstaan met `opstaan` gaat geleidelijk.
 */
export type Zithouding = 'kniezit' | 'hurkzit' | 'zit' | 'zit-opgetrokken' | 'buik' | 'halfknie';

/** Keeper gaat (weer) in kniezit of hurkzit zitten, bv. na een duik voor de volgende bal. */
export interface ZitActie extends ActieBasis {
  type: 'zitten';
  wie: string;
  houding: Zithouding;
}

/**
 * opstaan, pak (dichtstbijzijnde losse bal), springen (bv. een tegenstander die meespringt bij een voorzet) of grondtik
 * (zittende keeper tikt met beide handen achter zich de grond aan en komt terug, grondoefeningen).
 */
export interface PersoonActie extends ActieBasis {
  type: 'opstaan' | 'pak' | 'springen' | 'grondtik';
  wie: string;
  bal?: string;
}

/**
 * Op de plek omdraaien (bv. op een teken van de trainer): naar een vaste kijkrichting (`kijk`, graden) of naar een persoon
 * of object (`naar`). Standaard snel (0,3 s); met `duur` langzamer.
 */
export interface DraaiActie extends ActieBasis {
  type: 'draai';
  wie: string;
  kijk?: number;
  naar?: string;
  /** Draaisprong: omdraaien in de lucht (bv. 180° met de rug naar het veld beginnen). */
  sprong?: boolean;
}

/** Een pion, hoedje of paaltje aantikken met de hand (door de knieën, hand naar het object), standaard 0,6 s. */
export interface AantikActie extends ActieBasis {
  type: 'aantikken';
  wie: string;
  /** Id van het object dat hij aantikt … */
  doel?: string;
  /** … of een punt (bv. de doelpaal). */
  punt?: Punt;
  /** Met de hand (standaard) of met de voet. */
  met?: 'hand' | 'voet';
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

/**
 * Schijnbeweging: het lijf gaat even opzij (± 0,45 m) en terug, de bal blijft liggen.
 * Daarna meestal een dribbel naar de andere kant. `kant` is t.o.v. de kijkrichting (standaard links).
 */
export interface SchijnActie extends ActieBasis {
  type: 'schijn';
  wie: string;
  kant?: 'links' | 'rechts';
}

/** Druk zetten: loop naar de balbezitter (of `op`) tot op `afstand` m (standaard 1,7). */
export interface DrukActie extends ActieBasis {
  type: 'druk';
  wie: string;
  op?: string;
  afstand?: number;
  manier?: Manier;
}

/** Passlijn dichtlopen: ga tussen twee spelers in staan (`fractie` 0–1 vanaf de eerste, standaard 0,5). */
export interface DekActie extends ActieBasis {
  type: 'dek';
  wie: string;
  /** Twee spelers, of een speler en een punt (bv. mandekking: tussen tegenstander en het midden van je eigen goal). */
  tussen: [string | Punt, string | Punt];
  fractie?: number;
  /** In plaats van `fractie`: zoveel meter vanaf de eerste (bv. 1,8 m vóór zijn tegenstander). */
  afstand?: number;
  manier?: Manier;
}

/**
 * Panna: speel de bal tussen de benen van `door` door en loop om hem heen om de bal achter hem weer op te pakken.
 * `verder` = hoe ver achter de tegenstander de bal stopt (standaard 2,5 m).
 */
export interface PannaActie extends ActieBasis {
  type: 'panna';
  wie: string;
  door: string;
  verder?: number;
  kant?: 'links' | 'rechts';
}

/**
 * Plukken: de keeper duikt laag naar de bal aan de voet van `van` (of naar de dichtstbijzijnde losse bal) en pakt hem.
 */
export interface PlukActie extends ActieBasis {
  type: 'pluk';
  wie: string;
  van?: string;
}

/** Bal afpakken: de verdediger tikt de bal van `van` af en heeft hem daarna zelf. */
export interface VeroverActie extends ActieBasis {
  type: 'verover';
  wie: string;
  van: string;
}

/** Ander hesje/team, bv. bij tikspelen: wie getikt is wordt tikker. */
export interface TeamActie extends ActieBasis {
  type: 'team';
  wie: string;
  team: Team;
}

export type Actie =
  BalActie | BeweegActie | PersoonActie | AansluitActie | TeamActie | SchijnActie | DrukActie | DekActie | VeroverActie | PannaActie | ZitActie | PlukActie | DraaiActie | AantikActie;

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
    waarden?: Record<string, Waarde[]>;
  };
}

/** Meerdere reeksen stappen tegelijk (bv. twee teams in een estafette); klaar als de langste klaar is. */
export interface TegelijkStap {
  tegelijk: Stap[][];
}

export type Stap = AnimatieStap | HerhaalStap | TegelijkStap;

/** Invulwaarde in een herhaling: tekst, getal, punt of lijst punten (bv. een route). */
export type Waarde = string | number | boolean | Punt | Punt[];

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
  /** Editor-animatie: het patroon herhalen voor de volgende spelers in de rij (zie src/editor/animatie.ts). */
  herhaalRij?: boolean;
  /** Tactiekbord: namen van de spelers onder het poppetje tonen. */
  namen?: boolean;
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
  /**
   * Doorwisselbaar: er zijn er zoveel tegelijk bezig, extra spelers (bij keeperoefeningen: keepers) sluiten aan in de
   * rij of wisselen door. Getoond als "4+". Vast: de oefening is gebouwd op precies dit aantal (partijvorm, rondo).
   */
  doorwisselbaar: boolean;
  /** Alleen bij een vast aantal: korte tip voor als je er meer hebt ("Met meer spelers: …"). */
  meerSpelers?: string;
  /** Combinatievorm: 2–4 onderdelen achter elkaar (bv. voetenwerk → vangen → duiken). Niet meer als badge getoond. */
  combinatievorm?: boolean;
  /** Combinatievorm: de onderdelen in volgorde (2–4 korte namen), getoond als genummerd verloop. */
  onderdelen?: string[];
  coachpunten: string[];
  variaties: { makkelijker: string[]; moeilijker: string[] };
  tekening: Tekening;
  /**
   * Uit de bibliotheek gehaald (src/data/oefeningen/archief.json): niet meer te kiezen, maar trainingen, links, teams en
   * favorieten die hem bevatten tonen hem nog (met "Niet meer in de bibliotheek").
   */
  verwijderd?: boolean;
  /** Eigen oefening (gemaakt in de editor of gekopieerd), badge "Eigen". */
  eigen?: boolean;
  /** Gedeeld in een team (badge met de teamnaam). Id is dan `team-<teamId>-<itemId>`. */
  team?: { id: string; naam: string; itemId: string; eigenaar: string; eigenaarNaam: string };
}

/** Eigen oefening: hetzelfde formaat, met tijden en (bij een kopie) de ingebouwde oefening waar hij van komt. */
export interface EigenOefening extends Oefening {
  eigen: true;
  gemaakt: number;
  gewijzigd: number;
  /** Id van de ingebouwde oefening waarvan dit een kopie is. */
  bron?: string;
}
