import type { Oefening, Soort } from '../model/types';
import { maakId } from '../model/id';
import { geldigeEigen, isEigenId } from '../eigen/eigen';
import type { Generator } from './genereren';

/**
 * Een training: aantallen, optioneel naam en datum, en de gekozen oefeningen (id's) in volgorde.
 * Opgeslagen op het apparaat (zie opslag.ts); later ook online (fase 6). Het formaat is daarom los van de opslag.
 */
export interface Training {
  id: string;
  naam: string;
  /** JJJJ-MM-DD */
  datum?: string;
  spelers: number;
  keepers: number;
  oefeningen: string[];
  gemaakt: number;
  gewijzigd: number;
  /** Gegenereerde training: de gekozen onderdelen en per onderdeel de oefening (voor "Andere oefening"). */
  generator?: Generator;
}

export const MAX_AANTAL = 40;

/** Past een oefening bij deze aantallen? Minder nodig is altijd prima. */
export function pastBij(o: Pick<Oefening, 'spelersNodig' | 'keepersNodig'>, spelers: number, keepers: number): boolean {
  return o.spelersNodig <= spelers && o.keepersNodig <= keepers;
}

/** Oefeningen die je kunt kiezen: van deze soort (en categorie) én passend bij de aantallen. */
export function kiesbaar(alle: Oefening[], soort: Soort, categorie: string | undefined, spelers: number, keepers: number): Oefening[] {
  return alle.filter((o) => o.soort === soort && (!categorie || o.categorieen.includes(categorie)) && pastBij(o, spelers, keepers));
}

/** Lijst met één element verplaatst (slepen). */
export function verplaats<T>(lijst: readonly T[], van: number, naar: number): T[] {
  const uit = [...lijst];
  if (van < 0 || van >= uit.length || naar < 0 || naar >= uit.length || van === naar) return uit;
  const [x] = uit.splice(van, 1);
  uit.splice(naar, 0, x!);
  return uit;
}

export { maakId };

export function nieuweTraining(nu = Date.now(), id = maakId()): Training {
  return { id, naam: '', spelers: 4, keepers: 1, oefeningen: [], gemaakt: nu, gewijzigd: nu };
}

/** Niets ingevuld (geen oefeningen, naam of datum): zo'n training wordt niet bewaard. */
export function isLeeg(t: Pick<Training, 'naam' | 'datum' | 'oefeningen'>): boolean {
  return t.oefeningen.length === 0 && !t.naam.trim() && !t.datum;
}

export function dupliceer(t: Training, nu = Date.now(), id = maakId()): Training {
  return { ...t, id, naam: `${trainingNaam(t)} (kopie)`, oefeningen: [...t.oefeningen], gemaakt: nu, gewijzigd: nu };
}

const MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

/** "16 okt 2026" (zonder tijdzonegedoe: de datum is een kalenderdag). */
export function datumTekst(datum: string): string {
  const [j, m, d] = datum.split('-').map(Number);
  if (!j || !m || !d) return datum;
  return `${d} ${MAANDEN[m - 1]} ${j}`;
}

export function trainingNaam(t: Pick<Training, 'naam' | 'datum'>): string {
  if (t.naam.trim()) return t.naam.trim();
  return t.datum ? `Training ${datumTekst(t.datum)}` : 'Training zonder naam';
}

// ---------- delen via een link ----------

/** Wat er in een deellink staat (alleen de inhoud, geen id's of tijden). */
export interface GedeeldeTraining {
  naam: string;
  datum?: string;
  spelers: number;
  keepers: number;
  oefeningen: string[];
  /** Eigen oefeningen die in de training zitten: die gaan in hun geheel mee in de link. */
  eigen?: Oefening[];
}

export function naarBase64Url(tekst: string): string {
  const bytes = new TextEncoder().encode(tekst);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function uitBase64Url(code: string): string {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/**
 * Compacte code voor in de link. Oefening-id's zonder het voorvoegsel "veld-"/"keeper-" waar dat kan. Eigen oefeningen
 * (`eigen`, klaargemaakt met `voorDelen`) gaan er in hun geheel in, zodat de ontvanger ze ook heeft.
 */
export function naarCode(t: Pick<Training, 'naam' | 'datum' | 'spelers' | 'keepers' | 'oefeningen'>, eigen: Oefening[] = []): string {
  const o = t.oefeningen.map((id) => id.replace(/^veld-/, 'v:').replace(/^keeper-/, 'k:'));
  const e = eigen.filter((x) => t.oefeningen.includes(x.id));
  return naarBase64Url(JSON.stringify({ v: 1, n: t.naam, d: t.datum, s: t.spelers, k: t.keepers, o, ...(e.length ? { e } : {}) }));
}

/** Eigen oefeningen die in een training zitten (voor in de link). */
export const eigenIds = (t: Pick<Training, 'oefeningen'>) => t.oefeningen.filter(isEigenId);

export function uitCode(code: string): GedeeldeTraining | null {
  try {
    const x = JSON.parse(uitBase64Url(code)) as { v?: number; n?: unknown; d?: unknown; s?: unknown; k?: unknown; o?: unknown; e?: unknown };
    if (x.v !== 1 || !Array.isArray(x.o)) return null;
    const getal = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(MAX_AANTAL, Math.round(v))) : 0);
    return {
      naam: typeof x.n === 'string' ? x.n.slice(0, 80) : '',
      datum: typeof x.d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.d) ? x.d : undefined,
      spelers: getal(x.s),
      keepers: getal(x.k),
      oefeningen: x.o.filter((id): id is string => typeof id === 'string').map((id) => id.replace(/^v:/, 'veld-').replace(/^k:/, 'keeper-')),
      ...(Array.isArray(x.e) && x.e.some(geldigeEigen) ? { eigen: x.e.filter(geldigeEigen).map((o) => ({ ...o, eigen: true })) } : {}),
    };
  } catch {
    return null;
  }
}

