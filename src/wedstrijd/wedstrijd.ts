import type { Tekening, VeldObject } from '../model/types';
import { maakId } from '../model/id';
import { naarBase64Url, uitBase64Url } from '../training/training';

/**
 * Wedstrijd: opstellingen (spelvorm, formatie, spelers op posities, wissels) en tactiekborden/spelhervattingen
 * (een gewone tekening die je in de editor tekent en die afspeelt in 2D en 3D). Puur, zodat het te testen is.
 */

export type Spelvorm = '4v4' | '6v6' | '8v8' | '11v11';

export interface SpelvormInfo {
  id: Spelvorm;
  naam: string;
  /** Spelers op het veld (met keeper als die er is). */
  spelers: number;
  keeper: boolean;
  /** Veldmaat in meters (breedte × lengte), voor de verhoudingen van het veld. */
  veld: { breedte: number; lengte: number };
  /** Formaties: met keeper "1-…" (keeper eerst), zonder keeper alleen de veldspelers van achter naar voren. */
  formaties: string[];
}

export const SPELVORMEN: SpelvormInfo[] = [
  { id: '4v4', naam: '4 tegen 4', spelers: 4, keeper: false, veld: { breedte: 20, lengte: 30 }, formaties: ['1-2-1', '2-2'] },
  { id: '6v6', naam: '6 tegen 6', spelers: 6, keeper: true, veld: { breedte: 30, lengte: 42.5 }, formaties: ['1-2-1-2', '1-3-2', '1-2-2-1'] },
  { id: '8v8', naam: '8 tegen 8', spelers: 8, keeper: true, veld: { breedte: 42.5, lengte: 64 }, formaties: ['1-3-3-1', '1-2-3-2', '1-3-2-2'] },
  { id: '11v11', naam: '11 tegen 11', spelers: 11, keeper: true, veld: { breedte: 68, lengte: 105 }, formaties: ['1-4-3-3', '1-4-4-2', '1-3-4-3', '1-4-2-3-1'] },
];

export const spelvorm = (id: Spelvorm) => SPELVORMEN.find((s) => s.id === id) ?? SPELVORMEN[3]!;

/** Een positie op het veld: x en y van 0 tot 1 (eigen goal onderaan, y = 1), met de speler die er staat. */
export interface Plek {
  id: string;
  x: number;
  y: number;
  /** Rugnummer bij de positie (keeper 1, dan van achter naar voren). */
  nummer: number;
  naam?: string;
}

export interface Opstelling {
  id: string;
  naam: string;
  /** JJJJ-MM-DD */
  datum?: string;
  spelvorm: Spelvorm;
  formatie: string;
  plekken: Plek[];
  /** Spelers op de bank (namen). */
  wissels: string[];
  gemaakt: number;
  gewijzigd: number;
}

const r3 = (v: number) => Math.round(v * 1000) / 1000;

/** Posities van een formatie (genormaliseerd), keeper eerst; daarna rij voor rij van achter naar voren, links naar rechts. */
export function formatiePlekken(vorm: Spelvorm, formatie: string): Omit<Plek, 'naam'>[] {
  const info = spelvorm(vorm);
  const rijen = formatie.split('-').map(Number);
  const uit: Omit<Plek, 'naam'>[] = [];
  let veldRijen = rijen;
  if (info.keeper) {
    uit.push({ id: 'p1', x: 0.5, y: 0.94, nummer: 1 });
    veldRijen = rijen.slice(1);
  }
  const k = veldRijen.length;
  veldRijen.forEach((n, i) => {
    const y = k === 1 ? 0.6 : 0.8 - (i * 0.5) / (k - 1);
    const rand = n >= 4 ? 0.12 : n === 3 ? 0.2 : 0.3;
    for (let j = 0; j < n; j++) {
      const x = n === 1 ? 0.5 : rand + ((1 - 2 * rand) * j) / (n - 1);
      const nr = uit.length + 1;
      uit.push({ id: `p${nr}`, x: r3(x), y: r3(y), nummer: nr });
    }
  });
  return uit;
}

