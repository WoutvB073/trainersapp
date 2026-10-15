import { useLayoutEffect, useState } from 'react';
import { bewaardeScroll, useRoute, type Route } from './router';
import { soortUitPad } from './data/categorieen';
import { useNieuweVersie, werkBij } from './engine/update';
import { Start } from './screens/Start';
import { Categorieen } from './screens/Categorieen';
import { OefenLijst } from './screens/OefenLijst';
import { OefeningDetail } from './screens/OefeningDetail';
import { NietGevonden } from './screens/NietGevonden';
import { Installeren } from './screens/installeren/Installeren';
import { browserGekozen, isStandalone, kiesScherm, omgeving, zetBrowserGekozen } from './engine/platform';

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
  const scherm = kiesScherm({ standalone: isStandalone(), mobiel: omgeving.mobiel, browserGekozen: gekozen });
  const kies = (aan: boolean) => {
    zetBrowserGekozen(aan);
    setGekozen(aan);
    window.scrollTo(0, 0);
  };
  if (scherm === 'installeren') return <Installeren />;
  if (scherm === 'installeren-computer') return <Installeren computer opBrowserGekozen={() => kies(true)} />;
  return <AppSchermen opInstalleren={isStandalone() ? undefined : () => kies(false)} />;
}

function AppSchermen({ opInstalleren }: { opInstalleren?: () => void }) {
  const route = useRoute();
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
      {nieuweVersie && (
        <div className="melding" role="status">
          <span>Er is een nieuwe versie</span>
          <button onClick={werkBij}>Bijwerken</button>
        </div>
      )}
    </>
  );
}
