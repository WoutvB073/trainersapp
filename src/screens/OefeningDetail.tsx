import { useState } from 'react';
import { SOORT_NAAM, SOORT_PAD, vindCategorie } from '../data/categorieen';
import { vindOefening } from '../data/oefeningen';
import { AnimatieSpeler } from '../anim/AnimatieSpeler';
import { Kop } from '../components/Kop';
import { Icoon } from '../components/Icoon';
import { aantalTekst, Labels } from '../components/Labels';
import { NietGevonden } from './NietGevonden';

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

export function OefeningDetail({ id }: { id: string }) {
  const oefening = vindOefening(id);
  const [variatie, setVariatie] = useState<Variatie | null>(null);
  if (!oefening) return <NietGevonden />;

  const { soort, categorieen } = oefening;
  const hoofd = vindCategorie(soort, categorieen[0]!);
  const ouder = `/${SOORT_PAD[soort]}/${hoofd?.id ?? 'alle'}`;
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
          <h2 className="detail-titel">{oefening.naam}</h2>
          <div className="detail-cats">
            <span className="cat cat-soort">{SOORT_NAAM[soort]}</span>
            {categorieen.map((c) => (
              <span key={c} className="cat">
                {vindCategorie(soort, c)?.naam ?? c}
              </span>
            ))}
          </div>
          <Labels oefening={oefening} />

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

          <section className="blok">
            <h3>Uitleg</h3>
            <p>{oefening.uitleg}</p>
          </section>

          {oefening.organisatie && (
            <section className="blok">
              <h3>Organisatie</h3>
              <p>{oefening.organisatie}</p>
            </section>
          )}

          <section className="blok blok-twee">
            <div>
              <h3>Benodigdheden</h3>
              <ul className="opsomming">
                {oefening.benodigdheden.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Aantal</h3>
              <p>{aantalTekst(oefening)}</p>
              {soort === 'keeper' && <p className="klein">Extra keepers kunnen inschieten of aangooien.</p>}
            </div>
          </section>

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
        </div>
      </main>
    </div>
  );
}
