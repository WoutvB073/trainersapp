import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { OEFENINGEN, vindOefening } from '../src/data/oefeningen';
import { LEEFTIJDEN } from '../src/data/leeftijden';
import { kandidaten } from '../src/training/genereren';
import { pastBijLeeftijd } from '../src/training/training';
import type { Vertalingen } from '../src/data/vertaling';

/** Versie 0.34.1: de mini's in O6 en O7, en nieuwe oefeningen voor elke groep. */

const O6 = 'mini-3-5';
const O7 = 'mini-5-7';

// Zelfde lijsten als in tools/nieuw/mini-indeling-0341.cjs.
const ALLEEN_O6 = [
  'veld-mt-pionnen-omgooien',
  'veld-mt-dribbel-en-schiet',
  'veld-mt-hordes-en-schieten',
  'veld-mt-om-de-pop',
  'veld-mt-ladder-en-scoren',
  'veld-mt-brug-en-goal',
  'veld-mt-verkeerslicht',
  'veld-mt-hondje-uitlaten',
  'veld-mt-brandweer',
  'veld-mt-kleurenpoortjes',
  'veld-mt-onder-de-brug',
  'veld-mt-huisjes',
  'veld-mt-door-het-bos',
  'veld-mt-rondje-pion',
  'veld-mt-eieren-rapen',
  'veld-mt-ladder-en-dribbel',
  'veld-mt-poppenslalom',
  'veld-mt-kleurenpionnen',
  'veld-mt-palenpoort',
  'veld-mt-hoedjes-omdraaien',
  'veld-mt-hoedjes-verzamelen',
  'veld-af-kleine-doeltjes',
  'veld-lc-slalom',
  'veld-lc-kleurenreactie',
  'veld-wu-tikkertje-hesjes',
  'veld-wu-spiegelen',
  'veld-wu-overlopertje',
];
const ALLEEN_O7 = ['veld-mt-tennisballen-van-de-pion'];
const OOK_O7 = ['veld-tq-kappen-draaien', 'veld-tq-schijnbeweging', 'veld-lc-ladder-enkel', 'veld-lc-ladder-in-uit', 'veld-lc-lage-hordes', 'veld-lc-ringen', 'veld-lc-vallende-pion', 'veld-lc-hordes-zijwaarts-sprint'];

const MAP = path.resolve(__dirname, '../src/data/en');
const EN: Vertalingen = Object.assign({}, ...fs.readdirSync(MAP).map((f) => JSON.parse(fs.readFileSync(path.join(MAP, f), 'utf8'))));

const NIEUW_O7 = OEFENINGEN.filter((o) => o.id.startsWith('veld-o7-'));
const NIEUW_O6 = OEFENINGEN.filter((o) => o.id.startsWith('veld-o6-'));
const NIEUW = [...NIEUW_O7, ...NIEUW_O6];

/** Alleen materiaal dat de club heeft. */
const MATERIAAL = /(voetbal|pion|hoedje|paal|palen|pop|kaatsbord|hesje|horde|hoepel|loopladder|tennisbal|mini-goaltje|E-goal|grote goal|net met open hoeken)/i;
const CATEGORIEEN = ['techniek', 'een-tegen-een', 'afwerken', 'partijvormen', 'warming-up'];

