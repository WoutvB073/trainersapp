import type { Tekening } from '../model/types';
import { standOp, type Tijdlijn } from './timeline';
import { leesKleuren, tekenScene } from './render2d';

/**
 * Een weergave tekent de stand van de tijdlijn op tijdstip t. De animatiespeler (bediening, tijd)
 * is voor 2D en 3D hetzelfde; alleen de weergave verschilt.
 */
export interface Weergave {
  element: HTMLCanvasElement;
  /** `sprong`: niet vloeiend overgaan (na doorspoelen of opnieuw beginnen). */
  teken(t: number, sprong?: boolean): void;
  maat(breedte: number, hoogte: number, dpr: number): void;
  /** Looplijnen tonen of verbergen (pass- en dribbellijnen blijven). */
  looplijnen(aan: boolean): void;
  opruimen(): void;
}

export function maakWeergave2D(tekening: Tekening, tijdlijn: Tijdlijn, looplijnen = true): Weergave {
  const canvas = document.createElement('canvas');
  canvas.className = 'speler-canvas';
  const ctx = canvas.getContext('2d')!;
  const kleuren = leesKleuren();
  let dpr = 1;
  let laatste = 0;
  const teken = (t: number) => {
    laatste = t;
    tekenScene(ctx, canvas.width, canvas.height, tekening, standOp(tijdlijn, t), { kleuren, dpr, looplijnen });
  };
  // Rugnummers opnieuw tekenen zodra het lettertype er is.
  void document.fonts?.ready.then(() => teken(laatste));
  return {
    element: canvas,
    teken,
    maat(breedte, hoogte, d) {
      dpr = d;
      canvas.style.height = `${Math.round(hoogte)}px`;
      canvas.width = Math.round(breedte * d);
      canvas.height = Math.round(hoogte * d);
      teken(laatste);
    },
    looplijnen(aan) {
      looplijnen = aan;
      teken(laatste);
    },
    opruimen() {
      canvas.remove();
    },
  };
}
