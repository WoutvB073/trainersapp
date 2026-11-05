import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { fysiekeFouten } from '../src/anim/fysiek';
import { ARCHIEF, OEFENINGEN, vindOefening } from '../src/data/oefeningen';
import { CATEGORIEEN } from '../src/data/categorieen';
import { isLeeftijd, LEEFTIJDEN } from '../src/data/leeftijden';
import { bewaarLeeftijd, filterOefeningen, GEEN_FILTERS, leesLeeftijd } from '../src/engine/filters';
import { kandidaten } from '../src/training/genereren';
import { benodigdheden, kiesbaar, naarCode, pastBijLeeftijd, uitCode } from '../src/training/training';
import type { Tekening } from '../src/model/types';

/** Versie 0.30.0: leeftijdsgroepen en Mini Talents. */

const MINI = ['mini-3-5', 'mini-5-7'] as const;
const nieuw = OEFENINGEN.filter((o) => o.id.startsWith('veld-mt-'));
const groep = (c: string) => nieuw.filter((o) => o.categorieen[0] === c);

/** De bestaande oefeningen die de opdracht zeker bij de mini's noemt. */
const ZEKER = ['veld-sp-piratenspel', 'veld-tq-koning-van-het-vak', 'veld-wu-schatrovers', 'veld-wu-overlopertje', 'veld-wu-tikkertje-hesjes', 'veld-te-kleurenreactie-bal', 'veld-pt-pionnen-omschieten', 'veld-af-kleine-doeltjes'];

/** Alleen dit materiaal mag bij de mini-oefeningen (de hoeveelheid staat ervoor). */
const MATERIAAL = /(voetbal|pion|hoedje|paal|palen|pop|kaatsbord|hesje|horde|hoepel|loopladder|tennisbal|mini-goaltje|E-goal|grote goal|net met open hoeken)/i;

describe('leeftijdsgroepen', () => {
  it('vijf groepen in volgorde', () => {
    expect(LEEFTIJDEN.map((l) => l.id)).toEqual(['mini-3-5', 'mini-5-7', 'jo8-11', 'jo12-15', 'jo16-19']);
    expect(LEEFTIJDEN.map((l) => l.naam)).toEqual(['Mini’s 3–5 jr', 'Mini’s 5–7 jr', 'JO8–JO11', 'JO12–JO15', 'JO16–JO19']);
  });
  it('elke oefening in de bibliotheek heeft een geldige leeftijdsgroep', () => {
    for (const o of OEFENINGEN) {
      expect(o.leeftijden?.length ?? 0, o.id).toBeGreaterThan(0);
      for (const l of o.leeftijden!) expect(isLeeftijd(l), `${o.id}: ${l}`).toBe(true);
    }
  });
  it('keepers nooit bij de mini’s', () => {
    for (const o of OEFENINGEN.filter((x) => x.soort === 'keeper')) expect(o.leeftijden!.some((l) => l.startsWith('mini')), o.id).toBe(false);
  });
  it('mini’s: de genoemde oefeningen staan in beide groepen', () => {
    for (const id of ZEKER) expect(vindOefening(id)?.leeftijden, id).toEqual(expect.arrayContaining([...MINI]));
  });
  it('iedere mini-oefening staat in beide mini-groepen (3,5–7 jaar)', () => {
    for (const o of OEFENINGEN) {
      const aantal = MINI.filter((m) => o.leeftijden!.includes(m)).length;
      expect(aantal === 0 || aantal === 2, o.id).toBe(true);
    }
  });
  it('Snelle schutter is terug, alleen voor de mini’s', () => {
    const o = vindOefening('veld-af-kleine-doeltjes')!;
    expect(o.verwijderd).toBeFalsy();
    expect(OEFENINGEN.map((x) => x.id)).toContain(o.id);
    expect(ARCHIEF.map((x) => x.id)).not.toContain(o.id);
    expect(o.leeftijden).toEqual([...MINI]);
  });
  it('categorie 1 tegen 1 bij de spelers, ook bij bestaande duels', () => {
    expect(CATEGORIEEN.veld.map((c) => c.id)).toContain('een-tegen-een');
    for (const id of ['veld-pv-1-1-doeltjes', 'veld-pv-1-1-poortjes', 'veld-pv-wippen-1-1', 'veld-af-duel-twee-rijen', 'veld-vo-1-1-wegdrukken', 'veld-cv-hordes-sprint-duel']) expect(vindOefening(id)!.categorieen, id).toContain('een-tegen-een');
  });
});

