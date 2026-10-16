import { describe, expect, it } from 'vitest';
import { aantalTekst, keepersLabel, spelersLabel } from '../src/components/Labels';
import { OEFENINGEN } from '../src/data/oefeningen';
import { kiesbaar } from '../src/training/training';

describe('aantallen: doorwisselbaar ("4+") of vast', () => {
  it('doorwisselbaar toont een plus, vast het precieze aantal', () => {
    expect(spelersLabel({ soort: 'veld', spelersNodig: 4, keepersNodig: 1, doorwisselbaar: true })).toBe('4+ spelers');
    expect(spelersLabel({ soort: 'veld', spelersNodig: 1, keepersNodig: 0, doorwisselbaar: true })).toBe('1+ spelers');
    expect(spelersLabel({ soort: 'veld', spelersNodig: 6, keepersNodig: 0, doorwisselbaar: false })).toBe('6 spelers');
    expect(keepersLabel({ soort: 'keeper', spelersNodig: 0, keepersNodig: 2, doorwisselbaar: true })).toBe('2+ keepers');
    expect(keepersLabel({ soort: 'keeper', spelersNodig: 0, keepersNodig: 1, doorwisselbaar: false })).toBe('1 keeper');
    expect(aantalTekst({ soort: 'veld', spelersNodig: 6, keepersNodig: 0, doorwisselbaar: false })).toBe('Precies 6 spelers.');
    expect(aantalTekst({ soort: 'veld', spelersNodig: 3, keepersNodig: 1, doorwisselbaar: true })).toMatch(/^3 spelers en 1 keeper tegelijk bezig\. Meer spelers kan/);
  });

  it('elke oefening heeft een keuze; partijvormen en rondo’s zijn vast met een tip', () => {
    for (const o of OEFENINGEN) expect(typeof o.doorwisselbaar).toBe('boolean');
    const rondo = OEFENINGEN.find((o) => o.id === 'veld-ps-rondo-4-2')!;
    expect(rondo.doorwisselbaar).toBe(false);
    expect(rondo.meerSpelers).toMatch(/^Met /);
    expect(OEFENINGEN.find((o) => o.id === 'veld-lc-ladder-enkel')!.doorwisselbaar).toBe(true);
    expect(OEFENINGEN.find((o) => o.id === 'keeper-sp-keepersoorlog-een-goal')!.doorwisselbaar).toBe(true);
  });

  it('het filter blijft "minimaal nodig": ook vaste oefeningen met meer spelers zijn kiesbaar', () => {
    const ids = kiesbaar(OEFENINGEN, 'veld', 'positiespel', 20, 0).map((o) => o.id);
    expect(ids).toContain('veld-ps-rondo-4-2');
    expect(kiesbaar(OEFENINGEN, 'veld', 'positiespel', 5, 0).map((o) => o.id)).not.toContain('veld-ps-rondo-4-2');
  });
});
