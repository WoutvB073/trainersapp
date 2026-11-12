import { describe, expect, it } from 'vitest';
import {
  clubPlan,
  eenheden,
  groepjesTekst,
  isLeeg,
  loopOnderdelen,
  materiaal,
  naarCode,
  nieuweClub,
  nieuwOnderdeel,
  onderdeelKandidaten,
  onderdeelSpelers,
  onderdelenVan,
  rondePlekken,
  samenMeldingen,
  samenPer,
  stationTitel,
  trainerIndeling,
  uitCode,
  type ClubTraining,
  type Onderdeel,
} from '../src/clubtraining/clubtraining';
import type { Oefening } from '../src/model/types';
import { OEFENINGEN } from '../src/data/oefeningen';

/** Versie 0.34.2: Samen met een deel van de groepjes (bijv. Loopcoördinatie met 2 groepjes samen op één station). */

const loop = (n?: number): Onderdeel => ({ ...nieuwOnderdeel('loopcoordinatie', 15, 'loop'), soort: 'samen', ...(n ? { groepjesSamen: n } : {}) });
const een = () => nieuwOnderdeel('een-tegen-een', 15, 'een');
const afw = () => nieuwOnderdeel('afwerken', 15, 'afw');
const partij = () => nieuwOnderdeel('partijvormen', 15, 'partij');
const club = (groepjes: number, onderdelen: Onderdeel[], extra: Partial<ClubTraining> = {}): ClubTraining => ({ ...nieuweClub('mini-5-7', 1, 'c1'), groepjes, kinderen: groepjes * 5, onderdelen, ...extra });

/** Controles die voor elke verdeling moeten kloppen: elk groepje elk rotatie-onderdeel één keer, nooit te veel op één station. */
function controleer(c: ClubTraining) {
  const plan = clubPlan(c);
  const rotatie = onderdelenVan(c).filter((o) => o.soort === 'stations' || samenPer(o, c.groepjes));
  const rondes = plan.rondes.filter((r) => !r.samen);
  for (let g = 0; g < c.groepjes; g += 1) {
    const gedaan = rondes.map((r) => r.plekken[g]!.onderdeel).sort();
    expect(gedaan, `groepje ${g}`).toEqual(rotatie.map((o) => o.id).sort());
  }
  for (const r of rondes) {
    for (const s of plan.stations) {
      const op = r.plekken.filter((p) => p.nr === s.nr).length;
      expect(op, `ronde ${r.nr} station ${s.nr}`).toBeLessThanOrEqual(s.samen ?? 1);
    }
  }
  return plan;
}

/** Groepjes die in een ronde op hetzelfde gedeelde station staan. */
const opGedeeld = (c: ClubTraining) =>
  clubPlan(c)
    .rondes.filter((r) => !r.samen)
    .map((r) => {
      const per = new Map<number, number[]>();
      r.plekken.forEach((s, g) => s.samen && per.set(s.nr, [...(per.get(s.nr) ?? []), g]));
      return [...per.values()];
    });