/** Nieuwe opstelling: de spelers uit je lijst staan eerst op de bank. */
export function nieuweOpstelling(vorm: Spelvorm, namen: string[] = [], nu = Date.now(), id = maakId()): Opstelling {
  const formatie = spelvorm(vorm).formaties[0]!;
  return { id, naam: '', spelvorm: vorm, formatie, plekken: formatiePlekken(vorm, formatie), wissels: [...namen], gemaakt: nu, gewijzigd: nu };
}

/** Lege posities vullen met spelers van de bank (in volgorde). */
export function vulAan(o: Opstelling): Opstelling {
  const bank = [...o.wissels];
  const plekken = o.plekken.map((p) => (p.naam || !bank.length ? p : { ...p, naam: bank.shift()! }));
  return { ...o, plekken, wissels: bank };
}

/** Andere formatie of spelvorm: posities opnieuw, spelers in dezelfde volgorde mee (wie overblijft gaat naar de bank). */
export function wisselFormatie(o: Opstelling, vorm: Spelvorm, formatie: string): Opstelling {
  const namen = o.plekken.map((p) => p.naam);
  const nieuw = formatiePlekken(vorm, formatie);
  const plekken: Plek[] = nieuw.map((p, i) => (namen[i] ? { ...p, naam: namen[i] } : p));
  const over = namen.slice(nieuw.length).filter((n): n is string => !!n);
  return { ...o, spelvorm: vorm, formatie, plekken, wissels: [...o.wissels, ...over] };
}

/**
 * Een speler (van de bank of van een andere positie) op een positie zetten. Staat daar al iemand, dan ruilen ze
 * (van een positie) of gaat die naar de bank (van de bank).
 */
export function zetOpPlek(o: Opstelling, naam: string, plek: string): Opstelling {
  const doel = o.plekken.find((p) => p.id === plek);
  if (!doel || doel.naam === naam) return o;
  const van = o.plekken.find((p) => p.naam === naam);
  const vorige = doel.naam;
  const plekken = o.plekken.map((p) => {
    if (p.id === plek) return { ...p, naam };
    if (van && p.id === van.id) return vorige ? { ...p, naam: vorige } : { ...p, naam: undefined };
    return p;
  });
  let wissels = o.wissels.filter((w) => w !== naam);
  if (!van && vorige) wissels = [...wissels, vorige];
  return { ...o, plekken: plekken.map(schoon), wissels };
}

const schoon = (p: Plek): Plek => {
  if (p.naam) return p;
  const { naam: _n, ...rest } = p;
  void _n;
  return rest;
};

/** Speler van een positie naar de bank. */
export function naarBank(o: Opstelling, plek: string): Opstelling {
  const p = o.plekken.find((x) => x.id === plek);
  if (!p?.naam) return o;
  return { ...o, plekken: o.plekken.map((x) => (x.id === plek ? schoon({ ...x, naam: undefined }) : x)), wissels: [...o.wissels, p.naam] };
}

/** Positie vrij verslepen (binnen het veld). */
export function verplaatsPlek(o: Opstelling, plek: string, x: number, y: number): Opstelling {
  const k = (v: number) => r3(Math.max(0.03, Math.min(0.97, v)));
  return { ...o, plekken: o.plekken.map((p) => (p.id === plek ? { ...p, x: k(x), y: k(y) } : p)) };
}

/** Speler helemaal uit de opstelling (en van de bank). */
export function haalWeg(o: Opstelling, naam: string): Opstelling {
  return { ...o, plekken: o.plekken.map((p) => (p.naam === naam ? schoon({ ...p, naam: undefined }) : p)), wissels: o.wissels.filter((w) => w !== naam) };
}

/** Nieuwe speler op de bank (als hij er nog niet in staat). */
export function voegSpelerToe(o: Opstelling, naam: string): Opstelling {
  const n = naam.trim();
  if (!n || o.wissels.includes(n) || o.plekken.some((p) => p.naam === n)) return o;
  return { ...o, wissels: [...o.wissels, n] };
}

export function opstellingNaam(o: Pick<Opstelling, 'naam' | 'spelvorm' | 'formatie'>): string {
  return o.naam.trim() || `${spelvorm(o.spelvorm).naam} · ${o.formatie}`;
}

export function dupliceerOpstelling(o: Opstelling, nu = Date.now(), id = maakId()): Opstelling {
  return { ...structuredClone(o), id, naam: `${opstellingNaam(o)} (kopie)`, gemaakt: nu, gewijzigd: nu };
}

