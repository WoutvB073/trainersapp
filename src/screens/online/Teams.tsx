import { useEffect, useMemo, useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { Labels, meervoud } from '../../components/Labels';
import { Miniatuur } from '../../components/Miniatuur';
import { online, useOnlineStatus } from '../../engine/account';
import { onlineBeschikbaar } from '../../online/config';
import { leesTeamTraining, teamOefeningId, teamOefeningen, useTeam, useTeams, type Team, type TeamItem } from '../../engine/teams';
import { vindOefening } from '../../data/oefeningen';
import { eigenOefeningen } from '../../eigen/opslag';
import { trainingen } from '../../training/opslag';
import { benodigdheden } from '../../training/training';
import { ga, terug, vervang } from '../../router';
import type { Oefening } from '../../model/types';
import { Toast, useToast } from '../training/onderdelen';
import { NietGevonden } from '../NietGevonden';

type OnlineModule = Awaited<ReturnType<typeof online>>;

/** Online actie met foutmelding (als toast of tekst). */
function useActie(toon: (t: string) => void) {
  const [bezig, setBezig] = useState(false);
  const doe = async (f: (m: OnlineModule) => Promise<unknown>, gelukt?: string): Promise<boolean> => {
    setBezig(true);
    const m = await online();
    try {
      await f(m);
      if (gelukt) toon(gelukt);
      return true;
    } catch (e) {
      toon(m.foutTekst(e));
      return false;
    } finally {
      setBezig(false);
    }
  };
  return { bezig, doe };
}

/** Uitgelogd (of online staat nog uit): korte uitleg met knop om in te loggen. */
function NietIngelogd() {
  return (
    <div className="leeg">
      <p className="leeg-titel">Teams</p>
      <p>Met een team deel je oefeningen en trainingen met andere trainers. Daarvoor log je in (gratis, met je e-mailadres).</p>
      {onlineBeschikbaar() ? (
        <button className="knop knop-primair" onClick={() => ga('/account')}>
          <Icoon naam="persoon" maat={20} />
          Inloggen of account maken
        </button>
      ) : (
        <p className="klein">Online opslag wordt nog ingesteld.</p>
      )}
    </div>
  );
}

function useStartOnline() {
  useEffect(() => {
    if (onlineBeschikbaar()) void online().then((m) => m.startOnline());
  }, []);
}

/** Mijn teams: maken en joinen met een code. */
export function Teams() {
  useStartOnline();
  const s = useOnlineStatus();
  const lijst = useTeams();
  const [melding, toon] = useToast();
  const { bezig, doe } = useActie(toon);
  const [naam, setNaam] = useState('');
  const [code, setCode] = useState('');
  if (!s.account)
    return (
      <div className="pagina">
        <Kop titel="Teams" ouder="/instellingen" />
        <main className="inhoud smal">
          <NietIngelogd />
        </main>
      </div>
    );
  return (
    <div className="pagina">
      <Kop titel="Teams" ouder="/instellingen" />
      <main className="inhoud smal formulier">
        {lijst.length > 0 ? (
          <ul className="lijst">
            {lijst.map((t) => (
              <li key={t.id}>
                <a
                  className="rij"
                  href={`#/team/${t.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    ga(`/team/${t.id}`);
                  }}
                >
                  <Icoon naam="team" maat={24} className="training-icoon" />
                  <span className="rij-tekst">
                    <span className="rij-titel">{t.naam}</span>
                    <span className="rij-sub">
                      {[meervoud(t.leden.length, 'lid', 'leden'), meervoud(t.items.length, 'gedeeld item', 'gedeelde items'), t.rol === 'beheerder' ? 'beheerder' : ''].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <Icoon naam="verder" className="rij-pijl" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="klein">Je zit nog niet in een team. Maak er een, of vul de code in die je van een andere trainer kreeg.</p>
        )}
        <section className="blok">
          <h3>Team joinen</h3>
          <form
            className="team-form"
            onSubmit={(e) => {
              e.preventDefault();
              void doe(async (m) => {
                const id = await m.joinTeam(code);
                setCode('');
                ga(`/team/${id}`);
              });
            }}
          >
            <input className="code-invoer" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE" maxLength={8} autoCapitalize="characters" autoComplete="off" aria-label="Teamcode" />
            <button className="knop knop-primair" type="submit" disabled={bezig || code.trim().length < 6}>
              Joinen
            </button>
          </form>
        </section>
        <section className="blok">
          <h3>Team maken</h3>
          <form
            className="team-form"
            onSubmit={(e) => {
              e.preventDefault();
              void doe(async (m) => {
                const t = await m.maakTeam(naam);
                setNaam('');
                ga(`/team/${t.id}`);
              });
            }}
          >
            <input value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="Bijv. JO11-1 of Keeperstrainers" maxLength={60} aria-label="Naam van het team" />
            <button className="knop knop-primair" type="submit" disabled={bezig || !naam.trim()}>
              Maken
            </button>
          </form>
          <p className="klein">Je wordt beheerder en krijgt een code van 6 tekens om te delen.</p>
        </section>
      </main>
      <Toast tekst={melding} />
    </div>
  );
}

/** Eén team: code, gedeelde oefeningen en trainingen, leden en beheer. */
export function TeamScherm({ id }: { id: string }) {
  useStartOnline();
  const s = useOnlineStatus();
  const t = useTeam(id);
  const [melding, toon] = useToast();
  const { bezig, doe } = useActie(toon);
  if (!s.account)
    return (
      <div className="pagina">
        <Kop titel="Team" ouder="/teams" />
        <main className="inhoud smal">
          <NietIngelogd />
        </main>
      </div>
    );
  if (!t) return <NietGevonden />;
  const ik = s.account.uid;
  const beheerder = t.rol === 'beheerder';
  const oefeningen = t.items.filter((i) => i.soort === 'oefening');
  const trainingenTeam = t.items.filter((i) => i.soort === 'training');
  const wedstrijdTeam = t.items.filter((i) => i.soort === 'opstelling' || i.soort === 'bord');
  const deelCode = async () => {
    const tekst = `Kom in mijn team "${t.naam}" in TopTraining: open de app, ga naar Instellingen → Teams en vul de code ${t.code} in.`;
    try {
      if (navigator.share) return void (await navigator.share({ title: t.naam, text: tekst }));
    } catch {
      /* geannuleerd */
    }
    try {
      await navigator.clipboard.writeText(t.code);
      toon('Code gekopieerd');
    } catch {
      toon(`Code: ${t.code}`);
    }
  };
  const itemKnoppen = (it: TeamItem) => (
    <>
      {it.eigenaar === ik && (
        <button className="icoon-knop" aria-label={`${it.naam} terugtrekken`} title="Terugtrekken" disabled={bezig} onClick={() => void doe((m) => m.verwijderItem(t.id, it.id), 'Teruggetrokken uit het team')}>
          <Icoon naam="kruis" maat={20} />
        </button>
      )}
      {it.eigenaar !== ik && beheerder && (
        <button
          className="icoon-knop gevaar"
          aria-label={`${it.naam} uit het team verwijderen`}
          title="Uit het team verwijderen"
          disabled={bezig}
          onClick={() => {
            if (window.confirm(`"${it.naam}" van ${it.eigenaarNaam} uit het team verwijderen?`)) void doe((m) => m.verwijderItem(t.id, it.id), 'Verwijderd uit het team');
          }}
        >
          <Icoon naam="prullenbak" maat={20} />
        </button>
      )}
    </>
  );
  return (
    <div className="pagina">
      <Kop titel={t.naam} ouder="/teams" />
      <main className="inhoud smal">
        <section className="blok team-code">
          <div>
            <p className="klein">Teamcode</p>
            <p className="code">{t.code}</p>
          </div>
          <div className="team-code-knoppen">
            <button className="knop" onClick={() => void deelCode()}>
              <Icoon naam="deel" maat={18} />
              Delen
            </button>
            {beheerder && (
              <button
                className="knop"
                disabled={bezig}
                onClick={() => {
                  if (window.confirm('Nieuwe code maken? De oude code werkt dan niet meer (wie al lid is, blijft lid).')) void doe((m) => m.vernieuwCode(t.id), 'Nieuwe code gemaakt');
                }}
              >
                <Icoon naam="opnieuw" maat={18} />
                Nieuwe code
              </button>
            )}
          </div>
        </section>

        <h2 className="sectie-titel">Gedeelde oefeningen</h2>
        {oefeningen.length === 0 ? (
          <p className="klein">Nog niets gedeeld. Open een eigen oefening en kies "Delen met team".</p>
        ) : (
          <ul className="eigen-lijst">
            {oefeningen.map((it) => {
              const o = teamOefeningen().find((x) => x.id === teamOefeningId(t.id, it.id));
              return (
                <li key={it.id} className="eigen-regel team-regel">
                  <a
                    className="eigen-kaart"
                    href={`#/oefening/${teamOefeningId(t.id, it.id)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      ga(`/oefening/${teamOefeningId(t.id, it.id)}`);
                    }}
                  >
                    {o && <Miniatuur tekening={o.tekening} className="eigen-plaatje" />}
                    <span className="kaart-tekst">
                      <span className="kaart-titel">{it.naam}</span>
                      <span className="kaart-uitleg">Gedeeld door {it.eigenaar === ik ? 'jou' : it.eigenaarNaam}</span>
                    </span>
                  </a>
                  <div className="training-acties">{itemKnoppen(it)}</div>
                </li>
              );
            })}
          </ul>
        )}

        <h2 className="sectie-titel">Gedeelde trainingen</h2>
        {trainingenTeam.length === 0 ? (
          <p className="klein">Nog niets gedeeld. Open een training en kies "Delen met team".</p>
        ) : (
          <ul className="lijst">
            {trainingenTeam.map((it) => (
              <li key={it.id} className="training-regel">
                <a
                  className="rij"
                  href={`#/team/${t.id}/training/${it.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    ga(`/team/${t.id}/training/${it.id}`);
                  }}
                >
                  <Icoon naam="training" maat={24} className="training-icoon" />
                  <span className="rij-tekst">
                    <span className="rij-titel">{it.naam}</span>
                    <span className="rij-sub">Gedeeld door {it.eigenaar === ik ? 'jou' : it.eigenaarNaam}</span>
                  </span>
                </a>
                <div className="training-acties">{itemKnoppen(it)}</div>
              </li>
            ))}
          </ul>
        )}

        <h2 className="sectie-titel">Gedeelde opstellingen en tactiekborden</h2>
        {wedstrijdTeam.length === 0 ? (
          <p className="klein">Nog niets gedeeld. Open een opstelling, tactiekbord of spelhervatting en kies "Delen met team".</p>
        ) : (
          <ul className="lijst">
            {wedstrijdTeam.map((it) => (
              <li key={it.id} className="training-regel">
                <a
                  className="rij"
                  href={`#/team/${t.id}/wedstrijd/${it.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    ga(`/team/${t.id}/wedstrijd/${it.id}`);
                  }}
                >
                  <Icoon naam={it.soort === 'opstelling' ? 'opstelling' : 'tactiek'} maat={24} className="training-icoon" />
                  <span className="rij-tekst">
                    <span className="rij-titel">{it.naam}</span>
                    <span className="rij-sub">
                      {it.soort === 'opstelling' ? 'Opstelling' : 'Tactiekbord'} · gedeeld door {it.eigenaar === ik ? 'jou' : it.eigenaarNaam}
                    </span>
                  </span>
                </a>
                <div className="training-acties">{itemKnoppen(it)}</div>
              </li>
            ))}
          </ul>
        )}

        <h2 className="sectie-titel">Leden</h2>
        <ul className="lijst">
          {t.leden.map((l) => (
            <li key={l.uid} className="training-regel lid-regel">
              <span className="rij">
                <Icoon naam="persoon" maat={22} className="training-icoon" />
                <span className="rij-tekst">
                  <span className="rij-titel">
                    {l.naam}
                    {l.uid === ik ? ' (jij)' : ''}
                  </span>
                  <span className="rij-sub">{l.rol === 'beheerder' ? 'Beheerder' : 'Lid'}</span>
                </span>
              </span>
              {beheerder && l.uid !== ik && (
                <div className="training-acties">
                  <button className="knop knop-klein" disabled={bezig} onClick={() => void doe((m) => m.zetRol(t.id, l.uid, l.rol === 'beheerder' ? 'lid' : 'beheerder'))}>
                    {l.rol === 'beheerder' ? 'Lid maken' : 'Beheerder maken'}
                  </button>
                  <button
                    className="icoon-knop gevaar"
                    aria-label={`${l.naam} uit het team verwijderen`}
                    disabled={bezig}
                    onClick={() => {
                      if (window.confirm(`${l.naam} uit het team verwijderen?`)) void doe((m) => m.verwijderLid(t.id, l.uid), `${l.naam} is verwijderd`);
                    }}
                  >
                    <Icoon naam="prullenbak" maat={20} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="knoppenrij team-onder">
          <button
            className="knop"
            disabled={bezig}
            onClick={() => {
              if (window.confirm(`Team "${t.naam}" verlaten?`))
                void doe((m) => m.verlaatTeam(t.id)).then((ok) => {
                  if (ok) vervang('/teams');
                });
            }}
          >
            <Icoon naam="uitloggen" maat={18} />
            Team verlaten
          </button>
          {beheerder && (
            <button
              className="knop knop-gevaar"
              disabled={bezig}
              onClick={() => {
                if (window.confirm(`Team "${t.naam}" opheffen? Alle gedeelde items en leden verdwijnen uit het team (ieders eigen oefeningen en trainingen blijven).`))
                  void doe((m) => m.hefTeamOp(t.id)).then((ok) => {
                    if (ok) vervang('/teams');
                  });
              }}
            >
              <Icoon naam="prullenbak" maat={18} />
              Team opheffen
            </button>
          )}
        </div>
      </main>
      <Toast tekst={melding} />
    </div>
  );
}

/** Gedeelde training: bekijken en kopiëren naar je eigen trainingen. */
export function TeamTrainingScherm({ id, item }: { id: string; item: string }) {
  const t = useTeam(id);
  const it = t?.items.find((x) => x.id === item && x.soort === 'training');
  const tt = useMemo(() => (it ? leesTeamTraining(it) : null), [it]);
  const oefeningen = useMemo(() => (tt ? tt.training.oefeningen.map((oid) => tt.eigen.find((o) => o.id === oid) ?? vindOefening(oid)).filter((o): o is Oefening => !!o) : []), [tt]);
  const spullen = useMemo(() => benodigdheden(oefeningen), [oefeningen]);
  if (!t || !it || !tt) return <NietGevonden />;
  const kopieer = () => {
    // Eigen oefeningen uit de training worden jouw eigen oefeningen; de training komt in Mijn trainingen.
    const ids = eigenOefeningen.importeer(tt.eigen);
    const nieuw = trainingen.importeer({ ...tt.training, oefeningen: tt.training.oefeningen.map((x) => ids.get(x) ?? x) });
    ga(`/training/${nieuw.id}`);
  };
  return (
    <div className="pagina">
      <Kop titel={t.naam} ouder={`/team/${t.id}`} />
      <main className="inhoud smal">
        <section className="blok gedeeld-kop">
          <p className="klein">Gedeeld door {it.eigenaarNaam}</p>
          <h2 className="detail-titel">{tt.training.naam || 'Training'}</h2>
          <p>{[meervoud(oefeningen.length, 'oefening', 'oefeningen'), meervoud(tt.training.spelers, 'speler', 'spelers'), meervoud(tt.training.keepers, 'keeper', 'keepers')].join(' · ')}</p>
          <button className="knop knop-primair knop-breed" onClick={kopieer}>
            <Icoon naam="kopieer" maat={20} />
            Kopiëren naar mijn trainingen
          </button>
        </section>
        <ol className="onderdelen alleen-lezen">
          {oefeningen.map((o, i) => (
            <li key={o.id} className="onderdeel">
              <span className="onderdeel-nr">{i + 1}</span>
              <span className="onderdeel-tekst">
                <Miniatuur tekening={o.tekening} className="onderdeel-plaatje" />
                <span className="onderdeel-info">
                  <span className="onderdeel-naam">{o.naam}</span>
                  <Labels oefening={o} />
                </span>
              </span>
            </li>
          ))}
        </ol>
        {spullen.length > 0 && (
          <section className="blok">
            <h3>Klaarzetten</h3>
            <ul className="klaarzetten">
              {spullen.map((b) => (
                <li key={b.tekst}>
                  <strong>{b.tekst}</strong>
                  <span>{b.oefeningen.join(', ')}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <button className="link-knop" onClick={() => terug(`/team/${t.id}`)}>
          Terug naar het team
        </button>
      </main>
    </div>
  );
}

/**
 * "Delen met team" (eigen oefening of training). Alleen zichtbaar als je ingelogd bent. Zit je in meerdere teams, dan
 * kies je er een.
 */
export function DeelMetTeam({ soort, id, naam }: { soort: 'oefening' | 'training' | 'opstelling' | 'bord'; id: string; naam: string }) {
  const s = useOnlineStatus();
  const lijst = useTeams();
  const [open, setOpen] = useState(false);
  const [melding, toon] = useToast();
  const { bezig, doe } = useActie(toon);
  if (!s.account || !onlineBeschikbaar()) return null;
  const deel = (t: Team) => {
    setOpen(false);
    void doe(async (m) => {
      if (soort === 'oefening') {
        const o = eigenOefeningen.haal(id);
        if (!o) throw new Error('Online: oefening niet gevonden');
        await m.deelOefening(t.id, o);
      } else if (soort === 'training') await m.deelTraining(t.id, id);
      else await m.deelWedstrijd(t.id, soort, id);
    }, `Gedeeld met ${t.naam}`);
  };
  const gedeeld = lijst.filter((t) => t.items.some((it) => it.id === id && it.eigenaar === s.account!.uid));
  return (
    <>
      <button className="knop" disabled={bezig} onClick={() => (lijst.length === 1 ? deel(lijst[0]!) : setOpen(true))}>
        <Icoon naam="team" maat={18} />
        Delen met team
      </button>
      {gedeeld.length > 0 && <p className="klein gedeeld-met">Gedeeld met {gedeeld.map((t) => t.naam).join(', ')}</p>}
      {open && (
        <div className="paneel-achter" onClick={() => setOpen(false)}>
          <div className="paneel" role="dialog" aria-label="Delen met team" onClick={(e) => e.stopPropagation()}>
            <div className="paneel-kop">
              <h2>"{naam || 'Zonder naam'}" delen met</h2>
              <button className="icoon-knop" aria-label="Sluiten" onClick={() => setOpen(false)}>
                <Icoon naam="kruis" />
              </button>
            </div>
            {lijst.length === 0 ? (
              <div className="leeg">
                <p>Je zit nog niet in een team.</p>
                <button className="knop knop-primair" onClick={() => ga('/teams')}>
                  Naar Teams
                </button>
              </div>
            ) : (
              <ul className="lijst">
                {lijst.map((t) => (
                  <li key={t.id}>
                    <button className="rij rij-knop" onClick={() => deel(t)}>
                      <Icoon naam="team" maat={22} className="training-icoon" />
                      <span className="rij-tekst">
                        <span className="rij-titel">{t.naam}</span>
                        <span className="rij-sub">{meervoud(t.leden.length, 'lid', 'leden')}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <Toast tekst={melding} />
    </>
  );
}

/** Op de detailpagina van een gedeelde teamoefening: wie deelde hem; terugtrekken (eigen) of verwijderen (beheerder). */
export function TeamItemActies({ oefening }: { oefening: Oefening }) {
  const s = useOnlineStatus();
  const t = useTeam(oefening.team?.id ?? '');
  const [melding, toon] = useToast();
  const { bezig, doe } = useActie(toon);
  if (!oefening.team || !s.account || !t) return null;
  const mijn = oefening.team.eigenaar === s.account.uid;
  return (
    <>
      <p className="klein gedeeld-met">
        Gedeeld in {oefening.team.naam} door {mijn ? 'jou' : oefening.team.eigenaarNaam}
      </p>
      {(mijn || t.rol === 'beheerder') && (
        <button
          className="knop"
          disabled={bezig}
          onClick={() => {
            if (mijn || window.confirm(`"${oefening.naam}" uit het team verwijderen?`))
              void doe((m) => m.verwijderItem(t.id, oefening.team!.itemId), mijn ? 'Teruggetrokken' : 'Verwijderd uit het team').then((ok) => {
                if (ok) terug(`/team/${t.id}`);
              });
          }}
        >
          <Icoon naam="kruis" maat={18} />
          {mijn ? 'Terugtrekken uit team' : 'Verwijderen uit team'}
        </button>
      )}
      <Toast tekst={melding} />
    </>
  );
}
