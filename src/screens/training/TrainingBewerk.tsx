import { useMemo } from 'react';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { DeelMetTeam } from '../online/Teams';
import { Labels, meervoud } from '../../components/Labels';
import { Miniatuur } from '../../components/Miniatuur';
import { vindOefening } from '../../data/oefeningen';
import { ga } from '../../router';
import { trainingen, useTraining } from '../../training/opslag';
import { benodigdheden, MAX_AANTAL, pastBij, trainingNaam, verplaats, type Training } from '../../training/training';
import type { Oefening } from '../../model/types';
import { NietGevonden } from '../NietGevonden';
import { deel, Stapper, Toast, useToast } from './onderdelen';
import { andereVoor } from './TrainingGenereren';

function Onderdeel({ id, nr, oefening, past, opVerwijder, opAnder }: { id: string; nr: number; oefening?: Oefening; past: boolean; opVerwijder: () => void; opAnder?: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const stijl = { transform: CSS.Transform.toString(transform), transition };
  return (
    <li ref={setNodeRef} style={stijl} className={`onderdeel${isDragging ? ' slepen' : ''}${past ? '' : ' past-niet'}`} data-id={id}>
      <button ref={setActivatorNodeRef} className="greep" aria-label={`Oefening ${nr} verplaatsen`} {...attributes} {...listeners}>
        <Icoon naam="grip" maat={22} />
      </button>
      <span className="onderdeel-nr">{nr}</span>
      {oefening ? (
        <a
          className="onderdeel-tekst"
          href={`#/oefening/${oefening.id}`}
          onClick={(e) => {
            e.preventDefault();
            ga(`/oefening/${oefening.id}`);
          }}
        >
          <Miniatuur tekening={oefening.tekening} className="onderdeel-plaatje" />
          <span className="onderdeel-info">
            <span className="onderdeel-naam">{oefening.naam}</span>
            {!past && <span className="label label-waarschuwing">Past niet bij deze aantallen</span>}
            <Labels oefening={oefening} />
          </span>
        </a>
      ) : (
        <span className="onderdeel-tekst onderdeel-onbekend">Onbekende oefening (niet in deze versie van de app)</span>
      )}
      {opAnder && (
        <button className="icoon-knop" onClick={opAnder} aria-label={`Andere oefening in plaats van ${oefening?.naam ?? 'deze'}`} title="Andere oefening">
          <Icoon naam="wissel" maat={20} />
        </button>
      )}
      <button className="icoon-knop" onClick={opVerwijder} aria-label={`${oefening?.naam ?? 'Oefening'} uit de training halen`}>
        <Icoon naam="kruis" maat={20} />
      </button>
    </li>
  );
}

function Klaarzetten({ oefeningen }: { oefeningen: Oefening[] }) {
  const lijst = useMemo(() => benodigdheden(oefeningen), [oefeningen]);
  if (!lijst.length) return null;
  return (
    <section className="blok">
      <h3>
        <Icoon naam="materiaal" maat={20} /> Klaarzetten
      </h3>
      <p className="klein">Per soort materiaal het meeste dat één oefening nodig heeft (daarna gebruik je het opnieuw).</p>
      <ul className="klaarzetten">
        {lijst.map((b) => (
          <li key={b.tekst}>
            <strong>{b.tekst}</strong>
            <span>{b.oefeningen.join(', ')}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TrainingBewerk({ id }: { id: string }) {
  const t = useTraining(id);
  const [melding, toon] = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const oefeningen = useMemo(() => (t?.oefeningen ?? []).map((oid) => vindOefening(oid)).filter((o): o is Oefening => !!o), [t?.oefeningen]);
  if (!t) return <NietGevonden />;

  // Altijd op de nieuwste versie uit de opslag (ook bij snel achter elkaar tikken).
  const zet = (w: Partial<Training>) => trainingen.bewaar({ ...(trainingen.haal(t.id) ?? t), ...w });
  const stap = (veld: 'spelers' | 'keepers', d: number) => {
    const nu = trainingen.haal(t.id) ?? t;
    zet({ [veld]: Math.max(0, Math.min(MAX_AANTAL, nu[veld] + d)) });
  };
  const passen = t.oefeningen.map((oid) => {
    const o = vindOefening(oid);
    return !o || pastBij(o, t.spelers, t.keepers);
  });
  const nietPassend = passen.filter((p) => !p).length;
  const sleep = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const lijst = (trainingen.haal(t.id) ?? t).oefeningen;
    zet({ oefeningen: verplaats(lijst, lijst.indexOf(String(active.id)), lijst.indexOf(String(over.id))) });
  };

  return (
    <div className="pagina">
      <Kop titel={trainingNaam(t)} ouder="/trainingen" />
      <main className="inhoud smal">
        <section className="blok training-gegevens">
          <label className="veld">
            <span>Naam (optioneel)</span>
            <input value={t.naam} placeholder="Bijv. Dinsdag JO11-1" maxLength={80} onChange={(e) => zet({ naam: e.target.value })} />
          </label>
          <label className="veld">
            <span>Datum (optioneel)</span>
            <input type="date" value={t.datum ?? ''} onChange={(e) => zet({ datum: e.target.value || undefined })} />
          </label>
          <Stapper label="Spelers" icoon="spelers" waarde={t.spelers} onStap={(d) => stap('spelers', d)} />
          <Stapper label="Keepers" icoon="keeper" waarde={t.keepers} onStap={(d) => stap('keepers', d)} />
        </section>

        <h2 className="sectie-titel">
          Oefeningen <span className="teller-klein">{t.oefeningen.length}</span>
        </h2>
        {nietPassend > 0 && (
          <p className="waarschuwing" role="status">
            {meervoud(nietPassend, 'oefening past', 'oefeningen passen')} niet bij {t.spelers} spelers en {t.keepers} keepers. Pas de aantallen aan of haal ze weg.
          </p>
        )}
        {t.oefeningen.length === 0 ? (
          <div className="leeg">
            <p className="leeg-titel">Nog geen oefeningen</p>
            <p>Kies zelf oefeningen die passen bij je aantallen spelers en keepers, of laat de app een training samenstellen.</p>
            <button className="knop" onClick={() => ga(`/training/${t.id}/genereren`)}>
              <Icoon naam="wissel" maat={20} />
              Training genereren
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={sleep}>
            <SortableContext items={t.oefeningen} strategy={verticalListSortingStrategy}>
              <ol className="onderdelen">
                {t.oefeningen.map((oid, i) => (
                  <Onderdeel
                    key={oid}
                    id={oid}
                    nr={i + 1}
                    oefening={vindOefening(oid)}
                    past={passen[i]!}
                    opVerwijder={() => zet({ oefeningen: (trainingen.haal(t.id) ?? t).oefeningen.filter((x) => x !== oid) })}
                    opAnder={t.generator?.keuzes.includes(oid) ? () => (andereVoor(t.id, oid) ? undefined : toon('Geen andere passende oefening')) : undefined}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        )}
        {t.oefeningen.length > 1 && <p className="hint">Sleep aan het greepje om de volgorde te veranderen.</p>}
        {t.generator && t.oefeningen.length > 0 && (
          <button className="link-knop" onClick={() => ga(`/training/${t.id}/genereren`)}>
            <Icoon naam="wissel" maat={18} />
            Gegenereerd: onderdelen aanpassen of alles opnieuw
          </button>
        )}

        <div className="knoppenrij">
          <button className="knop" onClick={() => ga(`/training/${t.id}/kiezen`)}>
            <Icoon naam="plus" maat={20} />
            Oefeningen toevoegen
          </button>
          <button className="knop knop-primair" disabled={t.oefeningen.length === 0} onClick={() => ga(`/training/${t.id}/modus/1`)}>
            <Icoon naam="afspelen" maat={20} />
            Start training
          </button>
        </div>

        <Klaarzetten oefeningen={oefeningen} />
        <div className="team-delen">
          <DeelMetTeam soort="training" id={t.id} naam={trainingNaam(t)} />
        </div>

        <div className="knoppenrij">
          <button className="knop" disabled={t.oefeningen.length === 0} onClick={() => void deel(t).then((m) => m && toon(m))}>
            <Icoon naam="deel" maat={20} />
            Delen
          </button>
          <button
            className="knop"
            onClick={() => {
              const kopie = trainingen.dupliceer(t.id);
              if (kopie) ga(`/training/${kopie.id}`);
            }}
          >
            <Icoon naam="kopieer" maat={20} />
            Dupliceren
          </button>
        </div>
      </main>
      <Toast tekst={melding} />
    </div>
  );
}