// ---------- tactiekborden en spelhervattingen ----------

export type BordSoort = 'tactiek' | 'hervatting';

export interface Bord {
  id: string;
  naam: string;
  soort: BordSoort;
  tekening: Tekening;
  gemaakt: number;
  gewijzigd: number;
}

export const bordNaam = (b: Pick<Bord, 'naam' | 'soort'>) => b.naam.trim() || (b.soort === 'hervatting' ? 'Spelhervatting' : 'Tactiekbord');

export function nieuwBord(soort: BordSoort, tekening: Tekening, naam = '', nu = Date.now(), id = maakId()): Bord {
  return { id, naam, soort, tekening, gemaakt: nu, gewijzigd: nu };
}

export function dupliceerBord(b: Bord, nu = Date.now(), id = maakId()): Bord {
  return { ...structuredClone(b), id, naam: `${bordNaam(b)} (kopie)`, gemaakt: nu, gewijzigd: nu };
}

/** Heel of half veld met goals (zoals in de editor). */
export function veldTekening(type: 'heel' | 'half'): Tekening {
  const objecten: VeldObject[] = [{ id: 'g1', soort: 'goal', x: 34, y: 0 }];
  if (type === 'heel') objecten.push({ id: 'g2', soort: 'goal', x: 34, y: 105, hoek: 180 });
  return { veld: { type }, camera: 'schuin', objecten, lijnen: [] };
}

/** Veld in de maat van de spelvorm met de goals die erbij horen (4 tegen 4 kleine doeltjes, 6 en 8 tegen 8 jeugdgoals). */
export function veldVoorSpelvorm(vorm: Spelvorm): Tekening {
  const { breedte: B, lengte: L } = spelvorm(vorm).veld;
  const goal = (id: string, y: number, hoek?: number): VeldObject => {
    const basis = { id, x: r3(B / 2), y, ...(hoek ? { hoek } : {}) };
    if (vorm === '4v4') return { ...basis, soort: 'klein-goal' };
    if (vorm === '11v11') return { ...basis, soort: 'goal' };
    return { ...basis, soort: 'goal', breedte: 5, hoogte: 2 };
  };
  // Camera van boven: dan staan beide teams helemaal in beeld (schuin valt de eigen keeper soms buiten beeld).
  return { veld: { type: 'heel', breedte: B, lengte: L }, camera: 'boven', objecten: [goal('g1', 0), goal('g2', L, 180)], lijnen: [] };
}

/**
 * Tactiekbord met beide teams volledig opgesteld, elk in zijn eigen helft (zoals bij de aftrap): jouw team (A, rood)
 * onder, de tegenstander (B, blauw) boven, keepers in hun goal en de bal op de middenstip. De onderlinge opstelling
 * (links/rechts, rijen) komt uit de formatie of uit de opstelling (met de namen, die je op het bord kunt aanzetten).
 */
export function opgesteldBord(vorm: Spelvorm, formatieA: string, formatieB = formatieA, plekkenA?: Plek[]): Tekening {
  const t = veldVoorSpelvorm(vorm);
  const info = spelvorm(vorm);
  const { breedte: B, lengte: L } = info.veld;
  const helft = L / 2;
  // Ruimte rond de middenlijn (de tegenstander staat bij de aftrap buiten de middencirkel).
  const gat = Math.max(1.6, Math.min(9.15, B * 0.135) * 0.6);
  // Rij-hoogte 0,3 (aanval) … 0,94 (keeper) → tussen de middenlijn en het eigen goal.
  const diepte = (y: number) => Math.max(0, Math.min(1, (y - 0.3) / 0.64));
  const yA = (y: number) => r3(Math.min(L - 1.2, helft + gat + diepte(y) * (helft - gat - L * 0.13)));
  const objecten = [...t.objecten];
  const eigen = plekkenA ?? formatiePlekken(vorm, formatieA);
  for (const p of eigen) {
    const x = r3(Math.max(1, Math.min(B - 1, p.x * B)));
    const n = (p as Plek).naam;
    const naam = n ? { naam: n } : {};
    if (info.keeper && p.nummer === 1) objecten.push({ id: 'k1', soort: 'keeper', nummer: 1, x, y: r3(L - 1.5), ...naam });
    else objecten.push({ id: `a${p.nummer}`, soort: 'speler', team: 'A', nummer: p.nummer, x, y: yA(p.y), kijkrichting: -90, ...naam });
  }
  for (const p of formatiePlekken(vorm, formatieB)) {
    const x = r3(p.x * B);
    if (info.keeper && p.nummer === 1) objecten.push({ id: 'k2', soort: 'keeper', nummer: 2, x, y: 1.5 });
    else objecten.push({ id: `b${p.nummer}`, soort: 'speler', team: 'B', nummer: p.nummer, x, y: r3(L - yA(p.y)), kijkrichting: 90 });
  }
  objecten.push({ id: 'bal1', soort: 'bal', x: r3(B / 2), y: r3(helft) });
  return { ...t, objecten };
}

