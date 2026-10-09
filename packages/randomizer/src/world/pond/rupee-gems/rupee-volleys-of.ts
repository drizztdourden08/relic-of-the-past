/* @layer shared-game @kind logic */
import { POND_GEM_SLOTS } from '../rupee-gems.data';
import { decomposeRupees } from './decompose-rupees';
import type { RupeeDenomination } from '../pond.type';

const rupeeVolleysOf = (amount: number): RupeeDenomination[][] => {
  const volleys: RupeeDenomination[][] = [];
  for (const gem of decomposeRupees(amount)) {
    const last = volleys[volleys.length - 1];
    if (last !== undefined && last.length < POND_GEM_SLOTS && last[0].decodeKey === gem.decodeKey) last.push(gem);
    else volleys.push([gem]);
  }
  return volleys;
};

export { rupeeVolleysOf };
