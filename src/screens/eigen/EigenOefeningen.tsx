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
import { lijstTekst, t } from '../../i18n/t';

export const eigenNaam = (o: Pick<EigenOefening, 'naam'>) => o.naam.trim() || t('Naamloze oefening');

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
          <span className="kaart-uitleg">
            {af ? `${SOORT_NAAM[o.soort]} · ${o.uitleg || t('Eigen oefening')}` : t('Nog niet in de bibliotheek: {wat}.', { wat: lijstTekst(ontbreekt(o)).toLowerCase() })}
          </span>
          {af && <Labels oefening={o} />}
        </span>
      </a>
      <div className="training-acties">
        <button className="icoon-knop" aria-label={t('{w0} bewerken', { w0: eigenNaam(o) })} onClick={() => ga(`/eigen/${o.id}/tekenen`)}>
          <Icoon naam="potlood" maat={20} />
        </button>
        <button
          className="icoon-knop"
          aria-label={t('{w0} dupliceren', { w0: eigenNaam(o) })}
          onClick={() => {
            eigenOefeningen.dupliceer(o.id);
            opMelding(t('Kopie gemaakt'));
          }}
        >
          <Icoon naam="kopieer" maat={20} />
        </button>
        <button
          className="icoon-knop gevaar"
          aria-label={t('{w0} verwijderen', { w0: eigenNaam(o) })}
          onClick={() => {
            if (window.confirm(t('"{w0}" verwijderen?', { w0: eigenNaam(o) }))) {
              eigenOefeningen.verwijder(o.id);
              opMelding(t('Oefening verwijderd'));
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
      <Kop titel={t('Eigen oefeningen')} ouder="/" />
      <main className="inhoud smal">
        <button className="knop knop-primair knop-breed" onClick={() => ga('/eigen/nieuw')}>
          <Icoon naam="plus" maat={20} />
          {t('Nieuwe oefening')}
        </button>
        {lijst.length === 0 ? (
          <div className="leeg">
            <p className="leeg-titel">{t('Nog geen eigen oefeningen')}</p>
            <p>{t('Teken je eigen oefening, of kopieer een oefening uit de bibliotheek (knop onder de oefening) en pas hem aan.')}</p>
          </div>
        ) : (
          <ul className="eigen-lijst">
            {lijst.map((o) => (
              <Regel key={o.id} o={o} opMelding={toon} />
            ))}
          </ul>
        )}
        <p className="voetnoot">{t('Eigen oefeningen staan op dit toestel. Zit er een eigen oefening in een training die je deelt, dan gaat hij mee in de link.')}</p>
      </main>
      <Toast tekst={melding} />
    </div>
  );
}

const VELDEN: { type: VeldType; naam: string; uitleg: string }[] = [
  {
    type: 'leeg',
    naam: t('Leeg veld'),
    uitleg: t('Een vak zonder lijnen, de maat kies je zelf'),
  },
  {
    type: 'half',
    naam: t('Half veld'),
    uitleg: t('68 × 52,5 m, met goal en zestien'),
  },
  { type: 'heel', naam: t('Heel veld'), uitleg: '68 × 105 m' },
];

function Maat({ label, waarde, zet }: { label: string; waarde: number; zet: (v: number) => void }) {
  return (
    <div className="stapper">
      <span className="stapper-label">{label}</span>
      <div className="stapper-knoppen">
        <button type="button" onClick={() => zet(Math.max(5, waarde - 5))} disabled={waarde <= 5} aria-label={t('{label} 5 meter kleiner', { label })}>
          <Icoon naam="min" maat={20} />
        </button>
        <output aria-label={label}>{waarde} m</output>
        <button type="button" onClick={() => zet(Math.min(100, waarde + 5))} disabled={waarde >= 100} aria-label={t('{label} 5 meter groter', { label })}>
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
  // Telefoon: staand veld (past beter op het scherm); tablet en laptop: liggend.
  const [staand] = useState(() => typeof window !== 'undefined' && window.innerWidth < 600 && window.innerHeight > window.innerWidth);
  const [breedte, setBreedte] = useState(staand ? 20 : 30);
  const [lengte, setLengte] = useState(staand ? 30 : 20);

  const maak = () => {
    const o = eigenOefeningen.bewaar(nieuweEigen(nieuweTekening(veld, breedte, lengte), soort));
    vervang(`/eigen/${o.id}/tekenen`);
  };

  return (
    <div className="pagina">
      <Kop titel={t('Nieuwe oefening')} ouder="/eigen" />
      <main className="inhoud smal">
        <section className="blok">
          <h3>{t('Voor')}</h3>
          <div className="keuze-twee" role="radiogroup" aria-label={t('Soort oefening')}>
            {(['veld', 'keeper'] as const).map((s) => (
              <button key={s} role="radio" aria-checked={soort === s} className={`keuze${soort === s ? ' aan' : ''}`} onClick={() => setSoort(s)}>
                <Icoon naam={s === 'veld' ? 'spelers' : 'keeper'} maat={20} />
                {SOORT_NAAM[s]}
              </button>
            ))}
          </div>
        </section>
        <section className="blok">
          <h3>{t('Veld')}</h3>
          <div className="veld-keuzes" role="radiogroup" aria-label={t('Veld')}>
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
              <Maat label={t('Breedte')} waarde={breedte} zet={setBreedte} />
              <Maat label={t('Lengte')} waarde={lengte} zet={setLengte} />
            </div>
          )}
        </section>
        <button className="knop knop-primair knop-breed" onClick={maak}>
          <Icoon naam="potlood" maat={20} />
          {t('Beginnen met tekenen')}
        </button>
      </main>
    </div>
  );
}
