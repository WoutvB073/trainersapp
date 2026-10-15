import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp, TekeningFout } from '../src/anim/timeline';
import type { Tekening } from '../src/model/types';

const basis = (animatie: Tekening['animatie']): Tekening => ({
  veld: { type: 'leeg', breedte: 30, lengte: 20 },
  objecten: [
    { id: 'a1', soort: 'speler', team: 'A', nummer: 1, x: 5, y: 10 },
    { id: 'a2', soort: 'speler', team: 'A', nummer: 2, x: 20, y: 10 },
    { id: 'k1', soort: 'keeper', x: 15, y: 2 },
    { id: 'b1', soort: 'bal', x: 5, y: 10, bij: 'a1' },
  ],
  animatie,
});

const pos = (s: ReturnType<typeof standOp>, id: string) => {
  const o = s.objecten.get(id)!;
  return [o.x, o.y];
};

describe('tijdlijn', () => {
  it('pass: bal gaat van a1 naar a2 en is daarna van a2', () => {
    const tl = maakTijdlijn(basis([{ acties: [{ type: 'pass', van: 'a1', naar: 'a2' }] }]));
    expect(tl.duur).toBeGreaterThan(1);
    const begin = standOp(tl, 0);
    const [bx0] = pos(begin, 'b1');
    expect(Math.abs(bx0! - 5)).toBeLessThan(0.7);
    const eind = standOp(tl, tl.duur + 1);
    const [bx1, by1] = pos(eind, 'b1');
    // Aan de voeten van a2, aan de kant waar de bal vandaan kwam.
    expect(bx1!).toBeGreaterThan(19);
    expect(bx1!).toBeLessThan(20);
    expect(by1!).toBeCloseTo(10, 1);
    expect(eind.sporen).toHaveLength(1);
    expect(eind.sporen[0]!.soort).toBe('bal');
    expect(eind.sporen[0]!.klaar).toBe(true);
  });

  it('spoor groeit mee met de beweging', () => {
    const tl = maakTijdlijn(basis([{ acties: [{ type: 'loop', wie: 'a1', naar: [5, 0], duur: 2 }] }]));
    const half = standOp(tl, 1);
    expect(half.sporen[0]!.klaar).toBe(false);
    expect(half.sporen[0]!.tot[1]).toBeCloseTo(5, 5);
    expect(pos(half, 'a1')[1]).toBeCloseTo(5, 5);
    // Bal blijft bij de loper.
    const [, by] = pos(half, 'b1');
    expect(Math.abs(by! - 5)).toBeLessThan(0.7);
  });

  it('pass naar een lopende speler komt aan waar die speler dan is', () => {
    const tl = maakTijdlijn(
      basis([
        {
          acties: [
            { type: 'loop', wie: 'a2', naar: [20, 18], duur: 1.5 },
            { type: 'pass', van: 'a1', naar: 'a2', start: 0.3 },
          ],
        },
      ]),
    );
    const eind = standOp(tl, tl.duur);
    const [bx, by] = pos(eind, 'b1');
    expect(Math.hypot(bx! - 20, by! - 18)).toBeLessThan(0.7);
  });

  it('dribbel neemt de bal mee, schot laat hem los liggen', () => {
    const tl = maakTijdlijn(
      basis([
        { acties: [{ type: 'dribbel', wie: 'a1', naar: [10, 4] }] },
        { acties: [{ type: 'schot', van: 'a1', naar: [15, -1] }] },
      ]),
    );
    const s = standOp(tl, tl.duur);
    expect(pos(s, 'a1')).toEqual([10, 4]);
    expect(pos(s, 'b1')).toEqual([15, -1]);
    expect(s.sporen.map((x) => x.soort)).toEqual(['dribbel', 'bal']);
  });

  it('duik: keeper ligt tot hij opstaat', () => {
    const tl = maakTijdlijn(
      basis([
        { acties: [{ type: 'duik', wie: 'k1', naar: [13, 2] }] },
        { acties: [{ type: 'opstaan', wie: 'k1' }] },
      ]),
    );
    expect(standOp(tl, 0.6).objecten.get('k1')!.houding).toBe('duik');
    expect(standOp(tl, 0.6).objecten.get('k1')!.duikHoek).toBeCloseTo(180);
    expect(standOp(tl, tl.duur).objecten.get('k1')!.houding).toBe('staan');
  });

  it('hoge bal gaat door de lucht', () => {
    const tl = maakTijdlijn(basis([{ acties: [{ type: 'pass', van: 'a1', naar: 'a2', hoog: true, duur: 2 }] }]));
    expect(standOp(tl, 1).objecten.get('b1')!.hoogte).toBeGreaterThan(1);
    expect(standOp(tl, 2.1).objecten.get('b1')!.hoogte).toBe(0);
  });

  it('pak: speler pakt een losse bal', () => {
    const t = basis([
      { acties: [{ type: 'schot', van: 'a1', naar: [20, 12] }] },
      { acties: [{ type: 'pak', wie: 'a2' }] },
      { acties: [{ type: 'loop', wie: 'a2', naar: [25, 12] }] },
    ]);
    const tl = maakTijdlijn(t);
    const [bx] = pos(standOp(tl, tl.duur), 'b1');
    expect(bx!).toBeGreaterThan(24);
  });

  it('geeft een duidelijke fout bij een onbekende speler of zonder bal', () => {
    expect(() => maakTijdlijn(basis([{ acties: [{ type: 'loop', wie: 'x9', naar: [1, 1] }] }]))).toThrow(TekeningFout);
    expect(() => maakTijdlijn(basis([{ acties: [{ type: 'pass', van: 'a2', naar: 'a1' }] }]))).toThrow(/geen bal/);
  });

  it('stap met alleen een duur is een pauze', () => {
    const tl = maakTijdlijn(basis([{ acties: [], duur: 2 }]));
    expect(tl.duur).toBe(2);
  });
});