describe('filter op leeftijd', () => {
  it('oefening zonder leeftijden (eigen) past altijd; zonder keuze past alles', () => {
    expect(pastBijLeeftijd({}, 'mini-3-5')).toBe(true);
    expect(pastBijLeeftijd({ leeftijden: ['jo16-19'] }, null)).toBe(true);
    expect(pastBijLeeftijd({ leeftijden: ['jo16-19'] }, 'mini-3-5')).toBe(false);
  });
  it('bibliotheek, Training maken en Training genereren gebruiken dezelfde regel', () => {
    const lijst = filterOefeningen(OEFENINGEN, { ...GEEN_FILTERS, leeftijd: 'mini-3-5' }, new Set());
    expect(lijst.length).toBeGreaterThan(62);
    expect(lijst.every((o) => o.leeftijden!.includes('mini-3-5'))).toBe(true);
    const kiezen = kiesbaar(OEFENINGEN, 'veld', 'afwerken', 10, 0, 'mini-5-7').map((o) => o.id);
    const genereren = kandidaten({ soort: 'veld', categorie: 'afwerken' }, { alle: OEFENINGEN, spelers: 10, keepers: 0, leeftijd: 'mini-5-7' }).map((o) => o.id);
    expect(genereren).toEqual(kiezen);
    expect(kiezen).toContain('veld-mt-hoekenjacht');
    expect(kiezen).not.toContain('veld-af-cutback');
  });
  it('de laatst gekozen leeftijd wordt onthouden', () => {
    const data = new Map<string, string>();
    const plek = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
    expect(leesLeeftijd(plek)).toBeNull();
    bewaarLeeftijd('jo8-11', plek);
    expect(leesLeeftijd(plek)).toBe('jo8-11');
    bewaarLeeftijd(null, plek);
    expect(leesLeeftijd(plek)).toBeNull();
    data.set('trainersapp.filterLeeftijd', 'onzin');
    expect(leesLeeftijd(plek)).toBeNull();
  });
  it('deellink met leeftijd, en oude links zonder', () => {
    const t = { naam: 'x', spelers: 5, keepers: 0, oefeningen: ['veld-mt-tik-tak'] };
    expect(uitCode(naarCode({ ...t, leeftijd: 'mini-3-5' }))?.leeftijd).toBe('mini-3-5');
    expect(uitCode(naarCode(t))?.leeftijd).toBeUndefined();
  });
});

describe('nieuwe mini-oefeningen', () => {
  it('62 stuks: 17 techniek, 15 1 tegen 1, 15 afwerken, 15 partijvormen', () => {
    expect(nieuw).toHaveLength(62);
    expect(groep('techniek')).toHaveLength(17);
    expect(groep('een-tegen-een')).toHaveLength(15);
    expect(groep('afwerken')).toHaveLength(15);
    expect(groep('partijvormen')).toHaveLength(15);
  });
  it('allemaal mini’s, geen keepers, 1–2 coachpunten, animatie', () => {
    for (const o of nieuw) {
      expect(o.leeftijden, o.id).toEqual([...MINI]);
      expect(o.keepersNodig, o.id).toBe(0);
      expect(o.coachpunten.length, o.id).toBeLessThanOrEqual(2);
      expect(o.tekening.animatie?.length ?? 0, o.id).toBeGreaterThan(0);
    }
  });
  it('alleen beschikbaar materiaal', () => {
    for (const o of nieuw) for (const b of o.benodigdheden) expect(b, o.id).toMatch(MATERIAAL);
  });
  it('mini-goaltjes zijn altijd zonder net', () => {
    for (const o of nieuw) for (const g of o.tekening.objecten.filter((x) => x.soort === 'klein-goal')) expect(g.zonderNet, o.id).toBe(true);
  });
  it('partijvormen: 4+ spelers, met uitleg voor 10 kinderen', () => {
    for (const o of groep('partijvormen')) {
      expect(o.spelersNodig, o.id).toBe(4);
      expect(o.doorwisselbaar, o.id).toBe(true);
      expect(o.organisatie, o.id).toMatch(/10 kinderen/);
    }
  });
  it('techniek, 1 tegen 1 en afwerken zijn stations: niet meer dan 3 in een rij', () => {
    for (const o of nieuw.filter((x) => x.categorieen[0] !== 'partijvormen')) for (const r of o.tekening.rijen ?? []) expect(r.spelers.length, o.id).toBeLessThanOrEqual(3);
  });
  it('klaarzetten telt de nieuwe materialen op', () => {
    const lijst = benodigdheden([vindOefening('veld-mt-huisjes')!, vindOefening('veld-mt-brandweer')!], 'nl').map((b) => b.tekst);
    expect(lijst).toContain('5 hoepels');
  });
});

