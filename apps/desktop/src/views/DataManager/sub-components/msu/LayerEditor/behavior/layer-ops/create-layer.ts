/* @layer renderer-components @kind logic */
import type { MsuLayer } from '@rotp/game-data';
import { newId } from '@drizztdourden08/brock-core';
import { DEFAULT_MODES } from './layer-ops.constants';

const createLayer = (existing: MsuLayer[], oneShot = false): MsuLayer => ({
  id: newId(),
  name: `Layer ${existing.length + 1}`,
  files: [],
  mode: oneShot ? DEFAULT_MODES.once : DEFAULT_MODES.loop,
  volume: 100,
});

export { createLayer };
