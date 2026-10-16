import { useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { meervoud } from '../../components/Labels';
import { ga } from '../../router';
import { trainingen, useTrainingen } from '../../training/opslag';
import { datumTekst, nieuweTraining, trainingNaam, type Training } from '../../training/training';
import { codeUitLink, Toast, useToast } from './onderdelen';

/** Nieuwe lege training maken en openen. */
export function maakTraining() {
  const t = trainingen.bewaar(nieuweTraining());
  ga(`/training/${t.id}`);
}

function Regel({ t, opMelding }: { t: Training; opMelding: (s: string) => void }) {
  const sub = [
    meervoud(t.oefeningen.length, 'oefening', 'oefeningen'),
    `${t.spelers} sp. · ${t.keepers} kp.`,
    t.datum ? datumTekst(t.datum) : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
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
          aria-label={`${trainingNaam(t)} dupliceren`}
          onClick={() => {
            trainingen.dupliceer(t.id);
            opMelding('Kopie gemaakt');
          }}
        >
          <Icoon naam="kopieer" maat={20} />
        </button>
        <button
          className="icoon-knop gevaar"
          aria-label={`${trainingNaam(t)} verwijderen`}
          onClick={() => {
            if (window.confirm(`"${trainingNaam(t)}" verwijderen?`)) {
              trainingen.verwijder(t.id);
              opMelding('Training verwijderd');
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
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState('');
  const code = codeUitLink(link);

  return (
    <div className="pagina">
      <Kop titel="Mijn trainingen" ouder="/" />
      <main className="inhoud smal">
        <button className="knop knop-primair knop-breed" onClick={maakTraining}>
          <Icoon naam="plus" maat={20} />
          Training maken
        </button>

        {lijst.length === 0 ? (
          <div className="leeg">
            <p className="leeg-titel">Nog geen trainingen</p>
            <p>Maak een training: vul het aantal spelers en keepers in en kies de oefeningen.</p>
          </div>
        ) : (
          <>
            <h2 className="sectie-titel">Opgeslagen op dit apparaat</h2>
            <ul className="lijst">
              {lijst.map((t) => (
                <Regel key={t.id} t={t} opMelding={toon} />
              ))}
            </ul>
          </>
        )}

        <div className="link-openen">
          {!linkOpen ? (
            <button className="link-knop" onClick={() => setLinkOpen(true)}>
              <Icoon naam="link" maat={18} />
              Gedeelde training openen via een link
            </button>
          ) : (
            <form
              className="blok link-formulier"
              onSubmit={(e) => {
                e.preventDefault();
                if (code) ga(`/t/${code}`);
              }}
            >
              <label htmlFor="deellink">Plak de link die je hebt gekregen</label>
              <input id="deellink" type="url" inputMode="url" placeholder="https://…/#/t/…" value={link} onChange={(e) => setLink(e.target.value)} autoFocus />
              <button className="knop knop-primair" disabled={!code}>
                Openen
              </button>
            </form>
          )}
        </div>
        <p className="voetnoot">Trainingen staan op dit apparaat. Met delen stuur je een link naar een andere trainer.</p>
      </main>
      <Toast tekst={melding} />
    </div>
  );
}
