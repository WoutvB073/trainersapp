import { CATEGORIEEN, naarVolgendeWeek, type ClubTraining, type DagTrainers, sessieTijd } from './clubtraining';
import { maakId } from '../training/training';
import { t as vt } from '../i18n/t';

/**
 * Trainersrooster (0.34.0): vaste trainers één keer invoeren. Per trainer de dagen, elke week of om de week, de groep(en) waar hij bij
 * hoort (ook om de week wisselend) en eventueel een vaste plek bij een categorie. Een circuittraining met een `groep` krijgt per datum de
 * trainers van het rooster (`vulVolgensRooster`). Alles hier is puur (getest in tests/versie-0340.test.ts).
 */
export interface RoosterTrainer {
  id: string;
  naam: string;
  /** 1 = maandag … 7 = zondag. */
  dagen: number[];
  ritme: 'elke' | 'om';
  /** Maandag (JJJJ-MM-DD) van de week waarin het ritme begint: er die week bij (om de week), en bij de eerste groep (wisselend). */
  beginWeek: string;
  groepen: string[];
  /** Bij twee of meer groepen: om de week wisselen, in de volgorde van `groepen`. Anders: bij alle groepen. */
  wissel: boolean;
  /** Vaste plek: een categorie (bv. loopcoordinatie). */
  plek?: string;
  /** Sinds 0.34.4: alleen bij de sessie met deze begintijd (HH:MM). Zonder = bij elke sessie van zijn groep op die dag. */
  tijd?: string;
  gewijzigd: number;
}

export const MAX_ROOSTER = 100;
const DAG = 24 * 60 * 60 * 1000;

/** Kalenderdag als getal (UTC, dus zonder zomertijdgedoe). */
const dagGetal = (datum: string) => {
  const [j, m, d] = datum.split('-').map(Number);
  return Date.UTC(j!, m! - 1, d!) / DAG;
};
const alsDatum = (n: number) => new Date(n * DAG).toISOString().slice(0, 10);

/** 1 = maandag … 7 = zondag. */
export const weekdag = (datum: string) => ((((Math.floor(dagGetal(datum)) + 3) % 7) + 7) % 7) + 1;

/** Maandag van de week waarin deze datum valt. */
export const maandagVan = (datum: string) => alsDatum(dagGetal(datum) - (weekdag(datum) - 1));

/** ISO-weeknummer (week 1 = de week met de eerste donderdag van het jaar). */
export function weekNummer(datum: string): number {
  const donderdag = dagGetal(maandagVan(datum)) + 3;
  const jaar = new Date(donderdag * DAG).getUTCFullYear();
  return Math.floor((donderdag - Date.UTC(jaar, 0, 1) / DAG) / 7) + 1;
}

/** Hoeveel weken na de beginweek (negatief = ervoor). */
export const weekIndex = (t: Pick<RoosterTrainer, 'beginWeek'>, datum: string) => Math.round((dagGetal(maandagVan(datum)) - dagGetal(maandagVan(t.beginWeek))) / 7);

const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Is deze trainer er op deze datum? */
export function aanwezig(t: RoosterTrainer, datum: string): boolean {
  if (!t.dagen.includes(weekdag(datum))) return false;
  return t.ritme === 'elke' || mod(weekIndex(t, datum), 2) === 0;
}

/** Bij welke groep(en) is deze trainer op deze datum? */
export function groepenOp(t: RoosterTrainer, datum: string): string[] {
  if (!aanwezig(t, datum)) return [];
  if (!t.wissel || t.groepen.length < 2) return t.groepen;
  const stap = t.ritme === 'om' ? 2 : 1;
  return [t.groepen[mod(Math.floor(weekIndex(t, datum) / stap), t.groepen.length)]!];
}

/**
 * De trainers van een groep op een datum, met hun vaste plek. Met `tijd` (de begintijd van de sessie, 0.34.4) alleen trainers zonder tijd
 * of met precies die tijd. Een sessie zonder begintijd krijgt iedereen van de groep.
 */
