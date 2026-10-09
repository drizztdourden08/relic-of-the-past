/* @layer tests @kind helper */
import type { Overlay } from './hud-layout-options.type';

const readOverlay = (): Overlay => {
  const stage = document.querySelector('.hud-editor-stage');
  const base = stage ? stage.getBoundingClientRect() : new DOMRect();
  const at = (sel: string, side: 'left' | 'top'): number[] =>
    Array.from(document.querySelectorAll(sel)).map((el) => {
      const r = el.getBoundingClientRect();
      return Math.round(side === 'left' ? r.left - base.left : r.top - base.top);
    });
  const slot = document.querySelector('.hud-overlay__slot');
  const line = document.querySelector('.hud-overlay__line');
  const flexSlotBorder = slot ? getComputedStyle(slot).borderColor : null;
  const gridLineFill = line ? getComputedStyle(line).backgroundColor : '';
  return {
    lines: document.querySelectorAll('.hud-overlay__line').length,
    slots: document.querySelectorAll('.hud-overlay__slot').length,
    color: flexSlotBorder ?? gridLineFill,
    xs: at('.hud-overlay__line--v', 'left'),
    ys: at('.hud-overlay__line--h', 'top'),
  };
};

export { readOverlay };
