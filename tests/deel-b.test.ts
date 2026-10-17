import { describe, expect, it } from 'vitest';
import {
  bordUitOpstelling,
  formatiePlekken,
  haalWeg,
  naarBank,
  nieuweOpstelling,
  SPELVORMEN,
  uitWedstrijdCode,
  verplaatsPlek,
  voegSpelerToe,
  vulAan,
  wedstrijdCode,
  wedstrijdCodeUitLink,
  wisselFormatie,
  zetOpPlek,
  nieuwBord,
  type Opstelling,
} from '../src/wedstrijd/wedstrijd';
import { SITUATIES, VOORBEELDEN } from '../src/wedstrijd/hervattingen';
import { lijnenNaarAnimatie, afspeelTekening } from '../src/editor/animatie';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { fysiekeFouten } from '../src/anim/fysiek';
import type { Tekening } from '../src/model/types';

const NAMEN = ['Anna', 'Bram', 'Cas', 'Daan', 'Eva', 'Finn', 'Gijs', 'Hugo', 'Ilse', 'Jens', 'Kim', 'Lars', 'Mila'];
const personen = (t: Tekening) => t.objecten.filter((o) => o.soort === 'speler' || o.soort === 'keeper');

describe('B1 Opstelling', () => {
  it('elke formatie heeft precies het aantal spelers van de spelvorm, binnen het veld, niet op elkaar', () => {
    for (const s of SPELVORMEN) {
      for (const f of s.formaties) {
        const p = formatiePlekken(s.id, f);
        expect(p, `${s.naam} ${f}`).toHaveLength(s.spelers);
        expect(f.split('-').map(Number).reduce((a, b) => a + b, 0)).toBe(s.spelers);
        for (const x of p) {
          expect(x.x).toBeGreaterThan(0);
          expect(x.x).toBeLessThan(1);
          expect(x.y).toBeGreaterThan(0);
          expect(x.y).toBeLessThan(1);
        }
        for (let i = 0; i < p.length; i++)
          for (let j = i + 1; j < p.length; j++) expect(Math.hypot((p[i]!.x - p[j]!.x) * s.veld.breedte, (p[i]!.y - p[j]!.y) * s.veld.lengte), `${s.naam} ${f}`).toBeGreaterThan(3);
        expect(new Set(p.map((x) => x.nummer)).size).toBe(s.spelers);
        if (s.keeper) expect(p[0]).toMatchObject({ nummer: 1, x: 0.5 });
      }
    }
    expect(SPELVORMEN.find((s) => s.id === '11v11')!.formaties).toEqual(expect.arrayContaining(['1-4-3-3', '1-4-4-2', '1-3-4-3']));
    expect(SPELVORMEN.find((s) => s.id === '8v8')!.formaties).toEqual(expect.arrayContaining(['1-3-3-1', '1-2-3-2']));
    expect(SPELVORMEN.find((s) => s.id === '6v6')!.formaties).toEqual(expect.arrayContaining(['1-2-1-2', '1-3-2']));
  });

  it('spelers op posities zetten, ruilen, naar de bank, vrij verslepen', () => {
    let o = nieuweOpstelling('6v6', NAMEN.slice(0, 8), 1, 'x');
    expect(o.wissels).toHaveLength(8);
    o = vulAan(o);
    expect(o.plekken.map((p) => p.naam)).toEqual(NAMEN.slice(0, 6));
    expect(o.wissels).toEqual(['Gijs', 'Hugo']);
    // Wissel erin: de speler die er stond gaat naar de bank.
    o = zetOpPlek(o, 'Gijs', 'p2');
    expect(o.plekken[1]!.naam).toBe('Gijs');
    expect(o.wissels).toEqual(['Hugo', 'Bram']);
    // Twee spelers op het veld ruilen.
    o = zetOpPlek(o, 'Anna', 'p3');
    expect([o.plekken[0]!.naam, o.plekken[2]!.naam]).toEqual(['Cas', 'Anna']);
    o = naarBank(o, 'p4');
    expect(o.plekken[3]!.naam).toBeUndefined();
    expect(o.wissels).toContain('Daan');
    o = verplaatsPlek(o, 'p5', 1.4, -0.2);
    expect(o.plekken[4]).toMatchObject({ x: 0.97, y: 0.03 });
    o = voegSpelerToe(o, ' Noor ');
    o = voegSpelerToe(o, 'Noor');
    expect(o.wissels.filter((w) => w === 'Noor')).toHaveLength(1);
    o = haalWeg(o, 'Anna');
    expect(JSON.stringify(o)).not.toContain('Anna');
    // Niemand dubbel.
    const alle = [...o.plekken.map((p) => p.naam).filter(Boolean), ...o.wissels];
    expect(new Set(alle).size).toBe(alle.length);
  });

  it('andere formatie of spelvorm: spelers gaan mee, wie overblijft naar de bank', () => {
    let o = vulAan(nieuweOpstelling('8v8', NAMEN.slice(0, 10), 1, 'x'));
    o = wisselFormatie(o, '8v8', '1-2-3-2');
    expect(o.plekken.filter((p) => p.naam)).toHaveLength(8);
    o = wisselFormatie(o, '6v6', '1-3-2');
    expect(o.plekken).toHaveLength(6);
    expect(o.wissels).toHaveLength(4);
    o = wisselFormatie(o, '11v11', '1-4-3-3');
    expect(o.plekken.filter((p) => p.naam)).toHaveLength(6);
  });

  it('delen via een link: heen en terug', () => {
    const o: Opstelling = { ...vulAan(nieuweOpstelling('11v11', NAMEN, 1, 'x')), naam: 'Zaterdag', datum: '2026-10-24' };
    const code = wedstrijdCode({ soort: 'opstelling', opstelling: o });
    expect(wedstrijdCodeUitLink(`https://x/trainersapp/#/w/${code}`)).toBe(code);
    const terug = uitWedstrijdCode(code);
    expect(terug?.soort).toBe('opstelling');
    if (terug?.soort === 'opstelling') {
      expect(terug.opstelling).toMatchObject({ naam: 'Zaterdag', datum: '2026-10-24', spelvorm: '11v11', formatie: '1-4-3-3', wissels: ['Lars', 'Mila'] });
      expect(terug.opstelling.plekken.map((p) => p.naam)).toEqual(o.plekken.map((p) => p.naam));
    }
    expect(uitWedstrijdCode('kapot')).toBeNull();
  });
});

