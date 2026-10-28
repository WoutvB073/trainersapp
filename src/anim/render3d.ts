import {
  BoxGeometry,
  IcosahedronGeometry,
  RingGeometry,
  Path,
  Shape,
  ShapeGeometry,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  DynamicDrawUsage,
  CatmullRomCurve3,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  InstancedMesh,
  LinearMipmapLinearFilter,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TorusGeometry,
  Texture,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { DOELNET_KLEUR, doelnetGaten, netMaten } from './doelnet';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { CameraStand, Manier, Punt, Team, Tekening, Uitsnede, VeldObject } from '../model/types';
import { HORDE } from '../model/types';
import { lijnPunten } from '../model/lijn';
import { boog, PASJES, PASLENGTE, standOp, type NetInslag, type Spoor, type Tijdlijn } from './timeline';
import { isKussen, leesKleuren, persoonKleur, PLAT, tekenGrasmat, uitsnede, veldMaten, type Kleuren } from './render2d';
import type { Weergave } from './weergave';
import {
  BAL_R,
  balInvoer,
  boveHoofd,
  LENGTE,
  maakSkelet,
  persoonInvoer,
  nieuweStaat,
  popKleuren,
  Poppetjes,
  poseer,
  zetHesje,
  type PopKleuren,
  type PopSoort,
  type PopStaat,
  type Skelet,
} from './poppetje';

/**
 * 3D-weergave met Three.js. Gebruikt dezelfde tijdlijn als de 2D-weergave (standOp); hier zit alleen tekenwerk.
 * Assen: x = breedte, z = lengte (de y van het datamodel), y = omhoog. Alle maten in meters.
 */

export type { CameraStand };

export interface Weergave3D extends Weergave {
  camera(stand: CameraStand, direct?: boolean): void;
}

export interface Opties3D {
  /** Wordt aangeroepen bij de eerste keer draaien/zoomen (om de uitleg te verbergen). */
  opInteractie?: () => void;
  /** WebGL viel weg (bv. te weinig geheugen): terug naar 2D. */
  opFout?: () => void;
  /** Looplijnen tonen (standaard ja). */
  looplijnen?: boolean;
  /** Eenvoudige poppetjes: minder detail, lagere resolutie (tragere telefoons). */
  eenvoudig?: boolean;
}

const LUCHT = '#cfe6f2';
const SPOOR_Y = 0.03;
const SPOOR_BREED = 0.18;

const v3 = (x: number, h: number, y: number) => new Vector3(x, h, y);
const klem = (u: number, a = 0, b = 1) => Math.min(b, Math.max(a, u));
const glad = (u: number) => 0.5 - Math.cos(Math.PI * klem(u)) / 2;

// ---------- texturen ----------

function canvasTextuur(breedte: number, hoogte: number, teken: (ctx: CanvasRenderingContext2D) => void): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = breedte;
  c.height = hoogte;
  teken(c.getContext('2d')!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Rugnummer-badge (cirkel in teamkleur) of nummer zonder achtergrond (op het shirt). */
function nummerTextuur(tekst: string, kleur: string | null): CanvasTexture {
  const teken = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 128, 128);
    if (kleur) {
      ctx.fillStyle = kleur;
      ctx.beginPath();
      ctx.arc(64, 64, 54, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 9;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
    ctx.font = `700 ${tekst.length > 1 ? 66 : 76}px "Barlow Condensed", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.strokeText(tekst, 64, 68);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(tekst, 64, 68);
  };
  const t = canvasTextuur(128, 128, teken);
  // Opnieuw tekenen als het lettertype later binnenkomt.
  void document.fonts?.ready.then(() => {
    teken((t.image as HTMLCanvasElement).getContext('2d')!);
    t.needsUpdate = true;
  });
  return t;
}

function netTextuur(): CanvasTexture {
  const t = canvasTextuur(32, 32, (ctx) => {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 30, 30);
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

function balTextuur(): CanvasTexture {
  return canvasTextuur(256, 128, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#1b1b1b';
    const vlekken: Punt[] = [
      [32, 64],
      [96, 30],
      [96, 98],
      [160, 64],
      [224, 30],
      [224, 98],
      [0, 20],
      [256, 20],
    ];
    for (const [x, y] of vlekken) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.lineTo(x + Math.cos(a) * 15, y + Math.sin(a) * 15);
      }
      ctx.fill();
    }
  });
}

/** Geef een plat vlak UV's die een textuur elke `cel` meter herhalen. */
function herhaalUV(geo: PlaneGeometry, breedte: number, hoogte: number, cel: number) {
  const uv = geo.attributes.uv!;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * breedte) / cel, (uv.getY(i) * hoogte) / cel);
  return geo;
}

// ---------- materiaal (statisch) ----------

function goal(o: VeldObject, netTex: Texture, materialen: Material[]): Group {
  const groot = o.soort === 'goal';
  const B = o.breedte ?? (groot ? 7.32 : 3);
  const H = o.hoogte ?? (groot ? 2.44 : 1);
  const D = o.lengte ?? (groot ? 2 : 1.2);
  const r = groot ? 0.06 : 0.04;
  const g = new Group();
  const wit = new MeshLambertMaterial({ color: '#ffffff' });
  const net = new MeshBasicMaterial({ map: netTex, transparent: true, side: DoubleSide, depthWrite: false, opacity: 0.55, forceSinglePass: true });
  materialen.push(wit, net);
  const paal = new CylinderGeometry(r, r, H, 10);
  for (const x of [-B / 2, B / 2]) {
    const p = new Mesh(paal, wit);
    p.position.set(x, H / 2, 0);
    g.add(p);
  }
  const lat = new Mesh(new CylinderGeometry(r, r, B + 2 * r, 10), wit);
  lat.rotation.z = Math.PI / 2;
  lat.position.set(0, H, 0);
  g.add(lat);
  // Achterkant van het frame (dunne buizen) + net.
  const buis = new CylinderGeometry(r * 0.5, r * 0.5, 1, 6);
  const staaf = (a: Vector3, b: Vector3) => {
    const m = new Mesh(buis, wit);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.scale.y = a.distanceTo(b);
    m.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), b.clone().sub(a).normalize());
    g.add(m);
  };
  for (const x of [-B / 2, B / 2]) {
    staaf(v3(x, H, 0), v3(x, H * 0.85, -D * 0.5));
    staaf(v3(x, H * 0.85, -D * 0.5), v3(x, 0, -D));
    staaf(v3(x, 0, -D), v3(x, 0, 0));
  }
  staaf(v3(-B / 2, 0, -D), v3(B / 2, 0, -D));
  const cel = 0.18;
  const vlak = (w: number, h: number, pos: Vector3, rot: [number, number, number], delen: [number, number] = [1, 1]) => {
    const m = new Mesh(herhaalUV(new PlaneGeometry(w, h, ...delen), w, h, cel), net);
    m.position.copy(pos);
    m.rotation.set(...rot);
    m.renderOrder = 2;
    g.add(m);
    return m;
  };
  // Achternet (schuin, in stukjes zodat het kan uitbollen), zijnetten en dak.
  const schuin = Math.hypot(D * 0.5, H * 0.85);
  const achter = vlak(B, schuin, v3(0, H * 0.425, -D * 0.75), [-Math.atan2(D * 0.5, H * 0.85), 0, 0], [24, 8]);
  g.userData.achterNet = achter;
  g.userData.basis = Float32Array.from(achter.geometry.attributes.position!.array as ArrayLike<number>);
  g.userData.hoogte = schuin;
  vlak(B, D * 0.5, v3(0, H * 0.925, -D * 0.25), [Math.PI / 2 - Math.atan2(H * 0.15, D * 0.5), 0, 0]);
  for (const x of [-B / 2, B / 2]) vlak(D, H * 0.9, v3(x, H * 0.45, -D / 2), [0, Math.PI / 2, 0]);
  g.position.set(o.x, 0, o.y);
  g.rotation.y = -((o.hoek ?? 0) * Math.PI) / 180;
  return g;
}

function materiaal(o: VeldObject, netTex: Texture, materialen: Material[]): Object3D | null {
  const kleur = (standaard: string) => {
    const m = new MeshLambertMaterial({ color: o.kleur ?? standaard });
    materialen.push(m);
    return m;
  };
  const opGrond = (m: Object3D, h = 0) => {
    m.position.set(o.x, h, o.y);
    m.rotation.y = -((o.hoek ?? 0) * Math.PI) / 180;
    return m;
  };
  switch (o.soort) {
    case 'goal':
    case 'klein-goal':
      return goal(o, netTex, materialen);
    case 'doelnet': {
      // Doek net achter de palen, met een rond gat in elke hoek (wit omrand).
      const { B, H } = netMaten(o);
      const vorm = new Shape();
      vorm.moveTo(-B / 2 + 0.04, 0.02);
      vorm.lineTo(B / 2 - 0.04, 0.02);
      vorm.lineTo(B / 2 - 0.04, H - 0.03);
      vorm.lineTo(-B / 2 + 0.04, H - 0.03);
      vorm.lineTo(-B / 2 + 0.04, 0.02);
      const g = new Group();
      const rand = kleur('#ffffff');
      for (const gat of doelnetGaten(B, H)) {
        const p = new Path();
        p.absarc(gat.x, gat.h, gat.r, 0, Math.PI * 2, true);
        vorm.holes.push(p);
        const ring = new Mesh(new RingGeometry(gat.r, gat.r + 0.045, 28), rand);
        ring.position.set(gat.x, gat.h, -0.075);
        g.add(ring);
      }
      const doek = new Mesh(new ShapeGeometry(vorm, 28), new MeshLambertMaterial({ color: DOELNET_KLEUR, side: DoubleSide }));
      materialen.push(doek.material as Material);
      doek.position.z = -0.08;
      g.add(doek);
      return opGrond(g);
    }
    case 'pion':
      return opGrond(new Mesh(new ConeGeometry(0.13, 0.32, 18), kleur('#ff7a1a')), 0.16);
    case 'hoedje':
      return opGrond(new Mesh(new CylinderGeometry(0.06, 0.21, 0.07, 22, 1, true), kleur('#ffd23f')), 0.035);
    case 'paaltje': {
      const g = new Group();
      const h = o.hoogte ?? 1.5;
      const paal = new Mesh(new CylinderGeometry(0.025, 0.025, h, 8), kleur('#ffd23f'));
      paal.position.y = h / 2;
      const voet = new Mesh(new CylinderGeometry(0.12, 0.14, 0.05, 14), kleur('#2b2b2b'));
      voet.position.y = 0.025;
      g.add(paal, voet);
      return opGrond(g);
    }
    case 'horde': {
      const g = new Group();
      const w = o.breedte ?? 0.8;
      const h = o.hoogte ?? HORDE.laag;
      const m = kleur(h >= 0.25 ? '#e8590c' : '#ff922b');
      const lat = new Mesh(new BoxGeometry(w, 0.035, 0.035), m);
      lat.position.y = h;
      g.add(lat);
      for (const x of [-w / 2, w / 2]) {
        const poot = new Mesh(new BoxGeometry(0.035, h, 0.035), m);
        poot.position.set(x, h / 2, 0);
        const voet = new Mesh(new BoxGeometry(0.04, 0.03, 0.35), m);
        voet.position.set(x, 0.015, 0);
        g.add(poot, voet);
      }
      return opGrond(g);
    }
    case 'ladder': {
      // Plat op het gras: twee zijlatten en sporten om de 45 cm.
      const g = new Group();
      const L = o.lengte ?? 4;
      const W = o.breedte ?? 0.5;
      const m = kleur('#ffd23f');
      for (const x of [-W / 2, W / 2]) {
        const zij = new Mesh(new BoxGeometry(0.035, 0.018, L), m);
        zij.position.set(x, 0.009, 0);
        g.add(zij);
      }
      const n = Math.max(1, Math.round(L / 0.45));
      const sport = new BoxGeometry(W, 0.016, 0.03);
      for (let i = 0; i <= n; i++) {
        const sp = new Mesh(sport, m);
        sp.position.set(0, 0.008, -L / 2 + (L * i) / n);
        g.add(sp);
      }
      return opGrond(g);
    }
    case 'stok': {
      const stok = new Mesh(new CylinderGeometry(0.018, 0.018, o.lengte ?? 1.5, 8), kleur('#f5f5f5'));
      stok.rotation.z = Math.PI / 2;
      stok.position.y = 0.018;
      const g = new Group();
      g.add(stok);
      return opGrond(g);
    }
    case 'ring': {
      const ring = new Mesh(new TorusGeometry(0.35, 0.022, 6, 36), kleur('#3fa9f5'));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.022;
      const g = new Group();
      g.add(ring);
      return opGrond(g);
    }
    case 'net': {
      // Twee paaltjes met een net/lint; de bovenkant op de ingestelde hoogte.
      const g = new Group();
      const w = o.breedte ?? 6;
      const h = o.hoogte ?? 1;
      const paal = kleur('#2b2b2b');
      for (const x of [-w / 2, w / 2]) {
        const p = new Mesh(new CylinderGeometry(0.03, 0.03, h + 0.05, 8), paal);
        p.position.set(x, (h + 0.05) / 2, 0);
        g.add(p);
      }
      const doekHoogte = Math.min(h, 0.6);
      const doek = new Mesh(
        herhaalUV(new PlaneGeometry(w, doekHoogte), w, doekHoogte, 0.12),
        new MeshBasicMaterial({ map: netTex, transparent: true, side: DoubleSide, opacity: 0.85, depthWrite: false, forceSinglePass: true }),
      );
      doek.position.set(0, h - doekHoogte / 2, 0);
      const band = new Mesh(new BoxGeometry(w, 0.05, 0.02), kleur('#ffffff'));
      band.position.set(0, h - 0.025, 0);
      g.add(doek, band);
      return opGrond(g);
    }
    case 'bank': {
      const g = new Group();
      const w = o.breedte ?? 2.5;
      const hout = kleur('#b07a45');
      const zit = new Mesh(new BoxGeometry(w, 0.05, 0.3), hout);
      zit.position.y = 0.42;
      const balk = new Mesh(new BoxGeometry(w - 0.2, 0.08, 0.06), hout);
      balk.position.y = 0.2;
      g.add(zit, balk);
      for (const x of [-w / 2 + 0.15, w / 2 - 0.15]) {
        const poot = new Mesh(new BoxGeometry(0.05, 0.42, 0.28), hout);
        poot.position.set(x, 0.21, 0);
        g.add(poot);
      }
      return opGrond(g);
    }
    case 'kooi': {
      // Pannakooi: vier lage boardingwanden (0,5 m).
      const g = new Group();
      const w = o.breedte ?? 7;
      const l = o.lengte ?? 5;
      const wand = kleur('#2f5d8c');
      const h = 0.5;
      const wanden: [number, number, number, number][] = [
        [w, 0.06, 0, -l / 2],
        [w, 0.06, 0, l / 2],
        [0.06, l, -w / 2, 0],
        [0.06, l, w / 2, 0],
      ];
      for (const [bw, bl, x, z] of wanden) {
        const m = new Mesh(new BoxGeometry(bw, h, bl), wand);
        m.position.set(x, h / 2, z);
        g.add(m);
      }
      return opGrond(g);
    }
    case 'pop': {
      // Pop/dummy: één figuur zoals in een muurtje, in een opvallende kleur.
      const g = new Group();
      const pop = new Mesh(new CapsuleGeometry(0.22, 1.35, 4, 10), kleur('#e98b2a'));
      pop.position.y = 0.9;
      pop.scale.z = 0.6;
      g.add(pop);
      return opGrond(g);
    }
    case 'keepersmat': {
      // Landingskussen: dik blauw kussen.
      const h = o.hoogte ?? 0.2;
      const m = new Mesh(new BoxGeometry(o.breedte ?? 2, h, o.lengte ?? 1), kleur('#2f6fd6'));
      return opGrond(m, h / 2);
    }
    case 'muurtje': {
      const g = new Group();
      const n = Math.max(2, Math.round((o.breedte ?? 2.4) / 0.6));
      const m = kleur('#9aa5ad');
      const geo = new CapsuleGeometry(0.22, 1.35, 4, 10);
      for (let i = 0; i < n; i++) {
        const pop = new Mesh(geo, m);
        pop.position.set((i - (n - 1) / 2) * 0.56, 0.9, 0);
        pop.scale.z = 0.6;
        g.add(pop);
      }
      return opGrond(g);
    }
    case 'rebounder': {
      const g = new Group();
      const w = o.breedte ?? 1.2;
      const doek = new Mesh(new PlaneGeometry(w, 0.9), new MeshBasicMaterial({ map: netTex, transparent: true, side: DoubleSide, opacity: 0.9, forceSinglePass: true }));
      doek.position.set(0, 0.45, 0);
      doek.rotation.x = -0.45;
      const frame = new Mesh(new BoxGeometry(w, 0.05, 0.05), kleur('#3a3a3a'));
      frame.position.set(0, 0.85, -0.2);
      g.add(doek, frame);
      return opGrond(g);
    }
    case 'tekst': {
      if (!o.tekst) return null;
      const tekst = o.tekst;
      const tex = canvasTextuur(512, 128, (ctx) => {
        ctx.font = '700 72px "Barlow Condensed", system-ui, sans-serif';
        // Lange tekst kleiner, zodat hij altijd op het label past.
        const past = Math.min(72, Math.floor((72 * 488) / ctx.measureText(tekst).width));
        if (past < 72) ctx.font = `700 ${past}px "Barlow Condensed", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 12;
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.strokeText(tekst, 256, 66);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(tekst, 256, 66);
      });
      const s = new Sprite(new SpriteMaterial({ map: tex, transparent: true }));
      const w = o.breedte ?? 4;
      s.scale.set(w, w / 4, 1);
      s.position.set(o.x, 0.2 + w * 0.15, o.y);
      return s;
    }
    default:
      return null;
  }
}

