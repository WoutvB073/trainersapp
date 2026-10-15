import type {
  Actie,
  AnimatieStap,
  BalActie,
  BeweegActie,
  HerhaalStap,
  LijnSoort,
  Manier,
  Punt,
  Rij,
  Stap,
  TegelijkStap,
  Team,
  Tekening,
  VeldObject,
} from '../model/types';
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
  sprong: 2.5,
  zijwaarts: 2.6,
  achteruit: 2.8,
  voetenwerk: 2.2,
  hordes: 2.8,
  schijn: 1.5,
};
const ZWAARTEKRACHT = 9.81;
const DRIBBEL = 3.5;
/** Paslengte (m) bij de loopwijzen met losse pasjes: ladder één voet per vak, hordes één pas per 80 cm. */
export const PASLENGTE: Partial<Record<Manier, number>> = { voetenwerk: 0.45, hordes: 0.8, kniehef: 0.35, sprong: 0.9 };
/** Pasritme: radialen beencyclus per afgelegde meter (één cyclus = twee pasjes). */
export const RITME: Record<Manier, number> = {
  jog: 4.2,
  sprint: 3.4,
  wandel: 5.5,
  huppel: 4.5,
  kniehef: Math.PI / 0.35,
  sprong: Math.PI / 0.9,
  zijwaarts: 6,
  achteruit: 6,
  voetenwerk: Math.PI / 0.45,
  hordes: Math.PI / 0.8,
  schijn: 6,
};
/** Hoe lang een draai (nieuwe kijkrichting) duurt: de bal aan de voet draait mee, springt niet. */
const DRAAI = 0.3;
/** Kijkrichting t.o.v. de looprichting. */
const KIJK_VERSCHIL: Partial<Record<Manier, number>> = { zijwaarts: -90, achteruit: 180 };
/** Loopwijzen waarbij het spoor losse pasjes toont. */
export const PASJES: readonly Manier[] = ['voetenwerk', 'hordes', 'kniehef', 'sprong'];

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
      passeerder: string;
      daarna: string | null;
    };

/** Gaan liggen (duik) of opstaan, geleidelijk tussen t en t1. */
interface HoudingEvent {
  t: number;
  t1: number;
  houding: 'staan' | 'duik';
  /** Duikrichting in graden. */
  hoek?: number;
}

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
  if (b) return t >= b.t1 ? b.pad[b.pad.length - 1]! : langsPad(b.pad, b.lengtes, voortgang(b, t)).p;
  return o ? [o.x, o.y] : [0, 0];
}

/** Beweging die op tijdstip t bezig is (of undefined). */
function actief(tl: Tijdlijn, id: string, t: number): Beweging | undefined {
  const b = laatste(tl.bewegingen.get(id), t, (x) => x.t0);
  return b && t < b.t1 ? b : undefined;
}