describe('leeftijdsgroepen O6 en O7', () => {
  it('de namen zijn O6 en O7, de ids bleven gelijk (oude filters en circuittrainingen werken)', () => {
    expect(LEEFTIJDEN.slice(0, 2)).toEqual([
      { id: O6, naam: 'Mini’s O6 (tot 6 jr)' },
      { id: O7, naam: 'Mini’s O7 (6–7 jr)' },
    ]);
  });

  it('te eenvoudige oefeningen staan alleen bij O6', () => {
    for (const id of ALLEEN_O6) {
      const o = vindOefening(id)!;
      expect(o.leeftijden, id).toContain(O6);
      expect(o.leeftijden, id).not.toContain(O7);
    }
  });

  it('te moeilijke staan alleen bij O7, en kappen/passeren is erbij gekomen', () => {
    for (const id of ALLEEN_O7) expect(vindOefening(id)!.leeftijden, id).toEqual([O7]);
    for (const id of OOK_O7) expect(vindOefening(id)!.leeftijden, id).toContain(O7);
  });

  it('de JO-groepen bleven staan bij oefeningen die ook voor oudere kinderen zijn', () => {
    expect(vindOefening('veld-lc-slalom')!.leeftijden!.some((l) => l.startsWith('jo'))).toBe(true);
    expect(vindOefening('veld-tq-kappen-draaien')!.leeftijden!.some((l) => l.startsWith('jo'))).toBe(true);
  });

  it('elke groep houdt genoeg oefeningen per onderdeel van de circuittraining', () => {
    for (const leeftijd of [O6, O7] as const)
      for (const categorie of ['techniek', 'een-tegen-een', 'afwerken', 'partijvormen']) {
        const lijst = kandidaten({ soort: 'veld', categorie }, { alle: OEFENINGEN, spelers: 5, keepers: 0, leeftijd });
        expect(lijst.length, `${leeftijd} ${categorie}`).toBeGreaterThanOrEqual(5);
      }
  });

  it('Genereren voor O7 kiest geen O6-oefening en andersom', () => {
    const o7 = kandidaten({ soort: 'veld', categorie: 'een-tegen-een' }, { alle: OEFENINGEN, spelers: 5, keepers: 0, leeftijd: O7 }).map((o) => o.id);
    expect(o7).toContain('veld-o7-tik-het-hoedje');
    expect(o7).not.toContain('veld-o6-haaien-en-visjes');
    const o6 = kandidaten({ soort: 'veld', categorie: 'techniek' }, { alle: OEFENINGEN, spelers: 5, keepers: 0, leeftijd: O6 }).map((o) => o.id);
    expect(o6).toContain('veld-o6-pinguinrace');
    expect(o6).not.toContain('veld-o7-vier-acties');
    expect(o6).not.toContain('veld-mt-tennisballen-van-de-pion');
  });
});

describe('verbeterde bestaande oefeningen (zelfde id)', () => {
  it('Bal beschermen: wisselen om de 30 tellen, met punten', () => {
    const o = vindOefening('veld-mt-bal-beschermen')!;
    expect(o.uitleg).toContain('30 tellen');
    expect(o.organisatie).toMatch(/5 × 5 m/);
  });
  it('Piratenspel: de trainer roept acties en kleuren', () => {
    expect(vindOefening('veld-sp-piratenspel')!.uitleg).toContain('"kap!"');
  });
  it('3 tegen 3 op vier doeltjes: scoren vanuit de scoorzone', () => {
    expect(vindOefening('veld-pv-3-3-vier-doeltjes')!.uitleg).toContain('scoorzone');
  });
  it('Huisjes: eilanden, zool en niemand valt af', () => {
    const u = vindOefening('veld-mt-huisjes')!.uitleg;
    expect(u).toContain('zool');
    expect(u).toContain('niemand valt af');
  });
  it('Hondje uitlaten en Spiegeldribbel hebben de dieren en de kapitein', () => {
    expect(vindOefening('veld-mt-hondje-uitlaten')!.variaties!.moeilijker.join(' ')).toContain('olifant');
    expect(vindOefening('veld-tq-spiegeldribbel')!.variaties!.makkelijker.join(' ')).toContain('kapitein');
  });
});

