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
  metOefeningIds,
  MIN_GROEPJES,
  MIN_ONDERDELEN,
  naarCode,
  nieuwOnderdeel,
  oefeningenVan,
  oefeningIds,
  oefeningTijden,
  onderdeelKandidaten,
  onderdelenVan,
  teVeelRichttijd,
  tijdTekst,
  trainerModus,
  trainerNamen,
  zonderIndeling,
  type BlokOefening,
  type ClubTraining,
  type Onderdeel,
  type OnderdeelSoort,
} from '../../clubtraining/clubtraining';
import { clubtrainingen, useClub } from '../../clubtraining/opslag';
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
  return naarCode({ ...c, onderdelen: metOefeningIds(c, nieuwId) }, eigen);
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
      {zelf && <input type="number" inputMode="numeric" min={1} max={MAX_DUUR} value={o.duur} aria-label={vt('Minuten voor {w0}', { w0: naam })} onChange={(e) => opZet(Math.max(1, Math.min(MAX_DUUR, Math.round(Number(e.target.value)) || 1)))} />}
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

/** Eén oefening in een onderdeel: openen, slepen, richttijd, een andere of weghalen. */
function OefeningRij({ x, nr, meer, minuten, opRichttijd, opAnders, opWeg }: { x: BlokOefening; nr: number; meer: boolean; minuten: number; opRichttijd: (m: number | undefined) => void; opAnders: () => void; opWeg: () => void }) {
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
              <input type="number" inputMode="numeric" min={1} max={MAX_DUUR} value={x.minuten ?? ''} placeholder={String(minuten)} aria-label={vt('Richttijd voor oefening {nr}', { nr })} onChange={(e) => opRichttijd(e.target.value ? Math.max(1, Math.min(MAX_DUUR, Math.round(Number(e.target.value)) || 1)) : undefined)} />
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

function OnderdeelKaart({ c, o, nr, kanWeg, opWijzig, opZetOefeningen, opWeg, opKies, opGenereer, opAnders }: { c: ClubTraining; o: Onderdeel; nr: number; kanWeg: boolean; opWijzig: (w: Partial<Onderdeel>) => void; opZetOefeningen: (lijst: BlokOefening[]) => void; opWeg: () => void; opKies: () => void; opGenereer: () => void; opAnders: (oefening: string) => void }) {
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
        <button type="button" className="icoon-knop club-blok-weg" disabled={!kanWeg} aria-label={vt('{w0} weghalen', { w0: naam })} title={kanWeg ? vt('Weghalen') : vt('Minimaal {n} onderdelen', { n: MIN_ONDERDELEN })} onClick={opWeg}>
          <Icoon naam="kruis" maat={18} />
        </button>
      </h3>
      <div className="club-blok-instellingen">
        <DuurKeuze o={o} opZet={(duur) => opWijzig({ duur })} />
        <SoortKeuze o={o} opZet={(soort) => opWijzig({ soort })} />
      </div>
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
  if (!c) return <NietGevonden />;

  // Altijd op de nieuwste versie uit de opslag (ook bij snel achter elkaar tikken).
  const nu = () => clubtrainingen.haal(id) ?? c;
  const zet = (w: Partial<ClubTraining>) => clubtrainingen.bewaar({ ...nu(), ...w });
  /** Andere opzet: de trainers per station kloppen dan niet meer. */
  const zetDelen = (onderdelen: Onderdeel[]) => {
    const k = nu().trainerKeuzes;
    zet({ onderdelen, stationTrainers: {}, veldTrainers: {}, trainerKeuzes: { ...zonderIndeling(k), ...(k?.groepen ? { groepen: k.groepen } : {}) } });
  };
  const wijzig = (oid: string, w: Partial<Onderdeel>) => {
    const lijst = onderdelenVan(nu()).map((o) => (o.id === oid ? { ...o, ...w } : o));
    if (w.soort) zetDelen(lijst);
    else zet({ onderdelen: lijst });
  };
  const zetOefeningen = (oid: string, lijst: BlokOefening[]) => zet({ onderdelen: onderdelenVan(nu()).map((x) => (x.id === oid ? metOefeningen(x, lijst) : x)) });
  /** Een andere oefening die nog niet in dit onderdeel staat. */
  const bedenk = (oid: string) => {
    const o = onderdelenVan(nu()).find((x) => x.id === oid)!;
    const nieuw = genereerOnderdeel(nu(), o, bron());
    return nieuw && !oefeningenVan(o).some((x) => x.oefening === nieuw) ? { o, nieuw } : null;
  };
  const genereer = (oid: string) => {
    const r = bedenk(oid);
    if (r) zetOefeningen(oid, [...oefeningenVan(r.o), { oefening: r.nieuw }]);
    else toon(vt('Geen passende oefening voor dit onderdeel.'));
  };
  const anders = (oid: string, oefening: string) => {
    const r = bedenk(oid);
    if (r) zetOefeningen(oid, oefeningenVan(r.o).map((x) => (x.oefening === oefening ? { ...x, oefening: r.nieuw } : x)));
    else toon(vt('Geen passende oefening voor dit onderdeel.'));
  };
  const sleep = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const lijst = [...onderdelenVan(nu())];
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

  const delen = onderdelenVan(c);
  const plan = clubPlan(c);
  const klaar = delen.every((o) => oefeningenVan(o).length > 0);

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
          <div className="club-twee">
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
            <label className="veld">
              <span>{vt('Begintijd (optioneel)')}</span>
              <input type="time" value={c.starttijd ?? ''} onChange={(e) => zet({ starttijd: e.target.value || undefined })} />
            </label>
          </div>
          <div className="club-twee">
            <label className="veld">
              <span>{vt('Aantal kinderen')}</span>
              <input type="number" inputMode="numeric" min={1} max={MAX_KINDEREN} value={c.kinderen} onChange={(e) => zet({ kinderen: Math.max(1, Math.min(MAX_KINDEREN, Math.round(Number(e.target.value)) || 1)) })} />
            </label>
            <label className="veld">
              <span>{vt('Aantal groepjes')}</span>
              <select value={c.groepjes} onChange={(e) => zet({ groepjes: Number(e.target.value), stationTrainers: {}, veldTrainers: {}, trainerKeuzes: zonderIndeling(nu().trainerKeuzes) })}>
                {Array.from({ length: MAX_GROEPJES - MIN_GROEPJES + 1 }, (_, i) => MIN_GROEPJES + i).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="klein">{vt('{s} stations, ± {k} kinderen per groepje.', { s: plan.stations.length, k: groepGrootte(c) })}</p>
          <label className="veld">
            <span>{vt('Trainers (optioneel, één naam per regel)')}</span>
            <textarea rows={3} value={c.trainers.join('\n')} onChange={(e) => zet({ trainers: e.target.value.split('\n') })} />
          </label>
          {trainerNamen(c).length > 0 && (
            <>
              <label className="leeftijd-keuze club-trainer-modus">
                <span>{vt('Rotatie')}</span>
                <select
                  value={trainerModus(c)}
                  onChange={(e) => {
                    const { modus: _m, ...rest } = nu().trainerKeuzes ?? {};
                    void _m;
                    zet({ trainerKeuzes: e.target.value === 'groepje' ? { ...rest, modus: 'groepje' } : rest });
                  }}
                >
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
          <button className="knop" onClick={() => zet({ onderdelen: genereerAlles(nu(), bron()) })}>
            <Icoon naam="herhalen" maat={18} />
            {vt('Genereer alles')}
          </button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={sleep}>
          <SortableContext items={delen.map((o) => o.id)} strategy={verticalListSortingStrategy}>
            <ol className="club-blokken">
              {delen.map((o, i) => (
                <OnderdeelKaart
                  key={o.id}
                  c={c}
                  o={o}
                  nr={i + 1}
                  kanWeg={delen.length > MIN_ONDERDELEN}
                  opWijzig={(w) => wijzig(o.id, w)}
                  opZetOefeningen={(lijst) => zetOefeningen(o.id, lijst)}
                  opWeg={() => zetDelen(onderdelenVan(nu()).filter((x) => x.id !== o.id))}
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
                if (e.target.value) zetDelen([...onderdelenVan(nu()), nieuwOnderdeel(e.target.value)]);
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

        <p className="club-totaal">
          <span>{vt('Totale tijd')}</span>
          <strong>{tijdTekst(plan.totaal)}</strong>
        </p>
        <PlanNoot c={c} />

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
