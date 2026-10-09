/* @layer renderer-components @kind constants */
import type { GhostModel } from '../../behavior/drop-ghost';

const TONE_CLASS: Readonly<Record<GhostModel['tone'], string>> = {
  move: '',
  refused: ' is-refused',
};

export { TONE_CLASS };
