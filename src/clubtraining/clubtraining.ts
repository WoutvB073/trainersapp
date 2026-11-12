import type { Leeftijd, Oefening } from '../model/types';
import { isLeeftijd } from '../data/leeftijden';
import { vindCategorie } from '../data/categorieen';
import { geldigeEigen } from '../eigen/eigen';
import { kandidaten, kiesOefening } from '../training/genereren';
import { maakId, metAantal, naarBase64Url, sleutel, uitBase64Url } from '../training/training';
import { lijstTekst, t as vt, TAAL } from '../i18n/t';
import type { Taal } from '../i18n/taal';

/**
 * Circuittraining (zichtbare naam; in de code clubtraining). Sinds 0.32.0 kies je zelf de onderdelen: elk onderdeel heeft een
 * categorie, een duur en is "Stations" (de groepjes draaien door) of "Samen" (alle groepjes tegelijk). Trainingen van vóór 0.32.0
 * hebben alleen `blokken` en worden gelezen als de Mini Talents-opzet (`onderdelenVan`). Alles hier is puur (getest in
 * tests/clubtraining.test.ts en tests/versie-0320.test.ts); de schermen staan in src/screens/club/.
 */

/** De vier vaste blokken van vóór 0.32.0: oude trainingen en links, en de Mini Talents-opzet. */
export type Vorm = 'techniek' | 'een-tegen-een' | 'afwerken';
export type Blok = Vorm | 'partijvormen';
export const VORMEN: readonly Vorm[] = ['techniek', 'een-tegen-een', 'afwerken'];
export const BLOKKEN: readonly Blok[] = [...VORMEN, 'partijvormen'];

export type OnderdeelSoort = 'stations' | 'samen';

/** Eén oefening in een onderdeel (0.33.0). Zonder `minuten` krijgt hij een gelijk deel van de bloktijd. */
export interface BlokOefening {
  oefening: string;
  /** Richttijd in minuten. */
  minuten?: number;
}

export interface Onderdeel {
  /** Vast binnen de training (slepen, oefening kiezen). */
  id: string;
  /** Spelerscategorie. */
  categorie: string;
  /** Minuten. */
  duur: number;
  soort: OnderdeelSoort;
  /** De (eerste) oefening. Blijft altijd ingevuld, zodat oudere versies en oude links hem ook lezen. */
  oefening?: string;
  /** Sinds 0.33.0: alleen bij meer dan één oefening of een richttijd. Lees met `oefeningenVan`, schrijf met `metOefeningen`. */
  oefeningen?: BlokOefening[];
  /**
   * Sinds 0.34.2, alleen bij Samen: zoveel groepjes komen tegelijk op één station (2, 3 …). Leeg (of minstens het aantal groepjes) = alle
   * groepjes tegelijk, zoals vóór 0.34.2. Lees met `samenPer`.
   */
  groepjesSamen?: number;
}

/** Samen met een deel van de groepjes (0.34.2): zoveel groepjes per station, of undefined bij Stations en bij Samen met alle groepjes. */
export function samenPer(o: Pick<Onderdeel, 'soort' | 'groepjesSamen'>, groepjes: number): number | undefined {
  return o.soort === 'samen' && o.groepjesSamen && o.groepjesSamen >= 2 && o.groepjesSamen < groepjes ? o.groepjesSamen : undefined;
}

/** Staat dit onderdeel in de rotatie (Stations, of Samen met een deel van de groepjes)? */
export const inRotatie = (o: Pick<Onderdeel, 'soort' | 'groepjesSamen'>, groepjes: number) => o.soort === 'stations' || samenPer(o, groepjes) !== undefined;

/** Oefeningen in een onderdeel, op volgorde. */
export const oefeningenVan = (o: Pick<Onderdeel, 'oefening' | 'oefeningen'>): BlokOefening[] => (o.oefeningen?.length ? o.oefeningen : o.oefening ? [{ oefening: o.oefening }] : []);

/** Onderdeel met deze oefeningen. Eén oefening zonder richttijd wordt bewaard zoals vóór 0.33.0. */
export function metOefeningen(o: Onderdeel, lijst: BlokOefening[]): Onderdeel {
  const { oefening: _a, oefeningen: _b, ...rest } = o;
  void _a;
  void _b;
  if (!lijst.length) return rest;
  return { ...rest, oefening: lijst[0]!.oefening, ...(lijst.length > 1 || lijst[0]!.minuten !== undefined ? { oefeningen: lijst } : {}) };
}

/** Minuten per oefening: een richttijd telt, de rest van de bloktijd gaat gelijk over de oefeningen zonder richttijd. */
export function oefeningTijden(o: Pick<Onderdeel, 'duur' | 'oefening' | 'oefeningen'>): number[] {
  const lijst = oefeningenVan(o);
  const open = lijst.filter((x) => x.minuten === undefined).length;
  const rest = Math.max(0, o.duur - lijst.reduce((som, x) => som + (x.minuten ?? 0), 0));
  const basis = open ? Math.floor(rest / open) : 0;
  let over = open ? rest % open : 0;
  return lijst.map((x) => x.minuten ?? basis + (over-- > 0 ? 1 : 0));
}

/** De richttijden zijn samen langer dan het onderdeel. */
export const teVeelRichttijd = (o: Pick<Onderdeel, 'duur' | 'oefening' | 'oefeningen'>) => oefeningenVan(o).reduce((som, x) => som + (x.minuten ?? 0), 0) > o.duur;

/** Welke oefening is er na zoveel seconden in dit blok aan de beurt (index)? Na de laatste richttijd blijft het de laatste. */
export function oefeningOpTijd(o: Pick<Onderdeel, 'duur' | 'oefening' | 'oefeningen'>, seconden: number): number {
  const tijden = oefeningTijden(o);
  let t = 0;
  for (let i = 0; i < tijden.length; i += 1) {
    t += tijden[i]! * 60;
    if (seconden < t) return i;
  }
  return Math.max(0, tijden.length - 1);
}

export const MIN_GROEPJES = 2;
export const MAX_GROEPJES = 8;
export const MIN_ONDERDELEN = 3;
export const MAX_ONDERDELEN = 6;
/** Oefeningen per onderdeel. */
export const MAX_BLOK_OEFENINGEN = 6;
export const DUUR_KEUZES: readonly number[] = [5, 10, 12, 15, 20];
export const MAX_DUUR = 90;
export const MAX_KINDEREN = 200;
export const MAX_TRAINERS = 30;
/** Mini Talents: 4 × 15 minuten. */
export const BLOK_DUUR = 15 * 60;

/** Vaste kleur per categorie, met de tekstkleur die erop past. */
export const CATEGORIE_KLEUR: Record<string, { vlak: string; tekst: string }> = {
  techniek: { vlak: '#1c64d8', tekst: '#ffffff' },
  'een-tegen-een': { vlak: '#c92a2a', tekst: '#ffffff' },
  afwerken: { vlak: '#f2b705', tekst: '#1a1a1a' },
  partijvormen: { vlak: '#6a35b8', tekst: '#ffffff' },
  'warming-up': { vlak: '#d9480f', tekst: '#ffffff' },
  loopcoordinatie: { vlak: '#0b7285', tekst: '#ffffff' },
  'pass-en-trap': { vlak: '#2b8a3e', tekst: '#ffffff' },
  positiespel: { vlak: '#a61e4d', tekst: '#ffffff' },
  'verdedigen-omschakelen': { vlak: '#495057', tekst: '#ffffff' },
  spelletjes: { vlak: '#e64980', tekst: '#1a1a1a' },
};
const GEEN_KLEUR = { vlak: '#495057', tekst: '#ffffff' };
export const categorieKleur = (categorie: string) => CATEGORIE_KLEUR[categorie] ?? GEEN_KLEUR;

/** Alle spelerscategorieën die je als onderdeel kunt kiezen. */
export const CATEGORIEEN: readonly string[] = Object.keys(CATEGORIE_KLEUR);

/** Indeling van de trainers die je zelf gemaakt hebt (0.33.1). Zonder veld wordt dat soort plek automatisch verdeeld. */
export interface TrainerKeuzes {
  /** Trainers lopen mee met een groepje. Zonder dit veld blijven ze bij hun station. */
  modus?: 'groepje';
  /** Op stationnummer. */
  stations?: Record<number, string[]>;
  /** Op veldnummer. */
  velden?: Record<number, string[]>;
  /** Samen-onderdelen, op id. */
  samen?: Record<string, string[]>;
  /** Op index van het groepje. */
  groepen?: Record<number, string[]>;
}

/** Trainers van één dag (0.34.0): een circuittraining heeft vaak twee dagen met deels andere trainers. */
export interface DagTrainers {
  trainers: string[];
  trainerKeuzes?: TrainerKeuzes;
  /** Vaste plek uit het rooster: naam → categorie. */
  vast?: Record<string, string>;
  /** Ingevuld volgens het rooster en niet met de hand aangepast. */
  rooster?: boolean;
}

