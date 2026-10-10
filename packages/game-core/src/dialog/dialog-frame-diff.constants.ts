/* @layer bridge-wasm @kind constants */
import type { DialogFrame } from '@rotp/game-data';

const DIALOG_FRAME_FIELDS = [
  'active', 'kind', 'topleft', 'scrollStep', 'wait', 'choice', 'messageId', 'renderState', 'generation',
  'nativeHidden', 'layerScrollX', 'layerScrollY',
] as const satisfies readonly (keyof DialogFrame)[];

export { DIALOG_FRAME_FIELDS };
