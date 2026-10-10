/* @layer shared-asset-extraction @kind logic */
import { brrFilter } from './brr-filter';
import { nearestNibble } from './nearest-nibble';
import { BRR_BLOCK_SAMPLES } from './brr-codec.constants';
import type { BrrBlockResult, BrrBlockTry } from './brr-codec.type';

const tryBrrBlock = (attempt: BrrBlockTry): BrrBlockResult | null => {
  const { data, p, filter, range, start, lossless } = attempt;
  let [old, older] = start;
  let error = 0;
  const nibbles: number[] = [];
  for (let i = 0; i < BRR_BLOCK_SAMPLES; i++) {
    const best = nearestNibble(brrFilter(filter, old, older), (data[p + i] ?? 0) >> 1, range);
    if (best.error !== 0 && lossless) return null;
    error += best.error;
    nibbles.push(best.nibble & 0xf);
    older = old;
    old = best.sample;
  }
  return { error, history: [old, older], nibbles };
};

export { tryBrrBlock };
