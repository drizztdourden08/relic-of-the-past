/* @layer bridge-wasm @kind logic */
/**
 * The order a batch of received items is handed to the game in. The server sorts a collect or
 * a release by item id, which puts every wallet and bag upgrade at the end, after the rupees,
 * bombs and arrows they would have held. Capacity upgrades go first, so the ammunition and
 * rupees of the same batch land in a bag or wallet that can hold them. Within each group, the
 * server's own order stands.
 */
import { isCapacityUpgradeItemName } from '@shared/game/data';
import type { ApNetworkItem } from './ap-protocol.type';

interface ReceivedEntry {
  item: ApNetworkItem;
  /** The item's position in the server's received list. */
  index: number;
}

/** |entries| in hand-on order: capacity upgrades first, each group in list order. */
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
export type { ReceivedEntry };
