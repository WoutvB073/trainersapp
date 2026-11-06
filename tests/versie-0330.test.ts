import { describe, expect, it } from 'vitest';
import {
  alsSjabloon,
  clubPlan,
  genereerAlles,
  leesTeamClub,
  materiaal,
  metOefeningen,
  metOefeningIds,
  naarCode,
  nieuweClub,
  nieuwOnderdeel,
  oefeningenVan,
  oefeningIds,
  oefeningOpTijd,
  oefeningTijden,
  onderdelenVan,
  teVeelRichttijd,
  uitCode,
  uitGedeeldeClub,
  voorTeam,
  type ClubTraining,
  type Onderdeel,
} from '../src/clubtraining/clubtraining';
import { OEFENINGEN, vindOefening } from '../src/data/oefeningen';
import { naarBase64Url, uitBase64Url } from '../src/training/training';
import type { Oefening } from '../src/model/types';

/** Versie 0.33.0: meerdere oefeningen in één onderdeel van een circuittraining. */

const blok = (w: Partial<Onderdeel> = {}): Onderdeel => ({ ...nieuwOnderdeel('loopcoordinatie', 15, 'o1'), ...w });
const drie = metOefeningen(blok(), [{ oefening: 'veld-lc-slalom' }, { oefening: 'veld-lc-vallende-pion' }, { oefening: 'veld-lc-achtjes-drie-pionnen' }]);
const club = (onderdelen: Onderdeel[], w: Partial<ClubTraining> = {}): ClubTraining => ({ ...nieuweClub('jo8-11', 1, 'c1'), onderdelen, ...w });
const delen = () => [drie, nieuwOnderdeel('techniek', 15, 'o2'), nieuwOnderdeel('afwerken', 15, 'o3')];

describe('oefeningen in een onderdeel', () => {
  it('één oefening blijft bewaard zoals vóór 0.33.0', () => {
    const o = metOefeningen(blok(), [{ oefening: 'a' }]);
    expect(o.oefening).toBe('a');
    expect(o.oefeningen).toBeUndefined();
    expect(oefeningenVan(o)).toEqual([{ oefening: 'a' }]);
    expect(oefeningenVan({ oefening: 'b' })).toEqual([{ oefening: 'b' }]);
    expect(oefeningenVan({})).toEqual([]);
  });

  it('bij meer oefeningen blijft de eerste leesbaar voor oudere versies', () => {
    expect(drie.oefening).toBe('veld-lc-slalom');
    expect(drie.oefeningen).toHaveLength(3);
  });

  it('een richttijd bij één oefening blijft bewaard, weghalen van alles maakt het onderdeel leeg', () => {
    const o = metOefeningen(blok(), [{ oefening: 'a', minuten: 7 }]);
    expect(o.oefeningen).toEqual([{ oefening: 'a', minuten: 7 }]);
    const leeg = metOefeningen(o, []);
    expect(leeg.oefening).toBeUndefined();
    expect(leeg.oefeningen).toBeUndefined();
    expect(Object.values(leeg)).not.toContain(undefined);
  });

  it('alle oefeningen tellen mee bij oefeningIds', () => {
    expect(oefeningIds(club(delen()))).toEqual(['veld-lc-slalom', 'veld-lc-vallende-pion', 'veld-lc-achtjes-drie-pionnen']);
  });
});

describe('richttijden', () => {
  it('zonder richttijd wordt de bloktijd gelijk verdeeld', () => {
    expect(oefeningTijden(drie)).toEqual([5, 5, 5]);
    expect(oefeningTijden({ ...drie, duur: 10 })).toEqual([4, 3, 3]);
    expect(oefeningTijden({ ...drie, duur: 10 }).reduce((a, b) => a + b)).toBe(10);
  });

  it('een richttijd telt, de rest gaat over de oefeningen zonder richttijd', () => {
    const o = metOefeningen(blok(), [{ oefening: 'a', minuten: 9 }, { oefening: 'b' }, { oefening: 'c' }]);
    expect(oefeningTijden(o)).toEqual([9, 3, 3]);
    expect(teVeelRichttijd(o)).toBe(false);
  });

  it('te lange richttijden: geen fout, wel een melding', () => {
    const o = metOefeningen(blok(), [{ oefening: 'a', minuten: 12 }, { oefening: 'b', minuten: 6 }, { oefening: 'c' }]);
    expect(oefeningTijden(o)).toEqual([12, 6, 0]);
    expect(teVeelRichttijd(o)).toBe(true);
  });

  it('wat is er aan de beurt in de rondetimer', () => {
    expect(oefeningOpTijd(drie, 0)).toBe(0);
    expect(oefeningOpTijd(drie, 299)).toBe(0);
    expect(oefeningOpTijd(drie, 300)).toBe(1);
    expect(oefeningOpTijd(drie, 899)).toBe(2);
    expect(oefeningOpTijd(drie, 2000)).toBe(2);
  });
});

