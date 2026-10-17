import { describe, expect, it } from 'vitest';
import { PoppetjesInstelling } from '../src/engine/poppetjes';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { OEFENINGEN } from '../src/data/oefeningen';
import type { Stap, Tekening, VeldObject } from '../src/model/types';

/** Versie 0.21.0: realistischere 3D-animaties (snelheidsknop, eenvoudige poppetjes, extra gegevens uit de tijdlijn). */

class Opslag {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

describe('instelling Eenvoudige poppetjes', () => {
  it('standaard uit; zelf aan- en uitzetten wordt onthouden', () => {
    const o = new Opslag();
    const p = new PoppetjesInstelling(o);
    expect(p.get()).toEqual({ eenvoudig: false, automatisch: false });
    p.kies(true);
    expect(p.get().eenvoudig).toBe(true);
    expect(new PoppetjesInstelling(o).get()).toEqual({ eenvoudig: true, automatisch: false });
    p.kies(false);
    expect(new PoppetjesInstelling(o).get().eenvoudig).toBe(false);
  });

  it('automatisch aan als 3D hapert, maar niet als de gebruiker zelf "normaal" koos', () => {
    const o = new Opslag();
    const p = new PoppetjesInstelling(o);
    let gemeld = 0;
    p.abonneer(() => gemeld++);
    expect(p.automatisch()).toBe(true);
    expect(p.get()).toEqual({ eenvoudig: true, automatisch: true });
    expect(gemeld).toBe(1);
    // Al aan: niets meer te doen.
    expect(p.automatisch()).toBe(false);
    // Zelf uitgezet: dan niet opnieuw automatisch aan.
    p.kies(false);
    expect(p.automatisch()).toBe(false);
    expect(p.get().eenvoudig).toBe(false);
  });

  it('zonder opslag (privévenster): werkt gewoon, onthoudt niets', () => {
    const p = new PoppetjesInstelling(undefined);
    expect(p.get().eenvoudig).toBe(false);
    p.kies(true);
    expect(p.get().eenvoudig).toBe(false);
  });
});

describe('snelheidsknop', () => {
  it('0,5×, 1× en 2×', async () => {
    const { SNELHEDEN } = await import('../src/anim/AnimatieSpeler');
    expect([...SNELHEDEN]).toEqual([0.5, 1, 2]);
  });
});

describe('tijdlijn: gegevens voor de 3D-poppetjes', () => {
  const speler = (id: string, x: number, y: number, extra: Partial<VeldObject> = {}): VeldObject => ({ id, soort: 'speler', team: 'A', x, y, ...extra });
  const t = (objecten: VeldObject[], animatie: Stap[]): Tekening => ({ veld: { type: 'leeg', breedte: 30, lengte: 20 }, objecten, animatie });

  it('looprichting, tijd sinds de start, afgelegde weg en versnelling (optrekken > 0, afremmen < 0)', () => {
    const tl = maakTijdlijn(t([speler('a', 2, 10)], [{ acties: [{ type: 'loop', wie: 'a', naar: [12, 10] }] }]));
    const begin = standOp(tl, tl.duur * 0.2).objecten.get('a')!;
    const eind = standOp(tl, tl.duur * 0.8).objecten.get('a')!;
    expect(begin.looprichting).toBeCloseTo(0, 5);
    expect(begin.loopTijd).toBeCloseTo(tl.duur * 0.2, 5);
    expect(eind.afgelegd!).toBeGreaterThan(begin.afgelegd!);
    expect(begin.versnelling!).toBeGreaterThan(0);
    expect(eind.versnelling!).toBeLessThan(0);
    // Stilstaan: geen beweging.
    expect(standOp(tl, tl.duur + 0.5).objecten.get('a')!.looprichting).toBeUndefined();
  });

  it('trap: rond de pass, raken op u = 0,5, met de richting van de bal; aanname bij de ontvanger', () => {
    const bal: VeldObject = { id: 'b', soort: 'bal', x: 0, y: 0, bij: 'a' };
    const tl = maakTijdlijn(t([speler('a', 5, 10), speler('c', 20, 10), bal], [{ duur: 0.5, acties: [] }, { acties: [{ type: 'pass', van: 'a', naar: 'c' }] }]));
    const los = tl.loslaten.find((x) => x.soort === 'voet')!;
    const trap = standOp(tl, los.t).objecten.get('a')!.trap!;
    expect(trap.u).toBeCloseTo(0.5, 5);
    expect(Math.abs(trap.richting!)).toBeLessThan(5);
    expect(trap.kracht).toBeGreaterThan(0.1);
    expect(standOp(tl, los.t - 0.5).objecten.get('a')!.trap).toBeUndefined();
    const aankomst = [...tl.balEvents.get('b')!].find((e) => e.soort === 'vlucht')!;
    if (aankomst.soort !== 'vlucht') throw new Error();
    const an = standOp(tl, aankomst.t1).objecten.get('c')!.aanname!;
    expect(an.u).toBeCloseTo(0.5, 5);
    expect(an.hoogte).toBeLessThan(0.3);
  });

  it('opstaan na een duik wordt doorgegeven (0 → 1)', () => {
    const o = OEFENINGEN.find((x) => x.id === 'keeper-ld-voetenwerk-lange-duik')!;
    const tl = maakTijdlijn(o.tekening);
    const waarden: number[] = [];
    for (let tt = 0; tt < tl.duur; tt += 0.02) {
      const s = standOp(tl, tt).objecten.get('k1');
      if (s?.opstaan !== undefined) waarden.push(s.opstaan);
    }
    expect(waarden.length).toBeGreaterThan(5);
    expect(Math.min(...waarden)).toBeLessThan(0.2);
    expect(Math.max(...waarden)).toBeGreaterThan(0.7);
  });

  it('standen zonder deze bewegingen blijven precies zoals ze waren (geen extra velden)', () => {
    const tl = maakTijdlijn(t([speler('a', 2, 10)], [{ duur: 1, acties: [] }]));
    const s = standOp(tl, 0.5).objecten.get('a')!;
    expect('trap' in s || 'aanname' in s || 'opstaan' in s).toBe(false);
  });
});
