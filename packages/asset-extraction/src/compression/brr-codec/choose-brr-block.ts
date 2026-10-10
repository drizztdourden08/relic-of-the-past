/* @layer shared-asset-extraction @kind logic */
import { tryBrrBlock } from './try-brr-block';
import { BRR_FILTER_COUNT, BRR_MAX_RANGE } from './brr-codec.constants';
import type { BrrBlockChoice, BrrHistory } from './brr-codec.type';

const chooseBrrBlock = (data: Int16Array | number[], p: number, start: BrrHistory, lossless: boolean): BrrBlockChoice | null => {
  let best: BrrBlockChoice | null = null;
  for (let filter = 0; filter < BRR_FILTER_COUNT; filter++) {
    if (filter !== 0 && p === 0) continue;
    for (let range = BRR_MAX_RANGE; range > 0; range--) {
      const result = tryBrrBlock({ data, p, filter, range, start, lossless });
      if (result && result.error < (best?.error ?? Number.MAX_SAFE_INTEGER)) best = { ...result, filter, range };
    }
  }
  return best;
};

export { chooseBrrBlock };
