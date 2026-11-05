import { vindOefening } from '../data/oefeningen';
import { isTeamId, teamOefeningen } from '../engine/teams';
import type { Oefening } from '../model/types';
import { voorDelen } from './eigen';
import { eigenOefeningen } from './opslag';

/**
 * Wat je deelt (link of team) kan oefeningen bevatten die de ontvanger niet heeft: je eigen oefeningen en oefeningen uit een
 * team. Die gaan als kopie mee. Geef `team` mee als je met dat team deelt: oefeningen uit dat team hebben de leden al.
 */
export function meeTeNemen(ids: readonly string[], team?: string): { eigen: Oefening[]; nieuwId: (id: string) => string } {
  const eigen: Oefening[] = [];
  const nieuw = new Map<string, string>();
  for (const id of new Set(ids)) {
    const eo = eigenOefeningen.haal(id);
    if (eo) {
      eigen.push(voorDelen(eo));
      continue;
    }
    if (!isTeamId(id) || (team && id.startsWith(`team-${team}-`))) continue;
    const o = teamOefeningen().find((x) => x.id === id) ?? vindOefening(id);
    if (!o?.team) continue;
    const { team: bron, ...rest } = o;
    eigen.push({ ...rest, id: bron.itemId, eigen: true });
    nieuw.set(id, bron.itemId);
  }
  return { eigen, nieuwId: (id) => nieuw.get(id) ?? id };
}
