import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { vindOefening } from '../src/data/oefeningen';
import { pastBij } from '../src/training/training';
import type { Oefening, Punt } from '../src/model/types';

/** Versie 0.32.2: vier spelersoefeningen, pionnen in de hand, afremmen tot stilstand. */

const oefening = (id: string) => vindOefening(id) as Oefening;
const tijdlijn = (id: string) => maakTijdlijn(oefening(id).tekening);
const plek = (tl: ReturnType<typeof maakTijdlijn>, wie: string, t: number): Punt => {
  const o = standOp(tl, t).objecten.get(wie)!;
  return [o.x, o.y];
};
const acties = (o: Oefening) => (o.tekening.animatie ?? []).flatMap((s) => ('acties' in s ? s.acties : []));
const afstand = (a: Punt, b: Punt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const tijden = (tl: ReturnType<typeof maakTijdlijn>, stap = 0.05) => Array.from({ length: Math.floor(tl.duur / stap) }, (_, i) => i * stap);

describe('sprinten en stoppen bij de vallende pion', () => {
  const id = 'veld-lc-vallende-pion';
  const tl = tijdlijn(id);
  const LOS = 0.6 + 2.05;
  const REM = 0.6 + 2.6;

  it('de trainer houdt twee pionnen vast en laat er één los', () => {
    expect(standOp(tl, 1).objecten.get('t1')!.houdt).toHaveLength(2);
    expect(standOp(tl, LOS + 0.1).objecten.get('t1')!.houdt?.map((h) => h.kant)).toEqual(['links']);
    const vast = standOp(tl, 1).materiaal.get('hR')!;
    expect(vast.hoogte).toBeGreaterThan(0.9);
    // De rechterhand van de trainer (die naar de start kijkt) is de kant van speler 1.
    expect(vast.x).toBeLessThan(10);
  });

  it('de pion valt op de grond en kantelt om, de andere blijft in de hand', () => {
    const hoogtes = [0, 0.1, 0.2, 0.3, 0.4, 0.5].map((d) => standOp(tl, LOS + d).materiaal.get('hR')!.hoogte);
    for (let i = 1; i < hoogtes.length; i++) expect(hoogtes[i]!).toBeLessThanOrEqual(hoogtes[i - 1]!);
    const liggend = standOp(tl, LOS + 1).materiaal.get('hR')!;
    expect(liggend.hoogte).toBe(0);
    expect(liggend.kantel).toBe(1);
    expect(standOp(tl, LOS + 1).materiaal.get('hL')!.hoogte).toBeGreaterThan(0.9);
  });

  it('beide spelers zijn even snel tot het afremmen, daarna staat de ene stil en sprint de andere door', () => {
    expect(plek(tl, 'a1', REM)[1]).toBeCloseTo(plek(tl, 'a2', REM)[1], 3);
    const v = (wie: string, t: number) => afstand(plek(tl, wie, t), plek(tl, wie, t + 0.02)) / 0.02;
    expect(v('a1', REM - 0.03)).toBeGreaterThan(6.5);
    expect(v('a1', REM + 0.03)).toBeGreaterThan(6.5);
    expect(v('a1', REM + 1)).toBeLessThan(0.05);
    expect(v('a2', REM + 0.03)).toBeGreaterThan(6.5);
    const stil = plek(tl, 'a1', REM + 1);
    expect(stil[1]).toBeGreaterThan(10);
    expect(plek(tl, 'a2', REM + 2.1)[1]).toBeLessThan(5);
  });

  it('de speler die afremt zakt door zijn knieën en komt daarna weer omhoog', () => {
    expect(standOp(tl, REM - 0.1).objecten.get('a1')!.gezet).toBe(0);
    expect(standOp(tl, REM + 0.8).objecten.get('a1')!.gezet).toBe(1);
    expect(standOp(tl, REM + 2.2).objecten.get('a1')!.gezet).toBe(0);
    expect(standOp(tl, REM + 0.8).objecten.get('a2')!.gezet).toBe(0);
  });

  it('doorwisselbaar, vanaf 2 spelers', () => {
    expect(oefening(id).doorwisselbaar).toBe(true);
    expect(oefening(id).spelersNodig).toBe(2);
  });
});

describe('golven: 1 tegen 0, 2 tegen 1, 3 tegen 2', () => {
  const o = oefening('veld-pv-golven-overtal');
  const tl = maakTijdlijn(o.tekening);

  it('kleine goals zonder keepers, E-goals met keepers staan erbij', () => {
    expect(o.keepersNodig).toBe(0);
    expect(o.tekening.objecten.filter((x) => x.soort === 'klein-goal')).toHaveLength(2);
    expect(o.tekening.objecten.some((x) => x.soort === 'keeper')).toBe(false);
    expect(pastBij(o, 5, 0)).toBe(true);
    expect(pastBij(o, 5, 2)).toBe(true);
    expect(o.organisatie).toMatch(/Zonder keepers: kleine goals/);
    expect(o.organisatie).toMatch(/E-goals/);
    expect(o.benodigdheden.join(' ')).toMatch(/E-goals/);
  });

  it('heeft alle drie de fases, om en om naar de andere kant', () => {
    const schoten = acties(o).filter((a) => a.type === 'schot');
    expect(schoten.map((a) => (a as unknown as { van: string }).van)).toEqual(['a1', 'b2', 'a3']);
    const doelY = schoten.map((a) => (a as unknown as { naar: Punt }).naar[1]);
    expect(doelY[0]).toBeLessThan(5);
    expect(doelY[1]).toBeGreaterThan(35);
    expect(doelY[2]).toBeLessThan(5);
  });

  it('speler 1 schiet vanaf ± 15 m en komt niet verder', () => {
    const dribbel = acties(o).find((a) => a.type === 'dribbel' && a.wie === 'a1') as unknown as { naar: Punt };
    expect(dribbel.naar[1] - 1).toBeGreaterThan(14);
    expect(dribbel.naar[1] - 1).toBeLessThan(17);
    const a1 = tijden(tl, 0.2).map((t) => plek(tl, 'a1', t)[1]);
    expect(a1.slice(0, 20).every((y) => y >= 16)).toBe(true);
  });

  it('is een aparte oefening naast de bestaande golven', () => {
    expect(o.naam).toBe('Golven: 1 tegen 0, 2 tegen 1, 3 tegen 2');
    expect(o.categorieen).toEqual(['partijvormen', 'afwerken']);
  });
});

describe('hordes, zijwaarts en sprint', () => {
  const o = oefening('veld-lc-hordes-zijwaarts-sprint');
  const tl = maakTijdlijn(o.tekening);

  it('links gaat naar links, rechts naar rechts, en kijkt tijdens het zijwaartse stuk vooruit', () => {
    const zij = acties(o).filter((a) => a.type === 'loop' && a.manier === 'voetenwerk') as unknown as { wie: string; naar: Punt; kijk: number }[];
    expect(zij.map((a) => a.wie)).toEqual(['a1', 'a2']);
    expect(zij[0]!.naar[0]).toBeLessThan(9);
    expect(zij[1]!.naar[0]).toBeGreaterThan(15);
    expect(zij.every((a) => a.kijk === -90)).toBe(true);
  });

  it('heeft per baan 3 hordes vooruit, 3 zijwaarts en een finishpoortje; de zijwaartse hordes staan gedraaid', () => {
    const hordes = o.tekening.objecten.filter((x) => x.soort === 'horde');
    expect(hordes).toHaveLength(12);
    expect(hordes.filter((x) => x.hoek === 90)).toHaveLength(6);
    const eind = plek(tl, 'a1', tl.duur);
    expect(eind[1]).toBeLessThan(2);
  });

  it('wedstrijdje voor twee, doorwisselbaar', () => {
    expect(o.spelersNodig).toBe(2);
    expect(o.doorwisselbaar).toBe(true);
  });
});

describe('achtjes om drie pionnen', () => {
  const o = oefening('veld-lc-achtjes-drie-pionnen');
  const tl = maakTijdlijn(o.tekening);
  const pion = (id: string) => {
    const p = o.tekening.objecten.find((x) => x.id === id)!;
    return [p.x, p.y] as Punt;
  };
  const baan = tijden(tl).map((t) => plek(tl, 'a1', t));

  /** Draaiing van de speler om een pion, in rondjes (positief = met de klok mee op het veld). */
  const draaiing = (punten: Punt[], c: Punt) => {
    let som = 0;
    for (let i = 1; i < punten.length; i++) {
      const a = Math.atan2(punten[i - 1]![1] - c[1], punten[i - 1]![0] - c[0]);
      const b = Math.atan2(punten[i]![1] - c[1], punten[i]![0] - c[0]);
      som += Math.atan2(Math.sin(b - a), Math.cos(b - a));
    }
    return som / (2 * Math.PI);
  };
  const station = (y: number) => baan.filter((p) => Math.abs(p[1] - y) < 4.4);

  it('drie stations met elk een linker, middelste en rechter pion, met nummers', () => {
    for (const k of ['s1', 's2', 's3']) {
      const [l, m, r] = [pion(`${k}0`), pion(`${k}1`), pion(`${k}2`)];
      expect(l[0]).toBeLessThan(m[0]);
      expect(m[0]).toBeLessThan(r[0]);
      expect(l[1]).toBe(r[1]);
    }
    const teksten = o.tekening.objecten.filter((x) => x.soort === 'tekst').map((x) => x.tekst);
    expect(teksten).toEqual(expect.arrayContaining(['Station 1', 'Station 2', 'Station 3', '1', '2', '3', '4']));
  });

  it('de route staat altijd op het plaatje en in de animatie, los van de knop Looplijnen', () => {
    expect(o.tekening.lijnen).toHaveLength(3);
    expect(o.tekening.lijnen!.every((l) => l.soort === 'loop' && l.stap === undefined)).toBe(true);
    // Geen dubbele lijn: de lopers laten zelf geen spoor achter.
    expect(tl.sporen).toHaveLength(0);
  });

  it('station 1: een hele ronde rechts om de rechter pion', () => {
    expect(draaiing(station(pion('s12')[1]), pion('s12'))).toBeGreaterThan(0.7);
  });

  it('station 2 en 3: links om de linker pion heen', () => {
    expect(draaiing(station(pion('s20')[1]), pion('s20'))).toBeLessThan(-0.45);
    expect(draaiing(station(pion('s30')[1]), pion('s30'))).toBeLessThan(-0.45);
  });

  it('station 3: achterlangs de middelste pion, dan rechts langs de rechter pion', () => {
    const m = pion('s31');
    const r = pion('s32');
    expect(baan.some((p) => Math.abs(p[0] - m[0]) < 0.3 && p[1] > m[1] + 1.5 && p[1] < m[1] + 3)).toBe(true);
    expect(baan.some((p) => p[0] > r[0] + 1.5 && Math.abs(p[1] - r[1]) < 0.5)).toBe(true);
  });

  it('niemand raakt een pion', () => {
    for (const x of o.tekening.objecten.filter((q) => q.soort === 'pion')) for (const p of baan) expect(afstand(p, [x.x, x.y])).toBeGreaterThan(1.2);
  });

  it('de volgende speler start als de vorige bij station 2 is', () => {
    const y2 = pion('s21')[1];
    const start = plek(tl, 'a2', 0);
    const t = tijden(tl).find((q) => afstand(plek(tl, 'a2', q), start) > 0.05)!;
    expect(plek(tl, 'a1', t)[1]).toBeLessThan(y2 + 2.5);
    expect(plek(tl, 'a1', t)[1]).toBeGreaterThan(y2);
  });

  it('loopt in een vast tempo, ook om de pionnen', () => {
    const v = (t: number) => afstand(plek(tl, 'a1', t), plek(tl, 'a1', t + 0.1)) / 0.1;
    for (const t of [4, 8, 12, 16, 20]) {
      expect(v(t)).toBeGreaterThan(4);
      expect(v(t)).toBeLessThan(5.2);
    }
  });

  it('eindigt bij de finish', () => {
    expect(plek(tl, 'a1', tl.duur)[1]).toBeLessThan(2);
    expect(o.doorwisselbaar).toBe(true);
  });
});
