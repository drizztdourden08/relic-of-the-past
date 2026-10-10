/* @layer renderer-components @kind logic */
import type { AxisPick } from './button-detection.type';

const pickWidestAxisByte = (candidates: Iterable<number>, posBytes: Uint8Array, negBytes: Uint8Array): AxisPick | null => {
  let best: AxisPick | null = null;
  let bestRange = 0;
  for (const byte of candidates) {
    const pos = posBytes[byte];
    const neg = negBytes[byte];
    if (pos === undefined || neg === undefined) continue;
    const range = Math.abs(pos - neg);
    if (range > bestRange) { bestRange = range; best = { byte, pos, neg }; }
  }
  return best;
};

export { pickWidestAxisByte };
