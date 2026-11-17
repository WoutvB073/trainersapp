import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { maakTijdlijn, standOp } from '../src/anim/timeline';
import { BAL_R, balInvoer, maakSkelet, nieuweStaat, persoonInvoer, poseer, type PopSoort } from '../src/anim/poppetje';
import type { Tekening } from '../src/model/types';
import { vindOefening } from '../src/data/oefeningen';

/** 0.37.2: bouwsteen "teken" (arm omhoog) en de eerder overgeslagen voorstellen die toch anders zijn. */

const tekening = (kant: 'links' | 'rechts'): Tekening => ({
  veld: { type: 'leeg', breedte: 10, lengte: 10 },
  objecten: [{ id: 't1', soort: 'trainer', x: 5, y: 5, kijkrichting: 90 }],
  animatie: [{ duur: 0.5, acties: [] }, { acties: [{ type: 'teken', wie: 't1', kant }] }, { duur: 0.5, acties: [] }],
});

/** Poseert de trainer tot tijdstip t en geeft de polsen en het hoofd (wereld). */
function houding(kant: 'links' | 'rechts', tot: number) {
  const tl = maakTijdlijn(tekening(kant));
  const sk = maakSkelet();
  const staat = nieuweStaat();
  const stap = 1 / 30;
  for (let i = 0, t = 0; t <= tot + 1e-9; i++, t = i * stap) {
    const s = standOp(tl, t);
    const st = s.objecten.get('t1')!;
    const bi = balInvoer(s, [], BAL_R);
    poseer(sk, staat, { s: st, soort: 'trainer' as PopSoort, t, dtEcht: stap, dtAnim: stap, sprong: i === 0, zaad: 0.3, ...persoonInvoer('t1', 'trainer', st, s, bi) });
  }
  return {
    rechts: sk.pols[0].getWorldPosition(new Vector3()),
    links: sk.pols[1].getWorldPosition(new Vector3()),
    hoofd: sk.hoofd.getWorldPosition(new Vector3()),
  };
}

describe('0.37.2: arm omhoog als teken', () => {
  it('de tijdlijn zet de arm in 0,25 s omhoog, houdt hem vast en laat hem weer zakken (standaard 1,2 s)', () => {
    const tl = maakTijdlijn(tekening('links'));
    expect(tl.duur).toBeCloseTo(2.2, 1);
    expect(standOp(tl, 0.3).objecten.get('t1')!.teken).toBeUndefined();
    expect(standOp(tl, 0.6).objecten.get('t1')!.teken?.u).toBeCloseTo(0.4, 1);
    expect(standOp(tl, 1.1).objecten.get('t1')!.teken).toEqual({ kant: 'links', u: 1 });
    expect(standOp(tl, 1.9).objecten.get('t1')!.teken).toBeUndefined();
  });

  for (const kant of ['links', 'rechts'] as const) {
    it(`3D: de ${kant}erhand gaat boven het hoofd, de andere hand blijft laag`, () => {
      const p = houding(kant, 1.1);
      const op = kant === 'links' ? p.links : p.rechts;
      const neer = kant === 'links' ? p.rechts : p.links;
      expect(op.y).toBeGreaterThan(p.hoofd.y + 0.15);
      expect(neer.y).toBeLessThan(p.hoofd.y - 0.4);
      // Na het teken hangt de arm weer naast het lijf.
      const na = houding(kant, 2.2);
      expect((kant === 'links' ? na.links : na.rechts).y).toBeLessThan(na.hoofd.y - 0.4);
    });
  }

  it('de trainer kijkt naar de speler: links is aan zijn linkerkant (gezien vanuit de trainer)', () => {
    // Veld: x naar rechts, y naar beneden (2D). Wie naar +y kijkt (90°), heeft zijn linkerhand aan de +x-kant.
    const p = houding('links', 1.1);
    expect(p.links.x).toBeGreaterThan(5);
    const q = houding('rechts', 1.1);
    expect(q.rechts.x).toBeLessThan(5);
  });
});

