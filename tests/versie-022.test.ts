import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { ARCHIEF, OEFENINGEN, vindOefening } from '../src/data/oefeningen';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { BAL_R, balInvoer, maakSkelet, nieuweStaat, persoonInvoer, poseer } from '../src/anim/poppetje';
import { naarCode, uitCode } from '../src/training/training';
import type { Stap, Tekening, VeldObject } from '../src/model/types';

/** Versie 0.22.0: opruimen, aangepaste en nieuwe keeperoefeningen, bouwstenen "draai" en "aantikken". */

const oef = (id: string) => {
  const o = OEFENINGEN.find((x) => x.id === id);
  if (!o) throw new Error(`niet in de bibliotheek: ${id}`);
  return o;
};
const t = (objecten: VeldObject[], animatie: Stap[]): Tekening => ({ veld: { type: 'leeg', breedte: 20, lengte: 14 }, objecten, animatie });

describe('bouwsteen: draai', () => {
  it('op de plek omdraaien naar een persoon of naar een vaste richting', () => {
    const tl = maakTijdlijn(
      t(
        [
          { id: 'k', soort: 'keeper', x: 10, y: 3, kijkrichting: -90 },
          { id: 'tr', soort: 'trainer', x: 10, y: 9 },
        ],
        [{ duur: 0.5, acties: [] }, { acties: [{ type: 'draai', wie: 'k', naar: 'tr' }] }, { duur: 0.5, acties: [] }, { acties: [{ type: 'draai', wie: 'k', kijk: 0 }] }],
      ),
    );
    const k = (tt: number) => standOp(tl, tt).objecten.get('k')!;
    expect(k(0.4).hoek).toBeCloseTo(-90, 0);
    expect(k(0.9).hoek).toBeCloseTo(90, 0);
    expect(k(0.9).x).toBeCloseTo(10, 6);
    expect(((k(tl.duur).hoek % 360) + 360) % 360).toBeCloseTo(0, 0);
  });
});

describe('bouwsteen: aantikken', () => {
  it('de keeper buigt en tikt de pion aan met de hand', () => {
    const tl = maakTijdlijn(
      t(
        [
          { id: 'k', soort: 'keeper', x: 10, y: 3, kijkrichting: 90 },
          { id: 'p', soort: 'pion', x: 10.7, y: 3.2 },
        ],
        [{ duur: 0.3, acties: [] }, { acties: [{ type: 'aantikken', wie: 'k', doel: 'p' }] }],
      ),
    );
    const sk = maakSkelet();
    const staat = nieuweStaat();
    let dichtst = Infinity;
    for (let tt = 0; tt <= tl.duur + 1e-9; tt += 1 / 30) {
      const s = standOp(tl, tt);
      const st = s.objecten.get('k')!;
      if (tt > 0.55 && tt < 0.65) expect(st.aantik?.u).toBeGreaterThan(0);
      poseer(sk, staat, { s: st, soort: 'keeper', t: tt, dtEcht: 1 / 30, dtAnim: 1 / 30, sprong: tt === 0, zaad: 0.2, ...persoonInvoer('k', 'keeper', st, s, balInvoer(s, [], BAL_R)) });
      const hand = [0, 1].map((i) => sk.pols[i as 0 | 1].getWorldPosition(new Vector3()));
      for (const h of hand) dichtst = Math.min(dichtst, h.distanceTo(new Vector3(10.7, 0.25, 3.2)));
    }
    // Pols (de handpalm zit nog ± 7 cm verder).
    expect(dichtst).toBeLessThan(0.25);
  });
});

describe('opruimen: archief', () => {
  const WEG = ['keeper-cv-drie-schoten-positie', 'keeper-bv-grondballen', 'keeper-vz-positie-meeschuiven', 'keeper-laag-duiken-kniezit', 'keeper-ld-hurkzit', 'keeper-ld-stand-twee-keepers'];
  it('weg uit de bibliotheek, wel te vinden (oude trainingen, links, favorieten, teams)', () => {
    for (const id of WEG) {
      expect(OEFENINGEN.some((o) => o.id === id)).toBe(false);
      expect(ARCHIEF.some((o) => o.id === id && o.verwijderd)).toBe(true);
      expect(vindOefening(id)?.id).toBe(id);
    }
    const code = naarCode({ naam: 'Oud', spelers: 0, keepers: 1, oefeningen: [WEG[3]!, 'keeper-ld-kniezit-hurkzit-stand'] });
    expect(uitCode(code)!.oefeningen.map((id) => vindOefening(id)?.id)).toEqual([WEG[3], 'keeper-ld-kniezit-hurkzit-stand']);
  });
});

