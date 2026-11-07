import { useMemo, useState, type ReactNode } from 'react';
import { Kop } from '../../components/Kop';
import { vindOefening } from '../../data/oefeningen';
import { leeftijdNaam } from '../../data/leeftijden';
import { ga } from '../../router';
import { clubNaam, clubPlan, groepNaam, materiaal, mijnRondes, oefeningenVan, oefeningTijden, partijvelden, rondePlekken, rondeTijd, samenPloeg, stationNaam, stationPloeg, tijdTekst, trainerModus, trainerNamen, uitCode, veldPloeg, vindOnderdeel, type GedeeldeClub, type MateriaalRegel, type Onderdeel, type Station } from '../../clubtraining/clubtraining';
import { datumTekst } from '../../training/training';
import type { Oefening } from '../../model/types';
import { BlokOefeningen, blokNaam, blokStijl, faseTitel, MateriaalNoot, oefeningNummers, ploegTekst, RotatieTabel, veldGroepen, VeldplanSamen, VeldplanStations } from './onderdelen';
import { LinkFout } from '../GedeeldLink';
import { t as vt } from '../../i18n/t';

function zoeker(g: GedeeldeClub) {
  return (id: string): Oefening | undefined => g.eigen?.find((o) => o.id === id) ?? vindOefening(id);
}

/** Eén station of de partijvelden, voor de trainer die daar staat. */
function Plek({ ouder, kop, kleurBlok, regels, onderdeel, vind }: { ouder: string; kop: string; kleurBlok: string; regels: string[]; onderdeel?: Onderdeel; vind: (id: string) => Oefening | undefined }) {
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
        {onderdeel ? <BlokOefeningen onderdeel={onderdeel} vind={vind} /> : <p className="leeg">{vt('Nog geen oefening')}</p>}
      </main>
    </div>
  );
}

/** Per ronde waarin dit station meedoet: wanneer, welk groepje, en de trainers als die meelopen. */
const wieOpStation = (g: GedeeldeClub, s: Station) =>
  clubPlan(g)
    .rondes.filter((r) => r.plekken.some((x) => x.nr === s.nr))
    .map((r) => {
      const ploeg = trainerModus(g) === 'groepje' ? ploegTekst(rondePlekken(g, r).find((p) => p.station?.nr === s.nr)?.trainers ?? []) : '';
      return [vt('Ronde {nr}: groepje {g}', { nr: r.nr, g: groepNaam(r.plekken.findIndex((x) => x.nr === s.nr)) }) + ` (${rondeTijd(r, g.starttijd)})`, ploeg].filter(Boolean).join(' · ');
    });

const IK_BEN = 'trainersapp.ikBen';

function leesIk(): string {
  try {
    return localStorage.getItem(IK_BEN) ?? '';
  } catch {
    return '';
  }
}

function bewaarIk(naam: string) {
  try {
    if (naam) localStorage.setItem(IK_BEN, naam);
    else localStorage.removeItem(IK_BEN);
  } catch {
    /* niet erg: dan kies je het de volgende keer opnieuw */
  }
}

