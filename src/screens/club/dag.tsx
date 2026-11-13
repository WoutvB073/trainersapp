import { useState } from 'react';
import { eigenOpzet, sessieSleutel, sessieTekst, standaardDag, type DagTrainers } from '../../clubtraining/clubtraining';
import { t as vt } from '../../i18n/t';

/**
 * De gekozen sessie wordt op dit toestel onthouden (datum en begintijd, sinds 0.34.4), zodat plan, timer en trainerslink dezelfde sessie
 * tonen. Een oude waarde (alleen een datum) kiest de eerste sessie op die datum.
 */
const DAG = 'trainersapp.dag';

function leesDag(): string {
  try {
    return localStorage.getItem(DAG) ?? '';
  } catch {
    return '';
  }
}

function bewaarDag(waarde: string) {
  try {
    localStorage.setItem(DAG, waarde);
  } catch {
    /* niet erg */
  }
}

type Sessies = { datums: string[]; perDag?: DagTrainers[]; starttijd?: string };

/** Index van de gekozen sessie: eerder gekozen, anders vandaag of de eerstvolgende. */
export function useDag(c: Sessies | undefined | null): [number, (i: number) => void] {
  const [gekozen, setGekozen] = useState(leesDag);
  const s = c ?? { datums: [] };
  const sleutels = s.datums.map((_, i) => sessieSleutel(s, i));
  let i = sleutels.indexOf(gekozen);
  if (i < 0 && !gekozen.includes('|')) i = s.datums.indexOf(gekozen);
  if (i < 0 && gekozen.includes('|')) i = s.datums.indexOf(gekozen.split('|')[0]!);
  const kies = (n: number) => {
    const k = sleutels[n];
    if (!k) return;
    setGekozen(k);
    bewaarDag(k);
  };
  return [i >= 0 ? i : standaardDag(s.datums), kies];
}

/** Keuze per sessie ("Ma 16 nov 18:00", "Ma 16 nov 19:00"). Pas vanaf twee sessies. Een sessie met een eigen opzet heeft het label "aangepast". */
export function DagKeuze({ c, dag, opKies }: { c: Sessies; dag: number; opKies: (i: number) => void }) {
  if (c.datums.length < 2) return null;
  return (
    <div className="tabs club-dagen" role="tablist" aria-label={vt('Sessie')}>
      {c.datums.map((d, i) => (
        <button key={d + i} role="tab" aria-selected={i === dag} className={i === dag ? 'aan' : ''} onClick={() => opKies(i)}>
          {sessieTekst(c, i)}
          {eigenOpzet(c, i) && <small className="club-dag-eigen">{vt('aangepast')}</small>}
        </button>
      ))}
    </div>
  );
}