describe('Samen met een deel van de groepjes', () => {
  it('samenPer: leeg of minstens het aantal groepjes = alle groepjes (zoals vóór 0.34.2)', () => {
    expect(samenPer(loop(), 6)).toBeUndefined();
    expect(samenPer(loop(2), 6)).toBe(2);
    expect(samenPer(loop(6), 6)).toBeUndefined();
    expect(samenPer({ ...een(), groepjesSamen: 2 }, 6)).toBeUndefined();
  });

  it('6 groepjes, Loopcoördinatie met 2 samen + 1 tegen 1 + Afwerken: 3 rondes, 1 gedeeld station en vaste duo’s', () => {
    const c = club(6, [loop(2), een(), afw(), partij()]);
    const plan = controleer(c);
    const rot = plan.rondes.filter((r) => !r.samen);
    expect(rot).toHaveLength(3);
    expect(plan.rondes).toHaveLength(4);
    const loopStations = plan.stations.filter((s) => s.onderdeel === 'loop');
    expect(loopStations).toHaveLength(1);
    expect(loopStations[0]!.samen).toBe(2);
    expect(plan.stations.filter((s) => s.onderdeel === 'een')).toHaveLength(2);
    expect(plan.stations.filter((s) => s.onderdeel === 'afw')).toHaveLength(2);
    // Per ronde precies één duo op het gedeelde station, en altijd A+B, C+D of E+F.
    for (const groepen of opGedeeld(c)) expect(groepen).toHaveLength(1);
    expect(opGedeeld(c).flat().map((g) => g.join('+')).sort()).toEqual(['0+1', '2+3', '4+5']);
    // Een duo staat elke ronde op hetzelfde onderdeel (samen naar het gedeelde station, daarna gesplitst).
    for (const r of rot) for (const [a, b] of eenheden(6, 2)) expect(r.plekken[a!]!.onderdeel).toBe(r.plekken[b!]!.onderdeel);
    expect(samenMeldingen(c)).toEqual([]);
    expect(plan.samen.map((o) => o.id)).toEqual(['partij']);
  });

  it('Samen = 3 bij 6 groepjes: trio’s, 1 gedeeld station; in elke ronde blijft er een onderdeel leeg (met melding)', () => {
    const c = club(6, [loop(3), een(), afw()]);
    const plan = controleer(c);
    expect(plan.stations.filter((s) => s.onderdeel === 'loop')).toHaveLength(1);
    expect(plan.stations.filter((s) => s.onderdeel === 'een')).toHaveLength(3);
    expect(opGedeeld(c).flat().map((g) => g.join('+')).sort()).toEqual(['0+1+2', '3+4+5']);
    expect(samenMeldingen(c).join(' ')).toContain('in elke ronde blijft er een onderdeel leeg');
  });

  it('4 groepjes met 2 samen: 2 duo’s langs 3 onderdelen, 1 gedeeld station', () => {
    const c = club(4, [loop(2), een(), afw()]);
    const plan = controleer(c);
    expect(plan.stations.filter((s) => s.onderdeel === 'loop')).toHaveLength(1);
    expect(plan.rondes).toHaveLength(3);
    expect(opGedeeld(c).flat().map((g) => g.join('+')).sort()).toEqual(['0+1', '2+3']);
  });

  it('8 groepjes met 2 samen: meer duo’s dan onderdelen, dus het gedeelde onderdeel op 2 stations (met melding), nooit 2 duo’s op één station', () => {
    const c = club(8, [loop(2), een(), afw()]);
    const plan = controleer(c);
    expect(plan.rondes).toHaveLength(3);
    expect(plan.stations.filter((s) => s.onderdeel === 'loop')).toHaveLength(2);
    for (const groepen of opGedeeld(c)) for (const g of groepen) expect(g).toHaveLength(2);
    expect(samenMeldingen(c).join(' ')).toContain('staat op 2 stations');
    // Met een vierde onderdeel lukt het wel op één station.
    const c4 = club(8, [loop(2), een(), afw(), nieuwOnderdeel('techniek', 15, 'tech')]);
    controleer(c4);
    expect(clubPlan(c4).stations.filter((s) => s.onderdeel === 'loop')).toHaveLength(1);
    expect(samenMeldingen(c4)).toEqual([]);
  });

  it('oneven: 5 groepjes met 2 samen geeft een melding, groepje E komt alleen, en de rotatie klopt toch', () => {
    const c = club(5, [loop(2), een(), afw()]);
    controleer(c);
    expect(samenMeldingen(c)).toContain('5 groepjes gaan niet precies per 2. Bij Loopcoördinatie komt groepje E alleen.');
    const c7 = club(7, [loop(3), een(), afw()]);
    controleer(c7);
    expect(samenMeldingen(c7).join(' ')).toContain('Bij Loopcoördinatie komt groepje G alleen.');
    const c8 = club(8, [loop(3), een(), afw()]);
    controleer(c8);
    expect(samenMeldingen(c8).join(' ')).toContain('komen groepjes G en H samen');
  });

  it('twee gedeelde onderdelen met een ander aantal in één rotatie: melding, het eerste aantal geldt', () => {
    const c = club(6, [loop(2), { ...nieuwOnderdeel('techniek', 15, 'tech'), soort: 'samen', groepjesSamen: 3 }, een()]);
    controleer(c);
    expect(samenMeldingen(c).join(' ')).toContain('Bij allebei komen nu 2 groepjes samen.');
  });

  it('bestaande trainingen met Samen werken door als Alle groepjes', () => {
    const c = club(6, [{ ...een(), id: 'x' }, afw(), { ...nieuwOnderdeel('warming-up', 10, 'wu'), soort: 'samen' }, partij()]);
    const plan = clubPlan(c);
    expect(plan.samen.map((o) => o.id)).toEqual(['wu', 'partij']);
    expect(plan.rondes.filter((r) => r.samen)).toHaveLength(2);
    expect(plan.stations.every((s) => !s.samen)).toBe(true);
    // Mini Talents van vóór 0.32.0 (alleen blokken): ongewijzigd.
    const oud = { ...nieuweClub('mini-5-7', 1, 'c2'), onderdelen: undefined, blokken: {} };
    expect(clubPlan(oud).rondes).toHaveLength(4);
  });
});

