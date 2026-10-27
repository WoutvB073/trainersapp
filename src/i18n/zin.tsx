import type { ReactNode } from 'react';
import { APP_NAAM } from '../config';
import { t } from './t';

/**
 * Hele zin vertalen en **vet** gemarkeerde delen (knoppen en menu's) vet tonen. `{app}` = de app-naam.
 * Zo blijft elke zin één geheel, ook in het Engels (andere woordvolgorde, de echte namen van de knoppen).
 */
export function zin(nl: string, vars: Record<string, string | number> = {}): ReactNode {
  const tekst = t(nl, { app: APP_NAAM, ...vars });
  return tekst.split('**').map((deel, i) => (i % 2 ? <strong key={i}>{deel}</strong> : deel));
}
