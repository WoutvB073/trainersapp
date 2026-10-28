import type { ReactNode } from 'react';
import { CATEGORIEEN, SOORT_NAAM, SOORT_PAD } from '../data/categorieen';
import { oefeningenVan } from '../data/oefeningen';
import { Kop } from '../components/Kop';
import { Icoon } from '../components/Icoon';
import { ga } from '../router';
import { FilterBalk } from '../components/Filters';
import { useFavorieten } from '../engine/favorieten';
import { aantalActief, filterOefeningen, useFilters } from '../engine/filters';
import { useEigenOefeningen } from '../eigen/opslag';
import type { Soort } from '../model/types';
import { t } from '../i18n/t';
import { CategoriePlaatje } from '../components/CategoriePlaatje';

function Rij({ pad, naam, omschrijving, aantal, gefilterd, plaatje }: { pad: string; naam: string; omschrijving: string; aantal: number; gefilterd: boolean; plaatje?: ReactNode }) {
  return (
    <li>
      <a
        className={`rij${aantal === 0 ? ' rij-leeg' : ''}`}
        href={`#${pad}`}
        onClick={(e) => {
          e.preventDefault();
          ga(pad);
        }}
      >
        {plaatje}
        <span className="rij-tekst">
          <span className="rij-titel">{naam}</span>
          <span className="rij-sub">{omschrijving}</span>
        </span>
        <span className="teller">{aantal === 0 ? (gefilterd ? '0' : t('Nog leeg')) : aantal}</span>
        <Icoon naam="verder" className="rij-pijl" />
      </a>
    </li>
  );
}

export function Categorieen({ soort }: { soort: Soort }) {
  const filters = useFilters();
  const favs = useFavorieten();
  useEigenOefeningen();
  const basis = `/${SOORT_PAD[soort]}`;
  // Aantallen per categorie volgens de filters.
  const tel = (c?: string) => filterOefeningen(oefeningenVan(soort, c), filters, favs).length;
  const gefilterd = aantalActief(filters) > 0;
  return (
    <div className="pagina">
      <Kop titel={SOORT_NAAM[soort]} ouder="/" />
      <main className="inhoud">
        <FilterBalk aantal={tel()} />
        <ul className="lijst">
          <Rij pad={`${basis}/alle`} naam={t('Alle oefeningen')} omschrijving={gefilterd ? t('Alles wat bij je filters past') : t('Alles op een rij')} aantal={tel()} gefilterd={gefilterd} />
        </ul>
        <h2 className="sectie-titel">{t('Categorieën')}</h2>
        <ul className="lijst">
          {CATEGORIEEN[soort].map((c) => (
            <Rij key={c.id} pad={`${basis}/${c.id}`} naam={c.naam} omschrijving={c.omschrijving} aantal={tel(c.id)} gefilterd={gefilterd} plaatje={<CategoriePlaatje soort={soort} id={c.id} />} />
          ))}
        </ul>
      </main>
    </div>
  );
}
