/* @layer renderer-components @kind logic */
import type { NoiseTracker } from './noisy-bytes.type';

const createNoiseTracker = (): NoiseTracker => ({
  prev: new Uint8Array(0),
  counts: new Uint32Array(0),
  frames: 0,
  noisy: new Set<number>(),
});

export { createNoiseTracker };
