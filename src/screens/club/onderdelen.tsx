import { useState, type ReactNode } from 'react';
import { Miniatuur } from '../../components/Miniatuur';
import { OefeningBlokken } from '../../components/OefeningBlokken';
import type { Oefening } from '../../model/types';
import {
  blokNaam,
  categorieKleur,
  clubPlan,
  groepNaam,
  oefeningenVan,
  oefeningOpTijd,
  oefeningTijden,
  onderdelenVan,
  partijvelden,
  rondePlekken,
  rondeTijd,
  samenPloeg,
  stationNaam,
  stationTitel,
  samenMeldingen,
  eenheden,
  stationPloeg,
  stationVak,
  veldPloeg,
  veldVak,
  vindOnderdeel,
  type ClubTraining,
  type Fase,
  type Onderdeel,
  type Partijveld,
  type Ronde,
  type Station,
  type Vak,
} from '../../clubtraining/clubtraining';
import { t as vt } from '../../i18n/t';

/** De delen van een clubtraining die het plan en de gedeelde weergave allebei tonen. */
export type ClubInhoud = Pick<ClubTraining, 'groepjes' | 'kinderen' | 'trainers' | 'blokken' | 'onderdelen' | 'starttijd' | 'stationTrainers' | 'veldTrainers' | 'trainerKeuzes'>;
type Vind = (id: string) => Oefening | undefined;

const kleur = (categorie: string) => {
  const k = categorieKleur(categorie);
  return { background: k.vlak, color: k.tekst };
};
const plek = (v: Vak) => ({ left: `${v.x}%`, top: `${v.y}%`, width: `${v.b}%`, height: `${v.h}%` });

/** Staand half veld van bovenaf (goal boven, middenlijn onder). */
function HalfVeld({ children }: { children: ReactNode }) {
  return (
    <div className="club-veld">
      <svg viewBox="0 0 105 136" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke="#fff" strokeWidth="0.7" opacity="0.65">
          <rect x="1" y="1" width="103" height="134" />
          <rect x="23" y="1" width="59" height="33" />
          <rect x="39" y="1" width="27" height="11" />
          <path d="M38 34a16 16 0 0 0 29 0" />
          <path d="M34 135a18.3 18.3 0 0 1 37 0" />
        </g>
      </svg>
      {children}
    </div>
  );
}

function VakKaart({ vak, blok, nr, naam, trainer, oefening, sub, opTik }: { vak: Vak; blok: string; nr: string; naam: string; trainer?: string; oefening?: Oefening; sub?: string; opTik?: () => void }) {
  const inhoud = (
    <>
      <span className="club-vak-kop" style={kleur(blok)}>
        {nr && <b>{nr}</b>}
        <span>{naam}</span>
      </span>
      {oefening ? <Miniatuur tekening={oefening.tekening} className="club-vak-plaatje" /> : <span className="club-vak-leeg">{vt('Nog geen oefening')}</span>}
      {(sub || trainer) && <span className="club-vak-voet">{[sub, trainer].filter(Boolean).join(' · ')}</span>}
    </>
  );
  return opTik ? (
    <button type="button" className="club-vak" style={plek(vak)} onClick={opTik}>
      {inhoud}
    </button>
  ) : (
    <div className="club-vak" style={plek(vak)}>
      {inhoud}
    </div>
  );
}

const oefeningVan = (c: ClubInhoud, s: Station, vind: Vind) => {
  const id = vindOnderdeel(c, s.onderdeel)?.oefening;
  return id ? vind(id) : undefined;
};

/** Namen achter elkaar. */
export const ploegTekst = (lijst: string[]) => lijst.join(', ');

/** "Oefening 1, 2, 3" als er meer dan één oefening in een onderdeel staat. */
export const oefeningNummers = (o?: Onderdeel) => {
  const n = o ? oefeningenVan(o).length : 0;
  return n > 1 ? vt('Oefening {lijst}', { lijst: Array.from({ length: n }, (_, i) => i + 1).join(', ') }) : undefined;
};

