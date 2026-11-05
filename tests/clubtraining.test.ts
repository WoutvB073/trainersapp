import { describe, expect, it } from 'vitest';
import { OEFENINGEN, vindOefening } from '../src/data/oefeningen';
import {
  blokKandidaten,
  BLOK_DUUR,
  BLOKKEN,
  dupliceer,
  genereerAlles,
  genereerBlok,
  groepGrootte,
  isLeeg,
  materiaal,
  naarCode,
  naarVolgendeWeek,
  nieuweClub,
  partijvelden,
  rotatie,
  standaardDatums,
  stationNaam,
  stations,
  stationsPerVorm,
  stationTrainer,
  stationVak,
  timerStand,
  uitCode,
  veldTrainer,
  veldVak,
  VORMEN,
  type ClubTraining,
} from '../src/clubtraining/clubtraining';
import { apparaatLijst, LijstStore } from '../src/wedstrijd/opslag';
import type { Oefening } from '../src/model/types';

const club = (w: Partial<ClubTraining> = {}): ClubTraining => ({ ...nieuweClub('mini-5-7', 1000, 'c1'), ...w });
const GROEPJES = [3, 4, 5, 6, 7, 8];

describe('rotatieschema', () => {
  it.each(GROEPJES)('%i groepjes: elk groepje doet elke vorm precies één keer', (n) => {
    const r = rotatie(n);
    expect(r).toHaveLength(3);
    for (let g = 0; g < n; g++) expect(r.map((ronde) => ronde[g]!.vorm).sort()).toEqual([...VORMEN].sort());
  });
  it.each(GROEPJES)('%i groepjes: nooit twee groepjes tegelijk op een station', (n) => {
    for (const ronde of rotatie(n)) {
      expect(ronde).toHaveLength(n);
      expect(new Set(ronde.map((s) => s.nr)).size).toBe(n);
    }
  });
  it('aantal stations: gelijk bij 3 en 6, anders zoveel als nodig', () => {
    expect(GROEPJES.map((n) => stations(n).length)).toEqual([3, 6, 6, 6, 9, 9]);
    expect(stations(6).map((s) => s.vorm)).toEqual(['techniek', 'techniek', 'een-tegen-een', 'een-tegen-een', 'afwerken', 'afwerken']);
    expect(stations(6).map((s) => s.nr)).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('bij 6 groepjes zijn alle stations elke ronde bezet', () => {
    for (const ronde of rotatie(6)) expect(ronde.map((s) => s.nr).sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('stationnamen: met nummer alleen als een vorm vaker staat', () => {
    expect(stationNaam(stations(6)[1]!, 6)).toBe('Techniek 2');
    expect(stationNaam(stations(3)[1]!, 3)).toBe('1 tegen 1');
  });
});

describe('partijvelden', () => {
  it.each(GROEPJES)('%i groepjes: elk groepje op precies één veld', (n) => {
    const v = partijvelden(n);
    expect(v.flatMap((x) => x.groepen).sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, i) => i));
    expect(v).toHaveLength(Math.ceil(n / 2));
  });
  it('oneven: het laatste veld heeft één groepje met de trainer', () => {
    expect(partijvelden(6).some((v) => v.metTrainer)).toBe(false);
    const v = partijvelden(5);
    expect(v.at(-1)).toMatchObject({ groepen: [4], metTrainer: true });
  });
});

describe('veldplan', () => {
  it.each(GROEPJES)('%i groepjes: vakken binnen het halve veld, niet over elkaar', (n) => {
    const vakken = stations(n).map((s) => stationVak(s, n));
    const velden = partijvelden(n).map((v) => veldVak(v, partijvelden(n).length));
    for (const lijst of [vakken, velden]) {
      for (const [i, a] of lijst.entries()) {
        expect(a.x >= 0 && a.y >= 0 && a.x + a.b <= 100.001 && a.y + a.h <= 100.001).toBe(true);
        for (const b of lijst.slice(i + 1)) expect(a.x + a.b <= b.x + 0.001 || b.x + b.b <= a.x + 0.001 || a.y + a.h <= b.y + 0.001 || b.y + b.h <= a.y + 0.001).toBe(true);
      }
    }
  });
});

describe('materiaal', () => {
  const oef = (id: string, benodigdheden: string[]) => ({ id, naam: id, benodigdheden }) as Oefening;
  const lijst: Record<string, Oefening> = {
    t: oef('t', ['4 hoedjes', '1 voetbal per kind']),
    d: oef('d', ['8 hoedjes voor de poortjes', 'Hesjes']),
    a: oef('a', ['2 hoepels']),
    p: oef('p', ['2 mini-goaltjes', '4 hoedjes', 'Hesjes']),
  };
  const vind = (id: string) => lijst[id];
  const c = club({ blokken: { techniek: 't', 'een-tegen-een': 'd', afwerken: 'a', partijvormen: 'p' } });

  it('materiaal per station × aantal keer uitgezet, opgeteld', () => {
    const m = materiaal(c, vind, 'nl');
    const teksten = m.stations.map((r) => r.tekst);
    expect(teksten).toContain('24 hoedjes'); // (4 + 8) × 2 stations
    expect(teksten).toContain('10 voetballen'); // 5 kinderen × 2 stations
    expect(teksten).toContain('4 hoepels');
    expect(teksten).toContain('Hesjes');
  });
  it('partijvelden: alleen wat er extra nodig is', () => {
    const m = materiaal(c, vind, 'nl');
    // 3 velden: 6 goaltjes zijn nieuw; 12 hoedjes en de hesjes staan er al.
    expect(m.extra.map((r) => r.tekst)).toEqual(['6 mini-goaltjes']);
    const meer = materiaal({ ...c, blokken: { techniek: 'a', partijvormen: 'p' } }, vind, 'nl');
    expect(meer.extra.map((r) => r.tekst).sort()).toEqual(['12 hoedjes', '6 mini-goaltjes', 'Hesjes'].sort());
  });
  it('meer hoedjes op de partijvelden dan bij de stations: alleen het verschil', () => {
    const m = materiaal({ ...c, blokken: { afwerken: 't', partijvormen: 'p' } }, vind, 'nl');
    expect(m.extra.map((r) => r.tekst)).toContain('4 hoedjes'); // 12 nodig, 8 staan er
  });
  it('rekent met het aantal stations bij een ander aantal groepjes', () => {
    expect(materiaal({ ...c, groepjes: 3, kinderen: 15 }, vind, 'nl').stations.map((r) => r.tekst)).toContain('12 hoedjes');
    expect(materiaal({ ...c, groepjes: 8 }, vind, 'nl').stations.map((r) => r.tekst)).toContain('36 hoedjes');
  });
  it('werkt met echte oefeningen, ook in het Engels; sleutels zijn uniek', () => {
    const echt = club({ blokken: { techniek: 'veld-mt-brandweer', 'een-tegen-een': 'veld-mt-hoepelkasteel', afwerken: 'veld-mt-hoekenjacht', partijvormen: 'veld-mt-3-tegen-3' } });
    const m = materiaal(echt, vindOefening, 'nl');
    expect(m.stations.length).toBeGreaterThan(3);
    const k = [...m.stations, ...m.extra].map((r) => r.sleutel);
    expect(new Set(k).size).toBe(k.length);
    expect(m.stations.map((r) => r.tekst)).toContain('14 hoepels'); // 5 × 2 + 2 × 2
  });
});

describe('oefeningen kiezen en genereren', () => {
  const bron = { alle: OEFENINGEN, favorieten: new Set<string>(), toeval: () => 0.5 };
  it('kandidaten passen bij leeftijd, categorie en aantal', () => {
    const lijst = blokKandidaten(club(), 'afwerken', OEFENINGEN);
    expect(lijst.length).toBeGreaterThan(10);
    for (const o of lijst) {
      expect(o.categorieen).toContain('afwerken');
      expect(o.leeftijden).toContain('mini-5-7');
      expect(o.spelersNodig).toBeLessThanOrEqual(5);
    }
  });
  it('alles genereren vult de 4 blokken met verschillende oefeningen', () => {
    const b = genereerAlles(club(), bron);
    expect(Object.keys(b).sort()).toEqual([...BLOKKEN].sort());
    expect(new Set(Object.values(b)).size).toBe(4);
  });
  it('opnieuw genereren geeft een andere oefening', () => {
    const c = club({ blokken: genereerAlles(club(), bron) });
    expect(genereerBlok(c, 'techniek', bron)).not.toBe(c.blokken.techniek);
  });
});

describe('deellink', () => {
  const c = club({ naam: 'Maandag', trainers: ['Testtrainer 1', 'Testtrainer 2'], blokken: { techniek: 'veld-mt-tik-tak', partijvormen: 'veld-mt-3-tegen-3' }, stationTrainers: { 2: 'Testtrainer 1' }, groepjes: 5 });
  it('heen en terug', () => {
    const g = uitCode(naarCode(c))!;
    expect(g).toMatchObject({ naam: 'Maandag', leeftijd: 'mini-5-7', kinderen: 30, groepjes: 5, trainers: ['Testtrainer 1', 'Testtrainer 2'], stationTrainers: { 2: 'Testtrainer 1' }, datums: c.datums });
    expect(g.blokken).toEqual(c.blokken);
  });
  it('eigen oefening gaat mee', () => {
    const eigen = { ...vindOefening('veld-mt-tik-tak')!, id: 'eigen-x', eigen: true };
    const g = uitCode(naarCode({ ...c, blokken: { techniek: 'eigen-x' } }, [eigen]))!;
    expect(g.eigen?.map((o) => o.id)).toEqual(['eigen-x']);
    expect(g.blokken.techniek).toBe('eigen-x');
  });
  it('kapotte of andere code', () => {
    expect(uitCode('onzin')).toBeNull();
    expect(uitCode('')).toBeNull();
  });
  it('aantal groepjes blijft binnen de grenzen', () => {
    expect(uitCode(naarCode({ ...c, groepjes: 40 }))!.groepjes).toBe(8);
  });
});

describe('trainers', () => {
  it('om en om verdeeld, zelf kiezen gaat voor, weggehaalde naam telt niet', () => {
    const c = club({ trainers: ['Testtrainer 1', 'Testtrainer 2'] });
    expect([1, 2, 3].map((nr) => stationTrainer(c, nr))).toEqual(['Testtrainer 1', 'Testtrainer 2', 'Testtrainer 1']);
    expect(stationTrainer({ ...c, stationTrainers: { 1: 'Testtrainer 2' } }, 1)).toBe('Testtrainer 2');
    expect(stationTrainer({ ...c, stationTrainers: { 1: 'Weg' } }, 1)).toBe('Testtrainer 1');
    expect(stationTrainer({ ...c, stationTrainers: { 1: '' } }, 1)).toBeUndefined();
    expect(veldTrainer(c, 2)).toBe('Testtrainer 2');
    expect(stationTrainer(club(), 1)).toBeUndefined();
  });
});

describe('opslaan en dupliceren', () => {
  const opslag = () => {
    const data = new Map<string, string>();
    return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
  };
  it('standaard: 30 kinderen, 6 groepjes, maandag en woensdag van dezelfde week', () => {
    const c = nieuweClub();
    expect(c).toMatchObject({ kinderen: 30, groepjes: 6, leeftijd: 'mini-5-7' });
    // Woensdag 4 november 2026: de eerstvolgende maandag is 9 november.
    expect(standaardDatums(new Date(2026, 10, 4))).toEqual(['2026-11-09', '2026-11-11']);
    expect(standaardDatums(new Date(2026, 10, 9))).toEqual(['2026-11-09', '2026-11-11']);
    expect(standaardDatums(new Date(2026, 10, 8))).toEqual(['2026-11-09', '2026-11-11']);
  });
  it('blijft bewaard', () => {
    const plek = opslag();
    const store = new LijstStore<ClubTraining>(apparaatLijst(plek, 'k'));
    store.bewaar(club({ naam: 'Maandag', afgevinkt: ['1:hoedje'] }));
    expect(new LijstStore<ClubTraining>(apparaatLijst(plek, 'k')).haal('c1')).toMatchObject({ naam: 'Maandag', afgevinkt: ['1:hoedje'] });
  });
  it('leeg: niets ingevuld, standaarddatums tellen niet', () => {
    expect(isLeeg(club())).toBe(true);
    expect(isLeeg(club({ naam: 'x' }))).toBe(false);
    expect(isLeeg(club({ trainers: ['Testtrainer 1'] }))).toBe(false);
    expect(isLeeg(club({ blokken: { techniek: 'veld-mt-tik-tak' } }))).toBe(false);
  });
  it('dupliceren: nieuw id, afvinklijst leeg', () => {
    const k = dupliceer(club({ naam: 'Maandag', afgevinkt: ['1:hoedje'] }), 2000, 'c2');
    expect(k).toMatchObject({ id: 'c2', naam: 'Maandag (kopie)', afgevinkt: [] });
  });
  it('naar volgende week: datums + 7 dagen, ook over de maandgrens', () => {
    const k = naarVolgendeWeek(club({ naam: 'Maandag', datums: ['2026-11-30', '2026-12-02'], afgevinkt: ['1:hoedje'] }), 2000, 'c3');
    expect(k).toMatchObject({ id: 'c3', naam: 'Maandag', datums: ['2026-12-07', '2026-12-09'], afgevinkt: [] });
  });
  it('groepsgrootte naar boven afgerond', () => {
    expect(groepGrootte({ kinderen: 30, groepjes: 6 })).toBe(5);
    expect(groepGrootte({ kinderen: 31, groepjes: 6 })).toBe(6);
  });
  it('stations per vorm', () => {
    expect([3, 4, 6, 7, 8].map(stationsPerVorm)).toEqual([1, 2, 2, 3, 3]);
  });
});

describe('kwartiertimer', () => {
  it('blok en resterende tijd', () => {
    expect(timerStand(0)).toEqual({ blok: 0, rest: BLOK_DUUR, klaar: false });
    expect(timerStand(BLOK_DUUR - 1)).toMatchObject({ blok: 0, rest: 1 });
    expect(timerStand(BLOK_DUUR)).toMatchObject({ blok: 1, rest: BLOK_DUUR });
    expect(timerStand(3 * BLOK_DUUR + 10)).toMatchObject({ blok: 3, rest: BLOK_DUUR - 10 });
    expect(timerStand(4 * BLOK_DUUR)).toMatchObject({ klaar: true, rest: 0 });
  });
});
