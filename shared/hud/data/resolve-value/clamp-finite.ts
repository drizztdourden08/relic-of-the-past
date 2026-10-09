/* @layer shared-hud @kind logic */
import { MAX_SAFE_RESULT } from './resolve-value.constants';

const clampFinite = (n: number): number => {
  if (Number.isNaN(n)) return 0;
  if (n === Infinity) return MAX_SAFE_RESULT;
  if (n === -Infinity) return -MAX_SAFE_RESULT;
  if (n > MAX_SAFE_RESULT) return MAX_SAFE_RESULT;
  if (n < -MAX_SAFE_RESULT) return -MAX_SAFE_RESULT;
  return n;
};

export { clampFinite };
