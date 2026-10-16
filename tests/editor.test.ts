import { describe, expect, it } from 'vitest';
import {
  autoUitsnede,
  benodigdhedenUit,
  bevries,
  draai,
  Geschiedenis,
  heeftAnimatie,
  kopieer,
  lagBalNeer,
  maatNaar,
  nieuweLijn,
  nieuweTekening,
  objectHandvatten,
  PALET,
  raakLijn,
  raakObject,
  sleepLijn,
  telPersonen,
  verplaats,
  verwijder,
  voegLijnToe,
  voegToe,
} from '../src/editor/editor';
import { lijnPunten } from '../src/model/lijn';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { fysiekeFouten } from '../src/anim/fysiek';
import type { Tekening } from '../src/model/types';
import { OEFENINGEN, vindOefening } from '../src/data/oefeningen';
import { dupliceerEigen, geldigeEigen, inBibliotheek, kopieerNaarEigen, metTekening, nieuweEigen, ontbreekt, voorDelen } from '../src/eigen/eigen';
import { apparaatEigenBackend, EigenStore } from '../src/eigen/opslag';
import { naarCode, uitCode } from '../src/training/training';

const plaats = (t: Tekening, sleutel: string, x: number, y: number) => {
  const item = PALET.find((p) => p.sleutel === sleutel)!;
  const o = item.maak(t, [x, y]);
  return { t: voegToe(t, o), id: o.id };
};

const geheugen = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};

