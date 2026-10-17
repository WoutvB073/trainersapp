import { describe, expect, it } from 'vitest';
import { isLeeg, metNaam, nieuweTraining, type Training } from '../src/training/training';
import { leesHash, openTraining } from '../src/router';
import { apparaatBackend, TrainingStore } from '../src/training/opslag';
import { andereOefening, genereer, kandidaten, kiesOefening, oefeningenUit, recentGebruikt, type KiesContext, type Onderdeel } from '../src/training/genereren';
import { EXPORT_SOORT, exportNaam, leesExport, maakExport, voegSamen } from '../src/engine/exporteren';
import { doelnetGaten, koppelDoelnetten } from '../src/anim/doelnet';
import { PALET, draai, verplaats, verwijder, voegToe } from '../src/editor/editor';
import { doelnetUitkomst, lijnenNaarAnimatie } from '../src/editor/animatie';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { fysiekeFouten } from '../src/anim/fysiek';
import { OEFENINGEN } from '../src/data/oefeningen';
import type { EigenOefening, Lijn, Tekening, VeldObject } from '../src/model/types';

const geheugen = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
};
const training = (id: string, extra: Partial<Training> = {}): Training => ({ id, naam: '', spelers: 4, keepers: 1, oefeningen: [], gemaakt: 1, gewijzigd: 1, ...extra });

