import {
  BufferGeometry,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  DynamicDrawUsage,
  Euler,
  InstancedBufferAttribute,
  InstancedMesh,
  LatheGeometry,
  Material,
  Matrix4,
  MeshLambertMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three';
import type { Manier } from '../model/types';
import { PASJES, RITME, type ObjectStand, type Stand } from './timeline';

/**
 * 3D-poppetjes (0.21.0): een eigen figuur in code met echte lichaamsverhoudingen en gewrichten (heupen, knieën,
 * enkels, schouders, ellebogen, nek). De houding wordt elk beeld uitgerekend uit de stand van de tijdlijn:
 * voeten krijgen een doelplek (op de grond tijdens het steunen, dus geen schuivende voeten) en de benen worden daar
 * met inverse kinematica (IK) naartoe gebogen; armen idem naar de bal (vasthouden, vangen, gooien).
 *
 * Tekenen gaat met InstancedMesh: één tekenopdracht per lichaamsdeel voor álle poppetjes samen (gedeelde geometrie),
 * met een fijne en een grove versie (grof op afstand, en bij "Eenvoudige poppetjes").
 *
 * Assen van een poppetje: +z = voorkant (kijkrichting), +x = zijn linkerkant, +y = omhoog. Index 0 = rechts, 1 = links.
 */

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
const BEEN = MAAT.dij + MAAT.scheen;
/** Straal van de bal in 3D (iets groter dan echt, 0,11 m, zodat hij goed te zien is). */
export const BAL_R = 0.14;
/** Bovenkant van het hoofd bij rechtop staan. */
export const LENGTE = MAAT.heup + MAAT.rompY + MAAT.nekY + MAAT.hoofdY + MAAT.hoofdMidden + 0.11;

const klem = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const glad = (x: number) => {
  x = klem(x);
  return x * x * (3 - 2 * x);
};
const mix = (a: number, b: number, u: number) => a + (b - a) * u;
/** Bobbel 0 → 1 → 0 met de top op `piek`. */
const bobbel = (q: number, piek = 0.5) => Math.sin(Math.PI * (q < piek ? (0.5 * q) / piek : 0.5 + (0.5 * (q - piek)) / (1 - piek)));
/** 0 → 1 → 1 → 0: opbouwen tot a, vol tot b, afbouwen tot 1. */
const venster = (u: number, a: number, b: number) => (u <= 0 || u >= 1 ? 0 : u < a ? glad(u / a) : u > b ? 1 - glad((u - b) / (1 - b)) : 1);

// ---------- skelet ----------

export interface Skelet {
  wortel: Object3D;
  bekken: Object3D;
  romp: Object3D;
  nek: Object3D;
  hoofd: Object3D;
  schouder: [Object3D, Object3D];
  elleboog: [Object3D, Object3D];
  pols: [Object3D, Object3D];
  heup: [Object3D, Object3D];
  knie: [Object3D, Object3D];
  enkel: [Object3D, Object3D];
}

const kant = (i: number) => (i === 0 ? -1 : 1);

export function maakSkelet(): Skelet {
  const n = () => new Object3D();
  const sk: Skelet = {
    wortel: n(),
    bekken: n(),
    romp: n(),
    nek: n(),
    hoofd: n(),
    schouder: [n(), n()],
    elleboog: [n(), n()],
    pols: [n(), n()],
    heup: [n(), n()],
    knie: [n(), n()],
    enkel: [n(), n()],
  };
  sk.bekken.position.set(0, MAAT.heup, 0);
  sk.wortel.add(sk.bekken);
  sk.romp.position.set(0, MAAT.rompY, 0);
  sk.bekken.add(sk.romp);
  sk.nek.position.set(0, MAAT.nekY, 0);
  sk.romp.add(sk.nek);
  sk.hoofd.position.set(0, MAAT.hoofdY, 0);
  sk.nek.add(sk.hoofd);
  for (const i of [0, 1] as const) {
    sk.schouder[i].position.set(kant(i) * MAAT.schouderX, MAAT.schouderY, 0);
    sk.romp.add(sk.schouder[i]);
    sk.elleboog[i].position.set(0, -MAAT.bovenarm, 0);
    sk.schouder[i].add(sk.elleboog[i]);
    sk.pols[i].position.set(0, -MAAT.onderarm, 0);
    sk.elleboog[i].add(sk.pols[i]);
    sk.heup[i].position.set(kant(i) * MAAT.heupX, 0, 0);
    sk.bekken.add(sk.heup[i]);
    sk.knie[i].position.set(0, -MAAT.dij, 0);
    sk.heup[i].add(sk.knie[i]);
    sk.enkel[i].position.set(0, -MAAT.scheen, 0);
    sk.knie[i].add(sk.enkel[i]);
  }
  return sk;
}

// ---------- geometrie ----------

/**
 * Ronde vorm om de y-as (LatheGeometry), van boven (u = 0) naar onder (u = 1), met afgeronde uiteinden.
 * `straal(u)` geeft de dikte; zo krijgen dij, kuit en onderarm een natuurlijk verloop.
 */
function rond(yBoven: number, yOnder: number, straal: (u: number) => number, n: number, seg: number, kap = 4): BufferGeometry {
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
const verloop = (punten: [number, number][]) => (u: number) => {
  for (let i = 1; i < punten.length; i++) {
    const [u1, r1] = punten[i]!;
    const [u0, r0] = punten[i - 1]!;
    if (u <= u1) return mix(r0, r1, glad((u - u0) / Math.max(1e-6, u1 - u0)));
  }
  return punten[punten.length - 1]![1];
};

export type DeelNaam =
  | 'bekken'
  | 'romp'
  | 'nek'
  | 'hoofd'
  | 'haar'
  | 'mouw'
  | 'bovenarm'
  | 'onderarm'
  | 'hand'
  | 'pijp'
  | 'dij'
  | 'kous'
  | 'schoen';

/** Geometrie per lichaamsdeel, in het assenstelsel van het gewricht waar het aan vastzit. `fijn` = veel detail. */
function deelGeometrie(naam: DeelNaam, fijn: boolean): BufferGeometry {
  const s = fijn ? 14 : 6; // rondom
  const n = fijn ? 8 : 3; // in de lengte
  const k = fijn ? 4 : 2; // afronding
  switch (naam) {
    case 'bekken': {
      const g = rond(0.09, -0.12, verloop([[0, 0.14], [0.35, 0.16], [1, 0.155]]), n, s, k);
      return g.scale(1, 1, 0.72);
    }
    case 'romp': {
      // Taille smal, borst en schouders breder (V-vorm), van opzij plat.
      const g = rond(0.45, -0.07, verloop([[0, 0.06], [0.1, 0.15], [0.22, 0.172], [0.42, 0.168], [0.7, 0.14], [1, 0.145]]), fijn ? 12 : 4, s, k);
      return g.scale(1, 1, 0.62);
    }
    case 'nek':
      return new CylinderGeometry(0.047, 0.052, 0.14, fijn ? 10 : 5).translate(0, 0.04, 0);
    case 'hoofd':
      return new SphereGeometry(0.1, fijn ? 16 : 7, fijn ? 12 : 5).scale(0.88, 1.08, 0.98).translate(0, MAAT.hoofdMidden, 0.012);
    case 'haar': {
      // Kapje over boven- en achterkant (het gezicht blijft vrij, zo zie je de kijkrichting).
      const g = new SphereGeometry(0.106, fijn ? 16 : 7, fijn ? 8 : 4, 0, Math.PI * 2, 0, Math.PI * 0.52);
      g.rotateX(-0.42);
      return g.scale(0.9, 1.06, 1.0).translate(0, MAAT.hoofdMidden + 0.008, 0.006);
    }
    case 'mouw':
      return rond(0.03, -0.15, verloop([[0, 0.066], [1, 0.056]]), n > 3 ? 4 : 2, s, k);
    case 'bovenarm':
      return rond(0, -MAAT.bovenarm, verloop([[0, 0.047], [0.3, 0.046], [1, 0.037]]), n, s, k);
    case 'onderarm':
      return rond(0, -MAAT.onderarm, verloop([[0, 0.038], [0.25, 0.039], [1, 0.027]]), n, s, k);
    case 'hand':
      return new SphereGeometry(0.045, fijn ? 10 : 5, fijn ? 8 : 4).scale(0.72, 1.35, 0.5).translate(0, -0.052, 0.005);
    case 'pijp':
      return rond(0.04, -0.2, verloop([[0, 0.092], [1, 0.087]]), n > 3 ? 4 : 2, s, k);
    case 'dij':
      return rond(0.02, -MAAT.dij - 0.01, verloop([[0, 0.078], [0.45, 0.071], [0.85, 0.056], [1, 0.05]]), n, s, k);
    case 'kous':
      // Kous over het onderbeen, met kuit; de knie blijft bloot.
      return rond(-0.07, -MAAT.scheen + 0.01, verloop([[0, 0.05], [0.25, 0.058], [0.75, 0.04], [1, 0.036]]), n, s, k);
    case 'schoen': {
      const g = new CapsuleGeometry(0.046, 0.15, fijn ? 4 : 2, fijn ? 10 : 6);
      g.rotateX(Math.PI / 2);
      return g.scale(0.95, 0.82, 1).translate(0, -0.042, 0.052);
    }
  }
}

/** Welke kleur een deel krijgt. */
type KleurSoort = 'shirt' | 'broek' | 'kous' | 'huid' | 'haar' | 'schoen' | 'mouw' | 'hand';

interface DeelDef {
  naam: DeelNaam;
  node: (sk: Skelet) => Object3D;
  kleur: KleurSoort;
  /** Ook bij eenvoudige poppetjes. */
  eenvoudig: boolean;
}

const DELEN: DeelDef[] = [
  { naam: 'bekken', node: (s) => s.bekken, kleur: 'broek', eenvoudig: true },
  { naam: 'romp', node: (s) => s.romp, kleur: 'shirt', eenvoudig: true },
  { naam: 'nek', node: (s) => s.nek, kleur: 'huid', eenvoudig: false },
  { naam: 'hoofd', node: (s) => s.hoofd, kleur: 'huid', eenvoudig: true },
  { naam: 'haar', node: (s) => s.hoofd, kleur: 'haar', eenvoudig: false },
  ...([0, 1] as const).flatMap((i): DeelDef[] => [
    { naam: 'mouw', node: (s) => s.schouder[i], kleur: 'shirt', eenvoudig: false },
    { naam: 'bovenarm', node: (s) => s.schouder[i], kleur: 'mouw', eenvoudig: true },
    { naam: 'onderarm', node: (s) => s.elleboog[i], kleur: 'mouw', eenvoudig: true },
    { naam: 'hand', node: (s) => s.pols[i], kleur: 'hand', eenvoudig: false },
    { naam: 'pijp', node: (s) => s.heup[i], kleur: 'broek', eenvoudig: false },
    { naam: 'dij', node: (s) => s.heup[i], kleur: 'huid', eenvoudig: true },
    { naam: 'kous', node: (s) => s.knie[i], kleur: 'kous', eenvoudig: true },
    { naam: 'schoen', node: (s) => s.enkel[i], kleur: 'schoen', eenvoudig: true },
  ]),
];

const HAAR = ['#2a1b12', '#3b2416', '#5a3a22', '#141414', '#7a5230', '#b48a55', '#2a1b12', '#4a2f1b'];
const HUID = ['#f0c7a4', '#e3b08c', '#d29b74', '#b97c56', '#8c5a3c', '#e8b996'];
const SCHOEN = '#1b1d21';
const BROEK = '#1f2933';
const HANDSCHOEN = '#eef2f0';

export interface PopKleuren {
  shirt: Color;
  broek: Color;
  kous: Color;
  huid: Color;
  haar: Color;
  schoen: Color;
  mouw: Color;
  hand: Color;
}

/** Kleuren van een poppetje: hesje, broek, kousen, huid en haar (per persoon vast, uit de id). */
export function popKleuren(soort: 'speler' | 'keeper' | 'trainer', shirt: string, zaad: number): PopKleuren {
  const s = new Color(shirt);
  const huid = new Color(HUID[Math.floor(zaad * 7919) % HUID.length]!);
  const trainer = soort === 'trainer';
  const keeper = soort === 'keeper';
  // Trainer in trainingspak (lange mouwen en broek), keeper met lange mouwen en handschoenen.
  const broek = new Color(trainer ? '#2c3440' : BROEK);
  return {
    shirt: s,
    broek,
    kous: trainer ? broek.clone() : s.clone().multiplyScalar(0.55),
    huid: trainer ? broek.clone() : huid,
    haar: new Color(HAAR[Math.floor(zaad * 104729) % HAAR.length]!),
    schoen: new Color(SCHOEN),
    mouw: trainer || keeper ? s.clone() : huid.clone(),
    hand: keeper ? new Color(HANDSCHOEN) : huid.clone(),
  };
}

/** Wisselt het hesje (tikspel): shirt en kousen in de nieuwe kleur. */
export function zetHesje(k: PopKleuren, soort: 'speler' | 'keeper' | 'trainer', shirt: string) {
  k.shirt.set(shirt);
  if (soort !== 'trainer') k.kous.set(shirt).multiplyScalar(0.55);
  if (soort !== 'speler') k.mouw.set(shirt);
}

// Dij van de trainer: broekkleur (lange broek); bij spelers de huid.
const kleurVan = (k: PopKleuren, d: DeelDef): Color => k[d.kleur];

/**
 * Alle poppetjes van een scène, getekend met InstancedMesh: per lichaamsdeel en detailniveau één mesh met een plek
 * per poppetje. Elk beeld schrijven we de matrices (en kleuren) van de gewrichten erin.
 */
export class Poppetjes {
  private readonly meshes = new Map<string, InstancedMesh>();
  private readonly tellers = new Map<string, number>();
  readonly materiaal: Material;
  private readonly m = new Matrix4();

  constructor(
    aantal: number,
    readonly eenvoudig: boolean,
  ) {
    // Eén materiaal voor alles; de kleur komt per instantie.
    this.materiaal = new MeshLambertMaterial({ color: '#ffffff' });
    const perDeel = new Map<DeelNaam, number>();
    for (const d of DELEN) perDeel.set(d.naam, (perDeel.get(d.naam) ?? 0) + 1);
    for (const [naam, keer] of perDeel) {
      for (const fijn of eenvoudig ? [false] : [true, false]) {
        if (eenvoudig && !DELEN.find((d) => d.naam === naam)!.eenvoudig) continue;
        const mesh = new InstancedMesh(deelGeometrie(naam, fijn), this.materiaal, Math.max(1, aantal * keer));
        mesh.instanceMatrix.setUsage(DynamicDrawUsage);
        mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(Math.max(1, aantal * keer) * 3), 3);
        mesh.instanceColor.setUsage(DynamicDrawUsage);
        mesh.count = 0;
        // De poppetjes bewegen over het hele veld: niet wegknippen op de (oude) omhullende bol.
        mesh.frustumCulled = false;
        this.meshes.set(`${naam}|${fijn ? 'f' : 'g'}`, mesh);
      }
    }
  }

  /** Alle meshes (om aan de scène toe te voegen en op te ruimen). */
  get lijst(): InstancedMesh[] {
    return [...this.meshes.values()];
  }

  begin() {
    for (const k of this.meshes.keys()) this.tellers.set(k, 0);
  }

  /** Eén poppetje tekenen (na het poseren): fijn of grof. */
  teken(sk: Skelet, k: PopKleuren, fijn: boolean) {
    const f = fijn && !this.eenvoudig;
    for (const d of DELEN) {
      if (this.eenvoudig && !d.eenvoudig) continue;
      const sleutel = `${d.naam}|${f ? 'f' : 'g'}`;
      const mesh = this.meshes.get(sleutel);
      if (!mesh) continue;
      const i = this.tellers.get(sleutel)!;
      if (i >= mesh.instanceMatrix.count) continue;
      this.m.copy(d.node(sk).matrixWorld);
      mesh.setMatrixAt(i, this.m);
      // Eenvoudig: geen aparte mouw; de bovenarm is dan in shirtkleur.
      mesh.setColorAt(i, this.eenvoudig && d.naam === 'bovenarm' ? k.shirt : kleurVan(k, d));
      this.tellers.set(sleutel, i + 1);
    }
  }

  klaar() {
    for (const [sleutel, mesh] of this.meshes) {
      mesh.count = this.tellers.get(sleutel) ?? 0;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }

  opruimen() {
    for (const mesh of this.meshes.values()) {
      mesh.geometry.dispose();
      mesh.dispose();
    }
    this.materiaal.dispose();
  }
}

// ---------- inverse kinematica ----------

const _n = new Vector3();
const _p = new Vector3();
const _u = new Vector3();
const _bx = new Vector3();
const _by = new Vector3();
const _bz = new Vector3();
const _bm = new Matrix4();

/**
 * Ledemaat van twee delen (dij + scheen, of boven- + onderarm) naar een doel. Geeft de draaiing van het bovenste
 * gewricht (`uitQ`, in het assenstelsel van zijn ouder) en de buighoek van het middelste gewricht (rotatie om x).
 * `pool` = kant waar het middelste gewricht naartoe wijst (knie: naar voren, elleboog: naar achteren);
 * teken +1 = knie (het onderbeen buigt naar achteren), −1 = elleboog (de onderarm buigt naar voren).
 */
export function ik(oorsprong: Vector3, doel: Vector3, l1: number, l2: number, pool: Vector3, teken: 1 | -1, uitQ: Quaternion, maxBuig = 2.65): number {
  _n.subVectors(doel, oorsprong);
  let r = _n.length();
  if (r < 1e-6) _n.set(0, -1, 0);
  else _n.multiplyScalar(1 / r);
  // Niet verder dubbelvouwen dan een knie of elleboog kan (maxBuig).
  const rMin = Math.sqrt(l1 * l1 + l2 * l2 - 2 * l1 * l2 * Math.cos(Math.PI - maxBuig));
  r = klem(r, Math.max(Math.abs(l1 - l2) + 1e-3, rMin), (l1 + l2) * 0.9999);
  const cosA = klem((l1 * l1 + r * r - l2 * l2) / (2 * l1 * r), -1, 1);
  const sinA = Math.sqrt(1 - cosA * cosA);
  _p.copy(pool).addScaledVector(_n, -pool.dot(_n));
  if (_p.lengthSq() < 1e-8) {
    _p.set(0, 0, 1).addScaledVector(_n, -_n.z);
    if (_p.lengthSq() < 1e-8) _p.set(1, 0, 0);
  }
  _p.normalize();
  _u.copy(_n).multiplyScalar(cosA).addScaledVector(_p, sinA);
  const cosB = klem((l1 * l1 + l2 * l2 - r * r) / (2 * l1 * l2), -1, 1);
  const buig = Math.PI - Math.acos(cosB);
  _by.copy(_u).negate();
  _bz.copy(_p).addScaledVector(_u, -_p.dot(_u)).normalize().multiplyScalar(teken);
  _bx.crossVectors(_by, _bz);
  _bm.makeBasis(_bx, _by, _bz);
  uitQ.setFromRotationMatrix(_bm);
  return teken * buig;
}

// ---------- loopstijl ----------

interface Stijl {
  /** Eigen pasritme: cycli (twee passen) per seconde = f0 + f1·snelheid. Zonder: het ritme van de tijdlijn (pasjes). */
  ritme?: [number, number];
  /** Deel van de cyclus dat een voet steunt. */
  D: number;
  /** Grootste afstand die een steunende voet onder het lijf door gaat. */
  Smax: number;
  /** Halve spreiding van de voeten. */
  breed: number;
  /** Hoe hoog de zwaaivoet komt, en wanneer (0–1 van de zwaai). */
  til: number;
  piek: number;
  /** Knie naar voren (+, knieheffen) of hiel naar achteren (−, hakken richting billen) op de top van de zwaai. */
  knie: number;
  /** Op de voorvoet (hiel van de grond, radialen). */
  tenen: number;
  /** Heupen lager bij volle snelheid (door de knieën). */
  zak: number;
  /** Kniebuiging (radialen) van het steunbeen bij volle snelheid. */
  buig: number;
  /** Sprongetje als beide voeten los zijn. */
  veer: number;
  voorover: number;
  arm: number;
  armBasis: number;
  elleboog: number;
  opzij: number;
  /** Snelheid waarbij de stijl "vol" is. */
  vol: number;
  /** Armen omhoog zwaaien (huppelen). */
  armHoog?: boolean;
  /** Kruispas: de zwaaivoet gaat voor langs. */
  kruis?: number;
}

const STIJL: Record<Exclude<Manier, 'sprong' | 'schijn'> | 'dribbel', Stijl> = {
  wandel: { ritme: [0.95, 0.22], D: 0.6, Smax: 0.8, breed: 0.1, til: 0.08, piek: 0.45, knie: 0.03, tenen: 0, zak: 0.007, buig: 0.2, veer: 0, voorover: 0.03, arm: 0.38, armBasis: 0.02, elleboog: 0.32, opzij: 0.08, vol: 1.4 },
  jog: { ritme: [1.25, 0.09], D: 0.38, Smax: 0.84, breed: 0.085, til: 0.26, piek: 0.4, knie: -0.05, tenen: 0.12, zak: 0.018, buig: 0.42, veer: 0.03, voorover: 0.12, arm: 0.55, armBasis: 0.06, elleboog: 1.45, opzij: 0.12, vol: 3.5 },
  sprint: { ritme: [1.35, 0.1], D: 0.3, Smax: 0.88, breed: 0.08, til: 0.38, piek: 0.4, knie: 0.03, tenen: 0.3, zak: 0.02, buig: 0.48, veer: 0.05, voorover: 0.24, arm: 0.95, armBasis: 0.08, elleboog: 1.55, opzij: 0.1, vol: 6 },
  achteruit: { ritme: [1.7, 0.12], D: 0.45, Smax: 0.6, breed: 0.11, til: 0.12, piek: 0.5, knie: 0.05, tenen: 0.45, zak: 0.022, buig: 0.4, veer: 0.02, voorover: 0.14, arm: 0.45, armBasis: 0.05, elleboog: 1.35, opzij: 0.15, vol: 2.4 },
  zijwaarts: { ritme: [1.7, 0.15], D: 0.42, Smax: 0.36, breed: 0.24, til: 0.09, piek: 0.5, knie: 0.03, tenen: 0.35, zak: 0.025, buig: 0.62, veer: 0.03, voorover: 0.14, arm: 0.12, armBasis: -0.25, elleboog: 1.0, opzij: 0.35, vol: 2.2 },
  kruispas: { D: 0.42, Smax: 0.6, breed: 0.1, til: 0.1, piek: 0.5, knie: 0.04, tenen: 0.35, zak: 0.02, buig: 0.5, veer: 0.04, voorover: 0.1, arm: 0.12, armBasis: -0.2, elleboog: 1.0, opzij: 0.35, vol: 2.2, kruis: 0.2 },
  kniehef: { D: 0.4, Smax: 0.5, breed: 0.1, til: 0.46, piek: 0.5, knie: 0.3, tenen: 0.6, zak: 0.005, buig: 0.28, veer: 0.05, voorover: -0.03, arm: 1.0, armBasis: 0, elleboog: 1.55, opzij: 0.1, vol: 1.6 },
  hordes: { D: 0.36, Smax: 0.6, breed: 0.1, til: 0.42, piek: 0.5, knie: 0.25, tenen: 0.5, zak: 0.007, buig: 0.36, veer: 0.12, voorover: 0.06, arm: 0.85, armBasis: 0, elleboog: 1.5, opzij: 0.1, vol: 2 },
  voetenwerk: { D: 0.45, Smax: 0.42, breed: 0.1, til: 0.14, piek: 0.5, knie: 0.08, tenen: 0.6, zak: 0.015, buig: 0.45, veer: 0.03, voorover: 0.12, arm: 0.6, armBasis: 0.05, elleboog: 1.5, opzij: 0.1, vol: 1.6 },
  huppel: { D: 0.36, Smax: 0.6, breed: 0.1, til: 0.4, piek: 0.5, knie: 0.26, tenen: 0.5, zak: 0.005, buig: 0.32, veer: 0.2, voorover: 0, arm: 1.3, armBasis: 0, elleboog: 1.2, opzij: 0.12, vol: 2.4, armHoog: true },
  dribbel: { D: 0.4, Smax: 0.55, breed: 0.09, til: 0.16, piek: 0.45, knie: 0, tenen: 0.2, zak: 0.02, buig: 0.45, veer: 0.02, voorover: 0.16, arm: 0.45, armBasis: 0.05, elleboog: 1.3, opzij: 0.18, vol: 3 },
};

// ---------- houding ----------

/** Stand van één voet: enkel (in het assenstelsel van het poppetje), kanteling van de voet en hoeveel hij steunt. */
interface Voet {
  p: Vector3;
  /** Voorvoet omlaag (+) of omhoog (−), radialen t.o.v. de grond. */
  kantel: number;
  /** Voet naar buiten gedraaid (radialen, + = naar zijn eigen kant). */
  draai: number;
  steun: number;
}

/** Een arm: draaiing in de romp (FK) en elleboog, of een doel voor de pols (IK), met een gewicht. */
interface Arm {
  x: number;
  y: number;
  z: number;
  elleboog: number;
  /** Doel voor de pols (wereld), gewicht 0–1. */
  doel: Vector3;
  ik: number;
}

interface Houding {
  voet: [Voet, Voet];
  /** Gewenste hoogte van de heupen (de benen moeten er wel bij kunnen). */
  heup: number;
  /** Heupen opzij/naar voren (m). */
  bekkenX: number;
  bekkenZ: number;
  bekken: Euler;
  romp: Euler;
  hoofd: Euler;
  arm: [Arm, Arm];
  /** Hele lijf omhoog (springen, sprongetjes). */
  lift: number;
  /** Hele lijf naar voren (m), bv. naar de bal stappen bij een trap. */
  vooruit: number;
  /** 0 = alleen niet door de grond, 1 = het laagste punt raakt de grond (zitten, liggen). */
  grond: number;
}

function nieuweHouding(): Houding {
  const voet = (): Voet => ({ p: new Vector3(), kantel: 0, draai: 0, steun: 1 });
  const arm = (): Arm => ({ x: 0, y: 0, z: 0, elleboog: 0, doel: new Vector3(), ik: 0 });
  return {
    voet: [voet(), voet()],
    heup: MAAT.heup,
    bekkenX: 0,
    bekkenZ: 0,
    bekken: new Euler(),
    romp: new Euler(),
    hoofd: new Euler(),
    arm: [arm(), arm()],
    lift: 0,
    vooruit: 0,
    grond: 0,
  };
}

export type PopSoort = 'speler' | 'keeper' | 'trainer';

/** Wat de houding van dit moment nodig heeft naast de stand uit de tijdlijn. */
export interface PoseInvoer {
  s: ObjectStand;
  soort: PopSoort;
  /** Animatietijd (s), voor rustig bewegen in de wachthouding. */
  t: number;
  /** Echte tijd sinds het vorige beeld (s), voor het vloeiend bijdraaien. */
  dtEcht: number;
  /** Animatietijd sinds het vorige beeld. */
  dtAnim: number;
  /** Sprong in de tijd (doorspoelen): niet vloeiend overgaan. */
  sprong: boolean;
  /** Vast getal 0–1 per persoon (fase van het wiebelen, haar- en huidkleur). */
  zaad: number;
  /** Bal die deze persoon heeft (midden van de bal, wereld), of null. */
  bal: Vector3 | null;
  balInHanden: boolean;
  balAanVoet: boolean;
  /** Bal waar hij naar kijkt (wereld), of null. */
  kijk: Vector3 | null;
  /** Dichtstbijzijnde bal die hij gaat vangen/stompen/redden (wereld), of null. */
  redBal: Vector3 | null;
}

/** Wat per poppetje bewaard blijft tussen de beelden (vloeiend draaien en kijken). */
export interface PopStaat {
  hoek: number;
  kijkY: number;
  kijkX: number;
  bocht: number;
  /** Plek van de rechterhand (wereld), bv. voor de bal tijdens het uithalen bij een worp. */
  hand: Vector3;
  /** Bal hoort nu in de hand (worp): gewicht 0–1. */
  balInHand: number;
}

export function nieuweStaat(): PopStaat {
  return { hoek: 0, kijkY: 0, kijkX: 0, bocht: 0, hand: new Vector3(), balInHand: 0 };
}

const H = nieuweHouding();
const _v = new Vector3();
const _w = new Vector3();
const _q = new Quaternion();
const _q2 = new Quaternion();
const _e = new Euler();
const Y = new Vector3(0, 1, 0);

/** Snelheid waarbij de oude loopbeweging "vol" was; hier: hoe sterk een stijl doorwerkt. */
const sterkte = (v: number, vol: number) => glad(v / (vol * 0.6));

/** Plek van de enkel als de voet om de teen kantelt (hiel omhoog). */
/** Draaipunt bij het afrollen: onderkant van de voorvoet (t.o.v. de enkel). */
export const TEEN = { z: 0.15, y: -0.075 } as const;
function teenKantel(b: number): { dz: number; dy: number } {
  // De teen blijft op zijn plek: enkel = teen − R(b)·teen (R = kantelen om de x-as, voorvoet omlaag).
  const c = Math.cos(b);
  const s = Math.sin(b);
  return { dz: TEEN.z - (TEEN.y * s + TEEN.z * c), dy: TEEN.y - (TEEN.y * c - TEEN.z * s) };
}

/**
 * Voetdoelen voor lopen, rennen, pasjes enz. Een steunende voet gaat precies met de afgelegde weg onder het lijf
 * door (glijdt niet over het gras); de zwaaivoet gaat in een boog naar voren. Geeft de sterkte (0–1) van de stijl.
 */
function gang(h: Houding, s: ObjectStand, st: Stijl, psi: number, cyclus: number, mdX: number, mdZ: number, tweevoets: boolean): number {
  const v = s.snelheid;
  const k = sterkte(v, st.vol);
  let S = Math.min(st.D * cyclus, st.Smax);
  // Zijwaarts: de voeten mogen elkaar niet kruisen (behalve bij de kruispas).
  if (!st.kruis && Math.abs(mdX) > 0.3) S = Math.min(S, (2 * st.breed - 0.12) / Math.abs(mdX));
  S = Math.max(0, S);
  const D = cyclus > 1e-6 ? Math.min(st.D, Math.max(0.12, S / cyclus)) : st.D;
  const a = 0.45; // landt 45% voor, gaat 55% achter het lijf los
  const til = st.til * glad(v / (st.vol * 0.5));
  const ff = [0, 0];
  for (const i of [0, 1] as const) {
    const vt = h.voet[i];
    const fase = (((psi / (Math.PI * 2) + (tweevoets ? 0 : i === 1 ? 0.5 : 0)) % 1) + 1) % 1;
    let o: number;
    let y = 0;
    let anat = 0;
    let kantel: number;
    let extraZ = 0;
    let extraY = 0;
    const tenen = st.tenen * k;
    const afzet = (0.75 + st.tenen * 0.3) * k; // hiel omhoog bij het afzetten
    if (fase < D) {
      const p = fase / D;
      o = S * (a - p);
      let b = tenen;
      const los = st.tenen > 0.3 ? 0.45 : 0.6;
      if (p > los) b = Math.max(b, afzet * Math.pow((p - los) / (1 - los), 1.4));
      // Lopen: eerst de hiel neerzetten, dan afrollen.
      kantel = st.tenen < 0.05 && p < 0.15 ? -0.22 * k * (1 - p / 0.15) : b;
      if (b > 0) {
        const tk = teenKantel(b);
        extraZ = tk.dz;
        extraY = tk.dy;
      }
      vt.steun = klem(0.5 + Math.min(p, 1 - p) * D * 12);
    } else {
      const q = (fase - D) / (1 - D);
      o = -S * (1 - a) + S * glad(q);
      // Teen meteen een paar centimeter van het gras (niet over de grond schuren), weg voor het neerzetten.
      y = til * bobbel(q, st.piek) + 0.03 * k * glad(q / 0.12) * (1 - glad((q - 0.7) / 0.3));
      anat = st.knie * k * bobbel(q, st.piek);
      // Verder met de enkel waar het afzetten eindigde, en kantel van afzet → zwaai → neerzetten.
      const tk = teenKantel(afzet);
      const af = 1 - glad(q / 0.35);
      extraZ = tk.dz * af;
      extraY = tk.dy * af;
      const land = st.tenen < 0.05 ? -0.22 * k : tenen;
      kantel = q < 0.5 ? mix(afzet, st.knie < 0 ? 0.5 : -0.12 * k, glad(q / 0.5)) : mix(st.knie < 0 ? 0.5 : -0.12 * k, land, glad((q - 0.5) / 0.5));
      vt.steun = klem(0.5 - Math.min(q, 1 - q) * (1 - D) * 12);
    }
    const zij = kant(i);
    vt.p.set(zij * st.breed + mdX * o, MAAT.enkel + y + extraY, mdZ * o + anat + extraZ);
    // Kruispas: de voet die bijkomt gaat voor de andere langs.
    if (st.kruis && fase >= D) vt.p.z += st.kruis * k * bobbel((fase - D) / (1 - D));
    vt.kantel = kantel;
    vt.draai = zij * 0.06;
    ff[i] = S > 0.02 ? klem(o / (S * 0.5), -1, 1) * Math.sign(mdZ || 1) : 0;
  }
  // Heupen: op het steunbeen met een lichte kniebuiging (op de voorvoet dus hoger); een zwaaivoet telt mee alsof hij
  // op de grond staat, zodat de heup vloeiend van het ene naar het andere steunbeen gaat.
  const kb = mix(0.12, st.buig, k);
  const lang = Math.sqrt(MAAT.dij * MAAT.dij + MAAT.scheen * MAAT.scheen + 2 * MAAT.dij * MAAT.scheen * Math.cos(kb));
  let som = 0;
  let gew = 0;
  for (const i of [0, 1] as const) {
    const vt = h.voet[i];
    const w = 0.05 + vt.steun;
    // Zwaaivoet: telt mee alsof hij recht onder de heup op de grond staat (in de lucht zakt de heup dan niet).
    const y = mix(MAAT.enkel, vt.p.y, vt.steun);
    const r = Math.hypot(vt.p.x - kant(i) * MAAT.heupX, vt.p.z) * vt.steun;
    som += w * (y + Math.sqrt(Math.max(0.04, lang * lang - r * r)));
    gew += w;
  }
  h.heup = som / gew - st.zak * k;
  // Sprongetje als beide voeten los zijn.
  const los = (1 - h.voet[0].steun) * (1 - h.voet[1].steun);
  h.lift = st.veer * k * los;
  // Bekken draait mee met het voorste been, de schouders tegengesteld; bekken zakt aan de kant van de zwaaivoet.
  const verschil = (ff[1]! - ff[0]!) / 2;
  h.bekken.set(0.3 * st.voorover * k, -0.14 * k * verschil, 0.05 * k * (h.voet[1].steun - h.voet[0].steun));
  h.romp.set(st.voorover * k, 0.26 * k * verschil, -0.03 * k * (h.voet[1].steun - h.voet[0].steun));
  // Armen tegengesteld aan de benen.
  for (const i of [0, 1] as const) {
    const ander = ff[1 - i]!;
    const ar = h.arm[i];
    const zwaai = st.armHoog ? -st.arm * k * Math.max(0, ander) * 1.1 + 0.2 * k * Math.max(0, -ander) : -st.arm * k * ander;
    ar.x = -st.armBasis * k + zwaai;
    ar.z = kant(i) * (0.1 + st.opzij * k);
    ar.y = kant(i) * -0.12 * k * Math.max(0, ander);
    ar.elleboog = mix(0.15, st.elleboog, k) + 0.15 * k * Math.max(0, ander);
  }
  return k;
}

/** Rustig staan: voeten op heupbreedte, licht door de knieën, armen langs het lijf; wiebelt een beetje (niet bevroren). */
function rust(h: Houding, t: number, zaad: number, keeper: boolean) {
  const f = zaad * 50;
  const b = keeper ? 0.13 : 0.11;
  const voor = (zaad - 0.5) * 0.12;
  h.voet[0].p.set(-b, MAAT.enkel, voor);
  h.voet[1].p.set(b, MAAT.enkel, -voor);
  for (const v of h.voet) {
    v.kantel = 0;
    v.steun = 1;
  }
  h.voet[0].draai = -0.12;
  h.voet[1].draai = 0.12;
  // Gewicht verplaatsen en ademen.
  h.bekkenX = 0.025 * Math.sin(t * 1.05 + f);
  h.heup = MAAT.heup - 0.02 - 0.012 * (0.5 + 0.5 * Math.sin(t * 0.7 + f * 1.3));
  h.bekken.set(0, 0.04 * Math.sin(t * 0.6 + f), -0.035 * Math.sin(t * 1.05 + f));
  h.romp.set(0.015 * Math.sin(t * 1.6 + f), -0.03 * Math.sin(t * 0.6 + f), 0.03 * Math.sin(t * 1.05 + f));
  for (const i of [0, 1] as const) {
    const ar = h.arm[i];
    ar.x = 0.04 + 0.04 * Math.sin(t * 0.9 + f + i);
    ar.y = 0;
    ar.z = kant(i) * (0.1 + 0.02 * Math.sin(t * 1.1 + f));
    ar.elleboog = 0.22 + 0.06 * Math.sin(t * 0.8 + f + i * 2);
  }
  h.lift = 0;
}

/** Lokale bewegingsrichting (x, z) van een wereldhoek (graden) bij lijfdraaiing `hoek` (radialen, three.js-yaw). */
function lokaal(graden: number, hoek: number): [number, number] {
  const m = (graden * Math.PI) / 180;
  const x = Math.cos(m);
  const z = Math.sin(m);
  return [x * Math.cos(hoek) - z * Math.sin(hoek), x * Math.sin(hoek) + z * Math.cos(hoek)];
}

const hoekVerschil = (a: number, b: number) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

const OLD_VOL: Partial<Record<Manier, number>> = { sprong: 2.2, schijn: 1 };

/** Plekken waarmee we checken of het lijf de grond raakt (in het assenstelsel van het gewricht) + straal. */
const CONTACT: [keyof Skelet, number | null, Vector3, number][] = [
  ['enkel', 0, new Vector3(0, -0.075, -0.05), 0],
  ['enkel', 0, new Vector3(0, -0.075, 0.17), 0],
  ['enkel', 1, new Vector3(0, -0.075, -0.05), 0],
  ['enkel', 1, new Vector3(0, -0.075, 0.17), 0],
  ['knie', 0, new Vector3(0, 0, 0.02), 0.06],
  ['knie', 1, new Vector3(0, 0, 0.02), 0.06],
  ['bekken', null, new Vector3(0, -0.1, -0.04), 0.06],
  ['bekken', null, new Vector3(0.15, -0.02, 0), 0.03],
  ['bekken', null, new Vector3(-0.15, -0.02, 0), 0.03],
  ['romp', null, new Vector3(0.17, 0.3, 0), 0.04],
  ['romp', null, new Vector3(-0.17, 0.3, 0), 0.04],
  ['romp', null, new Vector3(0, 0.25, -0.1), 0.02],
  ['romp', null, new Vector3(0, 0.25, 0.1), 0.02],
  ['hoofd', null, new Vector3(0, MAAT.hoofdMidden, 0), 0.11],
  ['pols', 0, new Vector3(0, -0.05, 0), 0.03],
  ['pols', 1, new Vector3(0, -0.05, 0), 0.03],
];

/** Laagste punt van het lijf (wereld-y), na het poseren. */
export function laagste(sk: Skelet): number {
  let min = Infinity;
  for (const [node, i, p, r] of CONTACT) {
    const n = i === null ? (sk[node] as Object3D) : (sk[node] as [Object3D, Object3D])[i]!;
    _v.copy(p).applyMatrix4(n.matrixWorld);
    min = Math.min(min, _v.y - r);
  }
  return min;
}

/** Zet een punt in het assenstelsel van het poppetje (`wortel`) om naar wereldcoördinaten. */
const naarWereld = (sk: Skelet, p: Vector3, uit: Vector3) => uit.copy(p).applyMatrix4(sk.wortel.matrixWorld);

/**
 * Zet het skelet in de houding van dit moment. Volgorde: loopbeweging of rust → keeper/zitten/duiken/trappen/… →
 * benen (IK naar de voetdoelen) → niet door de grond → armen (naar de bal) → hoofd (naar de bal).
 */
export function poseer(sk: Skelet, st: PopStaat, inv: PoseInvoer): void {
  const { s } = inv;
  const keeper = inv.soort === 'keeper';
  const h = H;

  // Kijkrichting vloeiend draaien (de tijdlijn wisselt in één keer).
  const doelHoek = Math.PI / 2 - (s.hoek * Math.PI) / 180;
  const vorigeHoek = st.hoek;
  st.hoek = inv.sprong ? doelHoek : st.hoek + hoekVerschil(st.hoek, doelHoek) * klem(inv.dtEcht * 10);
  // Draaien tijdens het lopen: leunen in de bocht (centripetaal: v·ω/g).
  const omega = !inv.sprong && inv.dtAnim > 1e-4 ? hoekVerschil(vorigeHoek, st.hoek) / inv.dtAnim : 0;
  const bochtDoel = klem((s.snelheid * omega) / 9.81, -0.35, 0.35);
  st.bocht = inv.sprong ? bochtDoel : st.bocht + (bochtDoel - st.bocht) * klem(inv.dtEcht * 6);

  // ---- basis: lopen of staan ----
  rust(h, inv.t, inv.zaad, keeper);
  h.bekkenZ = 0;
  h.hoofd.set(0, 0, 0);
  h.vooruit = 0;
  h.grond = 0;
  for (const a of h.arm) a.ik = 0;
  const l = s.liggen;
  const m = s.manier;
  let kLoop = 0;
  let stijlNaam: keyof typeof STIJL | undefined;
  if (m && m !== 'sprong' && m !== 'schijn') stijlNaam = inv.balAanVoet && (m === 'jog' || m === 'sprint' || m === 'wandel') ? 'dribbel' : m;
  const [mdX, mdZ] = s.looprichting !== undefined ? lokaal(s.looprichting, st.hoek) : [0, 1];
  if (stijlNaam && l < 0.99) {
    const stl = STIJL[stijlNaam];
    let psi: number;
    let cyclus: number;
    if (stl.ritme && stijlNaam !== 'dribbel' && s.loopTijd !== undefined && s.afgelegd !== undefined) {
      const [f0, f1] = stl.ritme;
      psi = Math.PI * 2 * (f0 * s.loopTijd + f1 * s.afgelegd);
      cyclus = s.snelheid / (f0 + f1 * s.snelheid);
    } else {
      // Pasjes (ladder, hordes) en dribbelen: het ritme van de tijdlijn (dan klopt het met de pasjes en de bal).
      psi = s.fase;
      cyclus = (Math.PI * 2) / RITME[m!];
    }
    const rustVoet = h.voet.map((v) => v.p.clone());
    kLoop = gang(h, s, stl, psi, cyclus, mdX, mdZ, false);
    // Vanuit stilstand: de voeten komen vanuit de rusthouding.
    const w = glad(s.snelheid / 0.5);
    if (w < 1) for (const i of [0, 1] as const) h.voet[i].p.lerpVectors(rustVoet[i]!, h.voet[i].p, w);
    // Dribbelen: de rechtervoet tikt de bal elke cyclus vooruit (de bal is dan het dichtst bij).
    if (stijlNaam === 'dribbel') {
      const fase = (((psi / (Math.PI * 2)) % 1) + 1) % 1;
      const tik = fase > 0.8 ? bobbel((fase - 0.8) / 0.2, 0.6) : 0;
      h.voet[0].p.z += 0.28 * tik * kLoop;
      h.voet[0].p.y += 0.04 * tik * kLoop;
      h.voet[0].draai -= 0.5 * tik;
    }
  } else if (m === 'sprong' && l < 0.99) {
    // Sprongen met twee voeten (één sprong per half ritme): door de knieën, afzetten, benen opgetrokken, landen.
    const k = sterkte(s.snelheid, OLD_VOL.sprong!);
    const ritme = (((s.fase * 2) / (Math.PI * 2) + 0.15) % 1 + 1) % 1;
    const steun = ritme < 0.3 ? 1 : 0;
    const q = steun ? 0 : (ritme - 0.3) / 0.7;
    const cyclus = Math.PI / RITME.sprong;
    for (const i of [0, 1] as const) {
      const vt = h.voet[i];
      const o = steun ? cyclus * 0.3 * (0.5 - ritme / 0.3) : cyclus * (-0.15 + glad(q) * 0.3);
      vt.p.set(kant(i) * 0.11 + mdX * o * k, MAAT.enkel + 0.24 * k * bobbel(q), mdZ * o * k + 0.12 * k * bobbel(q));
      vt.kantel = steun ? 0.2 * k : 0.4 * k;
      vt.steun = steun;
    }
    h.heup = MAAT.heup - 0.02 - (steun ? 0.16 * k * Math.sin((Math.PI * ritme) / 0.3) : 0.02);
    h.lift = 0.3 * k * Math.sin(Math.PI * q);
    h.romp.x = 0.12 * k;
    for (const i of [0, 1] as const) {
      h.arm[i].x = steun ? 0.45 * k : -1.25 * k * Math.sin(Math.PI * Math.min(1, q * 1.6));
      h.arm[i].z = kant(i) * 0.15;
      h.arm[i].elleboog = 0.4;
    }
    kLoop = k;
  } else if (m === 'schijn' && l < 0.99) {
    // Schijnbeweging: rechterbeen stapt in een boogje over de bal, lijf en armen gaan mee opzij.
    const k = sterkte(s.snelheid, OLD_VOL.schijn!);
    const g = Math.abs(Math.sin(s.fase));
    h.voet[0].p.set(-0.11 + 0.3 * g * k, MAAT.enkel + 0.2 * k * Math.sin(Math.PI * g), 0.25 + 0.2 * g * k);
    h.voet[0].steun = 0;
    h.romp.z = 0.18 * g * k;
    h.bekkenX = -0.06 * g * k;
    for (const i of [0, 1] as const) h.arm[i].z = kant(i) * (0.15 + 0.5 * g * k);
    kLoop = k;
  }

  // Versnellen: voorover, afremmen: achterover. Bocht: naar binnen leunen.
  if (kLoop > 0 && s.versnelling !== undefined) h.romp.x += klem(s.versnelling * 0.025, -0.16, 0.14) * kLoop;
  h.romp.z += st.bocht * 0.6;
  h.bekken.z += st.bocht * 0.4;

  // ---- keeper: basishouding (door de knieën, voeten breed, handen voor het lijf) ----
  let zet = s.gezet;
  if (keeper && !inv.balInHanden && !s.worp) {
    const rustig = !m || s.snelheid < 1.5 || m === 'zijwaarts' || m === 'kruispas' || m === 'voetenwerk';
    if (rustig) zet = Math.max(zet, 0.45);
  }
  zet *= 1 - l;
  const zit = s.zit;
  const zitS = s.zitSoort;
  const billen = zitS === 'zit' || zitS === 'zit-opgetrokken' ? zit : 0;
  zet *= 1 - zit;
  if (zet > 0) {
    const b = mix(0.13, 0.21, zet);
    for (const i of [0, 1] as const) {
      const vt = h.voet[i];
      if (kLoop < 0.3) vt.p.x = mix(vt.p.x, kant(i) * b, zet);
      vt.kantel = Math.max(vt.kantel, 0.12 * zet);
    }
    h.heup -= 0.16 * zet;
    h.romp.x += 0.3 * zet;
    h.bekken.x += 0.12 * zet;
    for (const i of [0, 1] as const) {
      const ar = h.arm[i];
      ar.x = mix(ar.x, -0.62, zet);
      ar.z = mix(ar.z, kant(i) * 0.42, zet);
      ar.y = mix(ar.y, kant(i) * -0.2, zet);
      ar.elleboog = mix(ar.elleboog, 1.05, zet);
    }
  }

  // ---- vangen: laag = door de knieën en voorover (schepvangen) ----
  const vang = keeper ? s.vang * klem(1 - l * 3) : 0;
  const diep = vang * klem((0.9 - s.vangHoogte) / 0.75);
  if (diep > 0) {
    h.heup -= 0.28 * diep;
    h.romp.x += 0.75 * diep;
    for (const i of [0, 1] as const) h.voet[i].p.x = mix(h.voet[i].p.x, kant(i) * 0.2, diep);
  }

  // ---- bal laag vasthouden (oppakken van het gras): door de knieën en voorover ----
  if (inv.bal && inv.balInHanden && !s.worp && l < 0.2 && s.zit < 0.2) {
    const laag = klem((1.0 - inv.bal.y) / 0.75);
    if (laag > 0) {
      h.heup -= 0.3 * laag;
      h.romp.x += 0.85 * laag;
      h.bekken.x += 0.2 * laag;
      for (const i of [0, 1] as const) h.voet[i].p.x = mix(h.voet[i].p.x, kant(i) * 0.19, laag);
    }
  }

  // ---- zitten: op de knieën, hurken of op de billen ----
  if (zit > 0) {
    const knie = zitS === 'kniezit' ? zit : 0;
    const hurk = zitS === 'hurkzit' ? zit : 0;
    const vorigOp = s.zitVorig === 'zit-opgetrokken' ? 1 : 0;
    const mixZ = s.zitVorig ? (s.zitMix ?? 1) : 1;
    const opgetrokken = ((zitS === 'zit-opgetrokken' ? 1 : 0) * mixZ + vorigOp * (1 - mixZ)) * billen;
    for (const i of [0, 1] as const) {
      const vt = h.voet[i];
      if (knie > 0) {
        // Knieën op het gras, onderbenen naar achteren (wreef op de grond).
        vt.p.lerp(_v.set(kant(i) * 0.12, 0.07, -0.38), knie);
        vt.kantel = mix(vt.kantel, 1.45, knie);
      }
      if (hurk > 0) {
        vt.p.lerp(_v.set(kant(i) * 0.23, MAAT.enkel, 0.04), hurk);
        vt.draai = kant(i) * 0.35;
      }
      if (billen > 0) {
        vt.p.lerp(_v.set(kant(i) * 0.13, MAAT.enkel, mix(0.84, 0.44, opgetrokken / Math.max(billen, 1e-6))), billen);
        vt.kantel = mix(vt.kantel, mix(0.15, 0, opgetrokken), billen);
        vt.draai = kant(i) * 0.2;
      }
    }
    h.heup = mix(h.heup, 0.5, knie);
    h.heup = mix(h.heup, 0.46, hurk);
    h.heup = mix(h.heup, 0.15 + 0.01 * opgetrokken, billen);
    h.romp.x += 0.08 * knie + 0.4 * hurk - 0.1 * billen;
    h.bekken.x += 0.25 * hurk - 0.05 * billen;
    h.grond = Math.max(h.grond, zit);
    for (const i of [0, 1] as const) {
      const ar = h.arm[i];
      ar.x = mix(ar.x, -0.35, zit * 0.6);
      ar.z = mix(ar.z, kant(i) * 0.3, zit * 0.6);
      ar.elleboog = mix(ar.elleboog, 0.9, zit * 0.6);
    }
    // Grond tikken: achterover en met beide handen achter je naar het gras.
    if (billen > 0 && s.tik > 0) {
      h.romp.x -= 0.4 * s.tik;
      for (const i of [0, 1] as const) {
        h.arm[i].doel.set(kant(i) * 0.3, 0.06, -0.3);
        h.arm[i].ik = s.tik;
      }
    }
  }

  // ---- panna: benen spreiden ----
  if (s.spreid > 0) for (const i of [0, 1] as const) h.voet[i].p.x += kant(i) * 0.4 * s.spreid;

  // ---- blokken: spreidsprong (ster) of knieblok ----
  const bl = keeper && s.blok ? s.blok : undefined;
  const blokK = bl ? Math.sin(Math.PI * Math.min(1, bl.u / 0.66) * 0.5) * (bl.u > 0.85 ? 1 - (bl.u - 0.85) / 0.15 : 1) : 0;
  if (bl && blokK > 0) {
    if (bl.soort === 'ster') {
      h.lift += 0.12 * blokK;
      for (const i of [0, 1] as const) {
        h.voet[i].p.lerp(_v.set(kant(i) * 0.55, MAAT.enkel + 0.12, 0.05), blokK);
        h.arm[i].x = mix(h.arm[i].x, -0.25, blokK);
        h.arm[i].z = mix(h.arm[i].z, kant(i) * 1.35, blokK);
        h.arm[i].elleboog = mix(h.arm[i].elleboog, 0.15, blokK);
      }
      h.heup = mix(h.heup, MAAT.heup - 0.04, blokK);
      h.romp.x += 0.1 * blokK;
    } else {
      // Rechterknie op de grond, linkerbeen breed opzij.
      h.voet[0].p.lerp(_v.set(-0.1, 0.07, -0.36), blokK);
      h.voet[0].kantel = mix(h.voet[0].kantel, 1.4, blokK);
      h.voet[1].p.lerp(_v.set(0.72, MAAT.enkel, 0.12), blokK);
      h.voet[1].draai = 0.5 * blokK;
      h.heup = mix(h.heup, 0.52, blokK);
      h.romp.x += 0.2 * blokK;
      h.grond = Math.max(h.grond, blokK);
      for (const i of [0, 1] as const) {
        h.arm[i].x = mix(h.arm[i].x, -0.45, blokK);
        h.arm[i].z = mix(h.arm[i].z, kant(i) * 0.8, blokK);
        h.arm[i].elleboog = mix(h.arm[i].elleboog, 0.3, blokK);
      }
    }
  }

  // ---- springen (kopbal, hoge bal vangen) ----
  const spring = Math.sin(s.sprong * Math.PI * 0.5);
  if (spring > 0) {
    h.lift += 0.45 * spring;
    if (keeper) {
      // Afzetten op één been, de andere knie omhoog ter bescherming.
      h.voet[0].p.lerp(_v.set(-0.08, MAAT.enkel, 0.02), spring);
      h.voet[0].kantel = mix(h.voet[0].kantel, 0.7, spring);
      h.voet[1].p.lerp(_v.set(0.1, MAAT.enkel + 0.36, 0.22), spring);
    } else {
      for (const i of [0, 1] as const) {
        h.voet[i].p.lerp(_v.set(kant(i) * 0.1, MAAT.enkel + 0.2, -0.14), spring);
        h.voet[i].kantel = mix(h.voet[i].kantel, 0.6, spring);
        h.arm[i].x = mix(h.arm[i].x, -0.5, spring);
        h.arm[i].z = mix(h.arm[i].z, kant(i) * 0.75, spring);
        h.arm[i].elleboog = mix(h.arm[i].elleboog, 0.9, spring);
      }
      h.romp.x -= 0.2 * spring;
    }
  }

  // ---- duiken: lijf gestrekt, benen iets uit elkaar; afzetten met het been aan de duikkant ----
  const dh = (s.duikHoek * Math.PI) / 180;
  const dx = Math.cos(dh);
  const dz = Math.sin(dh);
  let naarLinks = false;
  if (l > 0) {
    for (const i of [0, 1] as const) {
      h.voet[i].p.lerp(_v.set(kant(i) * 0.14, MAAT.enkel, 0.02), l);
      h.voet[i].kantel = mix(h.voet[i].kantel, 0.5, l);
    }
    h.heup = mix(h.heup, MAAT.heup, l);
    h.romp.set(mix(h.romp.x, 0.05, l), h.romp.y * (1 - l), h.romp.z * (1 - l));
    h.bekken.set(h.bekken.x * (1 - l), h.bekken.y * (1 - l), h.bekken.z * (1 - l));
    h.lift *= 1 - l;
    h.grond = Math.max(h.grond, l);
    const hk = (s.hoek * Math.PI) / 180;
    naarLinks = Math.sin(hk - dh) > 0;
    if (keeper && l < 0.8) {
      const q = Math.sin(Math.PI * klem(l / 0.8));
      const kn = naarLinks ? 0 : 1;
      h.voet[kn].p.y += 0.3 * q;
      h.voet[kn].p.z += 0.25 * q;
    }
  }
  // Opstaan na een duik: via gehurkt/geknield omhoog, met een hand op de grond.
  if (s.opstaan !== undefined) {
    const o = Math.sin(Math.PI * s.opstaan);
    for (const i of [0, 1] as const) h.voet[i].p.lerp(_v.set(kant(i) * 0.2, MAAT.enkel, 0.12), o);
    h.heup = mix(h.heup, 0.55, o * 0.9);
    h.romp.x += 0.45 * o;
    h.grond = Math.max(h.grond, o);
  }

  // ---- trap (pass, schot) ----
  const tr = s.trap;
  let trapBeen: 0 | 1 | -1 = -1;
  if (tr && l < 0.5) {
    const w = venster(tr.u, 0.25, 0.85);
    const kr = tr.kracht;
    // Richting van de trap t.o.v. het lijf; naar links met rechts (binnenkant), naar rechts met links.
    const [rx, rz] = tr.richting !== undefined ? lokaal(tr.richting, st.hoek) : [0, 1];
    const tb: 0 | 1 = rx < -0.45 ? 1 : 0;
    trapBeen = tb;
    const sb: 0 | 1 = tb === 0 ? 1 : 0;
    const zij = kant(tb);
    // Naar de bal toe stappen (de bal ligt 0,4 m voor het lijf).
    h.vooruit = 0.26 * venster(tr.u, 0.45, 0.75);
    const bz = 0.4 - h.vooruit;
    const steun = h.voet[sb];
    steun.p.lerp(_v.set(kant(sb) * 0.2, MAAT.enkel, bz - 0.08), venster(tr.u, 0.35, 0.8));
    steun.kantel *= 1 - w;
    steun.steun = 1;
    // Trapvoet: uithalen naar achteren, door de bal, uitzwaaien in de richting van de bal.
    const vt = h.voet[tb];
    const contactX = -rx * 0.22;
    const contactZ = bz - rz * 0.22;
    const u = tr.u;
    let px: number;
    let py: number;
    let pz: number;
    if (u < 0.3) {
      const a = glad(u / 0.3);
      px = mix(vt.p.x, zij * 0.12, a);
      py = mix(vt.p.y, MAAT.enkel + 0.18 + 0.14 * kr, a);
      pz = mix(vt.p.z, -0.22 - 0.18 * kr, a);
    } else if (u < 0.5) {
      const a = glad((u - 0.3) / 0.2);
      px = mix(zij * 0.12, contactX, a);
      py = mix(MAAT.enkel + 0.18 + 0.14 * kr, 0.11, a);
      pz = mix(-0.22 - 0.18 * kr, contactZ, a);
    } else if (u < 0.72) {
      const a = glad((u - 0.5) / 0.22);
      const ver = 0.35 + 0.45 * kr;
      px = mix(contactX, contactX + rx * ver, a);
      py = mix(0.11, 0.12 + 0.3 * kr + (tr.hoog ? 0.3 : 0), a);
      pz = mix(contactZ, contactZ + rz * ver, a);
    } else {
      const a = glad((u - 0.72) / 0.28);
      const ver = 0.35 + 0.45 * kr;
      px = mix(contactX + rx * ver, zij * 0.12, a);
      py = mix(0.12 + 0.3 * kr + (tr.hoog ? 0.3 : 0), MAAT.enkel, a);
      pz = mix(contactZ + rz * ver, bz - 0.25, a);
    }
    vt.p.lerp(_v.set(px, py, pz), w);
    vt.kantel = mix(vt.kantel, 0.55, w);
    // Zachte pass met de binnenkant: voet naar buiten gedraaid.
    vt.draai = mix(vt.draai, zij * (kr < 0.6 ? 0.9 : 0.3), w);
    vt.steun = 0;
    h.heup = mix(h.heup, MAAT.heup - 0.07, w);
    h.romp.x += (tr.hoog ? -0.18 : 0.08) * w * kr;
    h.romp.y += -rx * 0.35 * w;
    h.bekken.y += -rx * 0.25 * w;
    // Armen: andere arm opzij voor de balans, arm aan de trapkant naar achteren.
    const a = h.arm[sb];
    a.x = mix(a.x, -0.55, w);
    a.z = mix(a.z, kant(sb) * 0.95, w);
    a.elleboog = mix(a.elleboog, 0.5, w);
    const b = h.arm[tb];
    b.x = mix(b.x, 0.35, w);
    b.z = mix(b.z, zij * 0.55, w);
    b.elleboog = mix(b.elleboog, 0.4, w);
  }

  // ---- aannemen: voet naar de bal (laag), dij (halfhoog) of borst ----
  const an = s.aanname;
  if (an && l < 0.5 && trapBeen < 0) {
    const w = venster(an.u, 0.3, 0.75);
    const [rx] = lokaal(an.richting + 180, st.hoek);
    const i = rx > 0.4 ? 1 : 0; // bal komt van links: linkervoet
    const vt = h.voet[i];
    const zij = kant(i);
    const terug = an.u > 0.5 ? glad((an.u - 0.5) / 0.3) * 0.12 : 0;
    if (an.hoogte < 0.45) {
      vt.p.lerp(_v.set(zij * 0.02, MAAT.enkel + 0.05 + Math.min(an.hoogte, 0.3) * 0.5, 0.17 - terug), w);
      vt.draai = mix(vt.draai, zij * 0.9, w);
      vt.kantel = mix(vt.kantel, -0.1, w);
      vt.steun = 0;
    } else if (an.hoogte < 0.95) {
      vt.p.lerp(_v.set(zij * 0.05, MAAT.enkel + 0.4, 0.2 - terug), w);
      vt.steun = 0;
    } else if (an.hoogte < 1.35) {
      h.romp.x -= 0.32 * w;
      h.heup -= 0.05 * w;
      for (const j of [0, 1] as const) {
        h.arm[j].z = mix(h.arm[j].z, kant(j) * 0.85, w);
        h.arm[j].x = mix(h.arm[j].x, -0.25, w);
      }
    } else {
      h.hoofd.x += 0.35 * Math.sin(Math.PI * klem((an.u - 0.35) / 0.3));
    }
    h.heup -= 0.04 * w;
  }

  // ---- worp of trap uit de handen ----
  const wp = s.worp;
  let werpHand = 0;
  if (wp) {
    const u = wp.u;
    const los = 0.58;
    const bal = inv.bal;
    const bh = bal ? bal.y : 1.05;
    if (wp.soort === 'volley' || wp.soort === 'dropkick' || wp.soort === 'trap') {
      // De bal valt uit de handen, het rechterbeen zwaait erdoor.
      const w = venster(u, 0.25, 0.85);
      const vt = h.voet[0];
      const contactY = wp.soort === 'volley' ? 0.4 : 0.1;
      let px: number;
      let py: number;
      let pz: number;
      if (u < los) {
        const a = glad(u / los);
        px = mix(vt.p.x, -0.05, a);
        py = u < los * 0.55 ? mix(vt.p.y, MAAT.enkel + 0.3, glad(u / (los * 0.55))) : mix(MAAT.enkel + 0.3, contactY, glad((u - los * 0.55) / (los * 0.45)));
        pz = u < los * 0.55 ? mix(vt.p.z, -0.3, glad(u / (los * 0.55))) : mix(-0.3, 0.2, glad((u - los * 0.55) / (los * 0.45)));
      } else {
        const a = glad((u - los) / (1 - los));
        px = -0.05;
        py = mix(contactY, 0.95, Math.sin(Math.PI * 0.5 * a)) * (1 - glad((u - 0.85) / 0.15)) + MAAT.enkel * glad((u - 0.85) / 0.15);
        pz = mix(0.2, 0.75, Math.sin(Math.PI * 0.5 * a)) * (1 - glad((u - 0.85) / 0.15));
      }
      vt.p.lerp(_v.set(px, py, pz), w);
      vt.kantel = mix(vt.kantel, 0.9, w);
      vt.steun = 0;
      h.voet[1].p.lerp(_v.set(0.16, MAAT.enkel, 0.15), w);
      h.romp.x -= 0.18 * w * Math.sin(Math.PI * klem(u));
      // Armen: houden de bal tot hij valt, daarna opzij.
      const opzij = glad((u - 0.3) / 0.3);
      for (const i of [0, 1] as const) {
        h.arm[i].x = mix(-0.7, -0.4, opzij);
        h.arm[i].z = kant(i) * mix(0.3, 0.9, opzij);
        h.arm[i].elleboog = mix(1.0, 0.4, opzij);
      }
    } else {
      // Gooien: de rechterhand gaat met de bal mee (de bal volgt de hand tot het loslaten).
      werpHand = 1;
      const ri = 0;
      const w = venster(u, 0.12, 0.85);
      let p: [number, number, number][];
      if (wp.soort === 'onderhands') {
        const laag = bh < 0.45 ? 0.3 : 0.6;
        p = [
          [-0.12, 1.0, 0.33],
          [-0.26, 0.55, -0.32],
          [-0.08, laag, 0.38],
          [-0.12, 0.95, 0.62],
        ];
        // Diep door de knieën en een stap naar voren met links.
        const d = Math.sin(Math.PI * klem(u * 1.1));
        h.heup -= 0.24 * d;
        h.romp.x += 0.45 * d;
        h.voet[1].p.lerp(_v.set(0.15, MAAT.enkel, 0.42), venster(u, 0.3, 0.9));
        h.voet[0].p.lerp(_v.set(-0.15, MAAT.enkel, -0.3), venster(u, 0.3, 0.9));
        h.voet[0].kantel = mix(h.voet[0].kantel, 0.7, venster(u, 0.3, 0.9));
      } else if (wp.soort === 'bovenhands') {
        p = [
          [-0.12, 1.05, 0.33],
          [-0.3, 1.72, -0.3],
          [-0.12, 2.0, 0.3],
          [0.08, 1.05, 0.45],
        ];
        h.romp.x += u < los ? -0.15 * glad(u / los) : mix(-0.15, 0.3, glad((u - los) / (1 - los)));
        h.romp.y += u < los ? 0.45 * glad(u / (los * 0.6)) * (1 - glad((u - los * 0.6) / (los * 0.4))) : -0.3 * Math.sin(Math.PI * (u - los) / (1 - los));
        h.voet[1].p.lerp(_v.set(0.14, MAAT.enkel, 0.38), venster(u, 0.3, 0.9));
        h.voet[0].p.lerp(_v.set(-0.14, MAAT.enkel, -0.25), venster(u, 0.3, 0.9));
        h.arm[1].x = mix(h.arm[1].x, -1.35, w);
        h.arm[1].elleboog = mix(h.arm[1].elleboog, 0.2, w);
      } else {
        // Zwaaiworp: arm laag opzij, van achteren in een grote boog naar voren.
        p = [
          [-0.12, 1.05, 0.33],
          [-0.65, 1.1, -0.35],
          [-0.12, 1.1, 0.38],
          [0.35, 1.0, 0.3],
        ];
        h.romp.y += u < los ? 0.55 * glad(u / los) : mix(0.55, -0.4, glad((u - los) / (1 - los)));
        h.voet[1].p.lerp(_v.set(0.16, MAAT.enkel, 0.35), venster(u, 0.3, 0.9));
        h.arm[1].x = mix(h.arm[1].x, -1.1, w);
        h.arm[1].z = mix(h.arm[1].z, 0.4, w);
      }
      const seg = u < 0.3 ? 0 : u < los ? 1 : 2;
      const grens = [0, 0.3, los, 1];
      const a = glad((u - grens[seg]!) / (grens[seg + 1]! - grens[seg]!));
      const pa = p[seg]!;
      const pb = p[seg + 1]!;
      h.arm[ri].doel.set(mix(pa[0], pb[0], a), mix(pa[1], pb[1], a), mix(pa[2], pb[2], a));
      h.arm[ri].ik = w;
      st.balInHand = u < los ? 1 : 0;
    }
  }
  if (!wp || !werpHand) st.balInHand = 0;

  // ---- skelet zetten: wortel, bekken, romp ----
  const kantel = l > 0 ? _q2.setFromAxisAngle(_w.set(dz, 0, -dx), l * 1.5) : _q2.identity();
  _q.setFromAxisAngle(Y, st.hoek);
  sk.wortel.quaternion.copy(kantel).multiply(_q);
  // Naar voren stappen (trap): in de kijkrichting.
  const vx = Math.sin(st.hoek) * h.vooruit;
  const vz = Math.cos(st.hoek) * h.vooruit;
  sk.wortel.position.set(s.x - dx * 1.45 * l + vx, h.lift + s.zweef + l * 0.2, s.y - dz * 1.45 * l + vz);

  // Heupen: zo hoog als gewenst, maar de voeten moeten erbij kunnen (geen gestrekte benen die te kort zijn).
  let heup = h.heup;
  for (const i of [0, 1] as const) {
    const vt = h.voet[i].p;
    const hx = kant(i) * MAAT.heupX + h.bekkenX;
    const r = Math.hypot(vt.x - hx, vt.z - h.bekkenZ);
    const max = BEEN * 0.985;
    if (r < max) heup = Math.min(heup, vt.y + Math.sqrt(max * max - r * r));
  }
  sk.bekken.position.set(h.bekkenX, heup, h.bekkenZ);
  sk.bekken.rotation.copy(h.bekken);
  sk.romp.rotation.copy(h.romp);
  sk.wortel.updateMatrixWorld(true);

  // ---- benen (IK) ----
  for (const i of [0, 1] as const) {
    const vt = h.voet[i];
    naarWereld(sk, vt.p, _w);
    sk.bekken.worldToLocal(_w);
    // Knie wijst naar voren, en omhoog als het been naar voren wijst (zitten).
    _n.subVectors(_w, sk.heup[i].position).normalize();
    _v.set(kant(i) * 0.12, _n.z, -_n.y);
    const buig = ik(sk.heup[i].position, _w, MAAT.dij, MAAT.scheen, _v, 1, sk.heup[i].quaternion);
    sk.knie[i].rotation.set(buig, 0, 0);
    // Voet: kanteling en draaiing t.o.v. het lijf (bekken × heup × knie terugrekenen).
    _q.copy(sk.bekken.quaternion).multiply(sk.heup[i].quaternion).multiply(sk.knie[i].quaternion);
    _e.set(vt.kantel, vt.draai, 0, 'YXZ');
    _q2.setFromEuler(_e);
    sk.enkel[i].quaternion.copy(_q.invert()).multiply(_q2);
  }

  // ---- armen (eerst FK, zodat het lijf compleet is voor de grondcontrole) ----
  const armFK = (i: 0 | 1) => {
    const a = h.arm[i];
    _e.set(a.x, a.y, a.z, 'XYZ');
    sk.schouder[i].quaternion.setFromEuler(_e);
    sk.elleboog[i].rotation.set(-a.elleboog, 0, 0);
  };
  armFK(0);
  armFK(1);
  // Duiken: armen gestrekt boven het hoofd (in de lengte van het lijf).
  if (l > 0) {
    for (const i of [0, 1] as const) {
      _e.set(-l * 2.9, 0, kant(i) * 0.12 * (1 - l), 'XYZ');
      _q2.setFromEuler(_e);
      sk.schouder[i].quaternion.slerp(_q2, klem(l * 1.5));
      sk.elleboog[i].rotation.x *= 1 - l;
    }
  }
  sk.wortel.updateMatrixWorld(true);

  // ---- niet door de grond; zitten/liggen: met het laagste punt op de grond ----
  const min = laagste(sk);
  let dy = 0;
  if (min < 0) dy = -min;
  else if (h.grond > 0 && s.zweef < 0.02) dy = -min * h.grond;
  if (dy !== 0) {
    sk.wortel.position.y += dy;
    sk.wortel.updateMatrixWorld(true);
  }

  // ---- armen naar de bal (vasthouden, vangen, duiken, stompen) of een ander doel ----
  const doelen: [Vector3 | null, Vector3 | null] = [null, null];
  const gew = [0, 0];
  // Doelen die als plek in het poppetje gegeven zijn (gooien, grond tikken) → wereld.
  for (const i of [0, 1] as const) {
    if (h.arm[i].ik > 0) {
      doelen[i] = naarWereld(sk, h.arm[i].doel, new Vector3());
      gew[i] = h.arm[i].ik;
    }
  }
  const handen = (bal: Vector3, w: number, alleen?: 0 | 1) => {
    // Polsen aan weerszijden van de bal, iets erachter (gezien vanaf de schouders).
    _v.set(0, 1, 0).applyQuaternion(sk.romp.getWorldQuaternion(_q));
    const midden = sk.romp.localToWorld(_w.set(0, MAAT.schouderY - 0.1, 0));
    const naar = _v.subVectors(bal, midden).normalize();
    const zij = new Vector3().crossVectors(Y, naar);
    if (zij.lengthSq() < 0.04) zij.set(1, 0, 0).applyQuaternion(sk.wortel.quaternion);
    zij.normalize();
    // Wijst "links" van het poppetje de andere kant op: omdraaien (handen niet gekruist).
    if (zij.dot(new Vector3(1, 0, 0).applyQuaternion(sk.wortel.quaternion)) < 0) zij.negate();
    for (const i of [0, 1] as const) {
      if (alleen !== undefined && i !== alleen) continue;
      if (gew[i]! >= w) continue;
      const p = (doelen[i] ??= new Vector3());
      p.copy(bal).addScaledVector(zij, kant(i) * (alleen !== undefined ? 0 : 0.17)).addScaledVector(naar, alleen !== undefined ? -0.1 : -0.06);
      gew[i] = w;
    }
  };
  if (inv.bal && inv.balInHanden && !werpHand && !(wp && (wp.soort === 'volley' || wp.soort === 'dropkick' || wp.soort === 'trap') && wp.u > 0.3)) {
    handen(inv.bal, 1);
  }
  if (vang > 0) {
    // Handen naar de bal (vlak voor hij er is: naar de plek waar hij aankomt).
    const doel = inv.redBal && inv.redBal.distanceTo(sk.wortel.position) < 2.5 ? inv.redBal : naarWereld(sk, _w.set(0, klem(s.vangHoogte, 0.15, 2.5), 0.38), new Vector3());
    handen(doel, vang);
  }
  if (l > 0.05 && inv.redBal) {
    const schouders = sk.romp.localToWorld(new Vector3(0, MAAT.schouderY, 0));
    const d = inv.redBal.distanceTo(schouders);
    if (d < 1.8) handen(inv.redBal, klem((1.8 - d) / 0.6) * klem(l * 3));
  }
  if (keeper && s.stomp) {
    const k = Math.sin(Math.PI * klem(s.stomp.u));
    const doel = inv.redBal && inv.redBal.distanceTo(sk.wortel.position) < 3 ? inv.redBal : naarWereld(sk, _w.set(0, 2.3, 0.5), new Vector3());
    if (s.stomp.vuisten === 2) handen(doel, k);
    else handen(doel, k, 0);
  }
  if (opstaanHand(s)) {
    // Opstaan: de hand aan de kant waar hij lag steunt op de grond.
    const i = naarLinks ? 1 : 0;
    const w = Math.sin(Math.PI * s.opstaan!);
    if (gew[i]! < w) {
      // Hand op het gras, onder de schouder en iets naar voren.
      const sch = sk.schouder[i].getWorldPosition(new Vector3());
      doelen[i] = new Vector3(sch.x + Math.sin(st.hoek) * 0.2, 0.06, sch.z + Math.cos(st.hoek) * 0.2);
      gew[i] = w;
    }
  }
  for (const i of [0, 1] as const) {
    const doel = doelen[i];
    const w = gew[i]!;
    if (!doel || w <= 0) continue;
    doel.y = Math.max(doel.y, 0.06);
    sk.romp.worldToLocal(_w.copy(doel));
    // Elleboog wijst naar achteren/opzij; omhoog reiken: naar voren.
    _n.subVectors(_w, sk.schouder[i].position).normalize();
    _v.set(kant(i) * 0.5 + _n.x * 0.2, -_n.z, _n.y - 0.3);
    const buig = ik(sk.schouder[i].position, _w, MAAT.bovenarm, MAAT.onderarm + 0.05, _v, -1, _q);
    sk.schouder[i].quaternion.slerp(_q, w);
    sk.elleboog[i].rotation.x = mix(sk.elleboog[i].rotation.x, buig, w);
  }

  // Nog één keer: na de armen niets onder het gras.
  sk.wortel.updateMatrixWorld(true);
  const min2 = laagste(sk);
  if (min2 < -0.003) sk.wortel.position.y -= min2;

  // ---- hoofd: naar de bal kijken (tegen het voorover leunen in) ----
  let kijkY = 0;
  let kijkX = 0;
  if (inv.kijk && l < 0.3) {
    sk.wortel.updateMatrixWorld(true);
    sk.nek.worldToLocal(_w.copy(inv.kijk));
    _w.y -= MAAT.hoofdY + MAAT.hoofdMidden;
    const afst = Math.hypot(_w.x, _w.z);
    if (afst > 0.4) {
      kijkY = klem(Math.atan2(_w.x, _w.z), -1.25, 1.25);
      kijkX = klem(-Math.atan2(_w.y, afst), -0.5, 0.6);
      // Achter hem: niet helemaal omdraaien.
      if (Math.abs(Math.atan2(_w.x, _w.z)) > 2.2) kijkY *= 0.6;
    }
    // Rennen: vooral vooruit kijken.
    const w = 1 - 0.6 * kLoop;
    kijkY *= w;
    kijkX *= w;
  }
  const z = inv.sprong ? 1 : klem(inv.dtEcht * 6);
  st.kijkY += (kijkY - st.kijkY) * z;
  st.kijkX += (kijkX - st.kijkX) * z;
  const romp = h.romp.x + h.bekken.x;
  sk.nek.rotation.set(-romp * 0.35 + st.kijkX * 0.3, st.kijkY * 0.35 - h.romp.y * 0.4, 0);
  sk.hoofd.rotation.set(-romp * 0.4 + st.kijkX * 0.7 + h.hoofd.x, st.kijkY * 0.65 - h.romp.y * 0.3, 0);
  sk.wortel.updateMatrixWorld(true);

  // Plek van de rechterhand (de bal volgt hem bij een worp).
  sk.pols[0].localToWorld(st.hand.set(0, -0.07, 0.07));
}

function opstaanHand(s: ObjectStand): boolean {
  return s.opstaan !== undefined && s.opstaan > 0.05 && s.opstaan < 0.85;
}

/** Hoogte van de badge boven het hoofd (wereld-y), na het poseren. */
export function boveHoofd(sk: Skelet, uit: Vector3): Vector3 {
  return sk.hoofd.localToWorld(uit.set(0, MAAT.hoofdMidden + 0.16, 0));
}

/** Matrix van de romp (voor het rugnummer). */
export function rompMatrix(sk: Skelet): Matrix4 {
  return sk.romp.matrixWorld;
}

/** De (lichte) pasjes waarbij het ritme van de tijdlijn telt. */
export const TIJDLIJN_RITME: readonly Manier[] = PASJES;

// ---------- invoer uit de stand (gedeeld door de 3D-weergave en de tests) ----------

export interface BalInvoer {
  /** Midden van elke bal (wereld). */
  plek: Map<string, Vector3>;
  /** Wie welke bal heeft. */
  houderVan: Map<string, string>;
  /** Ballen die in het spel zijn (in de lucht of bij iemand). */
  actief: Vector3[];
  /** Ballen in de lucht/onderweg. */
  vliegt: { id: string; p: Vector3; naar: string | null }[];
}

/**
 * Plek van de ballen zoals ze getekend worden: de tijdlijn, met de bal op zijn straal boven het gras; bij dribbelen
 * iets verder voor de voet (de tijdlijn houdt hem vlak bij het lijf, dan stappen de voeten erdoor).
 */
export function balInvoer(s: Stand, ballen: string[], balR: number): BalInvoer {
  const uit: BalInvoer = { plek: new Map(), houderVan: new Map(), actief: [], vliegt: [] };
  for (const id of ballen) {
    const st = s.objecten.get(id);
    if (!st) continue;
    const p = new Vector3(st.x, st.hoogte + balR * klem(1 - st.hoogte), st.y);
    if (st.houder) {
      uit.houderVan.set(st.houder, id);
      const hs = s.objecten.get(st.houder);
      if (hs && st.hoogte < 0.25 && hs.snelheid > 0.05 && !hs.trap) {
        const r = (hs.hoek * Math.PI) / 180;
        const w = (0.5 - Math.cos(Math.PI * klem(hs.snelheid / 2.5)) / 2) * 0.32;
        p.x += Math.cos(r) * w;
        p.z += Math.sin(r) * w;
      }
    }
    if (st.vlucht || st.houder) uit.actief.push(p);
    if (st.vlucht) uit.vliegt.push({ id, p, naar: st.vlucht.naar });
    uit.plek.set(id, p);
  }
  return uit;
}

function dichtste(x: number, z: number, lijst: Vector3[], max: number): Vector3 | null {
  let beste: Vector3 | null = null;
  let d = max;
  for (const p of lijst) {
    const a = Math.hypot(p.x - x, p.z - z);
    if (a < d) {
      d = a;
      beste = p;
    }
  }
  return beste;
}

/** Bal-gegevens voor één persoon: zijn eigen bal (handen of voet), waar hij naar kijkt en welke bal hij moet redden. */
export function persoonInvoer(id: string, soort: PopSoort, st: ObjectStand, s: Stand, bi: BalInvoer): Pick<PoseInvoer, 'bal' | 'balInHanden' | 'balAanVoet' | 'kijk' | 'redBal'> {
  const balId = bi.houderVan.get(id);
  const bal = balId ? bi.plek.get(balId)! : null;
  const bs = balId ? s.objecten.get(balId) : undefined;
  const inHanden = !!bs && (bs.hoogte > 0.25 || !!st.worp);
  // Kijken naar de bal die in het spel is (niet naar je eigen bal aan de voet).
  const kijk = balId ? null : dichtste(st.x, st.y, bi.actief, 45);
  // Keeper: de bal die op hem af komt (vangen, duiken, stompen).
  let red: Vector3 | null = null;
  if (soort === 'keeper') {
    red = bi.vliegt.find((v) => v.naar === id)?.p ?? null;
    red ??= dichtste(
      st.x,
      st.y,
      bi.vliegt.map((v) => v.p),
      3,
    );
  }
  return { bal, balInHanden: inHanden, balAanVoet: !!bs && !inHanden, kijk, redBal: red };
}
