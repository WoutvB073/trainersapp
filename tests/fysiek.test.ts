import { describe, expect, it } from 'vitest';
import { fysiekeFouten } from '../src/anim/fysiek';
import { OEFENINGEN } from '../src/data/oefeningen';
import type { Stap, Tekening, VeldObject } from '../src/model/types';

const speler = (id: string, x: number, y: number, extra: Partial<VeldObject> = {}): VeldObject => ({ id, soort: 'speler', team: 'A', x, y, ...extra });
const bal = (bij: string): VeldObject => ({ id: 'bal', soort: 'bal', x: 0, y: 0, bij });
const t = (objecten: VeldObject[], animatie: Stap[]): Tekening => ({ veld: { type: 'leeg', breedte: 30, lengte: 20 }, objecten, animatie });
const ladder: VeldObject = { id: 'l', soort: 'ladder', x: 10, y: 10, hoek: 90, lengte: 4, breedte: 0.5 };

describe('fysieke check (de regels zelf)', () => {
  it('grondbal over een ladder: fout; hoge bal over de ladder: goed', () => {
    const grond = fysiekeFouten(t([ladder, speler('a', 10, 6), speler('b', 10, 14), bal('a')], [{ acties: [{ type: 'pass', van: 'a', naar: 'b' }] }]));
    expect(grond.some((f) => f.includes('ladder'))).toBe(true);
    const hoog = fysiekeFouten(t([ladder, speler('a', 10, 6), speler('b', 10, 14), bal('a')], [{ acties: [{ type: 'pass', van: 'a', naar: 'b', hoogte: 'hoog' }] }]));
    expect(hoog).toEqual([]);
  });

  it('bal door een net of door een speler die hem niet krijgt: fout', () => {
    const net: VeldObject = { id: 'n', soort: 'net', x: 10, y: 10, breedte: 6, hoogte: 1 };
    expect(fysiekeFouten(t([net, speler('a', 10, 6), speler('b', 10, 14), bal('a')], [{ acties: [{ type: 'pass', van: 'a', naar: 'b', hoogte: 'laag' }] }])).join()).toContain('n (net)');
    const tussen = fysiekeFouten(t([speler('a', 4, 10), speler('c', 10, 10), speler('b', 16, 10), bal('a')], [{ acties: [{ type: 'pass', van: 'a', naar: 'b' }] }]));
    expect(tussen.join()).toContain('door c heen');
  });

  it('bal tegen de rebounder is goed (bewust), langs de zijkant van een goal naar binnen niet', () => {
    const reb: VeldObject = { id: 'r', soort: 'rebounder', x: 10, y: 4 };
    expect(fysiekeFouten(t([reb, speler('a', 10, 10), bal('a')], [{ acties: [{ type: 'pass', van: 'a', naar: 'r', terug: 'a' }] }]))).toEqual([]);
    const goal: VeldObject = { id: 'g', soort: 'goal', x: 10, y: 0 };
    const zij = fysiekeFouten(t([goal, speler('a', 18, -1), bal('a')], [{ acties: [{ type: 'schot', van: 'a', naar: [10, -1], hoogte: 'grond' }] }]));
    expect(zij.join()).toContain('net van g');
    expect(fysiekeFouten(t([goal, speler('a', 10, 11), bal('a')], [{ acties: [{ type: 'schot', van: 'a', naar: [11, -0.5], hoogte: 'grond' }] }]))).toEqual([]);
  });

  it('spelers: door een ladder alleen met voetenwerk, nooit door een bank', () => {
    const lopen = fysiekeFouten(t([ladder, speler('a', 6, 10)], [{ acties: [{ type: 'loop', wie: 'a', naar: [14, 10] }] }]));
    expect(lopen.join()).toContain('in l (ladder)');
    expect(fysiekeFouten(t([ladder, speler('a', 6, 10)], [{ acties: [{ type: 'loop', wie: 'a', naar: [14, 10], manier: 'voetenwerk' }] }]))).toEqual([]);
    const bank: VeldObject = { id: 'k', soort: 'bank', x: 10, y: 10 };
    expect(fysiekeFouten(t([bank, speler('a', 10, 6)], [{ acties: [{ type: 'loop', wie: 'a', naar: [10, 14] }] }])).join()).toContain('door k (bank');
  });
});

describe('fysieke check: alle oefeningen kunnen in het echt', () => {
  for (const o of OEFENINGEN) {
    it(o.id, () => {
      expect(fysiekeFouten(o.tekening).slice(0, 6)).toEqual([]);
    });
  }
});
