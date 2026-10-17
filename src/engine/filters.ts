import { useSyncExternalStore } from 'react';
import type { Oefening } from '../model/types';
import { pastBij } from '../training/training';

/**
 * Filters voor lijsten met oefeningen: aantallen die je hebt (dezelfde regel als bij Training maken: minder nodig is
 * prima), alleen favorieten, alleen eigen oefeningen en zoeken op naam. De aantallen worden
 * onthouden op het apparaat; de rest geldt zolang de app open is (ook als je naar een andere categorie gaat).
 */
export interface Filters {
  /** Aantal spelers en keepers dat je hebt (`null` = niet op aantallen filteren). */
  aantallen: { spelers: number; keepers: number } | null;
  favorieten: boolean;
  eigen: boolean;
  zoek: string;
}

export const GEEN_FILTERS: Filters = { aantallen: null, favorieten: false, eigen: false, zoek: '' };

/** Zonder hoofdletters en accenten (zoeken op "coordinatie" vindt "Coördinatie"). */
const plat = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/** Past deze oefening bij de filters? `aantallen` uit kan je meegeven (bv. bij Training maken: die van de training). */
export function pastBijFilters(o: Oefening, f: Filters, favorieten: ReadonlySet<string>): boolean {
  if (f.aantallen && !pastBij(o, f.aantallen.spelers, f.aantallen.keepers)) return false;
  if (f.favorieten && !favorieten.has(o.id)) return false;
  if (f.eigen && !o.eigen) return false;
  const z = plat(f.zoek);
  if (z) {
    const naam = plat(o.naam);
    // Alle woorden moeten in de naam voorkomen ("pass loop" vindt "Pass in de loop").
    if (!z.split(/\s+/).every((w) => naam.includes(w))) return false;
  }
  return true;
}

export function filterOefeningen(lijst: Oefening[], f: Filters, favorieten: ReadonlySet<string>): Oefening[] {
  return lijst.filter((o) => pastBijFilters(o, f, favorieten));
}

/** Hoeveel filters staan er aan (voor het knopje "Filters (2)"). */
export function aantalActief(f: Filters, metAantallen = true): number {
  return (metAantallen && f.aantallen ? 1 : 0) + (f.favorieten ? 1 : 0) + (f.eigen ? 1 : 0) + (f.zoek.trim() ? 1 : 0);
}

// ---------- gedeelde toestand (zolang de app open is; aantallen ook op het apparaat) ----------

const SLEUTEL = 'trainersapp.filterAantallen';
/** De laatst gebruikte aantallen (ook als het filter uit staat), om ze bij het aanzetten weer te gebruiken. */
const LAATST = 'trainersapp.filterAantallenLaatst';
type Opslagplek = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function opslag(): Opslagplek | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

export function leesAantallen(plek: Opslagplek | undefined = opslag(), sleutel = SLEUTEL): Filters['aantallen'] {
  try {
    const x = JSON.parse(plek?.getItem(sleutel) ?? 'null') as { spelers?: unknown; keepers?: unknown } | null;
    if (!x) return null;
    const getal = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(40, Math.round(v))) : 0);
    return { spelers: getal(x.spelers), keepers: getal(x.keepers) };
  } catch {
    return null;
  }
}

export function bewaarAantallen(a: Filters['aantallen'], plek: Opslagplek | undefined = opslag()): void {
  try {
    if (a) {
      plek?.setItem(SLEUTEL, JSON.stringify(a));
      plek?.setItem(LAATST, JSON.stringify(a));
    } else plek?.removeItem(SLEUTEL);
  } catch {
    /* niet erg */
  }
}

/** Aantallen om mee te beginnen als je het filter aanzet: de laatst gebruikte, anders 12 spelers en 1 keeper. */
export function laatsteAantallen(plek: Opslagplek | undefined = opslag()): { spelers: number; keepers: number } {
  return leesAantallen(plek, LAATST) ?? leesAantallen(plek) ?? { spelers: 12, keepers: 1 };
}

let huidig: Filters = { ...GEEN_FILTERS, aantallen: leesAantallen() };
const luisteraars = new Set<() => void>();

export function zetFilters(w: Partial<Filters>): void {
  huidig = { ...huidig, ...w };
  if ('aantallen' in w) bewaarAantallen(huidig.aantallen);
  for (const cb of luisteraars) cb();
}

/** Alles wissen (ook de aantallen). */
export function wisFilters(): void {
  zetFilters({ ...GEEN_FILTERS });
}

const abonneer = (cb: () => void) => {
  luisteraars.add(cb);
  return () => luisteraars.delete(cb);
};
const nu = () => huidig;

/** Luisteren naar filterwijzigingen (synchronisatie van de aantallen). */
export const abonneerFilters = abonneer;
export const huidigeFilters = nu;

export function useFilters(): Filters {
  return useSyncExternalStore(abonneer, nu, nu);
}
