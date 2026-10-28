import { useId, type ReactNode } from 'react';
import type { Soort } from '../model/types';

/**
 * Kleine pictogrammen per categorie (0.26.0), in de stijl van de tegelplaatjes: wit krijt op een gestreept grasveld,
 * spelers als stippen in de teamkleuren. Alleen vaste veldkleuren, zodat ze in elk thema werken.
 */

const W = '#fff';
const A = 'var(--team-a)';
const B = 'var(--team-b)';
const K = 'var(--keeper)';
const DONKER = '#14231a';

const Stip = ({ x, y, k = A }: { x: number; y: number; k?: string }) => <circle cx={x} cy={y} r="4.2" fill={k} stroke={W} strokeWidth="1.4" />;
const Bal = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r="2.6" fill={W} stroke={DONKER} strokeWidth="1" />;
const Pion = ({ x, y }: { x: number; y: number }) => <path d={`M${x} ${y - 4.5} L${x + 3.2} ${y + 2} H${x - 3.2} Z`} fill="#ff7a1a" stroke={DONKER} strokeWidth="0.8" />;
/** Lijn met een pijlpunt aan het eind. `stippel` = looplijn. */
function Pijl({ d, stippel, golf }: { d: string; stippel?: boolean; golf?: boolean }) {
  return (
    <path d={d} fill="none" stroke={W} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={stippel ? '3 3' : golf ? undefined : undefined} markerEnd="url(#cat-pijl)" />
  );
}
const Goal = ({ x, y, b = 18 }: { x: number; y: number; b?: number }) => (
  <path d={`M${x - b / 2} ${y + 5} V${y} H${x + b / 2} V${y + 5}`} fill="none" stroke={W} strokeWidth="2" strokeLinejoin="round" />
);

