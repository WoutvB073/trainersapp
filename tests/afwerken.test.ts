import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import type { Punt, Stap, Tekening, VeldObject } from '../src/model/types';

/** Half veld met een goal bovenaan (34, 0) en een keeper die het verdedigt. */
const goal: VeldObject = { id: 'g', soort: 'goal', x: 34, y: 0 };
const keeper: VeldObject = { id: 'k', soort: 'keeper', x: 34, y: 1, verdedigt: 'g' };
const speler = (id: string, x: number, y: number, extra: Partial<VeldObject> = {}): VeldObject => ({ id, soort: 'speler', team: 'A', x, y, ...extra });
const bal = (id: string, bij: string): VeldObject => ({ id, soort: 'bal', x: 0, y: 0, bij });
const tekening = (objecten: VeldObject[], animatie: Stap[]): Tekening => ({ veld: { type: 'half' }, objecten: [goal, keeper, ...objecten], animatie });
const st = (tl: ReturnType<typeof maakTijdlijn>, id: string, t: number) => standOp(tl, t).objecten.get(id)!;
const afst = (a: { x: number; y: number }, p: Punt) => Math.hypot(a.x - p[0], a.y - p[1]);

describe('keeper beweegt mee met de bal', () => {
  it('staat tussen bal en midden van het goal en kijkt naar de bal', () => {
    const tl = maakTijdlijn(tekening([speler('a', 20, 14), bal('b', 'a')], [{ acties: [{ type: 'dribbel', wie: 'a', naar: [48, 14], duur: 4 }] }]));
    const begin = st(tl, 'k', 0.5);
    const eind = st(tl, 'k', 4.5);
    expect(begin.x).toBeLessThan(33.5); // bal links → keeper iets naar links
    expect(eind.x).toBeGreaterThan(34.5); // bal rechts → keeper rechts
    for (const s of [begin, eind]) {
      expect(s.y).toBeGreaterThan(0.8);
      expect(s.y).toBeLessThan(3.5);
    }
    // Kijkt (ongeveer) naar de bal.
    const b = st(tl, 'b', 4.5);
    const naarBal = (Math.atan2(b.y - eind.y, b.x - eind.x) * 180) / Math.PI;
    expect(Math.abs(((eind.hoek - naarBal + 540) % 360) - 180)).toBeLessThan(10);
  });
});

describe('afloop van een schot', () => {
  const schot = (afloop: string, naar: Punt, extra = {}) =>
    maakTijdlijn(tekening([speler('a', 30, 14), bal('b', 'a')], [{ acties: [{ type: 'schot', van: 'a', naar, afloop, ...extra } as never] }, { duur: 3, acties: [] }]));

  it('goal: keeper duikt maar de bal gaat in het net, en het net bolt even uit', () => {
    const tl = schot('goal', [31.2, -0.6]);
    const t1 = tl.sporen.find((s) => s.soort === 'bal')!.t1;
    expect(Math.max(...[0.3, 0.5, 0.7].map((t) => st(tl, 'k', t).liggen))).toBeGreaterThan(0.5);
    expect(afst(st(tl, 'b', t1 + 0.5), [31.2, -0.6])).toBeLessThan(0.01);
    const net = standOp(tl, t1 + 0.4).net;
    expect(net).toHaveLength(1);
    expect(net[0]!.sterkte).toBeGreaterThan(0.5);
    expect(standOp(tl, t1 + 1.5).net).toHaveLength(0);
    // Keeper zet zich vlak voor het schot.
    expect(st(tl, 'k', 0).gezet).toBeGreaterThan(0.3);
  });

  it('vangt: bal in de handen, daarna rolt hij hem weg en beweegt hij weer mee', () => {
    const tl = schot('vangt', [31.5, 0.2]);
    const t1 = tl.sporen.find((s) => s.soort === 'bal')!.t1;
    expect(st(tl, 'b', t1 + 0.1).houder).toBe('k');
    const eind = st(tl, 'b', tl.duur + 3);
    expect(eind.houder).toBeNull();
    expect(Math.hypot(eind.x - 34, eind.y)).toBeGreaterThan(6);
  });

  it('stompt: bal ligt daarna los, weg van het goal', () => {
    const tl = schot('stompt', [31.2, 0.4], { afloopNaar: [27, 6] });
    const eind = st(tl, 'b', tl.duur + 3);
    expect(eind.houder).toBeNull();
    expect(afst(eind, [27, 6])).toBeLessThan(0.01);
  });

  it('centraal schot: keeper hoeft niet te duiken', () => {
    const tl = schot('vangt', [34.2, 0.3]);
    expect(Math.max(...Array.from({ length: 30 }, (_, i) => st(tl, 'k', i * 0.05).liggen))).toBe(0);
  });

  it('zonder keeper bij het goal: gewoon een schot', () => {
    const t: Tekening = { veld: { type: 'half' }, objecten: [goal, speler('a', 30, 14), bal('b', 'a')], animatie: [{ acties: [{ type: 'schot', van: 'a', naar: [31, -0.5], afloop: 'vangt' }] }] };
    expect(afst(st(maakTijdlijn(t), 'b', 5), [31, -0.5])).toBeLessThan(0.01);
  });
});

