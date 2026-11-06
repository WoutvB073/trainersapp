import { describe, expect, it } from 'vitest';
import { OEFENINGEN, vindOefening } from '../src/data/oefeningen';
import {
  alsSjabloon,
  CATEGORIEEN,
  clubPlan,
  dupliceer,
  faseGroottes,
  genereerAlles,
  groepNaam,
  isLeeg,
  leesTeamClub,
  materiaal,
  metOefeningIds,
  naarCode,
  naarVolgendeWeek,
  nieuweClub,
  nieuwOnderdeel,
  onderdeelKandidaten,
  onderdeelSpelers,
  onderdelenVan,
  partijvelden,
  rondeTijd,
  stationNaam,
  stationVak,
  tijdTekst,
  timerStand,
  uitCode,
  uitGedeeldeClub,
  uitSjabloon,
  voorTeam,
  zelfOnderdelen,
  type ClubTraining,
  type Onderdeel,
  type OnderdeelSoort,
} from '../src/clubtraining/clubtraining';
import { base64Oud } from './hulp-links';

/** Versie 0.32.0: circuittraining met eigen onderdelen, duur, Stations of Samen en 2 tot 8 groepjes. */

const onderdeel = (categorie: string, soort: OnderdeelSoort = 'stations', duur = 15, oefening?: string): Onderdeel => ({ id: `${categorie}-${duur}-${soort}`, categorie, duur, soort, ...(oefening ? { oefening } : {}) });
const club = (groepjes: number, onderdelen: Onderdeel[], w: Partial<ClubTraining> = {}): ClubTraining => ({ ...nieuweClub('mini-5-7', 1000, 'c1'), groepjes, onderdelen, ...w });

const CATS = ['warming-up', 'techniek', 'loopcoordinatie', 'pass-en-trap', 'afwerken', 'een-tegen-een'];
/** Alle verdelingen van Stations en Samen bij n onderdelen. */
function verdelingen(n: number): Onderdeel[][] {
  return Array.from({ length: 2 ** n }, (_, m) => CATS.slice(0, n).map((c, i) => onderdeel(c, m & (1 << i) ? 'samen' : 'stations', 5 + 5 * (i % 3))));
}

describe('rotatie: 2 tot 8 groepjes, 3 tot 6 onderdelen, wisselend Stations en Samen', () => {
  for (const groepjes of [2, 3, 4, 5, 6, 7, 8]) {
    for (const aantal of [3, 4, 5, 6]) {
      it(`${groepjes} groepjes, ${aantal} onderdelen`, () => {
        for (const lijst of verdelingen(aantal)) {
          const p = clubPlan(club(groepjes, lijst));
          const stationDelen = lijst.filter((o) => o.soort === 'stations');
          const stationRondes = p.rondes.filter((r) => !r.samen);

          // Elk groepje doet elk station-onderdeel precies één keer.
          for (let g = 0; g < groepjes; g += 1) {
            const gedaan = stationRondes.map((r) => r.plekken[g]!.onderdeel);
            expect([...gedaan].sort()).toEqual(stationDelen.map((o) => o.id).sort());
          }
          // Nooit twee groepjes tegelijk op een station.
          for (const r of stationRondes) {
            expect(r.plekken).toHaveLength(groepjes);
            expect(new Set(r.plekken.map((s) => s.nr)).size).toBe(groepjes);
          }
          // Evenveel rondes als onderdelen: niemand wacht, en een Samen-onderdeel is één ronde voor iedereen.
          expect(p.rondes).toHaveLength(lijst.length);
          // Volgorde: de Samen-onderdelen blijven op hun plek ten opzichte van de stations.
          expect(p.rondes.flatMap((r) => (r.samen ? [r.samen.id] : []))).toEqual(lijst.filter((o) => o.soort === 'samen').map((o) => o.id));
          // Tijden sluiten op elkaar aan, en een ronde duurt zo lang als het langste onderdeel erin.
          let t = 0;
          for (const r of p.rondes) {
            expect(r.begin).toBe(t);
            expect(r.eind).toBeGreaterThan(r.begin);
            t = r.eind;
            const delen = r.samen ? [r.samen] : lijst.filter((o) => r.plekken.some((s) => s.onderdeel === o.id));
            expect(r.eind - r.begin).toBe(Math.max(...delen.map((o) => o.duur)) * 60);
          }
          expect(p.totaal).toBe(t);
          // Lege stations: wat in de fase staat en niet bezet is.
          for (const r of stationRondes) {
            const f = p.fases.find((x) => x.stations.includes(r.plekken[0]!))!;
            expect(r.leeg.length + groepjes).toBe(f.stations.length);
          }
          // Stationnummers lopen door, zonder gaten.
          expect(p.stations.map((s) => s.nr)).toEqual(p.stations.map((_, i) => i + 1));
        }
      });
    }
  }
});