/** Kijkrichting, met een korte draai bij elke verandering (zodat ook de bal aan de voet meedraait). */
function kijkHoek(tl: Tijdlijn, id: string, t: number): number {
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
function ligging(tl: Tijdlijn, id: string, t: number): { liggen: number; hoek: number } {
  let liggen = 0;
  let hoek = 0;
  for (const e of tl.houdingen.get(id) ?? []) {
    if (e.t > t) break;
    const u = e.t1 > e.t ? klem((t - e.t) / (e.t1 - e.t)) : 1;
    if (e.houding === 'duik') {
      liggen = ease('duik', u);
      hoek = e.hoek ?? 0;
    } else {
      // Opstaan vanuit de huidige ligging.
      liggen = liggen * (1 - ease('mens', u));
    }
  }
  return { liggen, hoek };
}

const ligt = (tl: Tijdlijn, id: string, t: number) => ligging(tl, id, t).liggen > 0.5;

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
  if (e.soort === 'vast') return plek(balBijPersoon(tl, e.houder, t), e.houder);
  if (e.soort === 'los') return plek(e.punt);
  if (t < e.t1) {
    const u = (t - e.t0) / (e.t1 - e.t0);
    const p = lerp(e.van, e.naar, ease('bal', u));
    return { x: p[0], y: p[1], hoogte: boog(e.top, ease('bal', u)), houder: null, vlucht: { van: e.passeerder, naar: e.daarna, u, top: e.top } };
  }
  if (e.daarna) return plek(balBijPersoon(tl, e.daarna, t), e.daarna);
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
  };

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
function invullen(stap: AnimatieStap, spelers: string[], i: number, waarden: Record<string, (string | number)[]> = {}): AnimatieStap {
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
    if (m.type === 'duik') {
      houding(o.id, { t: t0, t1: t0 + (m.duur ?? DUUR_DUIK), houding: 'duik', hoek: graden(van, m.naar) });
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

  // 2. Passes en schoten.
  for (const a of stap.acties) {
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
    if (aankomst !== undefined) t0 = aankomst + 0.15;
  }
  const bal = a.bal ?? balVan(tl, a.van, t0) ?? losseBalBij(tl, positie(tl, a.van, t0), t0);
  if (!bal) throw new TekeningFout(`${a.type}: "${a.van}" heeft geen bal`);

  const start = balPunt(tl, bal, t0);
  const kijkNaar = (doel: Punt) => {
    if (afstand(start, doel) < 0.2) return; // bal omhoog (hooghouden): blijft kijken waar hij keek
    if (!actief(tl, a.van, t0) && (van!.soort !== 'keeper' || !ligt(tl, a.van, t0))) {
      voegToe(tl.kijk, a.van, { t: t0, hoek: graden(start, doel) }, (e) => e.t);
    }
  };

  // Op een rebounder of muurtje: de bal kaatst terug.
  const muur = typeof a.naar === 'string' ? tl.objecten.get(a.naar) : undefined;
  if (muur && (muur.soort === 'rebounder' || muur.soort === 'muurtje')) {
    const m: Punt = [muur.x, muur.y];
    const d = afstand(start, m) || 1;
    const kaats: Punt = [m[0] + ((start[0] - m[0]) / d) * 0.3, m[1] + ((start[1] - m[1]) / d) * 0.3];
    const top = balTop(a, start, kaats);
    const t1 = t0 + vluchtDuur(a.type, top, afstand(start, kaats));
    kijkNaar(kaats);
    voegToe(tl.balEvents, bal, { soort: 'vlucht', t0, t1, van: start, naar: kaats, top, passeerder: a.van, daarna: null }, (e) => e.t0);
    tl.sporen.push({ soort: 'bal', pad: [start, kaats], van: start, naar: kaats, t0, t1, ease: 'bal', top, id: bal });
    // Terug iets langzamer (de rebounder neemt snelheid weg).
    return vlucht(tl, bal, kaats, t1 + 0.03, a.terug ?? a.van, { type: 'pass', hoogte: 'grond' }, a.van, 1.2);
  }

  if (typeof a.naar !== 'string') kijkNaar(a.naar);
  const t1 = vlucht(tl, bal, start, t0, a.naar, a, a.van, 1, a.duur);
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
function vlucht(
  tl: Tijdlijn,
  bal: string,
  start: Punt,
  t0: number,
  naar: string | Punt,
  a: Pick<BalActie, 'type' | 'hoogte' | 'hoog'>,
  passeerder: string,
  trager = 1,
  duur?: number,
): number {
  let doel: Punt;
  let ontvanger: string | null = null;
  let t1: number;
  const tijd = (doel: Punt) => vluchtDuur(a.type, balTop(a, start, doel), afstand(start, doel)) * trager;

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
  voegToe(tl.balEvents, bal, { soort: 'vlucht', t0, t1, van: start, naar: doel, top, passeerder, daarna: ontvanger }, (e) => e.t0);
  // Een bal recht omhoog (hooghouden) laat geen lijn achter.
  if (afstand(start, doel) >= 0.2) tl.sporen.push({ soort: 'bal', pad: [start, doel], van: start, naar: doel, t0, t1, ease: 'bal', top, id: bal });
  return t1;
}

/** Totale lengte van één ronde inclusief de rust aan het eind. */
export function rondeDuur(tl: Tijdlijn): number {
  return tl.duur > 0 ? tl.duur + NA_AFLOOP : 0;
}

export function standOp(tl: Tijdlijn, t: number): Stand {
  const objecten = new Map<string, ObjectStand>();
  const rust = { hoek: 0, houding: 'staan' as const, liggen: 0, duikHoek: 0, hoogte: 0, houder: null, snelheid: 0, fase: 0 };
  for (const o of tl.objecten.values()) {
    if (o.soort === 'bal') {
      objecten.set(o.id, { ...rust, ...balStand(tl, o.id, t) });
    } else if (isPersoon(o)) {
      const p = positie(tl, o.id, t);
      const l = ligging(tl, o.id, t);
      const b = actief(tl, o.id, t);
      let beweging: Pick<ObjectStand, 'manier' | 'snelheid' | 'fase'> = { snelheid: 0, fase: 0 };
      if (b) {
        const lengte = b.lengtes[b.lengtes.length - 1]!;
        const u = (t - b.t0) / (b.t1 - b.t0);
        beweging = {
          manier: b.manier,
          snelheid: (lengte / (b.t1 - b.t0)) * easeAfgeleide(b.ease, u),
          fase: voortgang(b, t) * RITME[b.manier],
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
  return { objecten, sporen };
}
