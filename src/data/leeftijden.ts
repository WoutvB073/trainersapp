import type { Leeftijd } from '../model/types';
import { t } from '../i18n/t';

/**
 * De leeftijdsgroepen (0.30.0), van jong naar oud. Sinds 0.34.1 zijn de mini's O6 (de jongsten, tot ±6 jaar) en O7 (±6–7 jaar). De ids
 * bleven gelijk, zodat filters, circuittrainingen en links blijven werken: 'mini-3-5' is O6 en 'mini-5-7' is O7.
 */
export const LEEFTIJDEN: { id: Leeftijd; naam: string }[] = [
  { id: 'mini-3-5', naam: t('Mini’s O6 (tot 6 jr)') },
  { id: 'mini-5-7', naam: t('Mini’s O7 (6–7 jr)') },
  { id: 'jo8-11', naam: t('JO8–JO11') },
  { id: 'jo12-15', naam: t('JO12–JO15') },
  { id: 'jo16-19', naam: t('JO16–JO19') },
];

export const isLeeftijd = (x: unknown): x is Leeftijd => LEEFTIJDEN.some((l) => l.id === x);

export const leeftijdNaam = (id: Leeftijd) => LEEFTIJDEN.find((l) => l.id === id)?.naam ?? id;