describe('zo vaak op het veld als nodig', () => {
  const drie = ['techniek', 'een-tegen-een', 'afwerken'].map((c) => onderdeel(c));
  const keer = (groepjes: number, lijst: Onderdeel[]) => clubPlan(club(groepjes, lijst)).stations.filter((s) => s.onderdeel === lijst[0]!.id).length;

  it('6 groepjes, 3 onderdelen: elke vorm 2× op het veld, niets leeg', () => {
    expect(keer(6, drie)).toBe(2);
    expect(clubPlan(club(6, drie)).rondes.every((r) => r.leeg.length === 0)).toBe(true);
  });
  it('3 groepjes, 3 onderdelen: elke vorm 1×, drie rondes, niets leeg', () => {
    const p = clubPlan(club(3, drie));
    expect(p.stations).toHaveLength(3);
    expect(p.rondes).toHaveLength(3);
    expect(p.rondes.every((r) => r.leeg.length === 0)).toBe(true);
  });
  it('2 groepjes: elke oefening 1× op het veld', () => {
    for (const n of [2, 3, 4, 5, 6]) {
      const lijst = CATS.slice(0, n).map((c) => onderdeel(c));
      expect(clubPlan(club(2, lijst)).stations).toHaveLength(n);
    }
  });
  it('minder groepjes dan onderdelen: nooit dubbel, en zo min mogelijk leeg', () => {
    expect(faseGroottes(4, 2)).toEqual([2, 2]);
    expect(faseGroottes(6, 2)).toEqual([2, 2, 2]);
    expect(faseGroottes(6, 3)).toEqual([3, 3]);
    expect(faseGroottes(3, 2)).toEqual([3]);
    expect(faseGroottes(5, 2)).toEqual([2, 3]);
    expect(faseGroottes(4, 3)).toEqual([4]);
    expect(faseGroottes(3, 3)).toEqual([3]);
    expect(faseGroottes(3, 6)).toEqual([3]);
    expect(faseGroottes(0, 3)).toEqual([]);
  });
  it('3 onderdelen bij 2 groepjes: één station leeg per ronde, zichtbaar in het plan', () => {
    const p = clubPlan(club(2, drie));
    expect(p.rondes.map((r) => r.leeg.length)).toEqual([1, 1, 1]);
    expect(p.stations).toHaveLength(3);
  });
  it('meer groepjes dan onderdelen: dubbel, en de namen laten dat zien', () => {
    const p = clubPlan(club(4, drie));
    expect(p.stations).toHaveLength(6);
    expect(p.rondes.map((r) => r.leeg.length)).toEqual([2, 2, 2]);
    expect(stationNaam(p.stations[0]!)).toBe('Techniek 1');
    expect(stationNaam(p.stations[2]!)).toBe('1 tegen 1 – 1');
    expect(stationNaam(clubPlan(club(3, drie)).stations[0]!)).toBe('Techniek');
  });
});