export interface ClubTraining {
  id: string;
  naam: string;
  /** JJJJ-MM-DD; standaard maandag en woensdag van dezelfde week. */
  datums: string[];
  leeftijd: Leeftijd;
  kinderen: number;
  groepjes: number;
  trainers: string[];
  /** Oude opzet (vóór 0.32.0): gekozen oefening per blok. Zonder `onderdelen` telt dit als de Mini Talents-opzet. */
  blokken: Partial<Record<Blok, string>>;
  /** De onderdelen op volgorde (0.32.0). */
  onderdelen?: Onderdeel[];
  /** Begintijd "UU:MM" (optioneel): dan toont de rotatie echte tijden. */
  starttijd?: string;
  /** Eigen sjabloon: staat niet in de lijst met trainingen, maar synchroniseert wel mee. */
  sjabloon?: boolean;
  /** Vóór 0.33.1: zelf gekozen trainer per station (op nummer) en per partijveld. Niet gekozen: automatisch verdeeld. */
  stationTrainers: Record<number, string>;
  veldTrainers: Record<number, string>;
  /** Sinds 0.33.1: meer trainers per plek. Gaat voor op de velden hierboven. */
  trainerKeuzes?: TrainerKeuzes;
  /** Sinds 0.34.0: trainers per dag (index = die van `datums`). Geen dag hier: `trainers` en `trainerKeuzes` gelden. */
  perDag?: DagTrainers[];
  /** Groep uit het trainersrooster (bv. "Mini Talents O6"): daarmee vult de app de trainers per dag. */
  groep?: string;
  /** Afgevinkt materiaal (zie `MateriaalRegel.sleutel`). */
  afgevinkt: string[];
  gemaakt: number;
  gewijzigd: number;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Eerstvolgende maandag (vandaag telt mee) en de woensdag van die week. */
export function standaardDatums(nu = new Date()): string[] {
  const ma = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + ((8 - nu.getDay()) % 7));
  const wo = new Date(ma.getFullYear(), ma.getMonth(), ma.getDate() + 2);
  return [iso(ma), iso(wo)];
}

export function nieuweClub(leeftijd: Leeftijd = 'mini-5-7', nu = Date.now(), id = maakId()): ClubTraining {
  return { id, naam: '', datums: standaardDatums(new Date(nu)), leeftijd, kinderen: 30, groepjes: 6, trainers: [], blokken: {}, stationTrainers: {}, veldTrainers: {}, afgevinkt: [], gemaakt: nu, gewijzigd: nu };
}

/** Onderdelen van een training; een training van vóór 0.32.0 is de Mini Talents-opzet. */
export function onderdelenVan(c: { onderdelen?: Onderdeel[]; blokken?: Partial<Record<Blok, string>> }): Onderdeel[] {
  if (c.onderdelen?.length) return c.onderdelen;
  return BLOKKEN.map((b) => ({ id: b, categorie: b, duur: BLOK_DUUR / 60, soort: b === 'partijvormen' ? 'samen' : 'stations', ...(c.blokken?.[b] ? { oefening: c.blokken[b] } : {}) }));
}

/** Nieuw onderdeel: Partijvormen staat standaard op Samen. */
export const nieuwOnderdeel = (categorie: string, duur = 15, id = maakId()): Onderdeel => ({ id, categorie, duur, soort: categorie === 'partijvormen' ? 'samen' : 'stations' });

/** Begin van "Zelf samenstellen". */
export const zelfOnderdelen = (): Onderdeel[] => [{ ...nieuwOnderdeel('warming-up', 10), soort: 'samen' }, nieuwOnderdeel('techniek', 10), nieuwOnderdeel('afwerken', 10), nieuwOnderdeel('partijvormen', 15)];

/**
 * Ingebouwd sjabloon Mini Talents + loopcoördinatie (0.34.2): in de week van de looptrainer komt Loopcoördinatie in plaats van Techniek,
 * op één station waar steeds 2 groepjes samen komen. 1 tegen 1 en Afwerken blijven stations, het partijspel is met alle groepjes.
 */
export const loopOnderdelen = (): Onderdeel[] => [
  { ...nieuwOnderdeel('loopcoordinatie', 15), soort: 'samen', groepjesSamen: 2 },
  nieuwOnderdeel('een-tegen-een', 15),
  nieuwOnderdeel('afwerken', 15),
  nieuwOnderdeel('partijvormen', 15),
];

const opzet = (lijst: Onderdeel[]) => JSON.stringify(lijst.map((o) => [o.categorie, o.duur, o.soort, o.groepjesSamen ?? 0]));
const STANDAARD_OPZETTEN = () => [opzet(onderdelenVan({})), opzet(zelfOnderdelen()), opzet(loopOnderdelen())];

export const oefeningIds = (c: { onderdelen?: Onderdeel[]; blokken?: Partial<Record<Blok, string>> }) => onderdelenVan(c).flatMap((o) => oefeningenVan(o).map((x) => x.oefening));

/** Niets ingevuld: zo'n clubtraining wordt niet bewaard (de standaarddatums en een onveranderde opzet tellen niet mee). */
export function isLeeg(c: Pick<ClubTraining, 'naam' | 'trainers' | 'blokken' | 'onderdelen' | 'sjabloon' | 'perDag' | 'groep'>): boolean {
  return !c.sjabloon && !c.naam.trim() && !c.groep && !c.trainers.some((x) => x.trim()) && !c.perDag?.some((d) => d.trainers.some((x) => x.trim())) && !oefeningIds(c).length && STANDAARD_OPZETTEN().includes(opzet(onderdelenVan(c)));
}

export function clubNaam(c: Pick<ClubTraining, 'naam'>): string {
  return c.naam.trim() || vt('Circuittraining');
}

export function dupliceer(c: ClubTraining, nu = Date.now(), id = maakId()): ClubTraining {
  return { ...c, id, naam: vt('{w0} (kopie)', { w0: clubNaam(c) }), afgevinkt: [], gemaakt: nu, gewijzigd: nu };
}

const plusWeek = (d: string) => {
  const [j, m, dag] = d.split('-').map(Number);
  return iso(new Date(j!, m! - 1, dag! + 7));
};

/** Dezelfde clubtraining een week later: nieuwe datums, de afvinklijst begint opnieuw. */
export function naarVolgendeWeek(c: ClubTraining, nu = Date.now(), id = maakId()): ClubTraining {
  return { ...c, id, datums: c.datums.map(plusWeek), afgevinkt: [], gemaakt: nu, gewijzigd: nu };
}

/** Opzet bewaren als sjabloon: onderdelen, groepjes, kinderen en leeftijd. Zonder oefeningen, datums en trainers. */
export function alsSjabloon(c: ClubTraining, naam: string, nu = Date.now(), id = maakId()): ClubTraining {
  const onderdelen = onderdelenVan(c).map((o) => ({ ...metOefeningen(o, []), id: maakId() }));
  return { ...nieuweClub(c.leeftijd, nu, id), naam: naam.trim().slice(0, 80), datums: [], kinderen: c.kinderen, groepjes: c.groepjes, onderdelen, sjabloon: true, ...(c.groep ? { groep: c.groep } : {}) };
}

/** Nieuwe training volgens een sjabloon. */
export function uitSjabloon(s: ClubTraining, nu = Date.now(), id = maakId()): ClubTraining {
  return { ...nieuweClub(s.leeftijd, nu, id), kinderen: s.kinderen, groepjes: s.groepjes, onderdelen: onderdelenVan(s).map((o) => ({ ...o, id: maakId() })), ...(s.groep ? { groep: s.groep } : {}) };
}

/** Kinderen per groepje (naar boven afgerond). */
export const groepGrootte = (c: Pick<ClubTraining, 'kinderen' | 'groepjes'>) => Math.max(1, Math.ceil(c.kinderen / c.groepjes));

export const groepNaam = (i: number) => String.fromCharCode(65 + i);

export const blokNaam = (categorie: string) => vindCategorie('veld', categorie)?.naam ?? categorie;

// ---------- stations en rotatie ----------

export interface Station {
  /** 1, 2, 3 … over de hele training. */
  nr: number;
  /** Het onderdeel dat hier staat. */
  onderdeel: string;
  /** Categorie (kleur en naam). */
  vorm: string;
  /** 0 = eerste keer dat dit onderdeel op het veld staat. */
  plek: number;
  /** Zo vaak staat dit onderdeel op het veld. */
  keer: number;
  /** Index van de fase. */
  fase: number;
  /** Sinds 0.34.2: gedeeld station waar zoveel groepjes tegelijk komen. */
  samen?: number;
}

/** Stations die tegelijk op het veld staan, met de rondes waarin de groepjes erlangs draaien. */
export interface Fase {
  nr: number;
  onderdelen: Onderdeel[];
  stations: Station[];
  /** Indexen van de eerste en laatste ronde. */
  eerste: number;
  laatste: number;
}

export interface Ronde {
  /** 1, 2, 3 … */
  nr: number;
  /** Seconden vanaf het begin. */
  begin: number;
  eind: number;
  /** Stations: per groepje waar het staat. Samen: leeg. */
  plekken: Station[];
  /** Stations die in deze ronde leeg blijven. */
  leeg: Station[];
  /** Alle groepjes tegelijk. */
  samen?: Onderdeel;
}

export interface ClubPlan {
  fases: Fase[];
  stations: Station[];
  rondes: Ronde[];
  samen: Onderdeel[];
  /** Seconden. */
  totaal: number;
  /** Onderdelen die langer duren dan ingesteld, omdat ze naast een langer onderdeel staan. */
  verlengd: Onderdeel[];
}

type PlanInhoud = { groepjes: number; onderdelen?: Onderdeel[]; blokken?: Partial<Record<Blok, string>> };

