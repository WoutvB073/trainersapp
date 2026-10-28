import { useMemo, useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon, type IcoonNaam } from '../../components/Icoon';
import { meervoud } from '../../components/Labels';
import { ga } from '../../router';
import { datumTekst } from '../../training/training';
import { maakId } from '../../model/id';
import { autoUitsnede } from '../../editor/editor';
import { AnimatieSpeler } from '../../anim/AnimatieSpeler';
import type { Tekening } from '../../model/types';
import { NietGevonden } from '../NietGevonden';
import { Toast, useToast } from '../training/onderdelen';
import { DeelMetTeam } from '../online/Teams';
import { useTeam } from '../../engine/teams';
import { OpstellingVeld } from './OpstellingVeld';
import { borden, opstellingen, spelersnamen, useBord, useBorden, useOpstelling, useOpstellingen, useSpelersnamen } from '../../wedstrijd/opslag';
import {
  bordNaam,
  bordUitOpstelling,
  dupliceerBord,
  dupliceerOpstelling,
  nieuwBord,
  nieuweOpstelling,
  opgesteldBord,
  veldTekening,
  opstellingNaam,
  spelvorm,
  SPELVORMEN,
  uitWedstrijdCode,
  voegSpelerToe,
  vulAan,
  wedstrijdCode,
  wedstrijdCodeUitLink,
  wisselFormatie,
  type Bord,
  type BordSoort,
  type Opstelling,
  type Spelvorm,
  type UitCode,
} from '../../wedstrijd/wedstrijd';
import { SITUATIES } from '../../wedstrijd/hervattingen';
import { vindVoorbeeld } from '../../wedstrijd/bibliotheken';
import { TactiekUitleg } from './Tactieken';
import { t as vt } from '../../i18n/t';

const LAATSTE_SPELVORM = 'trainersapp.spelvorm';
function laatsteSpelvorm(): Spelvorm {
  try {
    const s = localStorage.getItem(LAATSTE_SPELVORM);
    return SPELVORMEN.some((x) => x.id === s) ? (s as Spelvorm) : '11v11';
  } catch {
    return '11v11';
  }
}

/** Deellink: via het deelmenu van de telefoon, anders kopiëren. */
async function deelLink(titel: string, code: string): Promise<string> {
  const url = `${location.origin}${import.meta.env.BASE_URL}#/w/${code}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: titel, text: titel, url });
      return '';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return '';
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return vt('Link gekopieerd');
  } catch {
    return url;
  }
}

/** Tekening met een passende uitsnede (voor afspelen). */
function metUitsnede(t: Tekening): Tekening {
  const w = autoUitsnede(t);
  return w ? { ...t, weergave: w } : t;
}

export function nieuweOpstellingMaken() {
  const o = opstellingen.bewaar(nieuweOpstelling(laatsteSpelvorm(), spelersnamen.lijst()));
  ga(`/opstelling/${o.id}`);
}

function bordMaken(soort: BordSoort, tekening: Tekening, naam: string) {
  const b = borden.bewaar(nieuwBord(soort, tekening, naam));
  ga(`/bord/${b.id}/tekenen`);
}

function Rij({ icoon, titel, sub, naar, opDupliceer, opVerwijder }: { icoon: IcoonNaam; titel: string; sub: string; naar: string; opDupliceer: () => void; opVerwijder: () => void }) {
  return (
    <li className="training-regel">
      <a
        className="rij"
        href={`#${naar}`}
        onClick={(e) => {
          e.preventDefault();
          ga(naar);
        }}
      >
        <Icoon naam={icoon} maat={24} className="training-icoon" />
        <span className="rij-tekst">
          <span className="rij-titel">{titel}</span>
          <span className="rij-sub">{sub}</span>
        </span>
      </a>
      <div className="training-acties">
        <button className="icoon-knop" aria-label={vt('{titel} dupliceren', { titel })} onClick={opDupliceer}>
          <Icoon naam="kopieer" maat={20} />
        </button>
        <button
          className="icoon-knop gevaar"
          aria-label={vt('{titel} verwijderen', { titel })}
          onClick={() => {
            if (window.confirm(vt('"{titel}" verwijderen?', { titel }))) opVerwijder();
          }}
        >
          <Icoon naam="prullenbak" maat={20} />
        </button>
      </div>
    </li>
  );
}