// ---------- benodigdheden voor de hele training ----------

export interface Benodigdheid {
  /** Weergave, met het aantal erin als dat bekend is (bv. "6 pionnen"). */
  tekst: string;
  aantal?: number;
  /** Namen van de oefeningen die dit gebruiken. */
  oefeningen: string[];
}

/** Meervoud → enkelvoud (alleen de woorden die in de oefeningen voorkomen). */
const ENKELVOUD: Record<string, string> = {
  pionnen: 'pion',
  hoedjes: 'hoedje',
  ballen: 'bal',
  goals: 'goal',
  doelen: 'doel',
  doeltjes: 'doeltje',
  'mini-doeltjes': 'mini-doeltje',
  doelnetten: 'doelnet',
  hesjes: 'hesje',
  hordes: 'horde',
  ringen: 'ring',
  paaltjes: 'paaltje',
  palen: 'paal',
  poppen: 'pop',
  banken: 'bank',
  ladders: 'ladder',
  loopladders: 'loopladder',
  matten: 'mat',
  landingskussens: 'landingskussen',
  hoepels: 'hoepel',
  dummies: 'dummy',
  rebounders: 'rebounder',
  stokken: 'stok',
};
const MEERVOUD: Record<string, string> = Object.fromEntries(Object.entries(ENKELVOUD).map(([m, e]) => [e, m]));
const KLEIN: Record<string, string> = { kleine: 'klein', grote: 'groot', lage: 'laag', hoge: 'hoog', dikke: 'dik' };

function sleutel(naam: string): string {
  return naam
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ENKELVOUD[w] ?? KLEIN[w] ?? w)
    .join(' ')
    .trim();
}

function metAantal(s: string, aantal: number): string {
  const woorden = s.split(' ');
  if (aantal !== 1) {
    // Bijvoeglijke naamwoorden terug naar "kleine", "lage" … en het zelfstandig naamwoord in het meervoud.
    const terug: Record<string, string> = Object.fromEntries(Object.entries(KLEIN).map(([a, b]) => [b, a]));
    const i = woorden.findIndex((w) => MEERVOUD[w]);
    if (i >= 0) {
      woorden[i] = MEERVOUD[woorden[i]!]!;
      for (let j = 0; j < i; j++) woorden[j] = terug[woorden[j]!] ?? woorden[j]!;
    }
  }
  return `${aantal} ${woorden.join(' ')}`;
}

/**
 * Alles wat je voor de training moet klaarzetten. De oefeningen komen na elkaar, dus per soort materiaal telt het
 * grootste aantal dat één oefening nodig heeft (dat materiaal gebruik je daarna opnieuw).
 */
export function benodigdheden(oefeningen: Oefening[]): Benodigdheid[] {
  const per = new Map<string, { aantal?: number; tekst: string; oefeningen: Set<string> }>();
  for (const o of oefeningen) {
    for (const b of o.benodigdheden) {
      const m = /^(\d+)\+?(?:\s*[–-]\s*(\d+))?\s+(.+)$/.exec(b.trim());
      const aantal = m ? Math.max(Number(m[1]), Number(m[2] ?? 0)) : undefined;
      const naam = m ? m[3]! : b.trim();
      const k = sleutel(naam);
      if (!k) continue;
      const nu = per.get(k) ?? { tekst: naam.replace(/\s*\(.*?\)/g, '').trim(), oefeningen: new Set<string>() };
      if (aantal !== undefined) nu.aantal = Math.max(nu.aantal ?? 0, aantal);
      nu.oefeningen.add(o.naam);
      per.set(k, nu);
    }
  }
  return [...per.entries()]
    .map(([k, v]) => {
      const tekst = v.aantal !== undefined ? metAantal(k, v.aantal) : v.tekst.charAt(0).toUpperCase() + v.tekst.slice(1);
      return { tekst, aantal: v.aantal, oefeningen: [...v.oefeningen] };
    })
    .sort((a, b) => a.tekst.replace(/^\d+ /, '').localeCompare(b.tekst.replace(/^\d+ /, ''), 'nl'));
}
