import type { Oefening } from '../model/types';
import { Icoon } from './Icoon';

const meervoud = (n: number, een: string, meer: string) => `${n} ${n === 1 ? een : meer}`;

type Aantallen = Pick<Oefening, 'soort' | 'spelersNodig' | 'keepersNodig' | 'doorwisselbaar'>;

/** "4+ spelers" (doorwisselbaar) of "6 spelers" (vast). Bij keeperoefeningen wisselen de keepers door. */
export function spelersLabel(o: Aantallen): string {
  const plus = o.doorwisselbaar && o.soort === 'veld' ? '+' : '';
  return `${o.spelersNodig}${plus} ${o.spelersNodig === 1 && !plus ? 'speler' : 'spelers'}`;
}

export function keepersLabel(o: Aantallen): string {
  const plus = o.doorwisselbaar && o.soort === 'keeper' ? '+' : '';
  return `${o.keepersNodig}${plus} ${o.keepersNodig === 1 && !plus ? 'keeper' : 'keepers'}`;
}

/** Spelers / keepers / "Keeper nodig". */
export function Labels({ oefening }: { oefening: Oefening }) {
  const { spelersNodig, keepersNodig, soort } = oefening;
  return (
    <div className="labels">
      {oefening.team && (
        <span className="label label-team" title={`Gedeeld door ${oefening.team.eigenaarNaam}`}>
          <Icoon naam="spelers" maat={16} />
          {oefening.team.naam}
        </span>
      )}
      {oefening.eigen && (
        <span className="label label-eigen">
          <Icoon naam="ster" maat={16} />
          Eigen
        </span>
      )}
      {spelersNodig > 0 && (
        <span className="label">
          <Icoon naam="spelers" maat={16} />
          {spelersLabel(oefening)}
        </span>
      )}
      {soort === 'keeper' && (
        <span className="label">
          <Icoon naam="keeper" maat={16} />
          {keepersLabel(oefening)}
        </span>
      )}
      {soort === 'veld' && keepersNodig > 0 && (
        <span className="label label-keeper">
          <Icoon naam="keeper" maat={16} />
          Keeper nodig
        </span>
      )}
    </div>
  );
}

/** Zin over het aantal voor de detailpagina en de trainingsmodus. */
export function aantalTekst(o: Aantallen): string {
  const delen: string[] = [];
  if (o.spelersNodig > 0) delen.push(meervoud(o.spelersNodig, 'speler', 'spelers'));
  if (o.keepersNodig > 0) delen.push(meervoud(o.keepersNodig, 'keeper', 'keepers'));
  if (!delen.length) return 'Geen spelers nodig';
  const samen = delen.join(' en ');
  if (!o.doorwisselbaar) return `Precies ${samen}.`;
  const wie = o.soort === 'keeper' ? 'keepers' : 'spelers';
  return `${samen.charAt(0).toUpperCase() + samen.slice(1)} tegelijk bezig. Meer ${wie} kan: die sluiten aan of wisselen door.`;
}

export { meervoud };
