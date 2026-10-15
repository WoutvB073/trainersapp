import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import type { Stap, Tekening, VeldObject } from '../src/model/types';

const keeper = (id: string, x: number, y: number, extra: Partial<VeldObject> = {}): VeldObject => ({ id, soort: 'keeper', x, y, nummer: 1, ...extra });
const trainer: VeldObject = { id: 't', soort: 'trainer', x: 10, y: 10 };
const bal = (bij: string): VeldObject => ({ id: 'bal', soort: 'bal', x: 0, y: 0, bij });
const t = (objecten: VeldObject[], animatie: Stap[], veld: Tekening['veld'] = { type: 'leeg', breedte: 20, lengte: 20 }): Tekening => ({ veld, objecten, animatie });
const st = (tl: ReturnType<typeof maakTijdlijn>, id: string, tijd: number) => standOp(tl, tijd).objecten.get(id)!;
/** Vlucht van de bal (eerste of n-de). */
const vlucht = (tl: ReturnType<typeof maakTijdlijn>, n = 0) => tl.sporen.filter((s) => s.soort === 'bal')[n]!;

describe('bal in de handen', () => {
  it('keeper houdt de bal voor de borst, een veldspeler heeft hem aan de voet', () => {
    const tl = maakTijdlijn(t([keeper('k', 10, 2), bal('k')], [{ duur: 1, acties: [] }]));
    expect(st(tl, 'bal', 0.5).hoogte).toBeCloseTo(1.05, 2);
    const tl2 = maakTijdlijn(t([{ id: 's', soort: 'speler', team: 'A', x: 5, y: 5 }, bal('s')], [{ duur: 1, acties: [] }]));
    expect(st(tl2, 'bal', 0.5).hoogte).toBe(0);
  });

  it('keeper rolt de bal onderhands weg: laag uit de hand en dan over de grond', () => {
    const tl = maakTijdlijn(t([keeper('k', 10, 2), trainer, bal('k')], [{ acties: [{ type: 'pass', van: 'k', naar: 't' }] }]));
    const v = vlucht(tl);
    expect(st(tl, 'bal', v.t0 + 0.001).hoogte).toBeCloseTo(0.25, 1);
    expect(st(tl, 'bal', (v.t0 + v.t1) / 2).hoogte).toBeLessThan(0.02);
    // Uithalen: de keeper maakt een worpbeweging rond het loslaten.
    expect(st(tl, 'k', v.t0).worp?.soort).toBe('onderhands');
  });
});

describe('aanspelen door de trainer', () => {
  const metWorp = (worp: 'onderhands' | 'bovenhands' | 'volley' | 'trap', extra = {}) =>
    maakTijdlijn(t([keeper('k', 10, 2), trainer, bal('t')], [{ acties: [{ type: 'pass', van: 't', naar: 'k', worp, ...extra }] }]));

  it('bovenhands: bal eerst in de handen, verlaat de hand boven het hoofd; de trainer springt niet', () => {
    const tl = metWorp('bovenhands', { hoogte: 'halfhoog' });
    const v = vlucht(tl);
    expect(st(tl, 'bal', v.t0 - 0.5).hoogte).toBeGreaterThan(0.9);
    expect(st(tl, 'bal', v.t0 + 0.001).hoogte).toBeGreaterThan(1.9);
    for (let s = 0; s < tl.duur; s += 0.05) expect(st(tl, 't', s).sprong).toBe(0);
  });

  it('volley uit de handen: de bal valt uit de handen en wordt op kniehoogte getrapt', () => {
    const tl = metWorp('volley', { hoogte: 'hoog' });
    const v = vlucht(tl);
    expect(st(tl, 'bal', v.t0 - 0.4).hoogte).toBeGreaterThan(0.95);
    expect(st(tl, 'bal', v.t0 - 0.001).hoogte).toBeLessThan(0.5);
    expect(st(tl, 't', v.t0).worp?.soort).toBe('volley');
  });

  it('trap van de grond: de bal ligt aan de voet', () => {
    const tl = metWorp('trap');
    expect(st(tl, 'bal', vlucht(tl).t0 - 0.01).hoogte).toBeLessThan(0.05);
  });
});

