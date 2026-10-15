import type { Actie, BalActie, BeweegActie, LijnSoort, Punt, Tekening, VeldObject } from '../model/types';
import { PERSONEN } from '../model/types';

/**
 * Tijdlijn: rekent de animatiestappen van een tekening om naar bewegingen met begin- en eindtijd.
 * `standOp(tijdlijn, t)` geeft daarna voor elk moment de posities en de sporen.
 * Puur rekenwerk (geen DOM), zodat de 2D- en straks de 3D-renderer dezelfde tijdlijn gebruiken.
 */

// Snelheden in m/s voor bewegingen zonder eigen duur.
const SNELHEID = { loop: 4.5, dribbel: 3.5, pass: 11, schot: 17, hoog: 10 } as const;
const DUUR_DUIK = 0.5;
const DUUR_OPSTAAN = 0.5;
const MIN_DUUR = 0.35;
/** Rust aan het eind voordat de animatie opnieuw begint. */
export const NA_AFLOOP = 1.2;
/** Afstand waarbinnen een speler een losse bal kan oppakken. */
const PAK_AFSTAND = 2.5;

type Ease = 'mens' | 'duik' | 'bal';

interface Beweging {
  van: Punt;
  naar: Punt;
  t0: number;
  t1: number;
  ease: Ease;
}

type BalEvent =
  | { soort: 'vast'; t0: number; houder: string }
  | { soort: 'los'; t0: number; punt: Punt }
  | { soort: 'vlucht'; t0: number; t1: number; van: Punt; naar: Punt; hoog: boolean; daarna: string | null };

interface HoudingEvent {
  t: number;
  houding: 'staan' | 'duik';
  /** Duikrichting in graden. */
  hoek?: number;
}

export interface Spoor {
  soort: LijnSoort;
  van: Punt;
  naar: Punt;
  t0: number;
  t1: number;
  ease: Ease;
  /** Object dat dit spoor maakt. */
  id: string;
}

export interface Tijdlijn {
  tekening: Tekening;
  /** Lengte van de beweging in seconden (zonder rust aan het eind). */
  duur: number;
  objecten: Map<string, VeldObject>;
  bewegingen: Map<string, Beweging[]>;
  kijk: Map<string, { t: number; hoek: number }[]>;
  houdingen: Map<string, HoudingEvent[]>;
  balEvents: Map<string, BalEvent[]>;
  sporen: Spoor[];
}

export interface ObjectStand {
  x: number;
  y: number;
  /** Kijkrichting in graden (personen). */
  hoek: number;
  houding: 'staan' | 'duik';
  /** Duikrichting in graden. */
  duikHoek: number;
  /** Hoogte boven de grond in meters (bal). */
  hoogte: number;
}