/** De oefeningen van een onderdeel: bij meer dan één tik je op Oefening 1, 2, 3 voor de uitleg en de animatie. */
export function BlokOefeningen({ onderdeel, vind }: { onderdeel: Onderdeel; vind: Vind }) {
  const [keuze, setKeuze] = useState(0);
  const lijst = oefeningenVan(onderdeel);
  const tijden = oefeningTijden(onderdeel);
  const i = Math.min(keuze, Math.max(0, lijst.length - 1));
  const o = lijst[i] ? vind(lijst[i]!.oefening) : undefined;
  return (
    <>
      {lijst.length > 1 && (
        <div className="club-oefening-keuze" role="tablist" aria-label={vt('Oefeningen')}>
          {lijst.map((x, n) => (
            <button key={x.oefening} type="button" role="tab" aria-selected={n === i} className={n === i ? 'aan' : ''} onClick={() => setKeuze(n)}>
              {vt('Oefening {nr}', { nr: n + 1 })}
              <small>{vt('{m} min', { m: tijden[n]! })}</small>
            </button>
          ))}
        </div>
      )}
      {o ? <OefeningBlokken key={o.id} o={o} /> : <p className="leeg">{vt('Nog geen oefening')}</p>}
    </>
  );
}

/** Kop boven een veldplan: welke rondes dit zijn. */
export const faseTitel = (f: Fase, plan: { rondes: Ronde[] }) => {
  const a = plan.rondes[f.eerste]!.nr;
  const b = plan.rondes[f.laatste]!.nr;
  return a === b ? vt('Veldplan: ronde {a}', { a }) : vt('Veldplan: rondes {a}–{b}', { a, b });
};

/** Veldplan van één fase: de stations die tegelijk op het veld staan. */
export function VeldplanStations({ c, fase, vind, opStation }: { c: ClubInhoud; fase: Fase; vind: Vind; opStation?: (s: Station) => void }) {
  return (
    <HalfVeld>
      {fase.stations.map((s) => (
        <VakKaart key={s.nr} vak={stationVak(s, fase)} blok={s.vorm} nr={String(s.nr)} naam={stationTitel(s)} sub={oefeningNummers(vindOnderdeel(c, s.onderdeel))} trainer={ploegTekst(stationPloeg(c, s.nr))} oefening={oefeningVan(c, s, vind)} opTik={opStation && (() => opStation(s))} />
      ))}
    </HalfVeld>
  );
}

export const veldGroepen = (v: Partijveld) => [...v.groepen.map(groepNaam), ...(v.metTrainer ? [vt('trainer')] : [])].join(' + ');

/** Een Samen-onderdeel: partijvelden, of één plek voor alle groepjes. */
export function VeldplanSamen({ c, onderdeel, vind, opVeld }: { c: ClubInhoud; onderdeel: Onderdeel; vind: Vind; opVeld?: () => void }) {
  const o = onderdeel.oefening ? vind(onderdeel.oefening) : undefined;
  if (onderdeel.categorie !== 'partijvormen') {
    return (
      <HalfVeld>
        <VakKaart vak={{ x: 4, y: 4, b: 92, h: 92 }} blok={onderdeel.categorie} nr="" naam={blokNaam(onderdeel.categorie)} sub={[vt('Alle groepjes samen'), oefeningNummers(onderdeel)].filter(Boolean).join(' · ')} trainer={ploegTekst(samenPloeg(c, onderdeel))} oefening={o} opTik={opVeld} />
      </HalfVeld>
    );
  }
  const velden = partijvelden(c.groepjes);
  return (
    <>
      <HalfVeld>
        {velden.map((v) => (
          <VakKaart key={v.nr} vak={veldVak(v, velden.length)} blok={onderdeel.categorie} nr="" naam={vt('Veld {nr}', { nr: v.nr })} sub={[veldGroepen(v), oefeningNummers(onderdeel)].filter(Boolean).join(' · ')} trainer={ploegTekst(veldPloeg(c, v.nr))} oefening={o} opTik={opVeld} />
        ))}
      </HalfVeld>
      <p className="klein club-noot">
        {velden.some((v) => v.metTrainer)
          ? vt('Oneven aantal groepjes: op het laatste veld verdeelt het groepje zich in twee teams en speelt de trainer mee als joker. Zo speelt iedereen en wacht niemand.')
          : velden.length === 1
            ? vt('Eén veld: groepje A tegen groepje B.')
            : vt('Twee groepjes per veld. Elk groepje is één team.')}
      </p>
    </>
  );
}

