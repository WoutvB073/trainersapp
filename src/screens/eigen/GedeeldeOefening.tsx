import { useMemo } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { OefeningBlokken } from '../../components/OefeningBlokken';
import { oefeningUitCode, oefeningNaarCode, voorDelen } from '../../eigen/eigen';
import { eigenOefeningen } from '../../eigen/opslag';
import { ga } from '../../router';
import type { EigenOefening } from '../../model/types';
import { deelUrl, Toast, useToast } from '../training/onderdelen';
import { t as vt } from '../../i18n/t';
import { zin } from '../../i18n/zin';

export const oefeningLink = (o: EigenOefening) => `${location.origin}${import.meta.env.BASE_URL}#/o/${oefeningNaarCode(voorDelen(o))}`;

/** Knop "Delen" bij een eigen oefening. */
export function DeelOefeningKnop({ o }: { o: EigenOefening }) {
  const [melding, toon] = useToast();
  return (
    <>
      <button className="knop" onClick={() => void deelUrl(o.naam, vt('Oefening: {w0}', { w0: o.naam }), oefeningLink(o)).then((m) => m && toon(m))}>
        <Icoon naam="deel" maat={18} />
        {vt('Delen')}
      </button>
      <Toast tekst={melding} />
    </>
  );
}

/**
 * Gedeelde oefening (link): bekijken en met één knop opslaan. Werkt ook als de app (nog) niet is geïnstalleerd; dan staat er
 * uitleg bij hoe je de oefening in de app krijgt.
 */
export function GedeeldeOefening({ code, nietGeinstalleerd, opInstalleren }: { code: string; nietGeinstalleerd?: boolean; opInstalleren?: () => void }) {
  const o = useMemo(() => oefeningUitCode(code), [code]);
  const [melding, toon] = useToast();
  if (!o) {
    return (
      <div className="pagina">
        <Kop titel={vt('Gedeelde oefening')} ouder={nietGeinstalleerd ? undefined : '/'} />
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
    const id = eigenOefeningen.importeer([o]).get(o.id)!;
    ga(`/oefening/${id}`);
  };
  return (
    <div className="pagina">
      <Kop titel={vt('Gedeelde oefening')} ouder={nietGeinstalleerd ? undefined : '/eigen'} />
      <main className="inhoud smal">
        <section className="blok gedeeld-kop">
          <p className="klein">{vt('Je hebt een oefening gekregen')}</p>
          {!nietGeinstalleerd && (
            <button className="knop knop-primair knop-breed" onClick={opslaan}>
              <Icoon naam="download" maat={20} />
              {vt('Opslaan in mijn eigen oefeningen')}
            </button>
          )}
        </section>
        {nietGeinstalleerd && (
          <section className="blok gedeeld-uitleg">
            <h3>{vt('In de app openen')}</h3>
            <p>{zin('Heb je {app} al op je beginscherm? Kopieer deze link, open de app en kies **Eigen oefeningen → Gedeelde oefening openen via een link**.')}</p>
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
        <OefeningBlokken o={o} />
      </main>
      <Toast tekst={melding} />
    </div>
  );
}