describe('B2 Tactiekbord', () => {
  it('vanuit een opstelling: eigen spelers op hun plek, tegenstander gespiegeld, bal op de middenstip', () => {
    const o = vulAan(nieuweOpstelling('11v11', NAMEN, 1, 'x'));
    const t = bordUitOpstelling(o);
    expect(t.objecten.filter((x) => x.soort === 'speler' && x.team === 'A')).toHaveLength(10);
    expect(t.objecten.filter((x) => x.soort === 'speler' && x.team === 'B')).toHaveLength(10);
    expect(t.objecten.filter((x) => x.soort === 'keeper')).toHaveLength(2);
    expect(t.objecten.find((x) => x.soort === 'bal')).toMatchObject({ x: 34, y: 52.5 });
    // Eigen team in de eigen helft (onder), tegenstander boven.
    for (const x of t.objecten.filter((x) => x.team === 'B')) expect(x.y).toBeLessThan(52.5);
    const ps = personen(t);
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) expect(Math.hypot(ps[i]!.x - ps[j]!.x, ps[i]!.y - ps[j]!.y)).toBeGreaterThan(1.5);
    // Een looplijn en pass tekenen speelt gewoon af (zelfde animatie als de editor).
    const met: Tekening = {
      ...t,
      lijnen: [
        { soort: 'loop', punten: [[t.objecten.find((x) => x.id === 'a11')!.x, t.objecten.find((x) => x.id === 'a11')!.y], [55, 40]], van: 'a11', stap: 1 },
      ],
    };
    const r = lijnenNaarAnimatie(met);
    expect(r.meldingen.filter((m) => m.soort === 'fout')).toEqual([]);
    expect(afspeelTekening(met).animatie?.length).toBeGreaterThan(0);
  });

  it('vanuit elke spelvorm en formatie: niemand op elkaar, iedereen op het veld', () => {
    for (const s of SPELVORMEN)
      for (const f of s.formaties) {
        const t = bordUitOpstelling(wisselFormatie(nieuweOpstelling(s.id, [], 1, 'x'), s.id, f));
        const ps = personen(t);
        expect(ps, `${s.naam} ${f}`).toHaveLength(2 * s.spelers);
        for (const p of ps) expect(p.x >= 0 && p.x <= s.veld.breedte && p.y >= 0 && p.y <= s.veld.lengte, `${s.naam} ${f} ${p.id}`).toBe(true);
        for (let i = 0; i < ps.length; i++)
          for (let j = i + 1; j < ps.length; j++) expect(Math.hypot(ps[i]!.x - ps[j]!.x, ps[i]!.y - ps[j]!.y), `${s.naam} ${f}: ${ps[i]!.id}/${ps[j]!.id}`).toBeGreaterThan(Math.min(5, s.veld.breedte * 0.15));
        // Elk team in zijn eigen helft, veld in de maat van de spelvorm.
        expect(t.veld).toMatchObject({ breedte: s.veld.breedte, lengte: s.veld.lengte });
        for (const p of ps) expect(p.team === 'B' || p.id === 'k2' ? p.y < s.veld.lengte / 2 : p.y > s.veld.lengte / 2, `${s.naam} ${f} ${p.id}`).toBe(true);
      }
  });

  it('bord delen via een link', () => {
    const b = nieuwBord('hervatting', VOORBEELDEN[0]!.maak(), 'Corner', 1, 'b1');
    const terug = uitWedstrijdCode(wedstrijdCode({ soort: 'bord', bord: b }));
    expect(terug).toMatchObject({ soort: 'bord', bord: { naam: 'Corner', soort: 'hervatting' } });
  });
});

