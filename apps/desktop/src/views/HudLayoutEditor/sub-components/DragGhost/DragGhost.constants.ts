/* @layer renderer-components @kind constants */
import type { GhostModel } from '@app/hud-layout-editing/drop-ghost';

const TONE_CLASS: Readonly<Record<GhostModel['tone'], string>> = {
  move: '',
  refused: ' is-refused',
};

export { TONE_CLASS };
