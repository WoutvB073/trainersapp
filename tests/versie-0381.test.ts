import { describe, expect, it } from 'vitest';
import type { Lijn, Tekening, VeldObject } from '../src/model/types';
import { lijnenNaarAnimatie, lijnMeldingen } from '../src/editor/animatie';
import { lagBalNeer, voegToe } from '../src/editor/editor';
import { geefBal, kandidaten, koppelAan, lijnBegin, naarStap, sleepLijnVast, standBijLijn, standVoorStap, tekenLijn, wordtLoop, type Maten } from '../src/editor/vastklikken';

// 0.38.1: lijnen klikken vast aan spelers, meldingen met de echte reden en een oplossing, twee acties van één speler na elkaar.

/** Telefoon, half veld: ± 4,5 px per meter, dus 40 px ≈ 8,8 m en 22 px ≈ 4,9 m. Ingezoomd: ± 20 px per meter. */
const UIT: Maten = { marge: 40 / 4.5, klein: 22 / 4.5 };
const IN: Maten = { marge: 40 / 20, klein: 22 / 20 };

const speler = (id: string, team: 'A' | 'B', nummer: number, x: number, y: number): VeldObject => ({ id, soort: 'speler', team, nummer, x, y });
const pion = (id: string, x: number, y: number): VeldObject => ({ id, soort: 'pion', x, y });
const leeg = (objecten: VeldObject[], lijnen: Lijn[] = []): Tekening => ({ veld: { type: 'leeg', breedte: 40, lengte: 30 }, objecten, lijnen });

