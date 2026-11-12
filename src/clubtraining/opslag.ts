import { useSyncExternalStore } from 'react';
import { sleutelVoor } from '../engine/account';
import { apparaatLijst, LijstStore } from '../wedstrijd/opslag';
import { isLeeg, type ClubTraining } from './clubtraining';
import type { RoosterTrainer } from './rooster';

/** Clubtrainingen: op het apparaat, ingelogd onder de sleutels van het account (en dan ook online, zie src/online/sync.ts). */

function lokaleOpslag(): Pick<Storage, 'getItem' | 'setItem'> | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

export const clubBackend = (uid: string | null) => apparaatLijst<ClubTraining>(lokaleOpslag(), sleutelVoor('clubtrainingen', uid));

export const clubtrainingen = new LijstStore<ClubTraining>(apparaatLijst(lokaleOpslag(), sleutelVoor('clubtrainingen')));

/** Trainersrooster (0.34.0): synchroniseert mee, net als de clubtrainingen. */
export const roosterBackend = (uid: string | null) => apparaatLijst<RoosterTrainer>(lokaleOpslag(), sleutelVoor('rooster', uid));
export const rooster = new LijstStore<RoosterTrainer>(apparaatLijst(lokaleOpslag(), sleutelVoor('rooster')));
export const useRooster = () => useSyncExternalStore(rooster.abonneer, rooster.lijst, rooster.lijst);

export const useClubtrainingen = () => useSyncExternalStore(clubtrainingen.abonneer, clubtrainingen.lijst, clubtrainingen.lijst);

/** Eigen sjablonen staan in dezelfde lijst (zo synchroniseren ze mee), maar horen niet bij de trainingen. */
export const sjablonen = (lijst: ClubTraining[]) => lijst.filter((c) => c.sjabloon);
export const echteClubs = (lijst: ClubTraining[]) => lijst.filter((c) => !c.sjabloon);

export function useClub(id: string): ClubTraining | undefined {
  return useClubtrainingen().find((c) => c.id === id);
}

/** Lege clubtrainingen weghalen, behalve die je nu open hebt. */
export function ruimLegeClubsOp(behalve?: string): void {
  for (const c of clubtrainingen.lijst()) if (c.id !== behalve && isLeeg(c)) clubtrainingen.verwijder(c.id);
}
