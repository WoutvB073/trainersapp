import type { Leeftijd, Oefening } from '../model/types';
import { isLeeftijd } from '../data/leeftijden';
import { vindCategorie } from '../data/categorieen';
import { geldigeEigen } from '../eigen/eigen';
import { kandidaten, kiesOefening } from '../training/genereren';
import { maakId, metAantal, naarBase64Url, sleutel, uitBase64Url } from '../training/training';
import { t as vt, TAAL } from '../i18n/t';
import type { Taal } from '../i18n/taal';

/**
 * Circuittraining (zichtbare naam; in de code clubtraining). Sinds 0.32.0 kies je zelf de onderdelen: elk onderdeel heeft een
 * categorie, een duur en is "Stations" (de groepjes draaien door) of "Samen" (alle groepjes tegelijk). Trainingen van vóór 0.32.0
 * hebben alleen `blokken` en worden gelezen als de Mini Talents-opzet (`onderdelenVan`). Alles hier is puur (getest in
 * tests/clubtraining.test.ts en tests/versie-0320.test.ts); de schermen staan in src/screens/club/.
 */

/** De vier vaste blokken van vóór 0.32.0: oude trainingen en links, en de Mini Talents-opzet. */
export type Vorm = 'techniek' | 'een-tegen-een' | 'afwerken';
export type Blok = Vorm | 'partijvormen';
export const VORMEN: readonly Vorm[] = ['techniek', 'een-tegen-een', 'afwerken'];
export const BLOKKEN: readonly Blok[] = [...VORMEN, 'partijvormen'];

export type OnderdeelSoort = 'stations' | 'samen';

export interface Onderdeel {
  /** Vast binnen de training (slepen, oefening kiezen). */
  id: string;
  /** Spelerscategorie. */
  categorie: string;
  /** Minuten. */
  duur: number;
  soort: OnderdeelSoort;
  oefening?: string;
}

export const MIN_GROEPJES = 2;
export const MAX_GROEPJES = 8;
export const MIN_ONDERDELEN = 3;
export const MAX_ONDERDELEN = 6;
export const DUUR_KEUZES: readonly number[] = [5, 10, 12, 15, 20];
export const MAX_DUUR = 90;
export const MAX_KINDEREN = 200;
/** Mini Talents: 4 × 15 minuten. */
export const BLOK_DUUR = 15 * 60;

/** Vaste kleur per categorie, met de tekstkleur die erop past. */
export const CATEGORIE_KLEUR: Record<string, { vlak: string; tekst: string }> = {
  techniek: { vlak: '#1c64d8', tekst: '#ffffff' },
  'een-tegen-een': { vlak: '#c92a2a', tekst: '#ffffff' },
  afwerken: { vlak: '#f2b705', tekst: '#1a1a1a' },
  partijvormen: { vlak: '#6a35b8', tekst: '#ffffff' },
  'warming-up': { vlak: '#d9480f', tekst: '#ffffff' },
  loopcoordinatie: { vlak: '#0b7285', tekst: '#ffffff' },
  'pass-en-trap': { vlak: '#2b8a3e', tekst: '#ffffff' },
  positiespel: { vlak: '#a61e4d', tekst: '#ffffff' },
  'verdedigen-omschakelen': { vlak: '#495057', tekst: '#ffffff' },
  spelletjes: { vlak: '#e64980', tekst: '#1a1a1a' },
};
const GEEN_KLEUR = { vlak: '#495057', tekst: '#ffffff' };
export const categorieKleur = (categorie: string) => CATEGORIE_KLEUR[categorie] ?? GEEN_KLEUR;

/** Alle spelerscategorieën die je als onderdeel kunt kiezen. */
export const CATEGORIEEN: readonly string[] = Object.keys(CATEGORIE_KLEUR);