describe('editor: tekenen', () => {
  it('nieuwe tekening: leeg veld met eigen maat, half en heel veld', () => {
    expect(nieuweTekening('leeg', 25, 15).veld).toEqual({ type: 'leeg', breedte: 25, lengte: 15 });
    expect(nieuweTekening('half').veld).toEqual({ type: 'half' });
    expect(nieuweTekening('heel').objecten).toEqual([]);
  });

  it('elk palet-item is een geldig object dat in 2D/3D en de tijdlijn werkt', () => {
    let t = nieuweTekening('leeg', 40, 30);
    PALET.forEach((p, i) => {
      t = voegToe(t, p.maak(t, [3 + (i % 8) * 4.5, 3 + Math.floor(i / 8) * 6]));
    });
    expect(t.objecten).toHaveLength(PALET.length);
    expect(new Set(t.objecten.map((o) => o.id)).size).toBe(PALET.length);
    expect(() => standOp(maakTijdlijn(t), 0)).not.toThrow();
  });

  it('spelers en keepers krijgen automatisch een volgend nummer (per team)', () => {
    let t = nieuweTekening('leeg');
    let r = plaats(t, 'speler-a', 5, 5);
    r = plaats(r.t, 'speler-a', 8, 5);
    r = plaats(r.t, 'speler-b', 8, 9);
    r = plaats(r.t, 'keeper', 1, 1);
    r = plaats(r.t, 'keeper', 1, 3);
    t = r.t;
    expect(t.objecten.map((o) => `${o.soort}${o.team ?? ''}${o.nummer}`)).toEqual(['spelerA1', 'spelerA2', 'spelerB1', 'keeper1', 'keeper2']);
    // Kopie krijgt het volgende nummer.
    const k = kopieer(t, 'a1');
    expect(k.tekening.objecten.find((o) => o.id === k.id)?.nummer).toBe(3);
  });

  it('slepen, draaien, maat veranderen en verwijderen', () => {
    let { t, id } = plaats(nieuweTekening('leeg'), 'ladder', 10, 10);
    t = verplaats(t, id, [12.345, 9]);
    expect(t.objecten[0]).toMatchObject({ x: 12.35, y: 9 });
    t = draai(t, id, 370);
    expect(t.objecten[0]!.hoek).toBe(10);
    t = draai(t, id, 0);
    t = maatNaar(t, id, [12.35, 9 + 3]);
    expect(t.objecten[0]!.lengte).toBe(6);
    const z = plaats(t, 'zone', 15, 10);
    t = maatNaar(z.t, z.id, [15 + 4, 10 + 2.5]);
    expect(t.objecten.find((o) => o.id === z.id)).toMatchObject({ breedte: 8, lengte: 5 });
    t = verwijder(t, id);
    expect(t.objecten.map((o) => o.id)).toEqual([z.id]);
  });

  it('personen draaien hun kijkrichting; het draaihandvat staat in de kijkrichting', () => {
    const { t, id } = plaats(nieuweTekening('leeg'), 'keeper', 10, 10);
    const d = draai(t, id, 90);
    expect(d.objecten[0]!.kijkrichting).toBe(90);
    const h = objectHandvatten(d.objecten[0]!, 1)!;
    expect(h.draai![0]).toBeCloseTo(10);
    expect(h.draai![1]).toBeCloseTo(11.5);
  });

  it('kleine dingen zijn met een vinger te pakken; wat bovenop ligt wint', () => {
    let r = plaats(nieuweTekening('leeg'), 'zone', 10, 10);
    r = plaats(r.t, 'hoedje', 10, 10);
    const t = r.t;
    // 0,5 m naast het hoedje (vinger): toch het hoedje, niet de zone eronder.
    expect(raakObject(t, [10.6, 10], 0.6)?.soort).toBe('hoedje');
    expect(raakObject(t, [13, 13], 0.6)?.soort).toBe('zone');
    expect(raakObject(t, [25, 3], 0.6)).toBeUndefined();
  });

  it('een bal bij een speler hoort bij hem (beweegt mee) en gaat los als je hem wegsleept', () => {
    let r = plaats(nieuweTekening('leeg'), 'speler-a', 10, 10);
    r = plaats(r.t, 'bal', 10.3, 10.2);
    let t = r.t;
    expect(t.objecten.find((o) => o.soort === 'bal')?.bij).toBe('a1');
    t = verplaats(t, 'a1', [14, 10]);
    expect(standOp(maakTijdlijn(t), 0).objecten.get('bal1')!.x).toBeCloseTo(14, 0);
    t = verplaats(t, 'bal1', [20, 5]);
    t = lagBalNeer(t, 'bal1');
    expect(t.objecten.find((o) => o.soort === 'bal')).toMatchObject({ x: 20, y: 5 });
    expect(t.objecten.find((o) => o.soort === 'bal')?.bij).toBeUndefined();
  });

  it('lijnen: vast aan een speler (beweegt mee), buigen met het middelste handvat, raken met de vinger', () => {
    let r = plaats(nieuweTekening('leeg'), 'speler-a', 5, 10);
    r = plaats(r.t, 'speler-a', 20, 10);
    let t = r.t;
    const l = nieuweLijn(t, 'bal', [5.2, 10.1], [19.8, 10], 0.6);
    expect(l).toMatchObject({ van: 'a1', naar: 'a2' });
    t = voegLijnToe(t, l);
    t = verplaats(t, 'a2', [20, 15]);
    const pts = () => lijnPunten(t.lijnen![0]!, (id) => {
      const o = t.objecten.find((x) => x.id === id);
      return o && [o.x, o.y];
    });
    expect(pts()[pts().length - 1]).toEqual([20, 15]);
    t = sleepLijn(t, 0, 'midden', [12, 6], 0.6);
    expect(t.lijnen![0]!.bocht).toEqual([12, 6]);
    // De boog gaat door het buigpunt.
    const p = pts();
    expect(p[12]![0]).toBeCloseTo(12, 0);
    expect(p[12]![1]).toBeCloseTo(6, 0);
    expect(raakLijn(t, [12, 6.3], 0.6)).toBe(0);
    // Buigpunt terug op de rechte lijn: weer recht.
    t = sleepLijn(t, 0, 'midden', [12.5, 12.5], 0.6);
    expect(t.lijnen![0]!.bocht).toBeUndefined();
    // Eind losmaken van de speler.
    t = sleepLijn(t, 0, 'eind', [25, 2], 0.6);
    expect(t.lijnen![0]!.naar).toBeUndefined();
    // Speler weg: de lijn blijft op zijn plek.
    t = verwijder(t, 'a1');
    expect(t.lijnen![0]!.van).toBeUndefined();
    expect(t.lijnen![0]!.punten[0]).toEqual([5, 10]);
  });
});

