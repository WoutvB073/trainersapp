import type { Leeftijd, Oefening } from '../model/types';
import { isLeeftijd } from '../data/leeftijden';
import { vindCategorie } from '../data/categorieen';
import { geldigeEigen } from '../eigen/eigen';
import { kandidaten, kiesOefening } from '../training/genereren';
import { maakId, metAantal, naarBase64Url, sleutel, uitBase64Url } from '../training/training';
import { t as vt, TAAL } from '../i18n/t';
import type { Taal } from '../i18n/taal';

/**
 * Clubtraining (0.31.0): één helft van het veld met groepjes in 4 blokken van 15 minuten. In drie rondes draaien de groepjes
 * langs de stations (Techniek, 1 tegen 1, Afwerken), daarna volgen partijvelden. Alles hier is puur (getest in
 * tests/clubtraining.test.ts); de schermen staan in src/screens/club/.
 */

export type Vorm = 'techniek' | 'een-tegen-een' | 'afwerken';
export type Blok = Vorm | 'partijvormen';

/** De drie vormen van de rondes. */
export const VORMEN: readonly Vorm[] = ['techniek', 'een-tegen-een', 'afwerken'];
export const BLOKKEN: readonly Blok[] = [...VORMEN, 'partijvormen'];
export const MIN_GROEPJES = 3;
export const MAX_GROEPJES = 8;
export const MAX_KINDEREN = 200;
/** Een blok duurt 15 minuten. */
export const BLOK_DUUR = 15 * 60;

/** Vaste kleur per blok, met de tekstkleur die erop past. */
export const BLOK_KLEUR: Record<Blok, { vlak: string; tekst: string }> = {
  techniek: { vlak: '#1c64d8', tekst: '#ffffff' },
  'een-tegen-een': { vlak: '#c92a2a', tekst: '#ffffff' },
  afwerken: { vlak: '#f2b705', tekst: '#1a1a1a' },
  partijvormen: { vlak: '#6a35b8', tekst: '#ffffff' },
};

export interface ClubTraining {
  id: string;
  naam: string;
  /** JJJJ-MM-DD; standaard maandag en woensdag van dezelfde week. */
  datums: string[];
  leeftijd: Leeftijd;
  kinderen: number;
  groepjes: number;
  trainers: string[];
  /** Gekozen oefening per blok. */
  blokken: Partial<Record<Blok, string>>;
  /** Zelf gekozen trainer per station (op nummer) en per partijveld. Niet gekozen: automatisch verdeeld. */
  stationTrainers: Record<number, string>;
  veldTrainers: Record<number, string>;
  /** Afgevinkt materiaal (zie `MateriaalRegel.sleutel`). */
  afgevinkt: string[];
  gemaakt: number;
  gewijzigd: number;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Eerstvolgende maandag (vandaag telt mee) en de woensdag van die week. */
export function standaardDatums(nu = new Date()): string[] {
  const ma = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + ((8 - nu.getDay()) % 7));
  const wo = new Date(ma.getFullYear(), ma.getMonth(), ma.getDate() + 2);
  return [iso(ma), iso(wo)];
}

export function nieuweClub(leeftijd: Leeftijd = 'mini-5-7', nu = Date.now(), id = maakId()): ClubTraining {
  return { id, naam: '', datums: standaardDatums(new Date(nu)), leeftijd, kinderen: 30, groepjes: 6, trainers: [], blokken: {}, stationTrainers: {}, veldTrainers: {}, afgevinkt: [], gemaakt: nu, gewijzigd: nu };
}

/** Niets ingevuld: zo'n clubtraining wordt niet bewaard (de standaarddatums tellen niet mee). */
export function isLeeg(c: Pick<ClubTraining, 'naam' | 'trainers' | 'blokken'>): boolean {
  return !c.naam.trim() && !c.trainers.some((x) => x.trim()) && !Object.values(c.blokken).some(Boolean);
}

export function clubNaam(c: Pick<ClubTraining, 'naam'>): string {
  return c.naam.trim() || vt('Clubtraining');
}

export function dupliceer(c: ClubTraining, nu = Date.now(), id = maakId()): ClubTraining {
  return { ...c, id, naam: vt('{w0} (kopie)', { w0: clubNaam(c) }), afgevinkt: [], gemaakt: nu, gewijzigd: nu };
}

const plusWeek = (d: string) => {
  const [j, m, dag] = d.split('-').map(Number);
  return iso(new Date(j!, m! - 1, dag! + 7));
};

/** Dezelfde clubtraining een week later: nieuwe datums, de afvinklijst begint opnieuw. */
export function naarVolgendeWeek(c: ClubTraining, nu = Date.now(), id = maakId()): ClubTraining {
  return { ...c, id, datums: c.datums.map(plusWeek), afgevinkt: [], gemaakt: nu, gewijzigd: nu };
}

