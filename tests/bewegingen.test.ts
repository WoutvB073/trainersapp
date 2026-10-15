import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp, TekeningFout } from '../src/anim/timeline';
import type { Punt, Stap, Tekening, VeldObject } from '../src/model/types';

const speler = (id: string, x = 0, y = 0, extra: Partial<VeldObject> = {}): VeldObject => ({ id, soort: 'speler', team: 'A', x, y, ...extra });
const tekening = (objecten: VeldObject[], animatie: Stap[], extra: Partial<Tekening> = {}): Tekening => ({
  veld: { type: 'leeg', breedte: 30, lengte: 30 },
  objecten,
  animatie,
  ...extra,
});
const pos = (tl: ReturnType<typeof maakTijdlijn>, id: string, t: number): Punt => {
  const s = standOp(tl, t).objecten.get(id)!;
  return [s.x, s.y];
};
const afstand = (a: Punt, b: Punt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const hoekVerschil = (a: number, b: number) => Math.abs(((((a - b) % 360) + 540) % 360) - 180);

describe('meerdere spelers tegelijk', () => {
  it('acties in één stap lopen gelijktijdig', () => {
    const tl = maakTijdlijn(
      tekening([speler('a'), speler('b', 0, 5)], [{ acties: [{ type: 'loop', wie: 'a', naar: [10, 0], duur: 2 }, { type: 'loop', wie: 'b', naar: [10, 5], duur: 2 }] }]),
    );
    expect(tl.duur).toBe(2);
    expect(pos(tl, 'a', 1)[0]).toBeCloseTo(5, 5);
    expect(pos(tl, 'b', 1)[0]).toBeCloseTo(5, 5);
  });
});

describe('loopwijzen', () => {
  const loop = (manier: string, extra = {}) =>
    maakTijdlijn(tekening([speler('a')], [{ acties: [{ type: 'loop', wie: 'a', naar: [10, 0], manier, ...extra } as never] }]));

  it('sprint is sneller dan joggen, wandelen langzamer', () => {
    expect(loop('sprint').duur).toBeLessThan(loop('jog').duur);
    expect(loop('wandel').duur).toBeGreaterThan(loop('jog').duur);
  });

  it('zijwaarts kijkt 90° naast de looprichting, achteruit kijkt terug', () => {
    expect(hoekVerschil(standOp(loop('zijwaarts'), 1).objecten.get('a')!.hoek, -90)).toBeLessThan(1);
    expect(hoekVerschil(standOp(loop('achteruit'), 1).objecten.get('a')!.hoek, 180)).toBeLessThan(1);
    expect(hoekVerschil(standOp(loop('sprint'), 0.5).objecten.get('a')!.hoek, 0)).toBeLessThan(1);
    // Vaste kijkrichting kan ook.
    expect(hoekVerschil(standOp(loop('zijwaarts', { kijk: 90 }), 1).objecten.get('a')!.hoek, 90)).toBeLessThan(1);
  });

  it('de stand vertelt loopwijze, snelheid en pasfase; stilstaand niet', () => {
    const tl = loop('voetenwerk');
    const midden = standOp(tl, tl.duur / 2).objecten.get('a')!;
    expect(midden.manier).toBe('voetenwerk');
    expect(midden.snelheid).toBeGreaterThan(2);
    expect(midden.fase).toBeGreaterThan(0);
    const later = standOp(tl, tl.duur + 0.5).objecten.get('a')!;
    expect(later.manier).toBeUndefined();
    expect(later.snelheid).toBe(0);
  });

  it('voetenwerk heeft kleinere pasjes (hoger ritme) dan joggen', () => {
    const fase = (m: string) => {
      const tl = loop(m);
      return standOp(tl, tl.duur * 0.99).objecten.get('a')!.fase;
    };
    expect(fase('voetenwerk')).toBeGreaterThan(fase('jog') * 1.5);
  });

  it('spoor onthoudt de loopwijze (voor pasjes) en kan uit', () => {
    expect(loop('hordes').sporen[0]!.manier).toBe('hordes');
    expect(loop('jog', { spoor: false }).sporen).toHaveLength(0);
  });
});

describe('paden', () => {
  it('via: de speler loopt door de tussenpunten (slalom)', () => {
    const via: Punt[] = [[2, 1], [4, -1], [6, 1]];
    const tl = maakTijdlijn(tekening([speler('a')], [{ acties: [{ type: 'loop', wie: 'a', naar: [8, 0], via, duur: 4 }] }]));
    const geraakt = via.map((v) => Math.min(...Array.from({ length: 401 }, (_, i) => afstand(pos(tl, 'a', i / 100), v))));
    for (const d of geraakt) expect(d).toBeLessThan(0.05);
    expect(tl.sporen[0]!.pad.length).toBe(5);
  });

  it('draai om een pion: blijft er omheen (niet erdoor) en komt terug', () => {
    const tl = maakTijdlijn(
      tekening([speler('a'), { id: 'p', soort: 'pion', x: 10, y: 0 }], [{ acties: [{ type: 'loop', wie: 'a', naar: [0, 1.5], om: 'p', duur: 5 }] }]),
    );
    const punten = Array.from({ length: 501 }, (_, i) => pos(tl, 'a', i / 100));
    const minPion = Math.min(...punten.map((p) => afstand(p, [10, 0])));
    expect(minPion).toBeGreaterThan(0.8);
    // Komt achter de pion (x > 10) en eindigt op het eindpunt.
    expect(Math.max(...punten.map((p) => p[0]))).toBeGreaterThan(10.7);
    expect(afstand(punten[500]!, [0, 1.5])).toBeLessThan(0.01);
  });
});

describe('rijen: wachten, doorschuiven en aansluiten', () => {
  const rij = { id: 'r', x: 0, y: 0, richting: 90, afstand: 1.5, spelers: ['a', 'b', 'c'] };
  const basis = (animatie: Stap[]) => tekening([speler('a', 99, 99), speler('b'), speler('c')], animatie, { rijen: [rij] });

  it('spelers staan op hun plek in de rij en kijken naar voren', () => {
    const tl = maakTijdlijn(basis([]));
    expect(pos(tl, 'a', 0)).toEqual([0, 0]);
    expect(pos(tl, 'b', 0)[1]).toBeCloseTo(1.5, 5);
    expect(pos(tl, 'c', 0)[1]).toBeCloseTo(3, 5);
    expect(hoekVerschil(standOp(tl, 0).objecten.get('c')!.hoek, -90)).toBeLessThan(1);
  });

  it('wie vertrekt laat de rest doorschuiven', () => {
    const tl = maakTijdlijn(basis([{ acties: [{ type: 'loop', wie: 'a', naar: [0, -10] }] }]));
    expect(pos(tl, 'b', 5)[1]).toBeCloseTo(0, 5);
    expect(pos(tl, 'c', 5)[1]).toBeCloseTo(1.5, 5);
  });

  it('aansluiten: achteraan, buitenom (niet door de rij), daarna weer naar voren kijken', () => {
    const tl = maakTijdlijn(
      basis([{ acties: [{ type: 'loop', wie: 'a', naar: [0, -10] }] }, { acties: [{ type: 'aansluiten', wie: 'a', rij: 'r' }] }]),
    );
    const eind = tl.duur + 0.5;
    expect(pos(tl, 'a', eind)[1]).toBeCloseTo(3, 5); // plek 2 (b en c zijn opgeschoven)
    expect(hoekVerschil(standOp(tl, eind).objecten.get('a')!.hoek, -90)).toBeLessThan(1);
    // Onderweg nooit dichter dan 1 m bij b of c.
    const t0 = tl.bewegingen.get('a')![1]!.t0;
    for (let t = t0; t < tl.duur; t += 0.05) {
      const p = pos(tl, 'a', t);
      expect(Math.min(afstand(p, pos(tl, 'b', t)), afstand(p, pos(tl, 'c', t)))).toBeGreaterThan(1);
    }
    expect(tl.sporen).toHaveLength(1); // aansluiten laat standaard geen lijn achter
  });

  it('aansluiten "bij" iemand: de rij waar die persoon staat', () => {
    const tl = maakTijdlijn(
      tekening([speler('x', 10, 10), speler('b'), speler('c')], [{ acties: [{ type: 'aansluiten', wie: 'x', bij: 'c' }] }], {
        rijen: [{ id: 'r', x: 0, y: 0, richting: 90, spelers: ['b', 'c'] }],
      }),
    );
    expect(pos(tl, 'x', tl.duur)[1]).toBeCloseTo(3.2, 5);
  });

  it('geeft een duidelijke fout bij een onbekende rij', () => {
    expect(() => maakTijdlijn(basis([{ acties: [{ type: 'aansluiten', wie: 'a', rij: 'zz' }] }]))).toThrow(TekeningFout);
  });
});

describe('herhaling over meerdere spelers', () => {
  const rij = { id: 'r', x: 0, y: 0, richting: 90, afstand: 1.5, spelers: ['a', 'b', 'c'] };
  const patroon = [{ acties: [{ type: 'loop' as const, wie: '@', naar: [0, -8] as Punt, manier: 'sprint' as const }] }, { acties: [{ type: 'aansluiten' as const, wie: '@', rij: 'r' }] }];
  const objecten = [speler('a'), speler('b'), speler('c')];

  it('na elkaar: iedereen loopt het patroon en staat weer in de rij, in dezelfde volgorde', () => {
    const tl = maakTijdlijn(tekening(objecten, [{ herhaal: { spelers: ['a', 'b', 'c'], stappen: patroon } }], { rijen: [rij] }));
    for (const id of ['a', 'b', 'c']) expect(tl.sporen.filter((s) => s.id === id)).toHaveLength(1);
    const eind = tl.duur + 1;
    expect(pos(tl, 'a', eind)[1]).toBeCloseTo(0, 5);
    expect(pos(tl, 'b', eind)[1]).toBeCloseTo(1.5, 5);
    expect(pos(tl, 'c', eind)[1]).toBeCloseTo(3, 5);
  });

  it('met "tussen" overlappen de spelers (korter dan na elkaar) en rondes herhalen de lijst', () => {
    const naElkaar = maakTijdlijn(tekening(objecten, [{ herhaal: { spelers: ['a', 'b', 'c'], stappen: patroon } }], { rijen: [rij] }));
    const overlap = maakTijdlijn(tekening(objecten, [{ herhaal: { spelers: ['a', 'b', 'c'], stappen: patroon, tussen: 1 } }], { rijen: [rij] }));
    expect(overlap.duur).toBeLessThan(naElkaar.duur * 0.7);
    // b vertrekt 1 s na a.
    expect(overlap.bewegingen.get('b')!.find((x) => x.manier === 'sprint')!.t0).toBeCloseTo(1, 5);
    const twee = maakTijdlijn(tekening(objecten, [{ herhaal: { spelers: ['a', 'b', 'c'], stappen: patroon, tussen: 1, rondes: 2 } }], { rijen: [rij] }));
    expect(twee.sporen).toHaveLength(6);
  });

  it('@volgende en wachten op de bal: pass en volg tussen twee rijen', () => {
    const t = tekening(
      [speler('a'), speler('b'), speler('c'), speler('d'), { id: 'bal', soort: 'bal', x: 0, y: 0, bij: 'a' }],
      [
        {
          herhaal: {
            spelers: ['a', 'c', 'b', 'd'],
            tussen: 0.5, // korter dan de pass: de volgende wacht vanzelf tot hij de bal heeft
            stappen: [{ acties: [{ type: 'pass', van: '@', naar: '@volgende' }] }, { acties: [{ type: 'aansluiten', wie: '@', bij: '@volgende' }] }],
          },
        },
      ],
      {
        rijen: [
          { id: 'links', x: 0, y: 0, richting: 180, spelers: ['a', 'b'] },
          { id: 'rechts', x: 12, y: 0, richting: 0, spelers: ['c', 'd'] },
        ],
      },
    );
    const tl = maakTijdlijn(t);
    const passes = tl.sporen.filter((s) => s.soort === 'bal');
    expect(passes).toHaveLength(4);
    // Elke pass begint pas als de vorige is aangekomen.
    for (let i = 1; i < passes.length; i++) expect(passes[i]!.t0).toBeGreaterThan(passes[i - 1]!.t1);
    // a is naar de overkant gelopen en staat (na doorschuiven) vooraan in de rechterrij.
    expect(pos(tl, 'a', tl.duur + 1)[0]).toBeCloseTo(12, 5);
  });
});

describe('hesje wisselen (tikspel)', () => {
  it('team verandert vanaf het moment van de actie', () => {
    const tl = maakTijdlijn(tekening([speler('a')], [{ duur: 1, acties: [] }, { acties: [{ type: 'team', wie: 'a', team: 'C' }] }]));
    expect(standOp(tl, 0.5).objecten.get('a')!.team).toBe('A');
    expect(standOp(tl, 1.2).objecten.get('a')!.team).toBe('C');
  });
});

describe('3D-houding per loopwijze', async () => {
  const { pose } = await import('../src/anim/render3d');
  it('stilstaan: alles in rust', () => {
    const p = pose(undefined, 0, 1.2);
    expect([...p.benen, ...p.spreid, p.veer]).toEqual([0, 0, 0, 0, 0]);
  });
  it('kniehef tilt de knieën alleen naar voren, zijwaarts spreidt de benen, huppel en sprong veren', () => {
    const kn = pose('kniehef', 2, Math.PI / 2);
    expect(kn.benen[0]).toBeLessThan(-1);
    expect(kn.benen[1]).toBeCloseTo(0, 9);
    expect(Math.abs(pose('zijwaarts', 2.5, Math.PI / 2).spreid[0])).toBeGreaterThan(0.3);
    expect(pose('huppel', 3, Math.PI / 2).veer).toBeGreaterThan(0.15);
    expect(pose('sprong', 3, Math.PI / 2).veer).toBeGreaterThan(0.2);
  });
  it('liggen (duik) zet de loopbeweging uit', () => {
    for (const b of pose('sprint', 7, 1, 1).benen) expect(b).toBeCloseTo(0, 9);
  });
});

describe('waarden per speler en reeksen tegelijk', () => {
  const rij = (id: string, y: number, spelers: string[]) => ({ id, x: 0, y, richting: 180, spelers });
  const parcours = [{ acties: [{ type: 'loop' as const, wie: '@', naar: [10, 0] as Punt, manier: '@manier' as never }] }];

  it('@manier geeft elke speler zijn eigen loopwijze', () => {
    const tl = maakTijdlijn(
      tekening([speler('a'), speler('b'), speler('c')], [{ herhaal: { spelers: ['a', 'b', 'c'], tussen: 1, stappen: parcours, waarden: { manier: ['huppel', 'zijwaarts'] } } }]),
    );
    expect(tl.sporen.map((s) => s.manier)).toEqual(['huppel', 'zijwaarts', 'huppel']);
  });

  it('onbekende invulling geeft een duidelijke fout', () => {
    expect(() => maakTijdlijn(tekening([speler('a')], [{ herhaal: { spelers: ['a'], stappen: parcours } }]))).toThrow(/@manier/);
  });

  it('estafette: twee teams lopen tegelijk, binnen een team na elkaar', () => {
    const team = (r: string, y: number, ids: string[]) => [
      {
        herhaal: {
          spelers: ids,
          stappen: [
            { acties: [{ type: 'loop' as const, wie: '@', naar: [10, y] as Punt, manier: 'sprint' as const }] },
            { acties: [{ type: 'aansluiten' as const, wie: '@', rij: r }] },
          ],
        },
      },
    ];
    const tl = maakTijdlijn(
      tekening([speler('a1'), speler('a2'), speler('b1'), speler('b2')], [{ tegelijk: [team('ra', 0, ['a1', 'a2']), team('rb', 5, ['b1', 'b2'])] }], {
        rijen: [rij('ra', 0, ['a1', 'a2']), rij('rb', 5, ['b1', 'b2'])],
      }),
    );
    const start = (id: string) => tl.bewegingen.get(id)!.find((x) => x.manier === 'sprint')!.t0;
    expect(start('a1')).toBe(0);
    expect(start('b1')).toBe(0);
    // De tweede van elk team start pas als de eerste terug is in de rij.
    const terugA1 = tl.bewegingen.get('a1')![1]!.t1; // einde van het aansluiten
    expect(start('a2')).toBeCloseTo(terugA1, 5);
    expect(start('b2')).toBeCloseTo(start('a2'), 5);
  });
});
