import { useSyncExternalStore } from 'react';
import { sleutelVoor } from './account';

/**
 * Favoriete oefeningen (ingebouwd en eigen), als lijst id's. Net als trainingen en eigen oefeningen via een
 * verwisselbare backend: nu het apparaat, later online (dan dezelfde lijst per account).
 */
export interface FavorietenBackend {
  laad(): string[];
  bewaar(ids: string[]): void;
}

const SLEUTEL = 'trainersapp.favorieten';
const VERSIE = 1;

type Opslagplek = Pick<Storage, 'getItem' | 'setItem'>;

export function apparaatFavorieten(opslag: Opslagplek | undefined, sleutel = SLEUTEL): FavorietenBackend {
  return {
    laad() {
      try {
        const data = JSON.parse(opslag?.getItem(sleutel) ?? 'null') as { versie?: number; ids?: unknown } | null;
        return data?.versie === VERSIE && Array.isArray(data.ids) ? data.ids.filter((x): x is string => typeof x === 'string') : [];
      } catch {
        return [];
      }
    },
    bewaar(ids) {
      try {
        opslag?.setItem(sleutel, JSON.stringify({ versie: VERSIE, ids }));
      } catch {
        /* vol of geblokkeerd */
      }
    },
  };
}

export class FavorietenStore {
  private ids: Set<string>;
  private luisteraars = new Set<() => void>();

  constructor(private backend: FavorietenBackend) {
    this.ids = new Set(backend.laad());
  }

  /** Vaste verzameling (nieuw object na elke wijziging, voor React). */
  alle = (): ReadonlySet<string> => this.ids;

  is(id: string): boolean {
    return this.ids.has(id);
  }

  wissel(id: string): boolean {
    const nieuw = new Set(this.ids);
    if (nieuw.has(id)) nieuw.delete(id);
    else nieuw.add(id);
    this.ids = nieuw;
    this.backend.bewaar([...nieuw]);
    for (const cb of this.luisteraars) cb();
    return nieuw.has(id);
  }


  /** Andere opslagplek (inloggen of uitloggen). */
  wisselBackend(backend: FavorietenBackend): void {
    this.backend = backend;
    this.ids = new Set(backend.laad());
    for (const cb of this.luisteraars) cb();
  }

  /** Alles in één keer vervangen (synchronisatie met online). */
  vervangAlles(ids: readonly string[]): void {
    this.ids = new Set(ids);
    this.backend.bewaar([...this.ids]);
    for (const cb of this.luisteraars) cb();
  }

  abonneer = (cb: () => void): (() => void) => {
    this.luisteraars.add(cb);
    return () => this.luisteraars.delete(cb);
  };
}

function lokaleOpslag(): Opslagplek | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

/** Opslag van dit apparaat, of (ingelogd) de lokale kopie van het account. */
export function favorietenBackend(uid: string | null): FavorietenBackend {
  return apparaatFavorieten(lokaleOpslag(), sleutelVoor('favorieten', uid));
}

export const favorieten = new FavorietenStore(apparaatFavorieten(lokaleOpslag(), sleutelVoor('favorieten')));

export function useFavorieten(): ReadonlySet<string> {
  return useSyncExternalStore(favorieten.abonneer, favorieten.alle, favorieten.alle);
}
