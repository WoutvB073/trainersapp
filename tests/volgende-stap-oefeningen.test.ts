import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { vindOefening } from '../src/data/oefeningen';
import { leesOntwerp } from '../src/engine/ontwerp';
import { heeftCategorieIcoon } from '../src/components/CategorieIcoon';
import { CATEGORIEEN } from '../src/data/categorieen';

/** Fase 1 van de volgende stap: de vijf uitgewerkte oefeningen uit VOORSTEL-OEFENINGEN.md en de ontwerplaag. */

const VIJF = ['veld-tq-kruis-opendraaien', 'veld-pt-ruit-derde-man', 'veld-af-schot-rebound-intikken', 'veld-vo-kantelen-blok', 'keeper-ld-zit-sta-duik'];

describe('vijf uitgewerkte oefeningen', () => {
  it('bestaan, met leeftijd, coachpunten en Makkelijker/Moeilijker', () => {
    for (const id of VIJF) {
      const o = vindOefening(id)!;
      expect(o, id).toBeTruthy();
      expect(o.leeftijden?.length, id).toBeGreaterThan(0);
      expect(o.coachpunten.length, id).toBeGreaterThanOrEqual(2);
      expect(o.coachpunten.length, id).toBeLessThanOrEqual(4);
      expect(o.variaties?.makkelijker?.length, id).toBeGreaterThan(0);
      expect(o.variaties?.moeilijker?.length, id).toBeGreaterThan(0);
      expect(() => maakTijdlijn(o.tekening), id).not.toThrow();
    }
  });

  it('rebound: de keeper keert het schot en de loper tikt de bal daarna binnen', () => {
    const o = vindOefening('veld-af-schot-rebound-intikken')!;
    const tl = maakTijdlijn(o.tekening);
    const vluchten = tl.balEvents.get('b1')!.filter((e) => e.soort === 'vlucht');
    // Schot, rebound (van de keeper af) en de intikker.
    expect(vluchten).toHaveLength(3);
    const eind = standOp(tl, vluchten[2]!.t1 + 0.1).objecten.get('b1')!;
    // De bal ligt achter de doellijn, tussen de palen.
    expect(eind.y).toBeLessThan(0.1);
    expect(Math.abs(eind.x - 34)).toBeLessThan(3.66);
  });

  it('keeper: begint zittend, staat op en duikt dan pas', () => {
    const o = vindOefening('keeper-ld-zit-sta-duik')!;
    const k = o.tekening.objecten.find((x) => x.id === 'k1')!;
    expect(k.houding).toBe('zit');
    const soorten = o.tekening.animatie!.flatMap((s) => ('acties' in s ? s.acties.map((a) => a.type) : []));
    expect(soorten.indexOf('opstaan')).toBeLessThan(soorten.indexOf('pass'));
    expect(soorten.filter((s) => s === 'zitten')).toHaveLength(2);
  });

  it('kantelen: de verdedigers houden hun volgorde (2, 3, 4, 5) en blijven dicht bij elkaar', () => {
    const o = vindOefening('veld-vo-kantelen-blok')!;
    const tl = maakTijdlijn(o.tekening);
    for (let t = 0; t <= tl.duur; t += 0.25) {
      const s = standOp(tl, t);
      const xs = ['d2', 'd3', 'd4', 'd5'].map((id) => s.objecten.get(id)!.x);
      for (let i = 1; i < xs.length; i++) {
        expect(xs[i]! - xs[i - 1]!, `t=${t}`).toBeGreaterThan(2.5);
        expect(xs[i]! - xs[i - 1]!, `t=${t}`).toBeLessThan(7);
      }
    }
  });
});

describe('ontwerplaag', () => {
  it('de app gebruikt altijd ontwerp Zacht (c); terug naar het oude kan alleen in de voorbeeldversie', () => {
    expect(leesOntwerp()).toBe('c');
  });

  it('elke categorie heeft een eigen lijnicoon', () => {
    for (const map of Object.keys(CATEGORIEEN) as (keyof typeof CATEGORIEEN)[]) {
      for (const c of CATEGORIEEN[map]) expect(heeftCategorieIcoon(map, c.id), `${map} ${c.id}`).toBe(true);
    }
  });
});

describe('proef Realistisch', () => {
  it('staat buiten de voorbeeldversie altijd uit', async () => {
    const { leesRealistisch } = await import('../src/engine/realistisch');
    expect(leesRealistisch()).toBe(false);
  });
});

describe('ontwerp Zacht (0.36.0)', () => {
  it('index.html start meteen in ontwerp c, en de CSS kent alleen nog richting c', async () => {
    const fs = await import('node:fs');
    expect(fs.readFileSync('index.html', 'utf8')).toContain('data-ontwerp="c"');
    const css = fs.readFileSync('src/styles/ontwerp.css', 'utf8');
    expect(css).not.toMatch(/data-ontwerp='[ab]'/);
    // Kaarten zijn dekkend (een doorzichtige kaart schijnt door menu's en panelen heen).
    expect(css).toMatch(/--kaart: #ffffff !important/);
  });
});
