import type { EigenOefening, Oefening, Soort, Tekening } from '../model/types';
import { maakId } from '../model/id';
import { autoUitsnede, bevries } from '../editor/editor';

/** Eigen oefeningen hebben een id die met "eigen-" begint (zo zie je in een training meteen wat eigen is). */
export const EIGEN_VOORVOEGSEL = 'eigen-';
export const isEigenId = (id: string) => id.startsWith(EIGEN_VOORVOEGSEL);

export function nieuweEigen(tekening: Tekening, soort: Soort = 'veld', nu = Date.now(), id = EIGEN_VOORVOEGSEL + maakId()): EigenOefening {
  return {
    id,
    soort,
    naam: '',
    categorieen: [],
    uitleg: '',
    organisatie: '',
    benodigdheden: [],
    spelersNodig: soort === 'keeper' ? 0 : 2,
    keepersNodig: soort === 'keeper' ? 1 : 0,
    doorwisselbaar: true,
    coachpunten: [],
    variaties: { makkelijker: [], moeilijker: [] },
    tekening,
    eigen: true,
    gemaakt: nu,
    gewijzigd: nu,
  };
}

const kloon = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

/** Een ingebouwde oefening naar de eigen oefeningen kopiëren. De animatie blijft, tot je iets verschuift. */
export function kopieerNaarEigen(o: Oefening, nu = Date.now(), id = EIGEN_VOORVOEGSEL + maakId()): EigenOefening {
  const k = kloon(o);
  return {
    ...k,
    id,
    eigen: true,
    bron: o.eigen ? (o as EigenOefening).bron : o.id,
    gemaakt: nu,
    gewijzigd: nu,
  };
}

export function dupliceerEigen(o: EigenOefening, nu = Date.now(), id = EIGEN_VOORVOEGSEL + maakId()): EigenOefening {
  return {
    ...kloon(o),
    id,
    naam: o.naam ? `${o.naam} (kopie)` : '',
    gemaakt: nu,
    gewijzigd: nu,
  };
}

/** Wat ontbreekt er nog om de oefening in de bibliotheek te zetten? (Alleen naam en een categorie zijn verplicht.) */
export function ontbreekt(o: Pick<Oefening, 'naam' | 'categorieen'>): string[] {
  const uit: string[] = [];
  if (!o.naam.trim()) uit.push('Geef de oefening een naam');
  if (!o.categorieen.length) uit.push('Kies minstens één categorie');
  return uit;
}

/** Staat de oefening in de bibliotheek (en in Training maken)? */
export const inBibliotheek = (o: Pick<Oefening, 'naam' | 'categorieen'>) => ontbreekt(o).length === 0;

/** Na het tekenen: uitsnede bijwerken (bij een half of heel veld rond wat er getekend is). */
export function metTekening(o: EigenOefening, tekening: Tekening): EigenOefening {
  const weergave = autoUitsnede(tekening);
  const t: Tekening = { ...tekening };
  if (weergave) t.weergave = weergave;
  else delete t.weergave;
  return { ...o, tekening: t };
}

/** De animatie laten vervallen (zodra je iets verschuift in een gekopieerde oefening). */
export function zonderAnimatie(t: Tekening): Tekening {
  return bevries(t);
}

// ---------- delen ----------

const rond = (x: unknown): unknown => {
  if (typeof x === 'number') return Math.round(x * 100) / 100;
  if (Array.isArray(x)) return x.map(rond);
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, rond(v)]));
  return x;
};

/** Eigen oefening zoals hij in een deellink gaat (zonder tijden, getallen afgerond). */
export function voorDelen(o: EigenOefening): Oefening {
  const { gemaakt: _g, gewijzigd: _w, bron: _b, ...rest } = o;
  void _g;
  void _w;
  void _b;
  return rond(rest) as Oefening;
}

/** Controle van een eigen oefening uit een link: anders niet gebruiken (de app moet blijven werken). */
export function geldigeEigen(x: unknown): x is Oefening {
  if (!x || typeof x !== 'object') return false;
  const o = x as Partial<Oefening>;
  return (
    typeof o.id === 'string' &&
    isEigenId(o.id) &&
    (o.soort === 'veld' || o.soort === 'keeper') &&
    typeof o.naam === 'string' &&
    Array.isArray(o.categorieen) &&
    Array.isArray(o.benodigdheden) &&
    Array.isArray(o.coachpunten) &&
    !!o.variaties &&
    Array.isArray(o.variaties.makkelijker) &&
    Array.isArray(o.variaties.moeilijker) &&
    typeof o.spelersNodig === 'number' &&
    typeof o.keepersNodig === 'number' &&
    !!o.tekening &&
    Array.isArray(o.tekening.objecten) &&
    !!o.tekening.veld
  );
}

/** Zelfde inhoud (los van tijden)? */
export function zelfdeInhoud(a: Oefening, b: Oefening): boolean {
  const schoon = (o: Oefening) => JSON.stringify(rond({ ...o, gemaakt: 0, gewijzigd: 0, bron: undefined, eigen: true }));
  return schoon(a) === schoon(b);
}