describe('nieuwe mini-oefeningen', () => {
  it('genoeg nieuwe: 12 voor O7 (ideeën 1, 2, 4–9, 12 en drie eigen), 7 voor O6 (ideeën 15, 17 en vijf eigen)', () => {
    expect(NIEUW_O7.length).toBe(12);
    expect(NIEUW_O6.length).toBe(7);
  });

  it('elk in één groep, zonder keepers, in één toegestane categorie', () => {
    for (const o of NIEUW_O7) expect(o.leeftijden, o.id).toEqual([O7]);
    for (const o of NIEUW_O6) expect(o.leeftijden, o.id).toEqual([O6]);
    for (const o of NIEUW) {
      expect(o.keepersNodig, o.id).toBe(0);
      expect(o.categorieen, o.id).toHaveLength(1);
      expect(CATEGORIEEN, o.id).toContain(o.categorieen[0]);
    }
  });

  it('concreet: veldmaat in meters, 5 kinderen, 15 minuten, wat de trainer doet', () => {
    for (const o of NIEUW) {
      expect(o.organisatie, o.id).toMatch(/\d+(,\d+)? × \d+(,\d+)? m/);
      expect(o.organisatie, o.id).toContain('5 kinderen');
      expect(o.organisatie, o.id).toContain('15 minuten');
      expect(o.organisatie, o.id).toMatch(/trainer/i);
      expect(`${o.uitleg} ${o.organisatie}`, o.id).toMatch(/"[^"]+!"/);
    }
  });

  it('een wedstrijdje: punten, tijd of tegen elkaar', () => {
    for (const o of NIEUW) expect(`${o.uitleg} ${o.organisatie}`, o.id).toMatch(/punt|meeste|snelst|eerst|hoe vaak|hoeveel|langst|minste/i);
  });

  it('2–4 coachpunten, Makkelijker en een echte Moeilijker (minstens twee stappen)', () => {
    for (const o of NIEUW) {
      expect(o.coachpunten.length, o.id).toBeGreaterThanOrEqual(2);
      expect(o.coachpunten.length, o.id).toBeLessThanOrEqual(4);
      expect(o.variaties!.makkelijker.length, o.id).toBeGreaterThanOrEqual(1);
      expect(o.variaties!.moeilijker.length, o.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('alleen materiaal dat de club heeft', () => {
    for (const o of NIEUW) for (const b of o.benodigdheden) expect(b, o.id).toMatch(MATERIAAL);
  });

  it('het E-goal heeft altijd het net met open hoeken (er is geen keeper)', () => {
    for (const o of NIEUW) {
      const goals = o.tekening.objecten.filter((x) => x.soort === 'goal');
      for (const g of goals) expect(o.tekening.objecten.some((x) => x.soort === 'doelnet' && (x as { doel?: string }).doel === g.id), o.id).toBe(true);
      if (goals.length) expect(o.benodigdheden.join(' '), o.id).toContain('net met open hoeken');
    }
  });

  it('elke oefening is ook in het Engels', () => {
    for (const o of NIEUW) {
      const en = EN[o.id];
      expect(en?.naam, o.id).toBeTruthy();
      expect(en?.coachpunten?.length, o.id).toBe(o.coachpunten.length);
    }
  });

  it('veel balcontacten: (bijna) iedereen in de tekening doet mee', () => {
    for (const o of NIEUW) {
      const kinderen = o.tekening.objecten.filter((x) => x.soort === 'speler').map((x) => x.id);
      // De nieuwe oefeningen gebruiken alleen gewone stappen (geen herhaling).
      const acties = o.tekening.animatie!.flatMap((s) => ('acties' in s ? s.acties : []));
      const bezig = new Set(acties.flatMap((a) => [('wie' in a && a.wie) || '', ('van' in a && typeof a.van === 'string' && a.van) || '']));
      const stil = kinderen.filter((k) => !bezig.has(k));
      expect(stil.length, `${o.id}: ${stil.join(', ')}`).toBeLessThanOrEqual(1);
    }
  });

  it('een oefening voor O7 past ook in het leeftijdsfilter van O7, niet in dat van O6', () => {
    for (const o of NIEUW_O7) {
      expect(pastBijLeeftijd(o, O7)).toBe(true);
      expect(pastBijLeeftijd(o, O6)).toBe(false);
    }
  });
});
