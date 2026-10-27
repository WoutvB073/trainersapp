import { Quaternion, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { afspeelTekening } from '../src/editor/animatie';
import { OEFENINGEN } from '../src/data/oefeningen';
import { maakTijdlijn, standOp, type Tijdlijn } from '../src/anim/timeline';
import { BAL_R, balInvoer, ik, laagste, maakSkelet, MAAT, nieuweStaat, persoonInvoer, poseer, type PopSoort, type Skelet } from '../src/anim/poppetje';
import type { Manier, Stap, Tekening, VeldObject } from '../src/model/types';

/**
 * 3D-poppetjes (0.21.0): de houding wordt per beeld uitgerekend. Hier controleren we dat over álle ingebouwde
 * oefeningen: niemand zakt door de grond, gewrichten buigen de goede kant op, voeten glijden niet tijdens het
 * steunen, en handen/voeten zitten bij de bal bij vasthouden, vangen, trappen en aannemen.
 */

interface Pop {
  id: string;
  soort: PopSoort;
  sk: Skelet;
  staat: ReturnType<typeof nieuweStaat>;
  zaad: number;
}

const TEEN = new Vector3(0, -0.075, 0.15);
const teen = (sk: Skelet, i: 0 | 1) => sk.enkel[i].localToWorld(TEEN.clone());
const pols = (sk: Skelet, i: 0 | 1) => sk.pols[i].getWorldPosition(new Vector3());

/** Speelt een tijdlijn af in stappen en poseert iedereen; `elk` krijgt per persoon de stand en het skelet. */
function speel(tl: Tijdlijn, stap: number, elk: (t: number, p: Pop, s: ReturnType<typeof standOp>, bal: Map<string, Vector3>) => void, tot = tl.duur) {
  const pops: Pop[] = [...tl.objecten.values()]
    .filter((o) => o.soort === 'speler' || o.soort === 'keeper' || o.soort === 'trainer')
    .map((o, i) => ({ id: o.id, soort: o.soort as PopSoort, sk: maakSkelet(), staat: nieuweStaat(), zaad: (i * 0.137) % 1 }));
  const ballen = [...tl.objecten.values()].filter((o) => o.soort === 'bal').map((o) => o.id);
  let eerste = true;
  const n = Math.round(tot / stap);
  for (let i = 0; i <= n; i++) {
    const t = i * stap;
    const s = standOp(tl, t);
    const bi = balInvoer(s, ballen, BAL_R);
    for (const p of pops) {
      const st = s.objecten.get(p.id)!;
      poseer(p.sk, p.staat, { s: st, soort: p.soort, t, dtEcht: stap, dtAnim: stap, sprong: eerste, zaad: p.zaad, ...persoonInvoer(p.id, p.soort, st, s, bi) });
      elk(t, p, s, bi.plek);
    }
    eerste = false;
  }
}

describe('IK (twee delen naar een doel)', () => {
  it('het uiteinde komt op het doel; de knie buigt naar achteren, de elleboog naar voren', () => {
    const sk = maakSkelet();
    const q = new Quaternion();
    sk.bekken.position.set(0, 0, 0);
    for (const doel of [new Vector3(0.1, -0.7, 0.2), new Vector3(-0.05, -0.5, -0.3), new Vector3(0.2, -0.3, 0.5)]) {
      const buig = ik(new Vector3(), doel, MAAT.dij, MAAT.scheen, new Vector3(0, 0, 1), 1, q);
      sk.heup[0].position.set(0, 0, 0);
      sk.heup[0].quaternion.copy(q);
      sk.knie[0].rotation.set(buig, 0, 0);
      sk.wortel.updateMatrixWorld(true);
      const enkel = sk.enkel[0].getWorldPosition(new Vector3());
      expect(enkel.distanceTo(doel)).toBeLessThan(0.002);
      expect(buig).toBeGreaterThan(0);
      // Knie wijst naar voren (voor de lijn heup-enkel).
      const knie = sk.knie[0].getWorldPosition(new Vector3());
      expect(knie.z).toBeGreaterThanOrEqual(Math.min(0, doel.z) - 1e-6);
    }
    const arm = ik(new Vector3(), new Vector3(0, -0.2, 0.3), MAAT.bovenarm, MAAT.onderarm, new Vector3(0, 0, -1), -1, q);
    expect(arm).toBeLessThan(0);
  });
});

describe('poppetjes in alle oefeningen', { timeout: 60000 }, () => {
  const oefeningen = OEFENINGEN;
  it(`niemand door de grond, gewrichten binnen hun grenzen (${oefeningen.length} oefeningen)`, () => {
    const fouten: string[] = [];
    for (const o of oefeningen) {
      const tl = maakTijdlijn(afspeelTekening(o.tekening));
      speel(tl, 1 / 12, (t, p) => {
        const min = laagste(p.sk);
        if (min < -0.006) fouten.push(`${o.id} ${p.id} ${t.toFixed(2)}: door de grond (${min.toFixed(3)})`);
        for (const i of [0, 1] as const) {
          const k = p.sk.knie[i].rotation.x;
          const e = p.sk.elleboog[i].rotation.x;
          if (k < -0.01 || k > 2.75) fouten.push(`${o.id} ${p.id} ${t.toFixed(2)}: knie ${k.toFixed(2)}`);
          if (e > 0.05 || e < -2.85) fouten.push(`${o.id} ${p.id} ${t.toFixed(2)}: elleboog ${e.toFixed(2)}`);
        }
      });
    }
    expect(fouten.slice(0, 20)).toEqual([]);
  });

  it('wie stilstaat, staat met de voeten op het gras (zweeft niet)', () => {
    const fouten: string[] = [];
    for (const o of oefeningen) {
      const tl = maakTijdlijn(afspeelTekening(o.tekening));
      speel(tl, 1 / 6, (t, p, s) => {
        const st = s.objecten.get(p.id)!;
        const rustig = st.snelheid < 0.05 && st.sprong === 0 && st.zweef === 0 && !st.blok && st.liggen === 0 && !st.trap && !st.aanname && !st.worp && st.zit === 0 && st.spreid === 0;
        if (!rustig) return;
        const voet = Math.min(teen(p.sk, 0).y, teen(p.sk, 1).y, p.sk.enkel[0].getWorldPosition(new Vector3()).y - MAAT.enkel, p.sk.enkel[1].getWorldPosition(new Vector3()).y - MAAT.enkel);
        if (voet > 0.03) fouten.push(`${o.id} ${p.id} ${t.toFixed(2)}: voeten ${voet.toFixed(3)} m boven het gras`);
      });
    }
    expect(fouten.slice(0, 20)).toEqual([]);
  });

  it('keeper met de bal in de handen: handen aan de bal', () => {
    const fouten: string[] = [];
    for (const o of oefeningen.filter((x) => x.tekening.objecten.some((y) => y.soort === 'keeper'))) {
      const tl = maakTijdlijn(afspeelTekening(o.tekening));
      speel(tl, 1 / 6, (t, p, s, bal) => {
        if (p.soort !== 'keeper') return;
        const st = s.objecten.get(p.id)!;
        // Zittend kan hij niet hoger reiken dan ± 1,2 m (de bal komt soms net hoger aan).
        const b = [...s.objecten].filter(([, x]) => x.houder === p.id && x.hoogte > 0.6 && !(st.zit > 0.5 && x.hoogte > 1.2));
        if (!b.length || st.worp || p.staat.balInHand) return;
        const midden = pols(p.sk, 0).add(pols(p.sk, 1)).multiplyScalar(0.5);
        // (Heeft hij er twee, dan de dichtstbijzijnde.)
        const d = Math.min(...b.map(([id]) => midden.distanceTo(bal.get(id)!)));
        if (d > 0.25) fouten.push(`${o.id} ${p.id} ${t.toFixed(2)}: handen ${d.toFixed(2)} m van de bal`);
      });
    }
    expect(fouten.slice(0, 20)).toEqual([]);
  });

  it('vangen (niet duikend): op het moment van aankomst zijn de handen bij de bal', () => {
    const fouten: string[] = [];
    let aantal = 0;
    for (const o of oefeningen.filter((x) => x.tekening.objecten.some((y) => y.soort === 'keeper'))) {
      const tl = maakTijdlijn(afspeelTekening(o.tekening));
      const vangen = [...tl.balEvents.values()].flat().filter((e) => e.soort === 'vlucht' && e.daarna && tl.objecten.get(e.daarna)?.soort === 'keeper');
      for (const e of vangen) {
        if (e.soort !== 'vlucht') continue;
        const st = standOp(tl, e.t1).objecten.get(e.daarna!)!;
        if (st.liggen > 0.05 || st.aanname || st.vang < 0.9) continue;
        speel(
          tl,
          e.t1 / Math.max(1, Math.round(e.t1 / 0.05)),
          (t, p, s, bal) => {
            if (p.id !== e.daarna || Math.abs(t - e.t1) > 1e-6) return;
            const b = [...s.objecten].find(([, x]) => x.houder === p.id)?.[0];
            if (!b) return;
            aantal++;
            const midden = pols(p.sk, 0).add(pols(p.sk, 1)).multiplyScalar(0.5);
            const d = midden.distanceTo(bal.get(b)!);
            if (d > 0.3) fouten.push(`${o.id} ${p.id} ${t.toFixed(2)}: vangt met de handen ${d.toFixed(2)} m van de bal`);
          },
          e.t1,
        );
      }
    }
    expect(aantal).toBeGreaterThan(20);
    expect(fouten.slice(0, 20)).toEqual([]);
  });

  it('trappen (pass/schot): bij het raken zit een voet bij de bal', () => {
    const fouten: string[] = [];
    let aantal = 0;
    for (const o of oefeningen) {
      const tl = maakTijdlijn(afspeelTekening(o.tekening));
      // Alleen een bal die hij aan de voet heeft (niet een bal die nog aankomt of een eindje verderop ligt).
      const aanVoet = (l: { bal: string; wie: string; t: number }) => standOp(tl, l.t - 0.08).objecten.get(l.bal)?.houder === l.wie;
      for (const x of tl.loslaten.filter((l) => l.soort === 'voet' && l.t > 0.35 && aanVoet(l)).slice(0, 2)) {
        // Iets voor het loslaten: daar raakt de voet de bal.
        const tRaak = x.t - 0.02;
        speel(
          tl,
          tRaak / Math.max(1, Math.round(tRaak / 0.04)),
          (t, p, s, bal) => {
            if (p.id !== x.wie || Math.abs(t - tRaak) > 1e-6) return;
            const st = s.objecten.get(p.id)!;
            if (!st.trap || st.liggen > 0.3) return;
            aantal++;
            const b = bal.get(x.bal)!;
            const d = Math.min(teen(p.sk, 0).distanceTo(b), teen(p.sk, 1).distanceTo(b));
            if (d > BAL_R + 0.22) fouten.push(`${o.id} ${p.id} ${t.toFixed(2)}: voet ${d.toFixed(2)} m van de bal`);
          },
          tRaak,
        );
      }
    }
    expect(aantal).toBeGreaterThan(30);
    expect(fouten.slice(0, 20)).toEqual([]);
  });
});

describe('lopen: voeten glijden niet', () => {
  const lijn = (manier: Manier | undefined, lengte = 14): Tekening => {
    const objecten: VeldObject[] = [{ id: 'a', soort: 'speler', team: 'A', x: 2, y: 5 }];
    const animatie: Stap[] = [{ acties: [{ type: 'loop', wie: 'a', naar: [2 + lengte, 5], ...(manier ? { manier } : {}) }] }];
    return { veld: { type: 'leeg', breedte: 30, lengte: 10 }, objecten, animatie };
  };
  for (const manier of ['wandel', undefined, 'sprint', 'achteruit', 'zijwaarts', 'voetenwerk', 'kniehef'] as const) {
    it(`${manier ?? 'jog'}: een neergezette voet blijft staan`, () => {
      const tl = maakTijdlijn(lijn(manier));
      let glijden = 0;
      let lijf = 0;
      const vorig: (Vector3 | null)[] = [null, null];
      let vorigLijf: Vector3 | null = null;
      speel(tl, 1 / 120, (_t, p) => {
        const nu = p.sk.bekken.getWorldPosition(new Vector3());
        if (vorigLijf) lijf += Math.hypot(nu.x - vorigLijf.x, nu.z - vorigLijf.z);
        vorigLijf = nu;
        for (const i of [0, 1] as const) {
          const tn = teen(p.sk, i);
          const vast = tn.y < 0.006;
          const v = vorig[i];
          if (vast && v) glijden += Math.hypot(tn.x - v.x, tn.z - v.z);
          vorig[i] = vast ? tn : null;
        }
      });
      expect(lijf).toBeGreaterThan(10);
      // Hooguit een paar procent van de afgelegde weg (optrekken/afremmen, overgang van en naar stilstaan).
      expect(glijden / lijf).toBeLessThan(0.06);
    });
  }
});

describe('kijken naar de bal', () => {
  it('een speler die stilstaat draait zijn hoofd (en iets het bovenlijf) naar de bal die gespeeld wordt', () => {
    const objecten: VeldObject[] = [
      { id: 'w', soort: 'speler', team: 'A', x: 10, y: 10, kijkrichting: 0 },
      { id: 'a', soort: 'speler', team: 'B', x: 6, y: 2 },
      { id: 'b', soort: 'speler', team: 'B', x: 16, y: 2 },
      { id: 'bal', soort: 'bal', x: 0, y: 0, bij: 'a' },
    ];
    const tl = maakTijdlijn({ veld: { type: 'leeg', breedte: 20, lengte: 14 }, objecten, animatie: [{ duur: 0.6, acties: [] }, { acties: [{ type: 'pass', van: 'a', naar: 'b' }] }] });
    let gecontroleerd = 0;
    speel(tl, 1 / 30, (t, p, s, bal) => {
      if (p.id !== 'w' || t < 1.2 || !s.objecten.get('bal')!.vlucht) return;
      const hoofd = p.sk.hoofd.getWorldPosition(new Vector3());
      const vooruit = new Vector3(0, 0, 1).applyQuaternion(p.sk.hoofd.getWorldQuaternion(new Quaternion()));
      const lijf = new Vector3(0, 0, 1).applyQuaternion(p.sk.wortel.getWorldQuaternion(new Quaternion()));
      const naarBal = bal.get('bal')!.clone().sub(hoofd).setY(0).normalize();
      vooruit.setY(0).normalize();
      lijf.setY(0).normalize();
      // Het hoofd wijst duidelijk meer naar de bal dan het lijf.
      expect(vooruit.angleTo(naarBal)).toBeLessThan(lijf.angleTo(naarBal) - 0.4);
      gecontroleerd++;
    });
    expect(gecontroleerd).toBeGreaterThan(3);
  });
});

describe('snelheid van het poseren', () => {
  it('22 spelers + 2 keepers: ruim binnen een beeld (telefoon ≈ 4× trager dan deze computer)', () => {
    const objecten: VeldObject[] = [];
    for (let i = 0; i < 22; i++) objecten.push({ id: `s${i}`, soort: 'speler', team: i < 11 ? 'A' : 'B', nummer: (i % 11) + 1, x: 5 + (i % 6) * 9, y: 10 + Math.floor(i / 6) * 20 });
    objecten.push({ id: 'k1', soort: 'keeper', x: 34, y: 2 }, { id: 'k2', soort: 'keeper', x: 34, y: 103 });
    const animatie: Stap[] = [{ acties: objecten.filter((o) => o.soort === 'speler').map((o) => ({ type: 'loop' as const, wie: o.id, naar: [o.x + 4, o.y + 8] as [number, number] })) }];
    const tl = maakTijdlijn({ veld: { type: 'heel', breedte: 68, lengte: 105 }, objecten, animatie });
    const start = performance.now();
    let beelden = 0;
    speel(tl, 1 / 60, (_t, p) => {
      if (p.id === 'k2') beelden++;
    });
    const perBeeld = (performance.now() - start) / beelden;
    expect(perBeeld).toBeLessThan(5);
  });
});
