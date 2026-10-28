import { describe, expect, it } from 'vitest';
import { HERVATTINGEN, HERVATTING_GROEPEN } from '../src/wedstrijd/hervattingVoorbeelden';
import { VOORBEELDEN } from '../src/wedstrijd/hervattingen';
import { spelvorm } from '../src/wedstrijd/wedstrijd';
import { lijnenNaarAnimatie } from '../src/editor/animatie';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { fysiekeFouten } from '../src/anim/fysiek';
import { veldMaten } from '../src/anim/render2d';
import { EN } from '../src/i18n/en';
import type { BalActie } from '../src/model/types';

/** Versie 0.29.0 (deel D): ingestudeerde spelhervattingen. */

const OOK_8V8 = ['corner-tweede-paal', 'corner-rand-zestien', 'vrije-trap-breed', 'vrije-trap-snel', 'inworp-kaats', 'aftrap', 'corner-zonedekking'];

describe('bibliotheek spelhervattingen', () => {
  it('vier groepen met de gevraagde hervattingen en de drie bestaande voorbeelden', () => {
    expect(HERVATTING_GROEPEN.map((g) => g.id)).toEqual(['corners', 'vrije-trappen', 'inworp-aftrap', 'verdedigen']);
    for (const g of ['Corners', 'Vrije trappen', 'Inworp en aftrap', 'Verdedigen bij standaardsituaties']) expect(EN[g], g).toBeTruthy();
    expect(HERVATTINGEN).toHaveLength(20);
    const per = (g: string) => HERVATTINGEN.filter((x) => x.groep === g).length;
    expect([per('corners'), per('vrije-trappen'), per('inworp-aftrap'), per('verdedigen')]).toEqual([7, 6, 4, 3]);
    expect(VOORBEELDEN.map((v) => v.id)).toEqual(['corner-eerste-paal', 'korte-corner', 'vrije-trap-kaats']);
    expect(new Set(HERVATTINGEN.map((x) => x.id)).size).toBe(20);
  });
  it('uitleg met 2–4 aandachtspunten; 11 tegen 11 en waar gevraagd ook 8 tegen 8', () => {
    for (const x of HERVATTINGEN) {
      expect(x.wat.length, x.id).toBeGreaterThan(40);
      expect(x.wanneer.length, x.id).toBeGreaterThan(20);
      expect(x.punten.length, x.id).toBeGreaterThanOrEqual(2);
      expect(x.punten.length, x.id).toBeLessThanOrEqual(4);
      expect(x.versies[0]!.vorm, x.id).toBe('11v11');
      expect(x.versies.some((v) => v.vorm === '8v8'), x.id).toBe(OOK_8V8.includes(x.id));
    }
  });
});

for (const x of HERVATTINGEN) {
  for (const v of x.versies) {
    describe(`${x.id} (${v.id})`, () => {
      const t = v.maak();
      const r = lijnenNaarAnimatie(t);
      const muur = new Set(v.muur ?? []);
      it('beide teams compleet (half veld: zonder de verre keeper), binnen het veld', () => {
        const info = spelvorm(v.vorm);
        const { breedte, lengte } = veldMaten(t);
        const veld = (team: 'A' | 'B') => t.objecten.filter((o) => o.soort === 'speler' && o.team === team).length;
        expect(veld('A'), 'rood').toBe(info.spelers - 1);
        expect(veld('B'), 'blauw').toBe(info.spelers - 1);
        expect(t.objecten.filter((o) => o.soort === 'keeper').length).toBe(t.veld.type === 'heel' ? 2 : 1);
        for (const p of t.objecten.filter((o) => o.soort === 'speler' || o.soort === 'keeper')) {
          expect(p.x, p.id).toBeGreaterThanOrEqual(0);
          expect(p.x, p.id).toBeLessThanOrEqual(breedte);
          expect(p.y, p.id).toBeGreaterThan(0);
          expect(p.y, p.id).toBeLessThan(lengte);
        }
      });
      it('lijnen met stapnummers spelen af zonder meldingen en zonder fysieke fouten', () => {
        expect((t.lijnen ?? []).length).toBeGreaterThan(1);
        expect(r.meldingen).toEqual([]);
        expect(fysiekeFouten(r.tekening)).toEqual([]);
      });
      it('spelers houden afstand (≥ 1,5 m; in een muur ≥ 0,6 m)', () => {
        const tl = maakTijdlijn(r.tekening);
        const ids = r.tekening.objecten.filter((o) => o.soort === 'speler' || o.soort === 'keeper').map((o) => o.id);
        const problemen: string[] = [];
        for (let tt = 0; tt <= tl.duur; tt += 0.05) {
          const s = standOp(tl, tt);
          for (let i = 0; i < ids.length; i++) {
            const a = s.objecten.get(ids[i]!)!;
            for (let j = i + 1; j < ids.length; j++) {
              const b = s.objecten.get(ids[j]!)!;
              const d = Math.hypot(a.x - b.x, a.y - b.y);
              const min = muur.has(ids[i]!) && muur.has(ids[j]!) ? 0.6 : 1.5;
              if (d < min) problemen.push(`${ids[i]}–${ids[j]} ${d.toFixed(2)} m op t=${tt.toFixed(2)}`);
            }
          }
        }
        expect(problemen.slice(0, 6)).toEqual([]);
      });
      it(x.groep === 'verdedigen' ? 'eindigt met wegwerken of vangen' : 'eindigt met een doelpunt of een kans', () => {
        const ballen = r.tekening.animatie!.flatMap((s) => ('acties' in s ? s.acties : [])).filter((a): a is BalActie => a.type === 'pass' || a.type === 'schot');
        const laatste = ballen[ballen.length - 1]!;
        if (x.groep === 'verdedigen') {
          // De laatste bal gaat naar een eigen (rode) speler, of de eigen keeper vangt hem.
          const naarRood = typeof laatste.naar === 'string' && laatste.naar.startsWith('a');
          expect(naarRood || (laatste.type === 'schot' && laatste.afloop === 'vangt'), x.id).toBe(true);
        } else if (x.id === 'inworp-kaats') {
          expect(laatste.type).toBe('pass');
        } else {
          const tl = maakTijdlijn(r.tekening);
          const bal = standOp(tl, tl.duur + 2).objecten.get('bal1')!;
          expect(bal.y, `${x.id}: bal in het goal`).toBeLessThan(0.2);
        }
      });
    });
  }
}

describe('inworp met lijnen', () => {
  it('een pass vanaf de zijlijn wordt een inworp (met twee handen)', () => {
    const x = HERVATTINGEN.find((h) => h.id === 'lange-inworp')!;
    const r = lijnenNaarAnimatie(x.versies[0]!.maak());
    const eerste = r.tekening.animatie!.flatMap((s) => ('acties' in s ? s.acties : [])).find((a) => a.type === 'pass') as BalActie;
    expect(eerste.worp).toBe('inworp');
  });
});
