import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { OEFENINGEN } from '../src/data/oefeningen';
import { maakTijdlijn, standOp, type Tijdlijn } from '../src/anim/timeline';
import { BAL_R, balInvoer, laagste, maakSkelet, nieuweStaat, persoonInvoer, poseer, type Skelet } from '../src/anim/poppetje';
import type { Stap, Tekening, VeldObject } from '../src/model/types';

/** Versie 0.24.0: bouwstenen wegtikken met één hand, kopbal en volley op hoogte; nieuwe keeperoefeningen (deel C). */

const t = (objecten: VeldObject[], animatie: Stap[]): Tekening => ({ veld: { type: 'leeg', breedte: 20, lengte: 16 }, objecten, animatie });

/** Poseert één persoon over de hele tijdlijn; geeft per tijdstip het skelet en de stand aan `elk`. */
function speel(tl: Tijdlijn, id: string, elk: (tt: number, sk: Skelet, balInHand: number) => void) {
  const sk = maakSkelet();
  const staat = nieuweStaat();
  const soort = tl.objecten.get(id)!.soort as 'keeper' | 'speler' | 'trainer';
  const ballen = [...tl.objecten.values()].filter((o) => o.soort === 'bal').map((o) => o.id);
  const n = Math.round(tl.duur * 30);
  for (let i = 0; i <= n; i++) {
    const tt = i / 30;
    const s = standOp(tl, tt);
    const st = s.objecten.get(id)!;
    poseer(sk, staat, { s: st, soort, t: tt, dtEcht: 1 / 30, dtAnim: 1 / 30, sprong: i === 0, zaad: 0.3, ...persoonInvoer(id, soort, st, s, balInvoer(s, ballen, BAL_R)) });
    elk(tt, sk, staat.balInHand);
  }
}
const wereld = (tl: Tijdlijn, tt: number, id: string) => {
  const b = standOp(tl, tt).objecten.get(id)!;
  return new Vector3(b.x, b.hoogte + BAL_R, b.y);
};

describe('bouwsteen: wegtikken met één hand', () => {
  const tl = maakTijdlijn(
    t(
      [
        { id: 'k', soort: 'keeper', x: 10, y: 3, houding: 'kniezit', kijkrichting: 90 },
        { id: 'b', soort: 'bal', x: 10, y: 3.5 },
      ],
      [{ duur: 0.6, acties: [] }, { acties: [{ type: 'pass', van: 'k', naar: [14, 7], bal: 'b', worp: 'tik' }] }, { duur: 0.4, acties: [] }],
    ),
  );
  const vlucht = tl.balEvents.get('b')!.find((e) => e.soort === 'vlucht')!;
  it('de bal gaat vanaf de grond weg (laag) en de keeper heeft hem nooit in de hand', () => {
    let inHand = 0;
    speel(tl, 'k', (_tt, _sk, bih) => (inHand = Math.max(inHand, bih)));
    expect(inHand).toBe(0);
    let hoogst = 0;
    for (let tt = vlucht.t0; tt < vlucht.t1; tt += 0.02) hoogst = Math.max(hoogst, standOp(tl, tt).objecten.get('b')!.hoogte);
    expect(hoogst).toBeLessThan(0.6);
  });
  it('een hand raakt de bal op het moment van wegtikken; de keeper blijft op de grond', () => {
    let d = Infinity;
    let min = Infinity;
    speel(tl, 'k', (tt, sk) => {
      min = Math.min(min, laagste(sk));
      if (Math.abs(tt - vlucht.t0) < 0.05) {
        const bal = wereld(tl, tt, 'b');
        for (const i of [0, 1] as const) d = Math.min(d, sk.pols[i].localToWorld(new Vector3(0, -0.09, 0)).distanceTo(bal));
      }
    });
    expect(d).toBeLessThan(0.35);
    expect(min).toBeGreaterThan(-0.01);
  });
});

