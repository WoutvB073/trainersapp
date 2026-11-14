import type { Soort } from '../model/types';

/**
 * Lijniconen per categorie voor de nieuwe ontwerprichtingen (fase 1 van de volgende stap): eigen tekeningen op een raster van 24 × 24,
 * in dezelfde stijl als `Icoon` (lijn 1,8, ronde hoeken). Geen iconen van derden, dus geen licentie nodig. In het huidige ontwerp zijn ze
 * verborgen en staat het getekende plaatje (`CategoriePlaatje`) er.
 */
const rond = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;

const KLOK = `${rond(12, 14, 7)}M12 10.5V14l2.4 1.4M9.5 3.5h5M12 3.5V7`;
const STER = 'M12 3.6l2.6 5.2 5.8.9-4.2 4.1 1 5.7-5.2-2.7-5.2 2.7 1-5.7-4.2-4.1 5.8-.9z';
const DUEL = `${rond(7, 7.5, 2)}${rond(17, 7.5, 2)}M4 20v-3.5a3 3 0 0 1 6 0V20M14 20v-3.5a3 3 0 0 1 6 0V20M10.6 12h2.8`;
const VELD = 'M4 5h16v14H4zM12 5v14M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4 9h2.5v6H4M20 9h-2.5v6H20';

const PADEN: Record<Soort, Record<string, string>> = {
  veld: {
    'warming-up': KLOK,
    techniek: `M3 16c1.5-3.2 3-3.2 4.5 0s3 3.2 4.5 0${rond(17.5, 12, 3.5)}`,
    loopcoordinatie: 'M7.5 3v18M16.5 3v18M7.5 7h9M7.5 12h9M7.5 17h9',
    'pass-en-trap': `${rond(5.5, 17.5, 2)}${rond(19, 6.5, 1.6)}M8.2 15.6l7.6-5.9M12.4 9.3l3.6.2-.9 3.5`,
    afwerken: `M3.5 18.5v-11h17v11M3.5 11.5h17M9.2 7.5v4M14.8 7.5v4${rond(12, 15.8, 1.8)}`,
    positiespel: `${rond(12, 5.5, 1.9)}${rond(5, 17.5, 1.9)}${rond(19, 17.5, 1.9)}M10.9 7.3L6.2 15.7M13.1 7.3l4.7 8.4M7.2 17.5h9.6`,
    'verdedigen-omschakelen': 'M12 3.2l7 2.8v5.2c0 4.4-2.9 7.9-7 9.6-4.1-1.7-7-5.2-7-9.6V6zM9 12l2.2 2.2 4-4.2',
    'een-tegen-een': DUEL,
    partijvormen: VELD,
    spelletjes: STER,
  },
  keeper: {
    'warming-up': KLOK,
    'laag-duiken': 'M3 19.5h18M6 8.5l9 7M15 15.5l-4.3-.2M15 15.5l-1.1-4.1',
    'hoog-duiken': 'M20 20V5H6M5 18.5l9-9M14 9.5l-4.3.3M14 9.5l-.3 4.3',
    'bal-verwerken': `${rond(12, 9, 3.2)}M5 12.5c0 4.4 3 7.5 7 7.5s7-3.1 7-7.5`,
    voorzetten: `M3.5 18.5c1.8-8.5 5-12 8.5-12s5.8 2.6 7.6 7.6${rond(20.2, 16.6, 1.5)}`,
    passing: 'M4 12h14M14 7.5l4.5 4.5-4.5 4.5',
    'een-op-een': DUEL,
    reactie: 'M13 2.8L5.6 13.4H11l-1 7.8 7.4-10.8H12z',
    spelletjes: STER,
  },
};

export function CategorieIcoon({ soort, categorie, maat = 26 }: { soort: Soort; categorie: string; maat?: number }) {
  const d = PADEN[soort]?.[categorie] ?? rond(12, 12, 7);
  return (
    <span className="cat-icoon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width={maat} height={maat} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </span>
  );
}

/** Heeft elke categorie een eigen icoon? (getest) */
export const heeftCategorieIcoon = (soort: Soort, categorie: string) => !!PADEN[soort]?.[categorie];
