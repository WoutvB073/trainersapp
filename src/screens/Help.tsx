import { useMemo, useState, type ReactNode } from 'react';
import { Kop } from '../components/Kop';
import { Icoon } from '../components/Icoon';
import { ga } from '../router';
import { t, TAAL } from '../i18n/t';
import { HELP_EN, HELP_NL, type HelpOnderwerp } from '../help/inhoud';

/** De help-onderwerpen in de gekozen taal. */
export const HELP: HelpOnderwerp[] = TAAL === 'en' ? HELP_EN : HELP_NL;

/** **vet** in een help-regel. */
function vet(regel: string): ReactNode {
  return regel.split('**').map((deel, i) => (i % 2 ? <strong key={i}>{deel}</strong> : deel));
}

/** Alinea's, en regels die met "- " beginnen als opsomming. */
function Tekst({ regels }: { regels: string[] }) {
  const blokken: ReactNode[] = [];
  let lijst: string[] = [];
  const sluitLijst = () => {
    if (!lijst.length) return;
    blokken.push(
      <ul key={blokken.length}>
        {lijst.map((r, i) => (
          <li key={i}>{vet(r)}</li>
        ))}
      </ul>,
    );
    lijst = [];
  };
  for (const r of regels) {
    if (r.startsWith('- ')) lijst.push(r.slice(2));
    else {
      sluitLijst();
      blokken.push(<p key={blokken.length}>{vet(r)}</p>);
    }
  }
  sluitLijst();
  return <>{blokken}</>;
}

const kaal = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\*\*/g, '');

/** Past dit onderwerp bij de zoekterm (alle woorden ergens in titel of tekst)? */
export function pastBij(o: HelpOnderwerp, zoek: string): boolean {
  const woorden = kaal(zoek).split(/\s+/).filter(Boolean);
  if (!woorden.length) return true;
  const tekst = kaal([o.titel, ...o.tekst].join(' '));
  return woorden.every((w) => tekst.includes(w));
}

/** Help: uitklapbare onderwerpen met een zoekveld en knoppen die naar het juiste scherm gaan. */
export function Help({ open: openId }: { open?: string }) {
  const [zoek, setZoek] = useState('');
  const [open, setOpen] = useState<Set<string>>(() => new Set(openId ? [openId] : []));
  const lijst = useMemo(() => HELP.filter((o) => pastBij(o, zoek)), [zoek]);
  const zoekt = zoek.trim().length > 0;
  const wissel = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  return (
    <div className="pagina">
      <Kop titel={t('Help')} ouder="/instellingen" />
      <main className="inhoud smal help">
        <label className="zoekveld help-zoek">
          <Icoon naam="zoek" maat={20} />
          <input type="search" value={zoek} placeholder={t('Zoek in de help')} aria-label={t('Zoek in de help')} onChange={(e) => setZoek(e.target.value)} />
        </label>
        {lijst.length === 0 && <p className="klein">{t('Niets gevonden. Probeer een ander woord.')}</p>}
        <div className="help-lijst">
          {lijst.map((o) => {
            const uit = zoekt || open.has(o.id);
            return (
              <section key={o.id} className={`help-onderwerp${uit ? ' open' : ''}`} id={`help-${o.id}`}>
                <h2>
                  <button type="button" aria-expanded={uit} onClick={() => wissel(o.id)}>
                    <span>{o.titel}</span>
                    <Icoon naam="verder" maat={20} className="help-pijl" />
                  </button>
                </h2>
                {uit && (
                  <div className="help-tekst">
                    <Tekst regels={o.tekst} />
                    {o.laatZien && (
                      <div className="knoppenrij">
                        {o.laatZien.map((k) => (
                          <button key={k.pad} className="knop" onClick={() => ga(k.pad)}>
                            <Icoon naam="verder" maat={18} />
                            {k.tekst}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
