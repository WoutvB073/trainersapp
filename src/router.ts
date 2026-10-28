import { useSyncExternalStore } from 'react';

/**
 * Mini hash-router. Routes:
 *   #/                       Startscherm (Veld / Keepers)
 *   #/veld, #/keepers        Categorieën
 *   #/veld/:categorie        Oefenlijst (categorie "alle" = alle oefeningen)
 *   #/oefening/:id           Detailpagina
 *   #/trainingen             Mijn trainingen
 *   #/training/:id           Training bewerken (aantallen, volgorde, benodigdheden)
 *   #/training/:id/kiezen    Oefeningen kiezen (gefilterd op aantallen)
 *   #/training/:id/genereren Training genereren (onderdelen kiezen, app kiest de oefeningen)
 *   #/training/:id/modus/:nr Trainingsmodus (oefening nr, vanaf 1)
 *   #/t/:code                Gedeelde training (link)
 *   #/eigen                  Eigen oefeningen
 *   #/instellingen           Instellingen (clubkleuren, licht/donker, taal)
 *   #/help, #/help/:onderwerp  Help (uitklapbare onderwerpen, zoeken)
 *   #/account                Inloggen, account maken, account beheren
 *   #/teams                  Mijn teams (maken, joinen)
 *   #/team/:id               Team: code, gedeelde oefeningen en trainingen, leden
 *   #/team/:id/training/:item  Gedeelde training bekijken en kopiëren
 *   #/wedstrijd              Wedstrijd: opstellingen, tactiekborden, spelhervattingen
 *   #/opstelling/:id         Opstelling (spelvorm, formatie, spelers slepen, wissels)
 *   #/bord/:id               Tactiekbord of spelhervatting (afspelen, delen)
 *   #/bord/:id/tekenen       Tekenen (editor)
 *   #/w/:code                Gedeelde opstelling of tactiekbord (link)
 *   #/team/:id/wedstrijd/:item  Gedeelde opstelling/tactiekbord in een team
 *   #/eigen/nieuw            Nieuwe oefening: veld kiezen
 *   #/eigen/:id/tekenen      Editor (tekenen)
 *   #/eigen/:id/gegevens     Naam, categorieën, uitleg …
 */
export type Route =
  | { naam: 'start' }
  | { naam: 'categorieen'; soort: string }
  | { naam: 'lijst'; soort: string; categorie: string }
  | { naam: 'oefening'; id: string }
  | { naam: 'trainingen' }
  | { naam: 'training'; id: string }
  | { naam: 'kiezen'; id: string }
  | { naam: 'genereren'; id: string }
  | { naam: 'modus'; id: string; nr: number }
  | { naam: 'gedeeld'; code: string }
  | { naam: 'eigen' }
  | { naam: 'instellingen' }
  | { naam: 'help'; onderwerp?: string }
  | { naam: 'account' }
  | { naam: 'teams' }
  | { naam: 'team'; id: string }
  | { naam: 'teamtraining'; id: string; item: string }
  | { naam: 'wedstrijd' }
  | { naam: 'opstelling'; id: string }
  | { naam: 'bord'; id: string }
  | { naam: 'bord-tekenen'; id: string }
  | { naam: 'tactieken' }
  | { naam: 'tactiek'; id: string; versie?: string }
  | { naam: 'wedstrijd-gedeeld'; code: string }
  | { naam: 'teamwedstrijd'; id: string; item: string }
  | { naam: 'eigen-nieuw' }
  | { naam: 'tekenen'; id: string }
  | { naam: 'gegevens'; id: string }
  | { naam: 'onbekend' };

/** De training waar deze route bij hoort (bewerken, kiezen, genereren, trainingsmodus); die wordt niet als leeg opgeruimd. */
export function openTraining(route: Route): string | undefined {
  return route.naam === 'training' || route.naam === 'kiezen' || route.naam === 'genereren' || route.naam === 'modus' ? route.id : undefined;
}

export function leesHash(hash: string): Route {
  const delen = (hash.replace(/^#/, '') || '/').split('/').filter(Boolean).map(decodeURIComponent);
  const [a, b, c, d] = delen;
  if (!a) return { naam: 'start' };
  if ((a === 'veld' || a === 'keepers') && !b) return { naam: 'categorieen', soort: a };
  if ((a === 'veld' || a === 'keepers') && b) return { naam: 'lijst', soort: a, categorie: b };
  if (a === 'oefening' && b) return { naam: 'oefening', id: b };
  if (a === 'trainingen' && !b) return { naam: 'trainingen' };
  if (a === 'training' && b && !c) return { naam: 'training', id: b };
  if (a === 'training' && b && c === 'kiezen') return { naam: 'kiezen', id: b };
  if (a === 'training' && b && c === 'genereren') return { naam: 'genereren', id: b };
  if (a === 'training' && b && c === 'modus') return { naam: 'modus', id: b, nr: Math.max(1, Number(d) || 1) };
  if (a === 't' && b) return { naam: 'gedeeld', code: b };
  if (a === 'eigen' && !b) return { naam: 'eigen' };
  if (a === 'instellingen' && !b) return { naam: 'instellingen' };
  if (a === 'help') return b ? { naam: 'help', onderwerp: b } : { naam: 'help' };
  if (a === 'account' && !b) return { naam: 'account' };
  if (a === 'teams' && !b) return { naam: 'teams' };
  if (a === 'team' && b && !c) return { naam: 'team', id: b };
  if (a === 'team' && b && c === 'training' && d) return { naam: 'teamtraining', id: b, item: d };
  if (a === 'wedstrijd' && !b) return { naam: 'wedstrijd' };
  if (a === 'opstelling' && b) return { naam: 'opstelling', id: b };
  if (a === 'bord' && b && !c) return { naam: 'bord', id: b };
  if (a === 'bord' && b && c === 'tekenen') return { naam: 'bord-tekenen', id: b };
  if (a === 'tactieken' && !b) return { naam: 'tactieken' };
  if (a === 'tactiek' && b) return c ? { naam: 'tactiek', id: b, versie: c } : { naam: 'tactiek', id: b };
  if (a === 'w' && b) return { naam: 'wedstrijd-gedeeld', code: b };
  if (a === 'team' && b && c === 'wedstrijd' && d) return { naam: 'teamwedstrijd', id: b, item: d };
  if (a === 'eigen' && b === 'nieuw') return { naam: 'eigen-nieuw' };
  if (a === 'eigen' && b && c === 'tekenen') return { naam: 'tekenen', id: b };
  if (a === 'eigen' && b && c === 'gegevens') return { naam: 'gegevens', id: b };
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

/** Huidige pagina vervangen (geen extra stap in "terug"), bv. van de ene oefening naar de volgende in de trainingsmodus. */
export function vervang(pad: string): void {
  history.replaceState({ ...staat() }, '', `#${pad}`);
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
