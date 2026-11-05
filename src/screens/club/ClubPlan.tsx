import { useMemo, useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { vindOefening } from '../../data/oefeningen';
import { ga } from '../../router';
import { clubNaam, materiaal, partijvelden, stationNaam, stations, stationTrainer, veldTrainer, type ClubTraining, type MateriaalRegel } from '../../clubtraining/clubtraining';
import { clubtrainingen, useClub } from '../../clubtraining/opslag';
import { NietGevonden } from '../NietGevonden';
import { RotatieTabel, veldGroepen, VeldplanPartij, VeldplanStations } from './onderdelen';
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
  const heeftTrainers = c.trainers.some((x) => x.trim());
  const alle = [...m.stations, ...m.extra];
  const klaar = alle.filter((r) => c.afgevinkt.includes(r.sleutel)).length;
  const tabs: [Tab, string][] = [
    ['deel1', vt('Stations')],
    ['deel2', vt('Partij')],
    ['rotatie', vt('Rotatie')],
    ['materiaal', vt('Materiaal')],
  ];

  return (
    <div className="pagina">
      <Kop titel={clubNaam(c)} ouder={`/club/${id}`} />
      <main className="inhoud smal">
        <div className="tabs club-tabs" role="tablist">
          {tabs.map(([k, naam]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'aan' : ''} onClick={() => setTab(k)}>
              {naam}
            </button>
          ))}
        </div>

        {tab === 'deel1' && (
          <>
            <h2 className="sectie-titel">{vt('Veldplan deel 1: rondes 1–3')}</h2>
            <VeldplanStations
              c={c}
              vind={vindOefening}
              opStation={(s) => {
                const oid = c.blokken[s.vorm];
                if (oid) ga(`/oefening/${oid}`);
              }}
            />
            {heeftTrainers && (
              <section className="blok club-trainers">
                <h3>{vt('Trainers per station')}</h3>
                {stations(c.groepjes).map((s) => (
                  <TrainerKeuze key={s.nr} label={`${s.nr}. ${stationNaam(s, c.groepjes)}`} c={c} waarde={stationTrainer(c, s.nr)} opKies={(naam) => zet({ stationTrainers: { ...c.stationTrainers, [s.nr]: naam } })} />
                ))}
              </section>
            )}
          </>
        )}

        {tab === 'deel2' && (
          <>
            <h2 className="sectie-titel">{vt('Veldplan deel 2: laatste kwartier')}</h2>
            <VeldplanPartij
              c={c}
              vind={vindOefening}
              opVeld={() => {
                if (c.blokken.partijvormen) ga(`/oefening/${c.blokken.partijvormen}`);
              }}
            />
            {heeftTrainers && (
              <section className="blok club-trainers">
                <h3>{vt('Trainers per veld')}</h3>
                {partijvelden(c.groepjes).map((v) => (
                  <TrainerKeuze key={v.nr} label={[vt('Veld {nr}', { nr: v.nr }), veldGroepen(v)].join(' · ')} c={c} waarde={veldTrainer(c, v.nr)} opKies={(naam) => zet({ veldTrainers: { ...c.veldTrainers, [v.nr]: naam } })} />
                ))}
              </section>
            )}
          </>
        )}

        {tab === 'rotatie' && (
          <>
            <h2 className="sectie-titel">{vt('Rotatieschema')}</h2>
            <RotatieTabel c={c} />
          </>
        )}

        {tab === 'materiaal' && (
          <>
            <h2 className="sectie-titel">
              {vt('Materiaal klaarzetten')} <span className="teller-klein">{`${klaar}/${alle.length}`}</span>
            </h2>
            {alle.length === 0 ? (
              <div className="leeg">
                <Icoon naam="materiaal" maat={28} />
                <p>{vt('Kies eerst de oefeningen voor de blokken.')}</p>
              </div>
            ) : (
              <>
                <Regels titel={vt('Stations (rondes 1–3)')} regels={m.stations} c={c} zet={(afgevinkt) => zet({ afgevinkt })} />
                <Regels titel={vt('Extra voor de partijvelden')} regels={m.extra} c={c} zet={(afgevinkt) => zet({ afgevinkt })} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