/**
 * Hoe de station-onderdelen over fases gaan bij een aantal groepjes. Zijn er minder onderdelen dan groepjes, dan één fase (de
 * onderdelen staan dan vaker op het veld). Anders fases van minstens zoveel onderdelen als groepjes: elk onderdeel staat dan maar
 * één keer op het veld. Past dat niet precies, dan worden de laatste fases één groter en blijven daar stations leeg.
 */
export function faseGroottes(onderdelen: number, groepjes: number): number[] {
  if (onderdelen <= groepjes) return onderdelen ? [onderdelen] : [];
  const aantal = Math.floor(onderdelen / groepjes);
  const basis = Math.floor(onderdelen / aantal);
  const over = onderdelen % aantal;
  return Array.from({ length: aantal }, (_, i) => basis + (i >= aantal - over ? 1 : 0));
}

/**
 * Vaste eenheden voor de rotatie (0.34.2): groepjes die samen naar een gedeeld station gaan, op volgorde (A+B, C+D …). Gaat het aantal
 * niet precies op, dan is de laatste eenheid kleiner. Zonder gedeeld station is elk groepje een eigen eenheid.
 */
export function eenheden(groepjes: number, per = 1): number[][] {
  const uit: number[][] = [];
  for (let g = 0; g < groepjes; g += per) uit.push(Array.from({ length: Math.min(per, groepjes - g) }, (_, i) => g + i));
  return uit;
}

/** De reeksen van onderdelen die samen roteren (tussen de Samen-onderdelen met alle groepjes), met het aantal groepjes per eenheid. */
function reeksen(lijst: Onderdeel[], groepjes: number): { delen: Onderdeel[]; per: number }[] {
  const uit: { delen: Onderdeel[]; per: number }[] = [];
  let delen: Onderdeel[] = [];
  const sluit = () => {
    if (delen.length) uit.push({ delen, per: delen.map((o) => samenPer(o, groepjes)).find((n) => n !== undefined) ?? 1 });
    delen = [];
  };
  for (const o of lijst) {
    if (inRotatie(o, groepjes)) delen.push(o);
    else sluit();
  }
  sluit();
  return uit;
}

/**
 * Het hele schema. Binnen een fase van k onderdelen staat eenheid u in ronde r op onderdeel (u + r) mod k, plek u div k: elke eenheid
 * doet elk onderdeel één keer en er staan nooit twee eenheden op één station. Een eenheid is één groepje, of sinds 0.34.2 een vast duo
 * of trio als er een Samen-onderdeel met een deel van de groepjes in de reeks staat: op het gedeelde station komen ze samen, op een
 * gewoon onderdeel krijgt elk groepje van de eenheid een eigen station. Alle groepjes wisselen tegelijk, dus een ronde duurt zo lang
 * als het langste onderdeel dat erin zit.
 */
export function clubPlan(c: PlanInhoud): ClubPlan {
  const lijst = onderdelenVan(c);
  const fases: Fase[] = [];
  const stationLijst: Station[] = [];
  const rondes: Ronde[] = [];
  const verlengd = new Set<Onderdeel>();
  let tijd = 0;
  const voegToe = (duur: number, w: Pick<Ronde, 'plekken' | 'leeg' | 'samen'>) => {
    rondes.push({ nr: rondes.length + 1, begin: tijd, eind: tijd + duur, ...w });
    tijd += duur;
  };
  const stationBlok = (delen: Onderdeel[], per: number) => {
    const units = eenheden(c.groepjes, per);
    let van = 0;
    for (const k of faseGroottes(delen.length, units.length)) {
      const onderdelen = delen.slice(van, van + k);
      van += k;
      const keer = Math.ceil(units.length / k);
      const fase = fases.length;
      const gedeeld = (o: Onderdeel) => samenPer(o, c.groepjes) !== undefined;
      const perOnderdeel = new Map<string, Station[]>();
      for (const o of onderdelen) {
        const aantal = gedeeld(o) ? keer : keer * per;
        perOnderdeel.set(
          o.id,
          Array.from({ length: aantal }, (_, plek): Station => ({ nr: 0, onderdeel: o.id, vorm: o.categorie, plek, keer: aantal, fase, ...(gedeeld(o) ? { samen: per } : {}) })),
        );
      }
      const stations = onderdelen.flatMap((o) => perOnderdeel.get(o.id)!);
      stations.forEach((x, i) => (x.nr = stationLijst.length + i + 1));
      stationLijst.push(...stations);
      const eerste = rondes.length;
      for (let r = 0; r < k; r += 1) {
        const plekken: Station[] = [];
        units.forEach((unit, u) => {
          const o = onderdelen[(u + r) % k]!;
          const slot = Math.floor(u / k);
          unit.forEach((g, j) => (plekken[g] = perOnderdeel.get(o.id)![gedeeld(o) ? slot : slot * per + j]!));
        });
        const actief = onderdelen.filter((o) => plekken.some((p) => p.onderdeel === o.id));
        const duur = Math.max(...actief.map((o) => o.duur));
        for (const o of actief) if (o.duur < duur) verlengd.add(o);
        voegToe(duur * 60, { plekken, leeg: stations.filter((x) => !plekken.includes(x)) });
      }
      fases.push({ nr: fases.length + 1, onderdelen, stations, eerste, laatste: rondes.length - 1 });
    }
  };
  const blokken = reeksen(lijst, c.groepjes);
  let volgende = 0;
  for (const o of lijst) {
    if (inRotatie(o, c.groepjes)) {
      // De reeks waar dit onderdeel het eerste van is, komt nu.
      const b = blokken[volgende];
      if (b && b.delen[0] === o) {
        stationBlok(b.delen, b.per);
        volgende += 1;
      }
      continue;
    }
    voegToe(o.duur * 60, { plekken: [], leeg: [], samen: o });
  }
  return { fases, stations: stationLijst, rondes, samen: lijst.filter((o) => !inRotatie(o, c.groepjes)), totaal: tijd, verlengd: [...verlengd] };
}

export function stationNaam(s: Station): string {
  const naam = blokNaam(s.vorm);
  if (s.keer === 1) return naam;
  // "1 tegen 1 2" leest niet: bij een naam die op een cijfer eindigt een streepje ertussen.
  return /\d$/.test(naam) ? `${naam} – ${s.plek + 1}` : `${naam} ${s.plek + 1}`;
}

/** "groepje A en B" (0.34.2). */
export const groepjesTekst = (groepen: number[]) => (groepen.length > 1 ? vt('groepjes {w0}', { w0: lijstTekst(groepen.map(groepNaam)) }) : vt('groepje {w0}', { w0: groepNaam(groepen[0] ?? 0) }));

/** Naam van een gedeeld station zonder ronde: "Loopcoördinatie (2 groepjes samen)". */
export const stationTitel = (s: Station) => (s.samen ? vt('{w0} ({n} groepjes samen)', { w0: stationNaam(s), n: s.samen }) : stationNaam(s));

/** Welke groepjes in deze ronde op dit station staan. */
export const groepenOp = (r: Pick<Ronde, 'plekken'>, nr: number) => r.plekken.flatMap((s, g) => (s.nr === nr ? [g] : []));

/** Naam van een station in een ronde: "Loopcoördinatie – groepje A en B samen". */
export function plekNaam(s: Station, r: Pick<Ronde, 'plekken'>): string {
  const g = groepenOp(r, s.nr);
  return s.samen && g.length > 1 ? vt('{w0} – groepje {w1} samen', { w0: stationNaam(s), w1: lijstTekst(g.map(groepNaam)) }) : stationNaam(s);
}

/**
 * Meldingen bij Samen met een deel van de groepjes (0.34.2): als de groepjes niet precies opgaan, als het gedeelde onderdeel daardoor op
 * meer stations moet staan, of als er in elke ronde een onderdeel leeg blijft. De rotatie kiest dan zelf de beste oplossing.
 */
export function samenMeldingen(c: PlanInhoud): string[] {
  const uit: string[] = [];
  const plan = clubPlan(c);
  for (const b of reeksen(onderdelenVan(c), c.groepjes)) {
    const gedeeld = b.delen.filter((o) => samenPer(o, c.groepjes) !== undefined);
    if (!gedeeld.length) continue;
    const naam = blokNaam(gedeeld[0]!.categorie);
    for (const o of gedeeld.slice(1))
      if (samenPer(o, c.groepjes) !== b.per) uit.push(vt('{w0} en {w1} staan in dezelfde rotatie met een ander aantal groepjes samen. Bij allebei komen nu {n} groepjes samen.', { w0: naam, w1: blokNaam(o.categorie), n: b.per }));
    const units = eenheden(c.groepjes, b.per);
    const laatste = units[units.length - 1]!;
    if (laatste.length < b.per)
      uit.push(
        laatste.length === 1
          ? vt('{g} groepjes gaan niet precies per {n}. Bij {w0} komt {w1} alleen.', { g: c.groepjes, n: b.per, w0: naam, w1: groepjesTekst(laatste) })
          : vt('{g} groepjes gaan niet precies per {n}. Bij {w0} komen {w1} samen.', { g: c.groepjes, n: b.per, w0: naam, w1: groepjesTekst(laatste) }),
      );
    for (const f of plan.fases.filter((x) => x.onderdelen.some((o) => b.delen.includes(o)))) {
      const k = f.onderdelen.length;
      const meer = f.stations.find((s) => s.samen && s.keer > 1);
      if (meer) uit.push(vt('Er gaan {u} keer {n} groepjes langs {k} onderdelen, dus {w0} staat op {s} stations. Wil je één station, voeg dan een onderdeel toe aan de rotatie.', { u: units.length, n: b.per, k, w0: blokNaam(meer.vorm), s: meer.keer }));
      else if (units.length < k) uit.push(vt('Er gaan maar {u} keer {n} groepjes langs {k} onderdelen: in elke ronde blijft er een onderdeel leeg.', { u: units.length, n: b.per, k }));
    }
  }
  return uit;
}

