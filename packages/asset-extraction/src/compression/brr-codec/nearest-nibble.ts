/* @layer shared-asset-extraction @kind logic */
import { brrGetOne } from './brr-get-one';
import { BRR_NIBBLE_ORDER } from './brr-codec.constants';
import type { BrrNibble } from './brr-codec.type';

const nearestNibble = (predicted: number, target: number, range: number): BrrNibble => {
  const best: BrrNibble = { error: Number.MAX_SAFE_INTEGER, nibble: 0, sample: 0 };
  for (const j of BRR_NIBBLE_ORDER) {
    const sample = brrGetOne(predicted, j, range);
    const error = (target - sample) * (target - sample);
    if (error >= best.error) continue;
    best.error = error;
    best.nibble = j;
    best.sample = sample;
    if (error === 0) break;
  }
  return best;
};

export { nearestNibble };
