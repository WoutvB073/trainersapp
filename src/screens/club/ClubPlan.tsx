import { useMemo, useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { vindOefening } from '../../data/oefeningen';
import { ga } from '../../router';
import { blokNaam, clubNaam, clubPlan, leeftijdMelding, materiaal, materiaalAvond, oefeningenVan, opDag, sessiesOpDatum, sessieTekst, tijdTekst, trainerNamen, vindOnderdeel, zetDagTrainers, type ClubTraining, type MateriaalRegel, type Onderdeel } from '../../clubtraining/clubtraining';
import { clubtrainingen, useClub } from '../../clubtraining/opslag';
import { NietGevonden } from '../NietGevonden';
import { faseTitel, MateriaalNoot, PlanNoot, RotatieTabel, VeldplanSamen, VeldplanStations } from './onderdelen';
import { SamenTrainers, StationTrainers } from './trainers';
import { DagKeuze, useDag } from './dag';
import { t as vt } from '../../i18n/t';

type Tab = 'deel1' | 'deel2' | 'rotatie' | 'materiaal';

function Regels({ titel, regels, c, zet }: { titel: string; regels: MateriaalRegel[]; c: ClubTraining; zet: (afgevinkt: string[]) => void }) {
  return (
    <section className="blok">
      <h3>{titel}</h3>
      {regels.length === 0 ? (
        <p className="klein">{vt('Niets extra nodig.')}</p>
      ) : (
        <ul className="club-afvink">
          {regels.map((r) => {
            const aan = c.afgevinkt.includes(r.sleutel);
            return (
              <li key={r.sleutel}>
                <label className={aan ? 'aan' : ''}>
                  <input type="checkbox" checked={aan} onChange={() => zet(aan ? c.afgevinkt.filter((k) => k !== r.sleutel) : [...c.afgevinkt, r.sleutel])} />
                  <span>
                    {r.tekst}
                    <small>{r.bij.join(', ')}</small>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function ClubPlan({ id }: { id: string }) {
  const c = useClub(id);
  const [tab, setTab] = useState<Tab>('deel1');
  const [dag, kiesDag] = useDag(c);
  // Sinds 0.34.3 kan een dag een eigen opzet hebben: plan en materiaal van de gekozen dag.
  const m = useMemo(() => (c ? materiaal(opDag(c, dag), vindOefening) : null), [c, dag]);
  // Meer sessies op dezelfde datum (0.34.4): ook wat er voor de hele avond nodig is (het meeste in één sessie).
  const avond = useMemo(() => {
    if (!c) return null;
    const sessies = sessiesOpDatum(c, dag);
    return sessies.length > 1 ? { sessies, regels: materiaalAvond(sessies.map((i) => opDag(c, i)), vindOefening) } : null;
  }, [c, dag]);
  if (!c || !m) return <NietGevonden />;

  const zet = (w: Partial<ClubTraining>) => clubtrainingen.bewaar({ ...(clubtrainingen.haal(id) ?? c), ...w });
  // De gekozen dag: trainers, en (0.34.3) eventueel een eigen opzet.
  const cd = opDag(c, dag);
  const plan = clubPlan(cd);
  const open = (o?: Onderdeel) => {
    if (o && oefeningenVan(o).length > 1) ga(`/club/${id}/blok/${o.id}`);
    else if (o?.oefening) ga(`/oefening/${o.oefening}`);
  };
  const alleenPartij = plan.samen.every((o) => o.categorie === 'partijvormen');
  const heeftTrainers = trainerNamen(cd).length > 0;
  const nu = () => opDag(clubtrainingen.haal(id) ?? c, dag);
  const bewaarKeuzes = (trainerKeuzes: NonNullable<ClubTraining['trainerKeuzes']>) => zet(zetDagTrainers(clubtrainingen.haal(id) ?? c, dag, { trainerKeuzes }));
  const alle = [...m.stations, ...m.extra];
  const klaar = alle.filter((r) => c.afgevinkt.includes(r.sleutel)).length;
  const tabs: [Tab, string][] = [
    ...(plan.stations.length ? ([['deel1', vt('Stations')]] as [Tab, string][]) : []),
    ...(plan.samen.length ? ([['deel2', alleenPartij ? vt('Partij') : vt('Samen')]] as [Tab, string][]) : []),
    ['rotatie', vt('Rotatie')],
    ['materiaal', vt('Materiaal')],
  ];
  const actief = tabs.some(([k]) => k === tab) ? tab : tabs[0]![0];

  return (
    <div className="pagina">
      <Kop titel={clubNaam(c)} ouder={`/club/${id}`} />
      <main className="inhoud smal">
        <DagKeuze c={c} dag={dag} opKies={kiesDag} />
        {leeftijdMelding(cd, vindOefening) && (
          <p className="klein club-noot club-melding" role="note">
            {leeftijdMelding(cd, vindOefening)}
          </p>
        )}
        <div className={`tabs club-tabs club-tabs-${tabs.length}`} role="tablist">
          {tabs.map(([k, naam]) => (
            <button key={k} role="tab" aria-selected={actief === k} className={actief === k ? 'aan' : ''} onClick={() => setTab(k)}>
              {naam}
            </button>
          ))}
        </div>

        {actief === 'deel1' && (
          <>
            {plan.fases.map((f) => (
              <div key={f.nr}>
                <h2 className="sectie-titel">{faseTitel(f, plan)}</h2>
                <VeldplanStations c={cd} fase={f} vind={vindOefening} opStation={(s) => open(vindOnderdeel(c, s.onderdeel))} />
              </div>
            ))}
            <PlanNoot c={cd} />
            {heeftTrainers && <StationTrainers c={cd} nu={nu} bewaar={bewaarKeuzes} />}
          </>
        )}

        {actief === 'deel2' && (
          <>
            {plan.samen.map((o) => (
              <div key={o.id}>
                <h2 className="sectie-titel">{`${blokNaam(o.categorie)} · ${tijdTekst(o.duur * 60)}`}</h2>
                <VeldplanSamen c={cd} onderdeel={o} vind={vindOefening} opVeld={() => open(o)} />
              </div>
            ))}
            {heeftTrainers && <SamenTrainers c={cd} nu={nu} bewaar={bewaarKeuzes} />}
            {heeftTrainers && !plan.stations.length && <StationTrainers c={cd} nu={nu} bewaar={bewaarKeuzes} />}
          </>
        )}

        {actief === 'rotatie' && (
          <>
            <h2 className="sectie-titel">{vt('Rotatieschema')}</h2>
            <RotatieTabel c={cd} />
          </>
        )}

        {actief === 'materiaal' && (
          <>
            <h2 className="sectie-titel">
              {vt('Materiaal klaarzetten')} <span className="teller-klein">{`${klaar}/${alle.length}`}</span>
            </h2>
            {alle.length === 0 ? (
              <div className="leeg">
                <Icoon naam="materiaal" maat={28} />
                <p>{vt('Kies eerst de oefeningen voor de onderdelen.')}</p>
              </div>
            ) : (
              <>
                <MateriaalNoot c={cd} />
                <Regels titel={vt('Stations')} regels={m.stations} c={c} zet={(afgevinkt) => zet({ afgevinkt })} />
                <Regels titel={alleenPartij ? vt('Extra voor de partijvelden') : vt('Extra voor de samen-onderdelen')} regels={m.extra} c={c} zet={(afgevinkt) => zet({ afgevinkt })} />
                {avond && (
                  <>
                    <Regels titel={vt('Voor de hele avond')} regels={avond.regels} c={c} zet={(afgevinkt) => zet({ afgevinkt })} />
                    <p className="klein club-noot club-avond-noot">
                      {vt('{w0} na elkaar: het materiaal gaat van de ene sessie naar de volgende, dus per soort telt het meeste dat in één sessie tegelijk nodig is.', {
                        w0: avond.sessies.map((i) => sessieTekst(c, i)).join(', '),
                      })}
                    </p>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