// ---------- poppetjes ----------

interface Figuur {
  o: VeldObject;
  soort: PopSoort;
  kleuren: PopKleuren;
  sk: Skelet;
  staat: PopStaat;
  zaad: number;
  badge?: Sprite;
  /** Rugnummer op het shirt (volgt de romp). */
  rug?: Mesh;
  naam?: Sprite;
  label: string;
  team?: Team;
  /** Keeper (bij meer keepers): gekleurde ring met nummer op het gras, onder hem. */
  ring?: Group;
}

/** Vast getal 0–1 per persoon (uit de id): wiebelfase, haar- en huidkleur. */
function zaadVan(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}

/** Zachte, ronde schaduw (donker in het midden, vervaagt naar de rand). */
function schaduwTextuur(): CanvasTexture {
  return canvasTextuur(64, 64, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.75)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  });
}

/** Ring op het gras onder een keeper: rand in zijn tint met een klein nummer in het midden (ligt plat). */
function maakRing(label: string, kleur: string, materialen: Material[], texturen: Texture[]): Group {
  const g = new Group();
  const randMat = new MeshBasicMaterial({ color: kleur, transparent: true, opacity: 0.95, depthWrite: false });
  const rand = new Mesh(new RingGeometry(0.5, 0.64, 40), randMat);
  rand.rotation.x = -Math.PI / 2;
  const tex = nummerTextuur(label, kleur);
  const schijfMat = new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const schijf = new Mesh(new PlaneGeometry(0.56, 0.56), schijfMat);
  schijf.name = 'nummer';
  // Het nummer ligt vóór de keeper (aan de kant van de camera), zodat het lijf het niet afdekt.
  schijf.position.y = 0.002;
  g.add(rand, schijf);
  g.renderOrder = 1;
  materialen.push(randMat, schijfMat);
  texturen.push(tex);
  return g;
}

