import { useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { Labels, meervoud } from '../../components/Labels';
import { Miniatuur } from '../../components/Miniatuur';
import { CATEGORIEEN, SOORT_NAAM } from '../../data/categorieen';
import { OEFENINGEN } from '../../data/oefeningen';
import { ga, terug } from '../../router';
import { trainingen, useTraining } from '../../training/opslag';
import { kiesbaar } from '../../training/training';
import type { Soort } from '../../model/types';
import { NietGevonden } from '../NietGevonden';

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
  const lijst = kiesbaar(OEFENINGEN, soort, categorie, t.spelers, t.keepers);
  const telling = (c?: string) => kiesbaar(OEFENINGEN, soort, c, t.spelers, t.keepers).length;
  // Altijd de nieuwste versie uit de opslag (ook bij snel achter elkaar tikken).
  const wissel = (oid: string) => {
    const nu = trainingen.haal(id) ?? t;
    trainingen.bewaar({ ...nu, oefeningen: nu.oefeningen.includes(oid) ? nu.oefeningen.filter((x) => x !== oid) : [...nu.oefeningen, oid] });
  };

  return (
    <div className="pagina">
      <Kop titel="Oefeningen kiezen" ouder={`/training/${id}`} />
      <div className="kies-balk">
        <div className="tabs" role="tablist">
          {(['veld', 'keeper'] as const).map((s) => (
            <button key={s} role="tab" aria-selected={soort === s} className={soort === s ? 'aan' : ''} onClick={() => kiesSoort(s)}>
              {SOORT_NAAM[s]}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Categorie">
          <button className={!categorie ? 'aan' : ''} onClick={() => kiesCategorie(undefined)}>
            Alle <span>{telling()}</span>
          </button>
          {CATEGORIEEN[soort].map((c) => (
            <button key={c.id} className={categorie === c.id ? 'aan' : ''} onClick={() => kiesCategorie(c.id)}>
              {c.naam} <span>{telling(c.id)}</span>
            </button>
          ))}
        </div>
      </div>
      <main className="inhoud">
        <p className="filter-uitleg">
          <Icoon naam="spelers" maat={18} /> Passend bij {meervoud(t.spelers, 'speler', 'spelers')} en {meervoud(t.keepers, 'keeper', 'keepers')}
        </p>
        {lijst.length === 0 ? (
          <div className="leeg">
            <p className="leeg-titel">Geen passende oefeningen</p>
            <p>
              {soort === 'veld' && t.spelers === 0
                ? 'Met 0 spelers zijn er alleen keeperoefeningen.'
                : soort === 'keeper' && t.keepers === 0
                  ? 'Vul minstens 1 keeper in voor keeperoefeningen.'
                  : 'Kies een andere categorie of pas de aantallen aan.'}
            </p>
          </div>
        ) : (
          <ul className="kaarten">
            {lijst.map((o) => {
              const gekozen = t.oefeningen.includes(o.id);
              return (
                <li key={o.id} className={`kies-kaart${gekozen ? ' gekozen' : ''}`}>
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
                  <button className={`toevoeg-knop${gekozen ? ' aan' : ''}`} onClick={() => wissel(o.id)} aria-pressed={gekozen} aria-label={gekozen ? `${o.naam} uit de training halen` : `${o.naam} toevoegen`}>
                    <Icoon naam={gekozen ? 'vink' : 'plus'} maat={20} />
                    {gekozen ? 'In training' : 'Toevoegen'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <div className="onderbalk">
        <button className="knop knop-primair knop-breed" onClick={() => terug(`/training/${id}`)}>
          Klaar · {meervoud(t.oefeningen.length, 'oefening', 'oefeningen')}
        </button>
      </div>
    </div>
  );
}
