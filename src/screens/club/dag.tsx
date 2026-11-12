import { useState } from 'react';
import { standaardDag } from '../../clubtraining/clubtraining';
import { dagTekst } from '../../training/training';
import { t as vt } from '../../i18n/t';

/** De gekozen dag wordt op dit toestel onthouden (als datum), zodat plan, timer en trainerslink dezelfde dag tonen. */
const DAG = 'trainersapp.dag';

function leesDag(): string {
  try {
    return localStorage.getItem(DAG) ?? '';
  } catch {
    return '';
  }
}

function bewaarDag(datum: string) {
  try {
    localStorage.setItem(DAG, datum);
  } catch {
    /* niet erg */
  }
}

/** Index van de gekozen dag in `datums`: eerder gekozen, anders vandaag of de eerstvolgende. */
export function useDag(datums: string[]): [number, (i: number) => void] {
  const [datum, setDatum] = useState(leesDag);
  const i = datums.indexOf(datum);
  const kies = (n: number) => {
    const d = datums[n];
    if (!d) return;
    setDatum(d);
    bewaarDag(d);
  };
  return [i >= 0 ? i : standaardDag(datums), kies];
}

/** Keuze per dag ("Ma 16 nov", "Wo 18 nov"). Pas vanaf twee datums. */
export function DagKeuze({ datums, dag, opKies }: { datums: string[]; dag: number; opKies: (i: number) => void }) {
  if (datums.length < 2) return null;
  return (
    <div className="tabs club-dagen" role="tablist" aria-label={vt('Dag')}>
      {datums.map((d, i) => (
        <button key={d + i} role="tab" aria-selected={i === dag} className={i === dag ? 'aan' : ''} onClick={() => opKies(i)}>
          {dagTekst(d)}
        </button>
      ))}
    </div>
  );
}
