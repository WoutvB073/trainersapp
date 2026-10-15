import { CATEGORIEEN, SOORT_NAAM, SOORT_PAD } from '../data/categorieen';
import { oefeningenVan } from '../data/oefeningen';
import { Kop } from '../components/Kop';
import { Icoon } from '../components/Icoon';
import { ga } from '../router';
import type { Soort } from '../model/types';

function Rij({ pad, naam, omschrijving, aantal }: { pad: string; naam: string; omschrijving: string; aantal: number }) {
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
        <span className="rij-tekst">
          <span className="rij-titel">{naam}</span>
          <span className="rij-sub">{omschrijving}</span>
        </span>
        <span className="teller">{aantal === 0 ? 'Nog leeg' : aantal}</span>
        <Icoon naam="verder" className="rij-pijl" />
      </a>
    </li>
  );
}

export function Categorieen({ soort }: { soort: Soort }) {
  const basis = `/${SOORT_PAD[soort]}`;
  return (
    <div className="pagina">
      <Kop titel={SOORT_NAAM[soort]} ouder="/" />
      <main className="inhoud">
        <ul className="lijst">
          <Rij pad={`${basis}/alle`} naam="Alle oefeningen" omschrijving="Alles op een rij" aantal={oefeningenVan(soort).length} />
        </ul>
        <h2 className="sectie-titel">Categorieën</h2>
        <ul className="lijst">
          {CATEGORIEEN[soort].map((c) => (
            <Rij key={c.id} pad={`${basis}/${c.id}`} naam={c.naam} omschrijving={c.omschrijving} aantal={oefeningenVan(soort, c.id).length} />
          ))}
        </ul>
      </main>
    </div>
  );
}
