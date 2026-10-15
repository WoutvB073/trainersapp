import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  LinearMipmapLinearFilter,
  Material,
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
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { CameraStand, Manier, Punt, Team, Tekening, Uitsnede, VeldObject } from '../model/types';
import { HORDE } from '../model/types';
import { boog, PASJES, PASLENGTE, standOp, type ObjectStand, type Spoor, type Tijdlijn } from './timeline';
import { leesKleuren, persoonKleur, PLAT, tekenGrasmat, uitsnede, veldMaten, type Kleuren } from './render2d';
import type { Weergave } from './weergave';

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
}

const BAL_R = 0.16; // iets groter dan echt (0,11 m), zodat hij goed te zien is
const LUCHT = '#cfe6f2';
const HUID = '#e7b48f';
const BROEK = '#1f2933';
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
    const vlekken: Punt[] = [[32, 64], [96, 30], [96, 98], [160, 64], [224, 30], [224, 98], [0, 20], [256, 20]];
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
  const H = groot ? 2.44 : 1;
  const D = o.lengte ?? (groot ? 2 : 1.2);
  const r = groot ? 0.06 : 0.04;
  const g = new Group();
  const wit = new MeshLambertMaterial({ color: '#ffffff' });
  const net = new MeshBasicMaterial({ map: netTex, transparent: true, side: DoubleSide, depthWrite: false, opacity: 0.55 });
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
  const vlak = (w: number, h: number, pos: Vector3, rot: [number, number, number]) => {
    const m = new Mesh(herhaalUV(new PlaneGeometry(w, h), w, h, cel), net);
    m.position.copy(pos);
    m.rotation.set(...rot);
    m.renderOrder = 2;
    g.add(m);
  };
  // Achternet (schuin), zijnetten en dak.
  const schuin = Math.hypot(D * 0.5, H * 0.85);
  vlak(B, schuin, v3(0, H * 0.425, -D * 0.75), [-Math.atan2(D * 0.5, H * 0.85), 0, 0]);
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
      const doek = new Mesh(new PlaneGeometry(w, 0.9), new MeshBasicMaterial({ map: netTex, transparent: true, side: DoubleSide, opacity: 0.9 }));
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
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 12;
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.strokeText(tekst, 256, 66);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(tekst, 256, 66);
      });
      const s = new Sprite(new SpriteMaterial({ map: tex, transparent: true }));
      s.scale.set(4, 1, 1);
      s.position.set(o.x, 0.8, o.y);
      return s;
    }
    default:
      return null;
  }
}

// ---------- poppetjes ----------

interface Figuur {
  o: VeldObject;
  shirt: MeshLambertMaterial;
  kous: MeshLambertMaterial;
  badge?: Sprite;
  label: string;
  team?: Team;
  wortel: Group;
  benen: [Group, Group];
  armen: [Group, Group];
  schaduw: Mesh;
  hoek: number;
  fase: number;
  vorige?: { x: number; y: number; t: number };
}

interface Gedeeld {
  been: CylinderGeometry;
  arm: CylinderGeometry;
  romp: CapsuleGeometry;
  broek: CylinderGeometry;
  hoofd: SphereGeometry;
  rug: PlaneGeometry;
  schaduw: CircleGeometry;
  huid: MeshLambertMaterial;
  broekMat: MeshLambertMaterial;
  schaduwMat: MeshBasicMaterial;
}

