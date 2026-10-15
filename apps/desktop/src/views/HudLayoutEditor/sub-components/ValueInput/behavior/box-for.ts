/* @layer renderer-components @kind logic */
import { HOST_SELECTOR } from './usePromoteOverlay.constants';
import type { PromoteBox } from './usePromoteOverlay.type';

const boxFor = (root: HTMLElement): PromoteBox | null => {
  const control = root.querySelector('.hud-value-field__control');
  if (!(control instanceof HTMLElement)) return null;
  const host = root.closest(HOST_SELECTOR) ?? root.parentElement;
  const rootRect = root.getBoundingClientRect();
  const hostRect = (host ?? root).getBoundingClientRect();
  const controlRect = control.getBoundingClientRect();
  return {
    '--promote-left': `${Math.round(hostRect.left - rootRect.left)}px`,
    '--promote-top': `${Math.round(controlRect.top - rootRect.top)}px`,
    '--promote-width': `${Math.round(hostRect.width)}px`,
    '--promote-height': `${Math.round(rootRect.height)}px`,
  };
};

export { boxFor };
