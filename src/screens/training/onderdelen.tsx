import { useState, type ReactNode } from 'react';
import { Icoon } from '../../components/Icoon';
import { MAX_AANTAL, naarCode, trainingNaam, type Training } from '../../training/training';
import { meeTeNemen } from '../../eigen/meenemen';
import { deelInhoud, isLinkCode } from '../../engine/deellink';
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

/** Code voor het delen van een teamtraining. Oefeningen die de ontvanger niet heeft, gaan in hun geheel mee. */
export function trainingCode(t: Pick<Training, 'naam' | 'datum' | 'spelers' | 'keepers' | 'leeftijd' | 'oefeningen'>): string {
  const { eigen, nieuwId } = meeTeNemen(t.oefeningen);
  return naarCode({ ...t, oefeningen: t.oefeningen.map(nieuwId) }, eigen);
}

/** Waar een geplakte link heen gaat (of de code zelf). Ook de korte links; `pad` is de soort van een losse lange code. */
export function linkDoel(tekst: string, pad: 't' | 'o' | 'w'): string | null {
  const t = tekst.trim();
  const m = /#\/([dtcow])\/([A-Za-z0-9_-]+)/.exec(t);
  if (m) return `/${m[1]}/${m[2]}`;
  if (isLinkCode(t)) return `/d/${t}`;
  return /^[A-Za-z0-9_-]{16,}$/.test(t) ? `/${pad}/${t}` : null;
}

/** "… openen via een link": voor wie de link in de browser kreeg en hem in de geïnstalleerde app wil hebben. */
export function LinkOpenen({ tekst, pad, id = 'deellink' }: { tekst: string; pad: 't' | 'o' | 'w'; id?: string }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState('');
  const doel = linkDoel(link, pad);
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
            if (doel) ga(doel);
          }}
        >
          <label htmlFor={id}>{vt('Plak de link die je hebt gekregen')}</label>
          <input id={id} type="url" inputMode="url" placeholder={`https://…/#/${pad}/…`} value={link} onChange={(e) => setLink(e.target.value)} />
          <button className="knop knop-primair" disabled={!doel}>
            {vt('Openen')}
          </button>
        </form>
      )}
    </div>
  );
}

/** Teamtraining delen: korte link via het deelmenu van de telefoon, anders kopiëren. Geeft een melding terug (of niets). */
export function deel(t: Training): Promise<string> {
  const titel = trainingNaam(t);
  return deelInhoud({ soort: 't', code: trainingCode(t), titel, regel: vt('Teamtraining: {w0}', { w0: titel }) });
}

/** Op een toestel zonder de app: zo krijg je de gedeelde inhoud er alsnog in. */
export function InAppUitleg({ uitleg }: { uitleg: ReactNode }) {
  const [melding, toon] = useToast();
  return (
    <section className="blok gedeeld-uitleg">
      <h3>{vt('In de app openen')}</h3>
      <p>{uitleg}</p>
      <div className="knoppenrij">
        <button
          className="knop knop-primair"
          onClick={() =>
            void navigator.clipboard
              .writeText(location.href)
              .then(() => toon(vt('Link gekopieerd')))
              .catch(() => toon(vt('Kopiëren lukte niet: houd de adresbalk ingedrukt')))
          }
        >
          <Icoon naam="kopieer" maat={20} />
          {vt('Kopieer link')}
        </button>
      </div>
      <Toast tekst={melding} />
    </section>
  );
}

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