export const vindOnderdeel = (c: { onderdelen?: Onderdeel[]; blokken?: Partial<Record<Blok, string>> }, id: string) => onderdelenVan(c).find((o) => o.id === id);

const klokTijd = (start: string, seconden: number) => {
  const [u, m] = start.split(':').map(Number);
  const totaal = (u! * 60 + m! + Math.round(seconden / 60)) % (24 * 60);
  return `${String(Math.floor(totaal / 60)).padStart(2, '0')}:${String(totaal % 60).padStart(2, '0')}`;
};

/** Begin en eind van een ronde: de klok als er een begintijd is, anders minuten vanaf de start. */
export function rondeTijd(r: Pick<Ronde, 'begin' | 'eind'>, starttijd?: string): string {
  if (starttijd && /^\d{2}:\d{2}$/.test(starttijd)) return `${klokTijd(starttijd, r.begin)}–${klokTijd(starttijd, r.eind)}`; // i18n-ok
  return `${r.begin / 60}–${r.eind / 60} min`; // i18n-ok
}

/** Totale tijd in woorden: "1 uur 5 min", "45 min". */
export function tijdTekst(seconden: number): string {
  const min = Math.round(seconden / 60);
  const uur = Math.floor(min / 60);
  return uur ? vt('{u} uur {m} min', { u: uur, m: min % 60 }) : vt('{m} min', { m: min });
}

// ---------- partijvelden ----------

export interface Partijveld {
  nr: number;
  /** Indexen van de groepjes. */
  groepen: number[];
  /** Oneven aantal groepjes: dit groepje speelt onderling, met de trainer als joker. */
  metTrainer: boolean;
}

/** Partijvormen: bij 2 groepjes één veld (A tegen B), bij meer groepjes 2 per veld en bij een oneven aantal een joker. */
export function partijvelden(groepjes: number): Partijveld[] {
  return Array.from({ length: Math.ceil(groepjes / 2) }, (_, i) => {
    const groepen = [2 * i, 2 * i + 1].filter((g) => g < groepjes);
    return { nr: i + 1, groepen, metTrainer: groepen.length === 1 };
  });
}

// ---------- veldplan ----------

/** Plek op een staand half veld, in procenten. */
export interface Vak {
  x: number;
  y: number;
  b: number;
  h: number;
}

const RAND = 4;

function raster(i: number, kolommen: number, rijen: number): Vak {
  const b = (100 - 2 * RAND) / kolommen;
  const h = (100 - 2 * RAND) / rijen;
  return { x: RAND + (i % kolommen) * b, y: RAND + Math.floor(i / kolommen) * h, b, h };
}

/** De stations van een fase verdeeld over het halve veld. Twee keer dezelfde vorm staat naast elkaar. */
export function stationVak(s: Station, f: Pick<Fase, 'stations'>): Vak {
  const aantal = f.stations.length;
  const kolommen = aantal <= 3 ? 1 : aantal <= 8 ? 2 : 3;
  return raster(f.stations.indexOf(s), kolommen, Math.ceil(aantal / kolommen));
}

/** Tot 3 velden onder elkaar, 4 velden 2 × 2. */
export function veldVak(v: Partijveld, aantal: number): Vak {
  return aantal > 3 ? raster(v.nr - 1, 2, Math.ceil(aantal / 2)) : raster(v.nr - 1, 1, aantal);
}

// ---------- trainers ----------

/**
 * Trainers (0.33.1): meer trainers per plek. Zonder keuzes worden alle trainers eerlijk verdeeld: per fase over de stations, en over de
 * partijvelden of de groepjes. Bij een Samen-onderdeel zonder partijvelden staat iedereen op die ene plek. Zodra je iets aanpast, staat
 * de hele verdeling van dat soort plek vast (`zetPlekTrainers`), zodat de rest niet verschuift; dan kan het botsen (`botsingen`).
 * Trainingen van vóór 0.33.1 hebben alleen `stationTrainers` en `veldTrainers` met één naam per plek: die tellen nog als gekozen.
 */
export const trainerNamen = (c: Pick<ClubTraining, 'trainers'>) => [...new Set(c.trainers.map((x) => x.trim()).filter(Boolean))];

export type TrainerModus = 'station' | 'groepje';
export const trainerModus = (c: { trainerKeuzes?: TrainerKeuzes }): TrainerModus => (c.trainerKeuzes?.modus === 'groepje' ? 'groepje' : 'station');

type TrainerInhoud = PlanInhoud & Pick<ClubTraining, 'trainers' | 'stationTrainers' | 'veldTrainers' | 'trainerKeuzes'> & { vast?: Record<string, string> };

interface Indeling {
  stations: Record<number, string[]>;
  velden: Record<number, string[]>;
  /** Index van het groepje. */
  groepen: Record<number, string[]>;
}

/** Telkens naar de plek met de minste trainers (bij gelijk: de eerste): zo verschillen ze hooguit één trainer. */
function verdeel(lijst: string[], plekken: number[], uit: Record<number, string[]>) {
  for (const p of plekken) uit[p] ??= [];
  if (!plekken.length) return;
  for (const n of lijst) uit[plekken.reduce((a, b) => (uit[b]!.length < uit[a]!.length ? b : a))]!.push(n);
}

/** Namen die nog bestaan, zonder dubbele. */
const geldig = (lijst: string[] | undefined, alle: string[]) => [...new Set((lijst ?? []).filter((n) => alle.includes(n)))];

/** Keuze van vóór 0.33.1: één naam, of leeg voor geen trainer. Een naam die niet meer bestaat telt niet. */
function oudeKeuze(keuze: string | undefined, alle: string[]): string[] | undefined {
  if (keuze === undefined) return undefined;
  if (keuze === '') return [];
  return alle.includes(keuze) ? [keuze] : undefined;
}

/**
 * Plekken die al gekozen zijn houden hun trainers. Een trainer met een vaste plek (rooster) gaat naar een plek van zijn categorie als die
 * er is (`vastOp`); de rest gaat over de andere plekken.
 */
function verdeelMetOud(nrs: number[], oud: Record<number, string> | undefined, alle: string[], uit: Record<number, string[]>, vastOp: (naam: string) => number[] = () => []) {
  const open: number[] = [];
  const bezet = new Set<string>();
  for (const nr of nrs) {
    const keuze = oudeKeuze(oud?.[nr], alle);
    if (!keuze) open.push(nr);
    else {
      uit[nr] = keuze;
      keuze.forEach((n) => bezet.add(n));
    }
  }
  for (const nr of open) uit[nr] = [];
  const rest: string[] = [];
  const metVast = new Set<number>();
  for (const n of alle.filter((x) => !bezet.has(x))) {
    const plekken = vastOp(n).filter((p) => open.includes(p));
    if (plekken.length) {
      verdeel([n], plekken, uit);
      plekken.filter((p) => uit[p]!.includes(n)).forEach((p) => metVast.add(p));
    } else rest.push(n);
  }
  // Sinds 0.34.2: de anderen gaan naar de stations zonder vaste trainer (de looptrainer staat alleen bij Loopcoördinatie).
  const vrij = open.filter((p) => !metVast.has(p));
  verdeel(rest, vrij.length ? vrij : open, uit);
}

export function trainerIndeling(c: TrainerInhoud, plan: ClubPlan = clubPlan(c)): Indeling {
  const alle = trainerNamen(c);
  const k = c.trainerKeuzes;
  const stations: Record<number, string[]> = {};
  for (const f of plan.fases) {
    // Zijn er minder trainers dan stations, dan eerst elk onderdeel één keer.
    const volgorde = [...f.stations].sort((x, y) => x.plek - y.plek || x.nr - y.nr).map((x) => x.nr);
    if (k?.stations) for (const nr of volgorde) stations[nr] = geldig(k.stations[nr], alle);
    else verdeelMetOud(volgorde, c.stationTrainers, alle, stations, (n) => f.stations.filter((s) => c.vast?.[n] === s.vorm).map((s) => s.nr));
  }
  const velden: Record<number, string[]> = {};
  const veldNrs = partijvelden(c.groepjes).map((v) => v.nr);
  if (k?.velden) for (const nr of veldNrs) velden[nr] = geldig(k.velden[nr], alle);
  else verdeelMetOud(veldNrs, c.veldTrainers, alle, velden, (n) => (c.vast?.[n] === 'partijvormen' ? veldNrs : []));
  const groepen: Record<number, string[]> = {};
  const groepNrs = Array.from({ length: c.groepjes }, (_, g) => g);
  if (k?.groepen) for (const g of groepNrs) groepen[g] = geldig(k.groepen[g], alle);
  else verdeel(alle, groepNrs, groepen);
  return { stations, velden, groepen };
}

const samen = (lijsten: string[][]) => [...new Set(lijsten.flat())];

/** Trainers op dit station. Lopen ze mee met een groepje, dan hangt dat af van de ronde: zie `rondePlekken`. */
export const stationPloeg = (c: TrainerInhoud, nr: number): string[] => (trainerModus(c) === 'groepje' ? [] : (trainerIndeling(c).stations[nr] ?? []));