const bordSub = (b: Bord) => {
  const n = b.tekening.lijnen?.length ?? 0;
  return n ? meervoud(n, 'lijn', 'lijnen') : vt('Nog geen lijnen');
};

/** Wedstrijd: opstellingen, tactiekborden en spelhervattingen. */
export function Wedstrijd() {
  const ops = useOpstellingen();
  const bs = useBorden();
  const [kies, setKies] = useState<null | 'tactiek' | 'hervatting'>(null);
  const [melding, toon] = useToast();
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState('');
  const code = wedstrijdCodeUitLink(link);
  const tactiek = bs.filter((b) => b.soort === 'tactiek');
  const hervattingen = bs.filter((b) => b.soort === 'hervatting');

  return (
    <div className="pagina">
      <Kop titel={vt('Wedstrijd')} ouder="/" />
      <main className="inhoud smal wedstrijd">
        <section className="wedstrijd-deel">
          <h2 className="sectie-titel">
            <Icoon naam="opstelling" maat={20} /> {vt('Opstellingen')}
          </h2>
          <button className="knop knop-primair knop-breed" onClick={nieuweOpstellingMaken}>
            <Icoon naam="plus" maat={20} />
            {vt('Nieuwe opstelling')}
          </button>
          {ops.length > 0 && (
            <ul className="lijst">
              {ops.map((o) => (
                <Rij
                  key={o.id}
                  icoon="opstelling"
                  titel={opstellingNaam(o)}
                  sub={[`${spelvorm(o.spelvorm).naam} · ${o.formatie}`, o.datum ? datumTekst(o.datum) : ''].filter(Boolean).join(' · ')}
                  naar={`/opstelling/${o.id}`}
                  opDupliceer={() => (opstellingen.bewaar(dupliceerOpstelling(o)), toon(vt('Kopie gemaakt')))}
                  opVerwijder={() => (opstellingen.verwijder(o.id), toon(vt('Opstelling verwijderd')))}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="wedstrijd-deel">
          <h2 className="sectie-titel">
            <Icoon naam="tactiek" maat={20} /> {vt('Tactiekborden')}
          </h2>
          <button className="knop knop-breed" onClick={() => setKies('tactiek')}>
            <Icoon naam="plus" maat={20} />
            {vt('Nieuw tactiekbord')}
          </button>
          {tactiek.length > 0 && (
            <ul className="lijst">
              {tactiek.map((b) => (
                <Rij
                  key={b.id}
                  icoon="tactiek"
                  titel={bordNaam(b)}
                  sub={bordSub(b)}
                  naar={`/bord/${b.id}`}
                  opDupliceer={() => (borden.bewaar(dupliceerBord(b)), toon(vt('Kopie gemaakt')))}
                  opVerwijder={() => (borden.verwijder(b.id), toon(vt('Tactiekbord verwijderd')))}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="wedstrijd-deel">
          <h2 className="sectie-titel">
            <Icoon naam="hervatting" maat={20} /> {vt('Spelhervattingen')}
          </h2>
          <button className="knop knop-breed" onClick={() => setKies('hervatting')}>
            <Icoon naam="plus" maat={20} />
            {vt('Nieuwe spelhervatting')}
          </button>
          {hervattingen.length > 0 && (
            <ul className="lijst">
              {hervattingen.map((b) => (
                <Rij
                  key={b.id}
                  icoon="hervatting"
                  titel={bordNaam(b)}
                  sub={bordSub(b)}
                  naar={`/bord/${b.id}`}
                  opDupliceer={() => (borden.bewaar(dupliceerBord(b)), toon(vt('Kopie gemaakt')))}
                  opVerwijder={() => (borden.verwijder(b.id), toon(vt('Spelhervatting verwijderd')))}
                />
              ))}
            </ul>
          )}
        </section>

        <div className="link-openen">
          {!linkOpen ? (
            <button className="link-knop" onClick={() => setLinkOpen(true)}>
              <Icoon naam="link" maat={18} />
              {vt('Gedeelde opstelling of tactiekbord openen via een link')}
            </button>
          ) : (
            <form
              className="blok link-formulier"
              onSubmit={(e) => {
                e.preventDefault();
                if (code) ga(`/w/${code}`);
              }}
            >
              <label htmlFor="wedstrijdlink">{vt('Plak de link die je hebt gekregen')}</label>
              <input id="wedstrijdlink" type="url" inputMode="url" placeholder="https://…/#/w/…" value={link} onChange={(e) => setLink(e.target.value)} autoFocus />
              <button className="knop knop-primair" disabled={!code}>
                {vt('Openen')}
              </button>
            </form>
          )}
        </div>
      </main>
      {kies === 'tactiek' && <NieuwTactiekbord ops={ops} opSluit={() => setKies(null)} />}
      {kies === 'hervatting' && <NieuweHervatting opSluit={() => setKies(null)} />}
      <Toast tekst={melding} />
    </div>
  );
}

function Paneel({ titel, opSluit, children }: { titel: string; opSluit: () => void; children: React.ReactNode }) {
  return (
    <div className="paneel-achter" onClick={opSluit}>
      <div className="paneel wedstrijd-paneel" role="dialog" aria-label={titel} onClick={(e) => e.stopPropagation()}>
        <div className="paneel-kop">
          <h2>{titel}</h2>
          <button className="icoon-knop" aria-label={vt('Sluiten')} onClick={opSluit}>
            <Icoon naam="kruis" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NieuwTactiekbord({ ops, opSluit }: { ops: Opstelling[]; opSluit: () => void }) {
  const [vorm, setVorm] = useState<Spelvorm>(laatsteSpelvorm);
  const info = spelvorm(vorm);
  const [formA, setFormA] = useState(info.formaties[0]!);
  const [formB, setFormB] = useState(info.formaties[0]!);
  const kiesVorm = (v: Spelvorm) => {
    setVorm(v);
    setFormA(spelvorm(v).formaties[0]!);
    setFormB(spelvorm(v).formaties[0]!);
    try {
      localStorage.setItem(LAATSTE_SPELVORM, v);
    } catch {
      /* niet erg */
    }
  };
  const leeg = (type: 'heel' | 'half') => {
    const t = veldTekening(type);
    bordMaken('tactiek', t, '');
  };
  return (
    <Paneel titel={vt('Nieuw tactiekbord')} opSluit={opSluit}>
      <h3 className="wedstrijd-sub">{vt('Spelvorm')}</h3>
      <div className="wedstrijd-chips" role="radiogroup" aria-label={vt('Spelvorm')}>
        {SPELVORMEN.map((s) => (
          <button key={s.id} role="radio" aria-checked={vorm === s.id} className={`gen-chip${vorm === s.id ? ' aan' : ''}`} onClick={() => kiesVorm(s.id)}>
            {s.naam}
          </button>
        ))}
      </div>
      <h3 className="wedstrijd-sub">{vt('Formatie van jouw team')}</h3>
      <div className="wedstrijd-chips" role="radiogroup" aria-label={vt('Formatie van jouw team')}>
        {info.formaties.map((f) => (
          <button key={f} role="radio" aria-checked={formA === f} className={`gen-chip${formA === f ? ' aan' : ''}`} onClick={() => setFormA(f)}>
            {f}
          </button>
        ))}
      </div>
      <h3 className="wedstrijd-sub">{vt('Formatie van de tegenstander')}</h3>
      <div className="wedstrijd-chips" role="radiogroup" aria-label={vt('Formatie van de tegenstander')}>
        {info.formaties.map((f) => (
          <button key={f} role="radio" aria-checked={formB === f} className={`gen-chip${formB === f ? ' aan' : ''}`} onClick={() => setFormB(f)}>
            {f}
          </button>
        ))}
      </div>
      <button className="knop knop-primair knop-breed wedstrijd-maak" onClick={() => bordMaken('tactiek', opgesteldBord(vorm, formA, formB), `${info.naam} · ${formA}`)}>
        <Icoon naam="tactiek" maat={20} />
        {vt('Bord met beide teams maken')}
      </button>
      <h3 className="wedstrijd-sub">{vt('Voorbeeldtactiek')}</h3>
      <button className="keuze-kaart" onClick={() => ga('/tactieken')}>
        <Icoon naam="tactiek" maat={28} />
        <span>
          <strong>{vt('Kies een voorbeeldtactiek')}</strong>
          <span className="klein">{vt('17 tactieken: druk zetten, opbouwen, aanvallen en omschakelen')}</span>
        </span>
      </button>
      <h3 className="wedstrijd-sub">{vt('Vanuit een opstelling')}</h3>
      {ops.length === 0 ? (
        <p className="klein">{vt('Maak eerst een opstelling; jouw spelers staan dan met hun namen klaar (en de tegenstander ertegenover).')}</p>
      ) : (
        <div className="wedstrijd-keuzes">
          {ops.map((o) => (
            <button key={o.id} className="keuze-kaart" onClick={() => bordMaken('tactiek', bordUitOpstelling(o), vt('Tactiek – {w0}', { w0: opstellingNaam(o) }))}>
              <Icoon naam="opstelling" maat={28} />
              <span>
                <strong>{opstellingNaam(o)}</strong>
                <span className="klein">
                  {spelvorm(o.spelvorm).naam} · {o.formatie}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
      <h3 className="wedstrijd-sub">{vt('Leeg bord')}</h3>
      <div className="wedstrijd-keuzes wedstrijd-twee">
        <button className="keuze-kaart" onClick={() => leeg('heel')}>
          <Icoon naam="wedstrijd" maat={28} />
          <span>
            <strong>{vt('Heel veld')}</strong>
            <span className="klein">{vt('Zelf spelers neerzetten')}</span>
          </span>
        </button>
        <button className="keuze-kaart" onClick={() => leeg('half')}>
          <Icoon naam="tactiek" maat={28} />
          <span>
            <strong>{vt('Half veld')}</strong>
            <span className="klein">{vt('Met één goal')}</span>
          </span>
        </button>
      </div>
    </Paneel>
  );
}

function NieuweHervatting({ opSluit }: { opSluit: () => void }) {
  return (
    <Paneel titel={vt('Nieuwe spelhervatting')} opSluit={opSluit}>
      <h3 className="wedstrijd-sub">{vt('Beginsituatie (zelf de lijnen tekenen)')}</h3>
      <div className="wedstrijd-chips">
        {SITUATIES.map((s) => (
          <button key={s.id} className="gen-chip" onClick={() => bordMaken('hervatting', s.maak(), s.naam)}>
            {s.naam}
          </button>
        ))}
      </div>
      <h3 className="wedstrijd-sub">{vt('Voorbeeldhervatting')}</h3>
      <button className="keuze-kaart" onClick={() => ga('/hervattingen')}>
        <Icoon naam="hervatting" maat={28} />
        <span>
          <strong>{vt('Kies een voorbeeldhervatting')}</strong>
          <span className="klein">{vt('20 spelhervattingen: corners, vrije trappen, inworp en aftrap, verdedigen')}</span>
        </span>
      </button>
    </Paneel>
  );
}

// ---------- opstelling ----------

export function OpstellingScherm({ id }: { id: string }) {
  const o = useOpstelling(id);
  const namen = useSpelersnamen();
  const [nieuw, setNieuw] = useState('');
  const [melding, toon] = useToast();
  if (!o) return <NietGevonden />;
  const nu = () => opstellingen.haal(id) ?? o;
  const zet = (x: Opstelling) => opstellingen.bewaar(x);
  const info = spelvorm(o.spelvorm);
  const inOpstelling = new Set([...o.plekken.map((p) => p.naam).filter(Boolean), ...o.wissels]);
  const nietIn = namen.filter((n) => !inOpstelling.has(n));
  const lege = o.plekken.filter((p) => !p.naam).length;
  const voegToe = (naam: string) => {
    const n = naam.trim();
    if (!n) return;
    spelersnamen.zet([...spelersnamen.lijst(), n]);
    zet(voegSpelerToe(nu(), n));
  };

  return (
    <div className="pagina">
      <Kop titel={opstellingNaam(o)} ouder="/wedstrijd" />
      <main className="inhoud opst-pagina">
        <div className="opst-links">
          <OpstellingVeld o={o} opWijzig={zet} />
        </div>
        <div className="opst-rechts">
          {lege > 0 && o.wissels.length > 0 && (
            <button className="knop knop-primair knop-breed" onClick={() => zet(vulAan(nu()))}>
              <Icoon naam="spelers" maat={20} />
              {vt('Wissels op de lege posities zetten')}
            </button>
          )}
          <section className="blok">
            <h3>{vt('Spelvorm')}</h3>
            <div className="gen-chips" role="radiogroup" aria-label={vt('Spelvorm')}>
              {SPELVORMEN.map((s) => (
                <button
                  key={s.id}
                  role="radio"
                  aria-checked={o.spelvorm === s.id}
                  className={`gen-chip${o.spelvorm === s.id ? ' aan' : ''}`}
                  onClick={() => {
                    try {
                      localStorage.setItem(LAATSTE_SPELVORM, s.id);
                    } catch {
                      /* niet erg */
                    }
                    if (s.id !== o.spelvorm) zet(wisselFormatie(nu(), s.id, s.formaties[0]!));
                  }}
                >
                  {s.naam}
                </button>
              ))}
            </div>
            <h3 className="opst-sub">{vt('Formatie')}</h3>
            <div className="gen-chips" role="radiogroup" aria-label={vt('Formatie')}>
              {info.formaties.map((f) => (
                <button
                  key={f}
                  role="radio"
                  aria-checked={o.formatie === f}
                  className={`gen-chip${o.formatie === f ? ' aan' : ''}`}
                  onClick={() => f !== o.formatie && zet(wisselFormatie(nu(), o.spelvorm, f))}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="klein">{vt('Sleep spelers naar een positie of naar de wissels; sleep een lege positie om hem te verplaatsen. Tikken kan ook.')}</p>
          </section>

          <section className="blok">
            <h3>{vt('Spelers')}</h3>
            <form
              className="team-form"
              onSubmit={(e) => {
                e.preventDefault();
                voegToe(nieuw);
                setNieuw('');
              }}
            >
              <input aria-label={vt('Naam van de speler')} placeholder={vt('Naam')} value={nieuw} maxLength={40} onChange={(e) => setNieuw(e.target.value)} />
              <button className="knop" disabled={!nieuw.trim()}>
                <Icoon naam="plus" maat={18} />
                {vt('Toevoegen')}
              </button>
            </form>
            {nietIn.length > 0 && (
              <>
                <p className="klein">{vt('Uit je spelerslijst (tik om bij de wissels te zetten):')}</p>
                <div className="gen-chips">
                  {nietIn.map((n) => (
                    <span key={n} className="naam-chip">
                      <button className="gen-chip" onClick={() => zet(voegSpelerToe(nu(), n))}>
                        <Icoon naam="plus" maat={15} />
                        {n}
                      </button>
                      <button className="icoon-knop" aria-label={vt('{n} uit je spelerslijst halen', { n })} onClick={() => spelersnamen.zet(spelersnamen.lijst().filter((x) => x !== n))}>
                        <Icoon naam="kruis" maat={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </>
            )}
            <p className="klein">{vt('Namen worden onthouden voor je volgende opstelling.')}</p>
          </section>

          <section className="blok training-gegevens">
            <label className="veld">
              <span>{vt('Naam (optioneel)')}</span>
              <input value={o.naam} placeholder={vt('Bijv. Zaterdag tegen VVA')} maxLength={80} onChange={(e) => zet({ ...nu(), naam: e.target.value })} />
            </label>
            <label className="veld">
              <span>{vt('Datum (optioneel)')}</span>
              <input type="date" value={o.datum ?? ''} onChange={(e) => zet({ ...nu(), datum: e.target.value || undefined })} />
            </label>
          </section>

          <div className="knoppenrij">
            <button className="knop knop-primair" onClick={() => bordMaken('tactiek', bordUitOpstelling(nu()), vt('Tactiek – {w0}', { w0: opstellingNaam(nu()) }))}>
              <Icoon naam="tactiek" maat={20} />
              {vt('Tactiekbord maken')}
            </button>
            <button className="knop" onClick={() => void deelLink(opstellingNaam(o), wedstrijdCode({ soort: 'opstelling', opstelling: nu() })).then((m) => m && toon(m))}>
              <Icoon naam="deel" maat={20} />
              {vt('Delen')}
            </button>
            <button
              className="knop"
              onClick={() => {
                const k = opstellingen.bewaar(dupliceerOpstelling(nu()));
                ga(`/opstelling/${k.id}`);
              }}
            >
              <Icoon naam="kopieer" maat={20} />
              {vt('Dupliceren')}
            </button>
          </div>
          <div className="team-delen">
            <DeelMetTeam soort="opstelling" id={o.id} naam={opstellingNaam(o)} />
          </div>
          <button
            className="link-knop gevaar-link"
            onClick={() => {
              if (window.confirm(vt('"{w0}" verwijderen?', { w0: opstellingNaam(o) }))) {
                opstellingen.verwijder(o.id);
                ga('/wedstrijd');
              }
            }}
          >
            <Icoon naam="prullenbak" maat={18} />
            {vt('Opstelling verwijderen')}
          </button>
        </div>
      </main>
      <Toast tekst={melding} />
    </div>
  );
}

// ---------- tactiekbord / spelhervatting ----------

export function BordScherm({ id }: { id: string }) {
  const b = useBord(id);
  const [melding, toon] = useToast();
  const speel = useMemo(() => (b ? metUitsnede(b.tekening) : null), [b]);
  if (!b || !speel) return <NietGevonden />;
  const nu = () => borden.haal(id) ?? b;
  const lijnen = b.tekening.lijnen?.length ?? 0;
  const voorbeeld = vindVoorbeeld(b.tactiek);
  return (
    <div className="pagina">
      <Kop titel={bordNaam(b)} ouder="/wedstrijd" />
      <main className="inhoud detail bord-pagina">
        <div className="detail-animatie">
          <AnimatieSpeler tekening={speel} />
        </div>
        <div className="detail-tekst">
          {voorbeeld && <TactiekUitleg tactiek={voorbeeld.x} soort={voorbeeld.bieb.soort} />}
          {!lijnen && <p className="hint">{vt('Tik op Tekenen om looplijnen, passes en dribbels te tekenen. Elke lijn krijgt een stapnummer; zo speelt het af in 2D en 3D.')}</p>}
          <section className="blok training-gegevens">
            <label className="veld">
              <span>{vt('Naam')}</span>
              <input
                value={b.naam}
                placeholder={b.soort === 'hervatting' ? vt('Bijv. Corner eerste paal') : vt('Bijv. Druk zetten na balverlies')}
                maxLength={80}
                onChange={(e) => borden.bewaar({ ...nu(), naam: e.target.value })}
              />
            </label>
          </section>
          <div className="knoppenrij">
            <button className="knop knop-primair" onClick={() => ga(`/bord/${id}/tekenen`)}>
              <Icoon naam="potlood" maat={20} />
              {vt('Tekenen')}
            </button>
            <button
              className={`knop${b.tekening.namen ? ' knop-aan' : ''}`}
              aria-pressed={!!b.tekening.namen}
              onClick={() => {
                const nu2 = nu();
                const aan = !nu2.tekening.namen;
                borden.bewaar({ ...nu2, tekening: { ...nu2.tekening, namen: aan } });
                if (aan && !nu2.tekening.objecten.some((o) => o.naam)) toon(vt('Nog geen namen: tik op Tekenen, kies een speler en vul zijn naam in'));
              }}
            >
              <Icoon naam="label" maat={20} />
              {b.tekening.namen ? vt('Namen verbergen') : vt('Namen tonen')}
            </button>
            <button
              className="knop"
              disabled={!lijnen}
              onClick={() => {
                if (window.confirm(vt('Alle lijnen wissen? De spelers blijven staan.'))) {
                  const t = { ...nu().tekening, lijnen: [] };
                  delete t.animatie;
                  borden.bewaar({ ...nu(), tekening: t });
                  toon(vt('Lijnen gewist'));
                }
              }}
            >
              <Icoon naam="gum" maat={20} />
              {vt('Lijnen wissen')}
            </button>
          </div>
          <div className="knoppenrij">
            <button className="knop" onClick={() => void deelLink(bordNaam(b), wedstrijdCode({ soort: 'bord', bord: nu() })).then((m) => m && toon(m))}>
              <Icoon naam="deel" maat={20} />
              {vt('Delen')}
            </button>
            <button
              className="knop"
              onClick={() => {
                const k = borden.bewaar(dupliceerBord(nu()));
                ga(`/bord/${k.id}`);
              }}
            >
              <Icoon naam="kopieer" maat={20} />
              {vt('Dupliceren')}
            </button>
          </div>
          <div className="team-delen">
            <DeelMetTeam soort="bord" id={b.id} naam={bordNaam(b)} />
          </div>
          <button
            className="link-knop gevaar-link"
            onClick={() => {
              if (window.confirm(vt('"{w0}" verwijderen?', { w0: bordNaam(b) }))) {
                borden.verwijder(b.id);
                ga('/wedstrijd');
              }
            }}
          >
            <Icoon naam="prullenbak" maat={18} />
            {vt('Verwijderen')}
          </button>
        </div>
      </main>
      <Toast tekst={melding} />
    </div>
  );
}

// ---------- gedeeld (link of team) ----------

function Voorbeeld({ x, titel, ouder, knop }: { x: UitCode; titel: string; ouder: string; knop: string }) {
  const speel = useMemo(() => (x.soort === 'bord' ? metUitsnede(x.bord.tekening) : null), [x]);
  const opslaan = () => {
    const nu = Date.now();
    if (x.soort === 'opstelling') {
      const o = opstellingen.bewaar({ ...x.opstelling, id: maakId(), gemaakt: nu, gewijzigd: nu });
      ga(`/opstelling/${o.id}`);
    } else {
      const b = borden.bewaar({ ...x.bord, id: maakId(), gemaakt: nu, gewijzigd: nu });
      ga(`/bord/${b.id}`);
    }
  };
  const naam = x.soort === 'opstelling' ? opstellingNaam(x.opstelling) : bordNaam(x.bord);
  return (
    <div className="pagina">
      <Kop titel={titel} ouder={ouder} />
      <main className={`inhoud ${x.soort === 'opstelling' ? 'opst-pagina' : 'detail bord-pagina'}`}>
        <div className={x.soort === 'opstelling' ? 'opst-links' : 'detail-animatie'}>
          {x.soort === 'opstelling' ? <OpstellingVeld o={{ ...x.opstelling, id: 'voorbeeld', gemaakt: 0, gewijzigd: 0 }} /> : <AnimatieSpeler tekening={speel!} />}
        </div>
        <div className={x.soort === 'opstelling' ? 'opst-rechts' : 'detail-tekst'}>
          <section className="blok">
            <p className="opst-soort">{x.soort === 'opstelling' ? vt('Opstelling') : x.bord.soort === 'hervatting' ? vt('Spelhervatting') : vt('Tactiekbord')}</p>
            <h2 className="detail-titel">{naam}</h2>
            {x.soort === 'opstelling' && (
              <p className="klein">
                {spelvorm(x.opstelling.spelvorm).naam} · {x.opstelling.formatie}
                {x.opstelling.datum ? ` · ${datumTekst(x.opstelling.datum)}` : ''}
              </p>
            )}
          </section>
          <button className="knop knop-primair knop-breed" onClick={opslaan}>
            <Icoon naam="kopieer" maat={20} />
            {knop}
          </button>
        </div>
      </main>
    </div>
  );
}

export function GedeeldWedstrijd({ code }: { code: string }) {
  const x = useMemo(() => uitWedstrijdCode(code), [code]);
  if (!x) return <NietGevonden />;
  return <Voorbeeld x={x} titel={x.soort === 'opstelling' ? vt('Gedeelde opstelling') : vt('Gedeeld tactiekbord')} ouder="/wedstrijd" knop={vt('Opslaan bij mijn wedstrijd')} />;
}

export function TeamWedstrijdScherm({ id, item }: { id: string; item: string }) {
  const team = useTeam(id);
  const it = team?.items.find((i) => i.id === item);
  const x = useMemo<UitCode | null>(() => {
    if (!it) return null;
    try {
      const d = JSON.parse(it.data) as Opstelling & Bord;
      if (it.soort === 'opstelling') return { soort: 'opstelling', opstelling: { naam: d.naam, datum: d.datum, spelvorm: d.spelvorm, formatie: d.formatie, plekken: d.plekken, wissels: d.wissels } };
      if (it.soort === 'bord') return { soort: 'bord', bord: { naam: d.naam, soort: d.soort, tekening: d.tekening } };
    } catch {
      /* kapot */
    }
    return null;
  }, [it]);
  if (!team || !x) return <NietGevonden />;
  return <Voorbeeld x={x} titel={`${team.naam}: ${x.soort === 'opstelling' ? 'opstelling' : 'tactiekbord'}`} ouder={`/team/${id}`} knop={vt('Kopiëren naar mijn wedstrijd')} />;
}