describe('B3 Spelhervattingen', () => {
  it('beginsituaties: binnen beeld, niemand op elkaar (behalve het muurtje), bal bij de nemer', () => {
    expect(SITUATIES.map((s) => s.naam)).toEqual(expect.arrayContaining(['Corner links', 'Corner rechts', 'Vrije trap 18 m', 'Inworp', 'Doeltrap / uittrap', 'Aftrap']));
    for (const s of SITUATIES) {
      const t = s.maak();
      const ps = personen(t);
      expect(ps.length, s.naam).toBeGreaterThan(5);
      const B = 68;
      const L = t.veld.type === 'half' ? 52.5 : 105;
      for (const p of ps) {
        expect(p.x, `${s.naam} ${p.id}`).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(B);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(L);
      }
      for (let i = 0; i < ps.length; i++)
        for (let j = i + 1; j < ps.length; j++) {
          const muur = ps[i]!.team === 'B' && ps[j]!.team === 'B' && s.id.startsWith('vrije-trap');
          expect(Math.hypot(ps[i]!.x - ps[j]!.x, ps[i]!.y - ps[j]!.y), `${s.naam}: ${ps[i]!.id} en ${ps[j]!.id}`).toBeGreaterThan(muur ? 0.7 : 1.5);
        }
      const bal = t.objecten.find((o) => o.soort === 'bal')!;
      expect(bal.bij, s.naam).toBeTruthy();
      expect(lijnenNaarAnimatie(t).meldingen).toEqual([]);
    }
  });

  it('voorbeelden spelen af zonder meldingen en eindigen met een doelpunt', () => {
    expect(VOORBEELDEN.map((v) => v.naam)).toEqual(['Corner op de eerste paal', 'Korte corner', 'Vrije trap via een kaats']);
    for (const v of VOORBEELDEN) {
      const t = v.maak();
      const r = lijnenNaarAnimatie(t);
      expect(r.meldingen, v.naam).toEqual([]);
      expect(fysiekeFouten(r.tekening), v.naam).toEqual([]);
      const tl = maakTijdlijn(r.tekening);
      const eind = standOp(tl, tl.duur + 2).objecten.get('bal1')!;
      expect(eind.y, `${v.naam}: bal in het goal`).toBeLessThan(0);
      expect(Math.abs(eind.x - 34), v.naam).toBeLessThan(3.66);
    }
  });
});
