import { useMemo } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { Labels, meervoud } from '../../components/Labels';
import { Miniatuur } from '../../components/Miniatuur';
import { APP_NAAM } from '../../config';
import { vindOefening } from '../../data/oefeningen';
import { ga } from '../../router';
import { trainingen } from '../../training/opslag';
import { benodigdheden, datumTekst, trainingNaam, uitCode } from '../../training/training';
import type { Oefening } from '../../model/types';
import { Toast, useToast } from './onderdelen';

/**
 * Gedeelde training (link): bekijken en met één knop opslaan. Werkt ook als de app (nog) niet is geïnstalleerd;
 * dan staat er uitleg bij hoe je de training in de app krijgt.
 */
export function GedeeldeTraining({ code, nietGeinstalleerd, opInstalleren }: { code: string; nietGeinstalleerd?: boolean; opInstalleren?: () => void }) {
  const g = useMemo(() => uitCode(code), [code]);
  const [melding, toon] = useToast();
  const oefeningen = useMemo(() => (g?.oefeningen ?? []).map((id) => vindOefening(id)).filter((o): o is Oefening => !!o), [g]);
  const onbekend = (g?.oefeningen.length ?? 0) - oefeningen.length;
  const spullen = useMemo(() => benodigdheden(oefeningen), [oefeningen]);

  if (!g) {
    return (
      <div className="pagina">
        <Kop titel="Gedeelde training" ouder="/" />
        <main className="inhoud smal">
          <div className="leeg">
            <p className="leeg-titel">Deze link klopt niet</p>
            <p>Vraag de trainer om de link opnieuw te sturen.</p>
          </div>
        </main>
      </div>
    );
  }

  const opslaan = () => {
    const t = trainingen.importeer({ ...g, oefeningen: [...new Set(g.oefeningen)] });
    if (nietGeinstalleerd) toon('Opgeslagen in deze browser');
    else ga(`/training/${t.id}`);
  };

  return (
    <div className="pagina">
      <Kop titel="Gedeelde training" ouder={nietGeinstalleerd ? undefined : '/'} />
      <main className="inhoud smal">
        <section className="blok gedeeld-kop">
          <p className="klein">Je hebt een training gekregen</p>
          <h2 className="detail-titel">{trainingNaam(g)}</h2>
          <p>
            {[meervoud(oefeningen.length, 'oefening', 'oefeningen'), meervoud(g.spelers, 'speler', 'spelers'), meervoud(g.keepers, 'keeper', 'keepers'), g.datum ? datumTekst(g.datum) : undefined]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {!nietGeinstalleerd && (
            <button className="knop knop-primair knop-breed" onClick={opslaan}>
              <Icoon naam="download" maat={20} />
              Opslaan in mijn trainingen
            </button>
          )}
        </section>

        {nietGeinstalleerd && (
          <section className="blok gedeeld-uitleg">
            <h3>In de app openen</h3>
            <p>
              Heb je {APP_NAAM} al op je beginscherm? Kopieer deze link, open de app en kies <strong>Mijn trainingen → Gedeelde training openen via een link</strong>.
            </p>
            <div className="knoppenrij">
              <button
                className="knop knop-primair"
                onClick={() =>
                  void navigator.clipboard
                    .writeText(location.href)
                    .then(() => toon('Link gekopieerd'))
                    .catch(() => toon('Kopiëren lukte niet: houd de adresbalk ingedrukt'))
                }
              >
                <Icoon naam="kopieer" maat={20} />
                Kopieer link
              </button>
              {opInstalleren && (
                <button className="knop" onClick={opInstalleren}>
                  <Icoon naam="plusVierkant" maat={20} />
                  App installeren
                </button>
              )}
            </div>
          </section>
        )}

        <h2 className="sectie-titel">Oefeningen</h2>
        {onbekend > 0 && <p className="waarschuwing">{meervoud(onbekend, 'oefening staat', 'oefeningen staan')} niet in deze versie van de app. Werk de app bij.</p>}
        <ol className="onderdelen alleen-lezen">
          {oefeningen.map((o, i) => (
            <li key={o.id} className="onderdeel">
              <span className="onderdeel-nr">{i + 1}</span>
              <span className="onderdeel-tekst">
                <Miniatuur tekening={o.tekening} className="onderdeel-plaatje" />
                <span className="onderdeel-info">
                  <span className="onderdeel-naam">{o.naam}</span>
                  <Labels oefening={o} />
                </span>
              </span>
            </li>
          ))}
        </ol>

        {spullen.length > 0 && (
          <section className="blok">
            <h3>Klaarzetten</h3>
            <ul className="klaarzetten">
              {spullen.map((b) => (
                <li key={b.tekst}>
                  <strong>{b.tekst}</strong>
                  <span>{b.oefeningen.join(', ')}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Toast tekst={melding} />
    </div>
  );
}
