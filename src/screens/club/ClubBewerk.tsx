import { useState } from 'react';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { Miniatuur } from '../../components/Miniatuur';
import { alleOefeningen, vindOefening } from '../../data/oefeningen';
import { isLeeftijd, LEEFTIJDEN } from '../../data/leeftijden';
import { favorieten } from '../../engine/favorieten';
import { meeTeNemen } from '../../eigen/meenemen';
import { ga } from '../../router';
import {
  alsSjabloon,
  CATEGORIEEN,
  clubNaam,
  clubPlan,
  DUUR_KEUZES,
  genereerAlles,
  genereerOnderdeel,
  groepGrootte,
  MAX_BLOK_OEFENINGEN,
  MAX_DUUR,
  MAX_GROEPJES,
  MAX_KINDEREN,
  MAX_ONDERDELEN,
  metOefeningen,
  MIN_GROEPJES,
  MIN_ONDERDELEN,
  naarCode,
  nieuwOnderdeel,
  oefeningenVan,
  oefeningIds,
  oefeningTijden,
  onderdeelKandidaten,
  onderdelenVan,
  heeftDagen,
  opDag,
  teVeelRichttijd,
  tijdTekst,
  trainerModus,
  trainerNamen,
  zetDagTrainers,
  zetModusOveral,
  zonderIndelingOveral,
  type BlokOefening,
  type ClubTraining,
  type Onderdeel,
  type OnderdeelSoort,
  samenPer,
  samenMeldingen,
  eigenOpzet,
  maakEigenOpzet,
  zetDagOpzet,
  alleOnderdelen,
  metAlleOefeningIds,
  zetSessie,
  voegSessieToe,
  verwijderSessie,
  sessieTekst,
  sessieTijd,
  leeftijdMelding,
  MAX_SESSIES,
} from '../../clubtraining/clubtraining';
import { clubtrainingen, rooster, useClub, useRooster } from '../../clubtraining/opslag';
import { roosterGroepen, vulVolgensRooster } from '../../clubtraining/rooster';
import { DagKeuze, useDag } from './dag';
import { NietGevonden } from '../NietGevonden';
import { deelInhoud } from '../../engine/deellink';
import { Toast, useToast } from '../training/onderdelen';
import { blokNaam, blokStijl, PlanNoot } from './onderdelen';
import { DeelMetTeam } from '../online/Teams';
import { t as vt } from '../../i18n/t';

const bron = () => ({ alle: alleOefeningen(), favorieten: favorieten.alle(), toeval: Math.random });

/** Code voor de link voor de trainers; eigen oefeningen gaan erin mee. */
export function clubCode(c: ClubTraining): string {
  const { eigen, nieuwId } = meeTeNemen(oefeningIds(c));
  return naarCode({ ...c, ...metAlleOefeningIds(c, nieuwId) }, eigen);
}

const ANDERS = 'anders';

/** Duur van een onderdeel: de vaste keuzes, of zelf invullen. */
function DuurKeuze({ o, opZet }: { o: Onderdeel; opZet: (duur: number) => void }) {
  const [zelf, setZelf] = useState(!DUUR_KEUZES.includes(o.duur));
  const naam = blokNaam(o.categorie);
  return (
    <div className="club-duur">
      <label className="leeftijd-keuze">
        <span>{vt('Duur')}</span>
        <select
          aria-label={vt('Duur van {w0}', { w0: naam })}
          value={zelf ? ANDERS : o.duur}
          onChange={(e) => {
            if (e.target.value === ANDERS) return setZelf(true);
            setZelf(false);
            opZet(Number(e.target.value));
          }}
        >
          {DUUR_KEUZES.map((d) => (
            <option key={d} value={d}>
              {vt('{m} min', { m: d })}
            </option>
          ))}
          <option value={ANDERS}>{vt('Zelf invullen')}</option>
        </select>
      </label>
      {zelf && (
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_DUUR}
          value={o.duur}
          aria-label={vt('Minuten voor {w0}', { w0: naam })}
          onChange={(e) => opZet(Math.max(1, Math.min(MAX_DUUR, Math.round(Number(e.target.value)) || 1)))}
        />
      )}
    </div>
  );
}