describe('namen, trainers en materiaal', () => {
  const c = club(6, [loop(2), een(), afw(), partij()], { trainers: ['Trainer 1', 'Trainer 2', 'Trainer 3', 'Trainer 4', 'Trainer 5'] });

  it('het gedeelde station heet "Loopcoördinatie – groepje A en B samen" in de ronde', () => {
    const plan = clubPlan(c);
    const s = plan.stations.find((x) => x.onderdeel === 'loop')!;
    expect(stationTitel(s)).toBe('Loopcoördinatie (2 groepjes samen)');
    const ronde = plan.rondes[0]!;
    const plekken = rondePlekken(c, ronde, plan);
    const gedeeld = plekken.find((p) => p.station?.nr === s.nr)!;
    expect(gedeeld.groepen).toEqual([0, 1]);
    expect(gedeeld.naam).toBe('Loopcoördinatie – groepje A en B samen');
    // Eén regel per station: 5 plekken voor 6 groepjes.
    expect(plekken).toHaveLength(5);
    expect(groepjesTekst([2, 3])).toBe('groepjes C en D');
    expect(groepjesTekst([4])).toBe('groepje E');
  });

  it('de looptrainer (vaste plek) staat alleen bij Loopcoördinatie; de anderen over de andere stations', () => {
    const plan = clubPlan(c);
    const ind = trainerIndeling({ ...c, vast: { 'Trainer 3': 'loopcoordinatie' } }, plan);
    const nr = plan.stations.find((x) => x.onderdeel === 'loop')!.nr;
    expect(ind.stations[nr]).toEqual(['Trainer 3']);
    const anderen = plan.stations.filter((s) => s.nr !== nr).flatMap((s) => ind.stations[s.nr] ?? []);
    expect(anderen.sort()).toEqual(['Trainer 1', 'Trainer 2', 'Trainer 4', 'Trainer 5']);
    for (const s of plan.stations.filter((x) => x.nr !== nr)) expect(ind.stations[s.nr]).toHaveLength(1);
  });

  it('trainers die meelopen: bij het gedeelde station de trainers van beide groepjes', () => {
    const mee = { ...c, trainerKeuzes: { modus: 'groepje' as const } };
    const plan = clubPlan(mee);
    const plek = rondePlekken(mee, plan.rondes[0]!, plan).find((p) => p.groepen.length === 2)!;
    expect(plek.trainers.length).toBe(2);
  });

  it('kinderen en materiaal: het gedeelde station telt 2 groepjes', () => {
    expect(onderdeelSpelers(c, loop(2))).toBe(10);
    const oef = { id: 'x', soort: 'veld', naam: 'Ladder', benodigdheden: ['2 loopladders', '1 hoedje per kind'] } as unknown as Oefening;
    const m = materiaal({ ...c, onderdelen: [{ ...loop(2), oefening: 'x' }, een(), afw()] }, (id) => (id === 'x' ? oef : undefined), 'nl');
    expect(m.stations.map((r) => r.tekst).sort()).toEqual(['10 hoedjes', '2 loopladders']);
  });
});

describe('opslaan, delen en sjabloon', () => {
  it('de deellink bewaart het aantal groepjes samen; Samen zonder aantal blijft Alle groepjes', () => {
    const c = club(6, [loop(2), een(), afw(), partij()]);
    const terug = uitCode(naarCode(c))!;
    expect(terug.onderdelen!.map((o) => [o.soort, o.groepjesSamen])).toEqual([
      ['samen', 2],
      ['stations', undefined],
      ['stations', undefined],
      ['samen', undefined],
    ]);
    expect(clubPlan({ ...terug }).stations.filter((s) => s.samen)).toHaveLength(1);
  });

  it('ingebouwd sjabloon Mini Talents + loopcoördinatie', () => {
    const lijst = loopOnderdelen();
    expect(lijst.map((o) => [o.categorie, o.soort, o.groepjesSamen, o.duur])).toEqual([
      ['loopcoordinatie', 'samen', 2, 15],
      ['een-tegen-een', 'stations', undefined, 15],
      ['afwerken', 'stations', undefined, 15],
      ['partijvormen', 'samen', undefined, 15],
    ]);
    const c = { ...nieuweClub('mini-5-7', 1, 'c3'), groepjes: 6, onderdelen: lijst };
    expect(isLeeg(c)).toBe(true);
    expect(isLeeg({ ...c, naam: 'Week looptrainer' })).toBe(false);
    controleer(c);
    expect(clubPlan(c).totaal).toBe(60 * 60);

    // Voor O7 en O6 zijn er loopoefeningen voor 2 groepjes samen (O7 kreeg er in 0.34.2 zes bij).
    for (const leeftijd of ['mini-5-7', 'mini-3-5'] as const) expect(onderdeelKandidaten({ ...c, leeftijd }, lijst[0]!, OEFENINGEN).length, leeftijd).toBeGreaterThanOrEqual(2);
    expect(onderdeelKandidaten({ ...c, leeftijd: 'mini-5-7' }, lijst[0]!, OEFENINGEN).length).toBeGreaterThanOrEqual(6);
  });
});
