import { describe, expect, it } from 'vitest';
import {
  alleOnderdelen,
  clubPlan,
  dupliceer,
  eigenOpzet,
  isLeeg,
  leesTeamClub,
  maakEigenOpzet,
  materiaal,
  naarCode,
  nieuweClub,
  nieuwOnderdeel,
  oefeningIds,
  onderdelenVan,
  opDag,
  rondePlekken,
  trainerIndeling,
  uitCode,
  uitGedeeldeClub,
  vindOnderdeel,
  voorTeam,
  wijzigOnderdeel,
  zetDagOpzet,
  zetDagTrainers,
  type ClubTraining,
  type Onderdeel,
} from '../src/clubtraining/clubtraining';
import { volgendeWeek, type RoosterTrainer } from '../src/clubtraining/rooster';
import type { Oefening } from '../src/model/types';

/** Versie 0.34.3: per dag een eigen opzet in Circuittraining ("Zelfde als" of "Eigen opzet voor deze dag"). */

const MA = '2026-11-23';
const WO = '2026-11-25';
const o = (id: string, categorie: string, extra: Partial<Onderdeel> = {}): Onderdeel => ({ ...nieuwOnderdeel(categorie, 15, id), ...extra });
const basis = (): ClubTraining => ({
  ...nieuweClub('mini-5-7', 1, 'c1'),
  datums: [MA, WO],
  groepjes: 6,
  kinderen: 30,
  onderdelen: [o('tech', 'techniek', { oefening: 'veld-tq-hooghouden' }), o('een', 'een-tegen-een'), o('afw', 'afwerken'), o('partij', 'partijvormen')],
});
let teller = 0;
const id = () => `n${++teller}`;

/** Woensdag: Techniek vervangen door Loopcoördinatie met 2 groepjes samen. */
function woensdagLoop(c: ClubTraining): ClubTraining {
  const met = { ...c, ...maakEigenOpzet(c, 1, id) };
  const lijst = met.perDag![1]!.onderdelen!.map((x) => (x.categorie === 'techniek' ? { ...x, categorie: 'loopcoordinatie', soort: 'samen' as const, groepjesSamen: 2, oefening: 'veld-lc-ladder-enkel', oefeningen: undefined } : x));
  return { ...met, ...zetDagOpzet(met, 1, lijst) };
}

/** Elk groepje doet elk rotatie-onderdeel één keer. */
function rotatieKlopt(c: ClubTraining) {
  const plan = clubPlan(c);
  const rondes = plan.rondes.filter((r) => !r.samen);
  const ids = onderdelenVan(c)
    .filter((x) => x.soort === 'stations' || (x.groepjesSamen && x.groepjesSamen < c.groepjes))
    .map((x) => x.id)
    .sort();
  for (let g = 0; g < c.groepjes; g += 1) expect(rondes.map((r) => r.plekken[g]!.onderdeel).sort(), `groepje ${g}`).toEqual(ids);
  return plan;
}

