import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { OEFENINGEN } from '../src/data/oefeningen';
import { maakTijdlijn, standOp, type Tijdlijn } from '../src/anim/timeline';
import { BAL_R, balInvoer, laagste, maakSkelet, nieuweStaat, persoonInvoer, poseer, type Skelet } from '../src/anim/poppetje';
import type { Stap, Tekening, VeldObject } from '../src/model/types';

/** Versie 0.23.0: bouwstenen buikligging, halfknielend, draaisprong, blok met de voeten, aantikken met de voet/punt. */

const t = (objecten: VeldObject[], animatie: Stap[]): Tekening => ({ veld: { type: 'leeg', breedte: 20, lengte: 14 }, objecten, animatie });

/** Poseert één persoon over de hele tijdlijn; geeft per tijdstip het skelet aan `elk`. */
function speel(tl: Tijdlijn, id: string, elk: (tt: number, sk: Skelet) => void) {
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
    elk(tt, sk);
  }
}
const hoogte = (sk: Skelet, node: 'hoofd' | 'bekken') => sk[node].getWorldPosition(new Vector3()).y;

describe('bouwsteen: buikligging en opstaan', () => {
  it('op de buik ligt het lijf plat (hoofd laag), opstaan gaat geleidelijk naar rechtop', () => {
    const tl = maakTijdlijn(
      t([{ id: 'k', soort: 'keeper', x: 10, y: 5, houding: 'buik', kijkrichting: 90 }], [{ duur: 0.6, acties: [] }, { acties: [{ type: 'opstaan', wie: 'k' }] }, { duur: 0.6, acties: [] }]),
    );
    const hoofd: number[] = [];
    let min = Infinity;
    speel(tl, 'k', (_tt, sk) => {
      hoofd.push(hoogte(sk, 'hoofd'));
      min = Math.min(min, laagste(sk));
    });
    expect(hoofd[5]!).toBeLessThan(0.6);
    expect(hoofd.at(-1)!).toBeGreaterThan(1.3);
    expect(min).toBeGreaterThan(-0.01);
    // Geleidelijk: geen sprong van meer dan 0,25 m per beeld.
    for (let i = 1; i < hoofd.length; i++) expect(Math.abs(hoofd[i]! - hoofd[i - 1]!)).toBeLessThan(0.25);
    expect(standOp(tl, 0.3).objecten.get('k')!.zitSoort).toBe('buik');
  });
});

describe('bouwsteen: halfknielend', () => {
  it('één knie op de grond, bekken lager dan staand', () => {
    const tl = maakTijdlijn(t([{ id: 'k', soort: 'keeper', x: 10, y: 5, houding: 'halfknie' }], [{ duur: 0.6, acties: [] }]));
    let knieLaag = Infinity;
    let bekken = 0;
    speel(tl, 'k', (_tt, sk) => {
      knieLaag = Math.min(sk.knie[0].getWorldPosition(new Vector3()).y, sk.knie[1].getWorldPosition(new Vector3()).y);
      bekken = hoogte(sk, 'bekken');
    });
    expect(knieLaag).toBeLessThan(0.12);
    expect(bekken).toBeLessThan(0.7);
  });
});

describe('bouwsteen: draaisprong', () => {
  it('180° omdraaien en daarbij van de grond komen', () => {
    const tl = maakTijdlijn(
      t(
        [
          { id: 'k', soort: 'keeper', x: 10, y: 3, kijkrichting: -90 },
          { id: 'tr', soort: 'trainer', x: 10, y: 9 },
        ],
        [{ duur: 0.4, acties: [] }, { acties: [{ type: 'draai', wie: 'k', naar: 'tr', sprong: true }] }],
      ),
    );
    expect(Math.max(...[...Array(20).keys()].map((i) => standOp(tl, 0.35 + i * 0.03).objecten.get('k')!.sprong))).toBeGreaterThan(0.8);
    expect(standOp(tl, tl.duur).objecten.get('k')!.hoek).toBeCloseTo(90, 0);
  });
});

describe('bouwsteen: blokken met de voeten vooruit', () => {
  it('blok "voeten": bekken laag, voeten naar voren richting de bal', () => {
    const o = OEFENINGEN.find((x) => x.id === 'keeper-re-draaisprong-voetenblok')!;
    const tl = maakTijdlijn(o.tekening);
    expect(tl.blokken.map((b) => b.soort)).toEqual(['voeten']);
    const tBlok = tl.blokken[0]!.t;
    let bekkenBij = 9;
    let min = Infinity;
    speel(tl, 'k1', (tt, sk) => {
      if (Math.abs(tt - tBlok) < 0.02) bekkenBij = hoogte(sk, 'bekken');
      min = Math.min(min, laagste(sk));
    });
    expect(bekkenBij).toBeLessThan(0.45);
    expect(min).toBeGreaterThan(-0.01);
  });
});

