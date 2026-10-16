import { useRef, useState } from 'react';
import { Icoon } from '../components/Icoon';
import { meervoud } from '../components/Labels';
import { eigenOefeningen, useEigenOefeningen } from '../eigen/opslag';
import { exportNaam, leesExport, maakExport, voegSamen } from '../engine/exporteren';
import { favorieten, useFavorieten } from '../engine/favorieten';
import { omgeving } from '../engine/platform';
import { trainingen, useTrainingen } from '../training/opslag';

/** Een bestand aanbieden: op een telefoon/tablet via het deelmenu (bewaren in Bestanden e.d.), anders downloaden. */
async function bied(naam: string, tekst: string): Promise<'gedeeld' | 'gedownload' | 'geannuleerd'> {
  const blob = new Blob([tekst], { type: 'application/json' });
  if (omgeving.mobiel && typeof File !== 'undefined' && navigator.canShare) {
    const bestand = new File([blob], naam, { type: 'application/json' });
    if (navigator.canShare({ files: [bestand] })) {
      try {
        await navigator.share({ files: [bestand], title: 'TopTraining-gegevens' });
        return 'gedeeld';
      } catch (e) {
        if ((e as Error).name === 'AbortError') return 'geannuleerd';
        // Delen lukt niet: dan downloaden.
      }
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = naam;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return 'gedownload';
}

/** Instellingen → Je gegevens: exporteren naar een bestand en weer importeren (samenvoegen). */
export function GegevensBlok() {
  const eigen = useEigenOefeningen();
  const lijst = useTrainingen();
  const favs = useFavorieten();
  const kiezer = useRef<HTMLInputElement>(null);
  const [melding, setMelding] = useState<{ goed: boolean; tekst: string } | null>(null);

  const exporteer = async () => {
    setMelding(null);
    const bestand = maakExport({ eigen: eigenOefeningen.lijst(), trainingen: trainingen.lijst(), favorieten: [...favorieten.alle()] });
    const hoe = await bied(exportNaam(), JSON.stringify(bestand, null, 1));
    if (hoe === 'gedownload') setMelding({ goed: true, tekst: `Bestand ${exportNaam()} staat bij je downloads.` });
    else if (hoe === 'gedeeld') setMelding({ goed: true, tekst: 'Bestand gemaakt. Bewaar het op een plek die je terugvindt (bijv. Bestanden of je mail).' });
  };

  const importeer = async (f: File | undefined) => {
    setMelding(null);
    if (!f) return;
    const bestand = leesExport(await f.text());
    if (!bestand) {
      setMelding({ goed: false, tekst: 'Dit is geen TopTraining-bestand (of het is beschadigd).' });
      return;
    }
    const s = voegSamen({ eigen: eigenOefeningen.lijst(), trainingen: trainingen.lijst(), favorieten: [...favorieten.alle()] }, bestand);
    if (s.eigen.length) eigenOefeningen.vervangAlles([...s.eigen, ...eigenOefeningen.lijst()]);
    if (s.trainingen.length) trainingen.vervangAlles([...s.trainingen, ...trainingen.lijst()]);
    if (s.favorieten.length) favorieten.vervangAlles([...favorieten.alle(), ...s.favorieten]);
    const delen = [
      s.eigen.length ? meervoud(s.eigen.length, 'eigen oefening', 'eigen oefeningen') : '',
      s.trainingen.length ? meervoud(s.trainingen.length, 'training', 'trainingen') : '',
      s.favorieten.length ? meervoud(s.favorieten.length, 'favoriet', 'favorieten') : '',
    ].filter(Boolean);
    const erbij = delen.length ? `Erbij gekomen: ${delen.join(', ').replace(/, ([^,]*)$/, ' en $1')}.` : 'Er kwam niets bij: alles stond er al.';
    setMelding({ goed: true, tekst: s.overgeslagen && delen.length ? `${erbij} ${s.overgeslagen} stond${s.overgeslagen === 1 ? '' : 'en'} er al.` : erbij });
  };

  const inhoud = [meervoud(eigen.length, 'eigen oefening', 'eigen oefeningen'), meervoud(lijst.length, 'training', 'trainingen'), meervoud(favs.size, 'favoriet', 'favorieten')];
  return (
    <section className="blok">
      <h3>Je gegevens</h3>
      <p className="klein">
        Bewaar je {inhoud.join(', ').replace(/, ([^,]*)$/, ' en $1')} in een bestand, of zet ze over naar een ander apparaat. Importeren voegt samen: er wordt
        niets overschreven en niets komt dubbel.
      </p>
      <div className="knoppenrij">
        <button className="knop" onClick={() => void exporteer()}>
          <Icoon naam="deel" maat={18} />
          Exporteren
        </button>
        <button className="knop" onClick={() => kiezer.current?.click()}>
          <Icoon naam="importeer" maat={18} />
          Importeren
        </button>
        <input
          ref={kiezer}
          type="file"
          accept=".json,application/json,text/plain"
          hidden
          aria-label="Bestand om te importeren"
          onChange={(e) => {
            void importeer(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {melding && (
        <p className={melding.goed ? 'melding-goed' : 'waarschuwing'} role="status">
          {melding.tekst}
        </p>
      )}
    </section>
  );
}
