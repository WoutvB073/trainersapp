/**
 * Voorbeeldversie (sinds fase 1 van de volgende stap): een aparte build op een eigen testlink, waar de gebruiker nieuwe dingen kan
 * bekijken voordat ze live gaan.
 *
 * `VOORBEELD_BUILD` is alleen waar in een build met `VITE_VOORBEELD=1` (`node tools/voorbeeld.mjs build`). In zo'n build staat online
 * helemaal uit (`src/online/config.ts` geeft dan geen Firebase-config): geen inloggen, geen synchronisatie, geen korte deellinks. Alles
 * blijft op het toestel, onder het adres van de testlink. Daar zijn ook de wisselknop voor het ontwerp en de proeven te zien.
 *
 * Sinds 0.35.0 is er geen vlag meer om dit in de gewone app aan te zetten: in de live app is `isVoorbeeld()` altijd onwaar, en de code
 * voor de wisselknop wordt bij het bouwen weggelaten.
 */
export const VOORBEELD_BUILD = import.meta.env.VITE_VOORBEELD === '1';

export function isVoorbeeld(): boolean {
  return VOORBEELD_BUILD;
}
