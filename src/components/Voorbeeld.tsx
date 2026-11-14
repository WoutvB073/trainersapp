import { useState } from 'react';
import { kiesOntwerp, ONTWERPEN, useOntwerp } from '../engine/ontwerp';
import { isVoorbeeld } from '../engine/voorbeeld';

/**
 * Alleen in de voorbeeldversie: een zwevende knop linksonder om van ontwerprichting te wisselen (Nu, A, B, C). De tekst is alleen voor de
 * gebruiker die de voorbeeldlink bekijkt en gaat nooit mee naar de echte app, dus zonder vertaling.
 */
export function OntwerpWissel() {
  const nu = useOntwerp();
  const [open, setOpen] = useState(true);
  if (!isVoorbeeld()) return null;
  const huidig = ONTWERPEN.find((o) => o.id === nu)!;
  return (
    <div className={`ontwerp-wissel${open ? ' open' : ''}`} role="group" aria-label="Ontwerp kiezen" /* i18n-ok */>
      <button type="button" className="ontwerp-wissel-kop" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="ontwerp-wissel-label">{'Voorbeeld' /* i18n-ok */}</span>
        <span>{`${'Ontwerp' /* i18n-ok */}: ${huidig.kort === 'Nu' ? huidig.naam : `${huidig.kort} ${huidig.naam}`}`}</span>
      </button>
      {open && (
        <div className="ontwerp-wissel-keuzes">
          {ONTWERPEN.map((o) => (
            <button key={o.id} type="button" data-richting={o.id} className={o.id === nu ? 'aan' : ''} aria-pressed={o.id === nu} onClick={() => kiesOntwerp(o.id)}>
              <b>{o.kort}</b>
              <small>{o.naam}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
