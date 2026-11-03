/* @layer renderer-lib @kind logic */
import { mulberry32 } from '@rotp/game-data';
import { GOLDEN_RATIO_32 } from './prng.constants';

const streamFor = (seed: number, index: number): (() => number) =>
  mulberry32((seed + index * GOLDEN_RATIO_32) >>> 0);

export { streamFor };
