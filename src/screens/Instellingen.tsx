import type { CSSProperties } from 'react';
import { Kop } from '../components/Kop';
import { Icoon, type IcoonNaam } from '../components/Icoon';
import { isDonker, kiesThema, THEMAS, themaVariabelen, useThema, type Modus } from '../engine/thema';
import { APP_NAAM, VERSIE } from '../config';
import { onlineBeschikbaar } from '../online/config';
import { useOnlineStatus } from '../engine/account';
import { ga } from '../router';
import { SyncRegel } from './online/Account';
import { GegevensBlok } from './GegevensBlok';
import { poppetjes, usePoppetjes } from '../engine/poppetjes';
import { abonneerTaal, kiesTaal, leesTaalKeuze, type TaalKeuze } from '../i18n/taal';
import { useSyncExternalStore } from 'react';
import { t as vt } from '../i18n/t';

/** Account en teams (alleen als online beschikbaar is). */
function AccountBlok() {
  const s = useOnlineStatus();
  return (
    <section className="blok">
      <h3>{vt('Account en teams')}</h3>
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
        <p className="klein">{vt('Log in om je oefeningen en trainingen op al je apparaten te hebben en ze met je team te delen. Zonder account werkt alles gewoon op dit apparaat.')}</p>
      )}
      <div className="knoppenrij">
        <button className="knop knop-primair" onClick={() => ga('/account')}>
          <Icoon naam="persoon" maat={18} />
          {s.account ? vt('Account') : vt('Inloggen')}
        </button>
        <button className="knop" onClick={() => ga('/teams')}>
          <Icoon naam="team" maat={18} />
          {vt('Teams')}
        </button>
      </div>
    </section>
  );
}

const MODI: { modus: Modus; naam: string; icoon: IcoonNaam }[] = [
  { modus: 'licht', naam: vt('Licht'), icoon: 'zon' },
  { modus: 'donker', naam: vt('Donker'), icoon: 'maan' },
  { modus: 'auto', naam: vt('Automatisch'), icoon: 'computer' },
];

/** 3D-animaties: eenvoudige poppetjes voor tragere telefoons (alleen op dit apparaat). */
function AnimatieBlok() {
  const p = usePoppetjes();
  return (
    <section className="blok">
      <h3>{vt('3D-animaties')}</h3>
      <label className="filter-schakel">
        <input type="checkbox" checked={p.eenvoudig} onChange={() => poppetjes.kies(!p.eenvoudig)} />
        {vt('Eenvoudige poppetjes')}
      </label>
      <p className="klein">
        {p.automatisch
          ? vt('Automatisch aangezet, omdat 3D op dit apparaat niet soepel liep. Zet hem uit om de gewone poppetjes weer te proberen.')
          : vt('Lichtere poppetjes en een iets lagere beeldscherpte, voor oudere of tragere telefoons. Gaat vanzelf aan als 3D niet soepel loopt.')}
      </p>
    </section>
  );
}

/** Taal / Language (0.25.0): de kop staat in beide talen, zodat je hem altijd vindt. */
function TaalBlok() {
  const keuze = useSyncExternalStore(abonneerTaal, leesTaalKeuze, leesTaalKeuze);
  const opties: { taal: TaalKeuze; naam: string }[] = [
    { taal: 'nl', naam: 'Nederlands' }, // i18n-ok
    { taal: 'en', naam: 'English' }, // i18n-ok
    { taal: 'auto', naam: vt('Automatisch') },
  ];
  return (
    <section className="blok" id="taal">
      <h3>Taal / Language{/* i18n-ok */}</h3>
      <div className="keuze-drie" role="radiogroup" aria-label="Taal / Language" /* i18n-ok */>
        {opties.map((o) => (
          <button key={o.taal} role="radio" aria-checked={keuze === o.taal} className={`keuze${keuze === o.taal ? ' aan' : ''}`} onClick={() => kiesTaal(o.taal)}>
            {o.naam}
          </button>
        ))}
      </div>
      <p className="klein">{vt('Automatisch volgt de taal van je telefoon (Nederlands als die geen Nederlands of Engels is).')}</p>
    </section>
  );
}

/** Instellingen: clubkleuren (thema) en licht/donker. Bewaard op dit apparaat. */
export function Instellingen() {
  const keuze = useThema();
  const donker = isDonker(keuze.modus);
  return (
    <div className="pagina">
      <Kop titel={vt('Instellingen')} ouder="/" />
      <main className="inhoud smal">
        {onlineBeschikbaar() && <AccountBlok />}
        <section className="blok">
          <h3>{vt('Help')}</h3>
          <p className="klein">{vt('Uitleg en tips voor alles in de app, van installeren tot tactiekbord.')}</p>
          <button className="knop" onClick={() => ga('/help')}>
            <Icoon naam="vraag" maat={18} />
            {vt('Help openen')}
          </button>
        </section>
        <TaalBlok />
        <section className="blok">
          <h3>{vt('Clubkleuren')}</h3>
          <p className="klein">{vt('De kleuren van de app. Het veld en de teamkleuren in de animaties blijven altijd hetzelfde.')}</p>
          <div className="thema-tegels" role="radiogroup" aria-label={vt('Clubkleuren')}>
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
                      <span className="thema-knop">{vt('Training')}</span>
                      <span className="thema-label">{vt('4+ spelers')}</span>
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
          <h3>{vt('Weergave')}</h3>
          <div className="keuze-drie" role="radiogroup" aria-label={vt('Licht of donker')}>
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
          <p className="klein">{vt('Automatisch volgt de instelling van je telefoon of computer.')}</p>
        </section>
        <AnimatieBlok />
        <GegevensBlok />
        <p className="voetnoot">
          {vt('{app} · versie {versie}', { app: APP_NAAM, versie: VERSIE })}
        </p>
      </main>
    </div>
  );
}
