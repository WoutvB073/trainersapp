import type { CSSProperties } from 'react';
import { Kop } from '../components/Kop';
import { Icoon, type IcoonNaam } from '../components/Icoon';
import { isDonker, kiesThema, THEMAS, themaVariabelen, useThema, type Modus } from '../engine/thema';
import { APP_NAAM, VERSIE } from '../config';
import { onlineBeschikbaar } from '../online/config';
import { useOnlineStatus } from '../engine/account';
import { ga } from '../router';
import { SyncRegel } from './online/Account';

/** Account en teams (alleen als online beschikbaar is). */
function AccountBlok() {
  const s = useOnlineStatus();
  return (
    <section className="blok">
      <h3>Account en teams</h3>
      {s.account ? (
        <>
          <p className="account-kort">
            <Icoon naam="persoon" maat={20} />
            <span>
              <strong>{s.account.naam}</strong> · {s.account.email}
            </span>
          </p>
          <SyncRegel />
        </>
      ) : (
        <p className="klein">Log in om je oefeningen en trainingen op al je apparaten te hebben en ze met je team te delen. Zonder account werkt alles gewoon op dit apparaat.</p>
      )}
      <div className="knoppenrij">
        <button className="knop knop-primair" onClick={() => ga('/account')}>
          <Icoon naam="persoon" maat={18} />
          {s.account ? 'Account' : 'Inloggen'}
        </button>
        <button className="knop" onClick={() => ga('/teams')}>
          <Icoon naam="team" maat={18} />
          Teams
        </button>
      </div>
    </section>
  );
}

const MODI: { modus: Modus; naam: string; icoon: IcoonNaam }[] = [
  { modus: 'licht', naam: 'Licht', icoon: 'zon' },
  { modus: 'donker', naam: 'Donker', icoon: 'maan' },
  { modus: 'auto', naam: 'Automatisch', icoon: 'computer' },
];

/** Instellingen: clubkleuren (thema) en licht/donker. Bewaard op dit apparaat. */
export function Instellingen() {
  const keuze = useThema();
  const donker = isDonker(keuze.modus);
  return (
    <div className="pagina">
      <Kop titel="Instellingen" ouder="/" />
      <main className="inhoud smal">
        {onlineBeschikbaar() && <AccountBlok />}
        <section className="blok">
          <h3>Clubkleuren</h3>
          <p className="klein">De kleuren van de app. Het veld en de teamkleuren in de animaties blijven altijd hetzelfde.</p>
          <div className="thema-tegels" role="radiogroup" aria-label="Clubkleuren">
            {THEMAS.map((t) => {
              const v = themaVariabelen(t.id, donker);
              const gekozen = keuze.thema === t.id;
              return (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={gekozen}
                  className={`thema-tegel${gekozen ? ' aan' : ''}`}
                  style={v as CSSProperties}
                  onClick={() => kiesThema({ ...keuze, thema: t.id })}
                >
                  <span className="thema-voorbeeld" aria-hidden="true">
                    <span className="thema-kop">{APP_NAAM}</span>
                    <span className="thema-inhoud">
                      <span className="thema-knop">Training</span>
                      <span className="thema-label">4+ spelers</span>
                    </span>
                  </span>
                  <span className="thema-naam">
                    {gekozen && <Icoon naam="vink" maat={16} />}
                    {t.naam}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
        <section className="blok">
          <h3>Weergave</h3>
          <div className="keuze-drie" role="radiogroup" aria-label="Licht of donker">
            {MODI.map((m) => (
              <button
                key={m.modus}
                role="radio"
                aria-checked={keuze.modus === m.modus}
                className={`keuze${keuze.modus === m.modus ? ' aan' : ''}`}
                onClick={() => kiesThema({ ...keuze, modus: m.modus })}
              >
                <Icoon naam={m.icoon} maat={20} />
                {m.naam}
              </button>
            ))}
          </div>
          <p className="klein">Automatisch volgt de instelling van je telefoon of computer.</p>
        </section>
        <p className="voetnoot">
          {APP_NAAM} · versie {VERSIE}
        </p>
      </main>
    </div>
  );
}
