/* @layer bridge-wasm @kind logic */
import { isCapacityUpgradeItemName } from '@rotp/game-data';
import type { ReceivedEntry } from './received-batch-order.type';

const receivedBatchOrder = (
  entries: readonly ReceivedEntry[], nameOf: (itemId: number) => string | undefined,
): ReceivedEntry[] => {
  const isCapacity = (entry: ReceivedEntry): boolean => {
    const name = nameOf(entry.item.item);
    return name !== undefined && isCapacityUpgradeItemName(name);
  };
  return [...entries.filter(isCapacity), ...entries.filter((entry) => !isCapacity(entry))];
};

export { receivedBatchOrder };
export type { ReceivedEntry } from './received-batch-order.type';
