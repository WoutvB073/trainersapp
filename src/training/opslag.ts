import { useSyncExternalStore } from 'react';
import { sleutelVoor } from '../engine/account';
import { dupliceer, isLeeg, maakId, type GedeeldeTraining, type Training } from './training';

/**
 * Opslag van trainingen. De app praat alleen met `TrainingStore`; waar de trainingen echt staan, regelt een
 * `TrainingBackend`. Nu is dat het apparaat (localStorage); in fase 6 komt er een online backend (Firebase) bij die
 * hetzelfde formaat gebruikt.
 */
export interface TrainingBackend {
  laad(): Training[];
  bewaar(lijst: Training[]): void;
}

const SLEUTEL = 'trainersapp.trainingen';
const VERSIE = 1;

type Opslagplek = Pick<Storage, 'getItem' | 'setItem'>;

/** Backend op het apparaat. Kapotte of onbekende gegevens leveren een lege lijst op (de app blijft werken). */
export function apparaatBackend(opslag: Opslagplek | undefined, sleutel = SLEUTEL): TrainingBackend {
  return {
    laad() {
      try {
        const ruw = opslag?.getItem(sleutel);
        if (!ruw) return [];
        const data = JSON.parse(ruw) as { versie?: number; trainingen?: Training[] };
        return data.versie === VERSIE && Array.isArray(data.trainingen) ? data.trainingen : [];
      } catch {
        return [];
      }
    },
    bewaar(lijst) {
      try {
        opslag?.setItem(sleutel, JSON.stringify({ versie: VERSIE, trainingen: lijst }));
      } catch {
        /* vol of geblokkeerd: dan blijft het in het geheugen voor deze sessie */
      }
    },
  };
}

export class TrainingStore {
  private lijstNu: Training[];
  private luisteraars = new Set<() => void>();

  constructor(private backend: TrainingBackend) {
    this.lijstNu = backend.laad();
  }

  /** Nieuwste (laatst gewijzigd) eerst. */
  lijst = (): Training[] => this.lijstNu;

  haal(id: string): Training | undefined {
    return this.lijstNu.find((t) => t.id === id);
  }

  bewaar(t: Training, nu = Date.now()): Training {
    const nieuw = { ...t, gewijzigd: nu };
    this.zet([nieuw, ...this.lijstNu.filter((x) => x.id !== t.id)]);
    return nieuw;
  }

  verwijder(id: string): void {
    this.zet(this.lijstNu.filter((t) => t.id !== id));
  }

  dupliceer(id: string, nu = Date.now()): Training | undefined {
    const t = this.haal(id);
    if (!t) return undefined;
    const kopie = dupliceer(t, nu);
    this.zet([kopie, ...this.lijstNu]);
    return kopie;
  }

  /** Een gedeelde training opslaan als nieuwe eigen training. */
  importeer(g: GedeeldeTraining, nu = Date.now()): Training {
    const t: Training = { ...g, id: maakId(), oefeningen: [...g.oefeningen], gemaakt: nu, gewijzigd: nu };
    this.zet([t, ...this.lijstNu]);
    return t;
  }


  /** Lege trainingen (niets ingevuld) weghalen, behalve die je nu open hebt. */
  ruimLegeOp(behalve?: string): void {
    const weg = this.lijstNu.filter((t) => t.id !== behalve && isLeeg(t));
    if (weg.length) this.zet(this.lijstNu.filter((t) => !weg.includes(t)));
  }

  /** Andere opslagplek (inloggen of uitloggen): de lijst van daar laden. */
  wisselBackend(backend: TrainingBackend): void {
    this.backend = backend;
    this.lijstNu = backend.laad();
    for (const cb of this.luisteraars) cb();
  }

  /** Alles in één keer vervangen (synchronisatie met online). */
  vervangAlles(lijst: Training[]): void {
    this.zet(lijst);
  }

  abonneer = (cb: () => void): (() => void) => {
    this.luisteraars.add(cb);
    return () => this.luisteraars.delete(cb);
  };

  private zet(lijst: Training[]) {
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
export function trainingBackend(uid: string | null): TrainingBackend {
  return apparaatBackend(lokaleOpslag(), sleutelVoor('trainingen', uid));
}

export const trainingen = new TrainingStore(apparaatBackend(lokaleOpslag(), sleutelVoor('trainingen')));

export function useTrainingen(): Training[] {
  return useSyncExternalStore(trainingen.abonneer, trainingen.lijst, trainingen.lijst);
}

export function useTraining(id: string): Training | undefined {
  const lijst = useTrainingen();
  return lijst.find((t) => t.id === id);
}
