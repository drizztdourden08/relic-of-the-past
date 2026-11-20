/* @layer renderer-components @kind logic */
import type { MsuLayer } from '@rotp/game-data';
import { newId } from '@drizztdourden08/brock-core';
import { DEFAULT_MODES } from './layer-ops.constants';

const createLayer = (existing: MsuLayer[], name: string, oneShot = false): MsuLayer => ({
  id: newId(),
  name,
  files: [],
  mode: oneShot ? DEFAULT_MODES.once : DEFAULT_MODES.loop,
  volume: 100,
});

export { createLayer };
