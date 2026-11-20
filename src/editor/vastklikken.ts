import type { Lijn, LijnSoort, Punt, Tekening, VeldObject } from '../model/types';
import { PERSONEN } from '../model/types';
import { lijnPunten } from '../model/lijn';
import { goalBij, kaatsDing, lijnenNaarAnimatie, persoonNaam, volgendeStap } from './animatie';
import { nieuwId, sleepLijn, vastPunt, voegToe, zetLijn } from './editor';

/**
 * Vastklikken (0.38.1): een lijn die bij een speler begint, zit eraan vast, ook als je er met je vinger net naast
 * begint. Spelers (ook keepers en trainers) gaan altijd voor materiaal. Puur, zodat het getest kan worden; de editor
 * rekent de schermmaten om naar meters (`Maten`).
 */

/** Vingerbreedte op het scherm (CSS-pixels) waarbinnen een lijn aan een speler vastklikt. */
export const VASTKLIK_PX = 40;

/** Maten in meters (omgerekend van schermpixels bij de huidige zoom). */
export interface Maten {
  /** Vastklikken aan een speler (± 40 px op het scherm). */
  marge: number;
  /** Precies raken (± een halve vinger): voor het eind van een looplijn en bij een goal of rebounder. */
  klein: number;
}

/** Waar een lijn aan vast kan: een persoon op zijn beginplek, of waar hij na een eerdere loop- of dribbellijn staat. */
export interface Anker {
  id: string;
  punt: Punt;
  /** Op zijn beginplek: de lijn zit aan hem vast (`van`/`naar`) en gaat mee als je hem verschuift. */
  vast: boolean;
}

export interface StandVoor {
  ankers: Anker[];
  /** Personen die de bal hebben (of een losse bal vlak bij zich) aan het begin van de stap. */
  metBal: string[];
}

