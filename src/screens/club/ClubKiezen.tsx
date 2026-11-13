import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { Labels } from '../../components/Labels';
import { Miniatuur } from '../../components/Miniatuur';
import { alleOefeningen } from '../../data/oefeningen';
import { leeftijdNaam } from '../../data/leeftijden';
import { ga, terug } from '../../router';
import { blokNaam, metOefeningen, oefeningenVan, onderdeelKandidaten, vindOnderdeel, wijzigOnderdeel } from '../../clubtraining/clubtraining';
import { clubtrainingen, useClub } from '../../clubtraining/opslag';
import { NietGevonden } from '../NietGevonden';
import { t as vt } from '../../i18n/t';

/** Oefening toevoegen aan een onderdeel, uit de bibliotheek (leeftijd en categorie van het onderdeel). Nog eens tikken haalt hem weg. */
export function ClubKiezen({ id, blok }: { id: string; blok: string }) {
  const c = useClub(id);
  const b = c && vindOnderdeel(c, blok);
  if (!c || !b) return <NietGevonden />;
  const lijst = onderdeelKandidaten(c, b, alleOefeningen());
  const kies = (oid: string) => {
    const nu = clubtrainingen.haal(id) ?? c;
    const weg = oefeningenVan(vindOnderdeel(nu, blok) ?? b).some((x) => x.oefening === oid);
    // Het onderdeel kan ook bij een dag met een eigen opzet horen (0.34.3).
    clubtrainingen.bewaar(wijzigOnderdeel(nu, blok, (o) => metOefeningen(o, weg ? oefeningenVan(o).filter((x) => x.oefening !== oid) : [...oefeningenVan(o), { oefening: oid }])));
    if (!weg) terug(`/club/${id}`);
  };
  return (
    <div className="pagina">
      <Kop titel={blokNaam(b.categorie)} ouder={`/club/${id}`} />
      <main className="inhoud">
        <p className="klein club-noot">{leeftijdNaam(c.leeftijd)}</p>
        {lijst.length === 0 ? (
          <div className="leeg">
            <p className="leeg-titel">{vt('Geen passende oefeningen')}</p>
            <p>{vt('Kies een andere leeftijd of minder kinderen per groepje.')}</p>
          </div>
        ) : (
          <ul className="kaarten">
            {lijst.map((o) => {
              const gekozen = oefeningenVan(b).some((x) => x.oefening === o.id);
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
                      <Labels oefening={o} keepers={0} />
                    </span>
                  </a>
                  <button className={`toevoeg-knop${gekozen ? ' aan' : ''}`} onClick={() => kies(o.id)} aria-pressed={gekozen} aria-label={vt('{naam} kiezen', { naam: o.naam })}>
                    <Icoon naam={gekozen ? 'vink' : 'plus'} maat={20} />
                    {gekozen ? vt('Gekozen') : vt('Kiezen')}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