describe('editor: ongedaan maken', () => {
  it('terug en opnieuw; slepen is één stap', () => {
    const g = new Geschiedenis(nieuweTekening('leeg'));
    const a = plaats(g.nu, 'pion', 5, 5);
    g.zet(a.t);
    g.begin();
    for (let x = 6; x <= 10; x++) g.vervang(verplaats(g.nu, a.id, [x, 5]));
    g.klaar();
    expect(g.nu.objecten[0]!.x).toBe(10);
    expect(g.terug().objecten[0]!.x).toBe(5);
    expect(g.terug().objecten).toHaveLength(0);
    expect(g.kanTerug).toBe(false);
    expect(g.vooruit().objecten).toHaveLength(1);
    expect(g.vooruit().objecten[0]!.x).toBe(10);
    // Na een nieuwe wijziging is "opnieuw" weg.
    g.terug();
    g.zet(verwijder(g.nu, a.id));
    expect(g.kanVooruit).toBe(false);
  });
});

describe('editor: benodigdheden en aantallen', () => {
  it('voorstel uit de getekende objecten', () => {
    let t = nieuweTekening('half');
    for (let i = 0; i < 6; i++) t = plaats(t, 'pion', 10 + i * 2, 20).t;
    t = plaats(t, 'goal', 34, 0).t;
    t = plaats(t, 'jeugdgoal', 34, 52).t;
    t = plaats(t, 'horde-hoog', 20, 30).t;
    t = plaats(t, 'speler-a', 30, 30).t;
    t = plaats(t, 'speler-b', 30, 35).t;
    t = plaats(t, 'bal', 40, 40).t;
    expect(benodigdhedenUit(t)).toEqual(['1 bal', '1 groot goal', '1 jeugdgoal', '6 pionnen', '1 hoge horde', 'Hesjes']);
    expect(telPersonen(t)).toEqual({ spelers: 2, keepers: 0 });
  });

  it('uitsnede rond de tekening bij een half veld', () => {
    let t = nieuweTekening('half');
    t = plaats(t, 'goal', 34, 0).t;
    t = plaats(t, 'speler-a', 34, 16).t;
    const u = autoUitsnede(t)!;
    expect(u.x).toBeLessThan(30.4);
    expect(u.x + u.breedte).toBeGreaterThan(37.6);
    expect(u.lengte).toBeLessThan(30);
    expect(autoUitsnede(nieuweTekening('leeg'))).toBeUndefined();
  });
});

describe('eigen oefeningen', () => {
  it('opslaan, terugladen, dupliceren en verwijderen', () => {
    const plek = geheugen();
    const store = new EigenStore(apparaatEigenBackend(plek));
    const o = { ...nieuweEigen(nieuweTekening('leeg'), 'veld', 1, 'eigen-x'), naam: 'Mijn rondo', categorieen: ['positiespel'] };
    store.bewaar(o, 2);
    const weer = new EigenStore(apparaatEigenBackend(plek));
    expect(weer.haal('eigen-x')).toMatchObject({ naam: 'Mijn rondo', gewijzigd: 2, eigen: true });
    const kopie = weer.dupliceer('eigen-x')!;
    expect(kopie.naam).toBe('Mijn rondo (kopie)');
    expect(kopie.id).not.toBe('eigen-x');
    weer.verwijder('eigen-x');
    expect(weer.lijst().map((x) => x.id)).toEqual([kopie.id]);
    // Kapotte opslag: lege lijst.
    plek.setItem('trainersapp.eigen', '{kapot');
    expect(new EigenStore(apparaatEigenBackend(plek)).lijst()).toEqual([]);
  });

  it('alleen naam en een categorie zijn verplicht', () => {
    const o = nieuweEigen(nieuweTekening('leeg'));
    expect(ontbreekt(o)).toEqual(['Geef de oefening een naam', 'Kies minstens één categorie']);
    expect(inBibliotheek({ naam: 'X', categorieen: ['techniek'] })).toBe(true);
  });

  it('kopie van een ingebouwde oefening houdt de animatie, tot er iets verschuift', () => {
    const bron = vindOefening('veld-ps-rondo-4-2')!;
    const k = kopieerNaarEigen(bron, 5, 'eigen-k');
    expect(k).toMatchObject({ id: 'eigen-k', bron: bron.id, eigen: true, naam: bron.naam });
    expect(heeftAnimatie(k.tekening)).toBe(true);
    // De ingebouwde oefening zelf blijft onaangeroerd.
    expect(k.tekening).not.toBe(bron.tekening);
    // Bevriezen: iedereen op de beginplek, geen animatie meer.
    const stil = bevries(k.tekening);
    expect(heeftAnimatie(stil)).toBe(false);
    const begin = standOp(maakTijdlijn(bron.tekening), 0);
    for (const o of stil.objecten) {
      const s = begin.objecten.get(o.id)!;
      expect(o.x).toBeCloseTo(s.x, 1);
      expect(o.y).toBeCloseTo(s.y, 1);
    }
    expect(stil.objecten.find((o) => o.soort === 'bal')?.bij).toBe('a1');
  });

  it('spelers in een rij komen bij het bevriezen op hun plek in de rij', () => {
    const bron = OEFENINGEN.find((o) => o.tekening.rijen?.length)!;
    const stil = bevries(bron.tekening);
    expect(stil.rijen).toBeUndefined();
    const s = standOp(maakTijdlijn(bron.tekening), 0);
    const id = bron.tekening.rijen![0]!.spelers[1]!;
    expect(stil.objecten.find((o) => o.id === id)!.x).toBeCloseTo(s.objecten.get(id)!.x, 1);
    expect(fysiekeFouten(stil)).toEqual([]);
  });

  it('uitsnede wordt bijgewerkt bij het opslaan van de tekening', () => {
    let t = nieuweTekening('heel');
    t = plaats(t, 'speler-a', 30, 50).t;
    const o = metTekening(nieuweEigen(nieuweTekening('heel')), t);
    expect(o.tekening.weergave).toBeDefined();
    expect(dupliceerEigen({ ...o, naam: '' }).naam).toBe('');
  });
});

