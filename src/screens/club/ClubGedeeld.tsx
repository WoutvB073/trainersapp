import { useMemo } from 'react';
import { AnimatieSpeler } from '../../anim/AnimatieSpeler';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { vindOefening } from '../../data/oefeningen';
import { leeftijdNaam } from '../../data/leeftijden';
import { ga } from '../../router';
import { clubNaam, groepNaam, partijvelden, rotatie, stationNaam, stations, stationTrainer, uitCode, veldTrainer, type Blok, type GedeeldeClub, type Station } from '../../clubtraining/clubtraining';
import { datumTekst } from '../../training/training';
import type { Oefening } from '../../model/types';
import { blokNaam, blokStijl, RotatieTabel, veldGroepen, VeldplanPartij, VeldplanStations } from './onderdelen';
import { t as vt } from '../../i18n/t';

function zoeker(g: GedeeldeClub) {
  return (id: string): Oefening | undefined => g.eigen?.find((o) => o.id === id) ?? vindOefening(id);
}

/** Uitleg, coachpunten en animatie van één oefening, alleen lezen. */
function OefeningBlokken({ o }: { o: Oefening }) {
  return (
    <>
      <div className="detail-media">
        <AnimatieSpeler tekening={o.tekening} />
      </div>
      <h2 className="detail-titel">{o.naam}</h2>
      <section className="blok">
        <h3>{vt('Uitleg')}</h3>
        <p>{o.uitleg}</p>
      </section>
      {o.organisatie && (
        <section className="blok">
          <h3>{vt('Organisatie')}</h3>
          <p>{o.organisatie}</p>
        </section>
      )}
      {o.coachpunten.length > 0 && (
        <section className="blok">
          <h3>{vt('Coachpunten')}</h3>
          <ul className="vinkjes">
            {o.coachpunten.map((c) => (
              <li key={c}>
                <Icoon naam="vink" maat={18} />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="blok">
        <h3>{vt('Benodigdheden')}</h3>
        <ul className="opsomming">
          {o.benodigdheden.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

function GeenLink() {
  return (
    <div className="pagina">
      <Kop titel={vt('Clubtraining')} />
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
function Plek({ code, kop, kleurBlok, regels, oefening }: { code: string; kop: string; kleurBlok: Blok; regels: string[]; oefening?: Oefening }) {
  return (
    <div className="pagina">
      <Kop titel={kop} ouder={`/c/${code}`} />
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

/** De link voor de trainers: alleen lezen, zonder inloggen. */
export function ClubGedeeld({ code, station, partij }: { code: string; station?: number; partij?: boolean }) {
  const g = useMemo(() => uitCode(code), [code]);
  if (!g) return <GeenLink />;
  const vind = zoeker(g);
  const lijst = stations(g.groepjes);
  const velden = partijvelden(g.groepjes);

  if (station) {
    const s = lijst.find((x) => x.nr === station);
    if (!s) return <GeenLink />;
    const id = g.blokken[s.vorm];
    const tr = stationTrainer(g, s.nr);
    return <Plek code={code} kop={vt('Station {nr}: {naam}', { nr: s.nr, naam: stationNaam(s, g.groepjes) })} kleurBlok={s.vorm} regels={[...(tr ? [vt('Trainer: {naam}', { naam: tr })] : []), ...wieOpStation(g, s)]} oefening={id ? vind(id) : undefined} />;
  }
  if (partij) {
    const id = g.blokken.partijvormen;
    return <Plek code={code} kop={blokNaam('partijvormen')} kleurBlok="partijvormen" regels={velden.map((v) => [vt('Veld {nr}', { nr: v.nr }), veldGroepen(v), veldTrainer(g, v.nr)].filter(Boolean).join(' · '))} oefening={id ? vind(id) : undefined} />;
  }

  return (
    <div className="pagina">
      <Kop titel={clubNaam(g)} />
      <main className="inhoud smal">
        <section className="blok gedeeld-kop">
          <p className="klein">{vt('Clubtraining')}</p>
          <h2 className="detail-titel">{clubNaam(g)}</h2>
          <p>{[g.datums.map((d) => datumTekst(d)).join(' · '), leeftijdNaam(g.leeftijd), vt('{g} groepjes', { g: g.groepjes })].filter(Boolean).join(' · ')}</p>
        </section>

        <h2 className="sectie-titel">{vt('Open jouw station')}</h2>
        <div className="club-station-knoppen">
          {lijst.map((s) => {
            const tr = stationTrainer(g, s.nr);
            return (
              <button key={s.nr} className="knop" onClick={() => ga(`/c/${code}/station/${s.nr}`)}>
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
          <button className="knop" onClick={() => ga(`/c/${code}/partij`)}>
            <span className="club-nr" style={blokStijl('partijvormen')}>
              P
            </span>
            <span className="club-station-naam">{blokNaam('partijvormen')}</span>
          </button>
        </div>

        <h2 className="sectie-titel">{vt('Veldplan deel 1: rondes 1–3')}</h2>
        <VeldplanStations c={g} vind={vind} opStation={(s) => ga(`/c/${code}/station/${s.nr}`)} />
        <h2 className="sectie-titel">{vt('Veldplan deel 2: laatste kwartier')}</h2>
        <VeldplanPartij c={g} vind={vind} opVeld={() => ga(`/c/${code}/partij`)} />
        <h2 className="sectie-titel">{vt('Rotatieschema')}</h2>
        <RotatieTabel c={g} />
      </main>
    </div>
  );
}
