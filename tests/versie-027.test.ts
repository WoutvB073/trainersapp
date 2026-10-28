import { describe, expect, it } from 'vitest';
import { OEFENINGEN, vindOefening } from '../src/data/oefeningen';
import { TEKENING_TEKST } from '../src/data/vertaling';
import engelsVerdedigen from '../src/data/en/veld-verdedigen-omschakelen.json';
import engelsPartijvormen from '../src/data/en/veld-partijvormen.json';
import engelsSpelletjes from '../src/data/en/veld-spelletjes.json';

/** Versie 0.27.0 (deel B): 15 spelersoefeningen (verdedigen en omschakelen, partijvormen, spelletjes). */

const NIEUW: Record<string, { categorieen: string[]; spelers: number; keepers: number }> = {
  'veld-vo-druk-drie-fases': { categorieen: ['verdedigen-omschakelen', 'positiespel'], spelers: 9, keepers: 1 },
  'veld-vo-drie-verdedigers': { categorieen: ['verdedigen-omschakelen', 'partijvormen'], spelers: 6, keepers: 0 },
  'veld-vo-1-1-wegdrukken': { categorieen: ['verdedigen-omschakelen'], spelers: 2, keepers: 0 },
  'veld-vo-hoog-druk-loont': { categorieen: ['verdedigen-omschakelen', 'partijvormen'], spelers: 10, keepers: 2 },
  'veld-vo-pressen-na-balverlies': { categorieen: ['verdedigen-omschakelen', 'partijvormen'], spelers: 10, keepers: 0 },
  'veld-vo-omschakelen-kaatsers': { categorieen: ['verdedigen-omschakelen', 'partijvormen'], spelers: 12, keepers: 2 },
  'veld-pv-1-1-naar-4-4': { categorieen: ['partijvormen'], spelers: 8, keepers: 2 },
  'veld-pv-6-6-verboden-midden': { categorieen: ['partijvormen'], spelers: 12, keepers: 2 },
  'veld-pv-5-5-schietzones': { categorieen: ['partijvormen', 'afwerken'], spelers: 14, keepers: 2 },
  'veld-pv-4-4-wingers': { categorieen: ['partijvormen', 'afwerken'], spelers: 10, keepers: 2 },
  'veld-pv-voorsprong': { categorieen: ['partijvormen'], spelers: 10, keepers: 2 },
  'veld-pv-2-2-doelspeler': { categorieen: ['partijvormen', 'verdedigen-omschakelen'], spelers: 6, keepers: 0 },
  'veld-pv-mandekking': { categorieen: ['partijvormen', 'verdedigen-omschakelen'], spelers: 8, keepers: 0 },
  'veld-sp-ludo': { categorieen: ['spelletjes', 'techniek'], spelers: 4, keepers: 0 },
  'veld-sp-uit-het-vak': { categorieen: ['spelletjes', 'warming-up'], spelers: 6, keepers: 0 },
};

describe('nieuwe spelersoefeningen 0.27.0', () => {
  const engels: Record<string, { naam: string }> = { ...engelsVerdedigen, ...engelsPartijvormen, ...engelsSpelletjes } as never;
  for (const [id, verwacht] of Object.entries(NIEUW)) {
    it(id, () => {
      const o = OEFENINGEN.find((x) => x.id === id)!;
      expect(o, id).toBeTruthy();
      expect(o.soort).toBe('veld');
      expect(o.categorieen).toEqual(verwacht.categorieen);
      expect(o.spelersNodig).toBe(verwacht.spelers);
      expect(o.keepersNodig).toBe(verwacht.keepers);
      expect(o.coachpunten.length).toBeGreaterThanOrEqual(2);
      expect(o.coachpunten.length).toBeLessThanOrEqual(4);
      expect(o.variaties.makkelijker.length).toBeGreaterThan(0);
      expect(o.variaties.moeilijker.length).toBeGreaterThan(0);
      expect(o.tekening.animatie?.length).toBeGreaterThan(2);
      if (!o.doorwisselbaar) expect(o.meerSpelers).toMatch(/^Met (meer|\d+) spelers/);
      // Eigen woorden: geen namen van websites, apps of clubs.
      expect(JSON.stringify(o)).not.toMatch(/https?:|www\.|\.nl\b|\.com\b|youtube|instagram|academy|tiki|barça|ajax/i);
      expect(engels[id]?.naam, id).toBeTruthy();
      // Tekst-labels in de tekening hebben een Engelse versie.
      for (const x of o.tekening.objecten) if (x.soort === 'tekst') expect(TEKENING_TEKST[x.tekst!], x.tekst).toBeTruthy();
    });
  }

  it('#27 is niet opnieuw gebouwd: de bestaande 4 tegen 4 met doelspelers kreeg de categorie Verdedigen en omschakelen', () => {
    const o = vindOefening('veld-ps-4-4-doelspelers')!;
    expect(o.categorieen).toEqual(['positiespel', 'verdedigen-omschakelen']);
    expect(o.coachpunten.some((c) => /druk/i.test(c))).toBe(true);
    expect(OEFENINGEN.filter((x) => /doelspelers/.test(x.naam) && /4 tegen 4/.test(x.naam))).toHaveLength(1);
  });

  it('#37 is niet gebouwd (gelijk aan Koning van het veld)', () => {
    expect(vindOefening('veld-sp-koning-van-het-veld')).toBeTruthy();
    expect(OEFENINGEN.some((x) => /wie is de beste/i.test(x.naam))).toBe(false);
  });

  it('Verdedigen en omschakelen heeft nu een eigen bestand en genoeg oefeningen', () => {
    const lijst = OEFENINGEN.filter((x) => x.soort === 'veld' && x.categorieen.includes('verdedigen-omschakelen'));
    expect(lijst.length).toBeGreaterThanOrEqual(15);
    expect(OEFENINGEN.filter((x) => x.categorieen[0] === 'verdedigen-omschakelen')).toHaveLength(6);
  });
});
