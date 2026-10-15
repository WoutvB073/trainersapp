import { APP_NAAM, VERSIE } from '../config';
import { OEFENINGEN } from '../data/oefeningen';
import { meervoud } from '../components/Labels';
import { Icoon } from '../components/Icoon';
import { ga } from '../router';
import type { Soort } from '../model/types';

function VeldPlaatje() {
  return (
    <svg viewBox="0 0 120 80" className="tegel-plaatje" aria-hidden="true">
      <rect width="120" height="80" rx="10" fill="var(--gras-1)" />
      <g fill="none" stroke="#fff" strokeWidth="2" opacity="0.9">
        <rect x="8" y="8" width="104" height="64" />
        <line x1="60" y1="8" x2="60" y2="72" />
        <circle cx="60" cy="40" r="11" />
        <rect x="8" y="24" width="14" height="32" />
        <rect x="98" y="24" width="14" height="32" />
      </g>
      <circle cx="44" cy="52" r="6" fill="var(--team-a)" stroke="#fff" strokeWidth="1.5" />
      <circle cx="78" cy="30" r="6" fill="var(--team-b)" stroke="#fff" strokeWidth="1.5" />
      <path d="M49 48 L72 33" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

function KeeperPlaatje() {
  return (
    <svg viewBox="0 0 120 80" className="tegel-plaatje" aria-hidden="true">
      <rect width="120" height="80" rx="10" fill="var(--gras-1)" />
      <g fill="none" stroke="#fff" strokeWidth="2" opacity="0.9">
        <rect x="18" y="8" width="84" height="40" />
        <rect x="40" y="8" width="40" height="16" />
      </g>
      <rect x="44" y="4" width="32" height="5" rx="2" fill="#fff" />
      <rect x="37" y="15" width="22" height="11" rx="5.5" fill="var(--keeper)" stroke="#fff" strokeWidth="1.5" transform="rotate(-12 48 20)" />
      <circle cx="35" cy="17" r="3.5" fill="#fff" stroke="#1b1b1b" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="6" fill="var(--trainer)" stroke="#fff" strokeWidth="1.5" />
      <path d="M57 55 L38 20" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

function Tegel({ soort }: { soort: Soort }) {
  const aantal = OEFENINGEN.filter((o) => o.soort === soort).length;
  const pad = soort === 'veld' ? '/veld' : '/keepers';
  return (
    <a
      className="tegel"
      href={`#${pad}`}
      onClick={(e) => {
        e.preventDefault();
        ga(pad);
      }}
    >
      {soort === 'veld' ? <VeldPlaatje /> : <KeeperPlaatje />}
      <span className="tegel-tekst">
        <span className="tegel-titel">{soort === 'veld' ? 'Veld' : 'Keepers'}</span>
        <span className="tegel-sub">{meervoud(aantal, 'oefening', 'oefeningen')}</span>
      </span>
      <Icoon naam="verder" className="tegel-pijl" />
    </a>
  );
}

/** `opInstalleren`: alleen op de computer in de browser (terug naar de installatie-uitleg). */
export function Start({ opInstalleren }: { opInstalleren?: () => void }) {
  return (
    <div className="pagina pagina-start">
      <header className="start-kop">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="start-logo" width={56} height={56} />
        <div>
          <h1 className="start-titel">{APP_NAAM}</h1>
          <p className="start-sub">Oefeningen voor veld en keepers</p>
        </div>
      </header>
      <main className="inhoud">
        <h2 className="sectie-titel">Kies je oefenbibliotheek</h2>
        <div className="tegels">
          <Tegel soort="veld" />
          <Tegel soort="keeper" />
        </div>
        {opInstalleren && (
          <button className="link-knop" onClick={opInstalleren}>
            <Icoon naam="computer" maat={18} />
            {APP_NAAM} als app installeren
          </button>
        )}
        <p className="voetnoot">Versie {VERSIE}</p>
      </main>
    </div>
  );
}
