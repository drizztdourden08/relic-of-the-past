/* @layer renderer-components @kind logic */
import type { StickCandidate } from '../hid-calibration.type';

const extremesCandidate = (mins: Uint8Array, maxs: Uint8Array, idx: number, center: number): StickCandidate | null => {
  const min = mins[idx];
  const max = maxs[idx];
  if (min === undefined || max === undefined) return null;
  return { idx, range: max - min, min, max, center };
};

export { extremesCandidate };
