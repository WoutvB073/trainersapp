import { useState } from 'react';
import { Icoon } from './Icoon';
import { meervoud } from './Labels';
import { favorieten, useFavorieten } from '../engine/favorieten';
import { aantalActief, useFilters, wisFilters, zetFilters } from '../engine/filters';
import { Stapper } from '../screens/training/onderdelen';

/** Hartje: favoriet aan/uit (op een kaart of op de detailpagina). */
export function Hartje({ id, naam, groot }: { id: string; naam: string; groot?: boolean }) {
  const favs = useFavorieten();
  const aan = favs.has(id);
  return (
    <button
      className={`hart${aan ? ' aan' : ''}${groot ? ' hart-groot' : ''}`}
      aria-pressed={aan}
      aria-label={aan ? `${naam} uit favorieten halen` : `${naam} als favoriet bewaren`}
      title={aan ? 'Favoriet' : 'Als favoriet bewaren'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        favorieten.wissel(id);
      }}
    >
      <Icoon naam="hart" maat={groot ? 24 : 20} gevuld={aan} />
    </button>
  );
}

const breed = () => typeof window !== 'undefined' && window.innerWidth >= 900;

/**
 * Filterbalk boven een lijst met oefeningen: zoeken, aantallen, favorieten, combinatievormen, eigen oefeningen.
 * Op een telefoon ingeklapt (knop Filters); toont altijd hoeveel oefeningen er overblijven.
 * `aantallenVan`: bij Training maken gelden de aantallen van de training (dan geen eigen aantallen).
 */
export function FilterBalk({ aantal, aantallenVan }: { aantal: number; aantallenVan?: string }) {
  const f = useFilters();
  useFavorieten();
  const [open, setOpen] = useState(breed);
  const actief = aantalActief(f, !aantallenVan);
  const extra = actief - (f.zoek.trim() ? 1 : 0);
  return (
    <div className="filterbalk">
      <div className="filter-rij">
        <label className="zoekveld">
          <Icoon naam="zoek" maat={18} />
          <input type="search" value={f.zoek} placeholder="Zoek op naam" aria-label="Zoek op naam" onChange={(e) => zetFilters({ zoek: e.target.value })} />
        </label>
        <button className={`filter-knop${open ? ' open' : ''}`} aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icoon naam="filter" maat={18} />
          Filters
          {extra > 0 && <span className="filter-teller">{extra}</span>}
        </button>
      </div>
      {open && (
        <div className="filter-paneel">
          {aantallenVan ? (
            <p className="filter-noot">
              <Icoon naam="spelers" maat={16} /> {aantallenVan}
            </p>
          ) : (
            <div className="filter-aantallen">
              <label className="filter-schakel">
                <input type="checkbox" checked={!!f.aantallen} onChange={() => zetFilters({ aantallen: f.aantallen ? null : { spelers: 12, keepers: 1 } })} />
                Alleen wat past bij mijn aantal
              </label>
              {f.aantallen && (
                <div className="filter-stappers">
                  <Stapper label="Spelers" icoon="spelers" waarde={f.aantallen.spelers} onStap={(d) => zetFilters({ aantallen: { ...f.aantallen!, spelers: Math.max(0, Math.min(40, f.aantallen!.spelers + d)) } })} />
                  <Stapper label="Keepers" icoon="keeper" waarde={f.aantallen.keepers} onStap={(d) => zetFilters({ aantallen: { ...f.aantallen!, keepers: Math.max(0, Math.min(40, f.aantallen!.keepers + d)) } })} />
                </div>
              )}
            </div>
          )}
          <div className="chips filter-chips" role="group" aria-label="Alleen">
            <button className={f.favorieten ? 'aan' : ''} aria-pressed={f.favorieten} onClick={() => zetFilters({ favorieten: !f.favorieten })}>
              <Icoon naam="hart" maat={15} gevuld={f.favorieten} /> Favorieten
            </button>
            <button className={f.combi ? 'aan' : ''} aria-pressed={f.combi} onClick={() => zetFilters({ combi: !f.combi })}>
              <Icoon naam="combi" maat={15} /> Combinatievormen
            </button>
            <button className={f.eigen ? 'aan' : ''} aria-pressed={f.eigen} onClick={() => zetFilters({ eigen: !f.eigen })}>
              <Icoon naam="ster" maat={15} /> Eigen
            </button>
          </div>
        </div>
      )}
      <div className="filter-status" role="status">
        <span>{meervoud(aantal, 'oefening', 'oefeningen')}</span>
        {actief > 0 && (
          <button className="link-knop" onClick={wisFilters}>
            Filters wissen
          </button>
        )}
      </div>
    </div>
  );
}

/** Melding als er niets overblijft. */
export function GeenResultaat({ metFilters, tekst }: { metFilters: boolean; tekst?: string }) {
  return (
    <div className="leeg">
      <p className="leeg-titel">Geen oefeningen gevonden</p>
      <p>{metFilters ? 'Er zijn geen oefeningen die bij je filters passen.' : (tekst ?? 'In deze categorie staan nog geen oefeningen.')}</p>
      {metFilters && (
        <button className="knop knop-primair" onClick={wisFilters}>
          Filters wissen
        </button>
      )}
    </div>
  );
}