/** Naam in een donker pilletje (tactiekbord), als sprite onder de voeten. */
function naamTextuur(naam: string): { tex: CanvasTexture; verhouding: number } {
  const meet = document.createElement('canvas').getContext('2d')!;
  meet.font = '650 44px Inter, system-ui, sans-serif';
  const w = Math.ceil(meet.measureText(naam).width + 40);
  const teken = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, w, 64);
    ctx.fillStyle = 'rgba(10,25,15,0.8)';
    ctx.beginPath();
    ctx.roundRect(2, 4, w - 4, 56, 28);
    ctx.fill();
    ctx.font = '650 44px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(naam, w / 2, 34);
  };
  return { tex: canvasTextuur(w, 64, teken), verhouding: w / 64 };
}

/** Rugnummer: vlak op de rug van de romp (in het assenstelsel van de romp). */
const RUG = new Matrix4().compose(new Vector3(0, 0.27, -0.118), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI), new Vector3(1, 1, 1));

function maakFiguur(o: VeldObject, kleur: string, rugGeo: PlaneGeometry, materialen: Material[], texturen: Texture[], keeperNummer = false, naam?: string): Figuur {
  const soort: PopSoort = o.soort === 'keeper' ? 'keeper' : o.soort === 'trainer' ? 'trainer' : 'speler';
  const zaad = zaadVan(o.id);
  const label = o.soort === 'trainer' ? 'T' : o.nummer !== undefined ? String(o.nummer) : '';
  const f: Figuur = { o, soort, kleuren: popKleuren(soort, kleur, zaad), sk: maakSkelet(), staat: nieuweStaat(), zaad, label, team: o.team };
  // Keepers: geen nummer op of boven het lijf (dat dekt de keepertechniek af); bij meer keepers een ring op het gras.
  if (label && o.soort !== 'keeper') {
    // Rugnummer op het shirt …
    const rugTex = nummerTextuur(label, null);
    const rugMat = new MeshBasicMaterial({ map: rugTex, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 });
    f.rug = new Mesh(rugGeo, rugMat);
    f.rug.matrixAutoUpdate = false;
    // … en een badge boven het hoofd, van alle kanten (en van boven) leesbaar.
    const badgeTex = nummerTextuur(label, kleur);
    // Vaste grootte op het scherm (ook leesbaar als de camera ver weg staat).
    const badgeMat = new SpriteMaterial({ map: badgeTex, depthTest: false, transparent: true, sizeAttenuation: false });
    f.badge = new Sprite(badgeMat);
    f.badge.scale.set(0.05, 0.05, 1);
    // Op het scherm altijd net bóven het hoofd (ook van boven gezien niet op het lijf).
    f.badge.center.set(0.5, -0.12);
    f.badge.renderOrder = 10;
    materialen.push(rugMat, badgeMat);
    texturen.push(rugTex, badgeTex);
  }
  if (naam) {
    const { tex, verhouding } = naamTextuur(naam);
    const mat = new SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: false });
    f.naam = new Sprite(mat);
    f.naam.scale.set(0.026 * verhouding, 0.026, 1);
    f.naam.center.set(0.5, 1.25);
    f.naam.renderOrder = 11;
    materialen.push(mat);
    texturen.push(tex);
  }
  if (keeperNummer && label) f.ring = maakRing(label, kleur, materialen, texturen);
  return f;
}

