import { BufferGeometry, CapsuleGeometry, CylinderGeometry, Float32BufferAttribute, SphereGeometry, TorusGeometry } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Object3D } from 'three';
import { MAAT, rond, verloop } from './popVorm';
import type { PopKleuren, Skelet } from './poppetje';

/**
 * Realistische figuur (0.38.0, weergave Realistisch): hetzelfde skelet en dezelfde bewegingen als de gewone poppetjes,
 * maar met meer vorm en detail: shirt met kraag en zomen, broek met pijpen, kousen met scheenbeschermers en een boord,
 * voetbalschoenen met een zool, een gezicht (oren, neus, ogen), vier kapsels en keepershandschoenen.
 *
 * Alles wordt in code gemaakt (geen bestanden van anderen, dus geen licentie nodig). Elk deel heeft een grijswaarde per
 * hoekpunt (vertexkleur) die met de kleur van het poppetje vermenigvuldigd wordt: zo krijgen kraag, zomen en ogen een
 * donkerdere tint van dezelfde kleur, en blijft het hesje overal dezelfde, duidelijke teamkleur.
 */

export type EchtDeelNaam =
  | 'e-bekken'
  | 'e-romp'
  | 'e-nek'
  | 'e-hoofd'
  | 'e-haar-kort'
  | 'e-haar-stoppel'
  | 'e-haar-lang'
  | 'e-haar-staart'
  | 'e-mouw'
  | 'e-mouw-lang'
  | 'e-bovenarm'
  | 'e-onderarm'
  | 'e-hand'
  | 'e-handschoen'
  | 'e-pijp'
  | 'e-dij'
  | 'e-kous'
  | 'e-schoen'
  | 'e-zool';

/** Kapsels (index in PopKleuren.kapsel). */
export const KAPSELS = ['e-haar-kort', 'e-haar-stoppel', 'e-haar-lang', 'e-haar-staart'] as const;

type KleurSoort = 'shirt' | 'broek' | 'kous' | 'huid' | 'dij' | 'haar' | 'schoenEcht' | 'zool' | 'mouw' | 'hand';

export interface EchtDeelDef {
  naam: EchtDeelNaam;
  node: (sk: Skelet) => Object3D;
  kleur: KleurSoort;
  eenvoudig: false;
  /** Alleen voor poppetjes waarvoor dit waar is (kapsel, handschoenen). */
  wie?: (k: PopKleuren) => boolean;
}

const kapsel = (i: number) => (k: PopKleuren) => k.kapsel === i;

export const ECHT_DELEN: EchtDeelDef[] = [
  { naam: 'e-bekken', node: (s) => s.bekken, kleur: 'broek', eenvoudig: false },
  { naam: 'e-romp', node: (s) => s.romp, kleur: 'shirt', eenvoudig: false },
  { naam: 'e-nek', node: (s) => s.nek, kleur: 'huid', eenvoudig: false },
  { naam: 'e-hoofd', node: (s) => s.hoofd, kleur: 'huid', eenvoudig: false },
  ...KAPSELS.map((naam, i): EchtDeelDef => ({ naam, node: (s) => s.hoofd, kleur: 'haar', eenvoudig: false, wie: kapsel(i) })),
  ...([0, 1] as const).flatMap((i): EchtDeelDef[] => [
    { naam: 'e-mouw', node: (s) => s.schouder[i], kleur: 'shirt', eenvoudig: false, wie: (k) => !k.langeMouw },
    { naam: 'e-mouw-lang', node: (s) => s.schouder[i], kleur: 'shirt', eenvoudig: false, wie: (k) => k.langeMouw },
    { naam: 'e-bovenarm', node: (s) => s.schouder[i], kleur: 'mouw', eenvoudig: false },
    { naam: 'e-onderarm', node: (s) => s.elleboog[i], kleur: 'mouw', eenvoudig: false },
    { naam: 'e-hand', node: (s) => s.pols[i], kleur: 'hand', eenvoudig: false, wie: (k) => !k.handschoen },
    { naam: 'e-handschoen', node: (s) => s.pols[i], kleur: 'hand', eenvoudig: false, wie: (k) => k.handschoen },
    { naam: 'e-pijp', node: (s) => s.heup[i], kleur: 'broek', eenvoudig: false },
    { naam: 'e-dij', node: (s) => s.heup[i], kleur: 'dij', eenvoudig: false },
    { naam: 'e-kous', node: (s) => s.knie[i], kleur: 'kous', eenvoudig: false },
    { naam: 'e-schoen', node: (s) => s.enkel[i], kleur: 'schoenEcht', eenvoudig: false },
    { naam: 'e-zool', node: (s) => s.enkel[i], kleur: 'zool', eenvoudig: false },
  ]),
];

