import { TAAL, LOCALE } from './taal';
import { EN } from './en';

/**
 * Vertalen (0.25.0). De Nederlandse tekst is de sleutel: `t('Training maken')`. In het Engels komt de vertaling uit
 * `en.ts`; ontbreekt die, dan blijft het Nederlands (een test vangt dat af). Variabelen: `t('{n} spelers', { n: 4 })`.
 */
export function t(nl: string, vars?: Record<string, string | number>): string {
  const tekst = TAAL === 'en' ? (EN[nl] ?? nl) : nl;
  return vars ? vul(tekst, vars) : tekst;
}

/** Vertaling in een bepaalde taal (voor tests en deellinks). */
export function tIn(taal: 'nl' | 'en', nl: string, vars?: Record<string, string | number>): string {
  const tekst = taal === 'en' ? (EN[nl] ?? nl) : nl;
  return vars ? vul(tekst, vars) : tekst;
}

function vul(tekst: string, vars: Record<string, string | number>): string {
  return tekst.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? getal(vars[k]!) : m));
}

/** Getal in de gekozen taal (0,5 of 0.5). */
export function getal(n: string | number): string {
  return typeof n === 'number' ? n.toLocaleString(LOCALE, { maximumFractionDigits: 2, useGrouping: false }) : n;
}

/** Enkelvoud of meervoud met het aantal ervoor: `aantal(3, 'speler', 'spelers')` → "3 players". */
export function aantal(n: number, een: string, meer: string): string {
  return `${getal(n)} ${t(n === 1 ? een : meer)}`;
}

/** "a, b en c" (Engels: "a, b and c"). */
export function lijstTekst(delen: readonly string[]): string {
  const d = delen.filter(Boolean);
  return d.length < 2 ? (d[0] ?? '') : `${d.slice(0, -1).join(', ')}${t(' en ')}${d.at(-1)}`;
}

/** Sorteren op naam in de gekozen taal. */
export function vergelijk(a: string, b: string): number {
  return a.localeCompare(b, LOCALE);
}

export { TAAL, LOCALE };
