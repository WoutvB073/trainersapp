import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Tekening } from '../model/types';
import { maakTijdlijn, rondeDuur } from './timeline';
import { afspeelTekening } from '../editor/animatie';
import { uitsnede } from './render2d';
import { maakWeergave2D, type Weergave } from './weergave';
import type { CameraStand, Weergave3D } from './render3d';
import { Icoon } from '../components/Icoon';
import { poppetjes, usePoppetjes } from '../engine/poppetjes';
import { getal, t } from '../i18n/t';

export const SNELHEDEN = [0.5, 1, 2] as const;
const snelheidTekst = (s: number) => `${getal(s)}×`;
const CAMERAS: { stand: CameraStand; naam: string }[] = [
  { stand: 'boven', naam: t('Boven') },
  { stand: 'schuin', naam: t('Schuin') },
  { stand: 'achter', naam: t('Achter goal') },
];

type Modus = '3d' | '2d';

// Onthouden zolang de app open is: 3D blijft de standaard bij een nieuwe start.
let gekozenModus: Modus | null = null;
const TRAAG = 'trainersapp.3dTraag';
/** Looplijnen in de animatie: standaard uit (rustiger beeld); de keuze wordt onthouden. */
const LOOPLIJNEN = 'trainersapp.looplijnen';
const UITLEG = 'trainersapp.uitleg3d';
const lees = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const schrijf = (k: string, v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* niet erg */
  }
};

function startModus(): Modus {
  if (gekozenModus) return gekozenModus;
  // Eerder te traag gebleken: meteen 2D (de gebruiker kan 3D zelf opnieuw proberen).
  return lees(TRAAG) === '1' ? '2d' : '3d';
}

