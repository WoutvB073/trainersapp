import { useSyncExternalStore } from 'react';

/**
 * Mini hash-router. Routes:
 *   #/                       Startscherm (Veld / Keepers)
 *   #/veld, #/keepers        Categorieën
 *   #/veld/:categorie        Oefenlijst (categorie "alle" = alle oefeningen)
 *   #/oefening/:id           Detailpagina
 */
export type Route =
  | { naam: 'start' }
  | { naam: 'categorieen'; soort: string }
  | { naam: 'lijst'; soort: string; categorie: string }
  | { naam: 'oefening'; id: string }
  | { naam: 'onbekend' };

export function leesHash(hash: string): Route {
  const delen = (hash.replace(/^#/, '') || '/').split('/').filter(Boolean).map(decodeURIComponent);
  const [a, b] = delen;
  if (!a) return { naam: 'start' };
  if ((a === 'veld' || a === 'keepers') && !b) return { naam: 'categorieen', soort: a };
  if ((a === 'veld' || a === 'keepers') && b) return { naam: 'lijst', soort: a, categorie: b };
  if (a === 'oefening' && b) return { naam: 'oefening', id: b };
  return { naam: 'onbekend' };
}

const WIJZIGING = 'routewijziging';

const abonneer = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  window.addEventListener(WIJZIGING, cb);
  return () => {
    window.removeEventListener('hashchange', cb);
    window.removeEventListener(WIJZIGING, cb);
  };
};
const hash = () => window.location.hash;

export function useRoute(): Route {
  return leesHash(useSyncExternalStore(abonneer, hash, hash));
}

interface Staat {
  diepte?: number;
  scrollY?: number;
}
const staat = () => (history.state as Staat | null) ?? {};

/** Naar een pagina binnen de app (onthoudt de scrollpositie van de huidige pagina). */
export function ga(pad: string): void {
  history.replaceState({ ...staat(), scrollY: window.scrollY }, '');
  history.pushState({ diepte: (staat().diepte ?? 0) + 1 } satisfies Staat, '', `#${pad}`);
  window.dispatchEvent(new Event(WIJZIGING));
  window.scrollTo(0, 0);
}

/** Terug binnen de app; als er geen eerdere pagina in de app is, naar `ouder`. */
export function terug(ouder: string): void {
  if ((staat().diepte ?? 0) > 0) history.back();
  else {
    history.replaceState({}, '', `#${ouder}`);
    window.dispatchEvent(new Event(WIJZIGING));
    window.scrollTo(0, 0);
  }
}

/** Bewaarde scrollpositie van de pagina waar we (met terug) op uitkomen. */
export function bewaardeScroll(): number | undefined {
  return staat().scrollY;
}
