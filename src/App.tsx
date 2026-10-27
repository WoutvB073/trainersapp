import { useEffect, useLayoutEffect, useState } from 'react';
import { bewaardeScroll, openTraining, useRoute, type Route } from './router';
import { soortUitPad } from './data/categorieen';
import { useNieuweVersie, werkBij } from './engine/update';
import { Start } from './screens/Start';
import { Categorieen } from './screens/Categorieen';
import { OefenLijst } from './screens/OefenLijst';
import { OefeningDetail } from './screens/OefeningDetail';
import { NietGevonden } from './screens/NietGevonden';
import { Installeren } from './screens/installeren/Installeren';
import { MijnTrainingen } from './screens/training/MijnTrainingen';
import { trainingen } from './training/opslag';
import { TrainingBewerk } from './screens/training/TrainingBewerk';
import { TrainingKiezen } from './screens/training/TrainingKiezen';
import { TrainingGenereren } from './screens/training/TrainingGenereren';
import { TrainingModus } from './screens/training/TrainingModus';
import { GedeeldeTraining } from './screens/training/GedeeldeTraining';
import { EigenOefeningen, NieuweOefening } from './screens/eigen/EigenOefeningen';
import { Tekenen } from './screens/eigen/Tekenen';
import { Gegevens } from './screens/eigen/Gegevens';
import { Instellingen } from './screens/Instellingen';
import { Help } from './screens/Help';
import { BordScherm, GedeeldWedstrijd, OpstellingScherm, TeamWedstrijdScherm, Wedstrijd } from './screens/wedstrijd/Wedstrijd';
import { BordTekenen } from './screens/wedstrijd/BordTekenen';
import { Account, SamenvoegenVraag } from './screens/online/Account';
import { Teams, TeamScherm, TeamTrainingScherm } from './screens/online/Teams';
import { browserGekozen, isStandalone, kiesScherm, omgeving, zetBrowserGekozen } from './engine/platform';
import { t } from './i18n/t';

function Scherm({ route, opInstalleren }: { route: Route; opInstalleren?: () => void }) {
  switch (route.naam) {
    case 'start':
      return <Start opInstalleren={opInstalleren} />;
    case 'categorieen': {
      const soort = soortUitPad(route.soort);
      return soort ? <Categorieen soort={soort} /> : <NietGevonden />;
    }
    case 'lijst': {
      const soort = soortUitPad(route.soort);
      return soort ? <OefenLijst key={route.categorie} soort={soort} categorie={route.categorie} /> : <NietGevonden />;
    }
    case 'oefening':
      return <OefeningDetail key={route.id} id={route.id} />;
    case 'trainingen':
      return <MijnTrainingen />;
    case 'training':
      return <TrainingBewerk key={route.id} id={route.id} />;
    case 'kiezen':
      return <TrainingKiezen key={route.id} id={route.id} />;
    case 'genereren':
      return <TrainingGenereren key={route.id} id={route.id} />;
    case 'modus':
      return <TrainingModus id={route.id} nr={route.nr} />;
    case 'gedeeld':
      return <GedeeldeTraining key={route.code} code={route.code} />;
    case 'eigen':
      return <EigenOefeningen />;
    case 'eigen-nieuw':
      return <NieuweOefening />;
    case 'tekenen':
      return <Tekenen key={route.id} id={route.id} />;
    case 'gegevens':
      return <Gegevens key={route.id} id={route.id} />;
    case 'instellingen':
      return <Instellingen />;
    case 'help':
      return <Help key={route.onderwerp ?? ''} open={route.onderwerp} />;
    case 'wedstrijd':
      return <Wedstrijd />;
    case 'opstelling':
      return <OpstellingScherm key={route.id} id={route.id} />;
    case 'bord':
      return <BordScherm key={route.id} id={route.id} />;
    case 'bord-tekenen':
      return <BordTekenen key={route.id} id={route.id} />;
    case 'wedstrijd-gedeeld':
      return <GedeeldWedstrijd key={route.code} code={route.code} />;
    case 'teamwedstrijd':
      return <TeamWedstrijdScherm key={route.id + route.item} id={route.id} item={route.item} />;
    case 'account':
      return <Account />;
    case 'teams':
      return <Teams />;
    case 'team':
      return <TeamScherm key={route.id} id={route.id} />;
    case 'teamtraining':
      return <TeamTrainingScherm key={route.id + route.item} id={route.id} item={route.item} />;
    default:
      return <NietGevonden />;
  }
}

/**
 * Geïnstalleerd: de app. Telefoon/tablet in de browser: alleen het installatiescherm.
 * Computer: installatie-uitleg met "Gewoon in de browser gebruiken" (keuze wordt onthouden).
 */
export function App() {
  const [gekozen, setGekozen] = useState(browserGekozen);
  const route = useRoute();
  const [installatieGetoond, setInstallatieGetoond] = useState(false);
  const scherm = kiesScherm({ standalone: isStandalone(), mobiel: omgeving.mobiel, browserGekozen: gekozen });
  const kies = (aan: boolean) => {
    zetBrowserGekozen(aan);
    setGekozen(aan);
    window.scrollTo(0, 0);
  };
  // Een gedeelde training (link) kun je ook zonder de app bekijken, met uitleg hoe je hem in de app krijgt.
  if (scherm !== 'app' && route.naam === 'gedeeld' && !installatieGetoond) {
    return <GedeeldeTraining code={route.code} nietGeinstalleerd opInstalleren={() => setInstallatieGetoond(true)} />;
  }
  if (scherm === 'installeren') return <Installeren />;
  if (scherm === 'installeren-computer') return <Installeren computer opBrowserGekozen={() => kies(true)} />;
  return <AppSchermen opInstalleren={isStandalone() ? undefined : () => kies(false)} />;
}

function AppSchermen({ opInstalleren }: { opInstalleren?: () => void }) {
  const route = useRoute();
  // Training maken en weer weg zonder iets in te vullen: die lege training niet bewaren (één plek, alle schermen van een training).
  const open = openTraining(route);
  useEffect(() => trainingen.ruimLegeOp(open), [open]);
  const nieuweVersie = useNieuweVersie();
  const sleutel = JSON.stringify(route);

  // Na "terug" de oude scrollpositie herstellen.
  useLayoutEffect(() => {
    const y = bewaardeScroll();
    if (y !== undefined) window.scrollTo(0, y);
  }, [sleutel]);

  return (
    <>
      <Scherm route={route} opInstalleren={opInstalleren} />
      <SamenvoegenVraag />
      {nieuweVersie && (
        <div className="melding" role="status">
          <span>{t('Er is een nieuwe versie')}</span>
          <button onClick={werkBij}>{t('Bijwerken')}</button>
        </div>
      )}
    </>
  );
}
