import { useRef } from 'react';
import { AnimatieSpeler } from '../../anim/AnimatieSpeler';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { aantalTekst, Labels } from '../../components/Labels';
import { vindOefening } from '../../data/oefeningen';
import { vervang } from '../../router';
import { useTraining } from '../../training/opslag';
import { trainingNaam } from '../../training/training';
import { NietGevonden } from '../NietGevonden';

/** Trainingsmodus: de training op het veld doorlopen, oefening voor oefening (knoppen of vegen over de tekst). */
export function TrainingModus({ id, nr }: { id: string; nr: number }) {
  const t = useTraining(id);
  const start = useRef<{ x: number; y: number } | null>(null);
  if (!t || t.oefeningen.length === 0) return <NietGevonden />;
  const totaal = t.oefeningen.length;
  const i = Math.min(nr, totaal) - 1;
  const o = vindOefening(t.oefeningen[i]!);
  const naar = (n: number) => {
    if (n >= 1 && n <= totaal) vervang(`/training/${id}/modus/${n}`);
  };

  return (
    <div className="pagina modus">
      <Kop titel={trainingNaam(t)} ouder={`/training/${id}`} />
      <div className="modus-stap" aria-live="polite">
        <span>
          Oefening {i + 1} van {totaal}
        </span>
        <div className="modus-punten" aria-hidden="true">
          {t.oefeningen.map((oid, k) => (
            <span key={oid} className={k === i ? 'aan' : k < i ? 'klaar' : ''} />
          ))}
        </div>
      </div>
      {!o ? (
        <main className="inhoud">
          <div className="leeg">
            <p className="leeg-titel">Onbekende oefening</p>
            <p>Deze oefening staat niet in deze versie van de app.</p>
          </div>
        </main>
      ) : (
        <main className="inhoud detail">
          <div className="detail-animatie">
            <AnimatieSpeler key={o.id} tekening={o.tekening} />
          </div>
          <div
            className="detail-tekst"
            onTouchStart={(e) => {
              const p = e.touches[0]!;
              start.current = { x: p.clientX, y: p.clientY };
            }}
            onTouchEnd={(e) => {
              const s = start.current;
              const p = e.changedTouches[0]!;
              start.current = null;
              if (!s) return;
              const dx = p.clientX - s.x;
              const dy = p.clientY - s.y;
              // Duidelijk horizontaal vegen: volgende (naar links) of vorige (naar rechts).
              if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) naar(dx < 0 ? i + 2 : i);
            }}
          >
            <h2 className="detail-titel">{o.naam}</h2>
            <Labels oefening={o} />
            {o.onderdelen && (
              <ol className="verloop">
                {o.onderdelen.map((d, k) => (
                  <li key={d}>
                    <span className="verloop-nr">{k + 1}</span>
                    {d}
                  </li>
                ))}
              </ol>
            )}
            <section className="blok">
              <h3>Uitleg</h3>
              <p>{o.uitleg}</p>
            </section>
            {o.organisatie && (
              <section className="blok">
                <h3>Organisatie</h3>
                <p>{o.organisatie}</p>
              </section>
            )}
            <section className="blok blok-twee">
              <div>
                <h3>Benodigdheden</h3>
                <ul className="opsomming">
                  {o.benodigdheden.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Aantal</h3>
                <p>{aantalTekst(o)}</p>
              </div>
            </section>
            <section className="blok">
              <h3>Coachpunten</h3>
              <ul className="vinkjes">
                {o.coachpunten.map((c) => (
                  <li key={c}>
                    <Icoon naam="vink" maat={18} />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </main>
      )}
      <div className="onderbalk modus-knoppen">
        <button className="knop" onClick={() => naar(i)} disabled={i === 0}>
          <Icoon naam="terug" maat={20} />
          Vorige
        </button>
        <button className="knop knop-primair" onClick={() => naar(i + 2)} disabled={i === totaal - 1}>
          Volgende
          <Icoon naam="verder" maat={20} />
        </button>
      </div>
    </div>
  );
}