/** Kinderen per groepje (naar boven afgerond). */
export const groepGrootte = (c: Pick<ClubTraining, 'kinderen' | 'groepjes'>) => Math.max(1, Math.ceil(c.kinderen / c.groepjes));

export const groepNaam = (i: number) => String.fromCharCode(65 + i);

export const blokNaam = (b: Blok) => vindCategorie('veld', b)?.naam ?? b;

// ---------- stations en rotatie ----------

export interface Station {
  /** 1, 2, 3 … */
  nr: number;
  vorm: Vorm;
  /** 0 = eerste van deze vorm. */
  plek: number;
}

/** Zoveel stations per vorm: alle groepjes moeten elke vorm in 3 rondes kunnen doen. */
export const stationsPerVorm = (groepjes: number) => Math.ceil(groepjes / VORMEN.length);

export function stations(groepjes: number): Station[] {
  const per = stationsPerVorm(groepjes);
  return VORMEN.flatMap((vorm, v) => Array.from({ length: per }, (_, plek) => ({ nr: v * per + plek + 1, vorm, plek })));
}

export function stationNaam(s: Station, groepjes: number): string {
  return stationsPerVorm(groepjes) > 1 ? `${blokNaam(s.vorm)} ${s.plek + 1}` : blokNaam(s.vorm);
}

export const RONDES = VORMEN.length;

/**
 * Op welk station staat elk groepje per ronde? `[ronde][groepje]`. Groepje g doet in ronde r vorm (g + r) mod 3 op plek
 * g div 3: binnen een drietal groepjes zijn de vormen steeds verschillend, en elk drietal heeft zijn eigen plek.
 */
export function rotatie(groepjes: number): Station[][] {
  const lijst = stations(groepjes);
  const per = stationsPerVorm(groepjes);
  return Array.from({ length: RONDES }, (_, r) => Array.from({ length: groepjes }, (_, g) => lijst[((g + r) % VORMEN.length) * per + Math.floor(g / VORMEN.length)]!));
}

// ---------- partijvelden ----------

export interface Partijveld {
  nr: number;
  /** Indexen van de groepjes. */
  groepen: number[];
  /** Oneven aantal groepjes: dit groepje speelt onderling, met de trainer als joker. */
  metTrainer: boolean;
}

export function partijvelden(groepjes: number): Partijveld[] {
  return Array.from({ length: Math.ceil(groepjes / 2) }, (_, i) => {
    const groepen = [2 * i, 2 * i + 1].filter((g) => g < groepjes);
    return { nr: i + 1, groepen, metTrainer: groepen.length === 1 };
  });
}

// ---------- veldplan ----------

/** Plek op een staand half veld, in procenten. */
export interface Vak {
  x: number;
  y: number;
  b: number;
  h: number;
}

const RAND = 4;

function raster(i: number, kolommen: number, rijen: number): Vak {
  const b = (100 - 2 * RAND) / kolommen;
  const h = (100 - 2 * RAND) / rijen;
  return { x: RAND + (i % kolommen) * b, y: RAND + Math.floor(i / kolommen) * h, b, h };
}

/** Elke vorm een eigen rij, de plekken naast elkaar. */
export const stationVak = (s: Station, groepjes: number): Vak => raster(VORMEN.indexOf(s.vorm) * stationsPerVorm(groepjes) + s.plek, stationsPerVorm(groepjes), VORMEN.length);

/** Tot 3 velden onder elkaar, 4 velden 2 × 2. */
export function veldVak(v: Partijveld, aantal: number): Vak {
  return aantal > 3 ? raster(v.nr - 1, 2, Math.ceil(aantal / 2)) : raster(v.nr - 1, 1, aantal);
}

// ---------- trainers ----------

const namen = (c: Pick<ClubTraining, 'trainers'>) => c.trainers.map((x) => x.trim()).filter(Boolean);

/** Zelf gekozen trainer, anders automatisch om en om verdeeld. Een gekozen naam die niet meer bestaat telt niet. */
function trainerVan(lijst: string[], gekozen: string | undefined, nr: number): string | undefined {
  if (gekozen === '') return undefined;
  if (gekozen && lijst.includes(gekozen)) return gekozen;
  return lijst.length ? lijst[(nr - 1) % lijst.length] : undefined;
}

export const stationTrainer = (c: Pick<ClubTraining, 'trainers' | 'stationTrainers'>, nr: number) => trainerVan(namen(c), c.stationTrainers[nr], nr);
export const veldTrainer = (c: Pick<ClubTraining, 'trainers' | 'veldTrainers'>, nr: number) => trainerVan(namen(c), c.veldTrainers[nr], nr);

// ---------- oefeningen kiezen ----------