describe('aangepaste en nieuwe keeperoefeningen', () => {
  it('categorieën zoals gevraagd', () => {
    const verwacht: Record<string, string[]> = {
      'keeper-bv-stuitballen': ['bal-verwerken', 'laag-duiken'],
      'keeper-ld-kniezit-hurkzit-stand': ['laag-duiken', 'warming-up'],
      'keeper-re-korte-afstand': ['reactie'],
      'keeper-1o1-spreidsprong': ['een-op-een'],
      'keeper-ld-drie-pionnen-korte-hoek': ['laag-duiken', 'hoog-duiken'],
      'keeper-hd-horde-volley-hoog': ['hoog-duiken', 'bal-verwerken'],
      'keeper-bv-schuin-midden-schuin': ['bal-verwerken'],
      'keeper-bv-schuin-twee-lage': ['bal-verwerken', 'laag-duiken'],
    };
    for (const [id, cat] of Object.entries(verwacht)) {
      const o = oef(id);
      expect(o.categorieen).toEqual(cat);
      expect(o.coachpunten.length).toBeGreaterThanOrEqual(2);
      expect(o.coachpunten.length).toBeLessThanOrEqual(4);
      expect(o.variaties.makkelijker.length).toBeGreaterThan(0);
      expect(o.variaties.moeilijker.length).toBeGreaterThan(0);
      expect(o.keepersNodig).toBeGreaterThanOrEqual(1);
    }
  });

  it('Stuitbal: zijwaarts langs de pionnen, stuitbal vangen, dan een lage duik', () => {
    const tl = maakTijdlijn(oef('keeper-bv-stuitballen').tekening);
    const s = [...Array(Math.ceil(tl.duur * 20)).keys()].map((i) => standOp(tl, i / 20).objecten.get('k1')!);
    expect(s.some((x) => x.manier === 'zijwaarts')).toBe(true);
    expect(s.some((x) => x.liggen > 0.9)).toBe(true);
    const stuit = [...tl.balEvents.values()].flat().filter((e) => e.soort === 'vlucht' && e.daarna === 'k1');
    expect(stuit.length).toBeGreaterThanOrEqual(2);
  });

  it('Laag duiken: kniezit, hurkzit en stand na elkaar, steeds twee duiken', () => {
    const tl = maakTijdlijn(oef('keeper-ld-kniezit-hurkzit-stand').tekening);
    const soorten: string[] = [];
    let duiken = 0;
    let lag = false;
    for (let tt = 0; tt < tl.duur; tt += 0.05) {
      const k = standOp(tl, tt).objecten.get('k1')!;
      if (k.zit > 0.95 && k.zitSoort && soorten.at(-1) !== k.zitSoort) soorten.push(k.zitSoort);
      if (k.liggen > 0.9 && !lag) duiken++;
      lag = k.liggen > 0.9;
    }
    expect(soorten).toEqual(['kniezit', 'hurkzit']);
    expect(duiken).toBe(6);
  });

  it('Reflexen: rug naar de trainer, op het teken omdraaien en direct een schot', () => {
    const tl = maakTijdlijn(oef('keeper-re-korte-afstand').tekening);
    expect(standOp(tl, 0.5).objecten.get('k1')!.hoek).toBeCloseTo(-90, 0);
    const schoten = [...tl.balEvents.values()].flat().filter((e) => e.soort === 'vlucht' && e.daarna === 'k1' && e.passeerder === 't1');
    expect(schoten.length).toBe(3);
    for (const e of schoten) {
      if (e.soort !== 'vlucht') continue;
      const h = standOp(tl, e.t1).objecten.get('k1')!.hoek;
      expect(Math.abs(((h - 90 + 540) % 360) - 180)).toBeLessThan(25);
    }
  });

  it('Spreidsprong: eerst kaatsen, dan 1 op 1 met een blok', () => {
    const tl = maakTijdlijn(oef('keeper-1o1-spreidsprong').tekening);
    expect(tl.loslaten.filter((x) => x.wie === 'k1' && x.soort === 'voet').length).toBe(2);
    expect(tl.blokken.map((b) => b.soort)).toEqual(['ster']);
  });

  it('Drie pionnen: drie keer aantikken en in de korte hoek duiken (één hoog)', () => {
    const tl = maakTijdlijn(oef('keeper-ld-drie-pionnen-korte-hoek').tekening);
    expect(tl.aantikken.get('k1')?.length).toBe(3);
    const duiken = [...tl.houdingen.get('k1')!].filter((e) => e.houding === 'duik');
    expect(duiken.length).toBe(3);
    expect(duiken.filter((d) => (d.hoog ?? 0) > 1).length).toBe(1);
  });

  it('Horde heen en terug: vier keer over de horde, een volley vangen en een hoge duik', () => {
    const tl = maakTijdlijn(oef('keeper-hd-horde-volley-hoog').tekening);
    expect(tl.bewegingen.get('k1')!.filter((b) => b.manier === 'hordes').length).toBe(4);
    const duiken = [...tl.houdingen.get('k1')!].filter((e) => e.houding === 'duik');
    expect(duiken.length).toBe(1);
    expect(duiken[0]!.hoog).toBeGreaterThan(1.5);
  });

  it('Schuin–midden–schuin en Schuin uit + twee lage ballen: drie schutters en doorwisselen', () => {
    for (const id of ['keeper-bv-schuin-midden-schuin', 'keeper-bv-schuin-twee-lage']) {
      const tl = maakTijdlijn(oef(id).tekening);
      const naarK1 = [...tl.balEvents.values()].flat().filter((e) => e.soort === 'vlucht' && e.daarna === 'k1');
      expect(new Set(naarK1.map((e) => (e.soort === 'vlucht' ? e.passeerder : ''))).size).toBe(3);
      const eind = standOp(tl, tl.duur).objecten.get('k3')!;
      expect(Math.hypot(eind.x - 34, eind.y - 1.4)).toBeLessThan(0.3);
    }
  });
});