describe('0.38.1 vastklikken aan spelers', () => {
  it('speler gaat voor de pion ernaast, ook als de vinger dichter bij de pion begint', () => {
    const t = leeg([speler('a1', 'A', 1, 10, 10), pion('p1', 11, 10)]);
    const k = tekenLijn(t, 'loop', [11.2, 10.1], [20, 10], IN, standVoorStap(t, 1));
    expect(k.lijn.van).toBe('a1');
    expect(k.begin.wie).toBe('a1');
    expect(k.lijn.punten[0]).toEqual([10, 10]);
  });

  it('net naast de speler beginnen klikt vast (± 40 px), ook ver uitgezoomd', () => {
    const t = leeg([speler('b1', 'B', 1, 16.5, 35.2), pion('p1', 17.4, 31)]);
    // Situatie van de trainer: lijn begint tussen speler en pion (± 3,4 m van het midden van de speler).
    const k = tekenLijn(t, 'dribbel', [16.8, 31.8], [9.3, 14.6], UIT, standVoorStap(t, 1));
    expect(k.lijn.van).toBe('b1');
  });

  it('dichtstbijzijnde speler wint', () => {
    const t = leeg([speler('a1', 'A', 1, 10, 10), speler('a2', 'A', 2, 12.5, 10)]);
    expect(tekenLijn(t, 'loop', [11.6, 10], [20, 20], IN, standVoorStap(t, 1)).lijn.van).toBe('a2');
    expect(tekenLijn(t, 'loop', [11.1, 10], [20, 20], IN, standVoorStap(t, 1)).lijn.van).toBe('a1');
  });

  it('keepers en trainers klikken ook vast; materiaal nooit', () => {
    const t = leeg([{ id: 'k1', soort: 'keeper', nummer: 1, x: 20, y: 2 }, { id: 't1', soort: 'trainer', x: 30, y: 20 }, pion('p1', 5, 5), { id: 'bal1', soort: 'bal', x: 8, y: 8 }]);
    const s = standVoorStap(t, 1);
    expect(tekenLijn(t, 'loop', [21, 3], [25, 8], IN, s).lijn.van).toBe('k1');
    expect(tekenLijn(t, 'loop', [31, 21], [35, 25], IN, s).lijn.van).toBe('t1');
    const los = tekenLijn(t, 'loop', [5.1, 5], [8, 2], IN, s);
    expect(los.lijn.van).toBeUndefined();
    expect(los.begin.wie).toBeUndefined();
  });

  it('buiten bereik: geen koppeling (en de melding zegt dat de lijn niet vastzit)', () => {
    const t = leeg([speler('a1', 'A', 1, 10, 10)]);
    const k = tekenLijn(t, 'loop', [14, 10], [20, 10], IN, standVoorStap(t, 1));
    expect(k.lijn.van).toBeUndefined();
    expect(k.begin.wie).toBeUndefined();
    const m = lijnMeldingen(leeg(t.objecten, [{ ...k.lijn, stap: 1 }]));
    expect(m).toEqual([expect.objectContaining({ lijn: 0, los: true, oplossingen: [{ soort: 'kies-speler' }] })]);
  });

  it('het eind van een pass klikt vast aan de ontvanger in de buurt', () => {
    const t = leeg([speler('a1', 'A', 1, 10, 10), speler('a2', 'A', 2, 25, 10), pion('p1', 24, 10), { id: 'bal1', soort: 'bal', x: 10, y: 10, bij: 'a1' }]);
    const k = tekenLijn(t, 'bal', [10, 10], [23.6, 10.4], IN, standVoorStap(t, 1));
    expect(k.lijn.naar).toBe('a2');
    const o = lijnenNaarAnimatie(leeg(t.objecten, [{ ...k.lijn, stap: 1 }]));
    expect(o.meldingen).toEqual([]);
    const pass = o.tekening.animatie!.flatMap((s) => ('acties' in s ? s.acties : [])).find((a) => a.type === 'pass');
    expect(pass).toMatchObject({ van: 'a1', naar: 'a2' });
  });

  it('een pass het goal in blijft een schot (de keeper is geen ontvanger)', () => {
    const t: Tekening = {
      veld: { type: 'half' },
      objecten: [{ id: 'g1', soort: 'goal', x: 34, y: 0 }, { id: 'k1', soort: 'keeper', nummer: 1, x: 34, y: 1 }, speler('a1', 'A', 1, 34, 16), { id: 'bal1', soort: 'bal', x: 34, y: 16, bij: 'a1' }],
    };
    const k = tekenLijn(t, 'bal', [34, 16], [36, 0.5], UIT, standVoorStap(t, 1));
    expect(k.lijn.naar).toBeUndefined();
    const o = lijnenNaarAnimatie({ ...t, lijnen: [{ ...k.lijn, stap: 1 }] });
    expect(o.tekening.animatie!.flatMap((s) => ('acties' in s ? s.acties : [])).some((a) => a.type === 'schot')).toBe(true);
  });

  it('een pass die niet bij een speler begint, start bij de speler die de bal heeft', () => {
    const t = leeg([speler('a1', 'A', 1, 10, 10), speler('a2', 'A', 2, 25, 10), speler('a3', 'A', 3, 10, 25), { id: 'bal1', soort: 'bal', x: 10, y: 25, bij: 'a3' }]);
    const k = tekenLijn(t, 'bal', [18, 18], [25, 10.5], IN, standVoorStap(t, 1));
    expect(k.begin).toMatchObject({ wie: 'a3', balbezitter: true });
    expect(k.lijn.van).toBe('a3');
    // Bij een looplijn niet (die kan van iedereen zijn).
    expect(tekenLijn(t, 'loop', [18, 18], [25, 20], IN, standVoorStap(t, 1)).begin.wie).toBeUndefined();
    // Twee balbezitters: niet raden.
    const twee = voegToe(t, { id: 'bal2', soort: 'bal', x: 25, y: 10, bij: 'a2' });
    expect(tekenLijn(twee, 'bal', [18, 18], [30, 20], IN, standVoorStap(twee, 1)).begin.wie).toBeUndefined();
  });

  it('na een looplijn klikt een pass vast op de plek waar de loper dan staat', () => {
    const t = leeg(
      [speler('a1', 'A', 1, 10, 10), speler('a2', 'A', 2, 25, 10), { id: 'bal1', soort: 'bal', x: 10, y: 10, bij: 'a1' }],
      [
        {
          soort: 'loop',
          punten: [
            [25, 10],
            [25, 25],
          ],
          van: 'a2',
          stap: 1,
        },
      ],
    );
    const k = tekenLijn(t, 'bal', [10, 10], [24, 24], IN, standVoorStap(t, 2));
    expect(k.eind.ontvanger).toBe('a2');
    expect(k.lijn.punten[1]).toEqual([25, 25]);
    const o = lijnenNaarAnimatie({ ...t, lijnen: [...t.lijnen!, { ...k.lijn, stap: 2 }] });
    expect(o.meldingen).toEqual([]);
  });

  it('begin van een losse lijn later naar een speler slepen koppelt hem', () => {
    const t = leeg(
      [speler('a1', 'A', 1, 10, 10)],
      [
        {
          soort: 'loop',
          punten: [
            [16, 10],
            [20, 10],
          ],
          stap: 1,
        },
      ],
    );
    const uit = sleepLijnVast(t, 0, 'begin', [10.8, 10.4], IN, standBijLijn(t, 0));
    expect(uit.lijnen![0]).toMatchObject({
      van: 'a1',
      punten: [
        [10, 10],
        [20, 10],
      ],
    });
    expect(lijnMeldingen(uit)).toEqual([]);
  });

  it('keuzemenu: spelers in de buurt (dichtstbij eerst, met wie de bal heeft) en koppelen met één tik', () => {
    const t = leeg(
      [speler('a1', 'A', 1, 10, 10), speler('b1', 'B', 1, 14, 10), speler('a2', 'A', 2, 30, 25), { id: 'bal1', soort: 'bal', x: 30, y: 25, bij: 'a2' }],
      [
        {
          soort: 'bal',
          punten: [
            [16, 12],
            [20, 20],
          ],
          stap: 1,
        },
      ],
    );
    const k = kandidaten(t, 0);
    expect(k.map((x) => x.id)).toEqual(['b1', 'a1', 'a2']);
    expect(k[0]!.naam).toBe('Speler 1 van team B');
    expect(k.find((x) => x.id === 'a2')!.metBal).toBe(true);
    const uit = koppelAan(t, 0, 'a2');
    expect(uit.lijnen![0]).toMatchObject({
      van: 'a2',
      punten: [
        [30, 25],
        [20, 20],
      ],
    });
    expect(lijnMeldingen(uit).filter((m) => m.soort === 'fout')).toEqual([]);
  });

  it('een bal die in beeld tegen de speler aan ligt, is van hem (marge in schermmaat)', () => {
    const t = leeg([speler('b2', 'B', 2, 36.8, 27.4)]);
    const metBal = voegToe(t, { id: 'bal1', soort: 'bal', x: 37.8, y: 24.2 }, 24 / 4.5);
    expect(metBal.objecten.find((o) => o.id === 'bal1')!.bij).toBe('b2');
    // Zonder schermmaat (oude gedrag, 0,8 m): los.
    expect(voegToe(t, { id: 'bal1', soort: 'bal', x: 37.8, y: 24.2 }).objecten.find((o) => o.id === 'bal1')!.bij).toBeUndefined();
    const los = leeg([...t.objecten, { id: 'bal1', soort: 'bal', x: 37.8, y: 24.2 }]);
    expect(lagBalNeer(los, 'bal1', 24 / 4.5).objecten.find((o) => o.id === 'bal1')!.bij).toBe('b2');
  });
});

