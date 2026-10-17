import { useState } from 'react';
import { SOORT_NAAM, SOORT_PAD, vindCategorie } from '../data/categorieen';
import { vindOefening } from '../data/oefeningen';
import { AnimatieSpeler } from '../anim/AnimatieSpeler';
import { Kop } from '../components/Kop';
import { Icoon } from '../components/Icoon';
import { aantalTekst, Labels } from '../components/Labels';
import { NietGevonden } from './NietGevonden';
import { Hartje } from '../components/Filters';
import { DeelMetTeam, TeamItemActies } from './online/Teams';
import { ga, terug, vervang } from '../router';
import { eigenOefeningen, useEigenOefeningen } from '../eigen/opslag';
import { inBibliotheek, kopieerNaarEigen } from '../eigen/eigen';
import type { EigenOefening, Oefening } from '../model/types';

type Variatie = 'makkelijker' | 'moeilijker';

function Legenda() {
  return (
    <ul className="legenda" aria-label="Lijnen">
      <li>
        <svg viewBox="0 0 32 8" aria-hidden="true">
          <line x1="1" y1="4" x2="31" y2="4" stroke="var(--legenda-bal)" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        Pass / schot
      </li>
      <li>
        <svg viewBox="0 0 32 8" aria-hidden="true">
          <line x1="2" y1="4" x2="31" y2="4" stroke="var(--legenda-loop)" strokeWidth="2.2" strokeDasharray="4 4" strokeLinecap="round" />
        </svg>
        Lopen
      </li>
      <li>
        <svg viewBox="0 0 32 8" aria-hidden="true">
          <path d="M1 4 Q 4.5 0 8 4 T 15 4 T 22 4 T 29 4" fill="none" stroke="var(--legenda-dribbel)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Dribbelen
      </li>
    </ul>
  );
}

/** Kopiëren naar eigen oefeningen, of (bij een eigen oefening) bewerken, dupliceren en verwijderen. */
function Acties({ oefening }: { oefening: Oefening }) {
  if (!oefening.eigen) {
    return (
      <div className="detail-acties">
        <button
          className="knop"
          onClick={() => {
            const k = eigenOefeningen.bewaar(kopieerNaarEigen(oefening));
            ga(`/eigen/${k.id}/tekenen`);
          }}
        >
          <Icoon naam="kopieer" maat={18} />
          Kopiëren naar eigen oefeningen
        </button>
        <TeamItemActies oefening={oefening} />
      </div>
    );
  }
  const o = oefening as EigenOefening;
  return (
    <div className="detail-acties">
      <button className="knop" onClick={() => ga(`/eigen/${o.id}/tekenen`)}>
        <Icoon naam="potlood" maat={18} />
        Tekening
      </button>
      <button className="knop" onClick={() => ga(`/eigen/${o.id}/gegevens`)}>
        <Icoon naam="info" maat={18} />
        Gegevens
      </button>
      <button
        className="knop"
        onClick={() => {
          const k = eigenOefeningen.dupliceer(o.id);
          if (k) vervang(`/eigen/${k.id}/gegevens`);
        }}
      >
        <Icoon naam="kopieer" maat={18} />
        Dupliceren
      </button>
      <button
        className="knop"
        onClick={() => {
          if (window.confirm(`"${o.naam || 'Deze oefening'}" verwijderen?`)) {
            eigenOefeningen.verwijder(o.id);
            terug('/eigen');
          }
        }}
      >
        <Icoon naam="prullenbak" maat={18} />
        Verwijderen
      </button>
      <DeelMetTeam soort="oefening" id={o.id} naam={o.naam} />
    </div>
  );
}

