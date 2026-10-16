import { useSyncExternalStore } from 'react';
import type { EigenOefening, Oefening } from '../model/types';
import type { GedeeldeTraining } from '../training/training';
import { geldigeEigen } from '../eigen/eigen';
import { sleutelVoor } from './account';

/**
 * Teams waar je lid van bent, met leden en gedeelde items: een lokale kopie (per account), zodat gedeelde oefeningen ook
 * offline in de bibliotheek staan en in trainingen werken. De online-module houdt hem bij (src/online/online.ts).
 */
export type Rol = 'beheerder' | 'lid';

export interface TeamLid {
  uid: string;
  naam: string;
  rol: Rol;
  sinds: number;
}

export interface TeamItem {
  id: string;
  soort: 'oefening' | 'training';
  naam: string;
  /** JSON: een oefening (zoals voorDelen), of { training, eigen } voor een training. */
  data: string;
  eigenaar: string;
  eigenaarNaam: string;
  gewijzigd: number;
}

export interface Team {
  id: string;
  naam: string;
  code: string;
  maker: string;
  /** Mijn rol in dit team. */
  rol: Rol;
  leden: TeamLid[];
  items: TeamItem[];
}

/** Een gedeelde training: de training zelf plus de eigen oefeningen die erin zitten (zoals bij een deellink). */
export interface TeamTraining {
  training: GedeeldeTraining;
  eigen: Oefening[];
}

export const teamOefeningId = (team: string, item: string) => `team-${team}-${item}`;
export const isTeamId = (id: string) => id.startsWith('team-');

type Opslagplek = Pick<Storage, 'getItem' | 'setItem'>;
function opslag(): Opslagplek | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

class TeamCache {
  private lijstNu: Team[];
  private luisteraars = new Set<() => void>();
  private sleutel: string | null;

  constructor(uid: string | null) {
    this.sleutel = uid ? sleutelVoor('teams', uid) : null;
    this.lijstNu = this.laad();
  }

  private laad(): Team[] {
    if (!this.sleutel) return [];
    try {
      const x = JSON.parse(opslag()?.getItem(this.sleutel) ?? '[]') as Team[];
      return Array.isArray(x) ? x : [];
    } catch {
      return [];
    }
  }

  lijst = (): Team[] => this.lijstNu;

  haal(id: string): Team | undefined {
    return this.lijstNu.find((t) => t.id === id);
  }

  /** Ander account (of uitgelogd: geen teams). */
  wisselAccount(uid: string | null): void {
    this.sleutel = uid ? sleutelVoor('teams', uid) : null;
    this.lijstNu = this.laad();
    this.melden();
  }

  zet(lijst: Team[]): void {
    this.lijstNu = lijst;
    if (this.sleutel) {
      try {
        opslag()?.setItem(this.sleutel, JSON.stringify(lijst));
      } catch {
        /* vol */
      }
    }
    this.melden();
  }

  abonneer = (cb: () => void): (() => void) => {
    this.luisteraars.add(cb);
    return () => this.luisteraars.delete(cb);
  };

  private melden() {
    oefeningCache = null;
    for (const cb of this.luisteraars) cb();
  }
}

function startUid(): string | null {
  try {
    const a = JSON.parse(opslag()?.getItem('trainersapp.account') ?? 'null') as { uid?: string } | null;
    return a?.uid ?? null;
  } catch {
    return null;
  }
}

export const teams = new TeamCache(startUid());

export function useTeams(): Team[] {
  return useSyncExternalStore(teams.abonneer, teams.lijst, teams.lijst);
}

export function useTeam(id: string): Team | undefined {
  return useTeams().find((t) => t.id === id);
}

// ---------- gedeelde oefeningen in de bibliotheek ----------

let oefeningCache: Oefening[] | null = null;

/** Gedeelde oefeningen uit al je teams, als gewone oefeningen (met teamnaam). */
export function teamOefeningen(): Oefening[] {
  if (oefeningCache) return oefeningCache;
  const uit: Oefening[] = [];
  for (const t of teams.lijst()) {
    for (const it of t.items) {
      if (it.soort !== 'oefening') continue;
      try {
        const o = JSON.parse(it.data) as Oefening;
        if (!geldigeEigen(o)) continue;
        uit.push({ ...o, id: teamOefeningId(t.id, it.id), eigen: undefined, team: { id: t.id, naam: t.naam, itemId: it.id, eigenaar: it.eigenaar, eigenaarNaam: it.eigenaarNaam } });
      } catch {
        /* kapot item: overslaan */
      }
    }
  }
  oefeningCache = uit;
  return uit;
}

export function vindTeamOefening(id: string): Oefening | undefined {
  return isTeamId(id) ? teamOefeningen().find((o) => o.id === id) : undefined;
}

/** Gedeelde training lezen (null als het item kapot is). */
export function leesTeamTraining(it: TeamItem): TeamTraining | null {
  try {
    const x = JSON.parse(it.data) as TeamTraining;
    if (!x?.training || !Array.isArray(x.training.oefeningen)) return null;
    return { training: x.training, eigen: Array.isArray(x.eigen) ? x.eigen.filter(geldigeEigen) : [] };
  } catch {
    return null;
  }
}

/** Is deze eigen oefening door mij gedeeld in een team? (Voor "Gedeeld met …" op de detailpagina.) */
export function gedeeldIn(o: Pick<EigenOefening, 'id'>, uid: string | undefined): Team[] {
  if (!uid) return [];
  return teams.lijst().filter((t) => t.items.some((it) => it.id === o.id && it.eigenaar === uid));
}
