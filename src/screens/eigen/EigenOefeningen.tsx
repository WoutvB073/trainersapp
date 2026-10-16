import { useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { Labels } from '../../components/Labels';
import { Miniatuur } from '../../components/Miniatuur';
import { ga, vervang } from '../../router';
import { eigenOefeningen, useEigenOefeningen } from '../../eigen/opslag';
import { inBibliotheek, nieuweEigen, ontbreekt } from '../../eigen/eigen';
import { nieuweTekening } from '../../editor/editor';
import { SOORT_NAAM } from '../../data/categorieen';
import type { EigenOefening, Soort, VeldType } from '../../model/types';
import { Toast, useToast } from '../training/onderdelen';

export const eigenNaam = (o: Pick<EigenOefening, 'naam'>) => o.naam.trim() || 'Naamloze oefening';

function Regel({ o, opMelding }: { o: EigenOefening; opMelding: (s: string) => void }) {
  const af = inBibliotheek(o);
  return (
    <li className="eigen-regel">
      <a
        className="eigen-kaart"
        href={`#/oefening/${o.id}`}
        onClick={(e) => {
          e.preventDefault();
          ga(af ? `/oefening/${o.id}` : `/eigen/${o.id}/tekenen`);
        }}
      >
        <Miniatuur tekening={o.tekening} className="eigen-plaatje" />
        <span className="kaart-tekst">
          <span className="kaart-titel">{eigenNaam(o)}</span>
          <span className="kaart-uitleg">{af ? `${SOORT_NAAM[o.soort]} · ${o.uitleg || 'Eigen oefening'}` : `Nog niet in de bibliotheek: ${ontbreekt(o).join(' en ').toLowerCase()}.`}</span>
          {af && <Labels oefening={o} />}
        </span>
      </a>
      <div className="training-acties">
        <button className="icoon-knop" aria-label={`${eigenNaam(o)} bewerken`} onClick={() => ga(`/eigen/${o.id}/tekenen`)}>
          <Icoon naam="potlood" maat={20} />
        </button>
        <button
          className="icoon-knop"
          aria-label={`${eigenNaam(o)} dupliceren`}
          onClick={() => {
            eigenOefeningen.dupliceer(o.id);
            opMelding('Kopie gemaakt');
          }}
        >
          <Icoon naam="kopieer" maat={20} />
        </button>
        <button
          className="icoon-knop gevaar"
          aria-label={`${eigenNaam(o)} verwijderen`}
          onClick={() => {
            if (window.confirm(`"${eigenNaam(o)}" verwijderen?`)) {
              eigenOefeningen.verwijder(o.id);
              opMelding('Oefening verwijderd');
            }
          }}
        >
          <Icoon naam="prullenbak" maat={20} />
        </button>
      </div>
    </li>
  );
}

export function EigenOefeningen() {
  const lijst = useEigenOefeningen();
  const [melding, toon] = useToast();
  return (
    <div className="pagina">
      <Kop titel="Eigen oefeningen" ouder="/" />
      <main className="inhoud smal">
        <button className="knop knop-primair knop-breed" onClick={() => ga('/eigen/nieuw')}>
          <Icoon naam="plus" maat={20} />
          Nieuwe oefening
        </button>
        {lijst.length === 0 ? (
          <div className="leeg">
            <p className="leeg-titel">Nog geen eigen oefeningen</p>
            <p>Teken je eigen oefening, of kopieer een oefening uit de bibliotheek (knop onder de oefening) en pas hem aan.</p>
          </div>
        ) : (
          <ul className="eigen-lijst">
            {lijst.map((o) => (
              <Regel key={o.id} o={o} opMelding={toon} />
            ))}
          </ul>
        )}
        <p className="voetnoot">Eigen oefeningen staan op dit toestel. Zit er een eigen oefening in een training die je deelt, dan gaat hij mee in de link.</p>
      </main>
      <Toast tekst={melding} />
    </div>
  );
}

const VELDEN: { type: VeldType; naam: string; uitleg: string }[] = [
  {
    type: 'leeg',
    naam: 'Leeg veld',
    uitleg: 'Een vak zonder lijnen, de maat kies je zelf',
  },
  {
    type: 'half',
    naam: 'Half veld',
    uitleg: '68 × 52,5 m, met goal en zestien',
  },
  { type: 'heel', naam: 'Heel veld', uitleg: '68 × 105 m' },
];

function Maat({ label, waarde, zet }: { label: string; waarde: number; zet: (v: number) => void }) {
  return (
    <div className="stapper">
      <span className="stapper-label">{label}</span>
      <div className="stapper-knoppen">
        <button type="button" onClick={() => zet(Math.max(5, waarde - 5))} disabled={waarde <= 5} aria-label={`${label} 5 meter kleiner`}>
          <Icoon naam="min" maat={20} />
        </button>
        <output aria-label={label}>{waarde} m</output>
        <button type="button" onClick={() => zet(Math.min(100, waarde + 5))} disabled={waarde >= 100} aria-label={`${label} 5 meter groter`}>
          <Icoon naam="plus" maat={20} />
        </button>
      </div>
    </div>
  );
}

/** Nieuwe oefening: voor veld of keepers, en welk veld. */
export function NieuweOefening() {
  const [soort, setSoort] = useState<Soort>('veld');
  const [veld, setVeld] = useState<VeldType>('leeg');
  const [breedte, setBreedte] = useState(30);
  const [lengte, setLengte] = useState(20);

  const maak = () => {
    const o = eigenOefeningen.bewaar(nieuweEigen(nieuweTekening(veld, breedte, lengte), soort));
    vervang(`/eigen/${o.id}/tekenen`);
  };

  return (
    <div className="pagina">
      <Kop titel="Nieuwe oefening" ouder="/eigen" />
      <main className="inhoud smal">
        <section className="blok">
          <h3>Voor</h3>
          <div className="keuze-twee" role="radiogroup" aria-label="Soort oefening">
            {(['veld', 'keeper'] as const).map((s) => (
              <button key={s} role="radio" aria-checked={soort === s} className={`keuze${soort === s ? ' aan' : ''}`} onClick={() => setSoort(s)}>
                <Icoon naam={s === 'veld' ? 'spelers' : 'keeper'} maat={20} />
                {SOORT_NAAM[s]}
              </button>
            ))}
          </div>
        </section>
        <section className="blok">
          <h3>Veld</h3>
          <div className="veld-keuzes" role="radiogroup" aria-label="Veld">
            {VELDEN.map((v) => (
              <button key={v.type} role="radio" aria-checked={veld === v.type} className={`veld-keuze${veld === v.type ? ' aan' : ''}`} onClick={() => setVeld(v.type)}>
                <span className={`veld-icoon veld-icoon-${v.type}`} aria-hidden="true" />
                <span>
                  <strong>{v.naam}</strong>
                  <span className="klein">{v.uitleg}</span>
                </span>
              </button>
            ))}
          </div>
          {veld === 'leeg' && (
            <div className="veld-maat">
              <Maat label="Breedte" waarde={breedte} zet={setBreedte} />
              <Maat label="Lengte" waarde={lengte} zet={setLengte} />
            </div>
          )}
        </section>
        <button className="knop knop-primair knop-breed" onClick={maak}>
          <Icoon naam="potlood" maat={20} />
          Beginnen met tekenen
        </button>
      </main>
    </div>
  );
}
