import { useMemo, type ReactNode } from 'react';
import { Kop } from '../../components/Kop';
import { OefeningBlokken } from '../../components/OefeningBlokken';
import { vindOefening } from '../../data/oefeningen';
import { leeftijdNaam } from '../../data/leeftijden';
import { ga } from '../../router';
import { clubNaam, groepNaam, materiaal, partijvelden, rotatie, stationNaam, stations, stationTrainer, uitCode, veldTrainer, type Blok, type GedeeldeClub, type MateriaalRegel, type Station } from '../../clubtraining/clubtraining';
import { datumTekst } from '../../training/training';
import type { Oefening } from '../../model/types';
import { blokNaam, blokStijl, RotatieTabel, veldGroepen, VeldplanPartij, VeldplanStations } from './onderdelen';
import { t as vt } from '../../i18n/t';

function zoeker(g: GedeeldeClub) {
  return (id: string): Oefening | undefined => g.eigen?.find((o) => o.id === id) ?? vindOefening(id);
}

function GeenLink() {
  return (
    <div className="pagina">
      <Kop titel={vt('Circuittraining')} />
      <main className="inhoud smal">
        <div className="leeg">
          <p className="leeg-titel">{vt('Deze link klopt niet')}</p>
          <p>{vt('Vraag de trainer om de link opnieuw te sturen.')}</p>
        </div>
      </main>
    </div>
  );
}

/** Eén station of de partijvelden, voor de trainer die daar staat. */
function Plek({ ouder, kop, kleurBlok, regels, oefening }: { ouder: string; kop: string; kleurBlok: Blok; regels: string[]; oefening?: Oefening }) {
  return (
    <div className="pagina">
      <Kop titel={kop} ouder={ouder} />
      <main className="inhoud smal">
        <section className="blok club-plek" style={{ borderLeftColor: blokStijl(kleurBlok).background }}>
          <p className="club-plek-blok">{blokNaam(kleurBlok)}</p>
          {regels.map((r) => (
            <p key={r} className="klein">
              {r}
            </p>
          ))}
        </section>
        {oefening ? <OefeningBlokken o={oefening} /> : <p className="leeg">{vt('Nog geen oefening')}</p>}
      </main>
    </div>
  );
}

const wieOpStation = (g: GedeeldeClub, s: Station) => rotatie(g.groepjes).map((ronde, i) => vt('Ronde {nr}: groepje {g}', { nr: i + 1, g: ronde.findIndex((x) => x.nr === s.nr) < 0 ? '–' : groepNaam(ronde.findIndex((x) => x.nr === s.nr)) }));

function MateriaalBlok({ titel, regels }: { titel: string; regels: MateriaalRegel[] }) {
  return (
    <section className="blok">
      <h3>{titel}</h3>
      {regels.length === 0 ? (
        <p className="klein">{vt('Niets extra nodig.')}</p>
      ) : (
        <ul className="klaarzetten">
          {regels.map((r) => (
            <li key={r.sleutel}>
              <strong>{r.tekst}</strong>
              <span>{r.bij.join(', ')}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MateriaalLijst({ g }: { g: GedeeldeClub }) {
  const m = useMemo(() => materiaal(g, zoeker(g)), [g]);
  return (
    <>
      <h2 className="sectie-titel">{vt('Materiaal')}</h2>
      <MateriaalBlok titel={vt('Stations (rondes 1–3)')} regels={m.stations} />
      <MateriaalBlok titel={vt('Extra voor de partijvelden')} regels={m.extra} />
    </>
  );
}

/**
 * Een circuittraining bekijken, alleen lezen: stations, veldplan, rotatie en per station de oefening. Gebruikt door de link
 * voor de trainers en door de gedeelde circuittraining in een team. `basis` = adres van deze pagina.
 */
export function ClubWeergave({ g, basis, station, partij, kop, ouder, label, metMateriaal, children }: { g: GedeeldeClub; basis: string; station?: number; partij?: boolean; kop?: string; ouder?: string; label?: string; metMateriaal?: boolean; children?: ReactNode }) {
  const vind = zoeker(g);
  const lijst = stations(g.groepjes);
  const velden = partijvelden(g.groepjes);

  if (station) {
    const s = lijst.find((x) => x.nr === station);
    if (!s) return <GeenLink />;
    const id = g.blokken[s.vorm];
    const tr = stationTrainer(g, s.nr);
    return <Plek ouder={basis} kop={vt('Station {nr}: {naam}', { nr: s.nr, naam: stationNaam(s, g.groepjes) })} kleurBlok={s.vorm} regels={[...(tr ? [vt('Trainer: {naam}', { naam: tr })] : []), ...wieOpStation(g, s)]} oefening={id ? vind(id) : undefined} />;
  }
  if (partij) {
    const id = g.blokken.partijvormen;
    return <Plek ouder={basis} kop={blokNaam('partijvormen')} kleurBlok="partijvormen" regels={velden.map((v) => [vt('Veld {nr}', { nr: v.nr }), veldGroepen(v), veldTrainer(g, v.nr)].filter(Boolean).join(' · '))} oefening={id ? vind(id) : undefined} />;
  }

  return (
    <div className="pagina">
      <Kop titel={kop ?? clubNaam(g)} ouder={ouder} />
      <main className="inhoud smal">
        <section className="blok gedeeld-kop">
          <p className="klein">{label ?? vt('Circuittraining')}</p>
          <h2 className="detail-titel">{clubNaam(g)}</h2>
          <p>{[g.datums.map((d) => datumTekst(d)).join(' · '), leeftijdNaam(g.leeftijd), vt('{g} groepjes', { g: g.groepjes })].filter(Boolean).join(' · ')}</p>
          {children}
        </section>

        <h2 className="sectie-titel">{vt('Open jouw station')}</h2>
        <div className="club-station-knoppen">
          {lijst.map((s) => {
            const tr = stationTrainer(g, s.nr);
            return (
              <button key={s.nr} className="knop" onClick={() => ga(`${basis}/station/${s.nr}`)}>
                <span className="club-nr" style={blokStijl(s.vorm)}>
                  {s.nr}
                </span>
                <span className="club-station-naam">
                  {stationNaam(s, g.groepjes)}
                  {tr && <small>{tr}</small>}
                </span>
              </button>
            );
          })}
          <button className="knop" onClick={() => ga(`${basis}/partij`)}>
            <span className="club-nr" style={blokStijl('partijvormen')}>
              P
            </span>
            <span className="club-station-naam">{blokNaam('partijvormen')}</span>
          </button>
        </div>

        <h2 className="sectie-titel">{vt('Veldplan deel 1: rondes 1–3')}</h2>
        <VeldplanStations c={g} vind={vind} opStation={(s) => ga(`${basis}/station/${s.nr}`)} />
        <h2 className="sectie-titel">{vt('Veldplan deel 2: laatste kwartier')}</h2>
        <VeldplanPartij c={g} vind={vind} opVeld={() => ga(`${basis}/partij`)} />
        <h2 className="sectie-titel">{vt('Rotatieschema')}</h2>
        <RotatieTabel c={g} />
        {metMateriaal && <MateriaalLijst g={g} />}
      </main>
    </div>
  );
}

/** De link voor de trainers: alleen lezen, zonder inloggen. */
export function ClubGedeeld({ code, station, partij }: { code: string; station?: number; partij?: boolean }) {
  const g = useMemo(() => uitCode(code), [code]);
  return g ? <ClubWeergave g={g} basis={`/c/${code}`} station={station} partij={partij} /> : <GeenLink />;
}
