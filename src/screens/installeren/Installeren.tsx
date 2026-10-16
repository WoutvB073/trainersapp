import { useMemo, useState } from 'react';
import { omgeving } from '../../engine/platform';
import { useInstallatie, vraagInstallatie } from '../../engine/installeren';
import { Icoon } from '../../components/Icoon';
import { APP_NAAM } from '../../config';
import { kiesUitleg, kiesUitlegComputer, type Stap } from './stappen';

const link = () => location.href.split('#')[0]!;

async function kopieer(tekst: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(tekst);
    return true;
  } catch {
    return false;
  }
}

/**
 * Installatiescherm. Telefoon/tablet in een gewone browser: alleen dit scherm.
 * Computer: dit scherm met daaronder "Gewoon in de browser gebruiken" (`opBrowserGekozen`).
 */
export function Installeren({ computer = false, opBrowserGekozen }: { computer?: boolean; opBrowserGekozen?: () => void }) {
  const uitleg = useMemo(() => (computer ? kiesUitlegComputer(omgeving) : kiesUitleg(omgeving)), [computer]);
  const installatie = useInstallatie();
  const [gelukt, setGelukt] = useState(false);
  const [gekopieerd, setGekopieerd] = useState<boolean | null>(null);

  const installeer = async () => {
    if (await vraagInstallatie()) setGelukt(true);
  };

  if (gelukt || installatie.geinstalleerd) {
    return (
      <div className="poort">
        <header className="poort-kop">
          <div className="poort-gelukt">
            <Icoon naam="vink" maat={44} />
          </div>
          <h1 className="poort-titel">Gelukt!</h1>
          <p className="poort-lead">
            {computer ? (
              <>{APP_NAAM} staat nu als app op je computer.</>
            ) : (
              <>
                Open de app nu via het icoon <strong>{APP_NAAM}</strong> op je startscherm.
              </>
            )}
          </p>
        </header>
      </div>
    );
  }

  const knop = !!uitleg.installeerKnop && installatie.kanVragen;

  return (
    <div className={`poort${uitleg.pijl && !knop ? ` poort-pijl-${uitleg.pijl}` : ''}`}>
      <header className="poort-kop">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="poort-logo" width={72} height={72} />
        <h1 className="poort-titel">{APP_NAAM}</h1>
        <p className="poort-lead">Voetbaloefeningen voor spelers en keepers, met bewegende uitleg.</p>
      </header>

      <section className="poort-kaart" aria-labelledby="poort-stappen">
        <h2 id="poort-stappen" className="poort-kaart-titel">
          {knop ? 'Installeer de app' : uitleg.titel}
        </h2>

        {knop ? (
          <>
            <button className="poort-knop" onClick={installeer}>
              <Icoon naam="download" />
              Installeren
            </button>
            <details className="poort-zelf">
              <summary>Lukt het niet? Zo doe je het zelf</summary>
              <Stappen stappen={uitleg.stappen} />
            </details>
          </>
        ) : (
          <>
            {uitleg.intro && <p className="poort-intro">{uitleg.intro}</p>}
            {uitleg.stappen.length > 0 && <Stappen stappen={uitleg.stappen} />}
          </>
        )}

        {uitleg.kopieerLink && (
          <div className="poort-kopieer">
            <button
              className={`poort-knop${uitleg.stappen.length ? ' poort-knop-tweede' : ''}`}
              onClick={async () => setGekopieerd(await kopieer(link()))}
            >
              <Icoon naam="kopieer" />
              {gekopieerd ? 'Link gekopieerd' : 'Kopieer link'}
            </button>
            {gekopieerd === false && (
              <input className="poort-link" readOnly value={link()} aria-label="Link naar deze pagina" onFocus={(e) => e.currentTarget.select()} />
            )}
          </div>
        )}
        {uitleg.tip && <p className="poort-tip">{uitleg.tip}</p>}
      </section>

      {computer ? (
        <div className="poort-browser">
          <button className="poort-knop poort-knop-tweede" onClick={opBrowserGekozen}>
            <Icoon naam="browser" />
            Gewoon in de browser gebruiken
          </button>
          <p className="poort-voet">Deze keuze wordt onthouden. Installeren kan later altijd nog via het startscherm.</p>
        </div>
      ) : (
        <p className="poort-voet">Heb je {APP_NAAM} al op je beginscherm? Open hem dan via het icoon.</p>
      )}

      {uitleg.pijl && !knop && (
        <div className={`poort-pijl poort-pijl--${uitleg.pijl}`} aria-hidden="true">
          <div className="poort-pijl-binnen">
            <span className="poort-pijl-label">Begin hier</span>
            <svg viewBox="0 0 24 24" width="34" height="34">
              <path d="M12 3v17M5 13l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

function Stappen({ stappen }: { stappen: Stap[] }) {
  return (
    <ol className="poort-stappen">
      {stappen.map((s, i) => (
        <li key={i} className="poort-stap">
          <span className="poort-stap-nr">{i + 1}</span>
          <span className="poort-stap-icoon">
            <Icoon naam={s.icoon} maat={24} />
          </span>
          <span className="poort-stap-tekst">{s.tekst}</span>
        </li>
      ))}
    </ol>
  );
}
