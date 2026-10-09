/* @layer bridge-wasm @kind logic */
import type { RatioReadout } from './aspect-ratio.type';
import { MAX_ASPECT, RATIO_EPSILON } from './aspect-ratio.constants';
import { clampAndReduce } from './clamp-and-reduce';

const buildReadout = (long: number, short: number): RatioReadout => {
  const detected = long / short;
  const used = clampAndReduce(long, short);
  return { detected, used: used.w / used.h, capped: detected > MAX_ASPECT + RATIO_EPSILON };
};

export { buildReadout };
