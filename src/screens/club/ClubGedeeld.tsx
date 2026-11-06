import { useMemo, type ReactNode } from 'react';
import { Kop } from '../../components/Kop';
import { OefeningBlokken } from '../../components/OefeningBlokken';
import { vindOefening } from '../../data/oefeningen';
import { leeftijdNaam } from '../../data/leeftijden';
import { ga } from '../../router';
import { clubNaam, clubPlan, groepNaam, materiaal, partijvelden, rondeTijd, stationNaam, stationTrainer, tijdTekst, uitCode, veldTrainer, vindOnderdeel, type GedeeldeClub, type MateriaalRegel, type Onderdeel, type Station } from '../../clubtraining/clubtraining';
import { datumTekst } from '../../training/training';
import type { Oefening } from '../../model/types';
import { blokNaam, blokStijl, faseTitel, RotatieTabel, veldGroepen, VeldplanSamen, VeldplanStations } from './onderdelen';
import { LinkFout } from '../GedeeldLink';
import { t as vt } from '../../i18n/t';

function zoeker(g: GedeeldeClub) {
  return (id: string): Oefening | undefined => g.eigen?.find((o) => o.id === id) ?? vindOefening(id);
}

/** Eén station of de partijvelden, voor de trainer die daar staat. */
function Plek({ ouder, kop, kleurBlok, regels, oefening }: { ouder: string; kop: string; kleurBlok: string; regels: string[]; oefening?: Oefening }) {
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

/** Per ronde waarin dit station meedoet: wanneer en welk groepje. */
const wieOpStation = (g: GedeeldeClub, s: Station) =>
  clubPlan(g)
    .rondes.filter((r) => r.plekken.some((x) => x.nr === s.nr))
    .map((r) => vt('Ronde {nr}: groepje {g}', { nr: r.nr, g: groepNaam(r.plekken.findIndex((x) => x.nr === s.nr)) }) + ` (${rondeTijd(r, g.starttijd)})`);

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
      <MateriaalBlok titel={vt('Stations')} regels={m.stations} />
      <MateriaalBlok titel={clubPlan(g).samen.every((o) => o.categorie === 'partijvormen') ? vt('Extra voor de partijvelden') : vt('Extra voor de samen-onderdelen')} regels={m.extra} />
    </>
  );
}

/**
 * Een circuittraining bekijken, alleen lezen: stations, veldplan, rotatie en per station de oefening. Gebruikt door de link
 * voor de trainers en door de gedeelde circuittraining in een team. `basis` = adres van deze pagina.
 */
export function ClubWeergave({ g, basis, station, partij, kop, ouder, label, metMateriaal, children }: { g: GedeeldeClub; basis: string; station?: number; partij?: true | number; kop?: string; ouder?: string; label?: string; metMateriaal?: boolean; children?: ReactNode }) {
  const vind = zoeker(g);
  const plan = clubPlan(g);
  const lijst = plan.stations;
  const velden = partijvelden(g.groepjes);
  const samenPad = (i: number) => (i === 0 ? `${basis}/partij` : `${basis}/partij/${i + 1}`);
  const samenRegels = (o: Onderdeel) => (o.categorie === 'partijvormen' ? velden.map((v) => [vt('Veld {nr}', { nr: v.nr }), veldGroepen(v), veldTrainer(g, v.nr)].filter(Boolean).join(' · ')) : [vt('Alle groepjes samen')]);

  if (station) {
    const s = lijst.find((x) => x.nr === station);
    if (!s) return <LinkFout />;
    const id = vindOnderdeel(g, s.onderdeel)?.oefening;
    const tr = stationTrainer(g, s.nr);
    return <Plek ouder={basis} kop={vt('Station {nr}: {naam}', { nr: s.nr, naam: stationNaam(s) })} kleurBlok={s.vorm} regels={[...(tr ? [vt('Trainer: {naam}', { naam: tr })] : []), ...wieOpStation(g, s)]} oefening={id ? vind(id) : undefined} />;
  }
  if (partij) {
    const o = plan.samen[partij === true ? 0 : partij - 1];
    if (!o) return <LinkFout />;
    return <Plek ouder={basis} kop={blokNaam(o.categorie)} kleurBlok={o.categorie} regels={samenRegels(o)} oefening={o.oefening ? vind(o.oefening) : undefined} />;
  }

  return (
    <div className="pagina">
      <Kop titel={kop ?? clubNaam(g)} ouder={ouder} />
      <main className="inhoud smal">
        <section className="blok gedeeld-kop">
          <p className="klein">{label ?? vt('Circuittraining')}</p>
          <h2 className="detail-titel">{clubNaam(g)}</h2>
          <p>{[g.datums.map((d) => datumTekst(d)).join(' · '), leeftijdNaam(g.leeftijd), vt('{g} groepjes', { g: g.groepjes }), tijdTekst(plan.totaal)].filter(Boolean).join(' · ')}</p>
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
                  {stationNaam(s)}
                  {tr && <small>{tr}</small>}
                </span>
              </button>
            );
          })}
          {plan.samen.map((o, i) => (
            <button key={o.id} className="knop" onClick={() => ga(samenPad(i))}>
              <span className="club-nr" style={blokStijl(o.categorie)}>
                {o.categorie === 'partijvormen' ? 'P' : 'S'}
              </span>
              <span className="club-station-naam">{blokNaam(o.categorie)}</span>
            </button>
          ))}
        </div>

        {plan.fases.map((f) => (
          <div key={f.nr}>
            <h2 className="sectie-titel">{faseTitel(f, plan)}</h2>
            <VeldplanStations c={g} fase={f} vind={vind} opStation={(s) => ga(`${basis}/station/${s.nr}`)} />
          </div>
        ))}
        {plan.samen.map((o, i) => (
          <div key={o.id}>
            <h2 className="sectie-titel">{`${blokNaam(o.categorie)} · ${tijdTekst(o.duur * 60)}`}</h2>
            <VeldplanSamen c={g} onderdeel={o} vind={vind} opVeld={() => ga(samenPad(i))} />
          </div>
        ))}
        <h2 className="sectie-titel">{vt('Rotatieschema')}</h2>
        <RotatieTabel c={g} />
        {metMateriaal && <MateriaalLijst g={g} />}
      </main>
    </div>
  );
}

/** De link voor de trainers: alleen lezen, zonder inloggen. */
export function ClubGedeeld({ code, basis, station, partij }: { code: string; basis?: string; station?: number; partij?: true | number }) {
  const g = useMemo(() => uitCode(code), [code]);
  return g ? <ClubWeergave g={g} basis={basis ?? `/c/${code}`} station={station} partij={partij} /> : <LinkFout />;
}
