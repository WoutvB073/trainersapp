import type { Oefening } from '../model/types';
import { Icoon } from './Icoon';

const meervoud = (n: number, een: string, meer: string) => `${n} ${n === 1 ? een : meer}`;

/** Spelers / keepers / "Keeper nodig". */
export function Labels({ oefening }: { oefening: Oefening }) {
  const { spelersNodig, keepersNodig, soort } = oefening;
  return (
    <div className="labels">
      {spelersNodig > 0 && (
        <span className="label">
          <Icoon naam="spelers" maat={16} />
          {meervoud(spelersNodig, 'speler', 'spelers')}
        </span>
      )}
      {soort === 'keeper' && (
        <span className="label">
          <Icoon naam="keeper" maat={16} />
          {meervoud(keepersNodig, 'keeper', 'keepers')}
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

export function aantalTekst(o: Oefening): string {
  const delen: string[] = [];
  if (o.spelersNodig > 0) delen.push(meervoud(o.spelersNodig, 'speler', 'spelers'));
  if (o.keepersNodig > 0) delen.push(meervoud(o.keepersNodig, 'keeper', 'keepers'));
  return delen.length ? `Vanaf ${delen.join(' en ')}` : 'Geen spelers nodig';
}

export { meervoud };
