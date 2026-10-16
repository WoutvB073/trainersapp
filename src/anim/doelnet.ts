import type { Punt, VeldObject } from '../model/types';

/**
 * Doelnet (schotnet): een doek dat in een goal hangt in plaats van een keeper, met in elke hoek een gat. Een schot in een
 * gat gaat erdoor (in het goal); anders kaatst de bal terug van het net. Gedeeld door editor, animatie en 2D/3D.
 */

export const DOELNET_KLEUR = '#f2b705';

/** Afmetingen van een goal (zoals de renderers ze tekenen). */
export function goalMaten(g: VeldObject): { B: number; H: number; D: number } {
  const groot = g.soort === 'goal';
  return { B: g.breedte ?? (groot ? 7.32 : 3), H: g.hoogte ?? (groot ? 2.44 : 1), D: g.lengte ?? (groot ? 2 : 1.2) };
}

/** Maat van een doelnet: die van zijn goal (gekopieerd bij het koppelen), anders een groot goal. */
export const netMaten = (n: VeldObject) => ({ B: n.breedte ?? 7.32, H: n.hoogte ?? 2.44 });

export interface Gat {
  /** Plek langs de doellijn (eigen assen van het goal, 0 = midden). */
  x: number;
  /** Hoogte van het midden van het gat. */
  h: number;
  r: number;
  rij: 'laag' | 'hoog';
}

/** De vier gaten: in elke hoek één (laag en hoog, links en rechts). */
export function doelnetGaten(B: number, H: number): Gat[] {
  const r = Math.max(0.16, Math.min(0.34, B * 0.045));
  const x = B / 2 - r - 0.14;
  const laag = r + 0.12;
  const hoog = Math.max(laag + 2 * r + 0.1, H - r - 0.14);
  return [
    { x: -x, h: laag, r, rij: 'laag' },
    { x, h: laag, r, rij: 'laag' },
    { x: -x, h: hoog, r, rij: 'hoog' },
    { x, h: hoog, r, rij: 'hoog' },
  ];
}

const isGoal = (o: VeldObject) => o.soort === 'goal' || o.soort === 'klein-goal';

/** Dichtstbijzijnde goal zonder ander doelnet (binnen `max` meter). */
export function vrijGoal(objecten: VeldObject[], p: Punt, behalve?: string, max = Infinity): VeldObject | undefined {
  const bezet = new Set(objecten.filter((o) => o.soort === 'doelnet' && o.id !== behalve && o.doel).map((o) => o.doel!));
  let beste: VeldObject | undefined;
  let d = max;
  for (const g of objecten) {
    if (!isGoal(g) || bezet.has(g.id)) continue;
    const a = Math.hypot(g.x - p[0], g.y - p[1]);
    if (a < d) {
      d = a;
      beste = g;
    }
  }
  return beste;
}

/**
 * Doelnetten aan hun goal vastmaken: zelfde plek, draaiing, breedte en hoogte. Een net zonder (bestaand) goal pakt het
 * dichtstbijzijnde vrije goal binnen 4 m; anders blijft het los staan.
 */
export function koppelDoelnetten(objecten: VeldObject[]): VeldObject[] {
  if (!objecten.some((o) => o.soort === 'doelnet')) return objecten;
  let uit = objecten;
  for (const n of objecten) {
    if (n.soort !== 'doelnet') continue;
    const huidig = uit.find((o) => o.id === n.id)!;
    let g = huidig.doel ? uit.find((o) => o.id === huidig.doel && isGoal(o)) : undefined;
    g ??= vrijGoal(uit, [huidig.x, huidig.y], huidig.id, 4);
    let nieuw: VeldObject;
    if (g) {
      const { B, H } = goalMaten(g);
      nieuw = { ...huidig, doel: g.id, x: g.x, y: g.y, hoek: g.hoek ?? 0, breedte: B, hoogte: H };
    } else {
      const { doel: _d, ...los } = huidig;
      void _d;
      nieuw = los;
    }
    if (JSON.stringify(nieuw) !== JSON.stringify(huidig)) uit = uit.map((o) => (o.id === n.id ? nieuw : o));
  }
  return uit;
}

/** Het doelnet dat in dit goal hangt. */
export const netVan = (objecten: VeldObject[], goal: VeldObject) => objecten.find((o) => o.soort === 'doelnet' && o.doel === goal.id);