export function veldPloeg(c: TrainerInhoud, nr: number): string[] {
  const ind = trainerIndeling(c);
  if (trainerModus(c) === 'station') return ind.velden[nr] ?? [];
  return samen((partijvelden(c.groepjes).find((v) => v.nr === nr)?.groepen ?? []).map((g) => ind.groepen[g] ?? []));
}

/** Samen-onderdeel zonder partijvelden: standaard iedereen. */
export function samenPloeg(c: TrainerInhoud, o: Pick<Onderdeel, 'id'>): string[] {
  const alle = trainerNamen(c);
  const keuze = trainerModus(c) === 'station' ? c.trainerKeuzes?.samen?.[o.id] : undefined;
  return keuze ? geldig(keuze, alle) : alle;
}

export const groepPloeg = (c: TrainerInhoud, g: number): string[] => trainerIndeling(c).groepen[g] ?? [];

/** Een plek in een ronde, met wie er staat. */
export interface RondePlek {
  /** s:3 = station, v:1 = partijveld, o:id = Samen-onderdeel. */
  sleutel: string;
  naam: string;
  trainers: string[];
  /** Indexen van de groepjes die hier staan. */
  groepen: number[];
  onderdeel?: Onderdeel;
  station?: Station;
  veld?: Partijveld;
}

export function rondePlekken(c: TrainerInhoud, ronde: Ronde, plan: ClubPlan = clubPlan(c)): RondePlek[] {
  const ind = trainerIndeling(c, plan);
  const mee = trainerModus(c) === 'groepje';
  const vanGroepen = (groepen: number[]) => samen(groepen.map((g) => ind.groepen[g] ?? []));
  const o = ronde.samen;
  if (o && o.categorie !== 'partijvormen') return [{ sleutel: `o:${o.id}`, naam: blokNaam(o.categorie), trainers: samenPloeg(c, o), groepen: Array.from({ length: c.groepjes }, (_, g) => g), onderdeel: o }];
  if (o) return partijvelden(c.groepjes).map((v) => ({ sleutel: `v:${v.nr}`, naam: vt('Veld {nr}', { nr: v.nr }), trainers: mee ? vanGroepen(v.groepen) : (ind.velden[v.nr] ?? []), groepen: v.groepen, onderdeel: o, veld: v }));
  const uit: RondePlek[] = [];
  for (const [g, s] of ronde.plekken.entries()) {
    const al = uit.find((p) => p.station?.nr === s.nr);
    if (al) {
      al.groepen.push(g);
      if (mee) al.trainers = samen([al.trainers, ind.groepen[g] ?? []]);
      continue;
    }
    uit.push({ sleutel: `s:${s.nr}`, naam: stationNaam(s), trainers: mee ? (ind.groepen[g] ?? []) : (ind.stations[s.nr] ?? []), groepen: [g], onderdeel: vindOnderdeel(c, s.onderdeel), station: s });
  }
  // Gedeeld station: "Loopcoördinatie – groepje A en B samen".
  for (const p of uit) if (p.station?.samen && p.groepen.length > 1) p.naam = plekNaam(p.station, ronde);
  return uit;
}

export interface Botsing {
  naam: string;
  /** De plekken waar deze trainer tegelijk staat. */
  plekken: string[];
  /** Nummers van de rondes. */
  rondes: number[];
}

/** Trainers die in een ronde op meer plekken tegelijk staan. */
export function botsingen(c: TrainerInhoud): Botsing[] {
  const plan = clubPlan(c);
  const uit = new Map<string, Botsing>();
  for (const r of plan.rondes) {
    const waar = new Map<string, string[]>();
    for (const p of rondePlekken(c, r, plan)) for (const n of p.trainers) waar.set(n, [...(waar.get(n) ?? []), p.naam]);
    for (const [naam, plekken] of waar) {
      if (plekken.length < 2) continue;
      const op = [...plekken].sort();
      const k = `${naam}|${op.join('|')}`;
      const b = uit.get(k) ?? { naam, plekken: op, rondes: [] };
      b.rondes.push(r.nr);
      uit.set(k, b);
    }
  }
  return [...uit.values()];
}

/** Trainers die in de vaste indeling ergens geen plek hebben (bv. net toegevoegd). */
export function nietIngedeeld(c: TrainerInhoud): string[] {
  const plan = clubPlan(c);
  const ind = trainerIndeling(c, plan);
  const alle = trainerNamen(c);
  const groepen: string[][] = trainerModus(c) === 'groepje' ? [samen(Object.values(ind.groepen))] : [...plan.fases.map((f) => samen(f.stations.map((s) => ind.stations[s.nr] ?? []))), ...(plan.samen.some((o) => o.categorie === 'partijvormen') ? [samen(Object.values(ind.velden))] : [])];
  return alle.filter((n) => groepen.some((g) => !g.includes(n)));
}

/** Plekken zonder trainer: stations of groepjes. Leeg als er geen trainers zijn ingevuld. */
export function zonderTrainer(c: TrainerInhoud): string[] {
  if (!trainerNamen(c).length) return [];
  const plan = clubPlan(c);
  const ind = trainerIndeling(c, plan);
  if (trainerModus(c) === 'groepje') return Array.from({ length: c.groepjes }, (_, g) => g).filter((g) => !ind.groepen[g]?.length).map(groepNaam);
  return plan.stations.filter((s) => !ind.stations[s.nr]?.length).map((s) => String(s.nr));
}

/** Wat deze trainer per ronde doet. `leeg`: het eigen station staat deze ronde leeg. */
export function mijnRondes(c: TrainerInhoud, naam: string): { ronde: Ronde; plek?: RondePlek; leeg?: Station }[] {
  const plan = clubPlan(c);
  const ind = trainerIndeling(c, plan);
  const mee = trainerModus(c) === 'groepje';
  return plan.rondes.map((ronde) => ({ ronde, plek: rondePlekken(c, ronde, plan).find((p) => p.trainers.includes(naam)), leeg: mee ? undefined : ronde.leeg.find((s) => ind.stations[s.nr]?.includes(naam)) }));
}

// Handmatig aanpassen. Sleutels: s:3 = station, v:1 = veld, o:id = Samen-onderdeel, g:0 = groepje.

/** Trainers op een plek. */
export function plekTrainers(c: TrainerInhoud, sleutel: string): string[] {
  const [soort, id] = [sleutel[0], sleutel.slice(2)];
  const ind = trainerIndeling(c);
  if (soort === 's') return ind.stations[Number(id)] ?? [];
  if (soort === 'v') return ind.velden[Number(id)] ?? [];
  if (soort === 'g') return ind.groepen[Number(id)] ?? [];
  return samenPloeg(c, { id });
}

/** Plekken die tegelijk bestaan: daar kun je een trainer naartoe verplaatsen. */
export function buurPlekken(c: TrainerInhoud, sleutel: string): { sleutel: string; naam: string }[] {
  const [soort, id] = [sleutel[0], sleutel.slice(2)];
  if (soort === 's') {
    const fase = clubPlan(c).fases.find((f) => f.stations.some((s) => s.nr === Number(id)));
    return (fase?.stations ?? []).filter((s) => s.nr !== Number(id)).map((s) => ({ sleutel: `s:${s.nr}`, naam: `${s.nr}. ${stationNaam(s)}` }));
  }
  if (soort === 'v') return partijvelden(c.groepjes).filter((v) => v.nr !== Number(id)).map((v) => ({ sleutel: `v:${v.nr}`, naam: vt('Veld {nr}', { nr: v.nr }) }));
  if (soort === 'g') return Array.from({ length: c.groepjes }, (_, g) => g).filter((g) => g !== Number(id)).map((g) => ({ sleutel: `g:${g}`, naam: vt('Groepje {g}', { g: groepNaam(g) }) }));
  return [];
}

/** Andere trainers op een plek. De rest van de verdeling van dat soort plek staat daarna vast. */
export function zetPlekTrainers(c: TrainerInhoud, sleutel: string, lijst: string[]): TrainerKeuzes {
  const [soort, id] = [sleutel[0], sleutel.slice(2)];
  const k = { ...c.trainerKeuzes };
  const ind = trainerIndeling(c);
  if (soort === 's') k.stations = { ...ind.stations, [Number(id)]: lijst };
  else if (soort === 'v') k.velden = { ...ind.velden, [Number(id)]: lijst };
  else if (soort === 'g') k.groepen = { ...ind.groepen, [Number(id)]: lijst };
  else k.samen = { ...k.samen, [id]: lijst };
  return k;
}

export function verplaatsTrainer(c: TrainerInhoud, naam: string, van: string, naar: string): TrainerKeuzes {
  const zonder = zetPlekTrainers(c, van, plekTrainers(c, van).filter((n) => n !== naam));
  const tussen = { ...c, trainerKeuzes: zonder };
  return zetPlekTrainers(tussen, naar, [...plekTrainers(tussen, naar).filter((n) => n !== naam), naam]);
}

/** Terug naar automatisch verdelen. De keuze blijven of meelopen blijft staan. */
export const zonderIndeling = (k: TrainerKeuzes | undefined): TrainerKeuzes => (k?.modus === 'groepje' ? { modus: 'groepje' } : {});

/** Is er iets met de hand aangepast? */
export const metHandIngedeeld = (c: Pick<ClubTraining, 'stationTrainers' | 'veldTrainers' | 'trainerKeuzes'>) => !!(c.trainerKeuzes?.stations || c.trainerKeuzes?.velden || c.trainerKeuzes?.samen || c.trainerKeuzes?.groepen || Object.keys(c.stationTrainers ?? {}).length || Object.keys(c.veldTrainers ?? {}).length);

