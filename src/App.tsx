import { useLayoutEffect } from 'react';
import { bewaardeScroll, useRoute, type Route } from './router';
import { soortUitPad } from './data/categorieen';
import { useNieuweVersie, werkBij } from './engine/update';
import { Start } from './screens/Start';
import { Categorieen } from './screens/Categorieen';
import { OefenLijst } from './screens/OefenLijst';
import { OefeningDetail } from './screens/OefeningDetail';
import { NietGevonden } from './screens/NietGevonden';

function Scherm({ route }: { route: Route }) {
  switch (route.naam) {
    case 'start':
      return <Start />;
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

export function App() {
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
      <Scherm route={route} />
      {nieuweVersie && (
        <div className="melding" role="status">
          <span>Er is een nieuwe versie</span>
          <button onClick={werkBij}>Bijwerken</button>
        </div>
      )}
    </>
  );
}