describe('delen van een training met eigen oefeningen', () => {
  const eigen = () => {
    let t = nieuweTekening('leeg', 20, 15);
    t = plaats(t, 'speler-a', 5, 5).t;
    t = plaats(t, 'pion', 10, 5).t;
    t = voegLijnToe(t, nieuweLijn(t, 'dribbel', [5, 5], [10, 7], 0.6));
    return { ...nieuweEigen(t, 'veld', 1, 'eigen-abc'), naam: 'Dribbel "rond" de pion', categorieen: ['techniek'], benodigdheden: ['1 pion'] };
  };

  it('de eigen oefening gaat in zijn geheel mee in de link', () => {
    const o = eigen();
    const code = naarCode({ naam: 'Dinsdag', spelers: 8, keepers: 0, oefeningen: ['veld-pt-derde-man', o.id] }, [voorDelen(o)]);
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    const g = uitCode(code)!;
    expect(g.oefeningen).toEqual(['veld-pt-derde-man', 'eigen-abc']);
    expect(g.eigen).toHaveLength(1);
    expect(g.eigen![0]).toMatchObject({ id: 'eigen-abc', naam: o.naam, eigen: true });
    expect(g.eigen![0]!.tekening.lijnen).toHaveLength(1);
    expect(geldigeEigen(g.eigen![0])).toBe(true);
    // Zonder eigen oefeningen blijft de link zoals hij was.
    expect(uitCode(naarCode({ naam: '', spelers: 1, keepers: 0, oefeningen: ['veld-pt-derde-man'] }))!.eigen).toBeUndefined();
  });

  it('importeren: nieuw → opslaan, zelfde → hergebruiken, zelfde id met andere inhoud → nieuwe id', () => {
    const o = eigen();
    const store = new EigenStore(apparaatEigenBackend(undefined));
    const g = uitCode(naarCode({ naam: '', spelers: 8, keepers: 0, oefeningen: [o.id] }, [voorDelen(o)]))!;
    expect(store.importeer(g.eigen!).get('eigen-abc')).toBe('eigen-abc');
    expect(store.lijst()).toHaveLength(1);
    expect(store.importeer(g.eigen!).get('eigen-abc')).toBe('eigen-abc');
    expect(store.lijst()).toHaveLength(1);
    const anders = { ...g.eigen![0]!, naam: 'Iets anders' };
    const nieuw = store.importeer([anders]).get('eigen-abc')!;
    expect(nieuw).not.toBe('eigen-abc');
    expect(store.lijst()).toHaveLength(2);
    expect(store.haal(nieuw)?.naam).toBe('Iets anders');
  });

  it('een kapotte eigen oefening in de link wordt overgeslagen', () => {
    const raar = btoa(JSON.stringify({ v: 1, n: '', s: 1, k: 0, o: ['eigen-x'], e: [{ id: 'eigen-x', naam: 3 }, 'onzin'] })).replace(/=+$/, '');
    const g = uitCode(raar)!;
    expect(g.oefeningen).toEqual(['eigen-x']);
    expect(g.eigen).toBeUndefined();
  });
});
