import type { Oefening } from '../model/types';
import { Icoon } from './Icoon';
import { aantal, t } from '../i18n/t';

/** "3 spelers" in de gekozen taal (de woorden gaan via t). */
const meervoud = aantal;

type Aantallen = Pick<Oefening, 'soort' | 'spelersNodig' | 'keepersNodig' | 'doorwisselbaar'>;

/** "4+ spelers" (doorwisselbaar) of "6 spelers" (vast). Bij keeperoefeningen wisselen de keepers door. */
export function spelersLabel(o: Aantallen): string {
  const plus = o.doorwisselbaar && o.soort === 'veld' ? '+' : '';
  return `${o.spelersNodig}${plus} ${t(o.spelersNodig === 1 && !plus ? 'speler' : 'spelers')}`;
}

export function keepersLabel(o: Aantallen): string {
  const plus = o.doorwisselbaar && o.soort === 'keeper' ? '+' : '';
  return `${o.keepersNodig}${plus} ${t(o.keepersNodig === 1 && !plus ? 'keeper' : 'keepers')}`;
}

/** Spelers / keepers / "Keeper nodig". */
export function Labels({ oefening }: { oefening: Oefening }) {
  const { spelersNodig, keepersNodig, soort } = oefening;
  return (
    <div className="labels">
      {oefening.verwijderd && <span className="label label-verwijderd">{t('Niet meer in de bibliotheek')}</span>}
      {oefening.team && (
        <span className="label label-team" title={t('Gedeeld door {eigenaarNaam}', { eigenaarNaam: oefening.team.eigenaarNaam })}>
          <Icoon naam="spelers" maat={16} />
          {oefening.team.naam}
        </span>
      )}
      {oefening.eigen && (
        <span className="label label-eigen">
          <Icoon naam="ster" maat={16} />
          {t('Eigen')}
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
          {t('Keeper nodig')}
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
  if (!delen.length) return t('Geen spelers nodig');
  const samen = delen.join(t(' en '));
  if (!o.doorwisselbaar) return t('Precies {samen}.', { samen });
  const tekst = t(o.soort === 'keeper' ? '{samen} tegelijk bezig. Meer keepers kan: die sluiten aan of wisselen door.' : '{samen} tegelijk bezig. Meer spelers kan: die sluiten aan of wisselen door.', { samen });
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

export { meervoud };