// ---------- trainers per dag (0.34.0) ----------

type MetDagen = TrainerInhoud & Pick<ClubTraining, 'datums'> & { perDag?: DagTrainers[] };

/** De training zoals hij op een dag is: met de trainers en de indeling van die dag. Zonder eigen dag gelden de algemene trainers. */
export function opDag<T extends MetDagen>(c: T, dag: number): T {
  const d = c.perDag?.[dag];
  if (!d) return c;
  const { trainerKeuzes: _k, vast: _v, ...rest } = c;
  void _k;
  void _v;
  return { ...rest, trainers: d.trainers, stationTrainers: {}, veldTrainers: {}, ...(d.trainerKeuzes ? { trainerKeuzes: d.trainerKeuzes } : {}), ...(d.vast ? { vast: d.vast } : {}) } as T;
}

/** Kun je per dag kiezen? Pas vanaf twee datums. */
export const heeftDagen = (c: Pick<ClubTraining, 'datums'>) => c.datums.length > 1;

/** De dag die er nu toe doet: vandaag of de eerstvolgende datum, anders de eerste. */
export function standaardDag(datums: string[], vandaag = new Date().toISOString().slice(0, 10)): number {
  const i = datums.findIndex((d) => d >= vandaag);
  return i < 0 ? 0 : i;
}

/** Hoe de trainers van een dag eruitzien, ook als die nog niet apart staan. */
const dagVan = (c: Pick<ClubTraining, 'perDag' | 'trainers' | 'trainerKeuzes'>, i: number): DagTrainers => c.perDag?.[i] ?? { trainers: c.trainers, ...(c.trainerKeuzes ? { trainerKeuzes: c.trainerKeuzes } : {}) };

/**
 * Trainers of indeling van één dag wijzigen (met de hand: dan telt het rooster voor die dag niet meer). Met één datum en nog geen
 * dagen blijft het zoals vóór 0.34.0: de algemene trainers.
 */
export function zetDagTrainers(c: Pick<ClubTraining, 'datums' | 'perDag' | 'trainers' | 'trainerKeuzes'>, dag: number, w: Partial<Pick<DagTrainers, 'trainers' | 'trainerKeuzes'>>): Partial<ClubTraining> {
  if (!c.perDag && c.datums.length < 2) return w;
  const aantal = Math.max(c.datums.length, c.perDag?.length ?? 0, dag + 1);
  return {
    perDag: Array.from({ length: aantal }, (_, i) => {
      const d = dagVan(c, i);
      if (i !== dag) return d;
      const { rooster: _r, ...rest } = { ...d, ...w };
      void _r;
      return rest;
    }),
  };
}

/** Indeling overal terug naar automatisch (andere stations). Met `groepenHouden` blijft de indeling per groepje staan. */
export function zonderIndelingOveral(c: Pick<ClubTraining, 'trainerKeuzes' | 'perDag'>, groepenHouden = false): Partial<ClubTraining> {
  const leeg = (k: TrainerKeuzes | undefined): TrainerKeuzes => ({ ...(k?.modus ? { modus: k.modus } : {}), ...(groepenHouden && k?.groepen ? { groepen: k.groepen } : {}) });
  return { stationTrainers: {}, veldTrainers: {}, trainerKeuzes: leeg(c.trainerKeuzes), ...(c.perDag ? { perDag: c.perDag.map((d) => ({ ...d, trainerKeuzes: leeg(d.trainerKeuzes) })) } : {}) };
}

/** Blijven of meelopen: voor alle dagen tegelijk. */
export function zetModusOveral(c: Pick<ClubTraining, 'trainerKeuzes' | 'perDag'>, modus: TrainerModus): Partial<ClubTraining> {
  const zet = (k: TrainerKeuzes | undefined): TrainerKeuzes => {
    const { modus: _m, ...rest } = k ?? {};
    void _m;
    return modus === 'groepje' ? { ...rest, modus: 'groepje' } : rest;
  };
  return { trainerKeuzes: zet(c.trainerKeuzes), ...(c.perDag ? { perDag: c.perDag.map((d) => ({ ...d, trainerKeuzes: zet(d.trainerKeuzes) })) } : {}) };
}

// ---------- oefeningen kiezen ----------

export interface KiesBron {
  alle: Oefening[];
  favorieten: ReadonlySet<string>;
  /** Getal in [0, 1). */
  toeval: () => number;
}

type KiesInhoud = Pick<ClubTraining, 'kinderen' | 'groepjes' | 'leeftijd' | 'blokken' | 'onderdelen'>;

/** Zoveel kinderen doen tegelijk mee: een groepje op een station, twee op een partijveld, anders iedereen. */
export function onderdeelSpelers(c: Pick<ClubTraining, 'kinderen' | 'groepjes'>, o: Pick<Onderdeel, 'soort' | 'categorie' | 'groepjesSamen'>): number {
  if (o.soort === 'stations') return groepGrootte(c);
  const per = samenPer(o, c.groepjes);
  if (per) return per * groepGrootte(c);
  return o.categorie === 'partijvormen' ? 2 * groepGrootte(c) : c.kinderen;
}

/** Oefeningen die bij dit onderdeel kunnen: leeftijd, categorie en het aantal kinderen. */
export function onderdeelKandidaten(c: KiesInhoud, o: Onderdeel, alle: Oefening[]): Oefening[] {
  return kandidaten({ soort: 'veld', categorie: o.categorie }, { alle, spelers: onderdeelSpelers(c, o), keepers: 0, leeftijd: c.leeftijd });
}

/** Een (andere) oefening voor dit onderdeel. */
export function genereerOnderdeel(c: KiesInhoud, o: Onderdeel, bron: KiesBron): string | undefined {
  const uit = new Set(oefeningIds(c));
  const context = { alle: bron.alle, spelers: onderdeelSpelers(c, o), keepers: 0, leeftijd: c.leeftijd, favorieten: bron.favorieten, recent: new Map<string, number>(), toeval: bron.toeval };
  return (kiesOefening({ soort: 'veld', categorie: o.categorie }, context, uit) ?? kiesOefening({ soort: 'veld', categorie: o.categorie }, context, new Set()))?.id;
}

/** Alle onderdelen nieuwe oefeningen geven: evenveel als er stonden, en minstens één. */
export function genereerAlles(c: KiesInhoud, bron: KiesBron): Onderdeel[] {
  const oud = onderdelenVan(c);
  let nu: Onderdeel[] = oud.map((o) => metOefeningen(o, []));
  oud.forEach((o) => {
    for (let i = 0; i < Math.max(1, oefeningenVan(o).length); i += 1) {
      const huidig = nu.find((x) => x.id === o.id)!;
      const id = genereerOnderdeel({ ...c, onderdelen: nu }, huidig, bron);
      if (id && !oefeningenVan(huidig).some((x) => x.oefening === id)) nu = nu.map((x) => (x.id === o.id ? metOefeningen(x, [...oefeningenVan(x), { oefening: id }]) : x));
    }
  });
  return nu;
}

// ---------- materiaal ----------

export interface MateriaalRegel {
  /** Blijft gelijk (afvinken). */
  sleutel: string;
  tekst: string;
  /** Oefeningen die dit gebruiken. */
  bij: string[];
}

export interface Materiaal {
  /** Stations. */
  stations: MateriaalRegel[];
  /** Alleen wat er voor de samen-onderdelen nog bij moet. */
  extra: MateriaalRegel[];
}

interface Telling {
  aantal?: number;
  tekst: string;
  bij: Set<string>;
}

/** Hetzelfde materiaal onder een andere naam telt samen. */
// i18n-ok (woorden uit de oefenteksten)
const ZELFDE: Record<string, string> = { bal: 'voetbal', 'klein doeltje': 'mini-goaltje', 'mini-doeltje': 'mini-goaltje', ball: 'football', 'mini goal': 'mini-goal', 'small goal': 'mini-goal' };

/** "8 hoedjes voor de poortjes", "1 voetbal per kind" → aantal en het materiaal zelf, zonder toevoeging. */
function ontleed(regel: string, kinderen: number): { aantal?: number; naam: string } {
  const m = /^(\d+)\+?(?:\s*[–-]\s*(\d+))?\s+(.+)$/.exec(regel.trim());
  let aantal = m ? Math.max(Number(m[1]), Number(m[2] ?? 0)) : undefined;
  let naam = (m ? m[3]! : regel).trim();
  if (aantal !== undefined && /\s(per kind|per child|per speler|per player)$/i.test(naam)) aantal *= kinderen;
  if (aantal !== undefined && /\s(per tweetal|per pair)$/i.test(naam)) aantal *= Math.ceil(kinderen / 2);
  naam = naam.replace(/\s+(per|voor|for|in|op|on)\s.*$/i, '').trim();
  return { aantal, naam };
}

function tel(per: Map<string, Telling>, o: Oefening, keer: number, kinderen: number, taal: Taal) {
  for (const regel of o.benodigdheden) {
    const { aantal, naam } = ontleed(regel, kinderen);
    const ruw = sleutel(naam, taal);
    if (!ruw) continue;
    const k = ZELFDE[ruw] ?? ruw;
    const nu = per.get(k) ?? { tekst: naam, bij: new Set<string>() };
    if (aantal !== undefined) nu.aantal = (nu.aantal ?? 0) + aantal * keer;
    nu.bij.add(o.naam);
    per.set(k, nu);
  }
}