export interface SpoorStand {
  soort: LijnSoort;
  van: Punt;
  /** Huidige punt (punt van het spoor). */
  tot: Punt;
  /** Eindpunt van de hele lijn. */
  naar: Punt;
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

function ease(soort: Ease, u: number): number {
  u = klem(u);
  if (soort === 'mens') return 0.5 - Math.cos(Math.PI * u) / 2;
  if (soort === 'duik') return 1 - (1 - u) * (1 - u);
  return u * (1.25 - 0.25 * u);
}

const isBalActie = (a: Actie): a is BalActie => a.type === 'pass' || a.type === 'schot';
const isPersoon = (o: VeldObject | undefined) => !!o && PERSONEN.includes(o.soort);

/** Standaard kijkrichting: keeper kijkt het veld in (omlaag), de rest naar het goal (omhoog). */
function standaardKijk(o: VeldObject): number {
  if (o.kijkrichting !== undefined) return o.kijkrichting;
  return o.soort === 'keeper' ? 90 : -90;
}

/** Afstand van de bal tot het midden van de persoon als die hem heeft. */
const balAfstand = (o: VeldObject) => (o.soort === 'keeper' ? 0.35 : 0.55);

// ---------- opvragen op tijdstip ----------

function laatste<T>(lijst: T[] | undefined, t: number, tijd: (x: T) => number): T | undefined {
  if (!lijst) return undefined;
  let res: T | undefined;
  for (const x of lijst) if (tijd(x) <= t) res = x;
  return res;
}

function positie(tl: Tijdlijn, id: string, t: number): Punt {
  const o = tl.objecten.get(id);
  const b = laatste(tl.bewegingen.get(id), t, (x) => x.t0);
  if (b) return t >= b.t1 ? b.naar : lerp(b.van, b.naar, ease(b.ease, (t - b.t0) / (b.t1 - b.t0)));
  return o ? [o.x, o.y] : [0, 0];
}

function kijkHoek(tl: Tijdlijn, id: string, t: number): number {
  const k = laatste(tl.kijk.get(id), t, (x) => x.t);
  if (k) return k.hoek;
  const o = tl.objecten.get(id);
  return o ? standaardKijk(o) : 0;
}

function houding(tl: Tijdlijn, id: string, t: number): HoudingEvent {
  return laatste(tl.houdingen.get(id), t, (x) => x.t) ?? { t: 0, houding: 'staan' };
}

/** Waar een bal zit als deze persoon hem heeft. */
function balBijPersoon(tl: Tijdlijn, id: string, t: number): Punt {
  const o = tl.objecten.get(id)!;
  const p = positie(tl, id, t);
  const h = houding(tl, id, t);
  const r = richting(h.houding === 'duik' ? (h.hoek ?? 0) : kijkHoek(tl, id, t));
  const d = h.houding === 'duik' ? 0.55 : balAfstand(o);
  return [p[0] + r[0] * d, p[1] + r[1] * d];
}

function balEvent(tl: Tijdlijn, balId: string, t: number): BalEvent | undefined {
  return laatste(tl.balEvents.get(balId), t, (x) => x.t0);
}

function balPositie(tl: Tijdlijn, balId: string, t: number): { p: Punt; hoogte: number } {
  const e = balEvent(tl, balId, t);
  if (!e) {
    const o = tl.objecten.get(balId)!;
    return { p: [o.x, o.y], hoogte: 0 };
  }
  if (e.soort === 'vast') return { p: balBijPersoon(tl, e.houder, t), hoogte: 0 };
  if (e.soort === 'los') return { p: e.punt, hoogte: 0 };
  if (t < e.t1) {
    const u = (t - e.t0) / (e.t1 - e.t0);
    const top = e.hoog ? Math.min(7, 1 + afstand(e.van, e.naar) * 0.22) : 0;
    return { p: lerp(e.van, e.naar, ease('bal', u)), hoogte: top * 4 * u * (1 - u) };
  }
  if (e.daarna) return { p: balBijPersoon(tl, e.daarna, t), hoogte: 0 };
  return { p: e.naar, hoogte: 0 };
}

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
    const d = afstand(balPositie(tl, b, t).p, punt);
    if (d <= min) {
      min = d;
      beste = b;
    }
  }
  return beste;
}

// ---------- opbouwen ----------

function voegToe<T>(map: Map<string, T[]>, id: string, x: T, tijd: (x: T) => number) {
  const lijst = map.get(id) ?? [];
  lijst.push(x);
  lijst.sort((a, b) => tijd(a) - tijd(b));
  map.set(id, lijst);
}

export class TekeningFout extends Error {}

