import { describe, expect, it } from 'vitest';
import { OEFENINGEN } from '../src/data/oefeningen';
import { apparaatBackend, TrainingStore } from '../src/training/opslag';
import { benodigdheden, dupliceer, kiesbaar, naarCode, nieuweTraining, pastBij, trainingNaam, uitCode, verplaats, type Training } from '../src/training/training';
import type { Oefening } from '../src/model/types';

const oef = (id: string, extra: Partial<Oefening> = {}): Oefening =>
  ({ id, soort: 'veld', naam: id, categorieen: ['afwerken'], uitleg: '', benodigdheden: [], spelersNodig: 2, keepersNodig: 0, coachpunten: [], variaties: { makkelijker: [], moeilijker: [] }, tekening: { veld: { type: 'leeg' }, objecten: [] }, ...extra }) as Oefening;

describe('filter op aantallen', () => {
  it('minder nodig is prima, meer nodig valt af', () => {
    expect(pastBij({ spelersNodig: 4, keepersNodig: 1 }, 4, 1)).toBe(true);
    expect(pastBij({ spelersNodig: 4, keepersNodig: 1 }, 6, 2)).toBe(true);
    expect(pastBij({ spelersNodig: 4, keepersNodig: 1 }, 3, 1)).toBe(false);
    expect(pastBij({ spelersNodig: 4, keepersNodig: 1 }, 8, 0)).toBe(false);
  });

  it('0 spelers: alleen keeperoefeningen; 0 keepers: geen oefening met "Keeper nodig"', () => {
    expect(kiesbaar(OEFENINGEN, 'veld', undefined, 0, 2)).toHaveLength(0);
    expect(kiesbaar(OEFENINGEN, 'keeper', undefined, 0, 2).length).toBeGreaterThan(20);
    const zonderKeeper = kiesbaar(OEFENINGEN, 'veld', undefined, 20, 0);
    expect(zonderKeeper.length).toBeGreaterThan(30);
    expect(zonderKeeper.every((o) => o.keepersNodig === 0)).toBe(true);
    expect(kiesbaar(OEFENINGEN, 'keeper', undefined, 20, 0)).toHaveLength(0);
  });

  it('per categorie en precies volgens de aantallen', () => {
    const lijst = [oef('a', { spelersNodig: 1 }), oef('b', { spelersNodig: 6 }), oef('c', { categorieen: ['techniek'] }), oef('d', { keepersNodig: 1 })];
    expect(kiesbaar(lijst, 'veld', 'afwerken', 4, 0).map((o) => o.id)).toEqual(['a']);
    expect(kiesbaar(lijst, 'veld', 'afwerken', 6, 1).map((o) => o.id)).toEqual(['a', 'b', 'd']);
    expect(kiesbaar(lijst, 'veld', undefined, 2, 0).map((o) => o.id)).toEqual(['a', 'c']);
  });
});