function maakFiguur(o: VeldObject, kleur: string, d: Gedeeld, materialen: Material[], texturen: Texture[]): Figuur {
  const shirt = new MeshLambertMaterial({ color: kleur });
  const kous = new MeshLambertMaterial({ color: new Color(kleur).multiplyScalar(0.55) });
  materialen.push(shirt, kous);
  const wortel = new Group();

  const been = (x: number) => {
    const heup = new Group();
    heup.position.set(x, 0.88, 0);
    const m = new Mesh(d.been, kous);
    m.position.y = -0.44;
    heup.add(m);
    wortel.add(heup);
    return heup;
  };
  const arm = (x: number) => {
    const schouder = new Group();
    schouder.position.set(x, 1.5, 0);
    const m = new Mesh(d.arm, shirt);
    m.position.y = -0.3;
    schouder.add(m);
    wortel.add(schouder);
    return schouder;
  };
  const benen: [Group, Group] = [been(-0.1), been(0.1)];
  const armen: [Group, Group] = [arm(-0.29), arm(0.29)];

  const broek = new Mesh(d.broek, d.broekMat);
  broek.position.y = 0.9;
  const romp = new Mesh(d.romp, shirt);
  romp.position.y = 1.24;
  romp.scale.set(1.12, 1, 0.75);
  const hoofd = new Mesh(d.hoofd, d.huid);
  hoofd.position.y = 1.79;
  wortel.add(broek, romp, hoofd);

  const label = o.soort === 'trainer' ? 'T' : o.nummer !== undefined ? String(o.nummer) : '';
  let badge: Sprite | undefined;
  if (label) {
    // Rugnummer op het shirt …
    const rugTex = nummerTextuur(label, null);
    const rugMat = new MeshBasicMaterial({ map: rugTex, transparent: true });
    const rug = new Mesh(d.rug, rugMat);
    rug.position.set(0, 1.3, -0.158);
    rug.rotation.y = Math.PI;
    wortel.add(rug);
    // … en een badge boven het hoofd, van alle kanten (en van boven) leesbaar.
    const badgeTex = nummerTextuur(label, kleur);
    // Vaste grootte op het scherm (ook leesbaar als de camera ver weg staat).
    const badgeMat = new SpriteMaterial({ map: badgeTex, depthTest: false, transparent: true, sizeAttenuation: false });
    badge = new Sprite(badgeMat);
    badge.scale.set(0.058, 0.058, 1);
    badge.position.y = 2.3;
    badge.renderOrder = 10;
    wortel.add(badge);
    materialen.push(rugMat, badgeMat);
    texturen.push(rugTex, badgeTex);
  }

  const schaduw = new Mesh(d.schaduw, d.schaduwMat);
  schaduw.rotation.x = -Math.PI / 2;
  schaduw.position.y = 0.012;
  return { o, shirt, kous, badge, label, team: o.team, wortel, benen, armen, schaduw, hoek: 0, fase: 0 };
}

/** Kortste weg tussen twee hoeken (radialen). */
function hoekVerschil(a: number, b: number) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

const Y_AS = new Vector3(0, 1, 0);
const X_AS = new Vector3(1, 0, 0);

