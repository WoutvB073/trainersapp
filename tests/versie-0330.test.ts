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
import { naarBase64Url, pastBij, uitBase64Url } from '../src/training/training';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
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

describe('Techniek opgeschoond', () => {
  const WEG = ['veld-af-dribbel-afronden', 'veld-cv-ladder-slalom-schot', 'veld-cv-draaien-voorzet', 'veld-pv-1-1-doeltjes', 'veld-cv-1t1-2t1', 'veld-sp-pannavoetbal', 'veld-cv-estafette', 'veld-af-kleine-doeltjes', 'veld-cv-aanname-lucht-schot', 'veld-cv-rebounder-doeltjes', 'veld-tq-gerichte-aanname-voren', 'veld-tq-vrijlopen-rug-verdediger'];
  const techniek = OEFENINGEN.filter((o) => o.soort === 'veld' && o.categorieen.includes('techniek'));

  it('geen enkele oefening in Techniek heeft een doel, een schot of hoort bij de partijvormen', () => {
    for (const o of techniek) {
      expect(JSON.stringify(o.tekening.animatie ?? []), o.id).not.toContain('"type":"schot"');
      expect(o.tekening.objecten.some((x) => x.soort === 'goal' || x.soort === 'klein-goal'), o.id).toBe(false);
      expect(o.categorieen, o.id).not.toContain('partijvormen');
    }
  });

  it('de aangepaste oefeningen houden hun andere categorieën en staan in het juiste bestand', () => {
    for (const id of WEG) {
      const o = vindOefening(id)!;
      expect(o.categorieen, id).not.toContain('techniek');
      expect(o.categorieen.length, id).toBeGreaterThan(0);
      expect(OEFENINGEN.some((x) => x.id === id), id).toBe(true);
    }
  });

  it('er blijft genoeg over voor elke leeftijdsgroep', () => {
    for (const l of ['mini-3-5', 'mini-5-7', 'jo8-11', 'jo12-15', 'jo16-19'] as const) expect(techniek.filter((o) => o.leeftijden?.includes(l)).length, l).toBeGreaterThanOrEqual(8);
  });
});

describe('nieuwe techniekoefeningen', () => {
  const NIEUW = ['veld-tq-pop-actie', 'veld-tq-slalom-bal', 'veld-tq-vierkant-wendingen', 'veld-tq-tempowisseling', 'veld-tq-actie-passieve-verdediger', 'veld-tq-spiegeldribbel'];

  it('staan in Techniek, met alles erop en eraan', () => {
    for (const id of NIEUW) {
      const o = vindOefening(id)!;
      expect(o.categorieen[0], id).toBe('techniek');
      expect(o.keepersNodig, id).toBe(0);
      expect(o.doorwisselbaar, id).toBe(true);
      expect(o.coachpunten.length, id).toBeGreaterThanOrEqual(2);
      expect(o.coachpunten.length, id).toBeLessThanOrEqual(4);
      expect(o.leeftijden!.length, id).toBeGreaterThan(0);
    }
    expect(vindOefening('veld-tq-spiegeldribbel')!.categorieen).toContain('warming-up');
  });

  it('de wendingen in het vierkant: de bal blijft bij de speler en de speler staat daarna de goede kant op', () => {
    const tl = maakTijdlijn(vindOefening('veld-tq-vierkant-wendingen')!.tekening);
    const acties = (vindOefening('veld-tq-vierkant-wendingen')!.tekening.animatie ?? []).flatMap((s) => ('acties' in s ? s.acties : []));
    const soorten = new Set(acties.filter((a) => a.type === 'truc').map((a) => (a as { soort: string }).soort));
    expect([...soorten].sort()).toEqual(['binnenkant', 'buitenkant', 'cruijff', 'zool']);
    for (let t = 0; t < tl.duur; t += 0.1) {
      const s = standOp(tl, t);
      const speler = s.objecten.get('a1')!;
      const b = s.objecten.get('b1')!;
      expect(Math.hypot(b.x - speler.x, b.y - speler.y), `t=${t}`).toBeLessThan(1);
    }
    expect(tl.duur).toBeGreaterThan(10);
  });

  it('tijdens een wending komt de bal dicht bij de voeten en draait het lijf mee', () => {
    const tl = maakTijdlijn(vindOefening('veld-tq-tempowisseling')!.tekening);
    const momenten = Array.from({ length: Math.floor(tl.duur * 20) }, (_, i) => i / 20).filter((t) => standOp(tl, t).objecten.get('a1')!.truc);
    expect(momenten.length).toBeGreaterThan(5);
    const midden = momenten[Math.floor(momenten.length / 2)]!;
    const s = standOp(tl, midden);
    const a = s.objecten.get('a1')!;
    const b = s.objecten.get('b1')!;
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeLessThan(0.4);
    expect(standOp(tl, midden).objecten.get('a1')!.truc!.soort).toBe('binnenkant');
    expect(standOp(tl, momenten.at(-1)! + 0.1).objecten.get('a1')!.truc).toBeUndefined();
  });

  it('bij bestaande oefeningen die vrijwel gelijk waren is de wens als variant of tekst toegevoegd', () => {
    expect(vindOefening('veld-tq-aannemen-meenemen')!.variaties.moeilijker.join(' ')).toMatch(/trainer wijst/);
    expect(vindOefening('veld-wu-dribbelen-opdrachten')!.uitleg).toMatch(/kap/);
  });
});

describe('partijspel', () => {
  const ALLE = ['mini-3-5', 'mini-5-7', 'jo8-11', 'jo12-15', 'jo16-19'];

  it('Partijspel: keepers op grote goals, zonder keepers op kleine goals, veldgrootte in de uitleg, niet weggefilterd', () => {
    const o = vindOefening('veld-pv-partijspel')!;
    expect(o.categorieen).toEqual(['partijvormen']);
    expect(o.leeftijden).toEqual(ALLE);
    expect(o.keepersNodig).toBe(2);
    expect(o.zonderKeepers).toBe(true);
    expect(o.tekening.objecten.filter((x) => x.soort === 'goal')).toHaveLength(2);
    expect(o.tekening.objecten.filter((x) => x.soort === 'keeper')).toHaveLength(2);
    expect(pastBij(o, 8, 0)).toBe(true);
    expect(pastBij(o, 8, 2)).toBe(true);
    for (const w of ['4 tegen 4', '8 tegen 8', '30 × 20 m', '60 × 40 m', 'kleine goals']) expect(o.uitleg).toContain(w);
  });

  it('Partijspel met kameleon: de Jokerpartij zelf, nu voor alle leeftijden, met een speler in een andere kleur', () => {
    const o = vindOefening('veld-mt-jokerpartij')!;
    expect(o.naam).toBe('Partijspel met kameleon');
    expect(o.leeftijden).toEqual(ALLE);
    expect(o.keepersNodig).toBe(0);
    expect(o.tekening.objecten.filter((x) => x.team === 'J')).toHaveLength(1);
    expect(o.tekening.objecten.some((x) => x.soort === 'trainer')).toBe(false);
    expect(OEFENINGEN.filter((x) => /kameleon/i.test(x.naam))).toHaveLength(1);
    // De kameleon speelt met allebei de teams mee.
    const passes = (o.tekening.animatie ?? []).flatMap((s) => ('acties' in s ? s.acties : [])).filter((a) => a.type === 'pass') as unknown as { van: string; naar: string }[];
    expect(passes.filter((p) => p.naar === 'j1').map((p) => p.van)).toEqual(['a1', 'c3']);
  });
});