describe('bouwsteen: kopbal en volley op hoogte', () => {
  /** Trainer gooit hoog aan; de keeper speelt de bal direct door met de voet of het hoofd. */
  const wegwerken = (eindHoogte: number) =>
    maakTijdlijn(
      t(
        [
          { id: 'k', soort: 'keeper', x: 10, y: 3, kijkrichting: 90 },
          { id: 'tr', soort: 'trainer', x: 10, y: 13 },
          { id: 'b', soort: 'bal', x: 10, y: 12.6, bij: 'tr' },
        ],
        [
          { duur: 0.3, acties: [] },
          { acties: [{ type: 'pass', van: 'tr', naar: 'k', worp: 'onderhands', hoogte: 3, eindHoogte }] },
          { acties: [{ type: 'pass', van: 'k', naar: [3, 12], worp: 'voet', direct: true, hoogte: 4 }] },
          { duur: 0.4, acties: [] },
        ],
      ),
    );
  const trapHoogte = (tl: Tijdlijn) => {
    let h = 0;
    for (let tt = 0; tt < tl.duur; tt += 0.02) h = Math.max(h, standOp(tl, tt).objecten.get('k')!.trap?.hoogte ?? 0);
    return h;
  };
  /** Hoe ver een voet tijdens de trap vóór het bekken komt (kijkrichting +y = wereld +z): de trapbeweging. */
  const voetHoog = (tl: Tijdlijn) => {
    let h = 0;
    speel(tl, 'k', (tt, sk) => {
      if (!standOp(tl, tt).objecten.get('k')!.trap) return;
      const bekken = sk.bekken.getWorldPosition(new Vector3()).z;
      for (const i of [0, 1] as const) h = Math.max(h, sk.enkel[i].getWorldPosition(new Vector3()).z - bekken);
    });
    return h;
  };
  /** Hoogste enkel tijdens de trap. */
  const enkelHoog = (tl: Tijdlijn) => {
    let h = 0;
    speel(tl, 'k', (tt, sk) => {
      if (standOp(tl, tt).objecten.get('k')!.trap) for (const i of [0, 1] as const) h = Math.max(h, sk.enkel[i].getWorldPosition(new Vector3()).y);
    });
    return h;
  };
  it('kopbal: hoge bal (± 1,7 m) → geen beenzwaai (wel een sprongetje), het hoofd gaat naar de bal', () => {
    const tl = wegwerken(1.7);
    expect(trapHoogte(tl)).toBeGreaterThan(1.25);
    expect(voetHoog(tl)).toBeLessThan(0.3);
    let hoofdMin = Infinity;
    let hoofdMax = -Infinity;
    speel(tl, 'k', (tt, sk) => {
      if (standOp(tl, tt).objecten.get('k')!.trap) {
        hoofdMin = Math.min(hoofdMin, sk.hoofd.rotation.x);
        hoofdMax = Math.max(hoofdMax, sk.hoofd.rotation.x);
      }
    });
    expect(hoofdMax - hoofdMin).toBeGreaterThan(0.3);
  });
  it('volley: halfhoge bal (± 0,6 m) → de trapvoet gaat mee omhoog naar de bal', () => {
    const tl = wegwerken(0.6);
    const h = trapHoogte(tl);
    expect(h).toBeGreaterThan(0.4);
    expect(h).toBeLessThan(1.25);
    // Geen sprong bij een volley: de hoge enkel is echt de trapvoet.
    for (let tt = 0; tt < tl.duur; tt += 0.02) expect(standOp(tl, tt).objecten.get('k')!.sprong).toBe(0);
    expect(enkelHoog(tl)).toBeGreaterThan(0.35);
  });
});

