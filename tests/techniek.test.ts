import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp, vluchtDuur } from '../src/anim/timeline';
import type { Punt, Stap, Tekening, VeldObject } from '../src/model/types';

const speler = (id: string, x = 0, y = 0, extra: Partial<VeldObject> = {}): VeldObject => ({ id, soort: 'speler', team: 'A', x, y, ...extra });
const tekening = (objecten: VeldObject[], animatie: Stap[]): Tekening => ({ veld: { type: 'leeg', breedte: 40, lengte: 30 }, objecten, animatie });
const stand = (tl: ReturnType<typeof maakTijdlijn>, id: string, t: number) => standOp(tl, t).objecten.get(id)!;
const afstand = (a: { x: number; y: number }, b: { x: number; y: number } | Punt) =>
  Array.isArray(b) ? Math.hypot(a.x - b[0], a.y - b[1]) : Math.hypot(a.x - b.x, a.y - b.y);

describe('balsnelheid', () => {
  it('korte pass is snel, lange grondpass sneller per meter, lange bal met boog', () => {
    expect(vluchtDuur('pass', 0, 5)).toBeLessThan(0.6);
    expect(25 / vluchtDuur('pass', 0, 25)).toBeGreaterThan(14);
    const lang = vluchtDuur('pass', 7, 30);
    expect(lang).toBeGreaterThan(2);
    expect(lang).toBeLessThan(2.7);
    // Een boog kost minstens de tijd om omhoog en weer omlaag te gaan.
    expect(vluchtDuur('pass', 2.5, 8)).toBeCloseTo(2 * Math.sqrt(5 / 9.81), 5);
  });
});

describe('bal aan de voet', () => {
  const t = tekening([speler('a'), { id: 'b', soort: 'bal', x: 0, y: 0, bij: 'a' }], [{ acties: [{ type: 'dribbel', wie: 'a', naar: [10, 0], duur: 3 }] }]);
  it('stilstaand op 40 cm, dribbelend nooit verder dan ± 55 cm', () => {
    const tl = maakTijdlijn(t);
    expect(afstand(stand(tl, 'b', 0), stand(tl, 'a', 0))).toBeCloseTo(0.4, 2);
    for (let s = 0; s <= 3; s += 0.05) expect(afstand(stand(tl, 'b', s), stand(tl, 'a', s))).toBeLessThan(0.56);
  });

  it('wegdraaien na aanname: de bal draait mee om de speler (springt niet naar de andere kant)', () => {
    const tl = maakTijdlijn(
      tekening(
        [speler('a', 0, 0), speler('b', 10, 0), { id: 'bal', soort: 'bal', x: 0, y: 0, bij: 'a' }],
        [{ acties: [{ type: 'pass', van: 'a', naar: 'b' }] }, { acties: [{ type: 'dribbel', wie: 'b', naar: [16, 0], duur: 2 }] }],
      ),
    );
    const start = tl.bewegingen.get('b')![0]!.t0;
    let vorige = stand(tl, 'bal', start - 0.01);
    for (let s = start; s < start + 0.6; s += 0.02) {
      const nu = stand(tl, 'bal', s);
      expect(afstand(nu, vorige)).toBeLessThan(0.25); // een sprong was 0,6 m
      vorige = nu;
    }
  });
});

describe('rebounder / muurtje', () => {
  const objecten = [speler('a', 5, 10), speler('c', 9, 10), { id: 'rb', soort: 'rebounder' as const, x: 5, y: 2 }, { id: 'bal', soort: 'bal' as const, x: 5, y: 10, bij: 'a' }];

  it('bal gaat naar de rebounder en kaatst terug naar de passeerder', () => {
    const tl = maakTijdlijn(tekening(objecten, [{ acties: [{ type: 'pass', van: 'a', naar: 'rb' }] }]));
    expect(tl.sporen.filter((s) => s.soort === 'bal')).toHaveLength(2);
    const halverwege = tl.sporen[0]!.t1;
    expect(afstand(stand(tl, 'bal', halverwege), [5, 2])).toBeLessThan(0.4);
    expect(stand(tl, 'bal', tl.duur + 0.1).houder).toBe('a');
  });

  it('met "terug" naar een andere speler', () => {
    const tl = maakTijdlijn(tekening(objecten, [{ acties: [{ type: 'pass', van: 'a', naar: 'rb', terug: 'c' }] }]));
    expect(stand(tl, 'bal', tl.duur + 0.1).houder).toBe('c');
  });
});

describe('schijnbeweging', () => {
  it('lijf gaat opzij en terug, de bal blijft liggen', () => {
    const tl = maakTijdlijn(
      tekening([speler('a', 0, 0, { kijkrichting: -90 }), { id: 'bal', soort: 'bal', x: 0, y: 0, bij: 'a' }], [{ acties: [{ type: 'schijn', wie: 'a', kant: 'links' }] }]),
    );
    const bal0 = stand(tl, 'bal', 0);
    const midden = stand(tl, 'a', 0.35);
    // Kijkt omhoog (-90), links is dan -x.
    expect(midden.x).toBeLessThan(-0.35);
    expect(afstand(stand(tl, 'bal', 0.35), bal0)).toBeLessThan(0.01);
    expect(afstand(stand(tl, 'a', 0.7), [0, 0])).toBeLessThan(0.01);
    expect(tl.sporen).toHaveLength(0);
  });
});

describe('hooghouden en bal wegtikken', () => {
  it('bal naar jezelf met hoogte: omhoog en terug aan de voet', () => {
    const tl = maakTijdlijn(tekening([speler('a'), { id: 'bal', soort: 'bal', x: 0, y: 0, bij: 'a' }], [{ acties: [{ type: 'pass', van: 'a', naar: 'a', hoogte: 1.5 }] }]));
    const hoek0 = stand(tl, 'a', 0).hoek;
    expect(stand(tl, 'bal', tl.duur / 2).hoogte).toBeGreaterThan(1.3);
    expect(stand(tl, 'bal', tl.duur + 0.05).houder).toBe('a');
    expect(stand(tl, 'a', tl.duur).hoek).toBe(hoek0);
  });

  it('een speler kan de bal van een ander wegtikken (met "bal")', () => {
    const tl = maakTijdlijn(
      tekening(
        [speler('a', 0, 0), speler('b', 2, 0), { id: 'ba', soort: 'bal', x: 0, y: 0, bij: 'a' }, { id: 'bb', soort: 'bal', x: 2, y: 0, bij: 'b' }],
        [{ acties: [{ type: 'pass', van: 'a', bal: 'bb', naar: [8, 6] }] }],
      ),
    );
    const eind = tl.duur + 0.1;
    expect(stand(tl, 'bb', eind).houder).toBeNull();
    expect(afstand(stand(tl, 'bb', eind), [8, 6])).toBeLessThan(0.01);
    expect(stand(tl, 'ba', eind).houder).toBe('a');
  });
});
