import { describe, expect, it } from 'vitest';
import {
  botsingen,
  clubPlan,
  dupliceer,
  heeftDagen,
  isLeeg,
  leesTeamClub,
  mijnRondes,
  naarCode,
  nieuweClub,
  nieuwOnderdeel,
  opDag,
  samenPloeg,
  standaardDag,
  stationPloeg,
  trainerModus,
  uitCode,
  voorTeam,
  zetDagTrainers,
  zetModusOveral,
  verplaatsTrainer,
  zonderIndelingOveral,
  type ClubTraining,
  type Onderdeel,
} from '../src/clubtraining/clubtraining';
import {
  aanwezig,
  groepenOp,
  leesTeamRooster,
  maandagVan,
  netteRooster,
  nieuweRoosterTrainer,
  roosterGroepen,
  roosterVoor,
  voegRoosterSamen,
  volgendeWeek,
  voorTeamRooster,
  vulVolgensRooster,
  weekdag,
  weekNummer,
  type RoosterTrainer,
} from '../src/clubtraining/rooster';

/** Versie 0.34.0: trainers per dag en een trainersrooster. */

const delen = (cats: string[]): Onderdeel[] => cats.map((k, i) => nieuwOnderdeel(k, 15, `o${i + 1}`));
const MA = '2026-11-16';
const WO = '2026-11-18';
const club = (w: Partial<ClubTraining> = {}): ClubTraining => ({ ...nieuweClub('mini-5-7', 1, 'c1'), datums: [MA, WO], groepjes: 4, kinderen: 20, onderdelen: delen(['techniek', 'loopcoordinatie', 'afwerken', 'een-tegen-een']), ...w });
const trainer = (w: Partial<RoosterTrainer>): RoosterTrainer => ({ ...nieuweRoosterTrainer(MA, 1, w.id ?? w.naam ?? 'x'), ...w });

describe('datums en weken', () => {
  it('weekdag, maandag en weeknummer, ook rond de jaarwisseling', () => {
    expect(weekdag('2026-11-16')).toBe(1);
    expect(weekdag('2026-11-18')).toBe(3);
    expect(weekdag('2026-11-22')).toBe(7);
    expect(maandagVan('2026-11-22')).toBe('2026-11-16');
    expect(weekNummer('2026-11-16')).toBe(47);
    expect(weekNummer('2026-12-31')).toBe(53);
    expect(weekNummer('2027-01-04')).toBe(1);
    expect(maandagVan('2027-01-01')).toBe('2026-12-28');
  });
});

