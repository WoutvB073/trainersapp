import type { CSSProperties } from 'react';
import { Kop } from '../components/Kop';
import { Icoon, type IcoonNaam } from '../components/Icoon';
import { isDonker, kiesThema, THEMAS, themaVariabelen, useThema, type Modus } from '../engine/thema';
import { APP_NAAM, VERSIE } from '../config';

const MODI: { modus: Modus; naam: string; icoon: IcoonNaam }[] = [
  { modus: 'licht', naam: 'Licht', icoon: 'zon' },
  { modus: 'donker', naam: 'Donker', icoon: 'maan' },
  { modus: 'auto', naam: 'Automatisch', icoon: 'computer' },
];

/** Instellingen: clubkleuren (thema) en licht/donker. Bewaard op dit apparaat. */
export function Instellingen() {
  const keuze = useThema();
  const donker = isDonker(keuze.modus);
  return (
    <div className="pagina">
      <Kop titel="Instellingen" ouder="/" />
      <main className="inhoud smal">
        <section className="blok">
          <h3>Clubkleuren</h3>
          <p className="klein">De kleuren van de app. Het veld en de teamkleuren in de animaties blijven altijd hetzelfde.</p>
          <div className="thema-tegels" role="radiogroup" aria-label="Clubkleuren">
            {THEMAS.map((t) => {
              const v = themaVariabelen(t.id, donker);
              const gekozen = keuze.thema === t.id;
              return (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={gekozen}
                  className={`thema-tegel${gekozen ? ' aan' : ''}`}
                  style={v as CSSProperties}
                  onClick={() => kiesThema({ ...keuze, thema: t.id })}
                >
                  <span className="thema-voorbeeld" aria-hidden="true">
                    <span className="thema-kop">{APP_NAAM}</span>
                    <span className="thema-inhoud">
                      <span className="thema-knop">Training</span>
                      <span className="thema-label">4+ spelers</span>
                    </span>
                  </span>
                  <span className="thema-naam">
                    {gekozen && <Icoon naam="vink" maat={16} />}
                    {t.naam}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
        <section className="blok">
          <h3>Weergave</h3>
          <div className="keuze-drie" role="radiogroup" aria-label="Licht of donker">
            {MODI.map((m) => (
              <button
                key={m.modus}
                role="radio"
                aria-checked={keuze.modus === m.modus}
                className={`keuze${keuze.modus === m.modus ? ' aan' : ''}`}
                onClick={() => kiesThema({ ...keuze, modus: m.modus })}
              >
                <Icoon naam={m.icoon} maat={20} />
                {m.naam}
              </button>
            ))}
          </div>
          <p className="klein">Automatisch volgt de instelling van je telefoon of computer.</p>
        </section>
        <p className="voetnoot">
          {APP_NAAM} · versie {VERSIE}
        </p>
      </main>
    </div>
  );
}
