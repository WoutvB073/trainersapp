import { describe, expect, it } from 'vitest';
import { BESTANDEN, OEFENINGEN } from '../src/data/oefeningen';
import { CATEGORIEEN } from '../src/data/categorieen';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import type { ObjectSoort } from '../src/model/types';

const MAP_SOORT: Record<string, string> = { veld: 'veld', keepers: 'keeper' };
const SOORTEN: ObjectSoort[] = [
  'speler', 'keeper', 'trainer', 'bal', 'goal', 'klein-goal', 'pion', 'hoedje', 'paaltje', 'ladder',
  'horde', 'ring', 'zone', 'muurtje', 'rebounder', 'keepersmat', 'stok', 'tekst',
];

describe('oefeningen (databestanden)', () => {
  it('er zijn bestanden voor veld en keepers', () => {
    expect(BESTANDEN.some((b) => b.map === 'veld')).toBe(true);
    expect(BESTANDEN.some((b) => b.map === 'keepers')).toBe(true);
  });

  it('id’s zijn uniek', () => {
    const ids = OEFENINGEN.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const bestand of BESTANDEN) {
    describe(bestand.pad, () => {
      it('map en bestandsnaam kloppen', () => {
        expect(Object.keys(MAP_SOORT)).toContain(bestand.map);
        const soort = MAP_SOORT[bestand.map] as 'veld' | 'keeper';
        expect(CATEGORIEEN[soort].map((c) => c.id)).toContain(bestand.categorie);
      });

      for (const o of bestand.oefeningen) {
        it(`${o.id}: velden en categorieën`, () => {
          expect(o.soort).toBe(MAP_SOORT[bestand.map]);
          expect(o.categorieen[0]).toBe(bestand.categorie);
          const geldig = CATEGORIEEN[o.soort].map((c) => c.id);
          for (const c of o.categorieen) expect(geldig).toContain(c);
          expect(o.naam.length).toBeGreaterThan(2);
          expect(o.uitleg.length).toBeGreaterThan(10);
          expect(o.organisatie?.length ?? 0).toBeGreaterThan(10);
          expect(o.coachpunten.length).toBeLessThanOrEqual(5);
          expect(Number.isInteger(o.spelersNodig) && o.spelersNodig >= 0).toBe(true);
          expect(Number.isInteger(o.keepersNodig) && o.keepersNodig >= 0).toBe(true);
          expect(o.benodigdheden.length).toBeGreaterThan(0);
          expect(o.coachpunten.length).toBeGreaterThan(0);
          expect(o.variaties.makkelijker.length).toBeGreaterThan(0);
          expect(o.variaties.moeilijker.length).toBeGreaterThan(0);
          if (o.soort === 'keeper') expect(o.keepersNodig).toBeGreaterThan(0);
        });

        it(`${o.id}: tekening en animatie`, () => {
          const ids = o.tekening.objecten.map((x) => x.id);
          expect(new Set(ids).size).toBe(ids.length);
          for (const x of o.tekening.objecten) expect(SOORTEN).toContain(x.soort);
          const tl = maakTijdlijn(o.tekening);
          expect(tl.duur).toBeGreaterThan(1);
          // Genoeg spelers/keepers in de tekening voor wat de oefening vraagt.
          const aantal = (s: ObjectSoort) => o.tekening.objecten.filter((x) => x.soort === s).length;
          expect(aantal('speler')).toBeGreaterThanOrEqual(o.spelersNodig);
          expect(aantal('keeper')).toBeGreaterThanOrEqual(Math.min(1, o.keepersNodig));
        });
      }
    });
  }
});

describe('animaties: niet door elkaar of door materiaal heen', () => {
  const VAST = ['pion', 'paaltje', 'hoedje'];
  for (const o of OEFENINGEN) {
    it(`${o.id}: poppetjes houden afstand`, () => {
      const tl = maakTijdlijn(o.tekening);
      const personen = o.tekening.objecten.filter((x) => x.soort === 'speler' || x.soort === 'keeper' || x.soort === 'trainer').map((x) => x.id);
      const materiaal = o.tekening.objecten.filter((x) => VAST.includes(x.soort));
      const problemen: string[] = [];
      for (let t = 0; t <= tl.duur; t += 0.05) {
        const s = standOp(tl, t);
        for (let i = 0; i < personen.length; i++) {
          const a = s.objecten.get(personen[i]!)!;
          for (let j = i + 1; j < personen.length; j++) {
            const b = s.objecten.get(personen[j]!)!;
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 1.5) problemen.push(`${personen[i]}–${personen[j]} ${d.toFixed(2)} m op t=${t.toFixed(2)}`);
          }
          for (const m of materiaal) {
            const d = Math.hypot(a.x - m.x, a.y - m.y);
            if (d < 0.5) problemen.push(`${personen[i]} door ${m.id} (${d.toFixed(2)} m) op t=${t.toFixed(2)}`);
          }
        }
      }
      expect(problemen.slice(0, 5)).toEqual([]);
    });
  }
});

describe('bal wisselt alleen van speler via een pass of schot', () => {
  for (const o of OEFENINGEN) {
    it(`${o.id}`, () => {
      const tl = maakTijdlijn(o.tekening);
      const ballen = o.tekening.objecten.filter((x) => x.soort === 'bal').map((x) => x.id);
      const vorige = new Map<string, string | null>();
      const fouten: string[] = [];
      for (let t = 0; t <= tl.duur + 0.5; t += 0.02) {
        const s = standOp(tl, t);
        for (const b of ballen) {
          const h = s.objecten.get(b)!.houder;
          const v = vorige.get(b);
          // Van de ene speler direct naar de andere, zonder dat de bal los of onderweg was: niet goed.
          if (v && h && v !== h) fouten.push(`${b}: ${v} → ${h} op t=${t.toFixed(2)}`);
          vorige.set(b, h);
        }
      }
      expect(fouten).toEqual([]);
    });
  }
});

describe('keeper blijft in zijn doelgebied (tenzij uitkomen mag)', () => {
  for (const o of OEFENINGEN) {
    const keepers = o.tekening.objecten.filter((x) => x.soort === 'keeper' && !x.uitkomen);
    const goals = o.tekening.objecten.filter((x) => x.soort === 'goal' || x.soort === 'klein-goal');
    if (!keepers.length || !goals.length) continue;
    it(`${o.id}`, () => {
      const tl = maakTijdlijn(o.tekening);
      const fouten: string[] = [];
      for (const k of keepers) {
        const g = goals.find((x) => x.id === k.verdedigt) ?? goals.reduce((a, b) => (Math.hypot(b.x - k.x, b.y - k.y) < Math.hypot(a.x - k.x, a.y - k.y) ? b : a));
        const h = ((g.hoek ?? 0) * Math.PI) / 180;
        for (let t = 0; t <= tl.duur + 1; t += 0.05) {
          const s = standOp(tl, t).objecten.get(k.id)!;
          const rx = s.x - g.x;
          const ry = s.y - g.y;
          const lx = rx * Math.cos(h) + ry * Math.sin(h);
          const ly = -rx * Math.sin(h) + ry * Math.cos(h);
          // Doelgebied (5,5 m × 18,32 m) met een halve meter speling; even achter de lijn mag bij een duik.
          if (Math.abs(lx) > 9.16 + 0.5 || ly > 5.5 + 0.5 || ly < -0.8) fouten.push(`${k.id} op (${s.x.toFixed(1)}, ${s.y.toFixed(1)}) t=${t.toFixed(2)}`);
        }
      }
      expect(fouten.slice(0, 3)).toEqual([]);
    });
  }
});