describe('vangen', () => {
  const vangen = (extra = {}) => maakTijdlijn(t([keeper('k', 10, 2), trainer, bal('t')], [{ acties: [{ type: 'pass', van: 't', naar: 'k', worp: 'onderhands', ...extra }] }, { duur: 1, acties: [] }]));

  it('hoge bal: W-greep boven het hoofd, bal komt op de gevraagde hoogte aan', () => {
    const tl = vangen({ hoogte: 2.6, eindHoogte: 2 });
    const v = vlucht(tl);
    expect(st(tl, 'bal', v.t1 - 0.005).hoogte).toBeGreaterThan(1.9);
    expect(st(tl, 'k', v.t1).vang).toBeGreaterThan(0.9);
    expect(st(tl, 'k', v.t1).vangHoogte).toBeCloseTo(2, 1);
    // Daarna naar de borst.
    expect(st(tl, 'bal', v.t1 + 0.6).hoogte).toBeCloseTo(1.05, 2);
  });

  it('grondbal: schepvangen bij de grond', () => {
    const tl = vangen({ hoogte: 'grond' });
    const v = vlucht(tl);
    expect(st(tl, 'k', v.t1).vangHoogte).toBeLessThan(0.3);
    expect(st(tl, 'bal', v.t1 - 0.01).hoogte).toBeLessThan(0.3);
  });

  it('bal door de lucht zonder eindhoogte: op borsthoogte', () => {
    const tl = vangen({ hoogte: 'laag' });
    expect(st(tl, 'k', vlucht(tl).t1).vangHoogte).toBeCloseTo(1.1, 1);
  });
});

describe('duiken', () => {
  it('hoge duik: keeper hangt in de lucht bij de bal en landt daarna', () => {
    const tl = maakTijdlijn(
      t(
        [keeper('k', 10, 2), trainer, bal('t')],
        [
          {
            acties: [
              { type: 'pass', van: 't', naar: 'k', worp: 'bovenhands', hoogte: 2.5, duur: 0.9 },
              { type: 'duik', wie: 'k', naar: [12.2, 2], hoogte: 1.5, start: 0.95, duur: 0.45 },
            ],
          },
          { duur: 1, acties: [] },
        ],
      ),
    );
    const v = vlucht(tl);
    const k = st(tl, 'k', v.t1);
    expect(k.zweef).toBeCloseTo(1.15, 1);
    expect(st(tl, 'bal', v.t1 - 0.005).hoogte).toBeCloseTo(1.5, 1);
    expect(st(tl, 'bal', v.t1).houder).toBe('k');
    // Geland: op de grond, bal vastgeklemd laag bij de grond.
    expect(st(tl, 'k', v.t1 + 0.5).zweef).toBe(0);
    expect(st(tl, 'bal', v.t1 + 0.5).hoogte).toBeLessThan(0.35);
  });

  it('op een landingskussen ligt de keeper op het kussen', () => {
    const mat: VeldObject = { id: 'm', soort: 'keepersmat', x: 12, y: 2, breedte: 2, lengte: 2, hoogte: 0.25 };
    const tl = maakTijdlijn(t([mat, keeper('k', 10, 2)], [{ acties: [{ type: 'duik', wie: 'k', naar: [11.6, 2], hoogte: 1.2 }] }, { duur: 1, acties: [] }]));
    expect(st(tl, 'k', tl.duur).zweef).toBeCloseTo(0.25, 2);
  });
});