/** Tactiekbord vanuit een opstelling: zelfde spelvorm en veld, jouw spelers met hun namen, tegenstander in dezelfde formatie. */
export function bordUitOpstelling(o: Opstelling): Tekening {
  const info = spelvorm(o.spelvorm);
  const tegen = info.formaties.includes(o.formatie) ? o.formatie : info.formaties[0]!;
  return opgesteldBord(o.spelvorm, o.formatie, tegen, o.plekken);
}

// ---------- delen via een link ----------

/** Code voor in een deellink (opstelling of bord), compact en zonder id's of tijden. */
export function wedstrijdCode(x: { soort: 'opstelling'; opstelling: Opstelling } | { soort: 'bord'; bord: Bord }): string {
  if (x.soort === 'opstelling') {
    const o = x.opstelling;
    return naarBase64Url(JSON.stringify({ v: 1, s: 'o', n: o.naam, d: o.datum, f: o.spelvorm, fo: o.formatie, p: o.plekken, w: o.wissels }));
  }
  const b = x.bord;
  return naarBase64Url(JSON.stringify({ v: 1, s: 'b', n: b.naam, z: b.soort, t: b.tekening }));
}

export type UitCode = { soort: 'opstelling'; opstelling: Omit<Opstelling, 'id' | 'gemaakt' | 'gewijzigd'> } | { soort: 'bord'; bord: Omit<Bord, 'id' | 'gemaakt' | 'gewijzigd'> };

export function uitWedstrijdCode(code: string): UitCode | null {
  try {
    const x = JSON.parse(uitBase64Url(code)) as Record<string, unknown>;
    if (x.v !== 1) return null;
    const naam = typeof x.n === 'string' ? x.n.slice(0, 80) : '';
    if (x.s === 'o') {
      const vorm = SPELVORMEN.find((s) => s.id === x.f)?.id;
      if (!vorm || typeof x.fo !== 'string' || !Array.isArray(x.p) || !Array.isArray(x.w)) return null;
      const plekken = (x.p as Plek[])
        .filter((p) => p && typeof p.id === 'string' && typeof p.x === 'number' && typeof p.y === 'number' && typeof p.nummer === 'number')
        .map((p) => schoon({ id: p.id, x: p.x, y: p.y, nummer: p.nummer, naam: typeof p.naam === 'string' ? p.naam.slice(0, 40) : undefined }));
      const wissels = (x.w as unknown[]).filter((w): w is string => typeof w === 'string').map((w) => w.slice(0, 40));
      const datum = typeof x.d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.d) ? x.d : undefined;
      return { soort: 'opstelling', opstelling: { naam, ...(datum ? { datum } : {}), spelvorm: vorm, formatie: x.fo.slice(0, 20), plekken, wissels } };
    }
    if (x.s === 'b') {
      const t = x.t as Tekening | undefined;
      if (!t || typeof t !== 'object' || !t.veld || !Array.isArray(t.objecten)) return null;
      return { soort: 'bord', bord: { naam, soort: x.z === 'hervatting' ? 'hervatting' : 'tactiek', tekening: t } };
    }
    return null;
  } catch {
    return null;
  }
}

/** Code uit een geplakte link (#/w/…). */
export function wedstrijdCodeUitLink(tekst: string): string | null {
  const m = /#\/w\/([A-Za-z0-9_-]+)/.exec(tekst.trim());
  return m ? m[1]! : null;
}
