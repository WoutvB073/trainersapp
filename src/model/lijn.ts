import type { Lijn, Punt } from './types';

/**
 * De punten waarlangs een getekende lijn loopt. Een begin of eind dat vastzit aan een object volgt dat object
 * (`plek` geeft de huidige plek van een object). Met een buigpunt wordt het een vloeiende boog door dat punt.
 */
export function lijnPunten(l: Lijn, plek: (id: string) => Punt | undefined = () => undefined): Punt[] {
  if (l.punten.length < 2) return l.punten;
  const a = (l.van && plek(l.van)) || l.punten[0]!;
  const b = (l.naar && plek(l.naar)) || l.punten[l.punten.length - 1]!;
  if (l.bocht) {
    // Kwadratische boog die op de helft precies door het buigpunt gaat.
    const c: Punt = [2 * l.bocht[0] - (a[0] + b[0]) / 2, 2 * l.bocht[1] - (a[1] + b[1]) / 2];
    const n = 24;
    const uit: Punt[] = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const v = 1 - u;
      uit.push([v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]]);
    }
    return uit;
  }
  return [a, ...l.punten.slice(1, -1), b];
}

/** Midden van een lijn (waar het buigpunt-handvat staat). */
export function lijnMidden(l: Lijn, plek?: (id: string) => Punt | undefined): Punt {
  if (l.bocht) return l.bocht;
  const p = lijnPunten(l, plek);
  const a = p[0]!;
  const b = p[p.length - 1]!;
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}
