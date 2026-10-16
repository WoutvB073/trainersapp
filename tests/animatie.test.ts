import { describe, expect, it } from 'vitest';
import { afspeelTekening, animatieNaarLijnen, heeftLijnAnimatie, lijnenNaarAnimatie, lijnMeldingen, volgendeStap } from '../src/editor/animatie';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { fysiekeFouten } from '../src/anim/fysiek';
import type { AnimatieStap, BalActie, Lijn, Tekening, VeldObject } from '../src/model/types';
import { OEFENINGEN } from '../src/data/oefeningen';

const speler = (id: string, x: number, y: number, extra: Partial<VeldObject> = {}): VeldObject => ({ id, soort: 'speler', team: 'A', nummer: Number(id.replace(/\D/g, '')) || 1, x, y, ...extra });
const bal = (id: string, bij: string): VeldObject => ({ id, soort: 'bal', x: 0, y: 0, bij });
const t = (objecten: VeldObject[], lijnen: Lijn[], extra: Partial<Tekening> = {}): Tekening => ({ veld: { type: 'leeg', breedte: 40, lengte: 30 }, objecten, lijnen, ...extra });
const lijn = (soort: Lijn['soort'], van: [number, number], naar: [number, number], stap: number, extra: Partial<Lijn> = {}): Lijn => ({ soort, punten: [van, naar], stap, ...extra });

/** Alle acties van de omgezette animatie (zonder de pauze aan het begin). */
const acties = (tk: Tekening) => (tk.animatie ?? []).flatMap((s) => ('acties' in s ? s.acties : []));
const stappenMetActies = (tk: Tekening) => (tk.animatie ?? []).filter((s): s is AnimatieStap => 'acties' in s && s.acties.length > 0);
const houderAanHetEind = (tk: Tekening, balId: string) => {
  const tl = maakTijdlijn(tk);
  return standOp(tl, tl.duur).objecten.get(balId)!.houder;
};

