/**
 * Synchroniseren zonder iets kwijt te raken (puur, getest in tests/samenvoegen.test.ts).
 *
 * Per item drie versies: lokaal (op dit apparaat), online (Firestore) en `bekend` (zoals het de laatste keer
 * gesynchroniseerd is). Daarmee zie je wie iets veranderd of verwijderd heeft, ook als je offline was:
 * - alleen lokaal veranderd → online bijwerken; alleen online veranderd → lokaal bijwerken;
 * - beide veranderd → de nieuwste (`gewijzigd`) wint;
 * - verwijderd aan één kant en aan de andere kant niet veranderd → ook daar verwijderen;
 * - verwijderd aan één kant maar aan de andere kant intussen veranderd → het veranderde item blijft.
 */

export interface Item {
  id: string;
  gewijzigd: number;
}

export interface Verzoening<T> {
  /** Nieuwe lokale lijst (volgorde: zoals lokaal, nieuwe online items vooraan). */
  lokaal: T[];
  /** Nieuwe "laatst gesynchroniseerd"-stand (id → JSON). */
  bekend: Record<string, string>;
  /** Online schrijven. */
  schrijf: T[];
  /** Online verwijderen. */
  verwijder: string[];
  /** Is de lokale lijst veranderd? */
  lokaalVeranderd: boolean;
}

const json = (x: unknown) => JSON.stringify(x);

export function verzoen<T extends Item>(lokaal: T[], bekend: Record<string, string>, online: T[]): Verzoening<T> {
  const L = new Map(lokaal.map((x) => [x.id, x]));
  const R = new Map(online.map((x) => [x.id, x]));
  const ids = new Set([...L.keys(), ...R.keys(), ...Object.keys(bekend)]);
  const uitLokaal = new Map<string, T>();
  const nieuwBekend: Record<string, string> = {};
  const schrijf: T[] = [];
  const verwijder: string[] = [];
  const nieuwVanOnline: T[] = [];
  let veranderd = false;

  for (const id of ids) {
    const l = L.get(id);
    const r = R.get(id);
    const lj = l && json(l);
    const rj = r && json(r);
    const b = bekend[id];
    if (l && r) {
      if (lj === rj) {
        uitLokaal.set(id, l);
        nieuwBekend[id] = lj!;
      } else if (lj === b) {
        // Alleen online veranderd.
        uitLokaal.set(id, r);
        nieuwBekend[id] = rj!;
        veranderd = true;
      } else if (rj === b) {
        // Alleen lokaal veranderd.
        uitLokaal.set(id, l);
        schrijf.push(l);
        nieuwBekend[id] = lj!;
      } else if (l.gewijzigd >= r.gewijzigd) {
        // Allebei veranderd (of allebei nieuw): de nieuwste wint.
        uitLokaal.set(id, l);
        schrijf.push(l);
        nieuwBekend[id] = lj!;
      } else {
        uitLokaal.set(id, r);
        nieuwBekend[id] = rj!;
        veranderd = true;
      }
    } else if (l) {
      if (b !== undefined && lj === b) {
        // Online verwijderd, lokaal niets veranderd: ook lokaal weg.
        veranderd = true;
      } else {
        // Nieuw op dit apparaat, of lokaal veranderd na het online verwijderen: online zetten.
        uitLokaal.set(id, l);
        schrijf.push(l);
        nieuwBekend[id] = lj!;
      }
    } else if (r) {
      if (b !== undefined && rj === b) {
        // Lokaal verwijderd, online niets veranderd: ook online weg.
        verwijder.push(id);
      } else {
        // Nieuw online (of online veranderd na het lokaal verwijderen): lokaal toevoegen.
        nieuwVanOnline.push(r);
        uitLokaal.set(id, r);
        nieuwBekend[id] = rj!;
        veranderd = true;
      }
    }
  }

  // Volgorde: nieuwe online items vooraan (nieuwste eerst), daarna de lokale volgorde.
  const volgorde = [...nieuwVanOnline.sort((a, b) => b.gewijzigd - a.gewijzigd).map((x) => x.id), ...lokaal.map((x) => x.id)];
  const gezien = new Set<string>();
  const lijst: T[] = [];
  for (const id of volgorde) {
    if (gezien.has(id)) continue;
    gezien.add(id);
    const x = uitLokaal.get(id);
    if (x) lijst.push(x);
  }
  return { lokaal: lijst, bekend: nieuwBekend, schrijf, verwijder, lokaalVeranderd: veranderd || lijst.length !== lokaal.length };
}

/**
 * Hetzelfde voor een verzameling (favorieten): per element kijken wie het toegevoegd of weggehaald heeft.
 */
export function verzoenSet(lokaal: readonly string[], bekend: readonly string[], online: readonly string[]): { lokaal: string[]; online: string[]; lokaalVeranderd: boolean; onlineVeranderd: boolean } {
  const L = new Set(lokaal);
  const B = new Set(bekend);
  const R = new Set(online);
  const uit: string[] = [];
  for (const x of new Set([...lokaal, ...online])) {
    const l = L.has(x);
    const r = R.has(x);
    const b = B.has(x);
    if (l && r) uit.push(x);
    else if (l && !b) uit.push(x); // lokaal toegevoegd
    else if (r && !b) uit.push(x); // online toegevoegd
    // anders: aan één kant weggehaald → weg
  }
  const zelfde = (a: string[], b: Set<string>) => a.length === b.size && a.every((x) => b.has(x));
  return { lokaal: uit, online: uit, lokaalVeranderd: !zelfde(uit, L), onlineVeranderd: !zelfde(uit, R) };
}

/** Instellingen: de nieuwste wint. */
export function nieuwste<T extends { gewijzigd: number }>(a: T | undefined, b: T | undefined): T | undefined {
  if (!a) return b;
  if (!b) return a;
  return b.gewijzigd > a.gewijzigd ? b : a;
}

// ---------- teamcode ----------

/** Tekens voor een teamcode: zonder 0/O, 1/I/L (verwarrend). */
export const CODE_TEKENS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function nieuweCode(toeval: () => number = Math.random): string {
  let c = '';
  for (let i = 0; i < 6; i++) c += CODE_TEKENS[Math.floor(toeval() * CODE_TEKENS.length) % CODE_TEKENS.length];
  return c;
}

/** Code zoals iemand hem intypt: hoofdletters, zonder spaties of streepjes. */
export function normaliseerCode(invoer: string): string {
  return invoer.toUpperCase().replace(/[\s-]/g, '');
}

export const isGeldigeCode = (c: string) => new RegExp(`^[${CODE_TEKENS}]{6}$`).test(c);
