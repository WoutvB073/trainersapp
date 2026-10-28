import { useState } from 'react';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { Labels, meervoud } from '../../components/Labels';
import { Miniatuur } from '../../components/Miniatuur';
import { CATEGORIEEN, SOORT_NAAM, vindCategorie } from '../../data/categorieen';
import { alleOefeningen, vindOefening } from '../../data/oefeningen';
import { favorieten } from '../../engine/favorieten';
import { ga } from '../../router';
import { trainingen, useTraining } from '../../training/opslag';
import { andereOefening, genereer, kiesOefening, oefeningenUit, recentGebruikt, type Generator, type KiesContext, type Onderdeel } from '../../training/genereren';
import { MAX_AANTAL, metNaam, verplaats, type Training } from '../../training/training';
import type { Soort } from '../../model/types';
import { NietGevonden } from '../NietGevonden';
import { Stapper } from './onderdelen';
import { t as vt } from '../../i18n/t';

/** Gegevens voor het kiezen, altijd vers (aantallen van de training, favorieten, recente trainingen). */
function context(t: Training): KiesContext {
  return {
    alle: alleOefeningen(),
    spelers: t.spelers,
    keepers: t.keepers,
    favorieten: favorieten.alle(),
    recent: recentGebruikt(trainingen.lijst(), t.id),
    toeval: Math.random,
  };
}

/**
 * Generator bewaren in de training. De oefeningen van de training volgen de onderdelen; oefeningen die je er zelf bij
 * hebt gezet (niet uit de generator) blijven erachter staan.
 */
function bewaarGenerator(id: string, g: Generator, vorige?: Generator): void {
  const t = trainingen.haal(id);
  if (!t) return;
  const eerder = new Set((vorige?.keuzes ?? []).filter((k): k is string => !!k));
  const zelf = t.oefeningen.filter((o) => !eerder.has(o) && !g.keuzes.includes(o));
  trainingen.bewaar(metNaam({ ...t, generator: g, oefeningen: [...oefeningenUit(g), ...zelf] }));
}

/** Eén gegenereerde oefening vervangen door een andere uit hetzelfde onderdeel (ook vanuit Training bewerken). */
export function andereVoor(id: string, oefening: string): boolean {
  const t = trainingen.haal(id);
  const g = t?.generator;
  const i = g?.keuzes.indexOf(oefening) ?? -1;
  if (!t || !g || i < 0) return false;
  const nieuw = andereOefening(g, i, context(t), t.oefeningen);
  if (nieuw === g) return false;
  const vervangen = nieuw.keuzes[i];
  trainingen.bewaar({ ...t, generator: nieuw, oefeningen: t.oefeningen.map((o) => (o === oefening ? vervangen : o)).filter((o): o is string => !!o) });
  return true;
}

const onderdeelNaam = (o: Onderdeel) => `${SOORT_NAAM[o.soort]} · ${vindCategorie(o.soort, o.categorie)?.naam ?? o.categorie}`;