export interface KiesBron {
  alle: Oefening[];
  favorieten: ReadonlySet<string>;
  /** Getal in [0, 1). */
  toeval: () => number;
}

const blokSpelers = (c: ClubTraining, b: Blok) => (b === 'partijvormen' ? 2 : 1) * groepGrootte(c);

/** Oefeningen die bij dit blok kunnen: leeftijd, categorie en het aantal kinderen op een station of partijveld. */
export function blokKandidaten(c: ClubTraining, b: Blok, alle: Oefening[]): Oefening[] {
  return kandidaten({ soort: 'veld', categorie: b }, { alle, spelers: blokSpelers(c, b), keepers: 0, leeftijd: c.leeftijd });
}

/** Een (andere) oefening voor dit blok. */
export function genereerBlok(c: ClubTraining, b: Blok, bron: KiesBron): string | undefined {
  const uit = new Set(Object.values(c.blokken).filter((x): x is string => !!x));
  const context = { alle: bron.alle, spelers: blokSpelers(c, b), keepers: 0, leeftijd: c.leeftijd, favorieten: bron.favorieten, recent: new Map<string, number>(), toeval: bron.toeval };
  return (kiesOefening({ soort: 'veld', categorie: b }, context, uit) ?? kiesOefening({ soort: 'veld', categorie: b }, context, new Set()))?.id;
}

export function genereerAlles(c: ClubTraining, bron: KiesBron): Partial<Record<Blok, string>> {
  let nu = { ...c, blokken: {} as Partial<Record<Blok, string>> };
  for (const b of BLOKKEN) {
    const id = genereerBlok(nu, b, bron);
    if (id) nu = { ...nu, blokken: { ...nu.blokken, [b]: id } };
  }
  return nu.blokken;
}

// ---------- materiaal ----------

export interface MateriaalRegel {
  /** Blijft gelijk (afvinken). */
  sleutel: string;
  tekst: string;
  /** Oefeningen die dit gebruiken. */
  bij: string[];
}

export interface Materiaal {
  /** Stations (rondes 1–3). */
  stations: MateriaalRegel[];
  /** Alleen wat er voor de partijvelden nog bij moet. */
  extra: MateriaalRegel[];
}

interface Telling {
  aantal?: number;
  tekst: string;
  bij: Set<string>;
}

/** "8 hoedjes voor de poortjes", "1 voetbal per kind" → aantal en het materiaal zelf, zonder toevoeging. */
function ontleed(regel: string, kinderen: number): { aantal?: number; naam: string } {
  const m = /^(\d+)\+?(?:\s*[–-]\s*(\d+))?\s+(.+)$/.exec(regel.trim());
  let aantal = m ? Math.max(Number(m[1]), Number(m[2] ?? 0)) : undefined;
  let naam = (m ? m[3]! : regel).trim();
  if (aantal !== undefined && /\s(per kind|per child)$/i.test(naam)) aantal *= kinderen;
  if (aantal !== undefined && /\s(per tweetal|per pair)$/i.test(naam)) aantal *= Math.ceil(kinderen / 2);
  naam = naam.replace(/\s+(per|voor|for|in|op|on)\s.*$/i, '').trim();
  return { aantal, naam };
}

function tel(per: Map<string, Telling>, o: Oefening, keer: number, kinderen: number, taal: Taal) {
  for (const regel of o.benodigdheden) {
    const { aantal, naam } = ontleed(regel, kinderen);
    const k = sleutel(naam, taal);
    if (!k) continue;
    const nu = per.get(k) ?? { tekst: naam, bij: new Set<string>() };
    if (aantal !== undefined) nu.aantal = (nu.aantal ?? 0) + aantal * keer;
    nu.bij.add(o.naam);
    per.set(k, nu);
  }
}

/**
 * Wat er klaar moet staan: het materiaal per station × aantal stations, opgeteld. Materiaal van de stations gebruik je opnieuw
 * voor de partijvelden; daarvoor telt alleen wat er meer nodig is.
 */
export function materiaal(c: ClubTraining, vind: (id: string) => Oefening | undefined, taal: Taal = TAAL): Materiaal {
  const per = stationsPerVorm(c.groepjes);
  const kinderen = groepGrootte(c);
  const deel1 = new Map<string, Telling>();
  for (const v of VORMEN) {
    const id = c.blokken[v];
    const o = id ? vind(id) : undefined;
    if (o) tel(deel1, o, per, kinderen, taal);
  }
  const deel2 = new Map<string, Telling>();
  const id = c.blokken.partijvormen;
  const partij = id ? vind(id) : undefined;
  if (partij) tel(deel2, partij, partijvelden(c.groepjes).length, 2 * kinderen, taal);

  const regel = (deel: string, k: string, x: Telling, aantal?: number): MateriaalRegel => ({ sleutel: `${deel}:${k}`, tekst: aantal === undefined ? x.tekst : metAantal(k, aantal, taal), bij: [...x.bij] });
  const stationsLijst = [...deel1].map(([k, x]) => regel('1', k, x, x.aantal));
  const extra: MateriaalRegel[] = [];
  for (const [k, x] of deel2) {
    const al = deel1.get(k);
    if (!al) extra.push(regel('2', k, x, x.aantal));
    else if (x.aantal !== undefined && x.aantal > (al.aantal ?? 0) && al.aantal !== undefined) extra.push(regel('2', k, x, x.aantal - al.aantal));
  }
  const opNaam = (a: MateriaalRegel, b: MateriaalRegel) => a.sleutel.localeCompare(b.sleutel);
  return { stations: stationsLijst.sort(opNaam), extra: extra.sort(opNaam) };
}

