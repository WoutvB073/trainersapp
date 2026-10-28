import { useMemo, useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { ga, vervang } from '../../router';
import { autoUitsnede } from '../../editor/editor';
import { AnimatieSpeler } from '../../anim/AnimatieSpeler';
import type { Tekening } from '../../model/types';
import { NietGevonden } from '../NietGevonden';
import { borden } from '../../wedstrijd/opslag';
import { nieuwBord, type BordSoort } from '../../wedstrijd/wedstrijd';
import type { Tactiek } from '../../wedstrijd/tactieken';
import { BIBLIOTHEKEN, vindVoorbeeld } from '../../wedstrijd/bibliotheken';
import { t as vt } from '../../i18n/t';

/**
 * Voorbeeldtactieken (0.28.0) en voorbeeldhervattingen (0.29.0): lijst per groep, één voorbeeld met versiekeuze, animatie
 * en uitleg, en een eigen bord maken (het voorbeeld zelf verandert nooit).
 */

/** Uitleg bij een voorbeeld (wat, wanneer, aandachtspunten); in het voorbeeld open, in een eigen bord in te klappen. */
export function TactiekUitleg({ tactiek, soort = 'tactiek', open = false }: { tactiek: Tactiek; soort?: BordSoort; open?: boolean }) {
  return (
    <details className="blok tactiek-uitleg" open={open}>
      <summary>
        <Icoon naam="info" maat={20} />
        {BIBLIOTHEKEN[soort].uitlegKop}
      </summary>
      <h3>{vt('Wat')}</h3>
      <p>{tactiek.wat}</p>
      <h3>{vt('Wanneer gebruiken')}</h3>
      <p>{tactiek.wanneer}</p>
      <h3>{vt('Aandachtspunten')}</h3>
      <ul>
        {tactiek.punten.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </details>
  );
}

/** Welke spelvormen er zijn, voor in de lijst. */
function vormenTekst(x: Tactiek): string {
  const elf = x.versies.some((v) => v.vorm === '11v11');
  const acht = x.versies.some((v) => v.vorm === '8v8');
  if (elf && acht) return vt('11 tegen 11 en 8 tegen 8');
  return acht ? vt('Alleen 8 tegen 8') : vt('11 tegen 11');
}

/** Alle voorbeelden van een bibliotheek, per groep. */
export function TactiekenScherm({ soort = 'tactiek' }: { soort?: BordSoort }) {
  const bieb = BIBLIOTHEKEN[soort];
  return (
    <div className="pagina">
      <Kop titel={bieb.titel} ouder="/wedstrijd" />
      <main className="inhoud smal">
        <p className="hint">{bieb.intro}</p>
        {bieb.groepen.map((g) => (
          <section key={g.id}>
            <h2 className="sectie-titel">{g.naam}</h2>
            <ul className="lijst">
              {bieb.items
                .filter((x) => x.groep === g.id)
                .map((x) => (
                  <li key={x.id}>
                    <a
                      className="rij"
                      href={`#${bieb.voorbeeld}/${x.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        ga(`${bieb.voorbeeld}/${x.id}`);
                      }}
                    >
                      <Icoon naam={bieb.icoon} maat={24} className="training-icoon" />
                      <span className="rij-tekst">
                        <span className="rij-titel">{x.naam}</span>
                        <span className="rij-sub">
                          {x.kort} · {vormenTekst(x)}
                        </span>
                      </span>
                      <Icoon naam="verder" className="rij-pijl" />
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}

const metUitsnede = (t: Tekening): Tekening => {
  const w = autoUitsnede(t);
  return w ? { ...t, weergave: w } : t;
};

/** Eén voorbeeld: kies bovenaan de versie (11 of 8 tegen 8), bekijk de animatie en de uitleg, en sla hem op als eigen bord. */
export function TactiekScherm({ id, versie, soort = 'tactiek' }: { id: string; versie?: string; soort?: BordSoort }) {
  const gevonden = vindVoorbeeld(id, soort);
  const x = gevonden?.x;
  const bieb = BIBLIOTHEKEN[soort];
  const [gekozen, kies] = useState(() => (x?.versies.some((v) => v.id === versie) ? versie! : x?.versies[0]?.id));
  const v = x?.versies.find((w) => w.id === gekozen) ?? x?.versies[0];
  const speel = useMemo(() => (v ? metUitsnede(v.maak()) : null), [v]);
  if (!x || !v || !speel) return <NietGevonden />;
  const naam = x.versies.length > 1 ? `${x.naam} · ${v.naam}` : x.naam;
  const maakBord = () => borden.bewaar({ ...nieuwBord(soort, v.maak(), naam), tactiek: x.id });
  return (
    <div className="pagina">
      <Kop titel={bieb.titel} ouder={bieb.lijst} />
      <main className="inhoud detail bord-pagina">
        {x.versies.length > 1 && (
          <div className="wedstrijd-chips tactiek-versies" role="radiogroup" aria-label={vt('Spelvorm')}>
            {x.versies.map((w) => (
              <button
                key={w.id}
                role="radio"
                aria-checked={w.id === v.id}
                className={`gen-chip${w.id === v.id ? ' aan' : ''}`}
                onClick={() => {
                  kies(w.id);
                  vervang(`${bieb.voorbeeld}/${x.id}/${w.id}`);
                }}
              >
                {w.naam}
              </button>
            ))}
          </div>
        )}
        <div className="detail-animatie">
          <AnimatieSpeler key={v.id} tekening={speel} />
        </div>
        <div className="detail-tekst">
          <div className="detail-cats">
            <span className="cat">{bieb.groepen.find((g) => g.id === x.groep)?.naam}</span>
          </div>
          <h2 className="detail-titel">{x.naam}</h2>
          <TactiekUitleg tactiek={x} soort={soort} open />
          <div className="knoppenrij">
            <button
              className="knop knop-primair"
              onClick={() => {
                const b = maakBord();
                ga(`/bord/${b.id}`);
              }}
            >
              <Icoon naam="download" maat={20} />
              {vt('Opslaan als eigen bord')}
            </button>
            <button
              className="knop"
              onClick={() => {
                const b = maakBord();
                ga(`/bord/${b.id}/tekenen`);
              }}
            >
              <Icoon naam="potlood" maat={20} />
              {vt('Aanpassen')}
            </button>
          </div>
          <p className="klein">{vt('Het voorbeeld zelf blijft altijd zoals het is; je past een eigen kopie aan.')}</p>
        </div>
      </main>
    </div>
  );
}
