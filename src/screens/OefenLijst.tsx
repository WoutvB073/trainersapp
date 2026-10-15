import { SOORT_NAAM, SOORT_PAD, vindCategorie } from '../data/categorieen';
import { oefeningenVan } from '../data/oefeningen';
import { Kop } from '../components/Kop';
import { Labels } from '../components/Labels';
import { Miniatuur } from '../components/Miniatuur';
import { ga } from '../router';
import type { Soort } from '../model/types';
import { NietGevonden } from './NietGevonden';

export function OefenLijst({ soort, categorie }: { soort: Soort; categorie: string }) {
  const basis = `/${SOORT_PAD[soort]}`;
  const alle = categorie === 'alle';
  const cat = alle ? undefined : vindCategorie(soort, categorie);
  if (!alle && !cat) return <NietGevonden />;
  const oefeningen = oefeningenVan(soort, cat?.id);

  return (
    <div className="pagina">
      <Kop titel={alle ? `${SOORT_NAAM[soort]}: alle oefeningen` : cat!.naam} ouder={basis} />
      <main className="inhoud">
        {oefeningen.length === 0 ? (
          <div className="leeg">
            <p className="leeg-titel">Nog geen oefeningen</p>
            <p>In deze categorie komen binnenkort oefeningen.</p>
          </div>
        ) : (
          <ul className="kaarten">
            {oefeningen.map((o) => (
              <li key={o.id}>
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
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
