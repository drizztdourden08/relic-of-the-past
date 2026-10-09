/* @layer bridge-wasm @kind logic */
import type { RatioCheck } from './aspect-ratio.type';
import { MAX_ASPECT, MIN_ASPECT, RATIO_EPSILON } from './aspect-ratio.constants';

const validateCustomRatio = (w: number, h: number): RatioCheck => {
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1) {
    return { valid: false, ratio: 0, error: 'Use whole numbers ≥ 1' };
  }
  const ratio = w / h;
  if (ratio < MIN_ASPECT - RATIO_EPSILON) {
    return { valid: false, ratio, error: `Too tall (max ${Math.round((1 / MIN_ASPECT) * 100) / 100}:1 portrait)` };
  }
  if (ratio > MAX_ASPECT + RATIO_EPSILON) {
    return { valid: false, ratio, error: `Too wide (max ${Math.round(MAX_ASPECT * 100) / 100}:1)` };
  }
  return { valid: true, ratio };
};

export { validateCustomRatio };
