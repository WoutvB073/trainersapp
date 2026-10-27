import { describe, expect, it } from 'vitest';
// @ts-expect-error: los script zonder typen
import { onvertaald, sleutels } from '../tools/i18n/scan.mjs';
import { EN } from '../src/i18n/en';
import { toestelTaal } from '../src/i18n/taal';
import { nederlands } from './nl-woorden';

/**
 * 0.25.0: alles moet ook in het Engels. Faalt als er tekst in de broncode staat die niet via t() loopt, als een
 * t()-tekst geen Engelse vertaling heeft, of als er Nederlands in de Engelse tekst staat.
 */

const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('vertaling: app-teksten', () => {
  it('alle tekst in de broncode loopt via t() (of is gemarkeerd met i18n-ok)', () => {
    const lijst = (onvertaald() as { bestand: string; regel: number; tekst: string }[]).map((x) => `${x.bestand}:${x.regel} ${x.tekst}`);
    expect(lijst).toEqual([]);
  });
  it('elke t()-tekst heeft een Engelse vertaling', () => {
    const missen = (sleutels() as string[]).filter((s) => !(s in EN));
    expect(missen).toEqual([]);
  });
  it('de Engelse teksten hebben dezelfde variabelen en vet-markeringen', () => {
    const fout = Object.entries(EN).filter(([nl, en]) => JSON.stringify(vars(nl)) !== JSON.stringify(vars(en)) || nl.split('**').length !== en.split('**').length);
    expect(fout).toEqual([]);
  });
  it('er staat geen Nederlands in de Engelse teksten', () => {
    const fout = Object.entries(EN)
      .map(([nl, en]) => [nl, en, nederlands(en)])
      .filter(([, , w]) => w);
    expect(fout).toEqual([]);
  });
  it('geen vertalingen die nergens meer gebruikt worden', () => {
    const gebruikt = new Set(sleutels() as string[]);
    const over = Object.keys(EN).filter((k) => !gebruikt.has(k));
    expect(over).toEqual([]);
  });
});

describe('taalkeuze', () => {
  it('automatisch: Engels als de telefoon Engels is, anders Nederlands', () => {
    expect(toestelTaal(['en-GB', 'nl'])).toBe('en');
    expect(toestelTaal(['en-US'])).toBe('en');
    expect(toestelTaal(['nl-NL', 'en'])).toBe('nl');
    expect(toestelTaal(['de-DE', 'en'])).toBe('nl');
    expect(toestelTaal([])).toBe('nl');
  });
  it('de woordenlijst-controle herkent Nederlands', () => {
    expect(nederlands('The keeper catches the ball')).toBeNull();
    expect(nederlands('De keeper vangt de bal')).not.toBeNull();
    expect(nederlands("Don't run over the cones")).toBeNull();
  });
});