describe('het voorbeeld: 2 groepjes, Loopcoördinatie, Techniek, Afwerken, 1 tegen 1 en Partijspel samen', () => {
  const lijst = [onderdeel('loopcoordinatie', 'stations', 10), onderdeel('techniek', 'stations', 10), onderdeel('afwerken', 'stations', 10), onderdeel('een-tegen-een', 'stations', 10), onderdeel('partijvormen', 'samen', 15)];
  const p = clubPlan(club(2, lijst));
  const wie = (ronde: number) => p.rondes[ronde]!.plekken.map((s) => s.vorm);

  it('ronde 1: A Loopcoördinatie, B Techniek', () => expect(wie(0)).toEqual(['loopcoordinatie', 'techniek']));
  it('ronde 2: omwisselen', () => expect(wie(1)).toEqual(['techniek', 'loopcoordinatie']));
  it('ronde 3: A Afwerken, B 1 tegen 1', () => expect(wie(2)).toEqual(['afwerken', 'een-tegen-een']));
  it('ronde 4: omwisselen', () => expect(wie(3)).toEqual(['een-tegen-een', 'afwerken']));
  it('ronde 5: Partijspel samen', () => {
    expect(p.rondes).toHaveLength(5);
    expect(p.rondes[4]!.samen?.categorie).toBe('partijvormen');
    expect(p.rondes[4]!.plekken).toEqual([]);
  });
  it('elke oefening 1× op het veld, niets leeg, twee fases', () => {
    expect(p.stations).toHaveLength(4);
    expect(p.fases).toHaveLength(2);
    expect(p.rondes.every((r) => r.leeg.length === 0)).toBe(true);
  });
  it('partijspel: 1 veld, groep A tegen groep B, zonder joker', () => {
    expect(partijvelden(2)).toEqual([{ nr: 1, groepen: [0, 1], metTrainer: false }]);
    expect(groepNaam(0) + groepNaam(1)).toBe('AB');
  });
  it('tijden: 4 × 10 minuten en een kwartier partijspel', () => {
    expect(p.rondes.map((r) => rondeTijd(r))).toEqual(['0–10 min', '10–20 min', '20–30 min', '30–40 min', '40–55 min']);
    expect(p.totaal).toBe(55 * 60);
    expect(rondeTijd(p.rondes[4]!, '18:30')).toBe('19:10–19:25');
    expect(tijdTekst(p.totaal)).toBe('55 min');
    expect(tijdTekst(65 * 60)).toBe('1 uur 5 min');
  });
});

describe('duur per onderdeel', () => {
  it('verschillende duur in één ronde: de langste telt en het kortere onderdeel wordt gemeld', () => {
    const a = onderdeel('techniek', 'stations', 10);
    const b = onderdeel('afwerken', 'stations', 15);
    const p = clubPlan(club(2, [a, b, onderdeel('partijvormen', 'samen', 20)]));
    expect(p.rondes.map((r) => r.eind - r.begin)).toEqual([900, 900, 1200]);
    expect(p.verlengd.map((o) => o.id)).toEqual([a.id]);
  });
  it('gelijke duur: niets verlengd, de totale tijd is de som', () => {
    const lijst = ['techniek', 'afwerken', 'een-tegen-een'].map((c) => onderdeel(c, 'stations', 12));
    const p = clubPlan(club(3, lijst));
    expect(p.verlengd).toEqual([]);
    expect(p.totaal).toBe(36 * 60);
  });
});

describe('Samen', () => {
  it('Partijvormen staat standaard op Samen, de rest op Stations', () => {
    expect(nieuwOnderdeel('partijvormen').soort).toBe('samen');
    for (const c of CATEGORIEEN.filter((x) => x !== 'partijvormen')) expect(nieuwOnderdeel(c).soort).toBe('stations');
  });
  it('alle tien spelerscategorieën zijn te kiezen', () => {
    expect([...CATEGORIEEN].sort()).toEqual(['afwerken', 'een-tegen-een', 'loopcoordinatie', 'partijvormen', 'pass-en-trap', 'positiespel', 'spelletjes', 'techniek', 'verdedigen-omschakelen', 'warming-up']);
  });
  it('warming-up aan het begin, partijspel aan het eind, stations ertussen', () => {
    const p = clubPlan(club(3, [onderdeel('warming-up', 'samen', 10), onderdeel('techniek'), onderdeel('afwerken'), onderdeel('een-tegen-een'), onderdeel('partijvormen', 'samen')]));
    expect(p.rondes.map((r) => r.samen?.categorie ?? 'stations')).toEqual(['warming-up', 'stations', 'stations', 'stations', 'partijvormen']);
  });
  it('Samen tussen stations in: twee aparte blokken met stations', () => {
    const p = clubPlan(club(2, [onderdeel('techniek'), onderdeel('afwerken'), onderdeel('spelletjes', 'samen'), onderdeel('loopcoordinatie'), onderdeel('een-tegen-een')]));
    expect(p.fases).toHaveLength(2);
    expect(p.rondes.map((r) => (r.samen ? 'samen' : r.plekken[0]!.vorm))).toEqual(['techniek', 'afwerken', 'samen', 'loopcoordinatie', 'een-tegen-een']);
  });
  it('alles Samen: geen stations, wel rondes en tijd', () => {
    const p = clubPlan(club(4, [onderdeel('warming-up', 'samen', 10), onderdeel('spelletjes', 'samen', 10), onderdeel('partijvormen', 'samen', 20)]));
    expect(p.stations).toEqual([]);
    expect(p.totaal).toBe(40 * 60);
  });
  it('aantal kinderen voor de oefening: groepje, twee groepjes op een partijveld, of iedereen', () => {
    const c = club(3, [], { kinderen: 10 });
    expect(onderdeelSpelers(c, { soort: 'stations', categorie: 'techniek' })).toBe(4);
    expect(onderdeelSpelers(c, { soort: 'samen', categorie: 'partijvormen' })).toBe(8);
    expect(onderdeelSpelers(c, { soort: 'samen', categorie: 'warming-up' })).toBe(10);
  });
  it('partijvelden: 2 groepjes per veld, bij een oneven aantal een joker', () => {
    expect(partijvelden(3).map((v) => v.metTrainer)).toEqual([false, true]);
    expect(partijvelden(6)).toHaveLength(3);
  });
});

