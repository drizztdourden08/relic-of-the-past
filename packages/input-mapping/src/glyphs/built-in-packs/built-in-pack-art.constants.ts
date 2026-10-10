/* @layer shared-input @kind data */
import type { SnesButton } from '@rotp/game-data';
import type { IconKeyTable } from './built-in-packs.type';

const GENERIC_PACK_ART: IconKeyTable = {
  LEFT_TRIGGER: 'generic-trigger-a-fill',
  RIGHT_TRIGGER: 'generic-trigger-b-fill',
  LEFT_PADDLE1: 'generic-trigger-c',
  RIGHT_PADDLE1: 'generic-trigger-c-fill',
  LEFT_PADDLE2: 'generic-trigger-a-outline',
  RIGHT_PADDLE2: 'generic-trigger-b-outline',
};

const SNES_ICON_KEYS: Record<SnesButton, string> = {
  A: 'snes-a', B: 'snes-b', X: 'snes-x', Y: 'snes-y', L: 'snes-l', R: 'snes-r',
  Start: 'snes-start', Select: 'snes-select',
  Up: 'snes-dup', Down: 'snes-ddown', Left: 'snes-dleft', Right: 'snes-dright',
};

export { GENERIC_PACK_ART, SNES_ICON_KEYS };
