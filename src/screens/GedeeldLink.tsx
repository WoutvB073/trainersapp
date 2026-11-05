import { useEffect, useState } from 'react';
import { Kop } from '../components/Kop';
import { Icoon } from '../components/Icoon';
import { APP_NAAM } from '../config';
import { haalLink, trekLinkIn, useDeelPaneel, useEigenLinks, zetDeelPaneel, type EigenLink, type Opgehaald } from '../engine/deellink';
import { ga } from '../router';
import { datumTekst } from '../training/training';
import { ClubGedeeld } from './club/ClubGedeeld';
import { GedeeldeOefening } from './eigen/GedeeldeOefening';
import { GedeeldeTraining } from './training/GedeeldeTraining';
import { Toast, useToast } from './training/onderdelen';
import { GedeeldWedstrijd } from './wedstrijd/Wedstrijd';
import { t as vt } from '../i18n/t';

/** Onvolledige, ingetrokken of kapotte link (of geen internet): wat er aan de hand is, met een uitweg. */
export function LinkFout({ geenVerbinding }: { geenVerbinding?: boolean }) {
  return (
    <div className="pagina">
      <Kop titel={vt('Gedeelde link')} />
      <main className="inhoud smal">
        <div className="leeg link-fout">
          <p className="leeg-titel">{geenVerbinding ? vt('Geen verbinding. Controleer je internet en probeer het opnieuw.') : vt('Deze link is niet compleet of bestaat niet meer. Vraag de afzender om hem opnieuw te sturen.')}</p>
          <div className="knoppenrij">
            <button className="knop knop-primair" onClick={() => ga('/')}>
              {vt('Naar het startscherm')}
            </button>
            <button className="knop" onClick={() => window.location.reload()}>
              <Icoon naam="opnieuw" maat={18} />
              {vt('Opnieuw proberen')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Onder gedeelde inhoud in de browser: een kleine verwijzing naar de installatie-uitleg, in plaats van het installatiescherm ervoor. */
export function InstalleerMelding({ opTik }: { opTik: () => void }) {
  return (
    <p className="installeer-melding">
      <button className="link-knop" onClick={opTik}>
        <Icoon naam="plusVierkant" maat={18} />
        {vt('Zet {app} op je beginscherm', { app: APP_NAAM })}
      </button>
    </p>
  );
}

/** Korte link `#/d/<code>`: inhoud ophalen en dan hetzelfde scherm als bij de lange link. */
export function GedeeldLink({ code, station, partij, nietGeinstalleerd }: { code: string; station?: number; partij?: boolean; nietGeinstalleerd?: boolean }) {
  const [stand, setStand] = useState<Opgehaald | null>(null);
  useEffect(() => {
    let weg = false;
    void haalLink(code).then((x) => {
      if (!weg) setStand(x);
    });
    return () => {
      weg = true;
    };
  }, [code]);
  if (!stand) {
    return (
      <div className="pagina">
        <Kop titel={vt('Gedeelde link')} />
        <main className="inhoud smal">
          <p className="leeg">{vt('Even laden…')}</p>
        </main>
      </div>
    );
  }
  if (stand === 'weg') return <LinkFout />;
  if (stand === 'geen-verbinding') return <LinkFout geenVerbinding />;
  if (stand.soort === 't') return <GedeeldeTraining code={stand.code} nietGeinstalleerd={nietGeinstalleerd} />;
  if (stand.soort === 'c') return <ClubGedeeld code={stand.code} basis={`/d/${code}`} station={station} partij={partij} />;
  if (stand.soort === 'o') return <GedeeldeOefening code={stand.code} nietGeinstalleerd={nietGeinstalleerd} />;
  return <GedeeldWedstrijd code={stand.code} nietGeinstalleerd={nietGeinstalleerd} />;
}

/** Deelbericht klaar, maar de browser wil het deelmenu pas openen na een nieuwe tik. Ook: "Link maken…". */
export function DeelPaneel() {
  const p = useDeelPaneel();
  const [gekopieerd, setGekopieerd] = useState(false);
  if (!p) return null;
  if (p.bezig) {
    return (
      <div className="toast" role="status">
        {vt('Link maken…')}
      </div>
    );
  }
  const sluit = () => {
    setGekopieerd(false);
    zetDeelPaneel(null);
  };
  return (
    <div className="paneel-achter" onClick={sluit}>
      <div className="paneel" role="dialog" aria-label={vt('Delen')} onClick={(e) => e.stopPropagation()}>
        <div className="paneel-kop">
          <h2>{vt('Je link staat klaar')}</h2>
          <button className="icoon-knop" aria-label={vt('Sluiten')} onClick={sluit}>
            <Icoon naam="kruis" />
          </button>
        </div>
        <p className="deel-tekst">{p.tekst}</p>
        <div className="knoppenrij">
          {'share' in navigator && (
            <button
              className="knop knop-primair"
              onClick={() => {
                void navigator.share({ title: p.titel, text: p.tekst }).then(sluit, () => {});
              }}
            >
              <Icoon naam="deel" maat={18} />
              {vt('Delen')}
            </button>
          )}
          <button
            className="knop"
            onClick={() => {
              void navigator.clipboard.writeText(p.tekst ?? '').then(
                () => setGekopieerd(true),
                () => {},
              );
            }}
          >
            <Icoon naam="kopieer" maat={18} />
            {gekopieerd ? vt('Link gekopieerd') : vt('Kopieer link')}
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkRegel({ l, opMelding }: { l: EigenLink; opMelding: (t: string) => void }) {
  const intrekken = async () => {
    if (!window.confirm(vt('Link van "{naam}" intrekken? Wie hem heeft, kan hem dan niet meer openen.', { naam: l.regel }))) return;
    try {
      const gelukt = await trekLinkIn(l);
      opMelding(gelukt ? vt('Link ingetrokken') : vt('Deze link is gemaakt voordat je inlogde en kan niet meer worden ingetrokken.'));
    } catch {
      opMelding(vt('Intrekken lukte niet. Probeer het opnieuw als je internet hebt.'));
    }
  };
  return (
    <li className="training-regel">
      <span className="rij">
        <Icoon naam="link" maat={22} className="training-icoon" />
        <span className="rij-tekst">
          <span className="rij-titel">{l.regel}</span>
          <span className="rij-sub">{datumTekst(new Date(l.gemaakt).toISOString().slice(0, 10))}</span>
        </span>
      </span>
      <div className="training-acties">
        <button className="icoon-knop gevaar" aria-label={vt('{naam} intrekken', { naam: l.regel })} title={vt('Intrekken')} onClick={() => void intrekken()}>
          <Icoon naam="kruis" maat={20} />
        </button>
      </div>
    </li>
  );
}

/** Links die je op dit toestel maakte: die kun je intrekken. */
export function MijnLinks() {
  const lijst = useEigenLinks();
  const [melding, toon] = useToast();
  return (
    <div className="pagina">
      <Kop titel={vt('Mijn deellinks')} ouder="/instellingen" />
      <main className="inhoud smal">
        {lijst.length === 0 ? (
          <div className="leeg">
            <p>{vt('Je hebt op dit toestel nog geen links gedeeld.')}</p>
          </div>
        ) : (
          <>
            <p className="klein">{vt('Een ingetrokken link werkt bij niemand meer. Wat je deelde blijft gewoon in de app staan.')}</p>
            <ul className="lijst">
              {lijst.map((l) => (
                <LinkRegel key={l.code} l={l} opMelding={toon} />
              ))}
            </ul>
          </>
        )}
      </main>
      <Toast tekst={melding} />
    </div>
  );
}