describe('volley, kopbal en snelheid', () => {
  it('kopbal uit een voorzet: bal komt hoog aan, speler springt en kopt direct vanaf die hoogte', () => {
    const tl = maakTijdlijn(
      tekening(
        [speler('v', 52, 10), speler('s', 36, 9), bal('b', 'v')],
        [{ acties: [{ type: 'pass', van: 'v', naar: 's', hoogte: 'hoog', eindHoogte: 2 }] }, { acties: [{ type: 'schot', van: 's', naar: [33, -0.5], direct: true, hoogte: 'grond' }] }],
      ),
    );
    const voorzet = tl.sporen[0]!;
    const kop = tl.sporen[1]!;
    expect(kop.t0).toBeCloseTo(voorzet.t1, 5);
    expect(st(tl, 'b', kop.t0 + 0.01).hoogte).toBeGreaterThan(1.8);
    expect(st(tl, 's', voorzet.t1).sprong).toBeGreaterThan(0.9);
  });

  it('eigen snelheid: hard schot is sneller', () => {
    const schot = (snelheid?: number) =>
      maakTijdlijn(tekening([speler('a', 34, 18), bal('b', 'a')], [{ acties: [{ type: 'schot', van: 'a', naar: [36, -0.5], snelheid }] }])).duur;
    expect(schot(28)).toBeLessThan(schot());
  });
});

describe('verdedigen', () => {
  const basis = (animatie: Stap[]) =>
    maakTijdlijn({ veld: { type: 'leeg' }, objecten: [speler('a', 2, 10), speler('b', 14, 10), speler('d', 8, 4, { team: 'B' }), bal('bal', 'a')], animatie });

  it('druk: verdediger loopt naar de balbezitter tot op ± 1,7 m', () => {
    const tl = basis([{ acties: [{ type: 'druk', wie: 'd' }] }]);
    const d = st(tl, 'd', tl.duur);
    expect(afst(d, [2, 10])).toBeCloseTo(1.7, 1);
  });

  it('dek: verdediger gaat in de passlijn staan', () => {
    const tl = basis([{ acties: [{ type: 'dek', wie: 'd', tussen: ['a', 'b'] }] }]);
    expect(afst(st(tl, 'd', tl.duur), [8, 10])).toBeLessThan(0.05);
  });

  it('onderschept: de bal eindigt bij de verdediger, niet bij de ontvanger', () => {
    const tl = basis([{ acties: [{ type: 'pass', van: 'a', naar: 'b', onderschept: 'd' }] }]);
    expect(st(tl, 'bal', tl.duur + 0.2).houder).toBe('d');
    expect(Math.abs(st(tl, 'd', tl.duur).y - 10)).toBeLessThan(0.6);
  });

  it('verover: verdediger tikt de bal af en heeft hem daarna', () => {
    const tl = maakTijdlijn({
      veld: { type: 'leeg' },
      objecten: [speler('a', 5, 5), speler('d', 6.8, 5, { team: 'B' }), bal('bal', 'a')],
      animatie: [{ acties: [{ type: 'verover', wie: 'd', van: 'a' }] }, { acties: [{ type: 'team', wie: 'd', team: 'A' }, { type: 'team', wie: 'a', team: 'B' }] }],
    });
    expect(st(tl, 'bal', tl.duur).houder).toBe('d');
    expect(st(tl, 'a', tl.duur).team).toBe('B');
  });

  it('joker (team J) kan meedoen', () => {
    const tl = maakTijdlijn({ veld: { type: 'leeg' }, objecten: [speler('j', 5, 5, { team: 'J' })], animatie: [] });
    expect(st(tl, 'j', 0).team).toBe('J');
  });
});
