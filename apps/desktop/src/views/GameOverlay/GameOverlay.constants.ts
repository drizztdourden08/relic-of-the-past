/* @layer renderer-components @kind constants */
import type { MenuPhase } from './GameOverlay.type';

const MENU_TRANSITION_MS = 483;

const RESIZE_SETTLE_MS = 250;

const MENU_PHASE_OF_STATE: Readonly<Record<number, MenuPhase>> = {
  1: 'opening',
  2: 'open',
  3: 'closing',
};

export { MENU_PHASE_OF_STATE, MENU_TRANSITION_MS, RESIZE_SETTLE_MS };