function Regel({
  sleutel,
  nr,
  onderdeel,
  keuze,
  t,
  opAnder,
  opWeg,
}: {
  sleutel: string;
  nr: number;
  onderdeel: Onderdeel;
  keuze: string | null | undefined;
  t: Training;
  opAnder: () => void;
  opWeg: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: sleutel });
  const o = keuze ? vindOefening(keuze) : undefined;
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`gen-regel${isDragging ? ' slepen' : ''}`} data-id={sleutel}>
      <div className="gen-kop">
        <button ref={setActivatorNodeRef} className="greep" aria-label={vt('Onderdeel {nr} verplaatsen', { nr })} {...attributes} {...listeners}>
          <Icoon naam="grip" maat={22} />
        </button>
        <span className="onderdeel-nr">{nr}</span>
        <span className={`gen-naam gen-${onderdeel.soort}`}>{onderdeelNaam(onderdeel)}</span>
        <button className="icoon-knop" onClick={opWeg} aria-label={vt('{w0} weghalen', { w0: onderdeelNaam(onderdeel) })}>
          <Icoon naam="kruis" maat={20} />
        </button>
      </div>
      {keuze === null && (
        <p className="waarschuwing gen-geen" role="status">
          {vt('Geen passende oefening in {categorie} voor {spelers} en {keepers}', {
            categorie: vindCategorie(onderdeel.soort, onderdeel.categorie)?.naam ?? onderdeel.categorie,
            spelers: meervoud(t.spelers, 'speler', 'spelers'),
            keepers: meervoud(t.keepers, 'keeper', 'keepers'),
          })}
          {onderdeel.soort === 'keeper' && t.keepers === 0 ? vt(' (vul minstens 1 keeper in)') : ''}.
        </p>
      )}
      {o && (
        <div className="gen-oefening">
          <a
            className="onderdeel-tekst"
            href={`#/oefening/${o.id}`}
            onClick={(e) => {
              e.preventDefault();
              ga(`/oefening/${o.id}`);
            }}
          >
            <Miniatuur tekening={o.tekening} className="onderdeel-plaatje" />
            <span className="onderdeel-info">
              <span className="onderdeel-naam">{o.naam}</span>
              <Labels oefening={o} keepers={t.keepers} />
            </span>
          </a>
          <button className="knop knop-klein gen-ander" onClick={opAnder}>
            <Icoon naam="wissel" maat={16} />
            {vt('Andere oefening')}
          </button>
        </div>
      )}
    </li>
  );
}

interface Item extends Onderdeel {
  k: string;
  keuze?: string | null;
}

let teller = 0;
const nieuweSleutel = () => `o${++teller}`;

