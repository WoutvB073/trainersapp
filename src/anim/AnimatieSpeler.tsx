import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Tekening } from '../model/types';
import { maakTijdlijn, rondeDuur, standOp } from './timeline';
import { leesKleuren, tekenScene, uitsnede, type Kleuren } from './render2d';
import { Icoon } from '../components/Icoon';

const SNELHEDEN = [0.5, 1, 1.5, 2] as const;
const snelheidTekst = (s: number) => `${String(s).replace('.', ',')}×`;

/** Speelt de animatie van een tekening af in 2D bovenaanzicht. */
export function AnimatieSpeler({ tekening }: { tekening: Tekening }) {
  const tijdlijn = useMemo(() => maakTijdlijn(tekening), [tekening]);
  const totaal = rondeDuur(tijdlijn);

  const vakRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const balkRef = useRef<HTMLInputElement>(null);
  const kleurenRef = useRef<Kleuren | null>(null);
  const tRef = useRef(0);

  const rustig = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false, []);
  const [speelt, setSpeelt] = useState(!rustig && totaal > 0);
  const [herhalen, setHerhalen] = useState(true);
  const [snelheid, setSnelheid] = useState<number>(1);

  const teken = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    kleurenRef.current ??= leesKleuren();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    tekenScene(ctx, canvas.width, canvas.height, tekening, standOp(tijdlijn, tRef.current), {
      kleuren: kleurenRef.current,
      dpr,
    });
    if (balkRef.current) balkRef.current.value = String(tRef.current);
  }, [tekening, tijdlijn]);

  // Maat van het canvas: volle breedte, hoogte volgens de uitsnede (maar nooit hoger dan het scherm toelaat).
  useEffect(() => {
    const vak = vakRef.current;
    const canvas = canvasRef.current;
    if (!vak || !canvas) return;
    const u = uitsnede(tekening);
    const pasAan = () => {
      const breedte = vak.clientWidth;
      const max = Math.max(220, window.innerHeight * (window.innerWidth >= 900 ? 0.72 : 0.58));
      const hoogte = Math.min(breedte * (u.lengte / u.breedte), max);
      canvas.style.height = `${Math.round(hoogte)}px`;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(breedte * dpr);
      canvas.height = Math.round(hoogte * dpr);
      teken();
    };
    pasAan();
    const ro = new ResizeObserver(pasAan);
    ro.observe(vak);
    window.addEventListener('resize', pasAan);
    void document.fonts?.ready.then(teken);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', pasAan);
    };
  }, [tekening, teken]);

  // Afspeellus.
  useEffect(() => {
    if (!speelt) return;
    let vorige = performance.now();
    let frame = 0;
    const stap = (nu: number) => {
      // Na wegschakelen geen grote sprong maken.
      const dt = Math.min(0.1, (nu - vorige) / 1000);
      vorige = nu;
      tRef.current += dt * snelheid;
      if (tRef.current >= totaal) {
        if (herhalen) tRef.current = 0;
        else {
          tRef.current = tijdlijn.duur;
          teken();
          setSpeelt(false);
          return;
        }
      }
      teken();
      frame = requestAnimationFrame(stap);
    };
    frame = requestAnimationFrame(stap);
    return () => cancelAnimationFrame(frame);
  }, [speelt, snelheid, herhalen, totaal, tijdlijn, teken]);

  const afspelenPauze = () => {
    if (!speelt && tRef.current >= tijdlijn.duur) tRef.current = 0;
    setSpeelt(!speelt);
  };
  const opnieuw = () => {
    tRef.current = 0;
    teken();
    setSpeelt(true);
  };

  if (totaal === 0) {
    return (
      <div className="speler">
        <div ref={vakRef} className="speler-vak">
          <canvas ref={canvasRef} className="speler-canvas" />
        </div>
      </div>
    );
  }

  return (
    <div className="speler">
      <div ref={vakRef} className="speler-vak">
        <canvas
          ref={canvasRef}
          className="speler-canvas"
          onClick={afspelenPauze}
          role="img"
          aria-label="Animatie van de oefening (tik om te pauzeren of af te spelen)"
        />
      </div>
      <input
        ref={balkRef}
        className="speler-balk"
        type="range"
        min={0}
        max={totaal}
        step={0.01}
        defaultValue={0}
        aria-label="Voortgang"
        onInput={(e) => {
          tRef.current = Number(e.currentTarget.value);
          teken();
        }}
      />
      <div className="speler-knoppen">
        <button className="knop-rond" onClick={opnieuw} aria-label="Opnieuw vanaf het begin">
          <Icoon naam="opnieuw" />
        </button>
        <button className="knop-rond knop-hoofd" onClick={afspelenPauze} aria-label={speelt ? 'Pauze' : 'Afspelen'}>
          <Icoon naam={speelt ? 'pauze' : 'afspelen'} maat={26} />
        </button>
        <button
          className={`knop-rond${herhalen ? ' aan' : ''}`}
          onClick={() => setHerhalen(!herhalen)}
          aria-pressed={herhalen}
          aria-label="Herhalen"
          title="Herhalen"
        >
          <Icoon naam="herhalen" />
        </button>
        <div className="snelheid" role="group" aria-label="Snelheid">
          {SNELHEDEN.map((s) => (
            <button key={s} className={s === snelheid ? 'aan' : ''} onClick={() => setSnelheid(s)} aria-pressed={s === snelheid}>
              {snelheidTekst(s)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
