import { useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { blokNaam, CATEGORIEEN } from '../../clubtraining/clubtraining';
import { dagNaam, leesTeamRooster, maandagVan, nieuweRoosterTrainer, roosterGroepen, roosterTekst, voegRoosterSamen, weekNummer, type RoosterTrainer } from '../../clubtraining/rooster';
import { rooster, useRooster } from '../../clubtraining/opslag';
import { useOnlineStatus } from '../../engine/account';
import { useTeam } from '../../engine/teams';
import { datumTekst } from '../../training/training';
import { ga } from '../../router';
import { NietGevonden } from '../NietGevonden';
import { DeelMetTeam } from '../online/Teams';
import { Toast, useToast } from '../training/onderdelen';
import { t as vt } from '../../i18n/t';

const vandaag = () => new Date().toISOString().slice(0, 10);
const opNaam = (lijst: RoosterTrainer[]) => [...lijst].sort((a, b) => (a.naam || '~').localeCompare(b.naam || '~'));

function TrainerRij({ t, pad }: { t: RoosterTrainer; pad: string }) {
  return (
    <li className="training-regel">
      <a
        className="rij"
        href={`#${pad}`}
        onClick={(e) => {
          e.preventDefault();
          ga(pad);
        }}
      >
        <Icoon naam="team" maat={24} className="training-icoon" />
        <span className="rij-tekst">
          <span className="rij-titel">{t.naam || vt('Zonder naam')}</span>
          <span className="rij-sub">{roosterTekst(t, blokNaam)}</span>
        </span>
      </a>
    </li>
  );
}

/** Trainersrooster: vaste trainers één keer invoeren. Circuittrainingen met een groep vullen daarmee per dag de trainers in. */
export function RoosterLijst() {
  const lijst = useRooster();
  const s = useOnlineStatus();
  const nieuw = () => ga(`/rooster/${rooster.bewaar(nieuweRoosterTrainer(vandaag())).id}`);
  return (
    <div className="pagina">
      <Kop titel={vt('Trainersrooster')} ouder="/club" />
      <main className="inhoud smal">
        <p className="klein club-noot">{vt('Voer je vaste trainers één keer in: op welke dagen ze er zijn, elke week of om de week, bij welke groep en eventueel bij welk onderdeel. Kies bij een circuittraining de groep, dan vult de app de trainers per dag in. Ook bij Naar volgende week.')}</p>
        <button className="knop knop-primair knop-breed" onClick={nieuw}>
          <Icoon naam="plus" maat={20} />
          {vt('Trainer toevoegen')}
        </button>
        {lijst.length === 0 ? (
          <p className="leeg">{vt('Nog geen trainers in het rooster.')}</p>
        ) : (
          <ul className="lijst">
            {opNaam(lijst).map((t) => (
              <TrainerRij key={t.id} t={t} pad={`/rooster/${t.id}`} />
            ))}
          </ul>
        )}
        {s.account && lijst.length > 0 && <DeelMetTeam soort="rooster" id="rooster" naam={vt('Trainersrooster')} breed />}
      </main>
    </div>
  );
}

/** Weken om uit te kiezen: van een paar weken terug tot een half jaar vooruit, en de gekozen week. */
function weken(huidig: string): string[] {
  const start = new Date(`${maandagVan(vandaag())}T12:00:00Z`).getTime();
  const lijst = Array.from({ length: 34 }, (_, i) => new Date(start + (i - 8) * 7 * 864e5).toISOString().slice(0, 10));
  return [...new Set([...lijst, maandagVan(huidig)])].sort();
}

function Keuzeknoppen<K extends string | number>({ label, keuzes, aan, opKies, meer }: { label: string; keuzes: [K, string][]; aan: (k: K) => boolean; opKies: (k: K) => void; meer?: boolean }) {
  return (
    <div className="rooster-keuze" role={meer ? 'group' : 'radiogroup'} aria-label={label}>
      {keuzes.map(([k, naam]) => (
        <button key={String(k)} type="button" role={meer ? undefined : 'radio'} aria-pressed={meer ? aan(k) : undefined} aria-checked={meer ? undefined : aan(k)} className={aan(k) ? 'aan' : ''} onClick={() => opKies(k)}>
          {naam}
        </button>
      ))}
    </div>
  );
}

export function RoosterTrainerScherm({ id }: { id: string }) {
  const lijst = useRooster();
  const t = lijst.find((x) => x.id === id);
  const [nieuweGroep, setNieuweGroep] = useState('');
  if (!t) return <NietGevonden />;
  const nu = () => rooster.haal(id) ?? t;
  const zet = (w: Partial<RoosterTrainer>) => rooster.bewaar({ ...nu(), ...w });
  const groepen = roosterGroepen(lijst);
  const wisselGroep = (g: string) => {
    const x = nu();
    const nieuw = x.groepen.includes(g) ? x.groepen.filter((y) => y !== g) : [...x.groepen, g];
    zet({ groepen: nieuw, wissel: x.wissel && nieuw.length > 1 });
  };
  const voegGroepToe = () => {
    const g = nieuweGroep.trim().slice(0, 60);
    if (g && !nu().groepen.includes(g)) zet({ groepen: [...nu().groepen, g] });
    setNieuweGroep('');
  };
  const metWeek = t.ritme === 'om' || (t.wissel && t.groepen.length > 1);
  return (
    <div className="pagina">
      <Kop titel={t.naam || vt('Trainer')} ouder="/rooster" />
      <main className="inhoud smal">
        <section className="blok rooster-trainer">
          <label className="veld">
            <span>{vt('Naam')}</span>
            <input value={t.naam} maxLength={40} placeholder={vt('Naam van de trainer')} onChange={(e) => zet({ naam: e.target.value })} />
          </label>

          <h3>{vt('Dagen')}</h3>
          <Keuzeknoppen meer label={vt('Dagen')} keuzes={[1, 2, 3, 4, 5, 6, 7].map((d) => [d, dagNaam(d)])} aan={(d) => t.dagen.includes(d)} opKies={(d) => zet({ dagen: nu().dagen.includes(d) ? nu().dagen.filter((x) => x !== d) : [...nu().dagen, d].sort() })} />

          <h3>{vt('Ritme')}</h3>
          <Keuzeknoppen
            label={vt('Ritme')}
            keuzes={[
              ['elke', vt('Elke week')],
              ['om', vt('Om de week')],
            ]}
            aan={(k) => t.ritme === k}
            opKies={(k) => zet({ ritme: k as RoosterTrainer['ritme'] })}
          />

          <h3>{vt('Groep')}</h3>
          {groepen.length > 0 && <Keuzeknoppen meer label={vt('Groep')} keuzes={groepen.map((g) => [g, g])} aan={(g) => t.groepen.includes(g)} opKies={wisselGroep} />}
          <div className="rooster-nieuw">
            <input value={nieuweGroep} maxLength={60} placeholder={vt('Nieuwe groep')} aria-label={vt('Nieuwe groep')} onChange={(e) => setNieuweGroep(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && voegGroepToe()} />
            <button className="knop" onClick={voegGroepToe}>
              {vt('Toevoegen')}
            </button>
          </div>
          {t.groepen.length > 1 && (
            <>
              <label className="rooster-vink">
                <input type="checkbox" checked={t.wissel} onChange={(e) => zet({ wissel: e.target.checked })} />
                <span>{vt('Om de week wisselen tussen de groepen')}</span>
              </label>
              {t.wissel && (
                <label className="leeftijd-keuze rooster-kolom">
                  <span>{vt('Begint bij')}</span>
                  <select value={t.groepen[0]} onChange={(e) => zet({ groepen: [e.target.value, ...nu().groepen.filter((g) => g !== e.target.value)] })}>
                    {t.groepen.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}
          {metWeek && (
            <label className="leeftijd-keuze rooster-kolom">
              <span>{t.ritme === 'om' ? vt('Er in week') : vt('In week')}</span>
              <select value={maandagVan(t.beginWeek)} onChange={(e) => zet({ beginWeek: e.target.value })}>
                {weken(t.beginWeek).map((m) => (
                  <option key={m} value={m}>
                    {vt('Week {w} (vanaf {datum})', { w: weekNummer(m), datum: datumTekst(m) })}
                  </option>
                ))}
              </select>
            </label>
          )}

          <h3>{vt('Sessie')}</h3>
          <label className="leeftijd-keuze rooster-kolom rooster-tijd">
            <span>{vt('Alleen om (begintijd)')}</span>
            <input type="time" value={t.tijd ?? ''} onChange={(e) => zet({ tijd: e.target.value || undefined })} />
          </label>
          <p className="klein">{vt('Twee sessies op één avond? Vul de begintijd in, dan komt deze trainer alleen bij die sessie. Leeg: bij elke sessie van zijn groep.')}</p>

          <h3>{vt('Vaste plek')}</h3>
          <label className="leeftijd-keuze rooster-kolom rooster-plek">
            <span>{vt('Altijd bij een onderdeel')}</span>
            <select value={t.plek ?? ''} onChange={(e) => zet({ plek: e.target.value || undefined })}>
              <option value="">{vt('Geen: gewoon verdelen')}</option>
              {CATEGORIEEN.map((k) => (
                <option key={k} value={k}>
                  {blokNaam(k)}
                </option>
              ))}
            </select>
          </label>
          <p className="klein">{vt('Heeft de training die dag zo’n onderdeel, dan staat deze trainer daar; anders wordt hij gewoon verdeeld.')}</p>
        </section>
        <p className="klein club-noot">{roosterTekst(t, blokNaam)}</p>
        <button
          className="knop knop-breed"
          onClick={() => {
            if (!window.confirm(vt('{naam} uit het rooster halen?', { naam: t.naam || vt('Deze trainer') }))) return;
            rooster.verwijder(id);
            ga('/rooster');
          }}
        >
          <Icoon naam="prullenbak" maat={20} />
          {vt('Uit het rooster halen')}
        </button>
      </main>
    </div>
  );
}

/** Gedeeld rooster in een team: bekijken en overnemen in je eigen rooster. */
export function TeamRoosterScherm({ id, item }: { id: string; item: string }) {
  const team = useTeam(id);
  const s = useOnlineStatus();
  const [melding, toon] = useToast();
  const it = team?.items.find((x) => x.id === item && x.soort === 'rooster');
  const lijst = it ? leesTeamRooster(it.data) : null;
  if (!team || !it || !lijst) return <NietGevonden />;
  const mijn = it.eigenaar === s.account?.uid;
  const overnemen = () => {
    const eigen = rooster.lijst();
    for (const t of voegRoosterSamen(eigen, lijst)) if (lijst.some((x) => x.id === t.id)) rooster.bewaar(t);
    toon(vt('Overgenomen in je rooster'));
  };
  return (
    <div className="pagina">
      <Kop titel={team.naam} ouder={`/team/${id}`} />
      <main className="inhoud smal">
        <section className="blok gedeeld-kop">
          <p className="klein">{mijn ? vt('Gedeeld door jou') : vt('Gedeeld door {naam}', { naam: it.eigenaarNaam })}</p>
          <h2 className="detail-titel">{vt('Trainersrooster')}</h2>
          {!mijn && (
            <button className="knop knop-primair knop-breed" onClick={overnemen}>
              <Icoon naam="kopieer" maat={20} />
              {vt('Overnemen in mijn rooster')}
            </button>
          )}
        </section>
        <ul className="lijst">
          {opNaam(lijst).map((t) => (
            <li key={t.id} className="training-regel">
              <div className="rij">
                <Icoon naam="team" maat={24} className="training-icoon" />
                <span className="rij-tekst">
                  <span className="rij-titel">{t.naam || vt('Zonder naam')}</span>
                  <span className="rij-sub">{roosterTekst(t, blokNaam)}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </main>
      <Toast tekst={melding} />
    </div>
  );
}