describe('lijnen → animatiestappen', () => {
  it('pass van speler naar speler; de ontvanger loopt de bal tegemoet en heeft hem daarna', () => {
    const o = lijnenNaarAnimatie(t([speler('a1', 5, 10), speler('a2', 20, 10), bal('b', 'a1')], [lijn('bal', [5, 10], [20, 10], 1, { van: 'a1', naar: 'a2' })]));
    expect(o.meldingen).toEqual([]);
    const a = acties(o.tekening);
    expect(a.find((x) => x.type === 'pass')).toMatchObject({ van: 'a1', naar: 'a2' });
    expect(a.find((x) => x.type === 'loop')).toMatchObject({ wie: 'a2' });
    expect(houderAanHetEind(o.tekening, 'b')).toBe('a2');
    // De getekende lijn wordt een spoor van de animatie, geen losse lijn meer.
    expect(o.tekening.lijnen).toBeUndefined();
  });

  it('stapnummers: zelfde nummer tegelijk, hoger nummer daarna', () => {
    const o = lijnenNaarAnimatie(
      t(
        [speler('a1', 5, 5), speler('a2', 5, 15), speler('a3', 20, 15)],
        [lijn('loop', [5, 5], [15, 5], 2, { van: 'a1' }), lijn('loop', [5, 15], [15, 15], 1, { van: 'a2' }), lijn('loop', [20, 15], [30, 15], 1, { van: 'a3' })],
      ),
    );
    const s = stappenMetActies(o.tekening);
    expect(s).toHaveLength(2);
    expect(s[0]!.acties.map((a) => ('wie' in a ? a.wie : ''))).toEqual(['a2', 'a3']);
    expect(s[1]!.acties.map((a) => ('wie' in a ? a.wie : ''))).toEqual(['a1']);
    // Tegelijk: a2 en a3 vertrekken op hetzelfde moment.
    const tl = maakTijdlijn(o.tekening);
    const st = standOp(tl, 1.2);
    expect(st.objecten.get('a2')!.x).toBeGreaterThan(5.5);
    expect(st.objecten.get('a3')!.x).toBeGreaterThan(20.5);
    expect(st.objecten.get('a1')!.x).toBeCloseTo(5);
    expect(o.stapLijnen).toEqual([[1, 2], [0]]);
  });

  it('een pass vanaf een speler zonder bal: melding en de lijn doet niet mee', () => {
    const o = lijnenNaarAnimatie(t([speler('a1', 5, 10), speler('a2', 20, 10)], [lijn('bal', [5, 10], [20, 10], 1, { van: 'a1', naar: 'a2' })]));
    expect(o.meldingen).toHaveLength(1);
    expect(o.meldingen[0]).toMatchObject({ lijn: 0, soort: 'fout' });
    expect(o.meldingen[0]!.tekst).toMatch(/Speler 1 heeft de bal niet/);
    expect(o.tekening.animatie).toBeUndefined();
  });

  it('pas passen na het krijgen: pass 1 naar 2 (stap 1), dan 2 naar 3 (stap 2); andersom kan niet', () => {
    const obj = [speler('a1', 5, 10), speler('a2', 15, 10), speler('a3', 25, 10), bal('b', 'a1')];
    const goed = lijnenNaarAnimatie(t(obj, [lijn('bal', [5, 10], [15, 10], 1, { van: 'a1', naar: 'a2' }), lijn('bal', [15, 10], [25, 10], 2, { van: 'a2', naar: 'a3' })]));
    expect(goed.meldingen).toEqual([]);
    expect(houderAanHetEind(goed.tekening, 'b')).toBe('a3');
    const fout = lijnenNaarAnimatie(t(obj, [lijn('bal', [5, 10], [15, 10], 2, { van: 'a1', naar: 'a2' }), lijn('bal', [15, 10], [25, 10], 1, { van: 'a2', naar: 'a3' })]));
    expect(fout.meldingen.map((m) => m.lijn)).toEqual([1]);
    // Zelfde nummer: in één keer doorspelen (kaats).
    const kaats = lijnenNaarAnimatie(t(obj, [lijn('bal', [5, 10], [15, 10], 1, { van: 'a1', naar: 'a2' }), lijn('bal', [15, 10], [25, 10], 1, { van: 'a2', naar: 'a3' })]));
    expect(kaats.meldingen).toEqual([]);
    expect(acties(kaats.tekening).find((a) => a.type === 'pass' && a.van === 'a2')).toMatchObject({ direct: true });
    expect(houderAanHetEind(kaats.tekening, 'b')).toBe('a3');
  });

  it('dribbel en schot op een goal met keeper: de keeper verdedigt vanzelf en vangt (of duikt, of is te laat)', () => {
    const obj: VeldObject[] = [{ id: 'g', soort: 'goal', x: 20, y: 0 }, { id: 'k', soort: 'keeper', x: 20, y: 1.5 }, speler('a1', 20, 25), bal('b', 'a1')];
    const lijnen = (afloop?: Lijn['afloop']) => [lijn('dribbel', [20, 25], [20, 16], 1, { van: 'a1' }), lijn('bal', [20, 16], [17.5, 0.3], 2, afloop ? { afloop } : {})];
    const vangt = lijnenNaarAnimatie(t(obj, lijnen()));
    expect(vangt.meldingen).toEqual([]);
    expect(vangt.tekening.objecten.find((o) => o.id === 'k')).toMatchObject({ verdedigt: 'g', uitkomen: true });
    const schot = acties(vangt.tekening).find((a) => a.type === 'schot') as BalActie;
    expect(schot).toMatchObject({ van: 'a1', afloop: 'vangt' });
    expect(houderAanHetEind(vangt.tekening, 'b')).toBe('k');
    // Duikt: schot naar de hoek, de keeper ligt even.
    const duikt = lijnenNaarAnimatie(t(obj, lijnen('duikt')));
    const tl = maakTijdlijn(duikt.tekening);
    let lag = false;
    for (let s = 0; s < tl.duur; s += 0.1) if (standOp(tl, s).objecten.get('k')!.liggen > 0.5) lag = true;
    expect(lag).toBe(true);
    // Goal: de bal eindigt in het goal (y < 0), niet bij de keeper.
    const goal = lijnenNaarAnimatie(t(obj, lijnen('goal')));
    const tg = maakTijdlijn(goal.tekening);
    expect(standOp(tg, tg.duur).objecten.get('b')!.y).toBeLessThan(0.2);
    expect(houderAanHetEind(goal.tekening, 'b')).toBeNull();
    // Naast: buiten de palen.
    const naast = acties(lijnenNaarAnimatie(t(obj, lijnen('naast'))).tekening).find((a) => a.type === 'schot') as BalActie;
    expect(Math.abs((naast.naar as [number, number])[0] - 20)).toBeGreaterThan(3.66);
  });

  it('een schotlijn die aan de keeper vastzit, is toch een schot', () => {
    const obj: VeldObject[] = [{ id: 'g', soort: 'goal', x: 20, y: 0 }, { id: 'k', soort: 'keeper', x: 20, y: 1.5 }, speler('a1', 20, 16), bal('b', 'a1')];
    const o = lijnenNaarAnimatie(t(obj, [lijn('bal', [20, 16], [20, 1.4], 1, { van: 'a1', naar: 'k' })]));
    expect(acties(o.tekening)[0]).toMatchObject({ type: 'schot', afloop: 'vangt' });
  });

  it('ballijn naar een rebounder kaatst terug; naar een leeg stuk rolt hij daarheen en de volgende dribbel pakt hem op', () => {
    const reb: VeldObject = { id: 'r', soort: 'rebounder', x: 10, y: 3 };
    const k = lijnenNaarAnimatie(t([reb, speler('a1', 10, 12), bal('b', 'a1')], [lijn('bal', [10, 12], [10, 3.2], 1, { van: 'a1' })]));
    expect(acties(k.tekening)[0]).toMatchObject({ type: 'pass', naar: 'r', terug: 'a1' });
    expect(houderAanHetEind(k.tekening, 'b')).toBe('a1');
    const diep = lijnenNaarAnimatie(
      t(
        [speler('a1', 5, 10), speler('a2', 10, 20), bal('b', 'a1')],
        [lijn('bal', [5, 10], [20, 10], 1, { van: 'a1' }), lijn('loop', [10, 20], [19.5, 11], 1, { van: 'a2' }), lijn('dribbel', [19.5, 11], [30, 11], 2)],
      ),
    );
    expect(diep.meldingen).toEqual([]);
    // In dezelfde stap loopt a2 naar de plek waar de bal heen gaat: pass in de loop.
    expect(acties(diep.tekening).find((a) => a.type === 'pass')).toMatchObject({ naar: 'a2' });
    expect(acties(diep.tekening).find((a) => a.type === 'dribbel')).toMatchObject({ wie: 'a2' });
  });

  it('looplijn over een ladder: vanzelf voetenwerk; anders de gekozen loopwijze', () => {
    const ladder: VeldObject = { id: 'l', soort: 'ladder', x: 10, y: 10, hoek: 90, lengte: 4 };
    const o = lijnenNaarAnimatie(t([ladder, speler('a1', 6, 10)], [lijn('loop', [6, 10], [15, 10], 1, { van: 'a1', manier: 'sprint' })]));
    expect(acties(o.tekening)[0]).toMatchObject({ manier: 'voetenwerk' });
    expect(fysiekeFouten(o.tekening)).toEqual([]);
    const z = lijnenNaarAnimatie(t([speler('a1', 6, 10)], [lijn('loop', [6, 10], [6, 18], 1, { van: 'a1', manier: 'achteruit' })]));
    expect(acties(z.tekening)[0]).toMatchObject({ manier: 'achteruit' });
  });

  it('gebogen lijn: de speler loopt via tussenpunten langs de boog', () => {
    const o = lijnenNaarAnimatie(t([speler('a1', 5, 10)], [lijn('loop', [5, 10], [25, 10], 1, { van: 'a1', bocht: [15, 4] })]));
    const a = acties(o.tekening)[0] as { via?: [number, number][] };
    expect(a.via!.length).toBeGreaterThan(3);
    expect(Math.min(...a.via!.map((p) => p[1]))).toBeLessThan(5.5);
  });

  it('wachttijd vóór een stap', () => {
    const o = lijnenNaarAnimatie(t([speler('a1', 5, 10)], [lijn('loop', [5, 10], [15, 10], 1, { van: 'a1', wacht: 1.5 })]));
    expect(o.tekening.animatie![1]).toEqual({ duur: 1.5, acties: [] });
  });

  it('herhalen voor de rij: iedereen in de rij doet het patroon, met een eigen bal, en sluit daarna aan', () => {
    const obj: VeldObject[] = [
      { id: 'g', soort: 'goal', x: 20, y: 0 },
      { id: 'k', soort: 'keeper', x: 20, y: 1.5 },
      speler('a1', 20, 25),
      speler('a2', 20, 26.6),
      speler('a3', 20, 28.2),
      bal('b', 'a1'),
    ];
    const lijnen = [lijn('dribbel', [20, 25], [20, 16], 1, { van: 'a1' }), lijn('bal', [20, 16], [18, 0.3], 2, { afloop: 'goal' })];
    const o = lijnenNaarAnimatie(t(obj, lijnen, { herhaalRij: true }));
    expect(o.meldingen).toEqual([]);
    expect(o.tekening.rijen).toHaveLength(1);
    expect(o.tekening.rijen![0]!.spelers).toEqual(['a1', 'a2', 'a3']);
    expect(o.tekening.objecten.filter((x) => x.soort === 'bal')).toHaveLength(3);
    const tl = maakTijdlijn(o.tekening);
    const schutters = [...tl.balEvents.values()]
      .flat()
      .filter((e) => e.soort === 'vlucht')
      .map((e) => (e.soort === 'vlucht' ? e.passeerder : ''));
    expect(new Set(schutters)).toEqual(new Set(['a1', 'a2', 'a3']));
    expect(fysiekeFouten(o.tekening)).toEqual([]);
    // Geen rij achter de eerste speler: melding, wel gewoon één keer afspelen.
    const los = lijnenNaarAnimatie(t([obj[0]!, obj[1]!, obj[2]!, obj[5]!], lijnen, { herhaalRij: true }));
    expect(los.meldingen.some((m) => m.lijn === -1 && /rij/.test(m.tekst))).toBe(true);
    expect(stappenMetActies(los.tekening)).toHaveLength(2);
  });

  it('fysieke waarschuwing op de lijn: een grondpass door een andere speler of over een ladder', () => {
    const ladder: VeldObject = { id: 'l', soort: 'ladder', x: 12, y: 10, hoek: 0, lengte: 4 };
    const tk = t([ladder, speler('a1', 5, 10), speler('a2', 20, 10), bal('b', 'a1')], [lijn('bal', [5, 10], [20, 10], 1, { van: 'a1', naar: 'a2' })]);
    const m = lijnMeldingen(tk);
    expect(m.some((x) => x.lijn === 0 && x.soort === 'let op' && /ladder/.test(x.tekst))).toBe(true);
    // Hoog over de ladder: geen waarschuwing.
    expect(lijnMeldingen({ ...tk, lijnen: [{ ...tk.lijnen![0]!, hoogte: 'hoog' }] }).filter((x) => x.soort === 'let op')).toEqual([]);
    const door = t([speler('a1', 5, 10), speler('a3', 12, 10), speler('a2', 20, 10), bal('b', 'a1')], [lijn('bal', [5, 10], [20, 10], 1, { van: 'a1', naar: 'a2' })]);
    expect(lijnMeldingen(door).some((x) => x.lijn === 0 && /door speler 3/.test(x.tekst))).toBe(true);
  });

  it('afspelen: ingebouwde oefeningen en tekeningen zonder nummers blijven zoals ze zijn', () => {
    const ingebouwd = OEFENINGEN[0]!.tekening;
    expect(afspeelTekening(ingebouwd)).toBe(ingebouwd);
    const stil = t(
      [speler('a1', 5, 10)],
      [
        {
          soort: 'loop',
          punten: [
            [5, 10],
            [15, 10],
          ],
        },
      ],
    );
    expect(heeftLijnAnimatie(stil)).toBe(false);
    expect(afspeelTekening(stil)).toBe(stil);
    const met = t([speler('a1', 5, 10)], [lijn('loop', [5, 10], [15, 10], 1, { van: 'a1' })]);
    expect(afspeelTekening(met).animatie?.length).toBeGreaterThan(0);
    expect(afspeelTekening(met)).toBe(afspeelTekening(met));
    expect(volgendeStap(met)).toBe(2);
  });
});