describe('rotatie en stations', () => {
  it('blijven per onderdeel: extra oefeningen veranderen het schema niet', () => {
    const enkel = club([metOefeningen(blok(), [{ oefening: 'veld-lc-slalom' }]), ...delen().slice(1)]);
    const meer = club(delen());
    const vorm = (c: ClubTraining) => clubPlan(c).rondes.map((r) => [r.begin, r.eind, r.plekken.map((p) => p.nr)]);
    expect(vorm(meer)).toEqual(vorm(enkel));
    expect(clubPlan(meer).totaal).toBe(clubPlan(enkel).totaal);
  });
});

describe('materiaal', () => {
  const nep = (id: string, benodigdheden: string[]) => ({ id, naam: id, benodigdheden }) as unknown as Oefening;
  const vind = (id: string) => ({ a: nep('a', ['8 pionnen', '1 trainer']), b: nep('b', ['12 pionnen', '2 hordes', 'Hesjes']), c: nep('c', ['3 pionnen']) })[id];
  const regel = (lijst: { tekst: string }[], woord: string) => lijst.find((r) => r.tekst.includes(woord))?.tekst;

  it('binnen een onderdeel telt het grootste aantal, niet de som', () => {
    const c = club([metOefeningen(blok(), [{ oefening: 'a' }, { oefening: 'b' }, { oefening: 'c' }]), nieuwOnderdeel('techniek', 15, 'o2'), nieuwOnderdeel('afwerken', 15, 'o3')], { groepjes: 3 });
    const m = materiaal(c, vind, 'nl');
    expect(regel(m.stations, 'pion')).toBe('12 pionnen');
    expect(regel(m.stations, 'horde')).toBe('2 hordes');
    expect(m.stations.find((r) => r.tekst.includes('pion'))!.bij.sort()).toEqual(['a', 'b', 'c']);
    expect(m.stations.some((r) => r.tekst === 'Hesjes')).toBe(true);
  });

  it('staat het onderdeel twee keer op het veld, dan telt het twee keer', () => {
    const c = club([metOefeningen(blok(), [{ oefening: 'a' }, { oefening: 'b' }]), nieuwOnderdeel('techniek', 15, 'o2'), nieuwOnderdeel('afwerken', 15, 'o3')], { groepjes: 6 });
    expect(regel(materiaal(c, vind, 'nl').stations, 'pion')).toBe('24 pionnen');
  });

  it('stations naast elkaar tellen op', () => {
    const c = club([metOefeningen(blok(), [{ oefening: 'a' }, { oefening: 'c' }]), metOefeningen(nieuwOnderdeel('techniek', 15, 'o2'), [{ oefening: 'b' }]), nieuwOnderdeel('afwerken', 15, 'o3')], { groepjes: 3 });
    expect(regel(materiaal(c, vind, 'nl').stations, 'pion')).toBe('20 pionnen');
  });
});