export function maakTijdlijn(tekening: Tekening): Tijdlijn {
  const tl: Tijdlijn = {
    tekening,
    duur: 0,
    objecten: new Map(tekening.objecten.map((o) => [o.id, o])),
    bewegingen: new Map(),
    kijk: new Map(),
    houdingen: new Map(),
    balEvents: new Map(),
    sporen: [],
  };

  for (const o of tekening.objecten) {
    if (o.soort !== 'bal') continue;
    if (o.bij) {
      if (!isPersoon(tl.objecten.get(o.bij))) throw new TekeningFout(`Bal ${o.id}: onbekende persoon "${o.bij}"`);
      voegToe(tl.balEvents, o.id, { soort: 'vast', t0: 0, houder: o.bij }, (e) => e.t0);
    } else {
      voegToe(tl.balEvents, o.id, { soort: 'los', t0: 0, punt: [o.x, o.y] }, (e) => e.t0);
    }
  }

  const persoon = (id: string, actie: Actie): VeldObject => {
    const o = tl.objecten.get(id);
    if (!isPersoon(o)) throw new TekeningFout(`Actie ${actie.type}: "${id}" is geen speler, keeper of trainer`);
    return o!;
  };

  let T = 0;
  for (const stap of tekening.animatie ?? []) {
    let eind = T + (stap.duur ?? 0);

    // 1. Bewegingen van personen (eerst, zodat een pass weet waar de ontvanger heen loopt).
    for (const a of stap.acties) {
      if (isBalActie(a)) continue;
      const o = persoon(a.wie, a);
      const t0 = T + (a.start ?? 0);

      if (a.type === 'pak') {
        const bal = a.bal ?? losseBalBij(tl, positie(tl, o.id, t0), t0);
        if (!bal) throw new TekeningFout(`Pak: geen losse bal bij "${o.id}"`);
        voegToe(tl.balEvents, bal, { soort: 'vast', t0, houder: o.id }, (e) => e.t0);
        eind = Math.max(eind, t0 + (a.duur ?? MIN_DUUR));
        continue;
      }
      if (a.type === 'opstaan') {
        const t1 = t0 + (a.duur ?? DUUR_OPSTAAN);
        voegToe(tl.houdingen, o.id, { t: t1, houding: 'staan' }, (e) => e.t);
        eind = Math.max(eind, t1);
        continue;
      }

      // loop / dribbel / duik
      const m = a as BeweegActie;
      const van = positie(tl, o.id, t0);
      const dist = afstand(van, m.naar);
      const duur = m.duur ?? (m.type === 'duik' ? DUUR_DUIK : Math.max(MIN_DUUR, dist / SNELHEID[m.type]));
      const t1 = t0 + duur;
      if (m.type === 'dribbel' && !balVan(tl, o.id, t0)) {
        const bal = losseBalBij(tl, van, t0);
        if (!bal) throw new TekeningFout(`Dribbel: "${o.id}" heeft geen bal`);
        voegToe(tl.balEvents, bal, { soort: 'vast', t0, houder: o.id }, (e) => e.t0);
      }
      const hoek = graden(van, m.naar);
      if (m.type === 'duik') {
        voegToe(tl.houdingen, o.id, { t: t0, houding: 'duik', hoek }, (e) => e.t);
      } else {
        if (houding(tl, o.id, t0).houding === 'duik') voegToe(tl.houdingen, o.id, { t: t0, houding: 'staan' }, (e) => e.t);
        // Een keeper blijft het veld in kijken als hij verschuift; veldspelers kijken waar ze heen gaan.
        if (o.soort !== 'keeper' && dist > 0.01) voegToe(tl.kijk, o.id, { t: t0, hoek }, (e) => e.t);
      }
      const e: Ease = m.type === 'duik' ? 'duik' : 'mens';
      voegToe(tl.bewegingen, o.id, { van, naar: m.naar, t0, t1, ease: e }, (b) => b.t0);
      if (dist > 0.01) tl.sporen.push({ soort: m.type === 'dribbel' ? 'dribbel' : 'loop', van, naar: m.naar, t0, t1, ease: e, id: o.id });
      eind = Math.max(eind, t1);
    }

    // 2. Passes en schoten.
    for (const a of stap.acties) {
      if (!isBalActie(a)) continue;
      eind = Math.max(eind, balActie(tl, a, T));
    }

    T = Math.max(eind, T + MIN_DUUR);
  }

  tl.duur = T;
  return tl;
}

