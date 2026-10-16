import { describe, expect, it } from 'vitest';
import { CODE_TEKENS, isGeldigeCode, nieuweCode, normaliseerCode, nieuwste, verzoen, verzoenSet } from '../src/online/samenvoegen';

const it_ = (id: string, gewijzigd: number, naam = id) => ({ id, gewijzigd, naam });
const bekendVan = (...items: { id: string }[]) => Object.fromEntries(items.map((x) => [x.id, JSON.stringify(x)]));
const ids = (l: { id: string }[]) => l.map((x) => x.id).sort();

describe('synchroniseren: verzoen', () => {
  it('eerste keer (niets bekend): alles samen, niets kwijt; zelfde id: de nieuwste wint', () => {
    const lokaal = [it_('a', 1), it_('b', 5, 'B lokaal')];
    const online = [it_('b', 3, 'B online'), it_('c', 2)];
    const v = verzoen(lokaal, {}, online);
    expect(ids(v.lokaal)).toEqual(['a', 'b', 'c']);
    expect(v.lokaal.find((x) => x.id === 'b')?.naam).toBe('B lokaal');
    expect(ids(v.schrijf)).toEqual(['a', 'b']);
    expect(v.verwijder).toEqual([]);
  });

  it('alleen lokaal veranderd → online bijwerken; alleen online veranderd → lokaal bijwerken', () => {
    const oud = it_('a', 1, 'oud');
    const b = bekendVan(oud, it_('x', 1));
    const lokaalNieuw = verzoen([it_('a', 2, 'lokaal'), it_('x', 1)], b, [oud, it_('x', 1)]);
    expect(lokaalNieuw.schrijf.map((x) => x.naam)).toEqual(['lokaal']);
    expect(lokaalNieuw.lokaalVeranderd).toBe(false);
    const onlineNieuw = verzoen([oud, it_('x', 1)], b, [it_('a', 2, 'online'), it_('x', 1)]);
    expect(onlineNieuw.schrijf).toEqual([]);
    expect(onlineNieuw.lokaal.find((x) => x.id === 'a')?.naam).toBe('online');
    expect(onlineNieuw.lokaalVeranderd).toBe(true);
  });

  it('allebei veranderd (bv. offline op twee toestellen): de nieuwste wint', () => {
    const b = bekendVan(it_('a', 1, 'oud'));
    const v = verzoen([it_('a', 5, 'telefoon')], b, [it_('a', 7, 'laptop')]);
    expect(v.lokaal[0]!.naam).toBe('laptop');
    expect(v.schrijf).toEqual([]);
    const w = verzoen([it_('a', 9, 'telefoon')], b, [it_('a', 7, 'laptop')]);
    expect(w.schrijf[0]!.naam).toBe('telefoon');
  });

  it('verwijderen: aan één kant weg en aan de andere kant niet veranderd → overal weg', () => {
    const a = it_('a', 1);
    const b = bekendVan(a);
    // Lokaal verwijderd (offline), online nog oud → online verwijderen.
    const lokaalWeg = verzoen([], b, [a]);
    expect(lokaalWeg.verwijder).toEqual(['a']);
    expect(lokaalWeg.lokaal).toEqual([]);
    // Online verwijderd (ander toestel), lokaal oud → lokaal weg.
    const onlineWeg = verzoen([a], b, []);
    expect(onlineWeg.lokaal).toEqual([]);
    expect(onlineWeg.lokaalVeranderd).toBe(true);
    expect(onlineWeg.schrijf).toEqual([]);
  });

  it('verwijderd aan de ene kant, intussen veranderd aan de andere: niets kwijt', () => {
    const b = bekendVan(it_('a', 1, 'oud'));
    const v = verzoen([it_('a', 3, 'aangepast')], b, []);
    expect(v.lokaal[0]!.naam).toBe('aangepast');
    expect(v.schrijf[0]!.naam).toBe('aangepast');
    const w = verzoen([], b, [it_('a', 3, 'online aangepast')]);
    expect(w.lokaal[0]!.naam).toBe('online aangepast');
    expect(w.verwijder).toEqual([]);
  });

  it('niets veranderd: niets te doen; bekend klopt daarna', () => {
    const l = [it_('a', 1), it_('b', 2)];
    const v = verzoen(l, bekendVan(...l), l);
    expect(v.schrijf).toEqual([]);
    expect(v.verwijder).toEqual([]);
    expect(v.lokaalVeranderd).toBe(false);
    expect(v.bekend).toEqual(bekendVan(...l));
    // Lokale volgorde blijft; nieuwe online items vooraan.
    const w = verzoen(l, bekendVan(...l), [...l, it_('c', 9)]);
    expect(w.lokaal.map((x) => x.id)).toEqual(['c', 'a', 'b']);
  });
});

describe('synchroniseren: favorieten (verzameling)', () => {
  it('toevoegen en weghalen aan beide kanten', () => {
    // Lokaal x toegevoegd en y weggehaald; online z toegevoegd.
    const v = verzoenSet(['a', 'x'], ['a', 'y'], ['a', 'y', 'z']);
    expect([...v.lokaal].sort()).toEqual(['a', 'x', 'z']);
    expect(v.lokaalVeranderd).toBe(true);
    expect(v.onlineVeranderd).toBe(true);
    // Eerste keer (niets bekend): alles samen.
    expect([...verzoenSet(['a', 'b'], [], ['b', 'c']).lokaal].sort()).toEqual(['a', 'b', 'c']);
    // Gelijk: niets te doen.
    const w = verzoenSet(['a'], ['a'], ['a']);
    expect(w.lokaalVeranderd || w.onlineVeranderd).toBe(false);
  });

  it('instellingen: de nieuwste wint', () => {
    expect(nieuwste({ thema: 'rood', gewijzigd: 2 }, { thema: 'blauw', gewijzigd: 5 })?.thema).toBe('blauw');
    expect(nieuwste({ thema: 'rood', gewijzigd: 6 }, { thema: 'blauw', gewijzigd: 5 })?.thema).toBe('rood');
    expect(nieuwste(undefined, { thema: 'blauw', gewijzigd: 5 })?.thema).toBe('blauw');
  });
});

describe('teamcode', () => {
  it('6 tekens zonder verwarrende tekens (0/O, 1/I/L)', () => {
    expect(CODE_TEKENS).not.toMatch(/[0O1IL]/);
    for (let i = 0; i < 200; i++) {
      const c = nieuweCode();
      expect(c).toMatch(/^[A-Z2-9]{6}$/);
      expect(c).not.toMatch(/[0O1IL]/);
      expect(isGeldigeCode(c)).toBe(true);
    }
    expect(normaliseerCode(' abc-234 ')).toBe('ABC234');
    expect(isGeldigeCode('ABC0O1')).toBe(false);
    expect(isGeldigeCode('ABC23')).toBe(false);
  });
});
