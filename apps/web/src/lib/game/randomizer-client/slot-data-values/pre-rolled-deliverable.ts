/* @layer bridge-wasm @kind logic */
import { deliverableSetsOf, parseDeliverableLists } from '@shared/randomizer/world/fill/deliverable-lists';
import type { DeliverableSets } from '@shared/randomizer/world/fill/fill-options-from-snapshot';
import type { RotpSlotData } from '@shared/randomizer/archipelago/slot-data.type';

const preRolledDeliverable = (slotData: RotpSlotData): Required<DeliverableSets> | undefined => {
  const lists = parseDeliverableLists(slotData.preRolled?.deliverable);
  return lists === undefined ? undefined : deliverableSetsOf(lists);
};

export { preRolledDeliverable };
