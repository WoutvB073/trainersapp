import {
  botsingen,
  buurPlekken,
  clubPlan,
  groepNaam,
  metHandIngedeeld,
  nietIngedeeld,
  partijvelden,
  plekTrainers,
  stationNaam,
  trainerModus,
  trainerNamen,
  verplaatsTrainer,
  zetPlekTrainers,
  zonderIndeling,
  zonderTrainer,
  type ClubTraining,
  type TrainerKeuzes,
} from '../../clubtraining/clubtraining';
import { blokNaam, veldGroepen } from './onderdelen';
import { lijstTekst, t as vt } from '../../i18n/t';

type Bewaar = (trainerKeuzes: TrainerKeuzes) => void;

/** Per plek de trainers aanvinken, of een trainer naar een andere plek verplaatsen. */
function PlekKiezer({ c, sleutel, titel, nu, bewaar }: { c: ClubTraining; sleutel: string; titel: string; nu: () => ClubTraining; bewaar: Bewaar }) {
  const gekozen = plekTrainers(c, sleutel);
  const buren = buurPlekken(c, sleutel);
  const ook = (naam: string) => buren.filter((b) => plekTrainers(c, b.sleutel).includes(naam)).map((b) => b.naam);
  const wissel = (naam: string, aan: boolean) => {
    const c2 = nu();
    const lijst = plekTrainers(c2, sleutel).filter((n) => n !== naam);
    bewaar(zetPlekTrainers(c2, sleutel, aan ? [...lijst, naam] : lijst));
  };
  return (
    <details className="club-plek-kies" data-plek={sleutel}>
      <summary>
        <b>{titel}</b>
        <span>{gekozen.length ? gekozen.join(', ') : vt('Geen trainer')}</span>
      </summary>
      <ul>
        {trainerNamen(c).map((naam) => {
          const aan = gekozen.includes(naam);
          const elders = ook(naam);
          return (
            <li key={naam}>
              <label>
                <input type="checkbox" checked={aan} onChange={() => wissel(naam, !aan)} />
                <span>
                  {naam}
                  {elders.length > 0 && <small>{vt('Ook bij: {w0}', { w0: lijstTekst(elders) })}</small>}
                </span>
              </label>
              {aan && buren.length > 0 && (
                <select
                  aria-label={vt('{naam} verplaatsen naar', { naam })}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) bewaar(verplaatsTrainer(nu(), naam, sleutel, e.target.value));
                  }}
                >
                  <option value="">{vt('Verplaats naar…')}</option>
                  {buren.map((b) => (
                    <option key={b.sleutel} value={b.sleutel}>
                      {b.naam}
                    </option>
                  ))}
                </select>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}

/** Wat er niet klopt aan de indeling, en de knop om opnieuw te verdelen. */
function Meldingen({ c, bewaar }: { c: ClubTraining; bewaar: Bewaar }) {
  const mee = trainerModus(c) === 'groepje';
  const dubbel = botsingen(c);
  const zonder = zonderTrainer(c);
  const over = nietIngedeeld(c);
  return (
    <>
      {dubbel.map((b) => (
        <p key={`${b.naam}${b.plekken.join()}`} className="club-botsing" role="alert">
          {vt('{naam} staat in ronde {rondes} op twee plekken tegelijk: {plekken}. Haal de trainer ergens weg of verplaats de trainer.', { naam: b.naam, rondes: lijstTekst(b.rondes.map(String)), plekken: lijstTekst(b.plekken) })}
        </p>
      ))}
      {over.length > 0 && <p className="klein club-noot">{vt('Nog niet overal ingedeeld: {w0}.', { w0: lijstTekst(over) })}</p>}
      {zonder.length > 0 && <p className="klein club-noot">{mee ? vt('Minder trainers dan groepjes. Geen trainer bij groepje {w0}.', { w0: lijstTekst(zonder) }) : vt('Geen trainer op station {w0}.', { w0: lijstTekst(zonder) })}</p>}
      {metHandIngedeeld(c) && (
        <button className="knop knop-breed" onClick={() => bewaar(zonderIndeling(c.trainerKeuzes))}>
          {vt('Automatisch verdelen')}
        </button>
      )}
    </>
  );
}

/** Tabblad Stations: de trainers per station, of per groepje als ze meelopen. */
export function StationTrainers({ c, nu, bewaar }: { c: ClubTraining; nu: () => ClubTraining; bewaar: Bewaar }) {
  const mee = trainerModus(c) === 'groepje';
  const plan = clubPlan(c);
  return (
    <section className="blok club-trainers">
      <h3>{mee ? vt('Trainers per groepje') : vt('Trainers per station')}</h3>
      <p className="klein">{mee ? vt('Elke trainer loopt mee met een groepje en draait mee in de rotatie.') : vt('Tik op een station om trainers aan te vinken of te verplaatsen.')}</p>
      {mee
        ? Array.from({ length: c.groepjes }, (_, g) => <PlekKiezer key={g} c={c} sleutel={`g:${g}`} titel={vt('Groepje {g}', { g: groepNaam(g) })} nu={nu} bewaar={bewaar} />)
        : plan.stations.map((s) => <PlekKiezer key={s.nr} c={c} sleutel={`s:${s.nr}`} titel={`${s.nr}. ${stationNaam(s)}`} nu={nu} bewaar={bewaar} />)}
      <Meldingen c={c} bewaar={bewaar} />
    </section>
  );
}

/** Tabblad Samen of Partij: de trainers per partijveld en Samen-onderdeel. */
export function SamenTrainers({ c, nu, bewaar }: { c: ClubTraining; nu: () => ClubTraining; bewaar: Bewaar }) {
  const plan = clubPlan(c);
  const velden = plan.samen.some((o) => o.categorie === 'partijvormen');
  if (trainerModus(c) === 'groepje') return <p className="klein club-noot">{vt('De trainers lopen mee met hun groepje.')}</p>;
  return (
    <section className="blok club-trainers">
      <h3>{velden ? vt('Trainers per veld') : vt('Trainers')}</h3>
      {velden && partijvelden(c.groepjes).map((v) => <PlekKiezer key={v.nr} c={c} sleutel={`v:${v.nr}`} titel={[vt('Veld {nr}', { nr: v.nr }), veldGroepen(v)].join(' · ')} nu={nu} bewaar={bewaar} />)}
      {plan.samen
        .filter((o) => o.categorie !== 'partijvormen')
        .map((o) => (
          <PlekKiezer key={o.id} c={c} sleutel={`o:${o.id}`} titel={blokNaam(o.categorie)} nu={nu} bewaar={bewaar} />
        ))}
      <Meldingen c={c} bewaar={bewaar} />
    </section>
  );
}
