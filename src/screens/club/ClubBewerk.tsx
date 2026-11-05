import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { Miniatuur } from '../../components/Miniatuur';
import { alleOefeningen, vindOefening } from '../../data/oefeningen';
import { isLeeftijd, LEEFTIJDEN } from '../../data/leeftijden';
import { favorieten } from '../../engine/favorieten';
import { eigenOefeningen } from '../../eigen/opslag';
import { voorDelen } from '../../eigen/eigen';
import { ga } from '../../router';
import { BLOKKEN, blokKandidaten, clubNaam, genereerAlles, genereerBlok, groepGrootte, MAX_GROEPJES, MAX_KINDEREN, MIN_GROEPJES, naarCode, stations, type Blok, type ClubTraining } from '../../clubtraining/clubtraining';
import { clubtrainingen, useClub } from '../../clubtraining/opslag';
import { NietGevonden } from '../NietGevonden';
import { deelUrl, Toast, useToast } from '../training/onderdelen';
import { blokNaam, blokStijl } from './onderdelen';
import type { EigenOefening } from '../../model/types';
import { t as vt } from '../../i18n/t';

const bron = () => ({ alle: alleOefeningen(), favorieten: favorieten.alle(), toeval: Math.random });

/** Link voor de trainers; eigen oefeningen gaan erin mee. */
export function clubLink(c: ClubTraining): string {
  const eigen = Object.values(c.blokken)
    .map((id) => (id ? eigenOefeningen.haal(id) : undefined))
    .filter((o): o is EigenOefening => !!o)
    .map(voorDelen);
  return `${location.origin}${import.meta.env.BASE_URL}#/c/${naarCode(c, eigen)}`;
}