describe('nieuwe oefeningen 0.24.0', () => {
  const VERWACHT: Record<string, [string[], number]> = {
    'keeper-vz-stompen-hoek-dichtzetten': [['voorzetten', 'een-op-een'], 3],
    'keeper-vz-hordes-hoge-bal-claimen': [['voorzetten', 'warming-up'], 1],
    'keeper-vz-meelezen-andere-keeper': [['voorzetten', 'reactie'], 2],
    'keeper-vz-claimen-schutter-horen': [['voorzetten', 'reactie'], 3],
    'keeper-vz-voorzet-uitworp-doorspelen': [['voorzetten', 'passing'], 3],
    'keeper-vz-circuit-stompen-hordes-lob': [['voorzetten', 'laag-duiken', 'reactie'], 3],
    'keeper-vz-een-hand-stompen-paal': [['voorzetten', 'laag-duiken', 'reactie'], 2],
    'keeper-ps-terugspeelbal-geroepen-doeltje': [['passing', 'reactie'], 1],
    'keeper-ps-wegwerken-en-terug': [['passing', 'reactie'], 2],
    'keeper-ps-uitspelen-druk-minidoeltjes': [['passing', 'een-op-een'], 3],
    'keeper-ps-scannen-uitspelen-1op1': [['passing', 'een-op-een', 'reactie'], 2],
    'keeper-ps-uitspelen-hoek-tweede-bal': [['passing', 'laag-duiken'], 3],
    'keeper-ps-terugspeelbal-draaien-schot': [['passing', 'laag-duiken'], 3],
    'keeper-ps-aannemen-wegdraaien-pop': [['passing'], 1],
    'keeper-ps-uitkomen-een-keer-passen': [['passing', 'warming-up'], 3],
    'keeper-ps-lange-bal-lange-worp': [['passing'], 2],
    'keeper-ps-drie-poorten-dropkicks': [['passing', 'warming-up'], 3],
    'keeper-ps-lezen-verdediger': [['passing'], 3],
    'keeper-ps-uitspelen-druk-dan-lang': [['passing'], 4],
    'keeper-1op1-stilliggende-bal-lezen': [['een-op-een', 'reactie'], 1],
    'keeper-1op1-hoek-dichtlopen-nieuwe-hoek': [['een-op-een'], 2],
    'keeper-1op1-keeper-met-verdediger': [['een-op-een', 'reactie'], 2],
    'keeper-1op1-uitspelen-hoek-verkleinen': [['een-op-een', 'passing'], 2],
    'keeper-sp-vier-doeltjes': [['spelletjes', 'een-op-een'], 4],
    'keeper-sp-twee-tegen-twee-twee-doelen': [['spelletjes', 'een-op-een'], 2],
    'keeper-sp-een-op-een-competitie': [['spelletjes', 'een-op-een'], 3],
  };
  it(`${Object.keys(VERWACHT).length} oefeningen met de gevraagde categorieën, het aantal keepers en complete gegevens`, () => {
    for (const [id, [cat, keepers]] of Object.entries(VERWACHT)) {
      const o = OEFENINGEN.find((x) => x.id === id);
      expect(o, id).toBeDefined();
      expect(o!.categorieen, id).toEqual(cat);
      expect(o!.keepersNodig, id).toBe(keepers);
      // Evenveel keepers in de tekening als nodig (de trainer telt niet mee).
      expect(o!.tekening.objecten.filter((x) => x.soort === 'keeper').length, id).toBe(keepers);
      expect(o!.coachpunten.length, id).toBeGreaterThanOrEqual(2);
      expect(o!.coachpunten.length, id).toBeLessThanOrEqual(4);
      expect(o!.variaties.makkelijker.length * o!.variaties.moeilijker.length, id).toBeGreaterThan(0);
      expect(o!.benodigdheden.length, id).toBeGreaterThan(0);
      expect(typeof o!.doorwisselbaar, id).toBe('boolean');
      expect(o!.tekening.animatie?.length, id).toBeGreaterThan(2);
    }
  });
  it('geen namen van clubs, trainers, apps of websites in de teksten', () => {
    for (const id of Object.keys(VERWACHT)) {
      const o = OEFENINGEN.find((x) => x.id === id)!;
      const tekst = [o.naam, o.uitleg, o.organisatie, ...o.coachpunten, ...o.variaties.makkelijker, ...o.variaties.moeilijker].join(' ');
      expect(tekst, id).not.toMatch(/https?:|www\.|\.nl\b|\.com\b|youtube|instagram|academy/i);
    }
  });
  it('wegtikken met één hand, kopbal en blokken met de voeten zitten in de oefeningen', () => {
    const tl = (id: string) => maakTijdlijn(OEFENINGEN.find((x) => x.id === id)!.tekening);
    expect(tl('keeper-vz-een-hand-stompen-paal').loslaten.some((x) => x.wie === 'k1' && x.soort === 'tik')).toBe(true);
    const kop = tl('keeper-ps-wegwerken-en-terug');
    let h = 0;
    for (let tt = 0; tt < kop.duur; tt += 0.02) h = Math.max(h, standOp(kop, tt).objecten.get('k1')!.trap?.hoogte ?? 0);
    expect(h).toBeGreaterThan(1.25);
    expect(tl('keeper-1op1-stilliggende-bal-lezen').blokken.map((b) => b.soort)).toEqual(['voeten']);
  });
});
