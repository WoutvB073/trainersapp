import { useEffect, useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { online, useOnlineStatus, type SyncStatus } from '../../engine/account';
import { onlineBeschikbaar } from '../../online/config';
import { ga } from '../../router';
import { meervoud } from '../../components/Labels';
import { APP_NAAM } from '../../config';

const SYNC_TEKST: Record<SyncStatus, string> = {
  uit: 'Niet ingelogd',
  bezig: 'Synchroniseren…',
  klaar: 'Alles staat online',
  wacht: 'Nog niet alles staat online',
  offline: 'Offline: wordt bewaard tot je weer internet hebt',
  fout: 'Synchroniseren lukt nu niet; je gegevens blijven op dit apparaat',
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
    <button className={`icoon-knop sync-icoon${let_op ? ' let-op' : ''}`} aria-label={`Account: ${SYNC_TEKST[s.sync]}`} title={SYNC_TEKST[s.sync]} onClick={() => ga('/account')}>
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
        <Kop titel="Account" ouder="/instellingen" />
        <main className="inhoud smal">
          <div className="leeg">
            <p className="leeg-titel">Online opslag komt eraan</p>
            <p>Inloggen en teams worden nog ingesteld. Alles werkt gewoon op dit apparaat.</p>
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
        <Kop titel="Account" ouder="/instellingen" />
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
          <p className="klein">Je eigen oefeningen, trainingen, favorieten en instellingen staan online en zijn op al je apparaten gelijk. Zonder internet werkt alles gewoon; wijzigingen gaan mee zodra je weer online bent.</p>
          <div className="knoppenrij">
            <button className="knop knop-primair" onClick={() => ga('/teams')}>
              <Icoon naam="team" maat={20} />
              Teams
            </button>
            <button className="knop" disabled={bezig} onClick={() => void doe((m) => m.uitloggen())}>
              <Icoon naam="uitloggen" maat={20} />
              Uitloggen
            </button>
          </div>
          {fout && (
            <p className="waarschuwing" role="alert">
              {fout}
            </p>
          )}
          <section className="blok gevaar-blok">
            <h3>Account verwijderen</h3>
            {!verwijderen ? (
              <>
                <p className="klein">Je account en al je online gegevens worden verwijderd. Je teams verlaat je (ben je de enige, dan wordt het team opgeheven).</p>
                <button className="knop knop-gevaar" onClick={() => setVerwijderen(true)}>
                  <Icoon naam="prullenbak" maat={18} />
                  Account verwijderen…
                </button>
              </>
            ) : (
              <>
                <label className="veld-label">
                  Typ ter controle je wachtwoord
                  <input type="password" autoComplete="current-password" value={wachtwoord} onChange={(e) => setWachtwoord(e.target.value)} />
                </label>
                <div className="knoppenrij">
                  <button className="knop knop-gevaar" disabled={bezig || !wachtwoord} onClick={() => void doe((m) => m.verwijderAccount(wachtwoord), 'Je account is verwijderd.')}>
                    Definitief verwijderen
                  </button>
                  <button className="knop" onClick={() => setVerwijderen(false)}>
                    Annuleren
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
      <Kop titel="Account" ouder="/instellingen" />
      <main className="inhoud smal formulier">
        <p className="klein">
          Inloggen is niet nodig: {APP_NAAM} werkt ook zonder account. Met een account staan je oefeningen en trainingen op al je apparaten en kun je ze met je team delen.
        </p>
        <div className="keuze-twee" role="tablist">
          <button role="tab" aria-selected={!maken} className={`keuze${!maken ? ' aan' : ''}`} onClick={() => setTab('inloggen')}>
            Inloggen
          </button>
          <button role="tab" aria-selected={maken} className={`keuze${maken ? ' aan' : ''}`} onClick={() => setTab('maken')}>
            Account maken
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
              Naam <span className="klein">(zien je teamgenoten)</span>
              <input value={naam} onChange={(e) => setNaam(e.target.value)} autoComplete="name" maxLength={60} required />
            </label>
          )}
          <label className="veld-label">
            E-mailadres
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" required />
          </label>
          <label className="veld-label">
            Wachtwoord {maken && <span className="klein">(minstens 6 tekens)</span>}
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
            {bezig ? 'Even geduld…' : maken ? 'Account maken' : 'Inloggen'}
          </button>
          {!maken && (
            <button
              type="button"
              className="link-knop"
              onClick={() => {
                if (!email.trim()) return setFout('Vul eerst je e-mailadres in.');
                void doe((m) => m.wachtwoordVergeten(email), 'Als er een account is met dit adres, krijg je een e-mail om een nieuw wachtwoord te kiezen. De link opent in de browser; kom daarna terug in de app en log in met je nieuwe wachtwoord.');
              }}
            >
              Wachtwoord vergeten?
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
      <div className="paneel paneel-vraag" role="alertdialog" aria-label="Gegevens naar je account?">
        <h2>Gegevens van dit apparaat meenemen?</h2>
        <p>
          Op dit apparaat staan {delen.join(', ').replace(/, ([^,]*)$/, ' en $1')}. Wil je die bij je account zetten? Dan staan ze ook op je andere apparaten. Dubbele worden samengevoegd.
        </p>
        <p className="klein">Kies je "Nee", dan blijven ze gewoon op dit apparaat staan en zie je ze weer als je uitlogt.</p>
        <div className="knoppenrij">
          <button className="knop knop-primair" onClick={() => antwoord(true)}>
            Ja, meenemen
          </button>
          <button className="knop" onClick={() => antwoord(false)}>
            Nee
          </button>
        </div>
      </div>
    </div>
  );
}