/** De oefeningen van een onderdeel doe je na elkaar op dezelfde plek: per soort materiaal telt het grootste aantal, niet de som. */
function blokTelling(o: Onderdeel, vind: (id: string) => Oefening | undefined, kinderen: number, taal: Taal): Map<string, Telling> {
  const uit = new Map<string, Telling>();
  for (const x of oefeningenVan(o)) {
    const oefening = vind(x.oefening);
    if (!oefening) continue;
    const los = new Map<string, Telling>();
    tel(los, oefening, 1, kinderen, taal);
    for (const [k, v] of los) {
      const nu = uit.get(k);
      if (!nu) {
        uit.set(k, v);
        continue;
      }
      if (v.aantal !== undefined) nu.aantal = Math.max(nu.aantal ?? 0, v.aantal);
      for (const naam of v.bij) nu.bij.add(naam);
    }
  }
  return uit;
}

/** Blok meetellen: dit materiaal staat `keer` keer tegelijk op het veld, dus dat telt op. */
function telBlok(per: Map<string, Telling>, blok: Map<string, Telling>, keer: number) {
  for (const [k, x] of blok) {
    const nu = per.get(k) ?? { tekst: x.tekst, bij: new Set<string>() };
    if (x.aantal !== undefined) nu.aantal = (nu.aantal ?? 0) + x.aantal * keer;
    for (const naam of x.bij) nu.bij.add(naam);
    per.set(k, nu);
  }
}

/**
 * Wat er klaar moet staan: het materiaal per station × het aantal keer dat die oefening op het veld staat, opgeteld. Staan er meer
 * oefeningen in een onderdeel, dan telt daarbinnen het grootste aantal (zie `blokTelling`). Materiaal van de stations gebruik je
 * opnieuw voor de samen-onderdelen; daarvoor telt alleen wat er meer nodig is.
 */
export function materiaal(c: Pick<ClubTraining, 'groepjes' | 'kinderen' | 'blokken' | 'onderdelen'>, vind: (id: string) => Oefening | undefined, taal: Taal = TAAL): Materiaal {
  const kinderen = groepGrootte(c);
  const plan = clubPlan(c);
  const deel1 = new Map<string, Telling>();
  for (const f of plan.fases) {
    for (const o of f.onderdelen) telBlok(deel1, blokTelling(o, vind, kinderen * (samenPer(o, c.groepjes) ?? 1), taal), f.stations.filter((s) => s.onderdeel === o.id).length);
  }
  const deel2 = new Map<string, Telling>();
  for (const o of plan.samen) {
    if (o.categorie === 'partijvormen') telBlok(deel2, blokTelling(o, vind, 2 * kinderen, taal), partijvelden(c.groepjes).length);
    else telBlok(deel2, blokTelling(o, vind, c.kinderen, taal), 1);
  }

  const regel = (deel: string, k: string, x: Telling, aantal?: number): MateriaalRegel => ({ sleutel: `${deel}:${k}`, tekst: aantal === undefined ? x.tekst : metAantal(k, aantal, taal), bij: [...x.bij] });
  const stationsLijst = [...deel1].map(([k, x]) => regel('1', k, x, x.aantal));
  const extra: MateriaalRegel[] = [];
  for (const [k, x] of deel2) {
    const al = deel1.get(k);
    if (!al) extra.push(regel('2', k, x, x.aantal));
    else if (x.aantal !== undefined && x.aantal > (al.aantal ?? 0) && al.aantal !== undefined) extra.push(regel('2', k, x, x.aantal - al.aantal));
  }
  const opNaam = (a: MateriaalRegel, b: MateriaalRegel) => a.sleutel.localeCompare(b.sleutel);
  return { stations: stationsLijst.sort(opNaam), extra: extra.sort(opNaam) };
}

// ---------- delen ----------

/** Wat er in de link staat voor de trainers. */
export interface GedeeldeClub {
  naam: string;
  datums: string[];
  leeftijd: Leeftijd;
  kinderen: number;
  groepjes: number;
  trainers: string[];
  blokken: Partial<Record<Blok, string>>;
  onderdelen?: Onderdeel[];
  starttijd?: string;
  stationTrainers: Record<number, string>;
  veldTrainers: Record<number, string>;
  trainerKeuzes?: TrainerKeuzes;
  perDag?: DagTrainers[];
  groep?: string;
  /** Eigen oefeningen die erin zitten: die gaan in hun geheel mee. */
  eigen?: Oefening[];
}

const kort = (id: string) => id.replace(/^veld-/, 'v:');
const lang = (id: string) => id.replace(/^v:/, 'veld-');

type Inhoud = Pick<ClubTraining, 'naam' | 'datums' | 'leeftijd' | 'kinderen' | 'groepjes' | 'trainers' | 'blokken' | 'onderdelen' | 'starttijd' | 'stationTrainers' | 'veldTrainers' | 'trainerKeuzes' | 'perDag' | 'groep'>;

/** In de link krijgen de onderdelen nieuwe id's (o1, o2 …): daar horen ook de trainers van de Samen-onderdelen bij. */
function keuzesVoorLink(c: Inhoud, k: TrainerKeuzes | undefined = c.trainerKeuzes): TrainerKeuzes | undefined {
  if (!k || !Object.keys(k).length) return undefined;
  if (!k.samen) return k;
  const samen: Record<string, string[]> = {};
  onderdelenVan(c).forEach((o, i) => {
    if (k.samen![o.id]) samen[`o${i + 1}`] = k.samen![o.id]!;
  });
  return { ...k, samen };
}

/**
 * Link voor de trainers (versie 2 sinds 0.32.0: de onderdelen). Links met versie 1 blijven te lezen. Meer oefeningen in een onderdeel
 * (0.33.0) staan als vijfde veld achter de eerste oefening; een oudere versie slaat dat over en toont de eerste.
 */
export function naarCode(c: Inhoud, eigen: Oefening[] = []): string {
  const o = onderdelenVan(c).map((x) => [x.categorie, x.duur, x.soort === 'samen' ? (x.groepjesSamen && x.groepjesSamen >= 2 ? x.groepjesSamen : 1) : 0, x.oefening ? kort(x.oefening) : '', ...(x.oefeningen?.length ? [x.oefeningen.map((y) => (y.minuten === undefined ? [kort(y.oefening)] : [kort(y.oefening), y.minuten]))] : [])]);
  const ids = oefeningIds(c);
  const e = eigen.filter((x) => ids.includes(x.id));
  return naarBase64Url(JSON.stringify({ v: 2, n: c.naam, d: c.datums, l: c.leeftijd, k: c.kinderen, g: c.groepjes, t: c.trainers, o, ...(c.starttijd ? { u: c.starttijd } : {}), s: c.stationTrainers, f: c.veldTrainers, ...(keuzesVoorLink(c) ? { p: keuzesVoorLink(c) } : {}), ...(c.perDag ? { pd: c.perDag.map((d) => ({ t: d.trainers, ...(keuzesVoorLink(c, d.trainerKeuzes) ? { p: keuzesVoorLink(c, d.trainerKeuzes) } : {}), ...(d.vast ? { v: d.vast } : {}) })) } : {}), ...(c.groep ? { gr: c.groep } : {}), ...(e.length ? { e } : {}) }));
}

const tekstenRecord = (x: unknown): Record<number, string> => {
  const uit: Record<number, string> = {};
  if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) if (typeof v === 'string' && Number(k) > 0) uit[Number(k)] = v.slice(0, 40);
  return uit;
};

const getal = (v: unknown, min: number, max: number, standaard: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : standaard);

function netteTrainerLijsten(x: unknown): Record<string, string[]> | undefined {
  if (!x || typeof x !== 'object') return undefined;
  const uit: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(x)) if (Array.isArray(v)) uit[k.slice(0, 40)] = v.filter((n): n is string => typeof n === 'string').map((n) => n.slice(0, 40)).slice(0, MAX_TRAINERS);
  return uit;
}

function netteKeuzes(x: unknown): TrainerKeuzes | undefined {
  if (!x || typeof x !== 'object') return undefined;
  const k = x as { [veld in keyof TrainerKeuzes]?: unknown };
  const uit: TrainerKeuzes = {};
  if (k.modus === 'groepje') uit.modus = 'groepje';
  for (const veld of ['stations', 'velden', 'samen', 'groepen'] as const) {
    const lijsten = netteTrainerLijsten(k[veld]);
    if (lijsten) uit[veld] = lijsten;
  }
  return Object.keys(uit).length ? uit : undefined;
}

function netteDagen(x: unknown): DagTrainers[] | undefined {
  if (!Array.isArray(x)) return undefined;
  return x.slice(0, 7).map((d: { trainers?: unknown; trainerKeuzes?: unknown; vast?: unknown; rooster?: unknown }) => {
    const vast: Record<string, string> = {};
    if (d?.vast && typeof d.vast === 'object') for (const [n, k] of Object.entries(d.vast)) if (typeof k === 'string' && CATEGORIEEN.includes(k)) vast[n.slice(0, 40)] = k;
    const keuzes = netteKeuzes(d?.trainerKeuzes);
    return {
      trainers: Array.isArray(d?.trainers) ? d.trainers.filter((n): n is string => typeof n === 'string' && !!n.trim()).map((n) => n.slice(0, 40)).slice(0, MAX_TRAINERS) : [],
      ...(keuzes ? { trainerKeuzes: keuzes } : {}),
      ...(Object.keys(vast).length ? { vast } : {}),
      ...(d?.rooster === true ? { rooster: true } : {}),
    };
  });
}

