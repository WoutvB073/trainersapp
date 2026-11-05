import { AnimatieSpeler } from '../anim/AnimatieSpeler';
import type { Oefening } from '../model/types';
import { Icoon } from './Icoon';
import { t as vt } from '../i18n/t';

/** Animatie, uitleg, coachpunten en benodigdheden van één oefening, alleen lezen (voor deellinks en gedeelde stations). */
export function OefeningBlokken({ o }: { o: Oefening }) {
  return (
    <>
      <div className="detail-media">
        <AnimatieSpeler tekening={o.tekening} />
      </div>
      <h2 className="detail-titel">{o.naam}</h2>
      <section className="blok">
        <h3>{vt('Uitleg')}</h3>
        <p>{o.uitleg}</p>
      </section>
      {o.organisatie && (
        <section className="blok">
          <h3>{vt('Organisatie')}</h3>
          <p>{o.organisatie}</p>
        </section>
      )}
      {o.coachpunten.length > 0 && (
        <section className="blok">
          <h3>{vt('Coachpunten')}</h3>
          <ul className="vinkjes">
            {o.coachpunten.map((c) => (
              <li key={c}>
                <Icoon naam="vink" maat={18} />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="blok">
        <h3>{vt('Benodigdheden')}</h3>
        <ul className="opsomming">
          {o.benodigdheden.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
