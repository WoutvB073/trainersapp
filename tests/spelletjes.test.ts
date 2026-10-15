import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import type { Punt, Stap, Tekening, VeldObject } from '../src/model/types';

const speler = (id: string, x: number, y: number, extra: Partial<VeldObject> = {}): VeldObject => ({ id, soort: 'speler', team: 'A', x, y, ...extra });
const bal = (id: string, bij: string): VeldObject => ({ id, soort: 'bal', x: 0, y: 0, bij });
const t = (objecten: VeldObject[], animatie: Stap[]): Tekening => ({ veld: { type: 'leeg', breedte: 30, lengte: 30 }, objecten, animatie });
const st = (tl: ReturnType<typeof maakTijdlijn>, id: string, tijd: number) => standOp(tl, tijd).objecten.get(id)!;
const afst = (a: { x: number; y: number }, p: Punt) => Math.hypot(a.x - p[0], a.y - p[1]);

describe('stuitende bal', () => {
  it('bal gaat over het net, stuit één keer op het stuitpunt en komt bij de ontvanger', () => {
    const tl = maakTijdlijn(
      t([speler('a', 5, 2), speler('b', 5, 12), bal('bal', 'a')], [{ acties: [{ type: 'pass', van: 'a', naar: 'b', hoogte: 2.5, stuitOp: [5, 9.5] }] }]),
    );
    const [eerst, daarna] = tl.sporen;
    expect(tl.sporen).toHaveLength(2);
    expect(eerst!.naar).toEqual([5, 9.5]);
    expect(st(tl, 'bal', eerst!.t1).hoogte).toBeLessThan(0.05);
    expect(st(tl, 'bal', (eerst!.t0 + eerst!.t1) / 2).hoogte).toBeGreaterThan(2);
    expect(daarna!.top).toBeGreaterThan(0.3);
    expect(daarna!.top).toBeLessThan(eerst!.top);
    expect(st(tl, 'bal', tl.duur + 0.1).houder).toBe('b');
  });
});

describe('tegen de lat of paal', () => {
  const goal: VeldObject = { id: 'g', soort: 'goal', x: 15, y: 0 };
  it('lat: bal komt op 2,4 m tegen de lat en springt terug het veld in (geen doelpunt, geen bollend net)', () => {
    const tl = maakTijdlijn(t([goal, speler('a', 15, 16), bal('bal', 'a')], [{ acties: [{ type: 'schot', van: 'a', naar: [14, 0], raakt: 'lat', hoogte: 1.5 }] }]));
    const raak = tl.sporen[0]!.t1;
    expect(st(tl, 'bal', raak - 0.005).hoogte).toBeGreaterThan(2.3);
    const eind = st(tl, 'bal', 10);
    expect(eind.y).toBeGreaterThan(5);
    for (let s = 0; s < 10; s += 0.1) expect(standOp(tl, s).net).toHaveLength(0);
  });

  it('paal: laag tegen de paal en terug', () => {
    const tl = maakTijdlijn(t([goal, speler('a', 12, 14), bal('bal', 'a')], [{ acties: [{ type: 'schot', van: 'a', naar: [11.34, 0], raakt: 'paal', terugNaar: [9, 6] }] }]));
    expect(st(tl, 'bal', tl.sporen[0]!.t1 - 0.005).hoogte).toBeGreaterThan(0.6);
    expect(afst(st(tl, 'bal', 10), [9, 6])).toBeLessThan(0.01);
  });
});

describe('panna', () => {
  it('bal tussen de benen door, verdediger spreidt de benen, aanvaller loopt om hem heen', () => {
    const tl = maakTijdlijn(
      t([speler('a', 5, 10), speler('d', 9, 10, { team: 'B' }), bal('bal', 'a')], [{ acties: [{ type: 'panna', wie: 'a', door: 'd' }] }, { acties: [{ type: 'dribbel', wie: 'a', naar: [16, 10] }] }]),
    );
    const spreid = Math.max(...Array.from({ length: 40 }, (_, i) => st(tl, 'd', i * 0.05).spreid));
    expect(spreid).toBeGreaterThan(0.8);
    expect(st(tl, 'a', 0).spreid).toBe(0);
    // Aanvaller blijft op afstand van de verdediger en heeft de bal weer.
    for (let s = 0; s < tl.duur; s += 0.05) expect(afst(st(tl, 'a', s), [9, 10])).toBeGreaterThan(1.5);
    expect(st(tl, 'bal', tl.duur).houder).toBe('a');
  });
});

describe('mandekking', () => {
  it('dek tussen tegenstander en een punt, op vaste afstand', () => {
    const tl = maakTijdlijn(
      t([speler('a', 10, 10), speler('d', 4, 4, { team: 'B' })], [{ acties: [{ type: 'dek', wie: 'd', tussen: ['a', [10, 0]], afstand: 1.8 }] }]),
    );
    expect(afst(st(tl, 'd', tl.duur), [10, 8.2])).toBeLessThan(0.01);
  });
});

describe('meeschuiven', () => {
  it('dekker schuift mee met een lopende tegenstander en loopt er niet tegenaan', () => {
    const tl = maakTijdlijn(
      t(
        [speler('a', 10, 20), speler('d', 14, 10, { team: 'B' })],
        [{ acties: [{ type: 'loop', wie: 'a', naar: [10, 8], manier: 'sprint' }, { type: 'dek', wie: 'd', tussen: ['a', [10, 0]], afstand: 2 }] }],
      ),
    );
    for (let s = 0; s < tl.duur; s += 0.05) expect(afst(st(tl, 'd', s), [st(tl, 'a', s).x, st(tl, 'a', s).y])).toBeGreaterThan(1.5);
    expect(afst(st(tl, 'd', tl.duur), [10, 6])).toBeLessThan(0.01);
  });
});

describe('bank als doel', () => {
  it('bal kaatst terug van de bank naar het opgegeven punt', () => {
    const bank: VeldObject = { id: 'bk', soort: 'bank', x: 10, y: 2 };
    const tl = maakTijdlijn(t([bank, speler('a', 10, 10), bal('bal', 'a')], [{ acties: [{ type: 'schot', van: 'a', naar: 'bk', terug: [12, 6] }] }]));
    expect(tl.sporen.filter((s) => s.soort === 'bal').length).toBe(2);
    const eind = st(tl, 'bal', tl.duur + 1);
    expect(afst(eind, [12, 6])).toBeLessThan(0.05);
    expect(eind.houder).toBeNull();
  });
});
