import { SOORT_NAAM, SOORT_PAD, vindCategorie } from '../data/categorieen';
import { oefeningenVan } from '../data/oefeningen';
import { Kop } from '../components/Kop';
import { Labels } from '../components/Labels';
import { Miniatuur } from '../components/Miniatuur';
import { FilterBalk, GeenResultaat, Hartje } from '../components/Filters';
import { useFavorieten } from '../engine/favorieten';
import { aantalActief, filterOefeningen, useFilters } from '../engine/filters';
import { useEigenOefeningen } from '../eigen/opslag';
import { ga } from '../router';
import type { Soort } from '../model/types';
import { NietGevonden } from './NietGevonden';
import { t } from '../i18n/t';

export function OefenLijst({ soort, categorie }: { soort: Soort; categorie: string }) {
  const filters = useFilters();
  const favs = useFavorieten();
  useEigenOefeningen();
  const basis = `/${SOORT_PAD[soort]}`;
  const alle = categorie === 'alle';
  const cat = alle ? undefined : vindCategorie(soort, categorie);
  if (!alle && !cat) return <NietGevonden />;
  const inCategorie = oefeningenVan(soort, cat?.id);
  const oefeningen = filterOefeningen(inCategorie, filters, favs);

  return (
    <div className="pagina">
      <Kop titel={alle ? t('{w0}: alle oefeningen', { w0: SOORT_NAAM[soort] }) : cat!.naam} ouder={basis} />
      <main className="inhoud">
        <FilterBalk aantal={oefeningen.length} />
        {oefeningen.length === 0 ? (
          <GeenResultaat metFilters={aantalActief(filters) > 0 && inCategorie.length > 0} />
        ) : (
          <ul className="kaarten">
            {oefeningen.map((o) => (
              <li key={o.id} className="met-hart">
                <a
                  className="kaart"
                  href={`#/oefening/${o.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    ga(`/oefening/${o.id}`);
                  }}
                >
                  <Miniatuur tekening={o.tekening} className="kaart-plaatje" />
                  <span className="kaart-tekst">
                    <span className="kaart-titel">{o.naam}</span>
                    <span className="kaart-uitleg">{o.uitleg}</span>
                    <Labels oefening={o} />
                  </span>
                </a>
                <Hartje id={o.id} naam={o.naam} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