export function ClubBewerk({ id }: { id: string }) {
  const c = useClub(id);
  const [melding, toon] = useToast();
  if (!c) return <NietGevonden />;

  // Altijd op de nieuwste versie uit de opslag (ook bij snel achter elkaar tikken).
  const zet = (w: Partial<ClubTraining>) => clubtrainingen.bewaar({ ...(clubtrainingen.haal(id) ?? c), ...w });
  const genereer = (b: Blok) => {
    const nu = clubtrainingen.haal(id) ?? c;
    const nieuw = genereerBlok(nu, b, bron());
    if (nieuw) zet({ blokken: { ...nu.blokken, [b]: nieuw } });
    else toon(vt('Geen passende oefening voor dit blok.'));
  };
  const aantalStations = stations(c.groepjes).length;
  const klaar = BLOKKEN.every((b) => c.blokken[b]);

  return (
    <div className="pagina">
      <Kop titel={clubNaam(c)} ouder="/club" />
      <main className="inhoud smal">
        <section className="blok club-gegevens">
          <label className="veld">
            <span>{vt('Naam')}</span>
            <input value={c.naam} placeholder={vt('Bijv. Mini Talents')} maxLength={80} onChange={(e) => zet({ naam: e.target.value })} />
          </label>
          <div className="club-twee">
            <label className="veld">
              <span>{vt('Datum')}</span>
              <input type="date" value={c.datums[0] ?? ''} onChange={(e) => zet({ datums: [e.target.value, c.datums[1] ?? ''].filter(Boolean) })} />
            </label>
            <label className="veld">
              <span>{vt('Tweede datum')}</span>
              <input type="date" value={c.datums[1] ?? ''} onChange={(e) => zet({ datums: [c.datums[0] ?? '', e.target.value].filter(Boolean) })} />
            </label>
          </div>
          <label className="leeftijd-keuze">
            <span>{vt('Leeftijd')}</span>
            <select value={c.leeftijd} onChange={(e) => isLeeftijd(e.target.value) && zet({ leeftijd: e.target.value })}>
              {LEEFTIJDEN.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.naam}
                </option>
              ))}
            </select>
          </label>
          <div className="club-twee">
            <label className="veld">
              <span>{vt('Aantal kinderen')}</span>
              <input type="number" inputMode="numeric" min={1} max={MAX_KINDEREN} value={c.kinderen} onChange={(e) => zet({ kinderen: Math.max(1, Math.min(MAX_KINDEREN, Math.round(Number(e.target.value)) || 1)) })} />
            </label>
            <label className="veld">
              <span>{vt('Aantal groepjes')}</span>
              <select value={c.groepjes} onChange={(e) => zet({ groepjes: Number(e.target.value), stationTrainers: {}, veldTrainers: {} })}>
                {Array.from({ length: MAX_GROEPJES - MIN_GROEPJES + 1 }, (_, i) => MIN_GROEPJES + i).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="klein">{aantalStations === c.groepjes ? vt('{s} stations, ± {k} kinderen per groepje.', { s: aantalStations, k: groepGrootte(c) }) : vt('{s} stations voor {g} groepjes, ± {k} kinderen per groepje. Per ronde blijven er {l} leeg, zodat elk groepje elke vorm één keer doet.', { s: aantalStations, g: c.groepjes, k: groepGrootte(c), l: aantalStations - c.groepjes })}</p>
          <label className="veld">
            <span>{vt('Trainers (optioneel, één naam per regel)')}</span>
            <textarea rows={3} value={c.trainers.join('\n')} onChange={(e) => zet({ trainers: e.target.value.split('\n') })} />
          </label>
        </section>

        <div className="club-kop-rij">
          <h2 className="sectie-titel">{vt('4 blokken van 15 minuten')}</h2>
          <button className="knop" onClick={() => zet({ blokken: genereerAlles(clubtrainingen.haal(id) ?? c, bron()) })}>
            <Icoon naam="herhalen" maat={18} />
            {vt('Genereer alles')}
          </button>
        </div>
        <ol className="club-blokken">
          {BLOKKEN.map((b, i) => {
            const oid = c.blokken[b];
            const o = oid ? vindOefening(oid) : undefined;
            return (
              <li key={b} className="club-blok">
                <h3 className="club-blok-kop" style={blokStijl(b)}>
                  <span>{i + 1}</span>
                  {blokNaam(b)}
                </h3>
                {o ? (
                  <a
                    className="club-blok-oefening"
                    href={`#/oefening/${o.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      ga(`/oefening/${o.id}`);
                    }}
                  >
                    <Miniatuur tekening={o.tekening} className="club-blok-plaatje" />
                    <span className="club-blok-naam">{o.naam}</span>
                    <Icoon naam="verder" maat={20} />
                  </a>
                ) : (
                  <p className="klein club-blok-leeg">{vt('{n} oefeningen passen bij dit blok', { n: blokKandidaten(c, b, alleOefeningen()).length })}</p>
                )}
                <div className="club-blok-knoppen">
                  <button className="knop" onClick={() => ga(`/club/${id}/kiezen/${b}`)}>
                    {o ? vt('Andere kiezen') : vt('Kies oefening')}
                  </button>
                  <button className="knop" onClick={() => genereer(b)} aria-label={vt('Genereer {blok}', { blok: blokNaam(b) })}>
                    <Icoon naam="herhalen" maat={18} />
                    {vt('Genereer')}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        <section className="club-acties">
          <button className="knop knop-primair knop-breed" onClick={() => ga(`/club/${id}/plan`)}>
            <Icoon naam="opstelling" maat={20} />
            {vt('Veldplan, rotatie en materiaal')}
          </button>
          <button
            className="knop knop-breed"
            onClick={async () => {
              const m = await deelUrl(clubNaam(c), vt('Circuittraining: {w0}', { w0: clubNaam(c) }), clubLink(clubtrainingen.haal(id) ?? c));
              if (m) toon(m);
            }}
          >
            <Icoon naam="deel" maat={20} />
            {vt('Deel met trainers')}
          </button>
          {!klaar && <p className="klein">{vt('Nog niet alle blokken hebben een oefening.')}</p>}
          <button className="knop knop-breed" onClick={() => ga(`/club/${id}/timer`)}>
            <Icoon naam="afspelen" maat={20} />
            {vt('Kwartiertimer')}
          </button>
        </section>
      </main>
      <Toast tekst={melding} />
    </div>
  );
}