const PLAATJES: Record<Soort, Record<string, ReactNode>> = {
  veld: {
    'warming-up': (
      <>
        <Pion x={12} y={34} />
        <Pion x={32} y={34} />
        <Pion x={52} y={34} />
        <Pijl d="M8 22 Q18 12 24 22 T40 22 T54 18" stippel />
        <Stip x={8} y={22} />
      </>
    ),
    techniek: (
      <>
        <path d="M32 24 m-12 0 a12 12 0 1 1 24 0" fill="none" stroke={W} strokeWidth="1.8" strokeDasharray="3 3" markerEnd="url(#cat-pijl)" />
        <Bal x={32} y={30} />
        <Stip x={22} y={33} />
      </>
    ),
    loopcoordinatie: (
      <>
        <path d="M14 12 V40 M26 12 V40 M14 15 H26 M14 22 H26 M14 29 H26 M14 36 H26" stroke={W} strokeWidth="1.8" />
        <Stip x={44} y={30} />
        <Pijl d="M44 24 V12" stippel />
      </>
    ),
    'pass-en-trap': (
      <>
        <Stip x={12} y={32} />
        <Stip x={52} y={16} />
        <Pijl d="M17 30 L46 18" />
        <Bal x={16} y={36} />
      </>
    ),
    afwerken: (
      <>
        <Goal x={32} y={7} b={26} />
        <Stip x={22} y={38} />
        <Pijl d="M25 34 L36 13" />
        <Bal x={26} y={41} />
      </>
    ),
    positiespel: (
      <>
        <rect x="10" y="8" width="44" height="32" fill="none" stroke={W} strokeWidth="1.4" strokeDasharray="2 2" />
        <Stip x={14} y={12} />
        <Stip x={50} y={12} />
        <Stip x={50} y={36} />
        <Stip x={14} y={36} />
        <Stip x={32} y={24} k={B} />
        <Pijl d="M18 12 H44" />
        <Pijl d="M50 16 V30" />
      </>
    ),
    'verdedigen-omschakelen': (
      <>
        <Stip x={22} y={30} k={B} />
        <Stip x={36} y={30} />
        <Bal x={30} y={33} />
        <Pijl d="M18 26 Q26 14 36 24" stippel />
        <path d="M44 22 Q54 22 54 12" fill="none" stroke={W} strokeWidth="1.8" markerEnd="url(#cat-pijl)" />
        <path d="M44 22 Q34 22 32 12" fill="none" stroke={W} strokeWidth="1.8" strokeDasharray="2 2" />
      </>
    ),
    partijvormen: (
      <>
        <Goal x={32} y={5} b={14} />
        <path d="M25 43 V38 H39 V43" fill="none" stroke={W} strokeWidth="2" />
        <Stip x={22} y={18} />
        <Stip x={42} y={22} />
        <Stip x={26} y={30} k={B} />
        <Stip x={44} y={33} k={B} />
        <Bal x={30} y={22} />
      </>
    ),
    spelletjes: (
      <>
        <path d="M32 6 l3.5 7.5 8 1 -6 5.5 1.6 8 -7.1 -4 -7.1 4 1.6 -8 -6 -5.5 8 -1 z" fill="#ffd23f" stroke={DONKER} strokeWidth="1" />
        <Stip x={16} y={36} />
        <Stip x={48} y={36} k={B} />
        <Bal x={32} y={38} />
      </>
    ),
  },
  keeper: {
    'warming-up': (
      <>
        <Pion x={14} y={36} />
        <Pion x={50} y={36} />
        <Pijl d="M14 26 H48" stippel />
        <Stip x={14} y={26} k={K} />
        <Bal x={32} y={14} />
      </>
    ),
    'laag-duiken': (
      <>
        <Goal x={32} y={6} b={40} />
        <path d="M24 30 L42 36" stroke={K} strokeWidth="6" strokeLinecap="round" />
        <Bal x={47} y={37} />
        <Pijl d="M32 46 L45 39" />
      </>
    ),
    'hoog-duiken': (
      <>
        <Goal x={32} y={6} b={40} />
        <path d="M30 30 L44 16" stroke={K} strokeWidth="6" strokeLinecap="round" />
        <Bal x={48} y={12} />
        <Pijl d="M26 40 Q34 24 44 16" stippel />
      </>
    ),
    'bal-verwerken': (
      <>
        <rect x="18" y="20" width="10" height="14" rx="4" fill={K} stroke={W} strokeWidth="1.4" />
        <rect x="36" y="20" width="10" height="14" rx="4" fill={K} stroke={W} strokeWidth="1.4" />
        <circle cx="32" cy="22" r="6" fill={W} stroke={DONKER} strokeWidth="1.2" />
        <Pijl d="M32 44 V32" />
      </>
    ),
    voorzetten: (
      <>
        <Goal x={22} y={6} b={24} />
        <Stip x={22} y={16} k={K} />
        <Stip x={54} y={40} />
        <Pijl d="M50 37 Q42 8 27 14" />
      </>
    ),
    passing: (
      <>
        <Goal x={12} y={6} b={16} />
        <Stip x={12} y={15} k={K} />
        <Pijl d="M16 17 Q34 2 52 30" />
        <Stip x={52} y={36} />
      </>
    ),
    'een-op-een': (
      <>
        <Goal x={32} y={5} b={24} />
        <Stip x={32} y={18} k={K} />
        <Stip x={32} y={38} />
        <Bal x={32} y={32} />
        <path d="M24 20 L18 23 M40 20 L46 23" stroke={W} strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
    reactie: (
      <>
        <path d="M36 4 L22 26 H31 L26 44 L44 18 H34 Z" fill="#ffd23f" stroke={DONKER} strokeWidth="1" />
        <Bal x={50} y={36} />
        <Stip x={14} y={34} k={K} />
      </>
    ),
    spelletjes: (
      <>
        <path d="M32 6 l3.5 7.5 8 1 -6 5.5 1.6 8 -7.1 -4 -7.1 4 1.6 -8 -6 -5.5 8 -1 z" fill="#ffd23f" stroke={DONKER} strokeWidth="1" />
        <Stip x={14} y={36} k={K} />
        <Stip x={50} y={36} k="var(--keeper-2)" />
        <Bal x={32} y={38} />
      </>
    ),
  },
};

/** Heeft deze categorie een eigen pictogram? (getest voor alle categorieën) */
export function heeftPlaatje(soort: Soort, id: string): boolean {
  return id in PLAATJES[soort];
}

export function CategoriePlaatje({ soort, id }: { soort: Soort; id: string }) {
  const clip = useId();
  const inhoud = PLAATJES[soort][id];
  if (!inhoud) return null;
  return (
    <svg className="cat-plaatje" viewBox="0 0 64 48" width="56" height="42" aria-hidden="true">
      <defs>
        <marker id="cat-pijl" viewBox="0 0 6 6" refX="4" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L6 3 L0 6 Z" fill={W} />
        </marker>
        <clipPath id={clip}>
          <rect width="64" height="48" rx="9" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="64" height="48" fill="var(--gras-1)" />
        {[8, 24, 40, 56].map((x) => (
          <rect key={x} x={x} width="8" height="48" fill="var(--gras-2)" />
        ))}
        {inhoud}
      </g>
    </svg>
  );
}