describe('kopie van een ingebouwde oefening: animatie → lijnen met stapnummers', () => {
  const telBal = (tk: Tekening) => acties(tk).filter((a) => a.type === 'pass' || a.type === 'schot').length;

  it('gewone oefeningen (lopen, dribbelen, passen, schieten) worden lijnen die weer net zo afspelen', () => {
    let gelukt = 0;
    for (const o of OEFENINGEN) {
      const r = animatieNaarLijnen(o.tekening);
      if (!('tekening' in r)) continue;
      gelukt++;
      const lijnen = r.tekening.lijnen!.filter((l) => l.stap);
      expect(lijnen.length).toBeGreaterThan(0);
      expect(r.tekening.animatie).toBeUndefined();
      // Terug naar animatie: zelfde aantal passes/schoten, geen fouten, en hij speelt af.
      const terug = lijnenNaarAnimatie(r.tekening);
      expect(terug.meldingen.filter((m) => m.soort === 'fout')).toEqual([]);
      expect(telBal(terug.tekening)).toBe(telBal(o.tekening));
      expect(maakTijdlijn(terug.tekening).duur).toBeGreaterThan(1);
    }
    expect(gelukt).toBeGreaterThanOrEqual(25);
  });

  it('stapnummers volgen de volgorde; tegelijk blijft tegelijk', () => {
    const o = OEFENINGEN.find((x) => x.id === 'veld-pt-derde-man')!;
    const r = animatieNaarLijnen(o.tekening);
    if (!('tekening' in r)) throw new Error(r.reden);
    const nummers = r.tekening.lijnen!.map((l) => l.stap ?? 0).filter(Boolean);
    expect(nummers[0]).toBe(1);
    expect([...nummers].sort((a, b) => a - b)).toEqual(nummers);
    const perStap = o.tekening.animatie!.filter((s) => 'acties' in s && s.acties.length).map((s) => (s as AnimatieStap).acties.length);
    expect(Math.max(...nummers)).toBe(perStap.length);
  });

  it('keeperacties (duiken naar een punt), druk zetten of rijen: niet omzetten, met een reden', () => {
    const duik = OEFENINGEN.find((x) => JSON.stringify(x.tekening.animatie).includes('duikNaar') && !x.tekening.rijen)!;
    const r = animatieNaarLijnen(duik.tekening);
    expect('reden' in r && r.reden).toMatch(/keeperactie|actie/);
    const rij = OEFENINGEN.find((x) => x.tekening.rijen?.length)!;
    expect(animatieNaarLijnen(rij.tekening)).toEqual({ reden: 'De spelers staan in een rij' });
  });
});
