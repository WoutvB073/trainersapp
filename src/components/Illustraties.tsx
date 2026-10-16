import { useId } from 'react';

/**
 * Getekende illustraties voor de tegels op het startscherm, in de stijl van het logo: vlakke vormen met een donkere
 * rand op een gestreept grasveld. Alleen vaste veldkleuren (gras, teams, keeper), zodat ze in elk thema werken.
 */

const DONKER = '#14231a';
const HUID = '#f1c8a0';

function Gras({ id }: { id: string }) {
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect width="120" height="80" rx="10" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="120" height="80" fill="var(--gras-1)" />
        {[0, 20, 40, 60, 80, 100].map((x) => (
          <rect key={x} x={x} width="10" height="80" fill="var(--gras-2)" />
        ))}
      </g>
    </>
  );
}

/** Bal zoals in het logo (wit met een donkere vijfhoek en naden); de vormen komen precies uit public/logo.svg. */
export function Bal({ x, y, r }: { x: number; y: number; r: number }) {
  const k = r / 54;
  return (
    <g transform={`translate(${x - 256 * k} ${y - 392 * k}) scale(${k})`}>
      <circle cx="256" cy="392" r="54" fill="#fff" stroke={DONKER} strokeWidth="5.5" />
      <g fill={DONKER}>
        <polygon points="256.0,372.6 274.5,386.0 267.4,407.7 244.6,407.7 237.5,386.0" />
        <polygon points="246.5,351.0 265.5,351.0 266.0,340.6 246.0,340.6" />
        <polygon points="292.1,370.3 298.0,388.3 308.0,385.6 301.8,366.6" />
        <polygon points="287.8,419.6 272.5,430.8 278.1,439.5 294.3,427.7" />
        <polygon points="239.5,430.8 224.2,419.6 217.7,427.7 233.9,439.5" />
        <polygon points="214.0,388.3 219.9,370.3 210.2,366.6 204.0,385.6" />
      </g>
      <g stroke={DONKER} strokeWidth="3.8">
        <line x1="256.0" y1="372.6" x2="256.0" y2="349.9" />
        <line x1="274.5" y1="386.0" x2="296.1" y2="379.0" />
        <line x1="267.4" y1="407.7" x2="280.8" y2="426.1" />
        <line x1="244.6" y1="407.7" x2="231.2" y2="426.1" />
        <line x1="237.5" y1="386.0" x2="215.9" y2="379.0" />
      </g>
    </g>
  );
}

/** Een rennend spelertje; voeten op (0, 0), ± 44 hoog. `trap`: rechterbeen naar voren (schieten). */
function Speler({ x, y, schaal = 1, kleur, spiegel = false, trap = false }: { x: number; y: number; schaal?: number; kleur: string; spiegel?: boolean; trap?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${spiegel ? -schaal : schaal} ${schaal})`} strokeLinecap="round" strokeLinejoin="round">
      {/* benen */}
      <path d={trap ? 'M2.5 -9 L11 -3' : 'M2.5 -9 L7 -1'} stroke={HUID} strokeWidth="3.6" fill="none" />
      <path d="M-2.5 -9 L-6 -1" stroke={HUID} strokeWidth="3.6" fill="none" />
      <path d={trap ? 'M7.4 -5.4 L11 -3' : 'M5.3 -4.4 L7 -1'} stroke={kleur} strokeWidth="3.8" fill="none" />
      <path d="M-4.6 -4 L-6 -1" stroke={kleur} strokeWidth="3.8" fill="none" />
      <ellipse cx={trap ? 12.6 : 8.4} cy={trap ? -2.6 : -0.4} rx="3" ry="1.7" fill={DONKER} transform={trap ? 'rotate(30 12.6 -2.6)' : undefined} />
      <ellipse cx="-6.8" cy="-0.3" rx="3" ry="1.7" fill={DONKER} />
      {/* broek */}
      <path d="M-6.4 -16 H6.4 L7 -9.2 H1.2 L0 -11.6 L-1.2 -9.2 H-7 Z" fill="#fff" stroke={DONKER} strokeWidth="1.1" />
      {/* armen */}
      <path d="M-6 -28 L-11.5 -21.5" stroke={kleur} strokeWidth="3.6" fill="none" />
      <path d="M6 -28 L12 -24" stroke={kleur} strokeWidth="3.6" fill="none" />
      <circle cx="-11.8" cy="-21" r="1.8" fill={HUID} />
      <circle cx="12.6" cy="-23.6" r="1.8" fill={HUID} />
      {/* shirt */}
      <path d="M-7 -30.5 Q0 -32.5 7 -30.5 L6.3 -15.5 H-6.3 Z" fill={kleur} stroke={DONKER} strokeWidth="1.1" />
      <path d="M-2.4 -31.6 Q0 -29 2.4 -31.6" fill="none" stroke="#fff" strokeWidth="1" />
      {/* hoofd */}
      <circle cx="0" cy="-37.5" r="5.6" fill={HUID} stroke={DONKER} strokeWidth="1.1" />
      <path d="M-5.4 -38.6 Q-5 -43.6 0 -43.4 Q5.2 -43.4 5.5 -38.4 Q2.5 -40.6 -1 -40 Q-3.8 -39.6 -5.4 -38.6 Z" fill={DONKER} />
    </g>
  );
}

/** Tegel Spelers: twee spelertjes en een bal. */
export function SpelersPlaatje({ className = 'tegel-plaatje' }: { className?: string }) {
  const id = `gras-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      <Gras id={id} />
      <ellipse cx="42" cy="71" rx="12" ry="2.6" fill={DONKER} opacity="0.22" />
      <ellipse cx="88" cy="66" rx="9" ry="2" fill={DONKER} opacity="0.22" />
      <Speler x={42} y={70} schaal={1.32} kleur="var(--team-a)" trap />
      <Speler x={88} y={65} schaal={1.05} kleur="var(--team-b)" spiegel />
      <g stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
        <path d="M57.5 51.5 h-5" />
        <path d="M57 56.5 h-4.5" />
      </g>
      <Bal x={66} y={58} r={7.5} />
    </svg>
  );
}