describe('delen', () => {
  const metRichttijd = metOefeningen(blok(), [{ oefening: 'veld-lc-slalom', minuten: 8 }, { oefening: 'veld-lc-vallende-pion' }, { oefening: 'veld-lc-achtjes-drie-pionnen' }]);

  it('de link houdt de volgorde en de richttijden', () => {
    const g = uitCode(naarCode(club([metRichttijd, ...delen().slice(1)])))!;
    const o = onderdelenVan(g)[0]!;
    expect(oefeningenVan(o)).toEqual([{ oefening: 'veld-lc-slalom', minuten: 8 }, { oefening: 'veld-lc-vallende-pion' }, { oefening: 'veld-lc-achtjes-drie-pionnen' }]);
    expect(oefeningTijden(o)).toEqual([8, 4, 3]);
  });

  it('een training met één oefening per onderdeel geeft dezelfde link als vóór 0.33.0', () => {
    const c = club([metOefeningen(blok(), [{ oefening: 'veld-lc-slalom' }]), nieuwOnderdeel('techniek', 15, 'o2'), nieuwOnderdeel('afwerken', 15, 'o3')]);
    const x = JSON.parse(uitBase64Url(naarCode(c))) as { o: unknown[][] };
    for (const rij of x.o) expect(rij).toHaveLength(4);
    expect(oefeningenVan(onderdelenVan(uitCode(naarCode(c))!)[0]!)).toEqual([{ oefening: 'veld-lc-slalom' }]);
  });

  it('een oude link (versie 2, zonder vijfde veld) en een link van versie 1 blijven werken', () => {
    const basis = { n: 'Oud', d: ['2026-11-09'], l: 'jo8-11', k: 12, g: 3, t: [], s: {}, f: {} };
    const v2 = naarBase64Url(JSON.stringify({ v: 2, ...basis, o: [['techniek', 15, 0, 'v:tq-hooghouden'], ['afwerken', 10, 0, ''], ['partijvormen', 15, 1, '']] }));
    expect(oefeningenVan(onderdelenVan(uitCode(v2)!)[0]!)).toEqual([{ oefening: 'veld-tq-hooghouden' }]);
    const v1 = naarBase64Url(JSON.stringify({ v: 1, ...basis, b: ['v:tq-hooghouden', '', '', ''] }));
    expect(oefeningenVan(onderdelenVan(uitCode(v1)!)[0]!)).toEqual([{ oefening: 'veld-tq-hooghouden' }]);
  });

  it('kapotte of dubbele invoer in een link valt terug op iets veiligs', () => {
    const code = naarBase64Url(JSON.stringify({ v: 2, n: 'x', d: [], l: 'jo8-11', k: 12, g: 3, t: [], s: {}, f: {}, o: [['techniek', 15, 0, 'v:a', [['v:a'], ['v:a', 5], [7], 'kapot', ['v:b', -3], ['v:c', 'x']]], ['afwerken', 10, 0, ''], ['partijvormen', 15, 1, '']] }));
    const o = onderdelenVan(uitCode(code)!)[0]!;
    expect(oefeningenVan(o)).toEqual([{ oefening: 'veld-a' }, { oefening: 'veld-b' }, { oefening: 'veld-c' }]);
  });

  it('delen met team houdt alle oefeningen, en kopiëren naar je eigen lijst ook', () => {
    const c = club(delen());
    const g = leesTeamClub(voorTeam(c))!;
    expect(oefeningIds(g)).toEqual(oefeningIds(c));
    const eigen = uitGedeeldeClub(g, new Map([['veld-lc-vallende-pion', 'eigen-1']]), 2, 'c2');
    expect(oefeningIds(eigen)).toEqual(['veld-lc-slalom', 'eigen-1', 'veld-lc-achtjes-drie-pionnen']);
  });

  it('meegenomen oefeningen krijgen overal hun nieuwe id', () => {
    const uit = metOefeningIds(club(delen()), (id) => `n-${id}`);
    expect(uit[0]!.oefening).toBe('n-veld-lc-slalom');
    expect(oefeningenVan(uit[0]!).map((x) => x.oefening)).toEqual(['n-veld-lc-slalom', 'n-veld-lc-vallende-pion', 'n-veld-lc-achtjes-drie-pionnen']);
  });

  it('een sjabloon neemt geen oefeningen mee', () => {
    const s = alsSjabloon(club(delen()), 'Sjabloon', 3, 's1');
    expect(oefeningIds(s)).toEqual([]);
    for (const o of onderdelenVan(s)) expect('oefeningen' in o).toBe(false);
  });
});

describe('genereren', () => {
  const bron = () => {
    let n = 0;
    return { alle: OEFENINGEN, favorieten: new Set<string>(), toeval: () => ((n += 0.37) % 1) };
  };

  it('Genereer alles geeft elk onderdeel evenveel nieuwe oefeningen als er stonden, en geen dubbele', () => {
    const uit = genereerAlles(club(delen(), { kinderen: 18, groepjes: 3 }), bron());
    expect(uit.map((o) => oefeningenVan(o).length)).toEqual([3, 1, 1]);
    const ids = uit.flatMap((o) => oefeningenVan(o).map((x) => x.oefening));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(vindOefening(id)).toBeTruthy();
  });
});
