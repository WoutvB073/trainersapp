import type { EigenOefening } from '../model/types';
import type { Training } from '../training/training';
import { MAX_AANTAL } from '../training/training';
import { EIGEN_VOORVOEGSEL, geldigeEigen, isEigenId, zelfdeInhoud } from '../eigen/eigen';
import { maakId } from '../model/id';

/**
 * Exporteren en importeren van je eigen spullen (eigen oefeningen, trainingen, favorieten) als één bestand.
 * Importeren voegt samen: niets wordt overschreven en niets komt dubbel. Staat iets er al precies zo, dan wordt het
 * overgeslagen; bestaat de id al met een andere inhoud, dan komt het erbij met een nieuwe id (en trainingen die die
 * oefening gebruiken, wijzen naar de nieuwe id).
 */

export const EXPORT_SOORT = 'toptraining-gegevens';
const VERSIE = 1;

export interface ExportBestand {
  soort: typeof EXPORT_SOORT;
  versie: number;
  /** Tijdstip (ms) van exporteren. */
  gemaakt: number;
  eigenOefeningen: EigenOefening[];
  trainingen: Training[];
  favorieten: string[];
}

export interface Gegevens {
  eigen: EigenOefening[];
  trainingen: Training[];
  favorieten: string[];
}

export function maakExport(g: Gegevens, nu = Date.now()): ExportBestand {
  return { soort: EXPORT_SOORT, versie: VERSIE, gemaakt: nu, eigenOefeningen: g.eigen, trainingen: g.trainingen, favorieten: g.favorieten };
}

/** Bestandsnaam met de datum, bv. toptraining-2026-10-16.json. */
export function exportNaam(nu = new Date()): string {
  const d = (n: number) => String(n).padStart(2, '0');
  return `toptraining-${nu.getFullYear()}-${d(nu.getMonth() + 1)}-${d(nu.getDate())}.json`;
}

function geldigeTraining(x: unknown): x is Training {
  if (!x || typeof x !== 'object') return false;
  const t = x as Partial<Training>;
  const getal = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= MAX_AANTAL;
  return (
    typeof t.id === 'string' &&
    !!t.id &&
    typeof t.naam === 'string' &&
    (t.datum === undefined || (typeof t.datum === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.datum))) &&
    getal(t.spelers) &&
    getal(t.keepers) &&
    Array.isArray(t.oefeningen) &&
    t.oefeningen.every((o) => typeof o === 'string')
  );
}

/** Een geëxporteerd bestand lezen; `null` als het geen (geldig) TopTraining-bestand is. Kapotte onderdelen worden overgeslagen. */
export function leesExport(tekst: string): ExportBestand | null {
  let x: Partial<ExportBestand>;
  try {
    x = JSON.parse(tekst) as Partial<ExportBestand>;
  } catch {
    return null;
  }
  if (!x || typeof x !== 'object' || x.soort !== EXPORT_SOORT || typeof x.versie !== 'number' || x.versie > VERSIE) return null;
  const nu = Date.now();
  return {
    soort: EXPORT_SOORT,
    versie: x.versie,
    gemaakt: typeof x.gemaakt === 'number' ? x.gemaakt : 0,
    eigenOefeningen: (Array.isArray(x.eigenOefeningen) ? x.eigenOefeningen : [])
      .filter(geldigeEigen)
      .map((o) => ({ ...o, eigen: true as const, gemaakt: typeof o.gemaakt === 'number' ? o.gemaakt : nu, gewijzigd: typeof o.gewijzigd === 'number' ? o.gewijzigd : nu })),
    trainingen: (Array.isArray(x.trainingen) ? x.trainingen : []).filter(geldigeTraining).map((t) => ({
      ...t,
      oefeningen: [...t.oefeningen],
      gemaakt: typeof t.gemaakt === 'number' ? t.gemaakt : nu,
      gewijzigd: typeof t.gewijzigd === 'number' ? t.gewijzigd : nu,
    })),
    favorieten: (Array.isArray(x.favorieten) ? x.favorieten : []).filter((f): f is string => typeof f === 'string'),
  };
}

const trainingInhoud = (t: Training) => JSON.stringify({ n: t.naam.trim(), d: t.datum ?? '', s: t.spelers, k: t.keepers, o: t.oefeningen });

export interface Samengevoegd {
  /** Erbij gekomen (al met hun definitieve id). */
  eigen: EigenOefening[];
  trainingen: Training[];
  favorieten: string[];
  /** Overgeslagen omdat ze er al precies zo stonden. */
  overgeslagen: number;
}

/** Wat er uit een bestand bij de huidige gegevens komt (zonder iets te overschrijven of dubbel te maken). */
export function voegSamen(lokaal: Gegevens, bestand: ExportBestand, nieuweId: () => string = maakId): Samengevoegd {
  let overgeslagen = 0;
  const ids = new Map<string, string>();
  const eigen: EigenOefening[] = [];
  const alleEigen = [...lokaal.eigen];
  for (const o of bestand.eigenOefeningen) {
    // Dezelfde inhoud (ook met een andere id): niet nog eens.
    const zelfde = alleEigen.find((x) => zelfdeInhoud({ ...x, id: '' }, { ...o, id: '' }));
    if (zelfde) {
      ids.set(o.id, zelfde.id);
      overgeslagen++;
      continue;
    }
    const id = alleEigen.some((x) => x.id === o.id) ? EIGEN_VOORVOEGSEL + nieuweId() : o.id;
    const nieuw: EigenOefening = { ...o, id };
    ids.set(o.id, id);
    eigen.push(nieuw);
    alleEigen.push(nieuw);
  }

  const trainingen: Training[] = [];
  const alleTrainingen = [...lokaal.trainingen];
  for (const t of bestand.trainingen) {
    const oefeningen = t.oefeningen.map((id) => (isEigenId(id) ? (ids.get(id) ?? id) : id));
    const kandidaat: Training = { ...t, oefeningen };
    if (alleTrainingen.some((x) => trainingInhoud(x) === trainingInhoud(kandidaat))) {
      overgeslagen++;
      continue;
    }
    const nieuw = { ...kandidaat, id: alleTrainingen.some((x) => x.id === t.id) ? nieuweId() : t.id };
    trainingen.push(nieuw);
    alleTrainingen.push(nieuw);
  }

  const al = new Set(lokaal.favorieten);
  const favorieten = [...new Set(bestand.favorieten.map((id) => (isEigenId(id) ? (ids.get(id) ?? id) : id)))].filter((id) => !al.has(id));
  return { eigen, trainingen, favorieten, overgeslagen };
}
