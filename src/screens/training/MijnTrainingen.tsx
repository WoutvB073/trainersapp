import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { meervoud } from '../../components/Labels';
import { ga } from '../../router';
import { trainingen, useTrainingen } from '../../training/opslag';
import { datumTekst, nieuweTraining, trainingNaam, type Training } from '../../training/training';
import { LinkOpenen, Toast, useToast } from './onderdelen';
import { huidigeFilters } from '../../engine/filters';
import { t as vt } from '../../i18n/t';

/** Nieuwe training, met de laatst gekozen leeftijd. */
function nieuw() {
  const leeftijd = huidigeFilters().leeftijd;
  return trainingen.bewaar({ ...nieuweTraining(), ...(leeftijd ? { leeftijd } : {}) });
}

/** Nieuwe lege training maken en openen. */
export function maakTraining() {
  const t = nieuw();
  ga(`/training/${t.id}`);
}

/** Nieuwe training die de app samenstelt uit gekozen onderdelen. */
export function genereerTraining() {
  const t = nieuw();
  ga(`/training/${t.id}/genereren`);
}

function Regel({ t, opMelding }: { t: Training; opMelding: (s: string) => void }) {
  const sub = [meervoud(t.oefeningen.length, 'oefening', 'oefeningen'), `${t.spelers} sp. · ${t.keepers} kp.`, t.datum ? datumTekst(t.datum) : undefined].filter(Boolean).join(' · ');
  return (
    <li className="training-regel">
      <a
        className="rij"
        href={`#/training/${t.id}`}
        onClick={(e) => {
          e.preventDefault();
          ga(`/training/${t.id}`);
        }}
      >
        <Icoon naam="training" maat={24} className="training-icoon" />
        <span className="rij-tekst">
          <span className="rij-titel">{trainingNaam(t)}</span>
          <span className="rij-sub">{sub}</span>
        </span>
      </a>
      <div className="training-acties">
        <button
          className="icoon-knop"
          aria-label={vt('{w0} dupliceren', { w0: trainingNaam(t) })}
          onClick={() => {
            trainingen.dupliceer(t.id);
            opMelding(vt('Kopie gemaakt'));
          }}
        >
          <Icoon naam="kopieer" maat={20} />
        </button>
        <button
          className="icoon-knop gevaar"
          aria-label={vt('{w0} verwijderen', { w0: trainingNaam(t) })}
          onClick={() => {
            if (window.confirm(vt('"{w0}" verwijderen?', { w0: trainingNaam(t) }))) {
              trainingen.verwijder(t.id);
              opMelding(vt('Teamtraining verwijderd'));
            }
          }}
        >
          <Icoon naam="prullenbak" maat={20} />
        </button>
      </div>
    </li>
  );
}

export function MijnTrainingen() {
  const lijst = useTrainingen();
  const [melding, toon] = useToast();

  return (
    <div className="pagina">
      <Kop titel={vt('Mijn teamtrainingen')} ouder="/" />
      <main className="inhoud smal">
        <div className="knoppenrij knoppen-twee">
          <button className="knop knop-primair" onClick={maakTraining}>
            <Icoon naam="plus" maat={20} />
            {vt('Teamtraining maken')}
          </button>
          <button className="knop" onClick={genereerTraining}>
            <Icoon naam="wissel" maat={20} />
            {vt('Teamtraining genereren')}
          </button>
        </div>

        {lijst.length === 0 ? (
          <div className="leeg">
            <p className="leeg-titel">{vt('Nog geen teamtrainingen')}</p>
            <p>{vt('Maak een teamtraining: vul het aantal spelers en keepers in en kies de oefeningen.')}</p>
          </div>
        ) : (
          <>
            <h2 className="sectie-titel">{vt('Opgeslagen op dit apparaat')}</h2>
            <ul className="lijst">
              {lijst.map((t) => (
                <Regel key={t.id} t={t} opMelding={toon} />
              ))}
            </ul>
          </>
        )}

        <LinkOpenen tekst={vt('Gedeelde teamtraining openen via een link')} pad="t" />
        <p className="voetnoot">{vt('Teamtrainingen staan op dit apparaat. Met delen stuur je een link naar een andere trainer.')}</p>
      </main>
      <Toast tekst={melding} />
    </div>
  );
}