describe('oude circuittrainingen', () => {
  const oud = { ...nieuweClub('mini-5-7', 1000, 'c1'), blokken: { techniek: 'veld-mt-tik-tak', partijvormen: 'veld-mt-3-tegen-3' } } as ClubTraining;
  it('worden gelezen als de Mini Talents-opzet', () => {
    const lijst = onderdelenVan(oud);
    expect(lijst.map((o) => [o.categorie, o.duur, o.soort])).toEqual([
      ['techniek', 15, 'stations'],
      ['een-tegen-een', 15, 'stations'],
      ['afwerken', 15, 'stations'],
      ['partijvormen', 15, 'samen'],
    ]);
    expect(lijst[0]!.oefening).toBe('veld-mt-tik-tak');
    expect(lijst[3]!.oefening).toBe('veld-mt-3-tegen-3');
  });
  it('houden hun stationnummers en rotatie', () => {
    const p = clubPlan(oud);
    expect(p.stations.map((s) => [s.nr, s.vorm, s.plek])).toEqual([
      [1, 'techniek', 0],
      [2, 'techniek', 1],
      [3, 'een-tegen-een', 0],
      [4, 'een-tegen-een', 1],
      [5, 'afwerken', 0],
      [6, 'afwerken', 1],
    ]);
    expect(p.rondes.slice(0, 3).map((r) => r.plekken.map((s) => s.nr))).toEqual([
      [1, 3, 5, 2, 4, 6],
      [3, 5, 1, 4, 6, 2],
      [5, 1, 3, 6, 2, 4],
    ]);
    expect(p.totaal).toBe(60 * 60);
  });
  it('oude link (versie 1) opent als Mini Talents', () => {
    const code = base64Oud({ v: 1, n: 'Maandag', d: ['2026-11-09'], l: 'mini-5-7', k: 30, g: 6, t: [], b: ['v:mt-tik-tak', '', '', 'v:mt-3-tegen-3'], s: {}, f: {} });
    const g = uitCode(code)!;
    expect(onderdelenVan(g).map((o) => o.oefening)).toEqual(['veld-mt-tik-tak', undefined, undefined, 'veld-mt-3-tegen-3']);
    expect(clubPlan(g).stations).toHaveLength(6);
  });
  it('oud team-item blijft te lezen', () => {
    const g = leesTeamClub(JSON.stringify({ club: { naam: 'Oud', groepjes: 6, kinderen: 30, blokken: { techniek: 'veld-mt-tik-tak' } }, eigen: [] }))!;
    expect(onderdelenVan(g)[0]!.oefening).toBe('veld-mt-tik-tak');
  });
});

