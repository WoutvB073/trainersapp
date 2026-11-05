import { useState } from 'react';
import { Icoon } from '../../components/Icoon';
import { MAX_AANTAL, naarCode, trainingNaam, type Training } from '../../training/training';
import { meeTeNemen } from '../../eigen/meenemen';
import { ga } from '../../router';
import { t as vt } from '../../i18n/t';

/** Stapper met − en + (ook 0 mag). */
export function Stapper({ label, waarde, onStap, icoon }: { label: string; waarde: number; onStap: (stap: 1 | -1) => void; icoon: 'spelers' | 'keeper' }) {
  return (
    <div className="stapper">
      <span className="stapper-label">
        <Icoon naam={icoon} maat={20} />
        {label}
      </span>
      <div className="stapper-knoppen">
        <button type="button" onClick={() => onStap(-1)} disabled={waarde <= 0} aria-label={vt('Eén {w0} minder', { w0: label.toLowerCase() })}>
          <Icoon naam="min" maat={20} />
        </button>
        <output aria-live="polite" aria-label={label}>
          {waarde}
        </output>
        <button type="button" onClick={() => onStap(1)} disabled={waarde >= MAX_AANTAL} aria-label={vt('Eén {w0} meer', { w0: label.toLowerCase() })}>
          <Icoon naam="plus" maat={20} />
        </button>
      </div>
    </div>
  );
}

/** Volledige deellink voor een training. Eigen oefeningen gaan in hun geheel mee in de link. */
export function deelLink(t: Pick<Training, 'naam' | 'datum' | 'spelers' | 'keepers' | 'leeftijd' | 'oefeningen'>): string {
  const { eigen, nieuwId } = meeTeNemen(t.oefeningen);
  return `${location.origin}${import.meta.env.BASE_URL}#/t/${naarCode({ ...t, oefeningen: t.oefeningen.map(nieuwId) }, eigen)}`; // i18n-ok
}

/** Code uit een geplakte link (of de code zelf). */
export function codeUitLink(tekst: string, pad: 't' | 'o' = 't'): string | null {
  const t = tekst.trim();
  const m = new RegExp(`#/${pad}/([A-Za-z0-9_-]+)`).exec(t);
  if (m) return m[1]!;
  return /^[A-Za-z0-9_-]{16,}$/.test(t) ? t : null;
}

/** "… openen via een link": voor wie de link in de browser kreeg en hem in de geïnstalleerde app wil hebben. */
export function LinkOpenen({ tekst, pad }: { tekst: string; pad: 't' | 'o' }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState('');
  const code = codeUitLink(link, pad);
  return (
    <div className="link-openen">
      {!open ? (
        <button className="link-knop" onClick={() => setOpen(true)}>
          <Icoon naam="link" maat={18} />
          {tekst}
        </button>
      ) : (
        <form
          className="blok link-formulier"
          onSubmit={(e) => {
            e.preventDefault();
            if (code) ga(`/${pad}/${code}`);
          }}
        >
          <label htmlFor="deellink">{vt('Plak de link die je hebt gekregen')}</label>
          <input id="deellink" type="url" inputMode="url" placeholder={`https://…/#/${pad}/…`} value={link} onChange={(e) => setLink(e.target.value)} />
          <button className="knop knop-primair" disabled={!code}>
            {vt('Openen')}
          </button>
        </form>
      )}
    </div>
  );
}

/** Delen met de deelfunctie van de telefoon, anders de link kopiëren. Geeft een korte melding terug. */
export async function deel(t: Training): Promise<string> {
  const titel = trainingNaam(t);
  return deelUrl(titel, vt('Teamtraining: {w0}', { w0: titel }), deelLink(t));
}

/** Een link delen met de deelfunctie van de telefoon, anders kopiëren. */
export async function deelUrl(titel: string, text: string, url: string): Promise<string> {
  if (navigator.share) {
    try {
      await navigator.share({ title: titel, text, url });
      return '';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return '';
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return vt('Link gekopieerd');
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