describe('0.38.1 situatie van de trainer (schermafbeeldingen)', () => {
  // Posities opgemeten uit de schermafbeelding (half veld). De bal lag los, 3,3 m van blauw 2.
  const situatie = (): Tekening => ({
    veld: { type: 'half' },
    objecten: [
      { id: 'g1', soort: 'goal', x: 34, y: 0 },
      { id: 'k1', soort: 'keeper', nummer: 1, x: 34.9, y: 1.4 },
      speler('a1', 'A', 1, 27.8, 27.4),
      speler('a2', 'A', 2, 41.4, 27.6),
      speler('b1', 'B', 1, 16.5, 35.2),
      speler('b2', 'B', 2, 36.8, 47.4),
      speler('b3', 'B', 3, 52.5, 34.2),
      { id: 'bal1', soort: 'bal', x: 37.8, y: 44.2 },
      pion('p1', 17.4, 31),
      pion('p2', 34.7, 37.4),
      pion('p3', 51.8, 31),
      { id: 'h1', soort: 'hoedje', x: 41.8, y: 24.6 },
    ],
    lijnen: [
      {
        soort: 'bal',
        punten: [
          [36.8, 47.4],
          [41.4, 27.6],
        ],
        van: 'b2',
        naar: 'a2',
        bocht: [52.2, 32.6],
        stap: 1,
      },
      {
        soort: 'loop',
        punten: [
          [36.8, 47.4],
          [12, 17.9],
        ],
        van: 'b2',
        stap: 2,
      },
      {
        soort: 'dribbel',
        punten: [
          [16.5, 35.2],
          [9.3, 14.6],
        ],
        van: 'b1',
        stap: 3,
      },
    ],
  });

  it('lijn 1: blauw 2 heeft de bal niet (hij ligt een stukje van hem af); lijn 3: blauw 1 heeft geen bal', () => {
    const m = lijnMeldingen(situatie()).filter((x) => x.soort === 'fout');
    expect(m.map((x) => x.lijn)).toEqual([0, 2]);
    expect(m[0]!.tekst).toBe('Speler 2 van team B heeft de bal nog niet: de bal ligt een stukje van hem af.');
    expect(m[0]!.oplossingen).toEqual([{ soort: 'geef-bal', wie: 'b2', naam: 'Speler 2 van team B', bal: 'bal1' }]);
    expect(m[1]!.tekst).toBe('Speler 1 van team B heeft de bal nog niet. Maak er een looplijn van?');
    expect(m[1]!.oplossingen![0]).toEqual({ soort: 'wordt-loop' });
    // Geen van de meldingen gaat erover dat een speler zonder lijn iets moet doen.
    expect(m.every((x) => x.lijn >= 0)).toBe(true);
  });

  it('met één tik opgelost: bal bij blauw 2, dribbel wordt een looplijn', () => {
    let t = situatie();
    t = geefBal(t, 'b2', 'bal1');
    expect(t.objecten.find((o) => o.id === 'bal1')).toMatchObject({ bij: 'b2', x: 36.8, y: 47.4 });
    expect(t.objecten.filter((o) => o.soort === 'bal')).toHaveLength(1);
    t = wordtLoop(t, 2);
    expect(lijnMeldingen(t).filter((x) => x.soort === 'fout')).toEqual([]);
  });

  it('spelers zonder lijn geven nooit een melding', () => {
    const t = situatie();
    expect(lijnMeldingen({ ...t, lijnen: [] })).toEqual([]);
    const metBal = geefBal(t, 'b2', 'bal1');
    expect(lijnMeldingen({ ...metBal, lijnen: [metBal.lijnen![0]!] })).toEqual([]);
  });
});