export interface ClubTraining {
  id: string;
  naam: string;
  /** JJJJ-MM-DD; standaard maandag en woensdag van dezelfde week. */
  datums: string[];
  leeftijd: Leeftijd;
  kinderen: number;
  groepjes: number;
  trainers: string[];
  /** Oude opzet (vóór 0.32.0): gekozen oefening per blok. Zonder `onderdelen` telt dit als de Mini Talents-opzet. */
  blokken: Partial<Record<Blok, string>>;
  /** De onderdelen op volgorde (0.32.0). */
  onderdelen?: Onderdeel[];
  /** Begintijd "UU:MM" (optioneel): dan toont de rotatie echte tijden. */
  starttijd?: string;
  /** Eigen sjabloon: staat niet in de lijst met trainingen, maar synchroniseert wel mee. */
  sjabloon?: boolean;
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

/** Onderdelen van een training; een training van vóór 0.32.0 is de Mini Talents-opzet. */
export function onderdelenVan(c: { onderdelen?: Onderdeel[]; blokken?: Partial<Record<Blok, string>> }): Onderdeel[] {
  if (c.onderdelen?.length) return c.onderdelen;
  return BLOKKEN.map((b) => ({ id: b, categorie: b, duur: BLOK_DUUR / 60, soort: b === 'partijvormen' ? 'samen' : 'stations', ...(c.blokken?.[b] ? { oefening: c.blokken[b] } : {}) }));
}

/** Nieuw onderdeel: Partijvormen staat standaard op Samen. */
export const nieuwOnderdeel = (categorie: string, duur = 15, id = maakId()): Onderdeel => ({ id, categorie, duur, soort: categorie === 'partijvormen' ? 'samen' : 'stations' });

/** Begin van "Zelf samenstellen". */
export const zelfOnderdelen = (): Onderdeel[] => [{ ...nieuwOnderdeel('warming-up', 10), soort: 'samen' }, nieuwOnderdeel('techniek', 10), nieuwOnderdeel('afwerken', 10), nieuwOnderdeel('partijvormen', 15)];

const opzet = (lijst: Onderdeel[]) => JSON.stringify(lijst.map((o) => [o.categorie, o.duur, o.soort]));
const STANDAARD_OPZETTEN = () => [opzet(onderdelenVan({})), opzet(zelfOnderdelen())];

export const oefeningIds = (c: { onderdelen?: Onderdeel[]; blokken?: Partial<Record<Blok, string>> }) => onderdelenVan(c).flatMap((o) => (o.oefening ? [o.oefening] : []));

/** Niets ingevuld: zo'n clubtraining wordt niet bewaard (de standaarddatums en een onveranderde opzet tellen niet mee). */
export function isLeeg(c: Pick<ClubTraining, 'naam' | 'trainers' | 'blokken' | 'onderdelen' | 'sjabloon'>): boolean {
  return !c.sjabloon && !c.naam.trim() && !c.trainers.some((x) => x.trim()) && !oefeningIds(c).length && STANDAARD_OPZETTEN().includes(opzet(onderdelenVan(c)));
}

export function clubNaam(c: Pick<ClubTraining, 'naam'>): string {
  return c.naam.trim() || vt('Circuittraining');
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

/** Opzet bewaren als sjabloon: onderdelen, groepjes, kinderen en leeftijd. Zonder oefeningen, datums en trainers. */
export function alsSjabloon(c: ClubTraining, naam: string, nu = Date.now(), id = maakId()): ClubTraining {
  const onderdelen = onderdelenVan(c).map(({ oefening: _o, ...rest }) => {
    void _o;
    return { ...rest, id: maakId() };
  });
  return { ...nieuweClub(c.leeftijd, nu, id), naam: naam.trim().slice(0, 80), datums: [], kinderen: c.kinderen, groepjes: c.groepjes, onderdelen, sjabloon: true };
}

/** Nieuwe training volgens een sjabloon. */
export function uitSjabloon(s: ClubTraining, nu = Date.now(), id = maakId()): ClubTraining {
  return { ...nieuweClub(s.leeftijd, nu, id), kinderen: s.kinderen, groepjes: s.groepjes, onderdelen: onderdelenVan(s).map((o) => ({ ...o, id: maakId() })) };
}

/** Kinderen per groepje (naar boven afgerond). */
export const groepGrootte = (c: Pick<ClubTraining, 'kinderen' | 'groepjes'>) => Math.max(1, Math.ceil(c.kinderen / c.groepjes));

export const groepNaam = (i: number) => String.fromCharCode(65 + i);

export const blokNaam = (categorie: string) => vindCategorie('veld', categorie)?.naam ?? categorie;

// ---------- stations en rotatie ----------

export interface Station {
  /** 1, 2, 3 … over de hele training. */
  nr: number;
  /** Het onderdeel dat hier staat. */
  onderdeel: string;
  /** Categorie (kleur en naam). */
  vorm: string;
  /** 0 = eerste keer dat dit onderdeel op het veld staat. */
  plek: number;
  /** Zo vaak staat dit onderdeel op het veld. */
  keer: number;
  /** Index van de fase. */
  fase: number;
}

/** Stations die tegelijk op het veld staan, met de rondes waarin de groepjes erlangs draaien. */
export interface Fase {
  nr: number;
  onderdelen: Onderdeel[];
  stations: Station[];
  /** Indexen van de eerste en laatste ronde. */
  eerste: number;
  laatste: number;
}

export interface Ronde {
  /** 1, 2, 3 … */
  nr: number;
  /** Seconden vanaf het begin. */
  begin: number;
  eind: number;
  /** Stations: per groepje waar het staat. Samen: leeg. */
  plekken: Station[];
  /** Stations die in deze ronde leeg blijven. */
  leeg: Station[];
  /** Alle groepjes tegelijk. */
  samen?: Onderdeel;
}

export interface ClubPlan {
  fases: Fase[];
  stations: Station[];
  rondes: Ronde[];
  samen: Onderdeel[];
  /** Seconden. */
  totaal: number;
  /** Onderdelen die langer duren dan ingesteld, omdat ze naast een langer onderdeel staan. */
  verlengd: Onderdeel[];
}

type PlanInhoud = { groepjes: number; onderdelen?: Onderdeel[]; blokken?: Partial<Record<Blok, string>> };

/**
 * Hoe de station-onderdelen over fases gaan bij een aantal groepjes. Zijn er minder onderdelen dan groepjes, dan één fase (de
 * onderdelen staan dan vaker op het veld). Anders fases van minstens zoveel onderdelen als groepjes: elk onderdeel staat dan maar
 * één keer op het veld. Past dat niet precies, dan worden de laatste fases één groter en blijven daar stations leeg.
 */
export function faseGroottes(onderdelen: number, groepjes: number): number[] {
  if (onderdelen <= groepjes) return onderdelen ? [onderdelen] : [];
  const aantal = Math.floor(onderdelen / groepjes);
  const basis = Math.floor(onderdelen / aantal);
  const over = onderdelen % aantal;
  return Array.from({ length: aantal }, (_, i) => basis + (i >= aantal - over ? 1 : 0));
}

/**
 * Het hele schema. Binnen een fase van k onderdelen staat groepje g in ronde r op onderdeel (g + r) mod k, plek g div k: elk
 * groepje doet elk onderdeel één keer en er staan nooit twee groepjes op één station. Alle groepjes wisselen tegelijk, dus een ronde
 * duurt zo lang als het langste onderdeel dat erin zit.
 */
export function clubPlan(c: PlanInhoud): ClubPlan {
  const lijst = onderdelenVan(c);
  const fases: Fase[] = [];
  const stationLijst: Station[] = [];
  const rondes: Ronde[] = [];
  const verlengd = new Set<Onderdeel>();
  let tijd = 0;
  const voegToe = (duur: number, w: Pick<Ronde, 'plekken' | 'leeg' | 'samen'>) => {
    rondes.push({ nr: rondes.length + 1, begin: tijd, eind: tijd + duur, ...w });
    tijd += duur;
  };
  const stationBlok = (delen: Onderdeel[]) => {
    let van = 0;
    for (const k of faseGroottes(delen.length, c.groepjes)) {
      const onderdelen = delen.slice(van, van + k);
      van += k;
      const keer = Math.ceil(c.groepjes / k);
      const fase = fases.length;
      const stations = onderdelen.flatMap((o) => Array.from({ length: keer }, (_, plek): Station => ({ nr: 0, onderdeel: o.id, vorm: o.categorie, plek, keer, fase })));
      stations.forEach((x, i) => (x.nr = stationLijst.length + i + 1));
      stationLijst.push(...stations);
      const eerste = rondes.length;
      for (let r = 0; r < k; r += 1) {
        const plekken = Array.from({ length: c.groepjes }, (_, g) => stations[((g + r) % k) * keer + Math.floor(g / k)]!);
        const actief = onderdelen.filter((o) => plekken.some((p) => p.onderdeel === o.id));
        const duur = Math.max(...actief.map((o) => o.duur));
        for (const o of actief) if (o.duur < duur) verlengd.add(o);
        voegToe(duur * 60, { plekken, leeg: stations.filter((x) => !plekken.includes(x)) });
      }
      fases.push({ nr: fases.length + 1, onderdelen, stations, eerste, laatste: rondes.length - 1 });
    }
  };
  let reeks: Onderdeel[] = [];
  for (const o of lijst) {
    if (o.soort === 'stations') {
      reeks.push(o);
      continue;
    }
    stationBlok(reeks);
    reeks = [];
    voegToe(o.duur * 60, { plekken: [], leeg: [], samen: o });
  }
  stationBlok(reeks);
  return { fases, stations: stationLijst, rondes, samen: lijst.filter((o) => o.soort === 'samen'), totaal: tijd, verlengd: [...verlengd] };
}

export function stationNaam(s: Station): string {
  const naam = blokNaam(s.vorm);
  if (s.keer === 1) return naam;
  // "1 tegen 1 2" leest niet: bij een naam die op een cijfer eindigt een streepje ertussen.
  return /\d$/.test(naam) ? `${naam} – ${s.plek + 1}` : `${naam} ${s.plek + 1}`;
}

export const vindOnderdeel = (c: { onderdelen?: Onderdeel[]; blokken?: Partial<Record<Blok, string>> }, id: string) => onderdelenVan(c).find((o) => o.id === id);

const klokTijd = (start: string, seconden: number) => {
  const [u, m] = start.split(':').map(Number);
  const totaal = (u! * 60 + m! + Math.round(seconden / 60)) % (24 * 60);
  return `${String(Math.floor(totaal / 60)).padStart(2, '0')}:${String(totaal % 60).padStart(2, '0')}`;
};

/** Begin en eind van een ronde: de klok als er een begintijd is, anders minuten vanaf de start. */
export function rondeTijd(r: Pick<Ronde, 'begin' | 'eind'>, starttijd?: string): string {
  if (starttijd && /^\d{2}:\d{2}$/.test(starttijd)) return `${klokTijd(starttijd, r.begin)}–${klokTijd(starttijd, r.eind)}`; // i18n-ok
  return `${r.begin / 60}–${r.eind / 60} min`; // i18n-ok
}

/** Totale tijd in woorden: "1 uur 5 min", "45 min". */
export function tijdTekst(seconden: number): string {
  const min = Math.round(seconden / 60);
  const uur = Math.floor(min / 60);
  return uur ? vt('{u} uur {m} min', { u: uur, m: min % 60 }) : vt('{m} min', { m: min });
}

// ---------- partijvelden ----------

export interface Partijveld {
  nr: number;
  /** Indexen van de groepjes. */
  groepen: number[];
  /** Oneven aantal groepjes: dit groepje speelt onderling, met de trainer als joker. */
  metTrainer: boolean;
}

/** Partijvormen: bij 2 groepjes één veld (A tegen B), bij meer groepjes 2 per veld en bij een oneven aantal een joker. */
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

/** De stations van een fase verdeeld over het halve veld. Twee keer dezelfde vorm staat naast elkaar. */
export function stationVak(s: Station, f: Pick<Fase, 'stations'>): Vak {
  const aantal = f.stations.length;
  const kolommen = aantal <= 3 ? 1 : aantal <= 8 ? 2 : 3;
  return raster(f.stations.indexOf(s), kolommen, Math.ceil(aantal / kolommen));
}

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

type KiesInhoud = Pick<ClubTraining, 'kinderen' | 'groepjes' | 'leeftijd' | 'blokken' | 'onderdelen'>;

/** Zoveel kinderen doen tegelijk mee: een groepje op een station, twee op een partijveld, anders iedereen. */
export function onderdeelSpelers(c: Pick<ClubTraining, 'kinderen' | 'groepjes'>, o: Pick<Onderdeel, 'soort' | 'categorie'>): number {
  if (o.soort === 'stations') return groepGrootte(c);
  return o.categorie === 'partijvormen' ? 2 * groepGrootte(c) : c.kinderen;
}

/** Oefeningen die bij dit onderdeel kunnen: leeftijd, categorie en het aantal kinderen. */
export function onderdeelKandidaten(c: KiesInhoud, o: Onderdeel, alle: Oefening[]): Oefening[] {
  return kandidaten({ soort: 'veld', categorie: o.categorie }, { alle, spelers: onderdeelSpelers(c, o), keepers: 0, leeftijd: c.leeftijd });
}

/** Een (andere) oefening voor dit onderdeel. */
export function genereerOnderdeel(c: KiesInhoud, o: Onderdeel, bron: KiesBron): string | undefined {
  const uit = new Set(oefeningIds(c));
  const context = { alle: bron.alle, spelers: onderdeelSpelers(c, o), keepers: 0, leeftijd: c.leeftijd, favorieten: bron.favorieten, recent: new Map<string, number>(), toeval: bron.toeval };
  return (kiesOefening({ soort: 'veld', categorie: o.categorie }, context, uit) ?? kiesOefening({ soort: 'veld', categorie: o.categorie }, context, new Set()))?.id;
}

/** Alle onderdelen een (nieuwe) oefening geven. */
export function genereerAlles(c: KiesInhoud, bron: KiesBron): Onderdeel[] {
  let nu: Onderdeel[] = onderdelenVan(c).map(({ oefening: _o, ...rest }) => {
    void _o;
    return rest;
  });
  for (const o of nu) {
    const id = genereerOnderdeel({ ...c, onderdelen: nu }, o, bron);
    if (id) nu = nu.map((x) => (x.id === o.id ? { ...x, oefening: id } : x));
  }
  return nu;
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
  /** Stations. */
  stations: MateriaalRegel[];
  /** Alleen wat er voor de samen-onderdelen nog bij moet. */
  extra: MateriaalRegel[];
}

interface Telling {
  aantal?: number;
  tekst: string;
  bij: Set<string>;
}

/** Hetzelfde materiaal onder een andere naam telt samen. */
// i18n-ok (woorden uit de oefenteksten)
const ZELFDE: Record<string, string> = { bal: 'voetbal', 'klein doeltje': 'mini-goaltje', 'mini-doeltje': 'mini-goaltje', ball: 'football', 'mini goal': 'mini-goal', 'small goal': 'mini-goal' };

/** "8 hoedjes voor de poortjes", "1 voetbal per kind" → aantal en het materiaal zelf, zonder toevoeging. */
function ontleed(regel: string, kinderen: number): { aantal?: number; naam: string } {
  const m = /^(\d+)\+?(?:\s*[–-]\s*(\d+))?\s+(.+)$/.exec(regel.trim());
  let aantal = m ? Math.max(Number(m[1]), Number(m[2] ?? 0)) : undefined;
  let naam = (m ? m[3]! : regel).trim();
  if (aantal !== undefined && /\s(per kind|per child|per speler|per player)$/i.test(naam)) aantal *= kinderen;
  if (aantal !== undefined && /\s(per tweetal|per pair)$/i.test(naam)) aantal *= Math.ceil(kinderen / 2);
  naam = naam.replace(/\s+(per|voor|for|in|op|on)\s.*$/i, '').trim();
  return { aantal, naam };
}

function tel(per: Map<string, Telling>, o: Oefening, keer: number, kinderen: number, taal: Taal) {
  for (const regel of o.benodigdheden) {
    const { aantal, naam } = ontleed(regel, kinderen);
    const ruw = sleutel(naam, taal);
    if (!ruw) continue;
    const k = ZELFDE[ruw] ?? ruw;
    const nu = per.get(k) ?? { tekst: naam, bij: new Set<string>() };
    if (aantal !== undefined) nu.aantal = (nu.aantal ?? 0) + aantal * keer;
    nu.bij.add(o.naam);
    per.set(k, nu);
  }
}

/**
 * Wat er klaar moet staan: het materiaal per station × het aantal keer dat die oefening op het veld staat, opgeteld. Materiaal van
 * de stations gebruik je opnieuw voor de samen-onderdelen; daarvoor telt alleen wat er meer nodig is.
 */
export function materiaal(c: Pick<ClubTraining, 'groepjes' | 'kinderen' | 'blokken' | 'onderdelen'>, vind: (id: string) => Oefening | undefined, taal: Taal = TAAL): Materiaal {
  const kinderen = groepGrootte(c);
  const plan = clubPlan(c);
  const deel1 = new Map<string, Telling>();
  for (const f of plan.fases) {
    for (const o of f.onderdelen) {
      const oefening = o.oefening ? vind(o.oefening) : undefined;
      const keer = f.stations.filter((s) => s.onderdeel === o.id).length;
      if (oefening) tel(deel1, oefening, keer, kinderen, taal);
    }
  }
  const deel2 = new Map<string, Telling>();
  for (const o of plan.samen) {
    const oefening = o.oefening ? vind(o.oefening) : undefined;
    if (!oefening) continue;
    if (o.categorie === 'partijvormen') tel(deel2, oefening, partijvelden(c.groepjes).length, 2 * kinderen, taal);
    else tel(deel2, oefening, 1, c.kinderen, taal);
  }

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
  onderdelen?: Onderdeel[];
  starttijd?: string;
  stationTrainers: Record<number, string>;
  veldTrainers: Record<number, string>;
  /** Eigen oefeningen die erin zitten: die gaan in hun geheel mee. */
  eigen?: Oefening[];
}

const kort = (id: string) => id.replace(/^veld-/, 'v:');
const lang = (id: string) => id.replace(/^v:/, 'veld-');

type Inhoud = Pick<ClubTraining, 'naam' | 'datums' | 'leeftijd' | 'kinderen' | 'groepjes' | 'trainers' | 'blokken' | 'onderdelen' | 'starttijd' | 'stationTrainers' | 'veldTrainers'>;

/** Link voor de trainers (versie 2 sinds 0.32.0: de onderdelen). Links met versie 1 blijven te lezen. */
export function naarCode(c: Inhoud, eigen: Oefening[] = []): string {
  const o = onderdelenVan(c).map((x) => [x.categorie, x.duur, x.soort === 'samen' ? 1 : 0, x.oefening ? kort(x.oefening) : '']);
  const ids = oefeningIds(c);
  const e = eigen.filter((x) => ids.includes(x.id));
  return naarBase64Url(JSON.stringify({ v: 2, n: c.naam, d: c.datums, l: c.leeftijd, k: c.kinderen, g: c.groepjes, t: c.trainers, o, ...(c.starttijd ? { u: c.starttijd } : {}), s: c.stationTrainers, f: c.veldTrainers, ...(e.length ? { e } : {}) }));
}

const tekstenRecord = (x: unknown): Record<number, string> => {
  const uit: Record<number, string> = {};
  if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) if (typeof v === 'string' && Number(k) > 0) uit[Number(k)] = v.slice(0, 40);
  return uit;
};

const getal = (v: unknown, min: number, max: number, standaard: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : standaard);

function netteOnderdelen(x: unknown): Onderdeel[] | undefined {
  if (!Array.isArray(x)) return undefined;
  const lijst = (x as Partial<Onderdeel>[]).filter((o) => o && typeof o.categorie === 'string' && CATEGORIEEN.includes(o.categorie)).slice(0, MAX_ONDERDELEN);
  if (!lijst.length) return undefined;
  return lijst.map((o, i) => ({
    id: typeof o.id === 'string' && o.id ? o.id.slice(0, 40) : `o${i + 1}`,
    categorie: o.categorie!,
    duur: getal(o.duur, 1, MAX_DUUR, 15),
    soort: o.soort === 'samen' ? 'samen' : 'stations',
    ...(typeof o.oefening === 'string' && o.oefening ? { oefening: o.oefening } : {}),
  }));
}

/** Controleert wat er binnenkomt (link of team): alles wat niet klopt valt terug op iets veiligs. */
function netteClub(x: { [k in keyof GedeeldeClub]?: unknown }): GedeeldeClub {
  const bron = (x.blokken && typeof x.blokken === 'object' ? x.blokken : {}) as Record<string, unknown>;
  const blokken: Partial<Record<Blok, string>> = {};
  for (const blok of BLOKKEN) {
    const id = bron[blok];
    if (typeof id === 'string' && id) blokken[blok] = id;
  }
  return {
    naam: typeof x.naam === 'string' ? x.naam.slice(0, 80) : '',
    datums: Array.isArray(x.datums) ? x.datums.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(0, 7) : [],
    leeftijd: isLeeftijd(x.leeftijd) ? x.leeftijd : 'mini-5-7',
    kinderen: getal(x.kinderen, 1, MAX_KINDEREN, 30),
    groepjes: getal(x.groepjes, MIN_GROEPJES, MAX_GROEPJES, 6),
    trainers: Array.isArray(x.trainers) ? x.trainers.filter((n): n is string => typeof n === 'string').map((n) => n.slice(0, 40)).slice(0, 12) : [],
    blokken,
    ...(netteOnderdelen(x.onderdelen) ? { onderdelen: netteOnderdelen(x.onderdelen)! } : {}),
    ...(typeof x.starttijd === 'string' && /^\d{2}:\d{2}$/.test(x.starttijd) ? { starttijd: x.starttijd } : {}),
    stationTrainers: tekstenRecord(x.stationTrainers),
    veldTrainers: tekstenRecord(x.veldTrainers),
    ...(Array.isArray(x.eigen) && x.eigen.some(geldigeEigen) ? { eigen: x.eigen.filter(geldigeEigen).map((o) => ({ ...o, eigen: true })) } : {}),
  };
}

export function uitCode(code: string): GedeeldeClub | null {
  try {
    const x = JSON.parse(uitBase64Url(code)) as { v?: number; n?: unknown; d?: unknown; l?: unknown; k?: unknown; g?: unknown; t?: unknown; b?: unknown; o?: unknown; u?: unknown; s?: unknown; f?: unknown; e?: unknown };
    const basis = { naam: x.n, datums: x.d, leeftijd: x.l, kinderen: x.k, groepjes: x.g, trainers: x.t, stationTrainers: x.s, veldTrainers: x.f, eigen: x.e };
    if (x.v === 2 && Array.isArray(x.o)) {
      const onderdelen = (x.o as unknown[][]).map(([categorie, duur, samen, oefening], i) => ({ id: `o${i + 1}`, categorie, duur, soort: samen ? 'samen' : 'stations', oefening: typeof oefening === 'string' ? lang(oefening) : '' }));
      return netteClub({ ...basis, blokken: {}, onderdelen, starttijd: x.u });
    }
    if (x.v !== 1 || !Array.isArray(x.b)) return null;
    const blokken: Partial<Record<Blok, string>> = {};
    BLOKKEN.forEach((blok, i) => {
      const id = (x.b as unknown[])[i];
      if (typeof id === 'string' && id) blokken[blok] = lang(id);
    });
    return netteClub({ ...basis, blokken });
  } catch {
    return null;
  }
}

/** Inhoud van een gedeeld team-item (0.31.2): de circuittraining plus de oefeningen die de teamleden niet hebben. */
export function voorTeam(c: Inhoud, eigen: Oefening[] = []): string {
  const { naam, datums, leeftijd, kinderen, groepjes, trainers, stationTrainers, veldTrainers } = c;
  const ids = oefeningIds(c);
  const onderdelen = onderdelenVan(c);
  return JSON.stringify({ club: { naam, datums, leeftijd, kinderen, groepjes, trainers, blokken: {}, onderdelen, ...(c.starttijd ? { starttijd: c.starttijd } : {}), stationTrainers, veldTrainers }, eigen: eigen.filter((o) => ids.includes(o.id)) });
}

/** Gedeeld team-item lezen (null als het kapot is). */
export function leesTeamClub(data: string): GedeeldeClub | null {
  try {
    const x = JSON.parse(data) as { club?: { blokken?: unknown }; eigen?: unknown };
    if (!x?.club || typeof x.club !== 'object' || !x.club.blokken) return null;
    return netteClub({ ...x.club, eigen: x.eigen });
  } catch {
    return null;
  }
}

/** Oefeningen in de onderdelen vervangen (bij delen en kopiëren krijgen meegenomen oefeningen soms een ander id). */
export const metOefeningIds = (c: { onderdelen?: Onderdeel[]; blokken?: Partial<Record<Blok, string>> }, nieuwId: (id: string) => string): Onderdeel[] => onderdelenVan(c).map((o) => (o.oefening ? { ...o, oefening: nieuwId(o.oefening) } : o));

/** Gedeelde circuittraining als nieuwe eigen circuittraining: `ids` zijn de nieuwe id's van de meegekomen oefeningen. */
export function uitGedeeldeClub(g: GedeeldeClub, ids: ReadonlyMap<string, string> = new Map(), nu = Date.now(), id = maakId()): ClubTraining {
  const { eigen: _e, ...rest } = g;
  void _e;
  return { ...rest, blokken: {}, onderdelen: metOefeningIds(g, (x) => ids.get(x) ?? x), id, afgevinkt: [], gemaakt: nu, gewijzigd: nu };
}

// ---------- rondetimer ----------

export interface TimerStand {
  /** Index van de ronde. */
  ronde: number;
  /** Seconden over in deze ronde. */
  rest: number;
  klaar: boolean;
}

export function timerStand(verstreken: number, rondes: Pick<Ronde, 'begin' | 'eind'>[]): TimerStand {
  const s = Math.max(0, verstreken);
  const i = rondes.findIndex((r) => s < r.eind);
  if (i < 0) return { ronde: Math.max(0, rondes.length - 1), rest: 0, klaar: true };
  return { ronde: i, rest: Math.ceil(rondes[i]!.eind - s), klaar: false };
}
