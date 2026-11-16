import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { vindOefening } from '../src/data/oefeningen';
import { maakTijdlijn } from '../src/anim/timeline';
import { fysiekeFouten } from '../src/anim/fysiek';

/** 0.37.0: fase 2, deel 3, batch 1 – warming-up, loopcoördinatie, techniek en spelletjes uit VOORSTEL-OEFENINGEN.md. */

const NIEUW: Record<string, string[]> = {
  'warming-up': [
    'veld-wu-nummers-passen',
    'veld-wu-passen-vak-wisselen',
    'veld-wu-tunneltikkertje',
    'veld-wu-handbalvoetbal',
    'veld-wu-rijen-loopvormen-pass',
    'veld-wu-dubbele-rondo',
    'veld-wu-balrovers',
    'veld-wu-driehoek-op-de-loop',
    'veld-wu-ballen-vangen-voeten',
    'veld-wu-cirkel-kaatsers',
  ],
  loopcoordinatie: ['veld-lc-reactiestart-kleur', 'veld-lc-vierkant-looprichtingen', 'veld-lc-hordes-afremmen-hoepel', 'veld-lc-schaduwsprint', 'veld-lc-dierenloop', 'veld-lc-slalom-achteruit'],
  techniek: [
    'veld-tq-acht-binnen-buitenkant',
    'veld-tq-aannemen-halve-draai',
    'veld-tq-hooghoudparcours',
    'veld-tq-wegdraaien-zijlijn',
    'veld-tq-eerste-aanraking-kleur',
    'veld-tq-dribbelrace-remmen',
    'veld-tq-koppen-tweetallen',
    'veld-tq-circuit-andere-voet',
    'veld-tq-wasstraat',
  ],
  spelletjes: ['veld-sp-rondje-om-het-doel', 'veld-sp-voetbalbowlen', 'veld-sp-voetbalkegelen-teams', 'veld-sp-hooghouden-levens', 'veld-sp-chaosvoetbal'],
};
const ALLE = Object.values(NIEUW).flat();
const MINI = ['mini-3-5', 'mini-5-7'];
/** Materiaal van de club voor O6 en O7 (zoals in tests/versie-0341.test.ts). */
const CLUBMATERIAAL = /(voetbal|pion|hoedje|paal|palen|pop|kaatsbord|hesje|horde|hoepel|loopladder|tennisbal|mini-goaltje|E-goal|grote goal|net met open hoeken)/i;

describe('0.37.0: 30 nieuwe oefeningen (batch 1)', () => {
  it('bestaan allemaal, in hun eigen categorie, met de vaste velden', () => {
    expect(ALLE).toHaveLength(30);
    for (const [cat, ids] of Object.entries(NIEUW)) {
      for (const id of ids) {
        const o = vindOefening(id)!;
        expect(o, id).toBeTruthy();
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

  it('loopcoördinatie gaat zonder bal', () => {
    for (const id of NIEUW.loopcoordinatie!)
      expect(
        vindOefening(id)!.tekening.objecten.some((x) => x.soort === 'bal'),
        id,
      ).toBe(false);
  });

  it('oefeningen voor O6 en O7 gebruiken alleen het materiaal van de club', () => {
    for (const id of ALLE) {
      const o = vindOefening(id)!;
      if (!o.leeftijden?.some((l) => MINI.includes(l))) continue;
      for (const b of o.benodigdheden) expect(b, id).toMatch(CLUBMATERIAAL);
    }
  });

  it('overgeslagen voorstellen staan niet dubbel in de app (gelijk aan een bestaande oefening)', () => {
    // L1 ≈ veld-lc-ladder-in-uit, L2 ≈ veld-lc-ringen, T1 ≈ veld-tq-kappen-draaien, T5 ≈ veld-tq-pop-actie, T13 ≈ veld-tq-slalom-bal,
    // S1 ≈ veld-sp-latje-trap, S6 ≈ veld-af-kleine-doeltjes, S8 ≈ veld-mt-eieren-rapen.
    for (const id of [
      'veld-lc-ladder-in-uit',
      'veld-lc-ringen',
      'veld-tq-kappen-draaien',
      'veld-tq-pop-actie',
      'veld-tq-slalom-bal',
      'veld-sp-latje-trap',
      'veld-af-kleine-doeltjes',
      'veld-mt-eieren-rapen',
    ])
      expect(vindOefening(id), id).toBeTruthy();
  });
});

describe('0.37.0: fysieke controle – stilstaan in een hoepel', () => {
  const tekening = (manier: string | undefined, stil: boolean) => ({
    veld: { type: 'leeg' as const, breedte: 12, lengte: 6 },
    objecten: [
      { id: 'r', soort: 'ring' as const, x: 8, y: 3 },
      { id: 'a', soort: 'speler' as const, team: 'A' as const, nummer: 1, x: 2, y: 3 },
    ],
    animatie: [{ acties: [{ type: 'loop' as const, wie: 'a', naar: (stil ? [8, 3] : [11, 3]) as [number, number], ...(manier ? { manier: manier as 'afremmen' } : {}) }] }, { duur: 1, acties: [] }],
  });
  it('afremmen tot stilstand in een hoepel mag; er gewoon doorheen joggen niet', () => {
    expect(fysiekeFouten(tekening('afremmen', true))).toEqual([]);
    expect(fysiekeFouten(tekening(undefined, false)).length).toBeGreaterThan(0);
  });
});

describe('0.37.0: geen bestanden van buiten de app', () => {
  it('lettertypes komen uit de app zelf (@fontsource, OFL 1.1), niet van Google Fonts of een ander adres', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).not.toMatch(/fonts\.googleapis|fonts\.gstatic|<link[^>]+https?:\/\//);
    const css = readdirSync('src/styles')
      .map((f) => readFileSync(`src/styles/${f}`, 'utf8'))
      .join('\n');
    expect(css).not.toMatch(/@import\s+url\(\s*['"]?https?:|fonts\.googleapis|fonts\.gstatic/);
    const main = readFileSync('src/main.tsx', 'utf8');
    expect(main).toMatch(/@fontsource/);
  });
});
