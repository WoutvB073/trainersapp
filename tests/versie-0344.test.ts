import { describe, expect, it } from 'vitest';
import {
  clubPlan,
  dupliceer,
  eigenOpzet,
  leeftijdMelding,
  leesTeamClub,
  maakEigenOpzet,
  materiaal,
  materiaalAvond,
  MAX_SESSIES,
  mijnRondes,
  naarCode,
  nieuweClub,
  nieuwOnderdeel,
  onderdelenVan,
  opDag,
  sessieSleutel,
  sessiesOpDatum,
  sessieTekst,
  sessieTijd,
  trainerIndeling,
  trainerNamen,
  uitCode,
  verwijderSessie,
  voegSessieToe,
  voorTeam,
  zetDagTrainers,
  zetSessie,
  type ClubTraining,
  type Onderdeel,
} from '../src/clubtraining/clubtraining';
import { roosterVoor, volgendeWeek, vulVolgensRooster, type RoosterTrainer } from '../src/clubtraining/rooster';
import type { Oefening } from '../src/model/types';

/** Versie 0.34.4: van dagen naar sessies (datum + begintijd, eigen aantallen, leeftijd, groep, trainers en opzet). */

const MA = '2026-11-23';
const o = (id: string, categorie: string, extra: Partial<Onderdeel> = {}): Onderdeel => ({ ...nieuwOnderdeel(categorie, 15, id), ...extra });
const OEF: Record<string, Oefening> = {
  hoog: { id: 'hoog', naam: 'Hooghouden', benodigdheden: ['1 voetbal per kind'], leeftijden: ['mini-5-7', 'jo8-11'] } as unknown as Oefening,
  duel: { id: 'duel', naam: 'Poortjesduel', benodigdheden: ['4 hoedjes'], leeftijden: ['mini-3-5', 'mini-5-7'] } as unknown as Oefening,
  schiet: { id: 'schiet', naam: 'Schieten', benodigdheden: ['1 mini-goaltje'] } as unknown as Oefening,
};
const vind = (id: string) => OEF[id];

/** Ma 18:00 met 2 groepjes en Ma 19:00 met 4 groepjes, verder dezelfde opzet. */
function avond(): ClubTraining {
  const c: ClubTraining = {
    ...nieuweClub('mini-5-7', 1, 'c1'),
    datums: [MA],
    starttijd: '18:00',
    kinderen: 10,
    groepjes: 2,
    onderdelen: [o('tech', 'techniek', { oefening: 'hoog' }), o('een', 'een-tegen-een', { oefening: 'duel' }), o('afw', 'afwerken', { oefening: 'schiet' })],
  };
  const met = { ...c, ...voegSessieToe(c) };
  return { ...met, ...zetSessie(met, 1, { groepjes: 4, kinderen: 20 }) };
}

/** Elk groepje doet elk onderdeel één keer, nooit twee groepjes op één station. */
function rotatieKlopt(c: ClubTraining) {
  const plan = clubPlan(c);
  for (let g = 0; g < c.groepjes; g += 1) expect(plan.rondes.map((r) => r.plekken[g]!.onderdeel).sort(), `groepje ${g}`).toEqual(onderdelenVan(c).map((x) => x.id).sort());
  for (const r of plan.rondes) expect(new Set(r.plekken.map((s) => s.nr)).size).toBe(r.plekken.length);
  return plan;
}

