import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { clubNaam, dupliceer, naarVolgendeWeek, nieuweClub, type ClubTraining } from '../../clubtraining/clubtraining';
import { clubtrainingen, useClubtrainingen } from '../../clubtraining/opslag';
import { datumTekst } from '../../training/training';
import { huidigeFilters } from '../../engine/filters';
import { ga } from '../../router';
import { Toast, useToast } from '../training/onderdelen';
import { t as vt } from '../../i18n/t';

/** Nieuwe clubtraining: de laatst gekozen mini-groep als die er is, anders Mini's 5–7. */
function maakClub() {
  const l = huidigeFilters().leeftijd;
  const c = clubtrainingen.bewaar(nieuweClub(l?.startsWith('mini') ? l : undefined));
  ga(`/club/${c.id}`);
}

function Regel({ c, opMelding }: { c: ClubTraining; opMelding: (s: string) => void }) {
  const sub = [c.datums.map((d) => datumTekst(d)).join(' · '), vt('{g} groepjes', { g: c.groepjes })].filter(Boolean).join(' · ');
  return (
    <li className="training-regel">
      <a
        className="rij"
        href={`#/club/${c.id}`}
        onClick={(e) => {
          e.preventDefault();
          ga(`/club/${c.id}`);
        }}
      >
        <Icoon naam="team" maat={24} className="training-icoon" />
        <span className="rij-tekst">
          <span className="rij-titel">{clubNaam(c)}</span>
          <span className="rij-sub">{sub}</span>
        </span>
      </a>
      <div className="training-acties">
        <button
          className="icoon-knop"
          aria-label={vt('{w0} dupliceren', { w0: clubNaam(c) })}
          title={vt('Dupliceren')}
          onClick={() => {
            clubtrainingen.bewaar(dupliceer(c));
            opMelding(vt('Kopie gemaakt'));
          }}
        >
          <Icoon naam="kopieer" maat={20} />
        </button>
        <button
          className="icoon-knop"
          aria-label={vt('{w0} dupliceren naar volgende week', { w0: clubNaam(c) })}
          title={vt('Dupliceer naar volgende week')}
          onClick={() => {
            clubtrainingen.bewaar(naarVolgendeWeek(c));
            opMelding(vt('Gekopieerd naar volgende week'));
          }}
        >
          <Icoon naam="kalender" maat={20} />
        </button>
        <button
          className="icoon-knop gevaar"
          aria-label={vt('{w0} verwijderen', { w0: clubNaam(c) })}
          onClick={() => {
            if (confirm(vt('{w0} verwijderen?', { w0: clubNaam(c) }))) clubtrainingen.verwijder(c.id);
          }}
        >
          <Icoon naam="prullenbak" maat={20} />
        </button>
      </div>
    </li>
  );
}

export function ClubLijst() {
  const lijst = useClubtrainingen();
  const [melding, toon] = useToast();
  return (
    <div className="pagina">
      <Kop titel={vt('Clubtraining')} ouder="/" />
      <main className="inhoud smal">
        <button className="knop knop-primair knop-breed" onClick={maakClub}>
          <Icoon naam="plus" maat={20} />
          {vt('Nieuwe clubtraining')}
        </button>
        {lijst.length ? (
          <ul className="lijst club-lijst">
            {lijst.map((c) => (
              <Regel key={c.id} c={c} opMelding={toon} />
            ))}
          </ul>
        ) : (
          <div className="leeg">
            <p className="leeg-titel">{vt('Nog geen clubtrainingen')}</p>
            <p>{vt('Eén helft van het veld, groepjes die rouleren langs de stations en daarna partijvormen. De app maakt het veldplan, het rotatieschema en de materiaallijst.')}</p>
          </div>
        )}
      </main>
      <Toast tekst={melding} />
    </div>
  );
}
