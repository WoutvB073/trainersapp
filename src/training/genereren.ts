import type { Oefening, Soort } from '../model/types';
import { pastBij, type Training } from './training';

/**
 * Training genereren: per gekozen onderdeel (categorie van Spelers of Keepers) kiest de app één oefening die past bij de
 * aantallen. Afwisselend: liever geen oefening uit de laatste trainingen, voorkeur voor favorieten en nooit twee keer
 * dezelfde oefening in één training. Puur (toeval en gegevens komen van buiten), zodat het te testen is.
 */

export interface Onderdeel {
  soort: Soort;
  categorie: string;
}

/** Wat er bij een gegenereerde training bewaard wordt: de onderdelen en per onderdeel de gekozen oefening (of geen). */
export interface Generator {
  onderdelen: Onderdeel[];
  keuzes: (string | null)[];
}

export interface KiesContext {
  alle: Oefening[];
  spelers: number;
  keepers: number;
  favorieten: ReadonlySet<string>;
  /** Hoe recent een oefening gebruikt is: 1 = in de laatste training, 2 = de training daarvoor … */
  recent: ReadonlyMap<string, number>;
  /** Getal in [0, 1). */
  toeval: () => number;
}

/** Oefeningen die bij een onderdeel kunnen (soort, categorie en aantallen). */
export function kandidaten(o: Onderdeel, c: Pick<KiesContext, 'alle' | 'spelers' | 'keepers'>): Oefening[] {
  return c.alle.filter((x) => x.soort === o.soort && x.categorieen.includes(o.categorie) && pastBij(x, c.spelers, c.keepers));
}

/** Score: hoger = liever. Toeval zorgt voor afwisseling tussen gelijkwaardige oefeningen. */
function score(x: Oefening, c: KiesContext): number {
  let s = c.toeval();
  if (c.favorieten.has(x.id)) s += 1.5;
  const r = c.recent.get(x.id);
  if (r !== undefined) s -= 4 / r; // laatste training −4, de training daarvoor −2, …
  // Een oefening voor een vast, veel kleiner aantal laat te veel spelers stilstaan.
  const wie = x.soort === 'keeper' ? c.keepers : c.spelers;
  const nodig = x.soort === 'keeper' ? x.keepersNodig : x.spelersNodig;
  if (!x.doorwisselbaar && nodig > 0 && nodig < wie / 2) s -= 0.8;
  return s;
}

/** Eén oefening voor dit onderdeel, niet uit `uitgesloten`; `null` als er geen past. */
export function kiesOefening(o: Onderdeel, c: KiesContext, uitgesloten: ReadonlySet<string>): Oefening | null {
  let beste: Oefening | null = null;
  let besteScore = -Infinity;
  for (const x of kandidaten(o, c)) {
    if (uitgesloten.has(x.id)) continue;
    const s = score(x, c);
    if (s > besteScore) {
      beste = x;
      besteScore = s;
    }
  }
  return beste;
}

/** Alle onderdelen in volgorde: per onderdeel een oefening (geen dubbele). */
export function genereer(onderdelen: Onderdeel[], c: KiesContext): Generator {
  const gekozen = new Set<string>();
  const keuzes = onderdelen.map((o) => {
    const x = kiesOefening(o, c, gekozen);
    if (x) gekozen.add(x.id);
    return x?.id ?? null;
  });
  return { onderdelen: [...onderdelen], keuzes };
}

/** Eén onderdeel opnieuw kiezen: een andere oefening dan nu, en niet een die al elders in de training zit. */
export function andereOefening(g: Generator, i: number, c: KiesContext, inTraining: readonly string[]): Generator {
  const huidig = g.keuzes[i] ?? null;
  const uit = new Set<string>([...g.keuzes.filter((k): k is string => !!k), ...inTraining]);
  const x = kiesOefening(g.onderdelen[i]!, c, uit);
  // Geen andere meer over: dan blijft het zoals het was.
  if (!x && huidig) return g;
  const keuzes = [...g.keuzes];
  keuzes[i] = x?.id ?? null;
  return { ...g, keuzes };
}

/** Recente trainingen (nieuwste eerst, op datum of anders laatst gewijzigd): per oefening hoe recent. */
export function recentGebruikt(lijst: Training[], behalve?: string, aantal = 3): Map<string, number> {
  const sleutel = (t: Training) => t.datum ?? new Date(t.gewijzigd).toISOString().slice(0, 10);
  const nieuwste = lijst
    .filter((t) => t.id !== behalve && t.oefeningen.length)
    .sort((a, b) => sleutel(b).localeCompare(sleutel(a)) || b.gewijzigd - a.gewijzigd)
    .slice(0, aantal);
  const uit = new Map<string, number>();
  nieuwste.forEach((t, i) => {
    for (const id of t.oefeningen) if (!uit.has(id)) uit.set(id, i + 1);
  });
  return uit;
}

/** De oefeningen van een gegenereerde training in volgorde (onderdelen zonder oefening vallen weg). */
export const oefeningenUit = (g: Generator) => g.keuzes.filter((k): k is string => !!k);