describe('balhoogte', () => {
  const metPass = (extra: Record<string, unknown>, type: 'pass' | 'schot' = 'pass') =>
    maakTijdlijn(basis([{ acties: [{ type, van: 'a1', naar: 'a2', duur: 2, ...extra } as never] }]));
  // Halverwege de boog: de bal-ease bereikt 0,5 bij u ≈ 0,4384.
  const midden = 2 * 0.43845;
  const hoogte = (tl: ReturnType<typeof maakTijdlijn>, t: number) => standOp(tl, t).objecten.get('b1')!.hoogte;

  it('pass gaat standaard over de grond', () => {
    const tl = metPass({});
    expect(hoogte(tl, 1)).toBe(0);
    expect(tl.sporen[0]!.top).toBe(0);
  });

  it('schot krijgt standaard een lage boog', () => {
    const tl = metPass({}, 'schot');
    expect(hoogte(tl, midden)).toBeCloseTo(1, 2);
    expect(tl.sporen[0]!.top).toBe(1);
  });

  it('schot over de grond kan ook', () => {
    expect(hoogte(metPass({ hoogte: 'grond' }, 'schot'), 1)).toBe(0);
  });

  it('woorden en getallen geven het hoogste punt van de boog', () => {
    expect(hoogte(metPass({ hoogte: 'laag' }), midden)).toBeCloseTo(1, 2);
    expect(hoogte(metPass({ hoogte: 'halfhoog' }), midden)).toBeCloseTo(2.5, 2);
    expect(hoogte(metPass({ hoogte: 3.2 }), midden)).toBeCloseTo(3.2, 2);
    // Hoog hangt af van de afstand (15 m → 1 + 15 × 0,22 = 4,3 m, min. de balafstanden).
    const hoog = hoogte(metPass({ hoogte: 'hoog' }), midden);
    expect(hoog).toBeGreaterThan(3.5);
    expect(hoog).toBeLessThanOrEqual(7);
  });

  it('oude tekeningen met hoog: true werken nog', () => {
    const oud = hoogte(metPass({ hoog: true }), midden);
    expect(oud).toBeCloseTo(hoogte(metPass({ hoogte: 'hoog' }), midden), 5);
  });

  it('begint en eindigt op de grond, en de stand vertelt van wie naar wie', () => {
    const tl = metPass({ hoogte: 'halfhoog' });
    expect(hoogte(tl, 0.001)).toBeLessThan(0.02);
    expect(hoogte(tl, 2)).toBe(0);
    const s = standOp(tl, 1).objecten.get('b1')!;
    expect(s.vlucht).toMatchObject({ van: 'a1', naar: 'a2', top: 2.5 });
    expect(s.houder).toBeNull();
    expect(standOp(tl, 2.5).objecten.get('b1')!.houder).toBe('a2');
    // Vóór een latere pass heeft de passeerder hem.
    const later = maakTijdlijn(basis([{ acties: [{ type: 'pass', van: 'a1', naar: 'a2', start: 1 }] }]));
    expect(standOp(later, 0.5).objecten.get('b1')!.houder).toBe('a1');
  });

  it('negatieve hoogte telt als grond', () => {
    expect(hoogte(metPass({ hoogte: -2 }), midden)).toBe(0);
  });
});

describe('duiken en opstaan (geleidelijk)', () => {
  it('liggen loopt van 0 naar 1 en bij opstaan weer naar 0', () => {
    const tl = maakTijdlijn(
      basis([
        { acties: [{ type: 'duik', wie: 'k1', naar: [13, 2], duur: 0.5 }] },
        { acties: [{ type: 'opstaan', wie: 'k1', duur: 0.5 }] },
      ]),
    );
    const l = (t: number) => standOp(tl, t).objecten.get('k1')!.liggen;
    expect(l(0)).toBe(0);
    expect(l(0.25)).toBeGreaterThan(0.3);
    expect(l(0.25)).toBeLessThan(1);
    expect(l(0.5)).toBe(1);
    expect(l(0.75)).toBeGreaterThan(0);
    expect(l(0.75)).toBeLessThan(1);
    expect(l(1.0)).toBe(0);
    expect(standOp(tl, 0.75).objecten.get('k1')!.duikHoek).toBeCloseTo(180);
  });
});
