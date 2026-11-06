import { useMemo, useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { vindOefening } from '../../data/oefeningen';
import { ga } from '../../router';
import { blokNaam, clubNaam, clubPlan, materiaal, partijvelden, stationNaam, stationTrainer, tijdTekst, veldTrainer, vindOnderdeel, type ClubTraining, type MateriaalRegel, type Onderdeel } from '../../clubtraining/clubtraining';
import { clubtrainingen, useClub } from '../../clubtraining/opslag';
import { NietGevonden } from '../NietGevonden';
import { faseTitel, PlanNoot, RotatieTabel, veldGroepen, VeldplanSamen, VeldplanStations } from './onderdelen';
import { t as vt } from '../../i18n/t';

type Tab = 'deel1' | 'deel2' | 'rotatie' | 'materiaal';

/** Trainer kiezen per station of veld; "Automatisch" volgt de verdeling om en om, "Geen" laat de plek leeg. */
function TrainerKeuze({ label, c, waarde, opKies }: { label: string; c: ClubTraining; waarde: string | undefined; opKies: (naam: string) => void }) {
  const namen = c.trainers.map((x) => x.trim()).filter(Boolean);
  return (
    <label className="leeftijd-keuze">
      <span>{label}</span>
      <select value={waarde ?? ''} onChange={(e) => opKies(e.target.value)}>
        <option value="">{vt('Geen trainer')}</option>
        {namen.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}

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
  const m = useMemo(() => (c ? materiaal(c, vindOefening) : null), [c]);
  if (!c || !m) return <NietGevonden />;

  const zet = (w: Partial<ClubTraining>) => clubtrainingen.bewaar({ ...(clubtrainingen.haal(id) ?? c), ...w });
  const plan = clubPlan(c);
  const open = (o?: Onderdeel) => {
    if (o?.oefening) ga(`/oefening/${o.oefening}`);
  };
  const alleenPartij = plan.samen.every((o) => o.categorie === 'partijvormen');
  const metPartij = plan.samen.some((o) => o.categorie === 'partijvormen');
  const heeftTrainers = c.trainers.some((x) => x.trim());
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
                <VeldplanStations c={c} fase={f} vind={vindOefening} opStation={(s) => open(vindOnderdeel(c, s.onderdeel))} />
              </div>
            ))}
            <PlanNoot c={c} />
            {heeftTrainers && (
              <section className="blok club-trainers">
                <h3>{vt('Trainers per station')}</h3>
                {plan.stations.map((s) => (
                  <TrainerKeuze key={s.nr} label={`${s.nr}. ${stationNaam(s)}`} c={c} waarde={stationTrainer(c, s.nr)} opKies={(naam) => zet({ stationTrainers: { ...c.stationTrainers, [s.nr]: naam } })} />
                ))}
              </section>
            )}
          </>
        )}

        {actief === 'deel2' && (
          <>
            {plan.samen.map((o) => (
              <div key={o.id}>
                <h2 className="sectie-titel">{`${blokNaam(o.categorie)} · ${tijdTekst(o.duur * 60)}`}</h2>
                <VeldplanSamen c={c} onderdeel={o} vind={vindOefening} opVeld={() => open(o)} />
              </div>
            ))}
            {heeftTrainers && metPartij && (
              <section className="blok club-trainers">
                <h3>{vt('Trainers per veld')}</h3>
                {partijvelden(c.groepjes).map((v) => (
                  <TrainerKeuze key={v.nr} label={[vt('Veld {nr}', { nr: v.nr }), veldGroepen(v)].join(' · ')} c={c} waarde={veldTrainer(c, v.nr)} opKies={(naam) => zet({ veldTrainers: { ...c.veldTrainers, [v.nr]: naam } })} />
                ))}
              </section>
            )}
          </>
        )}

        {actief === 'rotatie' && (
          <>
            <h2 className="sectie-titel">{vt('Rotatieschema')}</h2>
            <RotatieTabel c={c} />
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
                <Regels titel={vt('Stations')} regels={m.stations} c={c} zet={(afgevinkt) => zet({ afgevinkt })} />
                <Regels titel={alleenPartij ? vt('Extra voor de partijvelden') : vt('Extra voor de samen-onderdelen')} regels={m.extra} c={c} zet={(afgevinkt) => zet({ afgevinkt })} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