/** Snelheid waarbij de beweging "vol" is (voor de grootte van de pas). */
const VOL: Record<Manier, number> = {
  jog: 4,
  sprint: 6,
  wandel: 1.4,
  huppel: 2.8,
  kniehef: 1.8,
  hakbil: 1.8,
  sprong: 2.2,
  zijwaarts: 2.2,
  achteruit: 2.4,
  voetenwerk: 1.8,
  hordes: 2.4,
  kruispas: 2.4,
  verdedigend: 1.2,
  schijn: 1,
};

interface Pose {
  benen: [number, number];
  spreid: [number, number];
  armen: [number, number];
  armenOpzij: number;
  veer: number;
  voorover: number;
}

/**
 * Eenvoudige houding per loopwijze (heup- en schouderhoeken, negatief = naar voren). Het nieuwe poppetje
 * (poppetje.ts) rekent zelf met voetdoelen; deze samenvatting blijft voor de tests en als referentie.
 */
export function pose(manier: Manier | undefined, snelheid: number, fase: number, liggen = 0): Pose {
  const k = manier ? klem(snelheid / (VOL[manier] * 0.7)) * (1 - liggen) : 0;
  const sin = Math.sin(fase);
  const op = Math.max(0, sin); // linkerbeen naar voren/omhoog
  const neer = Math.max(0, -sin); // rechterbeen
  const p: Pose = { benen: [0, 0], spreid: [0, 0], armen: [0, 0], armenOpzij: 0.08, veer: 0, voorover: 0 };
  if (!manier || k === 0) return p;
  const loop = (amp: number, arm: number) => {
    p.benen = [sin * amp * k, -sin * amp * k];
    p.armen = [-sin * arm * k, sin * arm * k];
  };
  switch (manier) {
    case 'sprint':
      loop(1.0, 1.0);
      p.voorover = 0.2 * k;
      break;
    case 'wandel':
      loop(0.35, 0.25);
      break;
    case 'achteruit':
      loop(0.5, 0.4);
      p.voorover = -0.08 * k;
      break;
    case 'verdedigend':
      // Laag en breed, kleine pasjes, armen iets opzij.
      loop(0.3, 0.2);
      p.voorover = 0.3 * k;
      p.armenOpzij = 0.35 * k;
      break;
    case 'voetenwerk':
      loop(0.5, 0.55);
      p.veer = Math.abs(sin) * 0.04 * k;
      p.voorover = 0.12 * k;
      break;
    case 'kniehef':
    case 'hordes':
      // Knie om en om hoog optillen.
      p.benen = [-op * 1.35 * k, -neer * 1.35 * k];
      p.armen = [neer * -0.9 * k, op * -0.9 * k];
      p.veer = Math.abs(sin) * (manier === 'hordes' ? 0.14 : 0.06) * k;
      break;
    case 'hakbil':
      // Hielen om en om naar de billen (bovenbeen blijft bijna recht naar beneden).
      p.benen = [op * 0.2 * k, neer * 0.2 * k];
      p.armen = [-neer * 0.8 * k, -op * 0.8 * k];
      p.veer = Math.abs(sin) * 0.05 * k;
      break;
    case 'huppel':
      p.benen = [(-op * 1.1 + neer * 0.3) * k, (-neer * 1.1 + op * 0.3) * k];
      p.armen = [-neer * 1.3 * k, -op * 1.3 * k];
      p.veer = Math.abs(sin) * 0.22 * k;
      break;
    case 'sprong':
      // Beide benen tegelijk, armen zwaaien mee omhoog.
      p.benen = [-Math.abs(sin) * 0.55 * k, -Math.abs(sin) * 0.55 * k];
      p.armen = [-Math.abs(sin) * 1.4 * k, -Math.abs(sin) * 1.4 * k];
      p.veer = Math.abs(sin) * 0.3 * k;
      break;
    case 'schijn':
      // Been zwaait om de bal heen, lijf en armen gaan mee opzij.
      p.spreid = [-Math.abs(sin) * 0.55 * k, 0];
      p.benen = [-Math.abs(sin) * 0.4 * k, 0];
      p.armenOpzij = 0.08 + Math.abs(sin) * 0.5 * k;
      break;
    case 'kruispas':
      // Het ene been kruist voor het andere langs (beide benen draaien dezelfde kant op).
      p.spreid = [sin * 0.38 * k, sin * 0.38 * k];
      p.benen = [-op * 0.25 * k, -neer * 0.25 * k];
      p.armenOpzij = 0.3 * k;
      p.veer = Math.abs(sin) * 0.05 * k;
      break;
    case 'zijwaarts':
      // Benen spreiden en sluiten.
      p.spreid = [-op * 0.45 * k, op * 0.45 * k];
      p.armenOpzij = 0.08 + op * 0.35 * k;
      p.veer = Math.abs(sin) * 0.07 * k;
      break;
    default:
      loop(0.75, 0.6);
  }
  return p;
}

// ---------- sporen ----------

interface SpoorMesh {
  mesh: Mesh;
  pijl: Mesh;
  /** Aantal indices per "stukje", zodat het spoor in hele stukjes groeit. */
  stuk: number;
  totaal: number;
}

