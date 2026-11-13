import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { useState } from 'react';
import { clubNaam, clubPlan, dupliceer, nieuweClub, onderdelenVan, tijdTekst, uitSjabloon, zelfOnderdelen, type ClubTraining } from '../../clubtraining/clubtraining';
import { clubtrainingen, echteClubs, sjablonen, useClubtrainingen, rooster } from '../../clubtraining/opslag';
import { volgendeWeek, vulVolgensRooster } from '../../clubtraining/rooster';
import { datumTekst } from '../../training/training';
import { huidigeFilters } from '../../engine/filters';
import { ga } from '../../router';
import { Toast, useToast } from '../training/onderdelen';
import { t as vt } from '../../i18n/t';

/** Mini Talents: de laatst gekozen mini-groep als die er is, anders Mini's 5–7. */
function maakMiniTalents() {
  const l = huidigeFilters().leeftijd;
  const c = clubtrainingen.bewaar(nieuweClub(l?.startsWith('mini') ? l : undefined));
  ga(`/club/${c.id}`);
}

function maakZelf() {
  const l = huidigeFilters().leeftijd;
  const c = clubtrainingen.bewaar({ ...nieuweClub(l ?? undefined), onderdelen: zelfOnderdelen() });
  ga(`/club/${c.id}`);
}

const opzetTekst = (c: ClubTraining) => [vt('{g} groepjes', { g: c.groepjes }), vt('{n} onderdelen', { n: onderdelenVan(c).length }), tijdTekst(clubPlan(c).totaal)].join(' · ');

/** Een nieuwe circuittraining begint met de keuze voor een sjabloon of Zelf samenstellen. */
function NieuwPaneel({ eigen, opSluit }: { eigen: ClubTraining[]; opSluit: () => void }) {
  return (
    <div className="paneel-achter" onClick={opSluit}>
      <div className="paneel" role="dialog" aria-label={vt('Nieuwe circuittraining')} onClick={(e) => e.stopPropagation()}>
        <div className="paneel-kop">
          <h2>{vt('Nieuwe circuittraining')}</h2>
          <button className="icoon-knop" aria-label={vt('Sluiten')} onClick={opSluit}>
            <Icoon naam="kruis" />
          </button>
        </div>
        <ul className="lijst">
          <li>
            <button className="rij rij-knop" onClick={maakMiniTalents}>
              <Icoon naam="team" maat={22} className="training-icoon" />
              <span className="rij-tekst">
                <span className="rij-titel">{vt('Mini Talents')}</span>
                <span className="rij-sub">{opzetTekst(nieuweClub())}</span>
              </span>
            </button>
          </li>
          {eigen.map((s) => (
            <li key={s.id} className="training-regel">
              <button
                className="rij rij-knop"
                onClick={() => {
                  const c = clubtrainingen.bewaar(vulVolgensRooster(uitSjabloon(s), rooster.lijst(), true));
                  ga(`/club/${c.id}`);
                }}
              >
                <Icoon naam="download" maat={22} className="training-icoon" />
                <span className="rij-tekst">
                  <span className="rij-titel">{s.naam}</span>
                  <span className="rij-sub">{opzetTekst(s)}</span>
                </span>
              </button>
              <div className="training-acties">
                <button
                  className="icoon-knop gevaar"
                  aria-label={vt('Sjabloon {w0} verwijderen', { w0: s.naam })}
                  onClick={() => {
                    if (confirm(vt('{w0} verwijderen?', { w0: s.naam }))) clubtrainingen.verwijder(s.id);
                  }}
                >
                  <Icoon naam="prullenbak" maat={20} />
                </button>
              </div>
            </li>
          ))}
          <li>
            <button className="rij rij-knop" onClick={maakZelf}>
              <Icoon naam="plus" maat={22} className="training-icoon" />
              <span className="rij-tekst">
                <span className="rij-titel">{vt('Zelf samenstellen')}</span>
                <span className="rij-sub">{vt('Kies je eigen onderdelen, duur en groepjes')}</span>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Regel({ c, opMelding }: { c: ClubTraining; opMelding: (s: string) => void }) {
  const sub = [c.datums.map((d) => datumTekst(d)).join(' · '), vt('{g} groepjes', { g: c.groepjes }), tijdTekst(clubPlan(c).totaal)].filter(Boolean).join(' · ');
  return (
    <li className="training-regel">
      <a
        className="rij"
        href={`#/club/${c.id}`}
        onClick={(e) => {
          e.preventDefault();
          ga(`/club/${c.id}`);
        }}
      >
        <Icoon naam="team" maat={24} className="training-icoon" />
        <span className="rij-tekst">
          <span className="rij-titel">{clubNaam(c)}</span>
          <span className="rij-sub">{sub}</span>
        </span>
      </a>
      <div className="training-acties">
        <button
          className="icoon-knop"
          aria-label={vt('{w0} dupliceren', { w0: clubNaam(c) })}
          title={vt('Dupliceren')}
          onClick={() => {
            clubtrainingen.bewaar(dupliceer(c));
            opMelding(vt('Kopie gemaakt'));
          }}
        >
          <Icoon naam="kopieer" maat={20} />
        </button>
        <button
          className="icoon-knop"
          aria-label={vt('{w0} dupliceren naar volgende week', { w0: clubNaam(c) })}
          title={vt('Dupliceer naar volgende week')}
          onClick={() => {
            clubtrainingen.bewaar(volgendeWeek(c, rooster.lijst()));
            opMelding(vt('Gekopieerd naar volgende week'));
          }}
        >
          <Icoon naam="kalender" maat={20} />
        </button>
        <button
          className="icoon-knop gevaar"
          aria-label={vt('{w0} verwijderen', { w0: clubNaam(c) })}
          onClick={() => {
            if (confirm(vt('{w0} verwijderen?', { w0: clubNaam(c) }))) clubtrainingen.verwijder(c.id);
          }}
        >
          <Icoon naam="prullenbak" maat={20} />
        </button>
      </div>
    </li>
  );
}

export function ClubLijst() {
  const alles = useClubtrainingen();
  const lijst = echteClubs(alles);
  const [melding, toon] = useToast();
  const [nieuw, setNieuw] = useState(false);
  return (
    <div className="pagina">
      <Kop titel={vt('Circuittraining')} ouder="/" />
      <main className="inhoud smal">
        <button className="knop knop-primair knop-breed" onClick={() => setNieuw(true)}>
          <Icoon naam="plus" maat={20} />
          {vt('Nieuwe circuittraining')}
        </button>
        <button className="knop knop-breed" onClick={() => ga('/rooster')}>
          <Icoon naam="team" maat={20} />
          {vt('Trainersrooster')}
        </button>
        {lijst.length ? (
          <ul className="lijst club-lijst">
            {lijst.map((c) => (
              <Regel key={c.id} c={c} opMelding={toon} />
            ))}
          </ul>
        ) : (
          <div className="leeg">
            <p className="leeg-titel">{vt('Nog geen circuittrainingen')}</p>
            <p>{vt('Groepjes die rouleren langs stations, met onderdelen die je zelf kiest. De app maakt het veldplan, het rotatieschema en de materiaallijst.')}</p>
          </div>
        )}
      </main>
      {nieuw && <NieuwPaneel eigen={sjablonen(alles)} opSluit={() => setNieuw(false)} />}
      <Toast tekst={melding} />
    </div>
  );
}
