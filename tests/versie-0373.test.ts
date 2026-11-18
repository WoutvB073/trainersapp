import { Vector3 } from 'three';
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { vindOefening } from '../src/data/oefeningen';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { fysiekeFouten } from '../src/anim/fysiek';
import { persoonKleur } from '../src/anim/render2d';
import { BAL_R, balInvoer, maakSkelet, nieuweStaat, persoonInvoer, poseer, type PopSoort } from '../src/anim/poppetje';
import type { Tekening, VeldObject } from '../src/model/types';

/** 0.37.3: fase 2, deel 3, batch 4 – 50 keepersoefeningen uit VOORSTEL-OEFENINGEN.md en de bouwstenen die daarvoor nodig waren. */

const NIEUW = [
  'keeper-wu-vangen-vier-pionnen',
  'keeper-wu-pass-pass-vang',
  'keeper-wu-spiegelen',
  'keeper-ld-door-het-poortje',
  'keeper-ld-stap-over-de-stok',
  'keeper-ld-twee-ballen-een-kant',
  'keeper-ld-rollen-klemmen',
  'keeper-ld-na-schijnschot',
  'keeper-hd-hoge-bal-uit-de-hand',
  'keeper-hd-kruising-of-hoek',
  'keeper-hd-om-de-paal-tippen',
  'keeper-hd-stap-stap-vlucht',
  'keeper-bv-w-loop-vangen',
  'keeper-bv-vangen-na-draai',
  'keeper-bv-klemmen-tegen-de-borst',
  'keeper-bv-stuitbal-opscheppen',
  'keeper-bv-stoorzender',
  'keeper-bv-tien-ballen',
  'keeper-bv-lob-achteruit',
  'keeper-vz-eerste-paal-uit-de-hand',
  'keeper-vz-roepen-los-of-weg',
  'keeper-vz-lage-voorzet-onderscheppen',
  'keeper-vz-corner-drukte',
  'keeper-ps-uittrap-doelwit',
  'keeper-ps-aannemen-links-spelen-rechts',
  'keeper-ps-uitworp-over-de-linie',
  'keeper-ps-driehoek-centrale-verdedigers',
  'keeper-ps-rollen-naar-poortje',
  'keeper-ps-chip-over-de-spits',
  'keeper-1o1-uitkomen-tot-pion',
  'keeper-1o1-smalle-baan',
  'keeper-1o1-bal-van-opzij-afpakken',
  'keeper-1o1-twee-aanvallers',
  'keeper-1o1-wie-eerst-bij-de-bal',
  'keeper-re-schuin-kaatsbord',
  'keeper-re-liggen-bal-liggen',
  'keeper-re-pass-opzij-schot',
  'keeper-sp-keeperstennis',
  'keeper-sp-vier-doeltjes-een-keeper',
  'keeper-sp-vangen-om-punten',
  'keeper-sp-penaltyduel',
  'keeper-wu-handbal',
  'keeper-sp-trefbal',
  'keeper-hd-over-de-liggende-keeper',
  'keeper-re-door-de-benen',
  'keeper-re-kleur-van-de-bal',
  'keeper-vz-indraaiend-uitdraaiend',
  'keeper-re-twee-tennisballen',
  'keeper-wu-bal-om-je-lichaam',
  'keeper-vz-hoge-bal-stootkussen',
];

describe('0.37.3: 50 keepersoefeningen', () => {
  it('bestaan allemaal als keeperoefening, met de vaste velden', () => {
    expect(NIEUW).toHaveLength(50);
    expect(new Set(NIEUW).size).toBe(50);
    for (const id of NIEUW) {
      const o = vindOefening(id)!;
      expect(o, id).toBeTruthy();
      expect(o.soort, id).toBe('keeper');
      expect(o.verwijderd, id).toBeFalsy();
      expect(o.keepersNodig, id).toBeGreaterThan(0);
      expect(o.leeftijden?.length, id).toBeGreaterThan(0);
      expect(o.coachpunten.length, id).toBeGreaterThanOrEqual(2);
      expect(o.coachpunten.length, id).toBeLessThanOrEqual(4);
      expect(o.variaties?.makkelijker?.length, id).toBeGreaterThan(0);
      expect(o.variaties?.moeilijker?.length, id).toBeGreaterThan(0);
      expect(typeof o.doorwisselbaar, id).toBe('boolean');
      expect(() => maakTijdlijn(o.tekening), id).not.toThrow();
    }
  });

  it('geen enkel id staat dubbel, ook niet tegenover het archief (een oude, weggehaalde oefening)', () => {
    const ids: string[] = [];
    for (const map of ['veld', 'keepers'])
      for (const f of readdirSync(`src/data/oefeningen/${map}`)) ids.push(...(JSON.parse(readFileSync(`src/data/oefeningen/${map}/${f}`, 'utf8')) as { id: string }[]).map((o) => o.id));
    const archief = (JSON.parse(readFileSync('src/data/oefeningen/archief.json', 'utf8')) as { id: string }[]).map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.filter((id) => archief.includes(id))).toEqual([]);
  });
});

