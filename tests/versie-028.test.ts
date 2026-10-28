import { describe, expect, it } from 'vitest';
import { TACTIEKEN, TACTIEK_GROEPEN, vindTactiek } from '../src/wedstrijd/tactieken';
import { spelvorm, nieuwBord, wedstrijdCode, uitWedstrijdCode } from '../src/wedstrijd/wedstrijd';
import { lijnenNaarAnimatie } from '../src/editor/animatie';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { fysiekeFouten } from '../src/anim/fysiek';
import { EN } from '../src/i18n/en';

/** Versie 0.28.0 (deel C): voorbeeldtactieken op het tactiekbord. */

const OOK_8V8 = ['hoog-druk-433', 'druk-terugspeelbal', 'tegenpressing', 'opbouw-keeper', 'overlap-flank', 'diepte-achter-verdediging', 'counter'];

describe('tactiekbibliotheek', () => {
  it('17 tactieken in drie groepen, met Engelse namen', () => {
    expect(TACTIEKEN).toHaveLength(17);
    expect(TACTIEK_GROEPEN.map((g) => g.id)).toEqual(['druk', 'opbouw', 'aanval']);
    expect(TACTIEKEN.filter((x) => x.groep === 'druk')).toHaveLength(6);
    expect(TACTIEKEN.filter((x) => x.groep === 'opbouw')).toHaveLength(5);
    expect(TACTIEKEN.filter((x) => x.groep === 'aanval')).toHaveLength(6);
    for (const g of ['Druk zetten', 'Opbouwen', 'Aanvallen en omschakelen']) expect(EN[g], g).toBeTruthy();
    expect(new Set(TACTIEKEN.map((x) => x.id)).size).toBe(17);
  });
  it('elke tactiek: uitleg (wat, wanneer) en 2–4 aandachtspunten; 11 tegen 11 en waar gevraagd ook 8 tegen 8', () => {
    for (const x of TACTIEKEN) {
      expect(x.wat.length, x.id).toBeGreaterThan(40);
      expect(x.wanneer.length, x.id).toBeGreaterThan(20);
      expect(x.punten.length, x.id).toBeGreaterThanOrEqual(2);
      expect(x.punten.length, x.id).toBeLessThanOrEqual(4);
      const vormen = x.versies.map((v) => v.vorm);
      if (x.id === 'opbouw-8v8') expect(x.versies.map((v) => v.id)).toEqual(['1-3-2-2', '1-3-3-1']);
      else expect(vormen[0], x.id).toBe('11v11');
      if (OOK_8V8.includes(x.id)) expect(vormen, x.id).toContain('8v8');
      expect(vindTactiek(x.id)).toBe(x);
    }
  });
});

for (const x of TACTIEKEN) {
  for (const v of x.versies) {
    describe(`${x.id} (${v.id})`, () => {
      const t = v.maak();
      const r = lijnenNaarAnimatie(t);
      it('beide teams compleet, binnen het veld, niemand op elkaar', () => {
        const info = spelvorm(v.vorm);
        const personen = t.objecten.filter((o) => o.soort === 'speler' || o.soort === 'keeper');
        expect(personen.filter((o) => o.soort === 'speler' && o.team === 'A').length + 1).toBe(info.spelers);
        expect(personen.filter((o) => o.soort === 'speler' && o.team === 'B').length + 1).toBe(info.spelers);
        expect(personen.filter((o) => o.soort === 'keeper')).toHaveLength(2);
        for (const p of personen) {
          expect(p.x, p.id).toBeGreaterThan(0);
          expect(p.x, p.id).toBeLessThan(info.veld.breedte);
          expect(p.y, p.id).toBeGreaterThan(0);
          expect(p.y, p.id).toBeLessThan(info.veld.lengte);
        }
      });
      it('lijnen met stapnummers spelen af zonder meldingen en zonder fysieke fouten', () => {
        expect((t.lijnen ?? []).length).toBeGreaterThan(2);
        for (const l of t.lijnen ?? []) expect(l.stap).toBeGreaterThan(0);
        expect(r.meldingen).toEqual([]);
        expect(fysiekeFouten(r.tekening)).toEqual([]);
      });
      it('spelers houden afstand (≥ 1,5 m) en blijven binnen het veld', () => {
        const tl = maakTijdlijn(r.tekening);
        const info = spelvorm(v.vorm);
        const ids = r.tekening.objecten.filter((o) => o.soort === 'speler' || o.soort === 'keeper').map((o) => o.id);
        const problemen: string[] = [];
        for (let tt = 0; tt <= tl.duur; tt += 0.05) {
          const s = standOp(tl, tt);
          for (let i = 0; i < ids.length; i++) {
            const a = s.objecten.get(ids[i]!)!;
            if (a.x < -0.5 || a.x > info.veld.breedte + 0.5 || a.y < -0.5 || a.y > info.veld.lengte + 0.5) problemen.push(`${ids[i]} buiten het veld op t=${tt.toFixed(2)}`);
            for (let j = i + 1; j < ids.length; j++) {
              const b = s.objecten.get(ids[j]!)!;
              const d = Math.hypot(a.x - b.x, a.y - b.y);
              if (d < 1.5) problemen.push(`${ids[i]}–${ids[j]} ${d.toFixed(2)} m op t=${tt.toFixed(2)}`);
            }
          }
        }
        expect(problemen.slice(0, 6)).toEqual([]);
      });
    });
  }
}

describe('eigen bord uit een voorbeeldtactiek', () => {
  it('onthoudt de tactiek (voor de uitleg), ook via een deellink; het voorbeeld blijft gelijk', () => {
    const x = TACTIEKEN[0]!;
    const voor = JSON.stringify(x.versies[0]!.maak());
    const b = { ...nieuwBord('tactiek', x.versies[0]!.maak(), x.naam, 1, 'b1'), tactiek: x.id };
    b.tekening.lijnen = [];
    expect(JSON.stringify(x.versies[0]!.maak())).toBe(voor);
    const terug = uitWedstrijdCode(wedstrijdCode({ soort: 'bord', bord: b }));
    expect(terug).toMatchObject({ soort: 'bord', bord: { naam: x.naam, soort: 'tactiek', tactiek: x.id } });
  });
});