describe('tippen', () => {
  const goal: VeldObject = { id: 'g', soort: 'goal', x: 34, y: 0 };
  const tip = (naar: [number, number], eindHoogte: number) =>
    maakTijdlijn(
      t(
        [goal, keeper('k', 34, 1.5, { verdedigt: 'g' }), { ...trainer, x: 34, y: 11 }, bal('t')],
        [{ acties: [{ type: 'schot', van: 't', naar, worp: 'volley', hoogte: 3, eindHoogte, afloop: 'tipt' }] }, { duur: 2, acties: [] }],
        { type: 'half' },
      ),
    );
  /** Hoogte en x van de bal op de doellijn (y = 0). */
  const opLijn = (tl: ReturnType<typeof maakTijdlijn>) => {
    for (let s = 0; s < tl.duur; s += 0.002) {
      const b = st(tl, 'bal', s);
      if (b.y <= 0) return b;
    }
    throw new Error('bal komt niet over de doellijn');
  };

  it('over de lat: keeper springt, de bal gaat over de lat en niet in het net', () => {
    const tl = tip([34.6, 0], 2.3);
    const b = opLijn(tl);
    expect(b.hoogte).toBeGreaterThan(2.54);
    expect(Math.max(...Array.from({ length: 80 }, (_, i) => st(tl, 'k', i * 0.05).sprong))).toBeGreaterThan(0.8);
    for (let s = 0; s < tl.duur; s += 0.05) expect(standOp(tl, s).net).toEqual([]);
  });

  it('om de paal: hoge duik, de bal gaat buiten de paal langs', () => {
    const tl = tip([37.2, 0], 1.6);
    const b = opLijn(tl);
    expect(Math.abs(b.x - 34)).toBeGreaterThan(3.76);
    expect(Math.max(...Array.from({ length: 80 }, (_, i) => st(tl, 'k', i * 0.05).liggen))).toBeGreaterThan(0.9);
    for (let s = 0; s < tl.duur; s += 0.05) expect(standOp(tl, s).net).toEqual([]);
  });
});

describe('voetenwerk keeper', () => {
  it('zijwaarts en kruispas: blijft naar het veld kijken', () => {
    const tl = maakTijdlijn(
      t([keeper('k', 5, 2)], [{ acties: [{ type: 'loop', wie: 'k', naar: [9, 2], manier: 'kruispas' }] }, { acties: [{ type: 'loop', wie: 'k', naar: [5, 2], manier: 'zijwaarts' }] }]),
    );
    for (let s = 0; s <= tl.duur; s += 0.1) expect(st(tl, 'k', s).hoek).toBeCloseTo(90, 5);
    expect(st(tl, 'k', 0.6).manier).toBe('kruispas');
  });
});

describe('kniezit en hurkzit', () => {
  it('keeper begint in kniezit, duikt, staat op en gaat weer in hurkzit zitten', () => {
    const tl = maakTijdlijn(
      t(
        [keeper('k', 10, 2, { houding: 'kniezit' }), bal('k')],
        [
          { duur: 0.5, acties: [] },
          { acties: [{ type: 'duik', wie: 'k', naar: [8.4, 2] }] },
          { duur: 0.6, acties: [] },
          { acties: [{ type: 'opstaan', wie: 'k' }] },
          { acties: [{ type: 'loop', wie: 'k', naar: [10, 2] }] },
          { acties: [{ type: 'zitten', wie: 'k', houding: 'hurkzit' }] },
          { duur: 0.5, acties: [] },
        ],
      ),
    );
    expect(st(tl, 'k', 0.3).zit).toBe(1);
    expect(st(tl, 'k', 0.3).zitSoort).toBe('kniezit');
    // Bal in de handen, lager dan staand.
    expect(st(tl, 'bal', 0.3).hoogte).toBeCloseTo(0.6, 2);
    expect(st(tl, 'k', 1.1).zit).toBe(0);
    expect(st(tl, 'k', tl.duur).zit).toBe(1);
    expect(st(tl, 'k', tl.duur).zitSoort).toBe('hurkzit');
  });
});

describe('duikNaar', () => {
  it('keeper duikt precies op tijd naar de bal (ook als de worp later begint)', () => {
    const tl = maakTijdlijn(
      t(
        [keeper('k', 10, 2), trainer, bal('t')],
        [{ acties: [{ type: 'pass', van: 't', naar: 'k', worp: 'bovenhands', hoogte: 2.4, duikNaar: [12, 2.2], duikHoogte: 1.4 }] }, { duur: 1, acties: [] }],
      ),
    );
    const v = vlucht(tl);
    const k = st(tl, 'k', v.t1);
    expect(k.liggen).toBeGreaterThan(0.95);
    expect(Math.hypot(k.x - 12, k.y - 2.2)).toBeLessThan(0.01);
    expect(st(tl, 'bal', v.t1 - 0.005).hoogte).toBeCloseTo(1.4, 1);
    expect(st(tl, 'bal', v.t1 + 0.01).houder).toBe('k');
    // Voor de duik staat hij nog in basishouding op zijn plek.
    expect(st(tl, 'k', v.t0).liggen).toBe(0);
  });
});