// ---------- delen ----------

/** Wat er in de link staat voor de trainers. */
export interface GedeeldeClub {
  naam: string;
  datums: string[];
  leeftijd: Leeftijd;
  kinderen: number;
  groepjes: number;
  trainers: string[];
  blokken: Partial<Record<Blok, string>>;
  stationTrainers: Record<number, string>;
  veldTrainers: Record<number, string>;
  /** Eigen oefeningen die erin zitten: die gaan in hun geheel mee. */
  eigen?: Oefening[];
}

const kort = (id: string) => id.replace(/^veld-/, 'v:');
const lang = (id: string) => id.replace(/^v:/, 'veld-');

export function naarCode(c: Pick<ClubTraining, 'naam' | 'datums' | 'leeftijd' | 'kinderen' | 'groepjes' | 'trainers' | 'blokken' | 'stationTrainers' | 'veldTrainers'>, eigen: Oefening[] = []): string {
  const b = BLOKKEN.map((x) => (c.blokken[x] ? kort(c.blokken[x]!) : ''));
  const ids = Object.values(c.blokken);
  const e = eigen.filter((o) => ids.includes(o.id));
  return naarBase64Url(JSON.stringify({ v: 1, n: c.naam, d: c.datums, l: c.leeftijd, k: c.kinderen, g: c.groepjes, t: c.trainers, b, s: c.stationTrainers, f: c.veldTrainers, ...(e.length ? { e } : {}) }));
}

const tekstenRecord = (x: unknown): Record<number, string> => {
  const uit: Record<number, string> = {};
  if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) if (typeof v === 'string' && Number(k) > 0) uit[Number(k)] = v.slice(0, 40);
  return uit;
};

export function uitCode(code: string): GedeeldeClub | null {
  try {
    const x = JSON.parse(uitBase64Url(code)) as { v?: number; n?: unknown; d?: unknown; l?: unknown; k?: unknown; g?: unknown; t?: unknown; b?: unknown; s?: unknown; f?: unknown; e?: unknown };
    if (x.v !== 1 || !Array.isArray(x.b)) return null;
    const getal = (v: unknown, min: number, max: number, standaard: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : standaard);
    const blokken: Partial<Record<Blok, string>> = {};
    BLOKKEN.forEach((blok, i) => {
      const id = (x.b as unknown[])[i];
      if (typeof id === 'string' && id) blokken[blok] = lang(id);
    });
    return {
      naam: typeof x.n === 'string' ? x.n.slice(0, 80) : '',
      datums: Array.isArray(x.d) ? x.d.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(0, 7) : [],
      leeftijd: isLeeftijd(x.l) ? x.l : 'mini-5-7',
      kinderen: getal(x.k, 1, MAX_KINDEREN, 30),
      groepjes: getal(x.g, MIN_GROEPJES, MAX_GROEPJES, 6),
      trainers: Array.isArray(x.t) ? x.t.filter((n): n is string => typeof n === 'string').map((n) => n.slice(0, 40)).slice(0, 12) : [],
      blokken,
      stationTrainers: tekstenRecord(x.s),
      veldTrainers: tekstenRecord(x.f),
      ...(Array.isArray(x.e) && x.e.some(geldigeEigen) ? { eigen: x.e.filter(geldigeEigen).map((o) => ({ ...o, eigen: true })) } : {}),
    };
  } catch {
    return null;
  }
}

// ---------- kwartiertimer ----------

export interface TimerStand {
  /** 0–3: rondes 1–3 en de partijvormen. */
  blok: number;
  /** Seconden over in dit blok. */
  rest: number;
  klaar: boolean;
}

export function timerStand(verstreken: number): TimerStand {
  const s = Math.max(0, verstreken);
  if (s >= BLOKKEN.length * BLOK_DUUR) return { blok: BLOKKEN.length - 1, rest: 0, klaar: true };
  const blok = Math.floor(s / BLOK_DUUR);
  return { blok, rest: Math.ceil((blok + 1) * BLOK_DUUR - s), klaar: false };
}