describe('trainers per dag', () => {
  const c = club({ trainers: ['Testtrainer 1', 'Testtrainer 2'] });

  it('bestaande trainingen: de trainers gelden voor alle dagen', () => {
    expect(heeftDagen(c)).toBe(true);
    expect(opDag(c, 0).trainers).toEqual(c.trainers);
    expect(opDag(c, 1).trainers).toEqual(c.trainers);
  });

  it('twee dagen met andere trainers: elke dag zijn eigen verdeling, onderdelen en rotatie gelijk', () => {
    const d = { ...c, ...zetDagTrainers(c, 1, { trainers: ['Testtrainer 3', 'Testtrainer 4', 'Testtrainer 5', 'Testtrainer 6'] }) };
    expect(opDag(d, 0).trainers).toEqual(['Testtrainer 1', 'Testtrainer 2']);
    expect(opDag(d, 1).trainers).toHaveLength(4);
    expect(stationPloeg(opDag(d, 0), 1)).toEqual(['Testtrainer 1']);
    expect(stationPloeg(opDag(d, 1), 1)).toEqual(['Testtrainer 3']);
    expect(stationPloeg(opDag(d, 1), 4)).toEqual(['Testtrainer 6']);
    expect(clubPlan(opDag(d, 0)).rondes.map((r) => r.begin)).toEqual(clubPlan(opDag(d, 1)).rondes.map((r) => r.begin));
    expect(mijnRondes(opDag(d, 0), 'Testtrainer 3').every((r) => !r.plek)).toBe(true);
    expect(mijnRondes(opDag(d, 1), 'Testtrainer 3').every((r) => r.plek)).toBe(true);
  });

  it('indeling per dag: aanpassen op woensdag laat maandag staan', () => {
    const d = { ...c, ...zetDagTrainers(c, 1, { trainers: ['Testtrainer 3', 'Testtrainer 4'] }) };
    const w = opDag(d, 1);
    const e = { ...d, ...zetDagTrainers(d, 1, { trainerKeuzes: verplaatsTrainer(w, 'Testtrainer 4', 's:2', 's:1') }) };
    expect(stationPloeg(opDag(e, 1), 1)).toEqual(['Testtrainer 3', 'Testtrainer 4']);
    expect(stationPloeg(opDag(e, 0), 1)).toEqual(['Testtrainer 1']);
    expect(botsingen(opDag(e, 1))).toEqual([]);
  });

  it('met één datum blijft het zoals het was', () => {
    const een = club({ datums: [MA], trainers: ['Testtrainer 1'] });
    expect(heeftDagen(een)).toBe(false);
    expect(zetDagTrainers(een, 0, { trainers: ['Testtrainer 2'] })).toEqual({ trainers: ['Testtrainer 2'] });
  });

  it('blijven of meelopen en terug naar automatisch: voor alle dagen', () => {
    const d = { ...c, ...zetDagTrainers(c, 1, { trainers: ['Testtrainer 3'] }) };
    const m = { ...d, ...zetModusOveral(d, 'groepje') };
    expect(trainerModus(opDag(m, 0))).toBe('groepje');
    expect(trainerModus(opDag(m, 1))).toBe('groepje');
    const z = { ...m, ...zonderIndelingOveral({ ...m, perDag: m.perDag!.map((x) => ({ ...x, trainerKeuzes: { ...x.trainerKeuzes, stations: { 1: ['x'] } } })) }) };
    expect(z.perDag!.every((x) => !x.trainerKeuzes?.stations && x.trainerKeuzes?.modus === 'groepje')).toBe(true);
  });

  it('dag kiezen: vandaag of de eerstvolgende datum', () => {
    expect(standaardDag([MA, WO], '2026-11-12')).toBe(0);
    expect(standaardDag([MA, WO], '2026-11-17')).toBe(1);
    expect(standaardDag([MA, WO], WO)).toBe(1);
    expect(standaardDag([MA, WO], '2026-12-01')).toBe(0);
  });

  it('trainerslink en team: elke dag houdt zijn trainers en indeling', () => {
    const o = [...delen(['techniek', 'afwerken', 'een-tegen-een']), { ...nieuwOnderdeel('warming-up', 10, 'w'), soort: 'samen' as const }];
    const d0 = club({ onderdelen: o, trainers: ['Testtrainer 1'] });
    const d = { ...d0, ...zetDagTrainers(d0, 1, { trainers: ['Testtrainer 7', 'Testtrainer 8'], trainerKeuzes: { samen: { w: ['Testtrainer 8'] } } }), groep: 'O6' };
    for (const g of [uitCode(naarCode(d))!, leesTeamClub(voorTeam(d))!]) {
      expect(opDag(g, 0).trainers).toEqual(['Testtrainer 1']);
      expect(opDag(g, 1).trainers).toEqual(['Testtrainer 7', 'Testtrainer 8']);
      expect(samenPloeg(opDag(g, 1), { id: g.onderdelen!.at(-1)!.id })).toEqual(['Testtrainer 8']);
      expect(g.groep).toBe('O6');
    }
  });

  it('dupliceren neemt de dagen mee, en een training met alleen trainers per dag is niet leeg', () => {
    const d = { ...c, ...zetDagTrainers(c, 1, { trainers: ['Testtrainer 3'] }) };
    expect(dupliceer(d, 2, 'd').perDag).toEqual(d.perDag);
    expect(isLeeg({ ...nieuweClub(), perDag: [{ trainers: ['Testtrainer 1'] }] })).toBe(false);
  });
});