// ---------- hulp ----------

/** Grijswaarde per hoekpunt (1 = de kleur van het poppetje, lager = donkerder), vast of afhankelijk van de plek. */
function tint(g: BufferGeometry, w: number | ((x: number, y: number, z: number) => number) = 1): BufferGeometry {
  const pos = g.attributes.position!;
  const c = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const v = typeof w === 'number' ? w : w(pos.getX(i), pos.getY(i), pos.getZ(i));
    c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = v;
  }
  g.setAttribute('color', new Float32BufferAttribute(c, 3));
  return g;
}

/** Delen samenvoegen tot één geometrie (één tekenopdracht). */
function samen(...delen: BufferGeometry[]): BufferGeometry {
  const g = mergeGeometries(delen, false);
  if (!g) throw new Error('popEcht: delen passen niet samen');
  for (const d of delen) d.dispose();
  return g;
}

/** Zachte overgang van a naar b rond de grens (voor zomen en boorden). */
const band = (y: number, grens: number, breed: number, boven: number, onder: number) => {
  const u = Math.min(1, Math.max(0, (y - grens) / breed + 0.5));
  return onder + (boven - onder) * u;
};

/** Geometrie per deel, in het assenstelsel van het gewricht waar het aan vastzit. `fijn` = veel detail. */
export function echtGeometrie(naam: EchtDeelNaam, fijn: boolean): BufferGeometry {
  const s = fijn ? 18 : 8; // rondom
  const n = fijn ? 12 : 4; // in de lengte
  const k = fijn ? 5 : 2; // afronding
  const hm = MAAT.hoofdMidden;
  switch (naam) {
    case 'e-bekken': {
      // Broek: heupen en zitvlak, boord iets donkerder.
      const g = rond(
        0.1,
        -0.13,
        verloop([
          [0, 0.135],
          [0.3, 0.158],
          [0.7, 0.163],
          [1, 0.158],
        ]),
        n,
        s,
        k,
      ).scale(1, 1, 0.74);
      return tint(g, (_x, y) => band(y, 0.078, 0.012, 0.8, 1));
    }
    case 'e-romp': {
      // Shirt: schouders breed en afgerond, borst, smallere taille, zoom onderaan; kraag als ring om de hals.
      const lijf = rond(
        0.45,
        -0.08,
        verloop([
          [0, 0.055],
          [0.08, 0.13],
          [0.18, 0.172],
          [0.3, 0.178],
          [0.45, 0.166],
          [0.72, 0.142],
          [0.9, 0.149],
          [1, 0.153],
        ]),
        fijn ? 16 : 5,
        s,
        k,
      ).scale(1, 1, 0.6);
      tint(lijf, (_x, y) => (y < -0.06 ? 0.86 : 1));
      const kraag = new TorusGeometry(0.062, fijn ? 0.013 : 0.016, fijn ? 6 : 3, s).rotateX(Math.PI / 2).scale(1, 1, 0.86).translate(0, 0.434, 0.004);
      // Schouderlijn: van de hals schuin af naar de schouders (trapezius), zodat mouw en romp één geheel vormen.
      const schouders = new SphereGeometry(0.1, s, fijn ? 8 : 4).scale(2.3, 0.62, 0.84).translate(0, 0.394, -0.004);
      return samen(lijf, tint(schouders), tint(kraag, 0.68));
    }
    case 'e-nek':
      return tint(new CylinderGeometry(0.046, 0.053, 0.15, fijn ? 12 : 5).translate(0, 0.04, 0));
    case 'e-hoofd': {
      // Schedel, kaak en kin, oren, neus en ogen (zo zie je ook van opzij waar iemand naar kijkt).
      const delen = [
        tint(new SphereGeometry(0.1, fijn ? 20 : 8, fijn ? 14 : 6).scale(0.86, 1.04, 0.95).translate(0, hm + 0.006, 0.006)),
        tint(new SphereGeometry(0.066, fijn ? 16 : 6, fijn ? 12 : 4).scale(0.9, 0.8, 0.92).translate(0, hm - 0.046, 0.024)),
      ];
      if (fijn) {
        for (const x of [-1, 1]) {
          delen.push(tint(new SphereGeometry(0.023, 8, 6).scale(0.42, 1, 0.75).translate(x * 0.087, hm - 0.004, -0.004)));
          delen.push(tint(new SphereGeometry(0.0115, 6, 4).translate(x * 0.034, hm + 0.012, 0.086), 0.14));
          // Wenkbrauw: een smal, donker streepje boven het oog.
          delen.push(tint(new SphereGeometry(0.016, 6, 3).scale(1.2, 0.26, 0.45).translate(x * 0.035, hm + 0.034, 0.088), 0.42));
        }
        delen.push(tint(new SphereGeometry(0.017, 8, 6).scale(0.72, 1.05, 1).translate(0, hm - 0.012, 0.096), 0.93));
      }
      return samen(...delen);
    }
    case 'e-haar-kort': {
      const g = new SphereGeometry(0.104, s, fijn ? 10 : 4, 0, Math.PI * 2, 0, Math.PI * 0.56);
      g.rotateX(-0.66);
      return tint(g.scale(0.9, 1.03, 0.99).translate(0, hm + 0.012, -0.002));
    }
    case 'e-haar-stoppel': {
      // Heel kort: dicht op de schedel.
      const g = new SphereGeometry(0.102, s, fijn ? 9 : 4, 0, Math.PI * 2, 0, Math.PI * 0.56);
      g.rotateX(-0.62);
      return tint(g.scale(0.89, 1.04, 0.98).translate(0, hm + 0.008, 0.004), 0.9);
    }
    case 'e-haar-lang': {
      // Langer haar: kapje met een pony en haar tot in de nek.
      const kap = new SphereGeometry(0.11, s, fijn ? 10 : 4, 0, Math.PI * 2, 0, Math.PI * 0.58);
      kap.rotateX(-0.32);
      kap.scale(0.93, 1.06, 1.02).translate(0, hm + 0.012, 0.0);
      const nek = new SphereGeometry(0.1, s, fijn ? 8 : 3, 0, Math.PI, 0, Math.PI * 0.62);
      nek.rotateY(Math.PI / 2).rotateX(0.18);
      nek.scale(0.95, 1.18, 0.62).translate(0, hm - 0.035, -0.035);
      return samen(tint(kap), tint(nek, 0.95));
    }
    case 'e-haar-staart': {
      // Paardenstaart achter op het hoofd, met een elastiekje.
      const kap = new SphereGeometry(0.108, s, fijn ? 9 : 4, 0, Math.PI * 2, 0, Math.PI * 0.55);
      kap.rotateX(-0.4);
      kap.scale(0.91, 1.05, 1.01).translate(0, hm + 0.012, 0.002);
      const staart = new CapsuleGeometry(0.02, 0.085, fijn ? 3 : 1, fijn ? 8 : 4).rotateX(0.62).scale(1, 1, 0.85).translate(0, hm - 0.035, -0.135);
      const elastiek = new SphereGeometry(0.02, fijn ? 8 : 4, fijn ? 6 : 3).scale(1.1, 0.7, 1.1).translate(0, hm + 0.012, -0.104);
      return samen(tint(kap), tint(staart, 0.92), tint(elastiek, 0.35));
    }
    case 'e-mouw':
    case 'e-mouw-lang':
      // Mouw over de schouder; een korte mouw heeft een donkerdere zoom (lange mouwen van keeper en trainer niet).
      return tint(
        rond(
          -0.045,
          -0.165,
          verloop([
            [0, 0.057],
            [0.55, 0.061],
            [1, 0.058],
          ]),
          fijn ? 5 : 2,
          s,
          k,
        ),
        (_x, y) => (naam === 'e-mouw' && y < -0.15 ? 0.74 : 1),
      );
    case 'e-bovenarm':
      // Schouder en biceps.
      return tint(
        rond(
          -0.032,
          -MAAT.bovenarm,
          verloop([
            [0, 0.045],
            [0.18, 0.05],
            [0.45, 0.046],
            [0.8, 0.039],
            [1, 0.036],
          ]),
          n,
          s,
          k,
        ),
      );
    case 'e-onderarm':
      return tint(
        rond(
          0,
          -MAAT.onderarm,
          verloop([
            [0, 0.037],
            [0.28, 0.041],
            [0.75, 0.03],
            [1, 0.026],
          ]),
          n,
          s,
          k,
        ),
      );
    case 'e-hand': {
      // Handpalm, vingers en duim (de duim zit aan de voorkant als de armen hangen).
      const palm = new SphereGeometry(0.04, fijn ? 10 : 5, fijn ? 8 : 4).scale(0.74, 1.08, 0.56).translate(0, -0.042, 0.002);
      const vingers = new CapsuleGeometry(0.02, 0.026, fijn ? 2 : 1, fijn ? 8 : 4).scale(1.3, 1, 0.8).translate(0, -0.084, 0.004);
      const duim = new CapsuleGeometry(0.011, 0.028, 1, fijn ? 6 : 3).rotateX(0.5).translate(0, -0.05, 0.03);
      return samen(tint(palm), tint(vingers), tint(duim));
    }
    case 'e-handschoen': {
      // Keepershandschoen: groter, met een manchet.
      const palm = new SphereGeometry(0.048, fijn ? 10 : 5, fijn ? 8 : 4).scale(0.82, 1.18, 0.5).translate(0, -0.05, 0.003);
      const vingers = new CapsuleGeometry(0.025, 0.04, fijn ? 2 : 1, fijn ? 8 : 4).scale(1.4, 1, 0.72).translate(0, -0.105, 0.005);
      const duim = new CapsuleGeometry(0.014, 0.034, 1, fijn ? 6 : 3).rotateX(0.5).translate(0, -0.058, 0.036);
      const manchet = new CylinderGeometry(0.036, 0.04, 0.045, fijn ? 10 : 5).translate(0, -0.004, 0);
      return samen(tint(palm), tint(vingers), tint(duim), tint(manchet, 0.78));
    }
    case 'e-pijp':
      // Broekspijp, iets wijder dan het been, met een zoom.
      return tint(
        rond(
          0.04,
          -0.215,
          verloop([
            [0, 0.094],
            [0.6, 0.092],
            [1, 0.09],
          ]),
          fijn ? 5 : 2,
          s,
          k,
        ),
        (_x, y) => (y < -0.2 ? 0.8 : 1),
      );
    case 'e-dij': {
      // Bovenbeen met knieschijf.
      const dij = rond(
        0.02,
        -MAAT.dij - 0.01,
        verloop([
          [0, 0.08],
          [0.4, 0.074],
          [0.8, 0.057],
          [1, 0.05],
        ]),
        n,
        s,
        k,
      );
      if (!fijn) return tint(dij);
      const knie = new SphereGeometry(0.034, 8, 6).scale(1, 1.1, 0.7).translate(0, -MAAT.dij + 0.012, 0.028);
      return samen(tint(dij), tint(knie));
    }
    case 'e-kous': {
      // Kous met kuit, boord bovenaan en een scheenbeschermer eronder (bobbel aan de voorkant).
      const kous = rond(
        -0.075,
        -MAAT.scheen + 0.015,
        verloop([
          [0, 0.052],
          [0.22, 0.059],
          [0.7, 0.041],
          [1, 0.037],
        ]),
        n,
        s,
        k,
      );
      tint(kous, (_x, y) => band(y, -0.1, 0.01, 0.8, 1));
      if (!fijn) return kous;
      const scheen = new SphereGeometry(0.05, 10, 8).scale(0.78, 2.1, 0.42).translate(0, -0.205, 0.03);
      return samen(kous, tint(scheen));
    }
    case 'e-schoen': {
      // Voetbalschoen: neus iets smaller, hiel en een kraag om de enkel.
      const voet = new CapsuleGeometry(0.044, 0.15, fijn ? 4 : 2, fijn ? 12 : 6);
      voet.rotateX(Math.PI / 2);
      voet.scale(0.9, 0.78, 1).translate(0, -0.032, 0.052);
      const pos = voet.attributes.position!;
      for (let i = 0; i < pos.count; i++) {
        // Naar de neus toe smaller en platter.
        const z = pos.getZ(i);
        const f = 1 - Math.max(0, (z - 0.08) / 0.1) * 0.22;
        pos.setX(i, pos.getX(i) * f);
        pos.setY(i, -0.032 + (pos.getY(i) + 0.032) * (1 - Math.max(0, (z - 0.06) / 0.12) * 0.25));
      }
      voet.computeVertexNormals();
      const kraag = new CylinderGeometry(0.041, 0.045, 0.05, fijn ? 12 : 5).translate(0, -0.012, -0.004);
      return samen(tint(voet), tint(kraag, 0.85));
    }
    case 'e-zool': {
      // Zool (met noppen eronder, niet zichtbaar): plat en net iets breder dan de schoen, op het gras.
      const g = new CapsuleGeometry(0.046, 0.152, fijn ? 3 : 1, fijn ? 12 : 6);
      g.rotateX(Math.PI / 2);
      return tint(g.scale(0.92, 0.16, 1.02).translate(0, -0.0725, 0.052));
    }
  }
}
