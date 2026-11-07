import { describe, expect, it } from 'vitest';
import {
  botsingen,
  buurPlekken,
  clubPlan,
  dupliceer,
  groepPloeg,
  leesTeamClub,
  metHandIngedeeld,
  mijnRondes,
  naarCode,
  naarVolgendeWeek,
  nieuweClub,
  nieuwOnderdeel,
  nietIngedeeld,
  onderdelenVan,
  plekTrainers,
  rondePlekken,
  samenPloeg,
  stationPloeg,
  trainerModus,
  uitCode,
  uitGedeeldeClub,
  veldPloeg,
  verplaatsTrainer,
  voorTeam,
  zetPlekTrainers,
  zonderIndeling,
  zonderTrainer,
  type ClubTraining,
  type Onderdeel,
} from '../src/clubtraining/clubtraining';
import { naarBase64Url } from '../src/training/training';

/** Versie 0.33.1: meer trainers per station, automatisch verdelen, meelopen met een groepje, Ik ben… */

const namen = (n: number) => Array.from({ length: n }, (_, i) => `Testtrainer ${i + 1}`);
const delen = (n: number, soort: Onderdeel['soort'] = 'stations'): Onderdeel[] => ['techniek', 'afwerken', 'loopcoordinatie', 'pass-en-trap', 'een-tegen-een', 'positiespel'].slice(0, n).map((k, i) => ({ ...nieuwOnderdeel(k, 15, `o${i + 1}`), soort }));
const metPartij = (n: number) => [...delen(n), nieuwOnderdeel('partijvormen', 15, 'p')];
const club = (w: Partial<ClubTraining> = {}): ClubTraining => ({ ...nieuweClub('jo8-11', 1, 'c1'), onderdelen: delen(4), groepjes: 4, kinderen: 16, ...w });
const groottes = (c: ClubTraining) => clubPlan(c).stations.map((s) => stationPloeg(c, s.nr).length);

describe('automatisch verdelen', () => {
  it('10 trainers over 4 stations: 3, 3, 2 en 2, en iedereen staat ergens', () => {
    const c = club({ trainers: namen(10) });
    expect(groottes(c)).toEqual([3, 3, 2, 2]);
    expect(clubPlan(c).stations.flatMap((s) => stationPloeg(c, s.nr)).sort()).toEqual(namen(10).sort());
    expect(botsingen(c)).toEqual([]);
    expect(nietIngedeeld(c)).toEqual([]);
  });

  it('3 trainers over 6 stations: elke trainer één plek, eerst elk onderdeel één keer, de rest zonder trainer', () => {
    const c = club({ onderdelen: delen(3), groepjes: 6, kinderen: 24, trainers: namen(3) });
    const plan = clubPlan(c);
    expect(plan.stations).toHaveLength(6);
    expect(groottes(c).sort()).toEqual([0, 0, 0, 1, 1, 1]);
    const metTrainer = plan.stations.filter((s) => stationPloeg(c, s.nr).length);
    expect(new Set(metTrainer.map((s) => s.onderdeel)).size).toBe(3);
    expect(botsingen(c)).toEqual([]);
    expect(zonderTrainer(c)).toHaveLength(3);
  });

  it('2 groepjes met 5 trainers en 4 onderdelen: per fase iedereen verdeeld, dus 3 en 2', () => {
    const c = club({ groepjes: 2, kinderen: 10, trainers: namen(5) });
    const plan = clubPlan(c);
    expect(plan.fases.length).toBe(2);
    for (const f of plan.fases) expect(f.stations.map((s) => stationPloeg(c, s.nr).length)).toEqual([3, 2]);
    expect(botsingen(c)).toEqual([]);
  });

  it('partijvelden: alle trainers over de velden; Samen-onderdeel zonder velden: iedereen', () => {
    const c = club({ onderdelen: [...metPartij(3), { ...nieuwOnderdeel('warming-up', 10, 'w'), soort: 'samen' }], groepjes: 6, kinderen: 24, trainers: namen(10) });
    expect([1, 2, 3].map((nr) => veldPloeg(c, nr).length)).toEqual([4, 3, 3]);
    expect([1, 2, 3].flatMap((nr) => veldPloeg(c, nr)).sort()).toEqual(namen(10).sort());
    expect(samenPloeg(c, { id: 'w' })).toEqual(namen(10));
    expect(botsingen(c)).toEqual([]);
  });

  it('dubbele en lege namen tellen niet', () => {
    const c = club({ trainers: ['Testtrainer 1', ' Testtrainer 1 ', '', 'Testtrainer 2'] });
    expect(groottes(c)).toEqual([1, 1, 0, 0]);
  });

  it('nooit een trainer op twee plekken tegelijk, bij alle aantallen', () => {
    for (let groepjes = 2; groepjes <= 8; groepjes += 1) {
      for (let onderdelen = 3; onderdelen <= 6; onderdelen += 1) {
        for (const aantal of [1, 3, 5, 10, 17]) {
          for (const modus of [undefined, 'groepje'] as const) {
            const c = club({ groepjes, kinderen: groepjes * 4, onderdelen: metPartij(onderdelen - 1), trainers: namen(aantal), ...(modus ? { trainerKeuzes: { modus } } : {}) });
            expect(botsingen(c), `${groepjes}/${onderdelen}/${aantal}/${modus}`).toEqual([]);
          }
        }
      }
    }
  });
});

