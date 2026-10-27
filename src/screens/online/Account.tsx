import { useEffect, useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { online, useOnlineStatus, type SyncStatus } from '../../engine/account';
import { onlineBeschikbaar } from '../../online/config';
import { ga } from '../../router';
import { meervoud } from '../../components/Labels';
import { APP_NAAM } from '../../config';
import { lijstTekst, t } from '../../i18n/t';

const SYNC_TEKST: Record<SyncStatus, string> = {
  uit: t('Niet ingelogd'),
  bezig: t('Synchroniseren…'),
  klaar: t('Alles staat online'),
  wacht: t('Nog niet alles staat online'),
  offline: t('Offline: wordt bewaard tot je weer internet hebt'),
  fout: t('Synchroniseren lukt nu niet; je gegevens blijven op dit apparaat'),
};

/** Onopvallende regel: is alles gesynchroniseerd? */
export function SyncRegel() {
  const s = useOnlineStatus();
  if (!s.account) return null;
  const goed = s.sync === 'klaar';
  return (
    <p className={`sync-regel sync-${s.sync}`} role="status">
      <Icoon naam={s.sync === 'offline' || s.sync === 'fout' ? 'wolkUit' : 'wolk'} maat={16} />
      {SYNC_TEKST[s.sync]}
      {goed && <Icoon naam="vink" maat={14} />}
    </p>
  );
}

/** Wolkje in de kop van het startscherm (alleen ingelogd); een stip als nog niet alles online staat. */
export function SyncIcoon() {
  const s = useOnlineStatus();
  if (!s.account) return null;
  const let_op = s.sync === 'wacht' || s.sync === 'offline' || s.sync === 'fout';
  return (
    <button className={`icoon-knop sync-icoon${let_op ? ' let-op' : ''}`} aria-label={t('Account: {w0}', { w0: SYNC_TEKST[s.sync] })} title={SYNC_TEKST[s.sync]} onClick={() => ga('/account')}>
      <Icoon naam={s.sync === 'offline' || s.sync === 'fout' ? 'wolkUit' : 'wolk'} maat={24} />
    </button>
  );
}

function useStartOnline() {
  useEffect(() => {
    if (onlineBeschikbaar()) void online().then((m) => m.startOnline());
  }, []);
}

/** Inloggen, account maken, uitloggen, account verwijderen. */
export function Account() {
  useStartOnline();
  const s = useOnlineStatus();
  const [tab, setTab] = useState<'inloggen' | 'maken'>('inloggen');
  const [naam, setNaam] = useState('');
  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [fout, setFout] = useState('');
  const [melding, setMelding] = useState('');
  const [bezig, setBezig] = useState(false);
  const [verwijderen, setVerwijderen] = useState(false);

  if (!onlineBeschikbaar()) {
    return (
      <div className="pagina">
        <Kop titel={t('Account')} ouder="/instellingen" />
        <main className="inhoud smal">
          <div className="leeg">
            <p className="leeg-titel">{t('Online opslag komt eraan')}</p>
            <p>{t('Inloggen en teams worden nog ingesteld. Alles werkt gewoon op dit apparaat.')}</p>
          </div>
        </main>
      </div>
    );
  }

  const doe = async (f: (m: Awaited<ReturnType<typeof online>>) => Promise<void>, gelukt?: string) => {
    setFout('');
    setMelding('');
    setBezig(true);
    const m = await online();
    try {
      await f(m);
      if (gelukt) setMelding(gelukt);
      setWachtwoord('');
    } catch (e) {
      setFout(m.foutTekst(e));
    } finally {
      setBezig(false);
    }
  };

  if (s.account) {
    return (
      <div className="pagina">
        <Kop titel={t('Account')} ouder="/instellingen" />
        <main className="inhoud smal formulier">
          <section className="blok account-blok">
            <span className="account-icoon" aria-hidden="true">
              <Icoon naam="persoon" maat={28} />
            </span>
            <div>
              <h2 className="account-naam">{s.account.naam}</h2>
              <p className="klein">{s.account.email}</p>
              <SyncRegel />
            </div>
          </section>
          <p className="klein">
            {t(
              'Je eigen oefeningen, trainingen, favorieten en instellingen staan online en zijn op al je apparaten gelijk. Zonder internet werkt alles gewoon; wijzigingen gaan mee zodra je weer online bent.',
            )}
          </p>
          <div className="knoppenrij">
            <button className="knop knop-primair" onClick={() => ga('/teams')}>
              <Icoon naam="team" maat={20} />
              {t('Teams')}
            </button>
            <button className="knop" disabled={bezig} onClick={() => void doe((m) => m.uitloggen())}>
              <Icoon naam="uitloggen" maat={20} />
              {t('Uitloggen')}
            </button>
          </div>
          {fout && (
            <p className="waarschuwing" role="alert">
              {fout}
            </p>
          )}
          <section className="blok gevaar-blok">
            <h3>{t('Account verwijderen')}</h3>
            {!verwijderen ? (
              <>
                <p className="klein">{t('Je account en al je online gegevens worden verwijderd. Je teams verlaat je (ben je de enige, dan wordt het team opgeheven).')}</p>
                <button className="knop knop-gevaar" onClick={() => setVerwijderen(true)}>
                  <Icoon naam="prullenbak" maat={18} />
                  {t('Account verwijderen…')}
                </button>
              </>
            ) : (
              <>
                <label className="veld-label">
                  {t('Typ ter controle je wachtwoord')}
                  <input type="password" autoComplete="current-password" value={wachtwoord} onChange={(e) => setWachtwoord(e.target.value)} />
                </label>
                <div className="knoppenrij">
                  <button className="knop knop-gevaar" disabled={bezig || !wachtwoord} onClick={() => void doe((m) => m.verwijderAccount(wachtwoord), t('Je account is verwijderd.'))}>
                    {t('Definitief verwijderen')}
                  </button>
                  <button className="knop" onClick={() => setVerwijderen(false)}>
                    {t('Annuleren')}
                  </button>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    );
  }

  const maken = tab === 'maken';
  return (
    <div className="pagina">
      <Kop titel={t('Account')} ouder="/instellingen" />
      <main className="inhoud smal formulier">
        <p className="klein">
          {t('Inloggen is niet nodig: {app} werkt ook zonder account. Met een account staan je oefeningen en trainingen op al je apparaten en kun je ze met je team delen.', { app: APP_NAAM })}
        </p>
        <div className="keuze-twee" role="tablist">
          <button role="tab" aria-selected={!maken} className={`keuze${!maken ? ' aan' : ''}`} onClick={() => setTab('inloggen')}>
            {t('Inloggen')}
          </button>
          <button role="tab" aria-selected={maken} className={`keuze${maken ? ' aan' : ''}`} onClick={() => setTab('maken')}>
            {t('Account maken')}
          </button>
        </div>
        <form
          className="account-form"
          onSubmit={(e) => {
            e.preventDefault();
            void doe((m) => (maken ? m.maakAccount(naam, email, wachtwoord) : m.inloggen(email, wachtwoord)));
          }}
        >
          {maken && (
            <label className="veld-label">
              {t('Naam')} <span className="klein">{t('(zien je teamgenoten)')}</span>
              <input value={naam} onChange={(e) => setNaam(e.target.value)} autoComplete="name" maxLength={60} required />
            </label>
          )}
          <label className="veld-label">
            {t('E-mailadres')}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" required />
          </label>
          <label className="veld-label">
            {t('Wachtwoord')} {maken && <span className="klein">{t('(minstens 6 tekens)')}</span>}
            <input type="password" value={wachtwoord} onChange={(e) => setWachtwoord(e.target.value)} autoComplete={maken ? 'new-password' : 'current-password'} minLength={6} required />
          </label>
          {fout && (
            <p className="waarschuwing" role="alert">
              {fout}
            </p>
          )}
          {melding && (
            <p className="melding-goed" role="status">
              {melding}
            </p>
          )}
          <button className="knop knop-primair knop-breed" type="submit" disabled={bezig}>
            <Icoon naam="persoon" maat={20} />
            {bezig ? t('Even geduld…') : maken ? t('Account maken') : t('Inloggen')}
          </button>
          {!maken && (
            <button
              type="button"
              className="link-knop"
              onClick={() => {
                if (!email.trim()) return setFout(t('Vul eerst je e-mailadres in.'));
                void doe(
                  (m) => m.wachtwoordVergeten(email),
                  t(
                    'Als er een account is met dit adres, krijg je een e-mail om een nieuw wachtwoord te kiezen. De link opent in de browser; kom daarna terug in de app en log in met je nieuwe wachtwoord.',
                  ),
                );
              }}
            >
              {t('Wachtwoord vergeten?')}
            </button>
          )}
        </form>
      </main>
    </div>
  );
}

/** Eerste keer inloggen op dit apparaat met eigen spullen: vragen of die naar het account mogen. */
export function SamenvoegenVraag() {
  const s = useOnlineStatus();
  if (!s.samenvoegen) return null;
  const { eigen, trainingen, favorieten, wedstrijd = 0 } = s.samenvoegen;
  const delen = [
    eigen ? meervoud(eigen, 'eigen oefening', 'eigen oefeningen') : '',
    trainingen ? meervoud(trainingen, 'training', 'trainingen') : '',
    favorieten ? meervoud(favorieten, 'favoriet', 'favorieten') : '',
    wedstrijd ? meervoud(wedstrijd, 'opstelling of tactiekbord', 'opstellingen en tactiekborden') : '',
  ].filter(Boolean);
  const antwoord = (ja: boolean) => void online().then((m) => m.beantwoordSamenvoegen(ja));
  return (
    <div className="paneel-achter">
      <div className="paneel paneel-vraag" role="alertdialog" aria-label={t('Gegevens naar je account?')}>
        <h2>{t('Gegevens van dit apparaat meenemen?')}</h2>
        <p>{t('Op dit apparaat staan {wat}. Wil je die bij je account zetten? Dan staan ze ook op je andere apparaten. Dubbele worden samengevoegd.', { wat: lijstTekst(delen) })}</p>
        <p className="klein">{t('Kies je "Nee", dan blijven ze gewoon op dit apparaat staan en zie je ze weer als je uitlogt.')}</p>
        <div className="knoppenrij">
          <button className="knop knop-primair" onClick={() => antwoord(true)}>
            {t('Ja, meenemen')}
          </button>
          <button className="knop" onClick={() => antwoord(false)}>
            {t('Nee')}
          </button>
        </div>
      </div>
    </div>
  );
}