describe('opzet per dag', () => {
  it('standaard: maandag en woensdag hebben dezelfde opzet (ook bestaande trainingen)', () => {
    const c = basis();
    expect(eigenOpzet(c, 1)).toBe(false);
    expect(opDag(c, 1).onderdelen).toEqual(c.onderdelen);
    // Bestaande training met trainers per dag, zonder eigen opzet.
    const oud = { ...c, ...zetDagTrainers(c, 1, { trainers: ['Testtrainer 1'] }) };
    expect(eigenOpzet(oud, 1)).toBe(false);
    expect(clubPlan(opDag(oud, 1))).toEqual(clubPlan(opDag(oud, 0)));
  });

  it('eigen opzet kopieert de eerste dag met nieuwe id’s; de eerste dag kan geen eigen opzet hebben', () => {
    const c = basis();
    const met = { ...c, ...maakEigenOpzet(c, 1, id) };
    expect(eigenOpzet(met, 1)).toBe(true);
    const wo = met.perDag![1]!.onderdelen!;
    expect(wo.map((x) => x.categorie)).toEqual(onderdelenVan(c).map((x) => x.categorie));
    expect(wo.every((x) => !onderdelenVan(c).some((y) => y.id === x.id))).toBe(true);
    expect(zetDagOpzet(c, 0, wo)).toEqual({});
    expect(eigenOpzet({ perDag: [{ trainers: [], onderdelen: wo }] }, 0)).toBe(false);
  });

  it('woensdag met Loopcoördinatie (2 groepjes samen) in plaats van Techniek: rotatie en materiaal per dag', () => {
    const c = woensdagLoop(basis());
    const ma = rotatieKlopt(opDag(c, 0));
    const wo = rotatieKlopt(opDag(c, 1));
    expect(ma.stations.map((s) => s.vorm)).toContain('techniek');
    expect(wo.stations.map((s) => s.vorm)).not.toContain('techniek');
    const loop = wo.stations.filter((s) => s.vorm === 'loopcoordinatie');
    expect(loop).toHaveLength(1);
    expect(loop[0]!.samen).toBe(2);
    // Materiaal: woensdag de ladder, maandag de spullen van Techniek.
    const oef: Record<string, Oefening> = {
      'veld-tq-hooghouden': { id: 'veld-tq-hooghouden', naam: 'Hooghouden', benodigdheden: ['1 voetbal per kind'] } as unknown as Oefening,
      'veld-lc-ladder-enkel': { id: 'veld-lc-ladder-enkel', naam: 'Ladder', benodigdheden: ['1 loopladder'] } as unknown as Oefening,
    };
    const tekst = (dag: number) => materiaal(opDag(c, dag), (x) => oef[x], 'nl').stations.map((r) => r.tekst);
    expect(tekst(0)).toEqual(['10 voetballen']);
    expect(tekst(1)).toEqual(['1 loopladder']);
  });

  it('de eerste dag aanpassen verandert alleen de dagen met Zelfde als', () => {
    const c = { ...basis(), datums: [MA, WO, '2026-11-27'] };
    const met = woensdagLoop(c);
    const anders = { ...met, onderdelen: onderdelenVan(met).map((x) => (x.id === 'afw' ? { ...x, duur: 20 } : x)) };
    expect(onderdelenVan(opDag(anders, 2)).find((x) => x.id === 'afw')!.duur).toBe(20);
    expect(opDag(anders, 1).onderdelen!.find((x) => x.categorie === 'afwerken')!.duur).toBe(15);
  });

  it('weer gelijk maken: de dag volgt weer de eerste dag; trainers en vaste plek blijven', () => {
    const c = woensdagLoop({ ...basis(), ...zetDagTrainers(basis(), 1, { trainers: ['Testtrainer LC', 'Testtrainer 2'] }) });
    const met = { ...c, perDag: c.perDag!.map((d, i) => (i === 1 ? { ...d, vast: { 'Testtrainer LC': 'loopcoordinatie' } } : d)) };
    const terug = { ...met, ...zetDagOpzet(met, 1, undefined) };
    expect(eigenOpzet(terug, 1)).toBe(false);
    expect(opDag(terug, 1).onderdelen).toEqual(onderdelenVan(terug));
    expect(terug.perDag![1]!.trainers).toEqual(['Testtrainer LC', 'Testtrainer 2']);
    expect(terug.perDag![1]!.vast).toEqual({ 'Testtrainer LC': 'loopcoordinatie' });
  });

  it('de vaste plek van de looptrainer werkt ook in een dag met een eigen opzet', () => {
    let c = woensdagLoop(basis());
    c = { ...c, ...zetDagTrainers(c, 1, { trainers: ['Testtrainer LC', 'Testtrainer 1', 'Testtrainer 2', 'Testtrainer 3', 'Testtrainer 4'] }) };
    c = { ...c, perDag: c.perDag!.map((d, i) => (i === 1 ? { ...d, vast: { 'Testtrainer LC': 'loopcoordinatie' } } : d)) };
    const wo = opDag(c, 1);
    const plan = clubPlan(wo);
    const nr = plan.stations.find((s) => s.vorm === 'loopcoordinatie')!.nr;
    expect(trainerIndeling(wo, plan).stations[nr]).toEqual(['Testtrainer LC']);
    expect(rondePlekken(wo, plan.rondes[0]!, plan).find((p) => p.station?.nr === nr)!.trainers).toEqual(['Testtrainer LC']);
  });

  it('oefeningen kiezen en vinden in een dag met een eigen opzet', () => {
    const c = woensdagLoop(basis());
    const een = c.perDag![1]!.onderdelen!.find((x) => x.categorie === 'een-tegen-een')!;
    expect(vindOnderdeel(c, een.id)).toEqual(een);
    const na = wijzigOnderdeel(c, een.id, (x) => ({ ...x, oefening: 'veld-mt-poortjesduel' }));
    expect(vindOnderdeel(na, een.id)!.oefening).toBe('veld-mt-poortjesduel');
    // De eerste dag verandert niet mee.
    expect(onderdelenVan(na).find((x) => x.id === 'een')!.oefening).toBeUndefined();
    expect(oefeningIds(na)).toEqual(expect.arrayContaining(['veld-tq-hooghouden', 'veld-lc-ladder-enkel', 'veld-mt-poortjesduel']));
    expect(alleOnderdelen(na)).toHaveLength(8);
    expect(isLeeg({ ...basis(), onderdelen: undefined, ...maakEigenOpzet({ ...basis(), onderdelen: undefined }, 1, id) })).toBe(false);
  });
});