describe('sessies', () => {
  it('een sessie erbij: zelfde datum, een uur later, zelfde trainers', () => {
    const c = { ...nieuweClub('mini-5-7', 1, 'c1'), datums: [MA], starttijd: '18:00', trainers: ['Testtrainer 1'] };
    const met = { ...c, ...voegSessieToe(c) };
    expect(met.datums).toEqual([MA, MA]);
    expect(sessieTijd(met, 1)).toBe('19:00');
    expect(trainerNamen(opDag(met, 1))).toEqual(['Testtrainer 1']);
    expect(sessieTekst(met, 0, 'nl')).toBe('Ma 23 nov 18:00');
    expect(sessieTekst(met, 1, 'nl')).toBe('Ma 23 nov 19:00');
    expect(sessieSleutel(met, 1)).toBe(`${MA}|19:00`);
    // Zelfde datum zonder tijd: met een nummer, zodat je ze uit elkaar houdt.
    const zonder = { ...met, starttijd: undefined, perDag: met.perDag!.map((d, i) => (i === 1 ? { ...d, tijd: '' } : d)) };
    expect([sessieTekst(zonder, 0, 'nl'), sessieTekst(zonder, 1, 'nl')]).toEqual(['Ma 23 nov · 1', 'Ma 23 nov · 2']);
    // Maximaal aantal sessies.
    let veel: ClubTraining = { ...c };
    for (let i = 0; i < MAX_SESSIES + 2; i += 1) veel = { ...veel, ...voegSessieToe(veel) };
    expect(veel.datums).toHaveLength(MAX_SESSIES);
  });

  it('twee sessies op dezelfde datum met 2 en 4 groepjes: rotatie, stations, materiaal en trainers per sessie', () => {
    let c = avond();
    c = { ...c, ...zetDagTrainers(c, 0, { trainers: ['Testtrainer 1', 'Testtrainer 2'] }) };
    c = { ...c, ...zetDagTrainers(c, 1, { trainers: ['Testtrainer 1', 'Testtrainer 2', 'Testtrainer 3', 'Testtrainer 4'] }) };
    const s1 = opDag(c, 0);
    const s2 = opDag(c, 1);
    expect([s1.groepjes, s2.groepjes, s1.kinderen, s2.kinderen]).toEqual([2, 4, 10, 20]);
    expect([s1.starttijd, s2.starttijd]).toEqual(['18:00', '19:00']);
    // 2 groepjes: elke oefening 1×; 4 groepjes: elke oefening 2×.
    expect(rotatieKlopt(s1).stations).toHaveLength(3);
    expect(rotatieKlopt(s2).stations).toHaveLength(6);
    // Trainers: in sessie 1 twee stations met een trainer, in sessie 2 vier.
    expect(Object.values(trainerIndeling(s1).stations).filter((x) => x.length).length).toBe(2);
    expect(Object.values(trainerIndeling(s2).stations).filter((x) => x.length).length).toBe(4);
    // Materiaal: 1 voetbal per kind bij Techniek staat 1× (5 kinderen per groepje) of 2× (5 per groepje) op het veld.
    expect(materiaal(s1, vind, 'nl').stations.map((r) => r.tekst).sort()).toEqual(['1 mini-goaltje', '4 hoedjes', '5 voetballen']);
    expect(materiaal(s2, vind, 'nl').stations.find((r) => r.tekst.includes('voetbal'))!.tekst).toBe('10 voetballen');
    // De hele avond: het meeste in één sessie.
    expect(sessiesOpDatum(c, 1)).toEqual([0, 1]);
    const totaal = materiaalAvond([s1, s2], vind, 'nl').map((r) => r.tekst);
    expect(totaal).toEqual(expect.arrayContaining(['10 voetballen', '8 hoedjes', '2 mini-goaltjes']));
  });

  it('Zelfde als met een ander aantal groepjes: zelfde onderdelen en oefeningen, eigen rotatie', () => {
    const c = avond();
    expect(eigenOpzet(c, 1)).toBe(false);
    expect(onderdelenVan(opDag(c, 1))).toEqual(onderdelenVan(opDag(c, 0)));
    expect(clubPlan(opDag(c, 1)).stations.length).toBeGreaterThan(clubPlan(opDag(c, 0)).stations.length);
  });

  it('eigen opzet per sessie werkt samen met eigen aantallen', () => {
    const c = avond();
    const met = { ...c, ...maakEigenOpzet(c, 1, () => `x${Math.random().toString(36).slice(2, 7)}`) };
    expect(eigenOpzet(met, 1)).toBe(true);
    expect(opDag(met, 1).groepjes).toBe(4);
    rotatieKlopt(opDag(met, 1));
  });

  it('een andere leeftijd geeft een melding als de oefeningen niet passen (niet stil vervangen)', () => {
    const c = avond();
    expect(leeftijdMelding(opDag(c, 0), vind)).toBeUndefined();
    const o6 = { ...c, ...zetSessie(c, 1, { leeftijd: 'mini-3-5' }) };
    expect(opDag(o6, 1).leeftijd).toBe('mini-3-5');
    expect(leeftijdMelding(opDag(o6, 1), vind)).toContain('Hooghouden');
    expect(leeftijdMelding(opDag(o6, 1), vind)).not.toContain('Poortjesduel');
    expect(onderdelenVan(opDag(o6, 1))[0]!.oefening).toBe('hoog');
  });

  it('een ander aantal groepjes deelt alleen die sessie opnieuw in', () => {
    let c = avond();
    c = { ...c, ...zetDagTrainers(c, 0, { trainers: ['Testtrainer 1'], trainerKeuzes: { stations: { 1: ['Testtrainer 1'] } } }) };
    c = { ...c, ...zetDagTrainers(c, 1, { trainers: ['Testtrainer 2'], trainerKeuzes: { stations: { 1: ['Testtrainer 2'] } } }) };
    const na = { ...c, ...zetSessie(c, 1, { groepjes: 6 }) };
    expect(na.perDag![0]!.trainerKeuzes?.stations).toBeDefined();
    expect(na.perDag![1]!.trainerKeuzes?.stations).toBeUndefined();
    // De eerste sessie wijzigen: sessies met een eigen aantal veranderen niet mee.
    const eerste = { ...c, ...zetSessie(c, 0, { groepjes: 3 }) };
    expect(opDag(eerste, 1).groepjes).toBe(4);
    expect(eerste.perDag![1]!.trainerKeuzes?.stations).toBeDefined();
  });

  it('de eerste sessie weghalen: de tweede wordt de eerste, met zijn eigen waarden; de rest blijft gelijk', () => {
    let c = avond();
    c = { ...c, ...voegSessieToe(c) };
    expect(opDag(c, 2).groepjes).toBe(2);
    const zicht2 = opDag(c, 2);
    const na = { ...c, ...verwijderSessie(c, 0) } as ClubTraining;
    expect(na.datums).toHaveLength(2);
    expect([na.groepjes, na.kinderen, na.starttijd]).toEqual([4, 20, '19:00']);
    expect([opDag(na, 1).groepjes, opDag(na, 1).kinderen, opDag(na, 1).starttijd]).toEqual([zicht2.groepjes, zicht2.kinderen, zicht2.starttijd]);
    expect(verwijderSessie({ ...c, datums: [MA], perDag: undefined }, 0)).toEqual({});
  });
});