/** De 29 eerder overgeslagen voorstellen die toch anders zijn (correctie van de gebruiker, 17-11-2026). */
const NIEUW: Record<string, string[]> = {
  loopcoordinatie: ['veld-lc-hoepelhinkelbaan'],
  techniek: ['veld-tq-kapwedstrijd-lijn', 'veld-tq-kiezen-bij-de-pop', 'veld-tq-buitenkant-slalom-tijd'],
  spelletjes: ['veld-sp-doelpuntenestafette', 'veld-sp-ballen-in-de-mand'],
  'pass-en-trap': ['veld-pt-driehoek-in-uitdraaien', 'veld-pt-vierkant-twee-ballen-klok', 'veld-pt-tikkie-takkie-estafette', 'veld-pt-rollen-naar-de-hoepel'],
  afwerken: ['veld-af-tweede-paal', 'veld-af-rug-naar-doel-draaien', 'veld-af-voorzet-kruislings-koppen', 'veld-af-een-tweetje-schot', 'veld-af-kanonnen'],
  positiespel: ['veld-ps-rondo-3-1-twee-vakken', 'veld-ps-3-3-vier-kaatsers', 'veld-ps-opbouw-via-middenvak', 'veld-ps-keeper-extra-man'],
  'verdedigen-omschakelen': ['veld-vo-rugdekking', 'veld-vo-terugverdedigen', 'veld-vo-3-2-en-2-3-terug', 'veld-vo-vier-seconden', 'veld-vo-ondertal-2-3'],
  'een-tegen-een': ['veld-een-vier-doeltjes-kruis', 'veld-een-krokodillenrivier-twee-oevers'],
  partijvormen: ['veld-pv-4-4-drie-teams', 'veld-pv-toernooi-2-2-vier-veldjes', 'veld-pv-schietlijn'],
};
const ALLE = Object.values(NIEUW).flat();
const MINI = ['mini-3-5', 'mini-5-7'];
const CLUBMATERIAAL = /(voetbal|pion|hoedje|paal|palen|pop|kaatsbord|hesje|horde|hoepel|loopladder|tennisbal|mini-goaltje|E-goal|grote goal|net met open hoeken)/i;

describe('0.37.2: 29 oefeningen uit de eerder overgeslagen voorstellen', () => {
  it('bestaan allemaal, in hun eigen categorie, met de vaste velden', () => {
    expect(ALLE).toHaveLength(29);
    expect(new Set(ALLE).size).toBe(29);
    for (const [cat, ids] of Object.entries(NIEUW)) {
      for (const id of ids) {
        const o = vindOefening(id)!;
        expect(o, id).toBeTruthy();
        expect(o.verwijderd, id).toBeFalsy();
        expect(o.categorieen[0], id).toBe(cat);
        expect(o.leeftijden?.length, id).toBeGreaterThan(0);
        expect(o.coachpunten.length, id).toBeGreaterThanOrEqual(2);
        expect(o.coachpunten.length, id).toBeLessThanOrEqual(4);
        expect(o.variaties?.makkelijker?.length, id).toBeGreaterThan(0);
        expect(o.variaties?.moeilijker?.length, id).toBeGreaterThan(0);
        expect(typeof o.doorwisselbaar, id).toBe('boolean');
        if (o.doorwisselbaar === false) expect(o.meerSpelers, id).toMatch(/^Met meer spelers/);
        expect(() => maakTijdlijn(o.tekening), id).not.toThrow();
      }
    }
  });

  it('loopcoördinatie gaat zonder bal; O6 en O7 alleen met materiaal van de club', () => {
    for (const id of NIEUW.loopcoordinatie!) expect(vindOefening(id)!.tekening.objecten.some((x) => x.soort === 'bal'), id).toBe(false);
    let mini = 0;
    for (const id of ALLE) {
      const o = vindOefening(id)!;
      if (!o.leeftijden?.some((l) => MINI.includes(l))) continue;
      mini++;
      for (const b of o.benodigdheden) expect(b, id).toMatch(CLUBMATERIAAL);
    }
    expect(mini).toBeGreaterThanOrEqual(6);
  });

  it('Kiezen bij de pop: de trainer steekt een arm op, links en rechts', () => {
    const o = vindOefening('veld-tq-kiezen-bij-de-pop')!;
    const tekens = (o.tekening.animatie ?? []).flatMap((s) => ('acties' in s ? s.acties : [])).filter((a) => a.type === 'teken');
    expect(tekens.map((a) => ('kant' in a ? a.kant : '')).sort()).toEqual(['links', 'rechts']);
  });

  it('de zeven voorstellen die praktisch exact gelijk zijn, verwijzen naar een bestaande oefening', () => {
    // L1 = Loopladder zijwaarts, S1 = Latje-trap, A11 = Hoekenjacht, PS2 = Omschakelen tussen twee vakken,
    // PS9 = Rondo 3 tegen 1 in de driehoek, D4 = Koning van het veld, PV5 = Eindzonespel 4 tegen 4.
    for (const id of ['veld-lc-ladder-in-uit', 'veld-sp-latje-trap', 'veld-mt-hoekenjacht', 'veld-ps-omschakelen', 'veld-ps-rondo-3-1', 'veld-sp-koning-van-het-veld', 'veld-ps-eindzone']) {
      const o = vindOefening(id);
      expect(o, id).toBeTruthy();
      expect(o!.verwijderd, id).toBeFalsy();
    }
  });
});
