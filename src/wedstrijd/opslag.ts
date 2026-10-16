import { useSyncExternalStore } from 'react';
import { sleutelVoor } from '../engine/account';
import type { Bord, Opstelling } from './wedstrijd';

/**
 * Opslag van opstellingen, tactiekborden/spelhervattingen en de lijst met spelersnamen. Zoals de andere stores: op het
 * apparaat (localStorage), ingelogd onder de sleutels van het account (en dan ook online, zie src/online/sync.ts).
 */

type Opslagplek = Pick<Storage, 'getItem' | 'setItem'>;
const VERSIE = 1;

export interface LijstBackend<T> {
  laad(): T[];
  bewaar(lijst: T[]): void;
}

export function apparaatLijst<T>(opslag: Opslagplek | undefined, sleutel: string): LijstBackend<T> {
  return {
    laad() {
      try {
        const ruw = opslag?.getItem(sleutel);
        if (!ruw) return [];
        const data = JSON.parse(ruw) as { versie?: number; lijst?: T[] };
        return data.versie === VERSIE && Array.isArray(data.lijst) ? data.lijst : [];
      } catch {
        return [];
      }
    },
    bewaar(lijst) {
      try {
        opslag?.setItem(sleutel, JSON.stringify({ versie: VERSIE, lijst }));
      } catch {
        /* vol of geblokkeerd */
      }
    },
  };
}

export class LijstStore<T extends { id: string; gewijzigd: number }> {
  private lijstNu: T[];
  private luisteraars = new Set<() => void>();

  constructor(private backend: LijstBackend<T>) {
    this.lijstNu = backend.laad();
  }

  /** Laatst gewijzigd eerst. */
  lijst = (): T[] => this.lijstNu;

  haal(id: string): T | undefined {
    return this.lijstNu.find((x) => x.id === id);
  }

  bewaar(x: T, nu = Date.now()): T {
    const nieuw = { ...x, gewijzigd: nu };
    this.zet([nieuw, ...this.lijstNu.filter((y) => y.id !== x.id)]);
    return nieuw;
  }

  verwijder(id: string): void {
    this.zet(this.lijstNu.filter((x) => x.id !== id));
  }

  wisselBackend(backend: LijstBackend<T>): void {
    this.backend = backend;
    this.lijstNu = backend.laad();
    for (const cb of this.luisteraars) cb();
  }

  vervangAlles(lijst: T[]): void {
    this.zet(lijst);
  }

  abonneer = (cb: () => void): (() => void) => {
    this.luisteraars.add(cb);
    return () => this.luisteraars.delete(cb);
  };

  private zet(lijst: T[]) {
    this.lijstNu = lijst;
    this.backend.bewaar(lijst);
    for (const cb of this.luisteraars) cb();
  }
}

function lokaleOpslag(): Opslagplek | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

export const opstellingBackend = (uid: string | null) => apparaatLijst<Opstelling>(lokaleOpslag(), sleutelVoor('opstellingen', uid));
export const bordBackend = (uid: string | null) => apparaatLijst<Bord>(lokaleOpslag(), sleutelVoor('borden', uid));

export const opstellingen = new LijstStore<Opstelling>(apparaatLijst(lokaleOpslag(), sleutelVoor('opstellingen')));
export const borden = new LijstStore<Bord>(apparaatLijst(lokaleOpslag(), sleutelVoor('borden')));

export const useOpstellingen = () => useSyncExternalStore(opstellingen.abonneer, opstellingen.lijst, opstellingen.lijst);
export const useBorden = () => useSyncExternalStore(borden.abonneer, borden.lijst, borden.lijst);
export const useOpstelling = (id: string) => useOpstellingen().find((o) => o.id === id);
export const useBord = (id: string) => useBorden().find((b) => b.id === id);

// ---------- spelersnamen (onthouden voor de volgende opstelling) ----------

const NAMEN = 'trainersapp.spelersnamen';
let namen: string[] = (() => {
  try {
    const x = JSON.parse(lokaleOpslag()?.getItem(NAMEN) ?? '[]') as unknown;
    return Array.isArray(x) ? x.filter((n): n is string => typeof n === 'string') : [];
  } catch {
    return [];
  }
})();
const naamLuisteraars = new Set<() => void>();

export const spelersnamen = {
  lijst: () => namen,
  zet(lijst: string[]) {
    namen = [...new Set(lijst.map((n) => n.trim()).filter(Boolean))].slice(0, 60);
    try {
      lokaleOpslag()?.setItem(NAMEN, JSON.stringify(namen));
    } catch {
      /* geen opslag */
    }
    for (const cb of naamLuisteraars) cb();
  },
  abonneer(cb: () => void) {
    naamLuisteraars.add(cb);
    return () => naamLuisteraars.delete(cb);
  },
};
export const useSpelersnamen = () => useSyncExternalStore(spelersnamen.abonneer, spelersnamen.lijst, spelersnamen.lijst);
