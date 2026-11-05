/* @layer renderer-app @kind logic */
import { receivedBatchOrder } from '@rotp/randomizer';
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';

const rotpApReceivedOrder: NonNullable<ArchipelagoGame<unknown, unknown>['receivedOrder']> = (items) => {
  const nameById = new Map(items.map((item) => [item.item, item.itemName]));
  const itemById = new Map(items.map((item) => [item.index, item]));
  const entries = items.map((item) => ({ item: { item: item.item, location: item.location, player: item.player, flags: item.flags }, index: item.index }));
  return receivedBatchOrder(entries, (id) => nameById.get(id)).flatMap((entry) => itemById.get(entry.index) ?? []);
};

export { rotpApReceivedOrder };