describe('delen, dupliceren en volgende week werken met de nieuwe opzet', () => {
  const lijst = [onderdeel('warming-up', 'samen', 10, 'veld-wu-x'), onderdeel('techniek', 'stations', 12, 'veld-mt-tik-tak'), onderdeel('afwerken', 'stations', 12, 'eigen-a'), onderdeel('partijvormen', 'samen', 20)];
  const c = club(2, lijst, { naam: 'Klein', kinderen: 10, starttijd: '18:30' });
  it('deellink heen en terug, ook begintijd en duur', () => {
    const g = uitCode(naarCode(c))!;
    expect(g).toMatchObject({ naam: 'Klein', groepjes: 2, kinderen: 10, starttijd: '18:30' });
    expect(onderdelenVan(g).map((o) => [o.categorie, o.duur, o.soort, o.oefening])).toEqual(lijst.map((o) => [o.categorie, o.duur, o.soort, o.oefening]));
    expect(clubPlan(g).rondes).toHaveLength(clubPlan(c).rondes.length);
  });
  it('eigen oefening gaat mee als hij erin zit', () => {
    const eigen = { ...vindOefening('veld-mt-tik-tak')!, id: 'eigen-a', eigen: true };
    expect(uitCode(naarCode(c, [eigen]))?.eigen?.map((o) => o.id)).toEqual(['eigen-a']);
  });
  it('team: heen en terug, en een kopie krijgt de nieuwe id van een oefening', () => {
    const g = leesTeamClub(voorTeam(c))!;
    expect(onderdelenVan(g)).toHaveLength(4);
    const k = uitGedeeldeClub(g, new Map([['eigen-a', 'eigen-nieuw']]), 5, 'c2');
    expect(onderdelenVan(k)[2]!.oefening).toBe('eigen-nieuw');
    expect(k.afgevinkt).toEqual([]);
    expect(metOefeningIds(c, (x) => `${x}!`)[1]!.oefening).toBe('veld-mt-tik-tak!');
  });
  it('dupliceren en volgende week houden de onderdelen', () => {
    expect(onderdelenVan(dupliceer(c, 1, 'c3')).map((o) => o.duur)).toEqual([10, 12, 12, 20]);
    const v = naarVolgendeWeek({ ...c, datums: ['2026-11-09'] }, 1, 'c4');
    expect(v.datums).toEqual(['2026-11-16']);
    expect(onderdelenVan(v)).toHaveLength(4);
    expect(v.starttijd).toBe('18:30');
  });
});

describe('sjablonen', () => {
  const lijst = [onderdeel('warming-up', 'samen', 10), onderdeel('techniek', 'stations', 12, 'veld-mt-tik-tak'), onderdeel('afwerken', 'stations', 12), onderdeel('partijvormen', 'samen', 20)];
  const c = club(2, lijst, { naam: 'Klein', kinderen: 10, trainers: ['Testtrainer 1'], leeftijd: 'jo8-11' });
  it('opslaan: de opzet zonder oefeningen, trainers en datums', () => {
    const s = alsSjabloon(c, ' Klein groepje ', 5, 's1');
    expect(s).toMatchObject({ id: 's1', naam: 'Klein groepje', sjabloon: true, groepjes: 2, kinderen: 10, leeftijd: 'jo8-11', trainers: [], datums: [] });
    expect(onderdelenVan(s).map((o) => [o.categorie, o.duur, o.soort, o.oefening])).toEqual(lijst.map((o) => [o.categorie, o.duur, o.soort, undefined]));
  });
  it('nieuwe training uit een sjabloon', () => {
    const t = uitSjabloon(alsSjabloon(c, 'Klein', 5, 's1'), 1762400000000, 'c9');
    expect(t).toMatchObject({ id: 'c9', naam: '', groepjes: 2, kinderen: 10, leeftijd: 'jo8-11' });
    expect(t.sjabloon).toBeUndefined();
    expect(onderdelenVan(t)).toHaveLength(4);
    expect(t.datums).toHaveLength(2);
  });
  it('een sjabloon wordt niet opgeruimd als lege training', () => {
    expect(isLeeg(alsSjabloon(club(6, onderdelenVan({})), 'Mini', 5, 's2'))).toBe(false);
  });
});

describe('leeg opruimen', () => {
  it('standaardopzet zonder iets ingevuld is leeg; een eigen opzet niet', () => {
    expect(isLeeg(nieuweClub())).toBe(true);
    expect(isLeeg({ ...nieuweClub(), onderdelen: zelfOnderdelen() })).toBe(true);
    expect(isLeeg({ ...nieuweClub(), onderdelen: [onderdeel('spelletjes'), onderdeel('techniek'), onderdeel('afwerken')] })).toBe(false);
    expect(isLeeg({ ...nieuweClub(), onderdelen: [onderdeel('techniek', 'stations', 15, 'veld-mt-tik-tak')] })).toBe(false);
  });
});