export function TrainingGenereren({ id }: { id: string }) {
  const t = useTraining(id);
  const [items, setItems] = useState<Item[]>(() => {
    const g = trainingen.haal(id)?.generator;
    return (g?.onderdelen ?? []).map((o, i) => ({ ...o, k: nieuweSleutel(), keuze: g!.keuzes[i] ?? null }));
  });
  const [melding, setMelding] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  if (!t) return <NietGevonden />;

  const gegenereerd = items.some((i) => i.keuze !== undefined);
  const generatorVan = (lijst: Item[]): Generator => ({ onderdelen: lijst.map(({ soort, categorie }) => ({ soort, categorie })), keuzes: lijst.map((i) => i.keuze ?? null) });

  /** Nieuwe lijst: tonen en (na het genereren) meteen in de training zetten. */
  const zet = (lijst: Item[]) => {
    const vorige = trainingen.haal(id)?.generator;
    setItems(lijst);
    setMelding('');
    if (lijst.some((i) => i.keuze !== undefined)) bewaarGenerator(id, generatorVan(lijst), vorige);
  };

  const voegToe = (soort: Soort, categorie: string) => {
    const item: Item = { soort, categorie, k: nieuweSleutel() };
    if (gegenereerd) {
      // Na het genereren krijgt een nieuw onderdeel meteen een oefening.
      const al = new Set([...items.map((i) => i.keuze).filter((x): x is string => !!x), ...(trainingen.haal(id)?.oefeningen ?? [])]);
      item.keuze = kiesOefening(item, context(trainingen.haal(id) ?? t), al)?.id ?? null;
    }
    zet([...items, item]);
  };

  const genereerAlles = () => {
    const nu = trainingen.haal(id) ?? t;
    const g = genereer(items, context(nu));
    const lijst = items.map((i, n) => ({ ...i, keuze: g.keuzes[n] ?? null }));
    // Alles opnieuw: de oefeningen van de training worden de nieuwe keuzes (eigen toevoegingen blijven erachter).
    zet(lijst);
    const mis = lijst.filter((i) => i.keuze === null).length;
    setMelding(mis ? vt('{w0} zonder passende oefening.', { w0: meervoud(mis, 'onderdeel', 'onderdelen') }) : '');
  };

  const ander = (n: number) => {
    const nu = trainingen.haal(id) ?? t;
    const g = andereOefening(generatorVan(items), n, context(nu), nu.oefeningen);
    if (g.keuzes[n] === items[n]!.keuze) {
      setMelding(vt('Er is geen andere passende oefening voor dit onderdeel.'));
      return;
    }
    zet(items.map((i, x) => (x === n ? { ...i, keuze: g.keuzes[n] ?? null } : i)));
  };

  const stap = (veld: 'spelers' | 'keepers', d: number) => {
    const nu = trainingen.haal(id) ?? t;
    trainingen.bewaar({ ...nu, [veld]: Math.max(0, Math.min(MAX_AANTAL, nu[veld] + d)) });
  };

  const sleep = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const van = items.findIndex((i) => i.k === active.id);
    const naar = items.findIndex((i) => i.k === over.id);
    zet(verplaats(items, van, naar));
  };

  return (
    <div className="pagina">
      <Kop titel={vt('Training genereren')} ouder={`/training/${id}`} />
      <main className="inhoud smal">
        <section className="blok training-gegevens">
          <Stapper label={vt('Spelers')} icoon="spelers" waarde={t.spelers} onStap={(d) => stap('spelers', d)} />
          <Stapper label={vt('Keepers')} icoon="keeper" waarde={t.keepers} onStap={(d) => stap('keepers', d)} />
        </section>

        <section className="blok gen-kiezen">
          <h3>{vt('Tik de onderdelen aan in de volgorde van je training')}</h3>
          {(['veld', 'keeper'] as const).map((s) => (
            <div key={s} className="gen-groep">
              <p className="gen-groep-naam">
                <Icoon naam={s === 'veld' ? 'spelers' : 'keeper'} maat={18} />
                {SOORT_NAAM[s]}
              </p>
              <div className="gen-chips" role="group" aria-label={SOORT_NAAM[s]}>
                {CATEGORIEEN[s].map((c) => (
                  <button key={c.id} className={`gen-chip gen-${s}`} onClick={() => voegToe(s, c.id)}>
                    <Icoon naam="plus" maat={15} />
                    {c.naam}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        <h2 className="sectie-titel">
          {vt('Onderdelen')} <span className="teller-klein">{items.length}</span>
        </h2>
        {items.length === 0 ? (
          <div className="leeg">
            <p className="leeg-titel">{vt('Nog geen onderdelen')}</p>
            <p>{vt('Bijvoorbeeld: Warming-up → Laag duiken → Reactie → 1 op 1 → Spelletjes. De app kiest bij elk onderdeel een oefening die past bij je aantallen.')}</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={sleep}>
            <SortableContext items={items.map((i) => i.k)} strategy={verticalListSortingStrategy}>
              <ol className="gen-lijst">
                {items.map((i, n) => (
                  <Regel key={i.k} sleutel={i.k} nr={n + 1} onderdeel={i} keuze={i.keuze} t={t} opAnder={() => ander(n)} opWeg={() => zet(items.filter((x) => x.k !== i.k))} />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        )}
        {items.length > 1 && <p className="hint">{vt('Sleep aan het greepje om de volgorde te veranderen.')}</p>}
        {melding && (
          <p className="waarschuwing" role="status">
            {melding}
          </p>
        )}

        <div className="knoppenrij">
          <button className={`knop${gegenereerd ? '' : ' knop-primair'}`} disabled={!items.length} onClick={genereerAlles}>
            <Icoon naam={gegenereerd ? 'opnieuw' : 'wissel'} maat={20} />
            {gegenereerd ? vt('Alles opnieuw genereren') : vt('Genereren')}
          </button>
          {gegenereerd && (
            <button className="knop knop-primair" onClick={() => ga(`/training/${id}`)}>
              <Icoon naam="vink" maat={20} />
              {vt('Naar de training')}
            </button>
          )}
        </div>
        <p className="voetnoot">{vt('De app kiest afwisselend: liever geen oefening uit je laatste trainingen, je favorieten krijgen voorrang en een oefening komt maar één keer voor.')}</p>
      </main>
    </div>
  );
}