describe('bouwstenen 0.30.0', () => {
  const speler = { id: 'a', soort: 'speler' as const, x: 0, y: 0, kijkrichting: 0 };
  const tekening = (extra: Tekening['objecten'], animatie: Tekening['animatie']): Tekening => ({ veld: { type: 'leeg', breedte: 20, lengte: 20 }, objecten: [speler, ...extra], animatie });

  it('pion valt om en wordt weer rechtop gezet', () => {
    const tl = maakTijdlijn(tekening([{ id: 'p', soort: 'pion', x: 1, y: 0 }], [{ acties: [{ type: 'valOm', object: 'p', hoek: 90 }] }, { duur: 1, acties: [] }, { acties: [{ type: 'zetOp', wie: 'a', object: 'p' }] }]));
    expect(standOp(tl, 0.5).materiaal.get('p')).toMatchObject({ kantel: 1, kantelHoek: 90 });
    expect(standOp(tl, tl.duur).materiaal.get('p')!.kantel).toBe(0);
  });
  it('object pakken, meenemen en neerleggen', () => {
    const tl = maakTijdlijn(tekening([{ id: 'h', soort: 'hoedje', x: 0.6, y: 0 }], [{ acties: [{ type: 'pakObject', wie: 'a', object: 'h' }] }, { acties: [{ type: 'loop', wie: 'a', naar: [5, 0], duur: 2 }] }, { acties: [{ type: 'legObject', wie: 'a', object: 'h', naar: [5.5, 0] }] }]));
    const onderweg = standOp(tl, 1.6).materiaal.get('h')!;
    expect(onderweg.gedragen).toBe(true);
    expect(onderweg.hoogte).toBeGreaterThan(0.5);
    expect(onderweg.x).toBeGreaterThan(1);
    expect(standOp(tl, tl.duur + 1).materiaal.get('h')).toMatchObject({ x: 5.5, y: 0, hoogte: 0, gedragen: false });
  });
  it('hoedje op zijn kop en terug', () => {
    const tl = maakTijdlijn(tekening([{ id: 'h', soort: 'hoedje', x: 0.6, y: 0 }], [{ acties: [{ type: 'keerOm', wie: 'a', object: 'h' }] }, { duur: 0.4, acties: [] }, { acties: [{ type: 'keerOm', wie: 'a', object: 'h' }] }, { duur: 0.4, acties: [] }]));
    expect(standOp(tl, 0.8).materiaal.get('h')!.kop).toBe(1);
    expect(standOp(tl, tl.duur).materiaal.get('h')!.kop).toBe(0);
  });
  it('bal op een pion valt eraf en rolt weg', () => {
    const tl = maakTijdlijn(tekening([{ id: 'b', soort: 'bal', x: 3, y: 0, opHoogte: 0.4 }], [{ duur: 0.5, acties: [] }, { acties: [{ type: 'valOm', object: 'b', naar: [3, 2] }] }, { duur: 1, acties: [] }]));
    expect(standOp(tl, 0.2).objecten.get('b')!.hoogte).toBeCloseTo(0.4);
    expect(standOp(tl, tl.duur).objecten.get('b')).toMatchObject({ x: 3, y: 2, hoogte: 0 });
  });
  it('op de bal zitten: de bal ligt onder de speler', () => {
    const tl = maakTijdlijn(tekening([{ id: 'b', soort: 'bal', x: 0.55, y: 0, bij: 'a' }], [{ duur: 0.5, acties: [] }, { acties: [{ type: 'zitten', wie: 'a', houding: 'op-bal' }] }, { duur: 1, acties: [] }]));
    expect(standOp(tl, 0).objecten.get('b')!.x).toBeGreaterThan(0.3);
    expect(standOp(tl, tl.duur).objecten.get('b')!.x).toBeCloseTo(0, 1);
  });
  it('voet op de bal en tik-tak', () => {
    const tl = maakTijdlijn(tekening([{ id: 'b', soort: 'bal', x: 0.55, y: 0, bij: 'a' }], [{ acties: [{ type: 'voetOpBal', wie: 'a', duur: 1 }] }, { acties: [{ type: 'tiktak', wie: 'a', duur: 1 }] }]));
    expect(standOp(tl, 0.5).objecten.get('a')!.voetOp).toBe(1);
    const links = standOp(tl, 1.25).objecten.get('b')!;
    const rechts = standOp(tl, 1.75).objecten.get('b')!;
    expect(Math.abs(links.y - rechts.y)).toBeGreaterThan(0.3);
  });
  it('hesje als staart hangt achter de speler tot het gepakt wordt', () => {
    const o = vindOefening('veld-mt-staart-pakken')!;
    const tl = maakTijdlijn(o.tekening);
    expect(standOp(tl, 0).materiaal.get('s1')).toMatchObject({ gedragen: true });
    const s = standOp(tl, tl.duur);
    const c1 = s.objecten.get('c1')!;
    const m = s.materiaal.get('s1')!;
    expect(Math.hypot(m.x - c1.x, m.y - c1.y)).toBeLessThan(0.5);
  });
  it('een bal mag bewust onder een horde door', () => {
    const horde = { id: 'h', soort: 'horde' as const, x: 3, y: 0, hoek: 90, hoogte: 0.3 };
    const bal = { id: 'b', soort: 'bal' as const, x: 0.55, y: 0, bij: 'a' };
    expect(fysiekeFouten(tekening([horde, bal], [{ acties: [{ type: 'pass', van: 'a', naar: [6, 0] }] }])).length).toBeGreaterThan(0);
    expect(fysiekeFouten(tekening([horde, bal], [{ acties: [{ type: 'pass', van: 'a', naar: [6, 0], onderdoor: 'h' }] }]))).toEqual([]);
  });
});

