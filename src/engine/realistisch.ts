import { useSyncExternalStore } from 'react';
import { isVoorbeeld } from './voorbeeld';

/**
 * Proef "Realistisch" (fase 1 van de volgende stap): 3D met echt zonlicht en schaduwen, gras met structuur en een luchtverloop, op de
 * bestaande poppetjes. Alleen in de voorbeeldversie te kiezen en per toestel onthouden; in de echte app staat het altijd uit.
 */
const SLEUTEL = 'trainersapp.realistisch';
const luisteraars = new Set<() => void>();

export function leesRealistisch(): boolean {
  if (!isVoorbeeld()) return false;
  try {
    return localStorage.getItem(SLEUTEL) === '1';
  } catch {
    return false;
  }
}

export function zetRealistisch(aan: boolean): void {
  try {
    if (aan) localStorage.setItem(SLEUTEL, '1');
    else localStorage.removeItem(SLEUTEL);
  } catch {
    /* niet erg: dan geldt de keuze niet */
  }
  luisteraars.forEach((f) => f());
}

export function useRealistisch(): boolean {
  return useSyncExternalStore(
    (f) => {
      luisteraars.add(f);
      return () => luisteraars.delete(f);
    },
    leesRealistisch,
    () => false,
  );
}