/** Snelheid waarbij de beweging "vol" is (voor de grootte van de pas). */
const VOL: Record<Manier, number> = {
  jog: 4,
  sprint: 6,
  wandel: 1.4,
  huppel: 2.8,
  kniehef: 1.8,
  sprong: 2.2,
  zijwaarts: 2.2,
  achteruit: 2.4,
  voetenwerk: 1.8,
  hordes: 2.4,
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

/** Houding van benen, armen en lijf per loopwijze. Negatieve rotatie = naar voren. */
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

/** Zet het poppetje in de stand van dit moment (lopen, duiken, opstaan, bal vasthouden). */
function poseer(f: Figuur, s: ObjectStand, t: number, dtEcht: number, sprong: boolean, heeftBal: boolean) {
  const keeper = f.o.soort === 'keeper';
  // Kijkrichting vloeiend draaien (de tijdlijn wisselt in één keer).
  const doel = Math.PI / 2 - (s.hoek * Math.PI) / 180;
  f.hoek = sprong ? doel : f.hoek + hoekVerschil(f.hoek, doel) * klem(dtEcht * 10);

  // Snelheid en pas komen uit de tijdlijn (ook bij doorspoelen precies goed).
  void t;

  // Duiken: het lijf kantelt naar de duikkant en gaat naar de grond (voeten schuiven iets mee).
  const l = s.liggen;
  const dh = (s.duikHoek * Math.PI) / 180;
  const dx = Math.cos(dh);
  const dz = Math.sin(dh);
  const p = pose(s.manier, s.snelheid, s.fase, l);
  f.wortel.position.set(s.x - dx * 1.45 * l, l * 0.2 + p.veer, s.y - dz * 1.45 * l);
  const draai = new Quaternion().setFromAxisAngle(Y_AS, f.hoek);
  if (p.voorover) draai.multiply(new Quaternion().setFromAxisAngle(X_AS, p.voorover));
  if (l > 0) {
    const kantel = new Quaternion().setFromAxisAngle(new Vector3(dz, 0, -dx), l * 1.5);
    f.wortel.quaternion.copy(kantel.multiply(draai));
  } else {
    f.wortel.quaternion.copy(draai);
  }

  // Benen en armen.
  for (const [i, b] of f.benen.entries()) b.rotation.set(p.benen[i]!, 0, p.spreid[i]!);
  for (const [i, a] of f.armen.entries()) {
    if (keeper && l > 0) {
      a.rotation.set(-l * 2.9, 0, 0); // armen gestrekt boven het hoofd, naar de bal
    } else if (keeper && heeftBal) {
      a.rotation.set(-1.2, 0, i === 0 ? -0.25 : 0.25); // bal voor de borst
    } else {
      a.rotation.set(p.armen[i]!, 0, (i === 0 ? -1 : 1) * p.armenOpzij);
    }
  }

  // Schaduw: rond als hij staat, langgerekt als hij ligt.
  f.schaduw.position.set(s.x - dx * 0.5 * l, 0.012, s.y - dz * 0.5 * l);
  f.schaduw.rotation.z = -dh;
  f.schaduw.scale.set(1 + l * 1.7, 1, 1);
}

/** Hoogte van een bal die deze persoon vasthoudt. */
function houdHoogte(f: Figuur | undefined, s: ObjectStand | undefined): number {
  if (!f || !s || f.o.soort !== 'keeper') return BAL_R;
  return 1.12 + (0.3 - 1.12) * s.liggen;
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
  const mat = new MeshBasicMaterial({ color: kleur, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, transparent: true, opacity: 0.95 });
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
    positie: gp.clone().add(richting.clone().multiplyScalar(-(k * 0.45 + 3))).add(v3(0, 3.4 + k * 0.32, 0)),
    doel: gp.clone().add(richting.clone().multiplyScalar(k * 1.3)),
  };
  return { boven, schuin, achter };
}

// ---------- de weergave ----------

