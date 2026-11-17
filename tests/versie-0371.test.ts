import { describe, expect, it } from 'vitest';
import { vindOefening } from '../src/data/oefeningen';
import { maakTijdlijn } from '../src/anim/timeline';

/** 0.37.1: fase 2, deel 3, batch 2 – pass en trap, afwerken, positiespel, verdedigen, 1 tegen 1 en partijvormen uit VOORSTEL-OEFENINGEN.md. */

const NIEUW: Record<string, string[]> = {
  'pass-en-trap': [
    'veld-pt-lange-lijn-kort-lang',
    'veld-pt-bewegend-poortje',
    'veld-pt-kaats-wissel-van-kant',
    'veld-pt-zeshoek-richting',
    'veld-pt-wreef-20-meter',
    'veld-pt-halve-volley-hand',
    'veld-pt-onder-de-horde',
    'veld-pt-kaatsbordtennis',
    'veld-pt-h-vorm',
  ],
  afwerken: ['veld-af-volley-aangooi', 'veld-af-schieten-drie-zones', 'veld-af-dribbel-van-opzij', 'veld-af-twee-doelen-een-schutter', 'veld-af-penaltykoning'],
  positiespel: ['veld-ps-rondo-twee-kleuren', 'veld-ps-2-1-vier-vakjes', 'veld-ps-balbezit-hoekvakken', 'veld-ps-overtal-zijkant'],
  'verdedigen-omschakelen': [
    'veld-vo-onderscheppen-passlijn',
    'veld-vo-sliding-blok',
    'veld-vo-druk-terugspeelbal',
    'veld-vo-duel-in-de-lucht',
    'veld-vo-bewaker-schat',
    'veld-vo-omschakelen-fluitje',
  ],
  'een-tegen-een': ['veld-een-duel-uit-de-draai', 'veld-een-1-1-van-opzij', 'veld-een-1-1-tijdklok', 'veld-een-1-1-lange-bal', 'veld-een-schat-van-de-trainer', 'veld-een-1-1-joker'],
  partijvormen: ['veld-pv-goal-in-het-midden', 'veld-pv-5-5-drie-aanrakingen', 'veld-pv-overtal-4-3', 'veld-pv-3-3-scorer-keept', 'veld-pv-twee-tegen-de-trainer', 'veld-pv-6-6-vaste-zones'],
};
const ALLE = Object.values(NIEUW).flat();
const MINI = ['mini-3-5', 'mini-5-7'];
/** Materiaal van de club voor O6 en O7 (zoals in tests/versie-0341.test.ts). */
const CLUBMATERIAAL = /(voetbal|pion|hoedje|paal|palen|pop|kaatsbord|hesje|horde|hoepel|loopladder|tennisbal|mini-goaltje|E-goal|grote goal|net met open hoeken)/i;

describe('0.37.1: 36 nieuwe oefeningen (batch 2)', () => {
  it('bestaan allemaal, in hun eigen categorie, met de vaste velden', () => {
    expect(ALLE).toHaveLength(36);
    expect(new Set(ALLE).size).toBe(36);
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
        expect(o.benodigdheden.length, id).toBeGreaterThan(0);
        expect(typeof o.doorwisselbaar, id).toBe('boolean');
        if (o.doorwisselbaar === false) expect(o.meerSpelers, id).toMatch(/^Met meer spelers/);
        expect(() => maakTijdlijn(o.tekening), id).not.toThrow();
      }
    }
  });

  it('oefeningen voor O6 en O7 gebruiken alleen het materiaal van de club', () => {
    let mini = 0;
    for (const id of ALLE) {
      const o = vindOefening(id)!;
      if (!o.leeftijden?.some((l) => MINI.includes(l))) continue;
      mini++;
      for (const b of o.benodigdheden) expect(b, id).toMatch(CLUBMATERIAAL);
    }
    expect(mini).toBeGreaterThanOrEqual(4);
  });

  it('een keeper in de partij met een goal in het midden kan aan beide kanten staan (goal zonder net)', () => {
    const o = vindOefening('veld-pv-goal-in-het-midden')!;
    const g = o.tekening.objecten.find((x) => x.soort === 'goal')!;
    expect(g.zonderNet).toBe(true);
    expect(g.y).toBeGreaterThan(5);
    expect(g.y).toBeLessThan((o.tekening.veld.lengte ?? 60) - 5);
  });

  it('een veldspeler blokt het schot (de sliding), niet alleen een keeper', () => {
    const o = vindOefening('veld-vo-sliding-blok')!;
    const acties = (o.tekening.animatie ?? []).flatMap((s) => ('acties' in s ? s.acties : []));
    const schot = acties.find((a) => a.type === 'schot' && 'blokt' in a && a.blokt) as { blokt: string } | undefined;
    expect(schot).toBeTruthy();
    expect(o.tekening.objecten.find((x) => x.id === schot!.blokt)?.soort).toBe('speler');
  });
});