describe('slepen', () => {
  it('verplaatst één oefening en laat de rest in volgorde', () => {
    expect(verplaats(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(verplaats(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(verplaats(['a', 'b'], 1, 1)).toEqual(['a', 'b']);
    expect(verplaats(['a', 'b'], 5, 0)).toEqual(['a', 'b']);
  });
});

describe('opslaan, dupliceren en verwijderen', () => {
  const geheugen = () => {
    const data = new Map<string, string>();
    return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
  };

  it('bewaart op het apparaat en laadt het terug in een nieuwe sessie', () => {
    const plek = geheugen();
    const store = new TrainingStore(apparaatBackend(plek));
    const t: Training = { ...nieuweTraining(1, 'x1'), naam: 'Dinsdag', oefeningen: ['veld-pt-derde-man'] };
    store.bewaar(t, 5);
    const weer = new TrainingStore(apparaatBackend(plek));
    expect(weer.lijst()).toHaveLength(1);
    expect(weer.haal('x1')?.naam).toBe('Dinsdag');
    expect(weer.haal('x1')?.gewijzigd).toBe(5);
  });

  it('dupliceren maakt een losse kopie; verwijderen haalt alleen die weg', () => {
    const store = new TrainingStore(apparaatBackend(geheugen()));
    store.bewaar({ ...nieuweTraining(1, 'x1'), naam: 'Dinsdag', oefeningen: ['a', 'b'] });
    const kopie = store.dupliceer('x1')!;
    expect(kopie.id).not.toBe('x1');
    expect(kopie.naam).toBe('Dinsdag (kopie)');
    kopie.oefeningen.push('c');
    expect(store.haal('x1')?.oefeningen).toEqual(['a', 'b']);
    store.verwijder('x1');
    expect(store.lijst().map((t) => t.id)).toEqual([kopie.id]);
  });

  it('kapotte opslag geeft een lege lijst (de app blijft werken)', () => {
    const plek = geheugen();
    plek.setItem('trainersapp.trainingen', '{kapot');
    expect(new TrainingStore(apparaatBackend(plek)).lijst()).toEqual([]);
    expect(new TrainingStore(apparaatBackend(undefined)).lijst()).toEqual([]);
  });

  it('naam: eigen naam, anders datum, anders "zonder naam"', () => {
    expect(trainingNaam({ naam: ' Dinsdag ', datum: '2026-10-20' })).toBe('Dinsdag');
    expect(trainingNaam({ naam: '', datum: '2026-10-20' })).toBe('Training 20 okt 2026');
    expect(trainingNaam({ naam: '' })).toBe('Training zonder naam');
    expect(dupliceer({ ...nieuweTraining(1, 'a'), naam: '' }).naam).toBe('Training zonder naam (kopie)');
  });
});

describe('delen via een link', () => {
  it('code heen en terug geeft dezelfde training (ook met leestekens)', () => {
    const t = { naam: 'Woensdag – JO11 "afwerken" ëü', datum: '2026-10-21', spelers: 11, keepers: 2, oefeningen: ['veld-cv-overlap-voorzet', 'keeper-cv-hoog-dan-laag'] };
    const code = naarCode(t);
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(uitCode(code)).toEqual(t);
  });

  it('een kapotte of vreemde code geeft null of veilige waarden', () => {
    expect(uitCode('bestaat-niet')).toBeNull();
    expect(uitCode('')).toBeNull();
    const raar = btoa(JSON.stringify({ v: 1, n: 5, s: 999, k: -3, o: ['v:a', 7], d: 'gisteren' })).replace(/=+$/, '');
    expect(uitCode(raar)).toEqual({ naam: '', datum: undefined, spelers: 40, keepers: 0, oefeningen: ['veld-a'] });
  });

  it('importeren bewaart de gedeelde training als eigen training', () => {
    const store = new TrainingStore(apparaatBackend(undefined));
    const g = uitCode(naarCode({ naam: 'Gedeeld', spelers: 8, keepers: 1, oefeningen: ['veld-pt-derde-man'] }))!;
    const t = store.importeer(g, 9);
    expect(store.lijst()).toHaveLength(1);
    expect(t).toMatchObject({ naam: 'Gedeeld', spelers: 8, keepers: 1, oefeningen: ['veld-pt-derde-man'], gemaakt: 9 });
  });
});

describe('benodigdheden voor de hele training', () => {
  it('per soort materiaal het grootste aantal, meervoud en enkelvoud samen', () => {
    const lijst = benodigdheden([
      oef('a', { naam: 'A', benodigdheden: ['4 pionnen', 'Ballen', '1 goal'] }),
      oef('b', { naam: 'B', benodigdheden: ['6 pionnen', '3–5 ballen', '2 kleine doeltjes', 'Hesjes', '8+ ballen'] }),
      oef('c', { naam: 'C', benodigdheden: ['1 pion', 'Goal (of 2 paaltjes)', '1 klein doeltje'] }),
    ]);
    const tekst = lijst.map((b) => b.tekst);
    expect(tekst).toContain('6 pionnen');
    expect(tekst).toContain('8 ballen');
    expect(tekst).toContain('1 goal');
    expect(tekst).toContain('2 kleine doeltjes');
    expect(tekst).toContain('Hesjes');
    expect(lijst.find((b) => b.tekst === '6 pionnen')?.oefeningen).toEqual(['A', 'B', 'C']);
    expect(lijst.find((b) => b.tekst === '1 goal')?.oefeningen).toEqual(['A', 'C']);
  });

  it('werkt voor alle echte oefeningen (geen lege of dubbele regels)', () => {
    const lijst = benodigdheden(OEFENINGEN);
    expect(lijst.length).toBeGreaterThan(10);
    expect(new Set(lijst.map((b) => b.tekst)).size).toBe(lijst.length);
    for (const b of lijst) expect(b.tekst.trim().length).toBeGreaterThan(1);
  });
});
