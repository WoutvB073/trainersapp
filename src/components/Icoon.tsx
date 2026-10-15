const PADEN = {
  terug: 'M15 5l-7 7 7 7',
  verder: 'M9 5l7 7-7 7',
  afspelen: 'M8 5.5v13l11-6.5z',
  pauze: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  opnieuw: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5',
  herhalen: 'M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4',
  spelers:
    'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.4c2.1.7 3.5 2.7 3.5 5.6',
  keeper:
    'M7 21v-6.5L4.6 11a1.6 1.6 0 0 1 2.6-1.9L9 11.4V5a1.5 1.5 0 0 1 3 0v5V3.8a1.5 1.5 0 0 1 3 0V10V5a1.5 1.5 0 0 1 3 0v6.5c0 2.2-.6 3.6-2 5V21z',
  vink: 'M5 12.5l4.5 4.5L19 7.5',
  materiaal: 'M12 3l7.5 16h-15zM8 13h8',
  makkelijker: 'M12 5v14M5 12l7 7 7-7',
  moeilijker: 'M12 19V5M5 12l7-7 7 7',
} as const;

export type IcoonNaam = keyof typeof PADEN;

export function Icoon({ naam, maat = 22, className }: { naam: IcoonNaam; maat?: number; className?: string }) {
  const vol = naam === 'afspelen' || naam === 'pauze';
  return (
    <svg
      className={className}
      width={maat}
      height={maat}
      viewBox="0 0 24 24"
      fill={vol ? 'currentColor' : 'none'}
      stroke={vol ? 'none' : 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PADEN[naam]} />
    </svg>
  );
}
