import { useMemo } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { OefeningBlokken } from '../../components/OefeningBlokken';
import { oefeningUitCode, oefeningNaarCode, voorDelen } from '../../eigen/eigen';
import { eigenOefeningen } from '../../eigen/opslag';
import { ga } from '../../router';
import type { EigenOefening } from '../../model/types';
import { deelInhoud } from '../../engine/deellink';
import { InAppUitleg, Toast, useToast } from '../training/onderdelen';
import { LinkFout } from '../GedeeldLink';
import { t as vt } from '../../i18n/t';
import { zin } from '../../i18n/zin';

/** Knop "Delen" bij een eigen oefening. */
export function DeelOefeningKnop({ o }: { o: EigenOefening }) {
  const [melding, toon] = useToast();
  return (
    <>
      <button className="knop" onClick={() => void deelInhoud({ soort: 'o', code: oefeningNaarCode(voorDelen(o)), titel: o.naam, regel: vt('Oefening: {w0}', { w0: o.naam }) }).then((m) => m && toon(m))}>
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
export function GedeeldeOefening({ code, nietGeinstalleerd }: { code: string; nietGeinstalleerd?: boolean }) {
  const o = useMemo(() => oefeningUitCode(code), [code]);
  if (!o) return <LinkFout />;
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
        <OefeningBlokken o={o} />
        {nietGeinstalleerd && <InAppUitleg uitleg={zin('Heb je {app} al op je beginscherm? Kopieer deze link, open de app en kies **Eigen oefeningen → Gedeelde oefening openen via een link**.')} />}
      </main>
    </div>
  );
}
