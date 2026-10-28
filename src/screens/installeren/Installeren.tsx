import { useEffect, useMemo, useState } from 'react';
import { omgeving, zetGeinstalleerd } from '../../engine/platform';
import { useInstallatie, vraagInstallatie } from '../../engine/installeren';
import { Icoon } from '../../components/Icoon';
import { APP_NAAM } from '../../config';
import { alternatieven, HANDMATIG, sleutelVoor, uitlegVoor, type Sleutel, type Stap, type Uitleg } from './stappen';
import { t } from '../../i18n/t';
import { zin } from '../../i18n/zin';

const link = () => location.href.split('#')[0]!;

/** Android: deze pagina direct in Chrome openen (intent-link; zonder # want dat gebruikt de intent zelf). */
export function chromeLink(adres: string): string {
  const u = new URL(adres);
  return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(adres)};end`;
}

async function kopieer(tekst: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(tekst);
    return true;
  } catch {
    return false;
  }
}

/**
 * Installatiescherm (telefoon, tablet en computer), 0.29.1:
 * - stappen voor dit toestel en deze browser, met "Lukt het niet?" (andere mogelijke stappen) en
 *   "Andere browser of telefoon" (zelf kiezen);
 * - altijd "Gewoon in de browser gebruiken" (`opBrowserGekozen`, keuze wordt onthouden);
 * - `alGeinstalleerd`: "Je hebt de app al" met "Toch in de browser gebruiken".
 */
export function Installeren({ computer = false, alGeinstalleerd = false, opBrowserGekozen }: { computer?: boolean; alGeinstalleerd?: boolean; opBrowserGekozen: () => void }) {
  const eigen = useMemo(() => sleutelVoor(omgeving, computer), [computer]);
  const [sleutel, setSleutel] = useState<Sleutel>(eigen);
  const [opnieuw, setOpnieuw] = useState(false);
  const [lukt, setLukt] = useState(false);
  const [kiezen, setKiezen] = useState(false);
  const installatie = useInstallatie();
  const [gelukt, setGelukt] = useState(false);
  const klaar = gelukt || installatie.geinstalleerd;

  useEffect(() => {
    if (klaar) zetGeinstalleerd(true);
  }, [klaar]);

  if (alGeinstalleerd && !opnieuw && !klaar) {
    return (
      <div className="poort">
        <Kop />
        <section className="poort-kaart" aria-labelledby="poort-stappen">
          <h2 id="poort-stappen" className="poort-kaart-titel">
            {t('Je hebt de app al')}
          </h2>
          <p className="poort-intro">{zin('Open {app} vanaf je beginscherm (of vanuit je lijst met apps).')}</p>
          <button className="poort-knop poort-knop-tweede" onClick={() => setOpnieuw(true)}>
            <Icoon naam="download" />
            {t('Opnieuw installeren')}
          </button>
        </section>
        <BrowserKnop opBrowserGekozen={opBrowserGekozen} tekst={t('Toch in de browser gebruiken')} />
      </div>
    );
  }

  if (klaar) {
    return (
      <div className="poort">
        <header className="poort-kop">
          <div className="poort-gelukt">
            <Icoon naam="vink" maat={44} />
          </div>
          <h1 className="poort-titel">{t('Gelukt!')}</h1>
          <p className="poort-lead">
            {computer ? t('{app} staat nu als app op je computer. Hij opent vanzelf in een eigen venster.', { app: APP_NAAM }) : zin('Open de app nu via het icoon **{app}** op je startscherm.')}
          </p>
        </header>
        <BrowserKnop opBrowserGekozen={opBrowserGekozen} tekst={t('Verder in de browser')} />
      </div>
    );
  }

  const zelf = sleutel === eigen;
  const uitleg = uitlegVoor(sleutel, omgeving);
  const knop = zelf && !!uitleg.installeerKnop && installatie.kanVragen;
  const pijl = zelf && !knop ? uitleg.pijl : undefined;
  const anders = alternatieven(sleutel, omgeving);

  const installeer = async () => {
    if (await vraagInstallatie()) setGelukt(true);
  };

  return (
    <div className={`poort${pijl ? ` poort-pijl-${pijl}` : ''}`}>
      <Kop />

      <section className="poort-kaart" aria-labelledby="poort-stappen">
        <h2 id="poort-stappen" className="poort-kaart-titel">
          {knop ? t('Installeer de app') : uitleg.titel}
        </h2>
        {!zelf && <p className="poort-gekozen">{t('Stappen voor: {naam}', { naam: naamVan(sleutel) })}</p>}

        {knop ? (
          <>
            <button className="poort-knop" onClick={installeer}>
              <Icoon naam="download" />
              {t('Installeren')}
            </button>
            <details className="poort-zelf">
              <summary>{t('Zo doe je het zelf')}</summary>
              <Stappen stappen={uitleg.stappen} />
            </details>
          </>
        ) : (
          <UitlegInhoud uitleg={uitleg} />
        )}
        <Knoppen uitleg={uitleg} android={omgeving.os === 'android'} />
        {uitleg.tip && <p className="poort-tip">{uitleg.tip}</p>}
      </section>

      <div className="poort-hulp">
        <button className={`poort-hulp-knop${lukt ? ' is-open' : ''}`} aria-expanded={lukt} onClick={() => setLukt(!lukt)}>
          <Icoon naam="vraag" maat={18} />
          {t('Lukt het niet?')}
        </button>
        <button className={`poort-hulp-knop${kiezen ? ' is-open' : ''}`} aria-expanded={kiezen} onClick={() => setKiezen(!kiezen)}>
          <Icoon naam="wissel" maat={18} />
          {t('Andere browser of telefoon')}
        </button>
      </div>

      {lukt && (
        <section className="poort-kaart poort-anders" aria-label={t('Lukt het niet?')}>
          {anders.map((a, i) => (
            <div key={i} className="poort-alternatief">
              <h3 className="poort-alternatief-titel">{a.titel}</h3>
              <UitlegInhoud uitleg={a} />
              {a !== uitleg && <Knoppen uitleg={a} android={omgeving.os === 'android'} />}
            </div>
          ))}
          <div className="poort-alternatief">
            <h3 className="poort-alternatief-titel">{t('Nog steeds niet?')}</h3>
            <p className="poort-intro">{zin('Kies hieronder zelf je browser of telefoon, of gebruik {app} **gewoon in de browser**: alles werkt dan ook, ook offline.')}</p>
          </div>
        </section>
      )}

      {kiezen && (
        <section className="poort-kaart poort-keuze" aria-label={t('Andere browser of telefoon')}>
          {HANDMATIG.map((g) => (
            <div key={g.groep} className="poort-keuze-groep">
              <h3 className="poort-alternatief-titel">{g.groep}</h3>
              <div className="poort-keuze-lijst">
                {g.keuzes.map((k) => (
                  <button
                    key={k.sleutel}
                    className={`poort-keuze-knop${k.sleutel === sleutel ? ' is-actief' : ''}`}
                    aria-pressed={k.sleutel === sleutel}
                    onClick={() => {
                      setSleutel(k.sleutel);
                      setKiezen(false);
                      setLukt(false);
                      window.scrollTo({ top: 0 });
                    }}
                  >
                    {k.naam}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {!zelf && (
            <button className="poort-knop poort-knop-tweede" onClick={() => setSleutel(eigen)}>
              {t('Terug naar mijn toestel')}
            </button>
          )}
        </section>
      )}

      <BrowserKnop opBrowserGekozen={opBrowserGekozen} tekst={t('Gewoon in de browser gebruiken')} />

      {pijl && (
        <div className={`poort-pijl poort-pijl--${pijl}`} aria-hidden="true">
          <div className="poort-pijl-binnen">
            <span className="poort-pijl-label">{t('Begin hier')}</span>
            <svg viewBox="0 0 24 24" width="34" height="34">
              <path d="M12 3v17M5 13l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

function naamVan(s: Sleutel): string {
  for (const g of HANDMATIG) {
    const k = g.keuzes.find((x) => x.sleutel === s);
    if (k) return `${g.groep} · ${k.naam}`;
  }
  return '';
}

function Kop() {
  return (
    <header className="poort-kop">
      <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="poort-logo" width={72} height={72} />
      <h1 className="poort-titel">{APP_NAAM}</h1>
      <p className="poort-lead">{t('Voetbaloefeningen voor spelers en keepers, met bewegende uitleg.')}</p>
    </header>
  );
}

function UitlegInhoud({ uitleg }: { uitleg: Uitleg }) {
  return (
    <>
      {uitleg.intro && <p className="poort-intro">{uitleg.intro}</p>}
      {uitleg.stappen.length > 0 && <Stappen stappen={uitleg.stappen} />}
    </>
  );
}

/** "Openen in Chrome" (Android) en "Kopieer link". */
function Knoppen({ uitleg, android }: { uitleg: Uitleg; android: boolean }) {
  const [gekopieerd, setGekopieerd] = useState<boolean | null>(null);
  const chrome = !!uitleg.openInChrome && android;
  if (!chrome && !uitleg.kopieerLink) return null;
  return (
    <div className="poort-kopieer">
      {chrome && (
        <a className="poort-knop" href={chromeLink(link())}>
          <Icoon naam="kompas" />
          {t('Openen in Chrome')}
        </a>
      )}
      {uitleg.kopieerLink && (
        <button className={`poort-knop${uitleg.stappen.length || chrome ? ' poort-knop-tweede' : ''}`} onClick={async () => setGekopieerd(await kopieer(link()))}>
          <Icoon naam="kopieer" />
          {gekopieerd ? t('Link gekopieerd') : t('Kopieer link')}
        </button>
      )}
      {gekopieerd === false && <input className="poort-link" readOnly value={link()} aria-label={t('Link naar deze pagina')} onFocus={(e) => e.currentTarget.select()} />}
    </div>
  );
}

function BrowserKnop({ opBrowserGekozen, tekst }: { opBrowserGekozen: () => void; tekst: string }) {
  return (
    <div className="poort-browser">
      <button className="poort-knop poort-knop-tweede" onClick={opBrowserGekozen}>
        <Icoon naam="browser" />
        {tekst}
      </button>
      <p className="poort-voet">{t('Deze keuze wordt onthouden. De installatie-uitleg vind je later terug op het startscherm (Als app installeren) en in de Help.')}</p>
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