describe('0.38.1 twee acties van één speler in dezelfde stap: na elkaar', () => {
  const basis = () => [speler('a1', 'A', 1, 10, 10), speler('a2', 'A', 2, 25, 10), { id: 'bal1', soort: 'bal', x: 10, y: 10, bij: 'a1' } as VeldObject];
  const acties = (t: Tekening) =>
    lijnenNaarAnimatie(t)
      .tekening.animatie!.filter((s) => 'acties' in s && s.acties.length)
      .map((s) => ('acties' in s ? s.acties.filter((a) => !('spoor' in a && a.spoor === false)).map((a) => `${a.type}:${'wie' in a ? a.wie : 'van' in a ? a.van : ''}`) : []));

  it('eerst passen, dan lopen (pass en ga)', () => {
    const t = leeg(basis(), [
      {
        soort: 'loop',
        punten: [
          [10, 10],
          [18, 20],
        ],
        van: 'a1',
        stap: 1,
      },
      {
        soort: 'bal',
        punten: [
          [10, 10],
          [25, 10],
        ],
        van: 'a1',
        naar: 'a2',
        stap: 1,
      },
    ]);
    expect(lijnMeldingen(t).filter((m) => m.soort === 'fout')).toEqual([]);
    expect(acties(t)).toEqual([['pass:a1'], ['loop:a1']]);
  });

  it('eerst dribbelen, dan passen', () => {
    const t = leeg(basis(), [
      {
        soort: 'bal',
        punten: [
          [16, 14],
          [25, 10],
        ],
        naar: 'a2',
        stap: 1,
      },
      {
        soort: 'dribbel',
        punten: [
          [10, 10],
          [16, 14],
        ],
        van: 'a1',
        stap: 1,
      },
    ]);
    expect(lijnMeldingen(t).filter((m) => m.soort === 'fout')).toEqual([]);
    expect(acties(t)).toEqual([['dribbel:a1'], ['pass:a1']]);
  });

  it('eerst de bal krijgen, dan dribbelen; anderen in dezelfde stap doen gewoon tegelijk mee', () => {
    const t = leeg(
      [...basis(), speler('a3', 'A', 3, 30, 25)],
      [
        {
          soort: 'dribbel',
          punten: [
            [25, 10],
            [30, 5],
          ],
          van: 'a2',
          stap: 1,
        },
        {
          soort: 'bal',
          punten: [
            [10, 10],
            [25, 10],
          ],
          van: 'a1',
          naar: 'a2',
          stap: 1,
        },
        {
          soort: 'loop',
          punten: [
            [30, 25],
            [30, 15],
          ],
          van: 'a3',
          stap: 1,
        },
      ],
    );
    expect(lijnMeldingen(t).filter((m) => m.soort === 'fout')).toEqual([]);
    expect(acties(t)).toEqual([['loop:a3', 'pass:a1'], ['dribbel:a2']]);
  });

  it('twee looplijnen van één speler: na elkaar in tekenvolgorde', () => {
    const t = leeg(basis(), [
      {
        soort: 'loop',
        punten: [
          [25, 10],
          [25, 20],
        ],
        van: 'a2',
        stap: 1,
      },
      {
        soort: 'loop',
        punten: [
          [25, 20],
          [30, 25],
        ],
        stap: 1,
      },
    ]);
    // De tweede begint waar de eerste eindigt: die hoort bij dezelfde speler.
    expect(lijnMeldingen(t).filter((m) => m.soort === 'fout')).toEqual([]);
    expect(acties(t)).toEqual([['loop:a2'], ['loop:a2']]);
  });
});

