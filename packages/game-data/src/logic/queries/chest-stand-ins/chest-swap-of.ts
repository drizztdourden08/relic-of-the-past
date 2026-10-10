/* @layer shared-game @kind logic */
import { getItem } from '../../../data';
import type { CheckRecord } from '../../../data';
import type { ChestSwap } from './chest-stand-ins.type';

const chestSwapOf = (check: CheckRecord): ChestSwap | null => {
  const [primary] = check.vanillaItemIds;
  if (check.kind !== 'chest' || check.vanillaItemIds.length !== 1 || primary === undefined) return null;
  const standIn = getItem(primary).aliasOf;
  return standIn ? { primary, standIn } : null;
};

export { chestSwapOf };