describe('trainersrooster', () => {
  // De loopcoördinatietrainer: elke woensdag, om de week bij O7 en O6, beginnend bij O7 in week 47.
  const lc = trainer({ id: 'lc', naam: 'Testtrainer LC', dagen: [3], ritme: 'elke', beginWeek: MA, groepen: ['O7', 'O6'], wissel: true, plek: 'loopcoordinatie' });
  const ma = trainer({ id: 'ma', naam: 'Testtrainer Ma', dagen: [1], groepen: ['O6'] });
  const beide = trainer({ id: 'b', naam: 'Testtrainer Beide', dagen: [1, 3], groepen: ['O6'] });
  const omDeWeek = trainer({ id: 'om', naam: 'Testtrainer Om', dagen: [3], ritme: 'om', beginWeek: '2026-11-23', groepen: ['O6'] });
  const rooster = [lc, ma, beide, omDeWeek];

  it('om de week wisselend tussen O7 en O6, over meerdere weken en over de jaarwisseling', () => {
    const woensdagen = ['2026-11-18', '2026-11-25', '2026-12-02', '2026-12-30', '2027-01-06', '2027-01-13'];
    // 30 december is 6 weken na week 47 (O7), 6 januari 7 weken: het wisselen loopt gewoon door over de jaarwisseling.
    expect(woensdagen.map((d) => groepenOp(lc, d)[0])).toEqual(['O7', 'O6', 'O7', 'O7', 'O6', 'O7']);
    expect(groepenOp(lc, '2026-11-16')).toEqual([]);
    // Ook vóór de beginweek klopt het ritme.
    expect(groepenOp(lc, '2026-11-11')).toEqual(['O6']);
  });

  it('om de week aanwezig, met een beginweek', () => {
    expect(['2026-11-18', '2026-11-25', '2026-12-02', '2026-12-30', '2027-01-06'].map((d) => aanwezig(omDeWeek, d))).toEqual([false, true, false, false, true]);
  });

  it('per dag de goede trainers voor de groep', () => {
    expect(roosterVoor(rooster, 'O6', MA).map((x) => x.naam)).toEqual(['Testtrainer Ma', 'Testtrainer Beide']);
    expect(roosterVoor(rooster, 'O6', WO).map((x) => x.naam)).toEqual(['Testtrainer Beide']);
    expect(roosterVoor(rooster, 'O7', WO)).toEqual([{ naam: 'Testtrainer LC', plek: 'loopcoordinatie' }]);
    expect(roosterVoor(rooster, 'O6', '2026-11-25').map((x) => x.naam)).toEqual(['Testtrainer LC', 'Testtrainer Beide', 'Testtrainer Om']);
    expect(roosterGroepen(rooster, 'O8')).toEqual(['O6', 'O7', 'O8']);
  });

  it('vaste plek: altijd bij Loopcoördinatie als die er die dag is, ook als Samen-onderdeel; anders gewoon verdeeld', () => {
    const o6 = vulVolgensRooster(club({ groep: 'O6', datums: ['2026-11-23', '2026-11-25'], trainers: [] }), rooster, true);
    const wo = opDag(o6, 1);
    expect(wo.trainers).toContain('Testtrainer LC');
    const lcStation = clubPlan(wo).stations.find((s) => s.vorm === 'loopcoordinatie')!;
    expect(stationPloeg(wo, lcStation.nr)).toContain('Testtrainer LC');
    // Ook bij meer trainers dan stations blijft hij daar, en de rest wordt eerlijk verdeeld.
    const veel = { ...o6, ...zetDagTrainers(o6, 1, { trainers: ['Testtrainer 1', 'Testtrainer 2', 'Testtrainer 3', 'Testtrainer LC', 'Testtrainer 4'] }) };
    const v = { ...opDag(veel, 1), vast: { 'Testtrainer LC': 'loopcoordinatie' } };
    expect(stationPloeg(v, lcStation.nr)).toContain('Testtrainer LC');
    expect(clubPlan(v).stations.map((s) => stationPloeg(v, s.nr).length).sort()).toEqual([1, 1, 1, 2]);
    // Loopcoördinatie als Samen-onderdeel aan het begin: daar staat hij (samen met de rest).
    const samenLc = club({ groep: 'O6', datums: ['2026-11-25'], onderdelen: [{ ...nieuwOnderdeel('loopcoordinatie', 10, 'lc'), soort: 'samen' }, ...delen(['techniek', 'afwerken', 'een-tegen-een'])] });
    const s = opDag(vulVolgensRooster(samenLc, rooster, true), 0);
    expect(samenPloeg(s, { id: 'lc' })).toContain('Testtrainer LC');
    // Geen Loopcoördinatie die dag: gewoon verdeeld.
    const zonder = opDag(vulVolgensRooster(club({ groep: 'O6', datums: ['2026-11-25'], onderdelen: delen(['techniek', 'afwerken', 'een-tegen-een']) }), rooster, true), 0);
    expect(clubPlan(zonder).stations.flatMap((x) => stationPloeg(zonder, x.nr))).toContain('Testtrainer LC');
  });

  it('nieuwe week: weer volgens het rooster; een aanpassing met de hand gold maar voor die ene week, het rooster blijft gelijk', () => {
    const wk47 = vulVolgensRooster(club({ groep: 'O6', datums: [MA, WO] }), rooster, true);
    expect(wk47.perDag!.map((d) => d.trainers)).toEqual([['Testtrainer Ma', 'Testtrainer Beide'], ['Testtrainer Beide']]);
    const hand = { ...wk47, ...zetDagTrainers(wk47, 1, { trainers: ['Testtrainer Beide', 'Testtrainer Invaller'] }) };
    expect(hand.perDag![1]!.rooster).toBeUndefined();
    expect(hand.perDag![0]!.rooster).toBe(true);
    const voor = JSON.stringify(rooster);
    const wk48 = volgendeWeek(hand, rooster, 2, 'w48');
    expect(wk48.datums).toEqual(['2026-11-23', '2026-11-25']);
    expect(wk48.perDag![1]!.trainers).toEqual(['Testtrainer LC', 'Testtrainer Beide', 'Testtrainer Om']);
    expect(wk48.perDag![1]!.vast).toEqual({ 'Testtrainer LC': 'loopcoordinatie' });
    expect(JSON.stringify(rooster)).toBe(voor);
  });

  it('een dag die je met de hand aanpaste blijft staan als je alleen de datum verandert', () => {
    const wk47 = vulVolgensRooster(club({ groep: 'O6', datums: [MA, WO] }), rooster, true);
    const hand = { ...wk47, ...zetDagTrainers(wk47, 1, { trainers: ['Testtrainer Invaller'] }) };
    const ander = vulVolgensRooster({ ...hand, datums: ['2026-11-23', '2026-11-25'] }, rooster);
    expect(ander.perDag![0]!.trainers).toEqual(['Testtrainer Ma', 'Testtrainer Beide']);
    expect(ander.perDag![1]!.trainers).toEqual(['Testtrainer Invaller']);
  });

  it('zonder groep of zonder rooster voor die groep: niets', () => {
    const c = club({ trainers: ['Testtrainer 1'] });
    expect(vulVolgensRooster(c, rooster, true)).toBe(c);
    expect(vulVolgensRooster({ ...c, groep: 'O9' }, rooster, true).perDag).toBeUndefined();
    expect(volgendeWeek(c, rooster, 2, 'x').trainers).toEqual(['Testtrainer 1']);
  });

  it('meelopen blijft staan als het rooster de trainers invult', () => {
    const c = vulVolgensRooster(club({ groep: 'O6', trainerKeuzes: { modus: 'groepje' } }), rooster, true);
    expect(trainerModus(opDag(c, 0))).toBe('groepje');
  });

  it('delen met team en overnemen: zelfde trainer wordt bijgewerkt, nieuwe komen erbij, kapotte invoer valt weg', () => {
    const terug = leesTeamRooster(voorTeamRooster(rooster))!;
    expect(terug).toHaveLength(4);
    expect(terug[0]).toMatchObject({ naam: 'Testtrainer LC', groepen: ['O7', 'O6'], wissel: true, plek: 'loopcoordinatie' });
    const samen = voegRoosterSamen([{ ...ma, naam: 'Oud' }], terug, 5);
    expect(samen).toHaveLength(4);
    expect(samen.find((t) => t.id === 'ma')!.naam).toBe('Testtrainer Ma');
    expect(netteRooster([{ id: 'x', naam: 'Testtrainer X', dagen: [0, 3, 9, 3], ritme: 'raar', beginWeek: '2026-11-18', groepen: ['O6', '', 5], plek: 'iets' }, 'kapot', { naam: 'zonder id' }])).toEqual([
      { id: 'x', naam: 'Testtrainer X', dagen: [3], ritme: 'elke', beginWeek: '2026-11-16', groepen: ['O6'], wissel: false, gewijzigd: expect.any(Number) },
    ]);
    expect(leesTeamRooster('kapot')).toBeNull();
  });
});