describe('meenemen: dupliceren, volgende week, team en trainerslink', () => {
  const ROOSTER: RoosterTrainer[] = [
    { id: 'lc', naam: 'Testtrainer LC', dagen: [3], ritme: 'elke', beginWeek: '2026-11-16', groepen: ['Mini'], wissel: false, plek: 'loopcoordinatie', gewijzigd: 1 },
    { id: 't1', naam: 'Testtrainer 1', dagen: [1, 3], ritme: 'elke', beginWeek: '2026-11-16', groepen: ['Mini'], wissel: false, gewijzigd: 1 },
  ];

  it('dupliceren en Naar volgende week houden de opzet per dag (ook met het rooster)', () => {
    const c = woensdagLoop({ ...basis(), groep: 'Mini' });
    expect(eigenOpzet(dupliceer(c, 2, 'c2'), 1)).toBe(true);
    const volgende = volgendeWeek(c, ROOSTER, 2, 'c3');
    expect(volgende.datums).toEqual(['2026-11-30', '2026-12-02']);
    expect(eigenOpzet(volgende, 1)).toBe(true);
    expect(volgende.perDag![1]!.trainers).toEqual(['Testtrainer LC', 'Testtrainer 1']);
    expect(volgende.perDag![1]!.vast).toEqual({ 'Testtrainer LC': 'loopcoordinatie' });
    expect(eigenOpzet(volgende, 0)).toBe(false);
    // Zonder groep ook.
    expect(eigenOpzet(volgendeWeek(woensdagLoop(basis()), ROOSTER, 2, 'c4'), 1)).toBe(true);
  });

  it('delen met team: de opzet per dag gaat mee en blijft na overnemen', () => {
    const c = woensdagLoop(basis());
    const g = leesTeamClub(voorTeam(c))!;
    expect(eigenOpzet(g, 1)).toBe(true);
    const kopie = uitGedeeldeClub(g, new Map([['veld-lc-ladder-enkel', 'eigen-ladder']]), 3, 'c5');
    expect(kopie.perDag![1]!.onderdelen!.some((x) => x.oefening === 'eigen-ladder')).toBe(true);
    expect(clubPlan(opDag(kopie, 1)).stations.some((s) => s.vorm === 'loopcoordinatie')).toBe(true);
  });

  it('trainerslink: per dag de eigen opzet, met de trainers van Samen-onderdelen per dag', () => {
    let c = woensdagLoop(basis());
    c = { ...c, ...zetDagTrainers(c, 1, { trainers: ['Testtrainer LC', 'Testtrainer 1'] }) };
    const partijWo = c.perDag![1]!.onderdelen!.find((x) => x.categorie === 'partijvormen')!;
    c = { ...c, perDag: c.perDag!.map((d, i) => (i === 1 ? { ...d, trainerKeuzes: { samen: { [partijWo.id]: ['Testtrainer 1'] } } } : d)) };
    const g = uitCode(naarCode(c))!;
    expect(eigenOpzet(g, 1)).toBe(true);
    expect(eigenOpzet(g, 0)).toBe(false);
    const wo = opDag(g, 1);
    expect(onderdelenVan(wo).map((x) => [x.categorie, x.soort, x.groepjesSamen])).toEqual([
      ['loopcoordinatie', 'samen', 2],
      ['een-tegen-een', 'stations', undefined],
      ['afwerken', 'stations', undefined],
      ['partijvormen', 'samen', undefined],
    ]);
    // De keuze voor het Samen-onderdeel van woensdag hoort bij het onderdeel van woensdag.
    const partij = onderdelenVan(wo).find((x) => x.categorie === 'partijvormen')!;
    expect(wo.trainerKeuzes?.samen?.[partij.id]).toEqual(['Testtrainer 1']);
    expect(onderdelenVan(opDag(g, 0)).map((x) => x.categorie)).toEqual(['techniek', 'een-tegen-een', 'afwerken', 'partijvormen']);
    // Id's van maandag en woensdag zijn verschillend.
    expect(new Set(alleOnderdelen(g).map((x) => x.id)).size).toBe(8);
  });

  it('een oude link en een oud team-item zonder opzet per dag: alle dagen gelijk', () => {
    const c = { ...basis(), ...zetDagTrainers(basis(), 1, { trainers: ['Testtrainer 1'] }) };
    const g = uitCode(naarCode(c))!;
    expect(eigenOpzet(g, 1)).toBe(false);
    expect(onderdelenVan(opDag(g, 1)).map((x) => x.categorie)).toEqual(onderdelenVan(opDag(g, 0)).map((x) => x.categorie));
  });
});