/** Speelt een tekening af tot t en poseert iedereen; geeft de skeletten. */
function poseerTot(tekening: Tekening, tot: number) {
  const tl = maakTijdlijn(tekening);
  const personen = tekening.objecten.filter((x) => ['speler', 'keeper', 'trainer'].includes(x.soort));
  const ballen = tekening.objecten.filter((x) => x.soort === 'bal').map((x) => x.id);
  const pops = personen.map((o) => ({ id: o.id, soort: o.soort as PopSoort, sk: maakSkelet(), staat: nieuweStaat() }));
  const stap = 1 / 30;
  for (let i = 0, t = 0; t <= tot + 1e-9; i++, t = i * stap) {
    const s = standOp(tl, t);
    const bi = balInvoer(s, ballen, BAL_R);
    for (const p of pops) {
      const st = s.objecten.get(p.id)!;
      poseer(p.sk, p.staat, { s: st, soort: p.soort, t, dtEcht: stap, dtAnim: stap, sprong: i === 0, zaad: 0.4, ...persoonInvoer(p.id, p.soort, st, s, bi) });
    }
  }
  return { tl, stand: standOp(tl, tot), pops };
}
const pols = (sk: ReturnType<typeof maakSkelet>, i: 0 | 1) => sk.pols[i].getWorldPosition(new Vector3());

