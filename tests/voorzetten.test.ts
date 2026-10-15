import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import type { Punt, Stap, Tekening, VeldObject } from '../src/model/types';

const goal: VeldObject = { id: 'g', soort: 'goal', x: 34, y: 0 };
const keeper = (extra: Partial<VeldObject> = {}): VeldObject => ({ id: 'k', soort: 'keeper', x: 34, y: 1.5, nummer: 1, verdedigt: 'g', ...extra });
const trainer = (x: number, y: number): VeldObject => ({ id: 't', soort: 'trainer', x, y });
const bal = (bij: string): VeldObject => ({ id: 'bal', soort: 'bal', x: 0, y: 0, bij });
const t = (objecten: VeldObject[], animatie: Stap[]): Tekening => ({ veld: { type: 'half' }, objecten, animatie });
const st = (tl: ReturnType<typeof maakTijdlijn>, id: string, tijd: number) => standOp(tl, tijd).objecten.get(id)!;
const ballen = (tl: ReturnType<typeof maakTijdlijn>) => tl.sporen.filter((s) => s.soort === 'bal');
const afst = (a: { x: number; y: number }, p: Punt) => Math.hypot(a.x - p[0], a.y - p[1]);

describe('voorzet: uitkomen', () => {
  const voorzet = (extra = {}) =>
    maakTijdlijn(
      t(
        [goal, keeper({ uitkomen: true }), trainer(54, 8), bal('t')],
        [{ duur: 0.3, acties: [] }, { acties: [{ type: 'pass', van: 't', naar: [35, 6], hoogte: 'hoog', uitkomen: 'k', ...extra }] }, { duur: 1, acties: [] }],
      ),
    );

  it('keeper loopt uit en vangt de bal op het hoogste punt in de sprong', () => {
    const tl = voorzet();
    const v = ballen(tl)[0]!;
    expect(st(tl, 'bal', v.t1 - 0.005).hoogte).toBeGreaterThan(2.2);
    expect(st(tl, 'bal', v.t1 - 0.005).hoogte).toBeLessThan(2.7);
    expect(st(tl, 'k', v.t1).sprong).toBeGreaterThan(0.8);
    expect(st(tl, 'bal', v.t1 + 0.05).houder).toBe('k');
    // Hij is echt uitgekomen (niet op de lijn blijven staan).
    expect(st(tl, 'k', v.t1).y).toBeGreaterThan(3.5);
  });

  it('wegstompen met één vuist: bal gaat naar stompNaar, keeper heeft hem nooit vast', () => {
    const tl = voorzet({ stompNaar: [44, 18], vuisten: 1 });
    const [heen, weg] = ballen(tl);
    expect(weg).toBeDefined();
    expect(st(tl, 'k', heen!.t1).stomp?.vuisten).toBe(1);
    expect(st(tl, 'k', heen!.t1).sprong).toBeGreaterThan(0.8);
    for (let s = 0; s < tl.duur; s += 0.05) expect(st(tl, 'bal', s).houder).not.toBe('k');
    expect(afst(st(tl, 'bal', weg!.t1 + 0.1), [44, 18])).toBeLessThan(0.05);
  });
});

describe('positie bij een voorzet', () => {
  const plek = (bx: number, by: number) => {
    const tl = maakTijdlijn(t([goal, keeper(), { id: 'b', soort: 'bal', x: bx, y: by }], [{ duur: 2, acties: [] }]));
    return st(tl, 'k', 1.5);
  };
  it('bal bij de achterlijn: keeper bij de eerste paal', () => {
    const k = plek(52, 2.5);
    expect(k.x - 34).toBeGreaterThan(2);
    expect(k.y).toBeLessThan(1.3);
  });
  it('voorzet van ver: keeper meer naar het midden en iets uit het doel', () => {
    const k = plek(54, 22);
    expect(Math.abs(k.x - 34)).toBeLessThan(1.3);
    expect(k.y).toBeGreaterThan(1.8);
  });
});

