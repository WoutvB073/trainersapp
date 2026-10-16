import { useSyncExternalStore } from 'react';
import { sleutelVoor } from '../engine/account';
import type { EigenOefening, Oefening } from '../model/types';
import { dupliceerEigen, EIGEN_VOORVOEGSEL, zelfdeInhoud } from './eigen';
import { maakId } from '../model/id';

/**
 * Opslag van eigen oefeningen. Net als bij trainingen praat de app alleen met de store; waar de oefeningen staan
 * regelt een backend (nu het apparaat, later online zodat je ze met je team kunt delen).
 */
export interface EigenBackend {
  laad(): EigenOefening[];
  bewaar(lijst: EigenOefening[]): void;
}

const SLEUTEL = 'trainersapp.eigen';
const VERSIE = 1;

type Opslagplek = Pick<Storage, 'getItem' | 'setItem'>;

export function apparaatEigenBackend(opslag: Opslagplek | undefined, sleutel = SLEUTEL): EigenBackend {
  return {
    laad() {
      try {
        const ruw = opslag?.getItem(sleutel);
        if (!ruw) return [];
        const data = JSON.parse(ruw) as {
          versie?: number;
          oefeningen?: EigenOefening[];
        };
        return data.versie === VERSIE && Array.isArray(data.oefeningen) ? data.oefeningen : [];
      } catch {
        return [];
      }
    },
    bewaar(lijst) {
      try {
        opslag?.setItem(sleutel, JSON.stringify({ versie: VERSIE, oefeningen: lijst }));
      } catch {
        /* vol of geblokkeerd: dan blijft het in het geheugen voor deze sessie */
      }
    },
  };
}

export class EigenStore {
  private lijstNu: EigenOefening[];
  private luisteraars = new Set<() => void>();

  constructor(private backend: EigenBackend) {
    this.lijstNu = backend.laad();
  }

  /** Laatst gewijzigd eerst. */
  lijst = (): EigenOefening[] => this.lijstNu;

  haal(id: string): EigenOefening | undefined {
    return this.lijstNu.find((o) => o.id === id);
  }

  bewaar(o: EigenOefening, nu = Date.now()): EigenOefening {
    const nieuw = { ...o, gewijzigd: nu };
    this.zet([nieuw, ...this.lijstNu.filter((x) => x.id !== o.id)]);
    return nieuw;
  }

  verwijder(id: string): void {
    this.zet(this.lijstNu.filter((o) => o.id !== id));
  }

  dupliceer(id: string, nu = Date.now()): EigenOefening | undefined {
    const o = this.haal(id);
    if (!o) return undefined;
    const kopie = dupliceerEigen(o, nu);
    this.zet([kopie, ...this.lijstNu]);
    return kopie;
  }

  /**
   * Eigen oefeningen uit een gedeelde training opslaan. Staat dezelfde oefening er al, dan wordt die gebruikt;
   * bestaat de id al met een andere inhoud, dan komt hij erbij met een nieuwe id. Geeft oude → nieuwe id terug.
   */
  importeer(lijst: Oefening[], nu = Date.now()): Map<string, string> {
    const ids = new Map<string, string>();
    let nieuw = [...this.lijstNu];
    for (const o of lijst) {
      const bestaand = nieuw.find((x) => x.id === o.id);
      if (bestaand && zelfdeInhoud(bestaand, o)) {
        ids.set(o.id, o.id);
        continue;
      }
      const id = bestaand ? EIGEN_VOORVOEGSEL + maakId() : o.id;
      nieuw = [{ ...o, id, eigen: true, gemaakt: nu, gewijzigd: nu }, ...nieuw];
      ids.set(o.id, id);
    }
    this.zet(nieuw);
    return ids;
  }


  /** Andere opslagplek (inloggen of uitloggen): de lijst van daar laden. */
  wisselBackend(backend: EigenBackend): void {
    this.backend = backend;
    this.lijstNu = backend.laad();
    for (const cb of this.luisteraars) cb();
  }

  /** Alles in één keer vervangen (synchronisatie met online). */
  vervangAlles(lijst: EigenOefening[]): void {
    this.zet(lijst);
  }

  abonneer = (cb: () => void): (() => void) => {
    this.luisteraars.add(cb);
    return () => this.luisteraars.delete(cb);
  };

  private zet(lijst: EigenOefening[]) {
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

/** Opslag van dit apparaat, of (ingelogd) de lokale kopie van het account. */
export function eigenBackend(uid: string | null): EigenBackend {
  return apparaatEigenBackend(lokaleOpslag(), sleutelVoor('eigen', uid));
}

export const eigenOefeningen = new EigenStore(apparaatEigenBackend(lokaleOpslag(), sleutelVoor('eigen')));

export function useEigenOefeningen(): EigenOefening[] {
  return useSyncExternalStore(eigenOefeningen.abonneer, eigenOefeningen.lijst, eigenOefeningen.lijst);
}

export function useEigenOefening(id: string): EigenOefening | undefined {
  return useEigenOefeningen().find((o) => o.id === id);
}
