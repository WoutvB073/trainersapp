import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import type { Punt, Stap, Tekening, VeldObject } from '../src/model/types';

const goal: VeldObject = { id: 'g', soort: 'goal', x: 34, y: 0 };
const keeper = (id: string, x: number, y: number, extra: Partial<VeldObject> = {}): VeldObject => ({ id, soort: 'keeper', x, y, nummer: 1, ...extra });
const aanvaller = (x: number, y: number): VeldObject => ({ id: 'a', soort: 'trainer', x, y, kijkrichting: -90 });
const bal = (bij: string): VeldObject => ({ id: 'bal', soort: 'bal', x: 0, y: 0, bij });
const t = (objecten: VeldObject[], animatie: Stap[]): Tekening => ({ veld: { type: 'half' }, objecten, animatie });
const st = (tl: ReturnType<typeof maakTijdlijn>, id: string, tijd: number) => standOp(tl, tijd).objecten.get(id)!;
const ballen = (tl: ReturnType<typeof maakTijdlijn>) => tl.sporen.filter((s) => s.soort === 'bal');
const afst = (a: { x: number; y: number }, p: Punt) => Math.hypot(a.x - p[0], a.y - p[1]);

describe('blokken', () => {
  for (const soort of ['ster', 'knie'] as const) {
    it(`${soort}: bal komt tegen het lichaam en kaatst af, de keeper houdt hem niet vast`, () => {
      const tl = maakTijdlijn(
        t(
          [goal, keeper('k', 34, 4), aanvaller(34, 9), bal('a')],
          [{ acties: [{ type: 'schot', van: 'a', naar: [35, 0], blokt: 'k', blokSoort: soort, afloopNaar: [40, 9] }] }, { duur: 1.5, acties: [] }],
        ),
      );
      const [heen, weg] = ballen(tl);
      expect(st(tl, 'bal', heen!.t1 - 0.005).hoogte).toBeCloseTo(soort === 'ster' ? 0.55 : 0.3, 1);
      expect(st(tl, 'k', heen!.t1).blok?.soort).toBe(soort);
      for (let s = 0; s < tl.duur; s += 0.05) expect(st(tl, 'bal', s).houder).not.toBe('k');
      expect(afst(st(tl, 'bal', weg!.t1 + 0.05), [40, 9])).toBeLessThan(0.05);
    });
  }
});

describe('plukken', () => {
  it('keeper duikt naar de bal aan de voet van de aanvaller en pakt hem', () => {
    const tl = maakTijdlijn(
      t(
        [goal, keeper('k', 34, 3), aanvaller(34, 10), bal('a')],
        [{ acties: [{ type: 'dribbel', wie: 'a', naar: [34, 6.4] }] }, { acties: [{ type: 'pluk', wie: 'k', van: 'a' }] }, { duur: 0.8, acties: [] }],
      ),
    );
    expect(st(tl, 'bal', 0.5).houder).toBe('a');
    const eind = st(tl, 'k', tl.duur);
    expect(eind.liggen).toBeGreaterThan(0.95);
    expect(st(tl, 'bal', tl.duur).houder).toBe('k');
    expect(st(tl, 'bal', tl.duur).hoogte).toBeLessThan(0.35);
  });

  it('losse bal: de keeper duikt erop', () => {
    const tl = maakTijdlijn(t([keeper('k', 10, 5), { id: 'bal', soort: 'bal', x: 12.2, y: 6 }], [{ acties: [{ type: 'pluk', wie: 'k' }] }]));
    expect(st(tl, 'bal', tl.duur).houder).toBe('k');
    expect(st(tl, 'k', tl.duur).liggen).toBeGreaterThan(0.95);
  });
});

describe('afketsen en reageren', () => {
  it('tweede keeper tikt de bal aan, de keeper duikt naar de nieuwe richting', () => {
    const tl = maakTijdlijn(
      t(
        [goal, keeper('k1', 34, 1.5), keeper('k2', 34, 5, { nummer: 2 }), aanvaller(34, 12), bal('a')],
        [{ acties: [{ type: 'schot', van: 'a', naar: 'k2', terug: 'k1', duikNaar: [32.2, 1.8] }] }, { duur: 1, acties: [] }],
      ),
    );
    const [heen, weg] = ballen(tl);
    expect(weg).toBeDefined();
    expect(tl.balEvents.get('bal')!.some((e) => e.soort === 'vlucht' && e.passeerder === 'k2')).toBe(true);
    expect(st(tl, 'k1', weg!.t1).liggen).toBeGreaterThan(0.95);
    expect(st(tl, 'bal', weg!.t1 + 0.05).houder).toBe('k1');
    // Vóór het aantikken ligt de keeper nog niet.
    expect(st(tl, 'k1', heen!.t1).liggen).toBe(0);
  });

  it('rebounder: de keeper duikt naar de terugkaatsende bal', () => {
    const reb: VeldObject = { id: 'r', soort: 'rebounder', x: 34, y: 5, hoek: 0 };
    const tl = maakTijdlijn(
      t([goal, reb, keeper('k1', 34, 1.5), aanvaller(36, 9), bal('a')], [{ acties: [{ type: 'pass', van: 'a', naar: 'r', terug: 'k1', duikNaar: [35.8, 1.8] }] }, { duur: 1, acties: [] }]),
    );
    const [, weg] = ballen(tl);
    expect(st(tl, 'k1', weg!.t1).liggen).toBeGreaterThan(0.95);
    expect(st(tl, 'bal', weg!.t1 + 0.05).houder).toBe('k1');
  });

  it('keepersoorlog: vangen en vasthouden (niet wegrollen)', () => {
    const g2: VeldObject = { id: 'g2', soort: 'goal', x: 34, y: 18, hoek: 180 };
    const tl = maakTijdlijn(
      t(
        [goal, g2, keeper('k1', 34, 1.5, { verdedigt: 'g' }), keeper('k2', 34, 16.5, { verdedigt: 'g2', nummer: 2 }), bal('k2')],
        [{ duur: 0.6, acties: [] }, { acties: [{ type: 'schot', van: 'k2', naar: [35, 0.3], worp: 'bovenhands', hoogte: 'laag', afloop: 'vangt', vasthouden: true }] }, { duur: 2, acties: [] }],
      ),
    );
    expect(st(tl, 'bal', tl.duur).houder).toBe('k1');
    expect(ballen(tl)).toHaveLength(1);
  });
});

describe('reactiebal', () => {
  it('stuit en daarna een duik naar de wegspringende bal', () => {
    const tl = maakTijdlijn(
      t(
        [keeper('k1', 3.5, 4.4, { kijkrichting: 0 }), keeper('k2', 8.5, 4.4, { kijkrichting: 180, nummer: 2 }), { id: 'bal', soort: 'bal', x: 0, y: 0, bij: 'k2', variant: 'reactiebal' }],
        [{ acties: [{ type: 'pass', van: 'k2', naar: 'k1', worp: 'bovenhands', hoogte: 0.6, stuitOp: [6.2, 4.3], duikNaar: [3.6, 5.8] }] }, { duur: 1, acties: [] }],
      ),
    );
    const [eerste, tweede] = ballen(tl);
    expect(st(tl, 'bal', eerste!.t1).hoogte).toBeLessThan(0.05);
    expect(st(tl, 'k1', tweede!.t1).liggen).toBeGreaterThan(0.95);
    expect(st(tl, 'bal', tweede!.t1 + 0.05).houder).toBe('k1');
  });
});