function SoortKeuze({ o, opZet }: { o: Onderdeel; opZet: (soort: OnderdeelSoort) => void }) {
  const keuzes: [OnderdeelSoort, string][] = [
    ['stations', vt('Stations')],
    ['samen', vt('Samen')],
  ];
  return (
    <div className="club-soort" role="radiogroup" aria-label={vt('Soort voor {w0}', { w0: blokNaam(o.categorie) })}>
      {keuzes.map(([k, naam]) => (
        <button key={k} type="button" role="radio" aria-checked={o.soort === k} className={o.soort === k ? 'aan' : ''} onClick={() => opZet(k)}>
          {naam}
        </button>
      ))}
    </div>
  );
}

/** Bij Samen (0.34.2): hoeveel groepjes er tegelijk komen. "Alle groepjes" is zoals vóór 0.34.2. */
function SamenKeuze({ o, groepjes, opZet }: { o: Onderdeel; groepjes: number; opZet: (n: number | undefined) => void }) {
  if (o.soort !== 'samen' || groepjes < 3) return null;
  const nu = samenPer(o, groepjes) ?? 0;
  return (
    <label className="club-samen-keuze">
      <span>{vt('Groepjes samen')}</span>
      <select value={nu} onChange={(e) => opZet(Number(e.target.value) || undefined)} aria-label={vt('Groepjes samen bij {w0}', { w0: blokNaam(o.categorie) })}>
        <option value={0}>{vt('Alle groepjes')}</option>
        {Array.from({ length: groepjes - 2 }, (_, i) => i + 2).map((n) => (
          <option key={n} value={n}>
            {vt('{n} groepjes', { n })}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Eén oefening in een onderdeel: openen, slepen, richttijd, een andere of weghalen. */
function OefeningRij({
  x,
  nr,
  meer,
  minuten,
  opRichttijd,
  opAnders,
  opWeg,
}: {
  x: BlokOefening;
  nr: number;
  meer: boolean;
  minuten: number;
  opRichttijd: (m: number | undefined) => void;
  opAnders: () => void;
  opWeg: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: x.oefening });
  const oefening = vindOefening(x.oefening);
  const titel = vt('Oefening {nr}', { nr });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`club-oefening${isDragging ? ' slepen' : ''}`} data-oefening={x.oefening}>
      {meer && (
        <button ref={setActivatorNodeRef} type="button" className="greep club-oefening-greep" aria-label={vt('{w0} verplaatsen', { w0: titel })} {...attributes} {...listeners}>
          <Icoon naam="grip" maat={18} />
        </button>
      )}
      <div className={`club-oefening-inhoud${meer ? '' : ' enkel'}`}>
        <a
          className="club-blok-oefening"
          href={`#/oefening/${x.oefening}`}
          onClick={(e) => {
            e.preventDefault();
            ga(`/oefening/${x.oefening}`);
          }}
        >
          {oefening && <Miniatuur tekening={oefening.tekening} className="club-blok-plaatje" />}
          <span className="club-blok-naam">
            {meer && <small>{titel}</small>}
            {oefening?.naam ?? vt('Oefening niet gevonden')}
          </span>
        </a>
        <div className="club-oefening-acties">
          {meer && (
            <label className="club-richttijd">
              <span>{vt('Richttijd')}</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_DUUR}
                value={x.minuten ?? ''}
                placeholder={String(minuten)}
                aria-label={vt('Richttijd voor oefening {nr}', { nr })}
                onChange={(e) => opRichttijd(e.target.value ? Math.max(1, Math.min(MAX_DUUR, Math.round(Number(e.target.value)) || 1)) : undefined)}
              />
              <span>{vt('min')}</span>
            </label>
          )}
          <button type="button" className="icoon-knop" aria-label={vt('Andere oefening voor oefening {nr}', { nr })} title={vt('Andere oefening')} onClick={opAnders}>
            <Icoon naam="herhalen" maat={18} />
          </button>
          <button type="button" className="icoon-knop" aria-label={vt('Oefening {nr} weghalen', { nr })} title={vt('Weghalen')} onClick={opWeg}>
            <Icoon naam="kruis" maat={18} />
          </button>
        </div>
      </div>
    </li>
  );
}

function OnderdeelKaart({
  c,
  o,
  nr,
  kanWeg,
  opWijzig,
  opZetOefeningen,
  opWeg,
  opKies,
  opGenereer,
  opAnders,
}: {
  c: ClubTraining;
  o: Onderdeel;
  nr: number;
  kanWeg: boolean;
  opWijzig: (w: Partial<Onderdeel>) => void;
  opZetOefeningen: (lijst: BlokOefening[]) => void;
  opWeg: () => void;
  opKies: () => void;
  opGenereer: () => void;
  opAnders: (oefening: string) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: o.id });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const lijst = oefeningenVan(o);
  const tijden = oefeningTijden(o);
  const naam = blokNaam(o.categorie);
  const sleep = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const nieuw = [...lijst];
    const van = nieuw.findIndex((x) => x.oefening === e.active.id);
    const naar = nieuw.findIndex((x) => x.oefening === e.over!.id);
    if (van < 0 || naar < 0) return;
    nieuw.splice(naar, 0, nieuw.splice(van, 1)[0]!);
    opZetOefeningen(nieuw);
  };
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`club-blok${isDragging ? ' slepen' : ''}`} data-id={o.id}>
      <h3 className="club-blok-kop" style={blokStijl(o.categorie)}>
        <button ref={setActivatorNodeRef} type="button" className="greep club-greep" aria-label={vt('{w0} verplaatsen', { w0: naam })} {...attributes} {...listeners}>
          <Icoon naam="grip" maat={20} />
        </button>
        <span>{nr}</span>
        <span className="club-blok-titel">{naam}</span>
        <button
          type="button"
          className="icoon-knop club-blok-weg"
          disabled={!kanWeg}
          aria-label={vt('{w0} weghalen', { w0: naam })}
          title={kanWeg ? vt('Weghalen') : vt('Minimaal {n} onderdelen', { n: MIN_ONDERDELEN })}
          onClick={opWeg}
        >
          <Icoon naam="kruis" maat={18} />
        </button>
      </h3>
      <div className="club-blok-instellingen">
        <DuurKeuze o={o} opZet={(duur) => opWijzig({ duur })} />
        <SoortKeuze o={o} opZet={(soort) => opWijzig({ soort })} />
        <SamenKeuze o={o} groepjes={c.groepjes} opZet={(groepjesSamen) => opWijzig({ groepjesSamen })} />
      </div>
      {samenPer(o, c.groepjes) !== undefined && (
        <div className="club-blok-samen">
          <p className="klein">{vt('Per ronde komen er {n} groepjes samen op één station; de andere groepjes draaien door langs de gewone stations.', { n: samenPer(o, c.groepjes)! })}</p>
          {samenMeldingen(c).map((m) => (
            <p key={m} className="klein club-melding" role="note">
              {m}
            </p>
          ))}
        </div>
      )}
      {lijst.length ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={sleep}>
          <SortableContext items={lijst.map((x) => x.oefening)} strategy={verticalListSortingStrategy}>
            <ol className="club-oefeningen">
              {lijst.map((x, i) => (
                <OefeningRij
                  key={x.oefening}
                  x={x}
                  nr={i + 1}
                  meer={lijst.length > 1}
                  minuten={tijden[i]!}
                  opRichttijd={(minuten) => opZetOefeningen(lijst.map((y) => (y.oefening === x.oefening ? { oefening: y.oefening, ...(minuten === undefined ? {} : { minuten }) } : y)))}
                  opAnders={() => opAnders(x.oefening)}
                  opWeg={() => opZetOefeningen(lijst.filter((y) => y.oefening !== x.oefening))}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="klein club-blok-leeg">{vt('{n} oefeningen passen bij dit onderdeel', { n: onderdeelKandidaten(c, o, alleOefeningen()).length })}</p>
      )}
      {teVeelRichttijd(o) && <p className="klein club-blok-leeg">{vt('De richttijden zijn samen langer dan dit onderdeel ({m} min).', { m: o.duur })}</p>}
      {lijst.length < MAX_BLOK_OEFENINGEN && (
        <>
          {lijst.length > 0 && <p className="klein club-blok-toevoegen">{vt('Oefening toevoegen')}</p>}
          <div className="club-blok-knoppen">
            <button className="knop" onClick={opKies} aria-label={lijst.length ? vt('Oefening kiezen voor {blok}', { blok: naam }) : undefined}>
              {lijst.length ? vt('Kies') : vt('Kies oefening')}
            </button>
            <button className="knop" onClick={opGenereer} aria-label={vt('Genereer {blok}', { blok: naam })}>
              <Icoon naam="herhalen" maat={18} />
              {vt('Genereer')}
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export function ClubBewerk({ id }: { id: string }) {
  const c = useClub(id);
  const [melding, toon] = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const roosterLijst = useRooster();
  const [dag, kiesDag] = useDag(c);
  if (!c) return <NietGevonden />;

  // Altijd op de nieuwste versie uit de opslag (ook bij snel achter elkaar tikken).
  const nu = () => clubtrainingen.haal(id) ?? c;
  const zet = (w: Partial<ClubTraining>) => clubtrainingen.bewaar({ ...nu(), ...w });
  // Welke opzet bewerk je (0.34.3)? De eerste dag is de opzet van de training; een andere dag alleen als die een eigen opzet heeft.
  const toonDag = c && heeftDagen(c) ? dag : 0;
  const bewerkDag = eigenOpzet(c, toonDag) ? toonDag : 0;
  const delenVan = (x: ClubTraining) => (bewerkDag && eigenOpzet(x, bewerkDag) ? x.perDag![bewerkDag]!.onderdelen! : onderdelenVan(x));
  /** Opzet bewaren; `opnieuwIndelen` bij een andere opzet (andere stations: de trainers per station kloppen dan niet meer). */
  const zetLijst = (onderdelen: Onderdeel[], opnieuwIndelen: boolean) =>
    bewerkDag ? zet(zetDagOpzet(nu(), bewerkDag, onderdelen, opnieuwIndelen)) : zet({ onderdelen, ...(opnieuwIndelen ? zonderIndelingOveral(nu(), true) : {}) });
  const zetDelen = (onderdelen: Onderdeel[]) => zetLijst(onderdelen, true);
  /**
   * Een sessie wijzigen (0.34.4): datum, begintijd, aantallen, leeftijd of groep. Sessies die het rooster volgen, volgen het daarna weer
   * (andere datum of tijd); krijgt een sessie een andere groep, dan komen daar de trainers van die groep.
   */
  const zetSessieOp = (i: number, w: Parameters<typeof zetSessie>[2]) => {
    const voor = nu();
    let na: ClubTraining = { ...voor, ...zetSessie(voor, i, w) };
    if (w.groep !== undefined) {
      const perDag = na.datums.map((_, j) => ({ ...(na.perDag?.[j] ?? { trainers: na.trainers }), ...(opDag(na, j).groep !== opDag(voor, j).groep ? { rooster: true } : {}) }));
      na = { ...na, perDag };
    }
    clubtrainingen.bewaar(vulVolgensRooster(na, rooster.lijst()));
  };
  const sessieErbij = () => {
    const voor = nu();
    const na: ClubTraining = { ...voor, ...voegSessieToe(voor) };
    clubtrainingen.bewaar(vulVolgensRooster(na, rooster.lijst()));
    kiesDag(na.datums.length - 1);
  };
  const sessieWeg = (i: number) => {
    if (!confirm(vt('{sessie} weghalen?', { sessie: sessieTekst(nu(), i) }))) return;
    zet(verwijderSessie(nu(), i));
    kiesDag(0);
  };
  const wijzig = (oid: string, w: Partial<Onderdeel>) => {
    const lijst = delenVan(nu()).map((o) => (o.id === oid ? { ...o, ...w } : o));
    zetLijst(lijst, !!w.soort || 'groepjesSamen' in w);
  };
  const zetOefeningen = (oid: string, lijst: BlokOefening[]) =>
    zetLijst(
      delenVan(nu()).map((x) => (x.id === oid ? metOefeningen(x, lijst) : x)),
      false,
    );
  /** Een andere oefening die nog niet in dit onderdeel staat. */
  const bedenk = (oid: string) => {
    const o = delenVan(nu()).find((x) => x.id === oid)!;
    const nieuw = genereerOnderdeel(opDag(nu(), bewerkDag), o, bron());
    return nieuw && !oefeningenVan(o).some((x) => x.oefening === nieuw) ? { o, nieuw } : null;
  };
  const genereer = (oid: string) => {
    const r = bedenk(oid);
    if (r) zetOefeningen(oid, [...oefeningenVan(r.o), { oefening: r.nieuw }]);
    else toon(vt('Geen passende oefening voor dit onderdeel.'));
  };
  const anders = (oid: string, oefening: string) => {
    const r = bedenk(oid);
    if (r)
      zetOefeningen(
        oid,
        oefeningenVan(r.o).map((x) => (x.oefening === oefening ? { ...x, oefening: r.nieuw } : x)),
      );
    else toon(vt('Geen passende oefening voor dit onderdeel.'));
  };
  const sleep = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const lijst = [...delenVan(nu())];
    const van = lijst.findIndex((o) => o.id === e.active.id);
    const naar = lijst.findIndex((o) => o.id === e.over!.id);
    if (van < 0 || naar < 0) return;
    lijst.splice(naar, 0, lijst.splice(van, 1)[0]!);
    zetDelen(lijst);
  };
  const bewaarSjabloon = () => {
    const naam = window.prompt(vt('Naam van het sjabloon'), clubNaam(c))?.trim();
    if (!naam) return;
    clubtrainingen.bewaar(alsSjabloon(nu(), naam));
    toon(vt('Sjabloon opgeslagen'));
  };

  const cd = opDag(c, dag);
  const groepen = roosterGroepen(roosterLijst, c.groep);
  const heeftTrainersOoit = trainerNamen(c).length > 0 || !!c.perDag?.some((d) => trainerNamen(d).length > 0);
  const delen = delenVan(c);
  // Plan van de gekozen dag (eigen opzet of zelfde als de eerste dag).
  const plan = clubPlan(cd);
  const klaar = alleOnderdelen(c).every((o) => oefeningenVan(o).length > 0);
  const volgt = toonDag > 0 && !bewerkDag;
  const eerste = c.datums[0] ? sessieTekst(c, 0) : '';
  const dezeDag = c.datums[toonDag] ? sessieTekst(c, toonDag) : '';
  const eigenDagen = c.datums.map((_, i) => (eigenOpzet(c, i) ? sessieTekst(c, i) : '')).filter(Boolean);
  const zelfMetRooster = c.datums.some((_, i) => opDag(c, i).groep);
  const leeftijdNoot = leeftijdMelding(cd, vindOefening);
  const kiesOpzet = (eigen: boolean) => {
    if (eigen === !!bewerkDag) return;
    if (eigen) zet(maakEigenOpzet(nu(), toonDag));
    else if (confirm(vt('{dag} weer gelijk maken aan {eerste}? De eigen opzet van {dag} gaat weg.', { dag: dezeDag, eerste }))) zet(zetDagOpzet(nu(), toonDag, undefined));
  };
  const soortTekst = (o: Onderdeel) => (o.soort === 'stations' ? vt('Stations') : samenPer(o, c.groepjes) ? vt('Samen, {n} groepjes', { n: samenPer(o, c.groepjes)! }) : vt('Samen'));

  return (
    <div className="pagina">
      <Kop titel={clubNaam(c)} ouder="/club" />
      <main className="inhoud smal">
        <section className="blok club-gegevens">
          <label className="veld">
            <span>{vt('Naam')}</span>
            <input value={c.naam} placeholder={vt('Bijv. Mini Talents')} maxLength={80} onChange={(e) => zet({ naam: e.target.value })} />
          </label>
          <h3 className="club-sessies-titel">{vt('Sessies')}</h3>
          <ol className="club-sessies">
            {c.datums.map((d, i) => (
              <li key={i} className="club-sessie">
                <span className="club-sessie-nr">{i + 1}</span>
                <input type="date" aria-label={vt('Datum van sessie {n}', { n: i + 1 })} value={d} onChange={(e) => e.target.value && zetSessieOp(i, { datum: e.target.value })} />
                <input type="time" aria-label={vt('Begintijd van sessie {n}', { n: i + 1 })} value={sessieTijd(c, i)} onChange={(e) => zetSessieOp(i, { tijd: e.target.value })} />
                {c.datums.length > 1 && (
                  <button type="button" className="icoon-knop club-sessie-weg" aria-label={vt('Sessie {n} weghalen', { n: i + 1 })} onClick={() => sessieWeg(i)}>
                    <Icoon naam="kruis" maat={18} />
                  </button>
                )}
              </li>
            ))}
          </ol>
          {c.datums.length < MAX_SESSIES && (
            <button type="button" className="knop club-sessie-erbij" onClick={sessieErbij}>
              <Icoon naam="plus" maat={18} />
              {vt('Sessie toevoegen')}
            </button>
          )}
          <p className="klein">{vt('Twee trainingen op één avond? Voeg een sessie toe met dezelfde datum en een andere begintijd.')}</p>
          <DagKeuze c={c} dag={dag} opKies={kiesDag} />
          {heeftDagen(c) && (
            <p className="klein club-sessie-uitleg">
              {toonDag === 0
                ? vt('Instellingen voor {sessie}. De andere sessies nemen ze over, tenzij je ze daar zelf aanpast.', { sessie: dezeDag })
                : vt('Instellingen voor {sessie}. Wat je hier verandert, geldt alleen voor deze sessie.', { sessie: dezeDag })}
            </p>
          )}
          <label className="leeftijd-keuze club-leeftijd">
            <span>{vt('Leeftijd')}</span>
            <select value={cd.leeftijd} onChange={(e) => isLeeftijd(e.target.value) && zetSessieOp(toonDag, { leeftijd: e.target.value })}>
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
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_KINDEREN}
                value={cd.kinderen}
                onChange={(e) => zetSessieOp(toonDag, { kinderen: Math.max(1, Math.min(MAX_KINDEREN, Math.round(Number(e.target.value)) || 1)) })}
              />
            </label>
            <label className="veld">
              <span>{vt('Aantal groepjes')}</span>
              <select className="club-groepjes" value={cd.groepjes} onChange={(e) => zetSessieOp(toonDag, { groepjes: Number(e.target.value) })}>
                {Array.from({ length: MAX_GROEPJES - MIN_GROEPJES + 1 }, (_, i) => MIN_GROEPJES + i).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="klein">{vt('{s} stations, ± {k} kinderen per groepje.', { s: plan.stations.length, k: groepGrootte(cd) })}</p>
          {leeftijdNoot && (
            <p className="klein club-melding" role="note">
              {leeftijdNoot}
            </p>
          )}
          {(groepen.length > 0 || cd.groep) && (
            <label className="leeftijd-keuze club-trainer-modus club-groep">
              <span>{vt('Groep (trainersrooster)')}</span>
              <select value={cd.groep ?? ''} onChange={(e) => zetSessieOp(toonDag, { groep: e.target.value })}>
                <option value="">{vt('Geen groep')}</option>
                {groepen.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="veld">
            <span>{heeftDagen(c) ? vt('Trainers bij {dag} (één naam per regel)', { dag: dezeDag }) : vt('Trainers (optioneel, één naam per regel)')}</span>
            <textarea rows={3} value={cd.trainers.join('\n')} onChange={(e) => zet(zetDagTrainers(nu(), dag, { trainers: e.target.value.split('\n') }))} />
          </label>
          {c.perDag?.[dag]?.rooster && <p className="klein">{vt('Ingevuld volgens het trainersrooster. Pas je het hier aan, dan geldt dat alleen voor deze week.')}</p>}
          {zelfMetRooster && (
            <button className="knop" onClick={() => clubtrainingen.bewaar(vulVolgensRooster(nu(), rooster.lijst(), true))}>
              {vt('Opnieuw volgens het rooster')}
            </button>
          )}
          {heeftTrainersOoit && (
            <>
              <label className="leeftijd-keuze club-trainer-modus">
                <span>{vt('Rotatie')}</span>
                <select value={trainerModus(cd)} onChange={(e) => zet(zetModusOveral(nu(), e.target.value === 'groepje' ? 'groepje' : 'station'))}>
                  <option value="station">{vt('Trainers blijven bij hun station')}</option>
                  <option value="groepje">{vt('Trainers lopen mee met een groepje')}</option>
                </select>
              </label>
              <p className="klein">{vt('Alle trainers worden automatisch verdeeld. Aanpassen doe je bij Veldplan, rotatie en materiaal.')}</p>
            </>
          )}
        </section>

        <div className="club-kop-rij">
          <h2 className="sectie-titel">{vt('Onderdelen')}</h2>
          {!volgt && (
            <button className="knop" onClick={() => zetLijst(genereerAlles(opDag(nu(), bewerkDag), bron()), false)}>
              <Icoon naam="herhalen" maat={18} />
              {vt('Genereer alles')}
            </button>
          )}
        </div>
        {heeftDagen(c) && (
          <div className="club-dag-opzet">
            <DagKeuze c={c} dag={dag} opKies={kiesDag} />
            {toonDag > 0 && (
              <label className="leeftijd-keuze club-opzet-keuze">
                <span>{vt('Opzet op {dag}', { dag: dezeDag })}</span>
                <select value={bewerkDag ? 'eigen' : 'zelfde'} onChange={(e) => kiesOpzet(e.target.value === 'eigen')}>
                  <option value="zelfde">{vt('Zelfde als {dag}', { dag: eerste })}</option>
                  <option value="eigen">{vt('Eigen opzet voor deze dag')}</option>
                </select>
              </label>
            )}
            <p className="klein">
              {toonDag === 0
                ? eigenDagen.length
                  ? vt('Dit is de opzet van {dag}. Dagen met Zelfde als veranderen mee; {w0} heeft een eigen opzet en verandert niet mee.', { dag: dezeDag, w0: eigenDagen.join(', ') })
                  : vt('Dit is de opzet van {dag}. De andere dagen veranderen mee.', { dag: dezeDag })
                : bewerkDag
                  ? vt('{dag} heeft een eigen opzet: wat je hier verandert, geldt alleen voor {dag}.', { dag: dezeDag })
                  : vt('{dag} volgt de opzet van {eerste}. Kies Eigen opzet voor deze dag om hem los aan te passen.', { dag: dezeDag, eerste })}
            </p>
            {bewerkDag > 0 && (
              <button className="knop club-gelijk" onClick={() => kiesOpzet(false)}>
                <Icoon naam="herhalen" maat={18} />
                {vt('Weer gelijk maken aan {dag}', { dag: eerste })}
              </button>
            )}
          </div>
        )}
        {volgt ? (
          <ol className="club-opzet-lijst">
            {delen.map((o) => (
              <li key={o.id}>
                <span className="club-nr" style={blokStijl(o.categorie)}>
                  {blokNaam(o.categorie)}
                </span>
                <span>
                  {[
                    vt('{m} min', { m: o.duur }),
                    soortTekst(o),
                    oefeningenVan(o)
                      .map((x) => vindOefening(x.oefening)?.naam ?? '')
                      .filter(Boolean)
                      .join(', '),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={sleep}>
              <SortableContext items={delen.map((o) => o.id)} strategy={verticalListSortingStrategy}>
                <ol className="club-blokken">
                  {delen.map((o, i) => (
                    <OnderdeelKaart
                      key={o.id}
                      c={cd}
                      o={o}
                      nr={i + 1}
                      kanWeg={delen.length > MIN_ONDERDELEN}
                      opWijzig={(w) => wijzig(o.id, w)}
                      opZetOefeningen={(lijst) => zetOefeningen(o.id, lijst)}
                      opWeg={() => zetDelen(delenVan(nu()).filter((x) => x.id !== o.id))}
                      opKies={() => ga(`/club/${id}/kiezen/${o.id}`)}
                      opGenereer={() => genereer(o.id)}
                      opAnders={(oefening) => anders(o.id, oefening)}
                    />
                  ))}
                </ol>
              </SortableContext>
            </DndContext>
            <p className="hint">{vt('Sleep aan het greepje om de volgorde te veranderen.')}</p>
            {delen.length < MAX_ONDERDELEN && (
              <label className="leeftijd-keuze club-toevoegen">
                <span>{vt('Onderdeel toevoegen')}</span>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) zetDelen([...delenVan(nu()), nieuwOnderdeel(e.target.value)]);
                  }}
                >
                  <option value="">{vt('Kies een onderdeel')}</option>
                  {CATEGORIEEN.map((k) => (
                    <option key={k} value={k}>
                      {blokNaam(k)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}

        <p className="club-totaal">
          <span>{vt('Totale tijd')}</span>
          <strong>{tijdTekst(plan.totaal)}</strong>
        </p>
        <PlanNoot c={cd} />

        <section className="club-acties">
          <button className="knop knop-primair knop-breed" onClick={() => ga(`/club/${id}/plan`)}>
            <Icoon naam="opstelling" maat={20} />
            {vt('Veldplan, rotatie en materiaal')}
          </button>
          <button
            className="knop knop-breed"
            onClick={async () => {
              const m = await deelInhoud({ soort: 'c', code: clubCode(nu()), titel: clubNaam(c), regel: vt('Circuittraining: {w0}', { w0: clubNaam(c) }) });
              if (m) toon(m);
            }}
          >
            <Icoon naam="deel" maat={20} />
            {vt('Deel met trainers')}
          </button>
          <DeelMetTeam soort="clubtraining" id={id} naam={clubNaam(c)} breed />
          {!klaar && <p className="klein">{vt('Nog niet alle onderdelen hebben een oefening.')}</p>}
          <button className="knop knop-breed" onClick={() => ga(`/club/${id}/timer`)}>
            <Icoon naam="afspelen" maat={20} />
            {vt('Rondetimer')}
          </button>
          <button className="knop knop-breed" onClick={bewaarSjabloon}>
            <Icoon naam="download" maat={20} />
            {vt('Opslaan als sjabloon')}
          </button>
        </section>
      </main>
      <Toast tekst={melding} />
    </div>
  );
}