/** Plat lint over het gras langs een reeks punten. */
function lint(punten: Punt[], breedte: number): BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i < punten.length; i++) {
    const a = punten[Math.max(0, i - 1)]!;
    const b = punten[Math.min(punten.length - 1, i + 1)]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = (-(b[1] - a[1]) / len) * (breedte / 2);
    const nz = ((b[0] - a[0]) / len) * (breedte / 2);
    const p = punten[i]!;
    pos.push(p[0] + nx, SPOOR_Y, p[1] + nz, p[0] - nx, SPOOR_Y, p[1] - nz);
    if (i > 0) {
      const k = (i - 1) * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

/** Een pad om langs te lopen: punt en richting (eenheidsvector) op afstand d. */
function langs(pad: Punt[]) {
  const lengtes = [0];
  for (let i = 1; i < pad.length; i++) lengtes.push(lengtes[i - 1]! + Math.hypot(pad[i]![0] - pad[i - 1]![0], pad[i]![1] - pad[i - 1]![1]));
  const totaal = lengtes[lengtes.length - 1]!;
  const op = (d: number): { p: Punt; u: Punt } => {
    d = klem(d, 0, totaal);
    let i = 1;
    while (i < pad.length - 1 && lengtes[i]! < d) i++;
    const a = pad[i - 1]!;
    const b = pad[i]!;
    const stuk = lengtes[i]! - lengtes[i - 1]! || 1;
    const f = (d - lengtes[i - 1]!) / stuk;
    return { p: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], u: [(b[0] - a[0]) / stuk, (b[1] - a[1]) / stuk] };
  };
  return { totaal, op };
}

/** Losse rechthoekjes langs een pad (streepjes of pasjes), in volgorde. */
function stukjes(pad: Punt[], stap: number, maak: (d: number, n: number) => { midden: Punt; u: Punt; lang: number; breed: number } | null): BufferGeometry {
  const { totaal } = langs(pad);
  const pos: number[] = [];
  const idx: number[] = [];
  let k = 0;
  for (let d = stap / 2, n = 0; d < totaal; d += stap, n++) {
    const s = maak(d, n);
    if (!s) continue;
    const [ux, uz] = s.u;
    const [lx, lz] = [ux * (s.lang / 2), uz * (s.lang / 2)];
    const [bx, bz] = [-uz * (s.breed / 2), ux * (s.breed / 2)];
    const [mx, mz] = s.midden;
    pos.push(mx - lx + bx, SPOOR_Y, mz - lz + bz, mx - lx - bx, SPOOR_Y, mz - lz - bz, mx + lx + bx, SPOOR_Y, mz + lz + bz, mx + lx - bx, SPOOR_Y, mz + lz - bz);
    idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    k += 4;
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

/** Looplijn: streepjes langs het pad. */
function streepjes(pad: Punt[], breedte: number): BufferGeometry {
  const { op } = langs(pad);
  return stukjes(pad, 0.8, (d) => {
    const { p, u } = op(d);
    return { midden: p, u, lang: 0.45, breed: breedte };
  });
}

/** Pasjes: om en om links en rechts van het pad. */
function pasjes(pad: Punt[], paslengte: number): BufferGeometry {
  const { op } = langs(pad);
  return stukjes(pad, paslengte, (d, n) => {
    const { p, u } = op(d);
    const kant = n % 2 === 0 ? 1 : -1;
    return { midden: [p[0] - u[1] * 0.13 * kant, p[1] + u[0] * 0.13 * kant], u, lang: 0.2, breed: 0.11 };
  });
}

/** Punten om de 8 cm langs het pad (voor een vloeiend lint). */
function fijn(pad: Punt[]): Punt[] {
  const { totaal, op } = langs(pad);
  const n = Math.max(1, Math.ceil(totaal / 0.08));
  return Array.from({ length: n + 1 }, (_, i) => op((totaal * i) / n).p);
}

/** Golflijn (dribbel) langs het pad: zijwaarts golvend, aan begin en eind naar nul. */
function golfPunten(pad: Punt[]): Punt[] {
  const { totaal, op } = langs(pad);
  const golf = 1.3;
  const amp = 0.28;
  const n = Math.max(2, Math.ceil(totaal / 0.08));
  const punten: Punt[] = [];
  for (let i = 0; i <= n; i++) {
    const d = (totaal * i) / n;
    const { p, u } = op(d);
    const demp = Math.min(1, d / golf, (totaal - d) / (golf * 0.5));
    const w = Math.sin((d / golf) * Math.PI * 2) * amp * Math.max(0, demp);
    punten.push([p[0] - u[1] * w, p[1] + u[0] * w]);
  }
  return punten;
}

function pijlGeo(): BufferGeometry {
  const g = new BufferGeometry();
  // Driehoek die naar +x wijst, punt op (0,0).
  g.setAttribute('position', new Float32BufferAttribute([0, SPOOR_Y + 0.002, 0, -0.62, SPOOR_Y + 0.002, -0.3, -0.62, SPOOR_Y + 0.002, 0.3], 3));
  g.setIndex([0, 2, 1]);
  return g;
}

function maakSpoor(s: Spoor, kleur: string, pijl: BufferGeometry, materialen: Material[]): SpoorMesh {
  const mat = new MeshBasicMaterial({ color: kleur, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, transparent: true, opacity: 0.95, forceSinglePass: true });
  materialen.push(mat);
  let geo: BufferGeometry;
  let stuk = 6;
  if (s.soort === 'bal' && s.top > 0.05) {
    // Boog door de lucht: buisje langs de baan van de bal.
    const n = 48;
    const punten: Vector3[] = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      punten.push(v3(s.van[0] + (s.naar[0] - s.van[0]) * u, BAL_R + boog(s.top, u), s.van[1] + (s.naar[1] - s.van[1]) * u));
    }
    const radiaal = 6;
    geo = new TubeGeometry(new CatmullRomCurve3(punten), n, 0.045, radiaal, false);
    stuk = radiaal * 6;
  } else if (s.soort === 'loop' && s.manier && PASJES.includes(s.manier)) {
    geo = pasjes(s.pad, PASLENGTE[s.manier] ?? 0.45);
  } else if (s.soort === 'loop') {
    geo = streepjes(s.pad, SPOOR_BREED * 0.9);
  } else if (s.soort === 'dribbel') {
    geo = lint(golfPunten(s.pad), SPOOR_BREED * 0.8);
  } else {
    geo = lint(fijn(s.pad), SPOOR_BREED);
  }
  const mesh = new Mesh(geo, mat);
  mesh.renderOrder = 1;
  const p = new Mesh(pijl, mat);
  p.position.set(s.naar[0], 0, s.naar[1]);
  const voor = s.pad[s.pad.length - 2] ?? s.van;
  p.rotation.y = -Math.atan2(s.naar[1] - voor[1], s.naar[0] - voor[0]);
  return { mesh, pijl: p, stuk, totaal: geo.index!.count };
}

// ---------- camera ----------

interface CameraDoel {
  positie: Vector3;
  doel: Vector3;
}

function cameraDoelen(t: Tekening, u: Uitsnede, aspect: number, fov: number): Record<CameraStand, CameraDoel> {
  const c = v3(u.x + u.breedte / 2, 0, u.y + u.lengte / 2);
  const tan = Math.tan((fov * Math.PI) / 360);
  const passendLengte = (u.lengte / 2 / tan) * 1.04;
  const passendBreedte = (u.breedte / 2 / (tan * aspect)) * 1.04;
  const passend = Math.max(passendLengte, passendBreedte);

  const boven: CameraDoel = { positie: c.clone().add(v3(0, passend, passend * 0.002)), doel: c.clone() };

  // Schuin: ± 60° vanaf recht boven en dichterbij dan bovenaanzicht (de verre kant wordt toch kleiner).
  const hoek = 1.05;
  // De breedte moet er helemaal op (lange banen); in de diepte mag hij dichterbij.
  const afstand = Math.max(passendLengte * 0.74, passendBreedte * 0.98);
  const schuinDoel = c.clone().add(v3(0, 0, -u.lengte * 0.06));
  const schuin: CameraDoel = {
    positie: schuinDoel.clone().add(v3(0, Math.cos(hoek) * afstand, Math.sin(hoek) * afstand)),
    doel: schuinDoel,
  };

  // Achter het (eerste) goal, kijkend het veld in.
  const g = t.objecten.find((o) => o.soort === 'goal') ?? t.objecten.find((o) => o.soort === 'klein-goal');
  const gp = g ? v3(g.x, 0, g.y) : v3(c.x, 0, u.y);
  const gh = ((g?.hoek ?? 0) * Math.PI) / 180;
  const richting = v3(-Math.sin(gh), 0, Math.cos(gh)); // opening van het goal (hoek 0 = +z)
  const k = klem(u.lengte * 0.38, 4, 14);
  const achter: CameraDoel = {
    positie: gp
      .clone()
      .add(richting.clone().multiplyScalar(-(k * 0.45 + 3)))
      .add(v3(0, 3.4 + k * 0.32, 0)),
    doel: gp.clone().add(richting.clone().multiplyScalar(k * 1.3)),
  };
  return { boven, schuin, achter };
}

// ---------- de weergave ----------

export function maakWeergave3D(tekening: Tekening, tijdlijn: Tijdlijn, opties: Opties3D = {}): Weergave3D {
  const renderer = new WebGLRenderer({ antialias: !opties.eenvoudig, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('Geen WebGL');
  const canvas = renderer.domElement;
  canvas.className = 'speler-canvas speler-canvas-3d';

  const kleuren: Kleuren = leesKleuren();
  const materialen: Material[] = [];
  const texturen: Texture[] = [];
  const scene = new Scene();
  scene.background = new Color(LUCHT);
  const u = uitsnede(tekening);
  const { breedte: B, lengte: L } = veldMaten(tekening);

  // Licht: hemel + zon.
  scene.add(new HemisphereLight('#ffffff', '#3d6b45', 2.1));
  const zon = new DirectionalLight('#ffffff', 1.6);
  zon.position.set(-30, 60, 45);
  scene.add(zon);

  // Grasmat met veldlijnen (zelfde tekenwerk als 2D) + groot grasvlak eromheen tot de horizon.
  const marge = 14;
  const x0 = Math.min(u.x, 0) - marge;
  const y0 = Math.min(u.y, 0) - marge;
  const x1 = Math.max(u.x + u.breedte, B) + marge;
  const y1 = Math.max(u.y + u.lengte, L) + marge;
  const gebied: Uitsnede = { x: x0, y: y0, breedte: x1 - x0, lengte: y1 - y0 };
  const pxPerM = klem(2048 / Math.max(gebied.breedte, gebied.lengte), 8, 32);
  const grasTex = canvasTextuur(Math.round(gebied.breedte * pxPerM), Math.round(gebied.lengte * pxPerM), (ctx) => tekenGrasmat(ctx, ctx.canvas.width, ctx.canvas.height, tekening, gebied, kleuren));
  grasTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  grasTex.minFilter = LinearMipmapLinearFilter;
  const grasMat = new MeshLambertMaterial({ map: grasTex });
  const gras = new Mesh(new PlaneGeometry(gebied.breedte, gebied.lengte), grasMat);
  gras.rotation.x = -Math.PI / 2;
  gras.position.set(x0 + gebied.breedte / 2, 0, y0 + gebied.lengte / 2);
  const ver = new Mesh(new PlaneGeometry(2000, 2000), new MeshLambertMaterial({ color: kleuren.gras1 }));
  ver.rotation.x = -Math.PI / 2;
  ver.position.set(gras.position.x, -0.03, gras.position.z);
  scene.add(gras, ver);
  materialen.push(grasMat, ver.material as Material);
  texturen.push(grasTex);

  // Materiaal (goals onthouden, zodat het net kan uitbollen).
  const netTex = netTextuur();
  texturen.push(netTex);
  const goals = new Map<string, Group>();
  for (const o of tekening.objecten) {
    if (PLAT.includes(o.soort) && !isKussen(o)) continue;
    const m = materiaal(o, netTex, materialen);
    if (!m) continue;
    scene.add(m);
    if (m instanceof Group && m.userData.achterNet) goals.set(o.id, m);
  }
  const bollen = new Set<string>();
  /** Bal in het net: achternet bolt naar achteren uit rond de plek van de bal. */
  const bolNet = (inslagen: NetInslag[]) => {
    for (const [id, g] of goals) {
      const inslag = inslagen.find((n) => n.id === id);
      if (!inslag && !bollen.has(id)) continue;
      const net = g.userData.achterNet as Mesh;
      const basis = g.userData.basis as Float32Array;
      const pos = net.geometry.attributes.position!;
      const half = (g.userData.hoogte as number) / 2;
      if (!inslag) {
        (pos.array as Float32Array).set(basis);
        bollen.delete(id);
      } else {
        const lx = g.worldToLocal(new Vector3(inslag.x, 0, inslag.y)).x;
        for (let i = 0; i < pos.count; i++) {
          const x = basis[i * 3]!;
          const y = basis[i * 3 + 1]!;
          const w = Math.exp(-((x - lx) ** 2) / 1.1) * (1 - Math.abs(y) / (half * 1.05));
          pos.setZ(i, basis[i * 3 + 2]! - inslag.sterkte * 0.55 * w);
        }
        bollen.add(id);
      }
      pos.needsUpdate = true;
    }
  };

  // Poppetjes: één InstancedMesh per lichaamsdeel voor iedereen samen (zie poppetje.ts).
  const personen = tekening.objecten.filter((o) => o.soort === 'speler' || o.soort === 'keeper' || o.soort === 'trainer');
  const poppetjes = new Poppetjes(personen.length, !!opties.eenvoudig);
  for (const m of poppetjes.lijst) scene.add(m);
  const rugGeo = new PlaneGeometry(0.21, 0.21);
  const schaduwTex = schaduwTextuur();
  texturen.push(schaduwTex);
  const schaduwMat = new MeshBasicMaterial({ map: schaduwTex, color: '#000000', transparent: true, opacity: 0.34, depthWrite: false });
  materialen.push(schaduwMat);
  const schaduwen = new InstancedMesh(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2), schaduwMat, Math.max(1, personen.length));
  schaduwen.instanceMatrix.setUsage(DynamicDrawUsage);
  schaduwen.frustumCulled = false;
  scene.add(schaduwen);
  const figuren = new Map<string, Figuur>();
  // Nummers bij keepers alleen als er meer dan één keeper is (anders is de keeperskleur genoeg).
  const meerKeepers = tekening.objecten.filter((o) => o.soort === 'keeper').length > 1;
  for (const o of personen) {
    const f = maakFiguur(o, persoonKleur(o, kleuren), rugGeo, materialen, texturen, o.soort === 'keeper' && meerKeepers, tekening.namen ? o.naam : undefined);
    figuren.set(o.id, f);
    for (const x of [f.rug, f.badge, f.naam, f.ring]) if (x) scene.add(x);
  }

  // Ballen.
  const balTex = balTextuur();
  texturen.push(balTex);
  const balMat = new MeshLambertMaterial({ map: balTex });
  const balGeo = new SphereGeometry(BAL_R, 20, 14);
  materialen.push(balMat);
  const ballen = new Map<string, { mesh: Mesh; schaduw: Mesh; vorige?: Vector3; hand?: { p: Vector3; t: number } }>();
  for (const o of tekening.objecten) {
    if (o.soort !== 'bal') continue;
    // Reactiebal (geel, bobbelig) of tennisbal (klein, geelgroen): eigen kleur en maat.
    let mesh: Mesh;
    if (o.variant) {
      const m = new MeshLambertMaterial({ color: o.variant === 'tennisbal' ? '#d4e83a' : '#ffd23f' });
      materialen.push(m);
      mesh = new Mesh(o.variant === 'reactiebal' ? new IcosahedronGeometry(BAL_R * 0.8, 0) : balGeo, m);
      if (o.variant === 'tennisbal') mesh.scale.setScalar(0.55);
    } else {
      mesh = new Mesh(balGeo, balMat);
    }
    const sm = new MeshBasicMaterial({ map: schaduwTex, color: '#000000', transparent: true, opacity: 0.45, depthWrite: false });
    materialen.push(sm);
    const schaduw = new Mesh(new PlaneGeometry(BAL_R * 2.6, BAL_R * 2.6), sm);
    schaduw.rotation.x = -Math.PI / 2;
    ballen.set(o.id, { mesh, schaduw });
    scene.add(mesh, schaduw);
  }

  // Sporen (alvast helemaal opgebouwd; tijdens de animatie groeit het zichtbare deel mee).
  const pijl = pijlGeo();
  const spoorKleur = { bal: kleuren.spoorBal, loop: kleuren.spoorLoop, dribbel: kleuren.spoorDribbel };
  const sporen = tijdlijn.sporen.map((s) => {
    const sm = maakSpoor(s, spoorKleur[s.soort], pijl, materialen);
    sm.mesh.visible = sm.pijl.visible = false;
    scene.add(sm.mesh, sm.pijl);
    return sm;
  });

  // Getekende lijnen (editor): altijd helemaal zichtbaar, op de plek van het begin van de oefening.
  const begin = standOp(tijdlijn, 0);
  const plek = (id: string): Punt | undefined => {
    const o = begin.objecten.get(id);
    return o ? [o.x, o.y] : undefined;
  };
  for (const l of tekening.lijnen ?? []) {
    const pad = lijnPunten(l, plek);
    if (pad.length < 2) continue;
    const s: Spoor = { soort: l.soort, pad, van: pad[0]!, naar: pad[pad.length - 1]!, t0: 0, t1: 0, ease: 'bal', top: 0, id: 'lijn' };
    const sm = maakSpoor(s, spoorKleur[l.soort], pijl, materialen);
    scene.add(sm.mesh, sm.pijl);
  }

  // Camera + draaien/zoomen.
  const camera = new PerspectiveCamera(40, 1, 0.3, 3000);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.rotateSpeed = 0.8;
  controls.maxPolarAngle = 1.36; // nooit onder het gras
  controls.minDistance = 4;
  let doelen = cameraDoelen(tekening, u, 1, camera.fov);
  let stand: CameraStand = tekening.camera ?? 'schuin';
  let zelfVerplaatst = false;
  let overgang: { van: CameraDoel; naar: CameraDoel; start: number; duur: number } | null = null;

  const zetGrenzen = () => {
    const passend = doelen.boven.positie.distanceTo(doelen.boven.doel);
    controls.maxDistance = Math.min(400, passend * 2.2);
    scene.fog = new Fog(LUCHT, passend * 2.5, passend * 7);
  };
  const plaats = (d: CameraDoel) => {
    camera.position.copy(d.positie);
    controls.target.copy(d.doel);
    camera.lookAt(d.doel);
    controls.update();
  };
  // Alleen voor de browsertests (vlag in localStorage): camera dichtbij op een punt richten, bv. een keeper.
  let testVlag = false;
  try {
    testVlag = localStorage.getItem('trainersapp.testCamera') === '1';
  } catch {
    /* geen opslag */
  }
  if (testVlag) {
    // Optioneel: kijkrichting (graden, wereld) en hoogte van de camera (graden boven het gras), bv. van opzij.
    (window as unknown as { __camera3d?: unknown }).__camera3d = (x: number, y: number, afstand: number, kijk?: number, hoogte = 12) => {
      const richting = camera.position.clone().sub(controls.target).normalize();
      if (kijk !== undefined) {
        const r = (kijk * Math.PI) / 180;
        const e = (hoogte * Math.PI) / 180;
        richting.set(-Math.cos(r) * Math.cos(e), Math.sin(e), -Math.sin(r) * Math.cos(e));
      }
      const doel = v3(x, 0.9, y);
      plaats({ positie: doel.clone().add(richting.multiplyScalar(afstand)), doel });
      zelfVerplaatst = true;
    };
    (window as unknown as { __info3d?: unknown }).__info3d = () => ({
      tekenopdrachten: renderer.info.render.calls,
      driehoeken: renderer.info.render.triangles,
      poppetjes: figuren.size,
      eenvoudig: !!opties.eenvoudig,
    });
    (window as unknown as { __three3d?: unknown }).__three3d = { renderer, scene };
  }

  let tekenenGevraagd = 0;
  const render = () => renderer.render(scene, camera);
  const lus = (nu: number) => {
    tekenenGevraagd = 0;
    let bezig = false;
    if (overgang) {
      const v = glad((nu - overgang.start) / overgang.duur);
      camera.position.lerpVectors(overgang.van.positie, overgang.naar.positie, v);
      controls.target.lerpVectors(overgang.van.doel, overgang.naar.doel, v);
      camera.lookAt(controls.target);
      if (v >= 1) {
        overgang = null;
        controls.enabled = true;
        controls.update();
      } else bezig = true;
    } else if (controls.update()) bezig = true;
    render();
    if (bezig) vraagTekenen();
  };
  const vraagTekenen = () => {
    if (!tekenenGevraagd) tekenenGevraagd = requestAnimationFrame(lus);
  };
  let gemeld = false;
  controls.addEventListener('change', vraagTekenen);
  controls.addEventListener('start', () => {
    zelfVerplaatst = true;
    if (!gemeld) {
      gemeld = true;
      opties.opInteractie?.();
    }
  });
  let opgeruimd = false;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    // Bij zelf opruimen (wisselen naar 2D, andere oefening) is dit geen fout.
    if (!opgeruimd) opties.opFout?.();
  });

  // Ander hesje (tikspel): shirt, kousen en nummerbadge in de nieuwe kleur.
  const badges = new Map<string, Texture>();
  const wisselHesje = (f: Figuur, team: Team | undefined) => {
    f.team = team;
    const kleur = persoonKleur(f.o, kleuren, team);
    zetHesje(f.kleuren, f.soort, kleur);
    if (f.badge && f.label) {
      const sleutel = `${f.label}|${kleur}`;
      let tex = badges.get(sleutel);
      if (!tex) {
        tex = nummerTextuur(f.label, kleur);
        badges.set(sleutel, tex);
        texturen.push(tex);
      }
      (f.badge.material as SpriteMaterial).map = tex;
    }
  };

  // ---------- stand tekenen ----------
  const tijdelijk = new Vector3();
  const schaal = new Vector3();
  const schaduwMatrix = new Matrix4();
  const schaduwDraai = new Quaternion();
  const Y_OMHOOG = new Vector3(0, 1, 0);
  let toonLoop = opties.looplijnen ?? true;
  let vorigeT = 0;
  let vorigeEcht = performance.now();
  const teken = (t: number, sprong = false) => {
    const nu = performance.now();
    const dtEcht = Math.min(0.1, (nu - vorigeEcht) / 1000);
    vorigeEcht = nu;
    // Terug naar het begin of een grote sprong: niet vloeiend overgaan.
    sprong ||= t < vorigeT || t - vorigeT > 0.3;
    const dtAnim = sprong ? 0 : t - vorigeT;
    vorigeT = t;
    const s = standOp(tijdlijn, t);

    // Waar de ballen zijn en wie welke bal heeft (zie poppetje.ts).
    const bi = balInvoer(s, [...ballen.keys()], BAL_R);
    const balPlek = bi.plek;

    const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
    const schermHoogte = renderer.domElement.height || 600;
    poppetjes.begin();
    let n = 0;
    for (const [id, f] of figuren) {
      const st = s.objecten.get(id);
      if (!st) continue;
      if (st.team !== f.team) wisselHesje(f, st.team);
      const balId = bi.houderVan.get(id);
      poseer(f.sk, f.staat, { s: st, soort: f.soort, t, dtEcht, dtAnim, sprong, zaad: f.zaad, ...persoonInvoer(id, f.soort, st, s, bi) });
      // Detail: fijn als hij groot genoeg in beeld is.
      const afst = Math.max(0.5, camera.position.distanceTo(f.sk.wortel.position));
      const fijn = (LENGTE / (afst * tanHalf)) * (schermHoogte / 2) > 85;
      poppetjes.teken(f.sk, f.kleuren, fijn);
      if (f.rug) {
        f.rug.matrix.multiplyMatrices(f.sk.romp.matrixWorld, RUG);
        f.rug.matrixWorldNeedsUpdate = true;
        f.rug.visible = fijn;
      }
      if (f.badge) boveHoofd(f.sk, f.badge.position);
      const bekken = f.sk.bekken.getWorldPosition(tijdelijk);
      if (f.naam) f.naam.position.set(bekken.x, 0.02, bekken.z);
      // Schaduw: rond als hij staat, langgerekt als hij ligt, kleiner als hij in de lucht is.
      const l = st.liggen;
      const dh = (st.duikHoek * Math.PI) / 180;
      const lucht = 1 - klem((f.sk.wortel.position.y - 0.05) / 3, 0, 0.6);
      schaduwMatrix.compose(tijdelijk.set(bekken.x, 0.012, bekken.z), schaduwDraai.setFromAxisAngle(Y_OMHOOG, -dh), schaal.set((0.85 + l * 1.5) * lucht, 1, 0.8 * lucht));
      schaduwen.setMatrixAt(n++, schaduwMatrix);
      if (f.ring) {
        f.ring.position.set(st.x - Math.cos(dh) * 0.55 * l, 0.016, st.y - Math.sin(dh) * 0.55 * l);
        // Nummer rechtop voor de camera, net vóór de keeper (camerakant), zodat het lijf het niet afdekt.
        const dxc = f.ring.position.x - camera.position.x;
        const dzc = f.ring.position.z - camera.position.z;
        const lengte = Math.hypot(dxc, dzc) || 1;
        // Van ver weg iets groter, zodat het nummer op een telefoon leesbaar blijft.
        f.ring.scale.setScalar(klem(camera.position.distanceTo(f.ring.position) / 14, 1, 2.2));
        const nummer = f.ring.getObjectByName('nummer')!;
        nummer.rotation.set(-Math.PI / 2, 0, Math.atan2(-dxc, -dzc));
        nummer.position.set((-dxc / lengte) * 0.66, 0.002, (-dzc / lengte) * 0.66);
      }
      // Gooien: tot het loslaten zit de bal in de hand.
      if (balId && f.staat.balInHand > 0) {
        balPlek.get(balId)!.copy(f.staat.hand);
        const b = ballen.get(balId)!;
        b.hand = { p: f.staat.hand.clone(), t };
      }
    }
    schaduwen.count = n;
    schaduwen.instanceMatrix.needsUpdate = true;
    poppetjes.klaar();

    for (const [id, b] of ballen) {
      const st = s.objecten.get(id);
      const p = balPlek.get(id);
      if (!st || !p) continue;
      // Net losgelaten uit de hand: in een korte overgang naar de baan van de tijdlijn.
      if (b.hand && !(st.houder && figuren.get(st.houder)?.staat.balInHand)) {
        const u = (t - b.hand.t) / 0.15;
        if (u >= 0 && u < 1 && !sprong) p.lerpVectors(b.hand.p, p.clone(), glad(u));
        else if (u >= 1 || u < 0 || sprong) b.hand = undefined;
      }
      const h = p.y;
      // Rollen: draaien om de as dwars op de beweging (in de lucht trager).
      if (b.vorige && !sprong) {
        const dx = p.x - b.vorige.x;
        const dz = p.z - b.vorige.z;
        const d = Math.hypot(dx, dz);
        if (d > 0.0001 && d < 5) {
          const q = new Quaternion().setFromAxisAngle(new Vector3(dz / d, 0, -dx / d), (d / BAL_R) * (h > BAL_R + 0.15 ? 0.35 : 1));
          b.mesh.quaternion.premultiply(q);
        }
      }
      b.vorige = p.clone();
      b.mesh.position.copy(p);
      // Schaduw recht onder de bal: kleiner en lichter naarmate hij hoger is (zo zie je de hoogte).
      b.schaduw.position.set(p.x, 0.014, p.z);
      const k = klem(1 - (h - BAL_R) / 7, 0.35, 1);
      b.schaduw.scale.setScalar(0.6 + 0.4 * k);
      (b.schaduw.material as MeshBasicMaterial).opacity = 0.5 * k * k;
    }

    bolNet(s.net);
    for (const sm of sporen) sm.mesh.visible = sm.pijl.visible = false;
    for (const sp of s.sporen) {
      const sm = sporen[sp.index];
      if (!sm || (sp.soort === 'loop' && !toonLoop)) continue;
      sm.mesh.visible = true;
      const n = Math.floor((sm.totaal / sm.stuk) * sp.fractie) * sm.stuk;
      sm.mesh.geometry.setDrawRange(0, sp.klaar ? sm.totaal : n);
      sm.pijl.visible = sp.klaar;
    }
    render();
  };

  // Alles wat niet beweegt (veld, goals, materiaal, lijnen) niet elk beeld opnieuw doorrekenen.
  const beweegt = new Set<Object3D>(poppetjes.lijst);
  beweegt.add(schaduwen);
  for (const b of ballen.values()) beweegt.add(b.mesh).add(b.schaduw);
  for (const f of figuren.values()) for (const x of [f.rug, f.badge, f.naam, f.ring]) if (x) beweegt.add(x);
  for (const kind of scene.children) {
    if (beweegt.has(kind)) continue;
    kind.traverse((o) => {
      o.updateMatrix();
      o.matrixAutoUpdate = false;
    });
  }
  scene.updateMatrixWorld(true);

  plaats(doelen[stand]);
  zetGrenzen();
  renderer.compile(scene, camera);

  return {
    element: canvas,
    teken,
    maat(breedte, hoogte, dpr) {
      renderer.setPixelRatio(Math.min(dpr, opties.eenvoudig ? 1.25 : 2));
      renderer.setSize(breedte, hoogte, false);
      canvas.style.height = `${Math.round(hoogte)}px`;
      camera.aspect = breedte / Math.max(1, hoogte);
      camera.updateProjectionMatrix();
      doelen = cameraDoelen(tekening, u, camera.aspect, camera.fov);
      zetGrenzen();
      if (!zelfVerplaatst && !overgang) plaats(doelen[stand]);
      teken(vorigeT, true);
    },
    camera(nieuw, direct = false) {
      stand = nieuw;
      zelfVerplaatst = false;
      const naar = doelen[nieuw];
      if (direct) {
        overgang = null;
        controls.enabled = true;
        plaats(naar);
        render();
        return;
      }
      controls.enabled = false;
      overgang = { van: { positie: camera.position.clone(), doel: controls.target.clone() }, naar, start: performance.now(), duur: 750 };
      vraagTekenen();
    },
    looplijnen(aan) {
      toonLoop = aan;
      teken(vorigeT, true);
    },
    opruimen() {
      opgeruimd = true;
      cancelAnimationFrame(tekenenGevraagd);
      controls.dispose();
      scene.traverse((o) => {
        if (o instanceof Mesh) o.geometry.dispose();
      });
      for (const m of materialen) m.dispose();
      poppetjes.opruimen();
      for (const t of texturen) t.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
