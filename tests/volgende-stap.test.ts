import { describe, expect, it } from 'vitest';
import { bordUitOpstelling, formatieNummers, formatiePlekken, metVasteNummers, nieuweOpstelling, opgesteldBord, SPELVORMEN, verplaatsPlek, wisselFormatie, zetOpPlek, type Opstelling } from '../src/wedstrijd/wedstrijd';
import { SITUATIES } from '../src/wedstrijd/hervattingen';

/** Fase 1 van de volgende stap (0.35.0): vaste rugnummers per positie. */

const alle = SPELVORMEN.flatMap((s) => s.formaties.map((f) => [s.id, f] as const));

describe('rugnummers per positie', () => {
  it('elke formatie: unieke nummers van 1–11, keeper 1, evenveel als er spelers zijn', () => {
    for (const [vorm, formatie] of alle) {
      const info = SPELVORMEN.find((s) => s.id === vorm)!;
      const plekken = formatiePlekken(vorm, formatie);
      const nrs = plekken.map((p) => p.nummer);
      expect(plekken.length, `${vorm} ${formatie}`).toBe(info.spelers);
      expect(new Set(nrs).size, `${vorm} ${formatie}`).toBe(nrs.length);
      expect(nrs.every((n) => n >= 1 && n <= 11), `${vorm} ${formatie}`).toBe(true);
      expect(nrs.includes(1), `${vorm} ${formatie}`).toBe(info.keeper);
      if (info.keeper) expect(plekken[0]).toMatchObject({ id: 'p1', nummer: 1 });
      // De id's tellen door zoals vóór 0.35.0 (opgeslagen opstellingen houden hun posities).
      expect(plekken.map((p) => p.id)).toEqual(plekken.map((_, i) => `p${i + 1}`));
    }
  });

  it('het systeem: 2 rechtsback, 3 en 4 centraal, 5 linksback, 6 en 8 controleurs, 10 aanvallend, 7 en 11 buiten, 9 spits', () => {
    const p = (nr: number, formatie = '1-4-3-3') => formatiePlekken('11v11', formatie).find((x) => x.nummer === nr)!;
    // Links op het veld = kleine x (eigen doel onderaan).
    expect([5, 4, 3, 2].map((n) => p(n).x)).toEqual([...[5, 4, 3, 2].map((n) => p(n).x)].sort((a, b) => a - b));
    expect(p(8).x).toBeLessThan(p(6).x);
    expect(p(10).y).toBeLessThan(p(6).y);
    expect(p(11).x).toBeLessThan(p(9).x);
    expect(p(9).x).toBeLessThan(p(7).x);
    expect(p(9).y).toBeLessThan(p(10).y);
    // 1-4-2-3-1: twee controleurs, de 10 centraal achter de spits.
    expect(formatieNummers('11v11', '1-4-2-3-1')).toEqual([[5, 4, 3, 2], [8, 6], [11, 10, 7], [9]]);
    // 1-4-4-2: twee spitsen 10 en 9, de buitenspelers op het middenveld.
    expect(formatieNummers('11v11', '1-4-4-2')).toEqual([[5, 4, 3, 2], [11, 8, 6, 7], [10, 9]]);
    // 1-3-4-3: ruit met de 4 voor de verdediging en de 10 achter de spits.
    expect(p(4, '1-3-4-3').y).toBeGreaterThan(p(8, '1-3-4-3').y);
    expect(p(10, '1-3-4-3').y).toBeLessThan(p(6, '1-3-4-3').y);
    expect(p(8, '1-3-4-3').x).toBeLessThan(p(6, '1-3-4-3').x);
  });

  it('kleinere spelvormen: logische nummers', () => {
    expect(formatieNummers('8v8', '1-3-3-1')).toEqual([[5, 3, 2], [11, 6, 7], [9]]);
    expect(formatieNummers('8v8', '1-2-3-2')).toEqual([[4, 3], [11, 6, 7], [10, 9]]);
    expect(formatieNummers('8v8', '1-3-2-2')).toEqual([[5, 3, 2], [8, 6], [11, 7]]);
    expect(formatieNummers('6v6', '1-2-1-2')).toEqual([[4, 3], [6], [11, 7]]);
    expect(formatieNummers('6v6', '1-3-2')).toEqual([[5, 3, 2], [11, 7]]);
    expect(formatieNummers('6v6', '1-2-2-1')).toEqual([[4, 3], [8, 6], [9]]);
    expect(formatieNummers('4v4', '1-2-1')).toEqual([[3], [8, 6], [9]]);
    expect(formatieNummers('4v4', '2-2')).toEqual([[4, 3], [11, 7]]);
    // Een onbekende formatie telt door.
    expect(formatieNummers('11v11', '1-5-3-2')).toEqual([[2, 3, 4, 5, 6], [7, 8, 9], [10, 11]]);
  });

  it('niemand staat op een ander (ook niet in de driehoek en de ruit)', () => {
    for (const [vorm, formatie] of alle) {
      const plekken = formatiePlekken(vorm, formatie);
      for (const a of plekken) for (const b of plekken) if (a.id < b.id) expect(Math.hypot(a.x - b.x, (a.y - b.y) * 1.5), `${vorm} ${formatie} ${a.nummer}/${b.nummer}`).toBeGreaterThan(0.1);
    }
  });

  it('een opgeslagen opstelling krijgt de vaste nummers; posities, namen en id’s blijven', () => {
    // Zoals vóór 0.35.0 bewaard: nummers tellen door, een positie is versleept en er staan namen op.
    const nieuw = nieuweOpstelling('11v11', ['Testspeler 1', 'Testspeler 2'], 1, 'o1');
    let oud: Opstelling = { ...nieuw, plekken: nieuw.plekken.map((p, i) => ({ ...p, nummer: i + 1 })) };
    oud = verplaatsPlek(zetOpPlek(oud, 'Testspeler 1', 'p10'), 'p10', 0.4, 0.2);
    const na = metVasteNummers(oud);
    expect(na.plekken.map((p) => p.nummer)).toEqual(formatiePlekken('11v11', '1-4-3-3').map((p) => p.nummer));
    expect(na.plekken.find((p) => p.id === 'p10')).toMatchObject({ x: 0.4, y: 0.2, naam: 'Testspeler 1', nummer: 9 });
    expect(na.wissels).toEqual(['Testspeler 2']);
    // Klopt het al, dan verandert er niets (zelfde object: er wordt niets opnieuw bewaard).
    expect(metVasteNummers(na)).toBe(na);
    expect(metVasteNummers(nieuw)).toBe(nieuw);
    // Andere formatie: de spelers gaan in volgorde mee, met de nummers van de nieuwe formatie.
    expect(wisselFormatie(na, '8v8', '1-3-3-1').plekken.map((p) => p.nummer)).toEqual([1, 5, 3, 2, 11, 6, 7, 9]);
  });

  it('tactiekbord: eigen team volgens de nummers, de tegenstander gespiegeld (zijn 2 staat tegenover onze 5)', () => {
    const bord = opgesteldBord('11v11', '1-4-3-3');
    const o = (id: string) => bord.objecten.find((x) => x.id === id)!;
    expect(o('a2').x).toBeGreaterThan(o('a5').x);
    expect(o('b2').x).toBeLessThan(o('b5').x);
    expect(Math.abs(o('b2').x - o('a5').x)).toBeLessThan(1);
    expect(o('k1')).toMatchObject({ soort: 'keeper', nummer: 1 });
    // Elf tegen elf, elk nummer één keer per team.
    for (const team of ['a', 'b']) expect(new Set(bord.objecten.filter((x) => x.id.startsWith(team) && x.soort === 'speler').map((x) => (x as { nummer?: number }).nummer)).size).toBe(10);
    // Vanuit een oude opstelling: ook de vaste nummers.
    const oud = { ...nieuweOpstelling('8v8', [], 1, 'o2') };
    oud.plekken = oud.plekken.map((p, i) => ({ ...p, nummer: i + 1 }));
    expect(bordUitOpstelling(oud).objecten.filter((x) => x.id.startsWith('a')).map((x) => x.id).sort()).toEqual(['a11', 'a2', 'a3', 'a5', 'a6', 'a7', 'a9']);
  });

  it('aftrap (spelhervatting): de spits (9) neemt de aftrap', () => {
    const aftrap = SITUATIES.find((s) => s.id === 'aftrap')!.maak();
    const bal = aftrap.objecten.find((x) => x.soort === 'bal') as { bij?: string };
    expect(bal.bij).toBe('a9');
  });
});