describe('passing', () => {
  it('terugspeelbal: keeper neemt aan met de voet (geen vanghouding) en speelt met de voet weg', () => {
    const tl = maakTijdlijn(
      t(
        [goal, keeper({ verdedigt: undefined }), trainer(34, 14), bal('t')],
        [{ acties: [{ type: 'pass', van: 't', naar: 'k' }] }, { acties: [{ type: 'pass', van: 'k', naar: [50, 10], worp: 'voet' }] }],
      ),
    );
    const [terug] = ballen(tl);
    for (let s = terug!.t0; s < terug!.t1 + 0.5; s += 0.05) expect(st(tl, 'k', s).vang).toBe(0);
    expect(st(tl, 'bal', terug!.t1 + 0.1).hoogte).toBe(0);
  });

  it('dropkick: bal valt uit de handen en wordt bij de grond geraakt', () => {
    const tl = maakTijdlijn(t([goal, keeper({ verdedigt: undefined }), bal('k')], [{ acties: [{ type: 'pass', van: 'k', naar: [34, 45], worp: 'dropkick', hoogte: 'hoog' }] }]));
    const v = ballen(tl)[0]!;
    expect(st(tl, 'bal', v.t0 - 0.5).hoogte).toBeGreaterThan(0.9);
    expect(st(tl, 'bal', v.t0 + 0.001).hoogte).toBeLessThan(0.15);
    expect(st(tl, 'k', v.t0).worp?.soort).toBe('dropkick');
  });

  it('zwaaiworp: bal verlaat de hand op heuphoogte, keeper springt niet', () => {
    const tl = maakTijdlijn(t([goal, keeper({ verdedigt: undefined }), bal('k')], [{ acties: [{ type: 'pass', van: 'k', naar: [50, 20], worp: 'zwaai', hoogte: 'laag' }] }]));
    const v = ballen(tl)[0]!;
    expect(st(tl, 'bal', v.t0 + 0.001).hoogte).toBeCloseTo(1.1, 1);
    for (let s = 0; s < tl.duur; s += 0.05) expect(st(tl, 'k', s).sprong).toBe(0);
  });

  it('doeltrap: aanloop en een losse bal van de grond trappen', () => {
    const tl = maakTijdlijn(
      t(
        [goal, keeper({ verdedigt: undefined, x: 33, y: 2.5 }), { id: 'bal', soort: 'bal', x: 34, y: 5.5 }],
        [{ acties: [{ type: 'loop', wie: 'k', naar: [34, 5] }] }, { acties: [{ type: 'pass', van: 'k', naar: [34, 50], worp: 'trap', hoogte: 'hoog' }] }],
      ),
    );
    const v = ballen(tl)[0]!;
    expect(st(tl, 'bal', v.t0 + 0.001).hoogte).toBeLessThan(0.1);
    expect(st(tl, 'k', v.t0).worp?.soort).toBe('trap');
  });
});

describe('hindernissen', () => {
  it('springen: een tegenstander springt mee', () => {
    const tl = maakTijdlijn(t([{ id: 's', soort: 'keeper', x: 30, y: 5 }], [{ acties: [{ type: 'springen', wie: 's' }] }]));
    expect(st(tl, 's', 0.3).sprong).toBeGreaterThan(0.95);
    expect(st(tl, 's', 0.8).sprong).toBe(0);
  });

  it('pop: de bal kaatst ertegen af en verandert van richting', () => {
    const pop: VeldObject = { id: 'p', soort: 'pop', x: 34, y: 8 };
    const tl = maakTijdlijn(t([pop, trainer(34, 14), bal('t')], [{ acties: [{ type: 'pass', van: 't', naar: 'p', terug: [30, 4] }] }]));
    expect(ballen(tl)).toHaveLength(2);
    expect(afst(st(tl, 'bal', tl.duur + 1), [30, 4])).toBeLessThan(0.05);
  });
});