const samenTekst = (c: ClubInhoud, o: Onderdeel, g: number) => {
  if (o.categorie !== 'partijvormen') return vt('Samen');
  return vt('Veld {nr}', { nr: partijvelden(c.groepjes).find((v) => v.groepen.includes(g))!.nr });
};

/** Waar iets leeg staat of dubbel moet. */
export function PlanNoot({ c }: { c: ClubInhoud }) {
  const p = clubPlan(c);
  const dubbel = p.stations.some((s) => s.keer > 1);
  const leegRondes = p.rondes.filter((r) => r.leeg.length);
  const aantalLeeg = Math.max(0, ...leegRondes.map((r) => r.leeg.length));
  return (
    <>
      {dubbel && <p className="klein club-noot">{vt('Er zijn meer groepjes dan onderdelen: daarom staan oefeningen meer dan één keer op het veld.')}</p>}
      {leegRondes.length > 0 && <p className="klein club-noot">{vt('In {n} van de {r} rondes blijven er tot {l} stations leeg. Geen enkel groepje wacht.', { n: leegRondes.length, r: p.rondes.length, l: aantalLeeg })}</p>}
      {p.stations
        .filter((s) => s.samen && s.plek === 0)
        .map((s) => (
          <p key={`samen-${s.nr}`} className="klein club-noot club-samen-noot">
            {vt('{w0} (station {nr}): steeds {n} groepjes samen, in vaste groepjes: {w1}.', {
              w0: blokNaam(s.vorm),
              nr: s.nr,
              n: s.samen!,
              w1: eenheden(c.groepjes, s.samen).map((e) => e.map(groepNaam).join(' + ')).join(', '),
            })}
          </p>
        ))}
      {samenMeldingen(c).map((m) => (
        <p key={m} className="klein club-noot club-melding" role="note">
          {m}
        </p>
      ))}
      {p.verlengd.length > 0 && <p className="klein club-noot">{vt('Alle groepjes wisselen tegelijk, dus een ronde duurt zo lang als het langste onderdeel. Langer dan ingesteld: {w0}.', { w0: p.verlengd.map((o) => blokNaam(o.categorie)).join(', ') })}</p>}
    </>
  );
}

/** Uitleg bij het materiaal als er meer oefeningen in een onderdeel staan. */
export function MateriaalNoot({ c }: { c: Pick<ClubInhoud, 'onderdelen' | 'blokken'> }) {
  if (!onderdelenVan(c).some((o) => oefeningenVan(o).length > 1)) return null;
  return <p className="klein club-noot">{vt('De oefeningen in één onderdeel doe je na elkaar op dezelfde plek. Daarom telt per onderdeel het grootste aantal van elk soort materiaal, niet de som. Stations naast elkaar tellen wel op.')}</p>;
}

