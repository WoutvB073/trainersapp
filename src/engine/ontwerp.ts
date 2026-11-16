import { useSyncExternalStore } from 'react';
import { VOORBEELD_BUILD } from './voorbeeld';

/**
 * Ontwerp van de app (0.36.0): Zacht, in fase 1 richting C (`src/styles/ontwerp.css`, `data-ontwerp="c"` op <html>). Alleen in de
 * voorbeeldversie kun je met de wisselknop terug naar het oude ontwerp ('huidig'), om te vergelijken; de live app is altijd 'c'.
 */
export type Ontwerp = 'huidig' | 'c';

export const ONTWERPEN: { id: Ontwerp; kort: string; naam: string }[] = [
  // Alleen in de voorbeeldversie te zien, dus zonder vertaling.
  { id: 'huidig', kort: 'Oud', naam: 'Vóór 0.36' }, // i18n-ok
  { id: 'c', kort: 'Nu', naam: 'Zacht' }, // i18n-ok
];

const SLEUTEL = 'trainersapp.ontwerp';
const luisteraars = new Set<() => void>();

export function leesOntwerp(): Ontwerp {
  if (!VOORBEELD_BUILD) return 'c';
  try {
    return localStorage.getItem(SLEUTEL) === 'huidig' ? 'huidig' : 'c';
  } catch {
    return 'c';
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
    if (o === 'c') localStorage.removeItem(SLEUTEL);
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
    () => (typeof document === 'undefined' ? 'c' : ((document.documentElement.dataset.ontwerp as Ontwerp | undefined) ?? 'huidig')),
  );
}
