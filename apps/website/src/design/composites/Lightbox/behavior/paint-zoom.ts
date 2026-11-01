/* @layer website-site @kind logic */
import { VAR_SCALE, VAR_X, VAR_Y, ZOOMED_ATTR } from '../Lightbox.constants';
import type { ZoomState } from '../Lightbox.type';

const paintZoom = (content: HTMLElement | null, panel: HTMLElement | null, state: ZoomState): void => {
  content?.style.setProperty(VAR_X, `${state.x}px`);
  content?.style.setProperty(VAR_Y, `${state.y}px`);
  content?.style.setProperty(VAR_SCALE, String(state.scale));
  panel?.toggleAttribute(ZOOMED_ATTR, state.scale > 1);
};

export { paintZoom };
