/**
 * Taal van de app (0.25.0): Nederlands, Engels of automatisch (volgt de telefoon; Nederlands als die geen Engels of
 * Nederlands is). De keuze wordt per toestel bewaard en via het account gesynchroniseerd. Een andere taal kiezen laadt
 * de app opnieuw, zodat alle teksten (ook die al in het geheugen staan) in de nieuwe taal komen.
 */
export type Taal = 'nl' | 'en';
export type TaalKeuze = Taal | 'auto';

const SLEUTEL = 'trainersapp.taal';
const WIJZIGING = 'taalwijziging';

function opslag(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

export function leesTaalKeuze(): TaalKeuze {
  const k = opslag()?.getItem(SLEUTEL);
  return k === 'nl' || k === 'en' ? k : 'auto';
}

/** Taal van het toestel: Engels of Nederlands als de eerste voorkeurstaal dat is, anders Nederlands. */
export function toestelTaal(talen: readonly string[] = typeof navigator === 'undefined' ? [] : navigator.languages?.length ? navigator.languages : [navigator.language]): Taal {
  const eerste = (talen[0] ?? '').toLowerCase();
  return eerste.startsWith('en') ? 'en' : 'nl';
}

export function effectieveTaal(keuze: TaalKeuze = leesTaalKeuze()): Taal {
  return keuze === 'auto' ? toestelTaal() : keuze;
}

/** De taal waarin de app nu draait (vast tot de volgende keer laden). */
export const TAAL: Taal = effectieveTaal();

/** Taalcode voor datums en getallen. */
export const LOCALE = TAAL === 'en' ? 'en-GB' : 'nl-NL';

/** Taal kiezen; als de app daardoor in een andere taal moet, laadt hij opnieuw (niet in tests zonder window). */
export function kiesTaal(keuze: TaalKeuze, herladen = true): void {
  const s = opslag();
  if (keuze === 'auto') s?.removeItem(SLEUTEL);
  else s?.setItem(SLEUTEL, keuze);
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(WIJZIGING));
  if (herladen && effectieveTaal(keuze) !== TAAL) window.location.reload();
}

export function abonneerTaal(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(WIJZIGING, cb);
  return () => window.removeEventListener(WIJZIGING, cb);
}
