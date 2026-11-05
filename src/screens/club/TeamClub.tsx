import { useMemo } from 'react';
import { Icoon } from '../../components/Icoon';
import { useOnlineStatus } from '../../engine/account';
import { useTeam } from '../../engine/teams';
import { eigenOefeningen } from '../../eigen/opslag';
import { ga } from '../../router';
import { leesTeamClub, uitGedeeldeClub } from '../../clubtraining/clubtraining';
import { clubtrainingen, useClub } from '../../clubtraining/opslag';
import { NietGevonden } from '../NietGevonden';
import { ClubWeergave } from './ClubGedeeld';
import { t as vt } from '../../i18n/t';

/** Gedeelde circuittraining in een team: plan, stations, rotatie, materiaal en animaties, en kopiëren naar je eigen lijst. */
export function TeamClubScherm({ id, item, station, partij }: { id: string; item: string; station?: number; partij?: boolean }) {
  const team = useTeam(id);
  const it = team?.items.find((x) => x.id === item && x.soort === 'clubtraining');
  const g = useMemo(() => (it ? leesTeamClub(it.data) : null), [it]);
  const s = useOnlineStatus();
  const eigen = useClub(item);
  if (!team || !it || !g) return <NietGevonden />;
  const mijn = it.eigenaar === s.account?.uid;
  const kopieer = () => {
    // Eigen oefeningen uit de circuittraining worden jouw eigen oefeningen; de circuittraining komt in je eigen lijst.
    const ids = g.eigen?.length ? eigenOefeningen.importeer(g.eigen) : new Map<string, string>();
    ga(`/club/${clubtrainingen.bewaar(uitGedeeldeClub(g, ids)).id}`);
  };
  return (
    <ClubWeergave
      g={g}
      basis={`/team/${id}/club/${item}`}
      station={station}
      partij={partij}
      kop={team.naam}
      ouder={`/team/${id}`}
      label={mijn ? vt('Gedeeld door jou') : vt('Gedeeld door {naam}', { naam: it.eigenaarNaam })}
      metMateriaal
    >
      <button className="knop knop-primair knop-breed" onClick={kopieer}>
        <Icoon naam="kopieer" maat={20} />
        {vt('Kopiëren naar mijn circuittrainingen')}
      </button>
      {mijn && eigen && (
        <>
          <button className="knop knop-breed" onClick={() => ga(`/club/${item}`)}>
            <Icoon naam="potlood" maat={20} />
            {vt('Aanpassen')}
          </button>
          <p className="klein">{vt('Pas je circuittraining aan en tik daarna weer op "Delen met team".')}</p>
        </>
      )}
    </ClubWeergave>
  );
}