export function maakWeergave3D(tekening: Tekening, tijdlijn: Tijdlijn, opties: Opties3D = {}): Weergave3D {
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
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
  const grasTex = canvasTextuur(Math.round(gebied.breedte * pxPerM), Math.round(gebied.lengte * pxPerM), (ctx) =>
    tekenGrasmat(ctx, ctx.canvas.width, ctx.canvas.height, tekening, gebied, kleuren),
  );
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

  // Materiaal.
  const netTex = netTextuur();
  texturen.push(netTex);
  for (const o of tekening.objecten) {
    if (PLAT.includes(o.soort)) continue;
    const m = materiaal(o, netTex, materialen);
    if (m) scene.add(m);
  }

  // Poppetjes.
  const gedeeld: Gedeeld = {
    been: new CylinderGeometry(0.075, 0.062, 0.88, 10),
    arm: new CylinderGeometry(0.055, 0.048, 0.6, 8),
    romp: new CapsuleGeometry(0.2, 0.42, 4, 14),
    broek: new CylinderGeometry(0.2, 0.21, 0.24, 14),
    hoofd: new SphereGeometry(0.13, 16, 12),
    rug: new PlaneGeometry(0.3, 0.3),
    schaduw: new CircleGeometry(0.45, 20),
    huid: new MeshLambertMaterial({ color: HUID }),
    broekMat: new MeshLambertMaterial({ color: BROEK }),
    schaduwMat: new MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.22, depthWrite: false }),
  };
  materialen.push(gedeeld.huid, gedeeld.broekMat, gedeeld.schaduwMat);
  const figuren = new Map<string, Figuur>();
  for (const o of tekening.objecten) {
    if (o.soort !== 'speler' && o.soort !== 'keeper' && o.soort !== 'trainer') continue;
    const f = maakFiguur(o, persoonKleur(o, kleuren), gedeeld, materialen, texturen);
    figuren.set(o.id, f);
    scene.add(f.wortel, f.schaduw);
  }

  // Ballen.
  const balTex = balTextuur();
  texturen.push(balTex);
  const balMat = new MeshLambertMaterial({ map: balTex });
  const balGeo = new SphereGeometry(BAL_R, 20, 14);
  materialen.push(balMat);
  const ballen = new Map<string, { mesh: Mesh; schaduw: Mesh; vorige?: Vector3 }>();
  for (const o of tekening.objecten) {
    if (o.soort !== 'bal') continue;
    const mesh = new Mesh(balGeo, balMat);
    const schaduw = new Mesh(new CircleGeometry(BAL_R * 1.1, 16), gedeeld.schaduwMat);
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
    f.shirt.color.set(kleur);
    f.kous.color.set(kleur).multiplyScalar(0.55);
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
  let vorigeT = 0;
  let vorigeEcht = performance.now();
  const teken = (t: number, sprong = false) => {
    const nu = performance.now();
    const dtEcht = Math.min(0.1, (nu - vorigeEcht) / 1000);
    vorigeEcht = nu;
    // Terug naar het begin of een grote sprong: niet vloeiend overgaan.
    sprong ||= t < vorigeT || t - vorigeT > 0.3;
    vorigeT = t;
    const s = standOp(tijdlijn, t);

    const balBij = new Set<string>();
    for (const [, b] of s.objecten) if (b.houder) balBij.add(b.houder);
    for (const [id, f] of figuren) {
      const st = s.objecten.get(id);
      if (!st) continue;
      if (st.team !== f.team) wisselHesje(f, st.team);
      poseer(f, st, t, dtEcht, sprong, balBij.has(id));
    }

    for (const [id, b] of ballen) {
      const st = s.objecten.get(id);
      if (!st) continue;
      let h = BAL_R;
      if (st.houder) h = houdHoogte(figuren.get(st.houder), s.objecten.get(st.houder));
      else if (st.vlucht) {
        const { van, naar, u: v, top } = st.vlucht;
        const h0 = houdHoogte(figuren.get(van), s.objecten.get(van));
        const h1 = naar ? houdHoogte(figuren.get(naar), s.objecten.get(naar)) : BAL_R;
        // Grondpass: uit de handen snel naar het gras, aan het eind pas omhoog naar de handen.
        const basis = top > 0.05 ? h0 + (h1 - h0) * v : BAL_R + (h0 - BAL_R) * klem(1 - v / 0.25) + (h1 - BAL_R) * klem((v - 0.85) / 0.15);
        h = Math.max(BAL_R, basis + st.hoogte);
      }
      const p = v3(st.x, h, st.y);
      // Rollen: draaien om de as dwars op de beweging.
      if (b.vorige && !sprong) {
        const dx = p.x - b.vorige.x;
        const dz = p.z - b.vorige.z;
        const d = Math.hypot(dx, dz);
        if (d > 0.0001 && d < 5) {
          const q = new Quaternion().setFromAxisAngle(new Vector3(dz / d, 0, -dx / d), d / BAL_R);
          b.mesh.quaternion.premultiply(q);
        }
      }
      b.vorige = p.clone();
      b.mesh.position.copy(p);
      b.schaduw.position.set(p.x, 0.014, p.z);
      const k = klem(1 - (h - BAL_R) / 6, 0.4, 1);
      b.schaduw.scale.setScalar(k);
    }

    for (const sm of sporen) sm.mesh.visible = sm.pijl.visible = false;
    for (const sp of s.sporen) {
      const sm = sporen[sp.index];
      if (!sm) continue;
      sm.mesh.visible = true;
      const n = Math.floor((sm.totaal / sm.stuk) * sp.fractie) * sm.stuk;
      sm.mesh.geometry.setDrawRange(0, sp.klaar ? sm.totaal : n);
      sm.pijl.visible = sp.klaar;
    }
    render();
  };

  plaats(doelen[stand]);
  zetGrenzen();
  renderer.compile(scene, camera);

  return {
    element: canvas,
    teken,
    maat(breedte, hoogte, dpr) {
      renderer.setPixelRatio(Math.min(dpr, 2));
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
    opruimen() {
      opgeruimd = true;
      cancelAnimationFrame(tekenenGevraagd);
      controls.dispose();
      scene.traverse((o) => {
        if (o instanceof Mesh) o.geometry.dispose();
      });
      for (const m of materialen) m.dispose();
      for (const t of texturen) t.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
