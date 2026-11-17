import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { BAL_R, balInvoer, maakSkelet, nieuweStaat, persoonInvoer, poseer, type PopSoort } from '../src/anim/poppetje';
import type { Tekening } from '../src/model/types';

/** 0.37.2: bouwsteen "teken" (arm omhoog) en de eerder overgeslagen voorstellen die toch anders zijn. */

const tekening = (kant: 'links' | 'rechts'): Tekening => ({
  veld: { type: 'leeg', breedte: 10, lengte: 10 },
  objecten: [{ id: 't1', soort: 'trainer', x: 5, y: 5, kijkrichting: 90 }],
  animatie: [{ duur: 0.5, acties: [] }, { acties: [{ type: 'teken', wie: 't1', kant }] }, { duur: 0.5, acties: [] }],
});

/** Poseert de trainer tot tijdstip t en geeft de polsen en het hoofd (wereld). */
function houding(kant: 'links' | 'rechts', tot: number) {
  const tl = maakTijdlijn(tekening(kant));
  const sk = maakSkelet();
  const staat = nieuweStaat();
  const stap = 1 / 30;
  for (let i = 0, t = 0; t <= tot + 1e-9; i++, t = i * stap) {
    const s = standOp(tl, t);
    const st = s.objecten.get('t1')!;
    const bi = balInvoer(s, [], BAL_R);
    poseer(sk, staat, { s: st, soort: 'trainer' as PopSoort, t, dtEcht: stap, dtAnim: stap, sprong: i === 0, zaad: 0.3, ...persoonInvoer('t1', 'trainer', st, s, bi) });
  }
  return {
    rechts: sk.pols[0].getWorldPosition(new Vector3()),
    links: sk.pols[1].getWorldPosition(new Vector3()),
    hoofd: sk.hoofd.getWorldPosition(new Vector3()),
  };
}

describe('0.37.2: arm omhoog als teken', () => {
  it('de tijdlijn zet de arm in 0,25 s omhoog, houdt hem vast en laat hem weer zakken (standaard 1,2 s)', () => {
    const tl = maakTijdlijn(tekening('links'));
    expect(tl.duur).toBeCloseTo(2.2, 1);
    expect(standOp(tl, 0.3).objecten.get('t1')!.teken).toBeUndefined();
    expect(standOp(tl, 0.6).objecten.get('t1')!.teken?.u).toBeCloseTo(0.4, 1);
    expect(standOp(tl, 1.1).objecten.get('t1')!.teken).toEqual({ kant: 'links', u: 1 });
    expect(standOp(tl, 1.9).objecten.get('t1')!.teken).toBeUndefined();
  });

  for (const kant of ['links', 'rechts'] as const) {
    it(`3D: de ${kant}erhand gaat boven het hoofd, de andere hand blijft laag`, () => {
      const p = houding(kant, 1.1);
      const op = kant === 'links' ? p.links : p.rechts;
      const neer = kant === 'links' ? p.rechts : p.links;
      expect(op.y).toBeGreaterThan(p.hoofd.y + 0.15);
      expect(neer.y).toBeLessThan(p.hoofd.y - 0.4);
      // Na het teken hangt de arm weer naast het lijf.
      const na = houding(kant, 2.2);
      expect((kant === 'links' ? na.links : na.rechts).y).toBeLessThan(na.hoofd.y - 0.4);
    });
  }

  it('de trainer kijkt naar de speler: links is aan zijn linkerkant (gezien vanuit de trainer)', () => {
    // Veld: x naar rechts, y naar beneden (2D). Wie naar +y kijkt (90°), heeft zijn linkerhand aan de +x-kant.
    const p = houding('links', 1.1);
    expect(p.links.x).toBeGreaterThan(5);
    const q = houding('rechts', 1.1);
    expect(q.rechts.x).toBeLessThan(5);
  });
});
