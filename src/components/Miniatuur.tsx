import { useEffect, useMemo, useRef } from 'react';
import type { Tekening } from '../model/types';
import { maakTijdlijn, standOp } from '../anim/timeline';
import { leesKleuren, tekenScene } from '../anim/render2d';
import { afspeelTekening } from '../editor/animatie';

/** Stilstaand plaatje van een oefening: eindstand met alle lijnen. */
export function Miniatuur({ tekening: getekend, className }: { tekening: Tekening; className?: string }) {
  const tekening = useMemo(() => afspeelTekening(getekend), [getekend]);
  const ref = useRef<HTMLCanvasElement>(null);
  const tijdlijn = useMemo(() => maakTijdlijn(tekening), [tekening]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const teken = () => {
      const r = canvas.getBoundingClientRect();
      if (r.width === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      tekenScene(ctx, canvas.width, canvas.height, tekening, standOp(tijdlijn, tijdlijn.duur), {
        kleuren: leesKleuren(),
        dpr,
        mini: true,
      });
    };
    teken();
    // Opnieuw als het lettertype (rugnummers) geladen is of de maat verandert.
    void document.fonts?.ready.then(teken);
    const ro = new ResizeObserver(teken);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [tekening, tijdlijn]);

  // De maat komt uit de CSS; het veld wordt in het vak gecentreerd (gras vult de rest).
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
