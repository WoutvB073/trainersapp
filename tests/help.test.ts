import { describe, expect, it } from 'vitest';
import { HELP_EN, HELP_NL } from '../src/help/inhoud';
import { pastBij } from '../src/screens/Help';
import { leesHash } from '../src/router';
import { nederlands } from './nl-woorden';

/** 0.25.0: Help in twee talen, met dezelfde onderwerpen, en knoppen die naar een bestaand scherm gaan. */
describe('help', () => {
  it('Nederlands en Engels hebben dezelfde onderwerpen, alinea’s en knoppen', () => {
    expect(HELP_EN.map((o) => o.id)).toEqual(HELP_NL.map((o) => o.id));
    HELP_NL.forEach((nl, i) => {
      const en = HELP_EN[i]!;
      expect(en.tekst.length, nl.id).toBe(nl.tekst.length);
      expect(
        en.tekst.map((r) => r.startsWith('- ')),
        nl.id,
      ).toEqual(nl.tekst.map((r) => r.startsWith('- ')));
      expect(
        en.laatZien?.map((k) => k.pad),
        nl.id,
      ).toEqual(nl.laatZien?.map((k) => k.pad));
    });
  });
  it('alle gevraagde onderwerpen staan erin', () => {
    const tekst = HELP_NL.map((o) => [o.titel, ...o.tekst].join(' ')).join(' ');
    for (const w of [
      'iPhone',
      'Android',
      'Laptop',
      'update',
      'categorie',
      'Filters',
      '4+',
      'Favorieten',
      '2D',
      '3D',
      'Camera',
      'Snelheid',
      'Looplijnen',
      'Eenvoudige poppetjes',
      'Klaarzetten',
      'trainingsmodus',
      'Training genereren',
      'stapnummer',
      'Opties',
      'Afspelen',
      'Doelnet',
      'Kopiëren naar eigen oefeningen',
      'Opstelling',
      'Tactiekbord',
      'spelvorm',
      'Namen tonen',
      'Spelhervattingen',
      'Delen',
      'Team',
      'Account',
      'Exporteren',
      'Importeren',
      'zonder internet',
      'Niet meer in de bibliotheek',
    ]) {
      expect(tekst.toLowerCase(), w).toContain(w.toLowerCase());
    }
  });
  it('“Laat zien”-knoppen gaan naar een bestaand scherm', () => {
    for (const o of [...HELP_NL, ...HELP_EN]) for (const k of o.laatZien ?? []) expect(leesHash(`#${k.pad}`).naam, k.pad).not.toBe('onbekend');
  });
  it('geen Nederlands in de Engelse help (behalve de taalnamen)', () => {
    const fout = HELP_EN.flatMap((o) => [o.titel, ...o.tekst, ...(o.laatZien ?? []).map((k) => k.tekst)])
      .map((r) => r.replace(/Taal \/ Language|Nederlands/g, ''))
      .filter((r) => nederlands(r));
    expect(fout).toEqual([]);
  });
  it('zoeken vindt onderwerpen op woorden uit de tekst', () => {
    const ids = (q: string) => HELP_NL.filter((o) => pastBij(o, q)).map((o) => o.id);
    expect(ids('doelnet')).toEqual(['eigen']);
    expect(ids('update iphone')).toEqual(['installeren']);
    expect(ids('xyzzy')).toEqual([]);
    expect(HELP_EN.filter((o) => pastBij(o, 'set pieces')).map((o) => o.id)).toContain('wedstrijd');
  });
});