describe('rooster per sessie', () => {
  const t = (id: string, naam: string, w: Partial<RoosterTrainer> = {}): RoosterTrainer => ({ id, naam, dagen: [1], ritme: 'elke', beginWeek: '2026-11-16', groepen: ['O6'], wissel: false, gewijzigd: 1, ...w });
  const ROOSTER = [t('a', 'Testtrainer 1', { tijd: '18:00' }), t('b', 'Testtrainer 2', { tijd: '19:00', groepen: ['O7'] }), t('c', 'Testtrainer 3', { groepen: ['O6', 'O7'] })];

  it('een trainer met een begintijd komt alleen bij die sessie; zonder tijd bij elke sessie van zijn groep', () => {
    expect(roosterVoor(ROOSTER, 'O6', MA, '18:00').map((x) => x.naam)).toEqual(['Testtrainer 1', 'Testtrainer 3']);
    expect(roosterVoor(ROOSTER, 'O6', MA, '19:00').map((x) => x.naam)).toEqual(['Testtrainer 3']);
    expect(roosterVoor(ROOSTER, 'O6', MA).map((x) => x.naam)).toEqual(['Testtrainer 1', 'Testtrainer 3']);
  });

  it('elke sessie zijn eigen groep: de trainers per sessie uit het rooster', () => {
    let c = avond();
    c = { ...c, groep: 'O6', ...zetSessie({ ...c, groep: 'O6' }, 1, { groep: 'O7' }) };
    const gevuld = vulVolgensRooster(c, ROOSTER, true);
    expect(trainerNamen(opDag(gevuld, 0))).toEqual(['Testtrainer 1', 'Testtrainer 3']);
    expect(trainerNamen(opDag(gevuld, 1))).toEqual(['Testtrainer 2', 'Testtrainer 3']);
    // Het rooster laat de eigen waarden van de sessie staan.
    expect([opDag(gevuld, 1).groepjes, opDag(gevuld, 1).groep, sessieTijd(gevuld, 1)]).toEqual([4, 'O7', '19:00']);
    // Een trainer die bij beide sessies staat, ziet ze allebei.
    expect(mijnRondes(opDag(gevuld, 0), 'Testtrainer 3').length).toBeGreaterThan(0);
    expect(mijnRondes(opDag(gevuld, 1), 'Testtrainer 3').length).toBeGreaterThan(0);
  });

  it('Naar volgende week: alle sessies mee, weer volgens het rooster', () => {
    let c = avond();
    c = { ...c, groep: 'O6', ...zetSessie({ ...c, groep: 'O6' }, 1, { groep: 'O7' }) };
    const v = volgendeWeek(c, ROOSTER, 2, 'c2');
    expect(v.datums).toEqual(['2026-11-30', '2026-11-30']);
    expect([sessieTijd(v, 0), sessieTijd(v, 1), opDag(v, 1).groepjes]).toEqual(['18:00', '19:00', 4]);
    expect(trainerNamen(opDag(v, 1))).toEqual(['Testtrainer 2', 'Testtrainer 3']);
  });
});

