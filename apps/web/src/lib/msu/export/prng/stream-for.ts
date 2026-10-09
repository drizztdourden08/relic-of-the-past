/* @layer renderer-lib @kind logic */
import { GOLDEN_RATIO_32 } from './prng.constants';
import { mulberry32 } from './mulberry32';

const streamFor = (seed: number, index: number): (() => number) =>
  mulberry32((seed + index * GOLDEN_RATIO_32) >>> 0);

export { streamFor };
