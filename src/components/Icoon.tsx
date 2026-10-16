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
  deel: 'M8.5 9.5H6.5v10.5h11V9.5h-2M12 3v12M8.5 6.5L12 3l3.5 3.5',
  plusVierkant: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM12 8.5v7M8.5 12h7',
  meer: 'M5.5 12h.01M12 12h.01M18.5 12h.01',
  puntjes: 'M12 5.5v.01M12 12v.01M12 18.5v.01',
  kompas: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z',
  kopieer: 'M9 9h11v11H9zM5 15H4V4h11v1',
  download: 'M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14',
  huis: 'M4 11l8-7 8 7M6.5 9.5V20h11V9.5',
  schakelaar: 'M7.5 7h9a5 5 0 0 1 0 10h-9a5 5 0 0 1 0-10zM16.5 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  computer: 'M3 4h18v12H3zM8 20h8M12 16v4M12 7v5.5M9.5 10L12 12.5l2.5-2.5',
  browser: 'M3 5h18v14H3zM3 9h18M6 7h.01M8.5 7h.01',
  plus: 'M12 5v14M5 12h14',
  combi: 'M3.5 8.5h5v7h-5zM15.5 8.5h5v7h-5zM8.5 12h7M12.5 9.5L15 12l-2.5 2.5',
  min: 'M5 12h14',
  kruis: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  prullenbak: 'M4.5 7h15M10 11v6M14 11v6M6.5 7l1 13h9l1-13M9.5 7V4.5h5V7',
  training: 'M9 3.5h6v3H9zM7 5H5v16h14V5h-2M8.5 11h7M8.5 15h7',
  link: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1',
  kalender: 'M4 6h16v14H4zM4 10h16M8.5 3.5v4M15.5 3.5v4',
  potlood: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  instellingen: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM19.4 13.5l1.6 1.2-1.8 3.1-1.9-.7a7 7 0 0 1-1.6.9L15.4 20h-3.6l-.3-2a7 7 0 0 1-1.6-.9l-1.9.7-1.8-3.1 1.6-1.2a7 7 0 0 1 0-1.9L6.2 10.4 8 7.3l1.9.7a7 7 0 0 1 1.6-.9l.3-2h3.6l.3 2a7 7 0 0 1 1.6.9l1.9-.7 1.8 3.1-1.6 1.2a7 7 0 0 1 0 1.9z',
  hart: 'M12 20.3s-7.5-4.6-9-9.4C2 7.6 4.2 4.6 7.4 4.6c2 0 3.6 1.1 4.6 2.7 1-1.6 2.6-2.7 4.6-2.7 3.2 0 5.4 3 4.4 6.3-1.5 4.8-9 9.4-9 9.4z',
  zoek: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.3 15.3L20 20',
  filter: 'M4 6h16M7 12h10M10 18h4',
  zon: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',
  maan: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z',
  ongedaan: 'M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
  herdoen: 'M15 14l5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
  draai: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5',
  wijzer: 'M6 3.5l12 7.2-5.3 1.5-2.6 5.3z',
  ster: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5.5M12 7.5h.01',
  kubus: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9',
  lijnBal: 'M4 18L18 6M18 6h-5M18 6v5',
  lijnLoop: 'M4 18l2.5-2.1M9 13.8l2.5-2.1M14 9.6l4-3.6M18 6h-5M18 6v5',
  lijnDribbel: 'M4 18c1.5-3 3.5 0 5-3s3.5 0 5-3 2.5-2 4-6M18 6h-4.5M18 6v4.5',

} as const;

/** Stippen hebben een dikkere lijn nodig om zichtbaar te zijn. */
const DIK: readonly string[] = ['meer', 'puntjes', 'grip'];

export type IcoonNaam = keyof typeof PADEN;

/** `gevuld`: vlak in plaats van een lijn (bv. een rood hartje bij een favoriet). */
export function Icoon({ naam, maat = 22, className, gevuld }: { naam: IcoonNaam; maat?: number; className?: string; gevuld?: boolean }) {
  const vol = gevuld ?? (naam === 'afspelen' || naam === 'pauze');
  return (
    <svg
      className={className}
      width={maat}
      height={maat}
      viewBox="0 0 24 24"
      fill={vol ? 'currentColor' : 'none'}
      stroke={vol ? 'none' : 'currentColor'}
      strokeWidth={DIK.includes(naam) ? 3.4 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PADEN[naam]} />
    </svg>
  );
}
