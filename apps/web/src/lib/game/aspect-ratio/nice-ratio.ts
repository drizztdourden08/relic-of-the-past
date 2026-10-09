/* @layer bridge-wasm @kind logic */
import type { RatioPair } from './aspect-ratio.type';
import { COMMON_RATIOS } from './aspect-ratio.constants';

const niceRatio = (target: number): RatioPair => {
  let best = COMMON_RATIOS[0];
  let bestErr = Infinity;
  for (const pair of COMMON_RATIOS) {
    const err = Math.abs(pair[0] / pair[1] - target);
    if (err < bestErr) {
      bestErr = err;
      best = pair;
    }
  }
  return { w: best[0], h: best[1] };
};

export { niceRatio };