const PERSOON_STRAAL = 0.5;
const afstand = (a: Punt, b: Punt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const r2 = (v: number) => Math.round(v * 100) / 100;
const rond = (p: Punt): Punt => [r2(p[0]), r2(p[1])];
const isPersoon = (o: VeldObject | undefined): o is VeldObject => !!o && PERSONEN.includes(o.soort);

/** Wie waar staat en wie de bal heeft vlak vóór stap `stap` (na alle lijnen met een lager nummer). */
export function standVoorStap(t: Tekening, stap: number): StandVoor {
  const lijnen = (t.lijnen ?? []).filter((l) => (l.stap ?? 0) > 0 && (l.stap ?? 0) < stap);
  const o = lijnenNaarAnimatie({ ...t, herhaalRij: false, lijnen });
  const ankers: Anker[] = [];
  const metBal = new Set<string>();
  for (const p of t.objecten) {
    if (!isPersoon(p)) continue;
    const begin: Punt = [p.x, p.y];
    const nu = o.eind.plek.get(p.id) ?? begin;
    // Een klein stapje (de bal tegemoet lopen) telt niet: dan zit hij nog op zijn plek.
    const verplaatst = afstand(nu, begin) > 1.2;
    ankers.push({ id: p.id, punt: begin, vast: true });
    if (verplaatst) ankers.push({ id: p.id, punt: rond(nu), vast: false });
    if ([...o.eind.houder.values()].includes(p.id)) metBal.add(p.id);
    else if ([...o.eind.los.entries()].some(([b, q]) => o.eind.houder.get(b) === null && afstand(q, nu) < 1.5)) metBal.add(p.id);
  }
  return { ankers, metBal: [...metBal] };
}

/** Dichtstbijzijnde anker binnen de marge (gemeten vanaf de rand van de speler). */
function dichtsteAnker(ankers: Anker[], p: Punt, marge: number, behalve?: string): Anker | undefined {
  let beste: Anker | undefined;
  let d = Infinity;
  for (const a of ankers) {
    if (a.id === behalve) continue;
    const x = afstand(a.punt, p);
    if (x - PERSOON_STRAAL <= marge && x < d) {
      d = x;
      beste = a;
    }
  }
  return beste;
}

/** Huidig anker van een persoon (waar hij nu staat). */
const ankerVan = (stand: StandVoor, id: string): Anker | undefined => stand.ankers.filter((a) => a.id === id).at(-1);

export interface Begin {
  punt: Punt;
  /** Vast aan deze persoon (`lijn.van`). */
  van?: string;
  /** Persoon bij wie de lijn begint (ook als hij er alleen met de plek aan zit); leeg = niet gekoppeld. */
  wie?: string;
  /** Automatisch bij de balbezitter begonnen (de vinger was niet bij een speler). */
  balbezitter?: boolean;
}

/** Waar een lijn begint. Een pass die nergens bij een speler begint, start bij de speler die de bal heeft (als dat er één is). */
export function lijnBegin(soort: LijnSoort, p: Punt, maten: Maten, stand: StandVoor, balbezitter = true): Begin {
  const a = dichtsteAnker(stand.ankers, p, maten.marge);
  if (a) return { punt: a.punt, wie: a.id, ...(a.vast ? { van: a.id } : {}) };
  if (soort === 'bal' && balbezitter && stand.metBal.length === 1) {
    const h = ankerVan(stand, stand.metBal[0]!);
    if (h) return { punt: h.punt, wie: h.id, balbezitter: true, ...(h.vast ? { van: h.id } : {}) };
  }
  return { punt: rond(p) };
}

export interface Eind {
  punt: Punt;
  naar?: string;
  /** Ontvanger van een pass (ook als hij er alleen met de plek aan zit). */
  ontvanger?: string;
}

/**
 * Waar een lijn eindigt. Een pass klikt vast aan de ontvanger in de buurt (dan komt de bal bij hem aan); behalve als hij
 * in een goal of bij een rebounder eindigt en er niemand precies op die plek staat (dan is het een schot of kaatsbal).
 * Een loop- of dribbellijn klikt alleen vast als je precies op iemand eindigt (zoals voorheen).
 */
export function lijnEind(t: Tekening, soort: LijnSoort, p: Punt, maten: Maten, stand: StandVoor, wie?: string): Eind {
  if (soort !== 'bal') {
    const o = vastPunt(t, p, maten.klein);
    return o && o.id !== wie ? { punt: rond(p), naar: o.id } : { punt: rond(p) };
  }
  const goals = t.objecten.filter((o) => o.soort === 'goal' || o.soort === 'klein-goal');
  const opDoel = !!goalBij(goals, p) || !!kaatsDing(t.objecten, p);
  // In het goal: de keeper is geen ontvanger (dat is een schot); andere spelers alleen als je precies op ze eindigt.
  const ankers = opDoel ? stand.ankers.filter((a) => t.objecten.find((o) => o.id === a.id)?.soort !== 'keeper') : stand.ankers;
  const a = dichtsteAnker(ankers, p, opDoel ? maten.klein : maten.marge, wie);
  if (a) return { punt: a.punt, ontvanger: a.id, ...(a.vast ? { naar: a.id } : {}) };
  return { punt: rond(p) };
}

export interface NieuweLijn {
  lijn: Lijn;
  begin: Begin;
  eind: Eind;
}

/** Een nieuwe lijn van `van` naar `naar` (vingerplekken), vastgeklikt aan spelers. Krijgt het volgende stapnummer niet: dat doet de editor. */
export function tekenLijn(t: Tekening, soort: LijnSoort, van: Punt, naar: Punt, maten: Maten, stand: StandVoor): NieuweLijn {
  const begin = lijnBegin(soort, van, maten, stand);
  const eind = lijnEind(t, soort, naar, maten, stand, begin.wie);
  const lijn: Lijn = { soort, punten: [begin.punt, eind.punt] };
  if (begin.van) lijn.van = begin.van;
  if (eind.naar && eind.naar !== begin.van) lijn.naar = eind.naar;
  return { lijn, begin, eind };
}

/** Stand die bij een bestaande lijn hoort (vlak voor zijn stap). */
export const standBijLijn = (t: Tekening, i: number) => standVoorStap(t, t.lijnen?.[i]?.stap ?? volgendeStap(t));

/**
 * Begin of eind van een bestaande lijn verslepen: klikt vast aan een speler in de buurt (zo koppel je een losse lijn
 * later alsnog). Het buigpunt gaat zoals voorheen.
 */
export function sleepLijnVast(t: Tekening, i: number, h: 'begin' | 'midden' | 'eind', p: Punt, maten: Maten, stand: StandVoor): Tekening {
  const l = t.lijnen?.[i];
  if (!l || h === 'midden') return sleepLijn(t, i, h, p, maten.klein);
  const uit: Lijn = { ...l, punten: [...l.punten] };
  if (h === 'begin') {
    const b = lijnBegin(l.soort, p, maten, stand, false);
    uit.punten[0] = b.punt;
    if (b.van && b.van !== l.naar) uit.van = b.van;
    else delete uit.van;
  } else {
    const e = lijnEind(t, l.soort, p, maten, stand, l.van);
    uit.punten[uit.punten.length - 1] = e.punt;
    if (e.naar && e.naar !== l.van) uit.naar = e.naar;
    else delete uit.naar;
  }
  return zetLijn(t, i, uit);
}

/** Lijn `i` laten beginnen bij persoon `id` (keuze uit het menu "Bij welke speler hoort deze lijn?"). */
export function koppelAan(t: Tekening, i: number, id: string): Tekening {
  const l = t.lijnen?.[i];
  if (!l) return t;
  const a = ankerVan(standBijLijn(t, i), id);
  if (!a) return t;
  const uit: Lijn = { ...l, punten: [a.punt, ...l.punten.slice(1)] };
  if (a.vast) uit.van = id;
  else delete uit.van;
  if (uit.naar === id) delete uit.naar;
  return zetLijn(t, i, uit);
}

export interface Kandidaat {
  id: string;
  naam: string;
  afstand: number;
  metBal: boolean;
}

/** Personen in de buurt van het begin van lijn `i` (dichtstbijzijnde eerst), voor het keuzemenu. */
export function kandidaten(t: Tekening, i: number, max = 6): Kandidaat[] {
  const l = t.lijnen?.[i];
  if (!l) return [];
  const stand = standBijLijn(t, i);
  const begin = lijnPunten(l)[0]!;
  const beste = new Map<string, number>();
  for (const a of stand.ankers) {
    const d = afstand(a.punt, begin);
    if (!beste.has(a.id) || d < beste.get(a.id)!) beste.set(a.id, d);
  }
  return [...beste.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(0, max)
    .map(([id, d]) => ({
      id,
      naam: persoonNaam(
        t.objecten.find((o) => o.id === id)!,
        t.objecten,
      ),
      afstand: r2(d),
      metBal: stand.metBal.includes(id),
    }));
}

// ---------- oplossingen bij meldingen ----------

/** Dribbel wordt een looplijn. */
export function wordtLoop(t: Tekening, i: number): Tekening {
  const l = t.lijnen?.[i];
  return l ? zetLijn(t, i, { ...l, soort: 'loop' }) : t;
}

/** Lijn naar een ander stapnummer. */
export function naarStap(t: Tekening, i: number, stap: number): Tekening {
  const l = t.lijnen?.[i];
  return l ? zetLijn(t, i, { ...l, stap: Math.max(1, Math.min(30, stap)) }) : t;
}

/** Een bal bij een persoon leggen: de losse bal `bal` (die er vlakbij ligt), of een nieuwe. */
export function geefBal(t: Tekening, wie: string, bal?: string): Tekening {
  const p = t.objecten.find((o) => o.id === wie);
  if (!p) return t;
  if (t.objecten.some((o) => o.soort === 'bal' && o.bij === wie)) return t;
  const b = bal && t.objecten.find((o) => o.id === bal && o.soort === 'bal');
  if (b) return { ...t, objecten: t.objecten.map((o) => (o.id === b.id ? { ...o, x: p.x, y: p.y, bij: wie } : o)) };
  return voegToe(t, { id: nieuwId(t, 'bal'), soort: 'bal', x: p.x, y: p.y, bij: wie });
}
