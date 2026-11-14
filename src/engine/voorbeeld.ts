/**
 * Voorbeeldversie (fase 1 van de volgende stap): een aparte testlink waar de gebruiker nieuwe dingen kan bekijken vóór ze live gaan.
 *
 * - `VOORBEELD_BUILD`: gebouwd met `VITE_VOORBEELD=1` (`npm run build:voorbeeld`). In zo'n build staat online helemaal uit
 *   (`src/online/config.ts` geeft dan geen Firebase-config): geen inloggen, geen synchronisatie, geen korte deellinks. Alles blijft op het
 *   toestel, onder het adres van de voorbeeldlink. De echte gegevens in Firestore kunnen dus niet geraakt worden.
 * - `isVoorbeeld()`: ook waar met localStorage `trainersapp.voorbeeld` = '1' (alleen voor de browsertests op localhost): dan zijn de
 *   wisselknop voor het ontwerp en de proef met realistische animaties zichtbaar. In de echte app is dit altijd onwaar.
 */
export const VOORBEELD_BUILD = import.meta.env.VITE_VOORBEELD === '1';

export function isVoorbeeld(): boolean {
  if (VOORBEELD_BUILD) return true;
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('trainersapp.voorbeeld') === '1';
  } catch {
    return false;
  }
}