function netteOefeningen(x: unknown): BlokOefening[] {
  if (!Array.isArray(x)) return [];
  const gezien = new Set<string>();
  return (x as Partial<BlokOefening>[])
    .filter((o) => {
      if (!o || typeof o.oefening !== 'string' || !o.oefening || gezien.has(o.oefening)) return false;
      gezien.add(o.oefening);
      return true;
    })
    .slice(0, MAX_BLOK_OEFENINGEN)
    .map((o) => ({ oefening: o.oefening!, ...(typeof o.minuten === 'number' && o.minuten > 0 ? { minuten: getal(o.minuten, 1, MAX_DUUR, 5) } : {}) }));
}

function netteOnderdelen(x: unknown): Onderdeel[] | undefined {
  if (!Array.isArray(x)) return undefined;
  const lijst = (x as Partial<Onderdeel>[]).filter((o) => o && typeof o.categorie === 'string' && CATEGORIEEN.includes(o.categorie)).slice(0, MAX_ONDERDELEN);
  if (!lijst.length) return undefined;
  return lijst.map((o, i) => {
    const basis: Onderdeel = { id: typeof o.id === 'string' && o.id ? o.id.slice(0, 40) : `o${i + 1}`, categorie: o.categorie!, duur: getal(o.duur, 1, MAX_DUUR, 15), soort: o.soort === 'samen' ? 'samen' : 'stations' };
    if (basis.soort === 'samen' && typeof o.groepjesSamen === 'number' && Number.isInteger(o.groepjesSamen) && o.groepjesSamen >= 2 && o.groepjesSamen <= MAX_GROEPJES) basis.groepjesSamen = o.groepjesSamen;
    const meer = netteOefeningen(o.oefeningen);
    if (meer.length) return metOefeningen(basis, meer);
    return typeof o.oefening === 'string' && o.oefening ? { ...basis, oefening: o.oefening } : basis;
  });
}

/** Controleert wat er binnenkomt (link of team): alles wat niet klopt valt terug op iets veiligs. */
function netteClub(x: { [k in keyof GedeeldeClub]?: unknown }): GedeeldeClub {
  const bron = (x.blokken && typeof x.blokken === 'object' ? x.blokken : {}) as Record<string, unknown>;
  const blokken: Partial<Record<Blok, string>> = {};
  for (const blok of BLOKKEN) {
    const id = bron[blok];
    if (typeof id === 'string' && id) blokken[blok] = id;
  }
  return {
    naam: typeof x.naam === 'string' ? x.naam.slice(0, 80) : '',
    datums: Array.isArray(x.datums) ? x.datums.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(0, 7) : [],
    leeftijd: isLeeftijd(x.leeftijd) ? x.leeftijd : 'mini-5-7',
    kinderen: getal(x.kinderen, 1, MAX_KINDEREN, 30),
    groepjes: getal(x.groepjes, MIN_GROEPJES, MAX_GROEPJES, 6),
    trainers: Array.isArray(x.trainers) ? x.trainers.filter((n): n is string => typeof n === 'string' && !!n.trim()).map((n) => n.slice(0, 40)).slice(0, MAX_TRAINERS) : [],
    blokken,
    ...(netteOnderdelen(x.onderdelen) ? { onderdelen: netteOnderdelen(x.onderdelen)! } : {}),
    ...(typeof x.starttijd === 'string' && /^\d{2}:\d{2}$/.test(x.starttijd) ? { starttijd: x.starttijd } : {}),
    stationTrainers: tekstenRecord(x.stationTrainers),
    veldTrainers: tekstenRecord(x.veldTrainers),
    ...(netteKeuzes(x.trainerKeuzes) ? { trainerKeuzes: netteKeuzes(x.trainerKeuzes)! } : {}),
    ...(netteDagen(x.perDag) ? { perDag: netteDagen(x.perDag)! } : {}),
    ...(typeof x.groep === 'string' && x.groep.trim() ? { groep: x.groep.trim().slice(0, 60) } : {}),
    ...(Array.isArray(x.eigen) && x.eigen.some(geldigeEigen) ? { eigen: x.eigen.filter(geldigeEigen).map((o) => ({ ...o, eigen: true })) } : {}),
  };
}

export function uitCode(code: string): GedeeldeClub | null {
  try {
    const x = JSON.parse(uitBase64Url(code)) as { v?: number; n?: unknown; d?: unknown; l?: unknown; k?: unknown; g?: unknown; t?: unknown; b?: unknown; o?: unknown; u?: unknown; s?: unknown; f?: unknown; p?: unknown; pd?: unknown; gr?: unknown; e?: unknown };
    const basis = { naam: x.n, datums: x.d, leeftijd: x.l, kinderen: x.k, groepjes: x.g, trainers: x.t, stationTrainers: x.s, veldTrainers: x.f, trainerKeuzes: x.p, perDag: Array.isArray(x.pd) ? (x.pd as { t?: unknown; p?: unknown; v?: unknown }[]).map((d) => ({ trainers: d?.t, trainerKeuzes: d?.p, vast: d?.v })) : undefined, groep: x.gr, eigen: x.e };
    if (x.v === 2 && Array.isArray(x.o)) {
      const onderdelen = (x.o as unknown[][]).map(([categorie, duur, samen, oefening, meer], i) => ({
        id: `o${i + 1}`,
        categorie,
        duur,
        soort: samen ? 'samen' : 'stations',
        ...(typeof samen === 'number' && samen >= 2 ? { groepjesSamen: samen } : {}),
        oefening: typeof oefening === 'string' ? lang(oefening) : '',
        ...(Array.isArray(meer) ? { oefeningen: (meer as unknown[][]).filter(Array.isArray).map(([id, minuten]) => ({ oefening: typeof id === 'string' ? lang(id) : '', minuten })) } : {}),
      }));
      return netteClub({ ...basis, blokken: {}, onderdelen, starttijd: x.u });
    }
    if (x.v !== 1 || !Array.isArray(x.b)) return null;
    const blokken: Partial<Record<Blok, string>> = {};
    BLOKKEN.forEach((blok, i) => {
      const id = (x.b as unknown[])[i];
      if (typeof id === 'string' && id) blokken[blok] = lang(id);
    });
    return netteClub({ ...basis, blokken });
  } catch {
    return null;
  }
}

/** Inhoud van een gedeeld team-item (0.31.2): de circuittraining plus de oefeningen die de teamleden niet hebben. */
export function voorTeam(c: Inhoud, eigen: Oefening[] = []): string {
  const { naam, datums, leeftijd, kinderen, groepjes, trainers, stationTrainers, veldTrainers } = c;
  const ids = oefeningIds(c);
  const onderdelen = onderdelenVan(c);
  return JSON.stringify({ club: { naam, datums, leeftijd, kinderen, groepjes, trainers, blokken: {}, onderdelen, ...(c.starttijd ? { starttijd: c.starttijd } : {}), stationTrainers, veldTrainers, ...(c.trainerKeuzes ? { trainerKeuzes: c.trainerKeuzes } : {}), ...(c.perDag ? { perDag: c.perDag } : {}), ...(c.groep ? { groep: c.groep } : {}) }, eigen: eigen.filter((o) => ids.includes(o.id)) });
}

/** Gedeeld team-item lezen (null als het kapot is). */
export function leesTeamClub(data: string): GedeeldeClub | null {
  try {
    const x = JSON.parse(data) as { club?: { blokken?: unknown }; eigen?: unknown };
    if (!x?.club || typeof x.club !== 'object' || !x.club.blokken) return null;
    return netteClub({ ...x.club, eigen: x.eigen });
  } catch {
    return null;
  }
}

/** Oefeningen in de onderdelen vervangen (bij delen en kopiëren krijgen meegenomen oefeningen soms een ander id). */
export const metOefeningIds = (c: { onderdelen?: Onderdeel[]; blokken?: Partial<Record<Blok, string>> }, nieuwId: (id: string) => string): Onderdeel[] => onderdelenVan(c).map((o) => metOefeningen(o, oefeningenVan(o).map((x) => ({ ...x, oefening: nieuwId(x.oefening) }))));

/** Gedeelde circuittraining als nieuwe eigen circuittraining: `ids` zijn de nieuwe id's van de meegekomen oefeningen. */
export function uitGedeeldeClub(g: GedeeldeClub, ids: ReadonlyMap<string, string> = new Map(), nu = Date.now(), id = maakId()): ClubTraining {
  const { eigen: _e, ...rest } = g;
  void _e;
  return { ...rest, blokken: {}, onderdelen: metOefeningIds(g, (x) => ids.get(x) ?? x), id, afgevinkt: [], gemaakt: nu, gewijzigd: nu };
}

// ---------- rondetimer ----------

export interface TimerStand {
  /** Index van de ronde. */
  ronde: number;
  /** Seconden over in deze ronde. */
  rest: number;
  klaar: boolean;
}

export function timerStand(verstreken: number, rondes: Pick<Ronde, 'begin' | 'eind'>[]): TimerStand {
  const s = Math.max(0, verstreken);
  const i = rondes.findIndex((r) => s < r.eind);
  if (i < 0) return { ronde: Math.max(0, rondes.length - 1), rest: 0, klaar: true };
  return { ronde: i, rest: Math.ceil(rondes[i]!.eind - s), klaar: false };
}