/** "Ik ben…": je eigen plekken en oefeningen per ronde. Wordt op dit toestel onthouden. */
function MijnRondes({ g, ik, vind, opStation, opSamen }: { g: GedeeldeClub; ik: string; vind: (id: string) => Oefening | undefined; opStation: (nr: number) => void; opSamen: (o: Onderdeel) => void }) {
  return (
    <>
      <h2 className="sectie-titel">{vt('Jouw rondes')}</h2>
      <ol className="club-mijn">
        {mijnRondes(g, ik).map(({ ronde, plek, leeg }) => {
          const o = plek?.onderdeel;
          const tijden = o ? oefeningTijden(o) : [];
          const lijst = o ? oefeningenVan(o) : [];
          const andere = plek?.trainers.filter((n) => n !== ik) ?? [];
          const inhoud = (
            <>
              <span className="club-mijn-ronde">
                <b>{vt('Ronde {nr}', { nr: ronde.nr })}</b>
                <span>{rondeTijd(ronde, g.starttijd)}</span>
              </span>
              <strong>{plek ? plek.naam : leeg ? vt('{w0} staat leeg', { w0: stationNaam(leeg) }) : vt('Geen plek in deze ronde')}</strong>
              {plek && <small>{plek.groepen.length === g.groepjes ? vt('Alle groepjes samen') : vt('Groepje {g}', { g: plek.groepen.map(groepNaam).join(' + ') })}</small>}
              {andere.length > 0 && <small>{vt('Samen met: {w0}', { w0: ploegTekst(andere) })}</small>}
              {plek && lijst.length === 0 && <small>{vt('Nog geen oefening')}</small>}
              {lijst.map((x, i) => (
                <small key={x.oefening}>{[lijst.length > 1 ? vt('Oefening {nr}', { nr: i + 1 }) : '', vind(x.oefening)?.naam, lijst.length > 1 ? vt('{m} min', { m: tijden[i]! }) : ''].filter(Boolean).join(' · ')}</small>
              ))}
            </>
          );
          return (
            <li key={ronde.nr}>
              {plek ? (
                <button type="button" className="club-mijn-kaart" onClick={() => (plek.station ? opStation(plek.station.nr) : opSamen(plek.onderdeel!))}>
                  {inhoud}
                </button>
              ) : (
                <div className="club-mijn-kaart club-mijn-vrij">{inhoud}</div>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}

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
      <MateriaalNoot c={g} />
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
  const namen = trainerNamen(g);
  const [ikKeuze, setIk] = useState(leesIk);
  const ik = namen.includes(ikKeuze) ? ikKeuze : '';
  const meelopen = trainerModus(g) === 'groepje';
  const opIk = (s: Station) => !!ik && (meelopen ? mijnRondes(g, ik).some((m) => m.plek?.station?.nr === s.nr) : stationPloeg(g, s.nr).includes(ik));
  const velden = partijvelden(g.groepjes);
  const samenPad = (i: number) => (i === 0 ? `${basis}/partij` : `${basis}/partij/${i + 1}`);
  const samenRegels = (o: Onderdeel) => (o.categorie === 'partijvormen' ? velden.map((v) => [vt('Veld {nr}', { nr: v.nr }), veldGroepen(v), ploegTekst(veldPloeg(g, v.nr))].filter(Boolean).join(' · ')) : [[vt('Alle groepjes samen'), ploegTekst(samenPloeg(g, o))].filter(Boolean).join(' · ')]);

  if (station) {
    const s = lijst.find((x) => x.nr === station);
    if (!s) return <LinkFout />;
    const ploeg = stationPloeg(g, s.nr);
    return <Plek ouder={basis} kop={vt('Station {nr}: {naam}', { nr: s.nr, naam: stationNaam(s) })} kleurBlok={s.vorm} regels={[...(ploeg.length ? [vt('Trainers: {naam}', { naam: ploegTekst(ploeg) })] : []), ...wieOpStation(g, s)]} onderdeel={vindOnderdeel(g, s.onderdeel)} vind={vind} />;
  }
  if (partij) {
    const o = plan.samen[partij === true ? 0 : partij - 1];
    if (!o) return <LinkFout />;
    return <Plek ouder={basis} kop={blokNaam(o.categorie)} kleurBlok={o.categorie} regels={samenRegels(o)} onderdeel={o} vind={vind} />;
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
          {namen.length > 0 && (
            <label className="leeftijd-keuze club-ik-ben">
              <span>{vt('Ik ben…')}</span>
              <select
                value={ik}
                onChange={(e) => {
                  setIk(e.target.value);
                  bewaarIk(e.target.value);
                }}
              >
                <option value="">{vt('Kies je naam')}</option>
                {namen.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          )}
        </section>

        {ik && <MijnRondes g={g} ik={ik} vind={vind} opStation={(nr) => ga(`${basis}/station/${nr}`)} opSamen={(o) => ga(samenPad(plan.samen.indexOf(o)))} />}

        <h2 className="sectie-titel">{vt('Open jouw station')}</h2>
        <div className="club-station-knoppen">
          {lijst.map((s) => {
            const tr = ploegTekst(stationPloeg(g, s.nr));
            return (
              <button key={s.nr} className={`knop${opIk(s) ? ' club-ik' : ''}`} onClick={() => ga(`${basis}/station/${s.nr}`)}>
                <span className="club-nr" style={blokStijl(s.vorm)}>
                  {s.nr}
                </span>
                <span className="club-station-naam">
                  {stationNaam(s)}
                  {[tr, oefeningNummers(vindOnderdeel(g, s.onderdeel))].filter(Boolean).map((x) => (
                    <small key={x}>{x}</small>
                  ))}
                </span>
              </button>
            );
          })}
          {plan.samen.map((o, i) => (
            <button key={o.id} className="knop" onClick={() => ga(samenPad(i))}>
              <span className="club-nr" style={blokStijl(o.categorie)}>
                {o.categorie === 'partijvormen' ? 'P' : 'S'}
              </span>
              <span className="club-station-naam">
                {blokNaam(o.categorie)}
                {oefeningenVan(o).length > 1 && <small>{oefeningNummers(o)}</small>}
              </span>
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
        <RotatieTabel c={g} ik={ik} />
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