/** Eén keepershandschoen met de handpalm naar voren; pols op (0, 0), vingers omhoog. */
function Handschoen({ x, y, hoek, spiegel = false }: { x: number; y: number; hoek: number; spiegel?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${hoek}) scale(${spiegel ? -1 : 1} 1)`} strokeLinejoin="round">
      {/* duim */}
      <rect x="-21.5" y="-37" width="8" height="22" rx="4" transform="rotate(-24 -17.5 -20)" fill="var(--keeper)" stroke={DONKER} strokeWidth="1.3" />
      {/* vingers */}
      {[
        [-12.5, -46, 18],
        [-5.6, -50, 22],
        [1.4, -48.5, 20.5],
        [8.2, -42.5, 15],
      ].map(([fx, fy, h]) => (
        <rect key={fx} x={fx} y={fy} width="6.6" height={h! + 10} rx="3.3" fill="var(--keeper)" stroke={DONKER} strokeWidth="1.3" />
      ))}
      {/* handpalm */}
      <path d="M-13.5 -30 H15 Q16 -16 13 -6 H-12 Q-15 -16 -13.5 -30 Z" fill="var(--keeper)" stroke={DONKER} strokeWidth="1.3" />
      <path d="M-9.5 -26 H11 Q11.6 -16 9.4 -9.5 H-8.6 Q-10.6 -16 -9.5 -26 Z" fill="#e8f7f9" />
      <g stroke="var(--keeper-3)" strokeWidth="1.1" strokeLinecap="round">
        <path d="M-6 -22 H7.5M-6.4 -17.5 H8M-5.8 -13 H7" />
      </g>
      {/* manchet met klittenband */}
      <rect x="-12.5" y="-7.5" width="25" height="10.5" rx="2.5" fill="var(--keeper-2)" stroke={DONKER} strokeWidth="1.3" />
      <rect x="-9" y="-5" width="18" height="5.5" rx="1.5" fill="#fff" />
    </g>
  );
}

/** Tegel Keepers: twee keepershandschoenen die een bal vangen, voor een doelnet. */
export function KeepersPlaatje({ className = 'tegel-plaatje' }: { className?: string }) {
  const id = `gras-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      <Gras id={id} />
      <g stroke="#fff" opacity="0.35" strokeWidth="0.8">
        {[14, 24, 34, 44, 54, 64, 74, 84, 94, 104].map((x) => (
          <line key={x} x1={x} y1="6" x2={x} y2="44" />
        ))}
        {[14, 22, 30, 38].map((y) => (
          <line key={y} x1="8" y1={y} x2="112" y2={y} />
        ))}
      </g>
      <path d="M8 46 V6 H112 V46" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <Handschoen x={40} y={76} hoek={-14} spiegel />
      <Handschoen x={80} y={76} hoek={14} />
      <Bal x={60} y={33} r={12.5} />
    </svg>
  );
}

/** Tegel Wedstrijd: tactiekbord met twee teams, een looplijn en een pass. */
export function WedstrijdPlaatje({ className = 'tegel-plaatje' }: { className?: string }) {
  const id = `gras-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const rood = (x: number, y: number) => <circle cx={x} cy={y} r="5" fill="var(--team-a)" stroke="#fff" strokeWidth="1.4" />;
  const blauw = (x: number, y: number) => <circle cx={x} cy={y} r="5" fill="var(--team-b)" stroke="#fff" strokeWidth="1.4" />;
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      <Gras id={id} />
      <g fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.85">
        <rect x="8" y="6" width="104" height="68" rx="1" />
        <line x1="60" y1="6" x2="60" y2="74" />
        <circle cx="60" cy="40" r="9" />
        <rect x="8" y="24" width="12" height="32" />
        <rect x="100" y="24" width="12" height="32" />
      </g>
      <path d="M38 56 Q 52 66 70 58" fill="none" stroke="#fff" strokeWidth="1.8" strokeDasharray="3 2.5" strokeLinecap="round" />
      <path d="M70 58 l-5 -3.6 M70 58 l-5.6 2.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M30 34 L 66 22" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M66 22 l-6.2 -0.6 M66 22 l-4.4 4.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      {rood(26, 36)}
      {rood(36, 54)}
      {rood(72, 22)}
      {blauw(82, 40)}
      {blauw(88, 26)}
      {blauw(86, 56)}
      <Bal x={31} y={33} r={2.6} />
    </svg>
  );
}