/** Vast "toeval" (herhaalbaar). */
function toeval(zaad = 1) {
  let s = zaad;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const ctx = (extra: Partial<KiesContext> = {}): KiesContext => ({ alle: OEFENINGEN, spelers: 4, keepers: 1, favorieten: new Set(), recent: new Map(), toeval: toeval(), ...extra });

describe('A1 Training maken', () => {
  it('nieuwe training: 4 spelers en 1 keeper', () => {
    expect(nieuweTraining(1, 'x')).toMatchObject({ spelers: 4, keepers: 1, oefeningen: [] });
  });

  it('leeg = geen oefeningen, naam en datum (aantallen tellen niet mee)', () => {
    expect(isLeeg(training('a', { spelers: 9 }))).toBe(true);
    expect(isLeeg(training('a', { naam: 'Dinsdag' }))).toBe(false);
    expect(isLeeg(training('a', { naam: '   ' }))).toBe(true);
    expect(isLeeg(training('a', { datum: '2026-10-20' }))).toBe(false);
    expect(isLeeg(training('a', { oefeningen: ['veld-pt-derde-man'] }))).toBe(false);
  });

  it('training genereren (ook vanuit een training): de training wordt niet als leeg weggehaald (bug 0.18.0)', () => {
    for (const hash of ['#/training/t1', '#/training/t1/kiezen', '#/training/t1/genereren', '#/training/t1/modus/2']) expect(openTraining(leesHash(hash)), hash).toBe('t1');
    expect(openTraining(leesHash('#/trainingen'))).toBeUndefined();
    const s = new TrainingStore(apparaatBackend(geheugen()));
    s.bewaar(training('t1'));
    // Van Training bewerken naar genereren: zolang je daar bent, blijft hij staan.
    s.ruimLegeOp(openTraining(leesHash('#/training/t1/genereren')));
    expect(s.haal('t1')).toBeDefined();
    // Gegenereerd (met oefeningen, zonder naam) en daarna weg: blijft staan, met een naam.
    s.bewaar(metNaam(training('t1', { oefeningen: ['veld-pt-derde-man'] }), new Date(2026, 9, 17)));
    s.ruimLegeOp();
    expect(s.haal('t1')).toMatchObject({ naam: 'Training 17 okt' });
    // Gewoon gemaakt met alleen oefeningen en geen naam: ook niet weggehaald.
    s.bewaar(training('t2', { oefeningen: ['veld-pt-derde-man'] }));
    s.ruimLegeOp();
    expect(s.haal('t2')).toBeDefined();
  });

  it('automatische naam: alleen als er oefeningen zijn en nog geen naam', () => {
    expect(metNaam(training('a'), new Date(2026, 9, 17)).naam).toBe('');
    expect(metNaam(training('a', { naam: 'Dinsdag', oefeningen: ['x'] })).naam).toBe('Dinsdag');
    expect(metNaam(training('a', { datum: '2026-11-03', oefeningen: ['x'] })).naam).toBe('Training 3 nov');
  });

  it('lege trainingen worden opgeruimd, behalve die je open hebt', () => {
    const s = new TrainingStore(apparaatBackend(geheugen()));
    s.bewaar(training('leeg1'));
    s.bewaar(training('leeg2'));
    s.bewaar(training('vol', { oefeningen: ['veld-pt-derde-man'] }));
    s.ruimLegeOp('leeg2');
    expect(s.lijst().map((t) => t.id).sort()).toEqual(['leeg2', 'vol']);
    s.ruimLegeOp();
    expect(s.lijst().map((t) => t.id)).toEqual(['vol']);
  });
});

describe('A2 Training genereren', () => {
  const plan: Onderdeel[] = [
    { soort: 'veld', categorie: 'warming-up' },
    { soort: 'keeper', categorie: 'laag-duiken' },
    { soort: 'keeper', categorie: 'reactie' },
    { soort: 'keeper', categorie: 'een-op-een' },
    { soort: 'veld', categorie: 'spelletjes' },
  ];

  it('per onderdeel een passende oefening, in volgorde, zonder dubbele', () => {
    const g = genereer(plan, ctx());
    expect(g.keuzes).toHaveLength(5);
    g.keuzes.forEach((id, i) => {
      const o = OEFENINGEN.find((x) => x.id === id)!;
      expect(o, `onderdeel ${i + 1}`).toBeDefined();
      expect(o.soort).toBe(plan[i]!.soort);
      expect(o.categorieen).toContain(plan[i]!.categorie);
      expect(o.spelersNodig).toBeLessThanOrEqual(4);
      expect(o.keepersNodig).toBeLessThanOrEqual(1);
    });
    expect(new Set(g.keuzes).size).toBe(5);
    // Hetzelfde onderdeel twee keer: twee verschillende oefeningen.
    const dubbel = genereer([plan[0]!, plan[0]!], ctx());
    expect(dubbel.keuzes[0]).not.toBe(dubbel.keuzes[1]);
  });

  it('favorieten krijgen voorrang, oefeningen uit de laatste training liever niet', () => {
    const o = plan[0]!;
    const opties = kandidaten(o, ctx());
    expect(opties.length).toBeGreaterThan(3);
    const fav = opties[opties.length - 1]!.id;
    for (let z = 1; z <= 20; z++) expect(kiesOefening(o, ctx({ favorieten: new Set([fav]), toeval: toeval(z) }), new Set())?.id).toBe(fav);
    // Alles behalve één zat in de laatste training: dan die ene.
    const vrij = opties[1]!.id;
    const recent = new Map(opties.filter((x) => x.id !== vrij).map((x) => [x.id, 1] as const));
    for (let z = 1; z <= 20; z++) expect(kiesOefening(o, ctx({ recent, toeval: toeval(z) }), new Set())?.id).toBe(vrij);
  });

  it('afwisseling: met ander toeval andere keuzes', () => {
    const keuzes = new Set<string>();
    for (let z = 1; z <= 15; z++) keuzes.add(genereer([plan[0]!], ctx({ toeval: toeval(z) })).keuzes[0]!);
    expect(keuzes.size).toBeGreaterThan(2);
  });

  it('geen passende oefening: null bij dat onderdeel', () => {
    const g = genereer([{ soort: 'keeper', categorie: 'laag-duiken' }, plan[0]!], ctx({ keepers: 0 }));
    expect(g.keuzes[0]).toBeNull();
    expect(g.keuzes[1]).toBeTruthy();
    expect(oefeningenUit(g)).toEqual([g.keuzes[1]]);
  });

  it('andere oefening: alleen dat onderdeel, nooit een die al in de training zit', () => {
    const g = genereer(plan, ctx());
    const extra = kandidaten(plan[2]!, ctx()).find((x) => !g.keuzes.includes(x.id))!.id;
    const n = andereOefening(g, 2, ctx({ toeval: toeval(7) }), [...oefeningenUit(g), extra]);
    expect(n.keuzes[2]).not.toBe(g.keuzes[2]);
    expect(n.keuzes[2]).not.toBe(extra);
    expect(n.keuzes.filter((_, i) => i !== 2)).toEqual(g.keuzes.filter((_, i) => i !== 2));
    // Is er geen andere meer, dan blijft het zoals het was.
    const een = genereer([plan[0]!], ctx());
    const alle = kandidaten(plan[0]!, ctx()).map((x) => x.id);
    expect(andereOefening(een, 0, ctx(), alle)).toBe(een);
  });

  it('recent gebruikt: nieuwste training = 1, de vorige = 2', () => {
    const r = recentGebruikt([
      training('oud', { datum: '2026-09-01', oefeningen: ['a', 'b'] }),
      training('nieuw', { datum: '2026-10-01', oefeningen: ['b', 'c'] }),
      training('nu', { datum: '2026-10-10', oefeningen: ['z'] }),
    ], 'nu');
    expect(Object.fromEntries(r)).toEqual({ b: 1, c: 1, a: 2 });
  });
});

describe('A7 Exporteren en importeren', () => {
  const eigen = (id: string, naam: string, extra: Partial<EigenOefening> = {}): EigenOefening => ({
    id,
    soort: 'veld',
    naam,
    categorieen: ['techniek'],
    uitleg: '',
    benodigdheden: [],
    spelersNodig: 2,
    keepersNodig: 0,
    doorwisselbaar: true,
    coachpunten: [],
    variaties: { makkelijker: [], moeilijker: [] },
    tekening: { veld: { type: 'leeg', breedte: 20, lengte: 20 }, objecten: [] },
    eigen: true,
    gemaakt: 1,
    gewijzigd: 1,
    ...extra,
  });

  it('bestand heen en terug', () => {
    const b = maakExport({ eigen: [eigen('eigen-1', 'Rondo')], trainingen: [training('t1', { naam: 'Dinsdag', oefeningen: ['eigen-1'] })], favorieten: ['veld-pt-derde-man'] }, 5);
    const terug = leesExport(JSON.stringify(b));
    expect(terug).toMatchObject({ soort: EXPORT_SOORT, gemaakt: 5, favorieten: ['veld-pt-derde-man'] });
    expect(terug!.eigenOefeningen[0]!.naam).toBe('Rondo');
    expect(terug!.trainingen[0]!.naam).toBe('Dinsdag');
    expect(exportNaam(new Date(2026, 9, 6))).toBe('toptraining-2026-10-06.json');
  });

  it('geen TopTraining-bestand of kapotte onderdelen', () => {
    expect(leesExport('hallo')).toBeNull();
    expect(leesExport(JSON.stringify({ soort: 'iets anders' }))).toBeNull();
    const b = leesExport(JSON.stringify({ soort: EXPORT_SOORT, versie: 1, eigenOefeningen: [{ id: 'x' }], trainingen: [{ id: 't', naam: 'x', spelers: -1 }], favorieten: [1, 'a'] }));
    expect(b).toMatchObject({ eigenOefeningen: [], trainingen: [], favorieten: ['a'] });
  });

  it('samenvoegen: niets dubbel, niets overschreven', () => {
    const lokaal = {
      eigen: [eigen('eigen-1', 'Rondo'), eigen('eigen-2', 'Passen')],
      trainingen: [training('t1', { naam: 'Dinsdag', oefeningen: ['eigen-1'] })],
      favorieten: ['veld-pt-derde-man'],
    };
    const bestand = maakExport({
      eigen: [
        eigen('eigen-1', 'Rondo', { gewijzigd: 99 }), // zelfde inhoud: overslaan
        eigen('eigen-2', 'Passen anders'), // zelfde id, andere inhoud: erbij met een nieuwe id
        eigen('eigen-3', 'Nieuw'),
      ],
      trainingen: [
        training('t1', { naam: 'Dinsdag', oefeningen: ['eigen-1'] }), // zelfde: overslaan
        training('t1', { naam: 'Donderdag', oefeningen: ['eigen-2', 'eigen-3'] }), // zelfde id, andere inhoud
      ],
      favorieten: ['veld-pt-derde-man', 'eigen-2'],
    });
    const s = voegSamen(lokaal, bestand, () => 'nieuw');
    expect(s.eigen.map((o) => [o.id, o.naam])).toEqual([
      ['eigen-nieuw', 'Passen anders'],
      ['eigen-3', 'Nieuw'],
    ]);
    expect(s.trainingen).toHaveLength(1);
    expect(s.trainingen[0]).toMatchObject({ id: 'nieuw', naam: 'Donderdag', oefeningen: ['eigen-nieuw', 'eigen-3'] });
    expect(s.favorieten).toEqual(['eigen-nieuw']);
    expect(s.overgeslagen).toBe(2);
    // Nog een keer hetzelfde bestand op de samengevoegde gegevens: er komt niets meer bij.
    const daarna = { eigen: [...lokaal.eigen, ...s.eigen], trainingen: [...lokaal.trainingen, ...s.trainingen], favorieten: [...lokaal.favorieten, ...s.favorieten] };
    const opnieuw = voegSamen(daarna, bestand, () => 'nog');
    expect([opnieuw.eigen.length, opnieuw.trainingen.length, opnieuw.favorieten.length]).toEqual([0, 0, 0]);
  });
});

describe('A4 Doelnet', () => {
  const goal: VeldObject = { id: 'g1', soort: 'goal', x: 20, y: 0 };
  const speler: VeldObject = { id: 'a1', soort: 'speler', team: 'A', nummer: 1, x: 20, y: 16 };
  const bal: VeldObject = { id: 'b', soort: 'bal', x: 20, y: 16, bij: 'a1' };
  const basis: Tekening = { veld: { type: 'leeg', breedte: 40, lengte: 30 }, objecten: [goal, speler, bal] };
  const metNet = () => {
    const item = PALET.find((p) => p.sleutel === 'doelnet')!;
    return voegToe(basis, item.maak(basis, [5, 25]));
  };
  const schot = (naar: [number, number], hoogte?: Lijn['hoogte']): Lijn => ({ soort: 'bal', punten: [[20, 16], naar], van: 'a1', stap: 1, ...(hoogte ? { hoogte } : {}) });
  const eindPlek = (t: Tekening) => {
    const tl = maakTijdlijn(t);
    const s = standOp(tl, tl.duur).objecten.get('b')!;
    return { x: s.x, y: s.y, houder: s.houder };
  };

  it('hangt in het (dichtstbijzijnde vrije) goal en volgt het als dat verschuift of draait', () => {
    let t = metNet();
    const net = t.objecten.find((o) => o.soort === 'doelnet')!;
    expect(net).toMatchObject({ doel: 'g1', x: 20, y: 0, breedte: 7.32, hoogte: 2.44 });
    t = verplaats(t, 'g1', [25, 2]);
    t = draai(t, 'g1', 90);
    expect(t.objecten.find((o) => o.soort === 'doelnet')).toMatchObject({ x: 25, y: 2, hoek: 90 });
    // Goal weg: net los; een tweede net in hetzelfde goal kan niet.
    expect(verwijder(t, 'g1').objecten.find((o) => o.soort === 'doelnet')!.doel).toBeUndefined();
    expect(koppelDoelnetten([goal, { id: 'n1', soort: 'doelnet', x: 20, y: 0, doel: 'g1' }, { id: 'n2', soort: 'doelnet', x: 20.5, y: 0 }]).find((o) => o.id === 'n2')!.doel).toBeUndefined();
  });

  it('vier gaten in de hoeken, binnen het goal', () => {
    const g = doelnetGaten(7.32, 2.44);
    expect(g).toHaveLength(4);
    for (const x of g) {
      expect(Math.abs(x.x) + x.r).toBeLessThan(7.32 / 2);
      expect(x.h - x.r).toBeGreaterThan(0);
      expect(x.h + x.r).toBeLessThan(2.44);
    }
  });

  it('schot in een hoek (laag of hoog): door het gat het goal in', () => {
    for (const [naar, hoogte] of [
      [[23.4, 0], undefined],
      [[16.6, 0], 'grond'],
      [[23.4, 0], 'hoog'],
    ] as const) {
      const t = { ...metNet(), lijnen: [schot(naar as [number, number], hoogte)] };
      expect(doelnetUitkomst(t, t.lijnen![0]!)).toBe('gat');
      const o = lijnenNaarAnimatie(t);
      expect(o.meldingen.filter((m) => m.soort === 'fout')).toEqual([]);
      const e = eindPlek(o.tekening);
      expect(e.houder ?? null).toBeNull();
      expect(e.y).toBeLessThan(0); // achter de doellijn
      expect(fysiekeFouten(o.tekening)).toEqual([]);
    }
  });

  it('schot in het midden: kaatst terug van het net, het veld in', () => {
    const t = { ...metNet(), lijnen: [schot([20.5, 0])] };
    expect(doelnetUitkomst(t, t.lijnen![0]!)).toBe('net');
    const o = lijnenNaarAnimatie(t);
    const a = (o.tekening.animatie ?? []).flatMap((s) => ('acties' in s ? s.acties : [])).find((x) => x.type === 'schot')!;
    expect(a).toMatchObject({ raakt: 'net' });
    const e = eindPlek(o.tekening);
    expect(e.y).toBeGreaterThan(2.5); // terug het veld in
    // Zonder doelnet: gewoon een doelpunt.
    expect(doelnetUitkomst({ ...basis, lijnen: [schot([20.5, 0])] }, schot([20.5, 0]))).toBeNull();
  });

  it('ingebouwde oefeningen hebben geen doelnet', () => {
    expect(OEFENINGEN.some((o) => o.tekening.objecten.some((x) => x.soort === 'doelnet'))).toBe(false);
  });
});