describe('blijven staan of meelopen', () => {
  it('blijven: een trainer staat elke ronde op hetzelfde station', () => {
    const c = club({ trainers: namen(10) });
    const eerste = mijnRondes(c, 'Testtrainer 1').map((r) => r.plek?.sleutel);
    expect(new Set(eerste).size).toBe(1);
    expect(trainerModus(c)).toBe('station');
  });

  it('meelopen: elke trainer hoort bij een groepje en draait mee, en staat elke ronde bij dat groepje', () => {
    const c = club({ trainers: namen(10), trainerKeuzes: { modus: 'groepje' } });
    expect([0, 1, 2, 3].map((g) => groepPloeg(c, g).length)).toEqual([3, 3, 2, 2]);
    const rondes = mijnRondes(c, 'Testtrainer 1');
    expect(new Set(rondes.map((r) => r.plek?.sleutel)).size).toBe(4);
    for (const r of rondes) expect(r.plek!.groepen).toEqual([0]);
    // Een station heeft dan geen vaste trainers.
    expect(stationPloeg(c, 1)).toEqual([]);
  });

  it('meelopen op een partijveld: de trainers van allebei de groepjes', () => {
    const c = club({ onderdelen: metPartij(3), groepjes: 4, kinderen: 16, trainers: namen(4), trainerKeuzes: { modus: 'groepje' } });
    expect(veldPloeg(c, 1)).toEqual(['Testtrainer 1', 'Testtrainer 2']);
    expect(veldPloeg(c, 2)).toEqual(['Testtrainer 3', 'Testtrainer 4']);
  });

  it('meer oefeningen in een blok: de trainers blijven bij alle oefeningen van dat blok', () => {
    const o = delen(4);
    o[0] = { ...o[0]!, oefening: 'a', oefeningen: [{ oefening: 'a' }, { oefening: 'b' }, { oefening: 'c' }] };
    const c = club({ onderdelen: o, trainers: namen(10) });
    const met = club({ onderdelen: delen(4), trainers: namen(10) });
    expect(groottes(c)).toEqual(groottes(met));
    const p = rondePlekken(c, clubPlan(c).rondes[0]!).find((x) => x.sleutel === 's:1')!;
    expect(p.onderdeel!.oefeningen).toHaveLength(3);
    expect(p.trainers).toHaveLength(3);
  });
});

