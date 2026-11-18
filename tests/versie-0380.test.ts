import { describe, expect, it } from 'vitest';
import { Color, InstancedMesh } from 'three';
import { PoppetjesInstelling } from '../src/engine/poppetjes';
import { maakSkelet, popKleuren, Poppetjes, MAAT } from '../src/anim/poppetje';
import { ECHT_DELEN, echtGeometrie, KAPSELS, type EchtDeelNaam } from '../src/anim/popEcht';

/** Versie 0.38.0 (fase 2, deel 4): realistische 3D-weergave met automatisch terugvallen. */

class Opslag {
  data = new Map<string, string>();
  constructor(begin: [string, string][] = []) {
    for (const [k, v] of begin) this.data.set(k, v);
  }
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

describe('niveaus van de poppetjes', () => {
  it('standaard realistisch; bij haperen een stap lichter, tot eenvoudig', () => {
    const o = new Opslag();
    const p = new PoppetjesInstelling(o);
    expect(p.get()).toEqual({ niveau: 'realistisch', eenvoudig: false, automatisch: false, zelf: false });
    expect(p.verlaag()).toBe('gewoon');
    expect(new PoppetjesInstelling(o).get()).toMatchObject({ niveau: 'gewoon', automatisch: true });
    expect(p.verlaag()).toBe('eenvoudig');
    expect(new PoppetjesInstelling(o).get()).toMatchObject({ niveau: 'eenvoudig', eenvoudig: true, automatisch: true });
    expect(p.verlaag()).toBe(null);
  });

  it('zelf gekozen blijft staan (geen automatisch lager), en weer automatisch begint opnieuw bij realistisch', () => {
    const o = new Opslag();
    const p = new PoppetjesInstelling(o);
    for (const n of ['realistisch', 'gewoon', 'eenvoudig'] as const) {
      p.kies(n);
      expect(p.get()).toMatchObject({ niveau: n, zelf: true, automatisch: false });
      expect(p.verlaag()).toBe(null);
      expect(new PoppetjesInstelling(o).get().niveau).toBe(n);
    }
    p.automatischKiezen();
    expect(p.get()).toMatchObject({ niveau: 'realistisch', zelf: false });
  });

  it('oude instellingen van vóór 0.38.0', () => {
    // Eenvoudige poppetjes zelf aangezet: blijft eenvoudig.
    expect(new PoppetjesInstelling(new Opslag([['trainersapp.poppetjes', 'eenvoudig']])).get()).toMatchObject({ niveau: 'eenvoudig', zelf: true });
    // Automatisch eenvoudig (toestel te traag gebleken): blijft eenvoudig.
    expect(new PoppetjesInstelling(new Opslag([['trainersapp.poppetjesAuto', '1']])).get()).toMatchObject({ niveau: 'eenvoudig', automatisch: true });
    // Zelf uitgezet ('normaal'): realistisch, en zoals toen nooit vanzelf eenvoudig (dan 2D).
    const p = new PoppetjesInstelling(new Opslag([['trainersapp.poppetjes', 'normaal']]));
    expect(p.get()).toMatchObject({ niveau: 'realistisch', zelf: false });
    expect(p.verlaag()).toBe('gewoon');
    expect(p.verlaag()).toBe(null);
    expect(p.get().niveau).toBe('gewoon');
  });

  it('zonder opslag (privévenster) werkt lager zetten tot de app sluit', () => {
    const p = new PoppetjesInstelling(undefined);
    expect(p.get().niveau).toBe('realistisch');
    expect(p.verlaag()).toBe('gewoon');
    expect(p.get().niveau).toBe('gewoon');
    expect(p.verlaag()).toBe('eenvoudig');
  });
});

describe('realistische figuur (popEcht.ts)', () => {
  const namen = [...new Set(ECHT_DELEN.map((d) => d.naam))] as EchtDeelNaam[];

  it('elk deel heeft vertexkleuren tussen 0 en 1 (fijn en grof), en geen kapotte waarden', () => {
    for (const naam of namen) {
      for (const fijn of [true, false]) {
        const g = echtGeometrie(naam, fijn);
        const kleur = g.attributes.color;
        expect(kleur, naam).toBeDefined();
        expect(kleur!.count).toBe(g.attributes.position!.count);
        const arr = kleur!.array as Float32Array;
        expect(Math.min(...arr)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...arr)).toBeLessThanOrEqual(1);
        expect([...(g.attributes.position!.array as Float32Array)].every(Number.isFinite), naam).toBe(true);
        g.dispose();
      }
    }
  });

  it('de zool staat op het gras (net als de gewone schoen) en de romp blijft achter het rugnummer', () => {
    const zool = echtGeometrie('e-zool', true);
    zool.computeBoundingBox();
    expect(zool.boundingBox!.min.y).toBeCloseTo(-MAAT.enkel, 2);
    // Rugnummer: vlak op z = −0,118 bij y = 0,27 in de romp (render3d.ts, RUG). De rug mag daar niet doorheen steken.
    const romp = echtGeometrie('e-romp', true);
    const pos = romp.attributes.position!;
    let achterste = 0;
    for (let i = 0; i < pos.count; i++) if (Math.abs(pos.getY(i) - 0.27) < 0.05) achterste = Math.min(achterste, pos.getZ(i));
    expect(achterste).toBeGreaterThan(-0.118);
    expect(achterste).toBeLessThan(-0.09);
  });

  it('per poppetje één kapsel; handschoenen en lange mouwen alleen bij keeper (en lange mouwen bij de trainer)', () => {
    const p = new Poppetjes(3, 'echt');
    const figuren = [popKleuren('speler', '#e53935', 0.37), popKleuren('keeper', '#1e88e5', 0.61), popKleuren('trainer', '#263238', 0.13)];
    p.begin();
    for (const k of figuren) {
      const sk = maakSkelet();
      sk.wortel.updateMatrixWorld(true);
      p.teken(sk, k, true);
    }
    p.klaar();
    const aantal = (naam: string) => (p.lijst.find((m) => m.name === `${naam}|f`) as InstancedMesh).count;
    expect(KAPSELS.reduce((som, k) => som + aantal(k), 0)).toBe(3);
    expect(aantal('e-handschoen')).toBe(2);
    expect(aantal('e-hand')).toBe(4);
    expect(aantal('e-mouw-lang')).toBe(4);
    expect(aantal('e-mouw')).toBe(2);
    expect(aantal('e-romp')).toBe(3);
    // Het shirt houdt precies de teamkleur (duidelijkheid voor de trainer): de kleur per instantie is die van het hesje.
    const romp = p.lijst.find((m) => m.name === 'e-romp|f') as InstancedMesh;
    const c = new Color();
    romp.getColorAt(0, c);
    expect(c.getHexString()).toBe(new Color('#e53935').getHexString());
    romp.getColorAt(1, c);
    expect(c.getHexString()).toBe(new Color('#1e88e5').getHexString());
    p.opruimen();
  });

  it('kapsels en schoenen verschillen per speler, maar zijn per speler altijd hetzelfde', () => {
    const kapsels = new Set<number>();
    const schoenen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const zaad = (i * 0.6180339887) % 1;
      const k = popKleuren('speler', '#ffffff', zaad);
      expect(popKleuren('speler', '#ffffff', zaad).kapsel).toBe(k.kapsel);
      kapsels.add(k.kapsel);
      schoenen.add(k.schoenEcht.getHexString());
    }
    expect(kapsels.size).toBe(4);
    expect(schoenen.size).toBeGreaterThan(3);
    // De trainer: kort of stoppelkapsel, sportschoenen.
    for (let i = 0; i < 10; i++) expect([0, 1]).toContain(popKleuren('trainer', '#263238', i / 10).kapsel);
  });

  it('gewoon en eenvoudig blijven de poppetjes van vóór 0.38.0', () => {
    const gewoon = new Poppetjes(2, 'gewoon');
    expect(gewoon.lijst.some((m) => m.name.startsWith('e-'))).toBe(false);
    expect(gewoon.lijst.map((m) => m.name)).toContain('romp|f');
    const eenvoudig = new Poppetjes(2, true);
    expect(eenvoudig.lijst.every((m) => m.name.endsWith('|g'))).toBe(true);
    expect(eenvoudig.lijst.some((m) => m.name.startsWith('nek'))).toBe(false);
    gewoon.opruimen();
    eenvoudig.opruimen();
  });
});
