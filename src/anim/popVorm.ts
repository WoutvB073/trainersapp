import { LatheGeometry, Vector2, type BufferGeometry } from 'three';

/** Maten en vormen van de 3D-poppetjes, gedeeld door de gewone (poppetje.ts) en de realistische figuur (popEcht.ts). */

// ---------- maten (meter) ----------

export const MAAT = {
  enkel: 0.08,
  scheen: 0.43,
  dij: 0.44,
  heupX: 0.09,
  /** Heupgewricht bij gestrekte benen. */
  heup: 0.95,
  rompY: 0.06,
  schouderX: 0.185,
  schouderY: 0.43,
  bovenarm: 0.29,
  onderarm: 0.25,
  nekY: 0.44,
  hoofdY: 0.09,
  /** Midden van het hoofd boven het hoofdgewricht. */
  hoofdMidden: 0.1,
} as const;

const klem = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const glad = (x: number) => {
  x = klem(x);
  return x * x * (3 - 2 * x);
};
const mix = (a: number, b: number, u: number) => a + (b - a) * u;

/**
 * Ronde vorm om de y-as (LatheGeometry), van boven (u = 0) naar onder (u = 1), met afgeronde uiteinden.
 * `straal(u)` geeft de dikte; zo krijgen dij, kuit en onderarm een natuurlijk verloop.
 */
export function rond(yBoven: number, yOnder: number, straal: (u: number) => number, n: number, seg: number, kap = 4): BufferGeometry {
  const pts: Vector2[] = [];
  const rB = straal(0);
  const rO = straal(1);
  for (let i = 0; i <= kap; i++) {
    const a = ((i / kap) * Math.PI) / 2;
    pts.push(new Vector2(Math.max(1e-4, Math.sin(a) * rO), yOnder - Math.cos(a) * rO * 0.8));
  }
  for (let i = n - 1; i >= 1; i--) {
    const u = i / n;
    pts.push(new Vector2(straal(u), yBoven + (yOnder - yBoven) * u));
  }
  for (let i = kap; i >= 0; i--) {
    const a = ((i / kap) * Math.PI) / 2;
    pts.push(new Vector2(Math.max(1e-4, Math.sin(a) * rB), yBoven + Math.cos(a) * rB * 0.8));
  }
  return new LatheGeometry(pts, seg);
}

/** Vloeiend tussen steunpunten [u, straal]. */
export const verloop = (punten: [number, number][]) => (u: number) => {
  for (let i = 1; i < punten.length; i++) {
    const [u1, r1] = punten[i]!;
    const [u0, r0] = punten[i - 1]!;
    if (u <= u1) return mix(r0, r1, glad((u - u0) / Math.max(1e-6, u1 - u0)));
  }
  return punten[punten.length - 1]![1];
};