export function OefeningDetail({ id }: { id: string }) {
  // Eigen oefeningen kunnen veranderen (dupliceren, verwijderen): dan opnieuw tekenen.
  useEigenOefeningen();
  const oefening = vindOefening(id);
  const [variatie, setVariatie] = useState<Variatie | null>(null);
  if (!oefening) return <NietGevonden />;

  const { soort, categorieen } = oefening;
  const hoofd = vindCategorie(soort, categorieen[0]!);
  const ouder = oefening.eigen && !inBibliotheek(oefening) ? '/eigen' : `/${SOORT_PAD[soort]}/${hoofd?.id ?? 'alle'}`;
  const kies = (v: Variatie) => setVariatie(variatie === v ? null : v);

  return (
    <div className="pagina">
      <Kop titel={hoofd?.naam ?? SOORT_NAAM[soort]} ouder={ouder} />
      <main className="inhoud detail">
        <div className="detail-animatie">
          <AnimatieSpeler tekening={oefening.tekening} />
          <Legenda />
        </div>

        <div className="detail-tekst">
          <div className="detail-titelrij">
            <h2 className="detail-titel">{oefening.naam}</h2>
            <Hartje id={oefening.id} naam={oefening.naam} groot />
          </div>
          <div className="detail-cats">
            <span className="cat cat-soort">{SOORT_NAAM[soort]}</span>
            {categorieen.map((c) => (
              <span key={c} className="cat">
                {vindCategorie(soort, c)?.naam ?? c}
              </span>
            ))}
          </div>
          <Labels oefening={oefening} />
          {oefening.verwijderd && (
            <p className="waarschuwing" role="note">
              Deze oefening staat niet meer in de bibliotheek. Je ziet hem nog omdat hij in een training, gedeelde link, team of je favorieten zit. Wil je hem houden? Kopieer hem
              naar je eigen oefeningen.
            </p>
          )}
          <Acties oefening={oefening} />

          {oefening.onderdelen && oefening.onderdelen.length > 0 && (
            <ol className="verloop" aria-label="Verloop van de oefening">
              {oefening.onderdelen.map((d, i) => (
                <li key={d}>
                  <span className="verloop-nr">{i + 1}</span>
                  {d}
                </li>
              ))}
            </ol>
          )}

          {oefening.uitleg && (
            <section className="blok">
              <h3>Uitleg</h3>
              <p>{oefening.uitleg}</p>
            </section>
          )}

          {oefening.organisatie && (
            <section className="blok">
              <h3>Organisatie</h3>
              <p>{oefening.organisatie}</p>
            </section>
          )}

          <section className="blok blok-twee">
            <div>
              <h3>Benodigdheden</h3>
              {oefening.benodigdheden.length ? (
                <ul className="opsomming">
                  {oefening.benodigdheden.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : (
                <p className="klein">Niet ingevuld</p>
              )}
            </div>
            <div>
              <h3>Aantal</h3>
              <p>{aantalTekst(oefening)}</p>
              {oefening.meerSpelers && <p className="klein">{oefening.meerSpelers}</p>}
            </div>
          </section>

          {oefening.coachpunten.length > 0 && (
            <section className="blok">
              <h3>Coachpunten</h3>
              <ul className="vinkjes">
                {oefening.coachpunten.map((c) => (
                  <li key={c}>
                    <Icoon naam="vink" maat={18} />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(oefening.variaties.makkelijker.length > 0 || oefening.variaties.moeilijker.length > 0) && (
            <section className="blok">
              <h3>Variaties</h3>
              <div className="variatie-knoppen">
                <button className={`variatie-knop makkelijker${variatie === 'makkelijker' ? ' aan' : ''}`} onClick={() => kies('makkelijker')} aria-expanded={variatie === 'makkelijker'}>
                  <Icoon naam="makkelijker" maat={18} />
                  Makkelijker
                </button>
                <button className={`variatie-knop moeilijker${variatie === 'moeilijker' ? ' aan' : ''}`} onClick={() => kies('moeilijker')} aria-expanded={variatie === 'moeilijker'}>
                  <Icoon naam="moeilijker" maat={18} />
                  Moeilijker
                </button>
              </div>
              {variatie && (
                <ul className={`variatie-lijst ${variatie}`}>
                  {oefening.variaties[variatie].map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