/** Speelt de animatie van een tekening af, in 3D (standaard) of 2D bovenaanzicht. */
export function AnimatieSpeler({ tekening: getekend }: { tekening: Tekening }) {
  // Eigen oefeningen: getekende lijnen met stapnummers worden hier animatiestappen.
  const tekening = useMemo(() => afspeelTekening(getekend), [getekend]);
  const tijdlijn = useMemo(() => maakTijdlijn(tekening), [tekening]);
  const totaal = rondeDuur(tijdlijn);

  const vakRef = useRef<HTMLDivElement>(null);
  const balkRef = useRef<HTMLInputElement>(null);
  const weergaveRef = useRef<Weergave | null>(null);
  const tRef = useRef(0);
  const drukRef = useRef<{ x: number; y: number } | null>(null);

  const rustig = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false, []);
  const [speelt, setSpeelt] = useState(!rustig && totaal > 0);
  const [herhalen, setHerhalen] = useState(true);
  const [snelheid, setSnelheid] = useState<number>(1);
  const [modus, setModus] = useState<Modus>(startModus);
  const [klaar3d, setKlaar3d] = useState(false);
  const [camera, setCamera] = useState<CameraStand>(tekening.camera ?? 'schuin');
  const [melding, setMelding] = useState<string | null>(null);
  const [uitleg, setUitleg] = useState(false);
  const [looplijnen, setLooplijnen] = useState(() => lees(LOOPLIJNEN) === '1');
  // Eenvoudige poppetjes (Instellingen, of automatisch als 3D hapert).
  const { eenvoudig } = usePoppetjes();
  const looplijnenRef = useRef(looplijnen);

  const teken = useCallback((sprong = false) => {
    weergaveRef.current?.teken(tRef.current, sprong);
    if (balkRef.current) balkRef.current.value = String(tRef.current);
  }, []);

  const naar2D = useCallback((tekst: string | null) => {
    setMelding(tekst);
    setModus('2d');
  }, []);

  /** Hoogte van het beeld: volgens de uitsnede, in 3D iets hoger; nooit hoger dan het scherm toelaat. */
  const pasMaatAan = useCallback(() => {
    const vak = vakRef.current;
    const w = weergaveRef.current;
    if (!vak || !w) return;
    const u = uitsnede(tekening);
    const breedte = vak.clientWidth;
    const max = Math.max(220, window.innerHeight * (window.innerWidth >= 900 ? 0.72 : 0.58));
    let hoogte = breedte * (u.lengte / u.breedte);
    if (modus === '3d') hoogte = Math.max(hoogte, breedte * 0.62);
    w.maat(breedte, Math.min(hoogte, max), Math.min(window.devicePixelRatio || 1, 2.5));
    teken(true);
  }, [tekening, modus, teken]);

  // Weergave maken (2D direct, 3D pas laden als hij nodig is).
  useEffect(() => {
    const vak = vakRef.current;
    if (!vak) return;
    let weg = false;
    const zet = (w: Weergave) => {
      weergaveRef.current = w;
      w.element.setAttribute('role', 'img');
      w.element.setAttribute('aria-label', t('Animatie van de oefening (tik om te pauzeren of af te spelen)'));
      vak.prepend(w.element);
      pasMaatAan();
    };
    if (modus === '2d') {
      zet(maakWeergave2D(tekening, tijdlijn, looplijnenRef.current));
    } else {
      setKlaar3d(false);
      import('./render3d')
        .then(({ maakWeergave3D }) => {
          if (weg) return;
          try {
            const w = maakWeergave3D(tekening, tijdlijn, {
              opInteractie: () => {
                setUitleg(false);
                schrijf(UITLEG, '1');
              },
              opFout: () => naar2D(t('3D viel weg; je ziet nu de 2D-weergave.')),
              looplijnen: looplijnenRef.current,
              eenvoudig,
            });
            zet(w);
            setCamera(tekening.camera ?? 'schuin');
            setKlaar3d(true);
            if (lees(UITLEG) !== '1') setUitleg(true);
          } catch {
            naar2D(t('3D werkt niet op dit toestel; je ziet de 2D-weergave.'));
          }
        })
        .catch(() => naar2D(t('3D kon niet worden geladen; je ziet de 2D-weergave.')));
    }
    return () => {
      weg = true;
      weergaveRef.current?.opruimen();
      weergaveRef.current = null;
    };
  }, [modus, tekening, tijdlijn, pasMaatAan, naar2D, eenvoudig]);

  // Maat volgen.
  useEffect(() => {
    const vak = vakRef.current;
    if (!vak) return;
    const ro = new ResizeObserver(() => pasMaatAan());
    ro.observe(vak);
    window.addEventListener('resize', pasMaatAan);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', pasMaatAan);
    };
  }, [pasMaatAan]);

  // Melding over terugvallen op 2D verdwijnt vanzelf.
  useEffect(() => {
    if (!melding) return;
    const id = setTimeout(() => setMelding(null), 7000);
    return () => clearTimeout(id);
  }, [melding]);

  // Uitleg over draaien/zoomen verdwijnt vanzelf.
  useEffect(() => {
    if (!uitleg) return;
    const id = setTimeout(() => setUitleg(false), 5000);
    return () => clearTimeout(id);
  }, [uitleg]);

  // Afspeellus. In 3D meten we of het toestel het bijhoudt; zo niet, dan terug naar 2D.
  useEffect(() => {
    if (!speelt) return;
    let vorige = performance.now();
    let frame = 0;
    const tussenpozen: number[] = [];
    const meten = modus === '3d' && klaar3d && lees('trainersapp.3dAltijd') !== '1';
    const stap = (nu: number) => {
      const echt = nu - vorige;
      vorige = nu;
      if (meten && document.visibilityState === 'visible' && tussenpozen.length < 70) {
        tussenpozen.push(echt);
        if (tussenpozen.length === 70) {
          // De eerste beelden overslaan (opstarten); mediaan van de rest.
          const rest = tussenpozen.slice(15).sort((a, b) => a - b);
          const mediaan = rest[Math.floor(rest.length / 2)]!;
          // Onder ± 28 beelden per seconde: eerst eenvoudige poppetjes; is het dan nog te traag, dan 2D.
          if (!eenvoudig && mediaan > 36 && poppetjes.automatisch()) {
            setMelding(t('3D liep niet soepel; je ziet nu eenvoudige poppetjes (aan te passen bij Instellingen).'));
          } else if (mediaan > 45) {
            schrijf(TRAAG, '1');
            naar2D(t('Dit toestel is te traag voor 3D; je ziet de 2D-weergave.'));
          }
        }
      }
      // Na wegschakelen geen grote sprong maken.
      tRef.current += Math.min(0.1, echt / 1000) * snelheid;
      if (tRef.current >= totaal) {
        if (herhalen) {
          tRef.current = 0;
          teken(true);
        } else {
          tRef.current = tijdlijn.duur;
          teken();
          setSpeelt(false);
          return;
        }
      } else teken();
      frame = requestAnimationFrame(stap);
    };
    frame = requestAnimationFrame(stap);
    return () => cancelAnimationFrame(frame);
  }, [speelt, snelheid, herhalen, totaal, tijdlijn, teken, modus, klaar3d, naar2D, eenvoudig]);

  const afspelenPauze = () => {
    if (!speelt && tRef.current >= tijdlijn.duur) {
      tRef.current = 0;
      teken(true);
    }
    setSpeelt(!speelt);
  };
  const opnieuw = () => {
    tRef.current = 0;
    teken(true);
    setSpeelt(true);
  };
  const kiesModus = (m: Modus) => {
    gekozenModus = m;
    setMelding(null);
    if (m === '3d') schrijf(TRAAG, null);
    setModus(m);
  };
  const wisselLooplijnen = () => {
    const aan = !looplijnen;
    looplijnenRef.current = aan;
    setLooplijnen(aan);
    schrijf(LOOPLIJNEN, aan ? '1' : '0');
    weergaveRef.current?.looplijnen(aan);
  };
  const kiesCamera = (c: CameraStand) => {
    setCamera(c);
    (weergaveRef.current as Weergave3D | null)?.camera(c);
  };

  // Tikken = pauze/afspelen, maar niet na slepen (draaien in 3D).
  const tikBegin = (e: React.PointerEvent) => {
    drukRef.current = { x: e.clientX, y: e.clientY };
  };
  const tik = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const d = drukRef.current;
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) return;
    if (totaal > 0) afspelenPauze();
  };

  const aanraak = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

  return (
    <div className="speler">
      <div ref={vakRef} className={`speler-vak${modus === '3d' ? ' is-3d' : ''}`} onPointerDown={tikBegin} onClick={tik}>
        {modus === '3d' && !klaar3d && <div className="speler-laden">{t('3D laden…')}</div>}
        <div className="speler-boven">
          {modus === '3d' && klaar3d ? (
            <div className="speler-groep" role="group" aria-label={t('Camera')}>
              {CAMERAS.map((c) => (
                <button key={c.stand} className={c.stand === camera ? 'aan' : ''} aria-pressed={c.stand === camera} onClick={() => kiesCamera(c.stand)}>
                  {c.naam}
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          <div className="speler-groep" role="group" aria-label={t('Weergave')}>
            {(['3d', '2d'] as const).map((m) => (
              <button key={m} className={m === modus ? 'aan' : ''} aria-pressed={m === modus} onClick={() => kiesModus(m)}>
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {uitleg && modus === '3d' && klaar3d && <div className="speler-uitleg">{aanraak ? t('Veeg om te draaien · knijp om te zoomen') : t('Sleep om te draaien · scroll om te zoomen')}</div>}
        {melding && (
          <div className="speler-melding" role="status">
            {melding}
          </div>
        )}
      </div>
      {totaal > 0 && (
        <>
          <input
            ref={balkRef}
            className="speler-balk"
            type="range"
            min={0}
            max={totaal}
            step={0.01}
            defaultValue={0}
            aria-label={t('Voortgang')}
            onInput={(e) => {
              tRef.current = Number(e.currentTarget.value);
              teken(true);
            }}
          />
          <div className="speler-knoppen">
            <button className="knop-rond" onClick={opnieuw} aria-label={t('Opnieuw vanaf het begin')}>
              <Icoon naam="opnieuw" />
            </button>
            <button className="knop-rond knop-hoofd" onClick={afspelenPauze} aria-label={speelt ? t('Pauze') : t('Afspelen')}>
              <Icoon naam={speelt ? 'pauze' : 'afspelen'} maat={26} />
            </button>
            <button className={`knop-rond${herhalen ? ' aan' : ''}`} onClick={() => setHerhalen(!herhalen)} aria-pressed={herhalen} aria-label={t('Herhalen')} title={t('Herhalen')}>
              <Icoon naam="herhalen" />
            </button>
            <button
              className={`knop-rond${looplijnen ? ' aan' : ''}`}
              onClick={wisselLooplijnen}
              aria-pressed={looplijnen}
              aria-label={t('Looplijnen')}
              title={looplijnen ? t('Looplijnen verbergen') : t('Looplijnen tonen')}
            >
              <Icoon naam="looplijn" />
            </button>
            <div className="snelheid" role="group" aria-label={t('Snelheid')}>
              {SNELHEDEN.map((s) => (
                <button key={s} className={s === snelheid ? 'aan' : ''} onClick={() => setSnelheid(s)} aria-pressed={s === snelheid}>
                  {snelheidTekst(s)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