describe('0.37.3: bouwstenen', () => {
  const keeperMetBal = (acties: Tekening['animatie']): Tekening => ({
    veld: { type: 'leeg', breedte: 10, lengte: 10 },
    objecten: [
      { id: 'k1', soort: 'keeper', nummer: 1, x: 5, y: 5, kijkrichting: 90 },
      { id: 'b', soort: 'bal', x: 5, y: 5.5, bij: 'k1' },
    ],
    animatie: acties,
  });

  it('omLijf: de bal gaat in een cirkel om het middel (0,95 m) of de knieën (0,45 m), beginnend voor het lijf', () => {
    const t = keeperMetBal([{ duur: 0.2, acties: [] }, { acties: [{ type: 'omLijf', wie: 'k1', rondes: 1, duur: 1 }] }, { acties: [{ type: 'omLijf', wie: 'k1', om: 'benen', rondes: 1, duur: 1 }] }]);
    const tl = maakTijdlijn(t);
    const b = (s: number) => standOp(tl, s).objecten.get('b')!;
    const [m, k] = tl.omLijf.get('k1')!;
    // Begin: voor het lijf (kijkrichting +y). Een kwart later: rechts van hem (−x, want hij kijkt naar +y).
    expect(b(m!.t0 + 0.001).y).toBeCloseTo(5.32, 1);
    expect(b(m!.t0 + 0.25).x).toBeCloseTo(4.68, 1);
    expect(b(m!.t0 + 0.25).hoogte).toBeCloseTo(0.95, 2);
    expect(Math.hypot(b(m!.t0 + 0.5).x - 5, b(m!.t0 + 0.5).y - 5)).toBeCloseTo(0.32, 2);
    expect(b(k!.t0 + 0.3).hoogte).toBeCloseTo(0.45, 2);
    expect(Math.hypot(b(k!.t0 + 0.3).x - 5, b(k!.t0 + 0.3).y - 5)).toBeCloseTo(0.27, 2);
  });

  it('omLijf in 3D: voor het lijf beide handen bij de bal, achter het lijf één hand', () => {
    const t = keeperMetBal([{ duur: 0.2, acties: [] }, { acties: [{ type: 'omLijf', wie: 'k1', rondes: 1, duur: 2 }] }]);
    const voor = poseerTot(t, 0.2);
    const bal = (st: ReturnType<typeof standOp>) => new Vector3(st.objecten.get('b')!.x, st.objecten.get('b')!.hoogte, st.objecten.get('b')!.y);
    const sk = voor.pops[0]!.sk;
    expect(pols(sk, 0).distanceTo(bal(voor.stand))).toBeLessThan(0.25);
    expect(pols(sk, 1).distanceTo(bal(voor.stand))).toBeLessThan(0.25);
    const achter = poseerTot(t, 1.2);
    const sk2 = achter.pops[0]!.sk;
    const d = [pols(sk2, 0).distanceTo(bal(achter.stand)), pols(sk2, 1).distanceTo(bal(achter.stand))];
    expect(Math.min(...d)).toBeLessThan(0.25);
  });

  it('klap: beide handen komen voor de borst bij elkaar', () => {
    const t = keeperMetBal([
      { duur: 0.3, acties: [] },
      {
        acties: [
          { type: 'pass', van: 'k1', naar: 'k1', worp: 'onderhands', hoogte: 3 },
          { type: 'klap', wie: 'k1', start: 0.75, duur: 0.3 },
        ],
      },
    ]);
    const tl = maakTijdlijn(t);
    // Midden van de klap: de bal is in de lucht.
    const e = tl.klappen.get('k1')![0]!;
    const tKlap = (e.t0 + e.t1) / 2;
    expect(standOp(tl, tKlap).objecten.get('k1')!.klap).toBeCloseTo(1, 1);
    const { pops } = poseerTot(t, tKlap);
    expect(pols(pops[0]!.sk, 0).distanceTo(pols(pops[0]!.sk, 1))).toBeLessThan(0.2);
  });

  it('wijdbeens + onderdoor: een lage bal tussen de benen door mag; zonder onderdoor is het een fout', () => {
    const tekening = (onderdoor: boolean): Tekening => ({
      veld: { type: 'leeg', breedte: 12, lengte: 6 },
      objecten: [
        { id: 'a', soort: 'speler', team: 'A', nummer: 1, x: 1, y: 3, kijkrichting: 0 },
        { id: 'w', soort: 'speler', team: 'B', nummer: 2, x: 6, y: 3, kijkrichting: 180 },
        { id: 'c', soort: 'speler', team: 'A', nummer: 3, x: 11, y: 3, kijkrichting: 180 },
        { id: 'b', soort: 'bal', x: 1.55, y: 3, bij: 'a' },
      ],
      animatie: [{ acties: [{ type: 'wijdbeens', wie: 'w', duur: 4 }] }, { acties: [{ type: 'pass', van: 'a', naar: 'c', hoogte: 'grond', ...(onderdoor ? { onderdoor: 'w' } : {}) }] }],
    });
    expect(fysiekeFouten(tekening(true))).toEqual([]);
    expect(fysiekeFouten(tekening(false)).length).toBeGreaterThan(0);
    expect(standOp(maakTijdlijn(tekening(true)), 1).objecten.get('w')!.spreid).toBeCloseTo(1, 1);
  });

  it('effect: de bal draait in een boog naar rechts (gezien vanaf de passeerder), het spoor volgt de boog', () => {
    const t = (effect?: number): Tekening => ({
      veld: { type: 'leeg', breedte: 30, lengte: 10 },
      objecten: [
        { id: 'a', soort: 'speler', team: 'A', nummer: 1, x: 2, y: 5, kijkrichting: 0 },
        { id: 'b', soort: 'bal', x: 2.55, y: 5, bij: 'a' },
      ],
      animatie: [{ acties: [{ type: 'pass', van: 'a', naar: [26, 5], hoogte: 'hoog', ...(effect ? { effect } : {}) }] }],
    });
    const tl = maakTijdlijn(t(2));
    const midden = (tl.duur + 0) / 2;
    // Hij speelt naar +x: rechts van hem is +y.
    let maxY = 5;
    for (let s = 0; s <= tl.duur; s += 0.02) maxY = Math.max(maxY, standOp(tl, s).objecten.get('b')!.y);
    expect(maxY).toBeGreaterThan(6.6);
    expect(standOp(maakTijdlijn(t()), midden).objecten.get('b')!.y).toBeCloseTo(5, 3);
    expect(tl.sporen[0]!.pad.length).toBeGreaterThan(2);
    // Aan het eind komt de bal gewoon op het doelpunt aan.
    expect(standOp(tl, tl.duur).objecten.get('b')!.y).toBeCloseTo(5, 1);
  });

  it('twee ballen tegelijk vasthouden: elke bal in zijn eigen hand', () => {
    const t: Tekening = {
      veld: { type: 'leeg', breedte: 10, lengte: 10 },
      objecten: [
        { id: 't1', soort: 'trainer', x: 5, y: 5, kijkrichting: 0 },
        { id: 'k1', soort: 'keeper', nummer: 1, x: 9, y: 5, kijkrichting: 180 },
        { id: 'r', soort: 'bal', x: 5.5, y: 4.8, bij: 't1', hand: 'links', kleur: '#e03131' },
        { id: 'g', soort: 'bal', x: 5.5, y: 5.2, bij: 't1', hand: 'rechts', kleur: '#ffd23f' },
      ],
      animatie: [
        { duur: 0.6, acties: [] },
        {
          acties: [
            { type: 'pass', van: 't1', naar: 'k1', worp: 'onderhands', hoogte: 1, bal: 'r' },
            { type: 'pass', van: 't1', naar: [9, 8], worp: 'onderhands', hoogte: 1, bal: 'g' },
          ],
        },
      ],
    };
    const s = standOp(maakTijdlijn(t), 0.6);
    const r = s.objecten.get('r')!;
    const g = s.objecten.get('g')!;
    // Hij kijkt naar +x: links is −y, rechts is +y; beide in de handen.
    expect(r.y).toBeLessThan(g.y - 0.3);
    expect(r.hoogte).toBeGreaterThan(0.4);
    expect(g.hoogte).toBeGreaterThan(0.4);
  });

  it('duikOver: de keeper is al vroeg in de duik hoog, en duikt over de liggende keeper heen', () => {
    const o = vindOefening('keeper-hd-over-de-liggende-keeper')!;
    const tl = maakTijdlijn(o.tekening);
    const ligt = o.tekening.objecten.find((x) => x.id === 'k2')!;
    let boven = 0;
    for (let s = 0; s <= tl.duur; s += 0.02) {
      const k = standOp(tl, s).objecten.get('k1')!;
      if (Math.hypot(k.x - ligt.x, k.y - ligt.y) < 0.6) {
        boven++;
        expect(k.zweef, `t=${s.toFixed(2)}`).toBeGreaterThan(0.45);
      }
    }
    expect(boven).toBeGreaterThan(0);
  });

  it('een keeper met een team draagt een hesje in die kleur; zonder team de keeperskleur', () => {
    const k = { keeper: '#111', keeper2: '#222', keeper3: '#333', trainer: '#444', teamA: '#a00', teamB: '#00b', teamC: '#0c0', joker: '#909' } as unknown as Parameters<typeof persoonKleur>[1];
    const keeper = (team?: VeldObject['team']): VeldObject => ({ id: 'k', soort: 'keeper', x: 0, y: 0, nummer: 1, ...(team ? { team } : {}) });
    expect(persoonKleur(keeper(), k)).toBe('#111');
    expect(persoonKleur(keeper('A'), k)).toBe('#a00');
    expect(persoonKleur(keeper('B'), k)).toBe('#00b');
  });

  it('stootkussen: vóór de drager, met beide handen eraan', () => {
    const o = vindOefening('keeper-vz-hoge-bal-stootkussen')!;
    const tl = maakTijdlijn(o.tekening);
    const s = standOp(tl, 0.3);
    const t1 = s.objecten.get('t1')!;
    const m = s.materiaal.get('sk')!;
    const voor = [Math.cos((t1.hoek * Math.PI) / 180), Math.sin((t1.hoek * Math.PI) / 180)];
    expect((m.x - t1.x) * voor[0]! + (m.y - t1.y) * voor[1]!).toBeCloseTo(0.38, 1);
    expect(t1.houdt?.map((h) => h.kant).sort()).toEqual(['links', 'rechts']);
  });
});
