import { useMemo, useState } from 'react';
import { Editor, type EditorBron } from '../eigen/Tekenen';
import { borden, useBord } from '../../wedstrijd/opslag';
import { bordNaam } from '../../wedstrijd/wedstrijd';
import { NietGevonden } from '../NietGevonden';

/** Tactiekbord of spelhervatting tekenen: dezelfde editor als bij eigen oefeningen (met een knop om de lijnen te wissen). */
export function BordTekenen({ id }: { id: string }) {
  const b = useBord(id);
  // Alleen de eerste versie; daarna houdt de editor de tekening bij.
  const [start] = useState(b);
  const bron = useMemo<EditorBron | null>(
    () =>
      start
        ? {
            tekening: start.tekening,
            naam: () => bordNaam(borden.haal(id) ?? start),
            bewaar: (t) => borden.bewaar({ ...(borden.haal(id) ?? start), tekening: t }),
            ouder: `/bord/${id}`,
            verder: { label: 'Klaar', naar: `/bord/${id}` },
            wissen: true,
          }
        : null,
    [start, id],
  );
  if (!bron) return <NietGevonden />;
  return <Editor bron={bron} />;
}
