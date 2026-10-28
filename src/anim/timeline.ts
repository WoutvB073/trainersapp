import type { Actie, AnimatieStap, BalActie, BeweegActie, HerhaalStap, LijnSoort, Manier, Punt, Rij, Stap, TegelijkStap, Team, Tekening, Waarde, VeldObject, Zithouding } from '../model/types';
import { PERSONEN } from '../model/types';

/**
 * Tijdlijn: rekent de animatiestappen van een tekening om naar bewegingen met begin- en eindtijd.
 * `standOp(tijdlijn, t)` geeft daarna voor elk moment de posities, houdingen, balhoogte en sporen.
 * Puur rekenwerk (geen DOM): de 2D- én de 3D-renderer gebruiken allebei deze tijdlijn.
 */

/** Standaardsnelheid (m/s) per loopwijze; dribbelen gaat iets langzamer dan joggen. */
const SNELHEID: Record<Manier, number> = {
  jog: 4.5,
  sprint: 7,
  wandel: 1.6,
  huppel: 3.2,
  kniehef: 2.2,
  hakbil: 2.0,
  sprong: 2.5,
  zijwaarts: 2.6,
  achteruit: 2.8,
  voetenwerk: 2.2,
  hordes: 2.8,
  kruispas: 3,
  schijn: 1.5,
};
const ZWAARTEKRACHT = 9.81;
const DRIBBEL = 3.5;
/** Paslengte (m) bij de loopwijzen met losse pasjes: ladder één voet per vak, hordes één pas per 80 cm. */
export const PASLENGTE: Partial<Record<Manier, number>> = { voetenwerk: 0.45, hordes: 0.8, kniehef: 0.35, sprong: 0.9, kruispas: 0.6 };
/** Pasritme: radialen beencyclus per afgelegde meter (één cyclus = twee pasjes). */
export const RITME: Record<Manier, number> = {
  jog: 4.2,
  sprint: 3.4,
  wandel: 5.5,
  huppel: 4.5,
  kniehef: Math.PI / 0.35,
  hakbil: Math.PI / 0.4,
  sprong: Math.PI / 0.9,
  zijwaarts: 6,
  achteruit: 6,
  voetenwerk: Math.PI / 0.45,
  hordes: Math.PI / 0.8,
  kruispas: Math.PI / 0.6,
  schijn: 6,
};
/** Hoe lang een draai (nieuwe kijkrichting) duurt: de bal aan de voet draait mee, springt niet. */
const DRAAI = 0.3;
/** Kijkrichting t.o.v. de looprichting. */
const KIJK_VERSCHIL: Partial<Record<Manier, number>> = { zijwaarts: -90, achteruit: 180 };
/** Loopwijzen waarbij het spoor losse pasjes toont. */
export const PASJES: readonly Manier[] = ['voetenwerk', 'hordes', 'kniehef', 'sprong', 'kruispas'];

const DUUR_DUIK = 0.5;
const DUUR_OPSTAAN = 0.5;
/** Opstaan als een liggende keeper zonder "opstaan" gaat lopen. */
const DUUR_OPKRABBELEN = 0.3;
const MIN_DUUR = 0.35;
/** Rust aan het eind voordat de animatie opnieuw begint. */
export const NA_AFLOOP = 1.2;
/** Afstand waarbinnen een speler een losse bal kan oppakken. */
const PAK_AFSTAND = 2.5;
/** Hoogste punt van de boog per hoogte-woord (meters). */
const BOOG = { grond: 0, laag: 1, halfhoog: 2.5 } as const;
const RIJ_AFSTAND = 1.6;
const DOORSCHUIF_DUUR = 0.8;

type Ease = 'mens' | 'duik' | 'bal';

interface Beweging {
  /** Afgelegde weg (minstens 2 punten). */
  pad: Punt[];
  /** Opgetelde lengte tot elk punt. */
  lengtes: number[];
  t0: number;
  t1: number;
  ease: Ease;
  manier: Manier;
}

type BalEvent =
  | { soort: 'vast'; t0: number; houder: string }
  | { soort: 'los'; t0: number; punt: Punt }
  | {
      soort: 'vlucht';
      t0: number;
      t1: number;
      van: Punt;
      naar: Punt;
      /** Hoogste punt van de boog (0 = over de grond). */
      top: number;
      /** Hoogte boven de grond bij vertrek en aankomst (volley, kopbal). */
      h0: number;
      h1: number;
      passeerder: string;
      daarna: string | null;
      /** De passeerder springt hier niet bij, ook al vertrekt de bal hoog (worp, tip tijdens een duik). */
      geenSprong?: boolean;
    };

/** Gaan liggen (duik) of opstaan, geleidelijk tussen t en t1. */
interface HoudingEvent {
  t: number;
  t1: number;
  houding: 'staan' | 'duik';
  /** Duikrichting in graden. */
  hoek?: number;
  /** Hoge duik: hoogte van de handen bij de bal (m). */
  hoog?: number;
}

type WorpSoort = NonNullable<BalActie['worp']>;

/** Een persoon laat een bal los: met de voet (pass, dribbel) of uit de handen (worp). */
interface Loslaten {
  bal: string;
  wie: string;
  t: number;
  soort: WorpSoort | 'voet';
  /** Bij onderhands: rollend (true) of met een boogje. */
  rollend?: boolean;
}

/** Hoogte van de bal in de handen voor de borst. */
const BORST = 1.05;
/** Duur van de worpbeweging vóór het loslaten (uithalen) en erna (uitzwaaien). */
const UITHALEN = 0.35;
const UITZWAAIEN = 0.25;

/** Kijkrichting vanaf t: vast, of meedraaiend met een beweging (+ verschil, bv. achteruit = 180). */
type KijkEvent = { t: number; hoek: number } | { t: number; beweging: Beweging; verschil: number };

export interface Spoor {
  soort: LijnSoort;
  /** Weg van het spoor (minstens 2 punten); `van`/`naar` = eerste/laatste punt. */
  pad: Punt[];
  van: Punt;
  naar: Punt;
  t0: number;
  t1: number;
  ease: Ease;
  /** Hoogste punt van de boog (alleen bal; 0 = over de grond). */
  top: number;
  /** Loopwijze (alleen looplijnen). */
  manier?: Manier;
  /** Object dat dit spoor maakt. */
  id: string;
}

interface RijStaat {
  def: Rij;
  /** Wie er (in volgorde) in de rij staat, vanaf tijdstip t. */
  momenten: { t: number; leden: string[] }[];
}

export interface Tijdlijn {
  tekening: Tekening;
  /** Lengte van de beweging in seconden (zonder rust aan het eind). */
  duur: number;
  objecten: Map<string, VeldObject>;
  bewegingen: Map<string, Beweging[]>;
  kijk: Map<string, KijkEvent[]>;
  houdingen: Map<string, HoudingEvent[]>;
  teams: Map<string, { t: number; team: Team }[]>;
  balEvents: Map<string, BalEvent[]>;
  rijen: Map<string, RijStaat>;
  sporen: Spoor[];
  loslaten: Loslaten[];
  /** Kniezit/hurkzit vanaf t (tot de persoon beweegt, duikt of opstaat). */
  zitten: Map<string, { t: number; soort: Zithouding }[]>;
  /** Losse sprongen (hoogste punt), bv. een tegenstander die meespringt. */
  sprongen: Map<string, number[]>;
  /** Grond achter je aantikken (zittende keeper). */
  tikken: Map<string, { t0: number; t1: number }[]>;
  /** Een pion/hoedje aantikken met de hand. */
  aantikken: Map<string, { t0: number; t1: number; punt: Punt; voet: boolean }[]>;
  /** Keeper stompt de bal weg (moment van contact). */
  stompen: { wie: string; t: number; vuisten: 1 | 2 }[];
  /** Keeper blokt een schot met zijn lichaam (moment van contact). */
  blokken: { wie: string; t: number; soort: 'ster' | 'knie' | 'voeten' }[];
}

export interface ObjectStand {
  x: number;
  y: number;
  /** Kijkrichting in graden (personen; 0 = +x, 90 = +y). */
  hoek: number;
  /** "duik" zodra de persoon meer dan half ligt. */
  houding: 'staan' | 'duik';
  /** 0 = staat, 1 = ligt (na een duik); loopt geleidelijk tijdens duiken en opstaan. */
  liggen: number;
  /** Duikrichting in graden. */
  duikHoek: number;
  /** Personen: loopwijze van de beweging van dit moment (ontbreekt als hij stilstaat). */
  manier?: Manier;
  /** Personen: snelheid (m/s) op dit moment. */
  snelheid: number;
  /** Personen: stand van de pas (radialen; loopt op met de afgelegde weg). */
  fase: number;
  /** Personen: team/hesje van dit moment. */
  team?: Team;
  /** Hoogte van de boog boven de lijn tussen begin- en eindpunt (bal, meters). */
  hoogte: number;
  /** Bal: wie hem nu heeft (null = los of in de lucht). */
  houder: string | null;
  /** Bal in de lucht/onderweg: van wie, naar wie (null = naar een punt) en voortgang 0–1. */
  vlucht?: { van: string; naar: string | null; u: number; top: number };
  /** Keeper: 0–1, zakt door de knieën en zet zich vlak voor een schot. */
  gezet: number;
  /** Personen: 0–1, springt (kopbal). */
  sprong: number;
  /** Personen: 0–1, benen gespreid omdat er een bal tussendoor gaat (panna). */
  spreid: number;
  /** Personen: hoogte van het lijf boven de grond (hoge duik, op een landingskussen). */
  zweef: number;
  /** Keeper: 0–1, handen naar de bal om te vangen, op hoogte `vangHoogte` (m). */
  vang: number;
  vangHoogte: number;
  /** Personen: worp- of trapbeweging bezig (u: 0 = uithalen begint, 0,6 = loslaten, 1 = klaar). */
  worp?: { soort: WorpSoort; u: number };
  /** Keeper: 0–1 in kniezit of hurkzit. */
  zit: number;
  zitSoort?: Zithouding;
  /** Overgang van de ene zithouding naar de andere zonder op te staan: de vorige soort en hoe ver (0–1) de nieuwe is. */
  zitVorig?: Zithouding;
  zitMix?: number;
  /** Zittende keeper: 0–1, handen achter zich naar de grond (grondtik). */
  tik: number;
  /** Keeper stompt: armen gestrekt naar de bal met één of twee vuisten (u: 0–1 rond het contact). */
  stomp?: { vuisten: 1 | 2; u: number };
  /** Keeper blokt: spreidsprong (ster) of knieblok (u: 0–1 rond het contact). */
  blok?: { soort: 'ster' | 'knie' | 'voeten'; u: number };
  /**
   * Personen in beweging (voor de 3D-poppetjes): looprichting (graden), seconden sinds het begin van deze beweging,
   * afgelegde weg (m) en versnelling (m/s², negatief = afremmen).
   */
  looprichting?: number;
  loopTijd?: number;
  afgelegd?: number;
  versnelling?: number;
  /**
   * Trap tegen de bal (pass of schot met de voet): u 0–1, de voet raakt de bal op u = 0,5. Kracht 0–1 (uit de
   * balsnelheid), richting van de bal (graden) en of hij hoog gaat.
   */
  trap?: { u: number; kracht: number; richting?: number; hoog: boolean; hoogte?: number };
  /** Bal aannemen (niet met de handen): u 0–1, de bal komt aan op u = 0,5, op deze hoogte (m), uit deze richting (graden). */
  aanname?: { u: number; hoogte: number; richting: number };
  /** Opstaan na een duik: 0–1 (alleen tijdens het opstaan). */
  opstaan?: number;
  /** Een pion/hoedje aantikken: u 0–1 (hand bij het object op u = 0,5) en waar het object staat. */
  aantik?: { u: number; x: number; y: number; voet?: boolean };
}

/** Een bal die net in een goal is gegaan: het net bolt op die plek even uit. */
export interface NetInslag {
  /** Id van het goal. */
  id: string;
  x: number;
  y: number;
  /** 0–1. */
  sterkte: number;
}

export interface SpoorStand {
  /** Index in `tijdlijn.sporen`. */
  index: number;
  soort: LijnSoort;
  van: Punt;
  /** Huidige punt (punt van het spoor). */
  tot: Punt;
  /** Eindpunt van de hele lijn. */
  naar: Punt;
  /** Het al getekende deel van de weg (van het begin tot `tot`). */
  punten: Punt[];
  /** Welk deel van de lijn al getekend is (0–1). */
  fractie: number;
  /** Hoogste punt van de boog (bal). */
  top: number;
  manier?: Manier;
  klaar: boolean;
}

export interface Stand {
  objecten: Map<string, ObjectStand>;
  sporen: SpoorStand[];
  net: NetInslag[];
}

// ---------- kleine rekenhulpjes ----------