/** Rotatieschema: per groepje waar het per ronde staat, daarna per ronde de tijd, de groepjes en de trainers. */
export function RotatieTabel({ c, ik }: { c: ClubInhoud; ik?: string }) {
  const p = clubPlan(c);
  return (
    <>
      <div className="club-tabel-vak">
        <table className="club-tabel">
          <thead>
            <tr>
              <th scope="col">{vt('Groepje')}</th>
              {p.rondes.map((r) => (
                <th key={r.nr} scope="col">
                  {vt('Ronde {nr}', { nr: r.nr })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: c.groepjes }, (_, g) => (
              <tr key={g}>
                <th scope="row">{groepNaam(g)}</th>
                {p.rondes.map((r) => (
                  <td key={r.nr}>
                    {r.samen ? (
                      <span className="club-nr" style={kleur(r.samen.categorie)}>
                        {samenTekst(c, r.samen, g)}
                      </span>
                    ) : (
                      <span className="club-nr" style={kleur(r.plekken[g]!.vorm)}>
                        {r.plekken[g]!.nr}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PlanNoot c={c} />
      <ol className="club-rondes">
        {p.rondes.map((r) => (
          <li key={r.nr} className="club-ronde-kaart">
            <h3>
              <span>{vt('Ronde {nr}', { nr: r.nr })}</span>
              <span className="club-ronde-tijd">{rondeTijd(r, c.starttijd)}</span>
            </h3>
            <RondeLijst c={c} ronde={r} ik={ik} />
          </li>
        ))}
      </ol>
    </>
  );
}

/** In de rondetimer: de oefeningen van een onderdeel, met wat nu aan de beurt is. Tik voor de uitleg en de animatie. */
function RondeOefeningen({ o, vind, seconden, opOefening }: { o?: Onderdeel; vind: Vind; seconden: number; opOefening?: (o: Onderdeel) => void }) {
  const lijst = o ? oefeningenVan(o) : [];
  if (!o || lijst.length < 2) return null;
  const tijden = oefeningTijden(o);
  const nu = oefeningOpTijd(o, seconden);
  return (
    <ol className="club-ronde-oefeningen">
      {lijst.map((x, i) => (
        <li key={x.oefening} className={i === nu ? 'nu' : ''}>
          <button type="button" onClick={() => opOefening?.(o)}>
            <b>{vt('Oefening {nr}', { nr: i + 1 })}</b>
            <span>{vind(x.oefening)?.naam ?? ''}</span>
            <small>{vt('{m} min', { m: tijden[i]! })}</small>
          </button>
        </li>
      ))}
    </ol>
  );
}

/** Wie staat waar in deze ronde, en welke trainers erbij. In de rondetimer ook de oefeningen per onderdeel (`vind`, `seconden`). `ik` = eigen plek uitlichten. */
export function RondeLijst({ c, ronde, vind, seconden = 0, opOefening, ik }: { c: ClubInhoud; ronde: Ronde; vind?: Vind; seconden?: number; opOefening?: (o: Onderdeel) => void; ik?: string }) {
  const oefeningen = (o?: Onderdeel) => vind && <RondeOefeningen o={o} vind={vind} seconden={seconden} opOefening={opOefening} />;
  const plekken = rondePlekken(c, ronde);
  const eigen = (trainers: string[]) => (ik && trainers.includes(ik) ? 'club-ik' : undefined);
  if (ronde.samen) {
    const o = ronde.samen;
    if (o.categorie !== 'partijvormen') {
      return (
        <ul className="club-ronde">
          <li className={eigen(plekken[0]!.trainers)}>
            <span className="club-nr" style={kleur(o.categorie)}>
              {blokNaam(o.categorie)}
            </span>
            {[vt('Alle groepjes samen'), ploegTekst(plekken[0]!.trainers)].filter(Boolean).join(' · ')}
            {oefeningen(o)}
          </li>
        </ul>
      );
    }
    return (
      <>
        <ul className="club-ronde">
          {plekken.map((p) => (
            <li key={p.sleutel} className={eigen(p.trainers)}>
              <span className="club-nr" style={kleur(o.categorie)}>
                {p.naam}
              </span>
              {[veldGroepen(p.veld!), ploegTekst(p.trainers)].filter(Boolean).join(' · ')}
            </li>
          ))}
        </ul>
        {oefeningen(o)}
      </>
    );
  }
  return (
    <ul className="club-ronde">
      {plekken.map((p) => (
        <li key={p.sleutel} className={eigen(p.trainers)}>
          <b>{p.groepen.map(groepNaam).join('+')}</b>
          <span className="club-nr" style={kleur(p.station!.vorm)}>
            {p.station!.nr}
          </span>
          {[p.naam, ploegTekst(p.trainers)].filter(Boolean).join(' · ')}
          {oefeningen(p.onderdeel)}
        </li>
      ))}
      {ronde.leeg.map((s) => (
        <li key={`leeg-${s.nr}`} className="club-ronde-leeg">
          <b>–</b>
          <span className="club-nr" style={kleur(s.vorm)}>
            {s.nr}
          </span>
          {vt('{w0} staat leeg', { w0: stationNaam(s) })}
        </li>
      ))}
    </ul>
  );
}

export const blokStijl = kleur;
export { blokNaam };
