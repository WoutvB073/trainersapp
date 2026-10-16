import { describe, expect, it } from 'vitest';
import { aantalActief, bewaarAantallen, filterOefeningen, GEEN_FILTERS, leesAantallen, pastBijFilters, type Filters } from '../src/engine/filters';
import { apparaatFavorieten, FavorietenStore } from '../src/engine/favorieten';
import { bewaarKeuze, contrast, leesKeuze, THEMAS, themaVariabelen } from '../src/engine/thema';
import { OEFENINGEN } from '../src/data/oefeningen';
import type { Oefening } from '../src/model/types';

const geheugen = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
};
const oef = (id: string, extra: Partial<Oefening> = {}): Oefening =>
  ({ id, soort: 'veld', naam: id, categorieen: ['afwerken'], uitleg: '', benodigdheden: [], spelersNodig: 4, keepersNodig: 0, doorwisselbaar: true, coachpunten: [], variaties: { makkelijker: [], moeilijker: [] }, tekening: { veld: { type: 'leeg' }, objecten: [] }, ...extra }) as Oefening;
const f = (w: Partial<Filters>): Filters => ({ ...GEEN_FILTERS, ...w });

describe('filters', () => {
  const lijst = [
    oef('a', { naam: 'Pass in de loop', spelersNodig: 2 }),
    oef('b', { naam: 'Rondo 4 tegen 2', spelersNodig: 6, combinatievorm: true, onderdelen: ['x', 'y'] }),
    oef('c', { naam: 'Afwerken met keeper', spelersNodig: 3, keepersNodig: 1 }),
    oef('eigen-d', { naam: 'Mijn coördinatieparcours', spelersNodig: 1, eigen: true }),
  ];
  const ids = (l: Oefening[]) => l.map((o) => o.id);

  it('zonder filters: alles', () => {
    expect(ids(filterOefeningen(lijst, GEEN_FILTERS, new Set()))).toEqual(['a', 'b', 'c', 'eigen-d']);
    expect(aantalActief(GEEN_FILTERS)).toBe(0);
  });

  it('aantallen: alleen wat past (minder nodig is prima)', () => {
    expect(ids(filterOefeningen(lijst, f({ aantallen: { spelers: 3, keepers: 0 } }), new Set()))).toEqual(['a', 'eigen-d']);
    expect(ids(filterOefeningen(lijst, f({ aantallen: { spelers: 6, keepers: 1 } }), new Set()))).toEqual(['a', 'b', 'c', 'eigen-d']);
  });

  it('favorieten, combinatievormen, eigen, zoeken (zonder hoofdletters en accenten, alle woorden)', () => {
    expect(ids(filterOefeningen(lijst, f({ favorieten: true }), new Set(['c', 'b'])))).toEqual(['b', 'c']);
    expect(ids(filterOefeningen(lijst, f({ combi: true }), new Set()))).toEqual(['b']);
    expect(ids(filterOefeningen(lijst, f({ eigen: true }), new Set()))).toEqual(['eigen-d']);
    expect(ids(filterOefeningen(lijst, f({ zoek: 'COORDINATIE' }), new Set()))).toEqual(['eigen-d']);
    expect(ids(filterOefeningen(lijst, f({ zoek: ' pass loop ' }), new Set()))).toEqual(['a']);
    expect(ids(filterOefeningen(lijst, f({ zoek: 'xyz' }), new Set()))).toEqual([]);
  });

  it('combinaties van filters', () => {
    const favs = new Set(['a', 'b', 'eigen-d']);
    expect(ids(filterOefeningen(lijst, f({ favorieten: true, aantallen: { spelers: 4, keepers: 0 } }), favs))).toEqual(['a', 'eigen-d']);
    expect(ids(filterOefeningen(lijst, f({ favorieten: true, combi: true, aantallen: { spelers: 4, keepers: 0 } }), favs))).toEqual([]);
    expect(ids(filterOefeningen(lijst, f({ favorieten: true, eigen: true, zoek: 'parcours' }), favs))).toEqual(['eigen-d']);
    expect(aantalActief(f({ favorieten: true, eigen: true, zoek: 'x', aantallen: { spelers: 1, keepers: 0 } }))).toBe(4);
    expect(aantalActief(f({ aantallen: { spelers: 1, keepers: 0 } }), false)).toBe(0);
  });

  it('werkt op de echte oefeningen: aantallen zoals bij Training maken', () => {
    const met = filterOefeningen(OEFENINGEN, f({ aantallen: { spelers: 4, keepers: 0 } }), new Set());
    expect(met.length).toBeGreaterThan(20);
    expect(met.every((o) => o.spelersNodig <= 4 && o.keepersNodig === 0)).toBe(true);
    expect(filterOefeningen(OEFENINGEN, f({ combi: true }), new Set()).every((o) => o.combinatievorm)).toBe(true);
    expect(pastBijFilters(OEFENINGEN[0]!, f({ zoek: OEFENINGEN[0]!.naam.slice(0, 5) }), new Set())).toBe(true);
  });

  it('aantallen worden onthouden op het apparaat', () => {
    const plek = geheugen();
    expect(leesAantallen(plek)).toBeNull();
    bewaarAantallen({ spelers: 9, keepers: 2 }, plek);
    expect(leesAantallen(plek)).toEqual({ spelers: 9, keepers: 2 });
    bewaarAantallen(null, plek);
    expect(leesAantallen(plek)).toBeNull();
    plek.setItem('trainersapp.filterAantallen', '{kapot');
    expect(leesAantallen(plek)).toBeNull();
  });
});

