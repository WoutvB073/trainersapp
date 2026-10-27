import { useMemo } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { Labels, meervoud } from '../../components/Labels';
import { Miniatuur } from '../../components/Miniatuur';
import { vindOefening } from '../../data/oefeningen';
import { ga } from '../../router';
import { trainingen } from '../../training/opslag';
import { eigenOefeningen } from '../../eigen/opslag';
import { benodigdheden, datumTekst, trainingNaam, uitCode } from '../../training/training';
import type { Oefening } from '../../model/types';
import { Toast, useToast } from './onderdelen';
import { t as vt } from '../../i18n/t';
import { zin } from '../../i18n/zin';

/**
 * Gedeelde training (link): bekijken en met één knop opslaan. Werkt ook als de app (nog) niet is geïnstalleerd;
 * dan staat er uitleg bij hoe je de training in de app krijgt.
 */
export function GedeeldeTraining({ code, nietGeinstalleerd, opInstalleren }: { code: string; nietGeinstalleerd?: boolean; opInstalleren?: () => void }) {
  const g = useMemo(() => uitCode(code), [code]);
  const [melding, toon] = useToast();
  // Eigen oefeningen van de afzender zitten in de link zelf.
  const oefeningen = useMemo(() => (g?.oefeningen ?? []).map((id) => g?.eigen?.find((o) => o.id === id) ?? vindOefening(id)).filter((o): o is Oefening => !!o), [g]);
  const onbekend = (g?.oefeningen.length ?? 0) - oefeningen.length;
  const spullen = useMemo(() => benodigdheden(oefeningen), [oefeningen]);

  if (!g) {
    return (
      <div className="pagina">
        <Kop titel={vt('Gedeelde training')} ouder="/" />
        <main className="inhoud smal">
          <div className="leeg">
            <p className="leeg-titel">{vt('Deze link klopt niet')}</p>
            <p>{vt('Vraag de trainer om de link opnieuw te sturen.')}</p>
          </div>
        </main>
      </div>
    );
  }

  const opslaan = () => {
    // Eerst de eigen oefeningen opslaan (eventueel met een nieuwe id), dan de training met de juiste id's.
    const ids = g.eigen?.length ? eigenOefeningen.importeer(g.eigen) : new Map<string, string>();
    const { eigen: _e, ...rest } = g;
    void _e;
    const t = trainingen.importeer({
      ...rest,
      oefeningen: [...new Set(g.oefeningen.map((id) => ids.get(id) ?? id))],
    });
    if (nietGeinstalleerd) toon(vt('Opgeslagen in deze browser'));
    else ga(`/training/${t.id}`);
  };

  return (
    <div className="pagina">
      <Kop titel={vt('Gedeelde training')} ouder={nietGeinstalleerd ? undefined : '/'} />
      <main className="inhoud smal">
        <section className="blok gedeeld-kop">
          <p className="klein">{vt('Je hebt een training gekregen')}</p>
          <h2 className="detail-titel">{trainingNaam(g)}</h2>
          <p>
            {[meervoud(oefeningen.length, 'oefening', 'oefeningen'), meervoud(g.spelers, 'speler', 'spelers'), meervoud(g.keepers, 'keeper', 'keepers'), g.datum ? datumTekst(g.datum) : undefined]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {!nietGeinstalleerd && (
            <button className="knop knop-primair knop-breed" onClick={opslaan}>
              <Icoon naam="download" maat={20} />
              {vt('Opslaan in mijn trainingen')}
            </button>
          )}
        </section>

        {nietGeinstalleerd && (
          <section className="blok gedeeld-uitleg">
            <h3>{vt('In de app openen')}</h3>
            <p>
              {zin('Heb je {app} al op je beginscherm? Kopieer deze link, open de app en kies **Mijn trainingen → Gedeelde training openen via een link**.')}
            </p>
            <div className="knoppenrij">
              <button
                className="knop knop-primair"
                onClick={() =>
                  void navigator.clipboard
                    .writeText(location.href)
                    .then(() => toon(vt('Link gekopieerd')))
                    .catch(() => toon(vt('Kopiëren lukte niet: houd de adresbalk ingedrukt')))
                }
              >
                <Icoon naam="kopieer" maat={20} />
                {vt('Kopieer link')}
              </button>
              {opInstalleren && (
                <button className="knop" onClick={opInstalleren}>
                  <Icoon naam="plusVierkant" maat={20} />
                  {vt('App installeren')}
                </button>
              )}
            </div>
          </section>
        )}

        <h2 className="sectie-titel">{vt('Oefeningen')}</h2>
        {onbekend > 0 && <p className="waarschuwing">{vt(onbekend === 1 ? '1 oefening staat niet in deze versie van de app. Werk de app bij.' : '{n} oefeningen staan niet in deze versie van de app. Werk de app bij.', { n: onbekend })}</p>}
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
            <h3>{vt('Klaarzetten')}</h3>
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