describe('bestaand en delen', () => {
  it('een oude training met twee dagen wordt twee sessies met de begintijd en aantallen van de training', () => {
    const oud: ClubTraining = { ...nieuweClub('mini-5-7', 1, 'c1'), datums: [MA, '2026-11-25'], starttijd: '18:30', groepjes: 6, kinderen: 30 };
    expect([sessieTijd(oud, 0), sessieTijd(oud, 1)]).toEqual(['18:30', '18:30']);
    expect([opDag(oud, 1).groepjes, opDag(oud, 1).kinderen, opDag(oud, 1).leeftijd]).toEqual([6, 30, 'mini-5-7']);
    // Een oude link (zonder sessievelden) ook.
    const g = uitCode(naarCode({ ...oud, ...zetDagTrainers(oud, 1, { trainers: ['Testtrainer 1'] }) }))!;
    expect([sessieTijd(g, 1), opDag(g, 1).groepjes]).toEqual(['18:30', 6]);
  });

  it('dupliceren, delen met team en de trainerslink nemen alle sessies mee', () => {
    const c = { ...avond(), ...zetSessie(avond(), 1, { leeftijd: 'mini-3-5' }) };
    for (const kopie of [dupliceer(c, 2, 'c2'), leesTeamClub(voorTeam(c))!, uitCode(naarCode(c))!]) {
      expect(kopie.datums).toEqual([MA, MA]);
      expect([sessieTijd(kopie, 0), sessieTijd(kopie, 1)]).toEqual(['18:00', '19:00']);
      expect([opDag(kopie, 1).groepjes, opDag(kopie, 1).kinderen, opDag(kopie, 1).leeftijd]).toEqual([4, 20, 'mini-3-5']);
      expect(opDag(kopie, 0).groepjes).toBe(2);
    }
  });
});