describe('materiaal klopt met hoe vaak een oefening op het veld staat', () => {
  const o = (id: string, benodigdheden: string[]) => ({ id, naam: id, benodigdheden }) as never;
  const vind = (id: string) => ({ a: o('a', ['4 pionnen']), b: o('b', ['1 goal']), p: o('p', ['2 goals', '4 pionnen']), w: o('w', ['1 bal per kind']) })[id];
  const delen = [onderdeel('techniek', 'stations', 15, 'a'), onderdeel('afwerken', 'stations', 15, 'b'), onderdeel('een-tegen-een'), onderdeel('partijvormen', 'samen', 15, 'p')];
  const pionnen = (c: ClubTraining) => materiaal(c, vind, 'nl').stations.find((r) => /pion/.test(r.tekst))?.tekst;

  it('2 groepjes: 1× op het veld', () => expect(pionnen(club(2, delen))).toBe('4 pionnen'));
  it('3 groepjes: 1× op het veld', () => expect(pionnen(club(3, delen))).toBe('4 pionnen'));
  it('6 groepjes: 2× op het veld', () => expect(pionnen(club(6, delen))).toBe('8 pionnen'));
  it('7 groepjes: 3× op het veld', () => expect(pionnen(club(7, delen))).toBe('12 pionnen'));
  it('partijspel bij 2 groepjes: 1 veld, dus 2 goals, waarvan 1 al bij de stations', () => {
    expect(materiaal(club(2, delen), vind, 'nl').extra.map((r) => r.tekst)).toEqual(['1 goal']);
  });
  it('Samen buiten de partijvormen: één keer, voor alle kinderen', () => {
    const c = club(3, [onderdeel('warming-up', 'samen', 10, 'w'), onderdeel('techniek'), onderdeel('afwerken')], { kinderen: 12 });
    expect(materiaal(c, vind, 'nl').extra.map((r) => r.tekst)).toEqual(['12 voetballen']);
  });
});

describe('oefeningen kiezen en genereren per onderdeel', () => {
  const lijst = [onderdeel('warming-up', 'samen', 10), onderdeel('techniek'), onderdeel('loopcoordinatie'), onderdeel('partijvormen', 'samen')];
  const c = club(2, lijst, { kinderen: 10, leeftijd: 'jo8-11' });
  it('kandidaten horen bij de categorie van het onderdeel', () => {
    const k = onderdeelKandidaten(c, lijst[2]!, OEFENINGEN);
    expect(k.length).toBeGreaterThan(0);
    for (const o of k) expect(o.categorieen).toContain('loopcoordinatie');
  });
  it('alles genereren vult de onderdelen met verschillende oefeningen', () => {
    const uit = genereerAlles(c, { alle: OEFENINGEN, favorieten: new Set(), toeval: () => 0.3 });
    const ids = uit.map((o) => o.oefening);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    uit.forEach((o) => expect(vindOefening(o.oefening!)?.categorieen).toContain(o.categorie));
  });
});

describe('veldplan', () => {
  it('stations in een fase staan binnen het veld en niet over elkaar', () => {
    for (const g of [2, 3, 4, 5, 6, 7, 8]) {
      for (const n of [3, 4, 5, 6]) {
        const p = clubPlan(club(g, CATS.slice(0, n).map((c) => onderdeel(c))));
        for (const f of p.fases) {
          const vakken = f.stations.map((s) => stationVak(s, f));
          for (const [i, a] of vakken.entries()) {
            expect(a.x >= 0 && a.y >= 0 && a.x + a.b <= 100.001 && a.y + a.h <= 100.001).toBe(true);
            for (const b of vakken.slice(i + 1)) expect(a.x + a.b <= b.x + 0.001 || b.x + b.b <= a.x + 0.001 || a.y + a.h <= b.y + 0.001 || b.y + b.h <= a.y + 0.001).toBe(true);
          }
        }
      }
    }
  });
});

describe('rondetimer', () => {
  const rondes = clubPlan(club(2, [onderdeel('techniek', 'stations', 5), onderdeel('afwerken', 'stations', 5), onderdeel('partijvormen', 'samen', 12)])).rondes;
  it('volgt de ingestelde duur', () => {
    expect(timerStand(0, rondes)).toEqual({ ronde: 0, rest: 300, klaar: false });
    expect(timerStand(299.5, rondes)).toEqual({ ronde: 0, rest: 1, klaar: false });
    expect(timerStand(300, rondes)).toEqual({ ronde: 1, rest: 300, klaar: false });
    expect(timerStand(600, rondes)).toEqual({ ronde: 2, rest: 720, klaar: false });
    expect(timerStand(1320, rondes)).toEqual({ ronde: 2, rest: 0, klaar: true });
    expect(timerStand(-5, rondes).rest).toBe(300);
  });
});