describe('met de hand aanpassen', () => {
  const c = club({ trainers: namen(10) });

  it('meer trainers aanvinken: de rest verschuift niet', () => {
    const vorig = clubPlan(c).stations.map((s) => stationPloeg(c, s.nr));
    const k = zetPlekTrainers(c, 's:1', [...plekTrainers(c, 's:1'), 'Testtrainer 2']);
    const d = { ...c, trainerKeuzes: k };
    expect(stationPloeg(d, 2)).toEqual(vorig[1]);
    expect(stationPloeg(d, 1)).toContain('Testtrainer 2');
    expect(metHandIngedeeld(d)).toBe(true);
  });

  it('dezelfde trainer op twee stations geeft een botsing, per ronde', () => {
    const d = { ...c, trainerKeuzes: zetPlekTrainers(c, 's:1', [...plekTrainers(c, 's:1'), 'Testtrainer 2']) };
    const b = botsingen(d);
    expect(b).toHaveLength(1);
    expect(b[0]!.naam).toBe('Testtrainer 2');
    expect(b[0]!.plekken).toHaveLength(2);
    expect(b[0]!.rondes).toEqual([1, 2, 3, 4]);
  });

  it('verplaatsen: van het ene naar het andere station, zonder botsing', () => {
    const d = { ...c, trainerKeuzes: verplaatsTrainer(c, 'Testtrainer 2', 's:2', 's:1') };
    expect(stationPloeg(d, 1)).toContain('Testtrainer 2');
    expect(stationPloeg(d, 2)).not.toContain('Testtrainer 2');
    expect(botsingen(d)).toEqual([]);
  });

  it('op stations in verschillende fases mag dezelfde trainer staan: dat zijn andere rondes', () => {
    const d = club({ groepjes: 2, kinderen: 10, trainers: namen(2) });
    expect(stationPloeg(d, 1)).toEqual(['Testtrainer 1']);
    expect(stationPloeg(d, 3)).toEqual(['Testtrainer 1']);
    expect(botsingen(d)).toEqual([]);
    expect(buurPlekken(d, 's:1').map((p) => p.sleutel)).toEqual(['s:2']);
  });

  it('een station dat in een ronde leeg staat botst niet in die ronde', () => {
    const d = club({ onderdelen: delen(3), groepjes: 2, kinderen: 10, trainers: namen(3) });
    expect(clubPlan(d).fases).toHaveLength(1);
    const e = { ...d, trainerKeuzes: { stations: { 1: ['Testtrainer 1'], 2: ['Testtrainer 2'], 3: ['Testtrainer 1'] } } };
    const b = botsingen(e);
    expect(b[0]!.rondes.length).toBeLessThan(clubPlan(e).rondes.length);
    expect(mijnRondes(d, 'Testtrainer 3').some((r) => r.leeg)).toBe(true);
  });

  it('een nieuwe trainer na het vastzetten krijgt een melding, Automatisch verdelen lost het op', () => {
    const d = { ...c, trainerKeuzes: zetPlekTrainers(c, 's:1', plekTrainers(c, 's:1')) };
    const e = { ...d, trainers: [...d.trainers, 'Testtrainer 11'] };
    expect(nietIngedeeld(e)).toEqual(['Testtrainer 11']);
    const f = { ...e, trainerKeuzes: zonderIndeling(e.trainerKeuzes) };
    expect(nietIngedeeld(f)).toEqual([]);
    expect(metHandIngedeeld(f)).toBe(false);
  });

  it('Automatisch verdelen houdt de keuze meelopen vast', () => {
    expect(zonderIndeling({ modus: 'groepje', groepen: { 0: ['x'] } })).toEqual({ modus: 'groepje' });
  });

  it('een weggehaalde naam verdwijnt uit de indeling', () => {
    const d = { ...c, trainerKeuzes: { stations: { 1: ['Testtrainer 1', 'Weg'] } } };
    expect(stationPloeg(d, 1)).toEqual(['Testtrainer 1']);
  });

  it('meelopen met de hand: een trainer in twee groepjes botst', () => {
    const d = club({ trainers: namen(4), trainerKeuzes: { modus: 'groepje', groepen: { 0: ['Testtrainer 1'], 1: ['Testtrainer 1'] } } });
    expect(botsingen(d)[0]!.naam).toBe('Testtrainer 1');
  });

  it('Samen-onderdeel: je kunt er ook een deel van de trainers zetten', () => {
    const d = club({ onderdelen: [...delen(3), { ...nieuwOnderdeel('warming-up', 10, 'w'), soort: 'samen' }], trainers: namen(4) });
    const e = { ...d, trainerKeuzes: zetPlekTrainers(d, 'o:w', ['Testtrainer 1']) };
    expect(samenPloeg(e, { id: 'w' })).toEqual(['Testtrainer 1']);
    expect(stationPloeg(e, 1)).toEqual(stationPloeg(d, 1));
  });
});