function balActie(tl: Tijdlijn, a: BalActie, T: number): number {
  const t0 = T + (a.start ?? 0);
  const van = tl.objecten.get(a.van);
  if (!isPersoon(van)) throw new TekeningFout(`${a.type}: "${a.van}" is geen speler, keeper of trainer`);
  const bal = a.bal ?? balVan(tl, a.van, t0) ?? losseBalBij(tl, positie(tl, a.van, t0), t0);
  if (!bal) throw new TekeningFout(`${a.type}: "${a.van}" heeft geen bal`);

  const start = balPositie(tl, bal, t0).p;
  const snelheid = a.hoog ? SNELHEID.hoog : SNELHEID[a.type];
  let doel: Punt;
  let ontvanger: string | null = null;
  let t1: number;

  if (typeof a.naar === 'string') {
    const o = tl.objecten.get(a.naar);
    if (!isPersoon(o)) throw new TekeningFout(`${a.type}: "${a.naar}" is geen speler, keeper of trainer`);
    ontvanger = a.naar;
    // Waar is de ontvanger als de bal aankomt? Twee keer schatten is ruim voldoende.
    t1 = t0 + (a.duur ?? Math.max(MIN_DUUR, afstand(start, positie(tl, ontvanger, t0)) / snelheid));
    if (a.duur === undefined) t1 = t0 + Math.max(MIN_DUUR, afstand(start, positie(tl, ontvanger, t1)) / snelheid);
    const p = positie(tl, ontvanger, t1);
    const h = houding(tl, ontvanger, t1);
    if (h.houding === 'duik') {
      const r = richting(h.hoek ?? 0);
      doel = [p[0] + r[0] * 0.55, p[1] + r[1] * 0.55];
    } else {
      const d = afstand(p, start) || 1;
      const r: Punt = [(start[0] - p[0]) / d, (start[1] - p[1]) / d];
      doel = [p[0] + r[0] * balAfstand(o!), p[1] + r[1] * balAfstand(o!)];
      voegToe(tl.kijk, ontvanger, { t: t1, hoek: graden(p, start) }, (e) => e.t);
    }
  } else {
    doel = a.naar;
    t1 = t0 + (a.duur ?? Math.max(MIN_DUUR, afstand(start, doel) / snelheid));
  }

  if (van!.soort !== 'keeper' || houding(tl, a.van, t0).houding !== 'duik') {
    voegToe(tl.kijk, a.van, { t: t0, hoek: graden(start, doel) }, (e) => e.t);
  }
  voegToe(tl.balEvents, bal, { soort: 'vlucht', t0, t1, van: start, naar: doel, hoog: !!a.hoog, daarna: ontvanger }, (e) => e.t0);
  tl.sporen.push({ soort: 'bal', van: start, naar: doel, t0, t1, ease: 'bal', id: bal });
  return t1;
}

/** Totale lengte van één ronde inclusief de rust aan het eind. */
export function rondeDuur(tl: Tijdlijn): number {
  return tl.duur > 0 ? tl.duur + NA_AFLOOP : 0;
}

export function standOp(tl: Tijdlijn, t: number): Stand {
  const objecten = new Map<string, ObjectStand>();
  for (const o of tl.objecten.values()) {
    if (o.soort === 'bal') {
      const { p, hoogte } = balPositie(tl, o.id, t);
      objecten.set(o.id, { x: p[0], y: p[1], hoek: 0, houding: 'staan', duikHoek: 0, hoogte });
    } else if (isPersoon(o)) {
      const p = positie(tl, o.id, t);
      const h = houding(tl, o.id, t);
      objecten.set(o.id, { x: p[0], y: p[1], hoek: kijkHoek(tl, o.id, t), houding: h.houding, duikHoek: h.hoek ?? 0, hoogte: 0 });
    } else {
      objecten.set(o.id, { x: o.x, y: o.y, hoek: o.hoek ?? 0, houding: 'staan', duikHoek: 0, hoogte: 0 });
    }
  }
  const sporen: SpoorStand[] = [];
  for (const s of tl.sporen) {
    if (t < s.t0) continue;
    const u = (t - s.t0) / (s.t1 - s.t0);
    sporen.push({ soort: s.soort, van: s.van, naar: s.naar, tot: lerp(s.van, s.naar, ease(s.ease, u)), klaar: u >= 1 });
  }
  return { objecten, sporen };
}
