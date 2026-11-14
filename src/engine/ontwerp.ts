import { useSyncExternalStore } from 'react';
import { isVoorbeeld } from './voorbeeld';

/**
 * Ontwerprichtingen (fase 1 van de volgende stap). In de voorbeeldversie kies je met een knop tussen het huidige ontwerp en drie nieuwe
 * richtingen; de keuze zet `data-ontwerp` op <html> en `src/styles/ontwerp.css` doet de rest. Buiten de voorbeeldversie is het altijd het
 * huidige ontwerp: de echte app verandert niet.
 */
export type Ontwerp = 'huidig' | 'a' | 'b' | 'c';

export const ONTWERPEN: { id: Ontwerp; kort: string; naam: string }[] = [
  { id: 'huidig', kort: 'Nu', naam: 'Huidig' },
  { id: 'a', kort: 'A', naam: 'Helder' },
  { id: 'b', kort: 'B', naam: 'Stadion' },
  { id: 'c', kort: 'C', naam: 'Zacht' },
];

const SLEUTEL = 'trainersapp.ontwerp';
const luisteraars = new Set<() => void>();

export function leesOntwerp(): Ontwerp {
  if (!isVoorbeeld()) return 'huidig';
  try {
    const v = localStorage.getItem(SLEUTEL);
    return v === 'a' || v === 'b' || v === 'c' ? v : 'huidig';
  } catch {
    return 'huidig';
  }
}

/** Zet het ontwerp op de pagina (bij het opstarten en na een keuze). */
export function pasOntwerpToe(o: Ontwerp = leesOntwerp()): void {
  if (typeof document === 'undefined') return;
  if (o === 'huidig') delete document.documentElement.dataset.ontwerp;
  else document.documentElement.dataset.ontwerp = o;
}

export function kiesOntwerp(o: Ontwerp): void {
  try {
    if (o === 'huidig') localStorage.removeItem(SLEUTEL);
    else localStorage.setItem(SLEUTEL, o);
  } catch {
    /* niet erg: dan geldt de keuze tot je de app sluit */
  }
  pasOntwerpToe(o);
  luisteraars.forEach((f) => f());
}

export function useOntwerp(): Ontwerp {
  return useSyncExternalStore(
    (f) => {
      luisteraars.add(f);
      return () => luisteraars.delete(f);
    },
    () => (typeof document === 'undefined' ? 'huidig' : ((document.documentElement.dataset.ontwerp as Ontwerp | undefined) ?? 'huidig')),
  );
}
