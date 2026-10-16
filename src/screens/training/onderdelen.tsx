import { useState } from 'react';
import { Icoon } from '../../components/Icoon';
import { MAX_AANTAL, naarCode, trainingNaam, type Training } from '../../training/training';

/** Stapper met − en + (ook 0 mag). */
export function Stapper({ label, waarde, onStap, icoon }: { label: string; waarde: number; onStap: (stap: 1 | -1) => void; icoon: 'spelers' | 'keeper' }) {
  return (
    <div className="stapper">
      <span className="stapper-label">
        <Icoon naam={icoon} maat={20} />
        {label}
      </span>
      <div className="stapper-knoppen">
        <button type="button" onClick={() => onStap(-1)} disabled={waarde <= 0} aria-label={`Eén ${label.toLowerCase()} minder`}>
          <Icoon naam="min" maat={20} />
        </button>
        <output aria-live="polite" aria-label={label}>
          {waarde}
        </output>
        <button type="button" onClick={() => onStap(1)} disabled={waarde >= MAX_AANTAL} aria-label={`Eén ${label.toLowerCase()} meer`}>
          <Icoon naam="plus" maat={20} />
        </button>
      </div>
    </div>
  );
}

/** Volledige deellink voor een training. */
export function deelLink(t: Pick<Training, 'naam' | 'datum' | 'spelers' | 'keepers' | 'oefeningen'>): string {
  return `${location.origin}${import.meta.env.BASE_URL}#/t/${naarCode(t)}`;
}

/** Code uit een geplakte link (of de code zelf). */
export function codeUitLink(tekst: string): string | null {
  const t = tekst.trim();
  const m = /#\/t\/([A-Za-z0-9_-]+)/.exec(t);
  if (m) return m[1]!;
  return /^[A-Za-z0-9_-]{16,}$/.test(t) ? t : null;
}

/** Delen met de deelfunctie van de telefoon, anders de link kopiëren. Geeft een korte melding terug. */
export async function deel(t: Training): Promise<string> {
  const url = deelLink(t);
  const titel = trainingNaam(t);
  if (navigator.share) {
    try {
      await navigator.share({ title: titel, text: `Training: ${titel}`, url });
      return '';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return '';
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'Link gekopieerd';
  } catch {
    return url;
  }
}

/** Korte melding onderin beeld (verdwijnt vanzelf). */
export function useToast(): [string, (tekst: string) => void] {
  const [tekst, setTekst] = useState('');
  const toon = (t: string) => {
    setTekst(t);
    if (t) window.setTimeout(() => setTekst((nu) => (nu === t ? '' : nu)), 2600);
  };
  return [tekst, toon];
}

export function Toast({ tekst }: { tekst: string }) {
  if (!tekst) return null;
  return (
    <div className="toast" role="status">
      {tekst}
    </div>
  );
}