const afstand = (a: Punt, b: Punt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const lerp = (a: Punt, b: Punt, u: number): Punt => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const graden = (a: Punt, b: Punt) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
const richting = (hoek: number): Punt => [Math.cos((hoek * Math.PI) / 180), Math.sin((hoek * Math.PI) / 180)];
const klem = (u: number) => Math.min(1, Math.max(0, u));

export function ease(soort: Ease, u: number): number {
  u = klem(u);
  if (soort === 'mens') return 0.5 - Math.cos(Math.PI * u) / 2;
  if (soort === 'duik') return 1 - (1 - u) * (1 - u);
  return u * (1.25 - 0.25 * u);
}

/** Afgeleide van de ease (voor de snelheid op een moment). */
function easeAfgeleide(soort: Ease, u: number): number {
  u = klem(u);
  if (soort === 'mens') return (Math.PI / 2) * Math.sin(Math.PI * u);
  if (soort === 'duik') return 2 * (1 - u);
  return 1.25 - 0.5 * u;
}

/** Tweede afgeleide van de ease (voor de versnelling op een moment). */
function easeTweede(soort: Ease, u: number): number {
  u = klem(u);
  if (soort === 'mens') return ((Math.PI * Math.PI) / 2) * Math.cos(Math.PI * u);
  if (soort === 'duik') return -2;
  return -0.5;
}

/** Hoogte boven de grond op voortgang u (0–1) van een boog met hoogste punt `top`. */
export const boog = (top: number, u: number) => top * 4 * u * (1 - u);

/**
 * Hoogste punt van de boog voor een pass/schot (meters).
 * Standaard: pass over de grond, schot met een lage boog. `hoog: true` (oud) = `hoogte: 'hoog'`.
 */
export function balTop(a: Pick<BalActie, 'type' | 'hoogte' | 'hoog'>, start: Punt, doel: Punt): number {
  const h = a.hoogte ?? (a.hoog ? 'hoog' : a.type === 'schot' ? 'laag' : 'grond');
  if (typeof h === 'number') return Math.max(0, h);
  if (h === 'hoog') return Math.min(7, 1 + afstand(start, doel) * 0.22);
  return BOOG[h];
}

function cumulatief(pad: Punt[]): number[] {
  const l = [0];
  for (let i = 1; i < pad.length; i++) l.push(l[i - 1]! + afstand(pad[i - 1]!, pad[i]!));
  return l;
}

/** Punt en looprichting (graden) op afstand `d` langs een pad. */
function langsPad(pad: Punt[], lengtes: number[], d: number): { p: Punt; hoek: number } {
  const totaal = lengtes[lengtes.length - 1]!;
  d = Math.min(Math.max(0, d), totaal);
  let i = 1;
  while (i < pad.length - 1 && lengtes[i]! < d) i++;
  const a = pad[i - 1]!;
  const b = pad[i]!;
  const stuk = lengtes[i]! - lengtes[i - 1]!;
  return { p: stuk > 0 ? lerp(a, b, (d - lengtes[i - 1]!) / stuk) : b, hoek: graden(a, b) };
}

/** Het begin van een pad tot afstand `d`. */
export function deelPad(pad: Punt[], d: number): Punt[] {
  const lengtes = cumulatief(pad);
  const uit: Punt[] = [pad[0]!];
  for (let i = 1; i < pad.length; i++) {
    if (lengtes[i]! >= d) {
      uit.push(langsPad(pad, lengtes, d).p);
      return uit;
    }
    uit.push(pad[i]!);
  }
  return uit;
}

/** Een draai om een object: boog rond `c`, van de kant van `vorige` naar de kant van `naar`. */
function draaiOm(c: Punt, vorige: Punt, naar: Punt, straal: number, kant: 'links' | 'rechts'): Punt[] {
  // Met y omlaag op het scherm is een afnemende hoek "tegen de klok in": object blijft links.
  const s = kant === 'links' ? -1 : 1;
  const a0 = Math.atan2(vorige[1] - c[1], vorige[0] - c[0]);
  const a1 = Math.atan2(naar[1] - c[1], naar[0] - c[0]);
  const e0 = a0 + s * (Math.PI / 2);
  const e1 = a1 - s * (Math.PI / 2);
  let zwaai = s * (e1 - e0);
  zwaai = ((zwaai % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const n = Math.max(2, Math.ceil(zwaai / 0.25));
  const punten: Punt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = e0 + s * zwaai * (i / n);
    punten.push([c[0] + Math.cos(a) * straal, c[1] + Math.sin(a) * straal]);
  }
  return punten;
}

const isBalActie = (a: Actie): a is BalActie => a.type === 'pass' || a.type === 'schot';
const isPersoon = (o: VeldObject | undefined) => !!o && PERSONEN.includes(o.soort);
const isHerhaal = (s: Stap): s is HerhaalStap => 'herhaal' in s;
const isTegelijk = (s: Stap): s is TegelijkStap => 'tegelijk' in s;

/** Standaard kijkrichting: keeper kijkt het veld in (omlaag), de rest naar het goal (omhoog). */
function standaardKijk(o: VeldObject): number {
  if (o.kijkrichting !== undefined) return o.kijkrichting;
  return o.soort === 'keeper' ? 90 : -90;
}

/** Afstand van de bal tot het midden van de persoon als die hem heeft (aan de voet, niet ervoor). */
const balAfstand = (o: VeldObject) => (o.soort === 'keeper' ? 0.35 : 0.4);

/**
 * Duur van een balvlucht. Over de grond: korte pass rond 9 m/s, lange pass tot 18 m/s (schot sneller).
 * Door de lucht: minstens de tijd die een bal nodig heeft om zo hoog te komen en weer te landen.
 */
export function vluchtDuur(type: 'pass' | 'schot', top: number, afstandM: number): number {
  const v = type === 'schot' ? Math.min(25, 14 + 0.25 * afstandM) : Math.min(18, 8 + 0.35 * afstandM);
  const lucht = top > 0.05 ? 2 * Math.sqrt((2 * top) / ZWAARTEKRACHT) : 0;
  return Math.max(MIN_DUUR, afstandM / v, lucht);
}

const hoekVerschil = (a: number, b: number) => ((((b - a) % 360) + 540) % 360) - 180;

// ---------- opvragen op tijdstip ----------

function laatste<T>(lijst: T[] | undefined, t: number, tijd: (x: T) => number): T | undefined {
  if (!lijst) return undefined;
  let res: T | undefined;
  for (const x of lijst) {
    if (tijd(x) > t) break;
    res = x;
  }
  return res;
}

const voortgang = (b: Beweging, t: number) => ease(b.ease, (t - b.t0) / (b.t1 - b.t0)) * b.lengtes[b.lengtes.length - 1]!;

function positie(tl: Tijdlijn, id: string, t: number): Punt {
  const o = tl.objecten.get(id);
  const b = laatste(tl.bewegingen.get(id), t, (x) => x.t0);
  if (b && t < b.t1) return langsPad(b.pad, b.lengtes, voortgang(b, t)).p;
  const vast: Punt = b ? b.pad[b.pad.length - 1]! : o ? [o.x, o.y] : [0, 0];
  if (!o?.verdedigt) return vast;
  // Keeper die meebeweegt: zolang hij niet ligt, geen bal heeft en niet zelf iets doet.
  const vrij = keeperVrijSinds(tl, o, t);
  if (vrij === null) return vast;
  // Een keeper die mag uitkomen (1 tegen keeper) blijft na een actie nog even staan waar hij is.
  const wacht = o.uitkomen ? 1.5 : 0;
  if (b && t - vrij < wacht) return vast;
  const auto = keeperPlek(tl, o, t);
  if (b && t - vrij - wacht < 0.6) return lerp(vast, auto, ease('mens', (t - vrij - wacht) / 0.6));
  return auto;
}

/** Vanaf wanneer beweegt een keeper weer vanzelf mee (null = nu niet: ligt, heeft de bal of doet iets). */
function keeperVrijSinds(tl: Tijdlijn, o: VeldObject, t: number): number | null {
  const b = laatste(tl.bewegingen.get(o.id), t, (x) => x.t0);
  if (b && t < b.t1) return null;
  if (ligging(tl, o.id, t).liggen > 0.01) return null;
  if (balVan(tl, o.id, t)) return null;
  let sinds = b ? b.t1 : -Infinity;
  for (const e of tl.houdingen.get(o.id) ?? []) if (e.houding === 'staan' && e.t1 <= t) sinds = Math.max(sinds, e.t1);
  return sinds;
}

interface Goal {
  midden: Punt;
  /** Richting het veld in (opening van het goal). */
  n: Punt;
  /** Langs de doellijn. */
  zij: Punt;
  breedte: number;
  diepte: number;
}

function goalVan(tl: Tijdlijn, id: string): Goal | undefined {
  const g = tl.objecten.get(id);
  if (!g || (g.soort !== 'goal' && g.soort !== 'klein-goal')) return undefined;
  const h = ((g.hoek ?? 0) * Math.PI) / 180;
  const groot = g.soort === 'goal';
  return {
    midden: [g.x, g.y],
    n: [-Math.sin(h), Math.cos(h)],
    zij: [Math.cos(h), Math.sin(h)],
    breedte: g.breedte ?? (groot ? 7.32 : 3),
    diepte: g.lengte ?? (groot ? 2 : 1.2),
  };
}

/** Plek van een punt t.o.v. een goal: langs de lijn (lx) en het veld in (ly). */
function tovGoal(g: Goal, p: Punt): { lx: number; ly: number } {
  const r: Punt = [p[0] - g.midden[0], p[1] - g.midden[1]];
  return { lx: r[0] * g.zij[0] + r[1] * g.zij[1], ly: r[0] * g.n[0] + r[1] * g.n[1] };
}

/** De bal waar een keeper op let: de dichtstbijzijnde vóór zijn goal (niet in het net, niet in zijn handen). */
function bedreigendeBal(tl: Tijdlijn, o: VeldObject, g: Goal, t: number): Punt | undefined {
  let beste: Punt | undefined;
  let min = Infinity;
  for (const id of ballen(tl)) {
    if (houderVan(tl, id, t) === o.id) continue;
    const p = balPunt(tl, id, t);
    const { ly } = tovGoal(g, p);
    if (ly < 0.3) continue;
    const d = afstand(p, g.midden);
    if (d < min) {
      min = d;
      beste = p;
    }
  }
  return beste;
}

/** Waar de keeper hoort te staan: tussen bal en midden van het goal, verder uit zijn goal als de bal ver weg is. */
function keeperDoel(tl: Tijdlijn, o: VeldObject, t: number): Punt {
  const g = goalVan(tl, o.verdedigt!);
  if (!g) return [o.x, o.y];
  const p = bedreigendeBal(tl, o, g, t);
  if (!p) return [g.midden[0] + g.n[0] * 1.2, g.midden[1] + g.n[1] * 1.2];
  const { lx, ly } = tovGoal(g, p);
  if (g.breedte > 5 && Math.abs(lx) > g.breedte / 2 + 3 && ly < 32) {
    // Bal op de flank (voorzet): bij de achterlijn de eerste paal dicht, van verder weg meer naar het midden en iets
    // uit het doel, zodat hij de bal ook in de verre hoek of voor het doel kan pakken.
    const diep = klem((ly - 3) / 17);
    const zij = Math.sign(lx) * (g.breedte / 2) * (0.72 - 0.5 * diep);
    const uit = 0.9 + 1.2 * diep;
    return [g.midden[0] + g.zij[0] * zij + g.n[0] * uit, g.midden[1] + g.zij[1] * zij + g.n[1] * uit];
  }
  const d = Math.hypot(lx, ly) || 1;
  let f = ly / d;
  let s = lx / d;
  // Nooit verder dan ± 70° opzij.
  if (f < 0.34) {
    f = 0.34;
    s = Math.sign(s) * Math.sqrt(1 - f * f);
  }
  const uit = 1 + Math.min(1.6, d * 0.06);
  return [g.midden[0] + (g.n[0] * f + g.zij[0] * s) * uit, g.midden[1] + (g.n[1] * f + g.zij[1] * s) * uit];
}

/** Iets vertraagd en uitgemiddeld, zodat de keeper vloeiend meebeweegt (ook als er een nieuwe bal komt). */
function keeperPlek(tl: Tijdlijn, o: VeldObject, t: number): Punt {
  let x = 0;
  let y = 0;
  for (let i = 0; i < 5; i++) {
    const p = keeperDoel(tl, o, t - 0.1 * i);
    x += p[0];
    y += p[1];
  }
  return [x / 5, y / 5];
}

/** Beweging die op tijdstip t bezig is (of undefined). */
function actief(tl: Tijdlijn, id: string, t: number): Beweging | undefined {
  const b = laatste(tl.bewegingen.get(id), t, (x) => x.t0);
  return b && t < b.t1 ? b : undefined;
}

/** Kijkrichting, met een korte draai bij elke verandering (zodat ook de bal aan de voet meedraait). */
function kijkHoek(tl: Tijdlijn, id: string, t: number): number {
  // Een meebewegende keeper kijkt naar de bal.
  const o = tl.objecten.get(id);
  if (o?.verdedigt && keeperVrijSinds(tl, o, t) !== null) {
    const g = goalVan(tl, o.verdedigt);
    const p = g && bedreigendeBal(tl, o, g, t);
    if (g && p) return graden(positie(tl, id, t), p);
    if (g) return (Math.atan2(g.n[1], g.n[0]) * 180) / Math.PI;
  }
  const nu = kijkRuw(tl, id, t);
  const e = laatste(tl.kijk.get(id), t, (x) => x.t);
  if (!e || t - e.t >= DRAAI) return nu;
  const voor = kijkRuw(tl, id, e.t - 1e-6);
  return voor + hoekVerschil(voor, nu) * ease('mens', (t - e.t) / DRAAI);
}

function kijkRuw(tl: Tijdlijn, id: string, t: number): number {
  const k = laatste(tl.kijk.get(id), t, (x) => x.t);
  if (k) {
    if ('hoek' in k) return k.hoek;
    const b = k.beweging;
    const d = t >= b.t1 ? b.lengtes[b.lengtes.length - 1]! : voortgang(b, t);
    return langsPad(b.pad, b.lengtes, Math.max(d, 0.001)).hoek + k.verschil;
  }
  const o = tl.objecten.get(id);
  return o ? standaardKijk(o) : 0;
}

/** Hoe ver ligt deze persoon (0–1) en in welke richting is hij gedoken. */
function ligging(tl: Tijdlijn, id: string, t: number): { liggen: number; hoek: number; opstaan?: number } {
  let liggen = 0;
  let hoek = 0;
  let opstaan: number | undefined;
  for (const e of tl.houdingen.get(id) ?? []) {
    if (e.t > t) break;
    const u = e.t1 > e.t ? klem((t - e.t) / (e.t1 - e.t)) : 1;
    if (e.houding === 'duik') {
      liggen = ease('duik', u);
      hoek = e.hoek ?? 0;
      opstaan = undefined;
    } else {
      // Opstaan vanuit de huidige ligging.
      opstaan = liggen > 0.01 && u < 1 ? u : undefined;
      liggen = liggen * (1 - ease('mens', u));
    }
  }
  return { liggen, hoek, ...(opstaan !== undefined ? { opstaan } : {}) };
}

const ligt = (tl: Tijdlijn, id: string, t: number) => ligging(tl, id, t).liggen > 0.5;

/** Hoe ver zit deze persoon in kniezit of hurkzit (0–1)? Opstaan, lopen of duiken haalt hem eruit. */
function zitOp(tl: Tijdlijn, id: string, t: number): { zit: number; soort?: Zithouding; vorig?: Zithouding; mix?: number } {
  const lijst = tl.zitten.get(id);
  const e = laatste(lijst, t, (x) => x.t);
  if (!e) return { zit: 0 };
  // Zat hij al (in een andere houding)? Dan blijft hij zitten en gaat de houding geleidelijk over.
  const vorige = lijst![lijst!.indexOf(e) - 1];
  const doorzitten = !!vorige && e.t > 0 && zitOp(tl, id, e.t - 1e-6).zit > 0.9;
  let w = e.t <= 0 || doorzitten ? 1 : ease('mens', klem((t - e.t) / 0.4));
  for (const b of tl.bewegingen.get(id) ?? []) {
    if (b.t0 > e.t + 1e-6 && b.t0 <= t && b.ease !== 'duik') w = Math.min(w, 1 - ease('mens', klem((t - b.t0) / 0.3)));
  }
  for (const h of tl.houdingen.get(id) ?? []) {
    // Opstaan uit een zithouding (of buikligging): geleidelijk.
    if (h.t > e.t + 1e-6 && h.t <= t && h.houding === 'staan') w = Math.min(w, 1 - ease('mens', klem((t - h.t) / Math.max(0.05, h.t1 - h.t))));
  }
  w *= 1 - ligging(tl, id, t).liggen;
  if (doorzitten) return { zit: w, soort: e.soort, vorig: vorige!.soort, mix: ease('mens', klem((t - e.t) / 0.5)) };
  return { zit: w, soort: e.soort };
}

const zitStand = (tl: Tijdlijn, id: string, t: number) => {
  const z = zitOp(tl, id, t);
  return { zit: z.zit, zitSoort: z.soort, ...(z.vorig ? { zitVorig: z.vorig, zitMix: z.mix } : {}) };
};

/** Grondtik: handen naar achteren naar het gras en terug (0 → 1 → 0). */
function tikOp(tl: Tijdlijn, id: string, t: number): number {
  for (const e of tl.tikken.get(id) ?? []) if (t >= e.t0 && t <= e.t1) return Math.sin(Math.PI * ((t - e.t0) / (e.t1 - e.t0)));
  return 0;
}

/** Hoeveel lager de handen zijn in kniezit (0,45 m) of hurkzit (0,4 m). */
const zitLager = (tl: Tijdlijn, id: string, t: number) => {
  const z = zitOp(tl, id, t);
  return z.zit * (z.soort === 'kniezit' || z.soort === 'halfknie' ? 0.45 : z.soort === 'zit' || z.soort === 'zit-opgetrokken' ? 0.75 : z.soort === 'buik' ? 0.85 : 0.4);
};

/** Hoogte van een landingskussen op deze plek (0 = gras). */
function matHoogte(tl: Tijdlijn, p: Punt): number {
  let h = 0;
  for (const o of tl.objecten.values()) {
    if (o.soort !== 'keepersmat' || !o.hoogte || o.hoogte < 0.1) continue;
    const a = (-(o.hoek ?? 0) * Math.PI) / 180;
    const dx = p[0] - o.x;
    const dy = p[1] - o.y;
    const lx = dx * Math.cos(a) - dy * Math.sin(a);
    const ly = dx * Math.sin(a) + dy * Math.cos(a);
    if (Math.abs(lx) <= (o.breedte ?? 2) / 2 + 0.3 && Math.abs(ly) <= (o.lengte ?? 1) / 2 + 0.3) h = Math.max(h, o.hoogte);
  }
  return h;
}

/**
 * Hoe hoog het lijf boven de grond is: bij een hoge duik stijgt de keeper tot de handen bij de bal zijn
 * (hoogte − 0,35 m) en valt hij in 0,35 s terug; ligt hij op een landingskussen, dan op de hoogte van het kussen.
 */
function zweefOp(tl: Tijdlijn, id: string, t: number): number {
  const l = ligging(tl, id, t);
  let sprong = 0;
  for (const e of tl.houdingen.get(id) ?? []) {
    if (e.t > t) break;
    if (e.houding !== 'duik') continue;
    const piek = Math.max(0, (e.hoog ?? 0) - 0.35);
    if (t <= e.t1) sprong = piek * ease('mens', klem((t - e.t) / Math.max(0.01, e.t1 - e.t)));
    else {
      const val = klem((t - e.t1) / 0.35);
      sprong = piek * (1 - val * val);
    }
  }
  const mat = l.liggen > 0 ? matHoogte(tl, positie(tl, id, t)) * l.liggen : 0;
  return Math.max(sprong, mat);
}

/** Wanneer kreeg deze persoon de bal (die hij nu heeft) en op welke hoogte kwam hij aan? */
function balSinds(tl: Tijdlijn, bal: string, t: number): { t: number; hoogte: number } {
  const e = balEvent(tl, bal, t);
  if (!e || e.t0 <= 0) return { t: -Infinity, hoogte: BORST };
  if (e.soort === 'vlucht') return { t: e.t1, hoogte: e.h1 };
  return { t: e.t0, hoogte: 0 };
}

/**
 * Hoogte van een bal die iemand heeft: aan de voet (0) of in de handen (voor de borst). Een keeper houdt de bal
 * in de handen, tenzij hij hem daarna trapt of ermee dribbelt; een trainer of speler neemt hem in de handen als
 * hij hem daarna gooit of uit de handen trapt. Vlak voor het loslaten haalt hij uit (worpbeweging).
 */
function handHoogte(tl: Tijdlijn, wie: string, bal: string, t: number): number {
  const o = tl.objecten.get(wie);
  if (!o) return 0;
  const keeper = o.soort === 'keeper';
  const sinds = balSinds(tl, bal, t);
  let volgende: Loslaten | undefined;
  for (const x of tl.loslaten) {
    if (x.bal === bal && x.wie === wie && x.t >= t - 1e-6 && x.t >= sinds.t && (!volgende || x.t < volgende.t)) volgende = x;
  }
  const inHanden = volgende ? volgende.soort !== 'voet' && volgende.soort !== 'trap' : keeper;
  // Trap van de grond: eerst nog in de handen (keeper), dan neerleggen.
  const handen = inHanden || (keeper && volgende?.soort === 'trap');
  if (!handen) return 0;
  // Liggende keeper: de bal ligt met hem mee op de grond of hangt met hem in de lucht.
  const l = ligging(tl, wie, t);
  let h = BORST - zitLager(tl, wie, t);
  if (l.liggen > 0.01) h = BORST + (0.3 + zweefOp(tl, wie, t) - BORST) * l.liggen;
  // Net gevangen of opgepakt: van de aankomsthoogte naar de borst.
  const opPak = keeper ? 0.45 : 0.5;
  if (t - sinds.t < opPak) h = sinds.hoogte + (h - sinds.hoogte) * ease('mens', klem((t - sinds.t) / opPak));
  if (!volgende) return h;
  if (volgende.soort === 'trap') {
    // Bal neerleggen en dan trappen.
    return h * (1 - ease('mens', klem((t - (volgende.t - 0.7)) / 0.5)));
  }
  const u = klem((t - (volgende.t - UITHALEN)) / UITHALEN);
  if (u <= 0) return h;
  const los = loslaatHoogte(volgende);
  if (volgende.soort === 'volley' || volgende.soort === 'dropkick') {
    // Uit de handen laten vallen: versnellend naar beneden.
    return h + (los - h) * u * u;
  }
  return h + (los - h) * ease('mens', u);
}

/** Hoogte waarop een bal de handen of voet verlaat. */
function loslaatHoogte(x: Pick<Loslaten, 'soort' | 'rollend'>): number {
  switch (x.soort) {
    case 'onderhands':
      return x.rollend ? 0.25 : 0.6;
    case 'bovenhands':
      return 2.05;
    case 'zwaai':
      return 1.1;
    case 'volley':
      return 0.45;
    case 'dropkick':
      return 0.05;
    case 'tik':
      return 0.1;
    case 'inworp':
      return 2.1;
    default:
      return 0;
  }
}

/** Neemt deze keeper de bal die hij op t krijgt met de voet aan (de volgende keer speelt hij hem met de voet)? */
function metVoet(tl: Tijdlijn, wie: string, t: number): boolean {
  let volgende: Loslaten | undefined;
  for (const x of tl.loslaten) if (x.wie === wie && x.t >= t && (!volgende || x.t < volgende.t)) volgende = x;
  return volgende?.soort === 'voet';
}

/** Stompbeweging rond het contact. */
function stompOp(tl: Tijdlijn, id: string, t: number): ObjectStand['stomp'] {
  for (const x of tl.stompen) {
    if (x.wie === id && t >= x.t - 0.35 && t <= x.t + 0.35) return { vuisten: x.vuisten, u: (t - (x.t - 0.35)) / 0.7 };
  }
  return undefined;
}

/** Blokhouding rond het contact (opbouwen 0,3 s ervoor, 0,6 s blijven staan). */
function blokOp(tl: Tijdlijn, id: string, t: number): ObjectStand['blok'] {
  for (const x of tl.blokken) {
    if (x.wie === id && t >= x.t - 0.3 && t <= x.t + 0.6) return { soort: x.soort, u: (t - (x.t - 0.3)) / 0.9 };
  }
  return undefined;
}

/** Voetbeweging bij een pass of schot: 0,3 s uithalen, raken op u = 0,5, 0,3 s uitzwaaien. */
const TRAP = 0.3;

/** Trap tegen de bal (pass/schot met de voet) van deze persoon op tijdstip t. */
function trapOp(tl: Tijdlijn, id: string, t: number): ObjectStand['trap'] {
  for (const x of tl.loslaten) {
    if (x.wie !== id || x.soort !== 'voet' || t < x.t - TRAP || t > x.t + TRAP) continue;
    const e = (tl.balEvents.get(x.bal) ?? []).find((e) => e.soort === 'vlucht' && Math.abs(e.t0 - x.t) < 1e-6);
    const u = (t - (x.t - TRAP)) / (2 * TRAP);
    if (!e || e.soort !== 'vlucht') return { u, kracht: 0.5, hoog: false };
    const v = afstand(e.van, e.naar) / Math.max(0.05, e.t1 - e.t0);
    return {
      u,
      kracht: klem((v - 6) / 14) * 0.85 + 0.15,
      richting: afstand(e.van, e.naar) > 0.2 ? graden(e.van, e.naar) : undefined,
      hoog: e.top > 1,
      ...(e.h0 > 0.25 ? { hoogte: e.h0 } : {}),
    };
  }
  return undefined;
}

/** Bal aannemen met de voet (of borst/dij): rond het moment dat de bal aankomt. Niet als hij hem direct doorspeelt. */
function aannameOp(tl: Tijdlijn, o: VeldObject, t: number): ObjectStand['aanname'] {
  for (const lijst of tl.balEvents.values()) {
    for (const e of lijst) {
      if (e.soort !== 'vlucht' || e.daarna !== o.id || t < e.t1 - TRAP || t > e.t1 + TRAP) continue;
      if (o.soort === 'keeper' && !metVoet(tl, o.id, e.t1)) continue;
      if (tl.loslaten.some((x) => x.wie === o.id && Math.abs(x.t - e.t1) < 0.06)) continue;
      return { u: (t - (e.t1 - TRAP)) / (2 * TRAP), hoogte: e.h1, richting: graden(e.van, e.naar) };
    }
  }
  return undefined;
}

/** Worp- of trapbeweging van deze persoon op tijdstip t. */
function worpOp(tl: Tijdlijn, id: string, t: number): ObjectStand['worp'] {
  for (const x of tl.loslaten) {
    if (x.wie !== id || x.soort === 'voet') continue;
    if (t < x.t - UITHALEN || t > x.t + UITZWAAIEN) continue;
    return { soort: x.soort, u: (t - (x.t - UITHALEN)) / (UITHALEN + UITZWAAIEN) };
  }
  return undefined;
}

const vangStand = (tl: Tijdlijn, o: VeldObject, t: number) => {
  const v = vangOp(tl, o, t);
  return { vang: v.vang, vangHoogte: v.hoogte };
};

/** Keeper die een bal vangt: handen naar de bal (0–1) en op welke hoogte. */
function vangOp(tl: Tijdlijn, o: VeldObject, t: number): { vang: number; hoogte: number } {
  if (o.soort !== 'keeper') return { vang: 0, hoogte: 0 };
  let w = 0;
  let hoogte = 0;
  for (const lijst of tl.balEvents.values()) {
    for (const e of lijst) {
      if (e.soort !== 'vlucht' || e.daarna !== o.id || t < e.t1 - 0.5 || t > e.t1 + 0.6) continue;
      if (metVoet(tl, o.id, e.t1)) continue;
      const v = t <= e.t1 ? ease('mens', klem((t - (e.t1 - 0.5)) / 0.4)) : 1 - ease('mens', klem((t - e.t1 - 0.2) / 0.4));
      if (v > w) {
        w = v;
        hoogte = e.h1;
      }
    }
  }
  return { vang: w, hoogte };
}

/** Waar een bal zit als deze persoon hem heeft. */
function balBijPersoon(tl: Tijdlijn, id: string, t: number): Punt {
  const o = tl.objecten.get(id)!;
  const b = actief(tl, id, t);
  // Schijnbeweging: het lijf gaat opzij, de bal blijft liggen.
  if (b?.manier === 'schijn') return balBijPersoon(tl, id, b.t0 - 1e-6);
  const p = positie(tl, id, t);
  const l = ligging(tl, id, t);
  const duik = l.liggen > 0.5;
  const r = richting(duik ? l.hoek : kijkHoek(tl, id, t));
  let d = duik ? 0.55 : balAfstand(o);
  // Dribbelen: de bal gaat bij elke balaanraking een stukje voor de voet uit en komt weer terug.
  if (b && !duik && o.soort !== 'keeper') d += 0.12 * (0.5 - 0.5 * Math.cos(voortgang(b, t) * RITME[b.manier]));
  return [p[0] + r[0] * d, p[1] + r[1] * d];
}

function balEvent(tl: Tijdlijn, balId: string, t: number): BalEvent | undefined {
  return laatste(tl.balEvents.get(balId), t, (x) => x.t0);
}

function balStand(tl: Tijdlijn, balId: string, t: number): Pick<ObjectStand, 'x' | 'y' | 'hoogte' | 'houder' | 'vlucht'> {
  const e = balEvent(tl, balId, t);
  const plek = (p: Punt, houder: string | null = null) => ({ x: p[0], y: p[1], hoogte: 0, houder });
  if (!e) {
    const o = tl.objecten.get(balId)!;
    return plek([o.x, o.y]);
  }
  const vast = (houder: string) => ({ ...plek(balBijPersoon(tl, houder, t), houder), hoogte: handHoogte(tl, houder, balId, t) });
  if (e.soort === 'vast') return vast(e.houder);
  if (e.soort === 'los') return plek(e.punt);
  if (t < e.t1) {
    const u = (t - e.t0) / (e.t1 - e.t0);
    const p = lerp(e.van, e.naar, ease('bal', u));
    const f = ease('bal', u);
    // Over de grond uit of naar de handen: snel naar het gras, en pas aan het eind omhoog naar de handen.
    const h = e.top <= 0.05 ? e.h0 * klem(1 - u / 0.25) + e.h1 * klem((u - 0.85) / 0.15) : boog(e.top, f) + e.h0 + (e.h1 - e.h0) * f;
    return { x: p[0], y: p[1], hoogte: h, houder: null, vlucht: { van: e.passeerder, naar: e.daarna, u, top: e.top } };
  }
  if (e.daarna) return vast(e.daarna);
  return plek(e.naar);
}

const balPunt = (tl: Tijdlijn, balId: string, t: number): Punt => {
  const s = balStand(tl, balId, t);
  return [s.x, s.y];
};

/** Wie heeft deze bal op tijdstip t (null = los of in de lucht). */
function houderVan(tl: Tijdlijn, balId: string, t: number): string | null {
  const e = balEvent(tl, balId, t);
  if (!e) return null;
  if (e.soort === 'vast') return e.houder;
  if (e.soort === 'vlucht' && t >= e.t1) return e.daarna;
  return null;
}

function ballen(tl: Tijdlijn): string[] {
  return [...tl.objecten.values()].filter((o) => o.soort === 'bal').map((o) => o.id);
}

function balVan(tl: Tijdlijn, persoon: string, t: number): string | undefined {
  return ballen(tl).find((b) => houderVan(tl, b, t) === persoon);
}

/** Dichtstbijzijnde losse bal binnen bereik. */
function losseBalBij(tl: Tijdlijn, punt: Punt, t: number): string | undefined {
  let beste: string | undefined;
  let min = PAK_AFSTAND;
  for (const b of ballen(tl)) {
    if (houderVan(tl, b, t) !== null) continue;
    const e = balEvent(tl, b, t);
    if (e?.soort === 'vlucht' && t < e.t1) continue;
    const d = afstand(balPunt(tl, b, t), punt);
    if (d <= min) {
      min = d;
      beste = b;
    }
  }
  return beste;
}

/** Komt er een bal naar deze persoon toe die na t aankomt? Dan: wanneer. */
function balOnderweg(tl: Tijdlijn, persoon: string, t: number): number | undefined {
  let eerste: number | undefined;
  for (const lijst of tl.balEvents.values()) {
    for (const e of lijst) {
      if (e.soort === 'vlucht' && e.daarna === persoon && e.t1 > t && (eerste === undefined || e.t1 < eerste)) eerste = e.t1;
    }
  }
  return eerste;
}

function teamOp(tl: Tijdlijn, id: string, t: number): Team | undefined {
  return laatste(tl.teams.get(id), t, (x) => x.t)?.team ?? tl.objecten.get(id)?.team;
}

// ---------- rijen ----------

function rijPlek(r: Rij, k: number): Punt {
  const d = richting(r.richting);
  const a = r.afstand ?? RIJ_AFSTAND;
  return [r.x + d[0] * a * k, r.y + d[1] * a * k];
}

const ledenOp = (rs: RijStaat, t: number) => laatste(rs.momenten, t, (m) => m.t)?.leden ?? [];

function zetLeden(rs: RijStaat, t: number, leden: string[]) {
  rs.momenten.push({ t, leden });
  rs.momenten.sort((a, b) => a.t - b.t);
}

/** In welke rij staat deze persoon op tijdstip t (of: stond hij het laatst, met `laatst`). */
function rijVan(tl: Tijdlijn, persoon: string, t: number, laatst = false): RijStaat | undefined {
  for (const rs of tl.rijen.values()) if (ledenOp(rs, t).includes(persoon)) return rs;
  if (!laatst) return undefined;
  let beste: { rs: RijStaat; t: number } | undefined;
  for (const rs of tl.rijen.values()) {
    for (const m of rs.momenten) if (m.t <= t && m.leden.includes(persoon) && (!beste || m.t >= beste.t)) beste = { rs, t: m.t };
  }
  return beste?.rs;
}

// ---------- opbouwen ----------

function voegToe<T>(map: Map<string, T[]>, id: string, x: T, tijd: (x: T) => number) {
  const lijst = map.get(id) ?? [];
  lijst.push(x);
  lijst.sort((a, b) => tijd(a) - tijd(b));
  map.set(id, lijst);
}

export class TekeningFout extends Error {}

interface BeweegOpties {
  pad: Punt[];
  t0: number;
  duur?: number;
  manier?: Manier;
  ease?: Ease;
  /** Basissnelheid als er geen loopwijze is (bv. dribbelen). */
  snelheid?: number;
  kijk?: number;
  spoor?: LijnSoort | false;
}

/** Een beweging langs een pad toevoegen (met kijkrichting en spoor). Geeft de eindtijd terug. */
function beweeg(tl: Tijdlijn, o: VeldObject, opt: BeweegOpties): number {
  const pad = opt.pad.filter((p, i) => i === 0 || afstand(p, opt.pad[i - 1]!) > 0.001);
  if (pad.length === 1) pad.push(pad[0]!);
  const lengtes = cumulatief(pad);
  const lengte = lengtes[lengtes.length - 1]!;
  const manier = opt.manier ?? 'jog';
  const snelheid = opt.manier ? SNELHEID[opt.manier] : (opt.snelheid ?? SNELHEID.jog);
  const duur = opt.duur ?? Math.max(MIN_DUUR, lengte / snelheid);
  const b: Beweging = { pad, lengtes, t0: opt.t0, t1: opt.t0 + duur, ease: opt.ease ?? 'mens', manier };
  voegToe(tl.bewegingen, o.id, b, (x) => x.t0);
  if (lengte > 0.01) {
    if (opt.kijk !== undefined) voegToe(tl.kijk, o.id, { t: opt.t0, hoek: opt.kijk }, (e) => e.t);
    // Een keeper die zijwaarts of met kruispassen gaat, blijft dezelfde kant op kijken (naar de bal).
    else if (o.soort === 'keeper' && (manier === 'zijwaarts' || manier === 'kruispas')) voegToe(tl.kijk, o.id, { t: opt.t0, hoek: kijkHoek(tl, o.id, opt.t0) }, (e) => e.t);
    // Een keeper blijft het veld in kijken als hij verschuift (tenzij er een loopwijze of kijkrichting is gegeven).
    else if (o.soort !== 'keeper' || opt.manier) voegToe(tl.kijk, o.id, { t: opt.t0, beweging: b, verschil: KIJK_VERSCHIL[manier] ?? 0 }, (e) => e.t);
    if (opt.spoor) {
      tl.sporen.push({ soort: opt.spoor, pad, van: pad[0]!, naar: pad[pad.length - 1]!, t0: b.t0, t1: b.t1, ease: b.ease, top: 0, manier: opt.manier, id: o.id });
    }
  }
  return b.t1;
}

/** Persoon verlaat zijn rij op tijdstip t: wie erachter staat, schuift één plek op. */
function verlaatRij(tl: Tijdlijn, persoon: string, t: number) {
  const rs = rijVan(tl, persoon, t);
  if (!rs) return;
  const leden = ledenOp(rs, t);
  const plek = leden.indexOf(persoon);
  const nieuw = leden.filter((x) => x !== persoon);
  zetLeden(rs, t, nieuw);
  for (let k = plek; k < nieuw.length; k++) {
    const id = nieuw[k]!;
    const o = tl.objecten.get(id)!;
    // Wie nog onderweg is naar zijn plek, schuift op zodra hij er is.
    const laatsteB = tl.bewegingen.get(id)?.at(-1);
    const start = Math.max(t + 0.6 + 0.1 * (k - plek), laatsteB ? laatsteB.t1 : 0);
    const van = positie(tl, id, start);
    beweeg(tl, o, { pad: [van, rijPlek(rs.def, k)], t0: start, duur: DOORSCHUIF_DUUR, manier: 'wandel', spoor: false });
    voegToe(tl.kijk, id, { t: start + DOORSCHUIF_DUUR, hoek: rs.def.richting + 180 }, (e) => e.t);
  }
}

/** Achteraan aansluiten: buitenom lopen (niet door de rij heen), daarna naar voren kijken. */
function sluitAan(tl: Tijdlijn, o: VeldObject, rs: RijStaat, t0: number, opt: { duur?: number; manier?: Manier; spoor?: boolean }): number {
  verlaatRij(tl, o.id, t0);
  const leden = ledenOp(rs, t0);
  const r = rs.def;
  const doel = rijPlek(r, leden.length);
  const van = positie(tl, o.id, t0);
  const terug = richting(r.richting);
  const dwars: Punt = [-terug[1], terug[0]];
  const voorste: Punt = [r.x, r.y];
  const rel: Punt = [van[0] - voorste[0], van[1] - voorste[1]];
  const kant = rel[0] * dwars[0] + rel[1] * dwars[1] >= 0 ? 1 : -1;
  const opzij = 1.7;
  const pad: Punt[] = [van];
  const voor = -(rel[0] * terug[0] + rel[1] * terug[1]);
  const opzijNu = Math.abs(rel[0] * dwars[0] + rel[1] * dwars[1]);
  // Ver vóór de rij en in het verlengde ervan (bv. aan het eind van een baan): eerst opzij stappen,
  // zodat hij niet terug door de baan loopt.
  if (leden.length > 0 && voor > 2.5 && opzijNu < 1) pad.push([van[0] + dwars[0] * opzij * kant, van[1] + dwars[1] * opzij * kant]);
  if (leden.length > 0) {
    // Staat hij vóór de rij, eerst opzij; dan langs de rij naar achteren en van achteren aansluiten.
    if (rel[0] * terug[0] + rel[1] * terug[1] < 0.5) pad.push([voorste[0] + dwars[0] * opzij * kant - terug[0] * 0.6, voorste[1] + dwars[1] * opzij * kant - terug[1] * 0.6]);
    pad.push([doel[0] + dwars[0] * opzij * kant + terug[0] * 0.7, doel[1] + dwars[1] * opzij * kant + terug[1] * 0.7]);
  }
  pad.push(doel);
  zetLeden(rs, t0, [...leden, o.id]);
  const t1 = beweeg(tl, o, { pad, t0, duur: opt.duur, manier: opt.manier ?? 'jog', spoor: opt.spoor ? 'loop' : false });
  voegToe(tl.kijk, o.id, { t: t1, hoek: r.richting + 180 }, (e) => e.t);
  return t1;
}

export function maakTijdlijn(tekening: Tekening): Tijdlijn {
  const tl: Tijdlijn = {
    tekening,
    duur: 0,
    objecten: new Map(tekening.objecten.map((o) => [o.id, o])),
    bewegingen: new Map(),
    kijk: new Map(),
    houdingen: new Map(),
    teams: new Map(),
    balEvents: new Map(),
    rijen: new Map(),
    sporen: [],
    loslaten: [],
    zitten: new Map(),
    sprongen: new Map(),
    tikken: new Map(),
    aantikken: new Map(),
    stompen: [],
    blokken: [],
  };
  for (const o of tl.objecten.values()) if (o.houding) tl.zitten.set(o.id, [{ t: 0, soort: o.houding }]);

  // Rijen: spelers op hun plek zetten, kijkend naar voren.
  for (const r of tekening.rijen ?? []) {
    r.spelers.forEach((id, k) => {
      const o = tl.objecten.get(id);
      if (!isPersoon(o)) throw new TekeningFout(`Rij ${r.id}: "${id}" is geen speler, keeper of trainer`);
      const [x, y] = rijPlek(r, k);
      tl.objecten.set(id, { ...o!, x, y, kijkrichting: o!.kijkrichting ?? r.richting + 180 });
    });
    tl.rijen.set(r.id, { def: r, momenten: [{ t: 0, leden: [...r.spelers] }] });
  }

  for (const o of tl.objecten.values()) {
    if (o.soort !== 'bal') continue;
    if (o.bij) {
      if (!isPersoon(tl.objecten.get(o.bij))) throw new TekeningFout(`Bal ${o.id}: onbekende persoon "${o.bij}"`);
      voegToe(tl.balEvents, o.id, { soort: 'vast', t0: 0, houder: o.bij }, (e) => e.t0);
    } else {
      voegToe(tl.balEvents, o.id, { soort: 'los', t0: 0, punt: [o.x, o.y] }, (e) => e.t0);
    }
  }

  tl.duur = verwerkReeks(tl, tekening.animatie ?? [], 0);
  return tl;
}

function verwerkReeks(tl: Tijdlijn, stappen: Stap[], T: number): number {
  for (const stap of stappen) T = verwerk(tl, stap, T);
  return T;
}

function verwerk(tl: Tijdlijn, stap: Stap, T: number): number {
  if (isHerhaal(stap)) return verwerkHerhaal(tl, stap, T);
  if (isTegelijk(stap)) return verwerkTegelijk(tl, stap, T);
  return verwerkStap(tl, stap, T);
}

const spelersVan = (h: HerhaalStap) => Array.from({ length: h.herhaal.rondes ?? 1 }, () => h.herhaal.spelers).flat();

/** Een herhaling zonder overlap als losse stappen (zodat hij in een parallelle reeks stap voor stap meeloopt). */
function plat(stappen: Stap[]): Stap[] {
  return stappen.flatMap((s) => {
    if (!isHerhaal(s) || s.herhaal.tussen !== undefined) return [s];
    const lijst = spelersVan(s);
    return lijst.flatMap((_, i) => s.herhaal.stappen.map((st) => invullen(st, lijst, i, s.herhaal.waarden)));
  });
}

/**
 * Reeksen tegelijk: steeds de reeks die het verst achterloopt in de tijd doet zijn volgende stap,
 * zodat rijen en ballen in de goede volgorde kloppen.
 */
function verwerkTegelijk(tl: Tijdlijn, s: TegelijkStap, T: number): number {
  const banen = s.tegelijk.map((reeks) => ({ stappen: plat(reeks), k: 0, T }));
  let eind = T;
  for (;;) {
    const open = banen.filter((b) => b.k < b.stappen.length);
    if (!open.length) break;
    const b = open.reduce((a, c) => (c.T < a.T ? c : a));
    b.T = verwerk(tl, b.stappen[b.k]!, b.T);
    b.k++;
    eind = Math.max(eind, b.T);
  }
  return eind;
}

/** Vervang @, @volgende, @vorige en @<naam> (uit `waarden`) door echte waarden. */
function invullen(stap: AnimatieStap, spelers: string[], i: number, waarden: Record<string, Waarde[]> = {}): AnimatieStap {
  const n = spelers.length;
  const vervang = (v: unknown) => {
    if (typeof v !== 'string' || !v.startsWith('@')) return v;
    if (v === '@') return spelers[i];
    if (v === '@volgende') return spelers[(i + 1) % n];
    if (v === '@vorige') return spelers[(i - 1 + n) % n];
    const lijst = waarden[v.slice(1)];
    if (lijst?.length) return lijst[i % lijst.length];
    throw new TekeningFout(`Herhaling: onbekende invulling "${v}"`);
  };
  return {
    ...stap,
    acties: stap.acties.map((a) => {
      const kopie = { ...a } as Record<string, unknown>;
      for (const veld of Object.keys(kopie)) kopie[veld] = vervang(kopie[veld]);
      return kopie as unknown as Actie;
    }),
  };
}

/**
 * Herhaling: elke speler doorloopt dezelfde stappen. Met `tussen` overlappen de spelers; de stappen van alle
 * spelers worden dan in volgorde van tijd verwerkt (zodat rijen en ballen kloppen).
 */
function verwerkHerhaal(tl: Tijdlijn, h: HerhaalStap, T: number): number {
  const { stappen, tussen, waarden } = h.herhaal;
  const lijst = spelersVan(h);
  if (tussen === undefined) {
    lijst.forEach((_, i) => {
      for (const s of stappen) T = verwerkStap(tl, invullen(s, lijst, i, waarden), T);
    });
    return T;
  }
  const banen = lijst.map((_, i) => ({ i, k: 0, T: T + i * tussen }));
  let eind = T;
  for (;;) {
    const open = banen.filter((b) => b.k < stappen.length);
    if (!open.length) break;
    const b = open.reduce((a, c) => (c.T < a.T ? c : a));
    b.T = verwerkStap(tl, invullen(stappen[b.k]!, lijst, b.i, waarden), b.T);
    b.k++;
    eind = Math.max(eind, b.T);
  }
  return eind;
}

function verwerkStap(tl: Tijdlijn, stap: AnimatieStap, T: number): number {
  let eind = T + (stap.duur ?? 0);
  const persoon = (id: string, actie: Actie): VeldObject => {
    const o = tl.objecten.get(id);
    if (!isPersoon(o)) throw new TekeningFout(`Actie ${actie.type}: "${id}" is geen speler, keeper of trainer`);
    return o!;
  };
  const houding = (id: string, e: HoudingEvent) => voegToe(tl.houdingen, id, e, (x) => x.t);

  // 1. Bewegingen van personen (eerst, zodat een pass weet waar de ontvanger heen loopt).
  for (const a of stap.acties) {
    if (isBalActie(a)) continue;
    const o = persoon(a.wie, a);
    let t0 = T + (a.start ?? 0);

    if (a.type === 'team') {
      voegToe(tl.teams, o.id, { t: t0, team: a.team }, (e) => e.t);
      continue;
    }
    if (a.type === 'pak') {
      const bal = a.bal ?? losseBalBij(tl, positie(tl, o.id, t0), t0);
      if (!bal) throw new TekeningFout(`Pak: geen losse bal bij "${o.id}"`);
      voegToe(tl.balEvents, bal, { soort: 'vast', t0, houder: o.id }, (e) => e.t0);
      eind = Math.max(eind, t0 + (a.duur ?? MIN_DUUR));
      continue;
    }
    if (a.type === 'springen') {
      voegToe(tl.sprongen, o.id, t0 + 0.3, (x) => x);
      eind = Math.max(eind, t0 + 0.7);
      continue;
    }
    if (a.type === 'grondtik') {
      const t1 = t0 + (a.duur ?? 0.8);
      voegToe(tl.tikken, o.id, { t0, t1 }, (e) => e.t0);
      eind = Math.max(eind, t1);
      continue;
    }
    if (a.type === 'draai') {
      const p = positie(tl, o.id, t0);
      const doel = a.naar ? tl.objecten.get(a.naar) : undefined;
      if (a.naar && !doel) throw new TekeningFout(`Draai: onbekend object "${a.naar}"`);
      const d: Punt | undefined = doel ? (isPersoon(doel) ? positie(tl, doel.id, t0) : [doel.x, doel.y]) : undefined;
      const hoek = d ? graden(p, d) : a.kijk;
      if (hoek === undefined) throw new TekeningFout(`Draai: geef "kijk" of "naar" voor "${o.id}"`);
      voegToe(tl.kijk, o.id, { t: t0, hoek }, (e) => e.t);
      // Draaisprong: hoogste punt halverwege de draai.
      if (a.sprong) voegToe(tl.sprongen, o.id, t0 + 0.2, (x) => x);
      eind = Math.max(eind, t0 + (a.duur ?? (a.sprong ? 0.55 : DRAAI)));
      continue;
    }
    if (a.type === 'aantikken') {
      const doel = a.doel ? tl.objecten.get(a.doel) : undefined;
      const punt: Punt | undefined = a.punt ?? (doel ? [doel.x, doel.y] : undefined);
      if (!punt) throw new TekeningFout(`Aantikken: geen object of punt ("${a.doel ?? ''}")`);
      const t1 = t0 + (a.duur ?? 0.6);
      voegToe(tl.aantikken, o.id, { t0, t1, punt, voet: a.met === 'voet' }, (e) => e.t0);
      eind = Math.max(eind, t1);
      continue;
    }
    if (a.type === 'zitten') {
      voegToe(tl.zitten, o.id, { t: t0, soort: a.houding }, (e) => e.t);
      eind = Math.max(eind, t0 + 0.4);
      continue;
    }
    if (a.type === 'opstaan') {
      const t1 = t0 + (a.duur ?? DUUR_OPSTAAN);
      houding(o.id, { t: t0, t1, houding: 'staan' });
      eind = Math.max(eind, t1);
      continue;
    }
    if (a.type === 'schijn') {
      const p = positie(tl, o.id, t0);
      const kijk = kijkHoek(tl, o.id, t0);
      const opzij = richting(kijk + (a.kant === 'rechts' ? 90 : -90));
      const t1 = beweeg(tl, o, {
        pad: [p, [p[0] + opzij[0] * 0.45, p[1] + opzij[1] * 0.45], p],
        t0,
        duur: a.duur ?? 0.7,
        manier: 'schijn',
        kijk,
        spoor: false,
      });
      eind = Math.max(eind, t1);
      continue;
    }
    if (a.type === 'druk' || a.type === 'dek' || a.type === 'verover' || a.type === 'panna' || a.type === 'pluk') continue; // later
    if (a.type === 'aansluiten') {
      const rs = a.rij ? tl.rijen.get(a.rij) : a.bij ? rijVan(tl, a.bij, t0, true) : undefined;
      if (!rs) throw new TekeningFout(`Aansluiten: geen rij gevonden voor "${o.id}" (${a.rij ?? a.bij ?? 'geen rij of bij'})`);
      eind = Math.max(eind, sluitAan(tl, o, rs, t0, { duur: a.duur, manier: a.manier, spoor: a.spoor }));
      continue;
    }

    // loop / dribbel / duik
    const m = a as BeweegActie;
    if (m.type === 'dribbel' && !balVan(tl, o.id, t0) && !losseBalBij(tl, positie(tl, o.id, t0), t0)) {
      // Wacht tot de bal er is.
      const aankomst = balOnderweg(tl, o.id, t0);
      if (aankomst !== undefined) t0 = aankomst + 0.1;
    }
    verlaatRij(tl, o.id, t0);
    const van = positie(tl, o.id, t0);
    const pad: Punt[] = [van, ...(m.via ?? [])];
    if (m.om) {
      const obj = tl.objecten.get(m.om);
      if (!obj) throw new TekeningFout(`Loop: object "${m.om}" om heen te draaien bestaat niet`);
      pad.push(...draaiOm([obj.x, obj.y], pad[pad.length - 1]!, m.naar, m.straal ?? 0.9, m.kant ?? 'links'));
    }
    pad.push(m.naar);
    if (m.type === 'dribbel' && !balVan(tl, o.id, t0)) {
      const bal = losseBalBij(tl, van, t0);
      if (!bal) throw new TekeningFout(`Dribbel: "${o.id}" heeft geen bal`);
      voegToe(tl.balEvents, bal, { soort: 'vast', t0, houder: o.id }, (e) => e.t0);
    }
    if (m.type === 'dribbel') {
      const bal = balVan(tl, o.id, t0);
      if (bal) tl.loslaten.push({ bal, wie: o.id, t: t0, soort: 'voet' });
    }
    if (m.type === 'duik') {
      houding(o.id, { t: t0, t1: t0 + (m.duur ?? DUUR_DUIK), houding: 'duik', hoek: graden(van, m.naar), hoog: m.hoogte });
    } else if (ligging(tl, o.id, t0).liggen > 0) {
      // Wie ligt en gaat lopen, krabbelt eerst snel op.
      houding(o.id, { t: t0, t1: t0 + DUUR_OPKRABBELEN, houding: 'staan' });
    }
    const t1 = beweeg(tl, o, {
      pad,
      t0,
      duur: m.duur ?? (m.type === 'duik' ? DUUR_DUIK : undefined),
      manier: m.manier,
      ease: m.type === 'duik' ? 'duik' : 'mens',
      snelheid: m.type === 'dribbel' ? DRIBBEL : undefined,
      // Een duik zonder kijkrichting: keeper blijft het veld in kijken.
      kijk: m.type === 'duik' ? (m.kijk ?? kijkHoek(tl, o.id, t0)) : m.kijk,
      spoor: m.spoor === false ? false : m.type === 'dribbel' ? 'dribbel' : 'loop',
    });
    eind = Math.max(eind, t1);
  }

  // 1b. Druk zetten en passlijnen dichtlopen: pas nu weten we waar de anderen heen lopen.
  for (const a of stap.acties) {
    if (a.type !== 'druk' && a.type !== 'dek') continue;
    const o = persoon(a.wie, a);
    const t0 = T + (a.start ?? 0);
    const van = positie(tl, o.id, t0);
    const manier = a.manier ?? 'sprint';
    const doelOp = (t: number): Punt => {
      if (a.type === 'dek') {
        const plek = (x: string | Punt): Punt => (typeof x === 'string' ? positie(tl, x, t) : x);
        const p = plek(a.tussen[0]);
        const q = plek(a.tussen[1]);
        if (a.afstand !== undefined) return lerp(p, q, Math.min(1, a.afstand / (afstand(p, q) || 1)));
        return lerp(p, q, a.fractie ?? 0.5);
      }
      const doelwit = a.op ?? houderDichtbij(tl, van, t0);
      if (!doelwit) throw new TekeningFout(`Druk: niemand heeft de bal (bij "${o.id}")`);
      const p = positie(tl, doelwit, t);
      const d = afstand(p, van) || 1;
      const op = a.afstand ?? 1.7;
      return [p[0] + ((van[0] - p[0]) / d) * op, p[1] + ((van[1] - p[1]) / d) * op];
    };
    // Twee keer schatten: waar is het doel als hij er aankomt?
    let naar = doelOp(t0 + 1);
    let duur = a.duur ?? Math.max(MIN_DUUR, afstand(van, naar) / SNELHEID[manier]);
    // Loopt zijn tegenstander nog door? Dan schuift hij mee tot die stilstaat (en loopt er niet tegenaan).
    if (a.duur === undefined) {
      const wie = a.type === 'dek' ? a.tussen.filter((x): x is string => typeof x === 'string') : [a.op ?? houderDichtbij(tl, van, t0)];
      for (const id of wie) if (id) duur = Math.max(duur, stilVanaf(tl, id, t0) - t0);
    }
    naar = doelOp(t0 + duur);
    verlaatRij(tl, o.id, t0);
    eind = Math.max(eind, beweeg(tl, o, { pad: [van, naar], t0, duur, manier, spoor: 'loop' }));
  }

  // 2. Passes, schoten en balveroveringen.
  for (const a of stap.acties) {
    if (a.type === 'pluk') {
      eind = Math.max(eind, pluk(tl, persoon(a.wie, a), a.van, T + (a.start ?? 0), a.duur));
      continue;
    }
    if (a.type === 'verover') {
      const o = persoon(a.wie, a);
      const t0 = T + (a.start ?? 0);
      const bal = balVan(tl, a.van, t0);
      if (!bal) throw new TekeningFout(`Verover: "${a.van}" heeft geen bal`);
      eind = Math.max(eind, vlucht(tl, bal, balPunt(tl, bal, t0), t0, o.id, { type: 'pass' }, a.van, 1, a.duur ?? 0.3));
      continue;
    }
    if (a.type === 'panna') {
      eind = Math.max(eind, panna(tl, persoon(a.wie, a), persoon(a.door, a), T + (a.start ?? 0), a.verder ?? 2.5, a.kant ?? 'links'));
      continue;
    }
    if (!isBalActie(a)) continue;
    eind = Math.max(eind, balActie(tl, a, T));
  }

  return Math.max(eind, T + MIN_DUUR);
}

function balActie(tl: Tijdlijn, a: BalActie, T: number): number {
  let t0 = T + (a.start ?? 0);
  const van = tl.objecten.get(a.van);
  if (!isPersoon(van)) throw new TekeningFout(`${a.type}: "${a.van}" is geen speler, keeper of trainer`);
  // Komt de bal nog naar de passeerder toe? Dan wacht hij tot hij hem heeft.
  if (!a.bal && !balVan(tl, a.van, t0) && !losseBalBij(tl, positie(tl, a.van, t0), t0)) {
    const aankomst = balOnderweg(tl, a.van, t0);
    // In één keer (volley, kopbal): direct bij aankomst, zonder aanname.
    if (aankomst !== undefined) t0 = aankomst + (a.direct ? 0 : 0.15);
  }
  const bal = a.bal ?? balVan(tl, a.van, t0) ?? losseBalBij(tl, positie(tl, a.van, t0), t0);
  if (!bal) throw new TekeningFout(`${a.type}: "${a.van}" heeft geen bal`);

  // Uit de handen (worp, of een keeper die de bal wegrolt) of met de voet.
  const keeper = van!.soort === 'keeper';
  const worp: WorpSoort | 'voet' = a.worp ?? (keeper && !a.direct ? 'onderhands' : 'voet');
  const rollend = balTop(a, [0, 0], [10, 0]) === 0;
  if (worp !== 'voet' && !a.direct && balVan(tl, a.van, t0) === bal) {
    // Eerst de bal in de handen nemen (of vangen en naar de borst halen), dan uithalen.
    const sinds = balSinds(tl, bal, t0);
    const nodig = (keeper ? 0.45 : 0.5) + UITHALEN;
    if (t0 < sinds.t + nodig) t0 = sinds.t + nodig;
    // Aan het begin van de animatie: het uithalen moet nog te zien zijn.
    if (t0 < UITHALEN + 0.15) t0 = UITHALEN + 0.15;
  }
  tl.loslaten.push({ bal, wie: a.van, t: t0, soort: worp, rollend });

  // Een bal die net door de lucht aankwam en direct wordt doorgespeeld, vertrekt op die hoogte.
  let h0 = worp === 'voet' ? 0 : loslaatHoogte({ soort: worp, rollend });
  let start = balPunt(tl, bal, t0);
  if (a.direct) {
    const vorige = (tl.balEvents.get(bal) ?? []).filter((e) => e.soort === 'vlucht' && e.daarna === a.van && Math.abs(e.t1 - t0) < 0.06).at(-1);
    if (vorige && vorige.soort === 'vlucht') {
      h0 = vorige.h1;
      start = vorige.naar;
    }
  }
  const opties: VluchtOpties = { ...a, h0, geenSprong: worp !== 'voet' };
  const kijkNaar = (doel: Punt) => {
    if (afstand(start, doel) < 0.2) return; // bal omhoog (hooghouden): blijft kijken waar hij keek
    if (!actief(tl, a.van, t0) && (van!.soort !== 'keeper' || !ligt(tl, a.van, t0))) {
      voegToe(tl.kijk, a.van, { t: t0, hoek: graden(start, doel) }, (e) => e.t);
    }
  };

  // Op een rebounder of muurtje: de bal kaatst terug.
  const muur = typeof a.naar === 'string' ? tl.objecten.get(a.naar) : undefined;
  // Na het afketsen: naar `terug`, met een duik als dat een keeper is en er `duikNaar` staat.
  const verder = (kaats: Punt, tK: number, hK: number, door: string) => {
    const doel = a.terug ?? a.van;
    const o: VluchtOpties = { type: 'pass', hoogte: a.terugHoogte ?? 'grond', h0: hK, geenSprong: true };
    if (a.duikNaar && typeof doel === 'string') return naarDuik(tl, { ...a, naar: doel, duur: undefined, hoogte: a.terugHoogte ?? 'grond', type: 'pass' }, bal, kaats, tK, o, () => {}, door);
    return vlucht(tl, bal, kaats, tK, doel, o, door, 1.2);
  };
  if (muur && isPersoon(muur) && a.terug !== undefined) {
    // Een persoon raakt de bal en die verandert van richting.
    const p = positie(tl, muur.id, t0 + 0.4);
    const d = afstand(start, p) || 1;
    const raak: Punt = [p[0] + ((start[0] - p[0]) / d) * 0.4, p[1] + ((start[1] - p[1]) / d) * 0.4];
    const hR = a.eindHoogte ?? 0.3;
    kijkNaar(raak);
    voegToe(tl.kijk, muur.id, { t: t0, hoek: graden(p, start) }, (e) => e.t);
    const tR = vlucht(tl, bal, start, t0, raak, { ...opties, eindHoogte: hR }, a.van, 1, a.duur);
    return verder(raak, tR + 0.01, hR, muur.id);
  }
  if (muur && (muur.soort === 'rebounder' || muur.soort === 'muurtje' || muur.soort === 'bank' || muur.soort === 'pop')) {
    const m: Punt = [muur.x, muur.y];
    const d = afstand(start, m) || 1;
    const kaats: Punt = [m[0] + ((start[0] - m[0]) / d) * 0.3, m[1] + ((start[1] - m[1]) / d) * 0.3];
    const top = balTop(a, start, kaats);
    const t1 = t0 + vluchtDuur(a.type, top, afstand(start, kaats));
    kijkNaar(kaats);
    voegToe(tl.balEvents, bal, { soort: 'vlucht', t0, t1, van: start, naar: kaats, top, h0, h1: 0, passeerder: a.van, daarna: null, geenSprong: true }, (e) => e.t0);
    tl.sporen.push({ soort: 'bal', pad: [start, kaats], van: start, naar: kaats, t0, t1, ease: 'bal', top, id: bal });
    // Terug iets langzamer (de rebounder neemt snelheid weg).
    return verder(kaats, t1 + 0.03, 0, a.van);
  }

  if (a.onderschept) return onderschepping(tl, a, bal, start, t0, opties, kijkNaar);
  // Stuit: eerst op het stuitpunt, dan met een kleinere boog verder.
  if (a.stuitOp) {
    kijkNaar(a.stuitOp);
    const top = balTop(a, start, a.stuitOp);
    const tS = vlucht(tl, bal, start, t0, a.stuitOp, { ...opties, eindHoogte: 0 }, a.van);
    const tweede: VluchtOpties = { type: 'pass', hoogte: Math.max(0.3, top * 0.45), eindHoogte: a.eindHoogte };
    // Stuitbal wegstompen: de keeper valt de opspringende bal naar voren aan en stompt hem weg.
    if (a.uitkomen && a.stompNaar) return uitkomen(tl, { ...a, hoogte: tweede.hoogte, duur: undefined }, bal, a.stuitOp, tS, tweede, kijkNaar, t0);
    // Na de stuit duiken (bv. een reactiebal die opzij wegspringt).
    if (a.duikNaar && typeof a.naar === 'string') {
      return naarDuik(tl, { ...a, type: 'pass', hoogte: tweede.hoogte, duur: undefined }, bal, a.stuitOp, tS, tweede, () => {});
    }
    return vlucht(tl, bal, a.stuitOp, tS, a.naar, tweede, a.van, 1.1);
  }
  // Tegen de lat of paal: de bal springt terug het veld in.
  if (a.raakt && typeof a.naar !== 'string') {
    const hoog = a.raakt === 'lat' ? 2.4 : a.raakt === 'net' ? (a.eindHoogte ?? 0.6) : 0.8;
    kijkNaar(a.naar);
    const tR = vlucht(tl, bal, start, t0, a.naar, { ...opties, eindHoogte: hoog }, a.van, 1, a.duur);
    let g: Goal | undefined;
    for (const o of tl.objecten.values()) {
      const goal = goalVan(tl, o.id);
      if (goal && (!g || afstand(goal.midden, a.naar) < afstand(g.midden, a.naar))) g = goal;
    }
    const n = g?.n ?? [0, 1];
    const terug: Punt = a.terugNaar ?? [a.naar[0] + n[0] * 7, a.naar[1] + n[1] * 7];
    const tT = vlucht(tl, bal, a.naar, tR + 0.01, terug, { type: 'pass', hoogte: a.raakt === 'lat' ? 1.2 : 0.4, h0: hoog }, a.van, 1.3);
    // Doelnet: de stap duurt tot de bal terug is (lat en paal: zoals altijd tot de inslag).
    return a.raakt === 'net' ? tT : tR;
  }
  if (a.afloop && typeof a.naar !== 'string') {
    const t = keeperReactie(tl, a, bal, start, t0, a.naar, opties);
    if (t !== undefined) {
      kijkNaar(a.naar);
      return t;
    }
  }
  if (a.duikNaar && typeof a.naar === 'string') return naarDuik(tl, a, bal, start, t0, opties, kijkNaar);
  if (a.uitkomen) return uitkomen(tl, a, bal, start, t0, opties, kijkNaar);
  if (a.blokt) return blok(tl, a, bal, start, t0, opties, kijkNaar);
  if (typeof a.naar !== 'string') kijkNaar(a.naar);
  const t1 = vlucht(tl, bal, start, t0, a.naar, opties, a.van, 1, a.duur);
  if (typeof a.naar === 'string') {
    const e = tl.balEvents.get(bal)!.find((x) => x.soort === 'vlucht' && x.t0 === t0);
    if (e && e.soort === 'vlucht') kijkNaar(e.naar);
  }
  return t1;
}

/**
 * Een bal van `start` naar een persoon (komt aan waar die dan is) of naar een punt.
 * `trager` rekt de standaardduur op (bv. na een rebounder). Geeft de aankomsttijd terug.
 */
type VluchtOpties = Pick<BalActie, 'type' | 'hoogte' | 'hoog' | 'eindHoogte' | 'snelheid'> & { h0?: number; geenSprong?: boolean };

function vlucht(tl: Tijdlijn, bal: string, start: Punt, t0: number, naar: string | Punt, a: VluchtOpties, passeerder: string, trager = 1, duur?: number): number {
  let doel: Punt;
  let ontvanger: string | null = null;
  let t1: number;
  const tijd = (doel: Punt) => (a.snelheid ? Math.max(MIN_DUUR, afstand(start, doel) / a.snelheid) : vluchtDuur(a.type, balTop(a, start, doel), afstand(start, doel)) * trager);

  if (typeof naar === 'string') {
    const o = tl.objecten.get(naar);
    if (!isPersoon(o)) throw new TekeningFout(`${a.type}: "${naar}" is geen speler, keeper of trainer`);
    ontvanger = naar;
    // Waar is de ontvanger als de bal aankomt? Twee keer schatten is ruim voldoende.
    const schat = (t: number) => t0 + tijd(positie(tl, naar, t));
    t1 = duur !== undefined ? t0 + duur : schat(schat(t0));
    const p = positie(tl, naar, t1);
    const l = ligging(tl, naar, t1);
    if (l.liggen > 0.5) {
      const r = richting(l.hoek);
      doel = [p[0] + r[0] * 0.55, p[1] + r[1] * 0.55];
    } else {
      const d = afstand(p, start);
      if (d < 0.5) {
        // Bal naar jezelf (hooghouden): hij komt terug waar hij was.
        doel = start;
      } else {
        const bezig = actief(tl, naar, t1);
        if (bezig) {
          // Pass in de loop: de bal komt voor zijn voet aan, in zijn looprichting.
          const r = richting(kijkHoek(tl, naar, t1));
          doel = [p[0] + r[0] * balAfstand(o!), p[1] + r[1] * balAfstand(o!)];
        } else {
          // Stilstaand: hij draait zich al naar de bal terwijl die onderweg is, en neemt hem aan de voet aan.
          const r: Punt = [(start[0] - p[0]) / d, (start[1] - p[1]) / d];
          doel = [p[0] + r[0] * balAfstand(o!), p[1] + r[1] * balAfstand(o!)];
          voegToe(tl.kijk, naar, { t: Math.max(t0, t1 - DRAAI), hoek: graden(p, start) }, (e) => e.t);
        }
      }
    }
  } else {
    doel = naar;
    t1 = t0 + (duur ?? tijd(doel));
  }

  const top = balTop(a, start, doel);
  // Een keeper vangt de bal in zijn handen: op de gevraagde hoogte, anders borsthoogte (door de lucht) of
  // schepvangen (over de grond). Duikt hij, dan bij zijn handen (ook hoog in de lucht).
  let h1 = a.eindHoogte ?? 0;
  if (ontvanger && a.eindHoogte === undefined && tl.objecten.get(ontvanger)?.soort === 'keeper') {
    h1 = ligging(tl, ontvanger, t1).liggen > 0.5 ? 0.3 + zweefOp(tl, ontvanger, t1) : top > 0.05 ? 1.1 - zitLager(tl, ontvanger, t1) : 0.15;
  }
  voegToe(tl.balEvents, bal, { soort: 'vlucht', t0, t1, van: start, naar: doel, top, h0: a.h0 ?? 0, h1, passeerder, daarna: ontvanger, geenSprong: a.geenSprong }, (e) => e.t0);
  // Een bal recht omhoog (hooghouden) laat geen lijn achter.
  if (afstand(start, doel) >= 0.2) tl.sporen.push({ soort: 'bal', pad: [start, doel], van: start, naar: doel, t0, t1, ease: 'bal', top, id: bal });
  return t1;
}

/** Wie heeft er een bal, het dichtst bij dit punt? */
function houderDichtbij(tl: Tijdlijn, p: Punt, t: number): string | undefined {
  let beste: string | undefined;
  let min = Infinity;
  for (const b of ballen(tl)) {
    const h = houderVan(tl, b, t);
    if (!h) continue;
    const d = afstand(positie(tl, h, t), p);
    if (d < min) {
      min = d;
      beste = h;
    }
  }
  return beste;
}

/** Pass die onderschept wordt: de verdediger loopt naar de passlijn en krijgt de bal. */
function onderschepping(tl: Tijdlijn, a: BalActie, bal: string, start: Punt, t0: number, opties: VluchtOpties, kijkNaar: (p: Punt) => void): number {
  const d = tl.objecten.get(a.onderschept!);
  if (!isPersoon(d)) throw new TekeningFout(`Onderschept: "${a.onderschept}" is geen speler`);
  const bedoeld = typeof a.naar === 'string' ? positie(tl, a.naar, t0 + 0.6) : a.naar;
  const lengte = afstand(start, bedoeld) || 1;
  const u: Punt = [(bedoeld[0] - start[0]) / lengte, (bedoeld[1] - start[1]) / lengte];
  const dp = positie(tl, d!.id, t0);
  const proj = Math.min(0.8, Math.max(0.3, ((dp[0] - start[0]) * u[0] + (dp[1] - start[1]) * u[1]) / lengte));
  const punt: Punt = [start[0] + u[0] * lengte * proj, start[1] + u[1] * lengte * proj];
  const tI = t0 + vluchtDuur(a.type, 0, lengte * proj);
  // Verdediger stapt in de lijn, met de bal aan zijn voet.
  const plek: Punt = [punt[0] + u[0] * 0.4, punt[1] + u[1] * 0.4];
  beweeg(tl, d!, { pad: [dp, plek], t0: t0 + 0.1, duur: Math.max(0.3, tI - t0 - 0.15), manier: 'sprint', spoor: 'loop' });
  kijkNaar(bedoeld);
  return vlucht(tl, bal, start, t0, d!.id, { ...opties, hoogte: 'grond' }, a.van, 1, tI - t0);
}

/**
 * Voorzet waar de keeper voor uitkomt: hij schat de bal in, loopt naar de plek waar de bal op ± 2,5 m hoogte naar
 * beneden komt, zet af op één been en vangt hem op het hoogste punt (of stompt hem weg naar `stompNaar`).
 */
function uitkomen(tl: Tijdlijn, a: BalActie, bal: string, start: Punt, t0: number, opties: VluchtOpties, kijkNaar: (p: Punt) => void, stuitVanaf?: number): number {
  const k = tl.objecten.get(a.uitkomen!);
  if (!k || k.soort !== 'keeper') throw new TekeningFout(`Uitkomen: "${a.uitkomen}" is geen keeper`);
  const eind: Punt = typeof a.naar === 'string' ? positie(tl, a.naar, t0 + 1) : a.naar;
  const top = balTop(a, start, eind);
  const totaal = a.duur ?? vluchtDuur(a.type, top, afstand(start, eind));
  const h0 = opties.h0 ?? 0;
  const he = a.eindHoogte ?? 0;
  const hoogteOp = (u: number) => {
    const f = ease('bal', u);
    return boog(top, f) + h0 + (he - h0) * f;
  };
  // Het moment waarop de bal (dalend) op vanghoogte is; een lage voorzet pakt hij laat in de vlucht.
  const doelH = a.vangHoogte ?? 2.5;
  let u = 0.85;
  if (stuitVanaf !== undefined) {
    // Na een stuit: raken terwijl de bal opkomt, op borst- tot hoofdhoogte (vóór het hoogste punt).
    const raakH = a.vangHoogte ?? Math.min(1.7, boog(top, 0.5) * 0.9);
    u = 0.5;
    for (let x = 0.05; x <= 0.5; x += 0.01) {
      if (hoogteOp(x) >= raakH) {
        u = x;
        break;
      }
    }
  } else if (hoogteOp(0.5) > doelH) {
    for (let x = 0.5; x <= 0.97; x += 0.01) {
      if (hoogteOp(x) <= doelH) {
        u = x;
        break;
      }
    }
  }
  const tC = t0 + totaal * u;
  const hC = hoogteOp(u);
  const contact = lerp(start, eind, ease('bal', u));
  // Keeper staat net vóór de bal (kant van de voorzetter) en kijkt ernaar.
  const terug = richting(graden(contact, start));
  // Bij een stuitbal staat hij juist aan de doelkant: hij raakt de bal vóór zich, op borst- of hoofdhoogte.
  const voor = stuitVanaf !== undefined ? -0.5 : 0.35;
  const plek: Punt = [contact[0] + terug[0] * voor, contact[1] + terug[1] * voor];
  // Inschatten; bij een stuitbal vertrekt hij al tijdens de eerste vlucht (de stuit aanvallen).
  const vertrek = stuitVanaf !== undefined ? stuitVanaf + 0.3 : t0 + 0.3;
  const van = positie(tl, k.id, vertrek);
  const aankomst = Math.max(vertrek + 0.4, tC - 0.15);
  beweeg(tl, k, { pad: [van, plek], t0: vertrek, duur: aankomst - vertrek, manier: 'sprint', kijk: graden(plek, start), spoor: 'loop' });
  kijkNaar(eind);
  if (a.stompNaar) {
    // Wegstompen: bal tot de vuisten, dan met een boog weg.
    tl.stompen.push({ wie: k.id, t: tC, vuisten: a.vuisten ?? 2 });
    const hand: Punt = [plek[0] - terug[0] * voor, plek[1] - terug[1] * voor];
    // Na een stuit stijgt de bal nog tot de vuisten (hoogste punt bij het contact).
    vlucht(tl, bal, start, t0, hand, { ...opties, ...(stuitVanaf !== undefined ? { hoogte: hC / 4 } : {}), eindHoogte: hC }, a.van, 1, tC - t0);
    // Een stuitbal stompt hij op borst-/hoofdhoogte weg zonder te springen.
    vlucht(tl, bal, hand, tC + 0.01, a.stompNaar, { type: 'pass', hoogte: 2, h0: hC, geenSprong: stuitVanaf !== undefined }, k.id, 0.9);
    return tC;
  }
  return vlucht(tl, bal, start, t0, k.id, { ...opties, eindHoogte: hC }, a.van, 1, tC - t0);
}

/** 1 op 1: de keeper blokt het schot met zijn lichaam (spreidsprong of knieblok); de bal kaatst af. */
function blok(tl: Tijdlijn, a: BalActie, bal: string, start: Punt, t0: number, opties: VluchtOpties, kijkNaar: (p: Punt) => void): number {
  const k = tl.objecten.get(a.blokt!);
  if (!k || k.soort !== 'keeper') throw new TekeningFout(`Blok: "${a.blokt}" is geen keeper`);
  const soort = a.blokSoort ?? 'ster';
  const schat = positie(tl, k.id, t0 + 0.3);
  const r = richting(graden(schat, start));
  const contact: Punt = [schat[0] + r[0] * 0.35, schat[1] + r[1] * 0.35];
  const hC = soort === 'ster' ? 0.55 : 0.3;
  kijkNaar(contact);
  const tC = vlucht(tl, bal, start, t0, contact, { ...opties, eindHoogte: hC }, a.van, 1, a.duur);
  tl.blokken.push({ wie: k.id, t: tC, soort });
  voegToe(tl.kijk, k.id, { t: Math.max(t0, tC - 0.6), hoek: graden(positie(tl, k.id, tC), start) }, (e) => e.t);
  // Afketsen: terug het veld in en iets opzij.
  const weg: Punt = a.afloopNaar ?? [contact[0] + r[0] * 4 - r[1] * 2, contact[1] + r[1] * 4 + r[0] * 2];
  vlucht(tl, bal, contact, tC + 0.01, weg, { type: 'pass', hoogte: 0.5, h0: hC, geenSprong: true }, k.id, 1.4);
  return tC;
}

/**
 * Plukken: laag duiken naar de bal aan de voet van `van` (of de dichtstbijzijnde losse bal) en hem pakken.
 * De bal blijft aan de voet tot de handen er vlak bij zijn.
 */
function pluk(tl: Tijdlijn, k: VeldObject, van: string | undefined, t0: number, duur?: number): number {
  const kp = positie(tl, k.id, t0);
  let bal = van ? balVan(tl, van, t0) : undefined;
  if (!bal) {
    let min = 5;
    for (const b of ballen(tl)) {
      if (houderVan(tl, b, t0) !== null) continue;
      const d = afstand(balPunt(tl, b, t0), kp);
      if (d < min) {
        min = d;
        bal = b;
      }
    }
  }
  if (!bal) throw new TekeningFout(`Pluk: geen bal bij "${k.id}"`);
  const schatB = balPunt(tl, bal, t0 + 0.45);
  const t1 = t0 + (duur ?? Math.max(0.45, afstand(kp, schatB) / 5));
  const b = balPunt(tl, bal, t1);
  const naarBal = graden(kp, b);
  // Zijwaarts duiken: het lichaam komt dwars voor de bal te liggen (niet op de buik naar voren).
  const r = richting(naarBal + 90);
  const eind: Punt = [b[0] - r[0] * 0.55, b[1] - r[1] * 0.55];
  voegToe(tl.houdingen, k.id, { t: t0, t1, houding: 'duik', hoek: naarBal + 90 }, (x) => x.t);
  beweeg(tl, k, { pad: [kp, eind], t0, duur: t1 - t0, ease: 'duik', kijk: naarBal, spoor: false });
  const los = Math.max(t0, t1 - 0.15);
  vlucht(tl, bal, balPunt(tl, bal, los), los, k.id, { type: 'pass', hoogte: 'grond', geenSprong: true }, van ?? k.id, 1, t1 - los);
  return t1;
}

/** Bal naar een keeper die ervoor duikt: de duik eindigt precies als de bal aankomt. */
function naarDuik(tl: Tijdlijn, a: BalActie, bal: string, start: Punt, t0: number, opties: VluchtOpties, kijkNaar: (p: Punt) => void, passeerder = a.van): number {
  const k = tl.objecten.get(a.naar as string);
  if (!isPersoon(k)) throw new TekeningFout(`${a.type}: "${a.naar}" is geen keeper`);
  const naar = a.duikNaar!;
  const van = positie(tl, k!.id, t0);
  const r = richting(graden(van, naar));
  // De bal komt bij de handen aan: iets voorbij het eindpunt van de duik.
  const handen: Punt = [naar[0] + r[0] * 0.55, naar[1] + r[1] * 0.55];
  const duur = a.duur ?? vluchtDuur(a.type, balTop(a, start, handen), afstand(start, handen));
  const t1 = t0 + duur;
  const duikDuur = Math.min(0.55, duur - 0.1);
  const tD = t1 - duikDuur;
  // Zit hij (kniezit/hurkzit) of staat hij nog stil: duiken vanaf de plek waar hij dan is.
  voegToe(tl.houdingen, k!.id, { t: tD, t1, houding: 'duik', hoek: graden(van, naar), hoog: a.duikHoogte }, (x) => x.t);
  beweeg(tl, k!, { pad: [positie(tl, k!.id, tD), naar], t0: tD, duur: duikDuur, ease: 'duik', kijk: kijkHoek(tl, k!.id, tD), spoor: false });
  kijkNaar(handen);
  return vlucht(tl, bal, start, t0, k!.id, opties, passeerder, 1, duur);
}

/** Duik van de keeper (met vanzelf opstaan) of een stap opzij als de bal dichtbij is. */
function keeperBeweging(tl: Tijdlijn, k: VeldObject, van: Punt, naar: Punt, t0: number, t1: number, duik: boolean, hoog?: number) {
  const kijk = kijkHoek(tl, k.id, t0);
  if (duik) {
    voegToe(tl.houdingen, k.id, { t: t0, t1, houding: 'duik', hoek: graden(van, naar), hoog }, (x) => x.t);
    voegToe(tl.houdingen, k.id, { t: t1 + 0.7, t1: t1 + 1.2, houding: 'staan' }, (x) => x.t);
  }
  beweeg(tl, k, { pad: [van, naar], t0, duur: Math.max(0.25, t1 - t0), ease: duik ? 'duik' : 'mens', kijk, spoor: false });
}

/**
 * Schot met een afloop: de keeper van het goal waar de bal heen gaat zet zich, duikt en vangt, stompt of is te laat.
 * Geeft de aankomsttijd terug, of undefined als er geen keeper bij dat goal staat.
 */
function keeperReactie(tl: Tijdlijn, a: BalActie, bal: string, start: Punt, t0: number, doel: Punt, opties: VluchtOpties): number | undefined {
  let k: VeldObject | undefined;
  let g: Goal | undefined;
  for (const o of tl.objecten.values()) {
    if (o.soort !== 'keeper' || !o.verdedigt) continue;
    const goal = goalVan(tl, o.verdedigt);
    if (goal && (!g || afstand(goal.midden, doel) < afstand(g.midden, doel))) {
      k = o;
      g = goal;
    }
  }
  if (!k || !g || a.afloop === 'naast') return undefined;
  const reactie = t0 + 0.12;
  // Ligt de keeper nog (bv. na een eerdere redding), dan kan hij niet meer reageren.
  if (ligging(tl, k.id, reactie).liggen > 0.3) return undefined;
  const kp = positie(tl, k.id, reactie);
  // Waar komt de bal langs op de diepte van de keeper?
  const ys = tovGoal(g, start).ly;
  const yd = tovGoal(g, doel).ly;
  const yk = tovGoal(g, kp).ly;
  const s = Math.min(0.97, Math.max(0.4, (ys - yk) / (ys - yd || 1)));
  const langs = lerp(start, doel, s);
  const totaal = opties.snelheid ? afstand(start, doel) / opties.snelheid : vluchtDuur(a.type, balTop(a, start, doel), afstand(start, doel));
  const tI = t0 + Math.max(0.4, totaal * s);
  const opzij = afstand(kp, langs);
  const r: Punt = opzij > 0.01 ? [(langs[0] - kp[0]) / opzij, (langs[1] - kp[1]) / opzij] : [0, 0];
  const duik = opzij > 1.1;
  const zijkant = Math.sign(tovGoal(g, langs).lx) || 1;

  if (a.afloop === 'goal') {
    // Te laat: duikt de goede kant op maar haalt de bal niet.
    const eind: Punt = [kp[0] + r[0] * Math.max(0.3, opzij - 1.4), kp[1] + r[1] * Math.max(0.3, opzij - 1.4)];
    keeperBeweging(tl, k, kp, eind, reactie, tI, true);
    return vlucht(tl, bal, start, t0, doel, opties, a.van);
  }

  // Hoogte van de bal waar hij langs de keeper komt.
  const top = balTop(a, start, doel);
  const h0 = opties.h0 ?? 0;
  const hLangs = opties.eindHoogte ?? (top > 0.05 ? boog(top, ease('bal', s)) + h0 * (1 - s) : 0.15);

  if (a.afloop === 'tipt') return tip(tl, k, g, a, bal, start, t0, kp, langs, tI, hLangs, opties, reactie);

  // Redding: handen komen precies waar de bal langskomt.
  const eind: Punt = duik ? [langs[0] - r[0] * 0.55, langs[1] - r[1] * 0.55] : [langs[0] - r[0] * 0.35, langs[1] - r[1] * 0.35];
  keeperBeweging(tl, k, kp, eind, reactie, tI, duik, duik ? hLangs : undefined);
  if (a.afloop === 'stompt') {
    const weg: Punt = a.afloopNaar ?? [langs[0] + g.zij[0] * zijkant * 4 + g.n[0] * 4, langs[1] + g.zij[1] * zijkant * 4 + g.n[1] * 4];
    const tS = vlucht(tl, bal, start, t0, langs, { ...opties, eindHoogte: opties.eindHoogte ?? 0.4 }, a.van, 1, tI - t0);
    voegToe(tl.kijk, k.id, { t: reactie, hoek: kijkHoek(tl, k.id, reactie) }, (e) => e.t);
    vlucht(tl, bal, langs, tS + 0.02, weg, { type: 'pass', hoogte: 1.2, h0: 0.4 }, k.id);
    return tS;
  }
  // Vangt: bal in de handen (op de hoogte waar hij aankomt), daarna opstaan en wegrollen naar de zijkant.
  const tV = vlucht(tl, bal, start, t0, k.id, duik ? opties : { ...opties, eindHoogte: hLangs }, a.van, 1, tI - t0);
  if (a.vasthouden) return tV;
  const uit = tV + (duik ? 1.5 : 0.9);
  const weg: Punt = a.afloopNaar ?? [g.midden[0] + g.zij[0] * -zijkant * 7 + g.n[0] * 7, g.midden[1] + g.zij[1] * -zijkant * 7 + g.n[1] * 7];
  const vanaf = balPunt(tl, bal, uit);
  voegToe(tl.kijk, k.id, { t: uit - 0.3, hoek: graden(positie(tl, k.id, uit), weg) }, (e) => e.t);
  tl.loslaten.push({ bal, wie: k.id, t: uit, soort: 'onderhands', rollend: true });
  vlucht(tl, bal, vanaf, uit, weg, { type: 'pass', hoogte: 'grond', h0: 0.25, geenSprong: true }, k.id);
  return tV;
}

/**
 * Tippen: een hoge bal over de lat (keeper springt, hand boven het hoofd) of een bal bij de paal om de paal
 * (hoge duik). De bal gaat daarna naast of over het goal (`afloopNaar`, anders achter het goal).
 */
function tip(
  tl: Tijdlijn,
  k: VeldObject,
  g: Goal,
  a: BalActie,
  bal: string,
  start: Punt,
  t0: number,
  kp: Punt,
  langs: Punt,
  tI: number,
  hoogte: number,
  opties: VluchtOpties,
  reactie: number,
): number {
  const { lx, ly } = tovGoal(g, langs);
  const kant = Math.sign(lx) || 1;
  const bijPaal = Math.abs(lx) > g.breedte / 2 - 1.3;
  const opzij = afstand(kp, langs);
  const r: Punt = opzij > 0.01 ? [(langs[0] - kp[0]) / opzij, (langs[1] - kp[1]) / opzij] : [0, 0];
  const punt = (x: number, y: number): Punt => [g.midden[0] + g.zij[0] * x + g.n[0] * y, g.midden[1] + g.zij[1] * x + g.n[1] * y];
  if (bijPaal) {
    // Om de paal: hoge duik, de bal gaat net buiten de paal achter de lijn.
    keeperBeweging(tl, k, kp, [langs[0] - r[0] * 0.55, langs[1] - r[1] * 0.55], reactie, tI, true, hoogte);
    const tC = vlucht(tl, bal, start, t0, langs, { ...opties, eindHoogte: hoogte }, a.van, 1, tI - t0);
    const weg = a.afloopNaar ?? punt(kant * (g.breedte / 2 + 2.2), -1.8);
    vlucht(tl, bal, langs, tC + 0.01, weg, { type: 'pass', hoogte: 0.3, h0: hoogte, geenSprong: true }, k.id, 1.4);
    return tC;
  }
  // Over de lat: onder de bal gaan staan en springen (de keeper "speelt" de bal hoog weg).
  const onder: Punt = [langs[0] - g.n[0] * 0.3, langs[1] - g.n[1] * 0.3];
  keeperBeweging(tl, k, kp, onder, reactie, tI - 0.15, false);
  const tC = vlucht(tl, bal, start, t0, langs, { ...opties, eindHoogte: hoogte }, a.van, 1, tI - t0);
  const weg = a.afloopNaar ?? punt(lx * 0.8, -(5 + Math.max(0, ly)));
  vlucht(tl, bal, langs, tC + 0.01, weg, { type: 'pass', hoogte: 1.6, h0: hoogte }, k.id, 1.3);
  return tC;
}

/** Vanaf wanneer staat deze persoon stil (gezocht tot 10 s na t)? */
function stilVanaf(tl: Tijdlijn, id: string, t: number): number {
  let vorig = positie(tl, id, t);
  let stil = t;
  for (let u = t + 0.1; u <= t + 10; u += 0.1) {
    const p = positie(tl, id, u);
    if (afstand(p, vorig) > 0.02) stil = u;
    else if (u - stil > 0.5) break;
    vorig = p;
  }
  return stil;
}

/** Panna: bal tussen de benen van `door` door, en zelf om hem heen lopen om de bal weer op te pakken. */
function panna(tl: Tijdlijn, wie: VeldObject, door: VeldObject, t0: number, verder: number, kant: 'links' | 'rechts'): number {
  const bal = balVan(tl, wie.id, t0) ?? losseBalBij(tl, positie(tl, wie.id, t0), t0);
  if (!bal) throw new TekeningFout(`Panna: "${wie.id}" heeft geen bal`);
  const start = balPunt(tl, bal, t0);
  const d = positie(tl, door.id, t0 + 0.3);
  const lengte = afstand(start, d) || 1;
  const r: Punt = [(d[0] - start[0]) / lengte, (d[1] - start[1]) / lengte];
  const naar: Punt = [d[0] + r[0] * verder, d[1] + r[1] * verder];
  const opzij: Punt = kant === 'links' ? [r[1], -r[0]] : [-r[1], r[0]];
  voegToe(tl.kijk, wie.id, { t: t0, hoek: graden(start, naar) }, (e) => e.t);
  const t1 = vlucht(tl, bal, start, t0, naar, { type: 'pass', hoogte: 'grond' }, wie.id);
  // Om de tegenstander heen (op 1,8 m) naar de bal.
  const p = positie(tl, wie.id, t0);
  const tLoop = beweeg(tl, wie, {
    pad: [
      p,
      [d[0] + opzij[0] * 1.8 - r[0] * 0.6, d[1] + opzij[1] * 1.8 - r[1] * 0.6],
      [d[0] + opzij[0] * 1.8 + r[0] * 0.9, d[1] + opzij[1] * 1.8 + r[1] * 0.9],
      [naar[0] + opzij[0] * 0.4, naar[1] + opzij[1] * 0.4],
    ],
    t0: t0 + 0.1,
    manier: 'sprint',
    spoor: 'loop',
  });
  // Klaar als de aanvaller weer bij de bal is.
  return Math.max(t1, tLoop);
}

/** Gaat er net een bal over de grond tussen de benen van deze persoon door? (0–1) */
function spreidOp(tl: Tijdlijn, id: string, t: number): number {
  const p = positie(tl, id, t);
  let w = 0;
  for (const lijst of tl.balEvents.values()) {
    for (const e of lijst) {
      if (e.soort !== 'vlucht' || e.top > 0.6 || e.passeerder === id || e.daarna === id) continue;
      if (t < e.t0 - 0.4 || t > e.t1 + 0.4) continue;
      const lengte = afstand(e.van, e.naar);
      if (lengte < 0.5) continue;
      const u: Punt = [(e.naar[0] - e.van[0]) / lengte, (e.naar[1] - e.van[1]) / lengte];
      const proj = ((p[0] - e.van[0]) * u[0] + (p[1] - e.van[1]) * u[1]) / lengte;
      if (proj < 0.05 || proj > 0.95) continue;
      const dwars = Math.abs((p[0] - e.van[0]) * u[1] - (p[1] - e.van[1]) * u[0]);
      if (dwars > 0.45) continue;
      // Tijdstip waarop de bal hier is (omgekeerde van de bal-ease).
      const tijd = e.t0 + (e.t1 - e.t0) * ((1.25 - Math.sqrt(1.5625 - proj)) / 0.5);
      w = Math.max(w, 1 - Math.abs(t - tijd) / 0.35);
    }
  }
  return klem(w);
}

/** Ballen die in een goal zijn beland: het net bolt even uit. */
function netInslagen(tl: Tijdlijn, t: number): NetInslag[] {
  const uit: NetInslag[] = [];
  for (const o of tl.objecten.values()) {
    const g = goalVan(tl, o.id);
    if (!g) continue;
    let beste: NetInslag | undefined;
    for (const lijst of tl.balEvents.values()) {
      for (const e of lijst) {
        if (e.soort !== 'vlucht' || e.daarna || t < e.t1 || t > e.t1 + 0.9) continue;
        const { lx, ly } = tovGoal(g, e.naar);
        // Achter de doellijn (op de lijn = tegen de lat of paal: geen doelpunt).
        if (Math.abs(lx) > g.breedte / 2 + 0.1 || ly > -0.05 || ly < -(g.diepte + 0.3)) continue;
        const sterkte = Math.sin((Math.PI * (t - e.t1)) / 0.9);
        if (!beste || sterkte > beste.sterkte) beste = { id: o.id, x: e.naar[0], y: e.naar[1], sterkte };
      }
    }
    if (beste) uit.push(beste);
  }
  return uit;
}

/** Keeper zet zich vlak voor een schot op zijn goal (0–1). */
function gezet(tl: Tijdlijn, o: VeldObject, t: number): number {
  if (!o.verdedigt) return 0;
  const g = goalVan(tl, o.verdedigt);
  if (!g) return 0;
  let w = 0;
  for (const lijst of tl.balEvents.values()) {
    for (const e of lijst) {
      if (e.soort !== 'vlucht' || e.passeerder === o.id || t < e.t0 - 0.45 || t > e.t0 + 0.2) continue;
      const { lx, ly } = tovGoal(g, e.naar);
      const opDoel = e.daarna === o.id || (Math.abs(lx) < g.breedte / 2 + 1.5 && ly < 1.5);
      if (opDoel) w = Math.max(w, 1 - Math.abs(t - (e.t0 - 0.1)) / 0.35);
    }
  }
  return klem(w);
}

/** Springt deze speler voor een kopbal (0–1)? */
function sprongOp(tl: Tijdlijn, id: string, t: number): number {
  const keeper = tl.objecten.get(id)?.soort === 'keeper';
  // Liggend (duik) springt niemand.
  if (ligging(tl, id, t).liggen > 0.05) return 0;
  let w = 0;
  for (const piek of tl.sprongen.get(id) ?? []) w = Math.max(w, 1 - Math.abs(t - piek) / 0.35);
  for (const lijst of tl.balEvents.values()) {
    for (const e of lijst) {
      if (e.soort !== 'vlucht') continue;
      // Een keeper vangt tot ± 2,1 m met de armen omhoog; pas daarboven springt hij.
      if (e.daarna === id && e.h1 >= (keeper ? 2.15 : 1.3)) w = Math.max(w, 1 - Math.abs(t - e.t1) / 0.35);
      if (e.passeerder === id && !e.geenSprong && e.h0 >= 1.3) w = Math.max(w, 1 - Math.abs(t - e.t0) / 0.35);
    }
  }
  return klem(w);
}

/** Alleen de velden die er zijn (dan blijven standen zonder deze bewegingen precies zoals ze waren). */
/** Aantikken van een pion of hoedje op tijdstip t. */
function aantikOp(tl: Tijdlijn, id: string, t: number): ObjectStand['aantik'] {
  for (const e of tl.aantikken.get(id) ?? []) if (t >= e.t0 && t <= e.t1) return { u: (t - e.t0) / (e.t1 - e.t0), x: e.punt[0], y: e.punt[1], ...(e.voet ? { voet: true } : {}) };
  return undefined;
}

function extra(trap: ObjectStand['trap'], aanname: ObjectStand['aanname'], opstaan: number | undefined, aantik?: ObjectStand['aantik']): Partial<ObjectStand> {
  const x: Partial<ObjectStand> = {};
  if (aantik) x.aantik = aantik;
  if (trap) x.trap = trap;
  if (aanname) x.aanname = aanname;
  if (opstaan !== undefined) x.opstaan = opstaan;
  return x;
}

/** Totale lengte van één ronde inclusief de rust aan het eind. */
export function rondeDuur(tl: Tijdlijn): number {
  return tl.duur > 0 ? tl.duur + NA_AFLOOP : 0;
}

export function standOp(tl: Tijdlijn, t: number): Stand {
  const objecten = new Map<string, ObjectStand>();
  const rust = {
    hoek: 0,
    houding: 'staan' as const,
    liggen: 0,
    duikHoek: 0,
    hoogte: 0,
    houder: null,
    snelheid: 0,
    fase: 0,
    gezet: 0,
    sprong: 0,
    spreid: 0,
    zweef: 0,
    vang: 0,
    vangHoogte: 0,
    zit: 0,
    tik: 0,
  };
  for (const o of tl.objecten.values()) {
    if (o.soort === 'bal') {
      objecten.set(o.id, { ...rust, ...balStand(tl, o.id, t) });
    } else if (isPersoon(o)) {
      const p = positie(tl, o.id, t);
      const l = ligging(tl, o.id, t);
      const b = actief(tl, o.id, t);
      let beweging: Pick<ObjectStand, 'manier' | 'snelheid' | 'fase' | 'looprichting' | 'loopTijd' | 'afgelegd' | 'versnelling'> = { snelheid: 0, fase: 0 };
      if (b) {
        const lengte = b.lengtes[b.lengtes.length - 1]!;
        const duur = b.t1 - b.t0;
        const u = (t - b.t0) / duur;
        const d = voortgang(b, t);
        beweging = {
          manier: b.manier,
          snelheid: (lengte / duur) * easeAfgeleide(b.ease, u),
          fase: d * RITME[b.manier],
          looprichting: langsPad(b.pad, b.lengtes, Math.max(d, 0.001)).hoek,
          loopTijd: t - b.t0,
          afgelegd: d,
          versnelling: (lengte / (duur * duur)) * easeTweede(b.ease, u),
        };
      }
      objecten.set(o.id, {
        ...rust,
        ...beweging,
        x: p[0],
        y: p[1],
        hoek: kijkHoek(tl, o.id, t),
        houding: l.liggen > 0.5 ? 'duik' : 'staan',
        liggen: l.liggen,
        duikHoek: l.hoek,
        team: teamOp(tl, o.id, t),
        gezet: gezet(tl, o, t),
        sprong: sprongOp(tl, o.id, t),
        spreid: spreidOp(tl, o.id, t),
        zweef: zweefOp(tl, o.id, t),
        ...vangStand(tl, o, t),
        worp: worpOp(tl, o.id, t),
        ...zitStand(tl, o.id, t),
        tik: tikOp(tl, o.id, t),
        stomp: stompOp(tl, o.id, t),
        blok: blokOp(tl, o.id, t),
        ...extra(trapOp(tl, o.id, t), aannameOp(tl, o, t), l.opstaan, aantikOp(tl, o.id, t)),
      });
    } else {
      objecten.set(o.id, { ...rust, x: o.x, y: o.y, hoek: o.hoek ?? 0 });
    }
  }
  const sporen: SpoorStand[] = [];
  tl.sporen.forEach((s, index) => {
    if (t < s.t0) return;
    const u = (t - s.t0) / (s.t1 - s.t0);
    const fractie = ease(s.ease, u);
    const klaar = u >= 1;
    const lengtes = cumulatief(s.pad);
    const punten = klaar ? s.pad : deelPad(s.pad, fractie * lengtes[lengtes.length - 1]!);
    sporen.push({ index, soort: s.soort, van: s.van, naar: s.naar, tot: punten[punten.length - 1]!, punten, fractie, top: s.top, manier: s.manier, klaar });
  });
  return { objecten, sporen, net: netInslagen(tl, t) };
}
