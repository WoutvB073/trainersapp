import type { Tekening } from '../model/types';

/**
 * Controle op de vaste rugnummers (0.35.0) voor een bord met beide teams; gebruikt door de tests en door `tools/nummers-audit.mjs`
 * (niet door de app zelf). Op een heel veld moet elk nummer op zijn vaste kant staan, gezien vanaf het eigen doel:
 * 5 – 4 – 3 – 2 van links naar rechts, de 8 links van de 10 en (als ze in dezelfde linie spelen) links van de 6, de 11 links van de 7.
 * Op een half veld (spelhervattingen) staan spelers op hun plek voor die situatie; daar tellen alleen dubbele nummers.
 */
const LINKS_VAN: [number, number][] = [
  [5, 4],
  [4, 3],
  [3, 2],
  [5, 3],
  [5, 2],
  [4, 2],
  [8, 6],
  [8, 10],
  [11, 7],
];

export function nummerFouten(tekening: Tekening): string[] {
  const fouten: string[] = [];
  const heel = tekening.veld.type === 'heel' || (tekening.veld.lengte ?? 0) > 60;
  const B = tekening.veld.breedte ?? 68;
  for (const team of ['A', 'B'] as const) {
    const spelers = tekening.objecten.filter((o) => o.soort === 'speler' && o.team === team);
    const nrs = spelers.map((s) => s.nummer);
    const dubbel = nrs.filter((n, i) => nrs.indexOf(n) !== i);
    if (dubbel.length) fouten.push(`${team}: dubbel nummer ${[...new Set(dubbel)].join(', ')}`);
    if (!heel) continue;
    // Team A valt naar boven aan (links = kleine x); team B naar beneden (links = grote x).
    const eigen = (x: number) => (team === 'A' ? x : B - x);
    const op = new Map(spelers.map((s) => [s.nummer, s]));
    for (const [links, rechts] of LINKS_VAN) {
      const l = op.get(links);
      const r = op.get(rechts);
      if (!l || !r) continue;
      // De 8 en de 6 alleen vergelijken als ze naast elkaar spelen; een diepe 6 staat vaak recht achter de 8.
      if (links === 8 && rechts === 6 && Math.abs(l.y - r.y) > 5) continue;
      if (eigen(l.x) > eigen(r.x) + 0.5) fouten.push(`${team}: ${links} staat rechts van ${rechts}`);
    }
  }
  return fouten;
}