describe('bouwsteen: aantikken met de voet en van een punt', () => {
  it('met de voet: een voet komt bij de pion', () => {
    const tl = maakTijdlijn(
      t(
        [
          { id: 'k', soort: 'keeper', x: 10, y: 3, kijkrichting: 90 },
          { id: 'p', soort: 'pion', x: 10, y: 3.8 },
        ],
        [{ duur: 0.3, acties: [] }, { acties: [{ type: 'aantikken', wie: 'k', doel: 'p', met: 'voet' }] }],
      ),
    );
    let d = Infinity;
    speel(tl, 'k', (_tt, sk) => {
      for (const i of [0, 1] as const) d = Math.min(d, sk.enkel[i].localToWorld(new Vector3(0, -0.075, 0.15)).distanceTo(new Vector3(10, 0.05, 3.8)));
    });
    expect(d).toBeLessThan(0.25);
  });
  it('de doelpaal aantikken (punt)', () => {
    const tl = maakTijdlijn(t([{ id: 'k', soort: 'keeper', x: 10, y: 3 }], [{ acties: [{ type: 'aantikken', wie: 'k', punt: [10.6, 3.3] }] }]));
    expect(tl.aantikken.get('k')![0]!.punt).toEqual([10.6, 3.3]);
  });
});

describe('nieuwe oefeningen 0.23.0', () => {
  const VERWACHT: Record<string, string[]> = {
    'keeper-hd-slalom-pion-duiken': ['hoog-duiken', 'laag-duiken'],
    'veld-af-dribbelrace-1t1': ['afwerken'],
    'keeper-wu-twee-ballen': ['warming-up'],
    'keeper-wu-rasterloop-lage-duik': ['warming-up', 'laag-duiken'],
    'keeper-wu-zijwaarts-blijven-vangen': ['warming-up', 'bal-verwerken'],
    'keeper-wu-drie-aangevers': ['warming-up', 'bal-verwerken'],
    'keeper-wu-tennisballen-vangen': ['warming-up', 'bal-verwerken'],
    'keeper-wu-ladder-voetpass': ['warming-up', 'passing'],
    'keeper-wu-zijwaarts-uitschieten': ['warming-up', 'bal-verwerken'],
    'keeper-wu-voet-uitstappen-vangen': ['warming-up', 'passing'],
    'keeper-sp-kleurenpion': ['warming-up', 'spelletjes'],
    'keeper-sp-stompen-eigen-bal': ['warming-up', 'spelletjes'],
    'keeper-ld-vier-laag-vier-hoog': ['laag-duiken', 'bal-verwerken'],
    'keeper-bv-vangen-laag-om-beurt': ['bal-verwerken', 'laag-duiken'],
    'keeper-ld-drie-duiken-aangevers': ['laag-duiken', 'hoog-duiken'],
    'keeper-bv-vangen-volley-pion-afstand': ['bal-verwerken', 'laag-duiken'],
    'keeper-bv-paal-twee-poppen': ['bal-verwerken', 'laag-duiken', 'hoog-duiken'],
    'keeper-ld-zigzag-voor-achteruit': ['laag-duiken', 'hoog-duiken'],
    'keeper-ld-skip-duik-tussen-palen': ['laag-duiken', 'bal-verwerken'],
    'keeper-ld-paal-duik-andere-kant': ['laag-duiken'],
    'keeper-ld-rondje-hoedje': ['laag-duiken'],
    'keeper-hd-halfknie-pion-hoog': ['hoog-duiken', 'bal-verwerken'],
    'keeper-hd-hordes-slalom-paal': ['hoog-duiken'],
    'keeper-hd-kleur-powerduik': ['hoog-duiken', 'reactie'],
    'keeper-re-pion-voet-achteruit': ['reactie', 'laag-duiken'],
    'keeper-hd-buiklig-verre-paal': ['hoog-duiken', 'reactie'],
    'keeper-re-kleurvolgorde-vallende-bal': ['reactie', 'laag-duiken'],
    'keeper-re-dropkick-poppen': ['reactie'],
    'keeper-re-rebounder-zijkant': ['reactie', 'een-op-een'],
    'keeper-re-draaisprong-voetenblok': ['reactie', 'een-op-een', 'laag-duiken'],
    'keeper-re-stuitbal-schuin-lichaam': ['reactie', 'bal-verwerken'],
    'keeper-vz-cutback': ['voorzetten', 'reactie', 'laag-duiken'],
  };
  it(`${Object.keys(VERWACHT).length} oefeningen met de gevraagde categorieën en complete gegevens`, () => {
    for (const [id, cat] of Object.entries(VERWACHT)) {
      const o = OEFENINGEN.find((x) => x.id === id);
      expect(o, id).toBeDefined();
      expect(o!.categorieen, id).toEqual(cat);
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
  it('slalom en duiken: zowel een hoge als een lage duik; dribbelrace: wie eerst klaar is schiet als eerste', () => {
    const tl = maakTijdlijn(OEFENINGEN.find((x) => x.id === 'keeper-hd-slalom-pion-duiken')!.tekening);
    const duiken = tl.houdingen.get('k1')!.filter((e) => e.houding === 'duik');
    expect(duiken.length).toBe(2);
    expect(duiken.some((d) => (d.hoog ?? 0) > 1)).toBe(true);
    expect(duiken.some((d) => !d.hoog)).toBe(true);
    const race = maakTijdlijn(OEFENINGEN.find((x) => x.id === 'veld-af-dribbelrace-1t1')!.tekening);
    const laatste = (b: string) =>
      race.balEvents
        .get(b)!
        .filter((e) => e.soort === 'vlucht')
        .at(-1)!.t0;
    expect(laatste('b1')).toBeLessThan(laatste('b2'));
  });
});