export function roosterVoor(rooster: RoosterTrainer[], groep: string, datum: string, tijd = ''): { naam: string; plek?: string }[] {
  return rooster
    .filter((t) => t.naam.trim() && groepenOp(t, datum).includes(groep) && (!t.tijd || !tijd || t.tijd === tijd))
    .map((t) => ({ naam: t.naam.trim(), ...(t.plek ? { plek: t.plek } : {}) }));
}

/** Alle groepen uit het rooster (en eventueel die van een training), op naam. */
export function roosterGroepen(rooster: RoosterTrainer[], ...extra: (string | undefined)[]): string[] {
  return [...new Set([...rooster.flatMap((t) => t.groepen), ...extra].map((g) => g?.trim() ?? '').filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

/**
 * Trainers per dag volgens het rooster. Een dag die je zelf hebt aangepast blijft staan, behalve met `forceer` (een nieuwe week, of een
 * andere groep): dan volgt elke dag weer het rooster. Zonder groep, zonder datums of zonder trainers in het rooster voor die groep: niets.
 */
export function vulVolgensRooster<T extends Pick<ClubTraining, 'groep' | 'datums' | 'perDag' | 'trainers' | 'trainerKeuzes'>>(c: T, rooster: RoosterTrainer[], forceer = false): T {
  // Elke sessie (0.34.4) heeft eventueel een eigen groep en begintijd.
  const groepVan = (i: number) => (i > 0 && c.perDag?.[i]?.groep !== undefined ? c.perDag[i]!.groep : c.groep)?.trim() ?? '';
  const metRooster = (g: string) => !!g && rooster.some((t) => t.groepen.includes(g));
  if (!c.datums.length || !c.datums.some((_, i) => metRooster(groepVan(i)))) return c;
  const perDag = c.datums.map((datum, i): DagTrainers => {
    const oud = c.perDag?.[i];
    const groep = groepVan(i);
    if (!metRooster(groep)) return oud ?? { trainers: c.trainers, ...(c.trainerKeuzes ? { trainerKeuzes: c.trainerKeuzes } : {}) };
    if (!forceer && oud && !oud.rooster) return oud;
    // Een eigen opzet (0.34.3) en de eigen waarden van een sessie (0.34.4) blijven staan: het rooster gaat alleen over de trainers.
    const { tijd, kinderen, groepjes, leeftijd, groep: eigenGroep, onderdelen } = oud ?? {};
    const opzet = i > 0 ? { ...(onderdelen?.length ? { onderdelen } : {}), ...(tijd !== undefined ? { tijd } : {}), ...(kinderen ? { kinderen } : {}), ...(groepjes ? { groepjes } : {}), ...(leeftijd ? { leeftijd } : {}), ...(eigenGroep !== undefined ? { groep: eigenGroep } : {}) } : {};
    const lijst = roosterVoor(rooster, groep, datum, sessieTijd(c, i));
    const vast: Record<string, string> = {};
    for (const x of lijst) if (x.plek) vast[x.naam] = x.plek;
    const modus = (oud?.trainerKeuzes ?? c.trainerKeuzes)?.modus;
    return { trainers: lijst.map((x) => x.naam), ...(Object.keys(vast).length ? { vast } : {}), ...(modus ? { trainerKeuzes: { modus } } : {}), rooster: true, ...opzet };
  });
  return { ...c, perDag };
}

/** Naar volgende week: elke dag weer volgens het rooster (een aanpassing met de hand gold maar voor één week). */
export const volgendeWeek = (c: ClubTraining, rooster: RoosterTrainer[], nu = Date.now(), id?: string) => vulVolgensRooster(naarVolgendeWeek(c, nu, id), rooster, true);

export function nieuweRoosterTrainer(vandaag: string, nu = Date.now(), id = maakId()): RoosterTrainer {
  return { id, naam: '', dagen: [weekdag(vandaag)], ritme: 'elke', beginWeek: maandagVan(vandaag), groepen: [], wissel: false, gewijzigd: nu };
}

const DAGEN = () => [vt('ma'), vt('di'), vt('wo'), vt('do'), vt('vr'), vt('za'), vt('zo')];
export const dagNaam = (nr: number) => DAGEN()[nr - 1] ?? '';

/** "wo · elke week · O7 en O6 om de week wisselend (week 47: O7)". */
export function roosterTekst(t: RoosterTrainer, categorieNaam: (id: string) => string = (x) => x): string {
  const delen = [t.dagen.length ? [...t.dagen].sort().map(dagNaam).join(', ') : vt('geen dag'), t.ritme === 'om' ? vt('om de week (vanaf week {w})', { w: weekNummer(t.beginWeek) }) : vt('elke week')];
  if (t.groepen.length > 1 && t.wissel) delen.push(vt('{groepen} om de week wisselend (week {w}: {eerste})', { groepen: t.groepen.join(' / '), w: weekNummer(t.beginWeek), eerste: t.groepen[0]! }));
  else if (t.groepen.length) delen.push(t.groepen.join(', '));
  if (t.tijd) delen.push(vt('om {tijd}', { tijd: t.tijd }));
  if (t.plek) delen.push(categorieNaam(t.plek));
  return delen.join(' · ');
}

const tekstVeld = (x: unknown, max: number) => (typeof x === 'string' ? x.slice(0, max) : '');

/** Controleert een rooster dat binnenkomt (team): wat niet klopt valt weg of terug op iets veiligs. */
export function netteRooster(x: unknown, nu = Date.now()): RoosterTrainer[] {
  if (!Array.isArray(x)) return [];
  return (x as Partial<RoosterTrainer>[])
    .filter((t) => t && typeof t.id === 'string' && t.id && typeof t.naam === 'string')
    .slice(0, MAX_ROOSTER)
    .map((t) => ({
      id: tekstVeld(t.id, 40),
      naam: tekstVeld(t.naam, 40),
      dagen: Array.isArray(t.dagen) ? [...new Set(t.dagen.filter((d): d is number => Number.isInteger(d) && d >= 1 && d <= 7))] : [],
      ritme: t.ritme === 'om' ? 'om' : 'elke',
      beginWeek: typeof t.beginWeek === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.beginWeek) ? maandagVan(t.beginWeek) : maandagVan(new Date(nu).toISOString().slice(0, 10)),
      groepen: Array.isArray(t.groepen) ? [...new Set(t.groepen.filter((g): g is string => typeof g === 'string' && !!g.trim()).map((g) => g.trim().slice(0, 60)))].slice(0, 10) : [],
      wissel: t.wissel === true,
      ...(typeof t.plek === 'string' && CATEGORIEEN.includes(t.plek) ? { plek: t.plek } : {}),
      ...(typeof t.tijd === 'string' && /^\d{2}:\d{2}$/.test(t.tijd) ? { tijd: t.tijd } : {}),
      gewijzigd: typeof t.gewijzigd === 'number' ? t.gewijzigd : nu,
    }));
}

/** Gedeeld team-item: het hele rooster. */
export const voorTeamRooster = (rooster: RoosterTrainer[]) => JSON.stringify({ rooster });

export function leesTeamRooster(data: string): RoosterTrainer[] | null {
  try {
    const x = JSON.parse(data) as { rooster?: unknown };
    return Array.isArray(x?.rooster) ? netteRooster(x.rooster) : null;
  } catch {
    return null;
  }
}

/** Gedeeld rooster overnemen: zelfde trainer (id) wordt bijgewerkt, nieuwe komen erbij. */
export function voegRoosterSamen(eigen: RoosterTrainer[], ander: RoosterTrainer[], nu = Date.now()): RoosterTrainer[] {
  const uit = new Map(eigen.map((t) => [t.id, t]));
  for (const t of ander) uit.set(t.id, { ...t, gewijzigd: nu });
  return [...uit.values()];
}