describe('0.38.1 meldingen: de echte reden, met een oplossing', () => {
  it('dribbel vóór de pass naar hem: "krijgt de bal pas in stap 2", oplossing naar stap 3', () => {
    const t = leeg(
      [speler('a1', 'A', 1, 10, 10), speler('a2', 'A', 2, 25, 10), { id: 'bal1', soort: 'bal', x: 10, y: 10, bij: 'a1' }],
      [
        {
          soort: 'dribbel',
          punten: [
            [25, 10],
            [30, 5],
          ],
          van: 'a2',
          stap: 1,
        },
        {
          soort: 'bal',
          punten: [
            [10, 10],
            [25, 10],
          ],
          van: 'a1',
          naar: 'a2',
          stap: 2,
        },
      ],
    );
    const m = lijnMeldingen(t).filter((x) => x.soort === 'fout');
    expect(m).toEqual([expect.objectContaining({ lijn: 0, tekst: 'Speler 2 krijgt de bal pas in stap 2. Zet deze lijn erna?', oplossingen: [{ soort: 'na-stap', stap: 3 }] })]);
    expect(lijnMeldingen(naarStap(t, 0, 3)).filter((x) => x.soort === 'fout')).toEqual([]);
  });

  it('pass naar hem doet niet mee: de volgende lijn verwijst ernaar', () => {
    const t = leeg(
      [speler('a1', 'A', 1, 10, 10), speler('a2', 'A', 2, 25, 10)],
      [
        {
          soort: 'bal',
          punten: [
            [10, 10],
            [25, 10],
          ],
          van: 'a1',
          naar: 'a2',
          stap: 1,
        },
        {
          soort: 'dribbel',
          punten: [
            [25, 10],
            [30, 5],
          ],
          van: 'a2',
          stap: 2,
        },
      ],
    );
    const m = lijnMeldingen(t).filter((x) => x.soort === 'fout');
    expect(m[0]).toMatchObject({ lijn: 0, oplossingen: [{ soort: 'geef-bal', wie: 'a1' }] });
    expect(m[1]).toMatchObject({ lijn: 1, oplossingen: [{ soort: 'toon', lijn: 0, stap: 1 }] });
    expect(m[1]!.tekst).toContain('doet niet mee');
    // Bal geven aan speler 1 lost beide op.
    expect(lijnMeldingen(geefBal(t, 'a1')).filter((x) => x.soort === 'fout')).toEqual([]);
  });

  it('lijnBegin zonder balbezitter-regel (slepen van een handvat)', () => {
    const t = leeg([speler('a1', 'A', 1, 10, 10), { id: 'bal1', soort: 'bal', x: 10, y: 10, bij: 'a1' }]);
    expect(lijnBegin('bal', [20, 20], IN, standVoorStap(t, 1), false).wie).toBeUndefined();
  });
});