describe('bestaande trainingen', () => {
  it('één trainer per station van vóór 0.33.1 blijft staan; de rest gaat over de andere stations', () => {
    const c = club({ trainers: namen(6), stationTrainers: { 1: 'Testtrainer 5', 2: 'Testtrainer 6' }, veldTrainers: {} });
    expect(stationPloeg(c, 1)).toEqual(['Testtrainer 5']);
    expect(stationPloeg(c, 2)).toEqual(['Testtrainer 6']);
    expect([3, 4].flatMap((nr) => stationPloeg(c, nr)).sort()).toEqual(namen(4));
    expect(botsingen(c)).toEqual([]);
  });

  it('een oude training zonder onderdelen heeft de Mini Talents-opzet en werkt', () => {
    const c = { ...nieuweClub('mini-5-7', 1, 'oud'), trainers: namen(2), stationTrainers: { 1: 'Testtrainer 2' }, veldTrainers: { 1: '' } };
    expect(stationPloeg(c, 1)).toEqual(['Testtrainer 2']);
    expect(veldPloeg(c, 1)).toEqual([]);
    expect(onderdelenVan(c)).toHaveLength(4);
  });

  it('een oude link met stationTrainers blijft leesbaar', () => {
    const code = naarBase64Url(JSON.stringify({ v: 2, n: 'Oud', d: [], l: 'jo8-11', k: 12, g: 3, t: ['Testtrainer 1', 'Testtrainer 2'], s: { 1: 'Testtrainer 2' }, f: {}, o: [['techniek', 15, 0, ''], ['afwerken', 15, 0, ''], ['partijvormen', 15, 1, '']] }));
    const g = uitCode(code)!;
    expect(stationPloeg(g, 1)).toEqual(['Testtrainer 2']);
  });

  it('dupliceren en Naar volgende week nemen de indeling mee', () => {
    const c = club({ trainers: namen(5), trainerKeuzes: { modus: 'groepje', groepen: { 0: ['Testtrainer 3'] } } });
    expect(dupliceer(c, 2, 'd').trainerKeuzes).toEqual(c.trainerKeuzes);
    expect(naarVolgendeWeek(c, 2, 'v').trainerKeuzes).toEqual(c.trainerKeuzes);
  });
});

describe('delen', () => {
  const o = [...delen(3), { ...nieuwOnderdeel('warming-up', 10, 'eigen-id'), soort: 'samen' as const }];
  const c = club({ onderdelen: o, groepjes: 3, trainers: namen(10), trainerKeuzes: { stations: { 1: ['Testtrainer 1', 'Testtrainer 2'], 2: ['Testtrainer 3'], 3: [] }, samen: { 'eigen-id': ['Testtrainer 4'] } } });

  it('de trainerslink houdt de indeling, ook van een Samen-onderdeel', () => {
    const g = uitCode(naarCode(c))!;
    expect(stationPloeg(g, 1)).toEqual(['Testtrainer 1', 'Testtrainer 2']);
    expect(samenPloeg(g, { id: onderdelenVan(g)[3]!.id })).toEqual(['Testtrainer 4']);
  });

  it('automatisch verdeeld: de link geeft dezelfde verdeling', () => {
    const d = club({ trainers: namen(10) });
    const g = uitCode(naarCode(d))!;
    expect(clubPlan(g).stations.map((s) => stationPloeg(g, s.nr))).toEqual(clubPlan(d).stations.map((s) => stationPloeg(d, s.nr)));
  });

  it('meelopen gaat mee in de link en in het team', () => {
    const d = club({ trainers: namen(4), trainerKeuzes: { modus: 'groepje' } });
    expect(trainerModus(uitCode(naarCode(d))!)).toBe('groepje');
    expect(trainerModus(leesTeamClub(voorTeam(d))!)).toBe('groepje');
  });

  it('delen met team en kopiëren houden de indeling', () => {
    const g = leesTeamClub(voorTeam(c))!;
    expect(stationPloeg(g, 1)).toEqual(['Testtrainer 1', 'Testtrainer 2']);
    expect(stationPloeg(uitGedeeldeClub(g, new Map(), 2, 'k'), 1)).toEqual(['Testtrainer 1', 'Testtrainer 2']);
  });

  it('meer dan 12 trainers passen in de link, kapotte invoer valt weg', () => {
    const d = club({ trainers: namen(20) });
    expect(uitCode(naarCode(d))!.trainers).toHaveLength(20);
    const code = naarBase64Url(JSON.stringify({ v: 2, n: 'x', d: [], l: 'jo8-11', k: 12, g: 3, t: ['Testtrainer 1'], s: {}, f: {}, p: { modus: 'iets', stations: { 1: 'geen lijst', 2: [3, 'Testtrainer 1'] }, velden: 7 }, o: [['techniek', 15, 0, ''], ['afwerken', 15, 0, ''], ['partijvormen', 15, 1, '']] }));
    expect(uitCode(code)!.trainerKeuzes).toEqual({ stations: { 2: ['Testtrainer 1'] } });
  });
});

describe('Ik ben…', () => {
  it('toont per ronde de plek, ook als je station leeg staat of je nergens staat', () => {
    const c = club({ onderdelen: metPartij(3), groepjes: 3, kinderen: 12, trainers: namen(4) });
    const m = mijnRondes(c, 'Testtrainer 1');
    expect(m).toHaveLength(clubPlan(c).rondes.length);
    expect(m.every((r) => r.plek)).toBe(true);
    expect(m.at(-1)!.plek!.veld).toBeTruthy();
    expect(mijnRondes(c, 'Niemand').every((r) => !r.plek && !r.leeg)).toBe(true);
  });
});
