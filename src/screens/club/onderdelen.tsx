import type { ReactNode } from 'react';
import { Miniatuur } from '../../components/Miniatuur';
import type { Oefening } from '../../model/types';
import {
  BLOK_KLEUR,
  blokNaam,
  groepNaam,
  partijvelden,
  RONDES,
  rotatie,
  stationNaam,
  stations,
  stationTrainer,
  stationVak,
  veldTrainer,
  veldVak,
  type Blok,
  type ClubTraining,
  type Partijveld,
  type Station,
  type Vak,
} from '../../clubtraining/clubtraining';
import { t as vt } from '../../i18n/t';

/** De delen van een clubtraining die het plan en de gedeelde weergave allebei tonen. */
export type ClubInhoud = Pick<ClubTraining, 'groepjes' | 'kinderen' | 'trainers' | 'blokken' | 'stationTrainers' | 'veldTrainers'>;
type Vind = (id: string) => Oefening | undefined;

const kleur = (b: Blok) => ({ background: BLOK_KLEUR[b].vlak, color: BLOK_KLEUR[b].tekst });
const plek = (v: Vak) => ({ left: `${v.x}%`, top: `${v.y}%`, width: `${v.b}%`, height: `${v.h}%` });

/** Staand half veld van bovenaf (goal boven, middenlijn onder). */
function HalfVeld({ children }: { children: ReactNode }) {
  return (
    <div className="club-veld">
      <svg viewBox="0 0 105 136" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke="#fff" strokeWidth="0.7" opacity="0.65">
          <rect x="1" y="1" width="103" height="134" />
          <rect x="23" y="1" width="59" height="33" />
          <rect x="39" y="1" width="27" height="11" />
          <path d="M38 34a16 16 0 0 0 29 0" />
          <path d="M34 135a18.3 18.3 0 0 1 37 0" />
        </g>
      </svg>
      {children}
    </div>
  );
}

function VakKaart({ vak, blok, nr, naam, trainer, oefening, sub, opTik }: { vak: Vak; blok: Blok; nr: string; naam: string; trainer?: string; oefening?: Oefening; sub?: string; opTik?: () => void }) {
  const inhoud = (
    <>
      <span className="club-vak-kop" style={kleur(blok)}>
        {nr && <b>{nr}</b>}
        <span>{naam}</span>
      </span>
      {oefening ? <Miniatuur tekening={oefening.tekening} className="club-vak-plaatje" /> : <span className="club-vak-leeg">{vt('Nog geen oefening')}</span>}
      {(sub || trainer) && <span className="club-vak-voet">{[sub, trainer].filter(Boolean).join(' · ')}</span>}
    </>
  );
  return opTik ? (
    <button type="button" className="club-vak" style={plek(vak)} onClick={opTik}>
      {inhoud}
    </button>
  ) : (
    <div className="club-vak" style={plek(vak)}>
      {inhoud}
    </div>
  );
}

/** Veldplan deel 1: de stations. */
export function VeldplanStations({ c, vind, opStation }: { c: ClubInhoud; vind: Vind; opStation?: (s: Station) => void }) {
  return (
    <HalfVeld>
      {stations(c.groepjes).map((s) => {
        const id = c.blokken[s.vorm];
        return <VakKaart key={s.nr} vak={stationVak(s, c.groepjes)} blok={s.vorm} nr={String(s.nr)} naam={stationNaam(s, c.groepjes)} trainer={stationTrainer(c, s.nr)} oefening={id ? vind(id) : undefined} opTik={opStation && (() => opStation(s))} />;
      })}
    </HalfVeld>
  );
}

export const veldGroepen = (v: Partijveld) => [...v.groepen.map(groepNaam), ...(v.metTrainer ? [vt('trainer')] : [])].join(' + ');

/** Veldplan deel 2: de partijvelden. */
export function VeldplanPartij({ c, vind, opVeld }: { c: ClubInhoud; vind: Vind; opVeld?: () => void }) {
  const velden = partijvelden(c.groepjes);
  const id = c.blokken.partijvormen;
  const o = id ? vind(id) : undefined;
  return (
    <>
      <HalfVeld>
        {velden.map((v) => (
          <VakKaart key={v.nr} vak={veldVak(v, velden.length)} blok="partijvormen" nr="" naam={vt('Veld {nr}', { nr: v.nr })} sub={veldGroepen(v)} trainer={veldTrainer(c, v.nr)} oefening={o} opTik={opVeld} />
        ))}
      </HalfVeld>
      <p className="klein club-noot">{velden.some((v) => v.metTrainer) ? vt('Oneven aantal groepjes: op het laatste veld verdeelt het groepje zich in twee teams en speelt de trainer mee als joker. Zo speelt iedereen en wacht niemand.') : vt('Twee groepjes per veld. Elk groepje is één team.')}</p>
    </>
  );
}

/** Rotatieschema: per groepje de stations in ronde 1–3 en daarna het partijveld. */
export function RotatieTabel({ c }: { c: ClubInhoud }) {
  const r = rotatie(c.groepjes);
  const velden = partijvelden(c.groepjes);
  const lijst = stations(c.groepjes);
  const leeg = lijst.length - c.groepjes;
  return (
    <>
      <div className="club-tabel-vak">
        <table className="club-tabel">
          <thead>
            <tr>
              <th scope="col">{vt('Groepje')}</th>
              {Array.from({ length: RONDES }, (_, i) => (
                <th key={i} scope="col">
                  {vt('Ronde {nr}', { nr: i + 1 })}
                </th>
              ))}
              <th scope="col">{vt('Partij')}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: c.groepjes }, (_, g) => (
              <tr key={g}>
                <th scope="row">{groepNaam(g)}</th>
                {r.map((ronde, i) => (
                  <td key={i}>
                    <span className="club-nr" style={kleur(ronde[g]!.vorm)}>
                      {ronde[g]!.nr}
                    </span>
                  </td>
                ))}
                <td>
                  <span className="club-nr" style={kleur('partijvormen')}>
                    {vt('Veld {nr}', { nr: velden.find((v) => v.groepen.includes(g))!.nr })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="club-legenda">
        {lijst.map((s) => {
          const tr = stationTrainer(c, s.nr);
          return (
            <li key={s.nr}>
              <span className="club-nr" style={kleur(s.vorm)}>
                {s.nr}
              </span>
              {stationNaam(s, c.groepjes)}
              {tr ? ` · ${tr}` : ''}
            </li>
          );
        })}
      </ul>
      {leeg > 0 && <p className="klein club-noot">{vt('Met {g} groepjes staan er {s} stations, zodat elk groepje elke vorm één keer doet. Per ronde blijven er {l} leeg.', { g: c.groepjes, s: lijst.length, l: leeg })}</p>}
    </>
  );
}

/** Wie staat waar in deze ronde (timer). */
export function RondeLijst({ c, ronde }: { c: ClubInhoud; ronde: number }) {
  const r = rotatie(c.groepjes)[ronde]!;
  return (
    <ul className="club-ronde">
      {r.map((s, g) => (
        <li key={g}>
          <b>{groepNaam(g)}</b>
          <span className="club-nr" style={kleur(s.vorm)}>
            {s.nr}
          </span>
          {stationNaam(s, c.groepjes)}
        </li>
      ))}
    </ul>
  );
}

export const blokStijl = kleur;
export { blokNaam };