describe('favorieten', () => {
  it('aan en uit, bewaard op het apparaat, kapotte opslag = leeg', () => {
    const plek = geheugen();
    const store = new FavorietenStore(apparaatFavorieten(plek));
    expect(store.wissel('veld-pt-derde-man')).toBe(true);
    expect(store.wissel('eigen-x')).toBe(true);
    expect(store.wissel('veld-pt-derde-man')).toBe(false);
    const weer = new FavorietenStore(apparaatFavorieten(plek));
    expect([...weer.alle()]).toEqual(['eigen-x']);
    expect(weer.is('eigen-x')).toBe(true);
    plek.setItem('trainersapp.favorieten', 'onzin');
    expect([...new FavorietenStore(apparaatFavorieten(plek)).alle()]).toEqual([]);
  });

  it('elke wijziging geeft een nieuwe verzameling (voor React)', () => {
    const store = new FavorietenStore(apparaatFavorieten(geheugen()));
    const voor = store.alle();
    store.wissel('a');
    expect(store.alle()).not.toBe(voor);
  });
});

describe('thema (clubkleuren)', () => {
  it('8 thema’s, elk in licht en donker, met voldoende contrast', () => {
    expect(THEMAS).toHaveLength(8);
    const regels: [string, string, number][] = [
      ['--op-primair', '--primair', 4.5],
      ['--primair-tekst', '--kaart', 4.5],
      ['--primair-tekst', '--achtergrond', 4.5],
      ['--primair-donker', '--primair-licht', 4.5],
      ['--op-accent', '--accent', 4.5],
      ['--tekst', '--kaart', 7],
      ['--tekst-2', '--kaart', 4.5],
      ['--tekst-2', '--achtergrond', 4.5],
      ['--moeilijker', '--moeilijker-licht', 4.5],
      ['--makkelijker', '--makkelijker-licht', 4.5],
      ['--combi', '--combi-licht', 4.5],
      ['--op-makkelijker', '--makkelijker', 4.5],
      ['--op-moeilijker', '--moeilijker', 4.5],
      ['--op-combi', '--combi', 4.5],
      ['--eigen', '--eigen-licht', 4.5],
      ['--waarschuwing', '--waarschuwing-licht', 4.5],
      ['--fout', '--fout-licht', 4.5],
    ];
    for (const t of THEMAS)
      for (const donker of [false, true]) {
        const v = themaVariabelen(t.id, donker);
        for (const [a, b, min] of regels) expect(contrast(v[a]!, v[b]!), `${t.id} ${donker ? 'donker' : 'licht'}: ${a} op ${b}`).toBeGreaterThanOrEqual(min);
      }
  });

  it('het thema verandert geen veld- of teamkleuren', () => {
    for (const t of THEMAS) for (const naam of Object.keys(themaVariabelen(t.id, false))) expect(naam).not.toMatch(/gras|team|keeper|trainer|joker|spoor|veldlijn|rugnummer/);
  });

  it('keuze onthouden; onbekende of kapotte waarden = standaard licht', () => {
    const plek = geheugen();
    expect(leesKeuze(plek)).toEqual({ thema: 'standaard', modus: 'licht' });
    bewaarKeuze({ thema: 'zwart', modus: 'auto' }, plek);
    expect(leesKeuze(plek)).toEqual({ thema: 'zwart', modus: 'auto' });
    plek.setItem('trainersapp.thema', JSON.stringify({ thema: 'roze', modus: 'paars' }));
    expect(leesKeuze(plek)).toEqual({ thema: 'standaard', modus: 'licht' });
  });
});
