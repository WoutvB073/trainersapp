import { useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { Labels, meervoud } from '../../components/Labels';
import { Miniatuur } from '../../components/Miniatuur';
import { CATEGORIEEN, SOORT_NAAM } from '../../data/categorieen';
import { alleOefeningen } from '../../data/oefeningen';
import { ga, terug } from '../../router';
import { trainingen, useTraining } from '../../training/opslag';
import { kiesbaar, metNaam } from '../../training/training';
import type { Soort } from '../../model/types';
import { NietGevonden } from '../NietGevonden';
import { FilterBalk, GeenResultaat, Hartje } from '../../components/Filters';
import { useFavorieten } from '../../engine/favorieten';
import { filterOefeningen, useFilters } from '../../engine/filters';
import { t as vt } from '../../i18n/t';

/** Onthoud tab en categorie per training (zodat terug van een oefening op dezelfde plek uitkomt). */
function bewaard(id: string): { soort?: Soort; categorie?: string } {
  try {
    return JSON.parse(sessionStorage.getItem(`trainersapp.kiezen.${id}`) ?? '{}') as { soort?: Soort; categorie?: string };
  } catch {
    return {};
  }
}

export function TrainingKiezen({ id }: { id: string }) {
  const t = useTraining(id);
  const filters = useFilters();
  const favs = useFavorieten();
  const eerder = bewaard(id);
  const [soort, setSoort] = useState<Soort>(eerder.soort ?? (t && t.spelers === 0 ? 'keeper' : 'veld'));
  const [categorie, setCategorie] = useState<string | undefined>(eerder.categorie);
  if (!t) return <NietGevonden />;

  const onthoud = (s: Soort, c: string | undefined) => {
    try {
      sessionStorage.setItem(`trainersapp.kiezen.${id}`, JSON.stringify({ soort: s, categorie: c }));
    } catch {
      /* geen opslag */
    }
  };
  const kiesSoort = (s: Soort) => {
    setSoort(s);
    setCategorie(undefined);
    onthoud(s, undefined);
  };
  const kiesCategorie = (c: string | undefined) => {
    setCategorie(c);
    onthoud(soort, c);
  };
  // De aantallen van de training gelden; de andere filters (favorieten, zoeken …) komen erbij.
  const f = { ...filters, aantallen: null };
  const lijst = filterOefeningen(kiesbaar(alleOefeningen(), soort, categorie, t.spelers, t.keepers), f, favs);
  const telling = (c?: string) => filterOefeningen(kiesbaar(alleOefeningen(), soort, c, t.spelers, t.keepers), f, favs).length;
  const zonderFilters = kiesbaar(alleOefeningen(), soort, categorie, t.spelers, t.keepers).length;
  // Altijd de nieuwste versie uit de opslag (ook bij snel achter elkaar tikken).
  const wissel = (oid: string) => {
    const nu = trainingen.haal(id) ?? t;
    trainingen.bewaar(metNaam({ ...nu, oefeningen: nu.oefeningen.includes(oid) ? nu.oefeningen.filter((x) => x !== oid) : [...nu.oefeningen, oid] }));
  };

  return (
    <div className="pagina">
      <Kop titel={vt('Oefeningen kiezen')} ouder={`/training/${id}`} />
      <div className="kies-balk">
        <div className="tabs" role="tablist">
          {(['veld', 'keeper'] as const).map((s) => (
            <button key={s} role="tab" aria-selected={soort === s} className={soort === s ? 'aan' : ''} onClick={() => kiesSoort(s)}>
              {SOORT_NAAM[s]}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label={vt('Categorie')}>
          <button className={!categorie ? 'aan' : ''} onClick={() => kiesCategorie(undefined)}>
            {vt('Alle')} <span>{telling()}</span>
          </button>
          {CATEGORIEEN[soort].map((c) => (
            <button key={c.id} className={categorie === c.id ? 'aan' : ''} onClick={() => kiesCategorie(c.id)}>
              {c.naam} <span>{telling(c.id)}</span>
            </button>
          ))}
        </div>
      </div>
      <main className="inhoud">
        <FilterBalk aantal={lijst.length} aantallenVan={vt('Passend bij {w0} en {w1} (van de training)', { w0: meervoud(t.spelers, 'speler', 'spelers'), w1: meervoud(t.keepers, 'keeper', 'keepers') })} />
        {lijst.length === 0 && zonderFilters > 0 ? (
          <GeenResultaat metFilters />
        ) : lijst.length === 0 ? (
          <div className="leeg">
            <p className="leeg-titel">{vt('Geen passende oefeningen')}</p>
            <p>
              {soort === 'veld' && t.spelers === 0
                ? vt('Met 0 spelers zijn er alleen keeperoefeningen.')
                : soort === 'keeper' && t.keepers === 0
                  ? vt('Vul minstens 1 keeper in voor keeperoefeningen.')
                  : vt('Kies een andere categorie of pas de aantallen aan.')}
            </p>
          </div>
        ) : (
          <ul className="kaarten">
            {lijst.map((o) => {
              const gekozen = t.oefeningen.includes(o.id);
              return (
                <li key={o.id} className={`kies-kaart met-hart${gekozen ? ' gekozen' : ''}`}>
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
                  <button
                    className={`toevoeg-knop${gekozen ? ' aan' : ''}`}
                    onClick={() => wissel(o.id)}
                    aria-pressed={gekozen}
                    aria-label={gekozen ? vt('{naam} uit de training halen', { naam: o.naam }) : `${o.naam} toevoegen`}
                  >
                    <Icoon naam={gekozen ? 'vink' : 'plus'} maat={20} />
                    {gekozen ? vt('In training') : vt('Toevoegen')}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <div className="onderbalk">
        <button className="knop knop-primair knop-breed" onClick={() => terug(`/training/${id}`)}>
          {vt('Klaar · {wat}', { wat: meervoud(t.oefeningen.length, 'oefening', 'oefeningen') })}
        </button>
      </div>
    </div>
  );
}
